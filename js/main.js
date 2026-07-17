// ===== 民匠有约官网 - 主交互 =====
(function() {
  // 登录与认证状态检测
  var isLoggedIn = localStorage.getItem('mjyy_logged_in') === 'true';
  var isVerified = localStorage.getItem('mjyy_verify_complete') === 'true';

  function getCurrentPlatform() {
    var path = window.location.pathname;
    var fileName = path.substring(path.lastIndexOf('/') + 1);
    if (fileName.startsWith('anxinyun')) return 'anxinyun';
    if (fileName.startsWith('agent')) return 'agent';
    if (fileName.startsWith('minjiang')) return 'minjiang';
    if (fileName.startsWith('account')) return 'minjiang';
    return localStorage.getItem('mjyy_from_platform') || 'minjiang';
  }

  function getGlobalUserDropdownHTML() {
    return `
      <div class="topbar-avatar" id="topbarAvatar">用</div>
      <div style="display:flex;flex-direction:column;align-items:flex-start;gap:1px;">
        <span class="topbar-name" id="topbarName">用户</span>
        <span class="user-account-badge" id="topbarBadge">主账号</span>
      </div>
      <svg class="topbar-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          <div class="user-dropdown-avatar" id="dropdownAvatar">用</div>
          <div class="user-dropdown-info">
            <div style="display:flex;align-items:center;gap:6px;">
              <div class="user-dropdown-name" id="dropdownName">用户</div>
              <span class="user-account-badge" id="dropdownBadge">主账号</span>
            </div>
            <div class="user-dropdown-id" id="dropdownId">账号ID：--</div>
            <div class="user-dropdown-tags" id="dropdownTags">
              <span class="user-dropdown-tag" id="authTag">未认证</span>
            </div>
          </div>
        </div>
        <div class="user-dropdown-body">
          <div class="user-dropdown-group">
            <div class="user-dropdown-group-title">账号管理</div>
            <a href="account-center.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2"/></svg>
              账号中心
            </a>
            <a href="account-realname.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>
              实名信息
            </a>
            <a href="account-security.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>
              账号安全
            </a>
            <a href="account-permission.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/></svg>
              身份与权限
            </a>
          </div>
          <div class="user-dropdown-divider"></div>
          <div class="user-dropdown-group">
            <div class="user-dropdown-group-title">费用与资产</div>
            <a href="account-billing.html" class="user-dropdown-item">
              <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/></svg>
              发票 / 合同 / 订单 / 卡券
            </a>
          </div>
        </div>
        <div class="user-dropdown-footer">
          <button class="user-dropdown-logout" id="logoutBtn">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/><polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/></svg>
            退出登录
          </button>
        </div>
      </div>
    `;
  }

  function renderGlobalUserDropdowns() {
    document.querySelectorAll('.topbar-user').forEach(function(container) {
      if (container.dataset.globalDropdown === 'true') return;
      container.innerHTML = getGlobalUserDropdownHTML();
      container.dataset.globalDropdown = 'true';
    });
  }

  function renderNavRight() {
    var navRight = document.getElementById('navRight');
    if (!navRight) return;
    if (navRight.dataset.rendered === 'true') return;

    var platform = getCurrentPlatform();
    var platformPages = { minjiang: 'minjiang.html', anxinyun: 'anxinyun.html', agent: 'agent.html' };
    var helpPages = { minjiang: 'minjiang-help.html', anxinyun: 'anxinyun-help.html', agent: 'agent.html' };
    var platformNames = { minjiang: '民匠有约', anxinyun: '安心云', agent: '代理商平台' };

    var contactLink = navRight.dataset.contact === 'false' ? '' :
      '<a href="contact.html" class="nav-link-text">联系商务</a>';

    navRight.innerHTML = `
      ${contactLink}
      <a href="login.html" class="btn btn-primary" id="navLogin">登录平台</a>
      <div class="user-status" id="userStatus" style="display:none;">
        <div class="user-avatar" id="userAvatar">用</div>
        <div class="user-name-wrap">
          <span class="user-name" id="userName">企业用户</span>
          <span class="user-account-badge" id="userBadge">主账号</span>
        </div>
        <svg class="user-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-avatar" id="dropdownAvatar">用</div>
            <div class="user-dropdown-info">
              <div style="display:flex;align-items:center;gap:6px;">
                <div class="user-dropdown-name" id="dropdownName">企业用户</div>
                <span class="user-account-badge" id="dropdownBadge" style="font-size:10px;padding:0 5px;border-radius:4px;background:var(--brand-primary-50);color:var(--brand-primary);font-weight:500;line-height:16px;">主账号</span>
              </div>
              <div class="user-dropdown-id" id="dropdownId">账号ID：--</div>
              <div class="user-dropdown-tags" id="dropdownTags">
                <span class="user-dropdown-tag" id="authTag">未认证</span>
              </div>
            </div>
          </div>
          <div class="user-dropdown-body">
            <div class="user-dropdown-group">
              <div class="user-dropdown-group-title">账号管理</div>
              <a href="account-center.html" class="user-dropdown-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2"/></svg>
                账号中心
              </a>
              <a href="account-realname.html" class="user-dropdown-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/></svg>
                实名信息
              </a>
              <a href="account-security.html" class="user-dropdown-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>
                账号安全
              </a>
              <a href="account-permission.html" class="user-dropdown-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/></svg>
                身份与权限
              </a>
            </div>
            <div class="user-dropdown-divider"></div>
            <div class="user-dropdown-group">
              <div class="user-dropdown-group-title">费用与资产</div>
              <a href="account-billing.html" class="user-dropdown-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/></svg>
                发票 / 合同 / 订单
              </a>
            </div>
          </div>
          <div class="user-dropdown-footer">
            <button class="user-dropdown-logout" id="logoutBtn">
              <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/><polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/></svg>
              退出登录
            </button>
          </div>
        </div>
      </div>
      <a href="#" class="nav-enter-system" id="navEnterSystem" style="display:none;">进入系统</a>
    `;

    navRight.dataset.rendered = 'true';

    var enterSystemBtn = document.getElementById('navEnterSystem');
    if (enterSystemBtn) {
      enterSystemBtn.addEventListener('click', enterSystem);
    }

  }

  function handleLogout() {
    doLogout();
  }

  function doLogout() {
    var keysToRemove = [
      'mjyy_logged_in', 'mjyy_user_data', 'mjyy_personal_data', 'mjyy_enterprise_data',
      'mjyy_verify_complete', 'mjyy_identity_verified', 'mjyy_account_type',
      'mjyy_from_platform', 'mjyy_platform', 'mjyy_auth_type', 'mjyy_verify_step',
      'mjyy_verify_target', 'mjyy_contract_signed', 'mjyy_contract_signed_minjiang',
      'mjyy_contract_signed_anxinyun', 'mjyy_contract_signed_agent', 'mjyy_contract_info'
    ];
    keysToRemove.forEach(function(k) { localStorage.removeItem(k); });
    isLoggedIn = false;
    window.location.href = 'login.html';
  }

  function initTopbarUserInfo() {
    var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
    var personalData = JSON.parse(localStorage.getItem('mjyy_personal_data') || '{}');
    var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    var selectedAuthType = localStorage.getItem('mjyy_auth_type') || 'enterprise';
    var accountType = localStorage.getItem('mjyy_account_type') || 'main';

    function maskMobile(m) {
      if (!m || m.length < 11) return m || '--';
      return m.substring(0, 3) + '****' + m.substring(7);
    }

    function maskId(id) {
      if (!id) return '--';
      return id.substring(0, 4) + '****' + id.substring(id.length - 4);
    }

    var displayName = '';
    if (enterpriseData.companyName) displayName = enterpriseData.companyName;
    else if (personalData.realName) displayName = personalData.realName;
    else if (userData.mobile) displayName = maskMobile(userData.mobile);
    else if (userData.name) displayName = userData.name;
    else displayName = '用户';

    var displayAvatar = displayName ? displayName.charAt(0) : '用';
    var accountId = userData.accountId || userData.mobile || 'MJ' + Date.now().toString().slice(-8);

    document.querySelectorAll('.topbar-avatar, .user-avatar').forEach(function(el) {
      el.textContent = displayAvatar;
    });
    document.querySelectorAll('.topbar-name, .user-name').forEach(function(el) {
      if (displayName) el.textContent = displayName;
    });
    document.querySelectorAll('.user-dropdown-avatar, .topbar-dropdown-avatar, .dropdown-avatar').forEach(function(el) {
      el.textContent = displayAvatar;
    });
    document.querySelectorAll('.user-dropdown-name, .topbar-dropdown-name, .dropdown-name').forEach(function(el) {
      if (displayName) el.textContent = displayName;
    });
    document.querySelectorAll('.user-dropdown-id, .topbar-dropdown-id, .dropdown-id').forEach(function(el) {
      el.textContent = '账号ID：' + maskId(accountId);
    });

    var typeText = accountType === 'sub' ? '子账号' : '主账号';
    document.querySelectorAll('.user-account-badge, .topbar-account-badge, .account-badge').forEach(function(el) {
      el.textContent = typeText;
      el.classList.toggle('sub', accountType === 'sub');
      el.style.background = '';
      el.style.color = '';
    });

    document.querySelectorAll('.user-dropdown-tag, .topbar-dropdown-tag, .auth-tag').forEach(function(el) {
      if (identityVerified) {
        el.textContent = '已认证';
        el.className = el.className.replace(/pending/g, '').trim() + ' verified';
      } else {
        el.textContent = selectedAuthType === 'personal' ? '个人未认证' : '企业未认证';
        el.className = el.className.replace(/verified/g, '').trim() + ' pending';
      }
    });
  }

  renderNavRight();

  // 兼容旧版 index.html 的 navLoginBtn / navUser / navUserDropdown，同时支持新版 navLogin / userStatus
  const loginBtn = document.getElementById('navLogin') || document.getElementById('navLoginBtn') || document.querySelector('.nav-login-btn');
  const userArea = document.getElementById('userStatus') || document.getElementById('navUser');
  const userDropdown = (userArea && (userArea.querySelector('.user-dropdown') || userArea.querySelector('.nav-user-dropdown'))) || document.getElementById('userDropdown') || document.getElementById('navUserDropdown');
  const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('navLogoutBtn');
  const logoutModal = document.getElementById('logoutModal');
  const logoutConfirm = document.getElementById('logoutConfirm');
  const logoutCancel = document.getElementById('logoutCancel');
  const loginBtnOriginalText = loginBtn ? loginBtn.textContent.trim() : '登录';

  function checkLoginStatus() {
    if (loginBtn) {
      if (isLoggedIn) {
        // 已登录且页面有用户状态区时，隐藏登录按钮；否则显示“进入系统”
        if (userArea) {
          loginBtn.style.display = 'none';
        } else {
          loginBtn.textContent = '进入系统';
          loginBtn.href = '#';
          loginBtn.style.display = 'inline-flex';
          loginBtn.addEventListener('click', enterSystem);
        }
      } else {
        loginBtn.style.display = 'inline-flex';
        loginBtn.textContent = loginBtnOriginalText;
        loginBtn.href = 'login.html';
      }
    }

    if (userArea) {
      if (userArea.classList.contains('user-status')) {
        userArea.style.display = isLoggedIn ? 'flex' : 'none';
      } else {
        userArea.style.display = isLoggedIn ? 'flex' : 'none';
      }
    }

    var navEnterSystem = document.getElementById('navEnterSystem');
    if (navEnterSystem) {
      var path = window.location.pathname;
      var fileName = path.substring(path.lastIndexOf('/') + 1);
      var isEntryPage = fileName === 'index.html' || fileName === '';
      navEnterSystem.style.display = (isLoggedIn && !isEntryPage) ? 'inline-flex' : 'none';
    }

    if (isLoggedIn) {
      updateUserInfo();
      updateCertInfo();
      updateProductButtons();
    }
  }

  function updateProductButtons() {
    var productBtns = document.querySelectorAll('.product-select-btn[data-platform]');
    productBtns.forEach(function(btn) {
      btn.textContent = '进入平台';
      btn.classList.add('product-select-btn-logged');
    });
    var productCards = document.querySelectorAll('.product-select-card[data-platform], .product-select-card[onclick*="minjiang"], .product-select-card[onclick*="anxinyun"], .product-select-card[onclick*="agent"]');
    productCards.forEach(function(card) {
      var platform = card.querySelector('.product-select-btn[data-platform]')?.dataset.platform || '';
      if (platform) {
        card.onclick = function() {
          enterSystemToPlatform(platform);
        };
        var btn = card.querySelector('.product-select-btn');
        if (btn) {
          btn.onclick = function(e) {
            e.stopPropagation();
            enterSystemToPlatform(platform);
          };
        }
      }
    });
  }

  function enterSystemToPlatform(platform) {
    var platformPages = { minjiang: 'minjiang.html', anxinyun: 'anxinyun.html', agent: 'agent.html' };
    var targetPage = platformPages[platform] || 'minjiang.html';
    var onlyEnterprise = (platform === 'minjiang' || platform === 'anxinyun');

    var personalData = JSON.parse(localStorage.getItem('mjyy_personal_data') || '{}');
    var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true' && (onlyEnterprise ? !!enterpriseData.companyName : (!!enterpriseData.companyName || !!personalData.realName));
    var contractSigned = localStorage.getItem('mjyy_contract_signed_' + platform) === 'true';
    if (identityVerified && contractSigned) {
      window.location.href = targetPage;
    } else {
      localStorage.setItem('mjyy_verify_target', platform);
      window.location.href = 'verify.html';
    }
  }

  function enterSystem(e) {
    e.preventDefault();
    var platform = getCurrentPlatform();
    var platformPages = { minjiang: 'minjiang.html', anxinyun: 'anxinyun.html', agent: 'agent.html' };
    var targetPage = platformPages[platform] || 'minjiang.html';
    var onlyEnterprise = (platform === 'minjiang' || platform === 'anxinyun');

    var personalData = JSON.parse(localStorage.getItem('mjyy_personal_data') || '{}');
    var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true' && (onlyEnterprise ? !!enterpriseData.companyName : (!!enterpriseData.companyName || !!personalData.realName));
    var contractSigned = localStorage.getItem('mjyy_contract_signed_' + platform) === 'true';
    if (identityVerified && contractSigned) {
      window.location.href = targetPage;
    } else {
      localStorage.setItem('mjyy_verify_target', platform);
      window.location.href = 'verify.html';
    }
  }

  function updateUserInfo() {
    if (!userArea) return;
    var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
    var personalData = JSON.parse(localStorage.getItem('mjyy_personal_data') || '{}');
    var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
    var avatarEl = userArea.querySelector('.user-avatar') || userArea.querySelector('.nav-user-avatar');
    var nameEl = userArea.querySelector('.user-name') || userArea.querySelector('.nav-user-name');
    var badgeEl = userArea.querySelector('.user-account-badge');
    var dropdownAvatarEl = userDropdown ? userDropdown.querySelector('.user-dropdown-avatar') : null;
    var dropdownNameEl = userDropdown ? userDropdown.querySelector('.user-dropdown-name') : null;
    var dropdownIdEl = userDropdown ? userDropdown.querySelector('.user-dropdown-id') : null;
    var dropdownBadgeEl = userDropdown ? userDropdown.querySelector('.user-dropdown-info .user-account-badge') : null;
    var authTagEl = userDropdown ? userDropdown.querySelector('.user-dropdown-tag') : null;

    var displayName = '';
    var displayAvatar = '用';

    if (enterpriseData.companyName) {
      displayName = enterpriseData.companyName;
      displayAvatar = enterpriseData.companyName.charAt(0);
    } else if (personalData.realName) {
      displayName = personalData.realName;
      displayAvatar = personalData.realName.charAt(0);
    } else if (userData.mobile) {
      var mobile = userData.mobile;
      displayName = mobile.substring(0, 3) + '****' + mobile.substring(7);
      displayAvatar = mobile.charAt(0);
    } else if (userData.name) {
      displayName = userData.name;
      displayAvatar = userData.name.charAt(0);
    }

    if (avatarEl) avatarEl.textContent = displayAvatar;
    if (nameEl && displayName) nameEl.textContent = displayName;

    // 账号类型标签
    var accountType = localStorage.getItem('mjyy_account_type') || 'main';
    var typeText = accountType === 'sub' ? '子账号' : '主账号';
    if (badgeEl) {
      badgeEl.textContent = typeText;
      badgeEl.classList.toggle('sub', accountType === 'sub');
    }
    if (dropdownBadgeEl) {
      dropdownBadgeEl.textContent = typeText;
      dropdownBadgeEl.classList.toggle('sub', accountType === 'sub');
    }

    // 下拉头部信息同步
    if (dropdownAvatarEl) dropdownAvatarEl.textContent = displayAvatar;
    if (dropdownNameEl && displayName) {
      var nameSpan = dropdownNameEl.querySelector('span') || dropdownNameEl;
      if (nameSpan.tagName.toLowerCase() === 'span') nameSpan.textContent = displayName;
      else {
        var spans = dropdownNameEl.querySelectorAll('span');
        if (spans.length > 0) spans[0].textContent = displayName;
        else dropdownNameEl.textContent = displayName;
      }
    }

    // 账号ID显示（与账户中心一致）
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    var selectedAuthType = localStorage.getItem('mjyy_auth_type') || 'enterprise';
    var accountId = userData.accountId || userData.mobile || 'MJ' + Date.now().toString().slice(-8);
    
    function maskId(id) {
      if (!id) return '--';
      return id.substring(0, 4) + '****' + id.substring(id.length - 4);
    }
    
    if (dropdownIdEl) {
      dropdownIdEl.textContent = '账号ID：' + maskId(accountId);
    }

    // 认证状态标签（与账户中心一致）
    if (authTagEl) {
      if (identityVerified) {
        authTagEl.textContent = '已认证';
        authTagEl.className = 'user-dropdown-tag verified';
      } else {
        authTagEl.textContent = selectedAuthType === 'personal' ? '个人未认证' : '企业未认证';
        authTagEl.className = 'user-dropdown-tag pending';
      }
    }
  }

  function updateCertInfo() {
  }

  checkLoginStatus();
  renderGlobalUserDropdowns();
  initTopbarUserInfo();

  // 新版 user-status 点击展开下拉
  if (userArea && userArea.classList.contains('user-status')) {
    userArea.addEventListener('click', function(e) {
      // 点击"进入系统"或"退出登录"按钮时不展开下拉
      if (e.target.closest('.nav-enter-system') || e.target.closest('.user-dropdown-logout')) return;
      e.stopPropagation();
      userArea.classList.toggle('open');
      if (userDropdown) userDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function() {
      userArea.classList.remove('open');
      if (userDropdown) userDropdown.classList.remove('open');
    });
  }

  // 旧版 navUser 结构需要点击展开下拉
  if (userArea && userArea.id === 'navUser') {
    userArea.style.position = 'relative';
    userArea.style.cursor = 'pointer';
    userArea.style.alignItems = 'center';
    userArea.addEventListener('click', (e) => {
      if (e.target.closest('.nav-enter-system')) return;
      e.stopPropagation();
      if (userDropdown) {
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
    document.addEventListener('click', () => {
      if (userDropdown) userDropdown.style.display = 'none';
    });
  }

  // "进入系统"图标按钮点击事件
  var navEnterSystemBtns = document.querySelectorAll('.nav-enter-system');
  navEnterSystemBtns.forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      enterSystem(e);
    });
  });

  // 全局退出登录（事件委托，兼容动态渲染的 #logoutBtn / .user-dropdown-logout）
  document.addEventListener('click', function(e) {
    var logoutBtn = e.target.closest('#logoutBtn, .user-dropdown-logout');
    if (logoutBtn) {
      e.preventDefault();
      e.stopPropagation();
      doLogout();
    }
  });

  // 全局 .topbar-user 点击展开/收起下拉（兼容移动端无 hover 场景）
  document.addEventListener('click', function(e) {
    var topbarUser = e.target.closest('.topbar-user');
    if (topbarUser) {
      if (e.target.closest('.user-dropdown-logout, .nav-enter-system, .user-dropdown a, .user-dropdown button')) return;
      e.stopPropagation();
      var dropdown = topbarUser.querySelector('.user-dropdown');
      if (dropdown) dropdown.classList.toggle('open');
    } else {
      document.querySelectorAll('.topbar-user .user-dropdown.open').forEach(function(d) { d.classList.remove('open'); });
    }
  });

  var enterSystemBtn = document.getElementById('enterSystemBtn');
  if (enterSystemBtn) {
    enterSystemBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      enterSystem(e);
    });
  }

  if (logoutConfirm) {
    logoutConfirm.addEventListener('click', (e) => {
      e.stopPropagation();
      doLogout();
      if (logoutModal) logoutModal.classList.remove('visible');
    });
  }

  if (logoutCancel) {
    logoutCancel.addEventListener('click', (e) => {
      e.stopPropagation();
      if (logoutModal) logoutModal.classList.remove('visible');
    });
  }

  if (logoutModal) {
    logoutModal.addEventListener('click', (e) => {
      if (e.target === logoutModal) logoutModal.classList.remove('visible');
    });
  }

  // Navbar 滚动效果
  const navbar = document.getElementById('navbar');
  if (navbar) {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const cur = window.scrollY;
      if (cur > 10) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
      lastScroll = cur;
    }, { passive: true });
  }

  // Reveal 动画
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(r => io.observe(r));
  } else {
    reveals.forEach(r => r.classList.add('visible'));
  }

  // 行业方案 Tab 切换
  document.querySelectorAll('.industry-tabs').forEach(tabs => {
    const buttons = tabs.querySelectorAll('.industry-tab');
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        buttons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const wrap = tabs.parentElement;
        wrap.querySelectorAll('.industry-pane').forEach(p => {
          p.classList.toggle('active', p.dataset.pane === target);
        });
      });
    });
  });

  // 数字滚动
  const statNums = document.querySelectorAll('.stat-num, .hero-stat-num span');
  if (statNums.length && 'IntersectionObserver' in window) {
    const numIO = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateNum(e.target);
          numIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statNums.forEach(n => numIO.observe(n));
  }

  function animateNum(el) {
    const text = el.textContent;
    const match = text.match(/^([^\d]*)(\d+(?:\.\d+)?)(.*)$/);
    if (!match) return;
    const [, prefix, num, suffix] = match;
    const target = parseFloat(num);
    const isFloat = num.includes('.');
    const duration = 1200;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - Math.pow(1 - t, 3);
      const cur = target * ease;
      el.textContent = prefix + (isFloat ? cur.toFixed(1) : Math.floor(cur).toLocaleString()) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = text;
    }
    requestAnimationFrame(tick);
  }
})();

// ===== 悬浮侧边栏交互 =====
(function() {
  const sidebar = document.querySelector('.float-sidebar');
  const panels = document.querySelectorAll('.float-panel');
  const btns = document.querySelectorAll('.float-btn[data-panel]');

  function closeAllPanels() {
    panels.forEach(p => p.classList.remove('active'));
    btns.forEach(b => b.classList.remove('active'));
  }

  btns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const panelId = btn.dataset.panel;
      const panel = document.getElementById(panelId);
      
      if (!panel) return;
      
      const isActive = panel.classList.contains('active');
      
      closeAllPanels();
      
      if (!isActive) {
        panel.classList.add('active');
        btn.classList.add('active');
      }
    });
  });

  panels.forEach(panel => {
    panel.addEventListener('click', (e) => {
      e.stopPropagation();
    });
    
    const closeBtn = panel.querySelector('.float-panel-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        closeAllPanels();
      });
    }
  });

  document.addEventListener('click', () => {
    closeAllPanels();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllPanels();
    }
  });
})();
