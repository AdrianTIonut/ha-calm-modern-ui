// tests/charge-eta.test.mjs — „plin în”: media puterii pe 10 minute, autonomia ascunsă la încărcare, antetul pe două linii
// Rulat cu: node tests/charge-eta.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeBatteryConfig, buildBatteryModel, renderBattery, headerRuntimeTexts, weightedAveragePower, fetchAveragePower } from '../src/energy.mjs';
import { normalizeHeader } from '../src/render.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };
const near = (a, b, e = 0.01) => typeof a === 'number' && Math.abs(a - b) <= e;
const S = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, { state: String(v), attributes: {} }]));
const cfg = (o) => normalizeBatteryConfig({ soc: 'sensor.soc', capacity_kwh: 40, reserve_pct: 20, shutdown_pct: 10, load: 'sensor.l', power: 'sensor.p', ...o }).config;
const hass = (p) => ({ states: S({ 'sensor.soc': 80, 'sensor.l': 1000, 'sensor.p': p }) });

// ---- media în timp ----
ok('media constantă', near(weightedAveragePower([{ t: 0, v: -4000 }], 0, 600000), -4000));
ok('media ponderată în timp: 5 min la −2000 + 5 min la −6000 = −4000', near(weightedAveragePower([{ t: 0, v: -2000 }, { t: 300000, v: -6000 }], 0, 600000), -4000));
ok('valorile lipsă nu contează', near(weightedAveragePower([{ t: 0, v: -3000 }, { t: 300000, v: NaN }], 0, 600000), -3000));
ok('fără puncte → null', weightedAveragePower([], 0, 1000) === null);
ok('punct înainte de interval e tăiat la început', near(weightedAveragePower([{ t: -5000, v: -1000 }], 0, 1000), -1000));

// ---- model: media vs. acum ----
// 80% din 40 kWh → lipsesc 8 kWh; acum se încarcă cu 8 kW (1 h), media pe 10 min a fost 4 kW (2 h)
let m = buildBatteryModel(cfg({}), hass(-8000), { avgPowerW: -4000 });
ok('implicit: media (4 kW) → plin în 2 h', near(m.fullH, 2), m.fullH);
m = buildBatteryModel(cfg({ charge_eta: 'now' }), hass(-8000), { avgPowerW: -4000 });
ok('charge_eta: now → puterea de acum (1 h)', near(m.fullH, 1), m.fullH);
m = buildBatteryModel(cfg({}), hass(-8000), {});
ok('fără medie încă (istoric neîncărcat) → puterea de acum', near(m.fullH, 1));
m = buildBatteryModel(cfg({}), hass(-8000), { avgPowerW: 300 });
ok('media nu e încărcare (+300 W) → puterea de acum', near(m.fullH, 1));
m = buildBatteryModel(cfg({ power_invert: true }), hass(8000), { avgPowerW: 4000 });
ok('power_invert se aplică și mediei', near(m.fullH, 2) && m.charging === true);
m = buildBatteryModel(cfg({}), hass(-30), { avgPowerW: -4000 });
ok('acum în repaus (30 W) → nu se încarcă, chiar dacă media a fost mare', m.charging === false);

// ---- 99% ----
let h = { states: S({ 'sensor.soc': 99, 'sensor.l': 1000, 'sensor.p': -500 }) };
ok('la 99% nu mai arătăm „plin în”', buildBatteryModel(cfg({}), h).charging === false);
h = { states: S({ 'sensor.soc': 98, 'sensor.l': 1000, 'sensor.p': -500 }) };
ok('la 98% încă da', buildBatteryModel(cfg({}), h).charging === true);

// ---- randare: autonomia ascunsă la încărcare ----
m = buildBatteryModel(cfg({}), hass(-8000), {});
let html = renderBattery(cfg({}), m);
ok('încărcare: „Plin în” fără autonomie', html.includes('Plin în') && !html.includes('Autonomie'));
html = renderBattery(cfg({ runtime_while_charging: true }), buildBatteryModel(cfg({ runtime_while_charging: true }), hass(-8000), {}));
ok('cu bifa: ambele', html.includes('Plin în') && html.includes('Autonomie la consum'));
m = buildBatteryModel(cfg({}), hass(500), {});
html = renderBattery(cfg({}), m);
ok('în descărcare: autonomie, fără „Plin în”', html.includes('Autonomie') && !html.includes('Plin în'));
m = buildBatteryModel(cfg({}), { states: S({ 'sensor.soc': 100, 'sensor.l': 1000, 'sensor.p': -50 }) }, {});
ok('la 100%: autonomia rămâne (ex. ~30 h)', renderBattery(cfg({}), m).includes('Autonomie'));
ok('config: charge_eta implicit avg', cfg({}).charge_eta === 'avg' && cfg({ charge_eta: 'x' }).charge_eta === 'avg' && cfg({ charge_eta: 'now' }).charge_eta === 'now');

// ---- antet ----
const hdr = (extra) => normalizeHeader({ values: [{ entity: 'sensor.soc', runtime_load: 'sensor.l', runtime_capacity_kwh: 40, runtime_power: 'sensor.p', ...extra }] }).header;
let t = headerRuntimeTexts(hdr({}), hass(-8000), { 'sensor.p': -4000 });
ok('antet: „plin în ~2” (media)', typeof t[0] === 'string' && t[0].startsWith('plin în ~2'), JSON.stringify(t));
t = headerRuntimeTexts(hdr({ runtime_while_charging: true }), hass(-8000), { 'sensor.p': -4000 });
ok('antet cu bifa: două linii (plin în + autonomie)', Array.isArray(t[0]) && t[0].length === 2 && t[0][1].startsWith('autonomie'), JSON.stringify(t));
t = headerRuntimeTexts(hdr({ runtime_charge_eta: 'now' }), hass(-8000), { 'sensor.p': -4000 });
ok('antet cu runtime_charge_eta: now → puterea de acum (1 h)', t[0].startsWith('plin în ~1'), JSON.stringify(t));
t = headerRuntimeTexts(hdr({}), hass(500), {});
ok('antet în descărcare: autonomia', t[0].startsWith('~'));

// ---- istoric (cu un HA fals) ----
const now = Date.now();
const fake = { states: { 'sensor.p': { state: '-4', attributes: { unit_of_measurement: 'kW' } } }, callWS: async () => ({ 'sensor.p': [{ s: '-2', lu: (now - 600000) / 1000 }, { s: '-6', lu: (now - 300000) / 1000 }] }) };
const avg = await fetchAveragePower(fake, 'sensor.p', 10);
ok('fetchAveragePower: kW → W, medie −4000', near(avg, -4000, 80), String(avg));
ok('fără callWS → null', (await fetchAveragePower({ states: {} }, 'sensor.p')) === null);
const failing = { states: {}, callWS: async () => { throw new Error('x'); } };
let threw = false; try { await fetchAveragePower(failing, 'sensor.p'); } catch (e) { threw = true; }
ok('eroarea de istoric se propagă (o prinde cardul)', threw);

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
