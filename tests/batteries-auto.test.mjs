// tests/batteries-auto.test.mjs — descoperirea automată a bateriilor, chip-ul „baterii slabe” și cardul de baterii cu `auto`. Rulare: node tests/batteries-auto.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { discoverBatteries, normalizeAutoBatteries, normalizeLowBatteries, lowBatteryModel, normalizeBatteriesConfig, buildBatteriesModel } from '../src/energy.mjs';
import { renderChips } from '../src/render.mjs';

let pass = 0, fail = 0;
const T = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + JSON.stringify(r)); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const bat = (state, name, extra) => ({ state: String(state), attributes: { device_class: 'battery', unit_of_measurement: '%', friendly_name: name, ...(extra || {}) } });

const hass = {
  states: {
    'sensor.toothbrush_battery': bat(0, 'Toothbrush Battery'),
    'sensor.water_sensor_battery': bat(20, 'Water sensor Battery'),
    'sensor.smoke_battery': bat(21, 'Smoke detector Battery'),
    'sensor.mower_battery': bat(100, 'Mower Battery level'),
    'sensor.phone_battery_level': bat(5, 'Phone'),
    'sensor.ipad_battery': bat(7, 'iPad'),
    'sensor.kiosk_battery': bat(9, 'Kiosk tablet'),
    'sensor.browser_mod_x_browser_battery': bat(3, 'Browser'),
    'sensor.inverter_battery': bat(52, 'Inverter Battery'),
    'sensor.car_battery_level': bat(7, 'Car Battery Level'),
    'sensor.gone_battery': bat('unavailable', 'Gone Battery'),
    'sensor.voltage_battery': { state: '3.1', attributes: { device_class: 'battery', unit_of_measurement: 'V', friendly_name: 'Voltage' } },
    'binary_sensor.door_battery': { state: 'on', attributes: { device_class: 'battery', friendly_name: 'Door sensor battery' } },
    'binary_sensor.window_battery': { state: 'off', attributes: { device_class: 'battery', friendly_name: 'Window sensor battery' } },
    'sensor.temperature': { state: '20', attributes: { device_class: 'temperature', unit_of_measurement: '°C' } },
  },
  entities: {
    'sensor.phone_battery_level': { platform: 'mobile_app', device_id: 'd1' },
    'sensor.ipad_battery': { platform: 'something', device_id: 'd2' },
    'sensor.kiosk_battery': { platform: 'fully_kiosk', device_id: 'd3' },
    'sensor.toothbrush_battery': { platform: 'oralb', device_id: 'd4' },
  },
  devices: { d1: { model: 'Pixel 8' }, d2: { manufacturer: 'Apple', model: 'iPad13,18' }, d3: { model: 'TB361FU' }, d4: { manufacturer: 'Oral-B', model: 'IO Series' } },
};
const ids = (rows) => rows.map((r) => r.entity);

T('normalizeAutoBatteries: true → implicite; obiect; false → null', () => { const a = normalizeAutoBatteries(true), b = normalizeAutoBatteries({ threshold: 15, exclude: 'deye', mobile: false }); return a.threshold === 20 && a.mobile === true && b.threshold === 15 && b.exclude[0] === 'deye' && b.mobile === false && normalizeAutoBatteries(false) === null && normalizeAutoBatteries(undefined) === null || [a, b]; });
T('descoperire: telefoane, tablete și browsere (după platformă, model sau nume) nu se numără', () => { const r = ids(discoverBatteries(hass, true)); return !r.includes('sensor.phone_battery_level') && !r.includes('sensor.ipad_battery') && !r.includes('sensor.kiosk_battery') && !r.includes('sensor.browser_mod_x_browser_battery') || r; });
T('descoperire: dispozitivele pe baterii apar, crescător după nivel; binary_sensor „on” primul', () => { const r = ids(discoverBatteries(hass, true)); return r[0] === 'binary_sensor.door_battery' && r[1] === 'sensor.toothbrush_battery' && r.indexOf('sensor.water_sensor_battery') < r.indexOf('sensor.smoke_battery') || r; });
T('descoperire: fără indisponibile, fără alte unități (V) și fără alte device_class', () => { const r = ids(discoverBatteries(hass, true)); return !r.includes('sensor.gone_battery') && !r.includes('sensor.voltage_battery') && !r.includes('sensor.temperature') || r; });
T('descoperire: unavailable: true le păstrează', () => ids(discoverBatteries(hass, { unavailable: true })).includes('sensor.gone_battery'));
T('descoperire: mobile: false păstrează telefoanele', () => ids(discoverBatteries(hass, { mobile: false })).includes('sensor.phone_battery_level'));
T('descoperire: exclude după cuvânt (în id sau în nume), include forțează', () => { const r = ids(discoverBatteries(hass, { exclude: ['inverter', 'car_'] })); const f = ids(discoverBatteries(hass, { exclude: ['inverter'], include: ['sensor.inverter_battery'] })); return !r.includes('sensor.inverter_battery') && !r.includes('sensor.car_battery_level') && f.includes('sensor.inverter_battery') || r; });
T('nume: „Battery” / „Battery level” din coadă dispare', () => { const r = discoverBatteries(hass, true); return r.find((x) => x.entity === 'sensor.mower_battery').name === 'Mower' && r.find((x) => x.entity === 'sensor.toothbrush_battery').name === 'Toothbrush' || r; });

