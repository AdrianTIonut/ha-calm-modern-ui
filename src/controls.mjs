// src/controls.mjs — controale ccu: termostat (climate), lumină cu luminozitate, număr (slider), selector (select), titlu de secțiune.
// Funcții PURE (normalizare, model, șabloane HTML). Interacțiunea (slider, +/−, select) e în cards.mjs (CcuControlsCard).
import { t, decSep } from './i18n.mjs';
import { esc } from './render.mjs';
import { iconSvg } from './icons.mjs';
import { formatNumber } from './state.mjs';

const ID = /^[a-z_]+\.[a-z0-9_]+$/;
const DOM_KIND = { climate: 'climate', light: 'light', number: 'number', input_number: 'number', select: 'select', input_select: 'select', fan: 'fan', media_player: 'media' };

export const MODE_RO = { off: 'Oprit', heat: 'Încălzire', cool: 'Răcire', auto: 'Auto', heat_cool: 'Auto', dry: 'Uscare', fan_only: 'Ventilator' };
export const FAN_RO = { auto: 'Auto', low: 'Mic', medium: 'Mediu', middle: 'Mediu', high: 'Mare', quiet: 'Silențios', silent: 'Silențios', turbo: 'Turbo', strong: 'Puternic', mid: 'Mediu', focus: 'Focus', diffuse: 'Difuz', on: 'Pornit', off: 'Oprit' };
export const SWING_RO = { off: 'Oprit', on: 'Pornit', vertical: 'Vertical', horizontal: 'Orizontal', both: 'Ambele' };
export const PRESET_RO = { none: 'Normal', eco: 'Eco', away: 'Plecat', boost: 'Boost', comfort: 'Confort', home: 'Acasă', sleep: 'Somn', activity: 'Activ' };
export const MODE_ICON = { off: 'plug', heat: 'flame', cool: 'snow', auto: 'sun', heat_cool: 'sun', dry: 'drop', fan_only: 'fan' };

