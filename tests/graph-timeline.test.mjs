// tests/graph-timeline.test.mjs — grafic „cronologie”: un rând pe serie, bare când e pornit (ventile, întrerupătoare)
// Rulat cu: node tests/graph-timeline.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeGraphConfig, buildGraphModel, renderGraphSvg, renderGraphCard, formatDuration, timelineHit } from '../src/graph-card.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };

const H = 3600e3, now = Date.parse('2026-11-15T12:00:00Z'), t0 = now - 24 * H;
const ser = (n) => Array.from({ length: n }, (_, i) => ({ entity: `binary_sensor.v${i}_valve`, name: `Zona ${i + 1}` }));
const cfgOf = (o) => normalizeGraphConfig({ timeline: true, range: '24h', series: ser(7), ...o });
const pts = (rows) => rows.map(([h, v]) => ({ t: t0 + h * H, v }));

// ---- config ----
let n = normalizeGraphConfig({ series: ser(7) });
ok('fără timeline: maximum 3 serii (ca înainte)', n.config.series.length === 3 && n.warnings.length === 1);
n = cfgOf({});
ok('timeline: până la 8 serii, fără avertisment', n.config.series.length === 7 && n.warnings.length === 0 && n.config.timeline === true, JSON.stringify(n.warnings));
n = cfgOf({ series: ser(10) });
ok('timeline: peste 8 → 8 și avertisment', n.config.series.length === 8 && n.warnings.length === 1 && n.warnings[0].includes('8'));
ok('timeline doar cu true', normalizeGraphConfig({ timeline: 'da', series: ser(1) }).config.timeline === false);

// ---- model ----
const data = ser(7).map((_, i) => pts(i === 0 ? [[0, 0], [2, 1], [5, 0], [10, 1], [12, 0]] : i === 1 ? [[0, 1]] : [[0, 0]]));
const m = buildGraphModel(cfgOf({}).config, data, 360, 150, now);
ok('modelul e de tip cronologie, cu 7 rânduri', m.timeline === true && m.lanes.length === 7);
ok('înălțimea crește cu numărul de rânduri', m.H > 7 * 20, String(m.H));
ok('rândul 1: două bare (2–5 h și 10–12 h)', m.lanes[0].segs.length === 2, JSON.stringify(m.lanes[0].segs));
ok('bara 2–5 h are lățimea 3 h din 24', Math.abs(m.lanes[0].segs[0].w - (3 / 24) * m.pw) < 1.5, String(m.lanes[0].segs[0].w));
ok('rândul 2: pornit tot intervalul = o bară cât tot spațiul', m.lanes[1].segs.length === 1 && Math.abs(m.lanes[1].segs[0].w - m.pw) < 1.5);
ok('rândul 3: mereu oprit = fără bare, dar cu date', m.lanes[2].segs.length === 0 && m.lanes[2].known === true);
ok('nu e „fără date”', m.empty === false);
const em = buildGraphModel(cfgOf({}).config, ser(7).map(() => []), 360, 150, now);
ok('fără istoric: empty', em.empty === true);

// ---- decupare și goluri ----
const early = pts([[-5, 1], [3, 0]]);   // pornit de dinainte de interval
const mm = buildGraphModel(cfgOf({ series: ser(1) }).config, [early], 360, 150, now);
ok('bara începe la marginea intervalului când starea vine de dinainte', mm.lanes[0].segs.length === 1 && Math.abs(mm.lanes[0].segs[0].x - mm.padL) < 1.1, JSON.stringify(mm.lanes[0].segs));
const gap = [{ t: t0, v: 1 }, { t: t0 + 4 * H, v: null }, { t: t0 + 6 * H, v: 1 }];
const mg = buildGraphModel(cfgOf({ series: ser(1) }).config, [gap], 360, 150, now);
ok('valoarea lipsă (indisponibil) lasă gol', mg.lanes[0].segs.length === 2, JSON.stringify(mg.lanes[0].segs));
const num = [{ t: t0, v: 0 }, { t: t0 + 2 * H, v: 450 }, { t: t0 + 4 * H, v: 0 }];
const mn = buildGraphModel(cfgOf({ series: ser(1) }).config, [num], 360, 150, now);
ok('o serie numerică: > 0 înseamnă pornit', mn.lanes[0].segs.length === 1);

