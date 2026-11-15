// tests/graph-binary.test.mjs — grafic: serii pornit / oprit (ventile, întrerupătoare) ca trepte, intervale libere (48h, 3d)
// Rulat cu: node tests/graph-binary.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { parseMinimalResponse, discreteValue } from '../src/graph-data.mjs';
import { normalizeGraphConfig, buildGraphModel, rangeHours, renderGraphSvg } from '../src/graph-card.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };

// ---- intervale ----
ok('48h este acceptat', rangeHours('48h') === 48);
ok('3d = 72 h', rangeHours('3d') === 72);
ok('90d e limita', rangeHours('90d') === 2160 && rangeHours('91d') === 24);
ok('0h și text invalid → 24', rangeHours('0h') === 24 && rangeHours('abc') === 24 && rangeHours(undefined) === 24);
ok('intervalele vechi merg la fel', rangeHours('6h') === 6 && rangeHours('7d') === 168 && rangeHours(36) === 36 && rangeHours({ hours: 12 }) === 12);
let n = normalizeGraphConfig({ series: ['sensor.a'], range: '48h' });
ok('48h nu mai dă avertisment', n.warnings.length === 0, JSON.stringify(n.warnings));
n = normalizeGraphConfig({ series: ['sensor.a'], range: '9 zile' });
ok('interval necunoscut: avertisment fără ghilimele duble', n.warnings.length === 1 && !n.warnings[0].includes('""'), JSON.stringify(n.warnings));

// ---- stări pornit / oprit ----
ok('discreteValue: on/off/open/closed/home/not_home', [discreteValue('on'), discreteValue('off'), discreteValue('open'), discreteValue('closed'), discreteValue('home'), discreteValue('not_home')].join() === '1,0,1,0,1,0');
ok('discreteValue: altceva → undefined', discreteValue('heat') === undefined && discreteValue('23.5') === undefined && discreteValue(undefined) === undefined);
const t0 = Date.parse('2026-11-15T00:00:00Z'), H = 3600e3;
const raw = { 'binary_sensor.valve': [{ s: 'off', lu: t0 / 1000 }, { s: 'on', lu: (t0 + 2 * H) / 1000 }, { s: 'off', lu: (t0 + 5 * H) / 1000 }], 'sensor.t': [{ s: '21.5', lu: t0 / 1000 }] };
const parsed = parseMinimalResponse(raw, ['binary_sensor.valve', 'sensor.t']);
ok('on/off devin 0/1 și seria e marcată binară', parsed['binary_sensor.valve'].map((p) => p.v).join() === '0,1,0' && parsed['binary_sensor.valve'].binary === true);
ok('seria numerică nu e binară', parsed['sensor.t'].binary !== true);
ok('unavailable rămâne gol', parseMinimalResponse({ x: [{ s: 'unavailable', lu: 1 }] }, ['x']).x[0].v === null);

// ---- model: trepte ----
const cfg = normalizeGraphConfig({ series: [{ entity: 'binary_sensor.valve', name: 'Ventil' }], range: '12h' }).config;
const now = t0 + 8 * H;
const pts = parsed['binary_sensor.valve'].slice(); pts.binary = true; pts.push({ t: now, v: 0 }); pts.unit = '';
const m = buildGraphModel(cfg, [pts], 360, 150, now);
ok('axa are două trepte: Oprit / Pornit', m.grid.length === 2 && m.grid[0].label !== m.grid[1].label && /Oprit|Pornit/.test(m.grid.map((g) => g.label).join()), JSON.stringify(m.grid.map((g) => g.label)));
ok('seria se desenează (nu mai e „fără date”)', !m.empty && m.series[0].line.length > 0);
ok('seria e marcată binary', m.series[0].binary === true);
const segs = (m.series[0].line.match(/L/g) || []).length;
ok('trepte: mai multe segmente decât punctele (verticale + orizontale)', segs >= 5, String(segs));
ok('SVG fără NaN', !/NaN/.test(renderGraphSvg(m)));
const numeric = [{ t: t0, v: 20 }, { t: t0 + H, v: 22 }]; numeric.unit = '°C';
const m2 = buildGraphModel(normalizeGraphConfig({ series: ['sensor.t'] }).config, [numeric], 360, 150, now);
ok('grafic numeric neschimbat (etichete cu °C)', m2.grid.some((g) => /°C/.test(g.label)) && m2.series[0].binary === false);
const mixed = buildGraphModel(normalizeGraphConfig({ series: ['sensor.t', 'binary_sensor.valve'] }).config, [numeric, pts], 360, 150, now);
ok('serie numerică + binară: nu aruncă, ambele se desenează', !mixed.empty && !/NaN/.test(renderGraphSvg(mixed)));

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
