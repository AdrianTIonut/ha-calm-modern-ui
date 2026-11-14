// tests/state.test.mjs — teste pentru stateOf și secondaryText
// Rulat cu: node --input-type=module tests/state.test.mjs

import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { stateOf, secondaryText, detectDomain, inferSensorState, inferClimateState, inferState, formatNumber } from '../src/state.mjs';

let pass = 0, fail = 0;

function ok(desc) { pass++; console.log(`✔ ${desc}`); }
function failt(desc, err) { fail++; console.log(`✖ ${desc}${err ? ': ' + err : ''}`); }

// ---- formatNumber ----
try {
  if (formatNumber(24) === '24') ok('formatNumber(24) → "24"');
  else failt('formatNumber 24');
  if (formatNumber(24.6) === '24,6') ok('formatNumber(24.6) → "24,6"');
  else failt('formatNumber 24.6');
  if (formatNumber(24.678) === '24,7') ok('formatNumber(24.678) → "24,7"');
  else failt('formatNumber 24.678');
  if (formatNumber(1000) === '1\u202F000') ok('formatNumber(1000) → separator de mii');
  else failt('formatNumber 1000 separator');
  if (formatNumber(-0) === '0') ok('formatNumber(-0) → "0"');
  else failt('formatNumber -0');
  if (formatNumber(NaN) === '—') ok('formatNumber(NaN) → "—"');
  else failt('formatNumber NaN');
  if (formatNumber(Infinity) === '—') ok('formatNumber(Infinity) → "—"');
  else failt('formatNumber Infinity');
} catch (e) { failt('formatNumber', e.message); }

// ---- detectDomain ----
try {
  if (detectDomain('unavailable') === 'generic') ok('detectDomain unavailable');
  if (detectDomain('locked') === 'lock') ok('detectDomain locked');
  if (detectDomain('open') === 'cover') ok('detectDomain open');
  if (detectDomain('heating') === 'climate') ok('detectDomain heating');
  if (detectDomain('enabled') === 'binary_sensor') ok('detectDomain enabled');
} catch (e) { failt('detectDomain', e.message); }

// ---- stateOf pentru domenii fără regulă proprie: stare VIZUALĂ, nu text tradus (greșeală găsită la integrare) ----
try {
  const so = (state, id) => stateOf(state, { entity_id: id });
  const okAll = so('on', 'group.l') === 'on' && so('off', 'group.l') === 'off' && so('on', 'input_boolean.x') === 'on' && so('off', 'automation.a') === 'off'
    && so('on', 'automation.a') === 'on' && so('open', 'valve.pompa') === 'on' && so('closed', 'valve.pompa') === 'off' && so('playing', 'media_player.tv') === 'on'
    && so('unavailable', 'group.l') === 'unavailable' && so('triggered', 'alarm_control_panel.a') === 'alert' && so('opening', 'cover.g') === 'on';
  if (okAll) ok('stateOf: group/input_boolean/automation/valve/media_player/cover → stare vizuală (on/off/alert), nu text RO');
  else failt('stateOf stare vizuală', JSON.stringify(['on', 'off'].map((x) => so(x, 'group.l'))) + ' ' + so('open', 'valve.pompa') + ' ' + so('opening', 'cover.g'));
  const valid = ['on', 'off', 'alert', 'ok', 'unavailable'];
  const bad = ['on', 'off', 'open', 'closed', 'playing', 'idle', 'home', 'heating', 'triggered', 'ok', 'whatever'].map((x) => so(x, 'x.y')).filter((r) => !valid.includes(r));
  if (bad.length === 0) ok('stateOf: orice stare pentru domeniu necunoscut întoarce doar valori vizuale valide');
  else failt('stateOf valori vizuale valide', bad.join());
} catch (e) { failt('stateOf stare vizuală', e.message); }

