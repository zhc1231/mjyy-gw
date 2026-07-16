// ===== 民匠有约官网 - 主交互 =====
(function() {
  // 登录与认证状态检测
  var isLoggedIn = localStorage.getItem('mjyy_logged_in') === 'true';
  var isVerified = localStorage.getItem('mjyy_verify_complete') === 'true';

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
        userArea.classList.toggle('active', isLoggedIn);
      } else {
        userArea.style.display = isLoggedIn ? 'flex' : 'none';
      }
    }

    if (isLoggedIn) {
      updateUserInfo();
      updateCertInfo();
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
  }

  function getCurrentPlatform() {
    var path = window.location.pathname;
    if (path.includes('anxinyun')) return 'anxinyun';
    if (path.includes('agent')) return 'agent';
    if (path.includes('minjiang')) return 'minjiang';
    return localStorage.getItem('mjyy_from_platform') || 'minjiang';
  }

  function updateCertInfo() {
    var personalData = JSON.parse(localStorage.getItem('mjyy_personal_data') || '{}');
    var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
    var personalName = personalData.realName || personalData.name || '';
    var enterpriseName = enterpriseData.companyName || enterpriseData.name || '';
    var currentPlatform = getCurrentPlatform();
    var onlyEnterprise = (currentPlatform === 'minjiang' || currentPlatform === 'anxinyun');

    var personalItem = document.getElementById('personalVerifyItem');
    var enterpriseItem = document.getElementById('enterpriseVerifyItem');
    var personalNameEl = document.getElementById('personalVerifyName');
    var enterpriseNameEl = document.getElementById('enterpriseVerifyName');
    var verifyBanner = document.getElementById('verifyBanner');

    // 民匠有约/安心云仅保留企业认证，隐藏个人认证行
    if (personalItem) personalItem.style.display = onlyEnterprise ? 'none' : 'flex';

    if (personalNameEl) personalNameEl.textContent = personalName || '未认证 去认证';
    if (enterpriseNameEl) enterpriseNameEl.textContent = enterpriseName || '未认证 去认证';

    // 未认证时点击跳转认证页
    if (personalItem) {
      personalItem.addEventListener('click', function(e) {
        if (!personalName) {
          e.preventDefault();
          localStorage.setItem('mjyy_verify_target', currentPlatform);
          window.location.href = 'verify.html';
        }
      });
    }
    if (enterpriseItem) {
      enterpriseItem.addEventListener('click', function(e) {
        if (!enterpriseName) {
          e.preventDefault();
          localStorage.setItem('mjyy_verify_target', currentPlatform);
          window.location.href = 'verify.html';
        }
      });
    }

    if (verifyBanner) {
      var titleEl = verifyBanner.querySelector('.verify-banner-title');
      var descEl = verifyBanner.querySelector('.verify-banner-desc');
      var allVerified = onlyEnterprise ? !!enterpriseName : (!!personalName || !!enterpriseName);
      if (!allVerified) {
        if (titleEl) titleEl.textContent = '未完成实名认证';
        if (descEl) descEl.textContent = '完成认证后即可使用全部功能';
      } else {
        if (titleEl) titleEl.textContent = '认证信息';
        if (descEl) descEl.textContent = '查看并管理您的认证状态';
      }
    }
  }

  function doLogout() {
    localStorage.removeItem('mjyy_logged_in');
    localStorage.removeItem('mjyy_user_data');
    localStorage.removeItem('mjyy_verify_step');
    localStorage.removeItem('mjyy_personal_data');
    localStorage.removeItem('mjyy_enterprise_data');
    localStorage.removeItem('mjyy_contract_signed');
    localStorage.removeItem('mjyy_contract_signed_minjiang');
    localStorage.removeItem('mjyy_contract_signed_anxinyun');
    localStorage.removeItem('mjyy_contract_signed_agent');
    localStorage.removeItem('mjyy_identity_verified');
    localStorage.removeItem('mjyy_verify_complete');
    localStorage.removeItem('mjyy_verify_target');
    if (userDropdown) userDropdown.style.display = 'none';
    isLoggedIn = false;
    checkLoginStatus();
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (window.location.pathname.includes('login.html')) {
      window.location.href = 'index.html';
    }
  }

  checkLoginStatus();

  // 旧版 navUser 结构需要点击展开下拉
  if (userArea && userArea.id === 'navUser') {
    userArea.style.position = 'relative';
    userArea.style.cursor = 'pointer';
    userArea.style.alignItems = 'center';
    userArea.addEventListener('click', (e) => {
      e.stopPropagation();
      if (userDropdown) {
        userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
      }
    });
    document.addEventListener('click', () => {
      if (userDropdown) userDropdown.style.display = 'none';
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (logoutModal) {
        logoutModal.classList.add('visible');
      } else if (confirm('确定要退出登录吗？')) {
        doLogout();
      }
    });
  }

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
