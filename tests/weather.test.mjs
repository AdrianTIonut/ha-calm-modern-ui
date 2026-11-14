// tests/weather.test.mjs — weather.mjs (model, clasificare, prognoză, șabloane). Rulare: node tests/weather.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { toC, toKmh, toMmh, toMm, dirText, normalizeWeatherConfig, classifyScene, parseForecast, buildWeatherModel, renderScene, renderWeather, condLabel, condIcon } from '../src/weather.mjs';
import { ICONS } from '../src/icons.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) < e;
const st = (state, attributes = {}) => ({ state, attributes });
const NOW = new Date(2026, 10, 14, 10, 0, 0);

t('toC: °F, K, °C, null', () => near(toC(50, '°F'), 10) && near(toC(300, 'K'), 26.85) && toC(7, '°C') === 7 && toC(null, '°C') === null || 'conversii');
t('toKmh: m/s, mph, kn, km/h', () => near(toKmh(10, 'm/s'), 36) && near(toKmh(10, 'mph'), 16.09344) && near(toKmh(10, 'kn'), 18.52) && toKmh(20, 'km/h') === 20 && toKmh(null, 'm/s') === null || 'conversii');
t('toMmh/toMm: in → mm', () => near(toMmh(1, 'in/hr'), 25.4) && near(toMmh(1, 'in/h'), 25.4) && toMmh(2, 'mm/h') === 2 && near(toMm(1, 'in'), 25.4) && toMm(3, 'mm') === 3 || 'conversii');
t('dirText: 8 sectoare, valori ciudate', () => dirText(0) === 'N' && dirText(45) === 'NE' && dirText(180) === 'S' && dirText(270) === 'V' && dirText(359) === 'N' && dirText(-90) === 'V' && dirText(NaN) === '' || 'direcții');

const nc = (o = {}) => normalizeWeatherConfig({ weather: 'weather.acasa', sensors: { temperature: 'sensor.t', humidity: 'sensor.h', wind_speed: 'sensor.w', wind_gust: 'sensor.g', wind_direction: 'sensor.d', rain_rate: 'sensor.rr', rain_today: 'sensor.rt', pressure: 'sensor.p', uv: 'sensor.uv', radiation: 'sensor.rad' }, ...o });
t('config: tile-uri implicite, ordine, items plate', () => { const c = nc().config; return (c.tiles.join() === 'humidity,wind,rain,pressure,uv,radiation' && c.days === 5 && c.items[c.items.length - 1].kind === 'weather') || JSON.stringify(c.tiles); });
t('config: tile fără senzor configurat nu apare', () => nc({ sensors: { temperature: 'sensor.t', humidity: 'sensor.h' } }).config.tiles.join() === 'humidity' || 'tiles');
t('config: senzor invalid / necunoscut → avertismente', () => { const r = nc({ sensors: { temperature: 'fara_punct', foo: 'sensor.x', humidity: 'sensor.h' } }); return (r.warnings.length === 2 && !r.config.sensors.temperature) || JSON.stringify(r.warnings); });
t('config: weather trebuie să fie weather.*', () => { const r = normalizeWeatherConfig({ weather: 'sensor.x', sensors: { temperature: 'sensor.t' } }); return (r.config.weather === '' && r.warnings.length === 1) || JSON.stringify(r); });
t('config: days în 1–7, altfel 5', () => nc({ days: 3 }).config.days === 3 && nc({ days: 9 }).config.days === 5 && nc({ days: 'x' }).config.days === 5 && nc({ days: 2.5 }).config.days === 5 || 'days');
t('config: tile necunoscut avertizat', () => nc({ tiles: ['humidity', 'zzz'] }).warnings.length === 1);
t('config: gol/nul nu aruncă', () => normalizeWeatherConfig(undefined).config.items.length === 0 && normalizeWeatherConfig(null).warnings.length === 1 && normalizeWeatherConfig({ sensors: 5 }).config.tiles.length === 0 || 'gol');
t('config: fără duplicate în items', () => { const c = nc({ tiles: ['rain', 'rain'] }).config; const ids = c.items.map((x) => x.entity); return new Set(ids).size === ids.length || ids.join(); });

