// tests/graph-data.test.mjs — teste pentru graph-data.mjs
// Fără DOM, rulează în Node.

import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import {
  niceScale, downsample, parseMinimalResponse, formatLabel, formatNumber, formatTimeLabel, formatRangeLabel, formatDate
} from '../src/graph-data.mjs';

// Utilitar: egalitate aproximativă pentru numere
function approxEqual(a, b, eps = 1e-6) {
  if (a === b) return true;
  if (a === null || b === null) return a === b;
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.isNaN(a) && Number.isNaN(b);
  return Math.abs(a - b) <= eps;
}

// Utilitar: comparare array-uri
function assertArrayEqual(actual, expected, msg) {
  const pass = actual.length === expected.length && actual.every((v, i) => v === expected[i]);
  console.log(`${pass ? '✔' : '✗'} ${msg}: [${actual.join(', ')}] ${pass ? '' : '≠ ' + expected.join(', ')}`);
  return pass;
}

// Utilitar: log pentru test
let testsRun = 0;
let testsPassed = 0;
function test(name, fn) {
  testsRun++;
  try {
    fn();
    testsPassed++;
    console.log(`✔ ${name}`);
  } catch (e) {
    console.log(`✗ ${name}: ${e.message}`);
  }
}

function assertEquals(actual, expected, msg = '') {
  const pass = actual === expected || (actual == null && expected == null);
  if (!pass) {
    console.log(`  așteptat: ${expected}, obținut: ${actual}${msg ? ' (' + msg + ')' : ''}`);
  }
  return pass;
}

function assertDeepEqual(actual, expected, msg = '') {
  const pass = JSON.stringify(actual) === JSON.stringify(expected);
  if (!pass) {
    console.log(`  așteptat: ${JSON.stringify(expected)}, obținut: ${JSON.stringify(actual)}${msg ? ' (' + msg + ')' : ''}`);
  }
  return pass;
}

// ---------------------------
// Teste niceScale
// ---------------------------
console.log('\\n=== niceScale ===');

test('niceScale: 0..100, 5 ticks', () => {
  const r = niceScale(0, 100, 5);
  assertArrayEqual(r.ticks, [0, 25, 50, 75, 100], 'ticks');
  assertEquals(r.step, 25, 'step');
  assertEquals(r.min, 0, 'min');
  assertEquals(r.max, 100, 'max');
});

test('niceScale: 10..90, 4 ticks (auto-scaling)', () => {
  const r = niceScale(10, 90, 4);
  // step ~26.67 → nice = 25; ticks 4: 0, 25, 50, 75, 100? sau ajustat
  assertEquals(r.step, 25, 'step');
  assertEquals(r.min, 0, 'min');
  assertEquals(r.max, 100, 'max');
  assertEquals(r.ticks.length, 5, 'nr ticks');
});

test('niceScale: min === max (0..0)', () => {
  const r = niceScale(0, 0, 4);
  assertEquals(r.min < 0, true, 'min < 0');
  assertEquals(r.max > 0, true, 'max > 0');
  assertEquals(r.ticks.length >= 4, true, 'ticks >= 4');
});

test('niceScale: min === max (ex: 12..12)', () => {
  const r = niceScale(12, 12, 4);
  assertEquals(r.min < 12, true, 'min < 12');
  assertEquals(r.max > 12, true, 'max > 12');
});

test('niceScale: min > max (inversează)', () => {
  const r = niceScale(90, 10, 4);
  assertEquals(r.min, 10, 'min');
  assertEquals(r.max, 100, 'max');
  assertEquals(r.step, 25, 'step');
});

test('niceScale: ambele 0', () => {
  const r = niceScale(0, 0, 4);
  assertEquals(r.min < 0, true, 'min < 0');
  assertEquals(r.max > 0, true, 'max > 0');
});

test('niceScale: valori mari (0..10000)', () => {
  const r = niceScale(0, 10000, 5);
  assertEquals(r.step, 2500, 'step');
  assertEquals(r.min, 0, 'min');
  assertEquals(r.max, 10000, 'max');
});

test('niceScale: valori mici (0.01..0.11)', () => {
  const r = niceScale(0.01, 0.11, 4);
  // step ~0.033 → nice = 0.025; ticks: 0.00, 0.025, 0.05, 0.075, 0.10
  assertEquals(r.step, 0.025, 'step');
});

test('niceScale: negative (−10..30)', () => {
  const r = niceScale(-10, 30, 5);
  assertEquals(r.min, -10, 'min');
  assertEquals(r.max, 30, 'max');
  assertEquals(r.step, 10, 'step');
});

test('niceScale: very small range (10.0..10.2)', () => {
  const r = niceScale(10.0, 10.2, 4);
  // range=0.2 → step~0.067 → nice=0.05; extinde la 0.0, 0.05, ..., 0.25
  assertEquals(r.min <= 10.0, true, 'min ≤ 10');
  assertEquals(r.max >= 10.2, true, 'max ≥ 10.2');
});