/** Normalizează controalele: items = [{ entity, kind?, name?, icon?, step?, labels?, modes? }]; kind se deduce din domeniu. */
export function normalizeControls(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], items = [];
  (Array.isArray(src.items) ? src.items : Array.isArray(src.entities) ? src.entities : []).forEach((x, i) => {
    const o = typeof x === 'string' ? { entity: x } : x && typeof x === 'object' ? { ...x } : null;
    if (!o || typeof o.entity !== 'string' || !ID.test(o.entity)) { warnings.push(t('Control #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    const dom = o.entity.split('.')[0];
    const kind = ['climate', 'light', 'number', 'select', 'fan', 'media'].includes(o.kind) ? o.kind : DOM_KIND[dom];
    if (!kind) { warnings.push(t('Control #{n} ({e}): domeniu necunoscut; folosește kind: climate | light | number | select | fan | media.', { n: i + 1, e: o.entity })); return; }
    items.push({ ...o, kind });
  });
  if (items.length > 12) { items.length = 12; warnings.push(t('Controale: maximum 12 per card.')); }
  const c = Number(src.columns);
  return { items, columns: Number.isFinite(c) ? Math.min(3, Math.max(1, Math.round(c))) : 1, title: src.title ? String(src.title) : '', warnings };
}

const num = (v) => { const n = Number(v); return v === null || v === undefined || v === '' || !Number.isFinite(n) ? null : n; };
const fmt = (n, d = 1) => (n === null ? '—' : formatNumber(Math.round(n * 10 ** d) / 10 ** d));

/** Modelul unui control din config + starea HA (+ valori optimiste dintr-o atingere recentă). */
export function controlModel(it, st, optim, optimCt) {
  const a = (st && st.attributes) || {};
  const state = st ? String(st.state) : 'unavailable';
  const gone = state === 'unavailable' || state === 'unknown';
  const name = it.name || a.friendly_name || it.entity.split('.')[1].replace(/_/g, ' ');
  const base = { kind: it.kind, entity: it.entity, name, gone, icon: it.icon };
  if (it.kind === 'climate') {
    const step = num(it.step) || num(a.target_temp_step) || (String(a.temperature_unit || '').includes('F') ? 1 : 0.5);
    // heat_cool cu două praguri (jos / sus): se afișează „22–25°”, iar +/− le mută pe amândouă
    const hasRange = a.target_temp_low !== undefined && a.target_temp_high !== undefined && num(a.temperature) === null;
    const range = hasRange ? (Array.isArray(optim) ? optim : [num(a.target_temp_low), num(a.target_temp_high)]) : null;
    const tgt = hasRange ? null : (typeof optim === 'number' ? optim : num(a.temperature));
    const allowed = Array.isArray(it.modes) ? it.modes : (Array.isArray(a.hvac_modes) ? a.hvac_modes : []);
    const opts = (list, cur, ro) => (Array.isArray(list) && list.length > 1 ? { cur: cur === undefined || cur === null ? '' : String(cur), list: list.map(String).map((v) => ({ id: v, label: (it.labels && it.labels[v]) || (ro[v] ? t(ro[v]) : pretty(v)) })) } : null);
    return { ...base, simple: it.style === 'simple', on: !gone && state !== 'off', mode: state, cur: num(a.current_temperature), tgt, range, step, min: num(a.min_temp), max: num(a.max_temp),
      fan: opts(a.fan_modes, a.fan_mode, FAN_RO), swing: opts(a.swing_modes, a.swing_mode, SWING_RO), preset: opts(a.preset_modes, a.preset_mode, PRESET_RO),
      action: a.hvac_action || '', modes: allowed.filter((m) => MODE_RO[m]).map((m) => ({ id: m, label: (it.labels && it.labels[m]) || t(MODE_RO[m]), icon: MODE_ICON[m] })) };
  }
  if (it.kind === 'light') {
    const modes = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : [];
    const dim = modes.some((m) => m !== 'onoff');
    const b = num(a.brightness);
    const pct = optim !== undefined ? optim : state === 'on' ? (b === null ? 100 : Math.max(1, Math.round((b / 255) * 100))) : 0;
    const canRgb = modes.some((m) => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(m)), canCt = modes.includes('color_temp');
    const kmin = num(a.min_color_temp_kelvin) ?? 2000, kmax = num(a.max_color_temp_kelvin) ?? 6500;
    const kel = optimCt !== undefined ? optimCt : num(a.color_temp_kelvin);
    const rgb = Array.isArray(a.rgb_color) && a.rgb_color.length >= 3 ? a.rgb_color.slice(0, 3).map((x) => Math.round(Number(x))) : null;
    return { ...base, on: state === 'on', dim, pct, color: canRgb || canCt, canRgb, canCt, kmin, kmax, kel, rgb };
  }
  if (it.kind === 'number') {
    const min = num(a.min) ?? 0, max = num(a.max) ?? 100, step = num(a.step) || 1;
    const v = optim !== undefined ? optim : num(st && st.state);
    return { ...base, on: !gone, v, min, max, step, unit: it.unit !== undefined ? String(it.unit) : String(a.unit_of_measurement || '') };
  }
  if (it.kind === 'fan') {
    const sf = num(a.supported_features) || 0;
    const pstep = num(a.percentage_step) || 1;
    const pct = optim !== undefined ? optim : state === 'on' ? (num(a.percentage) ?? 100) : 0;
    const presets = Array.isArray(a.preset_modes) ? a.preset_modes.map(String) : [];
    return { ...base, on: state === 'on', pct, pstep, speed: (sf & 1) !== 0 || a.percentage !== undefined, presets, preset: a.preset_mode ? String(a.preset_mode) : '', labels: it.labels && typeof it.labels === 'object' ? it.labels : {} };
  }
  if (it.kind === 'media') {
    const sf = num(a.supported_features) || 0;
    const vol = optim !== undefined ? optim : (num(a.volume_level) === null ? null : Math.round(num(a.volume_level) * 100));
    const playing = state === 'playing', paused = state === 'paused';
    return { ...base, on: !gone && state !== 'off' && state !== 'standby', state, playing, title: a.media_title ? String(a.media_title) : '', artist: a.media_artist ? String(a.media_artist) : (a.app_name ? String(a.app_name) : ''),
      vol, hasVol: (sf & 4) !== 0 && vol !== null, mute: a.is_volume_muted === true, canMute: (sf & 8) !== 0, canStep: (sf & 1024) !== 0, canPrev: (sf & 16) !== 0, canNext: (sf & 32) !== 0, canPause: (sf & 1) !== 0 || (sf & 16384) !== 0 || playing || paused };
  }
  const options = Array.isArray(a.options) ? a.options.map(String) : [];
  return { ...base, on: !gone, cur: gone ? '' : state, options, labels: it.labels && typeof it.labels === 'object' ? it.labels : {} };
}

// temperatura: o zecimală când pasul e fracționar (22,0°), altfel număr întreg
const fT = (n, step) => (n === null ? '—' : step < 1 ? n.toFixed(1).replace('.', decSep()) : String(Math.round(n)));
function pretty(s) { return String(s).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()); }

// buton rotund pornit/oprit în antetul unui control (bec cu slider, ventilator, media): clar că e un buton, nu doar un titlu
const powerBtn = (on) => `<button type="button" class="pw" data-act="toggle" data-state="${on ? 'on' : 'off'}" aria-label="${on ? t('Oprește') : t('Pornește')}"><span class="ccu-ico">${iconSvg('power')}</span></button>`;

const ARC_R = 82, ARC_C = 100;
const arcPt = (f) => { const a = ((150 + 240 * Math.max(0, Math.min(1, f))) * Math.PI) / 180; return [ARC_C + ARC_R * Math.cos(a), ARC_C + ARC_R * Math.sin(a)]; };
const ARC_D = (() => { const a = arcPt(0), b = arcPt(1); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} A${ARC_R} ${ARC_R} 0 1 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}`; })();

/** Fracția 0..1 a unei temperaturi pe arc (între min și max; implicit 16–30). */
export function arcFrac(t, min, max) {
  const lo = Number.isFinite(min) ? min : 16, hi = Number.isFinite(max) && max > lo ? max : lo + 14;
  return t === null || !Number.isFinite(t) ? 0 : Math.max(0, Math.min(1, (t - lo) / (hi - lo)));
}

const rowOf = (cap, act, o) => (o ? `<div class="sub"><small>${esc(cap)}</small><div class="mds">${o.list.map((p) => `<button type="button" class="md" data-act="${act}" data-val="${esc(p.id)}" data-state="${p.id === o.cur ? 'on' : 'off'}"><span>${esc(p.label)}</span></button>`).join('')}</div></div>` : '');

function tileClimate(m, i) {
  const modeAttr = m.on ? ` data-mode="${esc(m.mode)}"` : '';
  const run = m.on && m.action !== 'idle' && m.action !== 'off' ? 1 : 0;
  const tgt = m.range ? `${fT(m.range[0], m.step)}–${fT(m.range[1], m.step)}°` : `${fT(m.tgt, m.step)}°`;
  const pills = m.modes.map((p) => `<button type="button" class="md" data-act="mode" data-val="${esc(p.id)}" data-state="${p.id === m.mode ? 'on' : 'off'}"><span class="ccu-ico">${iconSvg(p.icon)}</span><span>${esc(p.label)}</span></button>`).join('');
  const head = `<div class="hd" data-act="more"><span class="ccu-ico a-fan">${iconSvg(m.icon || 'thermo')}</span><span class="nm">${esc(m.name)}</span>${m.simple ? `<span class="cur">${m.cur === null ? '' : `${fT(m.cur, m.step)}°`}</span>` : ''}</div>`;
  const state = m.gone ? 'unavailable' : m.on ? 'on' : 'off';
  if (m.simple) {
    return `<div class="ctl cl" data-id="${i}" data-kind="climate" data-entity="${esc(m.entity)}" data-state="${state}"${modeAttr} data-run="${run}">${head}`
      + `<div class="sp"><button type="button" class="st" data-act="dec" aria-label="${t('Scade')}">−</button><b class="tv">${tgt}</b><button type="button" class="st" data-act="inc" aria-label="${t('Crește')}">+</button></div>`
      + (pills ? `<div class="mds">${pills}</div>` : '') + `</div>`;
  }
  // cadran: arc de 240° (min → max), valoarea țintă umple arcul, punctul alb = temperatura curentă
  const f1 = m.range ? arcFrac(m.range[0], m.min, m.max) : 0, f2 = m.range ? arcFrac(m.range[1], m.min, m.max) : arcFrac(m.tgt, m.min, m.max);
  const dash = m.on || m.gone ? `${Math.max(0.5, (f2 - f1) * 100).toFixed(1)} 200` : '0 200', off = (-f1 * 100).toFixed(1);
  const cm = m.cur !== null ? arcPt(arcFrac(m.cur, m.min, m.max)) : null;
  const act = !m.on ? t('Oprit') : m.action === 'heating' ? t('încălzește') : m.action === 'cooling' ? t('răcește') : m.action === 'drying' ? t('usucă') : m.action === 'fan' ? t('ventilație') : m.action === 'idle' ? t('în repaus') : (MODE_RO[m.mode] ? t(MODE_RO[m.mode]) : '').toLowerCase();
  const svg = `<svg viewBox="0 0 200 150" aria-hidden="true"><path class="tr" d="${ARC_D}" pathLength="100"/><path class="vl" d="${ARC_D}" pathLength="100" stroke-dasharray="${dash}" stroke-dashoffset="${off}"/>`
    + (cm ? `<circle class="cm" cx="${cm[0].toFixed(1)}" cy="${cm[1].toFixed(1)}" r="5.5"/>` : '') + `</svg>`;
  return `<div class="ctl cl dial" data-id="${i}" data-kind="climate" data-entity="${esc(m.entity)}" data-state="${state}"${modeAttr} data-run="${run}">${head}`
    + `<div class="dl">${svg}<div class="ct"><b class="tv${m.range ? ' rg' : ''}">${tgt}</b><span class="ac">${m.cur === null ? '' : `${t('acum')} ${fT(m.cur, m.step)}° · `}${esc(act)}</span></div>`
    + `<button type="button" class="st m" data-act="dec" aria-label="${t('Scade')}">−</button><button type="button" class="st p" data-act="inc" aria-label="${t('Crește')}">+</button></div>`
    + (pills ? `<div class="mds c">${pills}</div>` : '')
    + rowOf(t('Ventilator'), 'cfan', m.fan) + rowOf(t('Oscilare'), 'cswing', m.swing) + rowOf(t('Preset'), 'cpreset', m.preset) + `</div>`;
}

function slider(pct, label) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="sl" data-act="slider"><i class="fl" style="width:${p.toFixed(1)}%"></i><span class="th" style="left:${p.toFixed(1)}%"></span><b class="sv">${esc(label)}</b></div>`;
}

