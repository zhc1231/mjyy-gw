// 统一截图+探测脚本：保证截图与 PIN 坐标来自同一页面状态
import { createRequire } from 'module';
import { mkdirSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';
const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const BASE = 'https://zhc1231.github.io/mjyy-gw';
const OUT_DIR = '/workspace/docs/product-design/screenshots';
const MIRROR_DIR = '/workspace/vue-gw/public/docs/product-design/screenshots';
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(MIRROR_DIR, { recursive: true });

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

// Capture + probe: same page state, same viewport
async function captureProbe({ file, path: urlPath, logged, clickTab = null, sels = {}, wait = 2500, closeModal = true, label }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  const isLoginPage = /\/login\.html/.test(urlPath) || /\/sub-login\.html/.test(urlPath);
  if (logged && !isLoginPage) {
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('mjyy_logged_in', 'true');
        localStorage.setItem('mjyy_user_data', JSON.stringify({ phone: '13888888888', username: 'demo_main', userType: 'main', role: 'admin' }));
      } catch (e) {}
    });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
      req.continue();
    });
  } else if (isLoginPage) {
    await page.evaluateOnNewDocument(() => {
      try { localStorage.removeItem('mjyy_logged_in'); localStorage.removeItem('mjyy_user_data'); } catch (e) {}
    });
  }
  const url = BASE + urlPath;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  await new Promise((r) => setTimeout(r, wait));

  if (clickTab) {
    await page.evaluate((sel) => {
      const btn = document.querySelector(sel);
      if (btn) btn.click();
    }, clickTab).catch(() => {});
    await new Promise((r) => setTimeout(r, 800));
  }

  if (closeModal) {
    await page.evaluate(() => {
      // 关闭模态框/遮罩/toast，保证截图与"主流程"页面状态一致
      document.querySelectorAll('.modal.show, .modal.visible, .modal-backdrop, .toast, .overlay, [class*="overlay"]').forEach((el) => {
        el.classList.remove('show', 'visible', 'open');
        if (el.classList.contains('modal-backdrop') || el.classList.contains('overlay')) el.style.display = 'none';
      });
      document.querySelectorAll('.modal').forEach((el) => {
        // 只有显示中的 modal 才关
        const cs = window.getComputedStyle(el);
        if (cs.display !== 'none' && cs.visibility !== 'hidden') {
          el.classList.remove('show', 'visible', 'open', 'active');
          el.style.display = 'none';
        }
      });
      document.body.style.overflow = '';
    }).catch(() => {});
    await new Promise((r) => setTimeout(r, 300));
  }

  // 截图（与探测同状态）
  const outPath = join(OUT_DIR, file);
  await page.screenshot({ path: outPath, type: 'jpeg', quality: 86, encoding: 'binary', clip: { x: 0, y: 0, width: 1440, height: 900 } });

  // 探测元素
  const result = await page.evaluate((sels) => {
    const out = {};
    for (const [k, sel] of Object.entries(sels)) {
      out[k] = Array.from(document.querySelectorAll(sel)).map((el) => {
        const r = el.getBoundingClientRect();
        return { cls: el.className, id: el.id, tag: el.tagName.toLowerCase(), text: (el.textContent || '').trim().slice(0, 40), x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), visible: r.width > 0 && r.height > 0 };
      }).filter((e) => e.visible);
    }
    const de = document.documentElement;
    out.__doc__ = { scrollW: de.scrollWidth, scrollH: de.scrollHeight };
    return out;
  }, sels);

  console.log(`\n===== [${label}] ${urlPath} → ${file} =====`);
  console.log(JSON.stringify(result, null, 2));
  await page.close();
}

// 1. login.html (default wxPanel) - screen-login.jpg (§1.5)
await captureProbe({
  file: 'screen-login.jpg', path: '/login.html', logged: false, label: 'login-wxPanel',
  sels: {
    loginTabs: '.login-tabs', loginTab: '.login-tab',
    wxPanel: '#wxPanel', wxQrBox: '.wx-qr-box', wxQrImg: '#wxQrImg',
    wxQrTitle: '.wx-qr-title', wxQrDesc: '.wx-qr-desc',
    wxTips: '.wx-tips', wxAgreement: '.wx-agreement',
    loginLeft: '.login-left', leftHeader: '.left-header', leftTitle: '.left-title',
    leftFooter: '.left-footer', backLink: '.back-link', rightContent: '.right-content',
  },
});

// 2. login.html#registerPanel - screen-auth-login-register.jpg (§5.1)
await captureProbe({
  file: 'screen-auth-login-register.jpg', path: '/login.html', logged: false, label: 'login-registerPanel',
  clickTab: '[data-panel="registerPanel"]',
  sels: {
    registerPanel: '#registerPanel', formGroup: '#registerPanel .form-group',
    formLabel: '#registerPanel .form-label', inputWrap: '#registerPanel .input-wrap',
    formInput: '#registerPanel .form-input', smsRow: '#registerPanel .sms-row',
    smsBtn: '#registerPanel .sms-btn', formOptions: '#registerPanel .form-options',
    regAgreement: '#regAgreement', regSubmitBtn: '#regSubmitBtn',
    formFooter: '#registerPanel .form-footer',
    // tab 栏可见
    loginTabs: '.login-tabs', loginTab: '.login-tab',
  },
});

// 3. login.html (wxPanel again, for §5.2A) - same as screen-login
await captureProbe({
  file: 'screen-auth-login-wx.jpg', path: '/login.html', logged: false, label: 'login-wxPanel-5-2A',
  sels: {
    wxQrBox: '.wx-qr-box', wxQrDesc: '.wx-qr-desc', wxAgreement: '.wx-agreement',
    wxTips: '.wx-tips', loginTabs: '.login-tabs', loginTab: '.login-tab',
  },
});