const low = normalizeLowBatteries({ exclude: ['inverter', 'car_'] });
T('baterii slabe: prag 20% inclusiv (20 = slabă, 21 nu); binary „on” = slabă', () => { const m = lowBatteryModel(low, hass); return ids(m.low).join() === 'binary_sensor.door_battery,sensor.toothbrush_battery,sensor.water_sensor_battery' && m.count === 3 || ids(m.low); });
T('baterii slabe: pragul se poate schimba (30% → apare și detectorul de fum)', () => { const m = lowBatteryModel(normalizeLowBatteries({ threshold: 30, exclude: ['inverter', 'car_'] }), hass); return m.low.some((r) => r.entity === 'sensor.smoke_battery') || ids(m.low); });
T('normalizeLowBatteries: fals / lipsă → null', () => normalizeLowBatteries(undefined) === null && normalizeLowBatteries(false) === null && normalizeLowBatteries(true).threshold === 20);

const chipCfg = (lb) => ({ entities: [], low_batteries: normalizeLowBatteries(lb) });
const render = (lb, h) => renderChips(chipCfg(lb), h, { lowBat: lowBatteryModel(normalizeLowBatteries(lb), h) });
T('chip: arată numărul când sunt mai multe baterii slabe', () => { const h = render({ exclude: ['inverter', 'car_'] }, hass); return h.includes('data-bat="1"') && h.includes('Baterii slabe <b>3</b>') && h.includes('data-state="alert"') || h; });
T('chip: o singură baterie slabă → numele și procentul ei', () => { const h2 = { ...hass, states: { 'sensor.toothbrush_battery': bat(4, 'Toothbrush Battery'), 'sensor.mower_battery': bat(100, 'Mower Battery') } }; const h = render(true, h2); return h.includes('Toothbrush <b>4%</b>') || h; });
T('chip: nicio baterie slabă → niciun chip', () => { const h2 = { states: { 'sensor.mower_battery': bat(100, 'Mower Battery') } }; return !render(true, h2).includes('data-bat') || 'chip fără motiv'; });
T('chip: eticheta din config; entitatea cea mai slabă e în data-entity (pentru more-info)', () => { const h = render({ label: 'Low', exclude: ['inverter', 'car_'] }, hass); return h.includes('Low <b>3</b>') && h.includes('data-entity="binary_sensor.door_battery"') || h; });
T('chip: fără NaN / undefined; nume periculos scăpat', () => { const h2 = { states: { 'sensor.x_battery': bat(2, '<img src=x onerror=1> Battery') } }; const h = render(true, h2); return !/NaN|undefined/.test(h) && !h.includes('<img') && h.includes('&lt;img') || h; });

