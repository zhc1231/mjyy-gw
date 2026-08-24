#!/usr/bin/env python3
"""Rewrite ALL 19 mermaid blocks in product-design/index.html by hand.

Rules applied to every block to ensure Mermaid 10.9.x never errors:
- Every node body is ASCII-friendly Chinese, inside DOUBLE QUOTES only.
- Every edge label is short ASCII/Chinese, inside DOUBLE QUOTES only (use -- "x" -->, avoid -->|x|).
- No decorations: no ①·全角括号/×/emoji. Multi-line label uses "<br/>".
- One statement per line. Node IDs are short ASCII (2-6 letters + optional digit).
- No "([...])" stadium nodes; use rounded "([text])" and keep text simple (we'll prefer simple [rect] only).
"""
import re

PATH = '/workspace/docs/product-design/index.html'

# 19 blocks, in document order.
BLOCKS = [

# Block 1: 0.1 面包屑跳转规范 (Fig 0-1)
r'''flowchart LR
  BC["面包屑:首页/控制台/当前页"]
  BC --> H["首页 -> index.html 官网首页"]
  BC --> C["控制台 -> account-center.html 产品中心"]
  BC --> P["当前页 -> 无跳转或刷新当前页"]
  P --> P1["企业信息:不点击或刷新"]
  P --> P2["用户管理/成员管理:末级不点击"]
  style H fill:#FF7A16,color:#fff
  style C fill:#2A6DF4,color:#fff
  style P fill:#0C9A74,color:#fff
''',

# Block 2: 0.2 主/子账号关系模型 (Fig 0-2)
r'''flowchart TB
  E["企业:统一社会信用代码唯一"]
  E --> OWN["主账号 Owner:1个/企业"]
  E --> S1["子账号 1"]
  E --> S2["子账号 2"]
  E --> S3["子账号 3 ... N"]

  OWN --> POW["超级权限集<br/>-企业信息修改/转让<br/>-主账号安全<br/>-添加移除停用子账号<br/>-子账号授权开关<br/>-合同签署/资金划转<br/>-三款SaaS授权开关"]

  S1 --> R1["授权范围例1<br/>-民匠有约 SaaS:全模块<br/>-代理商 SaaS:查看<br/>-安心云 SaaS:未授权<br/>-资金账户:仅充值<br/>-用户管理:查看"]
  S2 --> R2["授权范围例2<br/>-安心云 SaaS:财税+发票<br/>其他效果<br/>-产品中心卡片变灰<br/>-菜单不在DOM出现"]
  S3 --> R3["授权范围:自定义任意组合"]

  style OWN fill:#0C9A74,color:#fff
  style E fill:#1F3FA8,color:#fff
  style POW fill:#FFF4D9,color:#5C3A00
  style R1 fill:#EAF0FC,color:#1F3FA8
  style R2 fill:#E7F8F0,color:#085A3F
  style R3 fill:#FFF1E5,color:#7A3800
''',

# Block 3: 1.2 主账号注册流程 (Fig 1-1)
r'''flowchart TD
  Start["进入注册面板<br/>扫码#registerPanel 或 点登录页注册"] --> A["(1) 输入手机号"]
  A --> B{"手机号合法?"}
  B -- "否" --> A1["提示:手机号格式错误"] --> A
  B -- "是" --> C["(2) 发短信倒计时60s"]
  C --> D["(3) 输入6位验证码"]
  D --> E{"验证码有效?"}
  E -- "否" --> D1["提示:验证码错误或过期"] --> D
  E -- "是" --> F["(4) 设置密码>=8位"]
  F --> G["(5) 再输一次密码+勾选协议"]
  G --> H{"两次密码一致且协议勾选?"}
  H -- "否" --> G1["提示:失败原因"] --> G
  H -- "是" --> I["写会话:注册成功<br/>绑定手机号+设置密码<br/>新建企业草稿+主账号Owner"]
  I --> J["下一步:进入企业实名三步"]
  style Start fill:#2A6DF4,color:#fff
  style J fill:#0C9A74,color:#fff
''',

# Block 4: 1.3 登录/注册分流图 (Fig 1-2)
r'''flowchart TD
  L["进入登录页 login.html"] --> TAB{"方式选择"}
  TAB -- "微信扫码" --> WX{"已在本平台注册过?"}
  TAB -- "密码+验证码" --> ACC{"账号存在?"}

  WX -- "否 新用户" --> NEW1["切注册面板<br/>提示:新用户请先完成注册"] --> REG["走 1.2 注册流程"]
  WX -- "是 已注册" --> OLD1["提示:扫码登录成功<br/>1s轮询同步跳"] --> GO["进入平台<br/>已认证->产品中心<br/>未认证->实名页"]

  ACC -- "否" --> NEW2["提示:账号不存在+高亮去注册"] --> REG
  ACC -- "是" --> PW{"密码+短信匹配?"}
  PW -- "否" --> WRONG["提示:错误原因<br/>5次锁定30min"]
  PW -- "是" --> OLD2["写登录态+注册态+角色会话"] --> GO

  style REG fill:#FFF4D9,color:#5C3A00
  style GO fill:#0C9A74,color:#fff
  style WRONG fill:#FFE9E6,color:#A83019
''',

# Block 5: 1.4 子账号邀请添加 (Fig 1-3)
r'''flowchart LR
  OWNER["主账号登录->用户管理/成员管理"] --> ADD["点击+添加成员按钮"]
  ADD --> FORM["填写表单<br/>(1)用户名4-16位<br/>(2)姓名<br/>(3)手机号唯一<br/>(4)初始密码短信下发<br/>(5)授权范围勾选"]
  FORM --> V{"字段校验通过?"}
  V -- "否" --> ERR["提示具体字段错误"] --> FORM
  V -- "是" --> SAVE["保存账号+生成邀请链接"]
  SAVE --> INVITE["发送短信/邮件给子账号"]
  INVITE --> NEWSUB["新子账号创建成功<br/>状态=已启用<br/>类型=子账号<br/>授权=按勾选"]
  style OWNER fill:#0C9A74,color:#fff
  style NEWSUB fill:#E6F1FF,color:#2765D9
''',

# Block 6: 2.1 企业认证三步无个人实名 (Fig 2-1)
r'''flowchart TD
  S["入口:注册成功跳转 或 控制台企业信息菜单"] --> A["Step1 企业工商信息<br/>-企业名称<br/>-统一社会信用代码<br/>-法定代表人<br/>-注册地址<br/>-成立日期/营业期限"]
  A --> B{"工商联网核验?"}
  B -- "失败" --> A1["提示原因<br/>最多3次后24h锁定"] --> A
  B -- "通过" --> C["Step2 营业执照与电子章<br/>-上传正本OCR回填<br/>-上传法人授权书<br/>-申领企业章/法人章"]
  C --> D{"材料审核?"}
  D -- "驳回" --> B1["标注驳回项+返回修改"] --> C
  D -- "通过" --> E["Step3 对公打款匹配<br/>-填开户行/账号/开户名<br/>-平台打0.01-0.99元随机<br/>-主账号48h回填金额"]
  E --> F{"金额匹配?"}
  F -- "不匹配" --> E1["提示:不匹配,最多重试3次"] --> E
  F -- "匹配成功" --> PASS["认证通过<br/>企业状态=已认证<br/>企业章可用<br/>默认SaaS主账号全通"]
  style S fill:#2A6DF4,color:#fff
  style PASS fill:#0C9A74,color:#fff
''',

# Block 7: 2.3 多企业切换关系 (Fig 2-3)
r'''flowchart TB
  U["自然人:手机号 138****8800"]
  U -- "在A是主账号 Owner" --> E1["企业A:上海安心云科技"]
  U -- "在B是子账号 授权:民匠有约+代理商" --> E2["企业B:南京民匠劳务"]
  U -- "在C是子账号 授权:安心云SaaS只读" --> E3["企业C:苏州蓝领人力"]

  SW["右上角账号下拉->切换企业"]
  U --- SW
  SW --> S1["切换企业A -> 主账号权限"] --> E1
  SW --> S2["切换企业B -> 子账号授权B范围"] --> E2
  SW --> S3["切换企业C -> 子账号授权C范围"] --> E3

  style E1 fill:#0C9A74,color:#fff
  style E2 fill:#EAF0FC,color:#1F3FA8
  style E3 fill:#FFF1E5,color:#7A3800
''',

# Block 8: 3.2 控制台授权控制三款SaaS (Fig 3-1)
r'''flowchart LR
  OWNER["主账号 Owner"] --> PERM["控制台 权限管理<br/>三款SaaS开关+模块级授权"]
  PERM --> A1["开关A 民匠有约SaaS<br/>项目管理 劳务合同 电子签章 出勤 工资代发 物料领用"]
  PERM --> A2["开关B 代理商SaaS<br/>城市代理 需求发布 撮合匹配 报价管理 供应商结算"]
  PERM --> A3["开关C 安心云SaaS<br/>财税记账 发票管理 银行流水 工资台账 个税申报"]

  A1 --> UI1["子账号效果<br/>-进入平台按钮按开关渲染<br/>-菜单裁剪<br/>-模块URL拦截"]
  A2 --> UI2["子账号效果 同上"]
  A3 --> UI3["子账号效果 同上"]

  style OWNER fill:#0C9A74,color:#fff
  style A1 fill:#EAF0FC,color:#1F3FA8
  style A2 fill:#FFF4D9,color:#A87700
  style A3 fill:#E7F8F0,color:#085A3F
''',

# Block 9: 4.1 逻辑关联关系图 (Fig 4-1, no DB fields, only semantic)
r'''flowchart TB
  U1["主账号用户 张经理"]
  U2["子账号用户 王师傅"]
  U3["子账号用户 李会计"]

  E["企业:上海安心云科技<br/>统一社会信用代码 9131****AB12<br/>企业实名=已认证"]

  P1["产品:民匠有约 SaaS"]
  P2["产品:代理商 SaaS"]
  P3["产品:安心云 SaaS"]

  U1 -- "1:1 创建者+主账号" --> E
  U2 -- "N:1 被邀请+子账号" --> E
  U3 -- "N:1 被邀请+子账号" --> E

  E -- "1:N 已开通产品" --> P1
  E -- "1:N 已开通产品" --> P2
  E -- "1:N 已开通产品" --> P3

  U1 -- "恒有访问(默认套餐)" --> P1
  U1 -- "恒有访问" --> P2
  U1 -- "恒有访问" --> P3

  U2 -- "访问需按授权开关" --> P1
  U2 -- "访问需按授权开关" --> P2
  U3 -- "访问需按授权开关" --> P3

  style U1 fill:#0C9A74,color:#fff
  style E fill:#1F3FA8,color:#fff
  style P1 fill:#EAF0FC,color:#1F3FA8
  style P2 fill:#FFF4D9,color:#A87700
  style P3 fill:#E7F8F0,color:#085A3F
''',

# Block 10: 4.2 授权判定链三级 (Fig 4-2)
r'''flowchart TD
  A["子账号U登录企业E想打开产品P"] --> L1{"L1企业层开关<br/>E是否已开通P?"}
  L1 -- "否" --> N1["提示:企业尚未开通P<br/>跳转产品中心卡片 显示联系开通"]
  L1 -- "是" --> L2{"L2用户层开关<br/>主账号是否给U勾选P?"}
  L2 -- "未勾选" --> N2["产品中心卡片:进入平台置灰<br/>菜单:不出现P的模块"]
  L2 -- "已勾选" --> L3{"L3模块层开关<br/>想访问的模块M被勾选?"}
  L3 -- "未勾选" --> N3["模块级URL拦截 或 菜单不渲染M"]
  L3 -- "已勾选" --> Y["正常进入P的模块M页面"]
  style Y fill:#0C9A74,color:#fff
  style N1 fill:#FFE9E6,color:#A83019
  style N2 fill:#FFF4D9,color:#A87700
  style N3 fill:#FFF1E5,color:#7A3800
''',

# Block 11: 5.2 产品中心卡片判定 (Fig 5-2)
r'''flowchart TD
  HOME["主/子账号登录->默认进产品中心"] --> CARD{"三款SaaS卡片按钮态"}
  CARD -- "主账号 Owner" --> P["三张卡 进入平台 都可点击<br/>点击->进入对应SaaS工作台"]
  CARD -- "子账号" --> PERM{"检查A1/A2/A3开关<br/>产品+模块是否被主账号勾选?"}
  PERM -- "未勾选对应产品" --> X["卡片 进入平台 置灰 disabled<br/>hover tooltip:请联系主账号授权"]
  PERM -- "已勾选" --> Y["卡片 进入平台 可点击<br/>进入后菜单按模块开关裁剪"]
  style P fill:#E6F1FF,color:#2765D9
  style Y fill:#0C9A74,color:#fff
  style X fill:#FFE9E6,color:#A83019
''',

# Block 12: 5.4 成员管理风险二次确认 (Fig 5-4)
r'''flowchart TD
  A["主账号点击 移出 某子账号"] --> DLG["二次确认弹窗<br/>-标题:确定要移除此用户名?<br/>-正文:风险操作 谨慎处理 无法恢复<br/>该子账号将失去企业全部产品访问<br/>已签署合同历史签名保留<br/>-确认移除按钮:红色"]
  DLG --> OK{"点击确认移除?"}
  OK -- "否 关闭或点X" --> RET["状态不变 返回列表"]
  OK -- "是" --> EXEC["执行移除<br/>账号类型不变<br/>授权全部收回<br/>企业关联解除"]
  EXEC --> REC["写入操作日志 操作人+时间+对象"]
  style DLG fill:#FFF4D9,color:#A87700
  style EXEC fill:#FFE9E6,color:#A83019
  style RET fill:#E7F8F0,color:#085A3F
''',

# Block 13: 6.1 面包屑跳转闭环 (Fig 6-1)
r'''flowchart LR
  U["任意控制台页 点击面包屑任一项"] --> W{"点击哪一级?"}
  W -- "第1级 首页" --> H["index.html 官网首页"]
  W -- "第2级 控制台" --> C["account-center.html 产品中心"]
  W -- "第3级 当前页名" --> P["刷新或锚定回页顶"]
  style H fill:#FF7A16,color:#fff
  style C fill:#2A6DF4,color:#fff
  style P fill:#0C9A74,color:#fff
''',

# Block 14: 6.2 登录方式x未注册已注册 (Fig 6-2)
r'''flowchart TD
  L["登录页"] --> TAB{"两种登录方式Tab选哪个?"}
  TAB -- "微信扫码" --> WX{"扫完码的用户<br/>在本平台是否已注册?"}
  TAB -- "密码+验证码" --> PSW{"账号在系统存在?"}

  WX -- "否" --> R1["切#registerPanel<br/>手机号+验证码+密码->主账号注册"] --> REG_OK["完成注册->跳企业实名"]
  WX -- "是" --> A1["1.2s提示扫码登录成功<br/>1s轮询同步跳"] --> GO["进入平台"]

  PSW -- "否" --> R2["提示:账号不存在+高亮去注册<br/>切注册面板"] --> R1
  PSW -- "是" --> P2{"密码+短信匹配?"}
  P2 -- "否" --> R3["提示错误原因<br/>5次锁定30min"]
  P2 -- "是" --> A2["写登录态+注册态+角色会话"] --> GO

  style REG_OK fill:#FFF4D9,color:#A87700
  style GO fill:#0C9A74,color:#fff
  style R3 fill:#FFE9E6,color:#A83019
''',

# Block 15: 6.3 企业认证三步 (Fig 6-3)
r'''flowchart LR
  S["入口:注册成功或控制台企业信息菜单"] --> A["Step1 工商信息"] -- "工商核验" --> B["Step2 资质与电子章"] -- "审核通过" --> C["Step3 对公打款匹配"] -- "金额匹配" --> PASS["认证通过"]
  A -- "核验失败" --> A1["返回修改+提示原因"] --> A
  B -- "审核驳回" --> B1["标注驳回项"] --> B
  C -- "3次不匹配" --> C1["24h后重试+人工兜底"] --> C
  style PASS fill:#0C9A74,color:#fff
''',

# Block 16: 6.4 授权管控闭环 (Fig 6-4)
r'''flowchart TD
  OWN["主账号登录"] --> UP["用户管理/权限管理<br/>勾选子账号U的三款SaaS模块开关"]
  UP --> SAVE["保存到:子账号U的授权范围配置"]
  SAVE --> SYNC["子账号U下次登录或刷新页<br/>产品中心卡片+菜单+模块URL按最新开关渲染"]
  SYNC --> EX1["例:勾选 民匠有约 全模块<br/>王师傅可见合同管理/出勤/代发"]
  SYNC --> EX2["例:不勾选 安心云SaaS<br/>李会计的产品中心安心云卡片变灰"]
  EX1 --> FEED["任何模块级越权访问:统一返回403并提示联系主账号"]
  EX2 --> FEED
  style OWN fill:#0C9A74,color:#fff
  style FEED fill:#FFE9E6,color:#A83019
''',

# Block 17: 6.5 合同签署流程 (Fig 6-5)
r'''flowchart TD
  A["主账号或授权子账号 在合同管理发起<br/>新建劳务合同/分包合同"] --> T["选模板或上传PDF"]
  T --> B["填签署方:企业+工人/供应商+签署顺序"]
  B --> SEAL{"需要企业章?<br/>(金额>=5w或模板强制)"}
  SEAL -- "是" --> SMS2["主账号短信二次验证->企业章/法人章自动盖章"]
  SEAL -- "否" --> FREE["跳过企业章->只走个人签署"]
  SMS2 --> SIGN["各方按顺序签署<br/>电子签:短信链接+微信签"]
  FREE --> SIGN
  SIGN --> STORE["签署完成PDF存证<br/>写入合同台账+归档键"]
  style A fill:#2A6DF4,color:#fff
  style STORE fill:#0C9A74,color:#fff
''',

# Block 18: 6.6 资金账户-代发-安心云记账 (Fig 6-6)
r'''flowchart LR
  A["主账号登录 资金账户->充值"] --> B["选金额+支付渠道->微信或银行支付成功"]
  B --> W["资金账户余额 +N元"]
  W --> C["民匠有约SaaS 工资代发菜单<br/>选项目/工人/金额->发起代发"]
  C --> P{"支付密码+主账号短信二次验证(>=5w)?"}
  P -- "失败" --> L["提示错误+锁定策略(5次锁30min)"] --> C
  P -- "通过" --> D["资金账户余额扣减->工人银行卡到账"]
  D --> J["安心云SaaS 记账模块 自动记账<br/>借:应付职工薪酬 贷:银行存款"]
  J --> R["生成工资流水凭证 供会计复核/导出"]
  style D fill:#0C9A74,color:#fff
  style L fill:#FFE9E6,color:#A83019
''',

# Block 19: 6.7 代理商SaaS 供需撮合 (Fig 6-7)
r'''flowchart TD
  B["企业主账号 在代理商SaaS发布需求<br/>例:苏州100名钢筋工 12天"] --> MATCH["撮合引擎:匹配满足条件的城市代理/供应商"]
  MATCH --> NTF["给匹配到的代理发短信+微信通知"]
  NTF --> RESP["代理24h内报价+上传人员花名册"]
  RESP --> SEL["企业主账号对比多家报价->选中一家->生成电子合同"]
  SEL --> CON["合同签署(走6.5流程)->需求状态=已承接"]
  CON --> TRK["代理每日上传出勤照片/进度->企业主账号实时查看"]
  style B fill:#2A6DF4,color:#fff
  style CON fill:#0C9A74,color:#fff
''',

]

