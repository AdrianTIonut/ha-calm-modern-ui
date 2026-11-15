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
  if (RANGE_H[r]) return RANGE_H[r];
  const m = typeof r === 'string' ? /^\s*(\d{1,4})\s*([hd])\s*$/i.exec(r) : null;   // orice „48h”, „3d”, „90d” (1 h … 90 zile)
  if (m) { const h = Number(m[1]) * (m[2].toLowerCase() === 'd' ? 24 : 1); if (h >= 1 && h <= 24 * 90) return h; }
  return 24;
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
  const timeline = src.timeline === true, maxSeries = timeline ? 8 : 3;   // cronologie: un rând pe serie, până la 8
  (Array.isArray(src.series) ? src.series : []).slice(0, maxSeries).forEach((s, i) => {
    const o = typeof s === 'string' ? { entity: s } : s && typeof s === 'object' ? { ...s } : null;
    if (!o || typeof o.entity !== 'string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Seria #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    o.kind = KINDS.includes(o.kind) ? o.kind : (i === 0 ? 'area' : 'line');
    series.push(o);
  });
  if (Array.isArray(src.series) && src.series.length > maxSeries) warnings.push(timeline ? t('Grafic: maximum 8 serii (cronologie); restul sunt ignorate.') : t('Grafic: maximum 3 serii; restul sunt ignorate.'));
  const range = src.range === undefined ? '24h' : src.range;
  if (src.range !== undefined && rangeHours(range) === 24 && range !== '24h' && range !== 24 && !(range && range.hours === 24)) warnings.push(t('Interval necunoscut "{r}" → 24h.', { r: typeof range === 'string' ? range : JSON.stringify(range) }));
  const tabs = (Array.isArray(src.tabs) ? src.tabs : []).filter((t) => rangeHours(t) > 0).slice(0, 4);
  const height = Number.isFinite(Number(src.height)) && src.height >= 60 && src.height <= 400 ? Number(src.height) : 0;
  const refresh = Number.isFinite(Number(src.refresh_minutes)) && src.refresh_minutes >= 1 && src.refresh_minutes <= 60 ? Number(src.refresh_minutes) : 5;
  return { config: { ...src, series, range, tabs, height, refresh_minutes: refresh, legend: src.legend !== false, timeline, title: src.title ? String(src.title) : '' }, warnings };
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
  if (config.timeline) return buildTimelineModel(config, data, width, now);
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
  const binAll = leftIdx.length > 0 && leftIdx.every((i) => data[i] && data[i].binary);   // doar serii pornit / oprit: axa are două trepte
  const sL = binAll ? { min: -0.15, max: 1.15, ticks: [0, 1] } : extent(leftIdx), sR = hasRight ? extent(rightIdx) : null;
  // lățimea etichetelor Y după cea mai lungă etichetă (ex. „2 000 ppb” nu mai iese din cadru)
  const tickText = (tv) => (binAll ? (tv >= 1 ? t('Pornit') : t('Oprit')) : formatValue(tv, units[0]));
  const labLen = Math.max(...sL.ticks.map((tv) => tickText(tv).length), ...(sR ? sR.ticks.map((tv) => formatValue(tv, units[rightIdx[0]]).length) : [0]));
  const lab = Math.max(Math.round(fs * 3.4), Math.ceil(labLen * fs * 0.62 + 8));
  const padL = axisRight ? 10 : lab, padR = hasRight || axisRight ? lab : 10, padT = 8, padB = fs + 14;
  const pw = W - padL - padR, ph = H - padT - padB;
  const X = (t) => padL + ((t - t0) / (t1 - t0)) * pw;
  const Y = (v, sc) => padT + (1 - (v - sc.min) / ((sc.max - sc.min) || 1)) * ph;

  const grid = sL.ticks.map((tv) => ({ y: +Y(tv, sL).toFixed(1), label: tickText(tv), right: sR ? formatValue(sR.ticks[Math.round(sL.ticks.indexOf(tv) * (sR.ticks.length - 1) / Math.max(1, sL.ticks.length - 1))], units[rightIdx[0]]) : '' }));
  const xt = timeTicks(t0, t1, hours).map((t) => ({ x: +X(t).toFixed(1), label: formatTimeLabel(t, lblRange(hours)) }));
  // etichete X fără suprapuneri: păstrăm doar cele la ≥ 46 px una de alta
  const xticks = []; let lastX = -1e9;
  for (const t of xt) if (t.x - lastX >= (W < 420 ? 52 : 60)) { xticks.push(t); lastX = t.x; }

  const seriesOut = config.series.map((s, i) => {
    const sc = rightIdx.includes(i) ? sR : sL;
    const pts = (data[i] || []).filter((p) => p.t >= t0 - 60e3 && p.t <= t1 + 60e3);
    // serie pornit / oprit: trepte (valoarea rămâne până la următoarea schimbare) și ține până la „acum”
    let drawPts = pts;
    if (data[i] && data[i].binary) {
      drawPts = [];
      pts.forEach((p, k) => { if (p.v !== null && k > 0 && pts[k - 1].v !== null) drawPts.push({ t: p.t, v: pts[k - 1].v }); drawPts.push(p); });
      const last = pts[pts.length - 1]; if (last && last.v !== null && last.t < t1) drawPts.push({ t: t1, v: last.v });
    }
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
    for (const p of drawPts) { if (p.v === null || !Number.isFinite(p.v)) { flush(); continue; } seg.push([Math.min(padL + pw, Math.max(padL, X(p.t))), Y(p.v, sc)]); }
    flush();
    return { name: s.name || s.entity, unit: units[i], binary: !!(data[i] && data[i].binary), kind: s.kind, color: seriesColor(s.color ?? DEFAULT_COLORS[i], i), line, fill, points: pts.filter((p) => p.v !== null && Number.isFinite(p.v)).map((p) => ({ t: p.t, v: p.v, x: X(p.t), y: Y(p.v, sc) })) };
  });
  return { W, H, fs, padL, padR, padT, padB, pw, ph, t0, t1, hours, grid, xticks, series: seriesOut, hasRight, axisRight, empty: seriesOut.every((s) => !s.line) };
}

