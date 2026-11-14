// src/render.mjs — șabloane HTML (șiruri) și patchNodes. Funcții PURE: nu ating DOM-ul, nu au efecte.
// Tot ce vine din config/entități trece prin esc().
import { t, intlLocale, getLang, decSep } from './i18n.mjs';
import { stateOf, secondaryText, formatNumber } from './state.mjs';
import { iconSvg, iconAnim, iconKey, DEFAULT_ANIM } from './icons.mjs';
import { colorVars } from './presets.mjs';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DAYS = ['dum', 'lun', 'mar', 'mie', 'joi', 'vin', 'sâm'];
const MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const SIZES = ['xs', 's', 'm', 'l', 'xl'];
const SHAPES = ['chamfer', 'round', 'pill', 'square'];
const TOKENS = ['accent', 'on', 'alert', 'ok', 'muted'];
const IC = ['green', 'yellow', 'orange', 'blue', 'cyan', 'red', 'white'];
const RULE_KEYS = ['alert_above', 'alert_below', 'ok_above', 'ok_below', 'device_class'];

/** { time: '19:17', date: 'sâm 14 nov' } în fusul local al dispozitivului. */
export function formatClock(d) {
  const p = (n) => String(n).padStart(2, '0');
  let date = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;   // română: forma scurtă proprie
  if (getLang() !== 'ro') { try { const f = (o) => d.toLocaleDateString(intlLocale(), o).replace(/\./g, ''); date = `${f({ weekday: 'short' })} ${d.getDate()} ${f({ month: 'short' })}`; } catch (e) { /* rămâne forma de mai sus */ } }
  return { time: `${p(d.getHours())}:${p(d.getMinutes())}`, date };
}

/** Puterea în W ≥ 1000 se arată în kW („1 820 W” → „1,82 kW”); restul ca în secondaryText. */
function kwText(s, hass) {
  const unit = s?.attributes?.unit_of_measurement, n = Number(s?.state);
  if (unit === 'W' && s.state !== '' && Number.isFinite(n) && Math.abs(n) >= 1000) return `${formatNumber(n / 1000)} kW`;
  return secondaryText(s, hass);
}

const autoName = (id) => String(id || '').replace(/^[^.]+\./, '').replace(/_/g, ' ');
const pickInt = (v, lo, hi, d) => { const n = Number(v); return Number.isInteger(n) && n >= lo && n <= hi ? n : d; };

/** Acțiunile implicite: lumini/prize/lacăte… = toggle; restul = more-info. */
const TOGGLE_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'lock', 'cover', 'button', 'input_button', 'scene', 'script', 'automation', 'siren', 'valve'];
export function defaultTap(entityId) {
  const d = String(entityId || '').split('.')[0];
  return TOGGLE_DOMAINS.includes(d) ? 'toggle' : 'more-info';
}

