(function() {
  'use strict';

  var engine = {
    overlay: null,
    connectorLayer: null,
    toolbar: null,
    flowchart: null,
    pagePanel: null,
    annotations: [],
    activeAnnotations: [],
    cardConnectors: {},
    pageData: null,
    counter: 0,
    isHidden: false,
    isFrameHidden: false,
    isMarkHidden: false,
    isMinimal: false,

    init: function(pageData) {
      this.pageData = pageData;
      this.buildOverlay();
      this.buildToolbar();
      this.buildPagePanel();
      this.buildFlowchart();
      this.injectAnnotations();
      this.renderAll();

      var self = this;
      window.addEventListener('resize', function() { self.renderAll(); });
      window.addEventListener('scroll', function() { self.renderAll(); }, true);
      window.addEventListener('resize', function() { self.renderAll(); });

      document.addEventListener('click', function(e) {
        if (!e.target.closest('.ann-card') && !e.target.closest('.ann-corner-mark') && !e.target.closest('.ann-toolbar')) {
          self.closeAllCards();
        }
      });

      // Initial inject: pick up pre-existing-but-hidden dropdowns/modals (e.g. #userDropdown, #switchEntModal)
      self.injectDynamicAnnotations();
      self.renderAll();

      // Monitor DOM changes for dynamic elements (dropdowns, modals, cards) — include class/open mutations
      if (typeof MutationObserver !== 'undefined') {
        this._observer = new MutationObserver(function(mutations) {
          var dirty = false;
          mutations.forEach(function(m) {
            if (m.type === 'attributes' && m.attributeName === 'class') {
              var tgt = m.target;
              var cls = (tgt.className && typeof tgt.className === 'string') ? tgt.className : '';
              // Class toggled to "open" / dropdown / modal visible → treat as dirty
              if (cls.indexOf('open') >= 0 || cls.indexOf('dropdown') >= 0 || cls.indexOf('modal') >= 0 ||
                  cls.indexOf('Dropdown') >= 0 || cls.indexOf('Modal') >= 0) {
                dirty = true;
              }
            }
            if (m.addedNodes && m.addedNodes.length > 0) {
              for (var i = 0; i < m.addedNodes.length; i++) {
                var node = m.addedNodes[i];
                if (node.nodeType === 1) {
                  var cls2 = (node.className && typeof node.className === 'string') ? node.className : '';
                  var role = node.getAttribute && node.getAttribute('role') || '';
                  if (cls2.indexOf('dropdown') >= 0 || cls2.indexOf('pop') >= 0 || cls2.indexOf('modal') >= 0 ||
                      cls2.indexOf('Dropdown') >= 0 || cls2.indexOf('Pop') >= 0 || cls2.indexOf('Modal') >= 0 ||
                      role === 'dialog' || role === 'listbox' || role === 'menu') {
                    dirty = true;
                  }
                }
              }
            }
          });
          if (dirty) {
            setTimeout(function() { self.injectDynamicAnnotations(); self.renderAll(); }, 60);
          }
        });
        this._observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'style'] });
      }

      // Re-check after interaction delays for dropdowns/modals opened by topbar clicks
      var delayedCheck = function() {
        setTimeout(function() { self.injectDynamicAnnotations(); self.renderAll(); }, 200);
        setTimeout(function() { self.injectDynamicAnnotations(); self.renderAll(); }, 500);
      };
      document.addEventListener('click', delayedCheck);
    },

    buildOverlay: function() {
      this.overlay = document.createElement('div');
      this.overlay.className = 'ann-overlay-layer';
      document.body.appendChild(this.overlay);

      this.connectorLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      this.connectorLayer.setAttribute('class', 'ann-connector-layer');
      this.connectorLayer.setAttribute('width', '100%');
      this.connectorLayer.setAttribute('height', '100%');
      this.connectorLayer.style.position = 'fixed';
      this.connectorLayer.style.inset = '0';
      this.connectorLayer.style.zIndex = '999998';
      this.connectorLayer.style.pointerEvents = 'none';
      this.connectorLayer.style.overflow = 'visible';
      document.body.appendChild(this.connectorLayer);
    },

    buildToolbar: function() {
      this.toolbar = document.createElement('div');
      this.toolbar.className = 'ann-toolbar';
      this.toolbar.innerHTML =
        '<span class="ann-toolbar-label">🏷️ 标注版</span>' +
        '<span style="font-size:11px;color:#86909C;">' + (this.pageData.pageInfo.title || '') + '</span>' +
        '<div class="ann-toolbar-sep"></div>' +
        '<button class="ann-toolbar-btn" data-action="toggle">隐藏全部</button>' +
        '<button class="ann-toolbar-btn" data-action="frame" title="标注框">框</button>' +
        '<button class="ann-toolbar-btn" data-action="mark" title="标注记号">记</button>' +
        '<button class="ann-toolbar-btn" data-action="flow">流程图</button>' +
        '<button class="ann-toolbar-btn" data-action="info">说明</button>' +
        '<button class="ann-toolbar-btn" data-action="export">导出</button>';

      var self = this;
      this.toolbar.querySelectorAll('[data-action]').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var action = btn.dataset.action;
          if (action === 'toggle') self.toggleAnnotations(btn);
          else if (action === 'frame') self.toggleFrame(btn);
          else if (action === 'mark') self.toggleMark(btn);
          else if (action === 'flow') self.togglePanel(self.flowchart, btn, '流程图');
          else if (action === 'info') self.togglePanel(self.pagePanel, btn, '说明');
          else if (action === 'export') self.exportData();
        });
      });
      document.body.appendChild(this.toolbar);
    },

    toggleFrame: function(btn) {
      this.isFrameHidden = !this.isFrameHidden;
      document.body.classList.toggle('ann-frame-hidden', this.isFrameHidden);
      btn.classList.toggle('active', this.isFrameHidden);
      btn.textContent = this.isFrameHidden ? '框' : '框';
      btn.style.opacity = this.isFrameHidden ? '0.4' : '1';
    },

    toggleMark: function(btn) {
      this.isMarkHidden = !this.isMarkHidden;
      document.body.classList.toggle('ann-mark-hidden', this.isMarkHidden);
      btn.classList.toggle('active', this.isMarkHidden);
      btn.textContent = this.isMarkHidden ? '记' : '记';
      btn.style.opacity = this.isMarkHidden ? '0.4' : '1';
    },

    toggleAnnotations: function(btn) {
      this.isHidden = !this.isHidden;
      document.body.classList.toggle('ann-hidden', this.isHidden);
      btn.textContent = this.isHidden ? '显示全部' : '隐藏全部';
      btn.classList.toggle('active', this.isHidden);
      if (this.isHidden) {
        this.closeAllCards();
        this.hidePanel(this.flowchart);
        this.hidePanel(this.pagePanel);
      }
    },

    toggleMinimal: function(btn) {
      this.isMinimal = !this.isMinimal;
      document.body.classList.toggle('ann-minimal', this.isMinimal);
      btn.textContent = this.isMinimal ? '完整模式' : '紧凑';
      btn.classList.toggle('active', this.isMinimal);
    },

    togglePanel: function(panel, btn, label) {
      if (!panel) return;
      if (panel.style.display === 'none' || !panel.isConnected) {
        panel.style.display = 'flex';
        btn.textContent = '隐藏' + label;
        btn.classList.add('active');
      } else {
        panel.style.display = 'none';
        btn.textContent = label;
        btn.classList.remove('active');
      }
    },

    hidePanel: function(panel) {
      if (panel) panel.style.display = 'none';
    },

    exportData: function() {
      var data = {
        page: this.pageData.pageInfo,
        annotations: this.annotations.map(function(a) {
          return {
            id: a.id,
            selector: a.selector,
            label: a.label,
            description: a.description,
            interaction: a.interaction,
            steps: a.steps
          };
        })
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'annotation-' + (this.pageData.pageInfo.title || 'page') + '.json';
      a.click();
      URL.revokeObjectURL(url);
    },

    buildPagePanel: function() {
      var info = this.pageData.pageInfo;
      if (!info) return;

      this.pagePanel = document.createElement('div');
      this.pagePanel.className = 'ann-page-panel';
      this.pagePanel.innerHTML =
        '<div class="ann-page-panel-header">' +
          '<span>📄 页面说明</span>' +
          '<span style="cursor:pointer;" onclick="this.closest(\'.ann-page-panel\').style.display=\'none\'">×</span>' +
        '</div>' +
        '<div class="ann-page-panel-body">' +
          '<div class="ann-page-meta">' + info.description + '</div>' +
          '<div style="font-size:11px;font-weight:700;color:#722ED1;margin-bottom:6px;">核心功能</div>' +
          '<ul class="ann-page-features">' +
            (info.features || []).map(function(f) { return '<li>' + f + '</li>'; }).join('') +
          '</ul>' +
        '</div>';
      document.body.appendChild(this.pagePanel);
    },

    buildFlowchart: function() {
      var info = this.pageData.pageInfo;
      if (!info || !info.featureFlows || info.featureFlows.length === 0) return;

      var self = this;
      var currentFlowIndex = 0;

      function renderFlow(index) {
        var flow = info.featureFlows[index];
        var stepsHtml = flow.steps.map(function(step, i) {
          return '' +
            (i > 0 ? '<div class="ann-flow-arrow">▼</div>' : '') +
            '<div class="ann-flow-step">' +
              '<div class="ann-flow-step-num">' + step.step + '</div>' +
              '<div class="ann-flow-step-content">' +
                '<div class="step-title">' + step.title + '</div>' +
                '<div class="step-desc">' + step.desc + '</div>' +
              '</div>' +
            '</div>';
        }).join('');

        var tabsHtml = info.featureFlows.map(function(f, i) {
          return '<div class="ann-flow-tab' + (i === index ? ' active' : '') + '" data-idx="' + i + '">' + f.name + '</div>';
        }).join('');

        self.flowchart.innerHTML =
          '<div class="ann-flowchart-header">' +
            '<span>🔄 功能流程</span>' +
            '<span style="cursor:pointer;" onclick="this.closest(\'.ann-flowchart\').style.display=\'none\'">×</span>' +
          '</div>' +
          '<div class="ann-flow-tabs">' + tabsHtml + '</div>' +
          '<div class="ann-flowchart-body">' + stepsHtml + '</div>';

        self.flowchart.querySelectorAll('.ann-flow-tab').forEach(function(tab) {
          tab.addEventListener('click', function() {
            var idx = parseInt(tab.getAttribute('data-idx'), 10);
            renderFlow(idx);
          });
        });
      }

      this.flowchart = document.createElement('div');
      this.flowchart.className = 'ann-flowchart';
      document.body.appendChild(this.flowchart);
      renderFlow(currentFlowIndex);
    },

    injectAnnotations: function() {
      var self = this;
      var pageAnnotations = this.pageData.annotations || [];

      pageAnnotations.forEach(function(data) {
        var el = document.querySelector(data.selector);
        if (!el) return;
        if (!self.isElementMeaningfullyVisible(el)) return;

        self.counter++;
        var ann = {
          id: data.id || self.counter,
          selector: data.selector,
          label: data.label || '',
          description: data.description || '',
          interaction: data.interaction || '',
          steps: data.steps || [],
          position: data.position || 'tr',
          el: el,
          cornerMark: null,
          highlightFrame: null,
          card: null
        };

        self.createCornerMark(ann);
        self.createHighlightFrame(ann);
        self.createAnnotationCard(ann);
        self.annotations.push(ann);
      });
    },

    injectDynamicAnnotations: function() {
      var self = this;
      // Define dynamic dropdown/modal annotations — use IDs for exact match where available
      var dyn = [
        {
          label: '用户下拉卡片',
          selector: '#userDropdown, .user-dropdown, [class*="user-dropdown"], [class*="userDrop"]',
          description: '账号信息下拉卡片，展示当前登录的企业名称、身份标签、认证状态，集成了切换企业、进入控制台和退出登录操作。',
          interaction: '点击右上角账号卡片展开/收起',
          steps: ['点击账号卡片', '展开下拉面板', '查看企业信息和认证标签', '点击按钮执行对应操作'],
          position: 'br'
        },
        {
          label: '切换企业徽章按钮',
          selector: '.user-dropdown-switch-ent-badge, .user-dropdown [class*="switch-ent"], .user-dropdown [class*="switch-enterprise"], .user-dropdown [onclick*="switch"], .user-dropdown [onclick*="Switch"]',
          description: '下拉卡片顶部右上角的"切换企业"徽章按钮，点击后弹出企业选择弹窗。',
          interaction: '点击弹出企业选择弹窗',
          steps: ['点击"切换企业"徽章', '弹窗显示母公司列表', '选择目标母公司或其子公司', '点击"登录"切换身份'],
          position: 'tr'
        },
        {
          label: '进入控制台按钮',
          selector: '#dropdownEnterConsole, .user-dropdown-enter-console, .user-dropdown [class*="enter-console"], .user-dropdown [onclick*="account-center"], .user-dropdown [href*="account-center"]',
          description: '下拉卡片中醒目的蓝色"进入控制台"按钮，一键跳转管理控制台首页。',
          interaction: '点击跳转控制台首页',
          steps: ['点击"进入控制台"', '跳转到 account-center.html'],
          position: 'bl'
        },
        {
          label: '添加新企业入口',
          selector: '#addNewEnterprise, .user-dropdown-action[data-action="add-new-enterprise"], .user-dropdown [onclick*="AddNewEnterprise"]',
          description: '下拉卡片操作区中的"添加新企业"入口，用于绑定第二个企业账号。',
          interaction: '点击跳转新企业认证流程',
          steps: ['点击"添加新企业"', '跳转企业认证页', '填写新企业信息提交'],
          position: 'br'
        },
        {
          label: '安全中心入口',
          selector: '.user-dropdown-action[href*="account-security"], .user-dropdown-action[href*="security"]',
          description: '下拉卡片操作区中的进入安全中心入口，用于修改密码和绑定手机。',
          interaction: '点击跳转安全设置页',
          steps: ['点击"安全中心"', '跳转 account-security.html'],
          position: 'br'
        },
        {
          label: '退出登录按钮',
          selector: '#logoutBtn, .user-dropdown-logout, .user-dropdown [class*="logout"], .user-dropdown [onclick*="logout"], .user-dropdown [onclick*="LogOut"]',
          description: '下拉卡片最底部的退出登录按钮，清除当前账号的登录态并跳转登录页。',
          interaction: '点击退出登录',
          steps: ['点击"退出登录"按钮', '清除 localStorage 登录态', '自动跳转 login.html'],
          position: 'br'
        },
        {
          label: '消息通知面板',
          selector: '.message-dropdown, [class*="message-panel"], [class*="messagePop"], [class*="messagePanel"]',
          description: '点击右上角铃铛图标展开的消息面板，按类别展示系统消息、审批通知、公告等。',
          interaction: '点击消息铃铛图标展开面板',
          steps: ['点击消息铃铛', '展开消息面板浏览列表', '点击消息条目跳转对应处理页', '未读消息自动清除红点'],
          position: 'tl'
        },
        {
          label: '选择企业登录弹窗',
          selector: '#switchEntModal > div.modal, .modal-mask#switchEntModal > .modal',
          description: '左上角弹出的"选择企业登录"居中弹窗（第一级），展示所有已绑定的母公司列表，支持搜索、直接切换或进入子公司选择。内部白色卡片。',
          interaction: '点击"切换企业"徽章后弹出',
          steps: ['查看顶部标题"选择企业登录"', '使用搜索框按企业名称筛选', '浏览列表查看每家企业的角色和子公司数量', '选择点击"登录"直接切母公司，或点"子公司登录"进入二级选择'],
          position: 'tr'
        },
        {
          label: '选择企业-关闭按钮',
          selector: '#switchEntModal .modal-close',
          description: '选择企业弹窗右上角的 × 关闭按钮，点击后关闭弹窗不做任何切换。',
          interaction: '点击关闭当前弹窗',
          steps: ['点击×按钮', '关闭弹窗及遮罩层', '保留当前登录企业身份不变'],
          position: 'tr'
        },
        {
          label: '选择企业-搜索框',
          selector: '#switchEntSearch',
          description: '选择企业弹窗顶部的"搜索企业名称"输入框，带放大镜图标，根据名称关键词实时过滤母公司列表。',
          interaction: '输入关键词实时过滤',
          steps: ['点击搜索框获得焦点', '输入企业名称关键词（如"云创"/"星耀"）', '下方企业列表实时过滤匹配项'],
          position: 'tl'
        },
        {
          label: '选择企业-企业数量统计',
          selector: '#switchEntCount',
          description: '搜索框下方的统计文字，显示"共 N 家企业"或"搜索到 N 家企业"。',
          interaction: '纯展示',
          steps: ['查看企业总数/搜索匹配数'],
          position: 'bl'
        },
        {
          label: '企业行（母公司）',
          selector: '#switchEntList .switch-ent-item, .switch-ent-item',
          description: '弹窗列表中的每一家母公司卡片，包含首字母logo方块、企业名称、角色标签、子公司数标签和右侧操作按钮。',
          interaction: 'hover高亮效果，点击按钮操作',
          steps: ['查看首字母logo和企业名称', '确认角色（主管理员/子管理员）和子公司数量', '点击右侧登录或子公司登录按钮'],
          position: 'bl'
        },
        {
          label: '登录按钮（母公司切换）',
          selector: '.switch-ent-login-btn[data-ent-id]',
          description: '企业行右侧的蓝色渐变"登录"按钮，点击后立即以目标母公司身份重新登录页面。',
          interaction: '点击后刷新页面并切换身份',
          steps: ['点击某个企业的"登录"按钮', 'localStorage 写入新的 current_enterprise_id 和 account_type=main', '页面刷新后以新的母公司身份进入'],
          position: 'br'
        },
        {
          label: '当前登录徽章',
          selector: '#switchEntList .switch-ent-item.active .switch-ent-action > div:first-child',
          description: '当前已登录的企业行最右侧按钮位置会显示为实心蓝色的"当前登录"徽章，表示当前正处于该企业身份。',
          interaction: '纯展示',
          steps: ['识别"当前登录"蓝色徽章', '确认当前身份'],
          position: 'br'
        },
        {
          label: '子公司登录按钮',
          selector: '.switch-ent-sub-btn[data-ent-id]',
          description: '存在子公司的企业行右侧，白色边框"子公司登录 >"按钮，点击后弹出二级"选择子公司"弹窗。',
          interaction: '点击打开子公司选择弹窗',
          steps: ['点击"子公司登录 >"按钮', '关闭当前母公司弹窗', '打开子公司弹窗，显示该母公司下全部子公司列表'],
          position: 'br'
        },
        {
          label: '选择子公司弹窗',
          selector: '#switchSubEntModal > div.modal, .modal-mask#switchSubEntModal > .modal',
          description: '第二级居中弹出的"选择登录的子公司"弹窗，左上角带返回箭头回到母公司列表，支持搜索和直接登录子公司身份。内部白色卡片。',
          interaction: '点击"子公司登录 >"后弹出',
          steps: ['查看副标题，显示所属母公司名称和子公司总数', '使用搜索框按子公司名称筛选', '点击目标子公司的"登录"按钮切换身份'],
          position: 'tr'
        },
        {
          label: '选择子公司-返回箭头',
          selector: '#switchSubEntModal .switch-sub-ent-back',
          description: '子公司弹窗标题左上角的左箭头圆形按钮，点击后关闭子公司弹窗并回到母公司选择弹窗。',
          interaction: '点击返回上一级',
          steps: ['点击返回箭头按钮', '关闭子公司弹窗', '重新打开母公司选择弹窗'],
          position: 'tl'
        },
        {
          label: '选择子公司-关闭按钮',
          selector: '#switchSubEntModal .modal-close',
          description: '子公司选择弹窗右上角的 × 关闭按钮，点击后直接关闭两级弹窗流程。',
          interaction: '点击关闭所有切换企业弹窗',
          steps: ['点击×按钮', '关闭子公司弹窗', '保留当前登录身份不变'],
          position: 'tr'
        },
        {
          label: '选择子公司-搜索框',
          selector: '#switchSubEntSearch',
          description: '子公司弹窗顶部的"搜索子公司名称"输入框，按名称关键词实时过滤子公司列表。',
          interaction: '输入关键词实时过滤',
          steps: ['点击搜索框获得焦点', '输入子公司名称关键词', '列表实时过滤匹配'],
          position: 'tl'
        },
        {
          label: '选择子公司-副标题',
          selector: '#switchSubEntSubtitle',
          description: '标题下方的灰色小字，格式为"{母公司名称} · 共 N 个子公司"或搜索时的"搜索到 N 个子公司"。',
          interaction: '纯展示',
          steps: ['查看所属母公司和子公司总数/搜索匹配数'],
          position: 'tl'
        },
        {
          label: '子公司行',
          selector: '#switchSubEntList .switch-sub-ent-item, .switch-sub-ent-item',
          description: '子公司列表中的每一行卡片，包含首字母logo方块、子公司名称和角色标签。',
          interaction: 'hover高亮效果，点击右侧按钮操作',
          steps: ['查看子公司名称和角色（子管理员）', '点击右侧"登录"按钮切换身份'],
          position: 'bl'
        },
        {
          label: '登录按钮（子公司切换）',
          selector: '.switch-sub-ent-login-btn',
          description: '非当前登录的子公司行右侧蓝色渐变"登录"按钮，点击立即切换为子公司身份并刷新页面。',
          interaction: '点击后刷新页面并切换为子账号身份',
          steps: ['点击目标子公司的"登录"按钮', 'localStorage 写入 current_enterprise_id 和 account_type=sub', '页面刷新，顶部导航显示新的公司名称及"子公司"徽章'],
          position: 'br'
        },
        {
          label: '切换企业弹窗（通用/兜底）',
          selector: '.modal-mask .modal, [class*="switch-modal"], [class*="switchEntModal"], [class*="enterprise-modal"], [class*="enterprise-switch-modal"]',
          description: '企业选择弹窗的通用兜底匹配（兼容未命名弹窗样式）。',
          interaction: '点击切换企业后弹出居中弹窗',
          steps: ['查看企业列表', '选择目标母/子公司', '点击"登录"切换身份'],
          position: 'tr'
        },
        {
          label: '企业未认证全局弹窗',
          selector: '#globalVerifyModal > div, #globalVerifyModal > div:first-child',
          description: '企业尚未完成实名认证时弹出的全局提醒弹窗，覆盖在页面正中央，显示警告图标、提醒文案和两个操作按钮。',
          interaction: '进入控制台等 account-* 页面时自动弹出，同时灰色遮罩覆盖页面其余内容',
          steps: ['查看警告图标和提示标题"企业尚未完成认证"', '阅读说明文字，了解需要完成认证才能正常使用', '选择点击其中一个操作按钮'],
          position: 'tr'
        },
        {
          label: '稍后再说按钮',
          selector: '#verifyModalSkip',
          description: '全局认证弹窗左下角的"稍后再说"次要按钮，点击后仅关闭弹窗，不跳转认证页。',
          interaction: '点击关闭当前弹窗，但下次进入页面时仍会再次弹出提醒',
          steps: ['点击"稍后再说"按钮', '关闭全局认证弹窗', '下次进入页面会再次提示认证'],
          position: 'bl'
        },
        {
          label: '立即去认证按钮',
          selector: '#verifyModalGo',
          description: '全局认证弹窗右下角的蓝色"立即去认证"主操作按钮，点击后直接跳转企业认证页。',
          interaction: '点击跳转到 verify.html 开始三步认证流程',
          steps: ['点击"立即去认证"蓝色按钮', '关闭弹窗并清除 body 上的未认证标记', '自动跳转 verify.html 企业认证页面'],
          position: 'br'
        },
        {
          label: '认证遮罩层（保留兜底）',
          selector: '[class*="verify-modal"], [class*="verification-modal"], [class*="unverified-modal"]',
          description: '其他版本认证弹窗的遮罩层容器（兜底匹配）。',
          interaction: '进入页面自动弹出',
          steps: ['查看提示', '点击对应操作按钮'],
          position: 'tr'
        },
        {
          label: '认证弹窗操作按钮（兜底）',
          selector: '[class*="verify-modal"] .btn, [class*="verification-modal"] .btn, [class*="unverified-modal"] .btn, [class*="verify-modal"] button, [class*="unverified-modal"] button',
          description: '其他版本认证弹窗中的操作按钮兜底匹配。',
          interaction: '点击执行对应操作',
          steps: ['按需点击按钮'],
          position: 'br'
        }
      ];

      dyn.forEach(function(data) {
        // Skip if already injected for this selector
        var exists = self.annotations.some(function(a) { return a.selector === data.selector; });
        if (exists) return;
        var el = document.querySelector(data.selector);
        if (!el) return;
        if (!self.isElementMeaningfullyVisible(el)) return;
        self.counter++;
        var ann = {
          id: self.counter,
          selector: data.selector,
          label: data.label,
          description: data.description,
          interaction: data.interaction,
          steps: data.steps,
          position: data.position || 'tr',
          el: el,
          cornerMark: null,
          highlightFrame: null,
          card: null
        };
        self.createCornerMark(ann);
        self.createHighlightFrame(ann);
        self.createAnnotationCard(ann);
        self.annotations.push(ann);
      });
    },

    isElementMeaningfullyVisible: function(el) {
      if (!el || !document.body.contains(el)) return false;
      // Skip elements that are part of the annotation engine itself (page panel, flowchart, cards, toolbar, connectors, marks, frames)
      if (el.classList) {
        var selfClasses = ['ann-page-panel','ann-flowchart','ann-card','ann-corner-mark','ann-highlight-frame','ann-connector','ann-toolbar','ann-tooltip'];
        for (var i = 0; i < selfClasses.length; i++) {
          if (el.classList.contains(selfClasses[i])) return false;
        }
      }
      var rect = el.getBoundingClientRect();
      if (rect.width < 2 || rect.height < 2) return false;
      var cs = getComputedStyle(el);
      if (cs.display === 'none') return false;
      if (cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
      var opacity = parseFloat(cs.opacity || '1');
      if (opacity < 0.12) return false;
      // Also walk up to ensure an ancestor isn't hiding us entirely (otherwise width/height passed but element invisible)
      var node = el.parentNode;
      while (node && node !== document.body && node !== document.documentElement) {
        if (node.nodeType === 1) {
          var pcs = getComputedStyle(node);
          if (pcs.display === 'none') return false;
          if (pcs.visibility === 'hidden') return false;
          var pop = parseFloat(pcs.opacity || '1');
          // Container-level opacity: combined product will be near zero so skip only if container is effectively invisible
          if (pop < 0.08) return false;
        }
        node = node.parentNode;
      }
      return true;
    },

    createCornerMark: function(ann) {
      var mark = document.createElement('div');
      mark.className = 'ann-corner-mark pos-' + ann.position;
      mark.innerHTML = '<div class="ann-corner-dot">' + ann.id + '</div>';
      mark.title = ann.label + ' - 点击查看详情';

      var self = this;
      mark.addEventListener('click', function(e) {
        e.stopPropagation();
        self.toggleCard(ann);
      });

      this.overlay.appendChild(mark);
      ann.cornerMark = mark;
    },

    createHighlightFrame: function(ann) {
      var frame = document.createElement('div');
      frame.className = 'ann-highlight-frame';
      this.overlay.appendChild(frame);
      ann.highlightFrame = frame;
    },

    createAnnotationCard: function(ann) {
      var card = document.createElement('div');
      card.className = 'ann-card';

      var stepsHtml = ann.steps && ann.steps.length > 0
        ? '<div class="ann-card-section">' +
            '<div class="ann-card-section-title">操作步骤</div>' +
            '<ol class="ann-card-steps">' +
              ann.steps.map(function(s) { return '<li>' + s + '</li>'; }).join('') +
            '</ol>' +
          '</div>'
        : '';

      var interactionHtml = ann.interaction
        ? '<div class="ann-card-section">' +
            '<div class="ann-card-section-title">交互方式</div>' +
            '<div class="ann-card-interaction">' + ann.interaction + '</div>' +
          '</div>'
        : '';

      card.innerHTML =
        '<div class="ann-card-header">' +
          '<div class="ann-card-title">' +
            '<span class="ann-card-id">' + ann.id + '</span>' +
            '<span>' + escapeHtml(ann.label) + '</span>' +
          '</div>' +
          '<button class="ann-card-close" aria-label="关闭">×</button>' +
        '</div>' +
        '<div class="ann-card-body">' +
          '<div class="ann-card-section">' +
            '<div class="ann-card-section-title">功能说明</div>' +
            '<div class="ann-card-desc">' + escapeHtml(ann.description) + '</div>' +
          '</div>' +
          stepsHtml +
          interactionHtml +
        '</div>';

      var self = this;
      card.querySelector('.ann-card-close').addEventListener('click', function(e) {
        e.stopPropagation();
        self.closeCard(ann);
      });

      var dragOffsetX = 0, dragOffsetY = 0, isDragging = false;
      var zIndexCounter = 100;

      card.addEventListener('mousedown', function() {
        zIndexCounter++;
        card.style.zIndex = zIndexCounter;
      });

      card.querySelector('.ann-card-header').addEventListener('mousedown', function(e) {
        if (e.target.classList.contains('ann-card-close')) return;
        isDragging = true;
        var rect = card.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        e.preventDefault();
      });

      document.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        var newLeft = e.clientX - dragOffsetX;
        var newTop = e.clientY - dragOffsetY;
        newLeft = Math.max(8, Math.min(window.innerWidth - card.offsetWidth - 8, newLeft));
        newTop = Math.max(8, Math.min(window.innerHeight - card.offsetHeight - 8, newTop));
        card.style.left = newLeft + 'px';
        card.style.top = newTop + 'px';
        self.drawConnector(ann);
      });

      document.addEventListener('mouseup', function() {
        isDragging = false;
      });

      this.overlay.appendChild(card);
      ann.card = card;
    },

    toggleCard: function(ann) {
      if (ann.card.classList.contains('show')) {
        this.closeCard(ann);
      } else {
        this.openCard(ann);
      }
    },

    openCard: function(ann) {
      ann.card.classList.add('show');
      ann.cornerMark.classList.add('active');
      ann.highlightFrame.classList.add('active');

      if (this.activeAnnotations.indexOf(ann) === -1) {
        this.activeAnnotations.push(ann);
      }

      this.positionCard(ann);
      this.drawConnector(ann);
    },

    closeCard: function(ann) {
      ann.card.classList.remove('show');
      ann.cornerMark.classList.remove('active');
      ann.highlightFrame.classList.remove('active');

      var idx = this.activeAnnotations.indexOf(ann);
      if (idx !== -1) {
        this.activeAnnotations.splice(idx, 1);
      }

      if (this.cardConnectors[ann.id]) {
        this.cardConnectors[ann.id].forEach(function(p) { p.remove(); });
        delete this.cardConnectors[ann.id];
      }
    },

    closeAllCards: function() {
      var self = this;
      this.annotations.forEach(function(ann) {
        ann.card.classList.remove('show');
        ann.cornerMark.classList.remove('active');
        ann.highlightFrame.classList.remove('active');
      });
      this.activeAnnotations = [];
      this.clearConnectors();
    },

    positionCard: function(ann) {
      var markRect = ann.cornerMark.getBoundingClientRect();
      var cardW = ann.card.offsetWidth || 320;
      var cardH = ann.card.offsetHeight || 300;
      var vw = window.innerWidth;
      var vh = window.innerHeight;

      var targetLeft = markRect.right + 16;
      var targetTop = markRect.top - 20;

      if (targetLeft + cardW + 20 > vw) {
        targetLeft = markRect.left - cardW - 16;
      }
      if (targetLeft < 8) targetLeft = 8;
      if (targetTop < 8) targetTop = 8;
      if (targetTop + cardH + 10 > vh) {
        targetTop = vh - cardH - 10;
      }

      ann.card.style.left = targetLeft + 'px';
      ann.card.style.top = targetTop + 'px';
    },

    drawConnector: function(ann) {
      if (this.cardConnectors[ann.id]) {
        this.cardConnectors[ann.id].forEach(function(p) { p.remove(); });
      }
      this.cardConnectors[ann.id] = [];

      var markRect = ann.cornerMark.getBoundingClientRect();
      var cardRect = ann.card.getBoundingClientRect();

      var markX = markRect.left + markRect.width / 2;
      var markY = markRect.top + markRect.height / 2;

      var cardAnchorX, cardAnchorY;
      if (markX < cardRect.left) {
        cardAnchorX = cardRect.left;
        cardAnchorY = cardRect.top + 20;
      } else {
        cardAnchorX = cardRect.right;
        cardAnchorY = cardRect.top + 20;
      }

      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      var midX = (markX + cardAnchorX) / 2;
      var d = 'M ' + markX + ' ' + markY +
              ' C ' + midX + ' ' + markY + ', ' + midX + ' ' + cardAnchorY + ', ' + cardAnchorX + ' ' + cardAnchorY;
      path.setAttribute('d', d);
      path.setAttribute('class', 'ann-connector highlight');
      path.setAttribute('stroke', '#FA8C16');
      path.setAttribute('stroke-width', '2.5');
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke-dasharray', '6 3');
      path.style.filter = 'drop-shadow(0 0 3px rgba(250, 140, 22, 0.5))';

      this.connectorLayer.appendChild(path);
      this.cardConnectors[ann.id].push(path);

      var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', markX);
      circle.setAttribute('cy', markY);
      circle.setAttribute('r', '4');
      circle.setAttribute('fill', '#FA8C16');
      this.connectorLayer.appendChild(circle);
      this.cardConnectors[ann.id].push(circle);

      var endCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      endCircle.setAttribute('cx', cardAnchorX);
      endCircle.setAttribute('cy', cardAnchorY);
      endCircle.setAttribute('r', '3');
      endCircle.setAttribute('fill', '#FA8C16');
      this.connectorLayer.appendChild(endCircle);
      this.cardConnectors[ann.id].push(endCircle);
    },

    clearConnectors: function() {
      while (this.connectorLayer.firstChild) {
        this.connectorLayer.removeChild(this.connectorLayer.firstChild);
      }
    },

    renderAll: function() {
      var self = this;

      this.annotations.forEach(function(ann) {
        if (!ann.el || !ann.el.isConnected) return;
        if (document.body.classList.contains('ann-hidden')) return;

        var visible = self.isElementMeaningfullyVisible(ann.el);
        if (ann.cornerMark) ann.cornerMark.style.display = visible ? '' : 'none';
        if (ann.highlightFrame) ann.highlightFrame.style.display = visible ? '' : 'none';
        // For annotation cards: we keep them if user already opened (we don't auto-close),
        // but for positioning calculations we still skip if the source is invisible
        if (!visible) return;

        var rect = ann.el.getBoundingClientRect();

        ann.highlightFrame.style.left = rect.left + 'px';
        ann.highlightFrame.style.top = rect.top + 'px';
        ann.highlightFrame.style.width = rect.width + 'px';
        ann.highlightFrame.style.height = rect.height + 'px';

        var markSize = 24;
        var pos = ann.position;
        var mx, my;
        if (pos === 'tr') {
          mx = rect.right;
          my = rect.top;
        } else if (pos === 'tl') {
          mx = rect.left;
          my = rect.top;
        } else if (pos === 'bl') {
          mx = rect.left;
          my = rect.bottom;
        } else if (pos === 'br') {
          mx = rect.right;
          my = rect.bottom;
        } else {
          mx = rect.right - 4;
          my = rect.top - 4;
        }

        ann.cornerMark.style.left = (mx - markSize / 2) + 'px';
        ann.cornerMark.style.top = (my - markSize / 2) + 'px';
        ann.cornerMark.style.right = 'auto';
        ann.cornerMark.style.bottom = 'auto';
      });

      var self = this;
      this.activeAnnotations.forEach(function(ann) {
        self.positionCard(ann);
        self.drawConnector(ann);
      });
    }
  };

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function getPageName() {
    var path = window.location.pathname;
    var file = path.split('/').pop() || 'index.html';
    var name = file.replace('.html', '');
    return name.replace(/-/g, '_');
  }

  window.__annEngine = engine;
  window.__annGetPageName = getPageName;

})();
