// src/graph-card.mjs — ccu-graph-card (folosește funcțiile de date din graph-data.mjs).
// Istoric HA: callWS history/history_during_period → { entity_id: [{ s, lu }] } (lu în SECUNDE). SVG fără biblioteci, culori din tokeni.
import { t } from './i18n.mjs';
import { niceScale, formatLabel, formatNumber, formatTimeLabel } from './graph-data.mjs';
import { colorVars } from './presets.mjs';
import { esc } from './render.mjs';

const RANGE_H = { '6h': 6, '12h': 12, '24h': 24, '7d': 168, '30d': 720 };
const KINDS = ['area', 'line'];
const DEFAULT_COLORS = ['accent', 'yellow', 'blue'];
const TOKEN_VAR = { accent: 'var(--ccu-series)', on: 'var(--ccu-on)', ok: 'var(--ccu-ok)', alert: 'var(--ccu-alert)', green: 'var(--ccu-c-green)', yellow: 'var(--ccu-c-yellow)', orange: 'var(--ccu-c-orange)', blue: 'var(--ccu-c-blue)', cyan: 'var(--ccu-c-cyan)', red: 'var(--ccu-c-red)', white: 'var(--ccu-c-white)' };

/** Valoare + unitate pentru etichete: kW rămâne kW (formatLabel din graph-data îl trata ca W), W ≥ 1000 → kW, restul ca în formatLabel. */
export function formatValue(v, unit) {
  const u = String(unit || '').trim();
  if (/^kw$/i.test(u)) return Number.isFinite(v) ? `${v < 0 ? '−' : ''}${formatNumber(Math.abs(v))} kW` : '—';
  return formatLabel(v, u);
}

/** Ore dintr-un interval: '24h' | '7d' | 6 | { hours: 12 }. Necunoscut → 24. */
export function rangeHours(r) {
  if (typeof r === 'number' && r >= 1 && r <= 24 * 90) return r;
  if (r && typeof r === 'object' && Number(r.hours) >= 1 && Number(r.hours) <= 24 * 90) return Number(r.hours);
  return RANGE_H[r] || 24;
}
const rangeKey = (r) => (typeof r === 'string' && RANGE_H[r] ? r : `${rangeHours(r)}h`);
const tabLabel = (r) => { const k = rangeKey(r); return k === '7d' ? t('7 zile') : k === '30d' ? t('30 zile') : ({ '6h': '6 h', '12h': '12 h', '24h': '24 h' }[k] || `${rangeHours(r)} h`); };

/** Culoare de serie → valoare CSS sigură (token → var(), #hex/rgb validat → ca atare, altfel implicit). */
export function seriesColor(c, idx) {
  if (c === true) c = 'on'; // YAML: `color: on` fără ghilimele devine true
  if (typeof c === 'string' && TOKEN_VAR[c]) return TOKEN_VAR[c];
  const v = colorVars({ on: c }).vars['--ccu-on'];
  return v || TOKEN_VAR[DEFAULT_COLORS[idx] || 'accent'];
}

/**
 * thin(points, target) — reduce o serie [{t, v}] la cel mult `target` puncte, păstrând vârfurile:
 * pe fiecare găleată de timp rămân minimul și maximul (în ordine cronologică). Punctele fără valoare (v null) rămân ca „goluri”.
 * Primul și ultimul punct se păstrează mereu. Nu modifică seria primită.
 */