/** Modelul unui buton/chip: tot ce trebuie desenat, calculat din config + hass. */
export function entityModel(e, idx, hass, config = {}) {
  const raw = hass?.states?.[e.entity];
  // starea din HA are mereu entity_id; o completăm dacă lipsește (domeniul decide stările și textele)
  const stateObj = raw ? (raw.entity_id ? raw : { ...raw, entity_id: e.entity }) : undefined;
  const attrs = stateObj?.attributes || {};
  const rule = { entity_id: e.entity };
  for (const k of RULE_KEYS) if (e[k] !== undefined) rule[k] = e[k];
  if (rule.device_class === undefined && attrs.device_class) rule.device_class = attrs.device_class;
  let state = stateObj ? stateOf(stateObj, rule) : 'unavailable';
  if (e.active === true && state !== 'unavailable') state = 'on'; // card „erou”/evidențiat: verde indiferent de valoare
  // on_states: stări text care înseamnă „pornit” (ex. mașina de spălat: spinning, rinsing …)
  if (Array.isArray(e.on_states) && stateObj && e.on_states.map(String).includes(String(stateObj.state))) state = 'on';
  // show_if: { attribute?, min, alert_at? } — se vede doar când valoarea (atributul sau starea) e un număr ≥ min; alertă când ≤ alert_at (ex. „zile rămase” la citirea contorului)
  let hiddenIf = false;
  if (e.show_if && typeof e.show_if === 'object') {
    const v = Number(e.show_if.attribute ? stateObj?.attributes?.[e.show_if.attribute] : stateObj?.state);
    const min = Number.isFinite(Number(e.show_if.min)) ? Number(e.show_if.min) : 0;
    const okv = !!stateObj && !['unavailable', 'unknown'].includes(String(stateObj.state)) && Number.isFinite(v) && v >= min;
    hiddenIf = !okv;
    if (okv) state = Number.isFinite(Number(e.show_if.alert_at)) && v <= Number(e.show_if.alert_at) ? 'alert' : 'on';
  }
  const isOn = (id) => !!(hass && hass.states && hass.states[id] && hass.states[id].state === 'on');
  // `group: [entity_id…]`: starea e „atenție” dacă oricare membru e „on” (ex. persoane detectate pe camere); textul: group_text cu {n} / group_idle
  const gids = Array.isArray(e.group) ? e.group.filter((id) => typeof id === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(id)) : [];
  const groupN = gids.length ? gids.filter(isOn).length : null;
  if (groupN !== null) state = groupN > 0 ? 'alert' : 'off';
  // `count: true` pe o entitate group.*: câte dintre membrii ei sunt „on” (ex. lumini aprinse)
  const members = e.count === true && Array.isArray(attrs.entity_id) ? attrs.entity_id : null;
  const count = members ? members.filter(isOn).length : null;
  if (e.on_as === 'alert' && state === 'on') state = 'alert'; // ex. fum / scurgere de apă: când e „on” nu e „activ”, e alertă
  const name = e.name && e.name !== autoName(e.entity) ? e.name : (attrs.friendly_name || e.name || autoName(e.entity));
  const size = SIZES.includes(e.size) ? e.size : 'm';
  const shape = SHAPES.includes(e.shape) ? e.shape : 'chamfer';

  let secondary = '';
  const sec = e.secondary;
  if (sec === false || sec === 'none') secondary = '';
  else if (typeof sec === 'string' && sec) secondary = sec;
  else if (sec && typeof sec === 'object' && sec.attribute) {
    const v = attrs[sec.attribute];
    secondary = v === undefined || v === null ? '—' : (typeof v === 'number' ? formatNumber(v) : String(v)) + (sec.unit ? ' ' + sec.unit : '');
  } else if (sec && typeof sec === 'object' && sec.entity) {
    const o = hass?.states?.[sec.entity];
    secondary = o ? secondaryText(o.entity_id ? o : { ...o, entity_id: sec.entity }, hass) : '—'; // domeniul decide formatul (climate → temperatura curentă)
  } else if (!stateObj) secondary = '—';
  else if (size !== 'xs') secondary = e.auto_kw === false ? secondaryText(stateObj, hass) : kwText(stateObj, hass);

  // text_map: traduce starea text a entității (ex. spinning → Centrifugă) când nu e dat un `secondary`
  if (e.text_map && typeof e.text_map === 'object' && stateObj && e.secondary === undefined && e.text_map[String(stateObj.state)] !== undefined) secondary = String(e.text_map[String(stateObj.state)]);
  if (groupN !== null) secondary = groupN > 0 ? String(e.group_text || t('{n} active')).replace('{n}', groupN) : String(e.group_idle || t('Fără activitate'));

  // climate: modul (cool/heat/auto/…) colorează iconița; „lucrează” = nu e oprit și hvac_action nu e idle/off (fără hvac_action: după mod)
  let mode = '', run = '';
  if (String(e.entity).startsWith('climate.') && stateObj) {
    const s = String(stateObj.state);
    mode = s === 'heat_cool' ? 'auto' : s;
    const act = attrs.hvac_action;
    run = s !== 'off' && s !== 'unavailable' && s !== 'unknown' ? '1' : '';   // aparat pornit = ventilatorul se învârte (ca la vechiul badge)
  }
  if (!run && state === 'on' && !mode && DEFAULT_ANIM[iconKey(e.icon, e.entity)] === 'a-fan') run = '1';
  // icon_color: culoare fixă a iconiței, în orice stare (verde/galben/portocaliu/albastru/cyan/roșu/alb)
  const ic = IC.includes(e.icon_color) ? e.icon_color : '';
  // delta: indicator de variație sub valoare (doar xl): { entity?, attribute?, text? }
  let delta = null;
  if (e.delta && size === 'xl') {
    const d = e.delta; let txt = '', n = NaN;
    if (typeof d.text === 'string') txt = d.text;
    else if (d.entity) { const o = hass?.states?.[d.entity]; txt = o ? secondaryText(o, hass) : '—'; n = Number(o?.state); }
    if (d.percent_entity && txt && txt !== '—') { const pn = Number(hass?.states?.[d.percent_entity]?.state); if (Number.isFinite(pn)) txt += ` (${formatNumber(pn)}%)`; }
    if (txt && txt !== '—') delta = { text: txt, dir: Number.isFinite(n) ? (n < 0 ? 'down' : 'up') : (/^[−-]/.test(txt) ? 'down' : 'up') };
  }
  return {
    idx, entity: e.entity, name, size, shape, state, secondary, mode, run, ic, delta, count,
    named: !!(e.name && e.name !== autoName(e.entity)), hidden: e.show_if ? hiddenIf : e.hide_off === true && state !== 'on' && state !== 'alert',
    toggle: e.toggle === true && size === 'l', spark: size === 'xl' && e.spark ? (e.spark.entity || e.entity) : '',
    sparkHours: e.spark && Number.isFinite(Number(e.spark.hours)) ? Math.min(48, Math.max(1, Number(e.spark.hours))) : 6,
    icon: iconSvg(e.icon || (String(e.entity).startsWith('weather.') && stateObj ? WEATHER_ICON[String(stateObj.state)] || 'w-cloud' : undefined), e.entity),
    anim: iconAnim(e.icon, e.entity, config.animations !== false),
    lamp: iconKey(e.icon, e.entity) === 'bulb',   // becurile primesc stilul „lampă” (strălucire caldă)
    style: Object.entries(colorVars(e.colors).vars).map(([k, v]) => `${k}:${v}`).join(';'),
  };
}

