// tests/battery-capacity.test.mjs — de unde vine capacitatea bateriei (kWh / senzor / Ah × V) și cum o scrie editorul. Rulare: node tests/battery-capacity.test.mjs
import assert from 'node:assert/strict';
import { setLang } from '../src/i18n.mjs'; setLang('en');
import { normalizeBatteryConfig, buildBatteryModel, batteryCapacityKwh, headerRuntimeTexts, formatHours } from '../src/energy.mjs';
import { normalizeHeader } from '../src/render.mjs';
import { capacitySourceOf, capacityKeys, capacitySchema, pruneCapacity } from '../src/editor.mjs';

const S = (state, unit, extra) => ({ state: String(state), attributes: { unit_of_measurement: unit, ...(extra || {}) } });
const hass = { states: {
  'sensor.soc': S(89, '%'), 'sensor.est': S(37.8, 'kWh'), 'number.ah': S(942, 'Ah'), 'sensor.mah': S(942000, 'mAh'), 'sensor.load': S(1292, 'W'), 'sensor.bad': S('unavailable', 'kWh'),
} };
const cfg = (o) => normalizeBatteryConfig({ soc: 'sensor.soc', load: 'sensor.load', ...o }).config;
const cap = (o) => batteryCapacityKwh(cfg(o), (id) => hass.states[id] || null);
const near = (a, b, e = 0.01) => Math.abs(a - b) < e;

// --- cele trei surse ---
assert.ok(near(cap({ capacity_source: 'kwh', capacity_kwh: 48.2 }), 48.2));
assert.ok(near(cap({ capacity_source: 'entity', capacity_entity: 'sensor.est' }), 37.8));
assert.ok(near(cap({ capacity_source: 'ah', capacity_ah_entity: 'number.ah' }), 48.2304));            // 942 Ah × 51,2 V
assert.ok(near(cap({ capacity_source: 'ah', capacity_ah_entity: 'number.ah', nominal_voltage: 48 }), 45.216));
assert.ok(near(cap({ capacity_source: 'ah', capacity_ah: 100, nominal_voltage: 51.2 }), 5.12));       // Ah scriși de mână
assert.ok(near(cap({ capacity_source: 'ah', capacity_ah_entity: 'sensor.mah' }), 48.2304));            // mAh → Ah
// --- sursa aleasă explicit nu trece pe alt câmp ---
assert.equal(cap({ capacity_source: 'entity', capacity_entity: 'sensor.bad', capacity_kwh: 48.2 }), null);
assert.equal(cap({ capacity_source: 'ah', capacity_ah_entity: 'sensor.bad' }), null);
assert.equal(cap({ capacity_source: 'kwh', capacity_entity: 'sensor.est' }), null);
// --- fără sursă: ca înainte (senzorul dacă are valoare, altfel kWh) ---
assert.ok(near(cap({ capacity_entity: 'sensor.est', capacity_kwh: 48.2 }), 37.8));
assert.ok(near(cap({ capacity_entity: 'sensor.bad', capacity_kwh: 48.2 }), 48.2));
assert.ok(near(cap({ capacity_kwh: 48.2 }), 48.2));
assert.equal(cap({}), null);
// --- valori ciudate nu strică ---
assert.equal(cap({ capacity_source: 'nimic', capacity_kwh: 'x' }), null);
assert.equal(normalizeBatteryConfig({ soc: 'sensor.soc', capacity_ah_entity: 5, nominal_voltage: -3 }).config.nominal_voltage, 51.2);

// --- cifrele din exemplul real: 89% din 48,2 kWh, rezerva 20% ---
const m = buildBatteryModel(cfg({ capacity_source: 'ah', capacity_ah_entity: 'number.ah', reserve_pct: 20, shutdown_pct: 10 }), hass, {});
assert.ok(near(m.total, 48.23, 0.02) && near(m.bandTotal, 38.58, 0.02) && near(m.usable, 33.28, 0.02), [m.total, m.bandTotal, m.usable]);
const mNo = buildBatteryModel(cfg({ capacity_source: 'entity', capacity_entity: 'sensor.bad' }), hass, {});
assert.equal(mNo.total, null); assert.equal(mNo.usable, null);   // fără valoare: cardul arată „—”

