// src/energy.mjs — cardurile de energie: flux (solar / rețea / baterie → consumatori) și baterie.
// Funcții PURE: model (din config + hass), geometrie și șabloane HTML/SVG. Fără DOM, fără rețea.
import { t } from './i18n.mjs';
import { esc } from './render.mjs';
import { iconSvg } from './icons.mjs';
import { formatNumber } from './state.mjs';

const ENTITY = /^[a-z_]+\.[a-z0-9_]+$/;
const MAX_CONSUMERS = 6;
const THRESH_W = 50; // sub 50 W un flux e considerat „repaus”

/** Puterea unei entități în W (kW/MW convertite). null dacă starea nu e un număr. */
export function toWatts(s) {
  if (!s || s.state === '' || s.state === null || s.state === undefined) return null;
  const n = Number(s.state);
  if (!Number.isFinite(n)) return null;
  const u = String((s.attributes && s.attributes.unit_of_measurement) || 'W').trim();
  return n * (/^kw$/i.test(u) ? 1000 : /^mw$/i.test(u) ? 1e6 : 1);
}

/** Energia în kWh (Wh/kWh/MWh convertite). null dacă nu e număr. */
export function toKwh(s) {
  if (!s || s.state === '' || s.state === null || s.state === undefined) return null;
  const n = Number(s.state);
  if (!Number.isFinite(n)) return null;
  const u = String((s.attributes && s.attributes.unit_of_measurement) || 'kWh').trim();
  return /^wh$/i.test(u) ? n / 1000 : /^mwh$/i.test(u) ? n * 1000 : n;
}

/** „1,82 kW” (de la 100 W în sus: 450 W = „0,45 kW”) / „45 W”; cu semn dacă signed. */
export function fmtPower(w, signed = false) {
  if (w === null || !Number.isFinite(w)) return '—';
  const sign = w < 0 ? '−' : (signed && w > 0 ? '+' : '');
  const a = Math.abs(w);
  return `${sign}${a >= 100 ? formatNumber(a / 1000) + ' kW' : formatNumber(Math.round(a)) + ' W'}`;
}

const asObj = (v) => (typeof v === 'string' ? { entity: v } : v && typeof v === 'object' ? { ...v } : null);
const okId = (e) => typeof e === 'string' && ENTITY.test(e);

