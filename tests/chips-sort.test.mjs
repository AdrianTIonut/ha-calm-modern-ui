import assert from 'node:assert/strict';
import { renderChips } from '../src/render.mjs';
const hass = { states: {
  'binary_sensor.a': { state: 'on', attributes: {}, last_changed: '2026-11-17T10:00:00Z' },
  'binary_sensor.b': { state: 'on', attributes: {}, last_changed: '2026-11-17T08:00:00Z' },
  'binary_sensor.c': { state: 'on', attributes: {}, last_changed: '2026-11-17T09:00:00Z' } } };
const ents = ['a', 'b', 'c'].map((x) => ({ entity: 'binary_sensor.' + x, name: x.toUpperCase() }));
const order = (cfg) => [...renderChips(cfg, hass).matchAll(/data-entity="binary_sensor\.(\w)"/g)].map((m) => m[1]).join('');
assert.equal(order({ entities: ents }), 'abc');
assert.equal(order({ entities: ents, sort: true }), 'bca');
console.log('chips-sort ok');
const off = [{ entity: 'binary_sensor.a', name: 'A', hide_off: true }];
const hoff = { states: { 'binary_sensor.a': { state: 'off', attributes: {}, last_changed: '2026-11-17T10:00:00Z' } } };
assert.ok(!/class="ccu-chip"/.test(renderChips({ entities: off }, hoff)));
assert.match(renderChips({ entities: off }, hoff, { preview: true }), /<span data-inactive="1"[^>]*class="ccu-chip"/);
console.log('chips-preview ok');
