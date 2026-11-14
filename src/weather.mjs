// src/weather.mjs — cardul de vreme. Valorile curente vin din senzorii stației (ex. Ecowitt), NU din prognoză;
// prognoza pe zile vine din entitatea weather.*. Funcții PURE (model + șabloane); animațiile sunt în theme.js (CSS), doar prin atribute data-*.
import { t, weekdayShort, decSep } from './i18n.mjs';
import { esc } from './render.mjs';
import { iconSvg } from './icons.mjs';

const ENTITY = /^[a-z_]+\.[a-z0-9_]+$/;
const okId = (e) => typeof e === 'string' && ENTITY.test(e);
const DAYS = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SV', 'V', 'NV'];

// ---------------------------------------------------------------- conversii
const num = (s) => { if (!s || s.state === '' || s.state === null || s.state === undefined) return null; const n = Number(s.state); return Number.isFinite(n) ? n : null; };
const unitOf = (s) => String((s && s.attributes && s.attributes.unit_of_measurement) || '').trim();
export function toC(v, unit) { if (v === null) return null; const u = String(unit || '').toLowerCase(); return u.includes('f') ? (v - 32) / 1.8 : u === 'k' ? v - 273.15 : v; }
export function toKmh(v, unit) { if (v === null) return null; const u = String(unit || '').toLowerCase().replace(/\s/g, ''); return u === 'm/s' ? v * 3.6 : u === 'mph' ? v * 1.609344 : u === 'kn' || u === 'kt' ? v * 1.852 : u === 'ft/s' ? v * 1.09728 : v; }
export function toMmh(v, unit) { if (v === null) return null; const u = String(unit || '').toLowerCase().replace(/\s/g, ''); return /^in\/h/.test(u) ? v * 25.4 : v; }
export function toMm(v, unit) { if (v === null) return null; return String(unit || '').toLowerCase() === 'in' ? v * 25.4 : v; }
const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', decSep());
const f0 = (n) => String(Math.round(n));
export function dirText(deg) { return Number.isFinite(deg) ? t(DIRS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]) : ''; }

// ---------------------------------------------------------------- config
const TILE_DEFS = {
  humidity: { icon: 'drop', label: 'Umiditate' }, wind: { icon: 'w-wind', label: 'Vânt' }, rain: { icon: 'w-rain', label: 'Ploaie' }, pressure: { icon: 'gauge', label: 'Presiune' },
  uv: { icon: 'sun', label: 'Indice UV' }, radiation: { icon: 'sun', label: 'Radiație' }, lux: { icon: 'bulb', label: 'Luminozitate' }, dew_point: { icon: 'drop', label: 'Punct de rouă' },
  feels_like: { icon: 'thermo', label: 'Se simte ca' }, gust: { icon: 'w-wind', label: 'Rafale' },
};
const SENSOR_KEYS = ['temperature', 'feels_like', 'humidity', 'wind_speed', 'wind_gust', 'wind_direction', 'rain_rate', 'rain_today', 'rain_state', 'pressure', 'uv', 'radiation', 'lux', 'dew_point'];
const DEFAULT_TILES = ['humidity', 'wind', 'rain', 'pressure', 'uv', 'radiation'];
// ce senzor(i) cere fiecare tile
const NEEDS = { humidity: ['humidity'], wind: ['wind_speed'], rain: ['rain_today', 'rain_rate'], pressure: ['pressure'], uv: ['uv'], radiation: ['radiation'], lux: ['lux'], dew_point: ['dew_point'], feels_like: ['feels_like'], gust: ['wind_gust'] };

