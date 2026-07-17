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

    # 1. 删除 HTML 中 enterSystemBtn 的 <a> 标签及其前后紧邻的空白/换行
    # 匹配模式：前面可能有换行和缩进，然后是 <a ... id="enterSystemBtn">...</a>，后面跟换行
    content = re.sub(
        r'\n\s*<a href="#" class="user-dropdown-item user-dropdown-item-primary" id="enterSystemBtn">\s*<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2"/><path d="M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/></svg>\s*进入系统\s*</a>',
        '',
        content
    )

    # 2. 删除 JS 中 enterSystemBtn 的事件监听
    # 匹配 document.getElementById('enterSystemBtn').addEventListener(...)
    content = re.sub(
        r"\n\s*document\.getElementById\('enterSystemBtn'\)\.addEventListener\('click',\s*function\(e\)\s*\{\s*e\.preventDefault\(\);\s*var\s+fromPlatform\s*=\s*localStorage\.getItem\('mjyy_from_platform'\)\s*\|\|\s*'minjiang';\s*if\s*\(fromPlatform\s*===\s*'anxinyun'\)\s*window\.location\.href\s*=\s*'anxinyun\.html';\s*else\s*if\s*\(fromPlatform\s*===\s*'agent'\)\s*window\.location\.href\s*=\s*'agent\.html';\s*else\s*window\.location\.href\s*=\s*'minjiang\.html';\s*\}\);",
        '',
        content
    )

    # account-wallet.html 的写法略有不同，使用 var enterSystemBtn = ...
    content = re.sub(
        r"\n\s*var\s+enterSystemBtn\s*=\s*document\.getElementById\('enterSystemBtn'\);\s*if\s*\(enterSystemBtn\)\s*\{\s*enterSystemBtn\.addEventListener\('click',\s*function\(e\)\s*\{\s*e\.preventDefault\(\);\s*var\s+fromPlatform\s*=\s*localStorage\.getItem\('mjyy_from_platform'\)\s*\|\|\s*'minjiang';\s*if\s*\(fromPlatform\s*===\s*'anxinyun'\)\s*window\.location\.href\s*=\s*'anxinyun\.html';\s*else\s*if\s*\(fromPlatform\s*===\s*'agent'\)\s*window\.location\.href\s*=\s*'agent\.html';\s*else\s*window\.location\.href\s*=\s*'minjiang\.html';\s*\}\);\s*\}",
        '',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Fixed {fname}')