// ---- clasificare ----
const K = (o) => classifyScene({ cond: 'cloudy', ...o });
t('ploaie: 10 °C, 0,2 mm/h → ploaie ușoară (int 1)', () => { const s = K({ tempC: 10, rainMmh: 0.2 }); return (s.precip === 'rain' && s.intensity === 1 && s.label === 'Ploaie ușoară') || JSON.stringify(s); });
t('ploaie: 2 mm/h → int 2; 8 mm/h → int 3 torențială', () => K({ tempC: 12, rainMmh: 2 }).intensity === 2 && K({ tempC: 12, rainMmh: 8 }).intensity === 3 && K({ tempC: 12, rainMmh: 8 }).label === 'Ploaie torențială' || 'intensități');
t('ninsoare: −3 °C cu precipitații', () => { const s = K({ tempC: -3, rainMmh: 0.5 }); return (s.precip === 'snow' && s.intensity === 2 && s.label === 'Ninsoare') || JSON.stringify(s); });
t('lapoviță: 1 °C cu precipitații', () => { const s = K({ tempC: 1, rainMmh: 1 }); return (s.precip === 'sleet' && s.label === 'Lapoviță') || JSON.stringify(s); });
t('praguri de temperatură: 0,5 → ninsoare, 0,6 → lapoviță, 2,5 → lapoviță, 2,6 → ploaie', () => K({ tempC: 0.5, rainMmh: 1 }).precip === 'snow' && K({ tempC: 0.6, rainMmh: 1 }).precip === 'sleet' && K({ tempC: 2.5, rainMmh: 1 }).precip === 'sleet' && K({ tempC: 2.6, rainMmh: 1 }).precip === 'rain' || 'praguri');
t('fără precipitații: sub 0,05 mm/h = nimic', () => K({ tempC: 10, rainMmh: 0.04 }).precip === 'none' && K({ tempC: 10, rainMmh: 0 }).precip === 'none' || 'none');
t('senzor de ploaie binar (on, fără rată) → ploaie', () => K({ tempC: 10, rainMmh: null, rainOn: true }).precip === 'rain');
t('vânt: pragurile 12 / 25 / 40 km/h', () => K({ windKmh: 5 }).wind === 0 && K({ windKmh: 12 }).wind === 1 && K({ windKmh: 25 }).wind === 2 && K({ windKmh: 40 }).wind === 3 || 'vânt');
t('vânt puternic fără precipitații → etichetă „Vânt puternic”', () => classifyScene({ cond: 'sunny', windKmh: 55 }).label === 'Vânt puternic');
t('ploaie + vânt → etichetă compusă', () => K({ tempC: 12, rainMmh: 2, windKmh: 30 }).label === 'Ploaie · vânt' && K({ tempC: 12, rainMmh: 2, windKmh: 60 }).label === 'Ploaie · vânt puternic' || K({ tempC: 12, rainMmh: 2, windKmh: 30 }).label);
t('furtună din entitatea weather (lightning)', () => { const s = classifyScene({ cond: 'lightning-rainy', tempC: 18, rainMmh: 3 }); return (s.bolt === true && s.label === 'Furtună cu ploaie' && s.sky === 'cloudy') || JSON.stringify(s); });
t('cer: senin / parțial / noros / ceață', () => classifyScene({ cond: 'sunny' }).sky === 'clear' && classifyScene({ cond: 'partlycloudy' }).sky === 'partly' && classifyScene({ cond: 'cloudy' }).sky === 'cloudy' && classifyScene({ cond: 'fog' }).sky === 'fog' || 'sky');
t('noapte senină → „Cer senin”, ziua → „Senin”', () => classifyScene({ cond: 'clear-night', night: true }).label === 'Cer senin' && classifyScene({ cond: 'sunny' }).label === 'Senin' || 'etichete');
t('fallback din prognoză când senzorii lipsesc (marcat)', () => { const s = classifyScene({ cond: 'rainy', fallback: true }); return (s.precip === 'rain' && s.intensity === 2 && s.fromForecast === true) || JSON.stringify(s); });
t('fallback: snowy → ninsoare, snowy-rainy → lapoviță, pouring → torențială', () => classifyScene({ cond: 'snowy' }).precip === 'snow' && classifyScene({ cond: 'snowy-rainy' }).precip === 'sleet' && classifyScene({ cond: 'pouring' }).intensity === 3 || 'fallback');
t('fără fallback: senzorii lipsesc → fără precipitații inventate', () => classifyScene({ cond: 'rainy', fallback: false }).precip === 'none');
t('senzorii Ecowitt au prioritate față de prognoză (prognoza zice ploaie, senzorul 0)', () => { const s = classifyScene({ cond: 'rainy', tempC: 10, rainMmh: 0, fallback: true }); return (s.precip === 'none' && s.fromForecast === false) || JSON.stringify(s); });
t('vânt din prognoză doar ca fallback', () => classifyScene({ cond: 'cloudy', windFallbackKmh: 45 }).wind === 3 && classifyScene({ cond: 'cloudy', windFallbackKmh: 45, windKmh: 3 }).wind === 0 && classifyScene({ cond: 'cloudy', windFallbackKmh: 45, fallback: false }).wind === 0 || 'vânt fallback');
t('intrări lipsă nu aruncă', () => classifyScene().label === '—' && classifyScene({}).precip === 'none' || 'gol');

