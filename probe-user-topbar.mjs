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
await page.goto('https://zhc1231.github.io/mjyy-gw/account-user.html', { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
await new Promise(r=>setTimeout(r, 2500));

const result = await page.evaluate(() => {
  const sels = {
    topbarRight: '.topbar-right',
    topbarBack: '.topbar-back',
    topbarMessage: '.topbar-message',
    topbarMessageIcon: '.topbar-message-icon',
    topbarMessageBadge: '.topbar-message-badge',
    topbarUser: '.topbar-user, .user-info',
    topbarUserAvatar: '.topbar-user-avatar, .user-avatar',
    topbarUserMenu: '.topbar-user-menu, .user-menu',
    allTopbarRight: '.topbar-right *',
  };
  const out = {};
  for (const [k, sel] of Object.entries(sels)) {
    out[k] = Array.from(document.querySelectorAll(sel)).map(el => {
      const r = el.getBoundingClientRect();
      return { cls:el.className, id:el.id, tag:el.tagName.toLowerCase(), text:(el.textContent||'').trim().slice(0,30), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), visible:r.width>0&&r.height>0 };
    }).filter(e=>e.visible);
  }
  return out;
});
console.log(JSON.stringify(result, null, 2));

await browser.close();