/** Normalizează config-ul. items (listă plată) = entitățile tile-urilor + entitatea weather (pentru more-info la atingere). */
export function normalizeWeatherConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], sensors = {};
  const raw = src.sensors && typeof src.sensors === 'object' ? src.sensors : {};
  for (const k of SENSOR_KEYS) {
    if (raw[k] === undefined || raw[k] === '') continue;
    if (okId(raw[k])) sensors[k] = raw[k]; else warnings.push(t('Vreme: „{k}” nu e un entity_id valid.', { k }));
  }
  for (const k of Object.keys(raw)) if (!SENSOR_KEYS.includes(k)) warnings.push(t('Vreme: senzor necunoscut „{k}” ignorat.', { k }));
  let weather = '';
  if (src.weather !== undefined && src.weather !== '') { if (okId(src.weather) && src.weather.startsWith('weather.')) weather = src.weather; else warnings.push(t('Vreme: „weather” trebuie să fie o entitate weather.*.')); }
  const tiles = (Array.isArray(src.tiles) ? src.tiles : DEFAULT_TILES).filter((tk) => {
    if (!TILE_DEFS[tk]) { warnings.push(t('Vreme: tile necunoscut „{k}”.', { k: tk })); return false; }
    return NEEDS[tk].some((k) => sensors[k]); // fără senzor configurat, tile-ul nu apare
  }).slice(0, 8);
  const d = Number(src.days);
  const days = Number.isInteger(d) && d >= 1 && d <= 7 ? d : 5;
  if (!Object.keys(sensors).length && !weather) warnings.push(t('Vreme: nu e configurat niciun senzor și nicio entitate weather.'));
  const items = [];
  const seen = new Set();
  for (const t of tiles) for (const k of NEEDS[t]) if (sensors[k] && !seen.has(sensors[k])) { seen.add(sensors[k]); items.push({ kind: 'sensor', key: k, entity: sensors[k] }); }
  for (const k of ['temperature']) if (sensors[k] && !seen.has(sensors[k])) { seen.add(sensors[k]); items.push({ kind: 'sensor', key: k, entity: sensors[k] }); }
  if (weather) { const w = { kind: 'weather', key: 'weather', entity: weather }; if (src.tap_action !== undefined) w.tap_action = src.tap_action; if (src.hold_action !== undefined) w.hold_action = src.hold_action; items.push(w); } // tap/hold pe scenă și pe zile
  return { config: { sensors, weather, tiles, days, title: src.title ? String(src.title) : '', scene_fallback: src.scene_fallback !== false, fallback_to_forecast: src.fallback_to_forecast === true, sun: okId(src.sun) ? src.sun : 'sun.sun', items }, warnings };
}

// ---------------------------------------------------------------- clasificarea scenei
const COND_RO = { sunny: 'Senin', 'clear-night': 'Senin', partlycloudy: 'Parțial noros', cloudy: 'Noros', fog: 'Ceață', rainy: 'Ploaie', pouring: 'Ploaie torențială', snowy: 'Ninsoare', 'snowy-rainy': 'Lapoviță',
  lightning: 'Furtună', 'lightning-rainy': 'Furtună cu ploaie', hail: 'Grindină', windy: 'Vânt', 'windy-variant': 'Vânt și nori', exceptional: 'Fenomen deosebit' };
const COND_ICON = { sunny: 'w-sun', 'clear-night': 'w-moon', partlycloudy: 'w-partly', cloudy: 'w-cloud', fog: 'w-fog', rainy: 'w-rain', pouring: 'w-pour', snowy: 'w-snow', 'snowy-rainy': 'w-sleet',
  lightning: 'w-storm', 'lightning-rainy': 'w-storm', hail: 'w-hail', windy: 'w-wind', 'windy-variant': 'w-wind', exceptional: 'w-cloud' };
export const condLabel = (c) => (COND_RO[c] ? t(COND_RO[c]) : '—');
export const condIcon = (c, night = false) => (c === 'sunny' && night ? 'w-moon' : COND_ICON[c] || 'w-cloud');

const WORD = { rain: ['Ploaie ușoară', 'Ploaie', 'Ploaie torențială'], snow: ['Ninsoare ușoară', 'Ninsoare', 'Ninsoare abundentă'], sleet: ['Lapoviță slabă', 'Lapoviță', 'Lapoviță abundentă'] };
const skyOf = (c) => (c === 'sunny' || c === 'clear-night' ? 'clear' : c === 'partlycloudy' || c === 'windy' || c === 'windy-variant' ? 'partly' : c === 'fog' ? 'fog' : c ? 'cloudy' : 'clear');