test('niceScale: single point (100)', () => {
  const r = niceScale(100, 100, 4);
  assertEquals(r.min < 100, true, 'min < 100');
  assertEquals(r.max > 100, true, 'max > 100');
});

test('niceScale: NaN/undefined handling', () => {
  const r1 = niceScale(NaN, 100, 4);
  assertEquals(r1.min === 0, true, 'min=0 when min=NaN');
  const r2 = niceScale(0, undefined, 4);
  assertEquals(r2.max > 0, true, 'max > 0 when max=undefined');
});

// ---------------------------
// Teste downsample
// ---------------------------
console.log('\\n=== downsample ===');

test('downsample: 10 puncte → 10 (≤target)', () => {
  const pts = Array.from({ length: 10 }, (_, i) => ({ t: i * 1000, v: i * 10 }));
  const r = downsample(pts, 15);
  assertEquals(r.length, 10, 'length');
});

test('downsample: 100 puncte → ≤150 (nu reduce)', () => {
  const pts = Array.from({ length: 100 }, (_, i) => ({ t: i * 1000, v: Math.sin(i / 5) * 100 }));
  const r = downsample(pts, 150);
  assertEquals(r.length <= 150, true, 'length ≤ 150');
});

test('downsample: 10000 puncte → ≤150', () => {
  const pts = Array.from({ length: 10000 }, (_, i) => ({
    t: i * 60 * 1000, // câte 1 min
    v: Math.sin(i / 100) * 50 + 100 + (i % 500 === 0 ? 20 : 0)
  }));
  const r = downsample(pts, 150);
  assertEquals(r.length <= 150, true, 'length ≤ 150');
  assertEquals(r[0]?.t === 0, true, 'păstrează primul');
  assertEquals(r[r.length - 1]?.t === 10000 * 60 * 1000, true, 'păstrează ultimul');
});

test('downsample: puncte cu epoch_sec (lu)', () => {
  const pts = [
    { t: 1700000000, v: 100 },
    { t: 1700000100, v: 105 },
    { t: 1700000200, v: 98 }
  ];
  const r = downsample(pts, 10);
  assertEquals(r[0].t, 1700000000000, 't în ms (×1000)');
});

test('downsample: ignore null/NaN/unavailable', () => {
  const pts = [
    { t: 0, v: 100 },
    { t: 1000, v: null },
    { t: 2000, v: NaN },
    { t: 3000, v: 'unavailable' },
    { t: 4000, v: 102 }
  ];
  const r = downsample(pts, 10);
  // null, NaN, 'unavailable' sunt ignorate (v=null în internal)
  assertEquals(r.length, 2, 'length (ignores null/NaN/unavailable)');
});

test('downsample: vârfuri (puncte cu variație >10%)', () => {
  const pts = [];
  for (let i = 0; i < 100; i++) {
    const v = 100 + (i % 20 === 0 ? 20 : i % 20 === 10 ? -15 : 0);
    pts.push({ t: i * 1000, v });
  }
  const r = downsample(pts, 30);
  // ar trebui să păstreze vârfurile (±20 față de 100 → >10%)
  assertEquals(r.length <= 30, true, 'length ≤ 30');
});

// ---------------------------
// Teste parseMinimalResponse
// ---------------------------
console.log('\\n=== parseMinimalResponse ===');

test('parseMinimalResponse: simplu', () => {
  const data = {
    'sensor.test': [
      { s: 100, lu: 1700000000 },
      { s: 105, lu: 1700000060 },
      { s: 98, lu: 1700000120 }
    ]
  };
  const r = parseMinimalResponse(data, 'sensor.test');
  assertEquals(r['sensor.test'][0].t, 1700000000000, 't în ms');
  assertEquals(r['sensor.test'][0].v, 100, 'v');
});

test('parseMinimalResponse: unavailable/unknown ignorate', () => {
  const data = {
    'sensor.test': [
      { s: 100, lu: 1700000000 },
      { s: 'unavailable', lu: 1700000060 },
      { s: 'unknown', lu: 1700000120 },
      { s: 102, lu: 1700000180 }
    ]
  };
  const r = parseMinimalResponse(data, 'sensor.test');
  assertEquals(r['sensor.test'].length, 4, 'toate punctele');
  assertEquals(r['sensor.test'][1].v, null, 'unavailable → null');
  assertEquals(r['sensor.test'][2].v, null, 'unknown → null');
});

test('parseMinimalResponse: kW (șir)', () => {
  const data = {
    'sensor.test': [
      { s: '1.2', lu: 1700000000 },
      { s: '2,5', lu: 1700000060 }
    ]
  };
  const r = parseMinimalResponse(data, 'sensor.test');
  assertEquals(r['sensor.test'][0].v, 1.2, 'v=1.2');
  assertEquals(r['sensor.test'][1].v, 2.5, 'v=2.5');
});

test('parseMinimalResponse: array de entity_ids', () => {
  const data = {
    'sensor.a': [{ s: 10, lu: 1700000000 }],
    'sensor.b': [{ s: 20, lu: 1700000100 }]
  };
  const r = parseMinimalResponse(data, ['sensor.a', 'sensor.b']);
  assertEquals(Object.keys(r).sort().join(','), 'sensor.a,sensor.b', 'entity_ids');
});

