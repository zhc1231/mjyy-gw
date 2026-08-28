# 民匠有约官网 PRD（产品需求文档）

| 版本 | 日期 | 作者 | 说明 |
|------|------|------|------|
| v1.0 | 2026-08-28 | 产品团队 | 初版发布，覆盖官网全部页面与功能模块 |

---

## 一、文档概述

### 1.1 文档目的

本文档为「民匠有约」官方网站的完整产品需求文档（PRD），用于指导官网的设计、研发、测试与运营工作，确保各团队对产品目标、功能范围、交互体验有统一理解。

### 1.2 产品定位

**民匠有约**是浙江良巧匠网络科技旗下的企业数字化服务生态平台，提供「灵活用工撮合 + 企业内部管理 + 代理合作」三大核心业务，帮助企业解决用工难、管理难、结算难问题。

### 1.3 产品矩阵

| 产品线 | 产品名称 | 核心价值 | 目标用户 |
|--------|----------|----------|----------|
| 灵活用工 | 民匠有约 | AI 智能撮合 + 全流程数字化用工 | 中小企业 HR / 行政 |
| 企业管理 | 民匠安心云 | 审批、考勤、协作一体化 | 中小企业管理者 |
| 代理合作 | 城市代理合伙人 | 区域独家代理 + 总部全程赋能 | 本地渠道合作伙伴 |

### 1.4 关键指标

| 指标 | 数值 | 说明 |
|------|------|------|
| 服务企业 | 500+ | 累计服务企业客户数量 |
| 注册服务者 | 5 万+ | 平台注册灵活用工人员 |
| 智能匹配率 | 95% | AI 撮合准确率 |
| 平均效率提升 | 30% | 客户使用后的效率提升幅度 |
| 系统稳定性 | 99.9% | 平台可用率 |

---

## 二、整体架构

### 2.1 信息架构

```
民匠有约官网
├── 首页（index.html）
│   ├── Hero 首屏：品牌主张 + 核心数据 + CTA
│   ├── 产品选择：三大产品线卡片
│   ├── 核心优势：合规安全 / 智能撮合 / 专业服务 / 灵活结算
│   ├── 数据展示：合作企业数 / 服务用户数 / 覆盖城市 / 效率提升
│   ├── 行业解决方案：物流仓储 / 餐饮连锁 / 零售商超 / 智能制造
│   ├── 合作伙伴：绿城 / 海底捞 / 永辉 / 富士康 / 顺丰 / 华为
│   └── CTA + Footer
│
├── 产品详情页
│   ├── 民匠有约（minjiang.html）
│   ├── 民匠安心云（anxinyun.html）
│   └── 城市代理合伙人（agent.html）
│
├── 产品子页面
│   ├── 民匠有约功能（minjiang-features.html）
│   ├── 民匠有约方案（minjiang-solutions.html）
│   ├── 民匠有约案例（minjiang-cases.html）
│   ├── 民匠有约应急（minjiang-emergency.html）
│   ├── 民匠有约帮助（minjiang-help.html）
│   ├── 安心云功能（anxinyun-features.html）
│   ├── 安心云场景（anxinyun-scenarios.html）
│   ├── 安心云帮助（anxinyun-help.html）
│   ├── 安心云税务（anxinyun-tax.html）
│   └── 代理商选择（agent-select.html）
│
├── 控制台系统
│   ├── 登录（login.html）
│   ├── 认证验证（verify.html）
│   ├── 产品中心（account-center.html）
│   ├── 资金账户（account-wallet.html）
│   ├── 银行账户（account-bank.html）
│   ├── 合同管理（account-billing.html）
│   ├── 母子公司（account-fund.html）
│   ├── 消息中心（account-message.html）
│   ├── 权限概况（account-permission.html）
│   ├── 子公司管理（account-project.html）
│   ├── 企业实名（account-realname.html）
│   ├── 角色管理（account-role.html）
│   ├── 角色编辑（account-role-edit.html）
│   ├── 安全中心（account-security.html）
│   └── 用户管理（account-user.html）
│
├── 业务流程页（business-process.html）
│   ├── 注册全流程时序图
│   ├── 用户多主体关联图
│   ├── 主子管理员权限层级图
│   └── 母子公司组织结构图
│
└── 其他页面
    ├── 关于我们（about.html）
    ├── 加入我们（career.html）
    ├── 联系我们（contact.html）
    ├── 新闻动态（news.html）
    ├── 隐私政策（privacy.html）
    ├── 服务中心（service-center.html）
    ├── 合同签署（contract-sign.html）
    ├── 开发者中心（developer-center.html）
    └── 消息详情（message-detail.html）
```

### 2.2 导航结构

| 导航层级 | 位置 | 内容 |
|----------|------|------|
| 主导航 | 顶部固定栏 | Logo / 产品 / 方案 / 案例 / 关于 / 联系 |
| 产品导航 | 产品详情页顶部 | 功能 / 方案 / 案例 / 帮助 / 立即体验 |
| 侧边导航 | 控制台页面左侧 | 产品中心 / 资金账户 / 银行 / 合同 / 用户 / 角色 / 安全 等 |
| 悬浮导航 | 右下角 | 客服 / 民匠有约 / 安心云 / 代理商 / 首页 |
| 页脚导航 | 页面底部 | 产品服务 / 支持 / 关于 / 版权信息 |

---

## 三、页面详细需求

### 3.1 首页（index.html）

#### 3.1.1 页面目标

- 向首次访问的用户传递品牌定位与核心价值
- 引导用户快速了解三大产品线并进入对应产品详情页
- 展示公司实力与可信度（数据、合作伙伴、资质）
- 提供多入口转化路径（联系商务 / 立即体验）

#### 3.1.2 页面结构

