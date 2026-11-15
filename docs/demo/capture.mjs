// docs/demo/capture.mjs — generates the screenshots in docs/img from the fake-data demo (docs/demo/index.html), with headless Chrome.
// Usage: node build.mjs && node docs/demo/capture.mjs        (set CHROME=/path/to/chrome if it is not found)
import { spawn } from 'node:child_process';
import { crc32 } from 'node:zlib';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', 'img');
mkdirSync(out, { recursive: true });
const CANDIDATES = [process.env.CHROME, 'C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'].filter(Boolean);
const chrome = CANDIDATES.find((p) => existsSync(p));
if (!chrome) throw new Error('Chrome not found: set CHROME=/path/to/chrome');

const PORT = 9333 + Math.floor(Math.random() * 500);
const profile = join(here, '.chrome-profile-' + PORT);
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--allow-file-access-from-files', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page) return new WebSocket(page.webSocketDebuggerUrl);
    } catch (e) { /* not ready yet */ }
    await sleep(250);
  }
  throw new Error('Chrome did not start');
}
const ws = await connect();
await new Promise((r) => ws.addEventListener('open', r));
let id = 0; const pending = new Map();
ws.addEventListener('message', (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } });
const send = (method, params = {}) => new Promise((res, rej) => { const n = ++id; pending.set(n, (d) => (d.error ? rej(new Error(method + ': ' + d.error.message)) : res(d.result))); ws.send(JSON.stringify({ id: n, method, params })); });
const evalJs = async (expression) => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.value;

// ---- animated PNG (APNG): the real CSS animations, stepped frame by frame through the Web Animations API (deterministic, no screen recording) ----
const u32 = (n) => { const b = Buffer.alloc(4); b.writeUInt32BE(n >>> 0); return b; };
const u16 = (n) => { const b = Buffer.alloc(2); b.writeUInt16BE(n); return b; };
const chunk = (type, data) => { const t = Buffer.from(type, 'latin1'); return Buffer.concat([u32(data.length), t, data, u32(crc32(Buffer.concat([t, data])))]); };
function buildApng(pngs, delayMs) {
  const parse = (png) => { const out = []; let o = 8; while (o < png.length) { const len = png.readUInt32BE(o), type = png.toString('latin1', o + 4, o + 8); out.push({ type, data: png.subarray(o + 8, o + 8 + len) }); o += 12 + len; } return out; };
  const frames = pngs.map(parse), ihdr = frames[0].find((c) => c.type === 'IHDR').data, w = ihdr.readUInt32BE(0), h = ihdr.readUInt32BE(4);
  const out = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('acTL', Buffer.concat([u32(pngs.length), u32(0)]))];
  let seq = 0;
  const fctl = () => chunk('fcTL', Buffer.concat([u32(seq++), u32(w), u32(h), u32(0), u32(0), u16(delayMs), u16(1000), Buffer.from([0, 0])]));
  frames.forEach((f, i) => {
    out.push(fctl());
    for (const c of f.filter((x) => x.type === 'IDAT')) out.push(i === 0 ? chunk('IDAT', c.data) : chunk('fdAT', Buffer.concat([u32(seq++), c.data])));
  });
  out.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(out);
}
const allAnims = `(() => { const out = []; const walk = (root) => { out.push(...root.getAnimations()); root.querySelectorAll('*').forEach((e) => { if (e.shadowRoot) walk(e.shadowRoot); }); }; walk(document); return out; })()`;
async function recordApng(file, query, width, seconds, fps) {
  const url = pathToFileURL(join(here, 'index.html')).href + '?' + query;
  await send('Emulation.setDeviceMetricsOverride', { width, height: 700, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  for (let i = 0; i < 40; i++) { if ((await evalJs('document.title')) === 'ready') break; await sleep(150); }
  await sleep(1500);
  const box = await evalJs('(() => { const r = document.getElementById("out").getBoundingClientRect(); return { x: 0, y: 0, width: Math.ceil(r.right + 16), height: Math.ceil(r.bottom + 16) }; })()');
  const count = await evalJs(allAnims + '.length');
  const frames = [], n = Math.round(seconds * fps);
  for (let i = 0; i < n; i++) {
    await evalJs(`${allAnims}.forEach((a) => { a.pause(); a.currentTime = ${Math.round((i * 1000) / fps)}; })`);
    await sleep(40);
    const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { ...box, scale: 1 } });
    frames.push(Buffer.from(data, 'base64'));
  }
  const apng = buildApng(frames, Math.round(1000 / fps));
  writeFileSync(join(out, file), apng);
  console.log('✔', file, `${count} animations, ${n} frames, ${(apng.length / 1024).toFixed(0)} KB`);
}