// culori rapide: albe (temperatură de culoare, K) și culori (RGB)
const WHITES = [{ k: 2700, c: '#ffb872', l: 'Alb cald' }, { k: 4000, c: '#fff0dc', l: 'Alb neutru' }, { k: 6500, c: '#cfe0ff', l: 'Alb rece' }];
const COLORS = [{ rgb: [255, 59, 48], l: 'Roșu' }, { rgb: [255, 149, 0], l: 'Portocaliu' }, { rgb: [255, 214, 10], l: 'Galben' }, { rgb: [52, 199, 89], l: 'Verde' },
  { rgb: [50, 210, 255], l: 'Cyan' }, { rgb: [59, 130, 246], l: 'Albastru' }, { rgb: [168, 85, 247], l: 'Mov' }, { rgb: [255, 79, 163], l: 'Roz' }];
const rgbCss = (r) => `rgb(${r[0]},${r[1]},${r[2]})`;

function tileLight(m, i) {
  const state = m.gone ? 'unavailable' : m.on ? 'on' : 'off';
  // bec doar pornit/oprit: buton „lampă” — orb cu iconița becului care strălucește, nume și stare; toată plăcuța comută
  if (!m.dim && !m.color) {
    return `<button type="button" class="ccu-btn m chamfer" data-lamp="1" data-id="${i}" data-kind="light" data-entity="${esc(m.entity)}" data-act="toggle" data-state="${state}">`
      + `<span class="ccu-ico a-glow">${iconSvg(m.icon || 'bulb')}</span><span class="ccu-name">${esc(m.name)}</span><span class="ccu-sec">${m.gone ? '—' : m.on ? t('Pornit') : t('Oprit')}</span></button>`;
  }
  const tint = m.on && m.rgb ? ` style="--lc:${rgbCss(m.rgb)}"` : '';
  const more = m.color ? `<button type="button" class="mo" data-act="more" aria-label="${t('Alte culori')}">${iconSvg('sliders')}</button>` : '';
  const orb = `<button type="button" class="orb" data-act="toggle" data-state="${m.on ? 'on' : 'off'}" aria-label="${m.on ? t('Stinge') : t('Aprinde')}"><span class="ccu-ico a-glow">${iconSvg(m.icon || 'bulb')}</span></button>`;
  const sl = m.dim ? slider(m.on ? m.pct : 0, m.on ? `${m.pct}%` : '0%').replace('class="sl"', 'class="sl" data-min="0" data-max="100" data-step="1"') : '';
  const ct = m.canCt ? `<div class="sub"><small>${t('Temperatură de culoare')}</small>${slider(m.kel === null ? 50 : ((m.kel - m.kmin) / ((m.kmax - m.kmin) || 1)) * 100, m.kel === null ? '' : `${Math.round(m.kel)} K`).replace('class="sl"', `class="sl ct" data-sub="ct" data-min="${m.kmin}" data-max="${m.kmax}" data-step="50" data-unit="K"`)}</div>` : '';
  const sw = [];
  if (m.canCt) WHITES.forEach((w) => sw.push(`<button type="button" class="sw" data-act="swatch" data-k="${w.k}" style="--c:${w.c}" aria-label="${t(w.l)}" data-state="${m.kel !== null && Math.abs(m.kel - w.k) < 120 ? 'on' : 'off'}"></button>`));
  if (m.canRgb) COLORS.forEach((c) => sw.push(`<button type="button" class="sw" data-act="swatch" data-rgb="${c.rgb.join(',')}" style="--c:${rgbCss(c.rgb)}" aria-label="${t(c.l)}" data-state="${m.rgb && m.rgb.join() === c.rgb.join() ? 'on' : 'off'}"></button>`));
  return `<div class="ctl li" data-id="${i}" data-kind="light" data-entity="${esc(m.entity)}" data-state="${state}"${tint}>`
    + `<div class="hd">${orb}<span class="nm" data-act="more">${esc(m.name)}</span><span class="cur">${m.on ? (m.dim ? `${m.pct}%` : t('Pornit')) : t('Oprit')}</span>${more}</div>`
    + sl + ct + (sw.length ? `<div class="sws">${sw.join('')}</div>` : '') + `</div>`;
}

