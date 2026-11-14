import { t, decSep, thouSep } from './i18n.mjs';

// stările text ale entităților (limba sursă: româna; t() le traduce)
const STATE_TXT = { on: 'pornit', off: 'oprit', open: 'deschis', closed: 'închis', locked: 'blocat', unlocked: 'deblocat', opening: 'se deschide', closing: 'se închide',
  heat: 'încălzire', cool: 'răcire', heat_cool: 'auto', auto: 'auto', playing: 'redare', paused: 'pauză', idle: 'inactiv', standby: 'în așteptare', jammed: 'înfundat',
  running: 'în funcțiune', alert: 'alertă', warning: 'avertisment', problem: 'problemă', error: 'eroare', ok: 'ok', normal: 'normal' };
const lab = (st) => (STATE_TXT[st] !== undefined ? t(STATE_TXT[st]) : st);
// src/state.mjs — stateOf, secondaryText pentru ccu-buttons-card

/**
 * Determină starea vizuală a unei entități în funcție de starea HA și de o regulă opțională.
 * Returnează: 'on' | 'off' | 'alert' | 'ok' | 'unavailable'
 *
 * Reguli:
 * - light/switch/fan/climate/cover/binary_sensor: 'on' dacă starea e 'on', 'open', 'unlocked', etc.
 * - sensor: 'off' (neutru) fără praguri, 'alert' în afara lor, 'ok' în interval; 'unavailable' dacă non-numeric
 * - alert: setat explicit sau dedus (ex: binary_sensor cu stare 'problem')
 * - ok: pentru senzori în rangul acceptat (ex: temp 18–24°C)
 *
 * Domeniu:
 * - rule.domain (ex: {domain: 'lock'}) are prioritate
 * - rule.entity_id (ex: 'lock.usa') → domeniul se extrage din prefix
 * - dacă lipsesc, se deduce din stare (ex: 'locked' → 'lock', 'heating' → 'climate')
 */
export function stateOf(entityState, rule) {
  // dacă entityState e obiect, extrage state/entity_id/device_class din el
  const stateObj = typeof entityState === 'object' && entityState !== null ? entityState : { state: entityState };
  const state = String(stateObj.state ?? stateObj).trim().toLowerCase();
  const entityId = rule?.entity_id ?? stateObj.entity_id;
  const deviceClass = rule?.device_class ?? stateObj.attributes?.device_class ?? '';
  const ruleDomain = rule?.domain;

  // șir gol/spații → unavailable (Number('') nu se folosește ca număr)
  if (state === '') {
    return 'unavailable';
  }

  // Domeniu din regulă (ex: 'light', 'sensor') sau dedus din state (ex: 'unavailable')
  // și/sau din entity_id (ex: 'lock.usa' → 'lock')
  const domain = ruleDomain || (entityId ? entityId.split('.')[0] : detectDomain(state));

  // Stări unavailable
  if (['unavailable', 'unknown', 'none', 'no_state', 'no entity'].includes(state)) {
    return 'unavailable';
  }

  // Domeniu-specific logic
  switch (domain) {
    case 'light':
    case 'switch':
    case 'fan':
    case 'cover':
    case 'lock':
    case 'valve':
      // lock: unlocked/unlocking/jammed → alert; locked → off
      if (domain === 'lock') {
        if (state === 'locked') return 'off';
        if (['unlocked', 'unlocking', 'jammed'].includes(state)) return 'alert';
        return state === 'on' ? 'on' : 'off';
      }
      return state === 'on' ? 'on' : state === 'off' ? 'off' : visualState(state);

    case 'binary_sensor': {
      // binary_sensor cu device_class: smoke, gas, moisture, problem, safety, tamper, carbon_monoxide, heat, cold
      // și starea 'on' → 'alert'; altfel: inferState
      // deviceClass: rule.device_class (prioritar) sau entityState.attributes.device_class
      const deviceClass = rule?.device_class ?? entityState?.attributes?.device_class ?? '';
      const alertClasses = ['smoke', 'gas', 'moisture', 'problem', 'safety', 'tamper', 'carbon_monoxide', 'heat', 'cold'];
      if (state === 'on' && alertClasses.includes(deviceClass)) {
        return 'alert';
      }
      return state === 'on' ? 'on' : state === 'off' ? 'off' : visualState(state);
    }

    case 'sensor': {
      // stare TEXT legitimă (ex. „running”, „Ultima zi”) = neutru, nu „indisponibil” (indisponibil/unknown au fost tratate mai sus)
      const r = inferSensorState(state, rule);
      return r === 'unavailable' ? 'off' : r;
    }
    case 'number':
    case 'input_number':
    case 'input_text':
      return inferSensorState(state, rule);

    case 'climate':
    case 'hvac':
    case 'water_heater':
      return inferClimateState(state, rule);

    case 'weather':
      return 'off'; // condiția meteo e informație, nu „activ”

    case 'sun':
    case 'person':
    case 'device_tracker':
      // person: home→on, not_home→off
      // sun: above_horizon→on, below_horizon→off
      // device_tracker: home→on, altfel off
      if (domain === 'person') {
        return state === 'home' ? 'on' : state === 'not_home' ? 'off' : 'on';
      }
      if (domain === 'sun') {
        return state === 'above_horizon' ? 'on' : 'off';
      }
      if (domain === 'device_tracker') {
        return state === 'home' ? 'on' : 'off';
      }
      return state === 'on' ? 'on' : 'off';

    default:
      return visualState(state);
  }
}

