// tests/flow-sun.test.mjs — cardul de flux: producția de azi și radiația solară, sub titlu
// Rulat cu: node tests/flow-sun.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeFlowConfig, buildFlowModel, renderFlow } from '../src/energy.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };
const S = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { state: String(v[0]), attributes: { unit_of_measurement: v[1] } }]));
const hass = { states: S({ 'sensor.sol': [3200, 'W'], 'sensor.td': [14.2, 'kWh'], 'sensor.rad': [850, 'W/m²'], 'sensor.house': [700, 'W'] }) };
const cfg = (o) => normalizeFlowConfig({ title: 'Flux', solar: 'sensor.sol', consumers: [{ entity: 'sensor.house', name: 'Casă' }], ...o });
const render = (o, hs = hass) => { const f = cfg(o); const config = { entities: f.items, title: f.title }; return renderFlow(config, buildFlowModel(f.items, hs), 360, {}); };

let f = cfg({ solar_today: 'sensor.td', radiation: 'sensor.rad' });
ok('config: două note de soare', f.items.filter((i) => i.kind === 'sunnote').length === 2 && f.warnings.length === 0, JSON.stringify(f.warnings));
let html = render({ solar_today: 'sensor.td', radiation: 'sensor.rad' });
ok('apare rândul mic sub titlu', html.includes('ccu-flow-sun'));
ok('producția de azi cu unitate și etichetă', html.includes('14,2 kWh') && html.includes('produs azi'), html.slice(html.indexOf('ccu-flow-sun'), html.indexOf('ccu-flow-sun') + 300));
ok('radiația cu unitate', html.includes('850 W/m²'));
ok('rândul e între titlu și diagramă', html.indexOf('ccu-flow-head') < html.indexOf('ccu-flow-sun') && html.indexOf('ccu-flow-sun') < html.indexOf('ccu-flow-body'));
ok('fără opțiuni nu apare rândul', !render({}).includes('ccu-flow-sun'));
html = render({ solar_today: 'sensor.td' });
ok('doar producția: o singură intrare', (html.match(/class="s"/g) || []).length === 1);
html = render({ solar_today: { entity: 'sensor.td', label: 'azi', icon: 'bolt' } });
ok('obiect cu etichetă proprie', html.includes('<small>azi</small>'));
html = render({ solar_today: 'sensor.lipsa' });
ok('senzor lipsă → „—”', html.includes('<b>—</b>'));
f = cfg({ solar_today: 'nu e entitate' });
ok('entity_id invalid → avertisment, fără rând', f.warnings.length === 1 && !f.items.some((i) => i.kind === 'sunnote'));
html = render({ solar_today: 'sensor.td', radiation: 'sensor.rad', sun_labels: false });
const row = html.slice(html.indexOf('ccu-flow-sun'), html.indexOf('ccu-flow-body'));
ok('sun_labels: false → fără text lângă valori', row.includes('14,2 kWh') && row.includes('850 W/m²') && !row.includes('produs azi') && !row.includes('radiație') && !row.includes('<small>'), row.slice(0, 400));
html = render({ solar_today: { entity: 'sensor.td', label: 'azi' }, sun_labels: false });
ok('o etichetă dată explicit rămâne', html.includes('<small>azi</small>'));
ok('titlul rămâne', render({ solar_today: 'sensor.td' }).includes('Flux'));

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
