import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless:'new',
  executablePath:'/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

async function probe(url, sels) {
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
  await page.goto(url, { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
  await new Promise(r=>setTimeout(r, 2500));
  const result = await page.evaluate((sels) => {
    const out = {};
    for (const [k, sel] of Object.entries(sels)) {
      out[k] = Array.from(document.querySelectorAll(sel)).map(el => {
        const r = el.getBoundingClientRect();
        return { cls:el.className, id:el.id, tag:el.tagName.toLowerCase(), text:(el.textContent||'').trim().slice(0,50), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), visible:r.width>0&&r.height>0 };
      }).filter(e=>e.visible);
    }
    const de = document.documentElement;
    out.__doc__ = { scrollW:de.scrollWidth, scrollH:de.scrollHeight };
    return out;
  }, sels);
  console.log(`\n===== ${url} =====`);
  console.log(JSON.stringify(result, null, 2));
  await page.close();
}

await probe('https://zhc1231.github.io/mjyy-gw/account-center.html', {
  welcome: '.welcome, .welcome-section, .pc-welcome',
  section_title: '.section-title, .pc-section-title',
  card: '.pc-card, .product-card, .brand-card',
  brand_area: '.pc-brand-area',
  brand_name: '.pc-brand-name, .pc-brand-title',
  brand_btn: '.pc-brand-btn, .pc-brand-action',
  all_h: 'h1, h2, h3, h4',
  all_btn: 'button, .btn, a.btn',
  main_content: '.main-content, .content, .pc-content',
  tip: '.pc-tip, .pc-notice, .notice',
});

await probe('https://zhc1231.github.io/mjyy-gw/account-user.html', {
  search_input: 'input[type="text"], input[type="search"], .search-input, #searchInput, #memberSearch',
  search_btn: '.search-btn, #searchBtn, button[type="submit"]',
  toolbar_area: '.toolbar, .list-toolbar, .table-toolbar, .action-bar, .member-toolbar',
  all_h: 'h1, h2, h3, h4',
  all_btn: 'button, .btn, a.btn',
  table: '.member-table, table',
  tbody_tr: '.member-table tbody tr',
  all_th: '.member-table thead th, table thead th',
  all_td: '.member-table tbody td:first-child, table tbody td:first-child',
  status_badge: '.status-badge, .tag, .badge',
  edit_btn: '.btn-edit, .edit-btn',
  reset_btn: '.btn-reset, .reset-btn',
  toggle_btn: '.btn-toggle, .toggle-btn',
  remove_btn: '.btn-remove, .remove-btn',
});

await browser.close();
