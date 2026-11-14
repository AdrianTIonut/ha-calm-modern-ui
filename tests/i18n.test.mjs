// tests/i18n.test.mjs — traduceri: completitudinea dicționarului și câteva texte randate în engleză. Rulare: node tests/i18n.test.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { t, setLang, getLang, DICT, weekdayShort, monthShort } from '../src/i18n.mjs';
import { renderControls, normalizeControls, renderRemote, normalizeRemote } from '../src/controls.mjs';
import { secondaryText } from '../src/state.mjs';
import { renderChips, normalizeNav, normalizePeople, renderPeople } from '../src/render.mjs';
import { buildFlowModel, normalizeFlowConfig, normalizeBatteryConfig, buildBatteryModel, renderBattery } from '../src/energy.mjs';
import { condLabel, dirText } from '../src/weather.mjs';

let pass = 0, fail = 0;
const T = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const st = (state, attributes = {}, id) => ({ entity_id: id, state, attributes });

// ---- completitudine: orice t('…') din cod are traducere ----
const EN = DICT.en;
const SAME = new Set(['Solar', 'Total', 'Auto', 'Turbo', 'Focus', 'Eco', 'Boost', 'Normal', 'Cyan', 'Vertical', 'Mute', 'Vol −', 'Vol +', 'Home', 'OK', 'Preset', 'ok', 'normal', 'auto']);
const keys = new Set();
for (const f of readdirSync('src').filter((x) => x.endsWith('.mjs') && x !== 'i18n.mjs')) {
  const src = readFileSync('src/' + f, 'utf8');
  for (const m of src.matchAll(/\bt\('((?:\\.|[^'\\])*)'/g)) keys.add(m[1].replace(/\\'/g, "'"));
}
T('dicționar: fiecare t(…) din cod are traducere în engleză', () => { const miss = [...keys].filter((k) => EN[k] === undefined && !SAME.has(k)); return miss.length === 0 || miss.slice(0, 12).join(' | ') + ` (+${miss.length})`; });
T('dicționar: nicio traducere goală; variabilele {x} se păstrează', () => Object.entries(EN).every(([k, v]) => v !== '' && [...k.matchAll(/\{(\w+)\}/g)].every((m) => v.includes(m[0]))) || 'gol sau variabilă pierdută');

// ---- limba ----
T('setLang: ro / en / necunoscut → en; din obiect hass', () => setLang('ro') === 'ro' && setLang('en') === 'en' && setLang('xx') === 'en' && setLang({ locale: { language: 'ro-RO' } }) === 'ro' && setLang({ language: 'de' }) === 'en' || 'setLang');
T('t: română = identitate; engleză = dicționar; variabile; fraza necunoscută rămâne', () => { setLang('ro'); const a = t('Pornit'); setLang('en'); return a === 'Pornit' && t('Pornit') === 'On' && t('Persoana #{n}: entity_id lipsă sau invalid.', { n: 3 }) === 'Person #3: entity_id is missing or invalid.' && t('ceva nou') === 'ceva nou' || 'ro/en'; });
T('o limbă nouă se adaugă doar cu un dicționar (ce lipsește cade pe engleză)', () => { DICT.de = { 'Pornit': 'Ein' }; setLang('de'); const r = t('Pornit') === 'Ein' && t('Oprit') === 'Off' && getLang() === 'de'; delete DICT.de; setLang('en'); return r || 'de'; });

