import { chromium } from 'playwright';

const target = process.argv[2] || '/quick-links';
const base = 'http://localhost:5174';

const browser = await chromium.launch();
const page = await browser.newPage();

const logs = [];
page.on('console', (m) => logs.push(`[console.${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));
page.on('requestfailed', (r) => logs.push(`[requestfailed] ${r.url()} :: ${r.failure()?.errorText}`));
page.on('response', (r) => { if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`); });

console.log(`--- navigating to ${target}`);
const resp = await page.goto(base + target, { waitUntil: 'domcontentloaded', timeout: 30000 });
console.log('document status:', resp?.status());
await page.waitForTimeout(6000);

const bodyLen = await page.locator('body').innerText().catch(() => '');
const html = await page.content().catch(() => '');
const rootChildren = await page.evaluate(() => {
  const r = document.getElementById('root');
  return r ? { exists: true, childCount: r.children.length, firstChild: r.firstElementChild?.tagName ?? null } : { exists: false };
}).catch(e => ({ error: String(e) }));

console.log('body innerText length:', bodyLen.length);
console.log('#root:', JSON.stringify(rootChildren));
console.log('html length:', html.length);
console.log('\n--- diagnostics ---');
for (const l of logs.slice(0, 40)) console.log(l);

await browser.close();
