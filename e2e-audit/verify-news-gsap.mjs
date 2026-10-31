import { chromium } from 'playwright';

const base = 'http://localhost:5174';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(base + '/news', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(7000);

// Scroll through the page so ScrollTrigger animations fire.
for (let y = 0; y < 4000; y += 600) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await page.waitForTimeout(250);
}
await page.waitForTimeout(2000);

const gsap = logs.filter((l) => /gsap/i.test(l));
const others = logs.filter((l) => !/gsap/i.test(l) && !/^\[(log|debug|info)\]/.test(l));

console.log('=== GSAP console messages ===');
console.log(gsap.length ? gsap.join('\n') : '(none - FIXED)');

const counts = await page.evaluate(() => {
  const cards = document.querySelectorAll('.news-card');
  const items = document.querySelectorAll('.event-item');
  const op = (el) => getComputedStyle(el).opacity;
  return {
    newsCards: cards.length,
    eventItems: items.length,
    newsOpacities: [...cards].map(op),
    eventOpacities: [...items].map(op),
  };
});
console.log('\n=== rendered + animated state ===');
console.log(JSON.stringify(counts, null, 2));

console.log('\n=== other warnings/errors ===');
console.log(others.length ? others.join('\n') : '(none)');

await browser.close();
