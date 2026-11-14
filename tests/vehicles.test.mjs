// tests/vehicles.test.mjs — termenele mașinilor: dată (RCA / ITP / rovinietă) și km (ulei). Rulare: node tests/vehicles.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { renderChips } from '../src/render.mjs';
import { normalizeVehicles, parseDate, daysUntil, documentModel, buildVehiclesModel, dueDocuments, normalizeDeadlines, renderVehicles } from '../src/vehicles.mjs';

let pass = 0, fail = 0;
const T = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + JSON.stringify(r)); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const NOW = new Date(2026, 10, 14, 15, 30);           // 14 nov 2026, după-amiază
const ymd = (n) => { const d = new Date(2026, 10, 14 + n); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const st = (s, a) => ({ state: String(s), attributes: a || {} });

const cfg = normalizeVehicles({ title: 'Mașini', alert_days: 3, vehicles: [
  { name: 'Audi A3', plate: 'B 00 XYZ', documents: [
    { label: 'RCA', entity: 'input_datetime.audi_rca' }, { label: 'ITP', entity: 'input_datetime.audi_itp' }, { label: 'Rovinietă', entity: 'input_datetime.audi_rov' },
    { label: 'Revizie', entity: 'sensor.audi_service_date' },
    { label: 'Ulei', odometer: 'sensor.audi_odometer', last_km: 'input_number.audi_oil_km', interval_km: 10000 } ] },
  { name: 'Fiat Scudo', documents: [{ label: 'RCA', entity: 'input_datetime.scudo_rca' }] },
] });

T('normalizeVehicles: mașini, documente, tipuri (dată / km), implicite', () => cfg.warnings.length === 0 && cfg.vehicles.length === 2 && cfg.vehicles[0].documents.length === 5 && cfg.vehicles[0].documents[0].kind === 'date' && cfg.vehicles[0].documents[4].kind === 'km' && cfg.alert_days === 3 && cfg.alert_km === 500 && cfg.vehicles[0].documents[4].interval_km === 10000 || cfg);
T('normalizeVehicles: documente invalide → avertisment, fără excepții; fără config', () => { const n = normalizeVehicles({ vehicles: [{ name: 'X', documents: [{ label: 'a' }, { label: 'b', entity: 'nu e id' }, { label: 'c', odometer: 'sensor.o' }] }, 5] }); return n.warnings.length >= 3 && normalizeVehicles(undefined).vehicles.length === 0 && normalizeVehicles({}).alert_days === 3 || n.warnings; });
T('parseDate: 2026-11-14, ISO cu oră; unknown / unavailable / 1970 (nesetat) / gunoi → null', () => parseDate('2026-11-14').getDate() === 14 && parseDate('2026-11-14T08:30:00+00:00').getMonth() === 10 && parseDate('unknown') === null && parseDate('unavailable') === null && parseDate('1970-01-01') === null && parseDate('azi') === null && parseDate('') === null && parseDate(undefined) === null);
T('daysUntil: azi 0, mâine 1, ieri −1, peste lună; nu depinde de ora zilei', () => daysUntil(new Date(2026, 10, 14), NOW) === 0 && daysUntil(new Date(2026, 10, 15), NOW) === 1 && daysUntil(new Date(2026, 10, 13), NOW) === -1 && daysUntil(new Date(2026, 11, 14), NOW) === 30 && daysUntil(new Date(2026, 10, 15), new Date(2026, 10, 14, 23, 59)) === 1);

const H = (o) => ({ states: { 'input_datetime.audi_rca': st(ymd(60)), 'input_datetime.audi_itp': st(ymd(3)), 'input_datetime.audi_rov': st(ymd(1)), 'sensor.audi_service_date': st('2027-09-29', { device_class: 'date' }), 'sensor.audi_odometer': st(52490), 'input_number.audi_oil_km': st(52090), 'input_datetime.scudo_rca': st('1970-01-01'), ...o } });
const docs = () => buildVehiclesModel(cfg, H(), NOW);

T('stări: peste 3 zile = ok; 3 zile = soon (limita inclusiv); mâine = soon', () => { const d = docs()[0].docs; return d[0].status === 'ok' && d[1].status === 'soon' && d[1].text === 'în 3 zile' && d[2].status === 'soon' && d[2].text === 'mâine' || d.map((x) => x.status + ':' + x.text); });
T('stări: 4 zile încă ok (alerta începe cu 3 zile înainte)', () => documentModel(cfg.vehicles[0].documents[0], cfg, H({ 'input_datetime.audi_rca': st(ymd(4)) }), NOW).status === 'ok');
T('stări: azi = soon „azi”; ieri = expirat; acum 5 zile = „expirat de 5 zile”; acum o zi „expirat de o zi”', () => { const m = (n) => documentModel(cfg.vehicles[0].documents[0], cfg, H({ 'input_datetime.audi_rca': st(ymd(n)) }), NOW); return m(0).status === 'soon' && m(0).text === 'azi' && m(-1).status === 'expired' && m(-1).text === 'expirat de o zi' && m(-5).text === 'expirat de 5 zile' || [m(0), m(-1)]; });
T('dată nesetată (1970 / unknown / entitate lipsă) → „Setează data”, fără alertă', () => { const d = documentModel(cfg.vehicles[1].documents[0], cfg, H(), NOW); const e = documentModel(cfg.vehicles[1].documents[0], cfg, { states: {} }, NOW); return d.status === 'unset' && d.text === 'Setează data' && d.editable === true && e.status === 'unset' || [d, e]; });
T('senzor cu dată (Audi service_date) e doar citit, nu editabil', () => { const d = docs()[0].docs[3]; return d.status === 'ok' && d.editable === false && d.valueText === '29.09.2027' || d; });
T('ulei: 52.490 − 52.090 = 400 km făcuți → mai sunt 9.600 km din 10.000', () => { const d = docs()[0].docs[4]; return d.kind === 'km' && d.km === 9600 && d.status === 'ok' && d.text.includes('9') && d.text.includes('600 km') && d.editable === true || d; });
T('ulei: sub 500 km = soon; la 0 / depășit = expirat „depășit cu N km”', () => { const m = (odo) => documentModel(cfg.vehicles[0].documents[4], cfg, H({ 'sensor.audi_odometer': st(odo) }), NOW); return m(52090 + 9600).status === 'soon' && m(52090 + 10000).status === 'expired' && m(52090 + 10250).text.startsWith('depășit cu') && m(52090 + 9400).status === 'ok' || [m(61690), m(62090), m(62340)]; });
T('ulei: după „schimbat acum” (last_km = odometru) revine 10.000 km', () => { const d = documentModel(cfg.vehicles[0].documents[4], cfg, H({ 'input_number.audi_oil_km': st(52490) }), NOW); return d.km === 10000 && d.status === 'ok' || d; });
T('ulei din senzor „km rămași” (remaining) — ex. Audi next_oil_change', () => { const c = normalizeVehicles({ vehicles: [{ name: 'A', documents: [{ label: 'Ulei', remaining: 'sensor.next_oil' }] }] }); const d = documentModel(c.vehicles[0].documents[0], c, { states: { 'sensor.next_oil': st(300) } }, NOW); return d.status === 'soon' && d.editable === false && d.km === 300 || d; });
T('ulei: lipsesc datele → „—”, nesetat; fără excepții', () => { const d = documentModel(cfg.vehicles[0].documents[4], cfg, { states: {} }, NOW); return d.status === 'unset' && d.text === '—' || d; });
T('mașina: starea cea mai gravă; ce a expirat vine primul în dueDocuments', () => { const h = H({ 'input_datetime.audi_rca': st(ymd(-2)) }); const v = buildVehiclesModel(cfg, h, NOW); const due = dueDocuments(cfg, h, NOW); return v[0].status === 'expired' && due[0].label === 'RCA' && due[0].status === 'expired' && due.length === 3 && due[1].status === 'soon' || [v[0].status, due]; });
T('mașina fără nicio dată setată → starea „unset” (nu „ok”)', () => buildVehiclesModel(cfg, H(), NOW)[1].status === 'unset');
T('dueDocuments: nimic aproape → listă goală; documentele nesetate nu intră', () => dueDocuments(cfg, H({ 'input_datetime.audi_itp': st(ymd(30)), 'input_datetime.audi_rov': st(ymd(30)) }), NOW).length === 0);
T('normalizeDeadlines: același format ca cardul; false / lipsă → null', () => { const d = normalizeDeadlines({ vehicles: cfg.vehicles.map((v) => ({ name: v.name, documents: v.documents })), alert_days: 3, label: 'Termene' }); return d && d.vehicles.length === 2 && d.label === 'Termene' && normalizeDeadlines(false) === null && normalizeDeadlines(undefined) === null || d; });
T('render: panou pe mașină, rânduri cu stare, câmp de dată doar la cele editabile, buton „Schimbat acum”', () => { const h = renderVehicles(cfg, H(), { now: NOW }); return h.includes('ccu-veh') && h.includes('Audi A3') && h.includes('B 00 XYZ') && (h.match(/class="vd"/g) || []).length === 6 && (h.match(/type="date"/g) || []).length === 4 && h.includes('data-act="km"') && h.includes('data-state="soon"') && h.includes('Setează data') || h.slice(0, 500); });
T('render: nume periculos scăpat; fără NaN / undefined', () => { const c = normalizeVehicles({ vehicles: [{ name: '<img src=x onerror=1>', plate: '"><b>', documents: [{ label: '<script>', entity: 'input_datetime.x' }] }] }); const h = renderVehicles(c, { states: { 'input_datetime.x': st(ymd(2)) } }, { now: NOW }); return !h.includes('<img') && !h.includes('<script') && !/NaN|undefined/.test(h) && h.includes('&lt;img') || h; });
const dl = (v) => normalizeDeadlines({ alert_days: 3, vehicles: cfg.vehicles.map((x) => ({ name: x.name, documents: x.documents })), ...(v || {}) });
const chip = (h, v) => renderChips({ entities: [], deadlines: dl(v) }, h, { due: dueDocuments(dl(v), h, NOW) });
T('chip termene: nimic aproape → niciun chip', () => !chip(H({ 'input_datetime.audi_itp': st(ymd(30)), 'input_datetime.audi_rov': st(ymd(30)) })).includes('data-due'));
T('chip termene: un singur termen → documentul, mașina și zilele', () => { const h = chip(H({ 'input_datetime.audi_itp': st(ymd(30)) })); return (h.includes('data-due="1"') && h.includes('Rovinietă Audi A3 <b>mâine</b>')) || h; });
T('chip termene: mai multe → numărul; ce a expirat se numără', () => { const h = chip(H({ 'input_datetime.audi_rca': st(ymd(-1)) })); return (h.includes('Termene mașini <b>3</b>')) || h; });
T('chip termene: eticheta din config; nume periculos scăpat', () => { const h = chip(H({ 'input_datetime.audi_rca': st(ymd(-1)) }), { label: '<b>x' }); return !h.includes('<b>x') && h.includes('&lt;b&gt;x') || h; });
setLang('en');
T('engleză: „in 3 days”, „tomorrow”, „expired 5 days ago”', () => { const m = (n) => documentModel(cfg.vehicles[0].documents[0], cfg, H({ 'input_datetime.audi_rca': st(ymd(n)) }), NOW); return m(3).text === 'in 3 days' && m(1).text === 'tomorrow' && m(-5).text === 'expired 5 days ago' && m(0).text === 'today' || [m(3).text, m(1).text, m(-5).text]; });
setLang('ro');

console.log(`\n${pass}/${pass + fail}`);
if (fail) process.exit(1);