| 区块 | 内容 | 交互要求 |
|------|------|----------|
| **Hero 首屏** | 标题「民匠有约 · 灵活用工智能撮合平台」+ 副标题 + 核心数据（500+/5万+/95%/99.9%）+ 双 CTA 按钮 | 自动轮播背景渐变，CTA 跳转对应页面 |
| **产品选择** | 三张产品卡片（民匠有约突出显示），每张含图标、描述、功能列表、CTA | 鼠标悬停卡片上浮 8px，点击跳转产品页 |
| **核心优势** | 四个优势卡片（合规安全 / 智能撮合 / 专业服务 / 灵活结算） | 纯展示，hover 图标发光 |
| **数据展示** | 大数字展示：500+合作企业 / 10万+服务用户 / 50+覆盖城市 / 30%效率提升 | 数字滚动动画进入视口时触发 |
| **行业方案** | 四个行业解决方案卡片（物流仓储 / 餐饮连锁 / 零售商超 / 智能制造） | 点击跳转方案详情 |
| **合作伙伴** | 6 家合作伙伴 Logo 墙（绿城 / 海底捞 / 永辉 / 富士康 / 顺丰 / 华为） | 纯展示，Logo 灰度→彩色 hover 效果 |
| **CTA 区块** | 「开启企业数字化升级之旅」+ 三个产品跳转按钮 | 全宽背景渐变，按钮白色描边 |
| **页脚** | Logo + 产品链接 + 支持链接 + 版权 | 纯展示 |

#### 3.1.3 Hero 区规格

| 元素 | 规格 |
|------|------|
| 标题字号 | 48px，粗体，两行换行 |
| 主色调 | #1677FF → #4096FF 渐变 |
| 数据卡片 | 96px 字号 + 14px 标签 |
| CTA 按钮 | 「了解产品」白色实心，「联系商务」白色描边 |

#### 3.1.4 产品卡片规格

| 属性 | 民匠有约（主推） | 安心云 | 代理商 |
|------|------------------|--------|--------|
| 图标 | 64×64 圆角 16px | 64×64 圆角 16px | 64×64 渐变色块 |
| 主题色 | #1677FF 蓝色 | #0F52BA 深蓝 | #FA8C16 橙色 |
| 边框 | 2px 主色描边 | 1px 灰色描边 | 1px 灰色描边 |
| 阴影 | 0 8px 24px 主色阴影 | 无 | 无 |
| 功能列表 | 4 项带 ✓ 图标 | 4 项带 ✓ 图标 | 4 项带 ✓ 图标 |

---

### 3.2 民匠有约产品页（minjiang.html）

#### 3.2.1 页面目标

- 详细介绍「民匠有约」灵活用工平台的功能、场景、案例
- 引导用户注册体验或联系商务

#### 3.2.2 页面结构

| 区块 | 内容 |
|------|------|
| **Hero 首屏** | 产品标题 + 核心价值主张 + 3 组数据指标 + CTA |
| **全流程数字化** | 招聘→撮合→签约→结算→结算的全流程图解 |
| **核心功能** | 8 个功能模块卡片（智能撮合/电子合同/商业保险/即时结算等） |
| **用户评价** | 客户头像 + 评价内容 + 客户职位 |
| **行业场景** | 4 个垂直行业解决方案 |
| **客户案例** | 3 个精选案例（物流/餐饮/零售） |
| **FAQ** | 6 个常见问题折叠面板 |
| **资质展示** | 合规证书、合作牌照展示 |
| **CTA** | 「开启灵活用工新体验」 |

---

### 3.3 民匠安心云产品页（anxinyun.html）

#### 3.3.1 页面目标

- 介绍「民匠安心云」企业内部管理工具
- 引导中小企业使用一体化管理工具

#### 3.3.2 子页面清单

| 页面 | 路径 | 内容 |
|------|------|------|
| 安心云功能 | anxinyun-features.html | 详细功能模块介绍 |
| 安心云场景 | anxinyun-scenarios.html | 适用场景与行业案例 |
| 安心云帮助 | anxinyun-help.html | 使用帮助与 FAQ |
| 安心云税务 | anxinyun-tax.html | 税务服务模块介绍 |

---

### 3.4 城市代理合伙人页（agent.html）

#### 3.4.1 页面目标

- 吸引潜在代理商加入合作
- 展示代理合作模式与支持体系

#### 3.4.2 页面结构

| 区块 | 内容 |
|------|------|
| Hero 首屏 | 「携手良巧匠，共享万亿市场」 |
| 合作优势 | 6 大合作支持 |
| 收益模型 | 三级返佣阶梯表 |
| 加入流程 | 4 步入驻流程 |
| 代理案例 | 成功代理商案例 |
| CTA | 申请成为代理 |

---

### 3.5 控制台系统

#### 3.5.1 概述

控制台系统是已注册企业用户的后端管理系统，承载企业日常运营的全部功能。

#### 3.5.2 功能模块

| 模块 | 页面 | 核心功能 |
|------|------|----------|
| **认证中心** | login.html / verify.html | 账号登录、实名认证、企业绑定 |
| **产品中心** | account-center.html | 产品/服务分类、快捷入口、最近使用 |
| **资金管理** | account-wallet.html | 余额查询、充值、退款、母子公司资金流水 |
| **银行账户** | account-bank.html | 绑卡、开户行管理、默认账户设置 |
| **合同管理** | account-billing.html | 合同列表、签署状态、到期提醒、下载 |
| **母子公司** | account-fund.html | 子公司资金划拨、转账明细、流水导出 |
| **子公司管理** | account-project.html | 子公司创建、组织架构、人员配置 |
| **用户权限** | account-user.html / account-role.html | 用户 CRUD、角色分配、权限配置 |
| **安全中心** | account-security.html | 密码修改、两步验证、登录设备管理 |
| **消息中心** | account-message.html | 系统消息、审批通知、未读提醒 |
| **企业实名** | account-realname.html | 企业信息、法人信息、资质文件、认证状态 |
| **权限概况** | account-permission.html | 权限分类、权限编码、功能说明 |

#### 3.5.3 资金账户页规格

| Tab | 内容 |
|-----|------|
| 充值记录 | 充值时间/方式/金额/状态/备注 |
| 退款记录 | 退款申请列表 + 退款弹窗 |
| 交易流水 | 全量交易记录 |
| 母子公司 | 母子公司资金划拨流水（方向/子公司/金额/操作人/状态） |

**母子公司资金字段说明：**

| 字段 | 说明 | 取值 |
|------|------|------|
| 划拨方向 | 资金流向 | 母公司 → 子公司（入账）/ 子公司 → 母公司（调出） |
| 子公司账户 | 目标子公司 | 浙江子公司(SUB-001) / 上海子公司(SUB-002) / 北京子公司(SUB-003) |
| 金额 | 划拨金额 | 元，正数调入/负数调出 |
| 操作人 | 执行人 | 主管理员或子管理员 |
| 状态 | 执行结果 | 成功/进行中/失败 |

