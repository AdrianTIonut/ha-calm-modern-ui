// tests/icons-presets.test.mjs — icons.mjs + presets.mjs. Rulare: node tests/icons-presets.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { ICONS, iconKey, iconSvg, iconAnim, DEFAULT_ANIM } from '../src/icons.mjs';
import { PRESETS, PRESET_NAMES, presetVars, applyPreset, colorVars } from '../src/presets.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const eq = (a, b) => a === b || `got ${JSON.stringify(a)}, vrut ${JSON.stringify(b)}`;

// ---- icons ----
t('cel puțin 12 iconițe', () => Object.keys(ICONS).length >= 12 || Object.keys(ICONS).length);
t('toate sunt SVG 32×32 valide, fără script/on*', () => {
  for (const [k, v] of Object.entries(ICONS)) {
    if (!v.startsWith('<svg viewBox="0 0 32 32"') || !v.endsWith('</svg>')) return k + ' format';
    if (/<script|\son\w+=|href=|javascript:/i.test(v)) return k + ' conținut periculos';
    if ((v.match(/</g) || []).length !== (v.match(/>/g) || []).length) return k + ' etichete dezechilibrate';
  }
  return true;
});
t('iconKey: nume propriu', () => eq(iconKey('fan'), 'fan'));
t('iconKey: mdi:lightbulb-on → bulb', () => eq(iconKey('mdi:lightbulb-on'), 'bulb'));
t('iconKey: majuscule/spații', () => eq(iconKey('  MDI:Fire '), 'flame'));
t('iconKey: mdi necunoscut → domeniul entității', () => eq(iconKey('mdi:xyz-necunoscut', 'lock.usa'), 'lock'));
t('iconKey: fără nume → domeniul', () => eq(iconKey(undefined, 'climate.hol'), 'thermo'));
t('iconKey: nimic → circle', () => eq(iconKey(undefined, undefined), 'circle'));
t('iconKey: valori ciudate nu aruncă', () => eq(iconKey(5, {}), 'circle'));
t('iconKey: toate valorile MDI duc la chei existente', () => {
  for (const n of ['mdi:lightbulb', 'mdi:fan', 'mdi:fire', 'mdi:door', 'mdi:lock', 'mdi:cctv', 'mdi:thermometer', 'mdi:flash', 'mdi:home', 'mdi:weather-sunny', 'mdi:power-socket', 'mdi:speaker', 'mdi:window-shutter', 'mdi:battery-charging'])
    if (!ICONS[iconKey(n)] || iconKey(n) === 'circle') return n;
  return true;
});
t('iconSvg întoarce mereu SVG', () => iconSvg('mdi:nimic').startsWith('<svg') || 'gol');
// în HA (unde există <ha-icon>) un nume necunoscut se desenează cu iconița nativă, iar cele proprii rămân proprii
globalThis.customElements = { get: (n) => (n === 'ha-icon' ? class {} : undefined) };
t('iconiță necunoscută în HA → <ha-icon>', () => iconSvg('mdi:access-point-plus') === '<ha-icon class="ccu-hai" icon="mdi:access-point-plus"></ha-icon>' || iconSvg('mdi:access-point-plus'));
t('iconiță proprie în HA rămâne SVG', () => iconSvg('mdi:lightbulb').startsWith('<svg') && iconSvg('fan').startsWith('<svg'));
t('nume invalid nu devine <ha-icon>', () => iconSvg('mdi:<script>').startsWith('<svg') && iconSvg('xx').startsWith('<svg'));
t('iconiță nativă fără animație implicită', () => iconAnim('mdi:access-point-plus', 'light.x') === '');
delete globalThis.customElements;
t('iconAnim: ventilator = a-fan (se învârte grupul .rot)', () => eq(iconAnim('mdi:fan'), 'a-fan') && ICONS.fan.includes('class="rot'));
t('iconiță Audi: 4 inele, mdi:logo-audi', () => ICONS.audi.split('<circle').length === 5 && iconKey('mdi:logo-audi') === 'audi');
t('iconAnim: animații oprite → ""', () => eq(iconAnim('mdi:fan', undefined, false), ''));
t('iconAnim: iconiță fără animație → ""', () => eq(iconAnim('lock'), ''));
t('DEFAULT_ANIM: doar clase existente', () => Object.values(DEFAULT_ANIM).every((c) => ['a-glow', 'a-spin', 'a-flicker', 'a-pulse', 'a-fan'].includes(c)) || 'clasă necunoscută');