/**
 * Ce se desenează în scenă. Intrări în unități fixe: tempC (°C), rainMmh (mm/h), windKmh (km/h); null = necunoscut.
 * Precipitațiile: ploaie > 2,5 °C, lapoviță 0,5–2,5 °C, ninsoare ≤ 0,5 °C. Intensitatea 1–3 după debit. Vântul 0–3 după km/h.
 * Cu `fallback`, ce lipsește din senzori se completează din starea entității weather (și se marchează `fromForecast`).
 */
export function classifyScene({ tempC = null, rainMmh = null, rainOn = null, windKmh = null, cond = '', windFallbackKmh = null, night = false, fallback = true } = {}) {
  let precip = 'none', intensity = 0, fromForecast = false, bolt = /lightning/.test(cond);
  const haveRain = rainMmh !== null || rainOn !== null;
  if (haveRain) {
    const rate = rainMmh !== null ? rainMmh : (rainOn ? 1 : 0);
    if (rate >= 0.05 || (rainOn === true && rainMmh === null)) {
      const t = tempC;
      precip = t === null ? 'rain' : t <= 0.5 ? 'snow' : t <= 2.5 ? 'sleet' : 'rain';
      intensity = precip === 'rain' ? (rate < 0.5 ? 1 : rate < 4 ? 2 : 3) : (rate < 0.3 ? 1 : rate < 2 ? 2 : 3);
    }
  } else if (fallback) {
    if (cond === 'rainy' || cond === 'lightning-rainy') { precip = 'rain'; intensity = 2; }
    else if (cond === 'pouring' || cond === 'hail') { precip = 'rain'; intensity = 3; }
    else if (cond === 'snowy') { precip = 'snow'; intensity = 2; }
    else if (cond === 'snowy-rainy') { precip = 'sleet'; intensity = 2; }
    fromForecast = precip !== 'none';
  }
  let w = windKmh;
  if (w === null && fallback && windFallbackKmh !== null) { w = windFallbackKmh; fromForecast = fromForecast || w >= 12; }
  if (w === null && fallback && (cond === 'windy' || cond === 'windy-variant')) { w = 30; fromForecast = true; }
  const wind = w === null || w < 12 ? 0 : w < 25 ? 1 : w < 40 ? 2 : 3;
  const sky = precip !== 'none' || bolt ? 'cloudy' : skyOf(cond);
  let label;
  if (bolt) label = precip !== 'none' ? t('Furtună cu ploaie') : t('Furtună');
  else if (precip !== 'none') label = t(WORD[precip][intensity - 1]);
  else if (cond === 'hail') label = t('Grindină');
  else if (sky === 'clear' && night) label = t('Cer senin');
  else label = cond ? t(COND_RO[cond] || 'Noros') : '—';
  if (wind >= 2 && precip === 'none' && !bolt && sky !== 'fog') label = wind === 3 ? t('Vânt puternic') : (cond ? label + t(' · vânt') : t('Vânt'));
  else if (wind >= 2 && precip !== 'none') label += wind === 3 ? t(' · vânt puternic') : t(' · vânt');
  return { precip, intensity, wind, sky, night: !!night, bolt, label, fromForecast };
}