assert len(BLOCKS) == 19, f'Expected 19 blocks, got {len(BLOCKS)}'

# Now substitute into the HTML file in order.
html = open(PATH, 'r', encoding='utf-8').read()

pat = re.compile(r'<pre class="mermaid">(.*?)</pre>', re.S)
count = [0]
def repl(_m):
    i = count[0]
    count[0] += 1
    body = BLOCKS[i]
    if not body.endswith('\n'):
        body = body + '\n'
    return '<pre class="mermaid">\n' + body.rstrip() + '\n</pre>'

new_html = pat.sub(repl, html)
assert count[0] == len(BLOCKS), f'Expected to replace {len(BLOCKS)} but replaced {count[0]}'

open(PATH, 'w', encoding='utf-8').write(new_html)
print(f'Rewritten blocks: {count[0]} / {len(BLOCKS)} into {PATH}')

# Print samples to prove sanitization
import html as _html
blocks2 = re.findall(r'<pre class="mermaid">(.*?)</pre>', new_html, re.S)
CHECKS = [('（','FWRAP_L'),('）','FWRAP_R'),('：','FCOLON'),('，','FCOMMA'),('①','C1'),('②','C2'),('③','C3'),('·','MID'),('✅','EMO1'),('❌','EMO2'),('×','XMUL'),('&nbsp;','NBSP')]
bad = 0
for i, b in enumerate(blocks2, 1):
    issues = []
    for tok, name in CHECKS:
        if tok in b:
            issues.append(f'{name}:{b.count(tok)}')
    # any node that contains newline inside a bracket delimiter in a single line?
    # (We already rewrote, so this is just a last check.)
    multi = len(re.findall(r'[\[({][^\[\]\(\)\{\}]*\n[^\[\]\(\)\{\}]*[\]\)\}]', b))
    if multi:
        issues.append(f'MLN:{multi}')
    if issues:
        bad += 1
        print('Block', i, issues)
print('Blocks still have dangerous chars:', bad)