// entitate weather.* fără icon în config: pictograma după condiția curentă
const WEATHER_ICON = { sunny: 'w-sun', 'clear-night': 'w-moon', partlycloudy: 'w-partly', cloudy: 'w-cloud', fog: 'w-fog', rainy: 'w-rain', pouring: 'w-pour', snowy: 'w-snow', 'snowy-rainy': 'w-sleet',
  lightning: 'w-storm', 'lightning-rainy': 'w-storm', hail: 'w-hail', windy: 'w-wind', 'windy-variant': 'w-wind', exceptional: 'w-cloud' };
const modeAttrs = (m) => (m.mode ? ` data-mode="${esc(m.mode)}" data-run="${m.run ? 1 : 0}"` : m.run ? ' data-run="1"' : '');
const styleAttr = (s) => (s ? ` style="${esc(s)}"` : '');

// „1,82 kW” → <b>1,82</b> kW (valoarea mare a cardului erou)
function bigValue(t) {
  const m = /^([−-]?[\d\s., ]+)(.*)$/.exec(t);
  return m ? `<b>${esc(m[1].trim())}</b>${m[2].trim() ? ' ' + esc(m[2].trim()) : ''}` : esc(t);
}

/** Linie + zonă dintr-o serie numerică, normalizate într-un viewBox 100×40 (≤ 40 de puncte). Gol dacă < 2 puncte. */
export function sparkPath(values, w = 100, h = 40, pad = 3) {
  const v = (values || []).map(Number).filter(Number.isFinite);
  if (v.length < 2) return { line: '', fill: '' };
  const N = Math.min(40, v.length), out = [];
  for (let i = 0; i < N; i++) { const a = Math.floor(i * v.length / N), b = Math.max(a + 1, Math.floor((i + 1) * v.length / N)); const s = v.slice(a, b); out.push(s.reduce((x, y) => x + y, 0) / s.length); }
  const lo = Math.min(...out), hi = Math.max(...out), span = hi - lo || 1;
  const pts = out.map((y, i) => [(i / (N - 1)) * w, pad + (1 - (y - lo) / span) * (h - 2 * pad)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return { line, fill: `${line} L${w} ${h} L0 ${h} Z` };
}

export function renderButton(m, sparks) {
  const sp = m.spark ? (sparks && sparks[m.spark]) : null;
  const spark = m.spark ? `<svg class="ccu-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path class="fill" d="${sp ? sp.fill : ''}"/><path d="${sp ? sp.line : ''}"/></svg>` : '';
  const sec = m.secondary ? `<span class="ccu-sec">${m.size === 'xl' ? bigValue(m.secondary) : esc(m.secondary)}</span>` : '';
  const delta = m.delta ? `<span class="ccu-delta" data-dir="${m.delta.dir}">${m.delta.dir === 'down' ? '▼' : '▲'} ${esc(m.delta.text)}</span>` : '';
  return `<button type="button" class="ccu-btn ${m.size} ${m.shape}"${m.lamp ? ' data-lamp="1"' : ''} data-state="${m.state}" data-id="${m.idx}" data-entity="${esc(m.entity)}"${m.ic ? ` data-ic="${m.ic}"` : ''}${modeAttrs(m)}${styleAttr(m.style)}>`
    + `<span class="ccu-ico ${m.anim}">${m.icon}</span><span class="ccu-name">${esc(m.name)}</span>` + sec + delta + spark
    + (m.toggle ? `<span class="ccu-sw" aria-hidden="true"><i></i></span>` : '') + `</button>`;
}

export function renderChip(m, e, hass) {
  let label = esc(m.name);
  if (m.count !== null && m.count !== undefined) label = `<b>${m.count}</b>${m.named ? ' ' + esc(m.name) : ''}`;
  else if (e.show_state) {
    const raw = hass?.states?.[e.entity];
    let t = m.secondary || (raw ? secondaryText(raw, hass) : '—');
    // text_map: traduce starea text (spinning → Centrifugare); cu `secondary: {entity}` se adaugă și a doua valoare (ex. timpul rămas)
    if (e.text_map && typeof e.text_map === 'object' && raw && e.text_map[raw.state] !== undefined) { t = String(e.text_map[raw.state]); if (m.secondary && m.secondary !== '—') t += ' · ' + m.secondary; }
    label += ` <b>${esc(t)}</b>`;
  }
  return `<span class="ccu-chip" role="button" tabindex="0" data-state="${m.state}" data-id="${m.idx}" data-entity="${esc(m.entity)}"${m.ic ? ` data-ic="${m.ic}"` : ''}${modeAttrs(m)}${styleAttr(m.style)}>`
    + `<span class="ccu-ico ${m.anim}">${m.icon}</span>${label}</span>`;
}

const notes = (warnings) => (warnings && warnings.length ? `<div class="ccu-note">${warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '');

/** Card de butoane: grila + titlu opțional + avertismente. */
export function renderButtons(config, hass, opts = {}) {
  const cols = pickInt(config.columns, 1, 6, 2);
  const wide = pickInt(config.columns_wide, 1, 8, cols);
  // lățimea minimă a unei plăci (px): coloanele de pe ecran lat se reduc singure ca numele și valorile să nu se taie
  const minTile = Math.max(0, ...(config.entities || []).map((e) => ({ m: 168, l: 240 }[SIZES.includes(e.size) ? e.size : 'm'] || 0)));
  const items = (config.entities || []).map((e, i) => renderButton(entityModel(e, i, hass, config), opts.sparks)).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  return `<div class="ccu-card${config.panel ? ' panel' : ''}">${title}<div class="ccu-grid" data-cols="${cols}" style="--cols:${cols};--cols-wide:${wide};--min-tile:${minTile}px">${items}</div>${notes(opts.warnings)}</div>`;
}

/** Rând de chips. */
/** Câte chips-uri se văd acum (cele cu hide_off dispar când nu sunt „on”). */
export function visibleChips(config, hass) {
  return (config.entities || []).reduce((n, e, i) => n + (entityModel(e, i, hass, config).hidden ? 0 : 1), 0);
}

/** Normalizează `waste` (calendarul de colectare): { calendar, next_days, hide_today_after: 'HH:MM', patterns: [{ match, label, icon, exact }] }. */
export function normalizeWaste(w) {
  if (!w || typeof w !== 'object' || typeof w.calendar !== 'string' || !/^calendar\.[a-z0-9_]+$/.test(w.calendar)) return null;
  const hm = /^(\d{1,2}):(\d\d)$/.exec(String(w.hide_today_after || '11:00'));
  const patterns = (Array.isArray(w.patterns) ? w.patterns : []).filter((p) => p && typeof p.match === 'string' && p.match).map((p) => ({ match: p.match, label: String(p.label || p.match), icon: p.icon || 'mdi:trash-can', exact: p.exact === true }));
  const nd = Number(w.next_days);
  return { calendar: w.calendar, next_days: Number.isFinite(nd) ? Math.min(7, Math.max(0, Math.round(nd))) : 1, hide_today_after: hm ? Number(hm[1]) * 60 + Number(hm[2]) : 660, patterns };
}

/** Chips-urile de gunoi: evenimentele de azi / următoarele `next_days` zile care se potrivesc cu un pattern (azi se ascund după ora `hide_today_after`). */
export function wasteModel(waste, events, now = new Date()) {
  if (!waste || !Array.isArray(events)) return [];
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out = [];
  for (const ev of events) {
    const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String(ev && ev.start || ''));
    if (!m) continue;
    const diff = Math.round((new Date(+m[1], +m[2] - 1, +m[3]) - today0) / 864e5);
    if (diff < 0 || diff > waste.next_days) continue;
    if (diff === 0 && now.getHours() * 60 + now.getMinutes() >= waste.hide_today_after) continue;
    const sum = String(ev.summary || '');
    const p = waste.patterns.find((q) => (q.exact ? sum === q.match : sum.includes(q.match)));
    if (p) out.push({ label: p.label, icon: p.icon, diff });
  }
  return out;
}

export function renderChips(config, hass, opts = {}) {
  const items = (config.entities || []).map((e, i) => { const m = entityModel(e, i, hass, config); return m.hidden ? '' : renderChip(m, e, hass); }).join(''); // hide_off: chip-ul dispare când nu e „on”
  const waste = wasteModel(config.waste, opts.events, opts.now || new Date()).map((w) =>
    `<span class="ccu-chip" data-state="${w.diff === 0 ? 'alert' : 'on'}" data-waste="1" data-entity="${esc(config.waste.calendar)}"><span class="ccu-ico">${iconSvg(w.icon)}</span>${esc(w.label)} <b>${w.diff === 0 ? t('azi') : w.diff === 1 ? t('mâine') : t('în {n} zile', { n: w.diff })}</b></span>`).join('');
  return `<div class="ccu-chips">${waste}${items}</div>${notes(opts.warnings)}`;
}

/** Normalizează secțiunea `header` (iconiță, ≤ 3 valori, ceas). */
export function normalizeHeader(h) {
  const src = h && typeof h === 'object' ? h : {};
  const warnings = [];
  const values = (Array.isArray(src.values) ? src.values : []).slice(0, 3).map((v, i) => {
    const o = typeof v === 'string' ? { entity: v } : { ...v };
    if (!o.entity || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Valoarea #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return null; }
    if (o.color === true) o.color = 'on'; // YAML: `color: on` fără ghilimele devine boolean true
    if (o.color && !TOKENS.includes(o.color)) { warnings.push(t('Valoarea #{n}: culoare "{c}" necunoscută (folosește {l}).', { n: i + 1, c: o.color, l: TOKENS.join('/') })); delete o.color; }
    return o;
  }).filter(Boolean);
  if (Array.isArray(src.values) && src.values.length > 3) warnings.push(t('Header: maximum 3 valori; restul sunt ignorate.'));
  // `right`: în locul ceasului, o valoare (ex. temperatura exterioară): { entity, attribute?, label?, unit?, decimals? }.
  let right = null;
  if (src.right) {
    const r = typeof src.right === 'string' ? { entity: src.right } : { ...src.right };
    if (!r.entity || !/^[a-z_]+\.[a-z0-9_]+$/.test(r.entity)) warnings.push(t('Header: `right` are entity_id lipsă sau invalid — se arată ceasul.'));
    else right = r;
  }
  return { header: { icon: src.icon || 'home', values, right, clock: right ? false : src.clock !== false, auto_kw: src.auto_kw !== false, tap_action: src.tap_action }, warnings };
}

function headerValue(v, hass, autoKw) {
  const s = hass?.states?.[v.entity];
  if (!s) return '—';
  const unit = s.attributes?.unit_of_measurement;
  const n = Number(s.state);
  if (autoKw && unit === 'W' && s.state !== '' && Number.isFinite(n) && Math.abs(n) >= 1000) return `${formatNumber(n / 1000)} kW`;
  return secondaryText(s, hass);
}

/** Valoarea din dreapta: număr din stare sau dintr-un atribut (ex. weather.acasa → temperature), cu unitate. */
function rightValue(r, hass) {
  const s = hass?.states?.[r.entity];
  if (!s) return '—';
  const raw = r.attribute ? s.attributes?.[r.attribute] : s.state;
  const n = Number(raw);
  if (raw === undefined || raw === null || raw === '' || !Number.isFinite(n)) return '—';
  const unit = r.unit ?? (r.attribute ? (hass?.config?.unit_system?.temperature || '°C') : (s.attributes?.unit_of_measurement || ''));
  const dec = Number.isInteger(r.decimals) && r.decimals >= 0 && r.decimals <= 2 ? r.decimals : 1;
  const txt = n.toFixed(dec).replace(/\.0+$/, '').replace('.', decSep());
  return unit ? `${txt} ${unit}` : txt;
}

/** Header-ul: iconiță, valori colorate cu token, ceas. `now` e dat de apelant (funcția rămâne pură). */
export function renderHeader(config, hass, now, opts = {}) {
  const h = config.header || normalizeHeader(config).header;
  const vals = h.values.map((v) => {
    const t = esc(headerValue(v, hass, h.auto_kw));
    const ico = v.icon ? `<span class="ccu-ico${v.color ? ` c-${v.color}` : ''}">${iconSvg(v.icon)}</span>` : '';
    // cu etichetă: valoare sus, etichetă mică dedesubt
    if (v.label) return `<span class="has-label">${ico}<span class="tx"><b${!v.icon && v.color ? ` class="c-${v.color}"` : ''}>${t}</b><small>${esc(v.label)}</small></span></span>`;
    if (v.icon) return `<span>${ico}${t}</span>`;
    return `<span${v.color ? ` class="c-${v.color}"` : ''}>${t}</span>`;
  }).join('');
  let clock = '';
  if (h.right) clock = `<span class="clock right">${esc(rightValue(h.right, hass))}${h.right.label ? `<small>${esc(h.right.label)}</small>` : ''}</span>`;
  else if (h.clock && now) { const c = formatClock(now); clock = `<span class="clock">${c.time}<small>${esc(c.date)}</small></span>`; }
  return `<div class="ccu-head" data-id="header"><span class="ccu-ico">${iconSvg(h.icon)}</span><span class="vals">${vals}</span>${clock}</div>${notes(opts.warnings)}`;
}

/** Normalizează meniul jos: items = [{ icon, label, path }] (path = adresă completă ce începe cu '/'). */
export function normalizeNav(cfg) {
  const warnings = [];
  const items = [];
  (Array.isArray(cfg?.items) ? cfg.items : []).forEach((it, i) => {
    const o = it && typeof it === 'object' ? it : null;
    const path = o && (o.path ?? o.navigation_path);
    const back = !!o && o.back === true;   // `back: true` = „înapoi” (history.back), fără path
    if (!o || (!back && (typeof path !== 'string' || !path.startsWith('/')))) { warnings.push(t('Meniu #{n}: lipsește „path” (adresă ce începe cu /) sau „back: true”.', { n: i + 1 })); return; }
    const vi = o.visible_if && typeof o.visible_if === 'object' && /^[a-z_]+\.[a-z0-9_]+$/.test(String(o.visible_if.entity)) ? { entity: o.visible_if.entity, state: String(o.visible_if.state) } : null;
    const bl = Array.isArray(o.badge) ? o.badge : (o.badge && Array.isArray(o.badge.entities) ? o.badge.entities : []);
    items.push({ icon: o.icon || (back ? 'back' : 'home'), label: String(o.label ?? o.name ?? ''), path: back ? '' : path, match: o.match, back, visible_if: vi, badge: bl.filter((id) => typeof id === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(id)) });
  });
  return { items, warnings };
}

/** Meniul de jos: o pictogramă + etichetă per element; elementul curent (după adresa paginii) e „activ”. */
export function renderNav(config, currentPath, opts = {}) {
  const cur = String(currentPath || '');
  const isOn = (it) => { if (it.back) return false; const p = it.match || it.path; return cur === p || cur.startsWith(p.endsWith('/') ? p : p + '/'); };
  let on = config.items.findIndex(isOn);
  const hs = opts.hass && opts.hass.states;
  // insignă: câte entități din `badge` sunt „on” (ex. persoane detectate de camere); > 0 → butonul devine roșu (alertă) ca „Persoane pe n camere”
  const cnt = (it) => (hs && it.badge ? it.badge.filter((id) => hs[id] && hs[id].state === 'on').length : 0);
  // visible_if: { entity, state } — elementul se vede doar când entitatea are acea stare (ex. butonul „Tableta” doar pe tabletă)
  const shown = (it) => !it.visible_if || (hs && hs[it.visible_if.entity] && String(hs[it.visible_if.entity].state) === it.visible_if.state);
  const labels = config.labels !== false;
  const html = config.items.map((it, i) => { if (!shown(it)) return ''; const n = cnt(it); const st = i === on ? 'on' : n > 0 ? 'alert' : 'off';
    return `<button type="button" class="ccu-nav-item" data-id="${i}" data-state="${st}"><span class="ccu-ico">${iconSvg(it.icon)}${n > 0 ? `<b class="ccu-badge">${n}</b>` : ''}</span>${labels ? `<span>${esc(it.label)}</span>` : ''}</button>`; }).join('');
  const nav = `<nav class="ccu-nav${config.compact ? ' compact' : ''}${labels ? '' : ' nolabels'}">${html}</nav>`;
  // sticky: bara rămâne fixă jos, pe ecran, cât derulezi pagina; un spațiu gol în pagină (spacer) o împiedică să acopere ultimul card
  if (config.sticky) return `${config.spacer === false ? '' : '<div class="ccu-nav-spacer"></div>'}<div class="ccu-nav-fixed">${nav}</div>${notes(opts.warnings)}`;
  return `${nav}${notes(opts.warnings)}`;
}

// ---------- persoane: avatare suprapuse într-un chip ----------
/** Adresa unei poze e acceptată doar dacă e relativă la HA („/api/image/…”, „/local/…”): fără http(s)/data/javascript, fără „//”. */
export function safePicture(u) {
  const s = typeof u === 'string' ? u.trim() : '';
  return /^\/(?!\/)[^\s"'<>\\]*$/.test(s) ? s : '';
}
const initials = (n) => { const w = String(n || '?').trim().split(/\s+/).filter(Boolean); return ((w[0] || '?')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };

/** Normalizează cardul de persoane: persons = [person.x | { entity, name }], label implicit „Persoane”. */
export function normalizePeople(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], people = [];
  (Array.isArray(src.people) ? src.people : Array.isArray(src.persons) ? src.persons : []).forEach((p, i) => {
    const o = typeof p === 'string' ? { entity: p } : p && typeof p === 'object' ? { ...p } : null;
    if (!o || typeof o.entity !== 'string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Persoana #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    people.push({ entity: o.entity, name: o.name ? String(o.name) : '' });
  });
  if (people.length > 6) { people.length = 6; warnings.push(t('Persoane: maximum 6; restul sunt ignorate.')); }
  return { people, label: src.label === false ? '' : (src.label ? String(src.label) : t('Persoane')), layout: src.layout === 'family' ? 'family' : 'chip', title: src.title ? String(src.title) : '', summary: src.summary !== false, warnings };
}

const STATE_RO = { home: 'Acasă', not_home: 'Plecat', unknown: '—', unavailable: '—' };   // românește; la afișare trece prin t()
/** Cardul „Familia”: avatare mari cu nume și stare (Acasă / Plecat / zona în care se află). */
function renderFamily(config, hass, opts = {}) {
  const cells = config.entities.map((e, i) => {
    const s = hass && hass.states ? hass.states[e.entity] : null;
    const a = (s && s.attributes) || {};
    const name = e.name || a.friendly_name || e.entity.split('.')[1].replace(/_/g, ' ');
    const home = !!s && s.state === 'home';
    const pic = safePicture(a.entity_picture);
    const st = !s ? '—' : (STATE_RO[s.state] !== undefined ? t(STATE_RO[s.state]) : String(s.state));
    return `<div class="fm" data-id="${i}" data-entity="${esc(e.entity)}" data-home="${home ? 1 : 0}"><span class="av2">${pic ? `<img src="${esc(pic)}" alt="${esc(name)}" loading="lazy">` : esc(initials(name))}<i class="pres"></i></span><b class="nm">${esc(name.split(' ')[0])}</b><small class="stt">${esc(st)}</small></div>`;
  }).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  const nHome = config.entities.filter((e) => hass && hass.states && hass.states[e.entity] && hass.states[e.entity].state === 'home').length;
  const sum = config.summary !== false && config.entities.length ? `<div class="fm-head" data-n="${nHome}"><i></i>${nHome === 0 ? t('Nimeni acasă') : nHome === config.entities.length ? t('Toți sunt acasă') : t('{a} din {b} acasă', { a: nHome, b: config.entities.length })}</div>` : '';
  return `<div class="ccu-card panel ccu-family">${title}${sum}<div class="fm-row" style="--n:${Math.max(1, config.entities.length)}">${cells}</div>${notes}</div>`;
}

/** Chip cu avatare suprapuse; cercul e verde pentru cine e acasă, gri pentru cine lipsește. */
export function renderPeople(config, hass, opts = {}) {
  if (config.layout === 'family') return renderFamily(config, hass, opts);
  const avs = config.entities.map((e, i) => {
    const s = hass && hass.states ? hass.states[e.entity] : null;
    const a = (s && s.attributes) || {};
    const name = e.name || a.friendly_name || e.entity.split('.')[1].replace(/_/g, ' ');
    const home = !!s && s.state === 'home';
    const pic = safePicture(a.entity_picture);
    return `<span class="av" data-id="${i}" data-entity="${esc(e.entity)}" data-home="${home ? 1 : 0}" title="${esc(name)}">${pic ? `<img src="${esc(pic)}" alt="${esc(name)}" loading="lazy">` : esc(initials(name))}</span>`;
  }).join('');
  const nHome = config.entities.filter((e) => hass && hass.states && hass.states[e.entity] && hass.states[e.entity].state === 'home').length;
  const lbl = config.label ? `<span class="lbl">${esc(config.label)}</span>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-chips"><span class="ccu-chip ccu-people" data-state="${nHome ? 'on' : 'off'}" role="group" aria-label="${esc(config.label || t('Persoane'))}"><span class="av-stack">${avs}</span>${lbl}</span></div>${notes}`;
}

/**
 * Actualizează DOM-ul existent după cel nou (text + atribute), fără să-l înlocuiască. Întoarce false dacă structura diferă
 * (noduri adăugate/șterse/alt tip) — atunci apelantul înlocuiește tot. Elementele rămân aceleași: nu clipesc, păstrează animațiile
 * și ascultătorii de gesturi.
 */
export function patchNodes(o, n) {
  const oc = o.childNodes, nc = n.childNodes;
  if (!oc || !nc || oc.length !== nc.length) return false;
  for (let i = 0; i < oc.length; i++) {
    const a = oc[i], b = nc[i];
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) return false;
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; continue; }
    if (a.nodeType !== 1) return false;
    for (const at of Array.from(a.attributes)) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
    for (const at of Array.from(b.attributes)) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    if (!patchNodes(a, b)) return false;
  }
  return true;
}
