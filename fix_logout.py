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

    # 修改 logoutBtn 的点击事件，添加 confirm
    content = re.sub(
        r"document\.getElementById\('logoutBtn'\)\.addEventListener\('click',\s*function\(\)\s*\{\s*localStorage\.clear\(\);\s*window\.location\.href\s*=\s*'login\.html';\s*\}\);",
        "document.getElementById('logoutBtn').addEventListener('click', function() {\n        if (confirm('确定要退出登录吗？')) {\n          localStorage.clear();\n          window.location.href = 'login.html';\n        }\n      });",
        content
    )

    # account-wallet.html 的写法略有不同
    content = re.sub(
        r"logoutBtn\.addEventListener\('click',\s*function\(\)\s*\{\s*localStorage\.clear\(\);\s*window\.location\.href\s*=\s*'login\.html';\s*\}\);",
        "logoutBtn.addEventListener('click', function() {\n          if (confirm('确定要退出登录吗？')) {\n            localStorage.clear();\n            window.location.href = 'login.html';\n          }\n        });",
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Fixed {fname}')