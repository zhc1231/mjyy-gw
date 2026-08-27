// ===== 民匠有约官网 - 主交互 =====

// ===== 切换企业 __seOpen — 已废弃，改为下拉卡片内直接切换 =====
if(typeof window.__seOpen !== 'function'){
  window.__seOpen = function(){
    // 已废弃：不再打开弹窗
    console.log('[ent-switch] __seOpen deprecated — use dropdown card directly');
  };
}

// ===== 切换企业 - 全局点击处理（已废弃）=====
window.__switchEntClick = function(btn){
  console.log('[ent-switch] __switchEntClick deprecated');
  return false;
};

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

  // ===== 默认子公司数据（与 account-project.html 保持一致）=====
  function ensureDefaultProjects() {
    var stored = localStorage.getItem('mjyy_projects');
    if (stored) {
      try {
        var arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length > 0) return arr;
      } catch(e) {}
    }
    var defaultProjects = [
      { id:'PRJ-2026-001', product:'mjyy', name:'杭州地铁保洁子公司', owner:'小赵', phone:'17857069096',
        balance:28500, totalIn:50000, totalOut:21500, status:'active', createdAt:'2025-08-12 09:19:32',
        desc:'地铁1号线保洁服务', subs:['U002','U004'] },
      { id:'PRJ-2026-002', product:'mjyy', name:'阿里巴巴园区保洁', owner:'小李', phone:'13912345678',
        balance:18700, totalIn:30000, totalOut:11300, status:'active', createdAt:'2025-09-01 14:32:18',
        desc:'园区日常保洁', subs:['U003','U006','U007'] },
      { id:'PRJ-2026-003', product:'mjyy', name:'万达广场安保子公司', owner:'小王', phone:'13700123456',
        balance:0, totalIn:15000, totalOut:15000, status:'inactive', createdAt:'2025-10-15 10:08:45',
        desc:'安保服务外包', subs:[] }
    ];
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
      if (existingIdx >= 0) {
        subEnt.createdAt = list[existingIdx].createdAt || subEnt.createdAt;
        var oldEnt = list[existingIdx];
        if (oldEnt.name !== subEnt.name ||
            oldEnt.status !== subEnt.status ||
            oldEnt.balance !== subEnt.balance ||
            oldEnt.parentId !== subEnt.parentId) {
          list[existingIdx] = subEnt;
          changed = true;
        }
      } else {
        list.push(subEnt);
        changed = true;
      }
    }
    
    var validIds = {};
    for (var k = 0; k < projList.length; k++) {
      if (projList[k] && projList[k].id) validIds['PROJ:' + projList[k].id] = true;
    }
    var filtered = [];
    for (var m = 0; m < list.length; m++) {
      var ent = list[m];
      if (ent && /^PROJ:/.test(ent.id)) {
        if (validIds[ent.id]) filtered.push(ent);
        else changed = true;
      } else {
        filtered.push(ent);
      }
    }
    if (changed) {
      localStorage.setItem('mjyy_enterprise_list', JSON.stringify(filtered));
    }
    return { list: filtered, changed: changed };
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
      var baseTs = Date.now();

      var realName = enterpriseData.companyName
        || (personalData.realName ? personalData.realName + '（个人企业）' : null)
        || null;

      if (realName) {
        // 用户有真实的企业名 → 以此企业为主
        var realEnt = {
          id: 'ENT' + baseTs,
          name: realName,
          creditCode: enterpriseData.creditCode || enterpriseData.credit_code || '',
          legalMobile: userData.mobile || '',
          authType: authType,
          verified: identityVerified,
          role: '主管理员',
          createdAt: baseTs,
          isDefault: true
        };
        // 再额外补两个模拟企业（供切换/展示用），当前登录默认真实企业
        var mockA = {
          id: 'ENT' + (baseTs + 100001),
          name: '杭州云创科技有限公司',
          creditCode: '91330100MA2H' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
          legalMobile: '139' + Math.floor(10000000 + Math.random() * 89999999),
          authType: 'enterprise',
          verified: true,
          role: '主管理员',
          createdAt: baseTs - 86400000 * 30,
          isDefault: false
        };
        var mockB = {
          id: 'ENT' + (baseTs + 100002),
          name: '深圳星耀智造股份有限公司',
          creditCode: '91440300MA5E' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
          legalMobile: '138' + Math.floor(10000000 + Math.random() * 89999999),
          authType: 'enterprise',
          verified: true,
          role: '主管理员',
          createdAt: baseTs - 86400000 * 60,
          isDefault: false
        };
        list = [realEnt, mockA, mockB];
        localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
        localStorage.setItem('mjyy_current_enterprise_id', realEnt.id);
      } else {
        // 用户尚未录入任何企业信息：生成 3 个模拟企业数据（以"杭州云创科技有限公司"为默认登录 + 默认企业）
        var entYC = {
          id: 'ENT' + (baseTs + 200001),
          name: '杭州云创科技有限公司',
          creditCode: '91330100MA2H' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
          legalMobile: '139' + Math.floor(10000000 + Math.random() * 89999999),
          authType: 'enterprise',
          verified: true,
          role: '主管理员',
          createdAt: baseTs,
          isDefault: true
        };
        var entXY = {
          id: 'ENT' + (baseTs + 200002),
          name: '深圳星耀智造股份有限公司',
          creditCode: '91440300MA5E' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
          legalMobile: '138' + Math.floor(10000000 + Math.random() * 89999999),
          authType: 'enterprise',
          verified: true,
          role: '主管理员',
          createdAt: baseTs - 86400000 * 30,
          isDefault: false
        };
        var entBJ = {
          id: 'ENT' + (baseTs + 200003),
          name: '北京百川能源科技有限公司',
          creditCode: '91110100MA01' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
          legalMobile: '137' + Math.floor(10000000 + Math.random() * 89999999),
          authType: 'enterprise',
          verified: true,
          role: '主管理员',
          createdAt: baseTs - 86400000 * 60,
          isDefault: false
        };
        list = [entYC, entXY, entBJ];
        localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
        localStorage.setItem('mjyy_current_enterprise_id', entYC.id);
      }
    }
    
    // 确保默认 projects 数据存在
    ensureDefaultProjects();
    // 注意：不再调用 syncProjectsToEnterprises，因为子公司数据已由下方的 subCompaniesMap 统一管理
    // 之前的 syncProjectsToEnterprises 会创建 PROJ: 前缀的子公司，导致与 SUB_ 前缀子公司重复
    
    return list;
  }
  // 一次性清理旧的占位企业数据（仅清理"我的企业"/"新企业（未认证）"这类纯占位名，不误删真实企业）
  function cleanupOldMockEnterprises() {
    var raw = localStorage.getItem('mjyy_enterprise_list');
    if (!raw) return;
    try {
      var arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return;
      // 仅过滤掉占位性质的虚假默认企业：名称为"我的企业"或"新企业（未认证）"
      var cleaned = arr.filter(function(e) {
        if (e.name === '我的企业' || e.name === '新企业（未认证）') return false;
        return true;
      });
      if (cleaned.length !== arr.length) {
        localStorage.setItem('mjyy_enterprise_list', JSON.stringify(cleaned));
        var curId = localStorage.getItem('mjyy_current_enterprise_id');
        if (curId && !cleaned.find(function(e) { return e.id === curId; })) {
          if (cleaned.length > 0) {
            localStorage.setItem('mjyy_current_enterprise_id', cleaned[0].id);
          } else {
            localStorage.removeItem('mjyy_current_enterprise_id');
          }
        }
      }
    } catch (e) {}
  }

  // 确保默认企业为最早认证的已认证企业
  function ensureDefaultVerifiedEnterprise() {
    var raw = localStorage.getItem('mjyy_enterprise_list');
    if (!raw) return;
    var arr;
    try { arr = JSON.parse(raw); if (!Array.isArray(arr)) return; } catch (e) { return; }
    if (arr.length === 0) return;

    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    var curEnt = curId ? arr.find(function(e) { return e.id === curId; }) : null;

    // 如果当前已有选中企业且已认证，且有role，不需要改
    if (curEnt && (curEnt.verified || curEnt.creditCode) && curEnt.role) return;

    // 找到最早认证的企业（按 createdAt 排序）
    var verified = arr.filter(function(e) { return e.verified || e.creditCode; });
    if (verified.length === 0) return;

    verified.sort(function(a, b) {
      return (a.createdAt || 0) - (b.createdAt || 0);
    });

    var defaultEnt = verified[0];
    // 如果默认企业不是主管理员，确保设为最早的主管理员企业
    var mainAdmin = verified.find(function(e) { return /主管理员|主账号/.test(e.role || ''); });
    if (mainAdmin) defaultEnt = mainAdmin;

    localStorage.setItem('mjyy_current_enterprise_id', defaultEnt.id);
    // 同步认证状态
    if (defaultEnt.creditCode || defaultEnt.verified) {
      localStorage.setItem('mjyy_identity_verified', 'true');
      var entData = JSON.parse(localStorage.getItem('mjyy_enterprise_data') || '{}');
      entData.companyName = defaultEnt.name;
      entData.creditCode = defaultEnt.creditCode || '';
      localStorage.setItem('mjyy_enterprise_data', JSON.stringify(entData));
    }
  }

  // 补齐：保证至少有 3 个模拟企业（杭州云创 + 深圳星耀智造 + 北京百川能源）
  // 仅当列表里已存在「杭州云创」或列表总体 < 3 家时才补，不影响用户自己录入的真实企业
  function ensureMinimumMockEnterprises() {
    var raw = localStorage.getItem('mjyy_enterprise_list');
    if (!raw) return; // ensureEnterprises 会处理完全空的情况
    var arr;
    try { arr = JSON.parse(raw); if (!Array.isArray(arr)) throw 0; } catch (e) { return; }

    function exists(name) {
      return arr.some(function(e) { return e.name === name; });
    }
    var baseTs = Date.now();
    var needPersist = false;
    
    // 定义必要的变量
    var fromAdd = localStorage.getItem('mjyy_from_add_enterprise') === 'true';
    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    var currentPage = window.location.pathname.split('/').pop();

    if (!exists('杭州云创科技有限公司')) {
      arr.push({
        id: 'ENT' + (baseTs + 300001),
        name: '杭州云创科技有限公司',
        creditCode: '91330100MA2H' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
        legalMobile: '139' + Math.floor(10000000 + Math.random() * 89999999),
        authType: 'enterprise',
        verified: true,
        role: '主管理员',
        createdAt: baseTs,
        isDefault: arr.length === 0
      });
      needPersist = true;
    }
    if (!exists('深圳星耀智造股份有限公司')) {
      arr.push({
        id: 'ENT' + (baseTs + 300002),
        name: '深圳星耀智造股份有限公司',
        creditCode: '91440300MA5E' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
        legalMobile: '138' + Math.floor(10000000 + Math.random() * 89999999),
        authType: 'enterprise',
        verified: true,
        role: '主管理员',
        createdAt: baseTs - 86400000 * 30,
        isDefault: false
      });
      needPersist = true;
    }
    if (!exists('北京百川能源科技有限公司')) {
      arr.push({
        id: 'ENT' + (baseTs + 300003),
        name: '北京百川能源科技有限公司',
        creditCode: '91110100MA01' + Math.random().toString(36).slice(2, 8).toUpperCase() + 'XX',
        legalMobile: '137' + Math.floor(10000000 + Math.random() * 89999999),
        authType: 'enterprise',
        verified: true,
        role: '主管理员',
        createdAt: baseTs - 86400000 * 60,
        isDefault: false
      });
      needPersist = true;
    }

    // —— 为每家母公司各创建12个子公司（若尚未存在）——
    var subCompaniesMap = {
      '杭州云创科技有限公司': [
        { name: '云创·西湖科技子公司', creditCode: '91330100MA5X' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13611111111', createdAt: baseTs - 86400000 * 10 },
        { name: '云创·滨江数字子公司', creditCode: '91330100MA5Y' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13622222222', createdAt: baseTs - 86400000 * 20 },
        { name: '云创·余杭创新子公司', creditCode: '91330100MA5Z' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13633333111', createdAt: baseTs - 86400000 * 30 },
        { name: '云创·萧山商务子公司', creditCode: '91330100MA6A' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13644444111', createdAt: baseTs - 86400000 * 40 },
        { name: '云创·拱墅传媒子公司', creditCode: '91330100MA6B' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13655555111', createdAt: baseTs - 86400000 * 50 },
        { name: '云创·上城金融子公司', creditCode: '91330100MA6C' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13666666111', createdAt: baseTs - 86400000 * 60 },
        { name: '云创·西湖文创子公司', creditCode: '91330100MA6D' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13677777111', createdAt: baseTs - 86400000 * 70 },
        { name: '云创·钱塘智慧子公司', creditCode: '91330100MA6E' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13688888111', createdAt: baseTs - 86400000 * 80 },
        { name: '云创·下沙智造子公司', creditCode: '91330100MA6F' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13699999111', createdAt: baseTs - 86400000 * 90 },
        { name: '云创·临平新城子公司', creditCode: '91330100MA6G' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13600000111', createdAt: baseTs - 86400000 * 100 },
        { name: '云创·大江东能源子公司', creditCode: '91330100MA6H' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13611110111', createdAt: baseTs - 86400000 * 110 },
        { name: '云创·钱江新城子公司', creditCode: '91330100MA6I' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13622220111', createdAt: baseTs - 86400000 * 120 }
      ],
      '深圳星耀智造股份有限公司': [
        { name: '星耀·龙华智造子公司', creditCode: '91440300MA5A' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13633333333', createdAt: baseTs - 86400000 * 15 },
        { name: '星耀·南山智能子公司', creditCode: '91440300MA5B' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13644444444', createdAt: baseTs - 86400000 * 25 },
        { name: '星耀·福田科技子公司', creditCode: '91440300MA5C' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13655555555', createdAt: baseTs - 86400000 * 35 },
        { name: '星耀·罗湖电子子公司', creditCode: '91440300MA5D' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13666666666', createdAt: baseTs - 86400000 * 45 },
        { name: '星耀·宝安制造子公司', creditCode: '91440300MA5E' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13677777777', createdAt: baseTs - 86400000 * 55 },
        { name: '星耀·龙岗物流子公司', creditCode: '91440300MA5F' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13688888888', createdAt: baseTs - 86400000 * 65 },
        { name: '星耀·盐田贸易子公司', creditCode: '91440300MA5G' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13699999999', createdAt: baseTs - 86400000 * 75 },
        { name: '星耀·蛇口工业子公司', creditCode: '91440300MA5H' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13700000000', createdAt: baseTs - 86400000 * 85 },
        { name: '星耀·光明农业子公司', creditCode: '91440300MA5I' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13711111111', createdAt: baseTs - 86400000 * 95 },
        { name: '星耀·坪山新区子公司', creditCode: '91440300MA5J' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13722222222', createdAt: baseTs - 86400000 * 105 },
        { name: '星耀·沙井研发子公司', creditCode: '91440300MA5K' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13733333333', createdAt: baseTs - 86400000 * 115 },
        { name: '星耀·松岗智创子公司', creditCode: '91440300MA5L' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13744444444', createdAt: baseTs - 86400000 * 125 }
      ],
      '北京百川能源科技有限公司': [
        { name: '百川·朝阳能源子公司', creditCode: '91110100MA5C' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13655555555', createdAt: baseTs - 86400000 * 30 },
        { name: '百川·海淀环保子公司', creditCode: '91110100MA5D' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13666666666', createdAt: baseTs - 86400000 * 40 },
        { name: '百川·丰台燃气子公司', creditCode: '91110100MA5E' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13677777777', createdAt: baseTs - 86400000 * 50 },
        { name: '百川·通州电力子公司', creditCode: '91110100MA5F' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13688888888', createdAt: baseTs - 86400000 * 60 },
        { name: '百川·石景山水务子公司', creditCode: '91110100MA5G' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13699999999', createdAt: baseTs - 86400000 * 70 },
        { name: '百川·昌平新能源子公司', creditCode: '91110100MA5H' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13700000000', createdAt: baseTs - 86400000 * 80 },
        { name: '百川·大兴氢能子公司', creditCode: '91110100MA5I' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13711110000', createdAt: baseTs - 86400000 * 90 },
        { name: '百川·房山光伏子公司', creditCode: '91110100MA5J' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13722220000', createdAt: baseTs - 86400000 * 100 },
        { name: '百川·怀柔风电子公司', creditCode: '91110100MA5K' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13733330000', createdAt: baseTs - 86400000 * 110 },
        { name: '百川·密云储能子公司', creditCode: '91110100MA5L' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13744440000', createdAt: baseTs - 86400000 * 120 },
        { name: '百川·平谷生物子公司', creditCode: '91110100MA5M' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13755550000', createdAt: baseTs - 86400000 * 130 },
        { name: '百川·延庆节能子公司', creditCode: '91110100MA5N' + Math.random().toString(36).slice(2, 6).toUpperCase() + 'XX', mobile: '13766660000', createdAt: baseTs - 86400000 * 140 }
      ]
    };
    // 遍历每个母公司，确保其子公司存在
    Object.keys(subCompaniesMap).forEach(function(parentName) {
      var parent = arr.find(function(e) { return e.name === parentName && !e.parentId; });
      if (!parent) return;
      var subs = subCompaniesMap[parentName];
      subs.forEach(function(subDef, idx) {
        var existsSub = arr.some(function(e) {
          return e.name === subDef.name && e.parentId === parent.id;
        });
        if (!existsSub) {
          arr.push({
            id: 'SUB_' + parent.id + '_' + (idx + 1) + '_' + baseTs,
            name: subDef.name,
            creditCode: subDef.creditCode,
            legalMobile: subDef.mobile,
            authType: 'enterprise',
            verified: true,
            role: '子管理员',
            parentId: parent.id,
            createdAt: subDef.createdAt || baseTs,
            isDefault: false,
            status: 'active'
          });
          needPersist = true;
        }
      });
    });
    // 若当前没有默认企业，指定杭州云创为默认企业（仅标记 isDefault，不改变当前登录）
    var hasDefault = arr.some(function(e) { return e.isDefault; });
    if (!hasDefault) {
      var yc = arr.find(function(e) { return e.name === '杭州云创科技有限公司'; });
      if (yc) { yc.isDefault = true; needPersist = true; }
    }
    // 当前登录企业的处理：
    //   · 如果 localStorage 已有 mjyy_current_enterprise_id 且在列表中存在 → 不动它
    //   · 如果来自"添加新企业"流程（标记 mjyy_from_add_enterprise=true）→ 刻意保持空选择，任何企业都不显示"当前登录"
    //     （若当前页面不是认证页 verify.html，自动清除此标记，避免长期死锁在空状态）
    //   · 如果 curId 不在列表里（旧 ID 失效）→ 设置一个有效的企业作为当前登录
    if (fromAdd) {
      if (currentPage !== 'verify.html') {
        localStorage.removeItem('mjyy_from_add_enterprise');
      }
      // 添加新企业流程（或刚从其流程跳离但还未显式选择企业）：确保选择状态为空
      if (curId) {
        localStorage.removeItem('mjyy_current_enterprise_id');
      }
    } else if (curId && !arr.some(function(e) { return e.id === curId; })) {
      // curId 指向的企业不存在了（比如被清理了）→ 设置一个有效的企业
      console.log('[ensureMinimumMockEnterprises] 当前企业ID失效，重新设置有效企业');
      var validEnt = arr.find(function(e) { return !e.parentId; });
      if (validEnt) {
        localStorage.setItem('mjyy_current_enterprise_id', validEnt.id);
        console.log('[ensureMinimumMockEnterprises] 已设置当前企业为:', validEnt.name);
      } else if (arr.length > 0) {
        localStorage.setItem('mjyy_current_enterprise_id', arr[0].id);
        console.log('[ensureMinimumMockEnterprises] 已设置当前企业为:', arr[0].name);
      }
    }
    
    // 强制清理旧数据：移除重复的 PROJ: 前缀子公司
    var hasProjEntries = arr.some(function(e) { return e && /^PROJ:/.test(e.id); });
    // 检查版本号或是否有 PROJ 前缀子公司需要清理
    var cleanupVersion = localStorage.getItem('mjyy_cleanup_version');
    var currentCleanupVersion = 'v2';
    var needCleanup = hasProjEntries || cleanupVersion !== currentCleanupVersion;
    
    if (needCleanup) {
      var cleanedArr = [];
      for (var c = 0; c < arr.length; c++) {
        var ent = arr[c];
        if (!ent.parentId) {
          cleanedArr.push(ent);
        } else if (/^SUB_/.test(ent.id)) {
          cleanedArr.push(ent);
        }
      }
      // 只在实际有变化时才保存
      var actuallyChanged = cleanedArr.length !== arr.length;
      if (actuallyChanged) {
        arr = cleanedArr;
        localStorage.setItem('mjyy_enterprise_list', JSON.stringify(arr));
        needPersist = true;
        console.log('[ensureMinimumMockEnterprises] 已清理 PROJ: 前缀的重复子公司');
      }
      // 更新版本号（无论是否实际清理了数据）
      localStorage.setItem('mjyy_cleanup_version', currentCleanupVersion);
    }
    
    // 检查当前企业 ID 是否有效（在清理逻辑之外执行，确保每次都检查）
    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    if (!curId || !arr.some(function(e) { return e.id === curId; })) {
      // 当前企业 ID 无效，设置一个有效的企业
      console.log('[ensureMinimumMockEnterprises] 当前企业ID失效或为空，重新设置有效企业');
      var validEnt = arr.find(function(e) { return !e.parentId; });
      if (validEnt) {
        localStorage.setItem('mjyy_current_enterprise_id', validEnt.id);
        console.log('[ensureMinimumMockEnterprises] 已设置当前企业为:', validEnt.name);
      } else if (arr.length > 0) {
        localStorage.setItem('mjyy_current_enterprise_id', arr[0].id);
        console.log('[ensureMinimumMockEnterprises] 已设置当前企业为:', arr[0].name);
      }
    }
    
    if (needPersist) {
      localStorage.setItem('mjyy_enterprise_list', JSON.stringify(arr));
    }
  }

  function getCurrentEnterprise() {
    var list = ensureEnterprises();
    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    var fromAdd = localStorage.getItem('mjyy_from_add_enterprise') === 'true';
    // 只有显式存在的 curId 才返回对应企业；没有就返回 null（表示"未选择任何企业"）
    // 例如添加新企业流程中，选择状态应为空
    if (!curId) {
      // 非添加新企业流程：回退到第一个企业
      if (!fromAdd && list.length > 0) {
        var fallback = list.find(function(e) { return e && !e.parentId; }) || list[0];
        if (fallback) {
          console.log('[getCurrentEnterprise] 无当前企业ID，回退到首个企业:', fallback.name);
          localStorage.setItem('mjyy_current_enterprise_id', fallback.id);
          return fallback;
        }
      }
      console.log('[getCurrentEnterprise] 当前企业ID为空，返回null');
      return null;
    }
    var cur = list.find(function(e) { return e.id === curId; });
    if (!cur) {
      // 企业ID无效：回退到第一个企业
      if (!fromAdd && list.length > 0) {
        var fb = list.find(function(e) { return e && !e.parentId; }) || list[0];
        if (fb) {
          console.log('[getCurrentEnterprise] 企业ID无效，回退到首个企业:', fb.name);
          localStorage.setItem('mjyy_current_enterprise_id', fb.id);
          return fb;
        }
      }
      console.log('[getCurrentEnterprise] 未找到企业ID对应的企业:', curId, '列表长度:', list.length);
      return null;
    }
    console.log('[getCurrentEnterprise] 找到企业:', cur.name);
    return cur;
  }

  // 根据当前选中的企业（currentEnt）决定账号类型标签
  // 规则：
  //   · 如果有企业上下文（currentEnt 非空，有 role）→ 用企业里的 role 决定主账号/子账号
  //     （例：用户在 A 企业是"子管理员"→显示"子管理员"，在 B 企业是"主管理员"→显示"主管理员"）
  //   · 否则回退到全局 mjyy_account_type
  // 返回：{ typeText, isSub }
  // typeText：显示用的标签文字；isSub：是否按子账号渲染项目等附加信息
  function getEnterpriseAccountRole(globalAccountType, currentEnt) {
    var gType = globalAccountType || 'main';
    var isSubGlobal = gType === 'sub';

    // 优先使用 parentId 判断（最可靠）
    if (currentEnt && typeof currentEnt === 'object' && currentEnt.parentId) {
      return { typeText: '子账号', isSub: true, fromEnterprise: true };
    }

    if (currentEnt && typeof currentEnt === 'object' && currentEnt.role) {
      var r = String(currentEnt.role);
      // 包含"子账号"/"子管理员"/"员工"（有 parentId 时才判断为子账号）
      if (/子账号|子管理/.test(r)) {
        return { typeText: '子账号', isSub: true, fromEnterprise: true };
      }
      // 包含"主账号"/"管理员"/"法人" → 主账号
      if (/主账号|管理员|法人|法定代表人|创始人|所有者/.test(r)) {
        return { typeText: '主账号', isSub: false, fromEnterprise: true };
      }
    }
    return {
      typeText: isSubGlobal ? '子账号' : '主账号',
      isSub: isSubGlobal,
      fromEnterprise: false
    };
  }

  // 子账号在当前企业/当前产品下的已分配项目
  // 返回：[{ productCode, productLabel, projectId, projectName }] 数组；无结果返回 []
  // 匹配优先级：
  //   1. mjyy_sub_accounts 里该子账号自带的 projects 字段
  //   2. 从 window.projects / mjyy_projects localStorage 匹配：
  //        a. p.subs 包含当前子账号 id → 属于此项目（分配的子账号 chips）
  //        b. 当前用户手机号/账号ID = p.ownerPhone/p.phone → 负责人/owner 也归入
  //        c. 姓名回退：userData.name = p.owner 时也命中（便于有真实姓名时匹配）
  function getCurrentUserAssignedProjects(userData, currentEnt) {
    var out = [];
    try {
      var userData = userData || JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
      var userId = userData.accountId || userData.id || '';
      var userPhone = userData.mobile || userData.phone || '';
      var userName = userData.name || userData.realName || userData.nickname || '';
      var entId = (currentEnt && currentEnt.id) ? currentEnt.id : null;

      // 产品码 → 中文产品名
      var productLabels = {
        mjyy: '民匠有约',
        anxinyun: '安心云',
        agent: '代理商平台'
      };

      function dedupAdd(arr, item) {
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].projectId === item.projectId) return;
        }
        arr.push(item);
      }

      // 把页面内生成的 window.projects / window.SUBACCOUNTS 持久化到 localStorage，供非项目页（资金/控制台）展示用
      try {
        if (typeof window !== 'undefined') {
          if (Array.isArray(window.projects) && window.projects.length) {
            try { localStorage.setItem('mjyy_projects', JSON.stringify(window.projects)); } catch (e) {}
          }
          if (Array.isArray(window.SUBACCOUNTS) && window.SUBACCOUNTS.length) {
            try { localStorage.setItem('mjyy_sub_accounts', JSON.stringify(window.SUBACCOUNTS)); } catch (e) {}
          }
        }
      } catch (e) { /* ignore */ }

      // —— 终极兜底（账户首次加载从未进过项目页 / 清缓存后直接跳到产品中心时也不会空） ——
      // 当 window.* 没数据 + localStorage 也没数据，就用 account-project.html 中那一套默认的 3 个项目 + 6 个子账号，
      // 写入 localStorage 之后后续的 "window.projects / localStorage mjyy_projects" 流程都能命中。
      // （这是和"真实用户从未进入项目页但需要在其他页看到民匠有约·项目名"的唯一闭环保障）
      (function fallbackSeeds() {
        try {
          if (typeof window === 'undefined') return;
          var hasWinProjects = Array.isArray(window.projects) && window.projects.length > 0;
          var hasWinSubs     = Array.isArray(window.SUBACCOUNTS) && window.SUBACCOUNTS.length > 0;
          var rawProjects    = localStorage.getItem('mjyy_projects') || '[]';
          var rawSubs        = localStorage.getItem('mjyy_sub_accounts') || '[]';
          var lsProjects     = []; try { lsProjects = JSON.parse(rawProjects); } catch (e) {}
          var lsSubs         = []; try { lsSubs     = JSON.parse(rawSubs);     } catch (e) {}
          if (hasWinProjects && hasWinSubs) return; // 项目页已暴露，无需兜底

          var DEFAULT_PROJECTS = [
            { id:'PRJ-2026-001', product:'mjyy', name:'杭州地铁保洁项目', owner:'小赵', phone:'17857069096',
              balance:28500, totalIn:50000, totalOut:21500, status:'active', createdAt:'2025-08-12 09:19:32',
              desc:'地铁1号线保洁服务', subs:['U002','U004'] },
            { id:'PRJ-2026-002', product:'mjyy', name:'阿里巴巴园区保洁', owner:'小李', phone:'13912345678',
              balance:18700, totalIn:30000, totalOut:11300, status:'active', createdAt:'2025-09-01 14:32:18',
              desc:'园区日常保洁',     subs:['U003','U006','U007'] },
            { id:'PRJ-2026-003', product:'mjyy', name:'万达广场安保子公司', owner:'小王', phone:'13700123456',
              balance:0,     totalIn:15000, totalOut:15000, status:'inactive', createdAt:'2025-10-15 10:08:45',
              desc:'安保服务外包',     subs:[] }
          ];
          var DEFAULT_SUBACCOUNTS = [
            { id:'U002', name:'小李',   phone:'13912345678', role:'子公司主管' },
            { id:'U003', name:'小王',   phone:'13700123456', role:'现场督导' },
            { id:'U004', name:'小陈',   phone:'13800000011', role:'财务助理' },
            { id:'U005', name:'小周',   phone:'13800000012', role:'调度' },
            { id:'U006', name:'小徐',   phone:'13800000013', role:'物料管理' },
            { id:'U007', name:'小林',   phone:'13800000014', role:'质检' }
          ];

          if (!hasWinProjects && (!Array.isArray(lsProjects) || lsProjects.length === 0)) {
            try {
              window.projects = DEFAULT_PROJECTS;
              localStorage.setItem('mjyy_projects', JSON.stringify(DEFAULT_PROJECTS));
            } catch (e) {}
          }
          if (!hasWinSubs && (!Array.isArray(lsSubs) || lsSubs.length === 0)) {
            try {
              window.SUBACCOUNTS = DEFAULT_SUBACCOUNTS;
              localStorage.setItem('mjyy_sub_accounts', JSON.stringify(DEFAULT_SUBACCOUNTS));
            } catch (e) {}
          }
        } catch (e4) { /* ignore */ }
      })();

      // 1) mjyy_sub_accounts 中的直配 projects 字段
      try {
        var subsList = JSON.parse(localStorage.getItem('mjyy_sub_accounts') || '[]');
        var matched = null;
        for (var si = 0; si < subsList.length; si++) {
          if (!subsList[si]) continue;
          var s = subsList[si];
          if (s.id === userId || s.phone === userPhone || (s.accountId && s.accountId === userId)) {
            matched = s; break;
          }
          // 姓名兜底：当前用户有真实姓名且与子账号名相同
          if (userName && s.name && s.name === userName) { matched = s; break; }
        }
        if (matched && Array.isArray(matched.projects)) {
          matched.projects.forEach(function (p) {
            if (!p) return;
            var pCode = p.product || (typeof p === 'object' ? (p.productCode || 'mjyy') : 'mjyy');
            var pName = (typeof p === 'string') ? p : (p.name || p.projectName || '');
            var pId = (typeof p === 'object') ? (p.id || p.projectId || pName) : p;
            if (pName) dedupAdd(out, {
              productCode: pCode,
              productLabel: productLabels[pCode] || '民匠有约',
              projectId: pId,
              projectName: pName
            });
          });
        }
      } catch (e) { /* ignore */ }

      // 2) 从 window.projects / localStorage mjyy_projects 反向匹配 subs + owner
      var projectsSrc = null;
      try {
        if (typeof window !== 'undefined' && Array.isArray(window.projects) && window.projects.length) {
          projectsSrc = window.projects;
        }
      } catch (e) {}
      if (!projectsSrc) {
        try { projectsSrc = JSON.parse(localStorage.getItem('mjyy_projects') || '[]'); } catch (e) { projectsSrc = null; }
      }
      if (projectsSrc && projectsSrc.length) {
        // 先拿到当前子账号在 SUBACCOUNTS 里的 id（如果有）
        var subIds = [];
        var subPhones = [];
        var subNames = [];
        if (userId) subIds.push(userId);
        if (userPhone) subPhones.push(userPhone);
        if (userName) subNames.push(userName);
        try {
          var winSubs = null;
          if (typeof window !== 'undefined' && Array.isArray(window.SUBACCOUNTS)) winSubs = window.SUBACCOUNTS;
          if (!winSubs) try { winSubs = JSON.parse(localStorage.getItem('mjyy_sub_accounts') || '[]'); } catch (e) {}
          if (Array.isArray(winSubs)) {
            for (var ki = 0; ki < winSubs.length; ki++) {
              var s = winSubs[ki];
              if (!s) continue;
              var hitSub = false;
              if (s.phone && subPhones.indexOf(s.phone) >= 0) hitSub = true;
              if (s.id && subIds.indexOf(s.id) >= 0) hitSub = true;
              if (s.name && subNames.indexOf(s.name) >= 0) hitSub = true;
              if (s.accountId && subIds.indexOf(s.accountId) >= 0) hitSub = true;
              if (hitSub) {
                if (s.id && subIds.indexOf(s.id) < 0) subIds.push(s.id);
                if (s.phone && subPhones.indexOf(s.phone) < 0) subPhones.push(s.phone);
                if (s.name && subNames.indexOf(s.name) < 0) subNames.push(s.name);
              }
            }
          }
        } catch (e) { /* ignore */ }

        for (var pi = 0; pi < projectsSrc.length; pi++) {
          var pj = projectsSrc[pi];
          if (!pj) continue;
          // 企业过滤：如果 project 有 enterpriseId，必须匹配 currentEnt.id
          if (entId && pj.enterpriseId && pj.enterpriseId !== entId) continue;

          var belong = false;
          // 2a) p.subs 子账号分配命中
          if (pj.subs && pj.subs.length) {
            for (var mi = 0; mi < pj.subs.length; mi++) {
              var sid = pj.subs[mi];
              if (subIds.indexOf(sid) >= 0) { belong = true; break; }
            }
          }
          // 2b) owner / 负责人命中（phone 或 name）
          if (!belong) {
            var pOwnerPhone = pj.phone || pj.ownerPhone || pj.mobile || '';
            var pOwnerName = pj.owner || pj.ownerName || pj.manager || '';
            if (pOwnerPhone && userPhone && pOwnerPhone === userPhone) belong = true;
            if (!belong && pOwnerName && userName && pOwnerName === userName) belong = true;
            // 登录名/账号ID兜底（若登录是 owner 的账号ID）
            if (!belong && userId && (pj.ownerId === userId || pj.ownerAccountId === userId)) belong = true;
          }
          if (!belong) continue;

          var pCode = pj.product || 'mjyy';
          dedupAdd(out, {
            productCode: pCode,
            productLabel: productLabels[pCode] || '民匠有约',
            projectId: pj.id || pj.projectId || pj.name,
            projectName: pj.name || pj.projectName || ''
          });
        }
      }
    } catch (e) { /* ignore */ }

    // —— 最终兜底：子账号匹配不到任何项目时，默认返回第一个 active 项目 ——
    // 场景：子账号登录但手机号/姓名未与项目 owner/subs 匹配上（如用户输入的子账号名在 SUBACCOUNTS 池里不存在）
    // 此时仍需展示"民匠有约·项目名"，否则用户会看到空白的下拉卡片
    if (out.length === 0) {
      try {
        var accountTypeFallback = localStorage.getItem('mjyy_account_type') || 'main';
        if (accountTypeFallback === 'sub') {
          // 取第一个 active 状态的项目作为默认展示
          var fbSrc = null;
          if (typeof window !== 'undefined' && Array.isArray(window.projects) && window.projects.length) fbSrc = window.projects;
          if (!fbSrc) try { fbSrc = JSON.parse(localStorage.getItem('mjyy_projects') || '[]'); } catch (e) {}
          if (fbSrc && fbSrc.length) {
            var fbProj = null;
            for (var fi = 0; fi < fbSrc.length; fi++) {
              if (fbSrc[fi] && fbSrc[fi].status !== 'inactive') { fbProj = fbSrc[fi]; break; }
            }
            if (!fbProj) fbProj = fbSrc[0]; // 全部 inactive 也取第一个
            if (fbProj) {
              var fbCode = fbProj.product || 'mjyy';
              out.push({
                productCode: fbCode,
                productLabel: productLabels[fbCode] || '民匠有约',
                projectId: fbProj.id || fbProj.projectId || fbProj.name,
                projectName: fbProj.name || fbProj.projectName || ''
              });
            }
          }
        }
      } catch (e) { /* ignore */ }
    }
    return out;
  }

  // ===== 组织架构：子账号 → 部门树 迁移 + 部门数据管理工具 =====
  // 设计文档：2026-08-25 组织架构管理（多级嵌套树形，部门替代子账号，资金账户单独开立，部门不绑定管理员靠角色控制）
  // 幂等：检测到 mjyy_departments 已存在则跳过；失败回滚（删除半成品，保留旧 mjyy_sub_accounts）

  // 读取所有部门（数组）
  function getDepartments() {
    try { return JSON.parse(localStorage.getItem('mjyy_departments') || '[]'); }
    catch (e) { return []; }
  }
  // 写入所有部门
  function setDepartments(list) {
    try { localStorage.setItem('mjyy_departments', JSON.stringify(list || [])); } catch (e) {}
  }
  // 生成部门ID
  function genDeptId() {
    return 'dept_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }
  // 根据 id 查部门
  function findDept(id) {
    var list = getDepartments();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }
  // 获取某部门的全部子孙（通过 path 前缀匹配，O(n)）
  function getDescendants(deptId) {
    var dept = findDept(deptId);
    if (!dept) return [];
    var prefix = dept.path + '/';
    return getDepartments().filter(function (d) {
      return d.id !== deptId && d.path && d.path.indexOf(prefix) === 0;
    });
  }
  // 获取某部门的全部祖先（通过 path 拆分）
  function getAncestors(deptId) {
    var dept = findDept(deptId);
    if (!dept) return [];
    var parts = dept.path.split('/').filter(Boolean);
    var result = [];
    var list = getDepartments();
    for (var i = 0; i < parts.length; i++) {
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === parts[i] && list[j].id !== deptId) result.push(list[j]);
      }
    }
    return result;
  }
  // 当前用户部门ID（null=主账号，可见全部）
  function getCurrentUserDeptId() {
    try {
      var ud = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
      if (ud.deptId) return ud.deptId;
      var accountType = localStorage.getItem('mjyy_account_type') || 'main';
      if (accountType === 'main') return null;
      // 子账号：尝试从用户数据匹配部门
      var subId = ud.accountId || ud.id || '';
      var subs = JSON.parse(localStorage.getItem('mjyy_sub_accounts') || '[]');
      for (var i = 0; i < subs.length; i++) {
        if (subs[i] && (subs[i].id === subId || subs[i].accountId === subId)) {
          return subs[i].deptId || null;
        }
      }
    } catch (e) {}
    return null;
  }
  // 按部门过滤数据：可见范围 = 本部门 + 子孙部门（path 前缀）；主账号（deptId=null）见全部
  function filterByDept(items, deptIdField) {
    var myDept = getCurrentUserDeptId();
    if (!myDept) return items; // 主账号见全部
    var dept = findDept(myDept);
    if (!dept) return items.filter(function (it) { return !it[deptIdField]; });
    var prefix = dept.path; // 本部门 + 子孙（子孙 path 以本部门 path 开头）
    return items.filter(function (it) {
      var dId = it[deptIdField];
      if (!dId) return false; // 未分配部门的不可见
      var d = findDept(dId);
      if (!d) return false;
      return d.path === prefix || d.path.indexOf(prefix + '/') === 0;
    });
  }
  // 构建树形结构（供 UI 递归渲染）
  function buildDeptTree(parentId) {
    var list = getDepartments();
    var children = list.filter(function (d) {
      return (parentId ? d.parentId === parentId : !d.parentId);
    }).sort(function (a, b) { return (a.sort || 0) - (b.sort || 0); });
    return children.map(function (c) {
      return {
        data: c,
        children: buildDeptTree(c.id)
      };
    });
  }
  // 防环校验：newParentId 是否是 deptId 或其子孙
  function isDescendant(deptId, possibleDescendantId) {
    var desc = getDescendants(deptId);
    for (var i = 0; i < desc.length; i++) {
      if (desc[i].id === possibleDescendantId) return true;
    }
    return false;
  }

  // 迁移：子账号 → 部门（幂等）
  function migrateSubAccountsToDepartments() {
    try {
      var existing = localStorage.getItem('mjyy_departments');
      if (existing) {
        try { var parsed = JSON.parse(existing); if (Array.isArray(parsed)) return false; }
        catch (e) { /* 损坏，继续迁移 */ }
      }
      var subs = [];
      try { subs = JSON.parse(localStorage.getItem('mjyy_sub_accounts') || '[]'); }
      catch (e) { subs = []; }
      var newDepts = [];
      var subIdToDeptId = {}; // 映射表：原子账号 id → 新部门 id
      subs.forEach(function (s, i) {
        if (!s) return;
        var sid = s.id || ('migrated_' + i);
        var did = 'dept_migrated_' + sid;
        subIdToDeptId[sid] = did;
        newDepts.push({
          id: did,
          name: s.name || s.subAccountName || ('部门' + (i + 1)),
          parentId: null,
          path: '/' + did,
          level: 0,
          status: 'active',
          sort: i,
          createdAt: s.createdAt || Date.now(),
          updatedAt: Date.now(),
          _migratedFrom: sid
        });
      });
      // 写入部门
      setDepartments(newDepts);
      // 回填 deptId：子账号
      try {
        var updatedSubs = subs.map(function (s) {
          if (!s) return s;
          var sid = s.id || '';
          var did = subIdToDeptId[sid];
          if (did) s.deptId = did;
          return s;
        });
        localStorage.setItem('mjyy_sub_accounts', JSON.stringify(updatedSubs));
      } catch (e) {}
      // 回填 deptId：项目（通过 owner 名/phone 关联的子账号 → 部门）
      try {
        var projects = JSON.parse(localStorage.getItem('mjyy_projects') || '[]');
        // 建立 owner 名/phone → deptId 映射
        var ownerToDept = {};
        subs.forEach(function (s) {
          if (!s) return;
          var sid = s.id || '';
          var did = subIdToDeptId[sid];
          if (did) {
            if (s.name) ownerToDept[s.name] = did;
            if (s.phone) ownerToDept[s.phone] = did;
          }
        });
        // 也用 subs 字段（项目.subs 是子账号 id 数组）→ 取第一个作为部门
        projects = projects.map(function (p) {
          if (!p) return p;
          if (p.deptId) return p; // 已有则跳过
          if (p.owner && ownerToDept[p.owner]) { p.deptId = ownerToDept[p.owner]; }
          else if (p.phone && ownerToDept[p.phone]) { p.deptId = ownerToDept[p.phone]; }
          else if (Array.isArray(p.subs) && p.subs.length) {
            var firstSub = p.subs[0];
            if (subIdToDept[firstSub]) p.deptId = subIdToDept[firstSub];
          }
          return p;
        });
        localStorage.setItem('mjyy_projects', JSON.stringify(projects));
        if (typeof window !== 'undefined' && Array.isArray(window.projects)) {
          window.projects = projects;
        }
      } catch (e) {}
      return true;
    } catch (e) {
      // 失败回滚：删除半成品部门数据，保留旧子账号
      try { localStorage.removeItem('mjyy_departments'); } catch (e2) {}
      return false;
    }
  }
  // 暴露部门工具到全局（供 account-organization.html 等页面调用）
  try {
    window.MJYYDept = {
      getDepartments: getDepartments,
      setDepartments: setDepartments,
      genDeptId: genDeptId,
      findDept: findDept,
      getDescendants: getDescendants,
      getAncestors: getAncestors,
      getCurrentUserDeptId: getCurrentUserDeptId,
      filterByDept: filterByDept,
      buildDeptTree: buildDeptTree,
      isDescendant: isDescendant,
      migrate: migrateSubAccountsToDepartments
    };
  } catch (e) {}

  // ===== 资金账户体系：主账号 + 部门独立账户 + 划拨/回收 + 流水 + 审计 =====
  // 设计文档：2026-08-25 第二阶段 资金账户体系（部门独立资金账本开立、主账号向部门划拨/回收资金）
  // 数据模型（localStorage）：
  //   mjyy_main_account  = { balance, frozen, totalIn, totalOut, updatedAt }
  //   mjyy_dept_accounts = [{ id, deptId, accountNo, balance, frozen, status, mode, totalIn, totalOut, openedAt, openedBy, closedAt, closedBy, frozenReason, updatedAt }]
  //   mjyy_fund_tx       = [{ id, no, type, fromType, fromId, toType, toId, amount, balanceBeforeFrom, balanceAfterFrom, balanceBeforeTo, balanceAfterTo, status, operator, remark, createdAt }]
  //   mjyy_fund_audit    = [{ id, action, targetType, targetId, targetName, operator, detail, before, after, createdAt }]
  // 账户类型: main(主账号) / dept(部门) / project(项目，兼容现有 account-project.html)
  // 流水类型: allocate(主→部门/项目) / recall(部门→主) / recharge(充值) / consume(消费) / refund(退款) / transfer(其他划转) / open / close / freeze / unfreeze / adjust

  // ---------- 通用工具 ----------
  function _fundPad(n) { return n < 10 ? '0' + n : '' + n; }
  function _fundFmtDate(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    return d.getFullYear() + '-' + _fundPad(d.getMonth() + 1) + '-' + _fundPad(d.getDate()) + ' ' + _fundPad(d.getHours()) + ':' + _fundPad(d.getMinutes()) + ':' + _fundPad(d.getSeconds());
  }
  function _fundFmtAmount(n) {
    return '¥ ' + Number(n || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  function _fundRound2(n) { return Math.round((Number(n || 0) + Number.EPSILON) * 100) / 100; }
  function _fundGenTxNo() {
    var d = new Date();
    return 'TX' + d.getFullYear() + _fundPad(d.getMonth() + 1) + _fundPad(d.getDate()) + _fundPad(d.getHours()) + _fundPad(d.getMinutes()) + _fundPad(d.getSeconds()) + String(Math.floor(Math.random() * 900) + 100);
  }
  function _fundGenLogId() { return 'log_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }
  function _fundGenAccNo(seq) { return 'MJYY-DEPT-' + String(seq).padStart(4, '0'); }

  // ---------- 主账号账户 ----------
  function getMainAccount() {
    var def = { balance: 128580.00, frozen: 0, totalIn: 0, totalOut: 0, updatedAt: Date.now() };
    try {
      var raw = localStorage.getItem('mjyy_main_account');
      if (!raw) { localStorage.setItem('mjyy_main_account', JSON.stringify(def)); return def; }
      var acc = JSON.parse(raw);
      if (typeof acc.balance !== 'number') acc.balance = def.balance;
      if (typeof acc.frozen !== 'number') acc.frozen = 0;
      if (typeof acc.totalIn !== 'number') acc.totalIn = 0;
      if (typeof acc.totalOut !== 'number') acc.totalOut = 0;
      return acc;
    } catch (e) { return def; }
  }
  function setMainAccount(acc) {
    try {
      acc.balance = _fundRound2(acc.balance);
      acc.frozen = _fundRound2(acc.frozen || 0);
      acc.totalIn = _fundRound2(acc.totalIn || 0);
      acc.totalOut = _fundRound2(acc.totalOut || 0);
      acc.updatedAt = Date.now();
      localStorage.setItem('mjyy_main_account', JSON.stringify(acc));
    } catch (e) {}
  }
  function getMainBalance() { return getMainAccount().balance; }

  // ---------- 部门资金账户 ----------
  function getDeptAccounts() {
    try { return JSON.parse(localStorage.getItem('mjyy_dept_accounts') || '[]'); }
    catch (e) { return []; }
  }
  function setDeptAccounts(list) {
    try { localStorage.setItem('mjyy_dept_accounts', JSON.stringify(list || [])); } catch (e) {}
  }
  function findDeptAccount(deptId) {
    var list = getDeptAccounts();
    for (var i = 0; i < list.length; i++) { if (list[i].deptId === deptId) return list[i]; }
    return null;
  }
  function _nextAccNoSeq() {
    var list = getDeptAccounts();
    var max = 0;
    for (var i = 0; i < list.length; i++) {
      var m = /(\d+)$/.exec(list[i].accountNo || '');
      if (m) { var n = parseInt(m[1], 10); if (n > max) max = n; }
    }
    return max + 1;
  }
  // 开立部门资金账户（mode: independent 财务独立 / managed 财务托管）
  // 若 initialBalance > 0 且主账号余额充足，自动从主账号划拨初始资金
  function openDeptAccount(deptId, mode, initialBalance, operator) {
    var dept = findDept(deptId);
    if (!dept) return { ok: false, msg: '部门不存在' };
    if (findDeptAccount(deptId)) return { ok: false, msg: '该部门已开立资金账户' };
    if (dept.status && dept.status !== 'active') return { ok: false, msg: '部门已停用，无法开立账户' };
    var list = getDeptAccounts();
    var initBal = _fundRound2(initialBalance || 0);
    var acc = {
      id: 'acc_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      deptId: deptId,
      accountNo: _fundGenAccNo(_nextAccNoSeq()),
      balance: 0,
      frozen: 0,
      status: 'active',
      mode: (mode === 'managed') ? 'managed' : 'independent',
      totalIn: 0,
      totalOut: 0,
      openedAt: Date.now(),
      openedBy: operator || '当前用户',
      closedAt: null,
      closedBy: '',
      frozenReason: '',
      updatedAt: Date.now()
    };
    list.push(acc);
    setDeptAccounts(list);
    addAuditLog('open_account', 'dept', deptId, dept.name, operator || '当前用户',
      '开立部门资金账户（' + (mode === 'managed' ? '财务托管' : '财务独立') + '）' + (initBal > 0 ? '，初始划拨 ' + _fundFmtAmount(initBal) : ''),
      null, acc);
    if (typeof addOpLog === 'function') addOpLog('fund', 'open_dept_account', operator || '当前用户', deptId, 'dept_account', deptId, dept.name,
      '开立部门资金账户（' + (mode === 'managed' ? '财务托管' : '财务独立') + '）' + (initBal > 0 ? '，初始划拨 ' + _fundFmtAmount(initBal) : ''), 'success');
    // 初始划拨：从主账号转入初始余额
    if (initBal > 0) {
      var main = getMainAccount();
      if (main.balance < initBal) {
        // 主账号余额不足：账户已开立但初始划拨失败，返回部分成功
        return { ok: true, account: acc, warning: '账户已开立，但主账号余额不足，初始划拨未执行' };
      }
      var beforeFrom = main.balance;
      var beforeTo = 0;
      main.balance = _fundRound2(main.balance - initBal);
      main.totalOut = _fundRound2(main.totalOut + initBal);
      setMainAccount(main);
      acc.balance = initBal;
      acc.totalIn = _fundRound2(acc.totalIn + initBal);
      acc.updatedAt = Date.now();
      for (var i = 0; i < list.length; i++) { if (list[i].id === acc.id) { list[i] = acc; break; } }
      setDeptAccounts(list);
      addTx('allocate', 'main', 'main', 'dept', deptId, initBal, beforeFrom, main.balance, beforeTo, acc.balance, operator || '当前用户', '开立账户初始划拨');
    }
    return { ok: true, account: acc };
  }
  function freezeDeptAccount(deptId, reason, operator) {
    var list = getDeptAccounts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].deptId === deptId) {
        if (list[i].status === 'closed') return { ok: false, msg: '账户已注销，无法冻结' };
        if (list[i].status === 'frozen') return { ok: false, msg: '账户已处于冻结状态' };
        var before = JSON.parse(JSON.stringify(list[i]));
        list[i].status = 'frozen';
        list[i].frozenReason = reason || '';
        list[i].updatedAt = Date.now();
        setDeptAccounts(list);
        var dept = findDept(deptId);
        addAuditLog('freeze_account', 'dept', deptId, dept ? dept.name : deptId, operator || '当前用户', '冻结部门资金账户' + (reason ? '：' + reason : ''), before, list[i]);
        if (typeof addOpLog === 'function') addOpLog('fund', 'freeze_dept_account', operator || '当前用户', deptId, 'dept_account', deptId, dept ? dept.name : deptId, '冻结部门资金账户' + (reason ? '：' + reason : ''), 'success');
        return { ok: true, account: list[i] };
      }
    }
    return { ok: false, msg: '部门资金账户不存在' };
  }
  function unfreezeDeptAccount(deptId, operator) {
    var list = getDeptAccounts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].deptId === deptId) {
        if (list[i].status !== 'frozen') return { ok: false, msg: '账户未冻结' };
        var before = JSON.parse(JSON.stringify(list[i]));
        list[i].status = 'active';
        list[i].frozenReason = '';
        list[i].updatedAt = Date.now();
        setDeptAccounts(list);
        var dept = findDept(deptId);
        addAuditLog('unfreeze_account', 'dept', deptId, dept ? dept.name : deptId, operator || '当前用户', '解冻部门资金账户', before, list[i]);
        if (typeof addOpLog === 'function') addOpLog('fund', 'unfreeze_dept_account', operator || '当前用户', deptId, 'dept_account', deptId, dept ? dept.name : deptId, '解冻部门资金账户', 'success');
        return { ok: true, account: list[i] };
      }
    }
    return { ok: false, msg: '部门资金账户不存在' };
  }
  function closeDeptAccount(deptId, operator) {
    var acc = findDeptAccount(deptId);
    if (!acc) return { ok: false, msg: '部门资金账户不存在' };
    if (acc.balance > 0 || acc.frozen > 0) return { ok: false, msg: '账户仍有余额/冻结金额，请先回收后再注销' };
    var list = getDeptAccounts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].deptId === deptId) {
        var before = JSON.parse(JSON.stringify(list[i]));
        list[i].status = 'closed';
        list[i].closedAt = Date.now();
        list[i].closedBy = operator || '当前用户';
        list[i].updatedAt = Date.now();
        setDeptAccounts(list);
        var dept = findDept(deptId);
        addAuditLog('close_account', 'dept', deptId, dept ? dept.name : deptId, operator || '当前用户', '注销部门资金账户', before, list[i]);
        if (typeof addOpLog === 'function') addOpLog('fund', 'close_dept_account', operator || '当前用户', deptId, 'dept_account', deptId, dept ? dept.name : deptId, '注销部门资金账户', 'success');
        return { ok: true, account: list[i] };
      }
    }
    return { ok: false, msg: '部门资金账户不存在' };
  }
  function getDeptBalance(deptId) {
    var acc = findDeptAccount(deptId);
    return acc ? acc.balance : 0;
  }
  // 调整部门账户余额（管理员手工调账，用于对账/纠错）
  function adjustDeptAccount(deptId, delta, remark, operator) {
    var list = getDeptAccounts();
    for (var i = 0; i < list.length; i++) {
      if (list[i].deptId === deptId) {
        if (list[i].status !== 'active') return { ok: false, msg: '账户已冻结/注销，无法调账' };
        var before = JSON.parse(JSON.stringify(list[i]));
        var d = _fundRound2(delta);
        var newBal = _fundRound2(before.balance + d);
        if (newBal < 0) return { ok: false, msg: '调账后余额不能为负' };
        list[i].balance = newBal;
        if (d > 0) list[i].totalIn = _fundRound2(list[i].totalIn + d);
        else list[i].totalOut = _fundRound2(list[i].totalOut - d);
        list[i].updatedAt = Date.now();
        setDeptAccounts(list);
        var dept = findDept(deptId);
        addTx('adjust', 'external', 'external', 'dept', deptId, Math.abs(d), before.balance, list[i].balance, before.balance, list[i].balance, operator || '当前用户', remark || '管理员调账');
        addAuditLog('adjust', 'dept', deptId, dept ? dept.name : deptId, operator || '当前用户', '调整部门账户余额 ' + (d >= 0 ? '+' : '') + _fundFmtAmount(d) + '：' + (remark || '管理员调账'), before, list[i]);
        if (typeof addOpLog === 'function') addOpLog('fund', 'adjust_dept_account', operator || '当前用户', deptId, 'dept_account', deptId, dept ? dept.name : deptId, '调整部门账户余额 ' + (d >= 0 ? '+' : '') + _fundFmtAmount(d) + '：' + (remark || '管理员调账'), 'success');
        return { ok: true, account: list[i] };
      }
    }
    return { ok: false, msg: '部门资金账户不存在' };
  }

  // ---------- 资金划拨/回收 ----------
  // fromType/toType: 'main' | 'dept' | 'project'（project 由调用方自行更新项目 balance）
  function _getAccountRef(type, id) {
    if (type === 'main') return getMainAccount();
    if (type === 'dept') return findDeptAccount(id);
    return null; // project 由调用方处理
  }
  function _setAccountRef(type, id, value) {
    if (type === 'main') { setMainAccount(value); return true; }
    if (type === 'dept') {
      var list = getDeptAccounts();
      for (var i = 0; i < list.length; i++) { if (list[i].deptId === id) { list[i] = value; break; } }
      setDeptAccounts(list);
      return true;
    }
    return false;
  }
  // 通用划拨（主→部门、部门→主、主→项目、部门→项目、项目→主、项目→部门、项目→项目）
  // 注意：涉及 project 账户时，调用方需在调用后自行更新项目的 balance/totalIn/totalOut 字段
  function allocateFunds(fromType, fromId, toType, toId, amount, remark, operator) {
    amount = _fundRound2(amount);
    if (amount <= 0) return { ok: false, msg: '划拨金额必须大于 0' };
    if (fromType === toType && fromId === toId) return { ok: false, msg: '转出和转入账户不能相同' };
    var from = _getAccountRef(fromType, fromId);
    var to = _getAccountRef(toType, toId);
    if (fromType !== 'project' && !from) return { ok: false, msg: '转出账户不存在' };
    if (toType !== 'project' && !to) return { ok: false, msg: '转入账户不存在' };
    if (fromType === 'dept' && from.status !== 'active') return { ok: false, msg: '转出部门账户已冻结/注销' };
    if (toType === 'dept' && to.status === 'closed') return { ok: false, msg: '转入部门账户已注销' };
    if (toType === 'dept' && to.status === 'frozen') return { ok: false, msg: '转入部门账户已冻结' };
    var fromBalance = (fromType === 'project') ? (from ? from.balance : 0) : from.balance;
    if (amount > fromBalance) return { ok: false, msg: '可用余额不足：' + _fundFmtAmount(fromBalance) };

    var beforeFrom = (fromType === 'project') ? fromBalance : from.balance;
    var beforeTo = (toType === 'project') ? (to ? to.balance : 0) : to.balance;
    if (fromType === 'main') {
      from.balance = _fundRound2(from.balance - amount);
      from.totalOut = _fundRound2(from.totalOut + amount);
      _setAccountRef('main', null, from);
    } else if (fromType === 'dept') {
      from.balance = _fundRound2(from.balance - amount);
      from.totalOut = _fundRound2(from.totalOut + amount);
      from.updatedAt = Date.now();
      _setAccountRef('dept', fromId, from);
    }
    if (toType === 'main') {
      to.balance = _fundRound2(to.balance + amount);
      to.totalIn = _fundRound2(to.totalIn + amount);
      _setAccountRef('main', null, to);
    } else if (toType === 'dept') {
      to.balance = _fundRound2(to.balance + amount);
      to.totalIn = _fundRound2(to.totalIn + amount);
      to.updatedAt = Date.now();
      _setAccountRef('dept', toId, to);
    }
    var txType = (fromType === 'main') ? 'allocate' : ((toType === 'main') ? 'recall' : 'transfer');
    var afterFrom = (fromType === 'project') ? fromBalance : from.balance;
    var afterTo = (toType === 'project') ? (to ? to.balance : 0) : to.balance;
    addTx(txType, fromType, fromId, toType, toId, amount, beforeFrom, afterFrom, beforeTo, afterTo, operator || '当前用户', remark || '资金划拨');
    // 同步写入统一操作日志（addOpLog 在第三阶段审批模块中定义，函数声明会提升）
    if (typeof addOpLog === 'function') {
      var _opAction = (txType === 'allocate') ? 'allocate_to_dept' : (txType === 'recall' ? 'recall_from_dept' : 'transfer_fund');
      var _opTarget = (toType === 'dept') ? (findDept(toId) ? findDept(toId).name : toId) : (toType === 'main' ? '主账号' : toId);
      addOpLog('fund', _opAction, operator || '当前用户', (fromType === 'dept' ? fromId : null),
        (toType === 'dept' ? 'dept_account' : 'main_account'), toId, _opTarget,
        (txType === 'allocate' ? '划拨' : txType === 'recall' ? '回收' : '划转') + ' ' + _fundFmtAmount(amount) + '（' + (remark || '资金划拨') + '）', 'success');
    }
    return { ok: true, beforeFrom: beforeFrom, afterFrom: afterFrom, beforeTo: beforeTo, afterTo: afterTo };
  }
  function allocateToDept(deptId, amount, remark, operator) { return allocateFunds('main', 'main', 'dept', deptId, amount, remark, operator); }
  function recallFromDept(deptId, amount, remark, operator) { return allocateFunds('dept', deptId, 'main', 'main', amount, remark, operator); }
  // 主账号充值
  function rechargeMain(amount, method, remark, operator) {
    amount = _fundRound2(amount);
    if (amount <= 0) return { ok: false, msg: '充值金额必须大于 0' };
    var main = getMainAccount();
    var before = main.balance;
    main.balance = _fundRound2(main.balance + amount);
    main.totalIn = _fundRound2(main.totalIn + amount);
    setMainAccount(main);
    addTx('recharge', 'external', 'external', 'main', 'main', amount, before, main.balance, before, main.balance, operator || '当前用户', (method ? '[' + method + '] ' : '') + (remark || '充值'));
    addAuditLog('recharge', 'main', 'main', '主账号', operator || '当前用户', '主账号充值 ' + _fundFmtAmount(amount) + (method ? '（' + method + '）' : ''), null, main);
    if (typeof addOpLog === 'function') addOpLog('fund', 'recharge_main', operator || '当前用户', null, 'main_account', 'main', '主账号', '主账号充值 ' + _fundFmtAmount(amount) + (method ? '（' + method + '）' : '') + '：' + (remark || '充值'), 'success');
    return { ok: true, account: main };
  }

  // ---------- 流水 ----------
  function getTransactions(filter) {
    var list;
    try { list = JSON.parse(localStorage.getItem('mjyy_fund_tx') || '[]'); }
    catch (e) { return []; }
    if (!filter) return list;
    return list.filter(function (tx) {
      if (filter.type && tx.type !== filter.type) return false;
      if (filter.accountKey) {
        var k = filter.accountKey;
        var hitFrom = (k === 'main' && tx.fromType === 'main') || (tx.fromType === 'dept' && k === 'dept:' + tx.fromId) || (tx.fromType === 'project' && k === tx.fromId);
        var hitTo = (k === 'main' && tx.toType === 'main') || (tx.toType === 'dept' && k === 'dept:' + tx.toId) || (tx.toType === 'project' && k === tx.toId);
        if (!hitFrom && !hitTo) return false;
      }
      return true;
    });
  }
  function addTx(type, fromType, fromId, toType, toId, amount, beforeFrom, afterFrom, beforeTo, afterTo, operator, remark) {
    var list = getTransactions();
    list.unshift({
      id: 'tx_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      no: _fundGenTxNo(),
      type: type,
      fromType: fromType, fromId: fromId,
      toType: toType, toId: toId,
      amount: _fundRound2(amount),
      balanceBeforeFrom: _fundRound2(beforeFrom),
      balanceAfterFrom: _fundRound2(afterFrom),
      balanceBeforeTo: _fundRound2(beforeTo),
      balanceAfterTo: _fundRound2(afterTo),
      status: 'success',
      operator: operator || '当前用户',
      remark: remark || '',
      createdAt: Date.now()
    });
    try { localStorage.setItem('mjyy_fund_tx', JSON.stringify(list.slice(0, 500))); } catch (e) {}
  }

  // ---------- 审计日志 ----------
  function getAuditLogs(filter) {
    var list;
    try { list = JSON.parse(localStorage.getItem('mjyy_fund_audit') || '[]'); }
    catch (e) { return []; }
    if (!filter) return list;
    return list.filter(function (l) {
      if (filter.action && l.action !== filter.action) return false;
      if (filter.targetType && l.targetType !== filter.targetType) return false;
      if (filter.targetId && l.targetId !== filter.targetId) return false;
      return true;
    });
  }
  function addAuditLog(action, targetType, targetId, targetName, operator, detail, before, after) {
    var list = getAuditLogs();
    list.unshift({
      id: _fundGenLogId(),
      action: action,
      targetType: targetType, targetId: targetId, targetName: targetName,
      operator: operator || '当前用户',
      detail: detail || '',
      before: before || null,
      after: after || null,
      createdAt: Date.now()
    });
    try { localStorage.setItem('mjyy_fund_audit', JSON.stringify(list.slice(0, 500))); } catch (e) {}
  }

  // ---------- 通用账户余额查询（兼容现有 getAccountBalance） ----------
  // accountKey: 'main' / 'dept:<deptId>' / 'prj:<projectId>'
  function getAccountBalanceByKey(accountKey) {
    if (accountKey === 'main' || accountKey === 'enterprise') return getMainBalance();
    if (accountKey && accountKey.indexOf('dept:') === 0) return getDeptBalance(accountKey.replace('dept:', ''));
    return 0; // project 由调用方处理
  }

  // 暴露资金账户工具到全局
  try {
    window.MJYYFund = {
      // 工具
      fmtAmount: _fundFmtAmount,
      fmtDate: _fundFmtDate,
      round2: _fundRound2,
      // 主账号
      getMainAccount: getMainAccount,
      setMainAccount: setMainAccount,
      getMainBalance: getMainBalance,
      rechargeMain: rechargeMain,
      // 部门账户
      getDeptAccounts: getDeptAccounts,
      setDeptAccounts: setDeptAccounts,
      findDeptAccount: findDeptAccount,
      openDeptAccount: openDeptAccount,
      freezeDeptAccount: freezeDeptAccount,
      unfreezeDeptAccount: unfreezeDeptAccount,
      closeDeptAccount: closeDeptAccount,
      adjustDeptAccount: adjustDeptAccount,
      getDeptBalance: getDeptBalance,
      // 划拨/回收
      allocateFunds: allocateFunds,
      allocateToDept: allocateToDept,
      recallFromDept: recallFromDept,
      // 流水
      getTransactions: getTransactions,
      addTx: addTx,
      // 审计
      getAuditLogs: getAuditLogs,
      addAuditLog: addAuditLog,
      // 通用
      getAccountBalanceByKey: getAccountBalanceByKey
    };
  } catch (e) {}

  // ===== 多级审批流程 + 通用操作日志审计 =====
  // 设计文档：2026-08-25 第三阶段 多级审批流程与操作日志审计
  // 数据模型（localStorage）：
  //   mjyy_approval_rules = [{ id, code, name, enabled, condition:{minAmount,operationTypes[]}, levels:[{seq, roleNames[], description}], autoExecute, createdAt, updatedAt }]
  //   mjyy_approvals      = [{ id, no, ruleId, ruleCode, ruleName, title, applicant, applicantDeptId, targetType, targetId, targetName, operationType, payload, executorFn, status, currentLevel, nodes:[{seq, roleNames[], approver, decision, comment, decidedAt}], createdAt, updatedAt, executedAt, executeResult }]
  //   mjyy_op_logs        = [{ id, module, action, operator, operatorDeptId, targetType, targetId, targetName, detail, ip, userAgent, result, createdAt }]
  // 审批状态：pending(待审批) / approving(审批中) / approved(全部通过) / rejected(任一驳回) / cancelled(申请人撤销) / executed(已执行) / failed(执行失败)
  // 审批节点状态：pending / approved / rejected
  // 执行器注册表：window.MJYYApprovalExecutors[executorFn] = function(payload, operator) => {ok, msg}

  // ---------- 通用工具 ----------
  function _apPad(n) { return n < 10 ? '0' + n : '' + n; }
  function _apFmtDate(ts) {
    if (!ts) return '-';
    var d = new Date(ts);
    return d.getFullYear() + '-' + _apPad(d.getMonth() + 1) + '-' + _apPad(d.getDate()) + ' ' + _apPad(d.getHours()) + ':' + _apPad(d.getMinutes()) + ':' + _apPad(d.getSeconds());
  }
  function _apGenId(prefix) { return (prefix || 'ap_') + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6); }
  function _apGenNo() {
    var d = new Date();
    return 'AP' + d.getFullYear() + _apPad(d.getMonth() + 1) + _apPad(d.getDate()) + _apPad(d.getHours()) + _apPad(d.getMinutes()) + _apPad(d.getSeconds()) + String(Math.floor(Math.random() * 900) + 100);
  }
  function _apDeepClone(o) { return o == null ? null : JSON.parse(JSON.stringify(o)); }

  // ---------- 当前用户角色获取（适配现有简单角色体系） ----------
  // 主账号 → ['主管理员']；子账号 → mjyy_user_data.roleNames / roleName，无则 ['部门负责人'] 若为本部门创建者，否则 ['普通用户']
  function getCurrentUserRoles() {
    try {
      var accountType = localStorage.getItem('mjyy_account_type') || 'main';
      if (accountType === 'main') return ['主管理员'];
      var ud = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
      if (Array.isArray(ud.roleNames) && ud.roleNames.length) return ud.roleNames;
      if (ud.roleName) return [ud.roleName];
      // 兜底：子账号默认为部门负责人
      return ['部门负责人'];
    } catch (e) { return ['主管理员']; }
  }
  function getCurrentOperator() {
    try {
      var ud = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
      return ud.username || ud.name || ud.realName || '当前用户';
    } catch (e) { return '当前用户'; }
  }

  // ---------- 审批规则 ----------
  // 默认规则（首次初始化时写入）
  function _defaultApprovalRules() {
    var now = Date.now();
    return [
      {
        id: 'rule_allocate_large', code: 'allocate_large', name: '大额资金划拨审批',
        enabled: true,
        condition: { minAmount: 10000, operationTypes: ['allocate_to_dept', 'recall_from_dept'] },
        levels: [
          { seq: 0, roleNames: ['部门负责人'], description: '部门负责人初审' },
          { seq: 1, roleNames: ['主管理员', '财务主管'], description: '主管理员或财务主管终审' }
        ],
        autoExecute: true,
        createdAt: now, updatedAt: now
      },
      {
        id: 'rule_recharge_large', code: 'recharge_large', name: '大额充值审批',
        enabled: true,
        condition: { minAmount: 50000, operationTypes: ['recharge_main'] },
        levels: [
          { seq: 0, roleNames: ['财务主管', '主管理员'], description: '财务主管或主管理员审批' }
        ],
        autoExecute: true,
        createdAt: now, updatedAt: now
      },
      {
        id: 'rule_freeze_account', code: 'freeze_account', name: '部门账户冻结审批',
        enabled: true,
        condition: { minAmount: 0, operationTypes: ['freeze_dept_account', 'unfreeze_dept_account'] },
        levels: [
          { seq: 0, roleNames: ['主管理员', '财务主管'], description: '主管理员审批' }
        ],
        autoExecute: true,
        createdAt: now, updatedAt: now
      },
      {
        id: 'rule_close_account', code: 'close_account', name: '部门账户注销审批',
        enabled: true,
        condition: { minAmount: 0, operationTypes: ['close_dept_account'] },
        levels: [
          { seq: 0, roleNames: ['主管理员'], description: '主管理员终审' }
        ],
        autoExecute: true,
        createdAt: now, updatedAt: now
      },
      {
        id: 'rule_adjust_account', code: 'adjust_account', name: '部门账户调账审批',
        enabled: true,
        condition: { minAmount: 1000, operationTypes: ['adjust_dept_account'] },
        levels: [
          { seq: 0, roleNames: ['财务主管', '主管理员'], description: '财务主管或主管理员审批' }
        ],
        autoExecute: true,
        createdAt: now, updatedAt: now
      }
    ];
  }
  function getApprovalRules() {
    try {
      var raw = localStorage.getItem('mjyy_approval_rules');
      if (!raw) {
        var def = _defaultApprovalRules();
        localStorage.setItem('mjyy_approval_rules', JSON.stringify(def));
        return def;
      }
      return JSON.parse(raw);
    } catch (e) { return _defaultApprovalRules(); }
  }
  function setApprovalRules(list) {
    try { localStorage.setItem('mjyy_approval_rules', JSON.stringify(list || [])); } catch (e) {}
  }
  function findApprovalRule(code) {
    var list = getApprovalRules();
    for (var i = 0; i < list.length; i++) { if (list[i].code === code) return list[i]; }
    return null;
  }
  function updateApprovalRule(rule) {
    var list = getApprovalRules();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === rule.id || list[i].code === rule.code) {
        rule.updatedAt = Date.now();
        list[i] = rule;
        setApprovalRules(list);
        return true;
      }
    }
    return false;
  }

  // ---------- 判断操作是否需要审批 ----------
  // operationType: allocate_to_dept / recall_from_dept / recharge_main / freeze_dept_account / unfreeze_dept_account / close_dept_account / adjust_dept_account
  // amount: 涉及金额（无金额操作传 0）
  function checkApprovalRequired(operationType, amount) {
    amount = Number(amount || 0);
    var rules = getApprovalRules();
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      if (!r.enabled) continue;
      var cond = r.condition || {};
      var types = cond.operationTypes || [];
      if (types.indexOf(operationType) < 0) continue;
      if (typeof cond.minAmount === 'number' && amount < cond.minAmount) continue;
      return { required: true, rule: r };
    }
    return { required: false, rule: null };
  }

  // ---------- 审批单 CRUD ----------
  function getApprovals(filter) {
    var list;
    try { list = JSON.parse(localStorage.getItem('mjyy_approvals') || '[]'); }
    catch (e) { return []; }
    if (!filter) return list;
    return list.filter(function (a) {
      if (filter.status && a.status !== filter.status) return false;
      if (filter.applicant && a.applicant !== filter.applicant) return false;
      if (filter.ruleCode && a.ruleCode !== filter.ruleCode) return false;
      if (filter.operationType && a.operationType !== filter.operationType) return false;
      return true;
    });
  }
  function setApprovals(list) {
    try { localStorage.setItem('mjyy_approvals', JSON.stringify((list || []).slice(0, 500))); } catch (e) {}
  }
  function findApproval(id) {
    var list = getApprovals();
    for (var i = 0; i < list.length; i++) { if (list[i].id === id) return list[i]; }
    return null;
  }

  // ---------- 发起审批 ----------
  // payload: 操作参数（用于自动执行）；executorFn: 执行器函数标识（注册在 window.MJYYApprovalExecutors）
  function createApproval(ruleCode, operationType, payload, executorFn, applicant, applicantDeptId, targetInfo, amount) {
    var rule = findApprovalRule(ruleCode);
    if (!rule) return { ok: false, msg: '审批规则不存在：' + ruleCode };
    applicant = applicant || getCurrentOperator();
    var dept = applicantDeptId ? findDept(applicantDeptId) : null;
    var approval = {
      id: _apGenId('approval_'),
      no: _apGenNo(),
      ruleId: rule.id, ruleCode: rule.code, ruleName: rule.name,
      title: rule.name + (targetInfo && targetInfo.targetName ? ' · ' + targetInfo.targetName : ''),
      applicant: applicant,
      applicantDeptId: applicantDeptId || null,
      applicantDeptName: dept ? dept.name : null,
      targetType: (targetInfo && targetInfo.targetType) || null,
      targetId: (targetInfo && targetInfo.targetId) || null,
      targetName: (targetInfo && targetInfo.targetName) || null,
      operationType: operationType,
      amount: Number(amount || 0),
      payload: payload || {},
      executorFn: executorFn || null,
      status: 'pending',
      currentLevel: 0,
      nodes: (rule.levels || []).map(function (lv) {
        return {
          seq: lv.seq,
          roleNames: (lv.roleNames || []).slice(),
          description: lv.description || '',
          approver: '',
          decision: 'pending',
          comment: '',
          decidedAt: null
        };
      }),
      autoExecute: !!rule.autoExecute,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      executedAt: null,
      executeResult: null
    };
    var list = getApprovals();
    list.unshift(approval);
    setApprovals(list);
    addOpLog('approval', 'create_approval', applicant, applicantDeptId, 'approval', approval.id, approval.no,
      '发起审批：' + approval.title + '（' + rule.name + '）' + (amount > 0 ? '，金额 ' + (window.MJYYFund ? window.MJYYFund.fmtAmount(amount) : amount) : ''), 'success');
    return { ok: true, approval: approval };
  }

  // ---------- 判断当前用户能否审批某审批单的当前节点 ----------
  function canApprove(approvalId) {
    var a = findApproval(approvalId);
    if (!a) return { can: false, reason: '审批单不存在' };
    if (a.status !== 'pending' && a.status !== 'approving') return { can: false, reason: '审批单状态为 ' + a.status + '，不可审批' };
    if (a.currentLevel >= a.nodes.length) return { can: false, reason: '已无待审批节点' };
    var node = a.nodes[a.currentLevel];
    if (node.decision !== 'pending') return { can: false, reason: '当前节点已决策' };
    var myRoles = getCurrentUserRoles();
    var hasRole = (node.roleNames || []).some(function (r) { return myRoles.indexOf(r) >= 0; });
    if (!hasRole) return { can: false, reason: '当前角色无权审批此节点（需：' + (node.roleNames || []).join(' / ') + '）' };
    // 防自审：申请人不能审批自己的单
    var me = getCurrentOperator();
    if (a.applicant === me) return { can: false, reason: '不能审批自己发起的审批单' };
    return { can: true, node: node, myRoles: myRoles };
  }

  // ---------- 审批决策（approve / reject） ----------
  function decideApproval(approvalId, decision, comment, operator) {
    var check = canApprove(approvalId);
    if (!check.can) return { ok: false, msg: check.reason };
    if (decision !== 'approved' && decision !== 'rejected') return { ok: false, msg: '决策值非法' };
    operator = operator || getCurrentOperator();
    var list = getApprovals();
    var idx = -1;
    for (var i = 0; i < list.length; i++) { if (list[i].id === approvalId) { idx = i; break; } }
    if (idx < 0) return { ok: false, msg: '审批单不存在' };
    var a = list[idx];
    var node = a.nodes[a.currentLevel];
    node.approver = operator;
    node.decision = decision;
    node.comment = comment || '';
    node.decidedAt = Date.now();
    a.updatedAt = Date.now();
    addOpLog('approval', 'decide_approval', operator, null, 'approval', a.id, a.no,
      '审批' + (decision === 'approved' ? '通过' : '驳回') + '（第' + (a.currentLevel + 1) + '级）：' + (comment || '无意见'), 'success');

    if (decision === 'rejected') {
      a.status = 'rejected';
      setApprovals(list);
      return { ok: true, approval: a, finalStatus: 'rejected' };
    }
    // approved：进入下一级
    a.currentLevel = a.currentLevel + 1;
    if (a.currentLevel >= a.nodes.length) {
      // 全部通过
      a.status = 'approved';
      setApprovals(list);
      // 自动执行
      if (a.autoExecute && a.executorFn) {
        var execResult = executeApproval(a.id, operator);
        return { ok: true, approval: a, finalStatus: 'approved', executed: true, executeResult: execResult };
      }
      return { ok: true, approval: a, finalStatus: 'approved' };
    }
    // 还有下一级
    a.status = 'approving';
    setApprovals(list);
    return { ok: true, approval: a, finalStatus: 'approving', nextLevel: a.currentLevel };
  }

  // ---------- 执行审批单（通过后自动或手动触发） ----------
  function executeApproval(approvalId, operator) {
    var a = findApproval(approvalId);
    if (!a) return { ok: false, msg: '审批单不存在' };
    if (a.status !== 'approved' && a.status !== 'executed') return { ok: false, msg: '审批单未通过，不可执行' };
    if (a.status === 'executed') return { ok: false, msg: '审批单已执行' };
    if (!a.executorFn) return { ok: false, msg: '审批单未配置执行器' };
    var executors = window.MJYYApprovalExecutors || {};
    var fn = executors[a.executorFn];
    if (typeof fn !== 'function') return { ok: false, msg: '执行器未注册：' + a.executorFn };
    operator = operator || a.applicant;
    var result;
    try { result = fn(a.payload, operator); }
    catch (e) { result = { ok: false, msg: '执行异常：' + (e && e.message || String(e)) }; }
    var list = getApprovals();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === approvalId) {
        list[i].status = result.ok ? 'executed' : 'failed';
        list[i].executedAt = Date.now();
        list[i].executeResult = { ok: result.ok, msg: result.msg || '' };
        list[i].updatedAt = Date.now();
        break;
      }
    }
    setApprovals(list);
    addOpLog('approval', 'execute_approval', operator, null, 'approval', a.id, a.no,
      '执行审批单：' + (result.ok ? '成功' : '失败（' + (result.msg || '') + '）'), result.ok ? 'success' : 'failed');
    return result;
  }

  // ---------- 撤销审批（申请人主动撤销） ----------
  function cancelApproval(approvalId, reason, operator) {
    var a = findApproval(approvalId);
    if (!a) return { ok: false, msg: '审批单不存在' };
    if (a.status === 'executed' || a.status === 'cancelled') return { ok: false, msg: '审批单已' + (a.status === 'executed' ? '执行' : '撤销') + '，不可撤销' };
    operator = operator || getCurrentOperator();
    var me = getCurrentOperator();
    if (a.applicant !== me) return { ok: false, msg: '仅申请人可撤销审批单' };
    var list = getApprovals();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === approvalId) {
        list[i].status = 'cancelled';
        list[i].updatedAt = Date.now();
        break;
      }
    }
    setApprovals(list);
    addOpLog('approval', 'cancel_approval', operator, null, 'approval', a.id, a.no,
      '撤销审批：' + (reason || '无'), 'success');
    return { ok: true };
  }

  // ---------- 待我审批列表 ----------
  function getMyPendingApprovals() {
    var me = getCurrentOperator();
    var myRoles = getCurrentUserRoles();
    var list = getApprovals();
    return list.filter(function (a) {
      if (a.status !== 'pending' && a.status !== 'approving') return false;
      if (a.applicant === me) return false; // 不显示自己发起的
      if (a.currentLevel >= a.nodes.length) return false;
      var node = a.nodes[a.currentLevel];
      if (node.decision !== 'pending') return false;
      return (node.roleNames || []).some(function (r) { return myRoles.indexOf(r) >= 0; });
    });
  }
  function getMySubmittedApprovals() {
    var me = getCurrentOperator();
    return getApprovals({ applicant: me });
  }

  // ---------- 通用操作日志 ----------
  function getOpLogs(filter) {
    var list;
    try { list = JSON.parse(localStorage.getItem('mjyy_op_logs') || '[]'); }
    catch (e) { return []; }
    if (!filter) return list;
    return list.filter(function (l) {
      if (filter.module && l.module !== filter.module) return false;
      if (filter.action && l.action !== filter.action) return false;
      if (filter.operator && l.operator !== filter.operator) return false;
      if (filter.result && l.result !== filter.result) return false;
      return true;
    });
  }
  function addOpLog(module, action, operator, operatorDeptId, targetType, targetId, targetName, detail, result) {
    var list = getOpLogs();
    var dept = operatorDeptId ? findDept(operatorDeptId) : null;
    list.unshift({
      id: _apGenId('log_'),
      module: module, action: action,
      operator: operator || getCurrentOperator(),
      operatorDeptId: operatorDeptId || null,
      operatorDeptName: dept ? dept.name : null,
      targetType: targetType || null,
      targetId: targetId || null,
      targetName: targetName || null,
      detail: detail || '',
      ip: '127.0.0.1',
      userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      result: result || 'success',
      createdAt: Date.now()
    });
    try { localStorage.setItem('mjyy_op_logs', JSON.stringify(list.slice(0, 1000))); } catch (e) {}
  }

  // ---------- 执行器注册表 ----------
  try {
    window.MJYYApprovalExecutors = window.MJYYApprovalExecutors || {};
    // 资金账户相关执行器（与 MJYYFund 联动）
    if (window.MJYYFund) {
      // 大额划拨到部门
      window.MJYYApprovalExecutors['fund.allocateToDept'] = function (p, op) {
        return window.MJYYFund.allocateToDept(p.deptId, p.amount, p.remark || '审批通过后划拨', op);
      };
      // 从部门回收
      window.MJYYApprovalExecutors['fund.recallFromDept'] = function (p, op) {
        return window.MJYYFund.recallFromDept(p.deptId, p.amount, p.remark || '审批通过后回收', op);
      };
      // 主账号充值
      window.MJYYApprovalExecutors['fund.rechargeMain'] = function (p, op) {
        return window.MJYYFund.rechargeMain(p.amount, p.method || '在线充值', p.remark || '审批通过后充值', op);
      };
      // 冻结部门账户
      window.MJYYApprovalExecutors['fund.freezeDeptAccount'] = function (p, op) {
        return window.MJYYFund.freezeDeptAccount(p.deptId, p.reason || '审批通过后冻结', op);
      };
      // 解冻部门账户
      window.MJYYApprovalExecutors['fund.unfreezeDeptAccount'] = function (p, op) {
        return window.MJYYFund.unfreezeDeptAccount(p.deptId, op);
      };
      // 注销部门账户
      window.MJYYApprovalExecutors['fund.closeDeptAccount'] = function (p, op) {
        return window.MJYYFund.closeDeptAccount(p.deptId, op);
      };
      // 调整部门账户
      window.MJYYApprovalExecutors['fund.adjustDeptAccount'] = function (p, op) {
        return window.MJYYFund.adjustDeptAccount(p.deptId, p.delta, p.remark || '审批通过后调账', op);
      };
    }
  } catch (e) {}

  // 暴露审批与操作日志工具到全局
  try {
    window.MJYYApproval = {
      // 工具
      fmtDate: _apFmtDate,
      // 角色
      getCurrentUserRoles: getCurrentUserRoles,
      getCurrentOperator: getCurrentOperator,
      // 规则
      getRules: getApprovalRules,
      setRules: setApprovalRules,
      findRule: findApprovalRule,
      updateRule: updateApprovalRule,
      checkRequired: checkApprovalRequired,
      // 审批单
      list: getApprovals,
      find: findApproval,
      create: createApproval,
      decide: decideApproval,
      execute: executeApproval,
      cancel: cancelApproval,
      canApprove: canApprove,
      myPending: getMyPendingApprovals,
      mySubmitted: getMySubmittedApprovals,
      // 执行器注册
      registerExecutor: function (name, fn) { window.MJYYApprovalExecutors = window.MJYYApprovalExecutors || {}; window.MJYYApprovalExecutors[name] = fn; }
    };
    window.MJYYOpLog = {
      list: getOpLogs,
      add: addOpLog,
      fmtDate: _apFmtDate
    };
  } catch (e) {}

  // ===== 数据权限隔离 + 多部门独立账户视图 =====
  // 设计文档：2026-08-25 第四阶段 数据权限隔离与多部门独立账户视图
  // 权限模型（基于现有简单角色体系，无需重构用户角色系统）：
  //   主管理员  → scope=all     可见全部（主账号+所有部门+全部流水/审计/日志）
  //   财务主管      → scope=all_dept 可见全部部门账户+流水+审计，但不可见主账号余额变动
  //   部门负责人    → scope=dept_tree 可见本部门+子孙部门账户+相关流水
  //   部门成员/其他 → scope=dept_only 仅可见本部门账户概览+本人相关流水
  // 数据模型（不新增 localStorage，复用 mjyy_user_data.deptId / roleNames）：
  //   可见集合计算 = 当前用户 deptId + 其子孙部门 path 前缀
  //   主账号余额可见性 = 角色 ∈ {主管理员, 财务主管}
  //   跨部门操作权限 = scope=all 或 scope=all_dept 或 targetDeptId 在可见集合内

  // ---------- 权限工具 ----------
  function _permGetAccountType() {
    try { return (localStorage.getItem('mjyy_account_type') || 'main').toLowerCase(); }
    catch (e) { return 'main'; }
  }
  function _permGetUserData() {
    try { return JSON.parse(localStorage.getItem('mjyy_user_data') || '{}'); }
    catch (e) { return {}; }
  }
  // 当前用户角色列表（与 getCurrentUserRoles 等价，但隔离本模块以避免循环依赖）
  function _permGetRoles() {
    var accountType = _permGetAccountType();
    if (accountType === 'main') return ['主管理员'];
    var ud = _permGetUserData();
    if (Array.isArray(ud.roleNames) && ud.roleNames.length) return ud.roleNames;
    if (ud.roleName) return [ud.roleName];
    return ['部门负责人']; // 子账号兜底
  }
  function _permHasRole(roleNames, target) {
    if (!Array.isArray(roleNames) || !target) return false;
    for (var i = 0; i < roleNames.length; i++) {
      if (roleNames[i] === target) return true;
    }
    return false;
  }
  // 当前用户部门 ID（null=主账号）
  function _permGetCurrentDeptId() {
    var accountType = _permGetAccountType();
    if (accountType === 'main') return null;
    var ud = _permGetUserData();
    if (ud.deptId) return ud.deptId;
    // 兜底：从子账号列表反查
    try {
      var subId = ud.accountId || ud.id || '';
      var subs = JSON.parse(localStorage.getItem('mjyy_sub_accounts') || '[]');
      for (var i = 0; i < subs.length; i++) {
        if (subs[i] && (subs[i].id === subId || subs[i].accountId === subId)) {
          return subs[i].deptId || null;
        }
      }
    } catch (e) {}
    return null;
  }
  // 可见部门 ID 集合（含本部门 + 子孙部门；主账号/财务主管返回 null 表示"全部"）
  function _permGetVisibleDeptIds() {
    var roles = _permGetRoles();
    if (_permHasRole(roles, '主管理员') || _permHasRole(roles, '财务主管')) {
      return null; // null = 全部部门
    }
    var myDeptId = _permGetCurrentDeptId();
    if (!myDeptId) return []; // 子账号但无部门 → 空集合
    var result = [myDeptId];
    // 加入子孙部门
    try {
      if (typeof getDescendants === 'function') {
        var desc = getDescendants(myDeptId);
        for (var i = 0; i < desc.length; i++) {
          if (desc[i] && desc[i].id) result.push(desc[i].id);
        }
      }
    } catch (e) {}
    return result;
  }
  // 当前用户数据可见范围
  function getCurrentScope() {
    var roles = _permGetRoles();
    var deptId = _permGetCurrentDeptId();
    var scope;
    if (_permHasRole(roles, '主管理员')) scope = 'all';
    else if (_permHasRole(roles, '财务主管')) scope = 'all_dept';
    else if (_permHasRole(roles, '部门负责人')) scope = 'dept_tree';
    else scope = 'dept_only';
    return {
      scope: scope,
      deptId: deptId,
      roleNames: roles,
      visibleDeptIds: _permGetVisibleDeptIds(), // null=全部
      canViewMain: scope === 'all' || scope === 'all_dept',
      canViewAllDept: scope === 'all' || scope === 'all_dept'
    };
  }
  // 是否可查看主账号余额（仅主管理员 + 财务主管）
  function canViewMainAccount() {
    var s = getCurrentScope();
    return !!s.canViewMain;
  }
  // 是否可管理某部门（编辑/调账/冻结等）
  function canManageDept(deptId) {
    var s = getCurrentScope();
    if (s.scope === 'all' || s.scope === 'all_dept') return true;
    if (!deptId) return false;
    if (s.visibleDeptIds == null) return true;
    for (var i = 0; i < s.visibleDeptIds.length; i++) {
      if (s.visibleDeptIds[i] === deptId) return true;
    }
    return false;
  }
  // 资金操作权限校验
  // operation: allocate_to_dept / recall_from_dept / recharge / freeze / unfreeze / close / adjust / open
  function canOperateFund(operation, amount, targetDeptId) {
    var s = getCurrentScope();
    var roles = s.roleNames;
    // 主管理员：全部允许
    if (s.scope === 'all') return { ok: true };
    // 财务主管：除"主账号充值"和"注销"外的部门操作
    if (s.scope === 'all_dept') {
      if (operation === 'recharge') return { ok: false, msg: '财务主管不可执行主账号充值' };
      if (operation === 'close') return { ok: false, msg: '财务主管不可注销部门账户，需主管理员' };
      return { ok: true };
    }
    // 部门负责人：仅本部门+子孙部门内的调账/查看，不可跨部门划拨/冻结/注销
    if (s.scope === 'dept_tree') {
      if (operation === 'recharge') return { ok: false, msg: '部门负责人不可执行主账号充值' };
      if (operation === 'close') return { ok: false, msg: '部门负责人不可注销账户' };
      if (operation === 'freeze' || operation === 'unfreeze') return { ok: false, msg: '部门负责人不可冻结/解冻账户' };
      if (operation === 'allocate_to_dept' || operation === 'recall_from_dept') {
        // 跨部门划拨需审批，本部门内调账允许
        if (amount && amount >= 10000) return { ok: false, msg: '大额资金操作需主管理员审批' };
        if (!canManageDept(targetDeptId)) return { ok: false, msg: '不可操作非管辖部门' };
        return { ok: true };
      }
      if (operation === 'adjust') {
        if (!canManageDept(targetDeptId)) return { ok: false, msg: '不可调账非管辖部门' };
        return { ok: true };
      }
      if (operation === 'open') return { ok: false, msg: '部门负责人不可开立部门账户' };
      return { ok: false, msg: '部门负责人无此操作权限' };
    }
    // 部门成员：仅查看
    return { ok: false, msg: '当前角色无操作权限，请联系部门负责人或主管理员' };
  }
  // 过滤部门账户列表
  function filterDeptAccountsByPerm(list) {
    var s = getCurrentScope();
    if (s.canViewAllDept) return list || []; // 主管理员/财务主管：全部
    var visible = s.visibleDeptIds || [];
    var visibleSet = {};
    for (var i = 0; i < visible.length; i++) visibleSet[visible[i]] = true;
    return (list || []).filter(function (a) { return !!visibleSet[a.deptId]; });
  }
  // 过滤资金流水（按 fromType/fromId / toType/toId 是否涉及可见部门）
  function filterFundTxByPerm(list) {
    var s = getCurrentScope();
    if (s.canViewAllDept) return list || [];
    var visible = s.visibleDeptIds || [];
    var visibleSet = {};
    for (var i = 0; i < visible.length; i++) visibleSet[visible[i]] = true;
    // 部门成员：仅可见本人相关的流水（operator === 本人）
    var me = (function () {
      try { var ud = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}'); return ud.username || ud.name || ''; }
      catch (e) { return ''; }
    })();
    return (list || []).filter(function (t) {
      var fromMatched = t.fromType === 'dept' && visibleSet[t.fromId];
      var toMatched = t.toType === 'dept' && visibleSet[t.toId];
      if (fromMatched || toMatched) return true;
      // 部门成员：本人作为操作人/审批人参与的也可见
      if (s.scope === 'dept_only' && me && t.operator === me) return true;
      return false;
    });
  }
  // 过滤操作审计日志
  function filterAuditLogsByPerm(list) {
    var s = getCurrentScope();
    if (s.canViewAllDept) return list || [];
    var visible = s.visibleDeptIds || [];
    var visibleSet = {};
    for (var i = 0; i < visible.length; i++) visibleSet[visible[i]] = true;
    return (list || []).filter(function (l) {
      if (l.targetType === 'dept' && visibleSet[l.targetId]) return true;
      return false;
    });
  }
  // 过滤通用操作日志（MJYYOpLog）
  function filterOpLogsByPerm(list) {
    var s = getCurrentScope();
    if (s.canViewAllDept) return list || [];
    var visible = s.visibleDeptIds || [];
    var visibleSet = {};
    for (var i = 0; i < visible.length; i++) visibleSet[visible[i]] = true;
    var me = (function () {
      try { var ud = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}'); return ud.username || ud.name || ''; }
      catch (e) { return ''; }
    })();
    return (list || []).filter(function (l) {
      // 本人发起的操作可见
      if (me && l.operator === me) return true;
      // 涉及可见部门的操作可见
      if (l.targetType === 'dept_account' && visibleSet[l.targetId]) return true;
      if (l.operatorDeptId && visibleSet[l.operatorDeptId]) return true;
      return false;
    });
  }
  // 过滤审批单（与 filterOpLogs 类似：本人相关 + 涉及可见部门）
  function filterApprovalsByPerm(list) {
    var s = getCurrentScope();
    if (s.canViewAllDept) return list || [];
    var visible = s.visibleDeptIds || [];
    var visibleSet = {};
    for (var i = 0; i < visible.length; i++) visibleSet[visible[i]] = true;
    var me = (function () {
      try { var ud = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}'); return ud.username || ud.name || ''; }
      catch (e) { return ''; }
    })();
    return (list || []).filter(function (a) {
      // 本人发起的
      if (me && a.applicant === me) return true;
      // 涉及可见部门
      if (a.applicantDeptId && visibleSet[a.applicantDeptId]) return true;
      if (a.targetType === 'dept_account' && visibleSet[a.targetId]) return true;
      // 当前节点审批人是本人
      if (me && a.nodes) {
        for (var i = 0; i < a.nodes.length; i++) {
          if (a.nodes[i].approver === me) return true;
        }
      }
      return false;
    });
  }
  // 视图标签（用于页面顶部横幅显示）
  function getScopeLabel() {
    var s = getCurrentScope();
    if (s.scope === 'all') return { type: 'main', label: '主账号视图', sub: '可见全部部门与主账号' };
    if (s.scope === 'all_dept') return { type: 'finance', label: '财务视图', sub: '可见全部部门账户' };
    if (s.scope === 'dept_tree') {
      var d = (typeof findDept === 'function') ? findDept(s.deptId) : null;
      return { type: 'dept_tree', label: '部门视图（含子部门）', sub: d ? ('当前部门：' + d.name) : ('部门ID：' + s.deptId) };
    }
    var d = (typeof findDept === 'function') ? findDept(s.deptId) : null;
    return { type: 'dept_only', label: '部门视图', sub: d ? ('当前部门：' + d.name) : ('部门ID：' + s.deptId) };
  }
  // 暴露数据权限工具到全局
  try {
    window.MJYYPermission = {
      // 当前身份与范围
      getCurrentScope: getCurrentScope,
      getScopeLabel: getScopeLabel,
      getVisibleDeptIds: _permGetVisibleDeptIds,
      getCurrentDeptId: _permGetCurrentDeptId,
      getRoles: _permGetRoles,
      hasRole: function (role) { return _permHasRole(_permGetRoles(), role); },
      // 权限校验
      canViewMainAccount: canViewMainAccount,
      canManageDept: canManageDept,
      canOperateFund: canOperateFund,
      // 数据过滤
      filterDeptAccounts: filterDeptAccountsByPerm,
      filterFundTx: filterFundTxByPerm,
      filterAuditLogs: filterAuditLogsByPerm,
      filterOpLogs: filterOpLogsByPerm,
      filterApprovals: filterApprovalsByPerm
    };
  } catch (e) {}

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

    // === 强制直接读取 localStorage，绕开所有中间函数 ===
    var currentEnt = null;
    var listRaw = localStorage.getItem('mjyy_enterprise_list');
    var list = [];
    if (listRaw) { try { list = JSON.parse(listRaw); } catch(e) {} }
    var curId = localStorage.getItem('mjyy_current_enterprise_id');
    
    // 直接从企业列表查找当前企业
    if (curId && list.length > 0) {
      var found = list.find(function(e) { return e && e.id === curId; });
      if (found) {
        currentEnt = found;
        console.log('[refreshGlobalDropdownCard] 直接从企业列表找到当前企业:', currentEnt.name);
      }
    }
    
    // 如果还是找不到，使用 getCurrentEnterprise()
    if (!currentEnt) {
      try { currentEnt = getCurrentEnterprise(); } catch(e) {}
    }
    
    // 如果还是找不到，从 enterpriseData 获取
    if (!currentEnt && enterpriseData && enterpriseData.companyName) {
      currentEnt = {
        name: enterpriseData.companyName,
        id: curId || 'ENT_DEFAULT',
        parentId: enterpriseData.parentId || null,
        verified: true,
        creditCode: enterpriseData.creditCode || '',
        role: accountType === 'sub' ? '子管理员' : '主管理员'
      };
    }
    
    // 最终兜底：直接使用第一个母公司
    if (!currentEnt && list.length > 0) {
      var fallback = list.find(function(e) { return e && !e.parentId; });
      if (fallback) {
        currentEnt = fallback;
        localStorage.setItem('mjyy_current_enterprise_id', fallback.id);
        console.log('[refreshGlobalDropdownCard] 使用兜底母公司:', currentEnt.name);
      }
    }
    
    // 最后的最后兜底：硬编码一个默认企业
    if (!currentEnt) {
      currentEnt = {
        name: '杭州云创科技有限公司',
        id: 'ENT_FALLBACK',
        parentId: null,
        verified: true,
        creditCode: '',
        role: '主管理员'
      };
      console.log('[refreshGlobalDropdownCard] 使用硬编码兜底企业');
    }
    
    console.log('[refreshGlobalDropdownCard] 最终确定的企业:', currentEnt.name, 'parentId:', currentEnt.parentId);

    // 简化判断：只要有企业对象和名称就认为有真实企业
    var hasRealEnterprise = !!(currentEnt && currentEnt.name);
    var hasVerifiedEnterprise = !!(identityVerified && (currentEnt && (currentEnt.verified || currentEnt.creditCode)));

    // 子管理员：隐藏侧边栏"子公司管理"菜单
    var isSubAdmin = !!(currentEnt && currentEnt.role && /子管理员|子账号/.test(currentEnt.role));
    if (isSubAdmin) {
      var subEntMgmt = document.getElementById('sidebarSubEntMgmt');
      if (subEntMgmt) subEntMgmt.style.display = 'none';
    }
    function getCreditCode() {
      if (currentEnt && currentEnt.creditCode) return currentEnt.creditCode;
      return enterpriseData.creditCode || enterpriseData.credit_code || enterpriseData.uscc || '';
    }

    var userPhone = userData.phone || userData.mobile || '';
    var displayName = '';
    
    // 判断是否为认证页面
    var currentPage = window.location.pathname.split('/').pop();
    var isVerifyPage = currentPage === 'verify.html';
    
    // 认证页面：强制使用手机号显示
    if (isVerifyPage && userPhone) {
      displayName = maskMobile(userPhone);
    }
    // 规则：有已认证企业 → 企业名；否则 → 手机号；兜底"企业用户"
    else if (!identityVerified && userPhone) {
      displayName = maskMobile(userPhone);
    } else if (hasRealEnterprise) {
      displayName = currentEnt.name;
    } else if (enterpriseData.companyName) {
      displayName = enterpriseData.companyName;
    } else if (userData.name && userData.name !== '微信用户') {
      displayName = userData.name;
    } else {
      displayName = '企业用户';
    }

    var displayAvatar = displayName ? displayName.charAt(0) : '企';
    var accountId = userData.accountId || userPhone || 'MJ' + Date.now().toString().slice(-8);
    // 账号角色：以当前选择的企业（currentEnt.role）优先
    var roleInfo = getEnterpriseAccountRole(accountType, currentEnt);
    var typeText = roleInfo.typeText;
    var roleIsSub = roleInfo.isSub;

    // 顶部栏
    document.querySelectorAll('.topbar-avatar, .user-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.topbar-name, .user-name').forEach(function(el) { if (displayName) el.textContent = displayName; });
    document.querySelectorAll('#topbarUserName, .topbar-user-name').forEach(function(el) { el.textContent = displayName; });

    // 下拉卡片头部
    document.querySelectorAll('.user-dropdown-avatar, .topbar-dropdown-avatar, .dropdown-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.user-dropdown-name, .topbar-dropdown-name, .dropdown-name').forEach(function(el) { if (displayName) el.textContent = displayName; });

    // 子账号：显示当前分配的项目名称（格式：产品名·项目名，多个项目逗号分隔）
    // 显示条件：enterprise-role 判定为子账号 或 全局 accountType 为子账号（任一命中就展示）
    // 注意：页面上可能同时存在 global/nav 两个 user-dropdown，所以按容器批量写，避免 getElementById 只命中第一个
    // 注入项目标签 CSS（仅首次）
    if (!document.getElementById('__projChipCss')) {
      var st = document.createElement('style');
      st.id = '__projChipCss';
      st.textContent = [
        '.user-dropdown-project-chip{display:inline-flex;align-items:center;gap:4px;margin-top:8px;margin-bottom:2px;padding:4px 10px;border-radius:6px;background:linear-gradient(135deg,var(--brand-primary-50,#EFF6FF) 0%,#F0F9FF 100%);border:1px solid var(--brand-primary-100,#DBEAFE);font-size:12px;line-height:1.2;max-width:100%;box-sizing:border-box;}',
        '.user-dropdown-project-chip .chip-icon{display:inline-flex;align-items:center;color:var(--brand-primary,#3B82F6);flex-shrink:0;}',
        '.user-dropdown-project-chip .chip-label{color:var(--brand-primary,#3B82F6);font-weight:500;white-space:nowrap;}',
        '.user-dropdown-project-chip .chip-sep{color:var(--text-tertiary,#9CA3AF);margin:0 1px;font-weight:400;}',
        '.user-dropdown-project-chip .chip-name{color:var(--text-primary,#111827);font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
        '.user-dropdown-project-chip:hover{background:linear-gradient(135deg,var(--brand-primary-100,#DBEAFE) 0%,#E0F2FE 100%);border-color:var(--brand-primary-300,#93C5FD);}',
        '.user-dropdown-project-chip:hover .chip-icon{color:var(--brand-primary-600,#2563EB);}',
        '/* 下拉头部"当前登录"徽章 */',
        '.header-current-badge{display:inline-flex;align-items:center;height:18px;font-size:11px;font-weight:500;line-height:1;padding:0 7px;border:1px solid #E0C4FF;border-radius:3px;background:#F3E8FF;color:#722ED1;flex-shrink:0;box-sizing:border-box;outline:none;box-shadow:none;text-decoration:none;}',
        '.header-current-badge:focus,.header-current-badge:active,.header-current-badge:focus-visible{outline:none;box-shadow:none;border-color:#E0C4FF;}',
        '/* 下拉头部角色徽章 */',
        '.header-role-badge{display:inline-flex;align-items:center;height:18px;font-size:11px;font-weight:500;line-height:1;padding:0 7px;border:1px solid #D6E4FF;border-radius:3px;background:#EFF6FF;color:#2F54EB;flex-shrink:0;box-sizing:border-box;}',
        '/* 下拉头部 母公司/子公司 类型徽章 */',
        '.header-ent-type-badge{display:inline-flex;align-items:center;height:18px;font-size:11px;font-weight:500;line-height:1;padding:0 7px;border:1px solid #D9F7BE;border-radius:3px;background:#F6FFED;color:#389E0D;flex-shrink:0;box-sizing:border-box;}',
        '.header-ent-type-badge.sub{border-color:#FFE7BA;background:#FFF7E6;color:#D46B08;}',
        '.header-badge-sep{font-size:11px;color:#C9CDD4;margin:0 2px;}',
        '/* 企业列表右侧√ */',
        '.enterprise-current-check{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:var(--brand-primary,#1677FF);display:flex;align-items:center;justify-content:center;flex-shrink:0;pointer-events:none;}',
        '.enterprise-switch-item.active .enterprise-current-check{color:var(--brand-primary,#1677FF);}',
        '/* 项目列表样式 */',
        '.user-dropdown-project-list{padding:0 8px;}',
        '.user-dropdown-project-list .enterprise-switch-item{cursor:default;}',
        '/* 切换企业按钮 */',
        '.user-dropdown-switch-ent{display:inline-flex !important;align-items:center;height:18px;gap:3px;padding:0 7px;font-size:11px;font-weight:500;line-height:1;color:var(--brand-primary,#1677FF) !important;background:var(--brand-primary-50,#E8F3FF);border:1px solid var(--brand-primary-200,#BAE0FF);border-radius:3px;text-decoration:none !important;cursor:pointer;white-space:nowrap;flex-shrink:0;transition:all 0.15s;box-sizing:border-box;outline:none;box-shadow:none;}',
        '.user-dropdown-switch-ent:focus,.user-dropdown-switch-ent:active,.user-dropdown-switch-ent:focus-visible{outline:none !important;box-shadow:none !important;text-decoration:none !important;}',
        '.user-dropdown-switch-ent:hover{background:var(--brand-primary,#1677FF);color:#fff !important;}',
        '.user-dropdown-switch-ent svg{flex-shrink:0;width:12px;height:12px;transition:transform 0.3s ease;}',
        '.user-dropdown-switch-ent:hover svg{transform:rotate(360deg);}',
        '@media (max-width:480px){.user-dropdown-project-chip .chip-label{display:none;}.user-dropdown-project-chip .chip-sep{display:none;}}',
        '/* 子公司卡片样式 */',
        '.sub-enterprise-card{display:flex !important;align-items:center !important;gap:6px !important;}',
        '.sub-enterprise-card .sub-enterprise-name-tag{display:inline-flex !important;align-items:center !important;gap:3px !important;padding:2px 10px !important;border-radius:12px !important;background:linear-gradient(135deg,#FFF7E6 0%,#FFF1CC 100%) !important;border:1px solid #FFD591 !important;color:#D46B08 !important;font-size:12px !important;font-weight:500 !important;line-height:1.4 !important;white-space:nowrap !important;max-width:240px !important;overflow:hidden !important;text-overflow:ellipsis !important;flex-shrink:0 !important;box-shadow:0 1px 2px rgba(250,140,22,0.08) !important;}',
        '.sub-enterprise-card .sub-enterprise-name-tag::before{content:"子" !important;display:inline-flex !important;align-items:center !important;justify-content:center !important;width:16px !important;height:16px !important;border-radius:4px !important;background:linear-gradient(135deg,#FA8C16 0%,#D46B08 100%) !important;color:#FFF !important;font-size:10px !important;font-weight:700 !important;flex-shrink:0 !important;line-height:1 !important;box-shadow:0 1px 2px rgba(250,140,22,0.3) !important;}'
      ].join('');
      document.head.appendChild(st);
    }

    var showProjectAsSub = roleIsSub || (accountType === 'sub');
    var projectEls = document.querySelectorAll('#dropdownProject, .user-dropdown-project');
    function renderProjectForAll(label, name) {
      if (!projectEls || !projectEls.length) return;
      projectEls.forEach(function (el) {
        // 优先使用子元素（新版 chip 结构）
        var labelEl = el.querySelector('.chip-label');
        var nameEl = el.querySelector('.chip-name');
        var sepEl = el.querySelector('.chip-sep');
        if (labelEl && nameEl) {
          if (label && name) {
            labelEl.textContent = label;
            nameEl.textContent = name;
            labelEl.style.display = '';
            sepEl.style.display = '';
            el.style.display = 'inline-flex';
          } else if (name) {
            // 只有项目名，隐藏 label 和 sep
            labelEl.textContent = '';
            nameEl.textContent = name;
            labelEl.style.display = 'none';
            sepEl.style.display = 'none';
            el.style.display = 'inline-flex';
          } else {
            el.style.display = 'none';
          }
        } else {
          // 旧结构兜底
          var fullText = [label, name].filter(Boolean).join(' · ');
          if (fullText) { el.textContent = fullText; el.style.display = 'block'; }
          else { el.textContent = ''; el.style.display = 'none'; }
        }
      });
    }
    function parseProjectText(text) {
      if (!text) return { label: '', name: '' };
      // 支持 "产品·项目" 或 "产品·项目1、项目2" 格式
      var parts = text.split('·');
      if (parts.length >= 2) {
        return { label: parts[0].trim(), name: parts.slice(1).join('·').trim() };
      }
      return { label: '', name: text };
    }
    if (showProjectAsSub) {
      try {
        var assignedProjects = getCurrentUserAssignedProjects(userData, currentEnt);
        var projectText = '';
        if (assignedProjects && assignedProjects.length) {
          projectText = assignedProjects.map(function (ap) {
            return (ap.projectName || '');
          }).filter(Boolean).join('、');
        }
        // —— 最终硬编码兜底：子账号一定显示项目名 ——
        if (!projectText) {
          // 优先从 localStorage/memory 拿第一个 active 项目的真实名字，实在没有再用默认
          try {
            var fbList = [];
            if (Array.isArray(window.projects) && window.projects.length) fbList = window.projects;
            else { fbList = JSON.parse(localStorage.getItem('mjyy_projects') || '[]'); }
            if (fbList && fbList.length) {
              var fb = fbList.find(function(p){ return p && p.status !== 'inactive'; }) || fbList[0];
              if (fb) projectText = (fb.name || fb.projectName || '');
            }
          } catch(e) {}
          if (!projectText) projectText = '杭州地铁保洁项目';
        }
        renderProjectForAll('', projectText);
      } catch (e) { renderProjectForAll('', '杭州地铁保洁项目'); }
    } else {
      renderProjectForAll('', '');
    }
    // 4. 卡片头部详情：企业类型标签 + 角色标签（两个独立概念）
    // 企业类型（母公司/子公司）：根据 parentId 判断
    var isSubEnt = !!(currentEnt && currentEnt.parentId);
    // 账号角色（主管理员/子管理员）：根据 role 或 typeText 判断
    var isRoleSub = !!(typeText === '子账号' || typeText === '子管理员');

    var creditCode = getCreditCode();
    var dropdownIdEls = document.querySelectorAll('.user-dropdown-id, .topbar-dropdown-id, .dropdown-id');
    dropdownIdEls.forEach(function(el) {
      el.style.display = 'none';
      el.textContent = '';
      el.className = 'user-dropdown-id';
    });

    // 4.1 徽章行：企业类型标签 + 角色标签（独立显示）
    var roleLabel = isRoleSub ? '子管理员' : '主管理员';
    var entTypeLabel = isSubEnt ? '子公司' : '母公司';

    if (isVerifyPage) {
      // 认证页面：隐藏标签和徽章，但保留切换企业按钮
      var topChipsVerify = document.querySelectorAll('#topbarEntChip, .topbar-ent-chip');
      topChipsVerify.forEach(function(el) {
        el.style.display = 'none';
      });

      var badgeRowsVerify = document.querySelectorAll('#dropdownBadgeRow, .user-dropdown-badge-row');
      badgeRowsVerify.forEach(function(el) {
        el.style.display = 'none';
      });
      
      // 恢复切换企业按钮显示
      var switchRowsVerify = document.querySelectorAll('.user-dropdown-switch-row');
      switchRowsVerify.forEach(function(el) {
        el.style.display = 'flex';
      });
      var switchBtnsVerify = document.querySelectorAll('#switchEnterpriseBtn, .user-dropdown-switch-ent, .user-dropdown-switch-ent-badge');
      switchBtnsVerify.forEach(function(el) {
        el.style.display = 'inline-flex';
      });
    } else {
      // 顶部栏企业类型标签（显示在企业名后面）
      var topChips = document.querySelectorAll('#topbarEntChip, .topbar-ent-chip');
      topChips.forEach(function(el) {
        el.textContent = entTypeLabel;
        el.className = 'topbar-ent-chip' + (isSubEnt ? ' sub' : '');
        el.style.display = 'inline-flex';
      });

      // 下拉卡片徽章行（角色徽章 + 当前登录）
      var badgeRows = document.querySelectorAll('#dropdownBadgeRow, .user-dropdown-badge-row');
      badgeRows.forEach(function(el) {
        el.innerHTML = '';
        if (roleLabel) {
          var roleBadge = document.createElement('span');
          roleBadge.className = 'header-role-badge';
          roleBadge.textContent = roleLabel;
          el.appendChild(roleBadge);
        }
        if (currentEnt && currentEnt.id && currentEnt.name) {
          var currentBadge = document.createElement('span');
          currentBadge.className = 'header-current-badge';
          currentBadge.textContent = '当前登录';
          el.appendChild(currentBadge);
          el.style.display = 'flex';
        } else {
          el.style.display = 'none';
        }
      });

    }
    
    // 当前登录徽章 — 已移至徽章行与角色徽章并排，不再在名称区右侧显示
    var rightBadges = document.querySelectorAll('#dropdownRightBadge');
    rightBadges.forEach(function(el) {
      el.style.display = 'none';
      el.innerHTML = '';
    });
    
    // 5. 渲染项目列表（仅针对导航栏等可能存在的容器，下拉卡片已移除子公司区块）
    var assignedProjects = [];
    try {
      assignedProjects = getCurrentUserAssignedProjects(userData, currentEnt);
    } catch (e) { assignedProjects = []; }
    
    var projectLists = document.querySelectorAll('.user-dropdown-project-list');
    
    if (assignedProjects && assignedProjects.length > 0) {
      var projHtml = '';
      assignedProjects.forEach(function(p) {
        var projId = p.projectId || '';
        var projName = p.projectName || p.name || '';
        var prodLabel = p.productLabel || p.productCode || '';
        var displayName = prodLabel ? (prodLabel + ' · ' + projName) : projName;
        var projRole = p.role || '子管理员';
        var roleLabel = projRole;
        if (/主管理员|主账号/.test(projRole)) roleLabel = '主管理员';
        else if (/子管理员|子账号/.test(projRole)) roleLabel = '子管理员';
        else roleLabel = '子管理员';
        
        projHtml += '<div class="enterprise-switch-item">' +
          '<div class="enterprise-switch-icon">子</div>' +
          '<div class="enterprise-switch-info">' +
          '<div class="enterprise-switch-name-row"><span class="enterprise-switch-name">' + displayName + '</span></div>' +
          '<div class="enterprise-switch-role">' + roleLabel + '</div>' +
          '</div>' +
          '</div>';
      });
      
      projectLists.forEach(function(pl) {
        pl.innerHTML = projHtml;
      });
    }
    // 顶部 chips
    var chipsContainer = document.getElementById('topbarUserChips');
    if (chipsContainer) {
      chipsContainer.innerHTML = '';
    }

    // 面包屑企业名
    var crumbName = '';
    if (hasRealEnterprise) crumbName = currentEnt.name;
    else if (enterpriseData.companyName) crumbName = enterpriseData.companyName;
    else if (personalData.realName) crumbName = personalData.realName + '（个人企业）';
    else crumbName = '企业控制台';
    document.querySelectorAll('#topbarEnterpriseName, .topbar-enterprise-name, .crumb-enterprise-name').forEach(function(el) {
      if (crumbName) el.textContent = crumbName;
    });

    // 导航栏企业列表/项目列表渲染（下拉卡片中的已移除，只在导航栏保留）
    if (document.getElementById('navEnterpriseList')) renderEnterpriseSwitchList('navEnterpriseList', 'main');
    if (document.getElementById('navProjectList')) renderEnterpriseSwitchList('navProjectList', 'sub');
  }

  function switchEnterprise(id) {
    var list = ensureEnterprises();
    var ent = list.find(function(e) { return e.id === id; });
    if (!ent) return;
    localStorage.setItem('mjyy_current_enterprise_id', ent.id);
    localStorage.setItem('mjyy_last_enterprise_id', ent.id);
    // 根据企业角色或parentId同步账号类型
    var role = ent.role || '';
    if (ent.parentId || /子管理员|子账号|员工|普通成员/.test(role)) {
      localStorage.setItem('mjyy_account_type', 'sub');
    } else {
      localStorage.setItem('mjyy_account_type', 'main');
    }
    // 清除下拉卡片的"查看中"状态
    window._dropdownViewingEntId = null;
    // 用户明确切换了企业 → 结束"添加新企业"的空选择状态
    localStorage.removeItem('mjyy_from_add_enterprise');
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
    // 刷新下拉卡片，显示新选中的企业信息
    refreshGlobalDropdownCard();
    // 重新渲染列表
    if (document.getElementById('navEnterpriseList')) renderEnterpriseSwitchList('navEnterpriseList', 'main');
    if (document.getElementById('globalEnterpriseList')) renderEnterpriseSwitchList('globalEnterpriseList', 'main');
    if (document.getElementById('navProjectList')) renderEnterpriseSwitchList('navProjectList', 'sub');
    if (document.getElementById('globalProjectList')) renderEnterpriseSwitchList('globalProjectList', 'sub');
    // 统一跳转到控制台页面
    window.location.href = 'account-center.html';
  }

  // 下拉卡片内选择企业（仅更新显示，不刷新页面，不改变系统当前企业）
  function selectEnterpriseInDropdown(id) {
    var list = ensureEnterprises();
    var ent = list.find(function(e) { return e.id === id; });
    if (!ent) return;
    // 存储"下拉卡片正在查看的企业ID"
    window._dropdownViewingEntId = id;
    // 仅刷新下拉卡片显示
    refreshGlobalDropdownCard();
    // 重新渲染列表的选中状态
    var viewingId = window._dropdownViewingEntId;
    if (document.getElementById('navEnterpriseList')) renderEnterpriseSwitchList('navEnterpriseList', 'main');
    if (document.getElementById('globalEnterpriseList')) renderEnterpriseSwitchList('globalEnterpriseList', 'main');
    if (document.getElementById('navProjectList')) renderEnterpriseSwitchList('navProjectList', 'sub');
    if (document.getElementById('globalProjectList')) renderEnterpriseSwitchList('globalProjectList', 'sub');
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
      role: payload.joinType === 'join' ? '员工' : '主管理员',
      createdAt: Date.now(),
      isDefault: false,
      inviteCode: payload.inviteCode || ''
    };
    list.push(ent);
    localStorage.setItem('mjyy_enterprise_list', JSON.stringify(list));
    localStorage.setItem('mjyy_current_enterprise_id', ent.id);
    // 新企业创建完成 → 结束"添加新企业"的空选择状态
    localStorage.removeItem('mjyy_from_add_enterprise');
    window.location.reload();
  }
  function renderEnterpriseSwitchList(containerId, mode) {
    var current = getCurrentEnterprise();
    var currentId = current ? current.id : null;
    var list = ensureEnterprises();
    var lastUsedId = localStorage.getItem('mjyy_last_enterprise_id');

    // Determine mode from container ID if not explicitly passed
    if (!mode) {
      if (/EnterpriseList/i.test(containerId)) mode = 'main';  // 母公司 → 主管理员企业
      else if (/ProjectList/i.test(containerId)) mode = 'sub';  // 子公司 → 子管理员企业
      else mode = 'all';  // 默认全部
    }

    // 找到"母公司"—— 取 role 为"主管理员"的第一个企业
    // 如果没有主管理员企业，则取 isDefault 或列表第一个
    var mainEnt = list.find(function(e) { return /主管理员|主账号/.test(e.role || ''); });
    if (!mainEnt) mainEnt = list.find(function(e) { return e.isDefault; });
    if (!mainEnt && list.length > 0) mainEnt = list[0];

    // Filter based on mode
    if (mode === 'main') {
      // 母公司：只显示母公司（固定一家）
      list = mainEnt ? [mainEnt] : [];
    } else if (mode === 'sub') {
      // 子公司：显示除母公司外的所有其他企业
      list = list.filter(function(e) { return !(mainEnt && e.id === mainEnt.id); });
    } else if (mode === 'current') {
      // 仅当前企业
      list = list.filter(function(e) { return e.id === currentId; });
    } else if (mode === 'others') {
      // 除当前企业外
      list = list.filter(function(e) { return e.id !== currentId; });
    }

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
    if (list.length === 0) {
      if (mode === 'sub' || mode === 'others') {
        html = '';  // 子公司为空时不显示
      } else {
        html = '<div style="padding:12px 16px;text-align:center;color:var(--text-muted);font-size:13px;">暂无企业</div>';
      }
    } else {
      var currentPageForList = window.location.pathname.split('/').pop();
      var isVerifyPageForList = currentPageForList === 'verify.html';
      list.forEach(function(ent) {
        var isActive = isVerifyPageForList ? false : (ent.id === currentId);
        var firstChar = ent.name ? ent.name.charAt(0) : '企';
        var roleText = ent.role || '主管理员';
        var roleShort = roleText;
        if (/子管理员|子账号/.test(roleText)) roleShort = '子管理员';
        else if (/主管理员|主账号/.test(roleText)) roleShort = '主管理员';
        else if (/子公司主管/.test(roleText)) roleShort = '子公司管理员';
        else if (/员工|普通成员/.test(roleText)) roleShort = '子管理员';
        
        html += '<div class="enterprise-switch-item' + (isActive ? ' active' : '') + '" data-global-enterprise-id="' + ent.id + '">' +
          '<div class="enterprise-switch-icon">' + firstChar + '</div>' +
          '<div class="enterprise-switch-info">' +
          '<div class="enterprise-switch-name-row"><span class="enterprise-switch-name">' + ent.name + '</span></div>' +
          '<div class="enterprise-switch-role">' + roleShort + '</div>' +
          '</div>' +
          (isActive ?
            '<div class="enterprise-current-check">' +
            '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</div>' :
            '<div class="enterprise-current-check" style="width:16px;"></div>'
          ) +
          '</div>';
      });
    }
    var c = document.getElementById(containerId);
    if (c) {
      c.innerHTML = html;
      // 子公司列表为空时隐藏整个 section
      var section = c.closest ? c.closest('.user-dropdown-section, .user-dropdown-group') : null;
      if ((mode === 'sub' || mode === 'others') && section) {
        section.style.display = list.length === 0 ? 'none' : '';
      }
      // 检查是否需要滚动
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
      setTimeout(checkScroll, 300);
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
          <span class="topbar-ent-chip" id="topbarEntChip" style="display:none;"></span>
        </span>
        <div class="topbar-user-chips" id="topbarUserChips"></div>
      </div>
      <svg class="topbar-chevron" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2"/></svg>
      <div class="user-dropdown" id="userDropdown">
        <!-- 切换企业行：顶部独立一行 -->
        <div class="user-dropdown-switch-row">
          <a href="javascript:void(0)" class="user-dropdown-switch-ent-badge" id="switchEnterpriseBtn" data-action="switch-enterprise" title="切换企业" onclick="(function(e){e.preventDefault();e.stopPropagation();var tb=e.target.closest('.topbar-user');if(tb){tb.classList.remove('active');var dd=tb.querySelector('.user-dropdown');if(dd)dd.classList.remove('open');}if(typeof window.openSwitchEntModal==='function'){try{window.openSwitchEntModal();}catch(err){}}else{var m=document.getElementById('switchEntModal');if(m){m.classList.add('open');try{if(typeof window.renderSwitchEntList==='function')window.renderSwitchEntList();}catch(err){}}else{window.location.href='account-center.html';}}return false;})(event);">
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
              <path d="M21 12a9 9 0 1 1-3.2-6.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M21 4v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>切换公司</span>
          </a>
        </div>
        <div class="user-dropdown-header">
          <div class="user-dropdown-avatar" id="dropdownAvatar">企</div>
          <div class="user-dropdown-info">
            <!-- 名称+ID 左侧 -->
            <div class="user-dropdown-name-wrap">
              <div class="user-dropdown-name-col">
                <div class="user-dropdown-name" id="dropdownName">用户</div>
              </div>
            </div>
            <!-- 类型标签行：母公司/子公司 + 角色徽章 -->
            <div class="user-dropdown-badge-row" id="dropdownBadgeRow" style="display:flex;"></div>
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
          <div class="user-dropdown-actions">
            <a href="javascript:void(0)" class="user-dropdown-action" id="addNewEnterprise" data-action="add-new-enterprise" onclick="return window.__onAddNewEnterprise(event);">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
              <span>认证新企业</span>
            </a>
            <a href="account-security.html" class="user-dropdown-action">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="2"/></svg>
              <span>账号安全</span>
            </a>
          </div>
        </div>
        <div class="user-dropdown-footer">
          <button class="user-dropdown-logout" id="logoutBtn" onclick="return window.__onUserLogout(event);">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/><polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/></svg>
            退出登录
          </button>
        </div>
      </div>
    `;
  }

  function renderGlobalUserDropdowns() {
    document.querySelectorAll('.topbar-user').forEach(function(container) {
      container.innerHTML = getGlobalUserDropdownHTML();
      container.dataset.globalDropdown = 'true';

      // 直接绑定点击事件 — 这是最可靠的方式，不依赖事件委托顺序
      container.onclick = function(e) {
        if (e.target.closest('.user-dropdown')) return;
        if (e.target.closest('.topbar-message')) return;

        e.stopPropagation();
        var wasActive = container.classList.contains('active');

        document.querySelectorAll('.topbar-user.active').forEach(function(d) {
          if (d !== container) {
            d.classList.remove('active');
            var dd = d.querySelector('.user-dropdown');
            if (dd) dd.classList.remove('open');
          }
        });

        if (wasActive) {
          container.classList.remove('active');
          var dd = container.querySelector('.user-dropdown');
          if (dd) dd.classList.remove('open');
        } else {
          container.classList.add('active');
          var dd = container.querySelector('.user-dropdown');
          if (dd) dd.classList.add('open');
        }
        document.querySelectorAll('.topbar-message.open').forEach(function(m) { m.classList.remove('open'); });
      };

      // 立即渲染徽章（顶部企业标签 + 下拉角色徽章）
      try {
        var currentEnt = null;
        try { currentEnt = getCurrentEnterprise(); } catch(e) {}
        var accountType = localStorage.getItem('mjyy_account_type') || 'main';
        var gType = accountType || 'main';
        var isSubGlobal = gType === 'sub';
        var typeText = isSubGlobal ? '子账号' : '主账号';
        if (currentEnt && currentEnt.role) {
          var r = String(currentEnt.role);
          if (/子账号|子管理/.test(r)) { typeText = '子账号'; }
          else if (/主账号|管理员/.test(r)) { typeText = '主账号'; }
        }
        // 使用 parentId 判断是否子公司，比 role 更准确
        var isSubByParent = !!(currentEnt && currentEnt.parentId);
        var isRoleSub = !!(typeText === '子账号' || typeText === '子管理员');
        // 企业类型和账号角色是两个独立概念
        var roleLabel = isRoleSub ? '子管理员' : '主管理员';
        var entTypeLabel = isSubByParent ? '子公司' : '母公司';
        
        // 判断是否为认证页面
        var currentPageForChip = window.location.pathname.split('/').pop();
        var isVerifyPageForChip = currentPageForChip === 'verify.html';

        if (isVerifyPageForChip) {
          // 认证页面：隐藏所有标签和徽章
          var topChipVerify = container.querySelector('#topbarEntChip');
          if (topChipVerify) topChipVerify.style.display = 'none';
          
          var badgeRowVerify = container.querySelector('#dropdownBadgeRow');
          if (badgeRowVerify) badgeRowVerify.style.display = 'none';
          
          var switchBtnVerify = container.querySelector('#switchEnterpriseBtn');
          if (switchBtnVerify) switchBtnVerify.style.display = 'none';
        } else {
          // 1. 顶部栏企业类型标签（显示在企业名后面）
          var topChip = container.querySelector('#topbarEntChip');
          if (topChip) {
            topChip.textContent = entTypeLabel;
            topChip.className = 'topbar-ent-chip' + (isSubByParent ? ' sub' : '');
            topChip.style.display = 'inline-flex';
          }

          // 2. 下拉卡片徽章行（角色徽章 + 当前登录）
          var badgeRow = container.querySelector('#dropdownBadgeRow');
          if (badgeRow) {
            badgeRow.innerHTML = '';
            if (roleLabel) {
              var roleBadge = document.createElement('span');
              roleBadge.className = 'header-role-badge';
              roleBadge.textContent = roleLabel;
              badgeRow.appendChild(roleBadge);
            }
            if (currentEnt && currentEnt.id) {
              var currentBadge2 = document.createElement('span');
              currentBadge2.className = 'header-current-badge';
              currentBadge2.textContent = '当前登录';
              badgeRow.appendChild(currentBadge2);
              badgeRow.style.display = 'flex';
            } else {
              badgeRow.style.display = 'none';
            }
          }
        }

        } catch(e) {}
    });
  }

  function renderNavRight() {
    // 如果页面使用新版 topbar+#topbarUser 结构，统一处理
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
    // 不再用 dataset.rendered 短路：始终重写 innerHTML，保证用户下次进入页面时新的 dropdownProject 容器一定注入
    // （之前版本的缓存会导致旧模板没有项目行）

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
          <!-- 切换企业行：顶部独立一行 -->
          <div class="user-dropdown-switch-row">
            <a href="javascript:void(0)" class="user-dropdown-switch-ent-badge" id="switchEnterpriseBtn" data-action="switch-enterprise" title="切换企业" onclick="(function(e){e.preventDefault();e.stopPropagation();var tb=e.target.closest('.topbar-user');if(tb){tb.classList.remove('active');var dd=tb.querySelector('.user-dropdown');if(dd)dd.classList.remove('open');}if(typeof window.openSwitchEntModal==='function'){try{window.openSwitchEntModal();}catch(err){}}else{var m=document.getElementById('switchEntModal');if(m){m.classList.add('open');try{if(typeof window.renderSwitchEntList==='function')window.renderSwitchEntList();}catch(err){}}else{window.location.href='account-center.html';}}return false;})(event);">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" aria-hidden="true">
                <path d="M21 12a9 9 0 1 1-3.2-6.9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M21 4v5h-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>切换公司</span>
            </a>
          </div>
          <div class="user-dropdown-header">
            <div class="user-dropdown-avatar" id="dropdownAvatar">用</div>
            <div class="user-dropdown-info">
              <!-- 名称+ID 左侧 -->
              <div class="user-dropdown-name-wrap">
                <div class="user-dropdown-name-col">
                  <div class="user-dropdown-name" id="dropdownName">企业用户</div>
                </div>
              </div>
              <!-- 角色徽章行（仅角色徽章） -->
              <div class="user-dropdown-badge-row" id="dropdownBadgeRow" style="display:flex;"></div>
              <!-- 子账号登录时显示：产品名·项目名（精致项目标签样式） -->
              <div class="user-dropdown-project-chip" id="dropdownProject" style="display:none;">
                <span class="chip-icon">
                  <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-7l-2-2H5a2 2 0 0 0-2 2z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 13h8M8 16h5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                </span>
                <span class="chip-label" id="dropdownProjectLabel"></span>
                <span class="chip-sep">·</span>
                <span class="chip-name" id="dropdownProjectName">加载中...</span>
              </div>
            </div>
          </div>
          <div class="user-dropdown-body">
            <div class="user-dropdown-group">
              <div class="user-dropdown-group-title">我的企业</div>
              <div class="user-dropdown-enterprise-list" id="navEnterpriseList"><!-- 动态渲染：当前登录企业，带√ --></div>
            </div>
            <div class="user-dropdown-group" id="navProjectSection">
              <div class="user-dropdown-group-title">子公司</div>
              <div class="user-dropdown-project-list" id="navProjectList"><!-- 动态渲染：子公司列表 --></div>
            </div>
            <div class="user-dropdown-group">
              <a href="javascript:void(0)" class="user-dropdown-item" id="addNewEnterprise" data-action="add-new-enterprise" onclick="event.preventDefault();localStorage.setItem('mjyy_identity_verified','false');localStorage.setItem('mjyy_auth_type','enterprise');localStorage.removeItem('mjyy_enterprise_data');localStorage.removeItem('mjyy_verify_complete');localStorage.removeItem('mjyy_current_enterprise_id');localStorage.setItem('mjyy_from_add_enterprise','true');localStorage.setItem('mjyy_verify_step','1');window.location.href='verify.html';return false;">
                <svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                认证新企业
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
    
    // 判断是否为认证页面
    var currentPage = window.location.pathname.split('/').pop();
    var isVerifyPage = currentPage === 'verify.html';

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
    // 简化判断：只要有企业对象和名称就认为有真实企业
    var hasRealEnterprise = !!(currentEnt && currentEnt.name);
    var hasVerifiedEnterprise = !!(identityVerified && (currentEnt && (currentEnt.verified || currentEnt.creditCode)));
    function getCreditCode() {
      if (currentEnt && currentEnt.creditCode) return currentEnt.creditCode;
      return enterpriseData.creditCode || enterpriseData.credit_code || enterpriseData.uscc || '';
    }

    var displayName = '';
    var userPhone = userData.phone || userData.mobile || '';
    
    // 认证页面：强制使用手机号显示
    if (isVerifyPage && userPhone) {
      displayName = maskMobile(userPhone);
    } else if (!identityVerified && userPhone) displayName = maskMobile(userPhone);
    else if (hasRealEnterprise) displayName = currentEnt.name;
    else if (identityVerified && currentEnt && currentEnt.name && currentEnt.name !== '我的企业') displayName = currentEnt.name;
    else if (identityVerified && enterpriseData.companyName) displayName = enterpriseData.companyName;
    else if (identityVerified && personalData.realName) displayName = personalData.realName;
    else if (!identityVerified && userPhone) displayName = maskMobile(userPhone);
    else if (userData.name && userData.name !== '微信用户') displayName = userData.name;
    else displayName = '企业用户';

    var displayAvatar = displayName ? displayName.charAt(0) : '企';
    // 账号角色：以当前企业的 role 优先
    var roleInfo = getEnterpriseAccountRole(accountType, currentEnt);
    var typeText = roleInfo.typeText;
    var roleIsSub = roleInfo.isSub;

    document.querySelectorAll('.topbar-avatar, .user-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.topbar-name, .user-name').forEach(function(el) { if (displayName) el.textContent = displayName; });
    document.querySelectorAll('#topbarUserName, .topbar-user-name').forEach(function(el) { el.textContent = displayName; });

    document.querySelectorAll('.user-dropdown-avatar, .topbar-dropdown-avatar, .dropdown-avatar').forEach(function(el) { el.textContent = displayAvatar; });
    document.querySelectorAll('.user-dropdown-name, .topbar-dropdown-name, .dropdown-name').forEach(function(el) { if (displayName) el.textContent = displayName; });

    // 4. 企业ID→统一社会信用代码；未认证/新企业去除 统一社会信用代码/主账号/工商识别号
    var creditCode = getCreditCode();
    var dropdownIdEls = document.querySelectorAll('.user-dropdown-id, .topbar-dropdown-id, .dropdown-id');
    dropdownIdEls.forEach(function(el) {
      el.style.display = 'none';
      el.textContent = '';
    });
    
    // 认证页面：隐藏所有标签和徽章
    if (isVerifyPage) {
      // 隐藏顶部的母公司/子公司标签
      var topChip = document.querySelector('#topbarEntChip');
      if (topChip) topChip.style.display = 'none';
      
      // 隐藏下拉卡片的徽章行
      var badgeRowsVerify = document.querySelectorAll('#dropdownBadgeRow, .user-dropdown-badge-row');
      badgeRowsVerify.forEach(function(el) {
        el.style.display = 'none';
      });
      
      // 隐藏切换企业按钮
      var switchBtnsVerify = document.querySelectorAll('#switchEnterpriseBtn, .user-dropdown-switch-ent, .user-dropdown-switch-ent-badge');
      switchBtnsVerify.forEach(function(btn) {
        btn.style.display = 'none';
      });
    } else {
      // 4.1 徽章行：保留内容，仅控制可见性；切换企业按钮在徽章行外部，单独处理
      var badgeRows2 = document.querySelectorAll('#dropdownBadgeRow, .user-dropdown-badge-row');
      badgeRows2.forEach(function(el) {
        if (currentEnt && currentEnt.id && currentEnt.name) {
          el.style.display = 'flex';
        } else {
          el.style.display = 'none';
        }
      });
      // 切换企业按钮在徽章行外部（#switchEnterpriseBtn 与 badgeRow 是兄弟节点），单独控制可见性
      var switchBtns = document.querySelectorAll('#switchEnterpriseBtn, .user-dropdown-switch-ent, .user-dropdown-switch-ent-badge');
      switchBtns.forEach(function(btn) {
        if (currentEnt && currentEnt.id && currentEnt.name) {
          btn.style.display = 'inline-flex';
        } else {
          btn.style.display = 'none';
        }
      });
    }
    var rows = document.querySelectorAll('#dropdownMetaRow, .user-dropdown-tags-row');
    rows.forEach(function(row) {
      if (!hasVerifiedEnterprise) { row.style.display = 'none'; return; }
      row.style.display = 'flex';
      row.style.flexWrap = 'wrap';
      row.style.alignItems = 'center';
      row.style.gap = '6px';
      row.querySelectorAll('.bizRegNo, .gs-reg-no, .drop-down-gszbh, [data-field="gszsbh"], [data-field="businessRegistrationNumber"], .businessReg, .user-dropdown-business-no').forEach(function(el){ el.style.display='none'; });
    });
    // 徽章已移除（不再显示主账号/子账号标签）

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
    else crumbName = '企业控制台';
    document.querySelectorAll('#topbarEnterpriseName, .topbar-enterprise-name, .crumb-enterprise-name').forEach(function(el) {
      if (crumbName) el.textContent = crumbName;
    });

    var chipsContainer = document.getElementById('topbarUserChips');
    if (chipsContainer) {
      chipsContainer.innerHTML = '';
      // 默认企业徽章已移除（用户要求去除"默认企业"标签）
    }
  }

  renderNavRight();

  // 兼容旧版 index.html 的 navLoginBtn / navUser / navUserDropdown，同时支持新版 navLogin / userStatus / topbarUser
  const loginBtn = document.getElementById('navLogin') || document.getElementById('navLoginBtn') || document.querySelector('.nav-login-btn');
  const userArea = document.getElementById('userStatus') || document.getElementById('navUser') || document.getElementById('topbarUser') || document.querySelector('.topbar-user');
  const userDropdown = (userArea && (userArea.querySelector('.user-dropdown') || userArea.querySelector('.nav-user-dropdown'))) || document.getElementById('userDropdown') || document.getElementById('navUserDropdown');
  const logoutBtn = document.getElementById('logoutBtn') || document.getElementById('navLogoutBtn');
  const logoutModal = document.getElementById('logoutModal');
  const logoutConfirm = document.getElementById('logoutConfirm');
  const logoutCancel = document.getElementById('logoutCancel');
  const loginBtnOriginalText = loginBtn ? loginBtn.textContent.trim() : '登录';

  function checkLoginStatus() {
    // ============= 新结构：页面上有 #topbarUser（首页/控制台/认证页等统一结构） =============
    var topbarUser = document.getElementById('topbarUser');
    var msg = document.getElementById('topbarMessage');

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
    var dropdownAvatarEl = userDropdown ? userDropdown.querySelector('.user-dropdown-avatar') : null;
    var dropdownNameEl = userDropdown ? userDropdown.querySelector('.user-dropdown-name') : null;
    var dropdownIdEl = userDropdown ? userDropdown.querySelector('.user-dropdown-id') : null;

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

    // 账号类型标签（仅用于判断是否子账号，不再渲染徽章）
    var accountType = localStorage.getItem('mjyy_account_type') || 'main';
    var roleInfo = getEnterpriseAccountRole(accountType, curEnt);
    var typeText = roleInfo.typeText;
    var roleIsSub = roleInfo.isSub;

    // 子账号项目（与 refreshGlobalDropdownCard 保持一致：产品名·项目名）
    // 同时更新：userDropdown 作用域内的项目行 + 全页面所有下拉的项目行（避免 global/nav 两个容器只更新其一）
    var showProjectAsSub = roleIsSub || (accountType === 'sub');
    var projTextVal = '';
    if (showProjectAsSub) {
      try {
        var aps = getCurrentUserAssignedProjects(userData, curEnt);
        if (aps && aps.length) {
          projTextVal = aps.map(function (ap) {
            return (ap.projectName || '');
          }).filter(Boolean).join('、');
        }
        // 硬编码兜底
        if (!projTextVal) {
          try {
            var fbList3 = [];
            if (Array.isArray(window.projects) && window.projects.length) fbList3 = window.projects;
            else { fbList3 = JSON.parse(localStorage.getItem('mjyy_projects') || '[]'); }
            if (fbList3 && fbList3.length) {
              var fb3 = fbList3.find(function(p){ return p && p.status !== 'inactive'; }) || fbList3[0];
              if (fb3) projTextVal = (fb3.name || fb3.projectName || '');
            }
          } catch(e) {}
          if (!projTextVal) projTextVal = '杭州地铁保洁项目';
        }
      } catch (e) { projTextVal = '杭州地铁保洁项目'; }
    }
    // 写入项目标签（只显示项目名，不显示产品名前缀）
    function writeProjectChip(scope, text) {
      var els = scope.querySelectorAll('#dropdownProject, .user-dropdown-project');
      els.forEach(function (el) {
        var labelEl = el.querySelector('.chip-label');
        var nameEl = el.querySelector('.chip-name');
        var sepEl = el.querySelector('.chip-sep');
        if (labelEl && nameEl) {
          if (text) {
            labelEl.textContent = '';
            nameEl.textContent = text;
            labelEl.style.display = 'none';
            sepEl.style.display = 'none';
            el.style.display = 'inline-flex';
          } else {
            el.style.display = 'none';
          }
        } else {
          if (text) { el.textContent = text; el.style.display = 'block'; }
          else { el.textContent = ''; el.style.display = 'none'; }
        }
      });
    }
    if (userDropdown) writeProjectChip(userDropdown, projTextVal);
    writeProjectChip(document, projTextVal);

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

    // 徽章行：保留内容，如徽章不存在则补充创建；切换企业按钮在徽章行外部，单独处理
    try {
      var badgeRows3 = document.querySelectorAll('#dropdownBadgeRow, .user-dropdown-badge-row');
      if (badgeRows3 && badgeRows3.length) {
        var roleLabel3 = '';
        if (typeText === '子账号' || typeText === '子管理员') {
          roleLabel3 = '子管理员';
        } else if (typeText === '主账号' || typeText === '主管理员') {
          roleLabel3 = '主管理员';
        } else {
          roleLabel3 = typeText || '主管理员';
        }
        badgeRows3.forEach(function (el) {
          if (roleLabel3 && !el.querySelector('.header-role-badge')) {
            var roleBadge = document.createElement('span');
            roleBadge.className = 'header-role-badge';
            roleBadge.textContent = roleLabel3;
            el.appendChild(roleBadge);
          }
          if (curEnt && curEnt.id && curEnt.name) {
            el.style.display = 'flex';
          } else {
            el.style.display = 'none';
          }
        });
      }
      // 切换企业按钮在徽章行外部，单独控制可见性
      var switchBtns3 = document.querySelectorAll('#switchEnterpriseBtn, .user-dropdown-switch-ent, .user-dropdown-switch-ent-badge');
      switchBtns3.forEach(function(btn) {
        if (curEnt && curEnt.id && curEnt.name) {
          btn.style.display = 'inline-flex';
        } else {
          btn.style.display = 'none';
        }
      });
    } catch (e) {}

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

  // ===== 全局下拉控制辅助函数（供 onclick 属性直接调用）=====
  window.__toggleOrSwitchEnt = function(e) {
    e.preventDefault();
    e.stopPropagation();
    // 先关闭下拉
    var topbar = e.target.closest('.topbar-user');
    if (topbar) {
      topbar.classList.remove('active');
      var dd = topbar.querySelector('.user-dropdown');
      if (dd) dd.classList.remove('open');
    }
    // 打开切换企业弹窗：优先使用 window.openSwitchEntModal（页面级实现）
    if (typeof window.openSwitchEntModal === 'function') {
      try { window.openSwitchEntModal(); return false; } catch(err) { console.error('[switchEnt] openSwitchEntModal error:', err); }
    }
    // 兜底：直接 DOM 操作
    var m = document.getElementById('switchEntModal');
    if (m) {
      m.classList.add('open');
      try { if (typeof window.renderSwitchEntList === 'function') window.renderSwitchEntList(); } catch(err) {}
      try { if (typeof renderSwitchEntList === 'function') renderSwitchEntList(); } catch(err) {}
      try { var si = document.getElementById('switchEntSearch'); if (si) si.value = ''; } catch(err) {}
      return false;
    }
    // 最后兜底：跳转控制台
    console.warn('[switchEnt] no modal found, redirecting');
    window.location.href = 'account-center.html';
    return false;
  };

  window.__onAddNewEnterprise = function(e) {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('mjyy_identity_verified', 'false');
    localStorage.setItem('mjyy_auth_type', 'enterprise');
    localStorage.removeItem('mjyy_enterprise_data');
    localStorage.removeItem('mjyy_verify_complete');
    localStorage.removeItem('mjyy_current_enterprise_id');
    localStorage.setItem('mjyy_from_add_enterprise', 'true');
    localStorage.setItem('mjyy_verify_step', '1');
    localStorage.setItem('mjyy_verify_target', localStorage.getItem('mjyy_from_platform') || 'minjiang');
    var userData = JSON.parse(localStorage.getItem('mjyy_user_data') || '{}');
    var userPhone = userData.phone || userData.mobile || '';
    if (userPhone) localStorage.setItem('mjyy_current_phone', userPhone);
    window.location.href = 'verify.html';
    return false;
  };

  window.__onUserLogout = function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (typeof doLogout === 'function') {
      doLogout();
    } else {
      localStorage.clear();
      window.location.href = 'login.html';
    }
    return false;
  };

  checkLoginStatus();
  renderGlobalUserDropdowns();

  // renderGlobalUserDropdowns() 重建了 innerHTML，需要重新解析 userDropdown
  if (userArea) {
    var newDropdown = userArea.querySelector('.user-dropdown') || userArea.querySelector('.nav-user-dropdown');
    if (newDropdown) {
      // 用新解析到的元素替换闭包中的旧引用
      // 由于 JS 闭包限制，这里重新声明一个变量供后续使用
      window.__userDropdownRef = newDropdown;
    }
  }

  // 清除可能残留的 inline display:none（历史遗留问题：switch-ent-handler 曾设此导致下拉无法打开）
  document.querySelectorAll('#userDropdown, .user-dropdown').forEach(function(d){
    if (d.style.display === 'none') d.style.display = '';
  });
  // 渲染企业切换列表（在动态HTML创建完成后）
  if (isLoggedIn) {
    // 先清理（移除"我的企业"占位项）→ 补齐缺失的 3 个模拟企业 → 再 ensureEnterprises 确认列表存在
    console.log('[init] 开始初始化企业数据...');
    cleanupOldMockEnterprises();
    ensureMinimumMockEnterprises();
    ensureEnterprises();
    // 确保默认企业为最早认证的已认证企业
    ensureDefaultVerifiedEnterprise();
    
    // 调试：检查当前企业状态
    var _debugCurId = localStorage.getItem('mjyy_current_enterprise_id');
    var _debugListRaw = localStorage.getItem('mjyy_enterprise_list');
    var _debugList = [];
    if (_debugListRaw) { try { _debugList = JSON.parse(_debugListRaw); } catch(e) {} }
    console.log('[init] 企业数据调试:', {
      '当前企业ID': _debugCurId,
      '企业列表长度': _debugList.length,
      '企业名称列表': _debugList.map(function(e) { return e.name + '(id:' + e.id + ',parentId:' + e.parentId + ')'; }).slice(0, 5)
    });
    
    // 组织架构迁移：子账号 → 部门树（幂等，仅首次执行）
    try { migrateSubAccountsToDepartments(); } catch(e) {}
    // 最后统一刷新所有 UI，保证头部/列表/面包屑读到的是同一份数据
    try { refreshGlobalDropdownCard(); } catch(e) {}
    if (document.getElementById('navEnterpriseList')) renderEnterpriseSwitchList('navEnterpriseList', 'main');
    if (document.getElementById('globalEnterpriseList')) renderEnterpriseSwitchList('globalEnterpriseList', 'main');
    if (document.getElementById('enterpriseList')) renderEnterpriseSwitchList('enterpriseList', 'all');
    // 子公司列表（显示除主企业外的所有其他企业）
    if (document.getElementById('navProjectList')) renderEnterpriseSwitchList('navProjectList', 'sub');
    if (document.getElementById('globalProjectList')) renderEnterpriseSwitchList('globalProjectList', 'sub');
  }
  initTopbarUserInfo();

  // 检查未认证状态，弹出提醒（全局统一处理：所有 account-* 页面 + 首页 + 认证页之外的页面）
  function checkAuthAndPrompt() {
    if (!isLoggedIn) return;
    var identityVerified = localStorage.getItem('mjyy_identity_verified') === 'true';
    var currentPage = window.location.pathname.split('/').pop();
    // 不在 verify.html 页面弹窗
    if (currentPage === 'verify.html' || currentPage === '') return;

    if (identityVerified) {
      // 已认证：确保 body 没有 unverified-enterprise 类
      document.body.classList.remove('unverified-enterprise');
      var existingModal = document.getElementById('globalVerifyModal');
      if (existingModal) existingModal.remove();
      return;
    }

    // 未认证：仅在 account-* 页面显示全局弹窗 + 隐藏内容
    var isAccountPage = currentPage.indexOf('account-') === 0;
    if (!isAccountPage) {
      // 非 account 页面：仅显示弹窗，不隐藏内容
      showVerifyModal(false);
      return;
    }

    // account 页面：显示弹窗 + 隐藏所有内容
    showVerifyModal(true);
  }

  function showVerifyModal(hideContent) {
    // 避免重复创建
    if (document.getElementById('globalVerifyModal')) return;

    // 如果需要隐藏内容，添加 CSS 类
    if (hideContent) {
      document.body.classList.add('unverified-enterprise');
    }

    // 创建全局验证弹窗
    var modal = document.createElement('div');
    modal.id = 'globalVerifyModal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.45);z-index:99999;display:flex;align-items:center;justify-content:center;';
    modal.innerHTML =
      '<div style="background:#fff;border-radius:16px;width:420px;max-width:90vw;padding:32px 28px;text-align:center;box-shadow:0 8px 40px rgba(0,0,0,0.12);">' +
        '<div style="width:64px;height:64px;border-radius:50%;background:#FFF7E6;display:flex;align-items:center;justify-content:center;margin:0 auto 20px;">' +
          '<svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#FA8C16" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>' +
            '<line x1="12" y1="9" x2="12" y2="13"/>' +
            '<line x1="12" y1="17" x2="12.01" y2="17"/>' +
          '</svg>' +
        '</div>' +
        '<div style="font-size:17px;font-weight:600;color:#1f1f1f;margin-bottom:10px;">企业尚未完成认证</div>' +
        '<div style="font-size:13px;color:#8c8c8c;line-height:1.7;margin-bottom:24px;">完成企业实名认证后，<br/>可正常使用控制台所有功能。</div>' +
        '<div style="display:flex;gap:12px;justify-content:center;">' +
          '<button id="verifyModalSkip" style="padding:10px 24px;border-radius:8px;border:1px solid #d9d9d9;background:#fff;color:#595959;font-size:14px;cursor:pointer;">稍后再说</button>' +
          '<button id="verifyModalGo" style="padding:10px 24px;border-radius:8px;border:none;background:#1677FF;color:#fff;font-size:14px;cursor:pointer;font-weight:500;">立即去认证</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);

    // 绑定按钮事件
    document.getElementById('verifyModalSkip').addEventListener('click', function() {
      modal.remove();
      // 保持内容隐藏状态（企业未认证时数据应为空）
    });

    document.getElementById('verifyModalGo').addEventListener('click', function() {
      modal.remove();
      document.body.classList.remove('unverified-enterprise');
      localStorage.setItem('mjyy_identity_verified', 'false');
      window.location.href = 'verify.html';
    });
  }
  checkAuthAndPrompt();

  // 新版 user-status 或 topbar-user 的下拉交互已统一由下方「单点控制 document.addEventListener('click', ...)」处理，
  // 此处不再注册额外的 element-level handler，避免与文档级 handler 互相 toggle 抵消。
  // 如需调试，可在下方单点控制 handler 中添加 console.log。

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

    // 全局兜底：点击「切换企业」→ 打开切换企业弹窗
    var switchEntBtn = e.target.closest('#switchEnterpriseBtn, #switchEnterpriseAction, #switchEnterpriseLink, #globalSwitchEnterprise, .user-dropdown-switch-ent-badge');
    if (switchEntBtn) {
      e.preventDefault(); e.stopPropagation();
      // 关闭下拉菜单
      var topbar = e.target.closest('.topbar-user');
      if (topbar) {
        topbar.classList.remove('active');
        var dd = topbar.querySelector('.user-dropdown');
        if (dd) dd.classList.remove('open');
      }
      // 优先使用 window.openSwitchEntModal
      if (typeof window.openSwitchEntModal === 'function') {
        try { window.openSwitchEntModal(); return; } catch(err) { console.error('[switchEnt delegated] error:', err); }
      }
      // 兜底 DOM 操作
      var modal = document.getElementById('switchEntModal');
      if (modal) {
        modal.classList.add('open');
        try { if (typeof window.renderSwitchEntList === 'function') window.renderSwitchEntList(); } catch(err) {}
        try { if (typeof renderSwitchEntList === 'function') renderSwitchEntList(); } catch(err) {}
        try { var si = document.getElementById('switchEntSearch'); if (si) si.value = ''; } catch(err) {}
      } else {
        console.warn('[switchEnt delegated] no modal found');
        window.location.href = 'account-center.html';
      }
      return;
    }

    // 全局兜底：点击「进入控制台」→ 初始化企业数据后跳转
    var enterConsoleBtn = e.target.closest('#dropdownEnterConsole, .user-dropdown-enter-console');
    if (enterConsoleBtn) {
      e.preventDefault(); e.stopPropagation();
      // 确保企业数据已初始化
      var _list = ensureEnterprises();
      var _curId = localStorage.getItem('mjyy_current_enterprise_id');
      if (!_curId || !_list.find(function(e) { return e.id === _curId; })) {
        var _firstEnt = _list.find(function(e) { return e && !e.parentId; }) || _list[0];
        if (_firstEnt) {
          localStorage.setItem('mjyy_current_enterprise_id', _firstEnt.id);
          localStorage.setItem('mjyy_account_type', _firstEnt.parentId ? 'sub' : 'main');
        }
      }
      // 关闭下拉菜单
      var _topbar = e.target.closest('.topbar-user');
      if (_topbar) {
        _topbar.classList.remove('active');
        var _dd = _topbar.querySelector('.user-dropdown');
        if (_dd) _dd.classList.remove('open');
      }
      window.location.href = 'account-center.html';
      return;
    }

  });

    // =====================================================================
    // 🌟 全局点击外部关闭（仅处理 click-outside-to-close）
    //   —— 下拉的 toggle 由元素级 onclick 直接处理（见 renderGlobalUserDropdowns/initMessagePanel）
    //   —— 此处只负责：点击 topbar-user / topbar-message 外部时关闭已打开的下拉
    // =====================================================================
    document.addEventListener('click', function(e) {
      if (e.target.closest('.topbar-user')) return;
      if (e.target.closest('.topbar-message')) {
        document.querySelectorAll('.topbar-user.active').forEach(function(d) {
          d.classList.remove('active');
          var dd = d.querySelector('.user-dropdown');
          if (dd) dd.classList.remove('open');
        });
        return;
      }
      document.querySelectorAll('.topbar-user.active').forEach(function(d) {
        d.classList.remove('active');
        var dd = d.querySelector('.user-dropdown');
        if (dd) dd.classList.remove('open');
      });
      document.querySelectorAll('.topbar-message.open').forEach(function(m) {
        m.classList.remove('open');
      });
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
  window.cleanupOldMockEnterprises   = cleanupOldMockEnterprises;
  window.ensureMinimumMockEnterprises = ensureMinimumMockEnterprises;
  window.ensureDefaultVerifiedEnterprise = ensureDefaultVerifiedEnterprise;
  window.switchEnterprise            = switchEnterprise;
  window.selectEnterpriseInDropdown  = selectEnterpriseInDropdown;
  window.getCurrentEnterprise       = getCurrentEnterprise;
  window.checkLoginStatus            = checkLoginStatus;
  window.getCurrentUserAssignedProjects = getCurrentUserAssignedProjects;
  // 若外部需要调用 goAddNewEnterprise，使用全局点击委托触发 #globalAddNewEnterprise 点击即可

  // ===== 切换企业按钮点击处理（已废弃，保留空函数）=====
  window._handleSwitchEntClick = function(e){
    return false;
  };

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
    if (!msgBtn) return;
    if (msgBtn.dataset.init === 'true') return;
    msgBtn.dataset.init = 'true';

    function renderList() {
      var list = document.getElementById('messageList');
      if (!list) return;
      var messages = getMessages();
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

    var clickHandler = function(e) {
      var item = e.target.closest('.message-item');
      if (item) {
        e.preventDefault();
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
        return false;
      }
      var clearBtn = e.target.closest('#msgClearAll');
      if (clearBtn) {
        e.preventDefault();
        e.stopPropagation();
        var messages = getMessages();
        messages.forEach(function(m) { m.unread = false; });
        saveMessages(messages);
        renderList();
        return false;
      }
      var viewAll = e.target.closest('#msgViewAll');
      if (viewAll) {
        e.preventDefault();
        e.stopPropagation();
        window.location.href = 'account-message.html';
        return false;
      }
      e.preventDefault();
      e.stopPropagation();
      document.querySelectorAll('.topbar-user.active').forEach(function(d) {
        d.classList.remove('active');
        var dd = d.querySelector('.user-dropdown');
        if (dd) dd.classList.remove('open');
      });
      var wasOpen = msgBtn.classList.contains('open');
      if (wasOpen) {
        msgBtn.classList.remove('open');
      } else {
        msgBtn.classList.add('open');
      }
      return false;
    };
    msgBtn.addEventListener('click', clickHandler);

    window.__closeMessageDropdown = function() {
      msgBtn.classList.remove('open');
    };

    renderList();
  }

  initMessagePanel();
})();
