import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless:'new',
  executablePath:'/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

const page = await browser.newPage();
await page.setViewport({ width:1440, height:900, deviceScaleFactor:2 });
await page.evaluateOnNewDocument(() => {
  try { localStorage.removeItem('mjyy_logged_in'); localStorage.removeItem('mjyy_user_data'); } catch(e){}
});
await page.goto('https://zhc1231.github.io/mjyy-gw/login.html', { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
await new Promise(r=>setTimeout(r, 3000));

// Get ALL elements inside wxPanel with their bounding rects
const result = await page.evaluate(() => {
  const wxPanel = document.getElementById('wxPanel');
  if (!wxPanel) return { error: 'wxPanel not found' };
  
  const all = [];
  const walk = (el, depth=0) => {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      all.push({
        tag: el.tagName.toLowerCase(),
        cls: el.className,
        id: el.id,
        text: (el.textContent||'').trim().slice(0,60),
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
        depth
      });
    }
    for (const c of el.children) walk(c, depth+1);
  };
  walk(wxPanel);
  
  // Also check for any checkbox on page
  const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]')).map(el => {
    const r = el.getBoundingClientRect();
    return { id: el.id, cls: el.className, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), visible: r.width>0&&r.height>0 };
  });
  
  // Check for .wx-agreement, .login-agreement
  const agreementClasses = ['.wx-agreement', '.login-agreement', '#wxAgreement', '#loginAgreement', '#regAgreement'];
  const agreementResults = {};
  for (const sel of agreementClasses) {
    const els = document.querySelectorAll(sel);
    agreementResults[sel] = Array.from(els).map(el => {
      const r = el.getBoundingClientRect();
      return { tag: el.tagName.toLowerCase(), id: el.id, cls: el.className, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), visible: r.width>0&&r.height>0, display: getComputedStyle(el).display };
    });
  }
  
  return { allElements: all, checkboxes, agreementResults };
});

console.log(JSON.stringify(result, null, 2));

await browser.close();