// ---- prognoză ----
const day = (dd, o = {}) => ({ datetime: new Date(2026, 10, dd, 12).toISOString(), condition: 'rainy', temperature: 12, templow: 4, precipitation: 3.2, precipitation_probability: 70, wind_speed: 18, wind_bearing: 225, ...o });
t('prognoză: Azi + zile cu nume scurt, sortate', () => { const p = parseForecast([day(16), day(14), day(15)], '°C', 'km/h', NOW); return (p.map((x) => x.name).join() === 'Azi,Du,Lu' && p[0].today === true) || p.map((x) => x.name).join(); });
t('prognoză: conversii (°F, m/s)', () => { const p = parseForecast([day(14, { temperature: 50, templow: 32, wind_speed: 10 })], '°F', 'm/s', NOW)[0]; return (near(p.hi, 10) && near(p.lo, 0) && near(p.wind, 36)) || JSON.stringify(p); });
t('prognoză: câmpuri lipsă → null, fără NaN', () => { const p = parseForecast([{ datetime: new Date(2026, 10, 15).toISOString(), condition: 'sunny' }], '°C', 'km/h', NOW)[0]; return (p.hi === null && p.lo === null && p.wind === null && p.pop === null && p.mm === null && !/NaN/.test(JSON.stringify(p))) || JSON.stringify(p); });
t('prognoză: intrări ciudate ignorate', () => parseForecast([null, 5, { datetime: 'x' }, {}, day(15)], '°C', 'km/h', NOW).length === 1 && parseForecast(undefined).length === 0 && parseForecast('x').length === 0 || 'ciudate');
t('prognoză: zile din trecut tăiate', () => parseForecast([day(10), day(14)], '°C', 'km/h', NOW).length === 1);

// ---- model ----
const SENS = { temperature: 'sensor.t', humidity: 'sensor.h', wind_speed: 'sensor.w', wind_gust: 'sensor.g', wind_direction: 'sensor.d', rain_rate: 'sensor.rr', rain_today: 'sensor.rt', pressure: 'sensor.p', uv: 'sensor.uv', radiation: 'sensor.rad' };
const H = (o = {}) => ({ states: {
  'sensor.t': st('12.4', { unit_of_measurement: '°C' }), 'sensor.h': st('68', { unit_of_measurement: '%' }), 'sensor.w': st('18', { unit_of_measurement: 'km/h' }), 'sensor.g': st('31', { unit_of_measurement: 'km/h' }), 'sensor.d': st('225', { unit_of_measurement: '°' }),
  'sensor.rr': st('1.2', { unit_of_measurement: 'mm/h' }), 'sensor.rt': st('3.6', { unit_of_measurement: 'mm' }), 'sensor.p': st('1002.6', { unit_of_measurement: 'hPa' }), 'sensor.uv': st('7.2'), 'sensor.rad': st('420', { unit_of_measurement: 'W/m²' }),
  'weather.acasa': st('partlycloudy', { temperature: 5.1, temperature_unit: '°C', wind_speed: 9, wind_speed_unit: 'km/h' }), 'sun.sun': st('above_horizon'), ...o } });