t('ac: iconiță proprie cu ventilator rotativ', () => ICONS.ac && ICONS.ac.includes('class="rot"') || 'fără .rot');
t('ac: mdi:air-conditioner/hvac → ac, animația a-fan', () => iconKey('mdi:air-conditioner') === 'ac' && iconKey('mdi:hvac') === 'ac' && iconAnim('mdi:air-conditioner') === 'a-fan' || 'mapare');
t('presetări: toate au cool și heat hex', () => { for (const [n, p] of Object.entries(PRESETS)) for (const k of ['cool', 'heat']) if (!/^#[0-9a-f]{6}$/i.test(p[k] || '')) return n + '.' + k; return true; });
t('presetVars: cool/heat suprascriibile', () => { const v = presetVars('calm', { cool: '#0000ff', heat: '#ff0000' }).vars; return (v['--ccu-cool'] === '#0000ff' && v['--ccu-heat'] === '#ff0000') || JSON.stringify(v); });

// ---- presets ----
t('presetările cerute + quiet-slate + light', () => ['green', 'calm', 'quiet-slate', 'contrast', 'mono', 'warm', 'light'].every((n) => PRESET_NAMES.includes(n)) || PRESET_NAMES.join());
t('presetările existente nu s-au schimbat (valori de referință)', () => {
  const ref = { green: ['#0b1220', '#22c55e', '#f59e0b'], calm: ['#152028', '#d3a658', '#b85758'], contrast: ['#0b1217', '#ffc233', '#ff5d5d'],
    mono: ['#14181c', '#e8ebed', '#d9d9d9'], warm: ['#221a16', '#e8b04a', '#c4553f'], light: ['#e9f0f7', '#16a34a', '#d97706'] };
  for (const [n, [bg, on, alert]] of Object.entries(ref)) { const p = PRESETS[n]; if (p.bg !== bg || p.on !== on || p.alert !== alert) return n + ' schimbat'; }
  return true;
});
t('presetările existente nu definesc fx-* / *-bg / *-line (rămân derivate, ca până acum)', () => {
  for (const n of ['green', 'calm', 'contrast', 'mono', 'warm', 'light']) for (const k of Object.keys(PRESETS[n])) if (/^fx-|-bg$|-line$/.test(k) && k !== 'line') return n + '.' + k;
  return true;
});
t('quiet-slate = paleta „Quiet Slate”', () => { const p = PRESETS['quiet-slate'];
  return (p.bg === '#171d25' && p.surface === '#202833' && p['surface-2'] === '#27313d' && p.text === '#e5eaf0' && p.muted === '#b8c5d2' && p.on === '#9bcbb6' && p.accent === '#a5bfe2' && p.alert === '#e0bd86' && p.heat === '#e3a4a4' && p.series === '#84bceb') || JSON.stringify(p); });
t('quiet-slate: tinta discretă, fără glow, fundal/contur de stare definite', () => { const v = presetVars('quiet-slate').vars;
  return !!(v['--ccu-fx-glow'] === '0' && Number(v['--ccu-fx-tint']) > 0 && Number(v['--ccu-fx-tint']) < 1 && v['--ccu-on-bg'] && v['--ccu-on-line'] && v['--ccu-alert-bg'] && v['--ccu-alert-line']) || JSON.stringify(v); });
t('quiet-slate: nu e luminat ca tema „light”', () => eq(presetVars('quiet-slate').light, false));
t('colors: nu poate seta fx-* / *-bg / *-line (doar culorile cunoscute)', () => { const r = presetVars('quiet-slate', { 'fx-glow': '1', 'on-bg': 'red' });
  return (r.vars['--ccu-fx-glow'] === '0' && r.vars['--ccu-on-bg'].includes('linear-gradient') && r.warnings.length === 2) || JSON.stringify(r.warnings); });
t('toate presetările: text pe fundal ≥ 4,5:1 (WCAG)', () => {
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const L = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b); };
  const cr = (a, b) => { const x = L(a), y = L(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  for (const [n, p] of Object.entries(PRESETS)) { const r = cr(p.text, p.bg); if (r < 4.5) return n + ' ' + r.toFixed(2); }
  return true;
});
t('calm = paleta ardezie', () => { const p = PRESETS.calm; return (p.bg === '#152028' && p.accent === '#56aac2' && p.on === '#d3a658' && p.alert === '#b85758' && p.ok === '#68a169' && p.muted === '#69737b') || JSON.stringify(p); });
t('fiecare preset are cele 7 culori hex', () => { for (const [n, p] of Object.entries(PRESETS)) for (const k of ['bg', 'text', 'muted', 'accent', 'on', 'alert', 'ok', 'series']) if (!/^#[0-9a-f]{6}$/i.test(p[k] || '')) return n + '.' + k; return true; });
t('presetVars implicit = green', () => eq(presetVars(undefined).vars['--ccu-on'], '#22c55e'));
t('presetVars: chei cu prefix --ccu-', () => Object.keys(presetVars('warm').vars).every((k) => k.startsWith('--ccu-')) || 'prefix');
t('presetVars: preset necunoscut → green + avertisment', () => { const r = presetVars('xyz'); return (r.name === 'green' && r.warnings.length === 1) || JSON.stringify(r.warnings); });
t('presetVars: colors suprascrie', () => eq(presetVars('calm', { accent: '#ff0000' }).vars['--ccu-accent'], '#ff0000'));
t('presetVars: rgb()/hsl()/var() acceptate', () => { const v = presetVars('calm', { on: 'rgb(1, 2, 3)', ok: 'hsl(120 40% 50%)', alert: 'var(--error-color)' }).vars; return (v['--ccu-on'] === 'rgb(1, 2, 3)' && v['--ccu-alert'] === 'var(--error-color)') || JSON.stringify(v); });
t('presetVars: injecție CSS respinsă', () => { const r = presetVars('calm', { accent: 'red; background:url(http://x)' , on: 'expression(1)', ok: 'url(javascript:1)' }); return (r.vars['--ccu-accent'] === '#56aac2' && r.vars['--ccu-on'] === '#d3a658' && r.warnings.length === 3) || JSON.stringify(r); });
t('presetVars: cheie necunoscută ignorată', () => { const r = presetVars('calm', { foo: '#fff' }); return (!('--ccu-foo' in r.vars) && r.warnings.length === 1) || 'acceptată'; });
t('presetVars: colors invalid (șir/listă) nu aruncă', () => presetVars('calm', 'x').warnings.length === 0 && presetVars('calm', [1]).warnings.length === 0 || 'avertismente neașteptate');
t('presetVars: light marchează tema', () => eq(presetVars('light').light, true));
t('presetVars: nu modifică PRESETS', () => { presetVars('calm', { accent: '#000000' }); return eq(PRESETS.calm.accent, '#56aac2'); });
t('applyPreset: variabile + atribute', () => {
  const set = {}, attrs = {};
  const el = { style: { setProperty: (k, v) => { set[k] = v; } }, setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } };
  const w = applyPreset(el, 'light', { on: '#123456' });
  return (set['--ccu-on'] === '#123456' && attrs['data-preset'] === 'light' && attrs['data-theme'] === 'light' && w.length === 0) || JSON.stringify({ set, attrs, w });
});
t('applyPreset: scoate data-theme la preset închis', () => {
  const attrs = { 'data-theme': 'light' };
  const el = { style: { setProperty() {} }, setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } };
  applyPreset(el, 'warm'); return !('data-theme' in attrs) || 'a rămas data-theme';
});
// schimbarea temei pe un card deja desenat (setConfig din nou, ca în editorul vizual): nu rămâne nimic din tema de dinainte
const styleEl = () => { const set = {}, attrs = {}; return { set, attrs, style: { setProperty: (k, v) => { set[k] = v; }, removeProperty: (k) => { delete set[k]; } }, setAttribute: (k, v) => { attrs[k] = v; }, removeAttribute: (k) => { delete attrs[k]; } }; };
t('applyPreset: light → green scoate suprafața albă', () => {
  const el = styleEl(); applyPreset(el, 'light'); if (el.set['--ccu-surface'] !== '#ffffff') return 'light nu a pus surface';
  applyPreset(el, 'green'); return (!('--ccu-surface' in el.set) && !('--ccu-surface-2' in el.set) && el.set['--ccu-bg'] === PRESETS.green.bg) || JSON.stringify(el.set);
});
t('applyPreset + applyLook (ca în card): după orice temă, variabilele și atributele sunt exact ale temei noi', () => {
  const bad = [], both = (el, pz) => { applyPreset(el, pz); applyLook(el, { preset: pz }, pz); };
  for (const a of PRESET_NAMES) for (const b of PRESET_NAMES) {
    const el = styleEl(), fresh = styleEl(); both(el, a); both(el, b); both(fresh, b);
    if (JSON.stringify(Object.entries(el.attrs).sort()) !== JSON.stringify(Object.entries(fresh.attrs).sort())) bad.push(a + '→' + b + ' (atribute)');
    if (JSON.stringify(Object.entries(el.set).sort()) !== JSON.stringify(Object.entries(fresh.set).sort())) bad.push(a + '→' + b);
  }
  return bad.length === 0 || bad.join(', ');
});
t('applyPreset: culoare din colors scoasă din config dispare', () => {
  const el = styleEl(); applyPreset(el, 'green', { danger: '#ff0000' }); if (el.set['--ccu-danger'] !== '#ff0000') return 'danger nepus';
  applyPreset(el, 'green'); return !('--ccu-danger' in el.set) || 'a rămas --ccu-danger';
});
t('applyPreset + applyLook: quiet-slate → green, cu și fără glow în config', () => {
  const el = styleEl(); applyPreset(el, 'quiet-slate'); applyLook(el, {}, 'quiet-slate'); if (el.set['--ccu-fx-glow'] !== '0') return 'quiet-slate fără fx-glow 0';
  applyPreset(el, 'green'); applyLook(el, {}, 'green'); if ('--ccu-fx-glow' in el.set) return 'a rămas fx-glow';
  applyPreset(el, 'calm'); applyLook(el, { glow: 'soft' }, 'calm'); if (el.set['--ccu-fx-glow'] !== '0.5') return 'glow soft lipsă';
  applyPreset(el, 'warm'); applyLook(el, { glow: 'soft' }, 'warm'); return el.set['--ccu-fx-glow'] === '0.5' || 'glow din config pierdut la schimbarea temei';
});
t('applyPreset: element fără removeProperty nu aruncă', () => { const el = { style: { setProperty() {} }, setAttribute() {}, removeAttribute() {} }; applyPreset(el, 'light'); applyPreset(el, 'green'); return true; });

t('YAML: cheia `on:` (devine „true”) = culoarea „on”, la presetVars și colorVars', () => { const v = presetVars('green', { true: '#ff0000' }); const c = colorVars({ true: '#00ff00' }); return (v.vars['--ccu-on'] === '#ff0000' && v.warnings.length === 0 && c.vars['--ccu-on'] === '#00ff00') || JSON.stringify([v.warnings, c]); });
import { normalizeConfig } from '../src/config.mjs';
t('config: preset quiet-slate acceptat fără avertisment', () => { const r = normalizeConfig({ type: 'x', entities: ['light.a'], preset: 'quiet-slate' }); return (r.config.preset === 'quiet-slate' && !r.warnings.some((w) => /Preset/i.test(w))) || JSON.stringify(r.warnings); });
t('config: preset necunoscut → green, cu avertisment', () => { const r = normalizeConfig({ type: 'x', entities: ['light.a'], preset: 'nu-exista' }); return (r.config.preset === 'green' && r.warnings.some((w) => /Preset/i.test(w))) || JSON.stringify(r.warnings); });
t('config: lista de presetări din validare = PRESET_NAMES (o singură sursă)', () => PRESET_NAMES.every((n) => normalizeConfig({ type: 'x', entities: ['light.a'], preset: n }).config.preset === n) || 'diferă');

// ---- aspect: scale și radius ----
import { lookVars, applyLook } from '../src/presets.mjs';
t('lookVars: fără scale / radius → nimic (aspect neschimbat)', () => { const r = lookVars({}); return (Object.keys(r.vars).length === 0 && r.warnings.length === 0) || JSON.stringify(r); });
t('lookVars: scale 1 = implicit, nu pune variabila', () => Object.keys(lookVars({ scale: 1 }).vars).length === 0 || 'a pus variabila');
t('lookVars: scale 1,25 și scale „1,5” (virgulă) acceptate', () => lookVars({ scale: 1.25 }).vars['--ccu-scale'] === '1.25' && lookVars({ scale: '1,5' }).vars['--ccu-scale'] === '1.5' || 'valoare');
t('lookVars: scale în afara intervalului → limita, cu avertisment', () => { const a = lookVars({ scale: 3 }), b = lookVars({ scale: 0.2 }); return (a.vars['--ccu-scale'] === '1.6' && b.vars['--ccu-scale'] === '0.7' && a.warnings.length === 1 && b.warnings.length === 1) || JSON.stringify([a, b]); });
t('lookVars: scale nenumeric → ignorat, cu avertisment', () => { const r = lookVars({ scale: 'mare' }); return (!r.vars['--ccu-scale'] && r.warnings.length === 1) || JSON.stringify(r); });
t('lookVars: radius 14 → 14px și panouri 18px (ca implicit)', () => { const v = lookVars({ radius: 14 }).vars; return (v['--ccu-r'] === '14px' && v['--ccu-r-card'] === '18px') || JSON.stringify(v); });
t('lookVars: radius 0 (colțuri drepte) e valid, nu e tratat ca „gol”', () => { const v = lookVars({ radius: 0 }).vars; return (v['--ccu-r'] === '0px' && v['--ccu-r-card'] === '0px') || JSON.stringify(v); });
t('lookVars: radius 40 → 32, cu avertisment; radius „x” ignorat', () => { const a = lookVars({ radius: 40 }), b = lookVars({ radius: 'x' }); return (a.vars['--ccu-r'] === '32px' && a.warnings.length === 1 && !b.vars['--ccu-r'] && b.warnings.length === 1) || JSON.stringify([a, b]); });
t('lookVars: config invalid (null, șir, listă) nu aruncă', () => { for (const x of [null, undefined, 'x', [1]]) lookVars(x); return true; });
t('applyLook: pune variabilele și le scoate când opțiunea dispare din config', () => {
  const set = {}, el = { style: { setProperty: (k, v) => { set[k] = v; }, removeProperty: (k) => { delete set[k]; } } };
  applyLook(el, { scale: 1.2, radius: 6 });
  const a = JSON.stringify(set);
  applyLook(el, {});
  return (a.includes('--ccu-scale') && a.includes('--ccu-r') && Object.keys(set).length === 0) || JSON.stringify([a, set]);
});

// ---- etapa 4: glow, culorile lămpii ----
t('lookVars: glow off / soft / full → 0 / 0.5 / 1', () => { const g = (x) => lookVars({ glow: x }).vars['--ccu-fx-glow']; return (g('off') === '0' && g('soft') === '0.5' && g('full') === '1') || [g('off'), g('soft'), g('full')].join(); });
t('lookVars: glow auto = ca în temă (nu pune nimic)', () => { const r = lookVars({ glow: 'auto' }); return (r.vars['--ccu-fx-glow'] === undefined && r.warnings.length === 0) || JSON.stringify(r); });
t('lookVars: glow false/true din YAML (off/on fără ghilimele)', () => (lookVars({ glow: false }).vars['--ccu-fx-glow'] === '0' && lookVars({ glow: true }).vars['--ccu-fx-glow'] === '1') || 'yaml');
t('lookVars: glow necunoscut → ignorat, cu avertisment', () => { const r = lookVars({ glow: 'mare' }); return (r.vars['--ccu-fx-glow'] === undefined && r.warnings.length === 1) || JSON.stringify(r); });
t('applyLook: glow dispărut din config revine la valoarea presetării (quiet-slate = 0)', () => {
  const set = {}, el = { style: { setProperty: (k, v) => { set[k] = v; }, removeProperty: (k) => { delete set[k]; } } };
  applyLook(el, { glow: 'full' }, 'quiet-slate');
  const a = set['--ccu-fx-glow'];
  applyLook(el, {}, 'quiet-slate');
  return (a === '1' && set['--ccu-fx-glow'] === '0') || JSON.stringify([a, set]);
});
t('quiet-slate: are culorile lămpii; celelalte presetări nu (rămân galben vechi)', () => {
  const q = presetVars('quiet-slate').vars, o = presetVars('dark').vars;
  return (q['--ccu-lamp'] === '#e0bd86' && q['--ccu-lamp-hi'] === '#efd7a6' && o['--ccu-lamp'] === undefined) || JSON.stringify([q['--ccu-lamp'], o['--ccu-lamp']]);
});


// ---- etapa 5: mod noapte ----
import { nightConfig, isNight, applyNight } from '../src/presets.mjs';
const sunH = (st) => ({ states: { 'sun.sun': { state: st } } });
t('night: implicit oprit (nimic nu se întunecă)', () => { const n = nightConfig({}); return (n.mode === 'off' && n.dim === 15 && n.entity === 'sun.sun' && !isNight(n, sunH('below_horizon'))) || JSON.stringify(n); });
t('night: auto + soare sub orizont = noapte; deasupra = zi', () => { const n = nightConfig({ night: 'auto' }); return (isNight(n, sunH('below_horizon')) && !isNight(n, sunH('above_horizon'))) || 'stări'; });
t('night: YAML on/off (true/false) înțeles', () => (nightConfig({ night: true }).mode === 'auto' && nightConfig({ night: false }).mode === 'off') || 'yaml');
t('night: valoare necunoscută → oprit, cu avertisment', () => { const n = nightConfig({ night: 'mereu' }); return (n.mode === 'off' && n.warnings.length === 1) || JSON.stringify(n); });
t('night: entitate lipsă în hass → zi (nu întunecă)', () => !isNight(nightConfig({ night: 'auto' }), { states: {} }) && !isNight(nightConfig({ night: 'auto' }), undefined) || 'lipsă');
t('night: altă entitate — on = noapte; entitate greșită → sun.sun cu avertisment', () => { const n = nightConfig({ night: 'auto', night_entity: 'binary_sensor.intunecat' }); const b = nightConfig({ night: 'auto', night_entity: 'x y' }); return (isNight(n, { states: { 'binary_sensor.intunecat': { state: 'on' } } }) && !isNight(n, { states: { 'binary_sensor.intunecat': { state: 'off' } } }) && b.entity === 'sun.sun' && b.warnings.length === 1) || 'altă'; });
t('night: night_dim limitat la 0–60, cu avertisment; text → 15', () => { const a = nightConfig({ night_dim: 90 }), b = nightConfig({ night_dim: 'x' }), c = nightConfig({ night_dim: 0 }); return (a.dim === 60 && a.warnings.length === 1 && b.dim === 15 && b.warnings.length === 1 && c.dim === 0 && c.warnings.length === 0) || JSON.stringify([a, b, c]); });
t('night: config invalid (null, șir, listă) nu aruncă', () => { for (const x of [null, undefined, 'x', [1]]) nightConfig(x); return true; });
t('applyNight: pune atributul și opacitatea, le scoate ziua', () => {
  const at = new Map(), st = {}, el = { getAttribute: (k) => at.get(k) ?? null, setAttribute: (k, v) => at.set(k, v), hasAttribute: (k) => at.has(k), removeAttribute: (k) => at.delete(k), style: { setProperty: (k, v) => { st[k] = v; }, removeProperty: (k) => { delete st[k]; } } };
  const n = nightConfig({ night: 'auto', night_dim: 20 });
  applyNight(el, n, sunH('below_horizon')); const a = at.has('data-night') && st['--ccu-night-op'] === '0.8';
  applyNight(el, n, sunH('above_horizon'));
  return (a && !at.has('data-night') && !('--ccu-night-op' in st)) || JSON.stringify([a, [...at], st]);
});
t('quiet-slate: are culorile stării „selectat” (sel-bg, sel-line, sel-fg); celelalte presetări nu (rămân ca până acum)', () => { const q = presetVars('quiet-slate').vars, o = presetVars('dark').vars; return (q['--ccu-sel-bg'] && q['--ccu-sel-line'] && q['--ccu-sel-fg'] && o['--ccu-sel-bg'] === undefined) || JSON.stringify([q['--ccu-sel-bg'], o['--ccu-sel-bg']]); });
// ---- cyberpunk: font, efecte ----
import { fontConfig, effectsConfig, activeEffects, ensureFontCss, EFFECTS } from '../src/presets.mjs';
t('fontConfig: gol / auto = fontul temei (nimic)', () => { const a = fontConfig({}), b = fontConfig({ font: 'auto' }); return (Object.keys(a.vars).length === 0 && !a.css && Object.keys(b.vars).length === 0) || 'nimic'; });
t('fontConfig: font livrat (Exo 2) → variabila cu rezervă Inter + foaia implicită din /local/ccu/fonts', () => { const r = fontConfig({ font: 'exo 2' }); return (r.vars['--ccu-font'].startsWith('"Exo 2",') && r.vars['--ccu-font'].includes('Inter') && r.css === '/local/ccu/fonts/exo2/exo2.css') || JSON.stringify(r); });
t('fontConfig: Chakra Petch și Oxanium livrate', () => fontConfig({ font: 'Chakra Petch' }).css.includes('chakra-petch') && fontConfig({ font: 'Oxanium' }).css.includes('oxanium') || 'livrate');
t('fontConfig: nume propriu valid + font_css propriu', () => { const r = fontConfig({ font: 'Orbitron', font_css: '/local/ccu/fonts/orb.css' }); return (r.vars['--ccu-font'].startsWith('"Orbitron"') && r.css === '/local/ccu/fonts/orb.css') || JSON.stringify(r); });
t('fontConfig: nume cu ghilimele / ; / paranteze respins (nu ajunge în CSS), cu avertisment', () => { for (const bad of ['x";}body{', 'a;b', 'f(x)', '<b>']) { const r = fontConfig({ font: bad }); if (r.vars['--ccu-font'] || r.warnings.length !== 1) return JSON.stringify([bad, r]); } return true; });
t('fontConfig: font_css doar / sau https://; javascript:, spații, ghilimele respinse', () => { for (const bad of ['javascript:alert(1)', 'http://x/a.css', '/a b.css', '/a".css', 'data:text/css,x']) { const r = fontConfig({ font_css: bad }); if (r.css || r.warnings.length !== 1) return JSON.stringify([bad, r]); } return fontConfig({ font_css: 'https://exemplu.ro/f.css' }).css === 'https://exemplu.ro/f.css' || 'https'; });
t('fontConfig: config invalid nu aruncă', () => { for (const x of [null, undefined, 'x', [1], { font: {} }, { font: 5 }, { font_css: [] }]) fontConfig(x); return true; });
t('ensureFontCss: fără document nu aruncă și nu dublează', () => ensureFontCss('/a.css') === false && ensureFontCss('') === false);
t('effectsConfig: auto / gol / none / listă / text cu virgule', () => { const a = effectsConfig({}), b = effectsConfig({ effects: 'none' }), c = effectsConfig({ effects: ['rim', 'peak'] }), d = effectsConfig({ effects: 'rim, cut mark' }), e = effectsConfig({ effects: false }); return (a.list === null && b.list.length === 0 && c.list.join() === 'rim,peak' && d.list.join() === 'rim,cut,mark' && e.list.length === 0) || JSON.stringify([a, b, c, d, e]); });
t('effectsConfig: efect necunoscut → ignorat cu avertisment; dubluri scoase', () => { const r = effectsConfig({ effects: ['rim', 'rim', 'laser'] }); return (r.list.join() === 'rim' && r.warnings.length === 1) || JSON.stringify(r); });
t('effectsConfig: config invalid nu aruncă', () => { for (const x of [null, 'x', [1], { effects: 5 }, { effects: {} }]) effectsConfig(x); return true; });
t('cyberpunk: există, are fontul Exo 2 + efectele temei; celelalte teme nu au efecte', () => (PRESET_NAMES.includes('cyberpunk') && activeEffects({}, 'cyberpunk').join() === 'rim,mark,cut,streak,peak,plot' && activeEffects({}, 'green').length === 0 && activeEffects({}, 'quiet-slate').length === 0 && presetVars('cyberpunk').vars['--ccu-font'].startsWith('"Exo 2"')) || 'cyberpunk');
t('activeEffects: effects: pe card bate tema (none / listă)', () => activeEffects({ effects: 'none' }, 'cyberpunk').length === 0 && activeEffects({ effects: ['rim'] }, 'green').join() === 'rim' || 'bate');
t('applyLook: pune data-feat și --ccu-font; scoase, revin la temă', () => {
  const at = new Map(), st = {}, el = { getAttribute: (k) => at.get(k) ?? null, setAttribute: (k, v) => at.set(k, v), hasAttribute: (k) => at.has(k), removeAttribute: (k) => at.delete(k), style: { setProperty: (k, v) => { st[k] = v; }, removeProperty: (k) => { delete st[k]; } } };
  applyLook(el, { font: 'Oxanium', effects: ['rim'] }, 'green');
  const a = [at.get('data-feat'), st['--ccu-font']];
  applyLook(el, {}, 'green');
  const b = [at.has('data-feat'), '--ccu-font' in st];
  applyLook(el, {}, 'cyberpunk');
  return (a[0] === 'rim' && a[1].startsWith('"Oxanium"') && b[0] === false && b[1] === false && at.get('data-feat') === 'rim mark cut streak peak plot' && st['--ccu-font'].startsWith('"Exo 2"')) || JSON.stringify([a, b, [...at], st]);
});
t('cyberpunk: colțuri măsurate (tile, chips dreptunghiuri rotunjite, nu pastilă); celelalte teme au chips pastilă', () => { const c = presetVars('cyberpunk').vars, g = presetVars('green').vars; return (c['--ccu-r'] === '8px' && c['--ccu-chip-r'] === '9px' && g['--ccu-chip-r'] === undefined && g['--ccu-r'] === undefined) || JSON.stringify([c['--ccu-r'], c['--ccu-chip-r']]); });
console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