/** Durata în text scurt: „45 min”, „2 h”, „1 h 25 min”. */
export function formatDuration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 1) return '<1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
/** Varianta compactă, pentru bare înguste: „1,4 h” / „45 min”. */
const durShort = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${Math.max(1, m)} min` : `${formatNumber(Math.round(m / 6) / 10)} h`; };

/** Ore rotunde pe axă (00:00, 03:00, 06:00 …), în ora locală; pași de câte 1 / 2 / 3 / 6 / 12 / 24 de ore după interval. */
function alignedTicks(t0, t1, hours) {
  const stepH = hours <= 6 ? 1 : hours <= 12 ? 2 : hours <= 24 ? 3 : hours <= 48 ? 6 : hours <= 72 ? 12 : hours <= 168 ? 24 : 24 * 5;
  const d = new Date(t0); d.setMinutes(0, 0, 0);
  if (stepH >= 24) { d.setHours(0); if (d.getTime() < t0) d.setDate(d.getDate() + 1); }
  else while (d.getTime() < t0 || d.getHours() % stepH !== 0) d.setHours(d.getHours() + 1);
  const out = [];
  for (let t = d.getTime(); t <= t1 && out.length < 16;) {
    out.push(t);
    const n = new Date(t); if (stepH >= 24) n.setDate(n.getDate() + stepH / 24); else n.setHours(n.getHours() + stepH);
    t = n.getTime();
  }
  return out;
}

/**
 * Cronologie: un rând pe serie, cu bare unde seria e „pornită” (1 / pornit / > 0), hașurat unde e indisponibilă și durata scrisă pe bare.
 * Ideal pentru ventile, întrerupătoare, uși. Model pur: data[i] = [{ t (ms), v | null }]; valoarea ține până la următorul punct (și până la „acum”).
 */
export function buildTimelineModel(config, data, width, now = Date.now()) {
  const W = Math.max(200, Math.round(width || 360)), fs = W < 420 ? 11 : 12;
  const hours = rangeHours(config.range), t1 = now, t0 = now - hours * 3600e3;
  const showDur = config.hide_durations !== true;
  const maxChars = Math.max(6, Math.floor(Math.min(W * 0.36, 140) / (fs * 0.56)));
  const full = config.series.map((s) => String(s.name || s.entity));
  const names = full.map((n) => (n.length > maxChars ? n.slice(0, Math.max(1, maxChars - 1)) + '…' : n));
  const laneH = Number(config.lane_height) >= 12 && Number(config.lane_height) <= 36 ? Number(config.lane_height) : 22, gap = 6, n = config.series.length;
  // pe rând: perioadele (pornit / indisponibil) cu ora de început și de sfârșit, ca să se poată citi cât a mers
  const raw = config.series.map((s, i) => {
    const pts = (data[i] || []).filter((p) => p && Number.isFinite(p.t)).slice().sort((x, y) => x.t - y.t);
    const on = [], na = [];
    pts.forEach((p, k) => {
      const a = Math.max(t0, p.t), b = Math.min(t1, k + 1 < pts.length ? pts[k + 1].t : t1);
      if (b <= a) return;
      if (p.v === null || !Number.isFinite(p.v)) na.push({ a, b }); else if (p.v > 0) on.push({ a, b });
    });
    const merge = (arr) => arr.reduce((acc, sg) => { const l = acc[acc.length - 1]; if (l && sg.a <= l.b + 1000) l.b = Math.max(l.b, sg.b); else acc.push({ ...sg }); return acc; }, []);
    return { on: merge(on), na: merge(na), known: pts.some((p) => p.v !== null && Number.isFinite(p.v)) };
  });
  const totals = raw.map((r) => r.on.reduce((a, sg) => a + (sg.b - sg.a), 0));
  const totTexts = totals.map((ms) => (ms > 0 ? formatDuration(ms) : '0'));
  const padL = Math.min(Math.round(W * 0.38), Math.max(56, Math.ceil(Math.max(...names.map((x) => x.length)) * fs * 0.56 + 12)));
  const padR = showDur ? Math.min(Math.round(W * 0.26), Math.ceil(Math.max(...totTexts.map((x) => x.length)) * fs * 0.56 + 12)) : 8;
  const padT = 4, padB = fs + 12, pw = W - padL - padR, ph = n * laneH + Math.max(0, n - 1) * gap, H = padT + ph + padB;
  const X = (t) => padL + ((t - t0) / (t1 - t0)) * pw;
  const seg = (sg) => ({ a: sg.a, b: sg.b, dur: sg.b - sg.a, x: +X(sg.a).toFixed(1), w: Math.max(1.5, +(X(sg.b) - X(sg.a)).toFixed(1)) });
  const lanes = config.series.map((s, i) => ({ name: names[i], fullName: full[i], color: seriesColor(s.color ?? 'on', i), y: padT + i * (laneH + gap), h: laneH, segs: raw[i].on.map(seg), na: raw[i].na.map(seg), known: raw[i].known, total: totals[i], totalText: totTexts[i] }));
  const xticks = []; let lastX = -1e9;
  for (const t of alignedTicks(t0, t1, hours)) { const x = +X(t).toFixed(1); if (x - lastX >= (W < 420 ? 50 : 58)) { xticks.push({ x, label: formatTimeLabel(t, lblRange(hours)) }); lastX = x; } }
  return { timeline: true, showDur, W, H, fs, padL, padR, padT, padB, pw, ph, t0, t1, hours, xticks, lanes, grid: [], hasRight: false, axisRight: false, series: lanes.map((l) => ({ name: l.name, color: l.color, points: [] })), empty: lanes.every((l) => !l.known) };
}

/** Ce se află la (x, y) în cronologie (coordonate SVG): bara, golul „indisponibil” sau intervalul oprit. null în afara rândurilor. */
export function timelineHit(m, x, y) {
  if (!m || !m.timeline) return null;
  const lane = m.lanes.find((l) => y >= l.y - 3 && y <= l.y + l.h + 3);
  if (!lane || x < m.padL || x > m.W - m.padR) return null;
  const at = (arr) => arr.find((s) => x >= s.x && x <= s.x + s.w);
  const rng = m.hours <= 24 ? '24h' : '7d', span = (s) => `${formatTimeLabel(s.a, rng)}–${formatTimeLabel(s.b, rng)} · ${formatDuration(s.dur)}`;
  const on = at(lane.segs), na = at(lane.na);
  if (on) return { x, text: `${lane.fullName} · ${t('Pornit')} ${span(on)}` };
  if (na) return { x, text: `${lane.fullName} · ${t('indisponibil')} ${span(na)}` };
  return { x, text: `${lane.fullName} · ${t('Oprit')} · ${formatTimeLabel(m.t0 + ((x - m.padL) / m.pw) * (m.t1 - m.t0), rng)}` };
}

function renderTimelineSvg(m) {
  const ticks = m.xticks.map((tk) => `<line class="grid" x1="${tk.x}" x2="${tk.x}" y1="${m.padT}" y2="${m.padT + m.ph}"/><text x="${tk.x}" y="${m.H - 4}" text-anchor="middle">${esc(tk.label)}</text>`).join('');
  const fit = (w, text) => w >= text.length * m.fs * 0.56 + 8;
  const rows = m.lanes.map((l) => {
    const bars = l.segs.map((s) => {
      const long = formatDuration(s.dur), short = durShort(s.dur), txt = !m.showDur ? '' : fit(s.w, long) ? long : fit(s.w, short) ? short : '';
      return `<rect class="on" x="${s.x}" y="${l.y}" width="${s.w}" height="${l.h}" rx="3"/>${txt ? `<text class="dur" x="${(s.x + s.w / 2).toFixed(1)}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="middle">${esc(txt)}</text>` : ''}`;
    }).join('');
    const gaps = l.na.map((s) => `<rect class="na" x="${s.x}" y="${l.y}" width="${s.w}" height="${l.h}" rx="3" fill="url(#ccu-na)"/>`).join('');
    return `<g class="lane" style="--sc:${esc(l.color)}"><text class="ln" x="${m.padL - 8}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="end">${esc(l.name)}</text><rect class="trk" x="${m.padL}" y="${l.y}" width="${m.pw}" height="${l.h}" rx="4"/>${gaps}${bars}${m.showDur ? `<text class="tot" x="${m.W - 6}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="end">${esc(l.totalText)}</text>` : ''}</g>`;
  }).join('');
  const defs = `<defs><pattern id="ccu-na" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#fbbf24" stroke-width="2" stroke-opacity=".55"/></pattern></defs>`;
  return `<svg class="ccu-graph timeline" viewBox="0 0 ${m.W} ${m.H}" width="${m.W}" height="${m.H}" role="img" aria-label="cronologie">${defs}${ticks}${rows}<line class="cursor" x1="0" x2="0" y1="${m.padT}" y2="${m.padT + m.ph}" opacity="0"/><g class="dots"></g></svg>`;
}

