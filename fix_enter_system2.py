import re, os

# 这些页面只包含旧的 enterSystemBtn，删除即可
files = [
    'contact.html',
    'anxinyun-tax.html',
    'minjiang-help.html',
    'anxinyun-scenarios.html',
    'anxinyun-features.html',
    'minjiang-solutions.html',
    'anxinyun-help.html',
    'minjiang-features.html',
    'minjiang-cases.html',
    'contract-sign.html'
]

for fname in files:
    path = os.path.join('/workspace', fname)
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 删除 HTML 中 enterSystemBtn 的 <a> 标签
    content = re.sub(
        r'\n\s*<a href="#" class="user-dropdown-item user-dropdown-item-primary" id="enterSystemBtn">\s*<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2"/><path d="M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/></svg>\s*进入系统\s*</a>',
        '',
        content
    )

    # contract-sign.html 使用的是 topbar-dropdown-item
    content = re.sub(
        r'\n\s*<a href="#" class="topbar-dropdown-item topbar-dropdown-item-primary" id="enterSystemBtn">\s*<svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14" stroke="currentColor" stroke-width="2"/><path d="M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/></svg>\s*进入系统\s*</a>',
        '',
        content
    )

    # 删除 JS 中 enterSystemBtn 的事件监听（contract-sign.html）
    content = re.sub(
        r"\n\s*document\.getElementById\('enterSystemBtn'\)\.addEventListener\('click',\s*function\(e\)\s*\{\s*e\.preventDefault\(\);\s*var\s+fromPlatform\s*=\s*localStorage\.getItem\('mjyy_from_platform'\)\s*\|\|\s*'minjiang';\s*if\s*\(fromPlatform\s*===\s*'anxinyun'\)\s*window\.location\.href\s*=\s*'anxinyun\.html';\s*else\s*if\s*\(fromPlatform\s*===\s*'agent'\)\s*window\.location\.href\s*=\s*'agent\.html';\s*else\s*window\.location\.href\s*=\s*'minjiang\.html';\s*\}\);",
        '',
        content
    )

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'Fixed {fname}')
