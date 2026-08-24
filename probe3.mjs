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
        return { cls:el.className, id:el.id, tag:el.tagName.toLowerCase(), text:(el.textContent||'').trim().slice(0,40), x:Math.round(r.x), y:Math.round(r.y), w:Math.round(r.width), h:Math.round(r.height), visible:r.width>0&&r.height>0 };
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
  topbar: '.topbar',
  topbar_brand: '.topbar-brand, .topbar-logo, [class*="brand"], [class*="logo"]',
  breadcrumb: '.topbar-breadcrumb',
  sidebar: '.sidebar',
  sidebar_active: '.sidebar-link.active',
  sidebar_links: '.sidebar-link',
  nav_enter: '.nav-enter-system, .topbar-right a',
  page_title: '.page-title',
  page_subtitle: '.page-subtitle',
  product_container: '.cards-gap, #unopenedProductsContainer',
});

await probe('https://zhc1231.github.io/mjyy-gw/account-user.html', {
  topbar: '.topbar',
  breadcrumb: '.topbar-breadcrumb',
  sidebar: '.sidebar',
  sidebar_active: '.sidebar-link.active',
  page_title: '.page-title',
  toolbar: '.toolbar, .list-toolbar, .table-toolbar, [class*="toolbar"]',
  add_btn: '#addMemberBtn',
  table_wrap: '.member-table-wrap',
  thead_ths: '.member-table thead th',
  pagination: '.pagination',
  nav_enter: '.nav-enter-system',
});

await browser.close();
