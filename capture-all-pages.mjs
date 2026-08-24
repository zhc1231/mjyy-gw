// 全站截图脚本：按用户主流程顺序截图所有顶级页面
// 用法: node capture-all-pages.mjs
import { createRequire } from 'module';
import { mkdirSync, existsSync, copyFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const puppeteer = require('/root/.npm/_npx/668c188756b835f3/node_modules/puppeteer');

const BASE = 'https://zhc1231.github.io/mjyy-gw';
const OUT_DIR = '/workspace/docs/product-design/screenshots';
const MIRROR_DIR = '/workspace/vue-gw/public/docs/product-design/screenshots';
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(MIRROR_DIR, { recursive: true });

// 全站页面按用户主流程顺序分 5 组
const SHOTS = [
  // A. 官网浏览（未登录态）
  { group: 'site', file: 'screen-site-index.jpg',           path: '/',                          logged: false, full: false, label: '官网首页' },
  { group: 'site', file: 'screen-site-minjiang.jpg',        path: '/minjiang.html',             logged: false, full: false, label: '民匠有约·平台介绍' },
  { group: 'site', file: 'screen-site-minjiang-features.jpg', path: '/minjiang-features.html', logged: false, full: false, label: '民匠有约·产品功能' },
  { group: 'site', file: 'screen-site-minjiang-solutions.jpg', path: '/minjiang-solutions.html', logged: false, full: false, label: '民匠有约·行业方案' },
  { group: 'site', file: 'screen-site-minjiang-cases.jpg',  path: '/minjiang-cases.html',       logged: false, full: false, label: '民匠有约·客户案例' },
  { group: 'site', file: 'screen-site-minjiang-emergency.jpg', path: '/minjiang-emergency.html', logged: false, full: false, label: '智慧应急专题' },
  { group: 'site', file: 'screen-site-minjiang-help.jpg',  path: '/minjiang-help.html',        logged: false, full: false, label: '民匠有约·帮助中心' },
  { group: 'site', file: 'screen-site-anxinyun.jpg',       path: '/anxinyun.html',             logged: false, full: false, label: '安心云·平台介绍' },
  { group: 'site', file: 'screen-site-anxinyun-features.jpg', path: '/anxinyun-features.html', logged: false, full: false, label: '安心云·产品功能' },
  { group: 'site', file: 'screen-site-anxinyun-scenarios.jpg', path: '/anxinyun-scenarios.html', logged: false, full: false, label: '安心云·应用场景' },
  { group: 'site', file: 'screen-site-anxinyun-tax.jpg',   path: '/anxinyun-tax.html',         logged: false, full: false, label: '安心云·税务服务' },
  { group: 'site', file: 'screen-site-anxinyun-help.jpg',  path: '/anxinyun-help.html',        logged: false, full: false, label: '安心云·帮助中心' },
  { group: 'site', file: 'screen-site-agent.jpg',          path: '/agent.html',                logged: false, full: false, label: '代理商·平台介绍' },
  { group: 'site', file: 'screen-site-agent-select.jpg',  path: '/agent-select.html',         logged: false, full: false, label: '代理商·选代理入驻' },
  { group: 'site', file: 'screen-site-about.jpg',          path: '/about.html',                logged: false, full: false, label: '关于我们' },
  { group: 'site', file: 'screen-site-contact.jpg',        path: '/contact.html',              logged: false, full: false, label: '联系我们' },
  { group: 'site', file: 'screen-site-career.jpg',        path: '/career.html',                logged: false, full: false, label: '人才招聘' },
  { group: 'site', file: 'screen-site-news.jpg',          path: '/news.html',                  logged: false, full: false, label: '资讯中心' },
  { group: 'site', file: 'screen-site-service-center.jpg', path: '/service-center.html',      logged: false, full: false, label: '服务中心' },
  { group: 'site', file: 'screen-site-developer.jpg',     path: '/developer-center.html',     logged: false, full: false, label: '开发者中心' },
  { group: 'site', file: 'screen-site-consult.jpg',       path: '/consult.html',               logged: false, full: false, label: '在线咨询入口' },
  { group: 'site', file: 'screen-site-consult-chat.jpg',  path: '/consult-chat.html',          logged: false, full: false, label: '在线咨询对话' },

  // B. 注册登录（未登录态，登录页带 hash 切换面板）
  { group: 'auth', file: 'screen-auth-login-wx.jpg',       path: '/login.html',                         logged: false, full: false, label: '主账号登录·微信扫码' },
  { group: 'auth', file: 'screen-auth-login-account.jpg',  path: '/login.html#accountPanel',            logged: false, full: false, label: '主账号登录·账号密码' },
  { group: 'auth', file: 'screen-auth-login-register.jpg', path: '/login.html#registerPanel',           logged: false, full: false, label: '主账号注册' },
  { group: 'auth', file: 'screen-auth-sub-login.jpg',      path: '/sub-login.html',                     logged: false, full: false, label: '子账号登录' },
  { group: 'auth', file: 'screen-auth-agreement.jpg',      path: '/agreement.html',                     logged: false, full: false, label: '用户协议' },
  { group: 'auth', file: 'screen-auth-privacy.jpg',        path: '/privacy.html',                       logged: false, full: false, label: '隐私政策' },

  // C. 控制台·基础（已登录态）
  { group: 'console-base', file: 'screen-console-center.jpg',     path: '/account-center.html',    logged: true, full: false, label: '控制台·产品中心首页' },
  { group: 'console-base', file: 'screen-console-realname.jpg',   path: '/account-realname.html',  logged: true, full: false, label: '控制台·企业信息（去认证）' },
  { group: 'console-base', file: 'screen-console-verify.jpg',     path: '/verify.html?type=enterprise', logged: true, full: false, label: '爱签·企业认证流程' },
  { group: 'console-base', file: 'screen-console-security.jpg',  path: '/account-security.html',  logged: true, full: false, label: '控制台·账号安全' },
  { group: 'console-base', file: 'screen-console-message.jpg',   path: '/account-message.html',   logged: true, full: false, label: '控制台·消息中心' },
  { group: 'console-base', file: 'screen-console-message-detail.jpg', path: '/message-detail.html', logged: true, full: false, label: '控制台·消息详情' },

  // D. 控制台·业务（已登录态）
  { group: 'console-biz', file: 'screen-console-contract.jpg',   path: '/contract-sign.html',     logged: true, full: false, label: '控制台·合同签约' },
  { group: 'console-biz', file: 'screen-console-billing.jpg',     path: '/account-billing.html',    logged: true, full: false, label: '控制台·合同管理/费用' },
  { group: 'console-biz', file: 'screen-console-wallet.jpg',     path: '/account-wallet.html',     logged: true, full: false, label: '控制台·钱包' },
  { group: 'console-biz', file: 'screen-console-bank.jpg',       path: '/account-bank.html',       logged: true, full: false, label: '控制台·银行卡管理' },

  // E. 控制台·权限（已登录态）
  { group: 'console-perm', file: 'screen-console-user.jpg',       path: '/account-user.html',       logged: true, full: false, label: '控制台·用户管理' },
  { group: 'console-perm', file: 'screen-console-role.jpg',       path: '/account-role.html',       logged: true, full: false, label: '控制台·角色管理' },
  { group: 'console-perm', file: 'screen-console-role-edit.jpg',  path: '/account-role-edit.html',  logged: true, full: false, label: '控制台·角色编辑' },
  { group: 'console-perm', file: 'screen-console-permission.jpg', path: '/account-permission.html', logged: true, full: false, label: '控制台·权限管理' },
];

const browser = await puppeteer.launch({
  headless: 'new',
  executablePath: '/root/.cache/puppeteer/chrome/linux-151.0.7922.71/chrome-linux64/chrome',
  args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
});

async function capture({ group, file, path: urlPath, logged, full, label }) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  if (logged) {
    await page.evaluateOnNewDocument(() => {
      try {
        localStorage.setItem('mjyy_logged_in', 'true');
        localStorage.setItem('mjyy_user_data', JSON.stringify({ phone: '13888888888', username: 'demo_main', userType: 'main', role: 'admin' }));
      } catch (e) {}
    });
    // 拦截跳转到 login 的请求，让未登录页也能直接进
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (req.isNavigationRequest() && /\/login\.html([?#]|$)/.test(req.url())) { req.abort(); return; }
      req.continue();
    });
  }
  const url = BASE + urlPath;
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }).catch(() => {});
  // 等 SPA/动画稳定
  await new Promise((r) => setTimeout(r, 2500));
  // 关掉可能的弹窗/toast
  await page.evaluate(() => {
    document.querySelectorAll('.toast, .modal-backdrop, [class*="overlay"]').forEach((el) => el.classList.remove('visible', 'show', 'open'));
    document.body.style.overflow = '';
  }).catch(() => {});
  const outPath = join(OUT_DIR, file);
  const opts = { type: 'jpeg', quality: 86, encoding: 'binary' };
  if (full) {
    opts.fullPage = true;
  } else {
    opts.clip = { x: 0, y: 0, width: 1440, height: 900 };
  }
  await page.screenshot({ path: outPath, ...opts });
  console.log(`✓ [${group}] ${file}  ←  ${urlPath}`);
  await page.close();
}

const t0 = Date.now();
for (const shot of SHOTS) {
  try { await capture(shot); } catch (e) { console.error(`✗ ${shot.file}: ${e.message}`); }
}
await browser.close();

// 同步到 vue-gw 副本目录
const srcs = readdirSync(OUT_DIR);
for (const f of srcs) {
  const s = join(OUT_DIR, f);
  if (!statSync(s).isFile()) continue;
  copyFileSync(s, join(MIRROR_DIR, f));
}
console.log(`\n镜像 ${srcs.length} 张到 ${MIRROR_DIR}`);
console.log(`耗时 ${((Date.now() - t0) / 1000).toFixed(1)}s`);