async function shot(file, query, width) {
  const url = pathToFileURL(join(here, 'index.html')).href + '?' + query;
  await send('Emulation.setDeviceMetricsOverride', { width, height: 900, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url });
  for (let i = 0; i < 40; i++) { if ((await evalJs('document.title')) === 'ready') break; await sleep(150); }
  await sleep(1800);                                   // graphs / forecast load asynchronously; animations settle
  const h = Math.ceil(await evalJs('document.body.scrollHeight'));
  await send('Emulation.setDeviceMetricsOverride', { width, height: h, deviceScaleFactor: 2, mobile: false });
  await sleep(300);
  const { data } = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(out, file), Buffer.from(data, 'base64'));
  console.log('✔', file, width + '×' + h);
}

await send('Page.enable');
// ONLY=motion: docs/img/motion.png — animated PNG comparing motion: full (keeps moving) and motion: calm (a few cycles, then still)
if (process.env.ONLY === 'motion') {
  const url = pathToFileURL(join(here, 'motion.html')).href;
  await send('Emulation.setDeviceMetricsOverride', { width: 960, height: 700, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url });
  for (let i = 0; i < 40; i++) { if ((await evalJs('document.title')) === 'ready') break; await sleep(150); }
  await sleep(1500);
  const box = await evalJs('(() => { const r = document.getElementById("out").getBoundingClientRect(); return { x: 0, y: 0, width: Math.ceil(r.right + 16), height: Math.ceil(r.bottom + 16) }; })()');
  const fps = 5, seconds = 10, frames = [];
  for (let i = 0; i < seconds * fps; i++) {
    await evalJs(`${allAnims}.forEach((a) => { a.pause(); a.currentTime = ${Math.round((i * 1000) / fps)}; })`);
    await sleep(40);
    frames.push(Buffer.from((await send('Page.captureScreenshot', { format: 'png', clip: { ...box, scale: 0.75 } })).data, 'base64'));
  }
  const apng = buildApng(frames, Math.round(1000 / fps));
  writeFileSync(join(out, 'motion.png'), apng);
  console.log('✔ motion.png', frames.length + ' frames', (apng.length / 1024).toFixed(0) + ' KB');
  await send('Browser.close').catch(() => {});
  proc.kill(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  process.exit(0);
}
// ONLY=devices: just the tablet + phone mock-up (docs/img/devices.png)
if (process.env.ONLY === 'devices') {
  await send('Emulation.setDeviceMetricsOverride', { width: 1800, height: 1000, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(join(here, 'devices.html')).href });
  for (let i = 0; i < 40; i++) { if ((await evalJs('document.title')) === 'ready') break; await sleep(150); }
  await sleep(2200);
  const box = await evalJs('(() => { const r = document.body.getBoundingClientRect(); return { x: 0, y: 0, width: Math.ceil(document.getElementById("out").getBoundingClientRect().right + 64), height: Math.ceil(r.height) }; })()');
  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { ...box, scale: 1 } });
  writeFileSync(join(out, 'devices.png'), Buffer.from(data, 'base64'));
  console.log('✔ devices.png', box.width + '×' + box.height);
  await send('Browser.close').catch(() => {});
  proc.kill(); await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
  process.exit(0);
}
// card galleries (dark default theme)
const SCENES = [['buttons', 472], ['chips', 512], ['controls', 472], ['controls-more', 472], ['radio', 472], ['remote', 372], ['flow', 512], ['battery', 472], ['graph', 512], ['weather', 512], ['weather-rain', 512], ['people', 472], ['vehicles', 472], ['hero', 512], ['nav', 552], ['layout', 472]];
for (const [s, w] of SCENES) await shot(s + '.png', `scene=${s}&lang=en`, w);
await shot('radio-ro.png', 'scene=radio&lang=ro', 472);
await recordApng('animated-icons.png', 'scene=animated&lang=en', 472, 3.6, 10);
// themes: all six side by side, plus the light theme on a card
await shot('themes.png', 'scene=themes&lang=en&w=1320', 1352);
for (const p of ['green', 'calm', 'contrast', 'mono', 'warm', 'light']) await shot(`theme-${p}.png`, `scene=buttons&preset=${p}&lang=en`, 472);


