import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless:'new',
  executablePath:'/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

const VW = 1440, VH = 900;

async function probe(url, hash, logged, label) {
  const page = await browser.newPage();
  await page.setViewport({ width:VW, height:VH, deviceScaleFactor:2 });
  if (logged) {
    await page.evaluateOnNewDocument(() => {
      try { localStorage.setItem('mjyy_logged_in','true'); localStorage.setItem('mjyy_user_data',JSON.stringify({phone:'13888888888',username:'demo_main',userType:'main',role:'admin'})); } catch(e){}
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
      req.continue();
    });
  }
  await page.goto(url, { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
  if (hash) await page.evaluate(h => location.hash = h, hash).catch(()=>{});
  await new Promise(r=>setTimeout(r, 3000));
  // dismiss overlays
  await page.evaluate(() => {
    document.querySelectorAll('.toast, .modal-backdrop, [class*="overlay"]').forEach(el => el.classList.remove('visible','show','open'));
    document.body.style.overflow = '';
  }).catch(()=>{});

  const result = await page.evaluate(() => {
    const els = [];
    // grab inputs
    document.querySelectorAll('input, textarea, select').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        els.push({ tag:'input', type:el.type||'', ph:el.placeholder||'', id:el.id||'', cls:el.className||'', name:el.name||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab buttons
    document.querySelectorAll('button, .btn, a[class*="btn"], input[type="submit"], input[type="button"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        els.push({ tag:'button', text:(el.textContent||'').trim().slice(0,40), id:el.id||'', cls:el.className||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab headings
    document.querySelectorAll('h1, h2, h3, h4, h5, .title, .page-title, .section-title, [class*="title"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.width < 1440) {
        els.push({ tag:'heading', text:(el.textContent||'').trim().slice(0,60), id:el.id||'', cls:el.className||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab checkbox/radio labels
    document.querySelectorAll('input[type="checkbox"], input[type="radio"], .checkbox, .radio, label, [class*="agree"], [class*="protocol"], [class*="check"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        els.push({ tag:'checkbox/label', text:(el.textContent||'').trim().slice(0,60), id:el.id||'', cls:el.className||'', type:el.type||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab table
    document.querySelectorAll('table, thead, tbody, tr, th, td').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.height < 200) {
        els.push({ tag:el.tagName.toLowerCase(), text:(el.textContent||'').trim().slice(0,50), cls:el.className||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab cards / sections / panels
    document.querySelectorAll('.card, .panel, .section, .box, [class*="card"], [class*="panel"], [class*="section"], [class*="box"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 100 && r.height > 50 && r.height < 800) {
        els.push({ tag:'card/panel', text:(el.textContent||'').trim().slice(0,50), cls:el.className||'', id:el.id||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab nav / sidebar / breadcrumb
    document.querySelectorAll('nav, .nav, .sidebar, .breadcrumb, [class*="nav"], [class*="side"], [class*="crumb"], [class*="menu"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.width < 1440) {
        els.push({ tag:'nav/sidebar', text:(el.textContent||'').trim().slice(0,50), cls:el.className||'', id:el.id||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab pagination
    document.querySelectorAll('.pagination, .pager, [class*="pagi"], [class*="page-"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) {
        els.push({ tag:'pagination', text:(el.textContent||'').trim().slice(0,40), cls:el.className||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab images (QR code etc)
    document.querySelectorAll('img, canvas, [class*="qr"], [class*="code"], [class*="qrcode"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 50 && r.height > 50) {
        els.push({ tag:'img/canvas', src:(el.src||'').slice(-40), alt:el.alt||'', cls:el.className||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    // grab tip/notice/hint
    document.querySelectorAll('.tip, .notice, .hint, [class*="tip"], [class*="notice"], [class*="hint"], [class*="desc"], [class*="warn"]').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width > 50 && r.height > 10) {
        els.push({ tag:'tip/notice', text:(el.textContent||'').trim().slice(0,60), cls:el.className||'', x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height) });
      }
    });
    return els;
  });

  console.log(`\n========== ${label} (${url}${hash||''}) ==========`);
  // Sort by y then x
  result.sort((a,b) => a.y - b.y || a.x - b.x);
  for (const el of result) {
    const top = (el.y / VH * 100).toFixed(1);
    const left = (el.x / VW * 100).toFixed(1);
    const width = (el.w / VW * 100).toFixed(1);
    const height = (el.h / VH * 100).toFixed(1);
    const txt = el.text || el.ph || el.alt || el.src || el.type || '';
    console.log(`  [${top}%,${left}%,${width}%,${height}%] ${el.tag} "${txt}" cls=${el.cls||''} id=${el.id||''}`);
  }
  await page.close();
}

// A. login.html - 微信扫码面板 (默认)
await probe('https://zhc1231.github.io/mjyy-gw/login.html', '', false, '5.2A 微信扫码面板');

// B. login.html#accountPanel - 账号密码
await probe('https://zhc1231.github.io/mjyy-gw/login.html', '#accountPanel', false, '5.2B 账号密码面板');

// C. login.html#registerPanel - 注册
await probe('https://zhc1231.github.io/mjyy-gw/login.html', '#registerPanel', false, '5.1 注册面板');

// D. account-realname.html - 企业信息
await probe('https://zhc1231.github.io/mjyy-gw/account-realname.html', '', true, '5.3A 企业信息页');

// E. verify.html - 爱签认证
await probe('https://zhc1231.github.io/mjyy-gw/verify.html', '?type=enterprise', true, '5.3B 爱签认证页');

// F. account-center.html - 产品中心
await probe('https://zhc1231.github.io/mjyy-gw/account-center.html', '', true, '5.4 产品中心首页');

// G. account-user.html - 用户管理
await probe('https://zhc1231.github.io/mjyy-gw/account-user.html', '', true, '5.5A 用户管理页');

// H. account-message.html - 消息中心
await probe('https://zhc1231.github.io/mjyy-gw/account-message.html', '', true, '5.9 消息中心页');

await browser.close();
