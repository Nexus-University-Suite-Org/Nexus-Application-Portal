import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// Intercept GSAP's warning so we can see WHERE it fires.
await page.addInitScript(() => {
  const orig = console.warn;
  console.warn = function (...args) {
    const msg = String(args[0] || '');
    if (/GSAP target/.test(msg)) {
      const stack = new Error().stack || '';
      orig('[GSAP-TRACE] ' + msg + ' ||| ' + stack.split('\n').slice(1, 5).join(' <<< '));
      return;
    }
    orig.apply(console, args);
  };
});

const traces = [];
page.on('console', (m) => {
  if (/GSAP-TRACE/.test(m.text())) traces.push(m.text());
});

await page.goto('http://localhost:5174/programs', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(6000);
for (let y = 0; y < 5000; y += 700) {
  await page.evaluate((t) => window.scrollTo(0, t), y);
  await page.waitForTimeout(200);
}
await page.waitForTimeout(1500);

console.log('=== GSAP warning origins ===');
console.log(traces.length ? traces.join('\n\n') : '(none)');
await browser.close();