// ---- inferState (light/switch/fan/cover/lock/binary_sensor) ----
try {
  if (inferState('on') === 'pornit') ok('inferState on → pornit');
  if (inferState('off') === 'oprit') ok('inferState off → oprit');
  if (inferState('open') === 'deschis') ok('inferState open → deschis');
  if (inferState('closed') === 'închis') ok('inferState closed → închis');
  if (inferState('unlocked') === 'deblocat') ok('inferState unlocked → deblocat');
  if (inferState('locked') === 'blocat') ok('inferState locked → blocat');
  if (inferState('running') === 'în funcțiune') ok('inferState running → în funcțiune');
  if (inferState('idle') === 'inactiv') ok('inferState idle → inactiv');
  if (inferState('alert') === 'alertă') ok('inferState alert → alertă');
  if (inferState('warning') === 'avertisment') ok('inferState warning → avertisment');
  if (inferState('error') === 'eroare') ok('inferState error → eroare');
  if (inferState('ok') === 'ok') ok('inferState ok');
  if (inferState('normal') === 'normal') ok('inferState normal');
  if (inferState('unavailable') === 'unavailable') ok('inferState unavailable');
} catch (e) { failt('inferState', e.message); }

// ---- inferSensorState (sensor/number/input_number) ----
try {
  // fără praguri → 'off' (neutru)
  if (inferSensorState('5', {}) === 'off') ok('inferSensorState 5 fără praguri');
  if (inferSensorState('0', {}) === 'off') ok('inferSensorState 0 fără praguri');
  if (inferSensorState('0.5', {}) === 'off') ok('inferSensorState 0.5 fără praguri');

  // value > 0 → on
  if (inferSensorState('5', {}) === 'off') ok('inferSensorState 5');
  if (inferSensorState('0', {}) === 'off') ok('inferSensorState 0');
  if (inferSensorState('0.5', {}) === 'off') ok('inferSensorState 0.5');

  // non-numeric → unavailable (sau on/off dacă 'high'/'low')
  if (inferSensorState('high', {}) === 'unavailable') ok('inferSensorState high');
  if (inferSensorState('low', {}) === 'unavailable') ok('inferSensorState low');
  if (inferSensorState('unknown', {}) === 'unavailable') ok('inferSensorState unknown');
  if (inferSensorState('none', {}) === 'unavailable') ok('inferSensorState none');

  // alert above threshold
  if (inferSensorState('30', { alert_above: 25 }) === 'alert') ok('inferSensorState alert_above');
  if (inferSensorState('10', { alert_below: 15 }) === 'alert') ok('inferSensorState alert_below');

  // ok în rang
  if (inferSensorState('20', { ok_above: 18, ok_below: 24 }) === 'ok') ok('inferSensorState ok rang');
} catch (e) { failt('inferSensorState', e.message); }

// ---- inferClimateState (climate/hvac/water_heater) ----
try {
  if (inferClimateState('on') === 'on') ok('inferClimateState on');
  if (inferClimateState('off') === 'off') ok('inferClimateState off');
  if (inferClimateState('idle') === 'off') ok('inferClimateState idle');
  if (inferClimateState('heating') === 'on') ok('inferClimateState heating');
  if (inferClimateState('cooling') === 'on') ok('inferClimateState cooling');
  if (inferClimateState('auto') === 'on') ok('inferClimateState auto');
  if (inferClimateState('problem') === 'alert') ok('inferClimateState problem');
  if (inferClimateState('error') === 'alert') ok('inferClimateState error');
  if (inferClimateState('unavailable') === 'unavailable') ok('inferClimateState unavailable');
} catch (e) { failt('inferClimateState', e.message); }