---

### 3.6 业务流程页（business-process.html）

#### 3.6.1 页面目标

以可视化图表形式展示平台核心业务流程，作为产品说明文档供销售、培训、客户查阅。独立页面，通过导航页「业务流程」入口直达。

#### 3.6.2 注册全流程时序图

展示企业从注册到功能启用的完整 8 步业务流程。

**流程图：**

<svg viewBox="0 0 1320 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:1320px;height:auto;">
  <defs>
    <marker id="prd-arrow-h" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#1677FF"/>
    </marker>
    <filter id="prd-soft" x="-20%" y="-30%" width="140%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0A1628" flood-opacity="0.08"/>
    </filter>
  </defs>
  <line x1="30" y1="80" x2="1290" y2="80" stroke="#E5E8EF" stroke-width="1" stroke-dasharray="4 4"/>
  <g filter="url(#prd-soft)">
    <rect x="20" y="40" width="130" height="70" rx="12" fill="#fff" stroke="#BAE0FF"/>
    <text x="85" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">① 提交资料</text>
    <text x="85" y="88" text-anchor="middle" font-size="10" fill="#595959" font-family="PingFang SC, sans-serif">企业信息+法人</text>
  </g>
  <line x1="150" y1="75" x2="175" y2="75" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="175" y="40" width="130" height="70" rx="12" fill="#E6F4FF" stroke="#91CAFF"/>
    <text x="240" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">② 爱签认证</text>
    <text x="240" y="88" text-anchor="middle" font-size="10" fill="#1677FF" font-family="PingFang SC, sans-serif">⚡ 即时生效</text>
  </g>
  <line x1="305" y1="75" x2="330" y2="75" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="330" y="40" width="130" height="70" rx="12" fill="#fff" stroke="#D3ADF7"/>
    <text x="395" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">③ 认证通过</text>
    <text x="395" y="88" text-anchor="middle" font-size="10" fill="#595959" font-family="PingFang SC, sans-serif">生成企业档案</text>
  </g>
  <line x1="460" y1="75" x2="485" y2="75" stroke="#FA8C16" stroke-width="2" stroke-dasharray="5 3" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="485" y="40" width="130" height="70" rx="12" fill="#FFF7E6" stroke="#FFC069"/>
    <text x="550" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">④ 中信开户</text>
    <text x="550" y="88" text-anchor="middle" font-size="10" fill="#FA8C16" font-family="PingFang SC, sans-serif">⏳ 异步进行</text>
  </g>
  <line x1="615" y1="75" x2="640" y2="75" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="640" y="40" width="130" height="70" rx="12" fill="#F6FFED" stroke="#95DE64"/>
    <text x="705" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">⑤ 设置主管理员</text>
    <text x="705" y="88" text-anchor="middle" font-size="10" fill="#595959" font-family="PingFang SC, sans-serif">唯一超级管理员</text>
  </g>
  <line x1="770" y1="75" x2="795" y2="75" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="795" y="40" width="130" height="70" rx="12" fill="#FFF7E6" stroke="#FFC069"/>
    <text x="860" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">⑥ 创建子公司</text>
    <text x="860" y="88" text-anchor="middle" font-size="10" fill="#595959" font-family="PingFang SC, sans-serif">母公司直接创建</text>
  </g>
  <line x1="925" y1="75" x2="950" y2="75" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="950" y="40" width="130" height="70" rx="12" fill="#fff" stroke="#91CAFF"/>
    <text x="1015" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">⑦ 分配权限</text>
    <text x="1015" y="88" text-anchor="middle" font-size="10" fill="#595959" font-family="PingFang SC, sans-serif">权限与角色配置</text>
  </g>
  <line x1="1080" y1="75" x2="1105" y2="75" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-h)"/>
  <g filter="url(#prd-soft)">
    <rect x="1105" y="40" width="100" height="70" rx="12" fill="#1677FF"/>
    <text x="1155" y="68" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="PingFang SC, sans-serif">⑧ 启用</text>
    <text x="1155" y="88" text-anchor="middle" font-size="10" fill="#E6F4FF" font-family="PingFang SC, sans-serif">入驻完成</text>
  </g>
  <rect x="485" y="120" width="280" height="20" rx="10" fill="#FFF7E6" stroke="#FFC069" stroke-width="0.5"/>
  <text x="625" y="134" text-anchor="middle" font-size="10" fill="#FA8C16" font-weight="600" font-family="PingFang SC, sans-serif">中信开户为异步流程，不阻塞后续步骤</text>
</svg>

**各步骤详细说明：**

| 步骤 | 操作内容 | 业务规则 | 系统响应 |
|------|----------|----------|----------|
| 1. 提交资料 | 填写企业名称、统一社会信用代码（18 位）、法人姓名、法人身份证号 | 所有字段必填，信用代码 18 位 | 实时校验格式，不合格即时提示 |
| 2. 爱签认证 | 调用爱签认证接口完成企业与法人实名认证 | 对接爱签 API，**即时生效** | 认证结果秒级返回 |
| 3. 认证通过 | 生成企业电子档案，分配唯一企业 ID，状态标记为「已认证」 | 认证信息写入区块链存证 | 展示「认证成功」页面 |
| 4. 中信开户 | 认证通过后**异步**发起中信银行开户请求 | 异步进行，不阻塞后续流程 | 开户结果通过短信通知，1-3 工作日 |
| 5. 设置主管理员 | 指定唯一 Super Admin 账户，绑定安全手机 | 主管理员权限 100%，不可分割 | 主管理员收到通知 |
| 6. 创建子公司 | 母公司直接创建子公司，无需单独认证 | 可选步骤，子公司继承母公司主体资质 | 子公司即时创建成功 |
| 7. 分配权限与角色 | 配置权限体系，创建子管理员角色，分配功能模块权限 | 支持自定义权限组合 | 权限即时生效 |
| 8. 平台功能启用 | 全部功能模块正式启用 | 发送启用通知至主管理员 | 企业可正式使用 |

