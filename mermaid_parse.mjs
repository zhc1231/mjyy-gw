// mermaid_parse.mjs — use ESM import to match modern mermaid packages.
import mermaid from 'mermaid';
import fs from 'node:fs';
const src = fs.readFileSync(process.argv[2], 'utf-8').trim();
mermaid.initialize({ startOnLoad: false, securityLevel: 'loose', flowchart: { htmlLabels: true } });
try {
  const id = 'mm' + Math.random().toString(36).slice(2, 8);
  const { svg } = await mermaid.render(id, src);
  console.log('OK svg bytes=', svg.length);
} catch (e) {
  console.error('ERR', String(e && e.message || e).slice(0, 1200));
  process.exit(1);
}
