import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_HOST = 'backend-production-b8c2b.up.railway.app';

const STATIC_ROUTES = [
  '/', '/study', '/students', '/research', '/research/opportunities',
  '/about', '/news', '/quick-links',
  '/about/institute', '/about/facts-figures', '/about/visit', '/about/alumni', '/about/history',
  '/admissions/lists', '/admissions/how-to-apply', '/admissions/application/start',
  '/admissions/courses', '/admissions/fees', '/admissions/international',
  '/admissions/scholarships', '/admissions/online', '/admissions/faq',
  '/programs', '/impact', '/donate', '/gallery', '/partners',
  '/partnership-discussion', '/stories', '/contact',
  '/messages', '/messages/compose', '/notifications', '/not-found',
];

const DYNAMIC_ROUTES = [
  '/programs/1', '/news/anything', '/study/anything',
  '/quick-links/anything', '/legal/anything',
];

const IGNORE = /favicon\.ico|\.map$|\/@vite\/|__vite_ping|hot-update|React Router Future Flag|React DevTools|Download the React/i;

export interface PageResult {
  route: string;
  dynamic: boolean;
  consoleErrors: string[];
  pageErrors: string[];
  failedRequests: string[];
  badResponses: string[];
  apiCalls: string[];
  heading: string;
  bodyChars: number;
  mounted: boolean;
}

const results: PageResult[] = [];
const shotDir = path.join(__dirname, 'screenshots');
fs.mkdirSync(shotDir, { recursive: true });

async function audit(page: Page, route: string, dynamic: boolean): Promise<PageResult> {
  const r: PageResult = {
    route, dynamic, consoleErrors: [], pageErrors: [],
    failedRequests: [], badResponses: [], apiCalls: [], heading: '', bodyChars: 0, mounted: false,
  };
  const short = (u: string) => u.replace(/^https?:\/\/[^/]+/, '');

  page.on('console', (m: ConsoleMessage) => {
    if (m.type() !== 'error') return;
    const t = m.text();
    if (IGNORE.test(t)) return;
    r.consoleErrors.push(t.slice(0, 250));
  });
  page.on('pageerror', (e) => r.pageErrors.push(String(e.message).slice(0, 250)));
  page.on('requestfailed', (req) => {
    if (IGNORE.test(req.url())) return;
    r.failedRequests.push(`${req.method()} ${short(req.url())} :: ${req.failure()?.errorText ?? 'failed'}`);
  });
  page.on('response', (resp) => {
    const u = resp.url();
    if (IGNORE.test(u)) return;
    if (u.includes(API_HOST) || u.includes('/api/')) r.apiCalls.push(`${resp.status()} ${resp.request().method()} ${short(u)}`);
    if (resp.status() >= 400) r.badResponses.push(`${resp.status()} ${resp.request().method()} ${short(u)}`);
  });

  const resp = await page.goto(route, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  if (resp && resp.status() >= 400) r.badResponses.push(`${resp.status()} document ${route}`);
  await page.waitForLoadState('networkidle', { timeout: 25_000 }).catch(() => {});
  await page.waitForTimeout(1500);

  r.heading = (await page.locator('h1').first().textContent().catch(() => null))?.trim().slice(0, 70) ?? '';
  r.bodyChars = await page.locator('body').innerText().catch(() => '').then((s: string) => s.length);
  const rootKids = await page.evaluate(() => document.getElementById('root')?.children.length ?? 0).catch(() => 0);
  r.mounted = rootKids > 0;

  await page.screenshot({
    path: path.join(shotDir, (route === '/' ? 'root' : route.replace(/[^a-z0-9]+/gi, '_')) + '.png'),
  }).catch(() => {});
  return r;
}

test.describe.configure({ mode: 'serial' });

for (const route of STATIC_ROUTES) {
  test(`page ${route}`, async ({ page }) => {
    const r = await audit(page, route, false);
    results.push(r);
    console.log(`  mounted=${r.mounted} chars=${r.bodyChars} api=${r.apiCalls.length} errors=${r.consoleErrors.length + r.pageErrors.length + r.badResponses.length}  ${route}`);
    expect(r.mounted, `${route} did not mount React`).toBe(true);
  });
}

for (const route of DYNAMIC_ROUTES) {
  test(`detail ${route}`, async ({ page }) => {
    const r = await audit(page, route, true);
    results.push(r);
    console.log(`  [empty-db] mounted=${r.mounted} chars=${r.bodyChars} api=${r.apiCalls.length}  ${route}`);
    expect(r.mounted, `${route} did not mount React`).toBe(true);
  });
}

test.afterAll(() => {
  fs.writeFileSync(path.join(__dirname, 'audit-report.json'), JSON.stringify(results, null, 2));
  const problems = results.filter((r) => r.consoleErrors.length || r.pageErrors.length || r.badResponses.length || r.failedRequests.length);
  console.log('\n================ AUDIT SUMMARY ================');
  console.log(`pages audited : ${results.length}`);
  console.log(`mounted React : ${results.filter((r) => r.mounted).length}`);
  console.log(`pages w/ issues: ${problems.length}`);
  for (const p of problems) {
    console.log(`\n--- ${p.route}`);
    p.pageErrors.forEach((e) => console.log(`   crash   : ${e}`));
    p.consoleErrors.forEach((e) => console.log(`   console : ${e}`));
    p.badResponses.forEach((e) => console.log(`   http    : ${e}`));
    p.failedRequests.forEach((e) => console.log(`   netfail : ${e}`));
  }
  console.log('\njson: e2e-audit/audit-report.json');
});
