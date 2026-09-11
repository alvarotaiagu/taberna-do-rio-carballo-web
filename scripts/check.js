const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const errors = [];

  for (const [label, viewport] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(`[${label}] console: ${msg.text()}`);
    });
    page.on('pageerror', (err) => errors.push(`[${label}] pageerror: ${err.message}`));
    page.on('requestfailed', (req) => {
      const f = req.failure();
      errors.push(`[${label}] requestfailed: ${req.url()} — ${f ? f.errorText : ''}`);
    });

    await page.goto('http://localhost:8811/index.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `/tmp/shot-${label}-hero.png` });

    await page.evaluate(() => document.querySelector('#carta').scrollIntoView());
    await page.waitForTimeout(600);
    await page.screenshot({ path: `/tmp/shot-${label}-carta.png` });

    await page.evaluate(() => document.querySelector('#mosaico').scrollIntoView());
    await page.waitForTimeout(600);
    await page.screenshot({ path: `/tmp/shot-${label}-mosaico.png` });

    await page.evaluate(() => document.querySelector('#encuentranos').scrollIntoView());
    await page.waitForTimeout(600);
    await page.screenshot({ path: `/tmp/shot-${label}-encuentranos.png` });

    if (label === 'mobile') {
      await page.click('.nav-toggle');
      await page.waitForTimeout(300);
      await page.screenshot({ path: `/tmp/shot-mobile-nav.png` });
    }

    // Click carta filter
    await page.evaluate(() => document.querySelector('#carta').scrollIntoView());
    await page.click('.carta-filter[data-filter="bocadillos"]');
    await page.waitForTimeout(700);
    await page.screenshot({ path: `/tmp/shot-${label}-filter.png` });

    // Click map consent
    const mapBtn = await page.$('.map-consent');
    if (mapBtn) {
      await mapBtn.click();
      await page.waitForTimeout(500);
    }

    await context.close();
  }

  // Reduced motion pass
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(`[reduced-motion] console: ${msg.text()}`); });
  page.on('pageerror', (err) => errors.push(`[reduced-motion] pageerror: ${err.message}`));
  await page.goto('http://localhost:8811/index.html', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `/tmp/shot-reduced-motion.png` });
  await context.close();

  // No-JS pass
  const context2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const page2 = await context2.newPage();
  await page2.goto('http://localhost:8811/index.html', { waitUntil: 'load' });
  await page2.waitForTimeout(800);
  await page2.screenshot({ path: `/tmp/shot-nojs.png` });
  await context2.close();

  await browser.close();

  if (errors.length) {
    console.log('ERRORS FOUND:\n' + errors.join('\n'));
  } else {
    console.log('NO ERRORS');
  }
})();