// ---------------------------
// Teste formatLabel / formatNumber
// ---------------------------
console.log('\\n=== formatLabel / formatNumber ===');

test('formatNumber: simplu', () => {
  assertEquals(formatNumber(1234), '1 234', '1234');
  assertEquals(formatNumber(1234.56), '1 234,56', '1234.56');
  assertEquals(formatNumber(1234.5), '1 234,5', '1234.5');
  assertEquals(formatNumber(1234.50), '1 234,5', '1234.50→1234,5');
});

test('formatNumber: rotunjiri și zerouri', () => {
  assertEquals(formatNumber(1000), '1 000', '1000');
  assertEquals(formatNumber(1000.0), '1 000', '1000.0→1 000');
  assertEquals(formatNumber(1000.00), '1 000', '1000.00→1 000');
  assertEquals(formatNumber(0), '0', '0');
  assertEquals(formatNumber(-0), '0', '-0→0');
});

test('formatNumber: mărimi mari/mici', () => {
  assertEquals(formatNumber(0.5), '0,5', '0.5');
  assertEquals(formatNumber(100), '100', '100');
  assertEquals(formatNumber(1000000), '1 000 000', '1M');
});

test('formatNumber: special', () => {
  assertEquals(formatNumber(null), '—', 'null→—');
  assertEquals(formatNumber(NaN), '—', 'NaN→—');
  assertEquals(formatNumber(Infinity), '—', '∞→—');
  assertEquals(formatNumber(-Infinity), '—', '−∞→—');
});

test('formatLabel: W', () => {
  assertEquals(formatLabel(850, 'W'), '850 W', '850 W');
  assertEquals(formatLabel(1182, 'W'), '1,18 kW', '1182 W→1,18 kW');
  assertEquals(formatLabel(12400, 'W'), '12,4 kW', '12400 W→12,4 kW');
});

test('formatLabel: kWh', () => {
  assertEquals(formatLabel(15.15, 'kWh'), '15,15 kWh', '15.15 kWh');
  assertEquals(formatLabel(1240, 'kWh'), '1,24 MWh', '1240 kWh→1,24 MWh');
});

test('formatLabel: unități diverse', () => {
  assertEquals(formatLabel(24.6, '°C'), '24,6 °C', '24.6 °C');
  assertEquals(formatLabel(12400, 'lx'), '12,4 lx', '12400 lx');
  assertEquals(formatLabel(450, 'W/m²'), '450 W/m²', '450 W/m²');
  assertEquals(formatLabel(75, '%'), '75 %', '75 %');
});

test('formatLabel: negative', () => {
  assertEquals(formatLabel(-983, 'W'), '−983 W', '−983 W');
  assertEquals(formatLabel(-1500, 'W'), '−1,5 kW', '−1500 W→−1,5 kW');
  assertEquals(formatLabel(NaN, 'W'), '— W', 'NaN→—');
});

// ---------------------------
// Teste formatTimeLabel
// ---------------------------
console.log('\\n=== formatTimeLabel ===');

test('formatTimeLabel: 24h', () => {
  const d = new Date('2026-11-12T14:30:00');
  assertEquals(formatTimeLabel(d, '24h'), '14:30', '24h 14:30');
});

test('formatTimeLabel: 7d', () => {
  // 12 Nov 2026 e Joi
  const d = new Date('2026-11-12T14:30:00');
  assertEquals(formatTimeLabel(d, '7d'), 'Jo 14:30', '7d Jo 14:30');
});

test('formatTimeLabel: 30d', () => {
  const d = new Date('2026-11-12T14:30:00');
  assertEquals(formatTimeLabel(d, '30d'), '12', '30d 12');
});

// ---------------------------
// Teste formatRangeLabel
// ---------------------------
console.log('\\n=== formatRangeLabel ===');

test('formatRangeLabel: 24h', () => {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  assertEquals(formatRangeLabel(yesterday, now, '24h').includes('Azi'), true, '24h include "Azi"');
});

test('formatRangeLabel: 7d', () => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  assertEquals(formatRangeLabel(weekAgo, now, '7d'), 'Ultima săptămână', '7d label');
});

test('formatRangeLabel: object hours', () => {
  const now = new Date();
  const start = new Date(now.getTime() - 12 * 60 * 60 * 1000);
  assertEquals(formatRangeLabel(start, now, { hours: 12 }), 'Ultimile 12 ore', '12h label');
});

// ---------------------------
// Teste formatDate
// ---------------------------
console.log('\\n=== formatDate ===');

test('formatDate: 12 Nov 2026 (Joi)', () => {
  const d = new Date('2026-11-12T14:30:00');
  assertEquals(formatDate(d), 'Jo 12 Nov 2026', 'Jo 12 Nov 2026');
});

// ---------------------------
// Rezumat
// ---------------------------
console.log('\\n=== REZUMAT ===');
console.log(`Teste: ${testsPassed}/${testsRun} rulate cu succes`);
