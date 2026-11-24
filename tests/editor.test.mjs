// tests/editor.test.mjs — logica pură a editorului vizual: conversii de config și detectarea automată a senzorilor. Rulare: node tests/editor.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { cleanObj, compactSource, consumerToForm, consumerFromForm, consumerReady, detectEnergy, listRows, contentInherit } from '../src/editor.mjs';
import { normalizeFlowConfig } from '../src/energy.mjs';
import { runAction } from '../src/actions.mjs';

let pass = 0, fail = 0;
const T = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + JSON.stringify(r)); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sortKeys = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
const S = (unit, name, dc) => ({ state: '1', attributes: { unit_of_measurement: unit, friendly_name: name, ...(dc ? { device_class: dc } : {}) } });

T('cleanObj: scoate golurile, păstrează 0 și textul', () => eq(cleanObj({ a: '', b: [], c: false, d: undefined, e: 0, f: 'x', g: [1] }), { e: 0, f: 'x', g: [1] }));
T('compactSource: doar entity → șir; cu extra → obiect; fără entity → null', () => compactSource({ entity: 'sensor.a' }) === 'sensor.a' && eq(compactSource({ entity: 'sensor.a', invert: true }), { entity: 'sensor.a', invert: true }) && compactSource({ name: 'x' }) === null && compactSource({ entity: '', invert: true }) === null);

T('consumator: din config în formular și înapoi, fără pierderi', () => {
  const orig = { entities: ['sensor.a', 'sensor.b'], subtract: ['sensor.c'], name: 'Hală', icon: 'mdi:warehouse', hide_idle: false };
  const f = consumerToForm(orig);
  return f.name === 'Hală' && eq(f.entities, ['sensor.a', 'sensor.b']) && eq(f.subtract, ['sensor.c']) && eq(sortKeys(consumerFromForm(f, orig)), sortKeys(orig)) || [f, consumerFromForm(f, orig)];
});
T('consumator: subtract dat ca șir devine listă; entity simplu rămâne entity', () => {
  const f = consumerToForm({ entity: 'sensor.casa', subtract: 'sensor.piscina', name: 'Casă' });
  const out = consumerFromForm(f, { entity: 'sensor.casa', subtract: 'sensor.piscina', name: 'Casă' });
  return eq(f.subtract, ['sensor.piscina']) && out.entity === 'sensor.casa' && !out.entities && eq(out.subtract, ['sensor.piscina']) || out;
});
T('consumator: o listă de senzori goală înlocuiește „entities” cu „entity”', () => { const out = consumerFromForm({ name: 'X', icon: '', entity: 'sensor.x', entities: [], subtract: [] }, { entities: ['sensor.a'] }); return eq(out, { name: 'X', entity: 'sensor.x' }) || out; });
T('consumerReady: cere un senzor sau o listă', () => consumerReady({ entity: 'sensor.a' }) && consumerReady({ entities: ['sensor.a'] }) && !consumerReady({ name: 'x' }) && !consumerReady({}) && !consumerReady(null));
T('config produs de editor e acceptat de card (fără avertismente)', () => {
  const cfg = { solar: 'sensor.s', grid: { entity: 'sensor.g', invert: true }, battery: { entity: 'sensor.b', soc: 'sensor.soc' }, consumers: [consumerFromForm(consumerToForm({ entity: 'sensor.c', name: 'Casă' }), { entity: 'sensor.c', name: 'Casă' })], stats: [{ entity: 'sensor.d', label: 'Azi' }] };
  const n = normalizeFlowConfig(cfg); return n.warnings.length === 0 && n.items.length === 5 || n.warnings;
});

