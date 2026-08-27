(function() {
  'use strict';

  var overlayLayer = null;
  var annotations = [];
  var counter = 0;
  var toolbar = null;

  function init() {
    if (overlayLayer) return;

    overlayLayer = document.createElement('div');
    overlayLayer.className = 'ann-overlay-layer';
    document.body.appendChild(overlayLayer);

    createToolbar();
    applyPageAnnotations();
    window.addEventListener('resize', debounce(renderAll, 100));
    window.addEventListener('scroll', debounce(renderAll, 100));
  }

  function createToolbar() {
    toolbar = document.createElement('div');
    toolbar.className = 'ann-toolbar';
    toolbar.innerHTML =
      '<span class="ann-toolbar-info">产品标注版</span>' +
      '<button class="ann-toolbar-btn" data-action="toggle">隐藏标注</button>' +
      '<button class="ann-toolbar-btn" data-action="collapse">紧凑模式</button>' +
      '<button class="ann-toolbar-btn" data-action="export">导出</button>';
    toolbar.querySelectorAll('.ann-toolbar-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var action = btn.dataset.action;
        if (action === 'toggle') toggleAnnotations(btn);
        else if (action === 'collapse') toggleCollapse(btn);
        else if (action === 'export') exportAnnotations();
      });
    });
    document.body.appendChild(toolbar);
  }

  function toggleAnnotations(btn) {
    if (document.body.classList.contains('ann-hidden')) {
      document.body.classList.remove('ann-hidden');
      btn.textContent = '隐藏标注';
      btn.classList.remove('active');
    } else {
      document.body.classList.add('ann-hidden');
      btn.textContent = '显示标注';
      btn.classList.add('active');
    }
  }

  function toggleCollapse(btn) {
    if (document.body.classList.contains('ann-collapsed')) {
      document.body.classList.remove('ann-collapsed');
      btn.textContent = '紧凑模式';
      btn.classList.remove('active');
    } else {
      document.body.classList.add('ann-collapsed');
      btn.textContent = '完整模式';
      btn.classList.add('active');
    }
    renderAll();
  }

  function exportAnnotations() {
    var data = annotations.map(function(a) {
      return { id: a.id, selector: a.selector, label: a.label, desc: a.desc };
    });
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'annotations-' + getPageName() + '.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function getPageName() {
    var path = window.location.pathname;
    var file = path.split('/').pop() || 'index.html';
    return file.replace('.html', '');
  }

  function addAnnotation(options) {
    counter++;
    var ann = {
      id: counter,
      selector: options.selector,
      label: options.label || '',
      desc: options.desc || '',
      position: options.position || 'top-right',
      el: null
    };

    var target = document.querySelector(options.selector);
    if (!target) return null;

    ann.el = target;
    annotations.push(ann);
    renderAnnotation(ann);
    return ann;
  }

  function renderAnnotation(ann) {
    if (!ann.el || !ann.el.isConnected) return;

    var rect = ann.el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return;

    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;

    var box = document.createElement('div');
    box.className = 'ann-box';
    box.style.left = rect.left + scrollX + 'px';
    box.style.top = rect.top + scrollY + 'px';
    box.style.width = rect.width + 'px';
    box.style.height = rect.height + 'px';
    overlayLayer.appendChild(box);

    var label = document.createElement('div');
    label.className = 'ann-label';
    label.innerHTML = '<span class="ann-num">' + ann.id + '</span><span class="ann-text">' + escapeHtml(ann.label) + '</span>';
    label.title = ann.desc;

    var labelTop = rect.top + scrollY - 8;
    var labelLeft;
    if (ann.position === 'bottom-left') {
      labelLeft = rect.left + scrollX;
      labelTop = rect.bottom + scrollY + 8;
      label.style.transform = 'translate(0, 0)';
    } else if (ann.position === 'bottom-right') {
      labelLeft = rect.right + scrollX;
      labelTop = rect.bottom + scrollY + 8;
      label.style.transform = 'translate(-100%, 0)';
    } else if (ann.position === 'top-left') {
      labelLeft = rect.left + scrollX;
      label.style.transform = 'translate(0, -100%)';
    } else if (ann.position === 'center-right') {
      labelLeft = rect.right + scrollX + 8;
      labelTop = rect.top + scrollY + rect.height / 2;
      label.style.transform = 'translate(0, -50%)';
    } else if (ann.position === 'center-left') {
      labelLeft = rect.left + scrollX - 8;
      labelTop = rect.top + scrollY + rect.height / 2;
      label.style.transform = 'translate(-100%, -50%)';
    } else {
      labelLeft = rect.right + scrollX - 4;
      labelTop = rect.top + scrollY - 4;
      label.style.transform = 'translate(-100%, -100%)';
    }
    label.style.left = labelLeft + 'px';
    label.style.top = labelTop + 'px';

    label.addEventListener('click', function(e) {
      e.stopPropagation();
      showPopover(ann, label);
    });

    overlayLayer.appendChild(label);
  }

  function showPopover(ann, anchor) {
    var existing = document.querySelector('.ann-popover.show');
    if (existing) existing.remove();

    var popover = document.createElement('div');
    popover.className = 'ann-popover show';
    popover.innerHTML =
      '<div class="ann-popover-title">#' + ann.id + ' ' + escapeHtml(ann.label) + '</div>' +
      '<div>' + escapeHtml(ann.desc) + '</div>';

    var rect = anchor.getBoundingClientRect();
    var scrollX = window.scrollX || window.pageXOffset;
    var scrollY = window.scrollY || window.pageYOffset;

    popover.style.left = (rect.left + scrollX) + 'px';
    popover.style.top = (rect.bottom + scrollY + 8) + 'px';
    overlayLayer.appendChild(popover);

    setTimeout(function() {
      document.addEventListener('click', function closePop(e) {
        if (!popover.contains(e.target)) {
          popover.remove();
          document.removeEventListener('click', closePop);
        }
      });
    }, 10);
  }

  function renderAll() {
    overlayLayer.innerHTML = '';
    annotations.forEach(function(ann) { renderAnnotation(ann); });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function debounce(fn, delay) {
    var timer = null;
    return function() {
      if (timer) clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function applyPageAnnotations() {
    var page = getPageName();
    var pageAnnotations = getAnnotationsForPage(page);
    pageAnnotations.forEach(function(a) { addAnnotation(a); });
  }

  function getAnnotationsForPage(page) {
    var map = {
      'index': [
        { selector: '.topbar-logo', label: '品牌Logo', desc: '网站品牌标识，点击返回首页', position: 'bottom-right' },
        { selector: '.hero-title, [class*="hero"] h1, .banner h1', label: '主视觉标题', desc: '页面核心口号，展示产品定位', position: 'bottom-left' },
        { selector: '.topbar-user', label: '账号卡片', desc: '显示当前登录企业/用户信息，点击展开下拉菜单', position: 'center-left' },
        { selector: '.topbar-message', label: '消息通知', desc: '系统消息与通知入口', position: 'center-left' },
        { selector: '.nav-enter-system, .topbar-enter', label: '进入系统', desc: '跳转至管理控制台', position: 'bottom-right' },
      ],
      'account-center': [
        { selector: '.sidebar', label: '侧边导航', desc: '功能模块导航菜单，包含产品、企业、财务、设置等分类', position: 'bottom-right' },
        { selector: '.sidebar-link.active', label: '当前页', desc: '高亮显示当前所在页面', position: 'bottom-left' },
        { selector: '.topbar-user', label: '账号卡片', desc: '右上角显示当前登录的企业名称及下拉操作', position: 'center-left' },
        { selector: '.card-title', label: '功能卡片', desc: '各功能模块的入口卡片', position: 'bottom-right' },
        { selector: '.page-title', label: '页面标题', desc: '当前页面的功能名称', position: 'bottom-left' },
      ],
      'account-security': [
        { selector: '.security-level-card', label: '安全等级', desc: '展示当前账号安全等级评分与建议', position: 'bottom-right' },
        { selector: '.security-item', label: '安全设置项', desc: '每项安全设置（密码/手机/邮箱等）的状态展示与修改入口', position: 'bottom-right' },
        { selector: '.security-item-icon', label: '功能图标', desc: '每个安全设置项的功能标识图标', position: 'bottom-left' },
        { selector: '.security-status', label: '状态指示', desc: '当前安全项的设置状态（已设置/未设置/未认证）', position: 'bottom-left' },
        { selector: '.btn', label: '操作按钮', desc: '执行修改/绑定/去认证等操作', position: 'bottom-right' },
      ],
      'account-project': [
        { selector: '.project-header, .page-header', label: '页面头部', desc: '子公司管理页面标题及说明', position: 'bottom-right' },
        { selector: '.project-card, [class*="sub-entity"]', label: '子公司卡片', desc: '单个子公司的信息卡片，展示编号、名称、状态等', position: 'bottom-right' },
        { selector: '.stat-item, [class*="stat"]', label: '统计数据', desc: '子公司数量、管理员数、余额等汇总数据', position: 'bottom-left' },
        { selector: '.project-list, [class*="table"]', label: '子公司列表', desc: '全部子公司的表格化展示', position: 'bottom-right' },
      ],
      'account-permission': [
        { selector: '.permission-group', label: '权限分组', desc: '按模块分组展示的权限配置项', position: 'bottom-right' },
        { selector: '.permission-item', label: '权限项', desc: '单个功能点的权限配置（查看/编辑/删除等）', position: 'bottom-right' },
        { selector: '.role-select, [class*="role"]', label: '角色选择', desc: '选择要配置的角色', position: 'bottom-left' },
      ],
      'account-user': [
        { selector: '.user-list, [class*="user-table"]', label: '用户列表', desc: '所有子账号的信息展示表格', position: 'bottom-right' },
        { selector: '.user-card, [class*="user-item"]', label: '用户卡片', desc: '单个子账号的详细信息卡片', position: 'bottom-right' },
        { selector: '.add-user-btn, [class*="add-user"]', label: '新增账号', desc: '创建新的子账号', position: 'bottom-left' },
      ],
      'account-realname': [
        { selector: '.legal-info', label: '法人信息', desc: '企业法人代表及资质信息', position: 'bottom-right' },
        { selector: '.biz-license', label: '营业执照', desc: '企业营业执照扫描件展示', position: 'bottom-right' },
        { selector: '.verify-form', label: '认证表单', desc: '填写/修改企业实名信息的表单', position: 'bottom-right' },
      ],
      'account-billing': [
        { selector: '.contract-list, [class*="contract"]', label: '合同列表', desc: '所有已签署的合同文件', position: 'bottom-right' },
        { selector: '.contract-card', label: '合同卡片', desc: '单个合同的详细信息卡片', position: 'bottom-right' },
        { selector: '.upload-btn, [class*="upload"]', label: '上传合同', desc: '签署新合同的入口', position: 'bottom-left' },
      ],
      'account-bank': [
        { selector: '.bank-list, [class*="bank"]', label: '银行账户', desc: '已绑定的银行账户列表', position: 'bottom-right' },
        { selector: '.add-bank-btn, [class*="add-bank"]', label: '添加账户', desc: '绑定新的银行账户', position: 'bottom-left' },
      ],
      'account-wallet': [
        { selector: '.wallet-balance, [class*="balance"]', label: '账户余额', desc: '当前账户可用余额展示', position: 'bottom-right' },
        { selector: '.wallet-record, [class*="record"]', label: '流水记录', desc: '资金收支明细流水', position: 'bottom-right' },
        { selector: '.wallet-action, [class*="action"]', label: '快捷操作', desc: '充值/提现/转账等快捷操作入口', position: 'bottom-left' },
      ],
      'account-message': [
        { selector: '.message-list, [class*="msg-list"]', label: '消息列表', desc: '系统通知与消息列表', position: 'bottom-right' },
        { selector: '.message-item', label: '消息项', desc: '单条消息的内容与状态', position: 'bottom-right' },
      ],
      'account-approval': [
        { selector: '.approval-list, [class*="approval"]', label: '审批列表', desc: '待审批/已审批的流程列表', position: 'bottom-right' },
        { selector: '.approval-card', label: '审批卡片', desc: '单个审批流程的详细信息', position: 'bottom-right' },
      ],
      'account-fund': [
        { selector: '.fund-records, [class*="fund"]', label: '资金记录', desc: '资金划拨与交易记录', position: 'bottom-right' },
        { selector: '.fund-stat, [class*="fund-stat"]', label: '资金统计', desc: '资金余额与交易汇总', position: 'bottom-left' },
      ],
      'verify': [
        { selector: '.step-indicator, [class*="step"]', label: '认证步骤', desc: '企业实名认证的流程步骤指示', position: 'bottom-right' },
        { selector: '.verify-form', label: '认证表单', desc: '填写企业实名信息的表单区域', position: 'bottom-right' },
        { selector: '.upload-area, [class*="upload"]', label: '资质上传', desc: '上传营业执照等资质文件', position: 'bottom-left' },
      ],
    };

    return map[page] || [];
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
