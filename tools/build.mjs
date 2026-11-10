// Build the peerloom.tech page from the design canvas's .dc.html: holes, <sc-for> and onClick are filled by a
// small stand-in for the canvas runtime, and /_blob/ assets point at files in assets/ beside the page.
// Usage: node tools/build.mjs source/Main.dc.html index.html
import { readFileSync, writeFileSync } from 'node:fs';

const [srcPath, outPath] = process.argv.slice(2);
const src = readFileSync(srcPath, 'utf8');
const BLOBS = {
  '/_blob/78af638265f7676ee638f79302141907': 'assets/peerloom-mark.svg',
  '/_blob/12f0f9ab446ea34894acfa58962dabec': 'assets/peerloom-demo.mp4',
  '/_blob/fe598af7d40acc11875d07f5f3e265c1': 'assets/peerloom-demo-poster.jpg'
};
const swap = s => Object.entries(BLOBS).reduce((acc, [k, v]) => acc.replaceAll(k, v), s);

const helmet = swap(src.split('<helmet>')[1].split('</helmet>')[0]);
const tpl = swap(src.split('</helmet>')[1].split('</x-dc>')[0]);
const cls = src.split('data-dc-script')[1].split('>').slice(1).join('>').split('</script>')[0];
const left = Object.values(BLOBS).length && (tpl + helmet).match(/\/_blob\/[0-9a-f]{32}/g);
if (left) throw new Error('Unmapped assets: ' + [...new Set(left)].join(', '));

const out = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Peerloom — Let your agents think together</title>
<meta name="description" content="Peerloom puts your coding agents in one room on your machine. They message each other, split the work and review each other's changes. You lead.">
<meta name="theme-color" content="#0E0A15">
<link rel="canonical" href="https://peerloom.tech/">
<link rel="icon" href="assets/peerloom-mark.svg" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:url" content="https://peerloom.tech/">
<meta property="og:site_name" content="Peerloom">
<meta property="og:title" content="Peerloom — Let your agents think together">
<meta property="og:description" content="Give your AI agents a groupchat. Claude Code, Codex, Cursor and DeepSeek Harness in one room on your machine. You lead.">
<meta property="og:image" content="https://peerloom.tech/assets/og.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="The Peerloom mark above the words: Give your AI agents a groupchat.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="Peerloom — Let your agents think together">
<meta name="twitter:description" content="Give your AI agents a groupchat. Your agents. Your subscriptions. Your machine. Open source.">
<meta name="twitter:image" content="https://peerloom.tech/assets/og.jpg">
${helmet}
</head>
<body>
<div id="app"></div>
<script>
// Stand-in for the design canvas runtime (preview only). ?beat=bump|laptops|weave|finale freezes the scene.
const TPL = ${JSON.stringify(tpl)};
const qs = new URLSearchParams(location.search);
class DCLogic { constructor(props) { this.props = props || {}; this.state = {}; } setState(o) { Object.assign(this.state, typeof o === 'function' ? o(this.state) : o); scheduleRender(); } }
${cls}
const lookup = (o, path) => path.split('.').reduce((v, k) => (v == null ? undefined : v[k]), o);
const esc = v => String(v ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
let handlers = [];
function fill(s, scope) {
  return s.replace(/on([A-Z]\\w*)="\\{\\{\\s*([\\w.]+)\\s*\\}\\}"/g, (_, ev, p) => { const id = handlers.push(lookup(scope, p)) - 1; return 'data-on-' + ev.toLowerCase() + '="' + id + '"'; })
          .replace(/\\{\\{\\s*([\\w.]+)\\s*\\}\\}/g, (_, p) => esc(lookup(scope, p)));
}
function expand(vals) {
  handlers = [];
  const t = TPL.replace(/<sc-for list="\\{\\{\\s*([\\w.]+)\\s*\\}\\}" as="(\\w+)"[^>]*>([\\s\\S]*?)<\\/sc-for>/g, (_, list, as, inner) => (lookup(vals, list) || []).map(item => fill(inner, { ...vals, [as]: item })).join(''));
  return fill(t, vals);
}
function patch(a, b) {
  if (a.nodeType === 3) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  if (a.nodeType !== 1) return;
  for (const at of b.attributes) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name) && at.name !== 'playsinline' && at.name !== 'open') a.removeAttribute(at.name);
  const ac = a.childNodes, bc = b.childNodes;
  if (ac.length !== bc.length) { a.replaceChildren(...[...bc].map(n => n.cloneNode(true))); return; }
  for (let i = 0; i < ac.length; i++) patch(ac[i], bc[i]);
}
const app = document.getElementById('app');
const comp = new Component({ previewBeat: qs.get('beat') || 'auto' });
let mounted = false, pending = false;
function render() {
  pending = false;
  const html = expand(comp.renderVals());
  if (!mounted) { app.innerHTML = html; mounted = true; comp.componentDidMount && comp.componentDidMount(); return; }
  const t = document.createElement('div'); t.innerHTML = html; patch(app, t);
}
function scheduleRender() { if (!pending && mounted) { pending = true; queueMicrotask(render); } }
app.addEventListener('click', e => { const el = e.target.closest('[data-on-click]'); if (el) handlers[+el.dataset.onClick] && handlers[+el.dataset.onClick](e); });
render();
</script>
</body>
</html>
`;
writeFileSync(outPath, out);
console.log('wrote', outPath, out.length, 'bytes');
