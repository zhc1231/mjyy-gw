import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const browser = await puppeteer.launch({
  headless:'new',
  executablePath:'/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args:['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
});

// Capture page with optional hash and click-tab flag
async function probe(url, label, sels, { hash=null, clickTab=null, login=true, wait=2500 } = {}) {
  const page = await browser.newPage();
  await page.setViewport({ width:1440, height:900, deviceScaleFactor:2 });
  const isLoginPage = /\/login\.html/.test(url);
  if (login && !isLoginPage) {
    await page.evaluateOnNewDocument(() => {
      try { localStorage.setItem('mjyy_logged_in','true'); localStorage.setItem('mjyy_user_data',JSON.stringify({phone:'13888888888',username:'demo_main',userType:'main',role:'admin'})); } catch(e){}
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
      req.continue();
    });
  } else if (isLoginPage) {
    // For login page probing - clear localStorage to show real login UI
    await page.evaluateOnNewDocument(() => {
      try { localStorage.removeItem('mjyy_logged_in'); localStorage.removeItem('mjyy_user_data'); } catch(e){}
    });
  }
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

// 1. login.html (default = wxPanel) - for screen-login.jpg (section 1.5) and screen-auth-login-wx.jpg (5.2A)
await probe(BASE+'login.html', 'login-wxPanel', {
  loginTabs: '.login-tabs',
  loginTab: '.login-tab',
  wxPanel: '#wxPanel',
  wxQrBox: '.wx-qr-box',
  wxQrImg: '#wxQrImg',
  wxQrTitle: '.wx-qr-title',
  wxQrDesc: '.wx-qr-desc',
  wxTips: '.wx-tips',
  wxAgreement: '.wx-agreement',
  loginLeft: '.login-left',
  leftHeader: '.left-header',
  leftTitle: '.left-title',
  leftFooter: '.left-footer',
  backLink: '.back-link',
  rightContent: '.right-content',
  allInput: 'input',
  allBtn: 'button, .btn, a.btn',
  allLabel: 'label',
});

// 2. login.html#accountPanel - for screen-auth-login-account.jpg (5.2B)
await probe(BASE+'login.html', 'login-accountPanel', {
  accountPanel: '#accountPanel',
  loginForm: '#loginForm',
  formGroup: '#accountPanel .form-group',
  formLabel: '#accountPanel .form-label',
  inputWrap: '#accountPanel .input-wrap',
  formInput: '#accountPanel .form-input',
  smsRow: '#accountPanel .sms-row',
  smsBtn: '#accountPanel .sms-btn',
  formOptions: '#accountPanel .form-options',
  rememberCheckbox: '#rememberCheckbox',
  loginAgreement: '#accountPanel .login-agreement',
  submitBtn: '#submitBtn',
  formFooter: '#accountPanel .form-footer',
}, { clickTab: '[data-panel="accountPanel"]' });

// 3. login.html#registerPanel - for screen-auth-login-register.jpg (5.1)
await probe(BASE+'login.html', 'login-registerPanel', {
  registerPanel: '#registerPanel',
  formGroup: '#registerPanel .form-group',
  formLabel: '#registerPanel .form-label',
  inputWrap: '#registerPanel .input-wrap',
  formInput: '#registerPanel .form-input',
  smsRow: '#registerPanel .sms-row',
  smsBtn: '#registerPanel .sms-btn',
  formOptions: '#registerPanel .form-options',
  regAgreement: '#regAgreement',
  regSubmitBtn: '#regSubmitBtn',
  formFooter: '#registerPanel .form-footer',
}, { clickTab: '[data-panel="registerPanel"]' });

// 4. account-realname.html - for screen-console-realname.jpg (5.3A)
await probe(BASE+'account-realname.html?type=enterprise', 'account-realname', {
  topbar: '.topbar',
  topbarBrand: '.topbar-brand',
  topbarBreadcrumb: '.topbar-breadcrumb',
  topbarBcCurrent: '.topbar-bc-current',
  sidebar: '.sidebar',
  sidebarActive: '.sidebar-link.active',
  pageContent: '.page-content, .content-area, main',
  card: '.card, .realname-card',
  cardHeader: '.card-header',
  cardTitle: '.card-title',
  cardBody: '.card-body',
  authBadge: '.auth-badge, .badge',
  verifyBtn: '.verify-btn, .btn-verify, .btn-primary',
  infoRow: '.info-row',
  infoLabel: '.info-label',
  infoValue: '.info-value',
  infoStatus: '.info-status',
  enterpriseName: '#enterpriseName',
  enterpriseCreditCode: '#enterpriseCreditCode',
  enterpriseLicense: '#enterpriseLicense',
  enterpriseLegalName: '#enterpriseLegalName',
  enterpriseStatus: '#enterpriseStatus',
  realnameTip: '.realname-tip',
  allBtn: 'button, .btn, a.btn',
});

// 5. verify.html - for screen-console-verify.jpg (5.3B)
await probe(BASE+'verify.html?type=enterprise', 'verify', {
  topbar: '.topbar',
  contentWrap: '.content-wrap',
  panel: '.panel.active, #panel-select',
  panelHeader: '.panel-header',
  panelTitle: '.panel-title',
  panelDesc: '.panel-desc',
  panelBody: '.panel-body',
  authCards: '.auth-cards',
  authCard: '.auth-card',
  authCardTitle: '.auth-card-title',
  authCardDesc: '.auth-card-desc',
  panelFooter: '.panel-footer',
  btnPrimary: '.btn-primary',
  btnDefault: '.btn-default',
  allBtn: 'button, .btn, a.btn',
});

// 6. account-message.html - for screen-console-message.jpg (5.9)
await probe(BASE+'account-message.html', 'account-message', {
  topbar: '.topbar',
  topbarBrand: '.topbar-brand',
  topbarBreadcrumb: '.topbar-breadcrumb',
  topbarBcCurrent: '.topbar-bc-current',
  sidebar: '.sidebar',
  msgPageTitle: '.msg-page-title',
  msgTabs: '.msg-tabs',
  msgTab: '.msg-tab',
  msgList: '.msg-list, .message-list',
  msgItem: '.msg-item, .message-item',
  allBtn: 'button, .btn, a.btn',
});

await browser.close();
