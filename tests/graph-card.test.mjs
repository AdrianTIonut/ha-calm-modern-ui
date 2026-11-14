// tests/graph-card.test.mjs — graph-card.mjs (model, SVG, config, reducere). Rulare: node tests/graph-card.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { formatValue, rangeHours, seriesColor, normalizeGraphConfig, buildGraphModel, renderGraphSvg, renderGraphCard, nearestPoint, thin } from '../src/graph-card.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const NOW = Date.UTC(2026, 10, 14, 12, 0, 0);
const mk = (n, f, step = 300e3) => Array.from({ length: n }, (_, i) => ({ t: NOW - (n - i) * step, v: f(i) }));
const cfg = (o = {}) => normalizeGraphConfig({ series: [{ entity: 'sensor.a', unit: 'W' }], ...o }).config;

t('rangeHours: texte și obiect', () => rangeHours('6h') === 6 && rangeHours('24h') === 24 && rangeHours('7d') === 168 && rangeHours('30d') === 720 && rangeHours({ hours: 12 }) === 12 && rangeHours(8) === 8 || 'ore');
t('rangeHours: necunoscut → 24', () => rangeHours('xyz') === 24 && rangeHours(null) === 24 && rangeHours(-5) === 24 && rangeHours({ hours: 'x' }) === 24 || 'implicit');
t('seriesColor: token → var()', () => seriesColor('yellow', 0) === 'var(--ccu-c-yellow)' && seriesColor('accent', 0) === 'var(--ccu-series)' || 'token');
t('seriesColor: YAML `color: on` (true) → token on', () => seriesColor(true, 0) === 'var(--ccu-on)' || seriesColor(true, 0));
t('seriesColor: #hex valid', () => seriesColor('#ff8800', 0) === '#ff8800');
t('seriesColor: injecție respinsă → culoarea implicită', () => seriesColor('red;background:url(x)', 1) === 'var(--ccu-c-yellow)' || seriesColor('red;background:url(x)', 1));

t('config: seria scurtă (șir) și lungă', () => { const c = normalizeGraphConfig({ series: ['sensor.a', { entity: 'sensor.b', name: 'B' }] }); return (c.config.series.length === 2 && c.config.series[0].kind === 'area' && c.config.series[1].kind === 'line' && c.warnings.length === 0) || JSON.stringify(c); });
t('config: entity invalid eliminat + avertisment', () => { const c = normalizeGraphConfig({ series: ['fara_punct', 'sensor.a'] }); return (c.config.series.length === 1 && c.warnings.length === 1) || JSON.stringify(c.warnings); });
t('config: max 3 serii', () => { const c = normalizeGraphConfig({ series: ['sensor.a', 'sensor.b', 'sensor.c', 'sensor.d'] }); return (c.config.series.length === 3 && c.warnings.length === 1) || JSON.stringify(c.warnings); });
t('config: fără config/series nu aruncă', () => normalizeGraphConfig(undefined).config.series.length === 0 && normalizeGraphConfig({ series: 5 }).config.series.length === 0 || 'gol');
t('config: height în limite, refresh implicit 5', () => { const c = normalizeGraphConfig({ series: ['sensor.a'], height: 9999 }).config; return (c.height === 0 && c.refresh_minutes === 5) || JSON.stringify(c); });
t('config: kind necunoscut → implicit', () => normalizeGraphConfig({ series: [{ entity: 'sensor.a', kind: 'bars' }] }).config.series[0].kind === 'area');

