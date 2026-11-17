// tests/robust.test.mjs — config scris greșit în YAML nu strică ecranul; text_map nu dublează valoarea. Rulare: node tests/robust.test.mjs
import assert from 'node:assert/strict';
import { setLang } from '../src/i18n.mjs'; setLang('en');
import { str, normalizeConfig } from '../src/config.mjs';
import { esc, renderButtons, renderChips } from '../src/render.mjs';
import { normalizeGraphConfig } from '../src/graph-card.mjs';
import { normalizeBatteryConfig } from '../src/energy.mjs';
import { stationUrl, normalizeRadio, radioModel } from '../src/radio.mjs';
import { classifyScene } from '../src/weather.mjs';

assert.equal(str({}), ''); assert.equal(str([1]), ''); assert.equal(str(NaN), ''); assert.equal(str(null), ''); assert.equal(str(5), '5'); assert.equal(str('x'), 'x');
assert.equal(esc({}), ''); assert.equal(esc(NaN), ''); assert.equal(esc(0), '0'); assert.equal(esc('<'), '&lt;');
assert.equal(normalizeGraphConfig({ title: {}, series: [{ entity: 'sensor.a' }] }).config.title, '');
assert.equal(normalizeBatteryConfig({ title: {}, soc: 'sensor.a' }).config.title, 'Battery');   // titlul prost cade pe cel implicit

const hass = { states: { 'light.a': { entity_id: 'light.a', state: 'on', attributes: { friendly_name: 'Lamp' } }, 'sensor.w': { entity_id: 'sensor.w', state: 'spinning', attributes: {} }, 'sensor.t': { entity_id: 'sensor.t', state: '38', attributes: { unit_of_measurement: 'min' } } } };
const btn = (c) => { const r = normalizeConfig(c); return renderButtons(r.config, hass, { warnings: r.warnings }); };
assert.ok(!/\[object Object\]/.test(btn({ title: {}, entities: ['light.a'] })));
assert.ok(!/\[object Object\]/.test(btn({ entities: [{ entity: 'light.a', name: { a: 1 } }] })));
assert.match(btn({ entities: [{ entity: 'light.a', name: { a: 1 } }] }), /Lamp/);   // nume ilizibil → numele prietenos al entității

const chip = (e) => { const r = normalizeConfig({ entities: [e] }); return renderChips(r.config, hass, { now: new Date() }); };
const A = chip({ entity: 'sensor.w', name: 'W', show_state: true, hide_off: true, on_states: ['spinning'], text_map: { spinning: 'Spin' } });
assert.match(A, /<b>Spin<\/b>/); assert.ok(!/Spin · Spin/.test(A));
const B = chip({ entity: 'sensor.w', name: 'W', show_state: true, hide_off: true, on_states: ['spinning'], text_map: { spinning: 'Spin' }, secondary: { entity: 'sensor.t' } });
assert.match(B, /Spin · 38/);   // cu `secondary` dat, se adaugă și a doua valoare

// radio: un nume de post poate conține „ - ”; adresa e ce urmează după ULTIMUL separator
assert.equal(stationUrl('Classic - https://x/a'), 'https://x/a');
assert.equal(stationUrl('Kiss - FM - https://x/c'), 'https://x/c');
assert.equal(stationUrl('Doar nume'), ''); assert.equal(stationUrl('ftp://x/y'), ''); assert.equal(stationUrl('javascript:alert(1)'), '');
const rc = normalizeRadio({ radio: { stations: 'input_select.r' } }).radio || normalizeRadio({ stations: 'input_select.r' });
const rm = radioModel(rc.stations ? rc : { ...rc, stations: 'input_select.r', hide: [], labels: {}, strip: ' - ' }, { states: { 'input_select.r': { state: 'Kiss - FM - https://x/c', attributes: { options: ['Kiss - FM - https://x/c', 'Classic - https://x/a'] } } } }, {});
assert.deepEqual(rm.stations.map((x) => x.label), ['Kiss - FM', 'Classic']);

// vreme: grindina se numește grindină (nu „ploaie torențială”), „windy” nu dublează cuvântul vânt
assert.equal(classifyScene({ cond: 'hail' }).label, 'Hail');
assert.ok(!/windy · windy|Wind · wind/i.test(classifyScene({ cond: 'windy', windKmh: 30 }).label));
assert.equal(classifyScene({ cond: 'windy', windKmh: 30 }).label, 'Windy');
console.log('robust ok');