// ================================================================== FLUX ==
/** Normalizează config-ul fluxului. items = listă plată (stânga: solar/grid/battery, dreapta: consumatori, jos: stats). */
export function normalizeFlowConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], items = [];
  const side = (key, def) => {
    const o = asObj(src[key] ?? (src.sources && src.sources[key]));
    if (!o) return;
    if (!okId(o.entity)) { warnings.push(t('Flux: „{k}” are entity_id lipsă sau invalid.', { k: key })); return; }
    // above / below: valori mici (doar numărul) deasupra / sub valoarea live a nodului, ex. la rețea: import lunar deasupra, import + export pe zi dedesubt
    const ex = (k, pos) => (Array.isArray(o[k]) ? o[k] : []).slice(0, 3).map((x, j) => {
      const e = typeof x === 'string' ? { entity: x } : asObj(x);
      if (!e || !okId(e.entity)) { warnings.push(t('Flux: „{k}.{s}” #{n} are entity_id invalid.', { k: key, s: k, n: j + 1 })); return null; }
      items.push({ kind: 'extra', entity: e.entity, name: e.label || e.name || '', icon: e.icon || '', arrow: ['in', 'out'].includes(e.arrow) ? e.arrow : '', parent: key, pos });
      return e.entity;
    }).filter(Boolean);
    const above = ex('above', 'above'), below = ex('below', 'below');
    items.push({ kind: key, entity: o.entity, name: o.name || def.name, icon: o.icon || def.icon, invert: o.invert === true, soc: okId(o.soc) ? o.soc : '', color: o.color, above, below });
  };
  side('solar', { name: t('Solar'), icon: 'sun' });
  side('grid', { name: t('Rețea'), icon: 'pylon' });
  side('battery', { name: t('Baterie'), icon: 'battery' });
  (Array.isArray(src.consumers) ? src.consumers : []).slice(0, MAX_CONSUMERS).forEach((c, i) => {
    const o = asObj(c);
    // `entities: [a, b, c]` = suma lor (ex. cele 3 faze ale unui contor); `subtract: [x]` = ce se scade (ex. EV-ul din priza halei, piscina din consumul casei)
    const sum = o && Array.isArray(o.entities) ? o.entities.filter(okId) : [];
    const first = o && okId(o.entity) ? o.entity : sum[0];
    if (!o || !first) { warnings.push(t('Consumator #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    const subtract = (Array.isArray(o.subtract) ? o.subtract : o.subtract ? [o.subtract] : []).filter(okId);
    items.push({ kind: 'consumer', entity: first, sum, subtract, name: o.name || first.split('.')[1].replace(/_/g, ' '), icon: o.icon || 'plug', hide_idle: o.hide_idle !== false });
  });
  if (Array.isArray(src.consumers) && src.consumers.length > MAX_CONSUMERS) warnings.push(t('Flux: maximum {m} consumatori; restul sunt ignorați.', { m: MAX_CONSUMERS }));
  (Array.isArray(src.stats) ? src.stats : []).slice(0, 4).forEach((c, i) => {
    const o = asObj(c);
    if (!o || !okId(o.entity)) { warnings.push(t('Statistica #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    items.push({ kind: 'stat', entity: o.entity, name: o.label || o.name || '', icon: o.icon || 'bolt' });
  });
  return { items, title: src.title ? String(src.title) : '', warnings };
}

/**
 * Modelul fluxului. Convenții: rețea + = import, baterie + = descărcare (invert: true le întoarce).
 * Total = suma consumatorilor (dacă există), altfel suma surselor. Procentul = parte din Total.
 */
export function buildFlowModel(items, hass) {
  const val = (it) => toWatts(hass && hass.states && hass.states[it.entity]);
  const fmtX = (id) => { const x = items.find((i) => i.kind === 'extra' && i.entity === id); const s = hass && hass.states && hass.states[id]; const n = s ? Number(s.state) : NaN;
    const unit = (s && s.attributes && s.attributes.unit_of_measurement) || '';
    return { ...x, text: Number.isFinite(n) && s.state !== '' ? `${formatNumber(n)}${unit ? ' ' + unit : ''}` : '—' }; };
  const left = items.filter((i) => i.kind === 'solar' || i.kind === 'grid' || i.kind === 'battery').map((it) => {
    let w = val(it);
    if (w !== null && it.kind === 'solar') w = Math.max(0, w);
    if (w !== null && it.invert) w = -w;
    let suffix = '';
    if (it.soc) { const s = hass && hass.states && hass.states[it.soc]; const p = s ? Number(s.state) : NaN; if (Number.isFinite(p)) suffix = ` (${Math.round(p)}%)`; }
    const dir = w === null ? 'na' : w > THRESH_W ? 'in' : w < -THRESH_W ? 'out' : 'idle';
    // text: invers față de direcția fluxului — rețea: export „+” / import „−”; baterie: încărcare „+” / descărcare „−” (solar rămâne „+”)
    const shown = w === null || it.kind === 'solar' ? w : -w;
    return { ...it, w, dir, text: fmtPower(shown, true), suffix, aboveX: (it.above || []).map(fmtX), belowX: (it.below || []).map(fmtX) };
  });
  // consumatorii care nu consumă (sub pragul de 10 W sau fără valoare) nu se desenează: altfel fluxul pare că merge spre ceva oprit (hide_idle: false îi păstrează)
  const cval = (it) => {
    const st = (id) => toWatts(hass && hass.states && hass.states[id]);
    const vs = (it.sum && it.sum.length ? it.sum : [it.entity]).map(st);
    if (vs.every((v) => v === null)) return null;
    let t = vs.reduce((a, v) => a + (v || 0), 0);
    for (const id of it.subtract || []) t -= st(id) || 0;
    return Math.max(0, t);
  };
  const cons = items.filter((i) => i.kind === 'consumer').map((it) => ({ ...it, w: cval(it) })).filter((c) => !(c.hide_idle && (c.w === null || c.w < 10)));
  const consSum = cons.reduce((a, c) => a + (c.w !== null && c.w > 0 ? c.w : 0), 0);
  const srcIn = left.reduce((a, l) => a + (l.w !== null && l.w > 0 ? l.w : 0), 0);
  const total = cons.length ? consSum : srcIn;
  const right = cons.map((c) => ({ ...c, pct: total > 0 && c.w !== null ? Math.round((Math.max(c.w, 0) / total) * 100) : null, text: fmtPower(c.w), dim: c.w !== null && c.w < 10 }))
    .sort((a, b) => (b.w ?? -1) - (a.w ?? -1));
  const stats = items.filter((i) => i.kind === 'stat').map((it) => {
    const s = hass && hass.states && hass.states[it.entity]; const n = s ? Number(s.state) : NaN;
    const unit = (s && s.attributes && s.attributes.unit_of_measurement) || '';
    return { ...it, text: Number.isFinite(n) && s.state !== '' ? `${formatNumber(n)}${unit ? ' ' + unit : ''}` : '—' };
  });
  return { left, right, stats, total, totalText: total >= THRESH_W ? fmtPower(total) : t('fără flux'), idle: total < THRESH_W };
}

/** Geometria: poziții verticale, panglici (poligoane) și nodul Total; toate coordonatele în [0,W]×[0,H]. */
export function layoutFlow(model, W) {
  W = Math.max(280, Math.round(W || 360));
  const rowR = 46, nL = model.left.length, nR = model.right.length;
  const hL = model.left.map((l) => 56 + 15 * ((l.aboveX || []).length + (l.belowX || []).length));   // un rând cu valori suplimentare e mai înalt
  const H = Math.max(150, nR * rowR, hL.reduce((a, b) => a + b, 0)) + 12;
  // coloanele de text au lățimea textului (nu un procent fix): panglicile pornesc chiar lângă valori
  const est = (n) => 26 + 8 + 6.8 * n;
  const lenL = Math.max(4, ...model.left.map((l) => Math.max(String(l.name).length, String(l.text).length)));
  const lenR = Math.max(4, ...model.right.map((c) => Math.max(String(c.name).length, String(c.text).length + (W >= 480 && c.pct !== null ? 7 : 0))));
  const clampW = (v) => Math.round(Math.min(W * 0.38, Math.max(W * 0.2, v)));
  const colL = clampW(est(lenL) + 4), colR = clampW(est(lenR) + 4);
  const cx = W / 2, cy = H / 2, r = Math.min(43, W * 0.13);
  const ys = (n, i) => ((i + 0.5) * H) / Math.max(1, n);
  const all = [...model.left.map((l) => Math.abs(l.w || 0)), ...model.right.map((c) => c.w || 0)];
  const maxW = Math.max(1, ...all);
  const thick = (w) => 4 + 19 * Math.min(1, Math.abs(w || 0) / maxW);
  const f = (n) => Number(n.toFixed(1));
  const ribbon = (x0, y0, x1, y1, t) => {
    const mx = (x0 + x1) / 2, h = t / 2;
    return `M${f(x0)} ${f(y0 - h)} C${f(mx)} ${f(y0 - h)} ${f(mx)} ${f(y1 - h)} ${f(x1)} ${f(y1 - h)} L${f(x1)} ${f(y1 + h)} C${f(mx)} ${f(y1 + h)} ${f(mx)} ${f(y0 + h)} ${f(x0)} ${f(y0 + h)} Z`;
  };
  const center = (x0, y0, x1, y1) => { const mx = (x0 + x1) / 2; return `M${f(x0)} ${f(y0)} C${f(mx)} ${f(y0)} ${f(mx)} ${f(y1)} ${f(x1)} ${f(y1)}`; };
  const sumL = hL.reduce((a, b) => a + b, 0) || 1; let accL = 0;
  const lr = model.left.map((l, i) => { const y = ((accL + hL[i] / 2) / sumL) * H; accL += hL[i]; const t = thick(l.w); return { y: f(y), t: f(t), d: ribbon(colL, y, cx - r, cy, t), line: center(colL, y, cx - r, cy) }; });
  const rr = model.right.map((c, i) => { const y = ys(nR, i), t = thick(c.w); return { y: f(y), t: f(t), d: ribbon(cx + r, cy, W - colR, y, t), line: center(cx + r, cy, W - colR, y) }; });
  return { W, H, colL, colR, cx: f(cx), cy: f(cy), r: f(r), left: lr, right: rr };
}

const COLOR = { solar: 'var(--ccu-c-yellow)', grid: 'var(--ccu-c-blue)', battery: 'var(--ccu-c-green)', consumer: 'var(--ccu-c-cyan)' };

/** Tot cardul fluxului (șir HTML). */
export function renderFlow(config, model, W, opts = {}) {
  const g = layoutFlow(model, W);
  const ids = new Map(config.entities.map((e, i) => [e.entity + '|' + e.kind, i]));
  const idOf = (it) => ids.get(it.entity + '|' + it.kind);
  const defs = model.left.map((l, i) => `<linearGradient id="fl${i}" x1="0" x2="1"><stop offset="0" style="stop-color:${esc(l.color && /^#/.test(l.color) ? l.color : COLOR[l.kind])};stop-opacity:.85"/><stop offset="1" style="stop-color:var(--ccu-on);stop-opacity:.55"/></linearGradient>`).join('')
    + model.right.map((c, i) => `<linearGradient id="fr${i}" x1="0" x2="1"><stop offset="0" style="stop-color:var(--ccu-on);stop-opacity:.55"/><stop offset="1" style="stop-color:${COLOR.consumer};stop-opacity:.8"/></linearGradient>`).join('');
  // panglica (și animația) apare doar când sursa chiar dă sau ia energie: solar care produce, rețea care importă / exportă, baterie care se încarcă / descarcă
  const ribbonsL = model.left.map((l, i) => (l.dir === 'na' || l.dir === 'idle' ? '' : `<path class="rb" style="fill:url(#fl${i})" d="${g.left[i].d}"/><path class="pulse" data-dir="${l.dir === 'out' ? 'out' : 'in'}" d="${g.left[i].line}"/>`)).join('');
  const ribbonsR = model.right.map((c, i) => (c.w === null ? '' : `<path class="rb" style="fill:url(#fr${i});opacity:${c.dim ? '.25' : '1'}" d="${g.right[i].d}"/><path class="pulse" data-dir="in" d="${g.right[i].line}"/>`)).join('');
  const svg = `<svg class="ccu-flow-svg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W}" height="${g.H}" aria-hidden="true"><defs>${defs}</defs>${ribbonsL}${ribbonsR}<circle class="hub-ring" cx="${g.cx}" cy="${g.cy}" r="${g.r}"/></svg>`;
  const xl = (arr) => (arr || []).map((x) => `<span class="xl" data-id="${idOf(x)}" data-entity="${esc(x.entity)}">${x.arrow ? `<em data-a="${x.arrow}">${x.arrow === 'in' ? '↓' : '↑'}</em>` : ''}${esc(x.text)}${x.name ? `<i>${esc(x.name)}</i>` : ''}</span>`).join('');
  const left = model.left.map((l, i) => `<div class="ccu-fi left" data-id="${idOf(l)}" data-entity="${esc(l.entity)}" data-dir="${l.dir}" style="top:${g.left[i].y}px;width:${g.colL}px"><span class="ccu-ico" style="color:${esc(l.color && /^#/.test(l.color) ? l.color : COLOR[l.kind])}">${iconSvg(l.icon)}</span><span class="tx"><b>${esc(l.name)}</b>${xl(l.aboveX)}<span class="v">${esc(l.text)}${l.suffix ? ` <i>${esc(l.suffix.trim())}</i>` : ''}</span>${xl(l.belowX)}</span></div>`).join('');
  const right = model.right.map((c, i) => `<div class="ccu-fi right${c.dim ? ' dim' : ''}" data-id="${idOf(c)}" data-entity="${esc(c.entity)}" style="top:${g.right[i].y}px;width:${g.colR}px"><span class="tx"><b>${esc(c.name)}</b><span class="v">${esc(c.text)}${c.pct !== null ? ` <i>(${c.pct}%)</i>` : ''}</span></span><span class="ccu-ico">${iconSvg(c.icon)}</span></div>`).join('');
  const hub = `<div class="ccu-hub" data-idle="${model.idle ? 1 : 0}" style="left:${g.cx}px;top:${g.cy}px"><span class="ccu-ico">${iconSvg('home')}</span><small>${t('Total')}</small><b>${esc(model.totalText)}</b></div>`;
  const stats = model.stats.length ? `<div class="ccu-flow-stats" data-n="${model.stats.length}">${model.stats.map((s) => `<div class="st" data-id="${idOf(s)}" data-entity="${esc(s.entity)}"><span class="ccu-ico">${iconSvg(s.icon)}</span><span class="tx"><small>${esc(s.name)}</small><b>${esc(s.text)}</b></span></div>`).join('')}</div>` : '';
  const head = config.title ? `<div class="ccu-flow-head"><span class="t">${esc(config.title)}</span>${model.idle ? '' : `<span class="tt">· ${t('Total')} ${esc(model.totalText)}</span>`}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-flow">${head}<div class="ccu-flow-body" style="height:${g.H}px">${svg}${left}${right}${hub}</div>${stats}${notes}</div>`;
}

// ================================================================ BATERIE ==
export function normalizeBatteryConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [];
  const ent = (k) => { if (src[k] === undefined || src[k] === '') return ''; if (okId(src[k])) return src[k]; warnings.push(t('Baterie: „{k}” nu e un entity_id valid.', { k })); return ''; };
  const num = (k, d, lo, hi) => { const n = Number(src[k]); return Number.isFinite(n) && n >= lo && n <= hi ? n : d; };
  const soc = ent('soc');
  if (!soc) warnings.push(t('Baterie: lipsește „soc” (entitatea cu procentul bateriei).'));
  const cfgOut = {
    soc, capacity_entity: ent('capacity_entity'), power: ent('power'), power_invert: src.power_invert === true, load: ent('load'), load_entities: (Array.isArray(src.load_entities) ? src.load_entities : src.load_entities ? [src.load_entities] : []).map(String).filter(okId), grid_present: ent('grid_present'),
    capacity_kwh: num('capacity_kwh', 0, 0.1, 1000), reserve_pct: num('reserve_pct', 20, 0, 100), shutdown_pct: num('shutdown_pct', 10, 0, 100),
    title: src.title ? String(src.title) : t('Baterie'), show_title: src.show_title !== false, color: ['yellow', 'green', 'blue', 'orange'].includes(src.color) ? src.color : 'yellow',
  };
  if (cfgOut.shutdown_pct > cfgOut.reserve_pct) warnings.push(t('Baterie: „shutdown_pct” e peste „reserve_pct”; le-am inversat.'));
  if (cfgOut.shutdown_pct > cfgOut.reserve_pct) { const t = cfgOut.shutdown_pct; cfgOut.shutdown_pct = cfgOut.reserve_pct; cfgOut.reserve_pct = t; }
  return { config: cfgOut, warnings };
}

/** Modelul bateriei: SOC, energie, autonomie până la rezervă, stare (ok / low / backup / na). */
export function buildBatteryModel(config, hass) {
  const st = (id) => (id && hass && hass.states ? hass.states[id] : null);
  const socS = st(config.soc), p = socS ? Number(socS.state) : NaN;
  const soc = Number.isFinite(p) && socS.state !== '' ? Math.min(100, Math.max(0, p)) : null;
  const capE = toKwh(st(config.capacity_entity));
  const total = capE !== null && capE > 0 ? capE : (config.capacity_kwh || null);
  const now = soc !== null && total ? (soc / 100) * total : null;
  // consumul = `load` + `load_entities` (se adună); dacă una dintre ele nu are valoare, autonomia nu se calculează (altfel ar ieși prea optimistă)
  const loadIds = [config.load].concat(config.load_entities || []).filter(Boolean);
  const loadVals = loadIds.map((id) => toWatts(st(id)));
  const loadW = loadVals.length && loadVals.every((w) => w !== null) ? loadVals.reduce((a, b) => a + b, 0) : null;
  // încărcare: puterea bateriei are convenția fluxului (+ = descărcare, − = încărcare; `power_invert: true` o întoarce)
  let pw = toWatts(st(config.power)); if (pw !== null && config.power_invert) pw = -pw;
  const chargeW = pw !== null && pw < -THRESH_W ? -pw : null;
  const gp = st(config.grid_present);
  const backup = !!gp && gp.state === 'off';
  // banda utilizabilă = [prag, 100]%: cu rețea pragul e rezerva (reserve_pct), fără rețea (backup) pragul de oprire (shutdown_pct).
  // Toate valorile se calculează exact din procente și capacitate; se rotunjește doar la afișare.
  const floor = backup ? config.shutdown_pct : config.reserve_pct;
  const bandTotal = total ? ((100 - floor) / 100) * total : null;                       // ex. 37,7 kWh × (100 − 20)% = 30,16 kWh
  const usable = soc !== null && total ? (Math.max(0, soc - floor) / 100) * total : null; // ex. 37,7 kWh × (53 − 20)% = 12,441 kWh
  let autonomyH = null;
  if (usable !== null && loadW !== null && loadW >= THRESH_W) autonomyH = (usable * 1000) / loadW;
  const state = soc === null ? 'na' : backup ? 'backup' : soc <= config.reserve_pct ? 'low' : 'ok';
  const charging = chargeW !== null && soc !== null && soc < 100;
  const fullH = charging && total ? (((100 - soc) / 100) * total * 1000) / chargeW : null;   // timp până la 100% la puterea de încărcare de acum
  const hh = (h) => (h === null ? '—' : h >= 100 ? '>99 h' : `~${formatNumber(Math.round(h * 10) / 10)} h`);
  return { soc, total, now, autonomyH, usable, bandTotal, floor, state, backup, charging, chargeW, fullH, fullText: hh(fullH), loadW, socText: soc === null ? '—' : `${Math.round(soc)}%`,
    energyText: usable !== null && bandTotal !== null ? t('{a} kWh din {b} kWh', { a: formatNumber(Math.round(usable * 10) / 10), b: formatNumber(Math.round(bandTotal * 10) / 10) }) : (bandTotal !== null ? t('— din {b} kWh', { b: formatNumber(Math.round(bandTotal * 10) / 10) }) : ''),
    autonomyText: hh(autonomyH) };
}

const BAT_FILL = { yellow: ['#f6c343', '#c98f1a'], green: ['#34d399', '#15803d'], blue: ['#60a5fa', '#2563eb'], orange: ['#fbbf24', '#d97706'] };

/** Cardul bateriei (șir HTML). */
export function renderBattery(config, m, opts = {}) {
  const [c0, c1] = m.state === 'backup' ? ['#f4694b', '#a32a1f'] : m.state === 'low' ? ['#fbbf24', '#d97706'] : BAT_FILL[config.color];
  const pct = m.soc === null ? 0 : m.soc;
  // prima etichetă (oprire) se trage spre stânga, a doua (rezervă) spre dreapta: nu se mai suprapun nici pe telefon
  // pragul de oprire (10%) contează doar când rețeaua e căzută (backup): altfel se vede doar rezerva (20%)
  const marks = m.backup
    ? [{ p: config.shutdown_pct, label: t('oprire invertor'), c: 'var(--ccu-c-red)', sh: '-48%' }, { p: config.reserve_pct, label: t('rezervă'), c: 'var(--ccu-c-yellow)', sh: '34%' }]
    : [{ p: config.reserve_pct, label: t('rezervă'), c: 'var(--ccu-c-yellow)', sh: '0%' }];
  const mk = marks.map((k) => `<span class="mk" style="left:${k.p}%"><i style="background:${k.c}"></i><span class="lb" style="--sh:${k.sh}"><b>${Math.round(k.p)}%</b><small>(${esc(k.label)})</small></span></span>`).join('');
  const head = m.state === 'backup'
    ? `<div class="ccu-bat-head backup"><span class="ccu-ico">${iconSvg('bolt')}</span><span>${t('Backup activ · Rețeaua este oprită')}</span></div>`
    : (config.show_title === false ? '' : `<div class="ccu-bat-head"><span class="ccu-ico">${iconSvg('battery')}</span><span>${esc(config.title)}</span></div>`);   // show_title: false = fără titlu „Baterie” + iconiță
  const body = `<div class="ccu-bat-body"><div class="ccu-bat-shell" data-state="${m.state}"><div class="fill" style="width:${pct}%;background:linear-gradient(180deg,${c0},${c1})"></div><span class="pct">${esc(m.socText)}</span></div>`
    + `<div class="ccu-bat-info"><span class="e">${esc(m.energyText)}</span>${m.charging ? `<span class="a ch"><i>${t('Plin în')}</i><b>${esc(m.fullText)}</b></span>` : ''}<span class="a"><i>${m.charging ? t('Autonomie la consum') : t('Autonomie')}</i><b>${esc(m.autonomyText)}</b></span></div></div>`;
  const slider = `<div class="ccu-bat-slider"><div class="tr"><div class="fl" style="width:${pct}%"></div></div>${mk}</div>`;
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-bat" data-state="${m.state}"${m.charging ? ' data-charging="1"' : ''} data-id="0" data-entity="${esc(config.soc)}">${head}${body}${slider}${notes}</div>`;
}


// ============================================================ BATERII: DESCOPERIRE AUTOMATĂ ==
const MOBILE_PLATFORMS = ['mobile_app', 'fully_kiosk', 'browser_mod'];
const MOBILE_MODEL = /iphone|ipad|ipod|tablet|\btab\b|pixel|galaxy|sm-[a-z]\d/i;
const strList = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(String).map((x) => x.trim()).filter(Boolean);

/**
 * `auto` (carduri baterii / chips): true sau { exclude, include, threshold, unavailable, mobile }.
 *  - exclude: cuvinte căutate în entity_id și în nume (ex. „deye”, „audi”); include: entity_id forțate;
 *  - threshold: „slabă” = până la acest procent (implicit 20); unavailable: true = păstrează și dispozitivele indisponibile;
 *  - mobile (implicit true): lasă deoparte telefoanele, tabletele și browserele (aplicația HA, Fully Kiosk, Browser Mod).
 */
export function normalizeAutoBatteries(v) {
  if (!v) return null;
  const o = v === true ? {} : typeof v === 'object' ? v : null;
  if (!o) return null;
  const th = Number(o.threshold);
  const names = o.names && typeof o.names === 'object' && !Array.isArray(o.names) ? Object.fromEntries(Object.entries(o.names).filter(([k, v]) => okId(k) && v).map(([k, v]) => [k, String(v)])) : {};
  return { exclude: strList(o.exclude), include: strList(o.include).filter(okId), threshold: Number.isFinite(th) && th >= 0 && th <= 100 ? th : 20, unavailable: o.unavailable === true, mobile: o.mobile !== false, names };
}

/** Bateriile găsite în HA (senzori cu device_class „battery”; binary_sensor „on” = slabă), crescător după nivel. */
export function discoverBatteries(hass, auto) {
  const a = normalizeAutoBatteries(auto);
  const S = (hass && hass.states) || {};
  if (!a) return [];
  const ex = a.exclude.map((x) => x.toLowerCase());
  const out = [];
  for (const [id, s] of Object.entries(S)) {
    if (!/^(sensor|binary_sensor)\./.test(id) || !s) continue;
    const at = s.attributes || {}, forced = a.include.includes(id);
    // senzori cu device_class „battery” sau, dacă producătorul nu l-a pus, senzori în % al căror id se termină în „battery” / „battery_level” (ex. un senzor Tuya de temperatură / umiditate; nu „…_soh” sau „…_battery_health”)
    const looksBattery = at.device_class === 'battery' || (!at.device_class && at.unit_of_measurement === '%' && id.startsWith('sensor.') && /(^|_)batt(ery)?(_level)?$/i.test(id));
    if (!looksBattery && !forced) continue;
    const friendly = String(at.friendly_name || '');
    if (!forced && ex.some((x) => id.toLowerCase().includes(x) || friendly.toLowerCase().includes(x))) continue;
    if (a.mobile && !forced) {
      const ent = hass.entities && hass.entities[id], dev = ent && ent.device_id && hass.devices && hass.devices[ent.device_id];
      if ((ent && MOBILE_PLATFORMS.includes(ent.platform)) || (dev && MOBILE_MODEL.test(String(dev.model || ''))) || /browser_mod/.test(id)) continue;
    }
    const gone = s.state === 'unavailable' || s.state === 'unknown' || s.state === '';
    if (gone && !a.unavailable) continue;
    const name = a.names[id] || friendly.replace(/\s*battery(\s*level)?\s*$/i, '').trim() || friendly || id.split('.')[1].replace(/_/g, ' ');
    if (id.startsWith('binary_sensor.')) { out.push({ entity: id, name, pct: null, low: s.state === 'on', binary: true }); continue; }
    if (at.unit_of_measurement && at.unit_of_measurement !== '%') continue;
    const n = Number(s.state);
    const pct = !gone && Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
    if (pct === null && !gone) continue;
    out.push({ entity: id, name, pct, low: pct !== null && pct <= a.threshold, binary: false });
  }
  const key = (r) => (r.binary ? (r.low ? -1 : 101) : r.pct === null ? 102 : r.pct);
  return out.sort((x, y) => key(x) - key(y) || x.name.localeCompare(y.name));
}

/** Chip-ul „baterii slabe”: true sau { …auto, label, tap_action }. */
export function normalizeLowBatteries(v) {
  if (!v) return null;
  const auto = normalizeAutoBatteries(v);
  if (!auto) return null;
  const o = v === true ? {} : v;
  return { ...auto, label: o.label ? String(o.label) : '', tap_action: o.tap_action, hold_action: o.hold_action };
}

/** Modelul chip-ului: câte baterii sunt slabe și care (cea mai slabă prima). */
export function lowBatteryModel(config, hass) {
  if (!config) return null;
  const rows = discoverBatteries(hass, config);
  const low = rows.filter((r) => r.low);
  return { rows, low, count: low.length };
}

// ============================================================ BATERII DISPOZITIVE ==
/** Lista nivelurilor de baterie ale dispozitivelor (telefoane, tablete, mașină…), sortată crescător. */
export function normalizeBatteriesConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], items = [];
  (Array.isArray(src.entities) ? src.entities : []).forEach((c, i) => {
    const o = typeof c === 'string' ? { entity: c } : c && typeof c === 'object' ? { ...c } : null;
    if (!o || !okId(o.entity)) { warnings.push(t('Baterii: elementul #{n} are entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    items.push({ kind: 'battery', entity: o.entity, name: o.name ? String(o.name) : '' });
  });
  if (items.length > 12) { items.length = 12; warnings.push(t('Baterii: maximum 12; restul sunt ignorate.')); }
  const n = (k, d) => (Number.isFinite(Number(src[k])) && src[k] >= 0 && src[k] <= 100 ? Number(src[k]) : d);
  return { items, title: src.title ? String(src.title) : 'Baterii dispozitive', warn_pct: n('warn_pct', 20), low_pct: n('low_pct', 10), sort: src.sort === 'none' ? 'none' : 'asc', auto: normalizeAutoBatteries(src.auto), only_low: src.only_low === true, warnings };
}

export function buildBatteriesModel(config, hass) {
  const rows = config.entities.map((e, i) => {
    const s = hass && hass.states ? hass.states[e.entity] : null;
    const p = s && s.state !== '' ? Number(s.state) : NaN;
    const pct = Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : null;
    const friendly = (s && s.attributes && s.attributes.friendly_name) || e.entity.split('.')[1].replace(/_/g, ' ');
    const name = e.name || String(friendly).replace(/\s*battery(\s*level)?\s*$/i, '').trim() || friendly;
    const lvl = pct === null ? 'na' : pct < config.low_pct ? 'low' : pct < config.warn_pct ? 'warn' : 'ok';
    return { idx: i, entity: e.entity, name, pct, text: pct === null ? '—' : `${Math.round(pct)}%`, lvl };
  });
  // `auto`: bateriile găsite singure în HA, fără cele deja listate
  if (config.auto) {
    const have = new Set(rows.map((r) => r.entity));
    discoverBatteries(hass, config.auto).filter((d) => !have.has(d.entity)).forEach((d) => {
      let lvl = d.binary ? (d.low ? 'low' : 'ok') : d.pct === null ? 'na' : d.pct < config.low_pct ? 'low' : d.pct < config.warn_pct ? 'warn' : 'ok';
      if (d.low && lvl === 'ok') lvl = 'warn';   // ce numără chip-ul ca „slabă” (≤ prag) nu apare niciodată ca „în regulă” în listă
      rows.push({ idx: rows.length, entity: d.entity, name: d.name, pct: d.binary ? (d.low ? 0 : 100) : d.pct, text: d.binary ? (d.low ? t('slabă') : 'OK') : d.pct === null ? '—' : `${Math.round(d.pct)}%`, lvl });
    });
  }
  let out = rows;
  if (config.only_low) out = rows.filter((r) => r.lvl === 'low' || r.lvl === 'warn');   // doar bateriile slabe (sub pragul de avertisment)
  if (config.sort !== 'none') out.sort((a, b) => (a.pct === null ? 101 : a.pct) - (b.pct === null ? 101 : b.pct));
  return out;
}

export function renderBatteries(config, rows, opts = {}) {
  const body = rows.map((r) => `<div class="br" data-id="${r.idx}" data-entity="${esc(r.entity)}" data-lvl="${r.lvl}"><span class="ccu-ico">${iconSvg('battery')}</span><span class="nm">${esc(r.name)}</span><span class="bar"><i style="width:${r.pct === null ? 0 : r.pct}%"></i></span><b>${esc(r.text)}</b></div>`).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-batts">${title}<div class="rows">${body}</div>${notes}</div>`;
}
