// tests/bundle.test.mjs — pachetul ccu.js construit din src/ trebuie să fie JavaScript valid și să definească cardurile.
// Prinde greșeli pe care testele unitare nu le văd (ex. un accent grav ` într-un comentariu CSS din theme.js strică tot fișierul). Rulare: node tests/bundle.test.mjs
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { bundle } from '../build.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };

const { code, used } = bundle();
t('bundle: se construiește din toate modulele', () => used.length >= 18 || used.length);
t('bundle: JavaScript valid (compilare)', () => { new vm.Script(code, { filename: 'ccu.js' }); return true; });
t('theme.js: CSS-ul nu conține accente grave sau ${ (ar rupe șablonul)', () => {
  const src = readFileSync(new URL('../src/theme.js', import.meta.url), 'utf8');
  const m = src.match(/CCU_THEME\s*=\s*`([\s\S]*)`;?\s*$/);
  if (!m) return 'nu găsesc CCU_THEME';
  return (!m[1].includes('`') && !m[1].includes('${')) || 'accent grav sau ${ în CSS';
});
const theme = await import('../src/theme.js');
t('CCU_THEME: conține scale (zoom) și variabilele fx', () => ['zoom: var(--ccu-scale', '--ccu-fx-tint', '--ccu-fx-glow', '--ccu-r:', '--ccu-r-card:'].every((x) => theme.CCU_THEME.includes(x)) || 'lipsește o variabilă');

t('CCU_THEME: efectele (rim, mark, cut, streak, peak) sunt condiționate de data-feat', () => ['rim', 'mark', 'cut', 'streak', 'peak', 'plot', 'bar', 'tile'].every((e) => theme.CCU_THEME.includes('[data-feat~="' + e + '"]')) || 'lipsește un efect');

t('CCU_THEME: cut se aplică și antetului și meniului de jos (inel din ::after)', () => theme.CCU_THEME.includes(':is(.ccu-head, .ccu-nav)::after') || 'lipsește');

t('CCU_THEME: acolade și paranteze echilibrate (o paranteză lipsă strică în tăcere toate regulile de după ea)', () => { const css = theme.CCU_THEME.replace(/\/\*[\s\S]*?\*\//g, ''); const n = (c) => css.split(c).length - 1; return (n('{') === n('}') && n('(') === n(')')) || `acolade ${n('{')}/${n('}')}, paranteze ${n('(')}/${n(')')}`; });
t('CCU_THEME: fiecare regulă are paranteze echilibrate (găsește exact regula stricată)', () => { const css = theme.CCU_THEME.replace(/\/\*[\s\S]*?\*\//g, ''); for (const r of css.split('}')) { const o = r.split('(').length - 1, c = r.split(')').length - 1; if (o !== c) return 'dezechilibru în: ' + r.trim().slice(0, 90); } return true; });

// pachetul rulat într-un „browser” minimal: definește elementele și nu aruncă la încărcare
t('bundle: rulat cu un customElements simulat definește cardurile', () => {
  const defined = new Map();
  const ctx = { customElements: { get: (n) => defined.get(n), define: (n, c) => defined.set(n, c) }, HTMLElement: class {}, window: {}, document: { documentElement: {}, createElement: () => ({}) },
    CSSStyleSheet: class {}, console, setTimeout, clearTimeout, setInterval, clearInterval, requestAnimationFrame: () => 0, ResizeObserver: class {}, navigator: {}, localStorage: { getItem: () => null, setItem() {} } };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.runInNewContext(code, ctx, { filename: 'ccu.js' });
  const need = ['ccu-buttons-card', 'ccu-chips-card', 'ccu-header-card', 'ccu-nav-card', 'ccu-graph-card', 'ccu-flow-card', 'ccu-battery-card', 'ccu-weather-card', 'ccu-controls-card'];
  const miss = need.filter((n) => !defined.has(n));
  return !miss.length || 'lipsesc: ' + miss.join(', ');
});

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