t('formatValue: kW rămâne kW', () => formatValue(2.5, 'kW').replace(/\u202f/g, ' ') === '2,50 kW' && formatValue(0, 'kW') === '0 kW' || formatValue(2.5, 'kW'));
t('formatValue: W ≥ 1000 → kW, sub 1000 rămâne W', () => formatValue(1500, 'W').replace(/\u202f/g, ' ') === '1,50 kW' && formatValue(450, 'W') === '450 W' || formatValue(1500, 'W'));
t('formatValue: negative, NaN, fără unitate', () => formatValue(-2.5, 'kW').startsWith('−2,50') && formatValue(NaN, 'kW') === '—' && formatValue(7, '') === '7' || formatValue(-2.5, 'kW'));
t('model: serie în kW → etichete în kW', () => { const m = buildGraphModel(cfg({ series: [{ entity: 'sensor.a', unit: 'kW' }] }), [mk(100, (i) => 1 + i / 50)], 360, 150, NOW); return m.grid.every((g) => / kW$/.test(g.label)) || JSON.stringify(m.grid); });
t('thin: ≤ target → neschimbat', () => thin(mk(100, (i) => i), 150).length === 100);
t('thin: 10 000 → ≤ 150', () => { const r = thin(mk(10000, (i) => Math.sin(i / 50) * 100), 150); return (r.length <= 150 && r.length >= 60) || r.length; });
t('thin: 288 → mai mult de 100 puncte (nu 2)', () => { const r = thin(mk(288, (i) => 1300 + 500 * Math.sin(i / 17)), 150); return (r.length > 100 && r.length <= 150) || r.length; });
t('thin: păstrează primul și ultimul', () => { const s = mk(1000, (i) => i); const r = thin(s, 100); return (r[0] === s[0] && r[r.length - 1] === s[s.length - 1]) || 'capete'; });
t('thin: păstrează vârful izolat', () => { const s = mk(1000, () => 10); s[437].v = 999; return thin(s, 100).some((p) => p.v === 999) || 'vârf pierdut'; });
t('thin: ordine cronologică', () => { const r = thin(mk(2000, (i) => Math.sin(i) * 50), 120); for (let i = 1; i < r.length; i++) if (r[i].t < r[i - 1].t) return 'dezordine'; return true; });
t('thin: golurile (null) rămân ca separatori', () => { const s = mk(600, () => 5); for (let i = 200; i < 300; i++) s[i].v = null; return thin(s, 100).some((p) => p.v === null) || 'gol pierdut'; });
t('thin: intrare ciudată nu aruncă', () => thin(null).length === 0 && thin([null, { t: 1, v: 1 }], 10).length === 1 || 'intrare');

const model = (n = 288, w = 360, o = {}) => buildGraphModel(cfg(o), [mk(n, (i) => 1300 + 500 * Math.sin(i / 17))], w, 150, NOW);
t('model: fără NaN/Infinity în SVG', () => { const s = renderGraphSvg(model()); return !/NaN|Infinity|undefined/.test(s) || 'valori invalide'; });
t('model: coordonatele în viewBox (340/392/500)', () => { for (const w of [340, 392, 500]) { const m = model(288, w); for (const p of m.series[0].points) if (p.x < 0 || p.x > m.W || p.y < 0 || p.y > m.H) return `în afara viewBox la ${w}`; } return true; });
t('model: etichetele X nu se suprapun', () => { for (const w of [340, 392, 500]) { const m = model(288, w); for (let i = 1; i < m.xticks.length; i++) if (m.xticks[i].x - m.xticks[i - 1].x < 46) return `suprapunere la ${w}`; } return true; });
t('model: scara Y cu 3–6 gradații', () => { const m = model(); return (m.grid.length >= 3 && m.grid.length <= 6) || m.grid.length; });
t('model: etichete în kW de la 1000 W', () => model().grid.some((g) => /kW/.test(g.label)) || JSON.stringify(model().grid));
t('model: fără date → empty', () => buildGraphModel(cfg(), [[]], 360, 150, NOW).empty === true);
t('model: toate valorile null → empty, fără excepție', () => buildGraphModel(cfg(), [mk(50, () => null)], 360, 150, NOW).empty === true);
t('model: un singur punct nu aruncă', () => { const m = buildGraphModel(cfg(), [[{ t: NOW - 1000, v: 5 }]], 360, 150, NOW); return (m.series.length === 1 && !/NaN/.test(renderGraphSvg(m))) || 'punct'; });
t('model: serie constantă nu dă NaN', () => !/NaN/.test(renderGraphSvg(buildGraphModel(cfg(), [mk(100, () => 7)], 360, 150, NOW))));
t('model: valori negative', () => { const m = buildGraphModel(cfg(), [mk(100, (i) => -500 + i * 10)], 360, 150, NOW); return (!/NaN/.test(renderGraphSvg(m)) && m.grid.some((g) => /−/.test(g.label))) || 'negative'; });
t('model: gol în serie → linie întreruptă (două „M”)', () => { const d = mk(200, (i) => 10 + i % 7); for (let i = 80; i < 120; i++) d[i].v = null; const m = buildGraphModel(cfg(), [d], 360, 150, NOW); const n = (m.series[0].line.match(/M/g) || []).length; return n === 2 || n; });
t('model: puncte în afara intervalului sunt tăiate', () => { const d = [{ t: NOW - 100 * 3600e3, v: 1 }, ...mk(50, () => 2)]; const m = buildGraphModel(cfg(), [d], 360, 150, NOW); return m.series[0].points.every((p) => p.x >= m.padL - 1) || 'în afara'; });
t('model: a doua serie cu altă unitate → axă dreapta', () => { const c = cfg({ series: [{ entity: 'sensor.a', unit: 'W' }, { entity: 'sensor.b', unit: '%' }] }); const m = buildGraphModel(c, [mk(100, (i) => i * 20), mk(100, (i) => i)], 400, 150, NOW); return (m.hasRight === true && /<text x="\d+(\.\d+)?" y="[\d.]+">/.test(renderGraphSvg(m))) || m.hasRight; });
t('model: aceeași unitate → fără axă dreapta', () => { const c = cfg({ series: [{ entity: 'sensor.a', unit: 'W' }, { entity: 'sensor.b', unit: 'W' }] }); return buildGraphModel(c, [mk(10, (i) => i), mk(10, (i) => i)], 400, 150, NOW).hasRight === false; });
t('model: interval 7d → etichete', () => { const m = buildGraphModel(cfg({ range: '7d' }), [mk(200, (i) => i, 3000e3)], 400, 150, NOW); return (m.xticks.length >= 3 && m.xticks.every((x) => /\w/.test(x.label))) || 'etichete'; });

