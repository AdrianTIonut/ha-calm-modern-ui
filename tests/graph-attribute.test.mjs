// tests/graph-attribute.test.mjs — grafic: serie din atribut (temperatura unui AC) și din „starea e una din listă” (cool / heat), plus textul pornit / oprit la input_boolean.
// Rulare: node tests/graph-attribute.test.mjs
import assert from 'node:assert/strict';
import { setLang } from '../src/i18n.mjs'; setLang('en');
import { parseSeriesRows } from '../src/graph-data.mjs';
import { normalizeGraphConfig, buildGraphModel, buildTimelineModel, renderGraphSvg } from '../src/graph-card.mjs';
import { secondaryText } from '../src/state.mjs';

const H = 3600;
const rows = [
  { s: 'off', a: { current_temperature: 28, temperature: 27 }, lu: 1000 * H },
  { s: 'cool', lu: 1002 * H },                                                  // fără atribute: rămân cele de dinainte
  { s: 'cool', a: { current_temperature: '24.5', temperature: 22 }, lu: 1004 * H },   // număr dat ca text
  { s: 'unavailable', a: { current_temperature: 99 }, lu: 1006 * H },           // indisponibil = gol, nu 99
  { s: 'heat', a: { current_temperature: null, temperature: 25 }, lu: 1008 * H },
];

// --- atribut ---
const cur = parseSeriesRows(rows, { attribute: 'current_temperature' });
assert.deepEqual(cur.map((p) => p.v), [28, 28, 24.5, null, null]);
assert.equal(cur[0].t, 1000 * H * 1000); assert.ok(!cur.binary);
assert.deepEqual(parseSeriesRows(rows, { attribute: 'temperature' }).map((p) => p.v), [27, 27, 22, null, 25]);
assert.deepEqual(parseSeriesRows(rows, { attribute: 'nu_exista' }).map((p) => p.v), [null, null, null, null, null]);
// --- starea e una din listă ---
const cool = parseSeriesRows(rows, { state_is: ['cool'] });
assert.deepEqual(cool.map((p) => p.v), [0, 1, 1, null, 0]); assert.equal(cool.binary, true);
assert.deepEqual(parseSeriesRows(rows, { state_is: ['cool', 'heat'] }).map((p) => p.v), [0, 1, 1, null, 1]);
// --- intrări ciudate nu strică ---
assert.deepEqual(parseSeriesRows(undefined, { attribute: 'x' }), []); assert.deepEqual(parseSeriesRows(rows, null), []);
assert.deepEqual(parseSeriesRows([null, 5, 'x', { s: 'on' }], { state_is: ['on'] }).map((p) => p.v), [1]);

// --- config ---
const n = (series) => normalizeGraphConfig({ series });
let c = n([{ entity: 'climate.a', attribute: ' current_temperature ', unit: '°C' }, { entity: 'climate.a', state_is: 'cool, heat ,' }]);
assert.equal(c.config.series[0].attribute, 'current_temperature'); assert.deepEqual(c.config.series[1].state_is, ['cool', 'heat']); assert.equal(c.warnings.length, 0);
c = n([{ entity: 'climate.a', attribute: 'bad name!' }]);
assert.ok(!('attribute' in c.config.series[0]) && c.warnings.length === 1, c.warnings);
c = n([{ entity: 'climate.a', attribute: '', state_is: [] }]);
assert.ok(!('attribute' in c.config.series[0]) && !('state_is' in c.config.series[0]) && c.warnings.length === 0);
c = n([{ entity: 'climate.a', attribute: 'temperature', state_is: ['cool'] }]);
assert.equal(c.config.series[0].attribute, 'temperature'); assert.ok(!('state_is' in c.config.series[0]) && c.warnings.length === 1);