function tileFan(m, i) {
  const lab = (o) => (m.labels[o] !== undefined ? String(m.labels[o]) : pretty(o));
  const pills = m.presets.map((p) => `<button type="button" class="md" data-act="preset" data-val="${esc(p)}" data-state="${p === m.preset ? 'on' : 'off'}"><span>${esc(lab(p))}</span></button>`).join('');
  return `<div class="ctl fa" data-id="${i}" data-kind="fan" data-entity="${esc(m.entity)}" data-state="${m.gone ? 'unavailable' : m.on ? 'on' : 'off'}" data-run="${m.on ? 1 : 0}">`
    + `<div class="hd" data-act="toggle"><span class="ccu-ico a-fan">${iconSvg(m.icon || 'fan')}</span><span class="nm">${esc(m.name)}</span><span class="cur">${m.on ? (m.speed ? `${m.pct}%` : t('Pornit')) : t('Oprit')}</span>${powerBtn(m.on)}</div>`
    + (m.speed ? slider(m.on ? m.pct : 0, m.on ? `${m.pct}%` : '0%').replace('class="sl"', `class="sl" data-min="0" data-max="100" data-step="${m.pstep}"`) : '')
    + (pills ? `<div class="mds">${pills}</div>` : '') + `</div>`;
}

function tileMedia(m, i) {
  const st = m.gone ? 'unavailable' : m.on ? 'on' : 'off';
  const btn = (act, ico, on) => `<button type="button" class="st" data-act="${act}"${on ? ' data-state="on"' : ''} aria-label="${act}"><span class="ccu-ico">${iconSvg(ico)}</span></button>`;
  const ctr = m.on ? `<div class="tr">${m.canPrev ? btn('mprev', 'prev') : ''}${m.canPause ? btn('mpp', m.playing ? 'pause' : 'play', m.playing) : ''}${m.canNext ? btn('mnext', 'next') : ''}${m.canStep && !m.hasVol ? btn('mvd', 'voldown') + btn('mvu', 'volup') : ''}${m.canMute ? btn('mmute', 'mute', m.mute) : ''}</div>` : '';
  const vol = m.on && m.hasVol ? slider(m.vol, `${m.vol}%`).replace('class="sl"', 'class="sl" data-min="0" data-max="100" data-step="1"') : '';
  const now = m.title || m.artist ? `<div class="np"><b>${esc(m.title || m.artist)}</b>${m.title && m.artist ? `<small>${esc(m.artist)}</small>` : ''}</div>` : '';
  return `<div class="ctl me" data-id="${i}" data-kind="media" data-entity="${esc(m.entity)}" data-state="${st}">`
    + `<div class="hd" data-act="toggle"><span class="ccu-ico">${iconSvg(m.icon || 'tv')}</span><span class="nm">${esc(m.name)}</span><span class="cur">${m.gone ? '—' : m.playing ? t('Redă') : m.on ? (m.state === 'paused' ? t('Pauză') : t('Pornit')) : t('Oprit')}</span>${powerBtn(m.on)}</div>${now}${ctr}${vol}</div>`;
}

