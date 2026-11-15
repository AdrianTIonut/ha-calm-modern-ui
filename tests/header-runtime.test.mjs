// tests/header-runtime.test.mjs — autonomia sub procentul bateriei, în antet
// Rulat cu: node tests/header-runtime.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeHeader, renderHeader } from '../src/render.mjs';
import { headerRuntimeTexts } from '../src/energy.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };
const S = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'object' ? v : { state: String(v), attributes: {} }]));
const hdr = (v) => normalizeHeader({ values: [v] }).header;

// config: chei plate (din editor) sau obiect `runtime`
let h = hdr({ entity: 'sensor.soc', icon: 'battery', runtime_load: 'sensor.l', runtime_capacity_kwh: 40 });
ok('chei runtime_* → configurație de autonomie', h.values[0].runtimeCfg && h.values[0].runtimeCfg.load === 'sensor.l' && h.values[0].runtimeCfg.capacity_kwh === 40);
h = hdr({ entity: 'sensor.soc', runtime: { load: 'sensor.l', capacity_kwh: 40, reserve_pct: 30 } });
ok('obiect runtime: {…} la fel', h.values[0].runtimeCfg && h.values[0].runtimeCfg.reserve_pct === 30);
h = hdr({ entity: 'sensor.soc', runtime_capacity_kwh: 40 });
ok('fără consum nu se activează', h.values[0].runtimeCfg === null);
h = hdr({ entity: 'sensor.soc', runtime_load_entities: ['sensor.a', 'sensor.b'], runtime_capacity_kwh: 40 });
ok('merge și doar cu runtime_load_entities', h.values[0].runtimeCfg !== null);
ok('o valoare obișnuită nu are runtime', hdr({ entity: 'sensor.t' }).values[0].runtimeCfg === null);

// text: (82 − 20)% × 40 kWh = 24,8 kWh; la 1,2 kW → ~20,7 h
const cfgv = { entity: 'sensor.soc', runtime_load: 'sensor.l', runtime_capacity_kwh: 40, runtime_reserve_pct: 20 };
h = hdr(cfgv);
let txt = headerRuntimeTexts(h, { states: S({ 'sensor.soc': 82, 'sensor.l': 1200 }) });
ok('autonomia apare ca text mic', txt[0] === '~20,7 h', txt[0]);
txt = headerRuntimeTexts(h, { states: S({ 'sensor.soc': 82, 'sensor.l': 'unavailable' }) });
ok('consum indisponibil → fără text', txt[0] === '');
h = hdr({ ...cfgv, runtime_power: 'sensor.p' });
txt = headerRuntimeTexts(h, { states: S({ 'sensor.soc': 82, 'sensor.l': 1200, 'sensor.p': -10000 }) });
ok('în încărcare: „plin în …” (7,2 kWh / 10 kW = 0,70 h)', txt[0] === 'plin în ~0,70 h', txt[0]);
txt = headerRuntimeTexts(h, { states: S({ 'sensor.soc': 82, 'sensor.l': 1200, 'sensor.p': 800 }) });
ok('în descărcare rămâne autonomia', txt[0] === '~20,7 h', txt[0]);

// randare: textul apare sub valoare
const cfg = { header: hdr(cfgv) };
let html = renderHeader(cfg, { states: S({ 'sensor.soc': 82, 'sensor.l': 1200 }) }, null, { subs: ['~20,7 h'] });
ok('randare: valoare sus, autonomie dedesubt', html.includes('has-label') && html.includes('<small class="rt">~20,7 h</small>'));
html = renderHeader({ header: hdr({ ...cfgv, label: 'Baterie' }) }, { states: S({ 'sensor.soc': 82 }) }, null, { subs: ['~20,7 h'] });
ok('autonomia ia locul etichetei', html.includes('~20,7 h') && !html.includes('Baterie'));
html = renderHeader({ header: hdr({ ...cfgv, label: 'Baterie' }) }, { states: S({ 'sensor.soc': 82 }) }, null, { subs: [''] });
ok('fără text de autonomie rămâne eticheta', html.includes('<small>Baterie</small>'));
html = renderHeader({ header: hdr({ entity: 'sensor.soc' }) }, { states: S({ 'sensor.soc': 82 }) }, null);
ok('fără opts.subs nu aruncă', typeof html === 'string' && !html.includes('has-label'));

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