/**
 * Detectează domeniul dintr-o stare HA (ex: 'unavailable' → 'generic', 'locked' → 'lock').
 */
function detectDomain(state) {
  if (state === 'unavailable' || state === 'unknown') return 'generic';
  if (['locked', 'unlocking', 'unlocked', 'jammed'].includes(state)) return 'lock';
  if (['open', 'opened', 'closing', 'closed'].includes(state)) return 'cover';
  if (['running', 'idle', 'heating', 'cooling', 'off'].includes(state)) return 'climate';
  if (['enabled', 'disabled'].includes(state)) return 'binary_sensor';
  return 'generic';
}

/**
 * Inferă starea pentru senzori (valori numerice, threshold-uri).
 */
function inferSensorState(state, rule) {
  // Dacă este non-numeric, return 'unavailable' (nu 'off')
  const value = Number(state);
  if (isNaN(value)) {
    // Poate fi 'high'/'low' pentru binary_sensor, dar pentru sensor → 'unavailable'
    if (['high', 'low', 'open', 'closed', 'on', 'off'].includes(state)) {
      return state === 'on' || state === 'high' || state === 'open' ? 'on' : 'off';
    }
    return 'unavailable';
  }

  // Threshold-uri din regulă
  const alertAbove = rule?.alert_above ?? Infinity;
  const alertBelow = rule?.alert_below ?? -Infinity;
  // okAbove/okBelow implicite NU există — doar dacă sunt setate în regulă
  const okAbove = rule?.ok_above;
  const okBelow = rule?.ok_below;

  if (value > alertAbove || value < alertBelow) {
    return 'alert';
  }
  // dacă okAbove/okBelow sunt setate și valoarea e în interval → 'ok', altfel 'off'
  if (okAbove !== undefined && okBelow !== undefined && value >= okAbove && value <= okBelow) {
    return 'ok';
  }
  // fără praguri deloc → 'off' (neutru)
  return 'off';
}

/**
 * Inferă starea pentru climate/hvac.
 */
function inferClimateState(state) {
  if (['on', 'heat', 'cool', 'auto'].includes(state)) return 'on';
  if (['off', 'idle'].includes(state)) return 'off';
  if (['unavailable', 'unknown'].includes(state)) return 'unavailable';
  if (['problem', 'error'].includes(state)) return 'alert';
  return 'ok';
}

/**
 * Inferă starea generală (light/switch/fan etc.).
 */