function tileNumber(m, i) {
  const span = m.max - m.min || 1;
  const pct = m.v === null ? 0 : ((m.v - m.min) / span) * 100;
  const label = m.v === null ? '—' : `${fmt(m.v, m.step < 1 ? 1 : 0)}${m.unit ? ' ' + m.unit : ''}`;
  return `<div class="ctl nu" data-id="${i}" data-kind="number" data-entity="${esc(m.entity)}" data-state="${m.gone ? 'unavailable' : 'on'}">`
    + `<div class="hd" data-act="more"><span class="ccu-ico">${iconSvg(m.icon || 'thermo')}</span><span class="nm">${esc(m.name)}</span><span class="cur">${esc(label)}</span></div>`
    + slider(pct, label).replace('class="sl"', `class="sl" data-min="${m.min}" data-max="${m.max}" data-step="${m.step}" data-unit="${esc(m.unit)}"`) + `</div>`;
}

function tileSelect(m, i) {
  const lab = (o) => (m.labels[o] !== undefined ? String(m.labels[o]) : pretty(o));
  const opts = m.options.map((o) => `<option value="${esc(o)}"${o === m.cur ? ' selected' : ''}>${esc(lab(o))}</option>`).join('');
  return `<label class="ctl se" data-id="${i}" data-kind="select" data-entity="${esc(m.entity)}" data-state="${m.gone ? 'unavailable' : 'on'}">`
    + `<span class="hd"><span class="ccu-ico">${iconSvg(m.icon || 'plug')}</span><span class="nm">${esc(m.name)}</span></span>`
    + `<span class="cv"><b>${m.cur ? esc(lab(m.cur)) : '—'}</b><span class="chev" aria-hidden="true">▾</span></span>`
    + `<select class="sel" data-act="select" data-cur="${esc(m.cur)}" aria-label="${esc(m.name)}">${opts}</select></label>`;
}

