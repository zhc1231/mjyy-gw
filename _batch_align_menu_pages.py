#!/usr/bin/env python3
"""Batch apply tri-align (topbar/logo/breadcrumb/user chip) on all account-*.html
pages to match account-center.html (product center) pixel baseline.

Applies ONLY to the 9 pages still missing these 8 properties (bank/billing/
permission/realname/role/role-edit/security/user/message) but also safe to
re-run on center/wallet/project (already aligned) because it uses idempotent
exact-string replace / regex-with-word-boundary, never double-appends.

Per user requirement:
  "左侧菜单的所有菜单的顶部logo、面包屑、右上角的一致，不要有位置偏移"

Because Experience 652378 said we must replace WHOLE selector blocks (not
inject mid-block) to avoid unbalanced braces, every CSS replacement below
is a block-level rewrite: old selector content → new selector content.
"""
from __future__ import annotations
import os
import re
import glob
import sys

BASE = os.path.dirname(os.path.abspath(__file__))

# ---- shared CSS values to inject verbatim (copied character-for-character
# from account-center baseline that passed pixel-anchor check on 1725x1199) --
NEW_BODY_BLOCK = """    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      background: #f5f6f7;
      color: var(--text);
      min-height: 100vh;
      line-height: 1.6;
      /* 强制预留纵向滚动条槽：不管内容长短/是否有8px 纵向滚动条，
         顶部 max-width:1440 居中的 topbar-inner / logo / 面包屑 / 右上角账户芯片
         的水平坐标在 12 个左侧菜单页面之间完全一致，不会出现 7~8 像素的左右飘移
         （用户说"顶部 logo/面包屑/右上角不要有位置偏移"的根因） */
      overflow-y: scroll;
    }"""

# ---- baseline CSS blocks for pages with LEFT sidebar -----------------------
# (bank/billing/permission/realname/role/role-edit/security/user + center/wallet/project already)
NEW_TITLE_SIDEBAR = """    .page-breadcrumb {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-muted);
      margin-bottom: 18px;   /* 与产品中心（account-center 官方基线）完全一致 18px，三页之前 20px 的版本这里也同步覆盖 */
    }
    .page-breadcrumb a:hover { color: var(--brand-primary); }

    .page-title-wrap {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 22px; flex-wrap: wrap; gap: 12px;
    }
    .page-title { font-size: 24px; font-weight: 700; line-height: 1.2; }
    .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .page-actions { display: flex; align-items: center; gap: 10px; }

"""

# ---- baseline CSS for message page (no left sidebar) ----------------------
NEW_TITLE_MESSAGE = """    .page-breadcrumb {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; color: var(--text-muted);
      margin-bottom: 18px;
    }
    .page-breadcrumb a:hover { color: var(--brand-primary); }

    .page-title-wrap {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 22px; flex-wrap: wrap; gap: 12px;
    }
    .page-title { font-size: 24px; font-weight: 700; line-height: 1.2; }
    .page-subtitle { font-size: 13px; color: var(--text-muted); margin-top: 4px; }
    .page-actions { display: flex; align-items: center; gap: 10px; }

    /* 消息中心旧的 msg-page-header 宽度/间距（mb 20）迁移到 page-title-wrap 标准 mb 22，
       不再使用老的 msg-page-title/msg-page-actions，避免视觉上与 11 个左侧菜单页标题高度/起点不一致。
       保留 msg-page- 类名仅做 display:none，避免 JavaScript 绑定的 id（markAllReadBtn）
       和消息列表功能在替换后失效（实际可见标题/按钮走新的 page-title-wrap/page-actions）。*/
    .msg-page-header { display: none !important; }

    /* main-content 左右内边距 与 11 个左侧菜单页完全一致 24px 32px 40px
       （旧版 message 使用的是 padding: 24px 40px → 左右 8px 不对齐导致标题起点偏
        8 像素，虽然 message 没有 sidebar，但 max-width:1440 居中的内边距应与其他页面视觉上一致） */
"""