const bc = normalizeBatteriesConfig({ auto: { exclude: ['inverter', 'car_'] }, entities: ['sensor.inverter_battery'] });
T('card baterii: explicit + auto, fără dubluri, sortate crescător', () => { const rows = buildBatteriesModel({ entities: bc.items, warn_pct: 20, low_pct: 10, sort: 'asc', auto: bc.auto, only_low: false }, hass); const e = rows.map((r) => r.entity); return e.filter((x) => x === 'sensor.inverter_battery').length === 1 && e.includes('sensor.toothbrush_battery') && e.indexOf('sensor.toothbrush_battery') < e.indexOf('sensor.mower_battery') || e; });
T('card baterii: only_low arată doar bateriile slabe / sub avertisment', () => { const rows = buildBatteriesModel({ entities: [], warn_pct: 25, low_pct: 10, sort: 'asc', auto: normalizeAutoBatteries({ exclude: ['inverter', 'car_'] }), only_low: true }, hass); return rows.every((r) => r.lvl === 'low' || r.lvl === 'warn') && rows.some((r) => r.entity === 'sensor.toothbrush_battery') && !rows.some((r) => r.entity === 'sensor.mower_battery') || rows.map((r) => r.entity + ':' + r.lvl); });
T('card baterii: binary_sensor se arată „slabă” / OK', () => { const rows = buildBatteriesModel({ entities: [], warn_pct: 20, low_pct: 10, sort: 'asc', auto: normalizeAutoBatteries(true), only_low: false }, hass); const d = rows.find((r) => r.entity === 'binary_sensor.door_battery'), w = rows.find((r) => r.entity === 'binary_sensor.window_battery'); return d && d.lvl === 'low' && d.text === 'slabă' && w && w.lvl === 'ok' || [d, w]; });
T('card baterii: bateria numărată ca slabă de chip (20% cu prag 20) apare cel puțin ca „warn”, nu „ok”', () => { const rows = buildBatteriesModel({ entities: [], warn_pct: 20, low_pct: 10, sort: 'asc', auto: normalizeAutoBatteries({ exclude: ['inverter', 'car_'], threshold: 20 }), only_low: false }, hass); const w = rows.find((r) => r.entity === 'sensor.water_sensor_battery'), sm = rows.find((r) => r.entity === 'sensor.smoke_battery'); return w && w.lvl === 'warn' && sm && sm.lvl === 'ok' || [w, sm]; });
T('descoperire: senzor în % cu „batt” în id dar fără device_class (ex. Tuya) este inclus; fără „batt” nu', () => { const h2 = { states: { 'sensor.th_sensor_battery': { state: '100', attributes: { unit_of_measurement: '%', friendly_name: 'Temp and humidity sensor battery' } }, 'sensor.humidity': { state: '40', attributes: { unit_of_measurement: '%' } }, 'sensor.baterie_energie': { state: '350', attributes: { unit_of_measurement: 'kWh' } } } }; const r = ids(discoverBatteries(h2, true)); return r.length === 1 && r[0] === 'sensor.th_sensor_battery' || r; });
T('nume: `names` redenumește (ex. un dispozitiv cu nume criptic)', () => { const r = discoverBatteries(hass, { names: { 'sensor.toothbrush_battery': 'Periuță (baie etaj)' }, exclude: ['inverter', 'car_'] }); return r.find((x) => x.entity === 'sensor.toothbrush_battery').name === 'Periuță (baie etaj)' || r; });
T('descoperire: „…_battery_soh” / „…_battery_health” / „…_battery_limit” (în %) nu sunt baterii', () => { const mk = (id) => ({ state: '90', attributes: { unit_of_measurement: '%', friendly_name: id } }); const h2 = { states: { 'sensor.x_battery_soh': mk('a'), 'sensor.x_battery_health': mk('b'), 'sensor.x_battery_charge_limit': mk('c'), 'sensor.x_battery_level': mk('d'), 'sensor.x_battery': mk('e') } }; const r = ids(discoverBatteries(h2, true)); return r.length === 2 && r.includes('sensor.x_battery_level') && r.includes('sensor.x_battery') || r; });
T('fără hass nu aruncă', () => discoverBatteries(null, true).length === 0 && lowBatteryModel(normalizeLowBatteries(true), undefined).count === 0);

console.log(`\n${pass}/${pass + fail}`);
if (fail) process.exit(1);