// color palette: docs/img/palette.png + docs/COLORS.md, generated from src/presets.mjs so they never drift
const { PRESETS } = await import(pathToFileURL(join(here, '..', '..', 'src', 'presets.mjs')).href);
const ROLES = [['bg', 'background'], ['text', 'text'], ['muted', 'secondary text'], ['accent', 'information'], ['on', 'active'], ['alert', 'attention'], ['ok', 'ok'], ['cool', 'A/C cooling'], ['heat', 'A/C heating'], ['series', 'graph line']];
const luma = (hex) => { const n = parseInt(hex.slice(1, 7), 16); return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
const rows = Object.entries(PRESETS).map(([name, p]) => `<section style="background:${p.bg};color:${p.text}"><h3>${name}</h3><div class="sw">${ROLES.map(([k, label]) => `<div><i style="background:${p[k]};border-color:${luma(p[k]) > 0.5 ? '#0003' : '#fff3'}"></i><b>${k}</b><small>${label}</small><code>${p[k]}</code></div>`).join('')}</div></section>`).join('');
const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#0a0d12;font-family:system-ui,sans-serif;display:grid;gap:12px;width:968px}section{border-radius:18px;padding:16px 18px}h3{margin:0 0 12px;font:700 13px/1 system-ui;letter-spacing:.1em;text-transform:uppercase;opacity:.8}.sw{display:grid;grid-template-columns:repeat(10,1fr);gap:10px}.sw div{display:grid;gap:3px;justify-items:start}i{width:100%;aspect-ratio:1.5;border-radius:12px;border:1px solid;box-sizing:border-box}b{font-size:12px;margin-top:4px}small{font-size:10.5px;opacity:.65}code{font-size:10.5px;opacity:.85}</style>${rows}<script>document.title='ready'</script>`;
const tmp = join(here, '.palette.html');
writeFileSync(tmp, html);
await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: 900, deviceScaleFactor: 2, mobile: false });
await send('Page.navigate', { url: pathToFileURL(tmp).href });
await sleep(800);
const ph = Math.ceil(await evalJs('document.body.scrollHeight'));
await send('Emulation.setDeviceMetricsOverride', { width: 1000, height: ph, deviceScaleFactor: 2, mobile: false });
await sleep(200);
writeFileSync(join(out, 'palette.png'), Buffer.from((await send('Page.captureScreenshot', { format: 'png' })).data, 'base64'));
rmSync(tmp, { force: true });
console.log('✔ palette.png');
const md = ['# Colors', '', 'Every card accepts `preset:` (`' + Object.keys(PRESETS).join('`, `') + '`) and `colors:` to override any role (see the README).', '',
  '![Palette](img/palette.png)', '', '| Role | ' + Object.keys(PRESETS).join(' | ') + ' |', '|---|' + Object.keys(PRESETS).map(() => '---').join('|') + '|',
  ...ROLES.map(([k, label]) => `| \`${k}\` — ${label} | ` + Object.values(PRESETS).map((p) => `\`${p[k]}\``).join(' | ') + ' |'), '',
  'Valid values for `colors:` are `#hex`, `rgb()`, `hsl()` and `var(--…)`; anything else is ignored with a warning on the card.', ''].join('\n');
writeFileSync(join(here, '..', 'COLORS.md'), md);
console.log('✔ COLORS.md');

await send('Browser.close').catch(() => {});
proc.kill();
await sleep(500);
try { rmSync(profile, { recursive: true, force: true }); } catch (e) { /* ignore */ }
