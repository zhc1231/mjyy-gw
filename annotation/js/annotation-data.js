(function() {
  'use strict';

  var data = {

    index: {
      pageInfo: {
        title: '首页',
        description: '民匠有约 - 企业数字化服务生态平台门户首页，展示产品、解决方案和平台入口。',
        features: [
          '品牌展示 - 展示企业品牌形象与定位',
          '产品导航 - 各产品线入口快速跳转',
          '解决方案 - 行业解决方案展示',
          '客户案例 - 成功案例展示',
          '系统入口 - 控制台/子公司登录入口',
          '消息通知 - 系统消息与公告'
        ],
        featureFlows: [
          {
            name: '进入系统流程',
            steps: [
              { step: 1, title: '点击"进入系统"', desc: '用户点击右上角"进入系统"按钮' },
              { step: 2, title: '系统判断登录状态', desc: '检查本地登录态是否有效' },
              { step: 3, title: '已登录→直接进入控制台', desc: '有效登录态，跳转控制台首页' },
              { step: 4, title: '未登录→跳转登录页', desc: '无登录态，跳转到登录页面' },
              { step: 5, title: '完成登录进入系统', desc: '密码/验证码登录后跳转控制台' }
            ]
          },
          {
            name: '账号信息查看',
            steps: [
              { step: 1, title: '点击右上角账号卡片', desc: '展示当前登录企业名称和身份' },
              { step: 2, title: '展开下拉菜单', desc: '显示切换企业、进入控制台、退出等操作' },
              { step: 3, title: '选择操作', desc: '根据需求选择切换企业或进入控制台' }
            ]
          },
          {
            name: '消息通知查看',
            steps: [
              { step: 1, title: '点击消息图标', desc: '右上角消息铃铛图标，红点表示未读' },
              { step: 2, title: '展开消息面板', desc: '展示系统公告、审批通知等消息列表' },
              { step: 3, title: '点击消息查看详情', desc: '点击消息项跳转到对应处理页面' },
              { step: 4, title: '消息状态更新', desc: '已读消息红点消失，未读消息保留' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '.topbar-logo', label: '品牌Logo', position: 'tl',
          description: '民匠有约品牌标识，点击可返回首页。',
          interaction: '点击跳转到首页',
          steps: ['点击 Logo', '页面跳转至首页']
        },
        { id: 2, selector: '.topbar-user', label: '账号卡片', position: 'bl',
          description: '显示当前登录的企业名称和用户身份，点击展开下拉菜单。',
          interaction: '点击展开下拉菜单',
          steps: ['点击账号卡片', '展开下拉菜单', '查看当前登录信息']
        },
        { id: 3, selector: '.topbar-message', label: '消息通知', position: 'bl',
          description: '系统消息与站内信通知入口，有未读消息时显示红点提示。',
          interaction: '点击查看消息列表',
          steps: ['点击消息图标', '展开消息面板', '查看未读消息']
        },
        { id: 4, selector: '.nav-enter-system, [class*="enter-system"], [class*="enter-btn"]', label: '进入系统按钮', position: 'br',
          description: '跳转到管理控制台的入口。',
          interaction: '点击跳转到控制台',
          steps: ['点击"进入系统"', '系统判断登录状态', '跳转控制台或登录页']
        },
        { id: 5, selector: '[class*="banner"], [class*="hero"]', label: '主视觉区', position: 'br',
          description: '首页主视觉 Banner 区，展示核心产品定位，支持轮播。',
          interaction: '轮播自动播放，点击跳转产品页',
          steps: ['浏览主视觉 Banner', '点击 Banner 跳转产品详情']
        },
        { id: 6, selector: '[class*="nav-menu"], [class*="topbar-nav"]', label: '顶部导航', position: 'bl',
          description: '顶部主导航菜单，包含首页、产品、解决方案等栏目。',
          interaction: '鼠标悬停展开子菜单',
          steps: ['悬停导航项', '展开子菜单', '点击跳转']
        },
        { id: 7, selector: '[class*="product-card"], [class*="solution-card"], [class*="feature-card"]', label: '产品卡片', position: 'br',
          description: '展示各产品和解决方案的卡片区域。',
          interaction: '点击卡片跳转产品详情',
          steps: ['浏览产品卡片', '点击卡片跳转详情']
        },
        { id: 8, selector: '[class*="case-card"], [class*="news-card"]', label: '案例/新闻卡片', position: 'br',
          description: '客户案例和新闻动态展示卡片。',
          interaction: '点击查看详情',
          steps: ['浏览卡片', '点击查看详情']
        }
      ]
    },

    business_process: {
      pageInfo: {
        title: '业务流程',
        description: '民匠有约平台全链路业务关系示意图，涵盖企业从注册入驻到多级组织管理的完整业务逻辑，包括：① 企业注册全流程（8步时序图）、② 用户多主体关联机制（一用户多主体）、③ 主子管理员权限层级（权限向下继承）、④ 母子公司组织结构（三大核心权限）。',
        features: [
          '注册全流程 - 企业平台入驻8步时序图，含系统自动校验与人工审核节点',
          '用户多主体关联 - 一个用户账号同时关联多家主体，各主体权限独立隔离',
          '主子管理员关联 - 主管理员唯一Super Admin，子管理员向下授权管理',
          '母公司层级 - 母公司拥有管理/登录/数据查看三大核心权限'
        ],
        featureFlows: [
          {
            name: '企业注册入驻流程',
            steps: [
              { step: 1, title: '提交资料', desc: '填写企业基本信息（名称/信用代码）+ 法人信息（姓名/身份证）' },
              { step: 2, title: '系统初审', desc: '自动校验字段格式、必填项完整性、信用代码有效性' },
              { step: 3, title: '实名校验', desc: '对接工商接口验证企业存在性，法人姓名与身份证实名核验' },
              { step: 4, title: '认证通过', desc: '生成企业电子档案，分配唯一企业ID，状态标记为已认证' },
              { step: 5, title: '设置主管理员', desc: '指定唯一Super Admin账户，拥有企业全部权限，绑定安全手机' },
              { step: 6, title: '子公司认证（可选）', desc: '关联下属子公司，子公司继承母公司认证状态，独立运营账号' },
              { step: 7, title: '分配权限与角色', desc: '配置权限概况体系，创建子管理员角色，分配功能模块权限' },
              { step: 8, title: '平台功能启用', desc: '全部功能模块正式启用，企业进入正常运营状态' }
            ]
          },
          {
            name: '用户多主体关联',
            steps: [
              { step: 1, title: '唯一用户账号', desc: '手机号/邮箱作为唯一身份标识，一个账号登录所有关联主体' },
              { step: 2, title: '关联主体公司', desc: '可同时关联多家主体公司（母公司/子公司/其他主体）' },
              { step: 3, title: '独立权限体系', desc: '在每家主体中拥有独立角色（管理员/财务/运营/成员），权限相互隔离' },
              { step: 4, title: '主体切换', desc: '切换主体时权限自动切换，数据自动隔离，确保信息安全' }
            ]
          },
          {
            name: '主子管理员权限体系',
            steps: [
              { step: 1, title: '母公司主体', desc: '经实名认证的企业主体，承担法律责任，是权限源头' },
              { step: 2, title: '主管理员', desc: '唯一Super Admin账户，拥有企业100%权限，可创建/删除子管理员' },
              { step: 3, title: '子管理员', desc: '由主管理员创建，分管特定业务模块（如财务/人事/运营）' },
              { step: 4, title: '向下授权', desc: '子管理员继承主管理员权限子集，可创建管理范围内的员工账号' },
              { step: 5, title: '员工账号', desc: '由子管理员批量创建普通员工，权限最小化原则，仅分配必要功能' }
            ]
          },
          {
            name: '母子公司层级结构',
            steps: [
              { step: 1, title: '平台总控', desc: '民匠有约集团级多租户平台，统一管理所有母公司及其子公司' },
              { step: 2, title: '母公司核心权限', desc: '⚙️ 管理子公司（运营/人员/财务）+ 🔑 登录子公司（无需单独账号）+ 👁 查看所有数据（自动汇总）' },
              { step: 3, title: '子公司体系', desc: '多家子公司独立运营，拥有独立的组织架构、人员和财务体系' },
              { step: 4, title: '数据同步', desc: '子公司业务数据实时同步至母公司后台，支持集团级数据分析' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '.page-hero', label: '页面标题区', position: 'tl',
          description: '业务流程页面主视觉区，展示页面标题「全链路业务关系示意」和简要说明。',
          interaction: '纯展示',
          steps: ['查看页面标题', '了解页面内容概要']
        },
        { id: 2, selector: '#bp-chart-register', label: '注册全流程时序图', position: 'br',
          description: '企业平台入驻的完整8步流程图解。主流程5步：提交资料→系统初审→实名校验→认证通过→设置主管理员；扩展流程3步：子公司认证（可选）→分配权限概况与角色→平台功能启用。业务规则：① 系统初审自动完成，无需人工干预；② 实名校验对接工商接口，需1-3工作日；③ 主管理员必须绑定安全手机。',
          interaction: '纯展示，横向滚动查看完整图表',
          steps: ['查看主流程5步', '查看扩展3步', '理解整体入驻路径', '了解各节点业务规则']
        },
        { id: 3, selector: '#bp-chart-multi-entity', label: '用户多主体关联关系图', position: 'br',
          description: '展示「一个用户账号 ↔ 多家主体公司」的关联关系。中心是唯一用户账号（手机号/邮箱），向下连接多家主体公司，在不同主体中拥有独立角色（管理员/财务/运营/成员）。核心逻辑：① 用户账号唯一，但可关联N家主体；② 各主体权限完全隔离，互不影响；③ 切换主体时，页面数据和功能权限自动切换。',
          interaction: '纯展示',
          steps: ['理解用户账号唯一性', '理解多主体关联机制', '理解独立权限体系', '理解主体切换逻辑']
        },
        { id: 4, selector: '#bp-chart-admin', label: '主子管理员关联关系图', position: 'br',
          description: '展示企业账号体系的权限层级：母公司主体 → 主管理员（唯一Super Admin）→ 子管理员（分管业务模块）→ 员工账号。权限规则：① 主管理员权限最大，可管理所有子管理员和员工；② 子管理员权限向下继承，可管理其创建的员工；③ 员工权限最小化，仅分配必要功能。',
          interaction: '纯展示',
          steps: ['理解母公司→主管理员层级', '理解主管理员→子管理员权限分配', '理解向下授权机制', '理解员工账号创建流程']
        },
        { id: 5, selector: '#bp-chart-hierarchy', label: '母公司与子公司层级关系图', position: 'br',
          description: '展示母公司对子公司的三大核心权限：① ⚙️ 管理子公司 - 统一管理运营策略、人员配置、财务制度；② 🔑 登录子公司 - 主管理员可直接以子公司身份登录，无需单独创建账号；③ 👁 查看所有数据 - 子公司所有业务数据自动汇总至母公司后台，支持集团级数据分析。',
          interaction: '纯展示',
          steps: ['理解母公司核心权限', '理解管理/登录/数据查看三大能力', '理解子公司数据同步机制']
        }
      ]
    },

    login: {
      pageInfo: {
        title: '用户登录',
        description: '平台登录页面，支持微信扫码登录和账号密码登录两种方式。',
        features: [
          '微信扫码登录 - 快速扫码登录',
          '账号密码登录 - 手机号+密码登录',
          '验证码登录 - 手机号+短信验证码',
          '登录Tab切换 - 多种登录方式切换',
          '注册入口 - 新用户注册入口',
          '忘记密码 - 密码找回入口'
        ],
        featureFlows: [
          {
            name: '微信扫码登录流程',
            steps: [
              { step: 1, title: '选择微信扫码登录', desc: '默认显示扫码登录界面' },
              { step: 2, title: '打开微信扫一扫', desc: '用户使用微信扫描页面二维码' },
              { step: 3, title: '确认登录', desc: '微信中确认登录授权' },
              { step: 4, title: '跳转控制台', desc: '扫码成功后自动跳转到控制台' }
            ]
          },
          {
            name: '账号密码登录流程',
            steps: [
              { step: 1, title: '切换到账号密码', desc: '点击顶部"账号密码"Tab' },
              { step: 2, title: '输入手机号', desc: '输入已注册的手机号' },
              { step: 3, title: '输入密码', desc: '输入登录密码' },
              { step: 4, title: '点击登录', desc: '点击"登录"按钮提交' },
              { step: 5, title: '验证通过跳转', desc: '验证成功跳转到控制台' }
            ]
          },
          {
            name: '验证码登录流程',
            steps: [
              { step: 1, title: '切换到验证码登录', desc: '点击顶部"账号密码"Tab后选择验证码方式' },
              { step: 2, title: '输入手机号', desc: '输入已注册的手机号' },
              { step: 3, title: '获取验证码', desc: '点击"获取验证码"按钮发送短信' },
              { step: 4, title: '输入验证码', desc: '输入收到的6位短信验证码' },
              { step: 5, title: '点击登录', desc: '点击"登录"按钮提交' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '.login-left', label: '品牌展示区', position: 'tr',
          description: '左侧品牌展示区，展示平台品牌理念和核心功能特色。',
          interaction: '纯展示',
          steps: ['查看品牌介绍', '了解平台特色']
        },
        { id: 2, selector: '.left-header', label: '品牌标识', position: 'tl',
          description: '左上角品牌 Logo 和平台名称。',
          interaction: '点击可返回首页',
          steps: ['点击 Logo', '返回首页']
        },
        { id: 3, selector: '.left-features', label: '功能特色区', position: 'tr',
          description: '左侧展示平台核心功能特色卡片组。',
          interaction: '悬停高亮',
          steps: ['浏览功能特色']
        },
        { id: 4, selector: '.login-tabs', label: '登录方式切换', position: 'bl',
          description: '登录方式 Tab 切换，支持微信扫码、账号密码、验证码三种方式。',
          interaction: '点击切换登录方式',
          steps: ['点击 Tab', '切换到对应登录面板']
        },
        { id: 5, selector: '.login-tab.active', label: '当前登录方式', position: 'bl',
          description: '高亮显示当前选中的登录方式。',
          interaction: '视觉标识',
          steps: ['查看当前登录方式']
        },
        { id: 6, selector: '.wx-qr-box', label: '扫码二维码', position: 'br',
          description: '微信扫码登录的二维码展示区域。',
          interaction: '微信扫码登录',
          steps: ['打开微信', '扫描二维码', '确认登录']
        },
        { id: 7, selector: '.wx-qr-refresh a, [class*="refresh"]', label: '刷新二维码', position: 'br',
          description: '二维码过期后点击刷新重新生成。',
          interaction: '点击刷新二维码',
          steps: ['点击刷新', '重新生成二维码']
        },
        { id: 8, selector: '.wx-tips', label: '扫码提示', position: 'br',
          description: '扫码登录的操作提示说明。',
          interaction: '纯展示',
          steps: ['阅读提示', '按提示操作']
        },
        { id: 9, selector: '[class*="form-group"], [class*="input-group"], [class*="field"]', label: '输入框', position: 'bl',
          description: '手机号/密码/验证码输入框。',
          interaction: '点击输入',
          steps: ['点击输入框', '输入对应内容']
        },
        { id: 10, selector: 'button[type="submit"], [class*="btn-login"], .login-btn', label: '登录按钮', position: 'br',
          description: '提交登录表单的按钮。',
          interaction: '点击提交登录',
          steps: ['确认信息', '点击登录', '等待验证', '跳转页面']
        },
        { id: 11, selector: '[class*="register"], [class*="signup"], [class*="to-register"]', label: '注册入口', position: 'br',
          description: '新用户注册入口链接。',
          interaction: '点击跳转到注册页',
          steps: ['点击注册', '跳转注册页面']
        },
        { id: 12, selector: '[class*="forgot"], [class*="reset"], [class*="to-forgot"]', label: '忘记密码', position: 'bl',
          description: '忘记密码找回入口。',
          interaction: '点击找回密码',
          steps: ['点击忘记密码', '跳转找回页面']
        },
        { id: 13, selector: '.back-link', label: '返回首页', position: 'tr',
          description: '右上角返回首页的链接。',
          interaction: '点击返回首页',
          steps: ['点击返回', '跳转首页']
        },
        { id: 14, selector: '[class*="agreement-check"], [class*="agree"], [class*="checkbox"]', label: '协议勾选', position: 'br',
          description: '登录前需勾选同意用户协议和隐私政策。',
          interaction: '点击勾选/取消',
          steps: ['勾选协议', '点击协议链接查看详情']
        },
        { id: 15, selector: '.left-desc', label: '平台介绍', position: 'tr',
          description: '左侧平台介绍文字。',
          interaction: '纯展示',
          steps: ['阅读介绍']
        }
      ]
    },


    account_center: {
      pageInfo: {
        title: '管理控制台',
        description: '企业管理控制台首页，已认证企业可查看子公司、组织架构、用户权限、安全设置等功能入口；未完成认证的企业进入时会弹出认证提醒遮罩。',
        features: [
          '顶栏总控 - 品牌Logo/面包屑/消息/账号卡片/操作工具栏',
          '认证提醒 - 未完成实名认证时弹出全局遮罩弹窗，两个操作按钮可选',
          '切换企业 - 账号卡片下拉可直接切换母公司/子公司身份',
          '子公司管理 - 认证后管理旗下子公司列表（未认证时内容隐藏）',
          '用户权限 - 子账号和角色权限配置（未认证时内容隐藏）',
          '数据总览 - 核心运营指标卡片组（未认证时内容隐藏）'
        ],
        featureFlows: [
          {
            name: '切换企业流程',
            steps: [
              { step: 1, title: '点击账号卡片', desc: '右上角点击当前登录的企业名称' },
              { step: 2, title: '点击"切换企业"', desc: '下拉菜单中点击"切换企业"按钮' },
              { step: 3, title: '弹出企业选择弹窗', desc: '显示母公司列表和各母企业下的子公司' },
              { step: 4, title: '选择目标企业', desc: '点击母公司/子公司的登录按钮' },
              { step: 5, title: '系统切换并刷新', desc: '切换到目标企业身份，页面数据更新' },
              { step: 6, title: '进入目标控制台', desc: '以新身份进入对应企业的控制台' }
            ]
          },
          {
            name: '未认证企业流程',
            steps: [
              { step: 1, title: '进入控制台', desc: '以未认证企业身份登录控制台' },
              { step: 2, title: '系统检测认证状态', desc: '检查 localStorage 中认证状态' },
              { step: 3, title: '弹出认证提示弹窗', desc: '覆盖全屏提示前往认证' },
              { step: 4, title: '页面内容隐藏', desc: '所有功能数据和菜单被隐藏（仅顶栏可见）' },
              { step: 5, title: '点击"立即去认证"', desc: '跳转到企业认证页面完成认证三步' },
              { step: 6, title: '认证完成恢复访问', desc: '返回控制台解锁子公司/数据/权限等全部功能' }
            ]
          },
          {
            name: '查看数据总览',
            steps: [
              { step: 1, title: '登录控制台首页', desc: '默认进入控制台数据总览页（未认证时隐藏）' },
              { step: 2, title: '浏览统计卡片', desc: '查看子公司数、用户数、资金余额等指标（未认证时隐藏）' },
              { step: 3, title: '点击卡片跳转', desc: '点击数据卡片跳转到对应功能详情页（未认证时隐藏）' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '.topbar-brand, .topbar-logo, #topbarLogo', label: '控制台品牌', position: 'tr',
          description: '左上角控制台品牌Logo与"控制台"文字，用于识别当前处于哪个平台。',
          interaction: '点击返回控制台首页',
          steps: ['识别品牌与平台', '点击可跳转至控制台首页']
        },
        { id: 2, selector: '.breadcrumb, .nav-breadcrumb, [class*="topbar-nav"]', label: '面包屑导航', position: 'bl',
          description: '顶栏中部的面包屑路径（首页 / 控制台 / 产品中心），用于定位当前页面在站点中的位置。',
          interaction: '点击某一级可快速跳转',
          steps: ['查看当前页面位置', '点击对应面包屑项快速返回上级页面']
        },
        { id: 3, selector: '.topbar-message, #topbarMessage', label: '消息通知', position: 'bl',
          description: '右上角消息铃铛通知入口，红点表示有未读系统消息/审批通知。未认证状态下仍可见。',
          interaction: '点击展开消息面板',
          steps: ['点击消息铃铛图标', '展开消息面板', '查看未读消息列表']
        },
        { id: 4, selector: '.topbar-user, #topbarUser', label: '账号卡片', position: 'bl',
          description: '右上角显示当前登录的企业名称及身份标签的卡片，点击展开下拉菜单（包含切换企业、认证新企业、进入控制台、账号安全、退出登录）。未认证状态下仍可见。',
          interaction: '点击展开下拉菜单',
          steps: ['点击账号卡片', '查看登录信息和角色徽章', '选择操作（切换企业/进入控制台/登出等）']
        },
        { id: 5, selector: '.topbar-avatar, #topbarAvatar', label: '用户头像', position: 'tr',
          description: '账号卡片左侧的首字母头像方块，默认显示当前登录企业名称的第一个汉字或字母。',
          interaction: '视觉标识',
          steps: ['识别当前账号头像']
        },
        { id: 6, selector: '.topbar-ent-chip, #topbarEntChip, .header-ent-type-badge', label: '企业类型徽章', position: 'tr',
          description: '账号卡片右侧的"母公司"/"子公司"类型彩色徽章，用于快速识别当前登录身份是主账号还是子账号。',
          interaction: '纯展示',
          steps: ['查看徽章颜色和文字判断企业身份']
        },
        { id: 7, selector: '#topbarUserName, .topbar-user-name', label: '企业名称显示', position: 'br',
          description: '账号卡片中显示当前登录的企业名称（通常会对手机号等敏感信息进行脱敏处理，例如 138****8000）。',
          interaction: '纯展示',
          steps: ['确认当前登录的企业/账号名称']
        },
        { id: 8, selector: '#switchEnterpriseBtn, .user-dropdown-switch-ent-badge', label: '切换企业徽章按钮', position: 'br',
          description: '账号卡片顶部的"切换企业"徽章按钮，点击后打开"选择企业登录"弹窗，可在母公司/子公司之间快速切换身份。',
          interaction: '点击打开企业选择弹窗',
          steps: ['点击"切换企业"', '弹出母公司列表弹窗', '选择目标母公司或子公司登录', '页面刷新切换身份']
        },
        { id: 9, selector: '.ann-toolbar, #annToolbar, [class*="ann-toolbar"]', label: '标注版工具栏', position: 'tl',
          description: '右上角标注版专用工具栏，包含"标注版/管理控制台"切换标签、显示标注/隐藏标注、隐藏流程图、隐藏说明、导出标注JSON等按钮。',
          interaction: '点击按钮控制标注显示',
          steps: ['点击"显示标注"可切换角标/框是否显示', '点击"隐藏流程图"可收起左侧功能流程', '点击"隐藏说明"可收起左侧页面说明', '点击"导出"可导出标注数据']
        }
      ]
    },

    verify: {
      pageInfo: {
        title: '企业认证',
        description: '企业实名认证页面，企业需完成实名认证后方可使用系统全部功能。',
        features: [
          '步骤指示器 - 三步认证流程指引',
          '企业信息填写 - 填写企业基本信息',
          '资质文件上传 - 上传营业执照等',
          '法人信息填写 - 填写法人身份信息',
          '提交审核 - 提交认证申请',
          '切换登录 - 支持母公司/子公司切换登录'
        ],
        featureFlows: [
          {
            name: '企业认证流程',
            steps: [
              { step: 1, title: '进入认证页面', desc: '未认证企业首次进入自动跳转认证页' },
              { step: 2, title: '填写企业基本信息', desc: '企业名称、信用代码、法人姓名、联系电话' },
              { step: 3, title: '上传资质文件', desc: '上传营业执照和法人身份证扫描件' },
              { step: 4, title: '信息校验', desc: '系统校验必填项和文件格式' },
              { step: 5, title: '提交审核', desc: '提交认证信息进入审核队列' },
              { step: 6, title: '等待审核结果', desc: '1-3 个工作日完成审核' },
              { step: 7, title: '认证完成', desc: '审核通过后解锁全部系统功能' }
            ]
          },
          {
            name: '切换企业登录',
            steps: [
              { step: 1, title: '点击账号卡片', desc: '右上角点击当前企业名称' },
              { step: 2, title: '点击"切换企业"', desc: '下拉菜单中点击切换企业' },
              { step: 3, title: '弹出企业选择弹窗', desc: '显示所有母公司及其子公司列表' },
              { step: 4, title: '选择目标企业', desc: '点击母公司/子公司的登录按钮' },
              { step: 5, title: '进入认证页面', desc: '以新身份进入认证流程' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '[class*="step-indicator"], [class*="steps"]', label: '步骤指示器', position: 'br',
          description: '认证流程步骤指示：填写信息 → 上传资质 → 完成认证。',
          interaction: '展示当前进度',
          steps: ['查看当前步骤', '了解认证进度']
        },
        { id: 2, selector: '.verify-form, [class*="cert-form"], form', label: '认证表单', position: 'br',
          description: '企业实名认证表单，包含必填字段。',
          interaction: '填写表单字段',
          steps: ['输入企业名称', '输入信用代码', '输入法人信息']
        },
        { id: 3, selector: '[class*="upload"], [class*="biz-license"]', label: '资质上传', position: 'bl',
          description: '上传营业执照和法人身份证扫描件。',
          interaction: '点击或拖拽上传',
          steps: ['点击上传区域', '选择文件', '等待上传', '预览确认']
        },
        { id: 4, selector: '[class*="submit"], [class*="btn-submit"], button[type="submit"]', label: '提交认证', position: 'br',
          description: '提交认证申请按钮。',
          interaction: '点击提交认证',
          steps: ['确认信息无误', '点击提交', '等待审核']
        },
        { id: 5, selector: '.topbar-user', label: '账号卡片', position: 'bl',
          description: '显示当前登录的企业信息。',
          interaction: '点击展开下拉菜单',
          steps: ['点击账号卡片', '查看登录信息']
        },
        { id: 6, selector: '[class*="switch-enterprise"]', label: '切换企业登录', position: 'br',
          description: '支持在认证页面切换母公司或子公司。',
          interaction: '点击弹出企业选择弹窗',
          steps: ['点击切换企业', '选择目标企业', '确认切换']
        },
        { id: 7, selector: '[class*="form-group"], [class*="input-group"], [class*="cert-input"]', label: '信息输入框', position: 'bl',
          description: '企业信息输入框，包含企业名称、信用代码、法人姓名等。',
          interaction: '点击输入',
          steps: ['点击输入框', '输入对应信息']
        },
        { id: 8, selector: '[class*="required-tip"], [class*="form-tip"], [class*="hint"]', label: '填写提示', position: 'br',
          description: '表单填写提示和校验信息。',
          interaction: '阅读提示',
          steps: ['查看提示', '按要求填写']
        },
        { id: 9, selector: '[class*="status-info"], [class*="current-status"]', label: '当前状态', position: 'bl',
          description: '显示当前认证状态（未认证/审核中/已认证）。',
          interaction: '纯展示',
          steps: ['查看当前状态']
        }
      ]
    },

    account_security: {
      pageInfo: {
        title: '安全中心',
        description: '账户安全设置页面，管理密码、手机、邮箱、实名认证等安全选项。',
        features: [
          '登录密码 - 设置和修改登录密码',
          '支付密码 - 设置交易/支付密码',
          '安全手机 - 绑定/更换安全手机',
          '安全邮箱 - 绑定/更换安全邮箱',
          '实名认证 - 企业实名认证状态',
          '登录日志 - 查看账户登录记录'
        ],
        featureFlows: [
          {
            name: '修改登录密码',
            steps: [
              { step: 1, title: '点击"修改"按钮', desc: '登录密码行右侧点击"修改"' },
              { step: 2, title: '弹出修改弹窗', desc: '显示原密码、新密码、确认密码输入框' },
              { step: 3, title: '输入原密码', desc: '验证当前身份' },
              { step: 4, title: '设置新密码', desc: '输入符合强度要求的新密码' },
              { step: 5, title: '确认提交', desc: '再次输入新密码并提交' },
              { step: 6, title: '密码更新成功', desc: '提示密码修改成功，下次登录生效' }
            ]
          },
          {
            name: '绑定安全手机',
            steps: [
              { step: 1, title: '点击"绑定"按钮', desc: '安全手机行点击绑定' },
              { step: 2, title: '输入手机号', desc: '输入要绑定的手机号' },
              { step: 3, title: '获取验证码', desc: '点击获取短信验证码' },
              { step: 4, title: '输入验证码', desc: '输入收到的6位验证码' },
              { step: 5, title: '验证通过', desc: '系统验证通过后绑定成功' }
            ]
          },
          {
            name: '安全等级提升',
            steps: [
              { step: 1, title: '查看当前安全等级', desc: '页面顶部显示安全评分' },
              { step: 2, title: '完善安全项', desc: '根据提示设置未完成的安全项' },
              { step: 3, title: '完成所有设置', desc: '密码、手机、邮箱均已设置' },
              { step: 4, title: '等级自动提升', desc: '系统自动重新评估安全等级' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '[class*="security-level"], [class*="level-card"]', label: '安全等级', position: 'br',
          description: '当前账户安全等级评分。',
          interaction: '查看安全建议',
          steps: ['查看安全等级', '根据提示完善设置']
        },
        { id: 2, selector: '.security-item', label: '安全设置项', position: 'br',
          description: '单个安全设置项卡片，显示状态和操作按钮。',
          interaction: '点击按钮修改',
          steps: ['查看状态', '点击操作按钮', '完成修改']
        },
        { id: 3, selector: '.security-item-icon', label: '功能图标', position: 'bl',
          description: '每个安全项的功能标识图标。',
          interaction: '纯展示',
          steps: ['查看图标识别功能']
        },
        { id: 4, selector: '.security-status', label: '状态指示器', position: 'bl',
          description: '显示已设置/未设置/未认证状态。',
          interaction: '纯展示',
          steps: ['查看状态颜色', '确认设置情况']
        },
        { id: 5, selector: '.btn, [class*="action-btn"], [class*="security-action"]', label: '操作按钮', position: 'br',
          description: '对应安全项的操作按钮。',
          interaction: '点击执行操作',
          steps: ['点击按钮', '弹出修改弹窗', '提交验证']
        },
        { id: 6, selector: '.security-item-right', label: '操作区', position: 'br',
          description: '安全设置项右侧区域，状态与按钮垂直居中。',
          interaction: '点击按钮执行操作',
          steps: ['查看状态', '点击按钮']
        },
        { id: 7, selector: '.topbar-user', label: '账号卡片', position: 'bl',
          description: '右上角账号信息卡片。',
          interaction: '点击展开下拉菜单',
          steps: ['点击账号卡片', '查看登录信息']
        },
        { id: 8, selector: '.topbar-message', label: '消息通知', position: 'bl',
          description: '系统消息通知入口。',
          interaction: '点击查看消息',
          steps: ['点击消息图标', '查看通知']
        }
      ]
    },

    account_project: {
      pageInfo: {
        title: '子公司管理',
        description: '子公司管理页面，展示当前母公司名下的所有子公司列表，支持新增、编辑、删除操作。',
        features: [
          '子公司列表 - 展示所有子公司信息',
          '新增子公司 - 创建新的子公司',
          '子公司详情 - 查看子公司详细信息',
          '编辑子公司 - 修改子公司信息',
          '子公司状态 - 启用/禁用子公司',
          '数据统计 - 子公司数量、管理员等统计'
        ],
        featureFlows: [
          {
            name: '新增子公司',
            steps: [
              { step: 1, title: '点击"新增子公司"', desc: '页面右上角点击新增按钮' },
              { step: 2, title: '弹出新增表单', desc: '显示子公司信息填写表单' },
              { step: 3, title: '填写子公司信息', desc: '名称、编号、负责人、联系方式等' },
              { step: 4, title: '提交创建', desc: '提交表单创建子公司' },
              { step: 5, title: '列表刷新', desc: '新子公司出现在列表中' },
              { step: 6, title: '企业列表同步', desc: '切换企业弹窗中也能看到新子公司' }
            ]
          },
          {
            name: '编辑子公司',
            steps: [
              { step: 1, title: '点击行操作"编辑"', desc: '子公司行的编辑按钮' },
              { step: 2, title: '打开编辑弹窗', desc: '预填充当前子公司信息' },
              { step: 3, title: '修改信息', desc: '修改名称、负责人等字段' },
              { step: 4, title: '保存修改', desc: '提交更新到后台' },
              { step: 5, title: '列表刷新', desc: '显示最新信息' }
            ]
          },
          {
            name: '子公司状态管理',
            steps: [
              { step: 1, title: '查看子公司状态', desc: '列表中显示启用/禁用状态标签' },
              { step: 2, title: '点击"禁用"', desc: '禁用后该子公司无法登录' },
              { step: 3, title: '确认操作', desc: '弹窗二次确认' },
              { step: 4, title: '状态更新', desc: '状态标签变为"已禁用"' },
              { step: 5, title: '点击"启用"', desc: '恢复子公司登录权限' }
            ]
          }
        ]
      },
      annotations: [
        { id: 1, selector: '[class*="project-header"], [class*="page-header"], [class*="list-header"]', label: '页面头部', position: 'br',
          description: '页面标题和"新增子公司"按钮。',
          interaction: '点击新增按钮',
          steps: ['点击"新增子公司"', '弹出表单', '填写提交']
        },
        { id: 2, selector: '[class*="stat-item"], [class*="stat"], [class*="count"]', label: '统计数据', position: 'bl',
          description: '页面顶部统计卡片。',
          interaction: '纯展示',
          steps: ['查看统计数据']
        },
        { id: 3, selector: '[class*="sub-card"], [class*="project-card"], [class*="entity-card"]', label: '子公司卡片', position: 'br',
          description: '单个子公司信息卡片。',
          interaction: '点击查看详情',
          steps: ['点击卡片', '跳转详情页']
        },
        { id: 4, selector: '[class*="sub-list"], [class*="project-list"], table', label: '子公司列表', position: 'br',
          description: '子公司列表表格展示。',
          interaction: '点击行操作',
          steps: ['浏览列表', '使用搜索筛选', '点击行操作']
        },
        { id: 5, selector: '[class*="add-btn"], [class*="create-btn"], [class*="btn-add"]', label: '新增子公司按钮', position: 'br',
          description: '创建新子公司入口。',
          interaction: '点击弹出新增表单',
          steps: ['点击按钮', '填写信息', '提交创建']
        },
        { id: 6, selector: '[class*="action-bar"], [class*="row-action"]', label: '行操作栏', position: 'bl',
          description: '每行子公司的操作按钮组。',
          interaction: '点击操作按钮',
          steps: ['编辑/禁用/删除']
        },
        { id: 7, selector: '.topbar-user', label: '账号卡片', position: 'bl',
          description: '右上角账号信息卡片。',
          interaction: '点击展开菜单',
          steps: ['点击账号卡片', '查看信息']
        },
        { id: 8, selector: '.sidebar', label: '侧边导航', position: 'br',
          description: '控制台侧边导航。',
          interaction: '点击切换页面',
          steps: ['点击菜单项', '切换页面']
        }
      ]
    }
  };

  var commonPages = [
    'account_realname', 'account_user', 'account_role', 'account_role_edit',
    'account_permission', 'account_bank', 'account_billing', 'account_wallet',
    'account_message', 'account_fund',
    'anxinyun', 'minjiang', 'agent',
    'about', 'news', 'contact', 'career', 'privacy', 'agreement',
    'service_center', 'developer_center', 'contract_sign',
    'anxinyun_features', 'anxinyun_help', 'anxinyun_scenarios', 'anxinyun_tax',
    'minjiang_cases', 'minjiang_emergency', 'minjiang_features', 'minjiang_help',
    'minjiang_solutions', 'agent_select', 'message_detail'
  ];

  commonPages.forEach(function(name) {
    if (!data[name]) {
      data[name] = {
        pageInfo: {
          title: getFriendlyName(name),
          description: getPageDescription(name),
          features: getFeaturesForPage(name),
          featureFlows: getFeatureFlowsForPage(name)
        },
        annotations: getAnnotationsForPage(name)
      };
    }
  });

  function getFriendlyName(name) {
    var map = {
      account_realname: '企业实名', account_user: '用户管理',
      account_role: '角色管理', account_role_edit: '权限配置',
      account_permission: '权限概况', account_bank: '银行账户',
      account_billing: '合同管理', account_wallet: '我的钱包',
      account_message: '消息中心', account_fund: '资金划拨',
      anxinyun: '安心云', minjiang: '民匠有约',
      agent: '代理商', about: '关于我们', news: '新闻动态',
      contact: '联系我们', career: '加入我们',
      privacy: '隐私政策', agreement: '服务协议',
      service_center: '服务中心', developer_center: '开发者中心',
      contract_sign: '合同签署',
      business_process: '业务流程'
    };
    return map[name] || name;
  }

  function getPageDescription(name) {
    var map = {
      account_realname: '企业实名信息管理页面，展示和修改企业的实名认证信息。',
      account_user: '子账号管理页面，创建、编辑、禁用子账号。',
      account_role: '角色管理页面，创建和管理不同角色及其权限。',
      account_role_edit: '权限配置页面，为角色分配具体的功能权限。',
      account_permission: '权限概况页面，查看系统所有功能权限概况和权限树概况。',
      account_bank: '银行账户管理页面，绑定和管理银行账户。',
      account_billing: '合同管理页面，查看和管理已签署的合同。',
      account_wallet: '我的钱包页面，查看余额和交易流水。',
      account_message: '消息中心页面，查看系统通知和消息。',
      account_fund: '资金划拨页面，查看资金交易记录。'
    };
    return map[name] || getFriendlyName(name) + '页面';
  }

  function getFeaturesForPage(name) {
    var feats = {
      account_realname: ['企业信息展示', '法人信息', '认证状态', '资质文件', '编辑修改'],
      account_user: ['用户列表', '新增用户', '角色分配', '状态管理', '批量操作'],
      account_role: ['角色列表', '新增角色', '权限配置', '角色编辑', '角色删除'],
      account_role_edit: ['权限树', '功能分组', '权限勾选', '保存配置', '角色继承'],
      account_permission: ['权限概况', '权限分类', '权限编码', '功能描述'],
      account_bank: ['银行卡列表', '添加银行卡', '开户行信息', '默认账户', '删除操作'],
      account_billing: ['合同列表', '合同详情', '签署状态', '到期提醒', '下载合同'],
      account_wallet: ['余额展示', '交易流水', '充值提现', '资金划拨', '消费统计'],
      account_message: ['消息列表', '未读标记', '消息分类', '消息详情', '批量操作'],
      account_fund: ['资金流水', '转账记录', '收款记录', '资金统计', '导出报表']
    };
    return feats[name] || ['数据展示', '操作入口', '状态标识', '筛选搜索', '数据操作'];
  }

  function getFeatureFlowsForPage(name) {
    var flows = {
      account_realname: [
        { name: '查看实名信息流程', steps: [
          { step: 1, title: '进入页面', desc: '通过侧边栏进入企业实名页面' },
          { step: 2, title: '查看当前信息', desc: '展示企业实名信息卡片' },
          { step: 3, title: '点击编辑', desc: '修改企业信息' },
          { step: 4, title: '保存修改', desc: '提交更新后的信息' }
        ]}
      ],
      account_user: [
        { name: '新增用户流程', steps: [
          { step: 1, title: '点击"新增用户"', desc: '页面右上角点击新增' },
          { step: 2, title: '填写用户信息', desc: '姓名、手机、角色等' },
          { step: 3, title: '提交创建', desc: '创建子账号' },
          { step: 4, title: '设置权限', desc: '分配角色和权限' }
        ]},
        { name: '用户管理操作', steps: [
          { step: 1, title: '浏览用户列表', desc: '查看所有子账号' },
          { step: 2, title: '点击行操作', desc: '编辑/禁用/删除用户' },
          { step: 3, title: '确认操作', desc: '弹窗二次确认' },
          { step: 4, title: '列表更新', desc: '操作后列表自动刷新' }
        ]}
      ],
      account_role: [
        { name: '创建角色流程', steps: [
          { step: 1, title: '点击"新增角色"', desc: '创建新角色' },
          { step: 2, title: '填写角色信息', desc: '角色名称、描述' },
          { step: 3, title: '配置权限', desc: '进入权限配置页' },
          { step: 4, title: '分配权限', desc: '勾选功能权限概况' },
          { step: 5, title: '保存角色', desc: '保存角色及权限' }
        ]}
      ],
      account_bank: [
        { name: '添加银行卡流程', steps: [
          { step: 1, title: '点击"添加银行卡"', desc: '新增银行账户' },
          { step: 2, title: '填写账户信息', desc: '开户行、卡号、持有人' },
          { step: 3, title: '验证信息', desc: '小额打款验证' },
          { step: 4, title: '绑定成功', desc: '银行卡绑定成功' }
        ]}
      ],
      account_wallet: [
        { name: '充值提现流程', steps: [
          { step: 1, title: '选择操作', desc: '点击充值或提现' },
          { step: 2, title: '填写金额', desc: '输入金额数' },
          { step: 3, title: '选择银行卡', desc: '选择绑定的银行卡' },
          { step: 4, title: '确认提交', desc: '提交充值/提现申请' }
        ]}
      ],
      account_message: [
        { name: '消息查看流程', steps: [
          { step: 1, title: '进入消息中心', desc: '点击侧边栏消息中心' },
          { step: 2, title: '浏览消息列表', desc: '查看系统通知和审批消息' },
          { step: 3, title: '点击消息详情', desc: '查看消息详情' },
          { step: 4, title: '消息状态更新', desc: '标记为已读' }
        ]}
      ],
      account_fund: [
        { name: '资金查询流程', steps: [
          { step: 1, title: '选择时间范围', desc: '筛选时间和类型' },
          { step: 2, title: '查看流水', desc: '浏览资金流水列表' },
          { step: 3, title: '点击详情', desc: '查看单笔交易详情' },
          { step: 4, title: '导出报表', desc: '导出资金报表' }
        ]}
      ]
    };

    if (flows[name]) return flows[name];

    var defaultFlows = [
      {
        name: '功能使用流程',
        steps: [
          { step: 1, title: '进入页面', desc: '通过菜单或链接跳转到当前功能页面' },
          { step: 2, title: '查看数据', desc: '浏览页面展示的各类信息和数据' },
          { step: 3, title: '执行操作', desc: '根据需要点击相应按钮执行操作' },
          { step: 4, title: '保存结果', desc: '操作结果实时更新到页面和后台' }
        ]
      }
    ];

    if (name.indexOf('account') === 0 && name !== 'account_permission') {
      defaultFlows.push({
        name: '切换企业流程',
        steps: [
          { step: 1, title: '点击账号卡片', desc: '右上角企业名称卡片' },
          { step: 2, title: '点击"切换企业"', desc: '下拉菜单中点击切换企业' },
          { step: 3, title: '选择目标企业', desc: '弹窗中选择母公司或子公司' },
          { step: 4, title: '确认切换', desc: '系统刷新并以新身份进入' }
        ]
      });
    }

    return defaultFlows;
  }

  function getAnnotationsForPage(name) {
    var anns = [
      { id: 1, selector: '.topbar-user, [class*="user-card"], [class*="account-card"]', label: '账号卡片', position: 'bl',
        description: '右上角账号卡片，显示当前登录用户信息。',
        interaction: '点击展开下拉菜单',
        steps: ['点击账号卡片', '展开下拉菜单', '切换企业或登出']
      },
      { id: 2, selector: '.page-title, [class*="page-header"], [class*="page-name"]', label: '页面标题', position: 'bl',
        description: '当前页面的功能名称。',
        interaction: '纯展示',
        steps: ['查看标题了解页面功能']
      }
    ];

    if (name.indexOf('account') === 0 && name !== 'account_permission' && name !== 'account_security') {
      anns.push({
        id: 3, selector: '.sidebar, [class*="side-nav"]', label: '侧边导航', position: 'br',
        description: '控制台侧边功能导航菜单。',
        interaction: '点击切换页面',
        steps: ['点击菜单项', '切换功能页面']
      });
      anns.push({
        id: 4, selector: '.card, [class*="content-card"], [class*="data-card"]', label: '功能卡片', position: 'br',
        description: '页面内的功能卡片或数据卡片。',
        interaction: '点击卡片或卡片内按钮',
        steps: ['浏览卡片', '点击执行操作']
      });
      anns.push({
        id: 5, selector: '.topbar-message', label: '消息通知', position: 'bl',
        description: '系统消息通知入口。',
        interaction: '点击查看消息',
        steps: ['点击消息图标', '查看通知']
      });
    }

    if (name === 'account_billing' || name === 'account_wallet' || name === 'account_fund') {
      anns.push({ id: 6, selector: 'table, [class*="list"]', label: '数据列表', position: 'br',
        description: '表格化数据列表展示。',
        interaction: '点击行操作',
        steps: ['浏览列表', '使用搜索筛选', '点击操作按钮']
      });
      anns.push({ id: 7, selector: '[class*="filter"], [class*="search"], [class*="tab"]', label: '筛选/搜索', position: 'bl',
        description: '筛选条件和搜索功能。',
        interaction: '点击设置筛选条件',
        steps: ['选择筛选条件', '输入关键词', '查看结果']
      });
    }

    return anns;
  }

  window.__annData = data;
  window.__annGetFriendlyName = getFriendlyName;

})();