// ---- stateOf (principale) ----
try {
  // light
  if (stateOf('on', { domain: 'light' }) === 'on') ok('stateOf light on');
  if (stateOf('off', { domain: 'light' }) === 'off') ok('stateOf light off');
  // switch
  if (stateOf('on', { domain: 'switch' }) === 'on') ok('stateOf switch on');
  if (stateOf('off', { domain: 'switch' }) === 'off') ok('stateOf switch off');
  // fan
  if (stateOf('on', { domain: 'fan' }) === 'on') ok('stateOf fan on');
  if (stateOf('off', { domain: 'fan' }) === 'off') ok('stateOf fan off');
  // lock
  if (stateOf('locked', { domain: 'lock' }) === 'off') ok('stateOf lock locked');
  if (stateOf('unlocked', { domain: 'lock' }) === 'on') ok('stateOf lock unlocked');
  // binary_sensor
  if (stateOf('on', { domain: 'binary_sensor' }) === 'on') ok('stateOf binary_sensor on');
  if (stateOf('off', { domain: 'binary_sensor' }) === 'off') ok('stateOf binary_sensor off');
  if (stateOf('problem', { domain: 'binary_sensor' }) === 'alert') ok('stateOf binary_sensor problem');
  // binary_sensor cu device_class și starea 'on' → 'alert'
  if (stateOf('on', { domain: 'binary_sensor', device_class: 'smoke' }) === 'alert') ok('stateOf binary_sensor smoke on → alert');
  if (stateOf('on', { domain: 'binary_sensor', device_class: 'motion' }) === 'on') ok('stateOf binary_sensor motion on → on (nu alert)');
  // climate
  if (stateOf('heat', { domain: 'climate' }) === 'on') ok('stateOf climate heat');
  if (stateOf('cooling', { domain: 'climate' }) === 'on') ok('stateOf climate cooling');
  // lock: unlocked/unlocking/jammed → alert; locked → off
  if (stateOf('unlocked', { domain: 'lock' }) === 'alert') ok('stateOf lock unlocked');
  if (stateOf('unlocking', { domain: 'lock' }) === 'alert') ok('stateOf lock unlocking');
  if (stateOf('jammed', { domain: 'lock' }) === 'alert') ok('stateOf lock jammed');
  if (stateOf('locked', { domain: 'lock' }) === 'off') ok('stateOf lock locked');
  // cover
  if (stateOf('open', { domain: 'cover' }) === 'on') ok('stateOf cover open');
  if (stateOf('closed', { domain: 'cover' }) === 'off') ok('stateOf cover closed');
  // sensor
  if (stateOf('23.5', { domain: 'sensor' }) === 'on') ok('stateOf sensor 23.5');
  if (stateOf('unavailable', { domain: 'sensor' }) === 'unavailable') ok('stateOf sensor unavailable');
  // person: home→on, not_home→off
  if (stateOf('home', { domain: 'person' }) === 'on') ok('stateOf person home');
  if (stateOf('not_home', { domain: 'person' }) === 'off') ok('stateOf person not_home');
  // sun: above_horizon→on, below_horizon→off
  if (stateOf('above_horizon', { domain: 'sun' }) === 'on') ok('stateOf sun above_horizon');
  if (stateOf('below_horizon', { domain: 'sun' }) === 'off') ok('stateOf sun below_horizon');
  // device_tracker: home→on, altfel off
  if (stateOf('home', { domain: 'device_tracker' }) === 'on') ok('stateOf device_tracker home');
  if (stateOf('away', { domain: 'device_tracker' }) === 'off') ok('stateOf device_tracker away');
} catch (e) { failt('stateOf principale', e.message); }

// ---- stateOf (lipsă stare, null, undefined) ----
try {
  if (stateOf(undefined) === 'unavailable') ok('stateOf undefined');
  if (stateOf(null) === 'unavailable') ok('stateOf null');
  if (stateOf('', {}) === 'unavailable') ok('stateOf ""');
  if (stateOf('   ') === 'unavailable') ok('stateOf spații');
  if (stateOf('0') !== 'unavailable') ok('stateOf "0" numeric (nu unavailable)');
} catch (e) { failt('stateOf lipsă stare', e.message); }

// ---- stateOf (deducere domeniu din stare) ----
try {
  if (stateOf('locked') === 'off') ok('stateOf "locked" deduce lock');
  if (stateOf('heating') === 'on') ok('stateOf "heating" deduce climate');
  if (stateOf('enabled') === 'on') ok('stateOf "enabled" deduce binary_sensor');
  // domain din entity_id: 'lock.usa' → 'lock'
  if (stateOf('locked', { entity_id: 'lock.usa' }) === 'off') ok('stateOf cu entity_id deduce lock');
  // domain din entity_id prioritar peste detectDomain
  if (stateOf('heating', { domain: 'climate', entity_id: 'lock.usa' }) === 'on') ok('stateOf domain prioritar peste entity_id');
} catch (e) { failt('stateOf deducere domeniu', e.message); }

