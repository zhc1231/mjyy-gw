import re, os

files = [
    'account-permission.html',
    'account-security.html',
    'account-wallet.html',
    'account-billing.html',
    'account-realname.html'
]

for fname in files:
    path = os.path.join('/workspace', fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 移除 account-permission, account-security, account-billing, account-realname 的内联绑定
    content = re.sub(
        r"\n      document\.getElementById\('logoutBtn'\)\.addEventListener\('click',\s*function\(\)\s*\{\s*if\s*\(confirm\('确定要退出登录吗？'\)\)\s*\{\s*localStorage\.clear\(\);\s*window\.location\.href\s*=\s*'login\.html';\s*\}\s*\}\);",
        '',
        content
    )

    # 移除 account-wallet 的内联绑定
    content = re.sub(
        r"\n      var logoutBtn = document\.getElementById\('logoutBtn'\);\n      if \(logoutBtn\) \{\n        logoutBtn\.addEventListener\('click',\s*function\(\)\s*\{\s*if\s*\(confirm\('确定要退出登录吗？'\)\)\s*\{\s*localStorage\.clear\(\);\s*window\.location\.href\s*=\s*'login\.html';\s*\}\s*\}\);\n      \}",
        '',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Removed inline logout binding from {fname}')