const M = (o, cfgO) => buildWeatherModel(nc(cfgO).config, H(o), [day(14), day(15), day(16), day(17), day(18), day(19)], NOW);
t('model: valorile vin din Ecowitt, NU din prognoză', () => { const m = M(); return (m.tempText === '12,4' && m.tempFromForecast === false) || m.tempText; });
t('model: tile-uri formatate (umiditate, vânt cu rafale+direcție, ploaie, presiune, UV, radiație)', () => {
  const m = M(); const v = (k) => m.tiles.find((x) => x.key === k);
  return (v('humidity').value === '68%' && v('wind').value === '18 km/h' && v('wind').sub === 'rafale 31 · SV' && v('rain').value === '3,6 mm' && v('rain').sub === 'acum 1,2 mm/h' && v('pressure').value === '1002,6 hPa' && v('uv').value === '7,2' && v('uv').sub === 'ridicat' && v('radiation').value === '420 W/m²') || JSON.stringify(m.tiles);
});
t('model: scena clasificată din senzori (12 °C, 1,2 mm/h, vânt 18) = ploaie int 2, vânt 1', () => { const s = M().scene; return (s.precip === 'rain' && s.intensity === 2 && s.wind === 1) || JSON.stringify(s); });
t('model: Ecowitt indisponibil → „—” peste tot, fără NaN, temperatura NU se ia din prognoză', () => {
  const u = {}; for (const k of Object.values(SENS)) u[k] = st('unavailable');
  const m = M(u); return (m.tempText === '—' && m.tiles.every((x) => x.value === '—' && x.na) && !/NaN|undefined/.test(JSON.stringify(m))) || JSON.stringify(m.tiles.map((x) => x.value));
});
t('model: Ecowitt indisponibil → scena din prognoză, marcată', () => { const u = {}; for (const k of Object.values(SENS)) u[k] = st('unavailable'); u['weather.acasa'] = st('rainy', { wind_speed: 9 }); const m = M(u); return (m.scene.precip === 'rain' && m.scene.fromForecast === true) || JSON.stringify(m.scene); });
t('model: fallback_to_forecast:true → temperatura din prognoză, marcată', () => { const u = {}; for (const k of Object.values(SENS)) u[k] = st('unavailable'); const m = M(u, { fallback_to_forecast: true }); return (m.tempText === '5,1' && m.tempFromForecast === true) || m.tempText; });
t('model: noapte din sun.sun', () => M({ 'sun.sun': st('below_horizon') }).night === true && M().night === false || 'noapte');
t('model: temperatură în °F convertită', () => { const m = M({ 'sensor.t': st('50', { unit_of_measurement: '°F' }) }); return m.tempText === '10,0' || m.tempText; });
t('model: vânt în m/s → km/h', () => M({ 'sensor.w': st('10', { unit_of_measurement: 'm/s' }) }).tiles.find((x) => x.key === 'wind').value === '36 km/h' || 'm/s');
t('model: vânt ≥ 50 km/h → avertisment pe tile', () => M({ 'sensor.w': st('55', { unit_of_measurement: 'km/h' }) }).tiles.find((x) => x.key === 'wind').lvl === 'warn');
t('model: UV ≥ 6 → avertisment', () => M().tiles.find((x) => x.key === 'uv').lvl === 'warn');
t('model: ploaie activă → lvl active', () => M().tiles.find((x) => x.key === 'rain').lvl === 'active');
t('model: 5 zile din 6 primite', () => M().days.length === 5 && M().days[0].name === 'Azi' || M().days.length);
t('model: hass nul nu aruncă', () => { const m = buildWeatherModel(nc().config, null, [], NOW); return (m.tempText === '—' && m.tiles.length === 6 && m.days.length === 0) || JSON.stringify(m.tempText); });
t('model: „se simte ca” doar dacă există senzor', () => M().feelsText === '' && buildWeatherModel(nc({ sensors: { ...SENS, feels_like: 'sensor.fl' } }).config, H({ 'sensor.fl': st('9.8', { unit_of_measurement: '°C' }) }), [], NOW).feelsText === 'Se simte ca 9,8°' || M().feelsText);

