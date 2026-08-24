import os

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

    # 在 </body> 之前添加 main.js 引用
    if 'js/main.js' not in content:
        content = content.replace('</body>', '  <script src="js/main.js"></script>\n</body>')
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Added main.js to {fname}')
    else:
        print(f'{fname} already has main.js')