export function thin(points, target = 150) {
  const src = Array.isArray(points) ? points.filter((p) => p && Number.isFinite(p.t)) : [];
  if (src.length <= target) return src.slice();
  if (target < 4) return src.slice(0, Math.max(0, target));
  const per = Math.ceil(src.length / Math.floor((target - 2) / 2)); // puncte pe găleată → ≤ (target-2)/2 găleți × 2 + capete
  const out = [src[0]];
  for (let i = 1; i < src.length - 1; i += per) {
    const b = src.slice(i, Math.min(i + per, src.length - 1));
    const real = b.filter((p) => p.v !== null && Number.isFinite(p.v));
    if (real.length < b.length) { // găleată cu goluri: păstrăm golul ca separator
      const gap = b.find((p) => p.v === null || !Number.isFinite(p.v));
      if (!real.length) { out.push(gap); continue; }
    }
    if (!real.length) continue;
    let lo = real[0], hi = real[0];
    for (const p of real) { if (p.v < lo.v) lo = p; if (p.v > hi.v) hi = p; }
    const pair = lo === hi ? [lo] : (lo.t < hi.t ? [lo, hi] : [hi, lo]);
    out.push(...pair);
  }
  out.push(src[src.length - 1]);
  return out;
}

/** Normalizează config-ul graficului. Întoarce { config, warnings[] }. */
export function normalizeGraphConfig(cfg) {
  const warnings = [];
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const series = [];
  (Array.isArray(src.series) ? src.series : []).slice(0, 3).forEach((s, i) => {
    const o = typeof s === 'string' ? { entity: s } : s && typeof s === 'object' ? { ...s } : null;
    if (!o || typeof o.entity !== 'string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Seria #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    o.kind = KINDS.includes(o.kind) ? o.kind : (i === 0 ? 'area' : 'line');
    series.push(o);
  });
  if (Array.isArray(src.series) && src.series.length > 3) warnings.push(t('Grafic: maximum 3 serii; restul sunt ignorate.'));
  const range = src.range === undefined ? '24h' : src.range;
  if (src.range !== undefined && rangeHours(range) === 24 && range !== '24h' && range !== 24 && !(range && range.hours === 24)) warnings.push(t('Interval necunoscut "{r}" → 24h.', { r: JSON.stringify(range) }));
  const tabs = (Array.isArray(src.tabs) ? src.tabs : []).filter((t) => rangeHours(t) > 0).slice(0, 4);
  const height = Number.isFinite(Number(src.height)) && src.height >= 60 && src.height <= 400 ? Number(src.height) : 0;
  const refresh = Number.isFinite(Number(src.refresh_minutes)) && src.refresh_minutes >= 1 && src.refresh_minutes <= 60 ? Number(src.refresh_minutes) : 5;
  return { config: { ...src, series, range, tabs, height, refresh_minutes: refresh, legend: src.legend !== false, title: src.title ? String(src.title) : '' }, warnings };
}

// ---- axa X: ore rotunjite ----
function timeTicks(startMs, endMs, hours) {
  const stepH = hours <= 6 ? 1 : hours <= 12 ? 2 : hours <= 24 ? 4 : hours <= 72 ? 12 : hours <= 168 ? 24 : 24 * 5;
  const d = new Date(startMs); d.setMinutes(0, 0, 0);
  if (stepH >= 24) d.setHours(0);
  const out = [];
  for (let t = d.getTime(); t <= endMs; t += stepH * 3600e3) {
    if (t >= startMs) out.push(t);
    if (out.length > 12) break;
  }
  return out;
}
const lblRange = (hours) => (hours <= 24 ? '24h' : hours <= 24 * 8 ? '7d' : '30d');

/**
 * Model pur: din config + date → coordonate gata de desenat. data[i] = [{t(ms), v|null}] per serie.
 * Axa din dreapta apare doar dacă o serie are altă unitate decât prima.
 */
export function buildGraphModel(config, data, width, height, now = Date.now()) {
  const W = Math.max(200, Math.round(width || 360)), H = Math.max(80, Math.round(height || 150));
  const fs = W < 420 ? 11 : 12;
  const hours = rangeHours(config.range);
  const t1 = now, t0 = now - hours * 3600e3;
  const units = config.series.map((s, i) => s.unit || (data[i] && data[i].unit) || '');
  const rightIdx = config.series.map((s, i) => i).filter((i) => i > 0 && units[i] !== units[0]);
  const hasRight = rightIdx.length > 0;
  const axisRight = config.y_axis === 'right' && !hasRight; // etichetele Y în dreapta (ca ), când nu e nevoie de a doua axă
  const extent = (idxs) => {
    let lo = Infinity, hi = -Infinity;
    for (const i of idxs) for (const p of (data[i] || [])) if (p.v !== null && Number.isFinite(p.v)) { lo = Math.min(lo, p.v); hi = Math.max(hi, p.v); }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    if (lo > 0 && lo < hi * 0.6) lo = 0; // zona pornește de la 0 când valorile sunt „mari” față de minim
    return niceScale(lo, hi, H < 120 ? 2 : 4);
  };
  const leftIdx = config.series.map((s, i) => i).filter((i) => !rightIdx.includes(i));
  const sL = extent(leftIdx), sR = hasRight ? extent(rightIdx) : null;
  // lățimea etichetelor Y după cea mai lungă etichetă (ex. „2 000 ppb” nu mai iese din cadru)
  const labLen = Math.max(...sL.ticks.map((tv) => formatValue(tv, units[0]).length), ...(sR ? sR.ticks.map((tv) => formatValue(tv, units[rightIdx[0]]).length) : [0]));
  const lab = Math.max(Math.round(fs * 3.4), Math.ceil(labLen * fs * 0.62 + 8));
  const padL = axisRight ? 10 : lab, padR = hasRight || axisRight ? lab : 10, padT = 8, padB = fs + 14;
  const pw = W - padL - padR, ph = H - padT - padB;
  const X = (t) => padL + ((t - t0) / (t1 - t0)) * pw;
  const Y = (v, sc) => padT + (1 - (v - sc.min) / ((sc.max - sc.min) || 1)) * ph;

  const grid = sL.ticks.map((tv) => ({ y: +Y(tv, sL).toFixed(1), label: formatValue(tv, units[0]), right: sR ? formatValue(sR.ticks[Math.round(sL.ticks.indexOf(tv) * (sR.ticks.length - 1) / Math.max(1, sL.ticks.length - 1))], units[rightIdx[0]]) : '' }));
  const xt = timeTicks(t0, t1, hours).map((t) => ({ x: +X(t).toFixed(1), label: formatTimeLabel(t, lblRange(hours)) }));
  // etichete X fără suprapuneri: păstrăm doar cele la ≥ 46 px una de alta
  const xticks = []; let lastX = -1e9;
  for (const t of xt) if (t.x - lastX >= (W < 420 ? 52 : 60)) { xticks.push(t); lastX = t.x; }

  const seriesOut = config.series.map((s, i) => {
    const sc = rightIdx.includes(i) ? sR : sL;
    const pts = (data[i] || []).filter((p) => p.t >= t0 - 60e3 && p.t <= t1 + 60e3);
    let line = '', fill = '', seg = [];
    const flush = () => {
      if (seg.length >= 2) {
        const d = seg.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        line += (line ? ' ' : '') + d;
        const base = padT + ph;
        fill += (fill ? ' ' : '') + `${d} L${seg[seg.length - 1][0].toFixed(1)} ${base} L${seg[0][0].toFixed(1)} ${base} Z`;
      } else if (seg.length === 1) { line += (line ? ' ' : '') + `M${seg[0][0].toFixed(1)} ${seg[0][1].toFixed(1)} l0.1 0`; }
      seg = [];
    };
    for (const p of pts) { if (p.v === null || !Number.isFinite(p.v)) { flush(); continue; } seg.push([Math.min(padL + pw, Math.max(padL, X(p.t))), Y(p.v, sc)]); }
    flush();
    return { name: s.name || s.entity, unit: units[i], kind: s.kind, color: seriesColor(s.color ?? DEFAULT_COLORS[i], i), line, fill, points: pts.filter((p) => p.v !== null && Number.isFinite(p.v)).map((p) => ({ t: p.t, v: p.v, x: X(p.t), y: Y(p.v, sc) })) };
  });
  return { W, H, fs, padL, padR, padT, padB, pw, ph, t0, t1, hours, grid, xticks, series: seriesOut, hasRight, axisRight, empty: seriesOut.every((s) => !s.line) };
}

/** SVG-ul graficului (șir). Fără NaN: coordonatele vin din buildGraphModel. */
export function renderGraphSvg(m) {
  const g = m.grid.map((r) => `<line class="grid" x1="${m.padL}" x2="${m.W - m.padR}" y1="${r.y}" y2="${r.y}"/>${m.axisRight ? `<text x="${m.W - m.padR + 6}" y="${r.y + 3.5}">${esc(r.label)}</text>` : `<text x="${m.padL - 6}" y="${r.y + 3.5}" text-anchor="end">${esc(r.label)}</text>`}${m.hasRight && r.right ? `<text x="${m.W - m.padR + 6}" y="${r.y + 3.5}">${esc(r.right)}</text>` : ''}`).join('');
  const x = m.xticks.map((t) => `<text x="${t.x}" y="${m.H - 4}" text-anchor="middle">${esc(t.label)}</text>`).join('');
  const s = m.series.map((se, i) => (se.line ? `<g class="ser" style="--sc:${esc(se.color)}">${se.kind === 'area' ? `<defs><linearGradient id="gr${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sc);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--sc);stop-opacity:0"/></linearGradient></defs><path class="area" style="fill:url(#gr${i})" d="${se.fill}"/>` : ''}<path class="line" d="${se.line}"/></g>` : '')).join('');
  return `<svg class="ccu-graph" viewBox="0 0 ${m.W} ${m.H}" width="${m.W}" height="${m.H}" role="img" aria-label="grafic">${g}${x}${s}<line class="cursor" x1="0" x2="0" y1="${m.padT}" y2="${m.padT + m.ph}" opacity="0"/><g class="dots"></g></svg>`;
}

/** Tot cardul (șir): titlu + file + grafic + legendă. */
export function renderGraphCard(config, m, state, opts = {}) {
  const tabs = config.tabs.length > 1 ? `<div class="ccu-tabs">${config.tabs.map((t, i) => `<button type="button" class="ccu-tab" data-tab="${i}" data-state="${rangeKey(t) === rangeKey(state.range) ? 'on' : 'off'}">${esc(tabLabel(t))}</button>`).join('')}</div>` : '';
  const legend = config.legend && m.series.length > 1 ? `<div class="ccu-legend">${m.series.map((s) => `<span><i style="background:${esc(s.color)}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  // compact: legenda urcă în rândul titlului (între titlu și file) — cardul e mai scund
  const inHead = config.compact === true ? legend : '';
  const head = config.title || tabs ? `<div class="ccu-graph-head${inHead ? ' compact' : ''}"><div class="ccu-title">${esc(config.title)}</div>${inHead}${tabs}</div>` : '';
  let body;
  if (state.loading && m.empty) body = `<div class="ccu-graph-msg" style="height:${m.H}px">${t('se încarcă…')}</div>`;
  else if (m.empty) body = `<div class="ccu-graph-msg" style="height:${m.H}px">${t('fără date istorice')}</div>`;
  else body = renderGraphSvg(m);
  return `<div class="ccu-card panel ccu-graph-card">${head}<div class="ccu-graph-wrap" style="min-height:${m.H}px">${body}<div class="ccu-tip" hidden></div></div>${inHead ? '' : legend}${notesHtml(opts.warnings)}</div>`;
}
const notesHtml = (w) => (w && w.length ? `<div class="ccu-note">${w.slice(0, 3).map(esc).join('<br>')}</div>` : '');

/** Cel mai apropiat punct de x (căutare binară). */
export function nearestPoint(points, x) {
  if (!points || !points.length) return null;
  let lo = 0, hi = points.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (points[mid].x < x) lo = mid; else hi = mid; }
  return Math.abs(points[lo].x - x) <= Math.abs(points[hi].x - x) ? points[lo] : points[hi];
}