// ---- SVG ----
const svg = renderGraphSvg(m);
ok('SVG cronologie, fără NaN', svg.includes('class="ccu-graph timeline"') && !/NaN/.test(svg));
ok('eticheta fiecărui rând apare', ['Zona 1', 'Zona 7'].every((s) => svg.includes(s)));
ok('barele sunt desenate', (svg.match(/class="on"/g) || []).length === 3);
const long = cfgOf({ series: [{ entity: 'binary_sensor.a_valve', name: 'O zonă cu un nume foarte, foarte lung care nu încape' }] }).config;
const ml = buildGraphModel(long, [pts([[0, 1]])], 300, 150, now);
ok('numele lung se taie cu „…” și nu ia tot rândul', renderGraphSvg(ml).includes('…') && ml.padL <= 300 * 0.4 + 1, String(ml.padL));
const html = renderGraphCard(cfgOf({ title: 'Ventile' }).config, m, { range: '24h', loading: false }, {});
ok('cardul: titlu, fără legendă separată', html.includes('Ventile') && !html.includes('ccu-legend'));
ok('lățime foarte mică nu aruncă', (() => { try { renderGraphSvg(buildGraphModel(cfgOf({}).config, data, 120, 80, now)); return true; } catch (e) { return false; } })());


// ---- durată, indisponibil, ore rotunde, atingere ----
ok('formatDuration: minute, ore, ore + minute', formatDuration(20000) === '<1 min' && formatDuration(45 * 60000) === '45 min' && formatDuration(2 * H) === '2 h' && formatDuration(85 * 60000) === '1 h 25 min');
const d2 = [[{ t: t0, v: 0 }, { t: t0 + 2 * H, v: 1 }, { t: t0 + 4.5 * H, v: 0 }, { t: t0 + 8 * H, v: null }, { t: t0 + 10 * H, v: 0 }]];
const m2d = buildGraphModel(cfgOf({ series: ser(1) }).config, d2, 400, 150, now);
const L = m2d.lanes[0];
ok('perioada pornită are începutul, sfârșitul și durata', L.segs.length === 1 && Math.abs(L.segs[0].dur - 2.5 * H) < 1000 && L.segs[0].a === t0 + 2 * H, JSON.stringify(L.segs[0]));
ok('perioada indisponibilă e păstrată separat (2 h)', L.na.length === 1 && Math.abs(L.na[0].dur - 2 * H) < 1000, JSON.stringify(L.na));
ok('totalul rândului = timpul pornit', L.total === 2.5 * H && L.totalText === '2 h 30 min', L.totalText);
const svg2 = renderGraphSvg(m2d);
ok('pe bară scrie durata', svg2.includes('2 h 30 min'));
ok('golul indisponibil e hașurat', svg2.includes('class="na"') && svg2.includes('url(#ccu-na)') && svg2.includes('<pattern id="ccu-na"'));
ok('totalul apare pe rând', (svg2.match(/class="tot"/g) || []).length === 1);
const hid = renderGraphSvg(buildGraphModel(cfgOf({ series: ser(1), hide_durations: true }).config, d2, 400, 150, now));
ok('hide_durations: fără durată pe bare și fără total', !hid.includes('class="dur"') && !hid.includes('class="tot"') && hid.includes('class="on"'));
const narrow = buildGraphModel(cfgOf({ series: ser(1) }).config, [[{ t: t0, v: 0 }, { t: t0 + 2 * H, v: 1 }, { t: t0 + 2.1 * H, v: 0 }]], 360, 150, now);
ok('bara prea îngustă nu primește text (dar rămâne)', renderGraphSvg(narrow).includes('class="on"') && !renderGraphSvg(narrow).includes('class="dur"'));
ok('axa: etichete cu ore rotunde', m2d.xticks.length >= 3 && m2d.xticks.every((tk) => /^\d\d:00$/.test(tk.label)), JSON.stringify(m2d.xticks.map((x) => x.label)));
ok('axa: orele sunt multiplu de 3 (24 h)', m2d.xticks.every((tk) => Number(tk.label.slice(0, 2)) % 3 === 0));
const mid = (x, y) => timelineHit(m2d, x, y);
const bar = L.segs[0], gapx = L.na[0];
const hOn = mid(bar.x + bar.w / 2, L.y + 5), hNa = mid(gapx.x + gapx.w / 2, L.y + 5), hOff = mid(m2d.padL + 3, L.y + 5);
ok('atingere pe bară: nume, „Pornit”, interval și durată', hOn && hOn.text.includes('Zona 1') && hOn.text.includes('Pornit') && hOn.text.includes('2 h 30 min'), hOn && hOn.text);
ok('atingere pe gol: „indisponibil” cu durata', hNa && hNa.text.includes('indisponibil') && hNa.text.includes('2 h'), hNa && hNa.text);
ok('atingere pe zona oprită: „Oprit” cu ora', hOff && hOff.text.includes('Oprit'), hOff && hOff.text);
ok('în afara rândurilor / etichetelor: null', mid(5, L.y + 5) === null && mid(m2d.padL + 20, m2d.H + 50) === null);
ok('timelineHit pe un grafic obișnuit: null', timelineHit({ timeline: false }, 10, 10) === null);

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