import { readFileSync } from 'node:fs';
T('presetările: lista din editor și din validare vine dintr-o singură sursă (presets.mjs), fără liste scrise de mână', () => {
  const read = (f) => readFileSync(new URL('../src/' + f, import.meta.url), 'utf8');
  const ed = read('editor.mjs'), cf = read('config.mjs');
  const literal = /\[\s*'green'\s*,\s*'calm'/;
  return (ed.includes('SEL(PRESET_NAMES)') && cf.includes('PRESET_NAMES.includes(config.preset)') && !literal.test(ed) && !literal.test(cf)) || 'listă scrisă de mână';
});

T('contentInherit: implicit = iconiță, nume, valoare da; starea nu; stil punct', () => eq(contentInherit({}), { show_icon: true, show_name: true, show_value: true, show_state: false, state_style: 'dot', wave: false }) || contentInherit({}));
T('contentInherit: urmează cardul (nume ascuns, stare arătată, stil text)', () => eq(contentInherit({ show_name: false, show_state: true, state_style: 'text' }), { show_icon: true, show_name: false, show_value: true, show_state: true, state_style: 'text', wave: false }) || contentInherit({ show_name: false }));
T('contentInherit: valoare necunoscută de stil → punct; fără card → implicit', () => contentInherit({ state_style: 'xyz' }).state_style === 'dot' && contentInherit(undefined).show_icon === true || 'valori');

// ---- detectare automată (nume reale dintr-o instalare tipică) ----
const states = {
  'sensor.solar_total_power': S('W', 'Solar Total Power', 'power'),
  'sensor.solar_total_energy': S('kWh', 'Solar Total Energy', 'energy'),
  'sensor.power_meter_active_power': S('W', 'Active power', 'power'),
  'sensor.hala_general_phase_a_power': S('W', 'Phase A power', 'power'),
  'sensor.invertor_deye_battery_power': S('W', 'Battery Power', 'power'),
  'sensor.invertor_deye_battery': S('%', 'Battery', 'battery'),
  'sensor.invertor_deye_today_battery_charge': S('kWh', 'Today Battery Charge', 'energy'),
  'sensor.ipad_battery_level': S('%', 'iPad battery level', 'battery'),
  'sensor.casa_consum_izolat': S('W', 'Casa consum izolat', 'power'),
  'light.x': { state: 'on', attributes: {} },
};
T('detectEnergy: găsește solar, contor, baterie și nivelul ei', () => { const d = detectEnergy(states); return d.solar === 'sensor.solar_total_power' && d.grid === 'sensor.power_meter_active_power' && d.battery === 'sensor.invertor_deye_battery_power' && d.soc === 'sensor.invertor_deye_battery' || d; });
T('detectEnergy: nu ia energia (kWh) și nu ia bateria tabletei', () => { const d = detectEnergy(states); return !Object.values(d).includes('sensor.solar_total_energy') && d.soc !== 'sensor.ipad_battery_level'; });
T('detectEnergy: fără senzori → nimic, fără erori', () => { const d = detectEnergy({}); const e = detectEnergy(undefined); return !d.solar && !d.grid && !d.battery && !e.solar; });

// ---- acțiuni din editorul HA (ui_action) ----
T('acțiune „perform-action” din editorul HA cheamă serviciul cu data și target', () => {
  const calls = []; const hass = { states: {}, callService: (...a) => calls.push(a) };
  runAction(hass, { dataset: {} }, { action: 'perform-action', perform_action: 'light.turn_on', data: { brightness_pct: 50 }, target: { entity_id: 'light.a' } });
  return eq(calls[0], ['light', 'turn_on', { brightness_pct: 50 }, { entity_id: 'light.a' }]) || calls;
});

// ---- liste din editor: rândurile salvate ca șir nu se pierd la prima modificare (raport: 10 din 12 comutatoare șterse) ----
T('listRows: șirurile devin obiecte, obiectele rămân', () => eq(listRows(['switch.a', { entity: 'switch.b', icon: 'mdi:lamp' }, '', null]), [{ entity: 'switch.a' }, { entity: 'switch.b', icon: 'mdi:lamp' }]));
T('listRows: fără listă → gol', () => eq(listRows(undefined), []) && eq(listRows('x'), []));
T('modificarea unei iconițe păstrează toate cele 12 comutatoare', () => {
  const saved = Array.from({ length: 12 }, (_, i) => 'switch.s' + (i + 1));   // cum le scrie editorul: doar entity → șir
  const L = listRows(saved), ready = (x) => !!(x && x.entity);
  L[0] = { ...L[0], icon: 'mdi:lightbulb' };   // prima iconiță schimbată
  const out = L.filter(ready).map((x) => (Object.keys(x).length === 1 && x.entity ? x.entity : x));
  return out.length === 12 && out[0].icon === 'mdi:lightbulb' && out[1] === 'switch.s2' || out;
});

console.log(`\n${pass}/${pass + fail}`);
if (fail) process.exit(1);
