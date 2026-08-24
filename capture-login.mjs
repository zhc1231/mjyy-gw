import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless:'new',
  executablePath:'/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

async function captureLogin(panel, outPath) {
  const page = await browser.newPage();
  await page.setViewport({ width:1440, height:900, deviceScaleFactor:2 });
  // Clear localStorage so the actual login page shows (no auto-login)
  await page.evaluateOnNewDocument(() => {
    try { localStorage.removeItem('mjyy_logged_in'); localStorage.removeItem('mjyy_user_data'); } catch(e){}
  });
  await page.goto('https://zhc1231.github.io/mjyy-gw/login.html', { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
  await new Promise(r=>setTimeout(r, 2500));

  // Click the appropriate tab to switch panel
  if (panel !== 'wxPanel') {
    const tabSelector = `[data-panel="${panel}"]`;
    await page.evaluate((sel) => {
      const btn = document.querySelector(sel);
      if (btn) btn.click();
    }, tabSelector).catch(()=>{});
    await new Promise(r=>setTimeout(r, 1500));
  }

  await page.screenshot({ path: outPath, fullPage:false });
  console.log(`Captured ${panel} -> ${outPath}`);
  await page.close();
}

const outDir = '/workspace/docs/product-design/screenshots';
await captureLogin('wxPanel', `${outDir}/screen-auth-login-wx.jpg`);
await captureLogin('accountPanel', `${outDir}/screen-auth-login-account.jpg`);
await captureLogin('registerPanel', `${outDir}/screen-auth-login-register.jpg`);

// Also re-capture the default login page (which shows wxPanel by default)
await captureLogin('wxPanel', `${outDir}/screen-login.jpg`);

await browser.close();
console.log('Done.');