// --- model: două serii cu atribut, aceeași unitate → o axă, linii reale (nu „Pornit / Oprit”) ---
const now = 1010 * H * 1000;
const mk = (v0, v1) => Object.assign([{ t: now - 20 * H * 1000, v: v0 }, { t: now - 10 * H * 1000, v: v1 }, { t: now, v: v1 }], { unit: '°C', binary: false });
const cfg = n([{ entity: 'climate.a', attribute: 'current_temperature', name: 'Real' }, { entity: 'climate.a', attribute: 'temperature', name: 'Set' }]).config;
const m = buildGraphModel(cfg, [mk(28, 24), mk(27, 22)], 400, 120, now);
const svg = renderGraphSvg(m);
assert.ok(!m.hasRight && m.series.length === 2 && m.series.every((s) => !s.binary && s.unit === '°C'), m.series.map((s) => [s.binary, s.unit]));
assert.ok(!/NaN|undefined/.test(svg) && !/Pornit|On\b/.test(m.grid.map((g) => g.label).join(' ')), m.grid.map((g) => g.label));
assert.ok(m.grid.some((g) => /°C/.test(g.label)), m.grid.map((g) => g.label));

// --- temperaturi: axa nu pornește de la 0 (17–32 °C ocupă axa, nu 0–60) ---
const tmk = (a, b) => Object.assign([{ t: now - 20 * H * 1000, v: a }, { t: now - 10 * H * 1000, v: b }, { t: now, v: b }], { unit: '°C', binary: false });
const tm1 = buildGraphModel(cfg, [tmk(17, 32), tmk(22, 27)], 400, 120, now);
assert.ok(Math.min(...tm1.grid.map((g) => Number(String(g.label).replace(/[^0-9.,-]/g, '').replace(',', '.')))) >= 10, tm1.grid.map((g) => g.label));
// pe alte unități (ex. putere) zona pornește tot de la 0
const pmk = (a, b) => Object.assign([{ t: now - 20 * H * 1000, v: a }, { t: now, v: b }], { unit: 'W', binary: false });
const pm = buildGraphModel(n([{ entity: 'sensor.p' }]).config, [pmk(500, 2000)], 400, 120, now);
assert.ok(pm.grid.some((g) => /^0\b/.test(String(g.label).trim())), pm.grid.map((g) => g.label));

// --- cronologie cu state_is: bare doar cât timp starea e răcire / încălzire ---
const tl = n([{ entity: 'climate.a', state_is: 'cool', name: 'Cool' }, { entity: 'climate.a', state_is: 'heat', name: 'Heat' }]);
tl.config.timeline = true;
const bin = (pts) => Object.assign(pts, { binary: true, unit: '' });
const T = (h) => now - h * H * 1000;
const tm = buildTimelineModel(tl.config, [bin([{ t: T(20), v: 0 }, { t: T(14), v: 1 }, { t: T(8), v: 0 }, { t: now, v: 0 }]), bin([{ t: T(20), v: 0 }, { t: T(5), v: 1 }, { t: now, v: 1 }])], 400, now);
assert.equal(tm.lanes[0].segs.length, 1); assert.equal(tm.lanes[1].segs.length, 1);   // răcire 14 h → 8 h; încălzire de la 5 h până acum
assert.ok(tm.lanes[0].segs[0].w > 0 && tm.lanes[1].segs[0].w > 0);

// --- textul pornit / oprit ---
const st = (id, state) => ({ entity_id: id, state, attributes: {} });
assert.equal(secondaryText(st('input_boolean.x', 'on')), 'on'); assert.equal(secondaryText(st('input_boolean.x', 'off')), 'off');   // engleză
setLang('ro');
assert.equal(secondaryText(st('input_boolean.x', 'on')), 'pornit'); assert.equal(secondaryText(st('input_boolean.x', 'off')), 'oprit');
assert.equal(secondaryText(st('automation.x', 'on')), 'pornit'); assert.equal(secondaryText(st('switch.x', 'off')), 'oprit');
assert.equal(secondaryText(st('input_boolean.x', 'unavailable')), '—');
console.log('graph-attribute ok');
