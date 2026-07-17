import os, re

files = ['index.html', 'minjiang.html', 'anxinyun.html', 'agent.html']

# account-center 中 badge 的内联样式
badge_style = 'font-size:10px;padding:0 5px;border-radius:4px;background:var(--brand-primary-50);color:var(--brand-primary);font-weight:500;line-height:16px;'

# 新的退出登录 footer
logout_footer = '''            <div class="user-dropdown-footer">
              <button class="user-dropdown-logout" id="logoutBtn">
                <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/><polyline points="16 17 21 12 16 7" stroke="currentColor" stroke-width="2"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/></svg>
                退出登录
              </button>
            </div>'''

# 去实名认证分组
verify_group = '''            <div class="user-dropdown-divider"></div>
              <div class="user-dropdown-group">
                <a href="verify.html" class="user-dropdown-item user-dropdown-item-primary" id="verifyLink">
                  <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                  <span id="verifyLinkText">去实名认证</span>
                </a>
              </div>
            </div>'''

for fname in files:
    path = os.path.join('/workspace', fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. 给 badge 添加内联样式
    content = content.replace(
        '<span class="user-account-badge" id="dropdownBadge">主账号</span>',
        f'<span class="user-account-badge" id="dropdownBadge" style="{badge_style}">主账号</span>'
    )

    # 2. 将 header 后的结构改为 user-dropdown-body 包裹
    # 当前结构是：header -> divider -> group(账号管理) -> divider -> group(费用与资产) -> divider -> logoutBtn
    # 目标结构是：header -> user-dropdown-body{ group(账号管理) -> divider -> group(费用与资产) -> divider -> group(verifyLink) } -> footer(logoutBtn)

    # 找到 </div> (header结束) 后的第一个 <div class="user-dropdown-divider"></div>
    # 替换为 <div class="user-dropdown-body">

    # 匹配 header 闭合后的第一个 divider，替换为 user-dropdown-body 开始
    # header 闭合是：</div>\n            </div>\n            <div class="user-dropdown-divider"></div>
    content = re.sub(
        r'(</div>\s*</div>\s*</div>)\s*<div class="user-dropdown-divider"></div>\s*<div class="user-dropdown-group">',
        r'\1\n            <div class="user-dropdown-body">\n              <div class="user-dropdown-group">',
        content
    )

    # 3. 替换最后的 divider + logoutBtn 为 verify_group + </div>(body闭合) + footer
    # 旧：<div class="user-dropdown-divider"></div>\n            <button class="user-dropdown-item" id="logoutBtn">退出登录</button>\n          </div>
    content = content.replace(
        '''            <div class="user-dropdown-divider"></div>
            <button class="user-dropdown-item" id="logoutBtn">退出登录</button>
          </div>''',
        verify_group + '\n            ' + logout_footer + '\n          </div>'
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Fixed {fname}')
