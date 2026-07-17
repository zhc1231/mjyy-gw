import os

files = [
    'account-billing.html',
    'account-permission.html',
    'account-security.html',
    'account-wallet.html'
]

old_text = '''            <li><a href="account-realname.html" class="sidebar-link">个人实名信息</a></li>
            <li><a href="account-realname.html" class="sidebar-link">企业实名信息</a></li>'''

new_text = '''            <li><a href="account-realname.html?type=personal" class="sidebar-link">个人实名信息</a></li>
            <li><a href="account-realname.html?type=enterprise" class="sidebar-link">企业实名信息</a></li>'''

for fname in files:
    path = os.path.join('/workspace', fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_text in content:
        content = content.replace(old_text, new_text)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed sidebar links in {fname}')
    else:
        print(f'Pattern not found in {fname}')