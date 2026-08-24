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
  try { localStorage.setItem('mjyy_logged_in','true'); localStorage.setItem('mjyy_user_data',JSON.stringify({phone:'13888888888',username:'demo_main',userType:'main',role:'admin'})); } catch(e){}
});
await page.setRequestInterception(true);
page.on('request', (req) => {
  if (req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
  req.continue();
});
await page.goto('https://zhc1231.github.io/mjyy-gw/account-message.html', { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
await new Promise(r=>setTimeout(r, 2500));

// Walk the message list DOM to find all items
const result = await page.evaluate(() => {
  const container = document.querySelector('#msgListContainer') || document.querySelector('.msg-list');
  if (!container) return { error: 'No msgList container found' };

  // Find all direct children of the container and their children
  const items = [];
  const all = container.querySelectorAll('*');
  const seen = new Set();
  for (const el of all) {
    if (seen.has(el)) continue;
    seen.add(el);
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      items.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className || '').toString().slice(0,80),
        id: el.id,
        text: (el.textContent||'').trim().slice(0,60),
        x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height),
      });
    }
  }
  return { containerCount: all.length, items: items.slice(0, 50) };
});
console.log(JSON.stringify(result, null, 2));

await browser.close();