// ---- șabloane ----
const R = (o, cfgO) => { const c = nc(cfgO).config; return renderWeather(c, buildWeatherModel(c, H(o), [day(14), day(15), day(16), day(17), day(18)], NOW)); };
t('scenă: structură constantă (același număr de elemente în orice stare)', () => {
  const count = (h) => (h.match(/<i\b/g) || []).length + '/' + (h.match(/<div\b/g) || []).length;
  const a = count(renderScene(M())); const b = count(renderScene(M({ 'sensor.t': st('-4'), 'sensor.rr': st('0.4') }))); const c = count(renderScene(M({ 'sensor.rr': st('0') })));
  return (a === b && b === c) || [a, b, c].join(' ');
});
t('scenă: atribute data-* după fenomen (ninsoare, lapoviță, ploaie, vânt, furtună, noapte)', () => {
  const sc = (o, c) => renderScene(M(o, c));
  return sc({ 'sensor.t': st('-4'), 'sensor.rr': st('0.4') }).includes('data-precip="snow"') && sc({ 'sensor.t': st('1'), 'sensor.rr': st('0.4') }).includes('data-precip="sleet"')
    && sc().includes('data-precip="rain"') && sc({ 'sensor.rr': st('0'), 'sensor.w': st('50') }).includes('data-wind="3"') && sc({ 'weather.acasa': st('lightning-rainy') }).includes('data-bolt="1"') && sc({ 'sun.sun': st('below_horizon') }).includes('data-night="1"') || 'atribute';
});
t('scenă: 40 picături, 30 fulgi, 9 dungi de vânt, 4 nori, 14 stele', () => { const h = renderScene(M()); const part = (cls) => { const m = new RegExp(`<div class="${cls}">(.*?)</div>`).exec(h); return m ? (m[1].match(/<i /g) || []).length : -1; }; return (part('rain') === 40 && part('snow') === 30 && part('windl') === 9 && part('clouds') === 4 && part('stars') === 14) || [part('rain'), part('snow'), part('windl'), part('clouds'), part('stars')].join(); });
t('scenă: temperatura și eticheta în info, fără NaN', () => { const h = renderScene(M()); return (h.includes('12,4<sup>°C</sup>') && h.includes('Ploaie · vânt') === false && h.includes('class="c">Ploaie') && !/NaN|undefined/.test(h)) || h.slice(-260); });
t('scenă: fără temperatură (senzor indisponibil) → „— —” discret, fără °C', () => { const u = {}; for (const k of Object.values(SENS)) u[k] = st('unavailable'); const h = renderScene(M(u)); return (h.includes('class="t na">— —</div>') && !h.includes('<sup>°C</sup>')) || h.slice(h.indexOf('class="t'), h.indexOf('class="t') + 90); });
t('card: tile-uri cu data-id și data-entity', () => { const h = R(); return ((h.match(/class="wt"/g) || []).length === 6 && h.includes('data-entity="sensor.h"') && h.includes('class="ccu-wx-days"')) || h.slice(0, 200); });
t('card: 5 zile cu icon, max/min, ploaie și vânt', () => { const h = R(); return ((h.match(/class="wd"/g) || []).length === 5 && h.includes('data-today="1"') && h.includes('<b class="hi">12°</b>') && h.includes('70% · 3,2 mm') && h.includes('18 km/h') && h.includes('>Azi<')) || h.slice(0, 300); });
t('acțiuni: tap/hold din config ajung pe elementul weather', () => { const c = nc({ hold_action: { action: 'navigate', navigation_path: '/dashboard-home/weather' }, tap_action: 'more-info' }).config; const it = c.items.find((x) => x.kind === 'weather'); return (it.hold_action.navigation_path === '/dashboard-home/weather' && it.tap_action === 'more-info') || JSON.stringify(it); });
t('scenă: data-id/data-entity doar când există entitate weather (atingere/ținere)', () => { const c = nc().config; const h = renderWeather(c, buildWeatherModel(c, H(), [], NOW)); const wi = c.items.findIndex((x) => x.kind === 'weather'); return (h.includes(`<div class="ccu-scene" data-id="${wi}" data-entity="weather.acasa"`) && !renderScene(M()).includes('data-id=')) || h.slice(h.indexOf('ccu-scene'), h.indexOf('ccu-scene') + 120); });
t('card: fără ploaie prognozată → fără pictogramă goală', () => { const raw = [{ ...day(14), precipitation: 0, precipitation_probability: null }]; const c = nc().config; const h = renderWeather(c, buildWeatherModel(c, H(), raw, NOW)); return (h.includes('<small class="pp"></small>') && !h.includes('class="pp"><span')) || h.slice(h.indexOf('class="pp"') - 20, h.indexOf('class="pp"') + 120); });
t('card: doar probabilitate (0 mm) → „40%”', () => { const raw = [{ ...day(14), precipitation: 0, precipitation_probability: 40 }]; const c = nc().config; const h = renderWeather(c, buildWeatherModel(c, H(), raw, NOW)); return (h.includes('</span>40%</small>') && !h.includes('mm</small>')) || 'prob'; });
t('card: zile fără prognoză → mesaj', () => { const c = nc().config; return renderWeather(c, buildWeatherModel(c, H(), [], NOW)).includes('prognoza se încarcă') || 'mesaj'; });
t('card: fără weather configurat → mesaj dedicat', () => { const c = normalizeWeatherConfig({ sensors: { temperature: 'sensor.t' } }).config; return renderWeather(c, buildWeatherModel(c, H(), [], NOW)).includes('fără prognoză') || 'mesaj'; });
t('card: titlu și avertismente escapate', () => { const c = nc({ title: '<b>x</b>' }).config; const h = renderWeather(c, buildWeatherModel(c, H(), [], NOW), { warnings: ['a<b'] }); return (h.includes('&lt;b&gt;x') && h.includes('a&lt;b')) || 'escape'; });
t('card: etichete de condiție periculoase scăpate', () => { const raw = [{ ...day(14), condition: '<img src=x onerror=1>' }]; const c = nc().config; const h = renderWeather(c, buildWeatherModel(c, H(), raw, NOW)); return !h.includes('<img') || 'XSS'; });
t('pictograme: toate cele folosite există', () => { for (const c of ['sunny', 'clear-night', 'partlycloudy', 'cloudy', 'fog', 'rainy', 'pouring', 'snowy', 'snowy-rainy', 'lightning', 'lightning-rainy', 'hail', 'windy', 'windy-variant', 'exceptional']) if (!ICONS[condIcon(c)]) return c; return ['drop', 'gauge', 'compass', 'w-rain', 'w-wind', 'sun', 'thermo', 'bulb'].every((k) => ICONS[k]) || 'tile'; });
t('pictograme: soare noaptea devine lună; condiții RO', () => condIcon('sunny', true) === 'w-moon' && condLabel('snowy-rainy') === 'Lapoviță' && condLabel('zzz') === '—' || 'etichete');
t('pictograme: SVG-urile meteo nu conțin script/on*', () => Object.entries(ICONS).filter(([k]) => /^w-|drop|gauge|compass/.test(k)).every(([, v]) => !/<script|\son\w+=|href=|javascript:/i.test(v) && (v.match(/</g) || []).length === (v.match(/>/g) || []).length) || 'periculos');

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
