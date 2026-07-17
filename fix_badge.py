import os, re

files = ['index.html', 'minjiang.html', 'anxinyun.html', 'agent.html']

for fname in files:
    path = os.path.join('/workspace', fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 将公共页面中的 .user-dropdown-info 结构改成和 account-center 一致
    # 原结构：
    # <div class="user-dropdown-info">
    #   <div class="user-dropdown-name" id="dropdownName">...</div>
    #   <div class="user-dropdown-id" id="dropdownId">...</div>
    #   <div class="user-dropdown-tags" id="dropdownTags">
    # 新结构：
    # <div class="user-dropdown-info">
    #   <div style="display:flex;align-items:center;gap:6px;">
    #     <div class="user-dropdown-name" id="dropdownName">...</div>
    #     <span class="user-account-badge" id="dropdownBadge">主账号</span>
    #   </div>
    #   <div class="user-dropdown-id" id="dropdownId">...</div>
    #   <div class="user-dropdown-tags" id="dropdownTags">

    content = re.sub(
        r'(<div class="user-dropdown-info">)\s*<div class="user-dropdown-name" id="dropdownName">([^<]*)</div>',
        r'\1\n                <div style="display:flex;align-items:center;gap:6px;">\n                  <div class="user-dropdown-name" id="dropdownName">\2</div>\n                  <span class="user-account-badge" id="dropdownBadge">主账号</span>\n                </div>',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Fixed {fname}')