**关键业务规则：**
- 爱签认证为即时生效，秒级完成实名认证
- 中信开户为异步流程，认证通过后自动触发，不阻塞后续步骤
- 主管理员必须绑定安全手机，作为唯一 Super Admin
- 子公司由母公司直接创建，无需单独认证流程

#### 3.6.3 用户多主体关联关系图

展示「一个用户账号 ↔ 多家主体公司」的关联关系，各主体权限完全隔离。

**关系图：**

<svg viewBox="0 0 900 420" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:900px;height:auto;">
  <defs>
    <marker id="prd-arrow-multi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#86909C"/>
    </marker>
    <linearGradient id="prd-user-g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1677FF" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#1677FF" stop-opacity="0.03"/>
    </linearGradient>
    <linearGradient id="prd-ent-g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#52C41A" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#52C41A" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="prd-ent-g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FA8C16" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#FA8C16" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="prd-ent-g3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#722ED1" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#722ED1" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="prd-shadow" x="-10%" y="-10%" width="130%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.08"/>
    </filter>
  </defs>
  <!-- 用户账号（中心顶部） -->
  <g filter="url(#prd-shadow)">
    <rect x="340" y="20" width="220" height="90" rx="16" fill="url(#prd-user-g)" stroke="#1677FF" stroke-width="2"/>
    <text x="450" y="50" text-anchor="middle" font-size="15" font-weight="800" fill="#0A1628" font-family="PingFang SC, sans-serif">用户账号</text>
    <text x="450" y="70" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">手机号/邮箱登录</text>
    <text x="450" y="88" text-anchor="middle" font-size="11" fill="#1677FF" font-family="PingFang SC, sans-serif">（唯一身份标识）</text>
  </g>
  <!-- 主体公司 A -->
  <g filter="url(#prd-shadow)">
    <rect x="20" y="165" width="250" height="100" rx="14" fill="url(#prd-ent-g1)" stroke="#52C41A" stroke-width="1.5"/>
    <text x="145" y="192" text-anchor="middle" font-size="15" font-weight="800" fill="#237804" font-family="PingFang SC, sans-serif">主体公司 A</text>
    <text x="145" y="212" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">杭州良巧匠科技有限公司</text>
    <rect x="52" y="226" width="60" height="24" rx="12" fill="#52C41A" opacity="0.15"/>
    <text x="82" y="242" text-anchor="middle" font-size="11" font-weight="600" fill="#52C41A" font-family="PingFang SC, sans-serif">主管理员</text>
    <rect x="120" y="226" width="60" height="24" rx="12" fill="#F5222D" opacity="0.15"/>
    <text x="150" y="242" text-anchor="middle" font-size="11" font-weight="600" fill="#F5222D" font-family="PingFang SC, sans-serif">财务</text>
  </g>
  <!-- 主体公司 B -->
  <g filter="url(#prd-shadow)">
    <rect x="325" y="165" width="250" height="100" rx="14" fill="url(#prd-ent-g2)" stroke="#FA8C16" stroke-width="1.5"/>
    <text x="450" y="192" text-anchor="middle" font-size="15" font-weight="800" fill="#AD4E00" font-family="PingFang SC, sans-serif">主体公司 B</text>
    <text x="450" y="212" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">宁波匠人咨询服务有限公司</text>
    <rect x="357" y="226" width="60" height="24" rx="12" fill="#FA8C16" opacity="0.15"/>
    <text x="387" y="242" text-anchor="middle" font-size="11" font-weight="600" fill="#FA8C16" font-family="PingFang SC, sans-serif">管理员</text>
    <rect x="425" y="226" width="60" height="24" rx="12" fill="#1677FF" opacity="0.15"/>
    <text x="455" y="242" text-anchor="middle" font-size="11" font-weight="600" fill="#1677FF" font-family="PingFang SC, sans-serif">运营</text>
  </g>
  <!-- 主体公司 C -->
  <g filter="url(#prd-shadow)">
    <rect x="630" y="165" width="250" height="100" rx="14" fill="url(#prd-ent-g3)" stroke="#722ED1" stroke-width="1.5"/>
    <text x="755" y="192" text-anchor="middle" font-size="15" font-weight="800" fill="#531DAB" font-family="PingFang SC, sans-serif">主体公司 C</text>
    <text x="755" y="212" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">上海匠艺建筑设计有限公司</text>
    <rect x="723" y="226" width="60" height="24" rx="12" fill="#722ED1" opacity="0.15"/>
    <text x="753" y="242" text-anchor="middle" font-size="11" font-weight="600" fill="#722ED1" font-family="PingFang SC, sans-serif">普通成员</text>
  </g>
  <!-- 连接线 -->
  <path d="M 390 110 C 320 130 240 150 192 165" stroke="#52C41A" stroke-width="2" fill="none" stroke-dasharray="6 3" marker-end="url(#prd-arrow-multi)"/>
  <text x="280" y="128" text-anchor="middle" font-size="10" fill="#52C41A" font-weight="600" font-family="PingFang SC, sans-serif">管理员权限</text>
  <path d="M 450 110 L 450 165" stroke="#FA8C16" stroke-width="2" fill="none" stroke-dasharray="6 3" marker-end="url(#prd-arrow-multi)"/>
  <text x="465" y="140" text-anchor="start" font-size="10" fill="#FA8C16" font-weight="600" font-family="PingFang SC, sans-serif">管理员权限</text>
  <path d="M 510 110 C 580 130 660 150 718 165" stroke="#722ED1" stroke-width="2" fill="none" stroke-dasharray="6 3" marker-end="url(#prd-arrow-multi)"/>
  <text x="620" y="128" text-anchor="middle" font-size="10" fill="#722ED1" font-weight="600" font-family="PingFang SC, sans-serif">普通成员</text>
  <!-- 底部说明 -->
  <rect x="200" y="310" width="500" height="80" rx="12" fill="#F5F9FF" stroke="#E6F4FF" stroke-width="1"/>
  <text x="450" y="334" text-anchor="middle" font-size="13" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">多主体关联说明</text>
  <text x="450" y="354" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">• 同一用户账号可同时关联多家主体公司</text>
  <text x="450" y="370" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">• 在不同主体中拥有独立的角色和权限</text>
  <text x="450" y="386" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">• 切换主体时权限自动隔离，确保数据安全</text>