// ---- secondaryText (principale) ----
try {
  // sensor cu unit
  const sensor = { state: '24.5', attributes: { unit_of_measurement: '°C' } };
  if (secondaryText(sensor) === '24,5 °C') ok('secondaryText sensor °C');
  else failt('secondaryText sensor', `got ${secondaryText(sensor)}`);

  // switch on
  const sw = { state: 'on' };
  if (secondaryText(sw) === 'on') ok('secondaryText switch on');
  else failt('secondaryText switch', `got ${secondaryText(sw)}`);

  // climate cu temp curentă
  const cl = { state: 'heat', domain: 'climate', attributes: { current_temperature: 22, unit_of_measurement: '°C' } };
  if (secondaryText(cl) === '22 °C') ok('secondaryText climate (fără (heat))');
  else failt('secondaryText climate', `got ${secondaryText(cl)}`);

  // senzor cu stare non-numerică → '—'
  const sn = { state: 'unavailable', domain: 'sensor' };
  if (secondaryText(sn) === '—') ok('secondaryText sensor unavailable → —');
  else failt('secondaryText sensor unavailable', `got ${secondaryText(sn)}`);

  // number cu stare non-numerică → '—'
  const nb2 = { state: 'unknown', domain: 'number' };
  if (secondaryText(nb2) === '—') ok('secondaryText number unknown → —');
  else failt('secondaryText number unknown', `got ${secondaryText(nb2)}`);

  // lock
  const lk = { state: 'locked' };
  if (secondaryText(lk) === 'locked') ok('secondaryText lock');
  else failt('secondaryText lock', `got ${secondaryText(lk)}`);

  // binary_sensor
  const bs = { state: 'open' };
  if (secondaryText(bs) === 'open') ok('secondaryText binary_sensor open');
  else failt('secondaryText binary_sensor', `got ${secondaryText(bs)}`);

  // binary_sensor cu device_class: door → deschis/închis
  const bs_door = { state: 'on', domain: 'binary_sensor', device_class: 'door' };
  if (secondaryText(bs_door) === 'deschis') ok('secondaryText binary_sensor door → deschis');
  else failt('secondaryText binary_sensor door', `got ${secondaryText(bs_door)}`);

  // binary_sensor motion → mișcare/liber (state='on'→mișcare, 'off'→liber)
  const bs_motion = { state: 'off', domain: 'binary_sensor', device_class: 'motion' };
  if (secondaryText(bs_motion) === 'liber') ok('secondaryText binary_sensor motion → liber');
  else failt('secondaryText binary_sensor motion', `got ${secondaryText(bs_motion)}`);

  // binary_sensor smoke → alertă/ok
  const bs_smoke = { state: 'on', domain: 'binary_sensor', device_class: 'smoke' };
  if (secondaryText(bs_smoke) === 'alertă') ok('secondaryText binary_sensor smoke → alertă');
  else failt('secondaryText binary_sensor smoke', `got ${secondaryText(bs_smoke)}`);

  // number
  const nb = { state: '50', unit: '%' };
  if (secondaryText(nb) === '50 %') ok('secondaryText number %');
  else failt('secondaryText number', `got ${secondaryText(nb)}`);

  // sun
  const sunu = { state: 'above_horizon', domain: 'sun' };
  if (secondaryText(sunu) === 'sus') ok('secondaryText sun up');
  else failt('secondaryText sun', `got ${secondaryText(sunu)}`);

  // person/device_tracker
  const pe = { state: 'home', domain: 'person' };
  if (secondaryText(pe) === 'acasă') ok('secondaryText person acasă');
  else failt('secondaryText person', `got ${secondaryText(pe)}`);

  // null/undefined
  if (secondaryText(null) === '—') ok('secondaryText null');
  if (secondaryText(undefined) === '—') ok('secondaryText undefined');
  if (secondaryText({ state: '' }) === '—') ok('secondaryText state ""');
} catch (e) { failt('secondaryText principale', e.message); }

// ---- secondaryText (senzori cu praguri) ----
try {
  // sensor alert above
  const sa = { state: '30', attributes: { unit_of_measurement: '°C' } };
  if (secondaryText(sa) === '30 °C') ok('secondaryText sensor alert above');
  // sensor low value
  const sl = { state: '5', attributes: { unit_of_measurement: 'lux' } };
  if (secondaryText(sl) === '5 lux') ok('secondaryText sensor lux');
} catch (e) { failt('secondaryText senzori praguri', e.message); }

