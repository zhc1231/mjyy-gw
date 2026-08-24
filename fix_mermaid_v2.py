import re, html as html_mod
PATH = '/workspace/docs/product-design/index.html'

def norm(s: str) -> str:
    """Normalize a label text to Mermaid-safe string. The result has NO
    embedded newlines and has a single layer of quotes removed. The caller
    wraps it with qwrap() to produce the final double-quoted label."""
    # Decode entities FIRST so we can normalize NBSP / special chars.
    s = html_mod.unescape(s)
    # strip one pair of surrounding double quotes (unescape inner)
    if len(s) >= 2 and s[0] == '"' and s[-1] == '"':
        s = s[1:-1].replace('\\"','"').replace('\\\\','\\')
    # Remove literal newlines / carriage returns by mapping them to whitespace,
    # BEFORE splitting paragraphs.
    s = s.replace('\r', ' ').replace('\n', ' ')
    # normalize all whitespace (including NBSP / ideographic space) to a single space.
    s = re.sub(r'[\s\u00A0\u3000]+', ' ', s)
    # Replace common decorations (preserve Chinese characters)
    repl = [
        ('①','(1)'),('②','(2)'),('③','(3)'),('④','(4)'),('⑤','(5)'),
        ('⑥','(6)'),('⑦','(7)'),('⑧','(8)'),('⑨','(9)'),('⑩','(10)'),
        ('✔','[OK]'),('✖','[NO]'),('✅','[OK]'),('❌','[NO]'),
        ('·','-'),('•','-'),('・','-'),
        ('：',':'),('，',','),('（','('),('）',')'),
        ('【','['),('】',']'),('“','"'),('”','"'),
        ('→','->'),('←','<-'),('↔','<->'),
        ('≥','>='),('≤','<='),('×','x'),('—','-'),('–','-'),('−','-'),
    ]
    for a, b in repl:
        s = s.replace(a, b)
    # If user wants visual line breaks inside a label, they must write "<br/>" explicitly.
    # We also accept "- " at line start style lists and convert the first 8 "- " to <br/>
    # if present (only if the string contains multiple '- ' pattern).
    return s.strip().strip('"').strip()

def qwrap(s: str):
    r"""Return a Mermaid-safe double-quoted label. Escape \ and "."""
    s = s.replace('\\','\\\\').replace('"','\\"')
    return '"' + s + '"'

# Node shapes regex: capture ID, opener(s), body, closer(s).
# Keep order: longer first.
NODE_PATTERNS = [
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(\[\[)(.*?)(\]\])', re.S),
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(\(\()(.*?)(\)\))', re.S),
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(\[\()(.*?)(\)\])', re.S),
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(\[)(.*?)(\])', re.S),
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(\()(.*?)(\))', re.S),
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(\{)(.*?)(\})', re.S),
    re.compile(r'([A-Za-z_][A-Za-z0-9_]{0,39})(>)(.*?)(\])', re.S),
]

def fix_line(line: str) -> str:
    # Edge labels: -->|label|, -- "label" -->, -- label -->
    def rep_bar(m):
        return '-->' + '|' + qwrap(norm(m.group(1))) + '|'
    line = re.sub(r'-->\|([^|]+)\|', rep_bar, line)
    def rep_q(m):
        return '-- ' + qwrap(norm(m.group(1))) + ' -->'
    line = re.sub(r'--\s*"([^"]+)"\s*-->', rep_q, line)
    def rep_plain(m):
        return '-- ' + qwrap(norm(m.group(1))) + ' -->'
    line = re.sub(r'--\s+([^-"<][^-]*?)\s+-->', rep_plain, line)
    # Nodes (run patterns iteratively until stable)
    for pat in NODE_PATTERNS:
        def rp(m):
            nid, op, body, cl = m.group(1), m.group(2), m.group(3), m.group(4)
            return nid + op + qwrap(norm(body)) + cl
        line = pat.sub(rp, line)
    return line

SKIP_PREFIXES = tuple([
    'subgraph','end','direction','classDef','class ','click ','linkStyle','note ','style ',
    'flowchart','graph','sequenceDiagram','erDiagram','gantt','pie','journey','classDiagram',
    'stateDiagram','stateDiagram-v2','gitGraph','%%',
])

def fix_block(src: str) -> str:
    # Pre-process: JOIN any lines that visually form a multi-line node body in the source.
    # Heuristic: lines that start with whitespace and don't look like a statement (no "-->",
    # no ID[ pattern, no style..., no ID{ pattern) get appended to previous line with ' '.
    raw_lines = src.splitlines()
    joined = []
    for l in raw_lines:
        if not l.strip():
            joined.append(l); continue
        lead = l.lstrip()
        looks_like_stmt = bool(
            '-->' in l or '---' in l or '-.->' in l or re.search(r'[A-Za-z_][A-Za-z0-9_]{0,39}\s*[\[\(\{>]', l)
        )
        is_skip = any(lead.startswith(p) for p in SKIP_PREFIXES)
        if (not joined) or is_skip or looks_like_stmt:
            joined.append(l)
        else:
            # append to previous line content with space
            joined[-1] = joined[-1].rstrip() + ' ' + l.strip()
    # Now process line-by-line as before
    out = []
    for raw in joined:
        s = raw
        if not s.strip():
            out.append(''); continue
        lead = s.lstrip()
        if any(lead.startswith(p) for p in SKIP_PREFIXES):
            out.append(s); continue
        prev = None
        cur = s
        for _ in range(6):
            if cur == prev: break
            prev = cur
            cur = fix_line(cur)
        out.append(cur)
    return '\n'.join(out).strip() + '\n'

doc = open(PATH,'r',encoding='utf-8').read()
pat = re.compile(r'<pre class="mermaid">(.*?)</pre>', re.S)
cnt = [0]
def apply(m):
    cnt[0] += 1
    return '<pre class="mermaid">\n' + fix_block(m.group(1)) + '</pre>'
new_doc = pat.sub(apply, doc)
open(PATH,'w',encoding='utf-8').write(new_doc)
print('blocks processed:', cnt[0])

bs = re.findall(r'<pre class="mermaid">(.*?)</pre>', new_doc, re.S)
for i, b in enumerate(bs[:4], 1):
    print(f'==== Block {i} full sample ====')
    for ln, line in enumerate(b.splitlines()[:22], 1):
        print(f'{ln:02d}: {line}')