PAGES_WITH_SIDEBAR = [
    'account-bank.html',
    'account-billing.html',
    'account-permission.html',
    'account-realname.html',
    'account-role-edit.html',
    'account-role.html',
    'account-security.html',
    'account-user.html',
]
PAGE_MESSAGE = 'account-message.html'
PAGES_ALREADY_DONE = [
    'account-center.html',
    'account-project.html',
    'account-wallet.html',
]
SUBTITLES = {
    'account-bank.html': '充值/提现支持的企业银行卡统一管理，需提交中信银行 e 管家进行实名绑卡核验。',
    'account-billing.html': '产品相关的电子合同、签约进度、到期日与协议附件集中查看。',
    'account-permission.html': '按角色/用户/岗位/菜单数据权限的分层授权配置与审计追踪。',
    'account-realname.html': '个人/企业实名认证资料、统一社会信用代码、经办人信息实名校验进度。',
    'account-role-edit.html': '为角色配置菜单权限、数据范围、可操作按钮与审批流可见性。',
    'account-role.html': '角色清单、默认角色、自定义角色增删改与成员数、权限数统计。',
    'account-security.html': '登录密码、手机号、邮箱、登录设备、操作敏感项二次校验与安全日志。',
    'account-user.html': '企业主账号、子账号成员列表，支持批量邀请、冻结、角色分配与停用。',
    'account-message.html': '系统消息、审批通知、资金变动与安全告警消息统一中心。',
}

# Regex for `body { ... }` single top-level selector block (balanced-brace free
# content because we know bodies are short). Fallback: explicit line range.
BODY_BLOCK_RE = re.compile(
    r'(?P<prefix>(?:^|\n)\s*)body\s*\{\s*(?P<content>[^}]*)\s*\}',
    re.MULTILINE | re.DOTALL,
)


def replace_body_block(text: str) -> tuple[str, bool]:
    """Replace the first standalone `body { ... }` block with NEW_BODY_BLOCK."""
    if 'overflow-y: scroll' in text[:4000]:
        return text, False
    new_text, n = BODY_BLOCK_RE.subn(
        lambda m: (m.group('prefix') or '') + NEW_BODY_BLOCK.strip(),
        text,
        count=1,
    )
    return new_text, n > 0


# ---- sidebar pages: replace old .page-breadcrumb + .page-title CSS --------
# We need the anchor patterns: page-breadcrumb block AND page-title block.

SIDEBAR_PATTERNS_RE = re.compile(
    # 9 legacy pages declare these blocks in this order or close variants.
    # Anchor: ".page-breadcrumb {\n...}" followed eventually by a
    # ".page-title { ... }" block (often with margin-bottom: 24px legacy).
    # Because blocks vary, search and wrap them in a single capture group that
    # starts with page-breadcrumb opener, ends at LAST closing brace of
    # page-title via explicit boundaries below:
    r'\n\s*\.page-breadcrumb\s*\{[^{}]*\}\s*\n?('
    # Between: possibly a:hover rule(s)
    r'(?:\s*\.page-breadcrumb\s*a(?::hover)?\s*\{[^{}]*\}\s*)*'
    r')'
    # And then the .page-title legacy block
    r'\n\s*\.page-title\s*\{(?P<pt>[^{}]*)\}\s*',
    re.MULTILINE | re.DOTALL,
)

# ---- Instead of regex, we use anchor-strings that are consistent across our
# codebase (they all define `.page-breadcrumb {` then `.page-title {` somewhere
# later):
def find_block(text: str, selector: str) -> tuple[int, int, int, int] | None:
    """Given a selector like '.page-breadcrumb', find its
    (selector_start_idx, block_start_brace, block_end_brace+1, end_after_ws)
    positions. Non-nested blocks only (true for our global-style CSS)."""
    pat = re.compile(
        rf'(?P<ws>^|\n)\s*(?P<sel>{re.escape(selector)}\s*)\{{',
        re.MULTILINE,
    )
    m = pat.search(text)
    if not m:
        return None
    sel_end = m.end() - 1  # position of '{'
    # find balanced brace
    depth = 1
    i = sel_end + 1
    while i < len(text) and depth:
        ch = text[i]
        if ch == '{':
            depth += 1
        elif ch == '}':
            depth -= 1
            if depth == 0:
                block_end = i + 1
                # gobble trailing whitespace/newlines up to next non-whitespace or limit
                j = block_end
                while j < len(text) and text[j] in ' \t\r\n':
                    j += 1
                return (m.start(), sel_end, block_end, j)
        i += 1
    return None