// ---- texte randate în engleză ----
setLang('en');
T('stări: secondaryText în engleză', () => secondaryText(st('on', {}, 'light.a')) === 'on' && secondaryText(st('closed', {}, 'cover.a')) === 'closed' && secondaryText(st('home', {}, 'person.a')) === 'home' && secondaryText(st('on', { device_class: 'door' }, 'binary_sensor.a')) === 'open' || 'stări');
T('vreme: condiții și puncte cardinale', () => condLabel('rainy') === 'Rain' && condLabel('partlycloudy') === 'Partly cloudy' && dirText(225) === 'SW' && dirText(270) === 'W' || 'vreme');
T('zile / luni scurte în engleză', () => weekdayShort(new Date(2026, 10, 14)) === 'Sat' && monthShort(10) === 'Nov' || [weekdayShort(new Date(2026, 10, 14)), monthShort(10)]);
T('controls: bec, termostat în engleză', () => {
  const H = { states: { 'light.a': st('off', { supported_color_modes: ['onoff'] }, 'light.a'), 'climate.c': st('cool', { current_temperature: 25, temperature: 23, hvac_modes: ['off', 'cool', 'heat'], hvac_action: 'cooling', fan_modes: ['auto', 'low', 'high'], fan_mode: 'low' }, 'climate.c') } };
  const n = normalizeControls({ items: ['light.a', 'climate.c'] });
  const h = renderControls({ items: n.items, columns: 1, ctitle: '' }, H);
  return (h.includes('now 25.0°') && h.includes('cooling') && h.includes('>Low<') && h.includes('>High<') && h.includes('Fan') && h.includes('Heat') && h.includes('Cool') && !/Oprit|Pornit|Răcire|Încălzire/.test(h)) || h.slice(0, 500);
});
T('telecomandă: etichete în engleză', () => { const h = renderRemote(normalizeRemote({ entity: 'remote.tv' }), { states: { 'remote.tv': st('on') } }); return (h.includes('Channel +') && h.includes('Back') && h.includes('Menu') && h.includes('Input') && !h.includes('Înapoi')) || h.slice(0, 300); });
T('chips gunoi: azi / mâine în engleză', () => {
  const waste = { calendar: 'calendar.g', next_days: 1, hide_today_after: 1440, patterns: [{ match: 'M', label: 'Trash', icon: 'mdi:trash-can', exact: true }] };
  const d = new Date(); d.setHours(8, 0, 0, 0);
  const f = (n) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const h = renderChips({ entities: [], waste }, {}, { events: [{ summary: 'M', start: f(0) }, { summary: 'M', start: f(1) }], now: d });
  return (h.includes('<b>today</b>') && h.includes('<b>tomorrow</b>')) || h;
});
T('people / baterie / flux: texte în engleză', () => {
  const p = normalizePeople({ layout: 'family', people: ['person.a', 'person.b'] });
  const h = renderPeople({ entities: p.people, layout: 'family', summary: true }, { states: { 'person.a': st('home', { friendly_name: 'Ana' }), 'person.b': st('not_home', { friendly_name: 'Dan' }) } });
  const fl = buildFlowModel(normalizeFlowConfig({ solar: 'sensor.s', grid: 'sensor.g', battery: 'sensor.b', consumers: ['sensor.c'] }).items, { states: {} });
  const bc = normalizeBatteryConfig({ soc: 'sensor.soc', grid_present: 'binary_sensor.g' }).config;
  const bh = renderBattery(bc, buildBatteryModel(bc, { states: { 'sensor.soc': st('50'), 'binary_sensor.g': st('off') } }));
  return (h.includes('1 of 2 home') && h.includes('>Away<') && fl.totalText === 'no flow' && bh.includes('Backup active · Grid is off') && !/Acasă|Plecat|Rețea/.test(h + bh)) || [h.slice(0, 300), fl.totalText];
});
T('avertismente de configurare în engleză', () => normalizeNav({ items: [{ label: 'x' }] }).warnings[0].startsWith('Menu #1') && normalizeControls({ items: ['sensor.x'] }).warnings[0].includes('unknown domain') && normalizeFlowConfig({ consumers: [{}] }).warnings[0].startsWith('Consumer #1') || 'warnings');
setLang('ro');
T('română neschimbată: aceleași texte ca înainte', () => secondaryText(st('on', {}, 'light.a')) === 'pornit' && condLabel('rainy') === 'Ploaie' && dirText(225) === 'SV' || 'ro');

console.log(`\n${pass}/${pass + fail}`);
if (fail) process.exit(1);