</svg>

**业务规则：**

| 规则 | 说明 |
|------|------|
| 唯一性 | 一个手机号/邮箱 = 一个用户账号，不可重复注册 |
| 多主体 | 一个用户账号可同时关联 N 家主体公司 |
| 角色独立 | 在每家主体中拥有独立角色，权限互不影响 |
| 权限隔离 | 切换主体时，页面数据和功能权限自动切换 |
| 操作留痕 | 主体切换记录操作日志，便于追溯 |
| 解绑限制 | 主管理员不可解绑当前主体，需先转让角色 |

#### 3.6.4 主子管理员关联关系图

展示企业账号体系的权限层级：母公司主体 → 主管理员 → 子管理员 → 员工账号。

**层级图：**

<svg viewBox="0 0 900 400" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:900px;height:auto;">
  <defs>
    <marker id="prd-arrow-e" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#86909C"/>
    </marker>
    <linearGradient id="prd-masterg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1677FF" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#1677FF" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="prd-subg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#722ED1" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#722ED1" stop-opacity="0.02"/>
    </linearGradient>
    <filter id="prd-shadow2" x="-10%" y="-10%" width="130%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.08"/>
    </filter>
  </defs>
  <!-- 母公司 -->
  <g filter="url(#prd-shadow2)">
    <rect x="330" y="14" width="240" height="80" rx="16" fill="url(#prd-masterg)" stroke="#1677FF" stroke-width="1.5"/>
    <text x="450" y="48" text-anchor="middle" font-size="16" font-weight="800" fill="#0A1628" font-family="PingFang SC, sans-serif">母公司（实名企业主体）</text>
    <text x="450" y="70" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">浙江良巧匠科技有限公司</text>
  </g>
  <!-- 主管理员 -->
  <g filter="url(#prd-shadow2)">
    <rect x="320" y="115" width="260" height="74" rx="14" fill="#E6F4FF" stroke="#1677FF"/>
    <text x="450" y="146" text-anchor="middle" font-size="17" font-weight="800" fill="#1677FF" font-family="PingFang SC, sans-serif">主管理员（Super Admin）</text>
    <text x="450" y="168" text-anchor="middle" font-size="13" fill="#595959" font-family="PingFang SC, sans-serif">唯一 · 拥有全部权限 · 可创建子管理员</text>
  </g>
  <!-- 连接线 -->
  <path d="M 450 94 C 450 104 450 108 450 113" stroke="#1677FF" stroke-width="2" marker-end="url(#prd-arrow-e)"/>
  <!-- 子管理员 A -->
  <g filter="url(#prd-shadow2)">
    <rect x="20" y="240" width="200" height="70" rx="14" fill="url(#prd-subg)" stroke="#722ED1"/>
    <text x="120" y="264" text-anchor="middle" font-size="15" font-weight="700" fill="#722ED1" font-family="PingFang SC, sans-serif">子管理员 A</text>
    <text x="120" y="286" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">权限：财务 / 合同 / 资金</text>
  </g>
  <!-- 子管理员 B -->
  <g filter="url(#prd-shadow2)">
    <rect x="350" y="240" width="200" height="70" rx="14" fill="url(#prd-subg)" stroke="#722ED1"/>
    <text x="450" y="264" text-anchor="middle" font-size="15" font-weight="700" fill="#722ED1" font-family="PingFang SC, sans-serif">子管理员 B</text>
    <text x="450" y="286" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">权限：人事 / 用户 / 角色</text>
  </g>
  <!-- 子管理员 C -->
  <g filter="url(#prd-shadow2)">
    <rect x="680" y="240" width="200" height="70" rx="14" fill="url(#prd-subg)" stroke="#722ED1"/>
    <text x="780" y="264" text-anchor="middle" font-size="15" font-weight="700" fill="#722ED1" font-family="PingFang SC, sans-serif">子管理员 C</text>
    <text x="780" y="286" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">权限：运营 / 数据 / 消息</text>
  </g>
  <!-- 连接线 -->
  <path d="M 410 184 C 350 210 200 220 150 238" stroke="#722ED1" stroke-width="2" fill="none" marker-end="url(#prd-arrow-e)"/>
  <path d="M 450 184 C 450 200 450 210 450 238" stroke="#722ED1" stroke-width="2" fill="none" marker-end="url(#prd-arrow-e)"/>
  <path d="M 490 184 C 560 210 700 220 750 238" stroke="#722ED1" stroke-width="2" fill="none" marker-end="url(#prd-arrow-e)"/>
  <!-- 授权说明 -->
  <rect x="310" y="330" width="280" height="36" rx="18" fill="#FFF7E6" stroke="#FFC069"/>
  <text x="450" y="354" text-anchor="middle" font-size="14" font-weight="700" fill="#FA8C16" font-family="PingFang SC, sans-serif">⬇ 向下授权 · 继承主管理员权限子集</text>
  <!-- 普通员工 -->
  <rect x="290" y="375" width="320" height="26" rx="13" fill="none" stroke="#FA8C16" stroke-dasharray="3 3"/>
  <text x="450" y="393" text-anchor="middle" font-size="13" fill="#FA8C16" font-family="PingFang SC, sans-serif">普通员工账号（由子管理员批量创建）</text>
</svg>

**权限规则：**

| 层级 | 角色 | 权限范围 | 操作权限 |
|------|------|----------|----------|
| L0 | 母公司主体 | 企业全部资产 | 法律责任主体 |
| L1 | 主管理员（Super Admin） | 100% 权限 | 创建/删除子管理员、分配/回收所有权限、管理全部员工 |
| L2 | 子管理员 | 继承主管理员权限子集 | 可在其权限范围内创建/管理员工 |
| L3 | 员工账号 | 最小权限原则 | 仅分配必要的功能权限 |

**核心约束：**
- 主管理员全公司唯一，不可多人同时担任
- 子管理员权限不可超越主管理员授予的范围
- 员工权限由子管理员分配，遵循最小化原则
- 所有权限变更自动记录操作日志

#### 3.6.5 母公司与子公司层级关系图

展示母公司对子公司的三大核心权限，以及母子公司的数据流向。

**组织结构图：**

