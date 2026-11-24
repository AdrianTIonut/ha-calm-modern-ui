// tests/contrast.test.mjs — contrastul WCAG al presetării quiet-slate (și al stărilor ei). Rulare: node tests/contrast.test.mjs
// Scop: paleta „calmă” nu trebuie stricată pe nesimțite; orice schimbare care coboară contrastul sub prag pică testul.
import { PRESETS } from '../src/presets.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const L = (h) => { const [r, g, b] = hex(h); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
const need = (pairs, min) => { for (const [n, a, b] of pairs) { const r = cr(a, b); if (r < min) return `${n}: ${r.toFixed(2)}:1 < ${min}:1`; } return true; };

const P = PRESETS['quiet-slate'];
const grad = (v) => (v.match(/#[0-9a-f]{6}/gi) || []);   // culorile dintr-un gradient din presetare

t('text principal pe fundal / suprafață / tile ≥ 7:1 (AAA)', () => need([['text/bg', P.text, P.bg], ['text/surface', P.text, P.surface], ['text/surface-2', P.text, P['surface-2']]], 7));
t('text secundar (muted) pe fundal / suprafață / tile ≥ 4,5:1 (AA)', () => need([['muted/bg', P.muted, P.bg], ['muted/surface', P.muted, P.surface], ['muted/surface-2', P.muted, P['surface-2']]], 4.5));
t('accentele (pornit, selectat, atenție, încălzire, răcire, grafic) pe tile ≥ 4,5:1', () => need(['on', 'accent', 'alert', 'heat', 'cool', 'series', 'ok'].map((k) => [k + '/surface-2', P[k], P['surface-2']]), 4.5));
t('accentele pe fundal ≥ 4,5:1', () => need(['on', 'accent', 'alert', 'heat', 'cool', 'series', 'ok'].map((k) => [k + '/bg', P[k], P.bg]), 4.5));
t('textul pe fundalul stării „pornit” (ambele capete) ≥ 7:1', () => need(grad(P['on-bg']).map((c) => ['text/on-bg ' + c, P.text, c]), 7));
t('textul pe fundalul stării „atenție” (ambele capete) ≥ 7:1', () => need(grad(P['alert-bg']).map((c) => ['text/alert-bg ' + c, P.text, c]), 7));
t('textul secundar pe starea „pornit” / „atenție” ≥ 4,5:1', () => need([...grad(P['on-bg']), ...grad(P['alert-bg'])].map((c) => ['muted/' + c, P.muted, c]), 4.5));
t('contururile de stare se văd pe fundal (≥ 1,5:1, nu doar culoare: starea are și iconiță și text)', () => need([['on-line/bg', P['on-line'], P.bg], ['alert-line/bg', P['alert-line'], P.bg]], 1.5));
t('culorile de stare se deosebesc între ele (pornit vs atenție vs selectat, distanță în RGB ≥ 30)', () => {
  const d = (a, b) => Math.hypot(...hex(a).map((v, i) => v - hex(b)[i]));
  for (const [x, y] of [['on', 'alert'], ['on', 'accent'], ['alert', 'accent'], ['alert', 'heat']]) if (d(P[x], P[y]) < 30) return `${x}/${y} prea apropiate: ${d(P[x], P[y]).toFixed(0)}`;
  return true;
});
t('stare „selectat” (meniu / file): text pe ambele capete ale fundalului ≥ 7:1, contur vizibil pe fundal ≥ 3:1', () => need([...grad(P['sel-bg']).map((c) => ['sel-fg/' + c, P['sel-fg'], c]), ['sel-line/bg', P['sel-line'], P.bg]].map((x) => x), 3) === true && need(grad(P['sel-bg']).map((c) => ['sel-fg/' + c, P['sel-fg'], c]), 7));
t('niciun alb pur / negru pur în paleta quiet-slate', () => { for (const [k, v] of Object.entries(P)) if (/^#(?:fff|ffffff|000|000000)$/i.test(v)) return k; return true; });

t('pericol (danger) în quiet-slate: ≥ 4,5:1 pe fundal/tile și se deosebește de atenție (distanță RGB ≥ 40)', () => { const r = need([['danger/bg', P.danger, P.bg], ['danger/surface', P.danger, P.surface], ['danger/surface-2', P.danger, P['surface-2']]], 4.5); if (r !== true) return r; const a = hex(P.danger), b = hex(P.alert); return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) >= 40 || 'prea apropiat de atenție'; });

// ---- cyberpunk (Neon Glass): aceleași verificări de lizibilitate ----
const C = PRESETS.cyberpunk;
t('cyberpunk: text principal / secundar pe fundal, card și card ridicat', () => need([['text/bg', C.text, C.bg], ['text/surface', C.text, C.surface], ['text/surface-2', C.text, C['surface-2']], ['muted/bg', C.muted, C.bg], ['muted/surface', C.muted, C.surface], ['muted/surface-2', C.muted, C['surface-2']]], 4.5));
t('cyberpunk: textul pe corpul stării pornit / atenție / pericol (fără reflexia de sus, prima treaptă) ≥ 7:1', () => need([...grad(C['on-bg']), ...grad(C['alert-bg']), ...grad(C['danger-bg'])].filter((c, i, all) => !['on-bg', 'alert-bg', 'danger-bg'].some((k) => grad(C[k])[0] === c)).map((c) => ['text/' + c, C.text, c]), 7));
t('cyberpunk: accentele (cyan, chihlimbar, coral, grafic) pe fundal și card ≥ 4,5:1', () => need(['on', 'alert', 'danger', 'series'].flatMap((k) => [[k + '/bg', C[k], C.bg], [k + '/surface', C[k], C.surface]]), 4.5));
t('cyberpunk: selectat (pastilă și tile, fără reflexia de sus) — text ≥ 4,5:1 (text mare, semi-bold), contur ≥ 3:1', () => need([...grad(C['sel-bg']).slice(1), ...grad(C['sel-tile-bg']).slice(1)].map((c) => ['sel-fg/' + c, C['sel-fg'], c]), 4.5) === true && need([['sel-line/bg', C['sel-line'], C.bg]], 3));
t('cyberpunk: cyan / magenta(selectat) / chihlimbar / coral se deosebesc între ele (≥ 40 în RGB)', () => { const k = [C.on, C['sel-line'], C.alert, C.danger].map(hex); for (let i = 0; i < k.length; i++) for (let j = i + 1; j < k.length; j++) if (Math.hypot(k[i][0] - k[j][0], k[i][1] - k[j][1], k[i][2] - k[j][2]) < 40) return i + '-' + j; return true; });
console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