/** Cardul de controale (șir HTML). optim = { [index]: valoare } din atingeri recente. */
export function renderControls(config, hass, opts = {}) {
  const optim = opts.optim || {};
  const tiles = (config.items || []).map((it, i) => {
    const st = hass && hass.states ? hass.states[it.entity] : null;
    const m = controlModel(it, st, optim[i], optim[i + 'c']);
    return m.kind === 'climate' ? tileClimate(m, i) : m.kind === 'light' ? tileLight(m, i) : m.kind === 'number' ? tileNumber(m, i) : m.kind === 'fan' ? tileFan(m, i) : m.kind === 'media' ? tileMedia(m, i) : tileSelect(m, i);
  }).join('');
  const title = config.ctitle ? `<div class="ccu-title">${esc(config.ctitle)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card">${title}<div class="ccu-grid ctl-grid" data-cols="${config.columns}" style="--cols:${config.columns};--cols-wide:${config.columns}">${tiles}</div>${notes}</div>`;
}

/** Valoarea unui slider după poziția relativă 0..1: rotunjită la pas, în [min, max]. */
export function sliderValue(frac, min, max, step) {
  const f = Math.max(0, Math.min(1, Number.isFinite(frac) ? frac : 0));
  const s = step > 0 ? step : 1;
  const v = Math.round((min + f * (max - min)) / s) * s;
  return Math.max(min, Math.min(max, Math.round(v * 1e6) / 1e6));
}

// ---------------------------------------------------------------- titlu de secțiune
/** Normalizează `ccu-title-card`: { title, subtitle?, icon? }. */
export function normalizeTitle(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  return { title: src.title ? String(src.title) : '', subtitle: src.subtitle ? String(src.subtitle) : '', icon: src.icon ? String(src.icon) : '' };
}

export function renderTitle(t) {
  return `<div class="ccu-ttl">${t.icon ? `<span class="ccu-ico">${iconSvg(t.icon)}</span>` : ''}<span class="tx"><b>${esc(t.title)}</b>${t.subtitle ? `<small>${esc(t.subtitle)}</small>` : ''}</span></div>`;
}

