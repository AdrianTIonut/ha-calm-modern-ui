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
t('4 presetări cerute + light', () => ['green', 'calm', 'contrast', 'mono', 'warm', 'light'].every((n) => PRESET_NAMES.includes(n)) || PRESET_NAMES.join());
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

t('YAML: cheia `on:` (devine „true”) = culoarea „on”, la presetVars și colorVars', () => { const v = presetVars('green', { true: '#ff0000' }); const c = colorVars({ true: '#00ff00' }); return (v.vars['--ccu-on'] === '#ff0000' && v.warnings.length === 0 && c.vars['--ccu-on'] === '#00ff00') || JSON.stringify([v.warnings, c]); });
console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