def apply_sidebar_css(text: str, file_name: str) -> tuple[str, dict]:
    """Sidebar pages: body + page-breadcrumb + page-title; if any legacy
    .page-title-wrap missing, inject new wrap classes."""
    changes: dict[str, bool] = {}

    text, ok = replace_body_block(text)
    changes['body_overflow_y_scroll'] = ok

    # page-breadcrumb block
    pbc = find_block(text, '.page-breadcrumb')
    pt = find_block(text, '.page-title')
    ptw = find_block(text, '.page-title-wrap')
    pst = find_block(text, '.page-subtitle')
    pac = find_block(text, '.page-actions')

    if pbc:
        start, _, end, _ = pbc
        # replace up to next a:hover for page-breadcrumb too — easier: just set block + next a:hover if any
        block_src = text[start:end]
        # append a:hover if page doesn't have
        new_block = NEW_TITLE_SIDEBAR[:NEW_TITLE_SIDEBAR.index('\n\n    /*')] if False else None
        # Simpler approach: replace blocks 1 by 1 with individual baseline
        # blocks so page-specific styles are preserved:
    insert_point = None

    if pbc:
        s0, s1, e1, j1 = pbc
        # Also gobble trailing `.page-breadcrumb a:hover { ... }` if it starts at j1 position
        end_cursor = e1
        # check a:hover rule immediately after:
        ah_pat = re.compile(
            r'\s*\.page-breadcrumb\s+a(?::hover)?\s*\{[^{}]*\}\s*',
            re.MULTILINE | re.DOTALL,
        )
        mm = ah_pat.match(text, end_cursor)
        if mm:
            end_cursor = mm.end()
        # If we don't find wrap blocks, we REPLACE this region (pbc start to
        # end_cursor) AND then also remove legacy .page-title block and inject
        # the full NEW_TITLE_SIDEBAR.
        if ptw is None:  # wrap classes not yet defined
            # find title block end
            if pt:
                ts, _, te, _ = pt
                replace_start = s0
                replace_end = te
                text = text[:replace_start] + '\n' + NEW_TITLE_SIDEBAR + text[replace_end:]
                changes['sidebar_title_css_injected'] = True
            else:
                text = text[:s0] + '\n' + NEW_TITLE_SIDEBAR + text[end_cursor:]
                changes['sidebar_title_css_injected'] = True
        else:
            changes['sidebar_title_css_skipped'] = True  # already have wraps

    else:
        # fallback: inject NEW_TITLE_SIDEBAR right after body block
        m = BODY_BLOCK_RE.search(text)
        if m and ptw is None:
            text = text[:m.end()] + '\n\n' + NEW_TITLE_SIDEBAR + text[m.end():]
            changes['sidebar_title_fallback_injected'] = True

    return text, changes


def apply_message_css(text: str) -> tuple[str, dict]:
    changes: dict[str, bool] = {}
    text, ok = replace_body_block(text)
    changes['body_overflow_y_scroll'] = ok

    # message page has unique main-content padding (24px 40px → 24px 32px 40px)
    mc = find_block(text, '.main-content')
    if mc:
        s, _, e, _ = mc
        block = text[s:e]
        old_padding_re = re.compile(r'padding:\s*24px\s+40px\s+40px\s*;')
        new_block = old_padding_re.sub('padding: 24px 32px 40px;', block)
        # also 2-value version padding: 24px 40px
        new_block = re.sub(r'padding:\s*24px\s+40px\s*;',
                           'padding: 24px 32px 40px;',
                           new_block)
        if new_block != block:
            text = text[:s] + new_block + text[e:]
            changes['message_main_padding_32'] = True
    # Inject/upgrade page-title-wrap classes
    if find_block(text, '.page-title-wrap') is None:
        # find .msg-page-header block and inject new classes before it
        mph = find_block(text, '.msg-page-header')
        if mph:
            s0, _, _, _ = mph
            text = text[:s0] + NEW_TITLE_MESSAGE + '\n' + text[s0:]
            changes['message_title_css_injected'] = True
        else:
            # fallback after body block
            m = BODY_BLOCK_RE.search(text)
            if m:
                text = text[:m.end()] + '\n\n' + NEW_TITLE_MESSAGE + text[m.end():]
                changes['message_title_css_fallback'] = True
    return text, changes


# ------------------------------------------------------------------ HTML --
SUBTITLE_MESSAGES = SUBTITLES