<svg viewBox="0 0 900 460" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:900px;height:auto;">
  <defs>
    <marker id="prd-arrow-h4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#4E5969"/>
    </marker>
    <linearGradient id="prd-parent-g2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#FA8C16" stop-opacity="0.15"/>
      <stop offset="100%" stop-color="#FA8C16" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="prd-shadow3" x="-10%" y="-10%" width="130%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-opacity="0.08"/>
    </filter>
  </defs>
  <!-- 平台总控 -->
  <g filter="url(#prd-shadow3)">
    <rect x="380" y="12" width="140" height="50" rx="12" fill="#0A1628"/>
    <text x="450" y="32" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="PingFang SC, sans-serif">平台 · 民匠有约</text>
    <text x="450" y="48" text-anchor="middle" font-size="10" fill="#BAE0FF" font-family="PingFang SC, sans-serif">集团级多租户</text>
  </g>
  <!-- 三大权限标签 -->
  <g>
    <rect x="45" y="72" width="130" height="30" rx="15" fill="#FFF7E6" stroke="#FFC069"/>
    <text x="110" y="87" dominant-baseline="middle" text-anchor="middle" font-size="13" font-weight="600" fill="#FA8C16" font-family="PingFang SC, sans-serif">⚙️ 管理子公司</text>
    <rect x="725" y="72" width="130" height="30" rx="15" fill="#E6F4FF" stroke="#91CAFF"/>
    <text x="790" y="87" dominant-baseline="middle" text-anchor="middle" font-size="13" font-weight="600" fill="#1677FF" font-family="PingFang SC, sans-serif">🔑 登录子公司</text>
  </g>
  <!-- 母公司卡片 -->
  <g filter="url(#prd-shadow3)">
    <rect x="330" y="95" width="240" height="100" rx="18" fill="url(#prd-parent-g2)" stroke="#FA8C16" stroke-width="2"/>
    <text x="450" y="122" text-anchor="middle" font-size="17" font-weight="800" fill="#AD4E00" font-family="PingFang SC, sans-serif">母公司 A</text>
    <text x="450" y="144" text-anchor="middle" font-size="13" fill="#595959" font-family="PingFang SC, sans-serif">浙江良巧匠科技有限公司</text>
    <line x1="350" y1="158" x2="550" y2="158" stroke="#FA8C16" stroke-width="0.5" opacity="0.3"/>
    <rect x="385" y="168" width="130" height="24" rx="12" fill="#F6FFED" stroke="#95DE64"/>
    <text x="450" y="180" dominant-baseline="middle" text-anchor="middle" font-size="11" font-weight="600" fill="#52C41A" font-family="PingFang SC, sans-serif">👁 查看所有数据</text>
  </g>
  <!-- 连接线：管理权限 -->
  <path d="M 175 87 C 220 87 280 95 330 110" stroke="#FA8C16" stroke-width="2" fill="none" stroke-dasharray="6 3" marker-end="url(#prd-arrow-h4)"/>
  <!-- 连接线：登录权限 -->
  <path d="M 725 87 C 680 87 620 95 570 110" stroke="#1677FF" stroke-width="2" fill="none" stroke-dasharray="6 3" marker-end="url(#prd-arrow-h4)"/>
  <!-- 连接线：平台 → 母公司 -->
  <path d="M 450 62 L 450 95" stroke="#4E5969" stroke-width="2" fill="none" marker-end="url(#prd-arrow-h4)"/>
  <!-- 子公司标题 -->
  <text x="450" y="230" text-anchor="middle" font-size="14" font-weight="700" fill="#4E5969" font-family="PingFang SC, sans-serif">母公司创建的子公司（直接管理）</text>
  <!-- 子公司 A-1 -->
  <g filter="url(#prd-shadow3)">
    <rect x="60" y="260" width="200" height="90" rx="14" fill="#E6F4FF" stroke="#91CAFF" stroke-width="1.5"/>
    <text x="160" y="290" text-anchor="middle" font-size="14" font-weight="700" fill="#0958D9" font-family="PingFang SC, sans-serif">子公司 A-1</text>
    <text x="160" y="310" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">浙江子公司</text>
    <rect x="95" y="322" width="60" height="20" rx="10" fill="#1677FF" opacity="0.12"/>
    <text x="125" y="336" text-anchor="middle" font-size="10" font-weight="600" fill="#1677FF" font-family="PingFang SC, sans-serif">SUB-001</text>
  </g>
  <!-- 子公司 A-2 -->
  <g filter="url(#prd-shadow3)">
    <rect x="350" y="260" width="200" height="90" rx="14" fill="#FFF7E6" stroke="#FFC069" stroke-width="1.5"/>
    <text x="450" y="290" text-anchor="middle" font-size="14" font-weight="700" fill="#D46B08" font-family="PingFang SC, sans-serif">子公司 A-2</text>
    <text x="450" y="310" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">上海子公司</text>
    <rect x="385" y="322" width="60" height="20" rx="10" fill="#FA8C16" opacity="0.12"/>
    <text x="415" y="336" text-anchor="middle" font-size="10" font-weight="600" fill="#FA8C16" font-family="PingFang SC, sans-serif">SUB-002</text>
  </g>
  <!-- 子公司 A-3 -->
  <g filter="url(#prd-shadow3)">
    <rect x="640" y="260" width="200" height="90" rx="14" fill="#F9F0FF" stroke="#D3ADF7" stroke-width="1.5"/>
    <text x="740" y="290" text-anchor="middle" font-size="14" font-weight="700" fill="#531DAB" font-family="PingFang SC, sans-serif">子公司 A-3</text>
    <text x="740" y="310" text-anchor="middle" font-size="12" fill="#595959" font-family="PingFang SC, sans-serif">北京子公司</text>
    <rect x="675" y="322" width="60" height="20" rx="10" fill="#722ED1" opacity="0.12"/>
    <text x="705" y="336" text-anchor="middle" font-size="10" font-weight="600" fill="#722ED1" font-family="PingFang SC, sans-serif">SUB-003</text>
  </g>
  <!-- 连接线：母公司 → 子公司 -->
  <path d="M 390 195 C 330 215 260 235 160 260" stroke="#FA8C16" stroke-width="2" fill="none" marker-end="url(#prd-arrow-h4)"/>
  <path d="M 450 195 L 450 260" stroke="#FA8C16" stroke-width="2" fill="none" marker-end="url(#prd-arrow-h4)"/>
  <path d="M 510 195 C 580 215 660 235 740 260" stroke="#FA8C16" stroke-width="2" fill="none" marker-end="url(#prd-arrow-h4)"/>
  <!-- 数据流说明 -->
  <rect x="150" y="385" width="600" height="60" rx="12" fill="#F5F9FF" stroke="#E6F4FF" stroke-width="1"/>
  <text x="450" y="408" text-anchor="middle" font-size="13" font-weight="700" fill="#0A1628" font-family="PingFang SC, sans-serif">数据流向说明</text>
  <text x="450" y="428" text-anchor="middle" font-size="11" fill="#595959" font-family="PingFang SC, sans-serif">子公司业务数据实时汇总至母公司后台 · 母公司可直接登录子公司操作 · 母子公司资金 T+0 划拨</text>
