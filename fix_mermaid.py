"""Sanitize mermaid blocks inside product-design index.html v2."""
import re, os
PATH = '/workspace/docs/product-design/index.html'

F2H = str.maketrans({
    '：': ':',  '，': ',',  '。': '.',  '；': ';',  '！': '!',  '？': '?',
    '（': '(',  '）': ')',  '【': '[',  '】': ']',  '“': '"',  '”': '"',
    '·': '-',  '×': 'x',  '—': '-',  '–': '-',  '−': '-',  '─': '-',
    '→': '->', '←': '<-', '↔': '<->', '≥': '>=', '≤': '<=',
    '①': '(1)', '②': '(2)', '③': '(3)', '④': '(4)', '⑤': '(5)',
    '⑥': '(6)', '⑦': '(7)', '⑧': '(8)', '⑨': '(9)', '⑩': '(10)',
    '✅': 'OK', '❌': 'NO',
    '　': ' ',
})

def clean(s):
    s = s.replace('&nbsp;', ' ').replace('&amp;', '&')
    s = s.translate(F2H)
    s = ''.join(ch for ch in s if ord(ch) <= 0xFFFF)
    parts = [ln.strip() for ln in s.splitlines()]
    s = '<br/>'.join([p for p in parts if p])
    s = re.sub(r'[ \t]{2,}', ' ', s)
    return s.strip()

def qescape(s):
    s = s.replace('\\', '\\\\')
    s = s.replace('"', '\\"')
    return '"' + s + '"'

def fix_edge_labels(line):
    def rep_bar(m):
        return '-->' + '|' + qescape(clean(m.group(1))) + '|'
    line = re.sub(r'-->\|([^|]+)\|', rep_bar, line)
    def rep_q(m):
        return '-- ' + qescape(clean(m.group(1))) + ' -->'
    line = re.sub(r'--\s*"([^"]+)"\s*-->', rep_q, line)
    def rep_plain(m):
        return '-- ' + qescape(clean(m.group(1))) + ' -->'
    line = re.sub(r'--\s+([^-"<][^-]*?)\s+-->', rep_plain, line)
    return line

NODE_PATTERNS = [
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(\[\[)(.*?)(\]\])', re.S)),
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(\(\()(.*?)(\)\))', re.S)),
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(\[\()(.*?)(\)\])', re.S)),
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(\[)(.*?)(\])', re.S)),
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(\()(.*?)(\))', re.S)),
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(\{)(.*?)(\})', re.S)),
    (re.compile(r'([A-Za-z_][A-Za-z0-9_]{1,39})(>)(.*?)(\])', re.S)),
]

def fix_nodes(line):
    for pat in NODE_PATTERNS:
        def repl(m):
            nid, op, body, cl = m.group(1), m.group(2), m.group(3), m.group(4)
            # If body already wrapped by a single pair of double quotes at both ends: strip once first, then re-escape and re-wrap.
            # This avoids the double wrapping seen in BC["\"text\""] after a second run.
            if body.startswith('"') and body.endswith('"') and len(body) >= 2:
                # strip one layer and unescape
                body_inner = body[1:-1]
                body_inner = body_inner.replace('\\"', '"').replace('\\\\', '\\')
                body = body_inner
            new_body = qescape(clean(body)) if body else ''
            return nid + op + new_body + cl
        line = pat.sub(repl, line)
    return line

STYLE_RE = re.compile(r'^\s*style\s+[A-Za-z_][A-Za-z0-9_]{0,40}\s*:', re.I)
DIR_RE = re.compile(r'^\s*(flowchart|graph|sequenceDiagram|erDiagram|gantt|pie|journey|classDiagram|stateDiagram|stateDiagram-v2|gitGraph)\b', re.I)

def fix_block(src):
    out = []
    for raw in src.splitlines():
        line = raw
        if not line.strip():
            out.append('')
            continue
        if line.lstrip().startswith('%%'):
            out.append(line); continue
        if STYLE_RE.match(line):
            out.append(line); continue
        if DIR_RE.match(line):
            out.append(line); continue
        lead = line.lstrip()
        if any(lead.startswith(x) for x in ['subgraph','end','direction','classDef','click ','linkStyle','note ','class ']):
            out.append(line); continue
        # Run fix_nodes TWICE to handle ID<ID2> on same line? No, just fix all nodes multiple times until stable.
        prev = None
        cur = line
        for _attempt in range(6):
            if cur == prev:
                break
            prev = cur
            cur = fix_nodes(cur)
        line = cur
        line = fix_edge_labels(line)
        out.append(line)
    return '\n'.join(out).strip() + '\n'

html = open(PATH,'r',encoding='utf-8').read()
pat = re.compile(r'<pre class="mermaid">(.*?)</pre>', re.S)
cnt = [0]
def apply(m):
    cnt[0] += 1
    # dump block to a separate temp string for per-character inspection (strip preamble)
    src = m.group(1)
    # run fix
    return '<pre class="mermaid">\n' + fix_block(src) + '</pre>'
new_html = pat.sub(apply, html)
open(PATH,'w',encoding='utf-8').write(new_html)
print('blocks processed:', cnt[0])

# Second pass check: actually grep IN-block chars only (avoid HTML outside <pre>)
blocks2 = re.findall(r'<pre class="mermaid">(.*?)</pre>', new_html, re.S)
bad_total = 0
for i, b in enumerate(blocks2, 1):
    issues = []
    for tok, name in [
        ('（','FWL'),('）','FWR'),('：','FCOL'),('，','FCOM'),
        ('①','C1'),('②','C2'),('③','C3'),('·','MID'),('&nbsp;','NBSP'),
        ('✅','EMO1'),('❌','EMO2'),
    ]:
        if tok in b:
            issues.append(f'{name}:{b.count(tok)}')
    multi = len(re.findall(r'[\[({][^\[\]\(\)\{\}]*\n[^\[\]\(\)\{\}]*[\]\)\}]', b))
    if multi:
        issues.append(f'MLN:{multi}')
    if issues:
        bad_total += 1
        print('Block', i, issues)
print('still bad:', bad_total)
