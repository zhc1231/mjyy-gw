// ===== 民匠有约官网 - 主交互 =====
(function() {
  'use strict';
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

  // ===== 企业管理辅助（全局复用，与 account-center.html 逻辑一致） =====
  function ensureEnterprises() {
    var list = localStorage.getItem('mjyy_enterprise_list');
    if (list) {
      try { list = JSON.parse(list); if (!Array.isArray(list)) throw 0; }
      catch (e) { list = null; }
    }
    if (!list || list.length === 0) {
      var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
      var personalData = JSON.parse(localStorage.getItem('mjyy_personal_data') || '{}');
      var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
      var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
      var authType = localStorage.getItem('mjyy_auth_type') || 'enterprise';
      var name = enterpriseData.companyName
        || (personalData.realName ? personalData.realName + '（个人企业）' : null)
        || userData.name
        || '我的企业';
      var defaultEnt = {
        id: 'ENT' + Date.now(),
        name: name,
        creditCode: enterpriseData.creditCode || enterpriseData.credit_code || '',
        legalMobile: userData.mobile || '',
        authType: authType,
        verified: identityVerified,
        role: '主账号管理员',
        createdAt: Date.now(),
        isDefault: true
      };
      // 添加两个模拟企业
      var mockEnt2 = {
        id: 'ENT' + (Date.now() - 100000),
        name: '杭州云创科技有限公司',
        creditCode: '91330100MA2HXXXXXX',
        legalMobile: '13900002222',
        authType: 'enterprise',
        verified: true,
        role: '主账号管理员',
        createdAt: Date.now() - 86400000 * 30,
        isDefault: false
      };
      var mockEnt3 = {
        id: 'ENT' + (Date.now() - 200000),
        name: '上海数链信息技术有限公司',
        creditCode: '91310100MA3KXXXXXX',
        legalMobile: '13700003333',
        authType: 'enterprise',
        verified: true,
        role: '子账号管理员',
        createdAt: Date.now() - 86400000 * 60,
        isDefault: false
      };
      list = [defaultEnt, mockEnt2, mockEnt3];
      localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
      localStorage.setItem('mjyy_current_enterprise_id', defaultEnt.id);
    }
    return list;
  }
  function getCurrentEnterprise() {
    var list = ensureEnterprises();
    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    var cur = list.find(function(e) { return e.id === curId; });
    if (!cur) cur = list[0];
    return cur;
  }

  // 刷新全局顶部账号卡片（顶部名称 + 下拉卡片头部信息）
  // 任何企业/认证状态变更后调用此函数即可实时更新显示
  function refreshGlobalDropdownCard() {
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

    var currentEnt = null;
    try { currentEnt = getCurrentEnterprise(); } catch(e) {}
    var hasRealEnterprise = !!(currentEnt && currentEnt.name && currentEnt.name !== '我的企业' && currentEnt.name !== '新企业（未认证）');
    // 显示/隐藏规则：已认证 并且有企业信息（creditCode/verified）才显示「统一社会信用代码」和「主账号」徽章
    // 未认证（identityVerified=false）或刚添加新企业 → 不显示这三个信息：统一社会信用代码 / 主账号 / 工商识别号
    var hasVerifiedEnterprise = !!(identityVerified && (currentEnt && (currentEnt.verified || currentEnt.creditCode)));
    function getCreditCode() {
      if (currentEnt && currentEnt.creditCode) return currentEnt.creditCode;
      return enterpriseData.creditCode || enterpriseData.credit_code || enterpriseData.uscc || '';
    }

    var userPhone = userData.phone || userData.mobile || '';
    var displayName = '';
    // 规则：未认证 → 手机号；已认证有企业 → 企业名；否则兜底
    if (!identityVerified && userPhone) displayName = maskMobile(userPhone);
    else if (hasRealEnterprise) displayName = currentEnt.name;
    else if (identityVerified && enterpriseData.companyName) displayName = enterpriseData.companyName;
    else if (identityVerified && personalData.realName) displayName = personalData.realName;
    else if (!identityVerified && userPhone) displayName = maskMobile(userPhone);
    else if (userData.name && userData.name !== '微信用户') displayName = userData.name;
    else displayName = '企业用户';

    var displayAvatar = displayName ? displayName.charAt(0) : '企';
    var accountId = userData.accountId || userPhone || 'MJ' + Date.now().toString().slice(-8);
    var typeText = accountType === 'sub' ? '子账号' : '主账号';

    // 顶部栏
    document.querySelectorAll('.topbar-avatar, .user-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.topbar-name, .user-name').forEach(function(el) { if (displayName) el.textContent = displayName; });
    document.querySelectorAll('#topbarUserName, .topbar-user-name').forEach(function(el) { el.textContent = displayName; });

    // 下拉卡片头部
    document.querySelectorAll('.user-dropdown-avatar, .topbar-dropdown-avatar, .dropdown-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.user-dropdown-name, .topbar-dropdown-name, .dropdown-name').forEach(function(el) { if (displayName) el.textContent = displayName; });
    // 4. 企业id改为"统一社会信用代码"；未认证/新企业去除 统一社会信用代码 / 主账号 / 工商识别号
    var creditCode = getCreditCode();
    var dropdownIdEls = document.querySelectorAll('.user-dropdown-id, .topbar-dropdown-id, .dropdown-id');
    dropdownIdEls.forEach(function(el) {
      var idTagEl = el.id === 'dropdownId' ? el : null;
      var parentTags = idTagEl ? idTagEl.parentElement ? idTagEl.parentElement.querySelector('#dropdownMetaRow') : null : null;
      if (hasVerifiedEnterprise && creditCode) {
        el.style.display = '';
        el.textContent = creditCode;
      } else {
        el.style.display = 'none';
        el.textContent = '';
      }
    });
    // 下拉中的 meta row（主账号 / 工商识别号）：未认证统一隐藏
    var rows = document.querySelectorAll('#dropdownMetaRow, .user-dropdown-tags-row');
    rows.forEach(function(row) {
      if (!hasVerifiedEnterprise) { row.style.display = 'none'; return; }
      row.style.display = 'flex';
      row.style.flexWrap = 'wrap';
      row.style.alignItems = 'center';
      row.style.gap = '6px';
      // 工商识别号：始终不单独显示
      row.querySelectorAll('.bizRegNo, .gs-reg-no, .drop-down-gszbh, [data-field="gszsbh"], [data-field="businessRegistrationNumber"], .businessReg, .user-dropdown-business-no').forEach(function(el){ el.style.display='none'; });
    });
    // 顶部栏的 topbarAccountBadge：未认证不显示；认证后显示"主账号/子账号"
    var topbarBadge = document.getElementById('topbarAccountBadge');
    if (topbarBadge) {
      if (!hasVerifiedEnterprise) { topbarBadge.style.display = 'none'; }
      else {
        topbarBadge.style.display = '';
        topbarBadge.textContent = typeText;
        topbarBadge.style.cssText = '';
      }
    }
    // 主账号类型 badge：未认证不显示
    var allBadges = document.querySelectorAll('.user-account-badge, .topbar-account-badge');
    allBadges.forEach(function(el) {
      if (el.id === 'topbarAccountBadge') return;
      if (!hasVerifiedEnterprise) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.textContent = typeText;
      el.classList.toggle('sub', accountType === 'sub');
      if (accountType === 'sub') { el.style.background = '#FFF7E6'; el.style.color = '#FF7D00'; }
      else { el.style.background = ''; el.style.color = ''; }
    });

    // 原账号类型徽章代码已合并到上面；保留向后兼容

    // 顶部 chips
    var chipsContainer = document.getElementById('topbarUserChips');
    if (chipsContainer) {
      chipsContainer.innerHTML = '';
      if (identityVerified && currentEnt && currentEnt.isDefault) {
        var s = document.createElement('span');
        s.className = 'topbar-user-chip default';
        s.textContent = '默认企业';
        chipsContainer.appendChild(s);
      }
    }

    // 面包屑企业名
    var crumbName = '';
    if (hasRealEnterprise) crumbName = currentEnt.name;
    else if (enterpriseData.companyName) crumbName = enterpriseData.companyName;
    else if (personalData.realName) crumbName = personalData.realName + '（个人企业）';
    else crumbName = '我的企业';
    document.querySelectorAll('#topbarEnterpriseName, .topbar-enterprise-name, .crumb-enterprise-name').forEach(function(el) {
      if (crumbName) el.textContent = crumbName;
    });
  }

  function switchEnterprise(id) {
    var list = ensureEnterprises();
    var ent = list.find(function(e) { return e.id === id; });
    if (!ent) return;
    localStorage.setItem('mjyy_current_enterprise_id', ent.id);
    localStorage.setItem('mjyy_last_enterprise_id', ent.id);
    // 根据选中的企业状态同步认证状态
    if (ent.creditCode || ent.verified) {
      localStorage.setItem('mjyy_identity_verified', 'true');
      if (ent.creditCode) {
        var entData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
        entData.companyName = ent.name;
        entData.creditCode = ent.creditCode;
        localStorage.setItem('mjyy_enterprise_data', JSON.stringify(entData));
      }
    } else {
      localStorage.setItem('mjyy_identity_verified', 'false');
    }
    // 立即刷新下拉卡片，显示当前选中的企业信息
    refreshGlobalDropdownCard();
    window.location.reload();
  }
  function addEnterpriseGlobal(payload) {
    var list = ensureEnterprises();
    var ent = {
      id: 'ENT' + Date.now(),
      name: payload.name,
      creditCode: payload.creditCode || '',
      legalMobile: payload.legalMobile || '',
      authType: 'enterprise',
      verified: false,
      role: payload.joinType === 'join' ? '员工' : '主账号管理员',
      createdAt: Date.now(),
      isDefault: false,
      inviteCode: payload.inviteCode || ''
    };
    list.push(ent);
    localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
    localStorage.setItem('mjyy_current_enterprise_id', ent.id);
    window.location.reload();
  }
  function renderEnterpriseSwitchList(containerId) {
    var current = getCurrentEnterprise();
    var currentId = localStorage.getItem('mjyy_current_enterprise_id');
    var list = ensureEnterprises();
    var lastUsedId = localStorage.getItem('mjyy_last_enterprise_id');
    list = list.slice().sort(function(a, b) {
      function score(e) {
        var s = 0;
        if (lastUsedId && e.id === lastUsedId) s += 10;
        if (currentId && e.id === currentId) s += 5;
        if (e.isDefault) s += 2;
        return s;
      }
      return score(b) - score(a);
    });
    var html = '';
    list.forEach(function(ent) {
      var active = (currentId && ent.id === currentId) ? ' active' : '';
      var firstChar = ent.name ? ent.name.charAt(0) : '企';
      // 只有当存在 currentId 且匹配时才显示"当前登录"
      var currentTag = (currentId && ent.id === currentId) ? '<span class="enterprise-current-badge">当前登录</span>' : '';
      html += '<div class="enterprise-switch-item' + active + '" data-global-enterprise-id="' + ent.id + '">' +
        '<div class="enterprise-switch-icon">' + firstChar + '</div>' +
        '<div class="enterprise-switch-info">' +
        '<div class="enterprise-switch-name-row"><span class="enterprise-switch-name">' + ent.name + '</span></div>' +
        '<div class="enterprise-switch-role">' + (ent.role || '主账号管理员') + (ent.isDefault ? ' · 默认企业' : '') + '</div>' +
        '</div>' + currentTag + '</div>';
    });
    var c = document.getElementById(containerId);
    if (c) {
      c.innerHTML = html;
      // 检查是否需要滚动（超过容器高度时显示渐隐效果）
      // 使用多次检查确保弹窗完全渲染后再计算
      var checkScroll = function() {
        if (c.scrollHeight > c.clientHeight + 10) {
          c.classList.add('has-more');
        } else {
          c.classList.remove('has-more');
        }
      };
      requestAnimationFrame(function() {
        setTimeout(checkScroll, 100);
      });
      setTimeout(checkScroll, 300); // 备用检查
    }
    document.querySelectorAll('#' + containerId + ' .enterprise-switch-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.getAttribute('data-global-enterprise-id');
        switchEnterprise(id);
      });
    });
  }

  function getGlobalUserDropdownHTML() {
    var current = getCurrentEnterprise();
    return `
      <div class="topbar-avatar" id="topbarAvatar">企</div>
      <div class="topbar-user-meta" id="topbarUserMeta">
        <span class="topbar-user-name-row">
          <span class="topbar-user-name" id="topbarUserName">企业用户</span>
          <span class="topbar-account-badge" id="topbarAccountBadge" style="display:none;">主账号</span>
        </span>
        <div class="topbar-user-chips" id="topbarUserChips"></div>
      </div>
      <svg class="topbar-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>
      <div class="user-dropdown" id="userDropdown">
        <div class="user-dropdown-header">
          <div class="user-dropdown-avatar" id="dropdownAvatar">企</div>
          <div class="user-dropdown-info">
            <div class="user-dropdown-name" id="dropdownName">用户</div>
            <!-- 认证通过后才显示：脱敏的统一社会信用代码 + 主账号标签；未认证/新企业不显示 -->
            <div class="user-dropdown-id" id="dropdownId" style="display:none;">--</div>
            <div class="user-dropdown-tags-row" id="dropdownMetaRow" style="display:none;">
              <span class="user-account-badge" id="dropdownBadge">主账号</span>
            </div>
          </div>
        </div>
        <div class="user-dropdown-enter-bar">
          <a href="account-center.html" class="user-dropdown-enter-console" id="dropdownEnterConsole">
            <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            进入控制台
            <svg viewBox="0 0 24 24" fill="none" width="13" height="13"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
        </div>
        <div class="user-dropdown-body">
          <div class="user-dropdown-section">
            <div class="user-dropdown-section-title">我的企业</div>
            <div class="user-dropdown-enterprise-list" id="globalEnterpriseList"><!-- 动态渲染 --></div>
          </div>
          <div class="user-dropdown-actions">
            <a href="javascript:;" class="user-dropdown-action" id="globalAddNewEnterprise">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>添加新企业</span>
            </a>
            <a href="account-security.html" class="user-dropdown-action">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>
              <span>账号安全</span>
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
    // 如果页面使用新版 topbar+#topbarUser 结构（如首页），而不是旧的 navRight 内容容器：
    //   - 未登录时，在 topbar-right 中添加「登录平台」按钮
    //   - 已登录时，直接交给 renderGlobalUserDropdowns() 处理，保持与控制台一致
    var topbarUser = document.getElementById('topbarUser');
    var topbarRight = topbarUser ? topbarUser.parentElement : null;

    if (topbarRight) {
      // 检查是否已经插入过登录按钮
      if (!topbarRight.querySelector('#navLogin') && !isLoggedIn) {
        var loginA = document.createElement('a');
        loginA.id = 'navLogin';
        loginA.href = 'login.html';
        loginA.className = 'btn btn-primary';
        loginA.textContent = '登录平台';
        loginA.style.cssText = 'padding:6px 16px;border-radius:6px;background:var(--brand-primary);color:#fff;font-size:13px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none;flex-shrink:0;white-space:nowrap;line-height:1.4;display:inline-flex;align-items:center;justify-content:center;margin-left:12px;';
        loginA.addEventListener('mouseenter', function(){ this.style.background = 'var(--brand-primary-dark)'; });
        loginA.addEventListener('mouseleave', function(){ this.style.background = 'var(--brand-primary)'; });
        topbarRight.appendChild(loginA);
      }
      if (topbarUser) {
        if (window.SKIP_TOPBAR_DISPLAY_NONE) {
          // verify.html / account-*.html 即使未登录也必须保留右上角区域（有"登录平台"按钮占位），
          // 绝对不能设为 display:none，否则整个右上角变成空白 → 用户感觉"点不动"
          topbarUser.style.display = 'flex';
          if (!isLoggedIn && !topbarUser.children.length && !topbarUser.querySelector('a,button')) {
            topbarUser.innerHTML = '<a href="login.html" class="topbar-login-btn" style="display:inline-flex;align-items:center;padding:6px 16px;border-radius:6px;background:var(--brand-primary);color:#fff;font-size:13px;font-weight:500;text-decoration:none;white-space:nowrap;">登录平台</a>';
          }
        } else {
          topbarUser.style.display = isLoggedIn ? 'flex' : 'none';
        }
      }
      var msg = document.getElementById('topbarMessage');
      if (msg) {
        if (window.SKIP_TOPBAR_DISPLAY_NONE) {
          // 认证/控制台页面：消息图标一直显示（哪怕未登录，有个空的消息面板也不错）
          msg.style.display = 'flex';
        } else {
          msg.style.display = isLoggedIn ? 'flex' : 'none';
        }
      }
      // 旧 navRight 标记为已渲染但不做任何事情
      var navRight = document.getElementById('navRight');
      if (navRight) navRight.dataset.rendered = 'true';
      // 处理 enterSystem 按钮
      var enterSystemBtn = document.getElementById('navEnterSystem');
      if (enterSystemBtn) {
        enterSystemBtn.addEventListener('click', enterSystem);
      }
      return;
    }

    // ============= 以下为旧版 navRight 结构（非首页、非控制台页面） =============
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
        <svg class="user-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>
        <div class="user-dropdown" id="userDropdown">
          <div class="user-dropdown-header">
            <div class="user-dropdown-avatar" id="dropdownAvatar">用</div>
            <div class="user-dropdown-info">
              <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;">
                <div class="user-dropdown-name" id="dropdownName">企业用户</div>
                <span class="user-account-badge" id="dropdownBadge" style="font-size:10px;padding:0 5px;border-radius:4px;background:var(--brand-primary-50);color:var(--brand-primary);font-weight:500;line-height:16px;">主账号</span>
              </div>
              <div class="user-dropdown-id" id="dropdownId">账号ID：--</div>
            </div>
          </div>
          <div class="user-dropdown-body">
            <div class="user-dropdown-group">
              <div class="user-dropdown-group-title">我的企业</div>
              <div class="user-dropdown-enterprise-list" id="navEnterpriseList"><!-- 动态渲染 --></div>
              <a href="javascript:;" class="user-dropdown-item" id="navAddNewEnterprise">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                添加新企业
              </a>
              <a href="account-security.html" class="user-dropdown-item">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>
                账号安全
              </a>
            </div>
            <div class="user-dropdown-divider"></div>
            <div class="user-dropdown-group">
              <div class="user-dropdown-group-title">进入控制台</div>
              <a href="account-center.html" class="user-dropdown-item user-dropdown-item-primary">
                <svg viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2"/></svg>
                控制台首页
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
    // 使用replace避免退出后通过浏览器后退返回已登录状态的页面
    window.location.replace('login.html');
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

    var currentEnt = null;
    try { currentEnt = getCurrentEnterprise(); } catch(e) {}
    var hasRealEnterprise = !!(currentEnt && currentEnt.name && currentEnt.name !== '我的企业' && currentEnt.name !== '新企业（未认证）');
    var hasVerifiedEnterprise = !!(identityVerified && (currentEnt && (currentEnt.verified || currentEnt.creditCode)));
    function getCreditCode() {
      if (currentEnt && currentEnt.creditCode) return currentEnt.creditCode;
      return enterpriseData.creditCode || enterpriseData.credit_code || enterpriseData.uscc || '';
    }

    var displayName = '';
    var userPhone = userData.phone || userData.mobile || '';
    if (!identityVerified && userPhone) displayName = maskMobile(userPhone);
    else if (hasRealEnterprise) displayName = currentEnt.name;
    else if (identityVerified && currentEnt && currentEnt.name && currentEnt.name !== '我的企业') displayName = currentEnt.name;
    else if (identityVerified && enterpriseData.companyName) displayName = enterpriseData.companyName;
    else if (identityVerified && personalData.realName) displayName = personalData.realName;
    else if (!identityVerified && userPhone) displayName = maskMobile(userPhone);
    else if (userData.name && userData.name !== '微信用户') displayName = userData.name;
    else displayName = '企业用户';

    var displayAvatar = displayName ? displayName.charAt(0) : '企';
    var typeText = accountType === 'sub' ? '子账号' : '主账号';

    document.querySelectorAll('.topbar-avatar, .user-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.topbar-name, .user-name').forEach(function(el) { if (displayName) el.textContent = displayName; });
    document.querySelectorAll('#topbarUserName, .topbar-user-name').forEach(function(el) { el.textContent = displayName; });

    document.querySelectorAll('.user-dropdown-avatar, .topbar-dropdown-avatar, .dropdown-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.user-dropdown-name, .topbar-dropdown-name, .dropdown-name').forEach(function(el) { if (displayName) el.textContent = displayName; });

    // 4. 企业ID→统一社会信用代码；未认证/新企业去除 统一社会信用代码/主账号/工商识别号
    var creditCode = getCreditCode();
    var dropdownIdEls = document.querySelectorAll('.user-dropdown-id, .topbar-dropdown-id, .dropdown-id');
    dropdownIdEls.forEach(function(el) {
      if (hasVerifiedEnterprise && creditCode) {
        el.style.display = '';
        el.textContent = creditCode;
      } else {
        el.style.display = 'none';
        el.textContent = '';
      }
    });
    var rows = document.querySelectorAll('#dropdownMetaRow, .user-dropdown-tags-row');
    rows.forEach(function(row) {
      if (!hasVerifiedEnterprise) { row.style.display = 'none'; return; }
      row.style.display = 'flex';
      row.style.flexWrap = 'wrap';
      row.style.alignItems = 'center';
      row.style.gap = '6px';
      row.querySelectorAll('.bizRegNo, .gs-reg-no, .drop-down-gszbh, [data-field="gszsbh"], [data-field="businessRegistrationNumber"], .businessReg, .user-dropdown-business-no').forEach(function(el){ el.style.display='none'; });
    });
    var topbarBadge = document.getElementById('topbarAccountBadge');
    if (topbarBadge) {
      if (!hasVerifiedEnterprise) { topbarBadge.style.display = 'none'; }
      else {
        topbarBadge.style.display = '';
        topbarBadge.textContent = typeText;
        topbarBadge.style.cssText = '';
      }
    }
    var allBadges = document.querySelectorAll('.user-account-badge, .topbar-account-badge');
    allBadges.forEach(function(el) {
      if (el.id === 'topbarAccountBadge') return;
      if (!hasVerifiedEnterprise) { el.style.display = 'none'; return; }
      el.style.display = '';
      el.textContent = typeText;
      el.classList.toggle('sub', accountType === 'sub');
      if (accountType === 'sub') { el.style.background = '#FFF7E6'; el.style.color = '#FF7D00'; }
      else { el.style.background = ''; el.style.color = ''; }
    });

    // 更新实名认证链接文字
    document.querySelectorAll('#globalVerifyText, #verifyLinkText').forEach(function(el) {
      el.textContent = identityVerified ? '去完善资料' : '去实名认证';
    });
    document.querySelectorAll('#globalVerifyLink, #verifyLink').forEach(function(el) {
      el.href = 'verify.html';
    });

    var crumbName = '';
    if (hasRealEnterprise) crumbName = currentEnt.name;
    else if (enterpriseData.companyName) crumbName = enterpriseData.companyName;
    else if (personalData.realName) crumbName = personalData.realName + '（个人企业）';
    else crumbName = '我的企业';
    document.querySelectorAll('#topbarEnterpriseName, .topbar-enterprise-name, .crumb-enterprise-name').forEach(function(el) {
      if (crumbName) el.textContent = crumbName;
    });

    var chipsContainer = document.getElementById('topbarUserChips');
    if (chipsContainer) {
      chipsContainer.innerHTML = '';
      var chips = [];
      if (identityVerified && currentEnt && currentEnt.isDefault) {
        chips.push({ cls: 'default', text: '默认企业' });
      }
      chips.forEach(function(c) {
        var s = document.createElement('span');
        s.className = 'topbar-user-chip ' + c.cls;
        s.textContent = c.text;
        chipsContainer.appendChild(s);
      });
    }
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
    // ============= 新结构：页面上有 #topbarUser（首页/控制台/认证页等统一结构） =============
    var topbarUser = document.getElementById('topbarUser');
    if (topbarUser) {
      // verify / account 等 SKIP_TOPBAR_DISPLAY_NONE 页面：**永远不 display:none**（哪怕未登录）
      //   未登录时 fallback 一个"登录平台"按钮确保点击区域存在
      if (window.SKIP_TOPBAR_DISPLAY_NONE) {
        topbarUser.style.display = 'flex';
        topbarUser.style.visibility = 'visible';
        if (!isLoggedIn && !topbarUser.children.length && !topbarUser.querySelector('a,button')) {
          topbarUser.innerHTML = '<a href="login.html" class="topbar-login-btn" style="display:inline-flex;align-items:center;padding:6px 16px;border-radius:6px;background:var(--brand-primary);color:#fff;font-size:13px;font-weight:500;text-decoration:none;white-space:nowrap;">登录平台</a>';
        }
      } else {
        topbarUser.style.display = isLoggedIn ? 'flex' : 'none';
      }
      var msg = document.getElementById('topbarMessage');
      if (msg) {
        if (window.SKIP_TOPBAR_DISPLAY_NONE) {
          msg.style.display = 'flex';
          msg.style.visibility = 'visible';
        } else {
          msg.style.display = isLoggedIn ? 'flex' : 'none';
        }
      }
      // 登录按钮（旧结构的 #navLogin 只有首页等产品页才用）
      var topbarRight = topbarUser.parentElement;
      if (topbarRight && !window.SKIP_TOPBAR_DISPLAY_NONE) {
        var navLogin = topbarRight.querySelector('#navLogin');
        if (!navLogin && !isLoggedIn) {
          // 如果未登录但没有按钮，补上（renderNavRight 未执行到时的兜底）
          var loginA = document.createElement('a');
          loginA.id = 'navLogin';
          loginA.href = 'login.html';
          loginA.textContent = '登录平台';
          loginA.style.cssText = 'padding:6px 16px;border-radius:6px;background:var(--brand-primary);color:#fff;font-size:13px;font-weight:500;text-decoration:none;cursor:pointer;transition:all 0.2s;border:none;flex-shrink:0;white-space:nowrap;line-height:1.4;display:inline-flex;align-items:center;justify-content:center;margin-left:12px;';
          topbarRight.appendChild(loginA);
        }
        if (navLogin) navLogin.style.display = isLoggedIn ? 'none' : 'inline-flex';
      }
    } else {
      // ============= 旧结构：loginBtn / userArea =============
      if (loginBtn) {
        if (isLoggedIn) {
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
    }

    var navEnterSystem = document.getElementById('navEnterSystem');
    if (navEnterSystem) {
      var path = window.location.pathname;
      var fileName = path.substring(path.lastIndexOf('/') + 1);
      var isEntryPage = fileName === 'index.html' || fileName === '';
      // 控制台页面（account-*.html / verify.html）一律不显示"进入系统"按钮
      var isConsolePage = fileName.indexOf('account-') === 0 || fileName === 'verify.html';
      navEnterSystem.style.display = (isLoggedIn && !isEntryPage && !isConsolePage) ? 'inline-flex' : 'none';
    }

    if (isLoggedIn) {
      ensureEnterprises();
      // 企业列表渲染移到 renderGlobalUserDropdowns 之后执行
      // 此处仅绑定事件
      // 点击「添加新企业」→ 创建新企业条目，切换为未认证状态，跳转认证流程
      function goAddNewEnterprise(e) {
        e.stopPropagation();
        e.preventDefault();
        // 1. 切换为未认证状态，清空当前企业，不再标记任何企业为"当前登录"
        localStorage.setItem('mjyy_identity_verified', 'false');
        localStorage.setItem('mjyy_auth_type', 'enterprise');
        localStorage.removeItem('mjyy_enterprise_data');
        localStorage.removeItem('mjyy_verify_complete');
        localStorage.removeItem('mjyy_current_enterprise_id');
        localStorage.removeItem('mjyy_last_enterprise_id');
        localStorage.setItem('mjyy_from_add_enterprise', 'true');
        localStorage.setItem('mjyy_verify_step', '1');
        localStorage.setItem('mjyy_verify_target', localStorage.getItem('mjyy_from_platform') || 'minjiang');
        // 切换当前用户为手机号显示
        var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
        var userPhone = userData.phone || userData.mobile || '';
        if (userPhone) {
          localStorage.setItem('mjyy_current_phone', userPhone);
        }
        // 刷新全局下拉卡片
        refreshGlobalDropdownCard();
        window.location.href = 'verify.html';
      }
      var addNav = document.getElementById('navAddNewEnterprise');
      if (addNav && !addNav.dataset.addBound) {
        addNav.addEventListener('click', goAddNewEnterprise);
        addNav.dataset.addBound = 'true';
      }
      var addGlobal = document.getElementById('globalAddNewEnterprise');
      if (addGlobal && !addGlobal.dataset.addBound) {
        addGlobal.addEventListener('click', goAddNewEnterprise);
        addGlobal.dataset.addBound = 'true';
      }
      updateUserInfo();
      updateCertInfo();
      updateProductButtons();
    }
  }

  function updateProductButtons() {
    var productBtns = document.querySelectorAll('.product-select-btn[data-platform]');
    productBtns.forEach(function(btn) {
      btn.textContent = '了解产品';
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

    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    var contractSigned = localStorage.getItem('mjyy_contract_signed_' + platform) === 'true';
    if (identityVerified && contractSigned) {
      window.location.href = targetPage;
    } else if (identityVerified && !contractSigned) {
      // 已认证但未签约该平台，跳转合同签约
      localStorage.setItem('mjyy_verify_target', platform);
      window.location.href = 'contract-sign.html?platform=' + platform;
    } else {
      // 未认证，跳转认证流程
      localStorage.setItem('mjyy_verify_target', platform);
      window.location.href = 'verify.html';
    }
  }

  function enterSystem(e) {
    e.preventDefault();
    // 进入系统：统一进入控制台页面
    var isVerified = localStorage.getItem('mjyy_identity_verified') === 'true'
      || localStorage.getItem('mjyy_verify_complete') === 'true';
    if (isVerified) {
      window.location.href = 'account-center.html';
    } else {
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
    var topbarBadgeEl = userArea.querySelector('#topbarAccountBadge');
    var dropdownAvatarEl = userDropdown ? userDropdown.querySelector('.user-dropdown-avatar') : null;
    var dropdownNameEl = userDropdown ? userDropdown.querySelector('.user-dropdown-name') : null;
    var dropdownIdEl = userDropdown ? userDropdown.querySelector('.user-dropdown-id') : null;
    var dropdownBadgeEl = userDropdown ? userDropdown.querySelector('.user-dropdown-info .user-account-badge') : null;

    var displayName = '';
    var displayAvatar = '用';
    var curEnt = null;
    try { curEnt = getCurrentEnterprise(); } catch(e) {}

    if (curEnt && curEnt.name && curEnt.name !== '我的企业') {
      displayName = curEnt.name;
      displayAvatar = curEnt.name.charAt(0);
    } else if (enterpriseData.companyName) {
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
    if (topbarBadgeEl) {
      topbarBadgeEl.textContent = typeText;
      topbarBadgeEl.classList.toggle('sub', accountType === 'sub');
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

  }

  function initTopbarUserInfo() {
    refreshGlobalDropdownCard();

    // 更新实名认证链接文字
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    document.querySelectorAll('#globalVerifyText, #verifyLinkText').forEach(function(el) {
      el.textContent = identityVerified ? '去完善资料' : '去实名认证';
    });
    document.querySelectorAll('#globalVerifyLink, #verifyLink').forEach(function(el) {
      el.href = 'verify.html';
    });
  }

  function updateCertInfo() {
  }

  checkLoginStatus();
  renderGlobalUserDropdowns();
  // 渲染企业切换列表（在动态HTML创建完成后）
  if (isLoggedIn) {
    ensureEnterprises();
    if (document.getElementById('navEnterpriseList')) renderEnterpriseSwitchList('navEnterpriseList');
    if (document.getElementById('globalEnterpriseList')) renderEnterpriseSwitchList('globalEnterpriseList');
    if (document.getElementById('enterpriseList')) renderEnterpriseSwitchList('enterpriseList');
  }
  initTopbarUserInfo();

  // 检查未认证状态，弹出提醒
  function checkAuthAndPrompt() {
    if (!isLoggedIn) return;
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    // 当前已在认证页面则不弹窗
    var currentPage = window.location.pathname.split('/').pop();
    if (currentPage === 'verify.html' || currentPage === '') return;

    if (!identityVerified) {
      // 检查是否已经显示过（避免重复弹窗）
      var lastPromptTime = localStorage.getItem('mjyy_auth_prompt_time');
      var now = Date.now();
      // 30分钟内不重复弹窗
      if (lastPromptTime && (now - parseInt(lastPromptTime)) < 30 * 60 * 1000) return;

      localStorage.setItem('mjyy_auth_prompt_time', now.toString());

      // 创建弹窗HTML
      var modalHtml = '<div class="auth-prompt-modal" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;">' +
        '<div style="background:#fff;border-radius:12px;padding:32px;max-width:400px;width:90%;box-shadow:0 8px 32px rgba(0,0,0,0.15);">' +
        '<div style="text-align:center;margin-bottom:24px;">' +
        '<div style="width:64px;height:64px;background:#FFF7E6;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">' +
        '<svg viewBox="0 0 24 24" width="32" height="32" fill="none"><path d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#FF7D00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<h3 style="margin:0 0 8px;font-size:18px;color:#1F2329;">完成企业认证</h3>' +
        '<p style="margin:0;color:#86909C;font-size:14px;line-height:1.5;">您尚未完成企业认证，请先完成认证以使用完整功能。</p>' +
        '</div>' +
        '<div style="display:flex;gap:12px;">' +
        '<button id="authPromptLater" style="flex:1;padding:12px;border:1px solid #E5E6EB;border-radius:8px;background:#fff;color:#4E5969;font-size:14px;cursor:pointer;">稍后再说</button>' +
        '<button id="authPromptGo" style="flex:1;padding:12px;border:none;border-radius:8px;background:#165DFF;color:#fff;font-size:14px;cursor:pointer;font-weight:500;">去认证</button>' +
        '</div>' +
        '</div>' +
        '</div>';

      var tempDiv = document.createElement('div');
      tempDiv.innerHTML = modalHtml;
      var modal = tempDiv.firstChild;
      document.body.appendChild(modal);

      // 绑定按钮事件
      modal.querySelector('#authPromptLater').addEventListener('click', function() {
        modal.remove();
      });
      modal.querySelector('#authPromptGo').addEventListener('click', function() {
        modal.remove();
        localStorage.setItem('mjyy_verify_step', '1');
        window.location.href = 'verify.html';
      });
      // 点击遮罩关闭
      modal.addEventListener('click', function(e) {
        if (e.target === modal) modal.remove();
      });
    }
  }
  checkAuthAndPrompt();

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
    // 全局兜底：点击「添加新企业」跳转到新的企业认证流程（步骤1）
    var addEntBtn = e.target.closest('#navAddNewEnterprise, #globalAddNewEnterprise');
    if (!addEntBtn) {
      var item = e.target.closest('.user-dropdown-item');
      if (item && /添加新企业/.test(item.textContent || '')) addEntBtn = item;
    }
    if (addEntBtn) {
      e.preventDefault();
      e.stopPropagation();
      // 切换为未认证状态，显示手机号
      localStorage.setItem('mjyy_identity_verified', 'false');
      localStorage.setItem('mjyy_auth_type', 'enterprise');
      localStorage.removeItem('mjyy_enterprise_data');
      localStorage.removeItem('mjyy_verify_complete');
      localStorage.removeItem('mjyy_current_enterprise_id');
      localStorage.setItem('mjyy_from_add_enterprise', 'true');
      localStorage.setItem('mjyy_verify_step', '1');
      localStorage.setItem('mjyy_verify_target', localStorage.getItem('mjyy_from_platform') || 'minjiang');
      // 切换当前用户为手机号显示
      var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
      var userPhone = userData.phone || userData.mobile || '';
      if (userPhone) {
        localStorage.setItem('mjyy_current_phone', userPhone);
      }
      window.location.href = 'verify.html';
    }

    // 全局兜底：点击「切换企业」打开切换面板或弹窗
    var switchEntBtn = e.target.closest('#globalSwitchEnterprise, #switchEnterpriseAction');
    if (!switchEntBtn) {
      var item2 = e.target.closest('.user-dropdown-item');
      if (item2 && /切换企业/.test(item2.textContent || '')) switchEntBtn = item2;
    }
    if (switchEntBtn) {
      e.preventDefault();
      e.stopPropagation();
      // 检查是否有切换面板
      var switchModal = document.getElementById('switchModal');
      if (switchModal) {
        switchModal.style.display = 'flex';
      } else {
        // 没有面板则跳转到账号中心的切换标签页
        window.location.href = 'account-center.html?tab=enterprise';
      }
    }
  });

    // =====================================================================
    // 🌟 全局唯一的 顶部栏 下拉交互总控（topbar-user + topbar-message）
    //   —— 所有页面（verify / account-center / account-realname / index 等）
    //      不再在页面内联脚本中注册任何 document 级 click 委托，
    //      统一由此处"单点控制"，彻底杜绝"两次 toggle 互相抵消=点不动"。
    // =====================================================================
    document.addEventListener('click', function(e) {
      // ---- 1) 点击了消息按钮区域：只处理消息下拉开合（交给消息模块自身），先把账号下拉关了 ----
      var msgWrap = e.target.closest('.topbar-message');
      if (msgWrap) {
        document.querySelectorAll('.topbar-user.active').forEach(function(d) { d.classList.remove('active'); });
        return;  // 消息模块的局部监听器会自行处理 .open 切换
      }

      // ---- 2) 点击了账号卡片区域（触发器 or 下拉内操作项） ----
      var topbarUser = e.target.closest('.topbar-user');
      if (topbarUser) {
        // 2a) 点在"下拉内的操作项"（链接/按钮/企业条目）→ 关闭下拉，不阻断事件继续冒泡
        var innerAction = e.target.closest('.user-dropdown a, .user-dropdown button, .user-dropdown-item, .user-dropdown-action, .enterprise-switch-item');
        if (innerAction) {
          topbarUser.classList.remove('active');
          return;  // 不 stopPropagation，让 goAddNewEnterprise / switchEnterprise 等全局兜底继续生效
        }
        // 2b) 点在"触发器"（头像/姓名/箭头）→ 切换下拉展开
        e.stopPropagation();  // 阻止冒泡到后面的"外部关闭"分支
        var wasActive = topbarUser.classList.contains('active');
        // 先关掉其他已打开的账号卡片（保证同一时刻只开一个）
        document.querySelectorAll('.topbar-user.active').forEach(function(d) {
          if (d !== topbarUser) d.classList.remove('active');
        });
        if (wasActive) {
          topbarUser.classList.remove('active');
        } else {
          topbarUser.classList.add('active');
          // 展开后：检查企业列表是否需要滚动提示（has-more）
          var entList = topbarUser.querySelector('.user-dropdown-enterprise-list');
          if (entList && typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(function() {
              if (entList.scrollHeight > entList.clientHeight + 10) entList.classList.add('has-more');
              else entList.classList.remove('has-more');
            });
          }
        }
        // 同时关闭消息面板
        document.querySelectorAll('.topbar-message.open').forEach(function(m) { m.classList.remove('open'); });
        return;
      }

      // ---- 3) 点击了外部区域：关闭所有打开的账号下拉 + 消息下拉 ----
      document.querySelectorAll('.topbar-user.active').forEach(function(d) { d.classList.remove('active'); });
      document.querySelectorAll('.topbar-message.open').forEach(function(m) { m.classList.remove('open'); });
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

  // Navbar / Topbar 滚动效果（兼容新旧两种 id）
  const navbar = document.getElementById('navbar') || document.getElementById('topbar');
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

  // ===========================================================================
  // 暴露到全局作用域（跨 IIFE / 内联脚本 调用需要）
  // 重要：必须放在 第一个 IIFE 结束之前，否则闭包外访问不到 → ReferenceError
  // ===========================================================================
  window.renderGlobalUserDropdowns   = renderGlobalUserDropdowns;
  window.getGlobalUserDropdownHTML   = getGlobalUserDropdownHTML;
  window.renderEnterpriseSwitchList  = renderEnterpriseSwitchList;
  window.initTopbarUserInfo          = initTopbarUserInfo;
  window.refreshGlobalDropdownCard   = refreshGlobalDropdownCard;
  window.ensureEnterprises           = ensureEnterprises;
  window.switchEnterprise            = switchEnterprise;
  window.checkLoginStatus            = checkLoginStatus;
  // 若外部需要调用 goAddNewEnterprise，使用全局点击委托触发 #globalAddNewEnterprise 点击即可
})();

function refreshGlobalDropdownCardExternal() {
  try { return window.refreshGlobalDropdownCard(); } catch(e) {}
}

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

  // ===== 消息通知面板 =====
  // 默认消息数据
  var DEFAULT_MESSAGES = [
    { id: 'msg_001', type: 'order', icon: '📋', title: '企业审核通过', desc: '您提交的"浙江良巧匠"企业认证已通过审核', time: '10分钟前', timestamp: Date.now() - 600000, unread: true,
      content: '<p>恭喜您！您提交的"浙江良巧匠网络科技有限公司"企业认证已通过审核。</p><p>认证通过后您可以：</p><ul><li>开通民匠有约、安心云等产品服务</li><li>创建子账号并分配角色权限</li><li>签订电子合同</li></ul><p>如有疑问，请联系客服热线 400-888-8888。</p>' },
    { id: 'msg_002', type: 'system', icon: '🔔', title: '系统维护通知', desc: '平台将于本周六凌晨2-4点进行系统升级维护', time: '1小时前', timestamp: Date.now() - 3600000, unread: true,
      content: '<p>尊敬的用户：</p><p>为了提供更好的服务体验，平台将于本周六（8月24日）凌晨 2:00 - 4:00 进行系统升级维护。</p><p>维护期间以下功能可能受影响：</p><ul><li>登录及账号操作</li><li>订单提交与查询</li><li>合同签署</li></ul><p>维护完成后将自动恢复服务，无需额外操作。</p>' },
    { id: 'msg_003', type: 'promo', icon: '🎁', title: '新企业权益礼包', desc: '新企业认证完成，赠送3个月会员权益', time: '今天 09:00', timestamp: Date.now() - 43200000, unread: true,
      content: '<p>恭喜完成企业认证！</p><p>为您赠送 <strong>3个月高级会员权益</strong>，包含：</p><ul><li>✅ 专属客户经理1对1服务</li><li>✅ 企业认证优先审核通道</li><li>✅ 每月免费发单额度提升至50单</li><li>✅ 电子合同签署不限次数</li></ul><p>权益有效期：3个月（自领取之日起计算）</p>' },
    { id: 'msg_004', type: 'warn', icon: '⚠️', title: '账号安全提醒', desc: '检测到您的账号在新设备登录，如非本人操作请及时修改密码', time: '昨天', timestamp: Date.now() - 86400000, unread: false,
      content: '<p>我们检测到您的账号在新设备上登录：</p><div style="background:#FFF7E8;padding:12px 16px;border-radius:8px;margin:12px 0;"><p><strong>登录设备：</strong>Windows PC - Chrome浏览器</p><p><strong>登录IP：</strong>123.125.71.38（北京）</p><p><strong>登录时间：</strong>2026-08-20 14:32:15</p></div><p>如非本人操作，请立即修改密码并联系平台客服。</p>' },
    { id: 'msg_005', type: 'order', icon: '✅', title: '合同签署完成', desc: '您与民匠有约的服务合同已签署完成', time: '2天前', timestamp: Date.now() - 172800000, unread: false,
      content: '<p>您的服务合同已签署完成。</p><div style="background:var(--gray-50);padding:12px 16px;border-radius:8px;margin:12px 0;"><p><strong>合同编号：</strong>MJYY-HT-20260819001</p><p><strong>服务方：</strong>浙江良巧匠网络科技有限公司</p><p><strong>合同类型：</strong>灵活用工服务协议</p><p><strong>有效期至：</strong>2027-08-19</p></div><p>您可以前往合同管理查看完整合同内容并下载。</p>' },
    { id: 'msg_006', type: 'system', icon: '📢', title: '新功能上线', desc: '企业管理端全新上线，支持人员管理、考勤薪酬、流程审批等功能', time: '3天前', timestamp: Date.now() - 259200000, unread: false,
      content: '<p>企业管理端全新上线！</p><p>新增功能模块：</p><ul><li><strong>人员管理</strong> - 员工档案在线管理，支持批量导入</li><li><strong>考勤薪酬</strong> - 智能考勤核算，一键生成薪资单</li><li><strong>流程审批</strong> - 自定义审批流程，规范企业运营</li></ul><p>前往控制台立即体验。</p>' },
    { id: 'msg_007', type: 'promo', icon: '🎉', title: '邀请有奖活动', desc: '邀请企业好友入驻平台，双方均可获得现金奖励', time: '5天前', timestamp: Date.now() - 432000000, unread: false,
      content: '<p>邀请有奖，多邀多得！</p><p>活动规则：</p><ul><li>邀请1家企业入驻，双方各获得 <strong>100元</strong> 现金奖励</li><li>累计邀请5家，额外获得 <strong>500元</strong> 奖励</li><li>累计邀请20家，额外获得 <strong>2000元</strong> 奖励 + VIP会员3个月</li></ul><p>活动时间：2026年8月1日 - 2026年9月30日</p>' },
    { id: 'msg_008', type: 'warn', icon: '🔒', title: '密码即将过期', desc: '您的账号密码将在7天后过期，为保障安全请及时修改密码', time: '1周前', timestamp: Date.now() - 604800000, unread: false,
      content: '<p>您的账号密码将在 <strong>7天</strong> 后过期。</p><p>为保障账号安全，建议您及时修改密码。</p><p>密码安全建议：</p><ul><li>使用8-20位字符，包含大小写字母、数字和特殊符号</li><li>不要使用与其他网站相同的密码</li><li>定期更换密码（建议每3个月一次）</li></ul>' }
  ];

  function getMessages() {
    var stored = localStorage.getItem('mjyy_messages');
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    localStorage.setItem('mjyy_messages', JSON.stringify(DEFAULT_MESSAGES));
    return DEFAULT_MESSAGES;
  }

  function saveMessages(msgs) {
    localStorage.setItem('mjyy_messages', JSON.stringify(msgs));
  }

  function initMessagePanel() {
    var msgBtn = document.getElementById('topbarMessage');
    if (!msgBtn || msgBtn.dataset.init === 'true') return;
    msgBtn.dataset.init = 'true';

    function renderList() {
      var list = document.getElementById('messageList');
      if (!list) return;
      var messages = getMessages();
      // 按时间倒序，取前5条
      var sorted = messages.slice().sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); }).slice(0, 5);

      if (sorted.length === 0) {
        list.innerHTML = '<div class="message-empty">暂无消息</div>';
      } else {
        var html = '';
        sorted.forEach(function(m) {
          html += '<div class="message-item' + (m.unread ? ' unread' : '') + '" data-msg-id="' + m.id + '">' +
            '<div class="message-item-icon ' + m.type + '">' + m.icon + '</div>' +
            '<div class="message-item-body">' +
            '<div class="message-item-title">' + m.title + '</div>' +
            '<div class="message-item-desc">' + m.desc + '</div>' +
            '</div>' +
            '<div class="message-item-time">' + m.time + '</div>' +
            '</div>';
        });
        list.innerHTML = html;
      }

      // 更新未读数
      var unread = messages.filter(function(m) { return m.unread; }).length;
      var badge = document.getElementById('topbarMessageBadge');
      var dot = document.getElementById('topbarMessageDot');
      var msgContainer = document.getElementById('topbarMessage');
      if (badge) {
        if (unread > 0) {
          badge.textContent = unread > 99 ? '99+' : unread;
          badge.style.display = 'inline-flex';
          if (msgContainer) msgContainer.classList.add('has-badge');
          if (dot) { dot.classList.remove('show'); }
        } else {
          badge.style.display = 'none';
          if (msgContainer) msgContainer.classList.remove('has-badge');
          if (dot) { dot.classList.remove('show'); }
        }
      } else if (dot) {
        if (unread > 0) { dot.classList.add('show'); }
        else { dot.classList.remove('show'); }
      }
    }

    // 点击消息按钮区域（含下拉内交互）
    msgBtn.addEventListener('click', function(e) {
      // 点击消息项 → 标记已读 + 跳转详情页
      var item = e.target.closest('.message-item');
      if (item) {
        e.stopPropagation();
        var msgId = item.getAttribute('data-msg-id');
        if (msgId) {
          var messages = getMessages();
          var msg = messages.find(function(m) { return m.id === msgId; });
          if (msg && msg.unread) {
            msg.unread = false;
            saveMessages(messages);
          }
          window.location.href = 'message-detail.html?id=' + msgId;
        }
        return;
      }
      // 全部已读
      var clearBtn = e.target.closest('#msgClearAll');
      if (clearBtn) {
        e.preventDefault();
        e.stopPropagation();
        var messages = getMessages();
        messages.forEach(function(m) { m.unread = false; });
        saveMessages(messages);
        renderList();
        return;
      }
      // 查看全部消息 → 跳转消息中心
      var viewAll = e.target.closest('#msgViewAll');
      if (viewAll) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'account-message.html';
        return;
      }
      // 否则切换下拉开合（仅点击按钮本身时触发）
      e.stopPropagation();
      document.querySelectorAll('.topbar-user.open, .topbar-user.active').forEach(function(el) {
        el.classList.remove('open', 'active');
      });
      msgBtn.classList.toggle('open');
    });

    // 点击外部关闭
    document.addEventListener('click', function(e) {
      if (!msgBtn.contains(e.target)) {
        msgBtn.classList.remove('open');
      }
    });

    // ESC 关闭
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') msgBtn.classList.remove('open');
    });

    renderList();
  }

  initMessagePanel();
})();