/** SVG-ul graficului (șir). Fără NaN: coordonatele vin din buildGraphModel. */
export function renderGraphSvg(m) {
  if (m.timeline) return renderTimelineSvg(m);
  const g = m.grid.map((r) => `<line class="grid" x1="${m.padL}" x2="${m.W - m.padR}" y1="${r.y}" y2="${r.y}"/>${m.axisRight ? `<text x="${m.W - m.padR + 6}" y="${r.y + 3.5}">${esc(r.label)}</text>` : `<text x="${m.padL - 6}" y="${r.y + 3.5}" text-anchor="end">${esc(r.label)}</text>`}${m.hasRight && r.right ? `<text x="${m.W - m.padR + 6}" y="${r.y + 3.5}">${esc(r.right)}</text>` : ''}`).join('');
  const x = m.xticks.map((t) => `<text x="${t.x}" y="${m.H - 4}" text-anchor="middle">${esc(t.label)}</text>`).join('');
  const s = m.series.map((se, i) => (se.line ? `<g class="ser" style="--sc:${esc(se.color)}">${se.kind === 'area' ? `<defs><linearGradient id="gr${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sc);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--sc);stop-opacity:0"/></linearGradient></defs><path class="area" style="fill:url(#gr${i})" d="${se.fill}"/>` : ''}<path class="line" d="${se.line}"/></g>` : '')).join('');
  return `<svg class="ccu-graph" viewBox="0 0 ${m.W} ${m.H}" width="${m.W}" height="${m.H}" role="img" aria-label="grafic">${g}${x}${s}<line class="cursor" x1="0" x2="0" y1="${m.padT}" y2="${m.padT + m.ph}" opacity="0"/><g class="dots"></g></svg>`;
}

/** Tot cardul (șir): titlu + file + grafic + legendă. */
export function renderGraphCard(config, m, state, opts = {}) {
  const tabs = config.tabs.length > 1 ? `<div class="ccu-tabs">${config.tabs.map((t, i) => `<button type="button" class="ccu-tab" data-tab="${i}" data-state="${rangeKey(t) === rangeKey(state.range) ? 'on' : 'off'}">${esc(tabLabel(t))}</button>`).join('')}</div>` : '';
  const legend = config.legend && !config.timeline && m.series.length > 1 ? `<div class="ccu-legend">${m.series.map((s) => `<span><i style="background:${esc(s.color)}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
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
