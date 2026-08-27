/**
 * 企业切换弹窗 — 共享逻辑
 * 供 account-center.html、verify.html、index.html 等页面使用
 */
(function(){
  'use strict';

  // ===== 状态 =====
  var switchEntSearchKeyword = '';
  var switchSubEntSearchKeyword = '';
  var switchEntData = null;
  var switchSubEntList = [];

  // ===== 基础工具 =====
  function openModal(id) { var el = document.getElementById(id); if (el) el.classList.add('open'); }
  function closeModal(id) { var el = document.getElementById(id); if (el) el.classList.remove('open'); }

  // ===== 动态创建弹窗（确保所有页面都有切换企业弹窗）=====
  function ensureModals() {
    if (document.getElementById('switchEntModal')) return;

    var mask1 = document.createElement('div');
    mask1.className = 'modal-mask';
    mask1.id = 'switchEntModal';
    mask1.innerHTML = '<div class="modal" style="max-width:520px;">' +
      '<div class="modal-header" style="border-bottom:none;padding:16px 20px 12px;">' +
        '<div style="display:flex;align-items:center;gap:8px;font-size:15px;font-weight:600;"><span>选择企业登录</span></div>' +
        '<div class="modal-close" onclick="window.closeSwitchEntModal()">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
        '</div>' +
      '</div>' +
      '<div class="modal-body" style="padding:0 20px 20px;">' +
        '<div style="position:relative;margin-bottom:14px;">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"></circle><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
          '<input type="text" id="switchEntSearch" placeholder="搜索企业名称" style="width:100%;padding:10px 12px 10px 36px;border:1px solid var(--border-color,#e5e5e5);border-radius:8px;font-size:13px;outline:none;transition:border-color 0.15s;" onfocus="this.style.borderColor=\'var(--brand-primary,#1677FF)\'" onblur="this.style.borderColor=\'var(--border-color,#e5e5e5)\'" oninput="window.handleSwitchEntSearch(this.value)">' +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">' +
          '<span id="switchEntCount" style="font-size:12px;color:var(--text-muted);"></span>' +
        '</div>' +
        '<div id="switchEntList" style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;"></div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(mask1);

    var mask2 = document.createElement('div');
    mask2.className = 'modal-mask';
    mask2.id = 'switchSubEntModal';
    mask2.innerHTML = '<div class="modal" style="max-width:480px;">' +
      '<div class="modal-header" style="border-bottom:none;padding:16px 20px 12px;">' +
        '<div style="display:flex;align-items:center;gap:10px;">' +
          '<div class="switch-sub-ent-back" onclick="window.backToEntList()" style="width:28px;height:28px;border-radius:6px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);transition:all 0.15s;" onmouseover="this.style.background=\'var(--gray-100,#f5f5f5)\'" onmouseout="this.style.background=\'transparent\'">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path></svg>' +
          '</div>' +
          '<div style="text-align:left;">' +
            '<div style="font-size:15px;font-weight:600;text-align:left;" id="switchSubEntTitle">选择子公司</div>' +
            '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;text-align:left;" id="switchSubEntSubtitle"></div>' +
          '</div>' +
        '</div>' +
        '<div class="modal-close" onclick="window.closeSubEntModal()">' +
          '<svg viewBox="0 0 24 24" width="18" height="18" fill="none"><path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
        '</div>' +
      '</div>' +
      '<div class="modal-body" style="padding:0 20px 20px;">' +
        '<div style="position:relative;margin-bottom:14px;">' +
          '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);"><circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"></circle><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path></svg>' +
          '<input type="text" id="switchSubEntSearch" placeholder="搜索子公司名称" style="width:100%;padding:10px 12px 10px 36px;border:1px solid var(--border-color,#e5e5e5);border-radius:8px;font-size:13px;outline:none;transition:border-color 0.15s;" onfocus="this.style.borderColor=\'var(--brand-primary,#1677FF)\'" onblur="this.style.borderColor=\'var(--border-color,#e5e5e5)\'" oninput="window.handleSwitchSubEntSearch(this.value)">' +
        '</div>' +
        '<div id="switchSubEntList" style="display:flex;flex-direction:column;gap:8px;max-height:360px;overflow-y:auto;"></div>' +
      '</div>' +
    '</div>';
    document.body.appendChild(mask2);
  }

  // ===== 企业数据管理 =====
  function buildDefaultEnterprise() {
    var enterpriseData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
    var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
    if (userData.name === '微信用户') {
      delete userData.name;
      localStorage.setItem('mjyy_user_data', JSON.stringify(userData));
    }
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    var authType = localStorage.getItem('mjyy_auth_type') || 'enterprise';
    var hasRealData = enterpriseData.companyName || enterpriseData.creditCode || enterpriseData.credit_code;
    var name, creditCode, legalMobile;
    if (hasRealData) {
      name = enterpriseData.companyName || '深圳星耀智造股份有限公司';
      creditCode = enterpriseData.creditCode || enterpriseData.credit_code || '91440300MA5D7Z9X1Y2';
      legalMobile = userData.phone || userData.mobile || '13900139000';
    } else {
      name = '深圳星耀智造股份有限公司';
      creditCode = '91440300MA5D7Z9X1Y2';
      legalMobile = '13900139000';
      enterpriseData.companyName = name;
      enterpriseData.creditCode = creditCode;
      localStorage.setItem('mjyy_enterprise_data', JSON.stringify(enterpriseData));
    }
    var id = 'ent_' + Date.now();
    var role = '主管理员';
    var verified = hasRealData || identityVerified;
    return {
      id: id,
      name: name,
      creditCode: creditCode,
      legalMobile: legalMobile,
      role: role,
      verified: verified,
      authType: authType,
      isDefault: true,
      parentId: null
    };
  }

  // ===== 默认子公司数据（与 account-project.html 保持一致）=====
  function ensureDefaultProjects() {
    var stored = localStorage.getItem('mjyy_projects');
    var defaultProjects = [
      { id:'PRJ-2026-001', product:'mjyy', name:'杭州地铁保洁子公司', owner:'小赵', phone:'17857069096',
        balance:28500, totalIn:50000, totalOut:21500, status:'active', createdAt:'2025-08-12 09:19:32',
        desc:'地铁1号线保洁服务', subs:['U002','U004'] },
      { id:'PRJ-2026-002', product:'mjyy', name:'阿里巴巴园区保洁', owner:'小李', phone:'13912345678',
        balance:18700, totalIn:30000, totalOut:11300, status:'active', createdAt:'2025-09-01 14:32:18',
        desc:'园区日常保洁', subs:['U003','U006','U007'] },
      { id:'PRJ-2026-003', product:'mjyy', name:'万达广场安保子公司', owner:'小王', phone:'13700123456',
        balance:0, totalIn:15000, totalOut:15000, status:'inactive', createdAt:'2025-10-15 10:08:45',
        desc:'安保服务外包', subs:[] },
      { id:'PRJ-2026-004', product:'mjyy', name:'西湖景区绿化子公司', owner:'小张', phone:'13612345678',
        balance:32000, totalIn:45000, totalOut:13000, status:'active', createdAt:'2025-11-01 08:45:12',
        desc:'景区园林绿化维护', subs:['U008','U009'] },
      { id:'PRJ-2026-005', product:'mjyy', name:'滨江商务中心子公司', owner:'小陈', phone:'13587654321',
        balance:25000, totalIn:40000, totalOut:15000, status:'active', createdAt:'2025-12-15 16:20:30',
        desc:'商务中心物业管理', subs:['U010','U011','U012'] },
      { id:'PRJ-2026-006', product:'mjyy', name:'钱江新城物业子公司', owner:'小刘', phone:'13500000001',
        balance:45000, totalIn:60000, totalOut:15000, status:'active', createdAt:'2026-01-10 10:30:00',
        desc:'钱江新城物业管理', subs:['U013','U014'] },
      { id:'PRJ-2026-007', product:'mjyy', name:'武林商圈安保子公司', owner:'小周', phone:'13500000002',
        balance:12000, totalIn:25000, totalOut:13000, status:'active', createdAt:'2026-02-05 14:20:00',
        desc:'武林商圈安保服务', subs:['U015'] },
      { id:'PRJ-2026-008', product:'mjyy', name:'萧山机场保洁子公司', owner:'小吴', phone:'13500000003',
        balance:38000, totalIn:50000, totalOut:12000, status:'active', createdAt:'2026-03-01 08:00:00',
        desc:'机场日常保洁', subs:['U016','U017','U018'] },
      { id:'PRJ-2026-009', product:'mjyy', name:'余杭未来科技城子公司', owner:'小郑', phone:'13500000004',
        balance:55000, totalIn:70000, totalOut:15000, status:'active', createdAt:'2026-04-15 16:00:00',
        desc:'科技城综合服务', subs:['U019','U020'] },
      { id:'PRJ-2026-010', product:'mjyy', name:'临平新城绿化子公司', owner:'小冯', phone:'13500000005',
        balance:22000, totalIn:30000, totalOut:8000, status:'active', createdAt:'2026-05-20 09:30:00',
        desc:'临平新城绿化维护', subs:['U021'] },
      { id:'PRJ-2026-011', product:'mjyy', name:'下沙经济开发区子公司', owner:'小何', phone:'13500000006',
        balance:48000, totalIn:65000, totalOut:17000, status:'active', createdAt:'2026-06-10 11:15:00',
        desc:'开发区综合服务', subs:['U022','U023'] },
      { id:'PRJ-2026-012', product:'mjyy', name:'大江东产业园子公司', owner:'小许', phone:'13500000007',
        balance:35000, totalIn:45000, totalOut:10000, status:'inactive', createdAt:'2026-07-05 13:45:00',
        desc:'产业园运营服务', subs:['U024'] }
    ];

    if (stored) {
      try {
        var arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length > 0) {
          // 检查是否有缺失的项目，如有则补全
          var existingIds = {};
          for (var i = 0; i < arr.length; i++) {
            if (arr[i] && arr[i].id) existingIds[arr[i].id] = true;
          }
          var needUpdate = false;
          for (var j = 0; j < defaultProjects.length; j++) {
            if (!existingIds[defaultProjects[j].id]) {
              arr.push(defaultProjects[j]);
              needUpdate = true;
            }
          }
          if (needUpdate) {
            localStorage.setItem('mjyy_projects', JSON.stringify(arr));
          }
          return arr;
        }
      } catch(e) {}
    }
    
    localStorage.setItem('mjyy_projects', JSON.stringify(defaultProjects));
    return defaultProjects;
  }

  // ===== 项目数据 → 企业列表同步 =====
  function syncProjectsToEnterprises(parentEntId, list) {
    var projList = ensureDefaultProjects();
    var parentEnt = list.find(function(e) { return e.id === parentEntId; });
    var parentId = parentEntId;
    if (parentEnt && parentEnt.parentId) parentId = parentEnt.parentId;
    
    var changed = false;
    for (var i = 0; i < projList.length; i++) {
      var p = projList[i];
      if (!p || !p.id) continue;
      var subEntId = 'PROJ:' + p.id;
      var existingIdx = -1;
      for (var j = 0; j < list.length; j++) {
        if (list[j] && list[j].id === subEntId) { existingIdx = j; break; }
      }
      if (existingIdx >= 0) {
        // 已存在，保留现有数据（不覆盖用户可能已修改的数据）
        continue;
      }
      // 不存在，添加新项目
      var subEnt = {
        id: subEntId,
        name: p.name,
        creditCode: p.creditCode || '',
        legalMobile: p.phone || '',
        role: '子管理员',
        parentId: parentId,
        verified: true,
        status: p.status === 'inactive' ? 'inactive' : 'active',
        product: p.product || 'mjyy',
        balance: p.balance || 0,
        projectId: p.id,
        createdAt: p.createdAt || Date.now(),
        isDefault: false
      };
      list.push(subEnt);
      changed = true;
    }
    
    // 不再清理已存在的 PROJ 记录，让 account-project.html 来管理删除
    // 只确保 mjyy_projects 与 mjyy_enterprise_list 中的 PROJ 记录同步
    var projIdsInList = {};
    for (var m = 0; m < list.length; m++) {
      var ent = list[m];
      if (ent && /^PROJ:/.test(ent.id) && ent.parentId === parentId) {
        projIdsInList[ent.id.replace(/^PROJ:/, '')] = true;
      }
    }
    
    // 更新/添加 mjyy_projects 中的项目
    var needUpdateProj = false;
    for (var n = 0; n < projList.length; n++) {
      var proj = projList[n];
      if (!proj || !proj.id) continue;
      if (!projIdsInList[proj.id]) {
        // projList 中有但 enterprise_list 中没有的项目，需要添加
        needUpdateProj = true;
      }
    }
    
    if (changed || needUpdateProj) {
      localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
    }
    return { list: list, changed: changed };
  }

  function ensureEnterprises() {
    var list = localStorage.getItem('mjyy_enterprise_list');
    if (list) {
      try { list = JSON.parse(list); if (!Array.isArray(list)) throw 0; }
      catch (e) { list = null; }
    }
    if (!list || list.length === 0) {
      var defaultEnt = buildDefaultEnterprise();
      list = [defaultEnt];
      localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
      localStorage.setItem('mjyy_current_enterprise_id', defaultEnt.id);
      localStorage.setItem('mjyy_account_type', 'main');
    }
    
    // 强制清理旧数据：移除重复的 PROJ: 前缀子公司
    var cleanupVersion = localStorage.getItem('mjyy_cleanup_version');
    var currentCleanupVersion = 'v2';
    var hasProjEntries = list.some(function(e) { return e && /^PROJ:/.test(e.id); });
    var needCleanup = hasProjEntries || cleanupVersion !== currentCleanupVersion;
    
    if (needCleanup) {
      var cleanedArr = [];
      for (var c = 0; c < list.length; c++) {
        var ent = list[c];
        if (!ent) continue;
        if (!ent.parentId) {
          cleanedArr.push(ent);
        } else if (/^SUB_/.test(ent.id)) {
          cleanedArr.push(ent);
        }
      }
      // 只在实际有变化时才保存
      var actuallyChanged = cleanedArr.length !== list.length;
      if (actuallyChanged) {
        list = cleanedArr;
        localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
        console.log('[enterprise-switch] 已清理 PROJ: 前缀的重复子公司');
        
        // 检查当前企业 ID 是否仍然有效
        var curId = localStorage.getItem('mjyy_current_enterprise_id');
        if (curId && !list.some(function(e) { return e.id === curId; })) {
          var validEnt = list.find(function(e) { return !e.parentId; });
          if (validEnt) {
            localStorage.setItem('mjyy_current_enterprise_id', validEnt.id);
            console.log('[enterprise-switch] 当前企业已失效，设置为:', validEnt.name);
          } else if (list.length > 0) {
            localStorage.setItem('mjyy_current_enterprise_id', list[0].id);
          }
        }
      }
      // 更新版本号
      localStorage.setItem('mjyy_cleanup_version', currentCleanupVersion);
    }
    
    // 确保默认 projects 数据存在（仅用于存储，不添加到企业列表）
    ensureDefaultProjects();
    // 注意：不再自动同步项目到企业列表
    // 子公司数据由 main.js 统一管理，确保数据源唯一
    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    var curEnt = curId ? list.find(function(e) { return e.id === curId; }) : null;
    if (!curEnt) curEnt = list[0];
    if (curEnt) {
      var currentType = localStorage.getItem('mjyy_account_type');
      var correctType = null;
      if (curEnt.role && /子管理员|子账号/.test(curEnt.role)) correctType = 'sub';
      else if (curEnt.role && /主管理员|主账号/.test(curEnt.role)) correctType = 'main';
      if (correctType && currentType !== correctType) {
        localStorage.setItem('mjyy_account_type', correctType);
      }
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

  function getVerifiedEnterprises() {
    var list = ensureEnterprises();
    var verified = list.filter(function(ent) { return ent.verified || ent.creditCode; });
    if (verified.length === 0) return list;
    return verified;
  }

  function getSubEnterprises(parentEntId) {
    var list = ensureEnterprises();
    var parentEnt = list.find(function(e) { return e.id === parentEntId; });
    if (!parentEnt) return [];
    
    // 统一筛选逻辑：子公司的判断条件
    // 1. 有 parentId 且等于母公司 ID
    // 2. 同时支持 PROJ: 前缀（项目系统创建的子公司）和 SUB_ 前缀（企业系统创建的子公司）
    return list.filter(function(e) {
      if (!e || !e.parentId) return false;
      if (e.parentId !== parentEntId) return false;
      // 返回所有符合条件的子公司，不区分前缀
      return true;
    });
  }

  // ===== 渲染企业列表 =====
  function renderSwitchEntList() {
    var allList = getVerifiedEnterprises();
    var fullList = ensureEnterprises();
    var filteredList = allList.filter(function(ent) { return !ent.parentId; });
    if (filteredList.length === 0) filteredList = allList;

    var currentId = localStorage.getItem('mjyy_current_enterprise_id');
    var accountType = localStorage.getItem('mjyy_account_type') || 'main';

    var highlightParentId = null;
    if (accountType === 'sub' && currentId) {
      var curEnt = fullList.find(function(e) { return e && e.id === currentId; });
      if (curEnt && curEnt.parentId) highlightParentId = curEnt.parentId;
      if (!highlightParentId) {
        curEnt = allList.find(function(e) { return e && e.id === currentId; });
        if (curEnt && curEnt.parentId) highlightParentId = curEnt.parentId;
      }
    }

    var list = filteredList;
    if (switchEntSearchKeyword) {
      var keyword = switchEntSearchKeyword.toLowerCase();
      list = filteredList.filter(function(ent) { return ent.name && ent.name.toLowerCase().indexOf(keyword) !== -1; });
    }

    if (highlightParentId) {
      list = list.slice().sort(function(a, b) {
        if (a.id === highlightParentId) return -1;
        if (b.id === highlightParentId) return 1;
        return 0;
      });
    }

    var html = '';
    var currentPage = window.location.pathname.split('/').pop();
    var isVerifyPageForSwitch = currentPage === 'verify.html';
    list.forEach(function(ent) {
      var isActive = false;
      if (isVerifyPageForSwitch) {
        isActive = false;
      } else if (accountType === 'main') {
        isActive = (currentId === ent.id);
      } else if (accountType === 'sub') {
        isActive = (highlightParentId === ent.id);
      }
      var firstChar = ent.name ? ent.name.charAt(0) : '企';
      var roleLabel = ent.role || '主管理员';
      var subCount = getSubEnterprises(ent.id).length;

      var actionHtml = '';
      if (isActive && accountType === 'main') {
        actionHtml = '<div style="padding:5px 10px;border-radius:6px;background:var(--brand-primary,#1677FF);color:#fff;font-size:12px;font-weight:500;">当前登录</div>' +
          (subCount > 0 ?
            '<div class="switch-ent-sub-btn" data-ent-id="' + ent.id + '" style="padding:5px 10px;border-radius:6px;background:#fff;color:var(--text-regular,rgba(0,0,0,0.85));font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;border:1px solid var(--border-color,#e5e5e5);display:flex;align-items:center;gap:4px;transition:all 0.15s;" onmouseover="this.style.borderColor=\'var(--brand-primary,#1677FF)\';this.style.color=\'var(--brand-primary,#1677FF)\'" onmouseout="this.style.borderColor=\'var(--border-color,#e5e5e5)\';this.style.color=\'var(--text-regular,rgba(0,0,0,0.85))\';">子公司登录<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
            : '');
      } else if (isActive && accountType === 'sub') {
        actionHtml = '<div class="switch-ent-login-btn" data-ent-id="' + ent.id + '" style="padding:6px 14px;border-radius:6px;background:linear-gradient(135deg,#1677FF 0%,#4096FF 100%);color:#fff;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;box-shadow:0 2px 4px rgba(22,119,255,0.2);transition:all 0.15s;" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 4px 8px rgba(22,119,255,0.3)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 2px 4px rgba(22,119,255,0.2)\';">登录</div>' +
          (subCount > 0 ?
            '<div class="switch-ent-sub-btn" data-ent-id="' + ent.id + '" style="padding:5px 10px;border-radius:6px;background:#fff;color:var(--text-regular,rgba(0,0,0,0.85));font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;border:1px solid var(--border-color,#e5e5e5);display:flex;align-items:center;gap:4px;transition:all 0.15s;" onmouseover="this.style.borderColor=\'var(--brand-primary,#1677FF)\';this.style.color=\'var(--brand-primary,#1677FF)\'" onmouseout="this.style.borderColor=\'var(--border-color,#e5e5e5)\';this.style.color=\'var(--text-regular,rgba(0,0,0,0.85))\';">子公司登录<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
            : '');
      } else {
        actionHtml = (subCount > 0 ?
          '<div class="switch-ent-login-btn" data-ent-id="' + ent.id + '" style="padding:6px 14px;border-radius:6px;background:linear-gradient(135deg,#1677FF 0%,#4096FF 100%);color:#fff;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;box-shadow:0 2px 4px rgba(22,119,255,0.2);transition:all 0.15s;" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 4px 8px rgba(22,119,255,0.3)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 2px 4px rgba(22,119,255,0.2)\';">登录</div>' +
            '<div class="switch-ent-sub-btn" data-ent-id="' + ent.id + '" style="padding:5px 10px;border-radius:6px;background:#fff;color:var(--text-regular,rgba(0,0,0,0.85));font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;border:1px solid var(--border-color,#e5e5e5);display:flex;align-items:center;gap:4px;transition:all 0.15s;" onmouseover="this.style.borderColor=\'var(--brand-primary,#1677FF)\';this.style.color=\'var(--brand-primary,#1677FF)\'" onmouseout="this.style.borderColor=\'var(--border-color,#e5e5e5)\';this.style.color=\'var(--text-regular,rgba(0,0,0,0.85))\';">子公司登录<svg viewBox="0 0 24 24" width="12" height="12" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div>'
          :
          '<div class="switch-ent-login-btn" data-ent-id="' + ent.id + '" style="padding:6px 16px;border-radius:6px;background:linear-gradient(135deg,#1677FF 0%,#4096FF 100%);color:#fff;font-size:12px;font-weight:500;cursor:pointer;flex-shrink:0;box-shadow:0 2px 4px rgba(22,119,255,0.2);transition:all 0.15s;" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 4px 8px rgba(22,119,255,0.3)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 2px 4px rgba(22,119,255,0.2)\';">登录</div>'
        );
      }

      html += '<div class="switch-ent-item' + (isActive ? ' active' : '') + '" data-ent-id="' + ent.id + '" ' +
        'style="padding:14px 16px;border-radius:10px;display:flex;align-items:center;gap:12px;' +
        (isActive ? 'background:var(--brand-primary-50,#E8F3FF);border:1px solid var(--brand-primary-200,#BAE0FF);' : 'background:#fff;border:1px solid var(--border-color,#f0f0f0);') +
        'transition:all 0.15s;" onmouseover="if(!this.classList.contains(\'active\')){this.style.borderColor=\'var(--brand-primary-200,#BAE0FF)\';this.style.background=\'var(--brand-primary-50,#FAFCFF)\';}" onmouseout="if(!this.classList.contains(\'active\')){this.style.borderColor=\'var(--border-color,#f0f0f0)\';this.style.background=\'#fff\';}">' +
        '<div class="switch-ent-icon" style="width:40px;height:40px;border-radius:10px;background:' + (isActive ? 'var(--brand-primary,#1677FF)' : 'var(--brand-primary-50,#E8F3FF)') + ';color:' + (isActive ? '#fff' : 'var(--brand-primary,#1677FF)') + ';display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;flex-shrink:0;">' + firstChar + '</div>' +
        '<div class="switch-ent-info" style="flex:1;min-width:0;text-align:left;">' +
        '<div class="switch-ent-name" style="font-size:14px;font-weight:600;color:var(--text-primary,#1f1f1f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left;">' + ent.name + '</div>' +
        '<div class="switch-ent-meta" style="font-size:12px;color:var(--text-muted);margin-top:3px;display:flex;align-items:center;gap:6px;">' +
        '<span>' + roleLabel + '</span>' +
        (subCount > 0 ? '<span style="padding:2px 6px;border-radius:4px;background:#F3F4F6;color:#6B7280;">' + subCount + '个子公司</span>' : '') +
        '</div>' +
        '</div>' +
        '<div class="switch-ent-action" style="flex-shrink:0;display:flex;align-items:center;gap:8px;">' +
        actionHtml +
        '</div>' +
        '</div>';
    });

    var container = document.getElementById('switchEntList');
    if (container) container.innerHTML = html || '<div style="text-align:center;padding:40px 20px;color:var(--text-muted);font-size:13px;">' +
      (switchEntSearchKeyword ? '未找到匹配的企业' : '暂无企业') + '</div>';

    var countEl = document.getElementById('switchEntCount');
    if (countEl) {
      if (switchEntSearchKeyword) countEl.textContent = '搜索到 ' + list.length + ' 家企业';
      else countEl.textContent = '共 ' + filteredList.length + ' 家企业';
    }
  }

  // ===== 子公司列表渲染 =====
  function renderSwitchSubEntList() {
    var list = switchSubEntList;
    if (switchSubEntSearchKeyword) {
      var keyword = switchSubEntSearchKeyword.toLowerCase();
      list = switchSubEntList.filter(function(ent) { return ent.name && ent.name.toLowerCase().indexOf(keyword) !== -1; });
    }
    var currentId = localStorage.getItem('mjyy_current_enterprise_id');
    var currentPage = window.location.pathname.split('/').pop();
    var isVerifyPageForSubSwitch = currentPage === 'verify.html';
    var html = '';
    list.forEach(function(ent) {
      var isActive = isVerifyPageForSubSwitch ? false : (currentId === ent.id);
      var firstChar = ent.name ? ent.name.charAt(0) : '企';
      var roleLabel = ent.role || '子管理员';
      html += '<div class="switch-sub-ent-item' + (isActive ? ' active' : '') + '" data-ent-id="' + ent.id + '" ' +
        'style="padding:12px 14px;border-radius:8px;cursor:pointer;display:flex;align-items:center;gap:10px;' +
        (isActive ? 'background:var(--brand-primary-50,#E8F3FF);border:1px solid var(--brand-primary-200,#BAE0FF);' : 'background:#fff;border:1px solid var(--border-color,#f0f0f0);') +
        'transition:all 0.15s;" onmouseover="if(!this.classList.contains(\'active\')){this.style.borderColor=\'var(--brand-primary-200,#BAE0FF)\';}" onmouseout="if(!this.classList.contains(\'active\')){this.style.borderColor=\'var(--border-color,#f0f0f0)\';}">' +
        '<div style="width:36px;height:36px;border-radius:8px;background:' + (isActive ? 'var(--brand-primary,#1677FF)' : 'var(--brand-primary-50,#E8F3FF)') + ';color:' + (isActive ? '#fff' : 'var(--brand-primary,#1677FF)') + ';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:500;flex-shrink:0;">' + firstChar + '</div>' +
        '<div style="flex:1;min-width:0;text-align:left;">' +
        '<div style="font-size:13px;font-weight:500;color:var(--text-primary,#1f1f1f);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;text-align:left;">' + ent.name + '</div>' +
        '<div style="font-size:12px;color:var(--text-muted);margin-top:2px;text-align:left;">' +
        '<span>' + roleLabel + '</span>' + '</div>' + '</div>' +
        (isActive ?
          '<div style="padding:5px 10px;border-radius:6px;background:var(--brand-primary,#1677FF);color:#fff;font-size:12px;font-weight:500;flex-shrink:0;">当前登录</div>' :
          '<div class="switch-sub-ent-login-btn" style="padding:6px 14px;border-radius:6px;background:linear-gradient(135deg,#1677FF 0%,#4096FF 100%);color:#fff;font-size:12px;font-weight:500;flex-shrink:0;box-shadow:0 2px 4px rgba(22,119,255,0.2);cursor:pointer;transition:all 0.15s;" onmouseover="this.style.transform=\'translateY(-1px)\';this.style.boxShadow=\'0 4px 8px rgba(22,119,255,0.3)\'" onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'0 2px 4px rgba(22,119,255,0.2)\';">登录</div>'
        ) + '</div>';
    });
    var container = document.getElementById('switchSubEntList');
    if (container) container.innerHTML = html || '<div style="text-align:center;padding:30px 20px;color:var(--text-muted);font-size:13px;">' +
      (switchSubEntSearchKeyword ? '未找到匹配的子公司' : '暂无子公司') + '</div>';
    var subtitleEl = document.getElementById('switchSubEntSubtitle');
    if (subtitleEl) {
      if (switchSubEntSearchKeyword) subtitleEl.textContent = '搜索到 ' + list.length + ' 个子公司';
      else subtitleEl.textContent = '共 ' + switchSubEntList.length + ' 个子公司';
    }
  }

  // ===== 搜索处理 =====
  function handleSwitchEntSearch(value) {
    switchEntSearchKeyword = (value || '').trim();
    renderSwitchEntList();
  }
  function handleSwitchSubEntSearch(value) {
    switchSubEntSearchKeyword = (value || '').trim();
    renderSwitchSubEntList();
  }

  // ===== 弹窗控制 =====
  function openSwitchEntModal() {
    switchEntSearchKeyword = '';
    switchSubEntSearchKeyword = '';
    var searchInput = document.getElementById('switchEntSearch');
    if (searchInput) searchInput.value = '';
    renderSwitchEntList();
    openModal('switchEntModal');
  }
  function closeSwitchEntModal() { closeModal('switchEntModal'); }
  function openSubEntModal(parentEntId) {
    var list = ensureEnterprises();
    var parentEnt = list.find(function(e) { return e.id === parentEntId; });
    if (!parentEnt) return;
    var subList = getSubEnterprises(parentEntId);
    switchSubEntList = subList;
    switchSubEntSearchKeyword = '';
    var titleEl = document.getElementById('switchSubEntTitle');
    var subtitleEl = document.getElementById('switchSubEntSubtitle');
    if (titleEl) titleEl.textContent = '选择登录的子公司';
    if (subtitleEl) subtitleEl.textContent = parentEnt.name + ' · 共 ' + subList.length + ' 个子公司';
    var subEntSearch = document.getElementById('switchSubEntSearch');
    if (subEntSearch) subEntSearch.value = '';
    renderSwitchSubEntList();
    closeModal('switchEntModal');
    openModal('switchSubEntModal');
  }
  function closeSubEntModal() { closeModal('switchSubEntModal'); switchSubEntList = []; }
  function backToEntList() { closeModal('switchSubEntModal'); openModal('switchEntModal'); }

  // ===== 切换企业 =====
  function switchToEnterprise(entId) {
    var list = ensureEnterprises();
    var ent = list.find(function(e) { return e.id === entId; });
    if (!ent) return;
    localStorage.setItem('mjyy_current_enterprise_id', ent.id);
    localStorage.setItem('mjyy_last_enterprise_id', ent.id);
    var role = ent.role || '';
    var isSubByRole = /子管理员|子账号|员工|普通成员/.test(role);
    var isSubByParent = !!ent.parentId;
    if (isSubByRole || isSubByParent) localStorage.setItem('mjyy_account_type', 'sub');
    else localStorage.setItem('mjyy_account_type', 'main');
    if (ent.creditCode || ent.verified) {
      localStorage.setItem('mjyy_identity_verified', 'true');
      var entData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
      entData.companyName = ent.name;
      entData.creditCode = ent.creditCode || entData.creditCode;
      localStorage.setItem('mjyy_enterprise_data', JSON.stringify(entData));
    }
    closeModal('switchSubEntModal');
    closeModal('switchEntModal');
    
    // 检查是否在子公司管理页面，如果是则调用 reloadProjects 刷新子公司列表
    try {
      if (typeof window.reloadProjects === 'function') {
        window.reloadProjects();
        // 重新渲染子公司列表相关UI
        if (typeof window.renderProjects === 'function') window.renderProjects();
        if (typeof window.updateStats === 'function') window.updateStats();
        // 触发自定义事件通知其他模块
        var event = new CustomEvent('enterpriseSwitched', { detail: { entId: ent.id } });
        window.dispatchEvent(event);
        // 延迟刷新页面确保UI更新
        setTimeout(function() {
          window.location.reload();
        }, 300);
        return;
      }
    } catch(e) {}
    
    window.location.reload();
  }

  // ===== 事件绑定（委托）=====
  var __eventsBound = false;
  function bindEvents() {
    if (__eventsBound) return;
    __eventsBound = true;
    document.addEventListener('click', function(e) {
      // 登录按钮 - 直接切换登录
      var loginBtn = e.target.closest('.switch-ent-login-btn');
      if (loginBtn) {
        e.preventDefault();
        e.stopPropagation();
        var entId = loginBtn.getAttribute('data-ent-id');
        if (entId) {
          try { switchToEnterprise(entId); } catch(err) { console.error('[switchEnt] login error:', err); }
        }
        return;
      }
      // 子公司登录按钮 - 打开子公司选择弹窗
      var subBtn = e.target.closest('.switch-ent-sub-btn');
      if (subBtn) {
        e.preventDefault();
        e.stopPropagation();
        var subEntId = subBtn.getAttribute('data-ent-id');
        if (subEntId) {
          try { openSubEntModal(subEntId); } catch(err) { console.error('[switchEnt] sub-btn error:', err); }
        }
        return;
      }
      // 子公司登录按钮 - 切换登录
      var subLoginBtn = e.target.closest('.switch-sub-ent-login-btn');
      if (subLoginBtn) {
        e.preventDefault();
        e.stopPropagation();
        var subEntId = subLoginBtn.getAttribute('data-ent-id') || 
          (subLoginBtn.closest('.switch-sub-ent-item') && subLoginBtn.closest('.switch-sub-ent-item').getAttribute('data-ent-id'));
        if (subEntId) {
          try { switchToEnterprise(subEntId); } catch(err) { console.error('[switchEnt] sub-login error:', err); }
        }
        return;
      }
      // 返回按钮
      var backBtn = e.target.closest('.switch-sub-ent-back');
      if (backBtn) {
        e.preventDefault();
        e.stopPropagation();
        try { backToEntList(); } catch(err) {}
        return;
      }
      // 点击蒙版关闭弹窗
      var mask = e.target.closest('.modal-mask');
      if (mask && e.target === mask && (mask.id === 'switchEntModal' || mask.id === 'switchSubEntModal')) {
        mask.classList.remove('open');
      }
    }, true); // 使用捕获阶段，确保先于其他事件处理执行
  }

  // ===== 暴露到 window =====
  window.openModal = openModal;
  window.closeModal = closeModal;
  window.openSwitchEntModal = openSwitchEntModal;
  window.closeSwitchEntModal = closeSwitchEntModal;
  window.openSubEntModal = openSubEntModal;
  window.closeSubEntModal = closeSubEntModal;
  window.backToEntList = backToEntList;
  window.switchToEnterprise = switchToEnterprise;
  window.renderSwitchEntList = renderSwitchEntList;
  window.renderSwitchSubEntList = renderSwitchSubEntList;
  window.handleSwitchEntSearch = handleSwitchEntSearch;
  window.handleSwitchSubEntSearch = handleSwitchSubEntSearch;
  window.ensureEnterprises = ensureEnterprises;
  window.ensureDefaultProjects = ensureDefaultProjects;
  window.getCurrentEnterprise = getCurrentEnterprise;
  window.getVerifiedEnterprises = getVerifiedEnterprises;
  window.getSubEnterprises = getSubEnterprises;

  // ===== 自动初始化 =====
  window.ensureModals = ensureModals;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      ensureModals();
      bindEvents();
    });
  } else {
    ensureModals();
    bindEvents();
  }
})();
