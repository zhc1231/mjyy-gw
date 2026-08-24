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
await new Promise(r=>setTimeout(r, 2500));

const result = await page.evaluate(() => {
  const wxAgreement = document.getElementById('wxAgreement');
  const wxAgreementContainer = wxAgreement ? wxAgreement.closest('.wx-agreement') : null;
  const wxPanel = document.getElementById('wxPanel');

  const info = (el, name) => {
    if (!el) return { name, exists: false };
    const r = el.getBoundingClientRect();
    const cs = window.getComputedStyle(el);
    return {
      name,
      exists: true,
      tag: el.tagName.toLowerCase(),
      cls: el.className,
      id: el.id,
      x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      position: cs.position,
      parent: el.parentElement ? el.parentElement.tagName.toLowerCase() + '.' + el.parentElement.className.toString().slice(0,30) : null,
      text: (el.textContent||'').trim().slice(0,80)
    };
  };

  return {
    wxAgreement: info(wxAgreement, 'wxAgreement'),
    wxAgreementContainer: info(wxAgreementContainer, 'wxAgreementContainer (.wx-agreement)'),
    wxPanel: info(wxPanel, 'wxPanel'),
    allCheckboxes: Array.from(document.querySelectorAll('input[type="checkbox"]')).map(c => info(c, 'checkbox')),
    allWxAgreementClass: Array.from(document.querySelectorAll('.wx-agreement')).map(el => info(el, '.wx-agreement'))
  };
});
console.log(JSON.stringify(result, null, 2));

await browser.close();
