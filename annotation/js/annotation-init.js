(function() {
  function initPage() {
    var engine = window.__annEngine;
    var data = window.__annData;
    var pageName = window.__annGetPageName ? window.__annGetPageName() : 'index';
    var normalizedName = pageName.replace(/-/g, '_');

    if (!engine || !data) {
      setTimeout(initPage, 100);
      return;
    }

    var pageData = data[pageName] || data[normalizedName] || data[pageName.replace(/_/g, '-')];
    if (!pageData) {
      console.log('[标注版] 未找到页面数据:', pageName, '，使用默认数据');
      pageData = {
        pageInfo: {
          title: pageName,
          description: '当前页面标注数据',
          features: ['查看标注角标', '点击角标查看功能说明'],
          featureFlows: [
            {
              name: '页面浏览流程',
              steps: [
                { step: 1, title: '浏览页面', desc: '查看页面内容和标注角标' },
                { step: 2, title: '点击角标', desc: '点击红色编号角标' },
                { step: 3, title: '查看详情', desc: '查看功能说明和交互方式' }
              ]
            }
          ]
        },
        annotations: [
          { id: 1, selector: '.topbar-user', label: '账号卡片', position: 'bl',
            description: '右上角账号卡片', interaction: '点击展开', steps: ['点击账号卡片', '展开菜单'] },
          { id: 2, selector: 'button, .btn, [class*="btn"]', label: '操作按钮', position: 'br',
            description: '页面操作按钮', interaction: '点击执行', steps: ['点击按钮', '执行操作'] }
        ]
      };
    }

    engine.init(pageData);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPage);
  } else {
    initPage();
  }
})();