// --- antetul: aceleași chei cu prefixul runtime_ ---
const hd = normalizeHeader({ values: [{ entity: 'sensor.soc', runtime_load: 'sensor.load', runtime_capacity_source: 'ah', runtime_capacity_ah_entity: 'number.ah', runtime_nominal_voltage: 51.2 }] }).header;
const rc = hd.values[0].runtimeCfg;
assert.equal(rc.capacity_source, 'ah'); assert.equal(rc.capacity_ah_entity, 'number.ah'); assert.equal(rc.nominal_voltage, 51.2);
const txt = headerRuntimeTexts(hd, hass, {})[0];
assert.match(txt, /h$/); assert.ok(!/—/.test(txt), txt);   // (89 − 20)% × 48,2 kWh / 1292 W ≈ 25,8 h

// --- editorul: sursa dedusă, câmpurile ei, curățarea la schimbare ---
assert.equal(capacitySourceOf({}), 'kwh'); assert.equal(capacitySourceOf({ capacity_entity: 'sensor.x' }), 'entity');
assert.equal(capacitySourceOf({ capacity_ah: 942 }), 'ah'); assert.equal(capacitySourceOf({ capacity_source: 'ah', capacity_entity: 'sensor.x' }), 'ah');
assert.equal(capacitySourceOf({ runtime_capacity_ah_entity: 'number.ah' }, 'runtime_'), 'ah');
const flat = (sc) => sc.flatMap((x) => (x.type === 'grid' ? x.schema : [x])).map((x) => x.name);
assert.deepEqual(flat(capacitySchema('kwh')), ['capacity_source', 'capacity_kwh']);
assert.deepEqual(flat(capacitySchema('entity')), ['capacity_source', 'capacity_entity']);
assert.deepEqual(flat(capacitySchema('ah')), ['capacity_source', 'capacity_ah_entity', 'capacity_ah', 'nominal_voltage']);
assert.deepEqual(flat(capacitySchema('ah', 'runtime_')), ['runtime_capacity_source', 'runtime_capacity_ah_entity', 'runtime_capacity_ah', 'runtime_nominal_voltage']);
assert.ok(capacityKeys('runtime_').every((k) => k.startsWith('runtime_')) && capacityKeys().length === 6);
const o = { capacity_entity: 'sensor.x', capacity_kwh: 48, capacity_ah: 942, reserve_pct: 20 };
pruneCapacity(o, 'ah'); assert.deepEqual(o, { capacity_ah: 942, reserve_pct: 20, capacity_source: 'ah' });
const r = { runtime_capacity_kwh: 48, runtime_load: 'sensor.load' };
pruneCapacity(r, 'entity', 'runtime_'); assert.deepEqual(r, { runtime_load: 'sensor.load', runtime_capacity_source: 'entity' });

// --- „Plin în” / autonomie: minute sub o oră, ore + minute până la 10 h, o zecimală de la 10 h ---
assert.equal(formatHours(0.7), '~42 min'); assert.equal(formatHours(0.72), '~43 min'); assert.equal(formatHours(1 / 60), '~1 min');
assert.equal(formatHours(0.0001), '<1 min'); assert.equal(formatHours(0), '<1 min');
assert.equal(formatHours(1), '~1 h'); assert.equal(formatHours(1.4), '~1 h 25 min'); assert.equal(formatHours(2), '~2 h'); assert.equal(formatHours(2.49), '~2 h 30 min');
assert.equal(formatHours(9.99), '~10 h'); assert.equal(formatHours(1.999), '~2 h');   // rotunjirea nu scrie „1 h 60 min”
assert.equal(formatHours(10), '~10 h'); assert.equal(formatHours(16.24), '~16.2 h'); assert.equal(formatHours(99.9), '~99.9 h');   // limba de test e engleza: separatorul zecimal e punctul
assert.equal(formatHours(100), '>99 h'); assert.equal(formatHours(null), '—'); assert.equal(formatHours(undefined), '—'); assert.equal(formatHours(NaN), '—'); assert.equal(formatHours(Infinity), '—');
console.log('battery-capacity ok');
