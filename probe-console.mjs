import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless:'new',
  executablePath:'/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

async function probe(url, label, sels, { hash=null, clickTab=null, wait=2500 } = {}) {
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
  const finalUrl = hash ? url + hash : url;
  await page.goto(finalUrl, { waitUntil:'networkidle2', timeout:60000 }).catch(()=>{});
  await new Promise(r=>setTimeout(r, wait));

  if (clickTab) {
    await page.evaluate((sel) => {
      const btn = document.querySelector(sel);
      if (btn) btn.click();
    }, clickTab).catch(()=>{});
    await new Promise(r=>setTimeout(r, 800));
  }

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
  console.log(`\n===== [${label}] ${finalUrl} =====`);
  console.log(JSON.stringify(result, null, 2));
  await page.close();
}

const BASE = 'https://zhc1231.github.io/mjyy-gw/';

// account-center.html - for screen-console-center.jpg
await probe(BASE+'account-center.html', 'account-center', {
  topbar: '.topbar',
  topbarBrand: '.topbar-brand',
  topbarBreadcrumb: '.topbar-breadcrumb',
  topbarBcCurrent: '.topbar-bc-current',
  sidebar: '.sidebar',
  sidebarActive: '.sidebar-link.active',
  pageContent: 'main, .main-content',
  pageHeader: '.page-header, .page-title, .pc-page-title',
  pageSubtitle: '.page-subtitle, .pc-page-subtitle, .pc-section-desc',
  pcProductSection: '.pc-product-section, .pc-section',
  pcSectionTitle: '.pc-section-title',
  pcSectionDesc: '.pc-section-desc',
  authPrompt: '#authPrompt, .auth-prompt, .modal',
  authPromptTitle: '#authPrompt h3, .auth-prompt-title',
  authPromptDesc: '#authPrompt p, .auth-prompt-desc',
  authPromptBtns: '#authPrompt button, .auth-prompt-btn',
  brandArea: '.pc-brand-area',
  brandCard: '.pc-brand-card, .brand-card',
  brandName: '.pc-brand-name, .pc-brand-title',
  brandBadge: '.pc-brand-badge',
  brandAction: '.pc-brand-action, .pc-brand-btn',
  allBtn: 'button, .btn, a.btn',
  allH: 'h1, h2, h3, h4',
});

// account-user.html - for screen-console-user.jpg
await probe(BASE+'account-user.html', 'account-user', {
  topbar: '.topbar',
  topbarBrand: '.topbar-brand',
  topbarBreadcrumb: '.topbar-breadcrumb',
  topbarBcCurrent: '.topbar-bc-current',
  sidebar: '.sidebar',
  sidebarActive: '.sidebar-link.active',
  pageContent: 'main, .main-content',
  pageTitle: '.page-title, h1',
  pageDesc: '.page-desc, .page-subtitle',
  addMemberBtn: '#addMemberBtn, .btn-primary',
  searchForm: '.search-form, .filter-form',
  searchInput: '.form-input',
  searchBtn: '.search-btn, button[type="submit"]',
  resetBtn: '.reset-btn, .btn-default',
  table: '.member-table, table',
  tableHead: '.member-table thead th, table thead th',
  tableBody: '.member-table tbody tr',
  tableFirstTd: '.member-table tbody td:first-child, table tbody td:first-child',
  pagination: '.pagination, .pager',
  paginationBtn: '.pagination-btn',
  modal: '.modal',
  allBtn: 'button, .btn, a.btn',
});

// account-message.html - for screen-console-message.jpg - need msg-item selector
await probe(BASE+'account-message.html', 'account-message', {
  topbar: '.topbar',
  topbarBrand: '.topbar-brand',
  topbarBreadcrumb: '.topbar-breadcrumb',
  topbarBcCurrent: '.topbar-bc-current',
  sidebar: '.sidebar',
  sidebarActive: '.sidebar-link.active',
  pageContent: 'main, .main-content',
  msgPageTitle: '.msg-page-title',
  msgTabs: '.msg-tabs',
  msgTab: '.msg-tab',
  msgList: '.msg-list, #msgListContainer',
  msgItem: '.msg-item',
  msgItemIcon: '.msg-item-icon',
  msgItemContent: '.msg-item-content',
  msgItemTitle: '.msg-item-title',
  msgItemDesc: '.msg-item-desc',
  msgItemTime: '.msg-item-time',
  markAllReadBtn: '#markAllReadBtn',
  clearReadBtn: '#clearReadBtn',
  allBtn: 'button, .btn, a.btn',
});

await browser.close();