// 4. login.html#accountPanel - screen-auth-login-account.jpg (§5.2B)
await captureProbe({
  file: 'screen-auth-login-account.jpg', path: '/login.html', logged: false, label: 'login-accountPanel',
  clickTab: '[data-panel="accountPanel"]',
  sels: {
    accountPanel: '#accountPanel', loginForm: '#loginForm',
    formGroup: '#accountPanel .form-group', formLabel: '#accountPanel .form-label',
    inputWrap: '#accountPanel .input-wrap', formInput: '#accountPanel .form-input',
    smsRow: '#accountPanel .sms-row', smsBtn: '#accountPanel .sms-btn',
    formOptions: '#accountPanel .form-options', rememberCheckbox: '#rememberCheckbox',
    loginAgreement: '#accountPanel .login-agreement', submitBtn: '#submitBtn',
    formFooter: '#accountPanel .form-footer',
    loginTabs: '.login-tabs', loginTab: '.login-tab',
  },
});

// 5. account-realname.html - screen-console-realname.jpg (§5.3A)
await captureProbe({
  file: 'screen-console-realname.jpg', path: '/account-realname.html?type=enterprise', logged: true, label: 'account-realname',
  sels: {
    topbar: '.topbar', topbarBrand: '.topbar-brand',
    topbarBreadcrumb: '.topbar-breadcrumb', topbarBcCurrent: '.topbar-bc-current',
    sidebar: '.sidebar', sidebarActive: '.sidebar-link.active',
    card: '.card', cardHeader: '.card-header', cardTitle: '.card-title',
    cardBody: '.card-body', verifyBtn: '#enterpriseVerifyBtn',
    infoLabel: '.info-label', infoValue: '.info-value',
    enterpriseStatus: '#enterpriseStatus', realnameTip: '.realname-tip',
  },
});

// 6. verify.html - screen-console-verify.jpg (§5.3B)
await captureProbe({
  file: 'screen-console-verify.jpg', path: '/verify.html?type=enterprise', logged: true, label: 'verify',
  sels: {
    topbar: '.topbar', contentWrap: '.content-wrap',
    panel: '.panel.active', panelHeader: '.panel-header',
    panelTitle: '.panel-title', panelDesc: '.panel-desc',
    panelBody: '.panel-body', authCards: '.auth-cards',
    authCard: '.auth-card', authCardTitle: '.auth-card-title',
    authCardDesc: '.auth-card-desc', panelFooter: '.panel-footer',
    btnPrimary: '.btn-primary', btnDefault: '.btn-default',
  },
});

// 7. account-center.html - screen-console-center.jpg (§5.4)
await captureProbe({
  file: 'screen-console-center.jpg', path: '/account-center.html', logged: true, label: 'account-center',
  sels: {
    topbar: '.topbar', topbarBrand: '.topbar-brand',
    topbarBreadcrumb: '.topbar-breadcrumb', topbarBcCurrent: '.topbar-bc-current',
    sidebar: '.sidebar', sidebarActive: '.sidebar-link.active',
    pageContent: 'main', pageHeader: '.page-title', pageSubtitle: '.page-subtitle',
    brandArea: '.pc-brand-area', brandCard: '.pc-brand-card',
    authPrompt: '#authPrompt', authPromptTitle: '#authPrompt h3',
    authPromptDesc: '#authPrompt p', authPromptBtns: '#authPrompt button',
  },
});

// 8. account-user.html - screen-console-user.jpg (§5.5)
await captureProbe({
  file: 'screen-console-user.jpg', path: '/account-user.html', logged: true, label: 'account-user',
  sels: {
    topbar: '.topbar', topbarBrand: '.topbar-brand',
    topbarBreadcrumb: '.topbar-breadcrumb', topbarBcCurrent: '.topbar-bc-current',
    sidebar: '.sidebar', sidebarActive: '.sidebar-link.active',
    pageContent: 'main', pageTitle: '.page-title, h1',
    addMemberBtn: '#addMemberBtn',
    memberTable: '#memberMainTable', actionsTable: '#memberActionsTable',
    tableHead: '#memberMainTable thead th',
    tableRow: '#memberMainTable tbody tr',
    pagination: '.pagination', paginationBtn: '.pagination-btn',
  },
});

// 9. account-message.html - screen-console-message.jpg (§5.9)
await captureProbe({
  file: 'screen-console-message.jpg', path: '/account-message.html', logged: true, label: 'account-message',
  sels: {
    topbar: '.topbar', topbarBrand: '.topbar-brand',
    topbarBreadcrumb: '.topbar-breadcrumb', topbarBcCurrent: '.topbar-bc-current',
    pageContent: 'main', msgPageTitle: '.msg-page-title',
    msgTabs: '.msg-tabs', msgTab: '.msg-tab',
    msgList: '.msg-list', markAllReadBtn: '#markAllReadBtn', clearReadBtn: '#clearReadBtn',
  },
});

await browser.close();

// 同步到 vue-gw 副本
const files = ['screen-login.jpg','screen-auth-login-register.jpg','screen-auth-login-wx.jpg','screen-auth-login-account.jpg','screen-console-realname.jpg','screen-console-verify.jpg','screen-console-center.jpg','screen-console-user.jpg','screen-console-message.jpg'];
for (const f of files) {
  try { copyFileSync(join(OUT_DIR, f), join(MIRROR_DIR, f)); } catch(e){}
}
console.log('\n✓ 9 张截图已同步到 vue-gw 副本');