t('nearestPoint: cel mai apropiat', () => { const p = [{ x: 0 }, { x: 10 }, { x: 20 }, { x: 30 }]; return (nearestPoint(p, 12).x === 10 && nearestPoint(p, 26).x === 30 && nearestPoint(p, -5).x === 0 && nearestPoint(p, 99).x === 30) || 'căutare'; });
t('nearestPoint: gol/null → null', () => nearestPoint([], 5) === null && nearestPoint(null, 5) === null);

const card = (m, state = {}, c = cfg({ title: 'T', tabs: ['24h', '7d'] })) => renderGraphCard(c, m, { range: '24h', ...state }, {});
t('card: titlu și file, fila curentă activă', () => { const h = card(model()); return (h.includes('ccu-tab') && h.includes('data-tab="0" data-state="on"') && h.includes('data-tab="1" data-state="off"')) || h; });
t('card: titlu escapat', () => card(model(), {}, cfg({ title: '<b>x</b>' })).includes('&lt;b&gt;') || 'escape');
t('card: fără date → mesaj, nu svg', () => { const h = card(buildGraphModel(cfg(), [[]], 360, 150, NOW)); return (h.includes('fără date istorice') && !h.includes('<svg')) || h; });
t('card: se încarcă → mesaj', () => card(buildGraphModel(cfg(), [[]], 360, 150, NOW), { loading: true }).includes('se încarcă') || 'loading');
t('card: legendă doar la ≥ 2 serii', () => { const one = card(model()); const c2 = cfg({ series: [{ entity: 'sensor.a', unit: 'W' }, { entity: 'sensor.b', unit: 'W', name: 'Solar' }] }); const two = card(buildGraphModel(c2, [mk(10, (i) => i), mk(10, (i) => i)], 360, 150, NOW), {}, c2); return (!one.includes('ccu-legend') && two.includes('ccu-legend') && two.includes('Solar')) || 'legendă'; });
t('card: înălțime rezervată (min-height)', () => card(model()).includes('min-height:150px') || 'min-height');
t('card: o singură filă → fără bară de file', () => !card(model(), {}, cfg({ tabs: ['24h'] })).includes('ccu-tabs') || 'o filă');

t('etichete Y lungi (ppb/ppm) încap: spațiul din stânga crește cu lungimea etichetei', () => { const m = buildGraphModel(cfg({ series: [{ entity: 'sensor.a', unit: 'ppb' }] }), [mk(100, (i) => 1800 + i * 4)], 360, 150, NOW); const w = Math.max(...m.grid.map((g) => g.label.length)); const small = buildGraphModel(cfg({ series: [{ entity: 'sensor.a', unit: 'kW' }] }), [mk(100, (i) => 1 + i / 50)], 360, 150, NOW); return (m.padL >= w * 6.5 && m.padL > small.padL) || JSON.stringify([m.padL, w, small.padL, m.grid.map((g) => g.label)]); });

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