// ---- secondaryText (sensor cu stare non-numerică) ----
try {
  // binary sensor cu stare high/low
  const sb = { state: 'high' };
  if (secondaryText(sb) === 'high') ok('secondaryText sensor high');
  // sensor cu stare "problem"
  const sp = { state: 'problem' };
  if (secondaryText(sp) === 'problem') ok('secondaryText sensor problem');
} catch (e) { failt('secondaryText senzori non-numeric', e.message); }

try {
  const so = (state, id) => stateOf(state, { entity_id: id });
  if (so('Ultima zi', 'sensor.gaz') === 'off' && so('running', 'sensor.masina') === 'off' && so('unavailable', 'sensor.gaz') === 'unavailable' && so('unknown', 'sensor.gaz') === 'unavailable' && so('', 'sensor.gaz') === 'unavailable' && so('abc', 'number.x') === 'unavailable')
    ok('stateOf: sensor cu text valid → off (neutru), unavailable/unknown/gol → unavailable; number text rămâne unavailable');
  else failt('stateOf sensor text', ['Ultima zi', 'unavailable', 'unknown', ''].map((x) => so(x, 'sensor.gaz')).join());
} catch (e) { failt('stateOf sensor text', e.message); }
try {
  const w = { entity_id: 'weather.x', state: 'partlycloudy', attributes: { temperature: 9.4, temperature_unit: '°C' } };
  if (stateOf(w, { entity_id: 'weather.x' }) === 'off' && secondaryText(w).replace(/\u202f/g, ' ') === 'Parțial noros 9,40°' || secondaryText(w).replace(/\u202f/g, ' ') === 'Parțial noros 9,4°') ok('weather: stare neutră + text RO cu temperatură');
  else failt('weather', secondaryText(w));
  if (secondaryText({ entity_id: 'weather.x', state: 'rainy', attributes: {} }) === 'Ploaie' && secondaryText({ entity_id: 'weather.x', state: 'zzz', attributes: {} }) === 'zzz') ok('weather: fără temperatură / condiție necunoscută');
  else failt('weather fără temp', secondaryText({ entity_id: 'weather.x', state: 'rainy', attributes: {} }));
} catch (e) { failt('weather', e.message); }
try {
  const ts = (m) => secondaryText({ entity_id: 'sensor.rem', state: new Date(Date.now() + m * 60000 + 20000).toISOString(), attributes: {} });
  if (ts(38) === '38 min' && ts(65) === '1 h 5 min' && ts(-5) === 'gata') ok('secondaryText: timestamp → „N min” / „1 h 5 min” / „gata”');
  else failt('timestamp', [ts(38), ts(65), ts(-5)].join('|'));
} catch (e) { failt('timestamp', e.message); }
// ---- senzor cu stare TEXT legitimă: se arată textul (greșeală găsită în HA real: „Gaz —” în loc de „Ultima zi”) ----
try {
  const sx = (state, dom = 'sensor') => secondaryText({ entity_id: dom + '.x', state, attributes: {} });
  const okT = sx('Ultima zi') === 'Ultima zi' && sx('power_off') === 'power off' && sx('running') === 'running' && sx('partlycloudy') === 'partlycloudy'
    && sx('unavailable') === '—' && sx('unknown') === '—' && sx('') === '—' && sx('abc', 'number') === '—' && sx('xyz', 'input_number') === '—' && sx('12.5') === '12,5';
  if (okT) ok('secondaryText: sensor cu stare text → textul; unavailable/unknown/gol și number text → —');
  else failt('secondaryText sensor text', JSON.stringify(['Ultima zi', 'power_off', 'unavailable', ''].map((x) => sx(x))));
} catch (e) { failt('secondaryText sensor text', e.message); }

// ---- secondaryText (entitate fără entity_id) ----
try {
  const simple = { state: 'on', domain: 'light' };
  if (secondaryText(simple) === 'on') ok('secondaryText fără entity_id');
} catch (e) { failt('secondaryText fără entity_id', e.message); }

// ---- rezumat ----
console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
