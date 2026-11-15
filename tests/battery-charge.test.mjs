// tests/battery-charge.test.mjs — autonomia bateriei: consum însumat (load + load_entities), încărcare și „Plin în”
// Rulat cu: node tests/battery-charge.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeBatteryConfig, buildBatteryModel, renderBattery } from '../src/energy.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };
const near = (a, b, e = 0.01) => typeof a === 'number' && Math.abs(a - b) <= e;
const S = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'object' ? v : { state: String(v), attributes: {} }]));
const cfg = (o) => normalizeBatteryConfig({ soc: 'sensor.soc', capacity_kwh: 40, reserve_pct: 20, shutdown_pct: 10, ...o }).config;

// autonomie simplă: (82 − 20)% × 40 kWh = 24,8 kWh; la 1,2 kW → 20,67 h
let m = buildBatteryModel(cfg({ load: 'sensor.l' }), { states: S({ 'sensor.soc': 82, 'sensor.l': 1200 }) });
ok('autonomie = energie utilizabilă / consum', near(m.autonomyH, 24.8 / 1.2), m.autonomyH);
ok('fără senzor de putere nu e încărcare', m.charging === false && m.fullH === null);

// load_entities se adună la load
m = buildBatteryModel(cfg({ load: 'sensor.l', load_entities: ['sensor.h1', 'sensor.h2'] }), { states: S({ 'sensor.soc': 82, 'sensor.l': 1200, 'sensor.h1': 300, 'sensor.h2': { state: '0.5', attributes: { unit_of_measurement: 'kW' } } }) });
ok('consum însumat 1200 + 300 + 500 = 2000 W', near(m.loadW, 2000) && near(m.autonomyH, 24.8 / 2), m.loadW);

// dacă un senzor lipsește, nu se afișează autonomia (nu una prea optimistă)
m = buildBatteryModel(cfg({ load: 'sensor.l', load_entities: ['sensor.h1'] }), { states: S({ 'sensor.soc': 82, 'sensor.l': 1200, 'sensor.h1': 'unavailable' }) });
ok('un consumator indisponibil → fără autonomie', m.autonomyH === null && m.autonomyText === '—');

// doar load_entities, fără load
m = buildBatteryModel(cfg({ load_entities: ['sensor.h1'] }), { states: S({ 'sensor.soc': 82, 'sensor.h1': 800 }) });
ok('merge și doar cu load_entities', near(m.autonomyH, 24.8 / 0.8));

// încărcare: − = încărcare; plin în (100 − 82)% × 40 = 7,2 kWh la 10,335 kW
const st = S({ 'sensor.soc': 82, 'sensor.l': 3780, 'sensor.p': -10335 });
m = buildBatteryModel(cfg({ load: 'sensor.l', power: 'sensor.p' }), { states: st });
ok('se încarcă (putere negativă)', m.charging === true && near(m.chargeW, 10335, 0.1));
ok('plin în = 7,2 kWh / 10,335 kW', near(m.fullH, 7.2 / 10.335, 0.001), m.fullH);
ok('autonomia rămâne la consumul curent', near(m.autonomyH, 24.8 / 3.78, 0.01));
let html = renderBattery(cfg({ load: 'sensor.l', power: 'sensor.p' }), m);
ok('randarea arată „Plin în” și „Autonomie la consum”', html.includes('Plin în') && html.includes('Autonomie la consum') && html.includes('data-charging="1"'));

// descărcare (+) → nu e încărcare; power_invert întoarce semnul
m = buildBatteryModel(cfg({ load: 'sensor.l', power: 'sensor.p' }), { states: S({ 'sensor.soc': 82, 'sensor.l': 1000, 'sensor.p': 1000 }) });
ok('putere pozitivă = descărcare, fără „Plin în”', m.charging === false);
html = renderBattery(cfg({ load: 'sensor.l', power: 'sensor.p' }), m);
ok('în descărcare apare „Autonomie” simplu', !html.includes('Plin în') && html.includes('>Autonomie<'));
m = buildBatteryModel(cfg({ load: 'sensor.l', power: 'sensor.p', power_invert: true }), { states: S({ 'sensor.soc': 82, 'sensor.l': 1000, 'sensor.p': 4000 }) });
ok('power_invert: + devine încărcare', m.charging === true && near(m.chargeW, 4000, 0.1));

// repaus (sub 50 W) și baterie plină
m = buildBatteryModel(cfg({ load: 'sensor.l', power: 'sensor.p' }), { states: S({ 'sensor.soc': 82, 'sensor.l': 1000, 'sensor.p': -30 }) });
ok('sub 50 W = repaus, nu încărcare', m.charging === false);
m = buildBatteryModel(cfg({ load: 'sensor.l', power: 'sensor.p' }), { states: S({ 'sensor.soc': 100, 'sensor.l': 1000, 'sensor.p': -500 }) });
ok('la 100% nu mai arată „Plin în”', m.charging === false && m.fullH === null);

// config: valori greșite nu strică
const c2 = normalizeBatteryConfig({ soc: 'sensor.soc', load_entities: ['sensor.ok', 'nu e entitate', 5], power_invert: 'yes' }).config;
ok('load_entities păstrează doar entity_id valide', JSON.stringify(c2.load_entities) === '["sensor.ok"]');
ok('power_invert doar cu true', c2.power_invert === false);
ok('load_entities ca șir', JSON.stringify(normalizeBatteryConfig({ soc: 'sensor.soc', load_entities: 'sensor.a' }).config.load_entities) === '["sensor.a"]');

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