// ---------------------------------------------------------------- prognoza
/** Normalizează lista de zile din weather.get_forecasts (sau din atributul forecast). Fără excepții pentru intrări ciudate. */
export function parseForecast(raw, tempUnit = '°C', windUnit = 'km/h', now = new Date()) {
  const arr = Array.isArray(raw) ? raw : [];
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const out = [];
  for (const d of arr) {
    if (!d || typeof d !== 'object') continue;
    const dt = new Date(d.datetime);
    if (Number.isNaN(dt.getTime())) continue;
    const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    const hi = Number.isFinite(Number(d.temperature)) && d.temperature !== null ? toC(Number(d.temperature), tempUnit) : null;
    const lo = Number.isFinite(Number(d.templow)) && d.templow !== null ? toC(Number(d.templow), tempUnit) : null;
    const ws = Number.isFinite(Number(d.wind_speed)) && d.wind_speed !== null ? toKmh(Number(d.wind_speed), windUnit) : null;
    const pp = Number.isFinite(Number(d.precipitation_probability)) && d.precipitation_probability !== null ? Math.round(Number(d.precipitation_probability)) : null;
    const pr = Number.isFinite(Number(d.precipitation)) && d.precipitation !== null ? Number(d.precipitation) : null;
    const wb = Number.isFinite(Number(d.wind_bearing)) && d.wind_bearing !== null ? Number(d.wind_bearing) : null;
    out.push({ t: dt.getTime(), today: key === todayKey, name: key === todayKey ? t('Azi') : weekdayShort(dt), cond: String(d.condition || ''), hi, lo, wind: ws, bearing: wb, pop: pp, mm: pr });
  }
  return out.filter((d) => d.today || d.t > now.getTime() - 864e5).sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- model
export function buildWeatherModel(config, hass, forecastRaw, now = new Date()) {
  const st = (k) => (config.sensors[k] && hass && hass.states ? hass.states[config.sensors[k]] : null);
  const ws = config.weather && hass && hass.states ? hass.states[config.weather] : null;
  const wa = (ws && ws.attributes) || {};
  const sunS = hass && hass.states ? hass.states[config.sun] : null;
  const night = !!sunS && sunS.state === 'below_horizon';
  const tempC = toC(num(st('temperature')), unitOf(st('temperature')) || '°C');
  const rainRate = toMmh(num(st('rain_rate')), unitOf(st('rain_rate')) || 'mm/h');
  const rs = st('rain_state'); const rainOn = rs && (rs.state === 'on' || rs.state === 'off') ? rs.state === 'on' : null;
  const windKmh = toKmh(num(st('wind_speed')), unitOf(st('wind_speed')) || 'km/h');
  const gustKmh = toKmh(num(st('wind_gust')), unitOf(st('wind_gust')) || 'km/h');
  const dirDeg = num(st('wind_direction'));
  const cond = ws && ws.state && ws.state !== 'unavailable' && ws.state !== 'unknown' ? ws.state : '';
  const wFb = ws && Number.isFinite(Number(wa.wind_speed)) ? toKmh(Number(wa.wind_speed), wa.wind_speed_unit || 'km/h') : null;
  const scene = classifyScene({ tempC, rainMmh: rainRate, rainOn, windKmh, cond, windFallbackKmh: wFb, night, fallback: config.scene_fallback });

  const showTemp = tempC !== null ? tempC : (config.fallback_to_forecast && Number.isFinite(Number(wa.temperature)) ? toC(Number(wa.temperature), wa.temperature_unit || '°C') : null);
  const feels = toC(num(st('feels_like')), unitOf(st('feels_like')) || '°C');
  const tileOf = (key) => {
    const d = TILE_DEFS[key]; let value = '—', sub = '', lvl = '', rawEntity = '';
    if (key === 'humidity') { const v = num(st('humidity')); value = v === null ? '—' : `${f0(v)}%`; rawEntity = config.sensors.humidity; }
    else if (key === 'wind') {
      rawEntity = config.sensors.wind_speed; value = windKmh === null ? '—' : `${f0(windKmh)} km/h`;
      const parts = []; if (gustKmh !== null) parts.push(`rafale ${f0(gustKmh)}`); if (dirDeg !== null) parts.push(dirText(dirDeg)); sub = parts.join(' · ');
      if (windKmh !== null && windKmh >= 50) lvl = 'warn';
    } else if (key === 'gust') { rawEntity = config.sensors.wind_gust; value = gustKmh === null ? '—' : `${f0(gustKmh)} km/h`; if (gustKmh !== null && gustKmh >= 70) lvl = 'warn'; }
    else if (key === 'rain') {
      rawEntity = config.sensors.rain_today || config.sensors.rain_rate;
      const day = toMm(num(st('rain_today')), unitOf(st('rain_today')) || 'mm');
      value = day === null ? (rainRate === null ? '—' : `${f1(rainRate)} mm/h`) : `${f1(day)} mm`;
      if (rainRate !== null && rainRate >= 0.05) { sub = `acum ${f1(rainRate)} mm/h`; lvl = 'active'; }
    } else if (key === 'pressure') { const v = num(st('pressure')); value = v === null ? '—' : `${f1(v)} hPa`; rawEntity = config.sensors.pressure; }
    else if (key === 'uv') { const v = num(st('uv')); value = v === null ? '—' : f1(v); rawEntity = config.sensors.uv; if (v !== null && v >= 6) lvl = 'warn'; if (v !== null) sub = t(v < 3 ? 'redus' : v < 6 ? 'moderat' : v < 8 ? 'ridicat' : v < 11 ? 'foarte ridicat' : 'extrem'); }
    else if (key === 'radiation') { const v = num(st('radiation')); value = v === null ? '—' : `${f0(v)} W/m²`; rawEntity = config.sensors.radiation; }
    else if (key === 'lux') { const v = num(st('lux')); value = v === null ? '—' : `${f0(v)} lx`; rawEntity = config.sensors.lux; }
    else if (key === 'dew_point') { const v = toC(num(st('dew_point')), unitOf(st('dew_point')) || '°C'); value = v === null ? '—' : `${f1(v)} °C`; rawEntity = config.sensors.dew_point; }
    else if (key === 'feels_like') { value = feels === null ? '—' : `${f1(feels)} °C`; rawEntity = config.sensors.feels_like; }
    return { key, icon: d.icon, label: t(d.label), value, sub, lvl, entity: rawEntity, na: value === '—' };
  };
  const tiles = config.tiles.map(tileOf);
  const days = parseForecast(forecastRaw, wa.temperature_unit || '°C', wa.wind_speed_unit || 'km/h', now).slice(0, config.days);
  const tempText = showTemp === null ? '—' : f1(showTemp);
  return { scene, tempText, tempFromForecast: tempC === null && showTemp !== null, feelsText: feels === null ? '' : t('Se simte ca {x}°', { x: f1(feels) }), windDeg: dirDeg, tiles, days, hasWeather: !!ws, cond, night };
}

// ---------------------------------------------------------------- șabloane
const PARTICLES = (n, f) => Array.from({ length: n }, (_, i) => `<i style="${f(i)}"></i>`).join('');
const frac = (i, m, k) => ((i * m + k) % 100) / 100;
const RAIN = PARTICLES(40, (i) => `--x:${Math.round(frac(i, 37, 11) * 104 - 2)}%;--dl:${(-frac(i, 53, 7) * 1.6).toFixed(2)}s;--s:${frac(i, 29, 3).toFixed(2)}`);
const SNOW = PARTICLES(30, (i) => `--x:${Math.round(frac(i, 41, 5) * 100)}%;--dl:${(-frac(i, 47, 13) * 8).toFixed(2)}s;--s:${frac(i, 31, 17).toFixed(2)};--sw:${Math.round((frac(i, 19, 2) - 0.5) * 36)}px`);
const WINDS = PARTICLES(9, (i) => `--y:${Math.round(frac(i, 43, 9) * 86 + 6)}%;--dl:${(-frac(i, 59, 1) * 2.4).toFixed(2)}s;--s:${frac(i, 23, 4).toFixed(2)}`);
const CLOUDS = PARTICLES(4, (i) => `--y:${[6, 22, 12, 30][i]}%;--w:${[46, 62, 38, 54][i]}%;--t:${[46, 62, 38, 70][i]}s;--dl:${[-8, -30, -20, -42][i]}s;--o:${[0.9, 0.7, 0.8, 0.6][i]}`);
const STARS = PARTICLES(14, (i) => `--x:${Math.round(frac(i, 37, 5) * 96 + 2)}%;--y:${Math.round(frac(i, 53, 9) * 60 + 4)}%;--dl:${(-frac(i, 29, 7) * 4).toFixed(2)}s;--s:${frac(i, 17, 3).toFixed(2)}`);

/** Scena animată: structură CONSTANTĂ (mereu aceleași elemente); ce se vede decide CSS după data-*. */
export function renderScene(model, wi = -1, entity = '', chips = '') {
  const s = model.scene;
  const lean = (s.wind * -7), drift = (s.wind * 16);
  const act = wi >= 0 ? ` data-id="${wi}" data-entity="${esc(entity)}"` : '';
  return `<div class="ccu-scene"${act} data-sky="${s.sky}" data-precip="${s.precip}" data-int="${s.intensity}" data-wind="${s.wind}" data-night="${s.night ? 1 : 0}" data-bolt="${s.bolt ? 1 : 0}" style="--lean:${lean}deg;--drift:${drift}px">`
    + `<div class="sun"><i></i></div><div class="moon"></div><div class="stars">${STARS}</div><div class="clouds">${CLOUDS}</div><div class="fog"><i></i><i></i><i></i></div>`
    + `<div class="rain">${RAIN}</div><div class="snow">${SNOW}</div><div class="windl">${WINDS}</div><div class="flash"></div>`
    + `<div class="base"><div class="info"><div class="t${model.tempText === '—' ? ' na' : ''}">${model.tempText === '—' ? '— —' : `${esc(model.tempText)}<sup>°C</sup>`}</div><div class="c">${esc(model.scene.label)}</div>`
    + `<div class="f">${esc(model.feelsText)}${model.scene.fromForecast ? `${model.feelsText ? ' · ' : ''}${t('după prognoză')}` : ''}</div></div>`
    + (chips ? `<div class="wx-chips">${chips}</div>` : '') + `</div></div>`;
}

/** Cardul complet (șir). config.items = lista plată (pentru data-id → more-info). */
export function renderWeather(config, model, opts = {}) {
  const idxOf = (entity) => config.items.findIndex((x) => x.entity === entity);
  const tiles = model.tiles.map((t) => `<div class="wt" data-id="${idxOf(t.entity)}" data-entity="${esc(t.entity)}" data-na="${t.na ? 1 : 0}" data-lvl="${esc(t.lvl)}" title="${esc(t.label)}">`
    + `<span class="ccu-ico">${iconSvg(t.icon)}</span><span class="tx"><b>${t.key === 'uv' && !t.na ? 'UV ' : ''}${esc(t.value)}</b></span></div>`).join('');
  const wi = config.items.findIndex((x) => x.kind === 'weather');
  const days = model.days.length ? model.days.map((d) => {
    // ploaie: probabilitate și/sau cantitate; fără niciuna (sau 0 mm fără probabilitate) nu se desenează nimic, nici pictograma
    const ppTxt = [d.pop !== null ? `${d.pop}%` : '', d.mm !== null && d.mm > 0 ? `${f1(d.mm)} mm` : ''].filter(Boolean).join(' · ');
    const pp = ppTxt ? `<small class="pp"><span class="ccu-ico">${iconSvg('drop')}</span>${ppTxt}</small>` : '<small class="pp"></small>';
    const wd = d.wind !== null ? `<small class="ws"><span class="ccu-ico" style="${d.bearing !== null ? `transform:rotate(${Math.round(d.bearing + 180)}deg)` : ''}">${iconSvg('compass')}</span>${f0(d.wind)} km/h</small>` : '<small class="ws"></small>';
    return `<div class="wd" data-id="${wi}" data-entity="${esc(config.weather)}" data-today="${d.today ? 1 : 0}"><small class="dn">${esc(d.name)}</small><span class="ccu-ico wi">${iconSvg(condIcon(d.cond))}</span>`
      + `<b class="hi">${d.hi === null ? '—' : `${f0(d.hi)}°`}</b><span class="lo">${d.lo === null ? '' : `${f0(d.lo)}°`}</span><small class="cn">${esc(condLabel(d.cond))}</small>${pp}${wd}</div>`;
  }).join('') : `<div class="wd-empty">${config.weather ? t('prognoza se încarcă…') : t('fără prognoză (adaugă „weather”)')}</div>`;
  const head = config.title ? `<div class="ccu-flow-head"><span class="t">${esc(config.title)}</span></div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-wx">${head}<div class="ccu-wx-top">${renderScene(model, wi, config.weather, tiles)}</div><div class="ccu-wx-days" data-n="${Math.max(1, model.days.length)}">${days}</div>${notes}</div>`;
}
