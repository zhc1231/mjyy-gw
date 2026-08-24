import { createRequire } from 'module';
import { mkdirSync } from 'fs';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

// === 1. 重新截 realname 未认证态：只注入 logged_in，不注入 identity_verified ===
{
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  // 只登录，不认证 → 页面显示进度条 + 表单 + 去认证按钮
  await page.evaluateOnNewDocument(() => {
    try {
      localStorage.setItem('mjyy_logged_in', 'true');
      localStorage.setItem('mjyy_user_data', JSON.stringify({phone:'13888888888',username:'demo_main',userType:'main',role:'admin'}));
      // 故意不设置 identity_verified 和 enterprise_data，让页面处于未认证态
    } catch(e){}
  });
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
    req.continue();
  });
  await page.goto('https://zhc1231.github.io/mjyy-gw/account-realname.html', { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
  await new Promise(r=>setTimeout(r, 2500));
  await page.screenshot({ path:'/workspace/docs/product-design/screenshots/screen-realname.jpg', fullPage:true, type:'jpeg', quality:88 });
  console.log('[ok] realname re-captured (unverified state)');

  // 同时探查未认证态的元素
  const result = await page.evaluate(() => {
    const sels = {
      steps: '.steps, .progress-steps, .step, .progress, .wizard, [class*="step"], [class*="progress"], [class*="wizard"]',
      card: '.card',
      card_header: '.card-header',
      card_title: '.card-title',
      info_items: '.info-item',
      btn_primary: '.btn-primary, #enterpriseVerifyBtn, a[href*="verify"]',
      realname_tip: '.realname-tip',
      form: 'form, .form-group, .form-input, input',
      upload: 'input[type="file"], [class*="upload"]',
    };
    const out = {};
    for (const [k, sel] of Object.entries(sels)) {
      out[k] = Array.from(document.querySelectorAll(sel)).map(el => {
        const r = el.getBoundingClientRect();
        return { cls:el.className, id:el.id, tag:el.tagName.toLowerCase(), text:(el.textContent||'').trim().slice(0,50), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), visible: r.width>0&&r.height>0 };
      }).filter(e=>e.visible);
    }
    const de = document.documentElement;
    out.__doc__ = { scrollW:de.scrollWidth, scrollH:de.scrollHeight };
    return out;
  });
  console.log('[realname unverified]', JSON.stringify(result, null, 2));
  await page.close();
}

// === 2. 补探查 center 的 stat-card / activity 区 ===
{
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
  await page.goto('https://zhc1231.github.io/mjyy-gw/account-center.html', { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
  await new Promise(r=>setTimeout(r, 2500));
  const result = await page.evaluate(() => {
    const sels = {
      stat_cards: '.stat-card',
      stat_titles: '.stat-card-title',
      stat_values: '.stat-card-value',
      page_title: '.page-title',
      page_subtitle: '.page-subtitle',
      product_cards: '.product-card-new',
      // 找"最近活动/待办/动态"区
      activity_candidates: 'section, .section, [class*="activity"], [class*="recent"], [class*="todo"], [class*="dynamic"], [class*="notice"]',
      // 顶部统计行容器
      cards_row: '.cards-gap, .cols-3, .row, .grid',
    };
    const out = {};
    for (const [k, sel] of Object.entries(sels)) {
      out[k] = Array.from(document.querySelectorAll(sel)).map(el => {
        const r = el.getBoundingClientRect();
        return { cls:el.className, id:el.id, tag:el.tagName.toLowerCase(), text:(el.textContent||'').trim().slice(0,60), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), visible:r.width>0&&r.height>0 };
      }).filter(e=>e.visible);
    }
    const de = document.documentElement;
    out.__doc__ = { scrollW:de.scrollWidth, scrollH:de.scrollHeight };
    return out;
  });
  console.log('[center detail]', JSON.stringify(result, null, 2));
  await page.close();
}

await browser.close();