/**
 * Starea VIZUALĂ ('on'|'off'|'alert'|'ok'|'unavailable') pentru stări de entități fără regulă proprie (group, input_boolean, automation, valve…).
 * (inferState de mai jos TRADUCE stările în română pentru texte; nu se folosește pentru stilul plăcii.)
 */
export function visualState(state) {
  const s = String(state).trim().toLowerCase();
  if (['unavailable', 'unknown', 'none', 'no_state', ''].includes(s)) return 'unavailable';
  if (['alert', 'warning', 'problem', 'error', 'triggered', 'jammed', 'unlocking', 'tamper'].includes(s)) return 'alert';
  if (['ok', 'normal'].includes(s)) return 'ok';
  if (['off', 'closed', 'locked', 'idle', 'standby', 'paused', 'not_home', 'inactive', 'stopped', 'disarmed', 'clear'].includes(s)) return 'off';
  return 'on'; // on, open, opening, closing, unlocked, running, playing, active, home, heating, charging…
}

function inferState(state) {
  return lab(state);
}

/**
 * Generează textul secundar pentru o entitate.
 * Exemple: '24,6 °C', '75 %', '1,2 kW', 'open', 'locked'.
 * Semnătură: secondaryText(entity, hass)
 *
 * Reguli:
 * - dacă entitate are unit_of_measurement → folosește-l
 * - pentru climate: temperatură curentă + stare
 * - pentru binary_sensor: 'open'/'closed'/'on'/'off'
 * - altfel: valoare cu unitate sau stare
 * - hass?: config.unit_system.temperature (implicit '°C')
 */