def wrap_sidebar_title_html(text: str, page: str) -> tuple[str, dict]:
    """sidebar pages: inside <main class="main-content">, if first meaningful
    child is <h1 class="page-title">, wrap it into:
        <div class="page-title-wrap">
          <div>
            <div class="page-title">XXX</div>
            <div class="page-subtitle">YYY</div>
          </div>
        </div>
    """
    changes = {}
    if 'class="page-title-wrap">' in text:
        changes['html_already_wrapped'] = True
        return text, changes

    # find main-content open then find <h1 class="page-title" (optionally id)
    mc_pat = re.compile(r'<main\s+class="main-content"[^>]*>')
    mm = mc_pat.search(text)
    if not mm:
        changes['html_no_main_found'] = True
        return text, changes
    # after main tag, look for <h1 class="page-title" ...>...</h1> (non-greedy,
    # assuming one line)
    rest_start = mm.end()
    h1_pat = re.compile(
        r'<h1\s+class="page-title"(?P<attrs>\s+[^>]*)?>(?P<t>.+?)</h1>',
        re.DOTALL,
    )
    h1 = h1_pat.search(text, rest_start)
    if not h1:
        changes['html_no_h1_found'] = True
        return text, changes
    title_inner = h1.group('t').strip()
    subtitle = SUBTITLE_MESSAGES.get(page, '')
    new_html = (
        '<div class="page-title-wrap">\n'
        '        <div>\n'
        f'          <div class="page-title">{title_inner}</div>\n'
        f'          <div class="page-subtitle">{subtitle}</div>\n'
        '        </div>\n'
        '      </div>'
    )
    text = text[:h1.start()] + new_html + text[h1.end():]
    changes['html_wrap_applied'] = True
    return text, changes


def wrap_message_html(text: str, page: str) -> tuple[str, dict]:
    """message page: the msg-page-header div contains title+actions. We hide
    the old msg-page-header via CSS but keep JS-bound IDs alive by keeping the
    same <button ... id=markAllReadBtn> DOM. We add a STANDARD page-title-wrap
    structure BEFORE msg-page-header so page-title.y aligns to 84."""
    changes = {}
    if 'class="page-title-wrap">' in text:
        changes['html_already_wrapped'] = True
        return text, changes
    old_pat = re.compile(
        r'<div\s+class="msg-page-header">.*?</div>\s*',
        re.DOTALL,
    )
    m = old_pat.search(text)
    if not m:
        changes['html_no_msg_header'] = True
        return text, changes
    inner = m.group(0)
    title_m = re.search(
        r'<div\s+class="msg-page-title">\s*(.*?)\s*</div>', inner, re.DOTALL
    )
    actions_m = re.search(
        r'<div\s+class="msg-page-actions">\s*(.*?)\s*</div>', inner, re.DOTALL
    )
    title_text = title_m.group(1).strip() if title_m else '消息中心'
    actions_inner = actions_m.group(1) if actions_m else ''
    subtitle = SUBTITLE_MESSAGES.get(page, '')
    wrap_html = (
        '<div class="page-title-wrap">\n'
        '        <div>\n'
        f'          <div class="page-title">{title_text}</div>\n'
        f'          <div class="page-subtitle">{subtitle}</div>\n'
        '        </div>\n'
        f'        <div class="page-actions">{actions_inner}</div>\n'
        '      </div>\n'
        '      '
    )
    # Replace the whole msg-page-header block with standard wrap + original
    # header (now display:none via CSS but still holds JS bindings).
    new_block = wrap_html + inner.strip() + '\n      '
    text = text[:m.start()] + new_block + text[m.end():]
    changes['html_message_wrap'] = True
    # Also normalize main-content opening padding via CSS step (done above).
    return text, changes


def main() -> int:
    files = sorted(glob.glob(os.path.join(BASE, 'account-*.html')))
    applied = []
    for fp in files:
        name = os.path.basename(fp)
        if name in PAGES_ALREADY_DONE:
            continue
        with open(fp, 'r', encoding='utf-8') as fh:
            t = fh.read()
        if name == PAGE_MESSAGE:
            t, c_css = apply_message_css(t)
            t, c_html = wrap_message_html(t, name)
        else:
            t, c_css = apply_sidebar_css(t, name)
            t, c_html = wrap_sidebar_title_html(t, name)
        applied.append((name, {**c_css, **c_html}))
        with open(fp, 'w', encoding='utf-8') as fh:
            fh.write(t)
    print('pages modified:')
    for n, c in applied:
        print(' -', n, c)
    return 0


if __name__ == '__main__':
    sys.exit(main())