</svg>

**母公司三大核心权限：**

| 权限 | 图标 | 功能说明 | 使用场景 |
|------|------|----------|----------|
| 管理子公司 | ⚙️ | 统一管理运营策略、人员配置、财务制度 | 母公司集中管控子公司日常运营 |
| 登录子公司 | 🔑 | 主管理员可直接以子公司身份登录操作 | 跨子公司巡检、应急操作、数据核查 |
| 查看所有数据 | 👁 | 子公司所有业务数据自动汇总至母公司后台 | 集团级数据分析、业绩汇总、财务合并 |

**数据流向说明：**

| 流向 | 说明 | 实时性 | 用途 |
|------|------|--------|------|
| 子公司 → 母公司 | 业务数据（订单、流水、人员）自动汇总 | 实时 | 集团级数据看板、业绩分析 |
| 母公司 → 子公司 | 管理指令、权限变更、制度下发 | 准实时 | 统一管控、策略下发 |
| 母公司 → 子公司 | 资金划拨（母子公司资金） | T+0 | 资金集中管理、调拨 |

**子公司信息字段：**

| 字段 | 说明 | 示例 |
|------|------|------|
| 子公司名称 | 子公司注册名称 | 浙江子公司 |
| 子公司编码 | 系统唯一编码 | SUB-2026-001 |
| 所属母公司 | 归属的母公司主体 | 浙江良巧匠科技 |
| 运营状态 | 正常运营/暂停/注销 | 正常运营 |
| 认证状态 | 已认证/待认证 | 继承母公司认证状态 |

---

### 3.7 其他页面

| 页面 | 路径 | 内容 |
|------|------|------|
| 关于我们 | about.html | 公司介绍、发展历程、企业文化 |
| 加入我们 | career.html | 招聘岗位、投递方式、福利介绍 |
| 联系我们 | contact.html | 联系方式、地图、留言表单 |
| 新闻动态 | news.html | 公司新闻、行业资讯、媒体报道 |
| 隐私政策 | privacy.html | 隐私保护条款 |
| 服务中心 | service-center.html | 服务协议、服务条款 |
| 合同签署 | contract-sign.html | 电子合同签署流程 |
| 开发者中心 | developer-center.html | API 文档、SDK 下载、接入指南 |

---

## 四、交互规范

### 4.1 全局交互

| 交互类型 | 规范 |
|----------|------|
| 页面加载 | 骨架屏 → 内容渐入，400ms |
| 滚动动画 | 元素进入视口时触发 reveal 动画 |
| 按钮点击 | 按下缩放 0.98，松开回弹 |
| 卡片悬浮 | 上移 8px + 阴影加深 |
| 链接跳转 | 顶部页面平滑滚动 |
| 表单提交 | Loading 态 + 成功/失败 Toast |

### 4.2 导航交互

| 场景 | 行为 |
|------|------|
| 顶部导航 | 滚动时添加背景模糊 + 阴影 |
| 当前高亮 | 当前页面导航项高亮 |
| 移动端 | 汉堡菜单展开侧滑导航 |
| 锚点跳转 | 平滑滚动 + 偏移固定导航高度 |

### 4.3 控制台交互

| 场景 | 行为 |
|------|------|
| 侧边栏 | 折叠/展开切换 |
| Tab 切换 | 内容区平滑切换 |
| 表格操作 | 行内操作按钮 + 批量操作栏 |
| 弹窗 | 居中弹出 + 背景遮罩 + ESC 关闭 |
| 下拉筛选 | 自定义下拉 + 多选支持 |

---

## 五、视觉规范

### 5.1 色彩体系

| Token | 色值 | 用途 |
|-------|------|------|
| 品牌主色 | #1677FF | 民匠有约主色、按钮、链接 |
| 品牌深蓝 | #0F52BA | 安心云主色 |
| 品牌橙色 | #FA8C16 | 代理商主色 |
| 成功色 | #52C41A | 成功状态、在线指示 |
| 警告色 | #FAAD14 | 警告提示 |
| 危险色 | #F53F3F | 错误、删除、退出 |
| 文字主色 | #1F2329 | 标题、正文 |
| 文字次色 | #646A73 | 描述、辅助文字 |
| 边框色 | #E5E6EB | 分割线、边框 |
| 背景色 | #F7F8FA | 页面背景 |

### 5.2 字体规范

| 层级 | 字号 | 字重 | 颜色 | 行高 |
|------|------|------|------|------|
| 超大标题（Hero） | 48px | 700 | #1F2329 | 1.2 |
| 页面大标题 | 36px | 700 | #1F2329 | 1.3 |
| 区块标题 | 24px | 600 | #1F2329 | 1.4 |
| 卡片标题 | 16px | 600 | #1F2329 | 1.5 |
| 正文 | 14px | 400 | #4E5969 | 1.6 |
| 辅助文字 | 12px | 400 | #8F959E | 1.6 |

### 5.3 间距规范

| Token | 值 | 用途 |
|-------|----|------|
| --space-xs | 4px | 紧凑间距 |
| --space-sm | 8px | 元素内边距 |
| --space-md | 16px | 区块内元素间距 |
| --space-lg | 24px | 卡片内边距 |
| --space-xl | 32px | 卡片间距 |
| --space-2xl | 48px | 区块间距 |
| --space-3xl | 64px | 大区块间距 |

