import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const gsap = [];
const stack = [];
page.on('console', (m) => {
  if (/gsap/i.test(m.text())) {
    gsap.push(m.text());
    // pull a stack trace if the console message has one
    const loc = m.location();
    stack.push(`${m.text()}  @${loc.url.split('/').pop()}:${loc.lineNumber}`);
  }
});
page.on('pageerror', (e) => gsap.push('PAGEERROR: ' + e.message));

await page.goto('http://localhost:5174/programs', { waitUntil: 'domcontentloaded', timeout: 30000 });
await page.waitForTimeout(7000);
for (let y = 0; y < 5000; y += 600) {
  await page.evaluate((t) => window.scrollTo(0, t), y);
  await page.waitForTimeout(200);
}
await page.waitForTimeout(1500);

console.log('=== GSAP warnings on /programs ===');
console.log(gsap.length ? gsap.join('\n') : '(none)');

const info = await page.evaluate(() => ({
  progCards: document.querySelectorAll('.prog-card').length,
  heroText: document.querySelectorAll('.programs-hero-text > *').length,
  imgs: [...document.querySelectorAll('img')].map((i) => ({
    src: (i.currentSrc || i.src || '').slice(-40),
    loaded: i.complete && i.naturalWidth > 0,
    w: i.naturalWidth,
  })),
}));
console.log('\n=== DOM state ===');
console.log(JSON.stringify(info, null, 2));

await browser.close();
