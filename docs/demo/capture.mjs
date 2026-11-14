// docs/demo/capture.mjs — generates the screenshots in docs/img from the fake-data demo (docs/demo/index.html), with headless Chrome.
// Usage: node build.mjs && node docs/demo/capture.mjs        (set CHROME=/path/to/chrome if it is not found)
import { spawn } from 'node:child_process';
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
// card galleries (dark default theme)
const SCENES = [['buttons', 472], ['chips', 512], ['controls', 472], ['controls-more', 472], ['radio', 472], ['remote', 372], ['flow', 512], ['battery', 472], ['graph', 512], ['weather', 512], ['weather-rain', 512], ['people', 472], ['layout', 472]];
for (const [s, w] of SCENES) await shot(s + '.png', `scene=${s}&lang=en`, w);
await shot('radio-ro.png', 'scene=radio&lang=ro', 472);
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