export function secondaryText(entity, hass) {
  if (!entity) return '—';

  const state = entity.state;
  // Orice domeniu cu stare unavailable/unknown/gol → '—'
  if (state === undefined || state === null || state === '' || ['unavailable', 'unknown'].includes(String(state))) {
    return '—';
  }

  // Domeniu
  const domain = entity.entity_id?.split('.')[0] || entity.domain || 'generic';

  // senzor de tip timestamp (ex. timpul rămas al mașinii de spălat = ora de final): „38 min” / „1 h 5 min” / „gata”
  if (domain === 'sensor' && /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(String(state))) {
    const mins = Math.round((Date.parse(state) - Date.now()) / 60000);
    if (Number.isFinite(mins)) return mins <= 0 ? t('gata') : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
  }

  // Valoare numerică
  const value = Number(state);
  const numeric = !isNaN(value);

  // Unitate din entitate sau din hass.attributes
  let unit = entity.attributes?.unit_of_measurement || entity.unit || '';

  switch (domain) {
    case 'weather': {
      const W = { sunny: t('Senin'), 'clear-night': t('Senin'), partlycloudy: t('Parțial noros'), cloudy: t('Noros'), fog: t('Ceață'), rainy: t('Ploaie'), pouring: t('Ploaie torențială'), snowy: t('Ninsoare'),
        'snowy-rainy': t('Lapoviță'), lightning: t('Furtună'), 'lightning-rainy': t('Furtună cu ploaie'), hail: t('Grindină'), windy: t('Vânt'), 'windy-variant': t('Vânt și nori'), exceptional: t('Fenomen deosebit') };
      const tmp = Number(entity.attributes && entity.attributes.temperature);
      const tu = (entity.attributes && entity.attributes.temperature_unit) || '°';
      return `${W[state] || state}${Number.isFinite(tmp) ? ` ${formatNumber(tmp)}${tu === '°C' || tu === '°F' ? '°' : tu}` : ''}`;
    }

    case 'sensor':
    case 'number':
    case 'input_number': {
      // pentru domenii numerice: unavailable/unknown/gol/non-numerică → '—' (nu „NaN W” / „unavailable W”)
      if (!numeric || isNaN(value)) {
        // EXCEPȚIE: un `sensor` poate avea stare TEXT legitimă (stare mașină „running”, „Ultima zi”, „partlycloudy”): se arată textul, fără „_”
        const t = String(state).trim();
        if (domain === 'sensor' && t !== '' && !['unavailable', 'unknown', 'none', 'no_state'].includes(t.toLowerCase())) return t.replace(/_/g, ' ');
        return '—';
      }
      const formatted = formatNumber(value);
      return unit ? `${formatted} ${unit}` : formatted;
    }

    case 'climate':
    case 'hvac':
    case 'water_heater': {
      const temp = numeric ? formatNumber(value) : state;
      const unit = entity.attributes?.unit_of_measurement || hass?.config?.unit_system?.temperature || '°C';
      const currentTemp = entity.attributes?.current_temperature;
      // dacă nu are current_temperature, afișează starea tradusă, fără unitate
      if (currentTemp === undefined) {
        return lab(state);
      }
      return `${formatNumber(currentTemp)} ${unit}`;
    }

    case 'media_player': {
      // media_player: playing→redare, paused→pauză, idle→inactiv, off→oprit, on→pornit
      return lab(state);
    }

    case 'light':
    case 'switch':
    case 'fan':
    case 'cover':
    case 'lock':
    case 'valve': {
      if (numeric) {
        return unit ? `${formatNumber(value)} ${unit}` : state;
      }
      // traduceri românești pentru stări text
      return lab(state);
    }

    case 'binary_sensor': {
      // pentru device_class: entity.attributes.device_class (pentru secondaryText)
      // în secondaryText NU există variabila `rule` (parametrii sunt entity, hass)
      // fallback: dacă nu în attributes, încearcă entity.device_class direct
      const deviceClass = entity?.attributes?.device_class ?? entity?.device_class ?? '';
      // door/window/opening/garage_door: deschis/închis
      if (['door', 'window', 'opening', 'garage_door'].includes(deviceClass)) {
        return state === 'on' ? t('deschis') : state === 'off' ? t('închis') : state;
      }
      // motion/occupancy/presence: mișcare/liber
      if (['motion', 'occupancy', 'presence'].includes(deviceClass)) {
        return state === 'on' ? t('mișcare') : state === 'off' ? t('liber') : state;
      }
      // smoke/gas/moisture/problem/safety/tamper: alertă/ok
      if (['smoke', 'gas', 'moisture', 'problem', 'safety', 'tamper', 'carbon_monoxide', 'heat', 'cold'].includes(deviceClass)) {
        return state === 'on' ? t('alertă') : state === 'off' ? t('ok') : state;
      }
      // implicit: activ/inactiv
      return state === 'on' ? t('activ') : state === 'off' ? t('inactiv') : state;
    }

    case 'input_text': {
      return state;
    }

    case 'sun': {
      return state === 'above_horizon' ? t('sus') : t('jos');
    }

    case 'person':
    case 'device_tracker': {
      if (state === 'home') return t('acasă');
      if (state === 'not_home') return t('plecat');
      return state;
    }

    default: {
      if (numeric) {
        return unit ? `${formatNumber(value)} ${unit}` : state;
      }
      return state;
    }
  }
}

/**
 * Formatează un număr românesc (virgulă zecimală, separator de mii).
 * - zecimale: |x|≥100 → 0, ≥10 → 1, altfel 2 (fără zerouri finale)
 * - după rotunjire, dacă rezultatul e 0 → '0' (fără minus)
 * - |x| ≥ 1e15 sau nefinit → '—'
 * - separator de mii cu spațiu subțire (0x202F)
 */
function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e15 || !Number.isFinite(value)) return '—';
  if (value === -0) return '0';
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const s = value.toFixed(decimals);
  // separator de mii cu spațiu subțire
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thouSep());
  const sep = decSep();
  const formatted = parts.join(sep);
  // elimină zerouri finale (dar nu toate dacă e 0)
  // regex: elimină .0, ,0, .,0, ,,0 la final
  const result = formatted.replace(/(\.,?|,)0+$/, '').replace(/[.,]$/, '');
  // după rotunjire, dacă rezultatul e 0 → '0' (fără minus)
  if (result === '0' || result === '-0' || result === '0' + sep + '0' || result === '-0' + sep + '0') return '0';
  return result;
}

// Export pentru testare
export { detectDomain, inferSensorState, inferClimateState, inferState, formatNumber };