### 5.4 圆角规范

| 元素 | 圆角 |
|------|------|
| 按钮 | 8px |
| 卡片 | 12px |
| 输入框 | 8px |
| 标签/徽章 | 16px（全圆角） |
| 大容器 | 16px |

### 5.5 响应式断点

| 设备 | 断点 | 布局 |
|------|------|------|
| 大屏桌面 | ≥1440px | 最大宽度 1440px 居中 |
| 桌面 | 1200-1439px | 最大宽度 1200px 居中 |
| 平板 | 768-1199px | 两列/单列自适应 |
| 手机 | <768px | 单列 + 汉堡菜单 |

---

## 六、内容运营

### 6.1 SEO 要求

| 项目 | 要求 |
|------|------|
| Title 标签 | 每页独立 Title，包含核心关键词 |
| Meta Description | 120-160 字符，每页独立 |
| H1 标签 | 每页唯一 H1，突出页面主题 |
| Alt 属性 | 所有图片添加描述性 Alt |
| 结构化数据 | JSON-LD Schema.org 标记 |
| Sitemap | 生成 sitemap.xml 供爬虫索引 |
| 移动端适配 | 响应式设计，移动端友好 |

### 6.2 埋点需求

| 事件 | 触发时机 | 上报参数 |
|------|----------|----------|
| page_view | 页面加载完成 | page_id, referrer, device |
| product_click | 产品卡片点击 | product_id, position |
| cta_click | CTA 按钮点击 | cta_id, page_id, position |
| nav_click | 导航项点击 | nav_id, position |
| scroll_depth | 滚动到 25/50/75/100% | page_id, depth |
| form_submit | 表单提交 | form_id, result |

---

## 七、安全与合规

### 7.1 安全要求

| 项目 | 要求 |
|------|------|
| HTTPS | 全站 HTTPS 加密 |
| 密码 | BCrypt 加密存储，最小长度 8 位 |
| 限流 | 登录接口 5 次/分钟 |
| CSRF | 全站 Token 防护 |
| XSS | 输入过滤 + 输出转义 |
| 等保 | 等保三级认证 |

### 7.2 合规要求

| 项目 | 要求 |
|------|------|
| 隐私政策 | 独立页面，内容完整 |
| 用户协议 | 独立页面，签署流程 |
| 数据留存 | 符合《个人信息保护法》 |
| 税务合规 | 与浙江省税务局系统对接 |
| 电子合同 | 区块链存证，法律效力保障 |

---

## 八、版本历史

| 版本 | 日期 | 变更内容 |
|------|------|----------|
| v1.0 | 2026-08-28 | 初版发布：覆盖官网全部页面（首页 + 产品详情 + 控制台 + 业务流程 + 其他）、视觉规范、交互规范、安全合规 |

---

## 附录

### A. 页面清单与访问链接

| 模块 | 页面 | 文件 |
|------|------|------|
| 首页 | 官网首页 | index.html |
| 产品 | 民匠有约 | minjiang.html |
| 产品 | 民匠安心云 | anxinyun.html |
| 产品 | 城市代理 | agent.html |
| 产品 | 代理商选择 | agent-select.html |
| 产品 | 民匠功能 | minjiang-features.html |
| 产品 | 民匠方案 | minjiang-solutions.html |
| 产品 | 民匠案例 | minjiang-cases.html |
| 产品 | 民匠应急 | minjiang-emergency.html |
| 产品 | 民匠帮助 | minjiang-help.html |
| 产品 | 安心云功能 | anxinyun-features.html |
| 产品 | 安心云场景 | anxinyun-scenarios.html |
| 产品 | 安心云帮助 | anxinyun-help.html |
| 产品 | 安心云税务 | anxinyun-tax.html |
| 控制台 | 登录 | login.html |
| 控制台 | 认证验证 | verify.html |
| 控制台 | 产品中心 | account-center.html |
| 控制台 | 资金账户 | account-wallet.html |
| 控制台 | 银行账户 | account-bank.html |
| 控制台 | 合同管理 | account-billing.html |
| 控制台 | 母子公司 | account-fund.html |
| 控制台 | 消息中心 | account-message.html |
| 控制台 | 权限概况 | account-permission.html |
| 控制台 | 子公司管理 | account-project.html |
| 控制台 | 企业实名 | account-realname.html |
| 控制台 | 角色管理 | account-role.html |
| 控制台 | 角色编辑 | account-role-edit.html |
| 控制台 | 安全中心 | account-security.html |
| 控制台 | 用户管理 | account-user.html |
| 业务流程 | 业务流程文档 | business-process.html |
| 其他 | 关于我们 | about.html |
| 其他 | 加入我们 | career.html |
| 其他 | 联系我们 | contact.html |
| 其他 | 新闻动态 | news.html |
| 其他 | 隐私政策 | privacy.html |
| 其他 | 服务中心 | service-center.html |
| 其他 | 合同签署 | contract-sign.html |
| 其他 | 开发者中心 | developer-center.html |
| 其他 | 消息详情 | message-detail.html |
| 导航 | 导航索引页 | navigation.html |

### B. GitHub Pages 地址

```
https://zhc1231.github.io/mjyy-gw/
```

### C. 本地开发命令

```bash
# 进入项目目录
cd /workspace/annotation

# 启动本地预览服务器
python3 -m http.server 8080

# 访问地址
# http://localhost:8080
```

### D. 推送到 GitHub Pages

```bash
# 进入仓库根目录
cd /workspace

# 添加修改的文件
git add annotation/

# 提交（请填写具体变更说明）
git commit -m "feat: 变更内容描述"

# 推送到远程仓库
git push mjyy main

# 等待 1-3 分钟后访问线上页面
```

### E. 品牌资产

| 资源 | 地址 |
|------|------|
| Logo（民匠有约） | https://oss.minjiangyouyue.com/mjlogo/logo02.png |
| Logo（安心云） | https://oss.minjiangyouyue.com/mjlogo/logo01.png |
| 公司名称 | 浙江良巧匠网络科技 |
| 公司主体 | 浙江良巧匠科技有限公司 |

---

*本文档由民匠有约产品团队维护，如有疑问请联系产品经理。*