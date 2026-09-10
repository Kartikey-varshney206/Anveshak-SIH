const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1440, height: 900 });
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.toString()));
  
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  
  const handles = await page.$$('button');
  for (const handle of handles) {
    const text = await page.evaluate(el => el.textContent, handle);
    if (text.includes('Network Explorer')) {
      await handle.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 4000));
  await page.screenshot({ path: 'screenshot.png' });
  
  await browser.close();
})();