// ---------------------------------------------------------------- telecomandă (remote.send_command)
export const TV_KEYS = {
  power: { cmd: 'POWER', icon: 'power', label: 'Pornit' }, mute: { cmd: 'MUTE', icon: 'mute', label: 'Mute' },
  vold: { cmd: 'VOLUME_DOWN', icon: 'voldown', label: 'Vol −', repeat: true }, volu: { cmd: 'VOLUME_UP', icon: 'volup', label: 'Vol +', repeat: true },
  chd: { cmd: 'CHANNEL_DOWN', icon: 'down', label: 'Canal −', repeat: true }, chu: { cmd: 'CHANNEL_UP', icon: 'up', label: 'Canal +', repeat: true },
  home: { cmd: 'HOME', icon: 'home', label: 'Home' }, back: { cmd: 'BACK', icon: 'back', label: 'Înapoi' }, menu: { cmd: 'MENU', icon: 'menu', label: 'Meniu' }, input: { cmd: 'INPUT', icon: 'input', label: 'Intrare' },
  up: { cmd: 'UP', icon: 'up' }, down: { cmd: 'DOWN', icon: 'down' }, left: { cmd: 'LEFT', icon: 'left' }, right: { cmd: 'RIGHT', icon: 'right' }, ok: { cmd: 'SELECT', icon: 'ok', label: 'OK' },
};
const TV_ROWS = [['power', 'mute'], ['vold', 'volu', 'chd', 'chu'], ['home', 'back', 'menu', 'input']];

/** Normalizează `ccu-remote-card`: { entity: remote.x, title?, commands?: { power: 'POWER', … } } — comenzile pot fi redenumite (ex. alt model de TV). */
export function normalizeRemote(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [];
  const entity = typeof src.entity === 'string' && ID.test(src.entity) ? src.entity : '';
  if (!entity) warnings.push(t('Telecomandă: lipsește „entity” (ex. remote.living_room_tv).'));
  const keys = {};
  for (const [k, d] of Object.entries(TV_KEYS)) keys[k] = { ...d, cmd: src.commands && typeof src.commands[k] === 'string' ? src.commands[k] : d.cmd };
  // `rows`: ce taste apar și în ce ordine (ex. [['power','mute'],['volu','vold']]); `extra`: taste proprii [{ label, icon, command }] (ex. Netflix → KEY_11), puse pe ultimul rând
  const extra = (Array.isArray(src.extra) ? src.extra : []).slice(0, 6).map((e, i) => (e && typeof e === 'object' && e.command ? { id: 'x' + i, cmd: String(e.command), icon: e.icon || 'play', label: String(e.label || '') } : null)).filter(Boolean);
  extra.forEach((e) => { keys[e.id] = { cmd: e.cmd, icon: e.icon, label: e.label }; });
  let rows = Array.isArray(src.rows) ? src.rows.map((r) => (Array.isArray(r) ? r.filter((k) => keys[k]) : [])).filter((r) => r.length) : TV_ROWS.map((r) => r.slice());
  if (extra.length) rows = rows.concat([extra.map((e) => e.id)]);
  return { entity, title: src.title ? String(src.title) : '', keys, rows, dpad: src.dpad !== false, warnings };
}

export function renderRemote(config, hass, opts = {}) {
  const st = hass && hass.states ? hass.states[config.entity] : null;
  const state = !st ? 'unavailable' : st.state === 'on' ? 'on' : st.state === 'off' ? 'off' : 'unavailable';
  const key = (k, cls = '') => { const d = config.keys[k]; return `<button type="button" class="rk ${cls}" data-key="${k}" data-cmd="${esc(d.cmd)}"${d.repeat ? ' data-repeat="1"' : ''} aria-label="${esc(d.label ? t(d.label) : k)}"><span class="ccu-ico">${iconSvg(d.icon)}</span>${d.label && !cls.includes('dp') ? `<span>${esc(t(d.label))}</span>` : ''}</button>`; };
  const rows = (config.rows || TV_ROWS).map((r) => `<div class="rr" style="--n:${Math.min(4, r.length)}">${r.map((k) => key(k)).join('')}</div>`).join('');
  const dpad = config.dpad ? `<div class="dpad">${key('up', 'dp u')}${key('left', 'dp l')}${key('ok', 'dp c')}${key('right', 'dp r')}${key('down', 'dp d')}</div>` : '';
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-remote" data-state="${state}">${title}${rows}${dpad}${notes}</div>`;
}
