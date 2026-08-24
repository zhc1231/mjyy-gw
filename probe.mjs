import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const FAKE_USER_DATA = JSON.stringify({ phone:'13888888888', username:'demo_main', userType:'main', role:'admin', creditCode:'91330000MA0BCD12X', companyName:'杭州示例网络科技有限公司' });
const FAKE_ENTERPRISE_DATA = JSON.stringify({ name:'杭州示例网络科技有限公司', creditCode:'91330000MA0BCD12X', legalRep:'张三', verified:true });

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

const pages = [
  { url:'https://zhc1231.github.io/mjyy-gw/login.html',            skip:false },
  { url:'https://zhc1231.github.io/mjyy-gw/account-realname.html', skip:true  },
];

// 在页面里探查：dump 一批候选选择器的 boundingRect + 文本摘要
async function probe(page, selectors) {
  return await page.evaluate((sels) => {
    const out = {};
    for (const [key, sel] of Object.entries(sels)) {
      const els = Array.from(document.querySelectorAll(sel));
      out[key] = els.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          sel, cls: el.className, id: el.id,
          tag: el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 40),
          x: Math.round(r.x), y: Math.round(r.y),
          w: Math.round(r.width), h: Math.round(r.height),
          visible: r.width > 0 && r.height > 0,
        };
      }).filter(e => e.visible);
    }
    // 文档总尺寸（截图基准）
    const de = document.documentElement;
    out.__doc__ = { scrollW: de.scrollWidth, scrollH: de.scrollHeight, clientW: de.clientWidth, clientH: de.clientHeight };
    return out;
  }, selectors);
}

for (const p of pages) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  if (p.skip) {
    await page.evaluateOnNewDocument((ud, ed) => {
      try { localStorage.setItem('mjyy_logged_in','true'); localStorage.setItem('mjyy_user_data',ud); localStorage.setItem('mjyy_enterprise_data',ed); localStorage.setItem('mjyy_identity_verified','true'); localStorage.setItem('mjyy_auth_type','enterprise'); } catch(e){}
    }, FAKE_USER_DATA, FAKE_ENTERPRISE_DATA);
  }
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (p.skip && req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
    req.continue();
  });
  await page.goto(p.url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(()=>{});
  await new Promise(r => setTimeout(r, 2500));
  console.log(`\n========== ${p.url} ==========`);
  let sels;
  if (p.url.includes('login')) {
    sels = {
      tabs: '.login-tabs',
      tab_items: '.login-tab',
      panels: '.login-panel',
      active_panel: '.login-panel.active',
      qr_box: '.wx-qr-box',
      qr_desc: '.wx-qr-desc',
      qr_refresh: '.wx-qr-refresh',
      left_header: '.left-header',
      left_tag: '.left-tag',
      left_footer: '.left-footer',
      checkbox: '.checkbox',
      form_options: '.form-options',
      back_link: '.back-link',
      submit_btn: '.submit-btn',
      register_link: 'a[href*="register"], a[href*="login.html?type=register"]',
    };
  } else if (p.url.includes('realname')) {
    sels = {
      topbar: '.topbar',
      breadcrumb: '.topbar-breadcrumb',
      sidebar: '.sidebar',
      cards: '.card',
      card_headers: '.card-header',
      card_titles: '.card-title',
      info_items: '.info-item',
      btn_primary: '.btn-primary',
      realname_tip: '.realname-tip',
      main_content: '.main-content',
      page_title: '.page-title',
      // 进度条候选
      steps: '.steps, .progress-steps, .step, .progress, .wizard, [class*="step"], [class*="progress"], [class*="wizard"]',
      nav_enter: '.nav-enter-system',
    };
  } else if (p.url.includes('center')) {
    sels = {
      topbar: '.topbar',
      breadcrumb: '.topbar-breadcrumb',
      sidebar: '.sidebar',
      sidebar_active: '.sidebar-link.active',
      stat_cards: '.stat-card',
      product_cards: '.product-card-new',
      product_minjiang: '#peMinjiang',
      product_anxinyun: '#peAnxinyun',
      product_agent: '#peAgent',
      page_title: '.page-title',
      main_content: '.main-content',
      nav_enter: '.nav-enter-system',
      // 活动区候选
      activity: '.activity, .recent, [class*="activity"], [class*="recent"], [class*="todo"]',
    };
  } else { // user
    sels = {
      topbar: '.topbar',
      breadcrumb: '.topbar-breadcrumb',
      sidebar: '.sidebar',
      page_title: '.page-title',
      search_input: 'input[type="text"][placeholder*="搜索"], input[type="search"], .search-input, [class*="search"]',
      add_btn: '.btn-primary',
      table_wrap: '.member-table-wrap',
      table: '.member-table',
      thead_ths: '.member-table thead th',
      member_actions: '.member-actions',
      member_action: '.member-action',
      pagination: '.pagination',
      main_content: '.main-content',
      nav_enter: '.nav-enter-system',
    };
  }
  const result = await probe(page, sels);
  console.log(JSON.stringify(result, null, 2));
  await page.close();
}

await browser.close();
