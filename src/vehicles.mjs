// src/vehicles.mjs — ccu-vehicle-card: termene ale mașinilor (RCA, ITP, rovinietă, revizie / ulei). Funcții PURE: normalizare, model, șablon HTML.
// Interacțiunea (alegerea datei, „schimbat acum”) e în cards.mjs (CcuVehicleCard).
import { t, intlLocale, getLang } from './i18n.mjs';
import { esc } from './render.mjs';
import { iconSvg } from './icons.mjs';
import { formatNumber } from './state.mjs';

const ID = /^[a-z_]+\.[a-z0-9_]+$/;
const DAY = 864e5;
const ok = (v) => typeof v === 'string' && ID.test(v);
const num = (v, d, lo, hi) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : d; };

/** Config → { vehicles, alert_days, alert_km, title, warnings }. Un document: dată (`entity`) sau km (`remaining` | `odometer` + `last_km` + `interval_km`). */
export function normalizeVehicles(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], vehicles = [];
  (Array.isArray(src.vehicles) ? src.vehicles : []).forEach((v, i) => {
    const o = v && typeof v === 'object' ? v : null;
    if (!o) { warnings.push(t('Mașina #{n} nu e un obiect.', { n: i + 1 })); return; }
    const documents = [];
    (Array.isArray(o.documents) ? o.documents : []).forEach((d, j) => {
      const x = d && typeof d === 'object' ? d : null;
      if (!x) return;
      const label = x.label ? String(x.label) : '';
      const base = { label, icon: x.icon ? String(x.icon) : '' };
      if (ok(x.remaining) || ok(x.odometer)) {
        const interval = num(x.interval_km, 10000, 1, 1000000);
        if (!ok(x.remaining) && !ok(x.last_km)) { warnings.push(t('Mașina „{v}”, documentul #{n}: pentru km trebuie „remaining” sau „odometer” + „last_km”.', { v: o.name || i + 1, n: j + 1 })); return; }
        documents.push({ ...base, kind: 'km', remaining: ok(x.remaining) ? x.remaining : '', odometer: ok(x.odometer) ? x.odometer : '', last_km: ok(x.last_km) ? x.last_km : '', interval_km: interval, alert_km: num(x.alert_km, 0, 0, 1000000) });
      } else if (ok(x.entity)) {
        documents.push({ ...base, kind: 'date', entity: x.entity });
      } else warnings.push(t('Mașina „{v}”, documentul #{n}: lipsește „entity” (o dată) sau „odometer” / „remaining” (km).', { v: o.name || i + 1, n: j + 1 }));
    });
    vehicles.push({ name: o.name ? String(o.name) : t('Mașina {n}', { n: i + 1 }), icon: o.icon ? String(o.icon) : 'mdi:car', plate: o.plate ? String(o.plate) : '', documents });
  });
  return { vehicles, title: src.title !== undefined ? String(src.title || '') : t('Mașini'), alert_days: num(src.alert_days, 3, 0, 365), alert_km: num(src.alert_km, 500, 0, 1000000), warnings };
}

/** O dată din starea unei entități: „2026-11-14”, un ISO cu oră sau o dată în alt format simplu. Necunoscut / nesetat (an < 2000) → null. */
export function parseDate(s) {
  const v = s === undefined || s === null ? '' : String(s).trim();
  if (!v || v === 'unknown' || v === 'unavailable' || v === 'none') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return null;
  const y = Number(m[1]);
  if (y < 2000) return null;
  const d = new Date(y, Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Zile întregi de la `now` (azi) până la `date`: pozitiv = în viitor, 0 = azi, negativ = expirat. */
export const daysUntil = (date, now) => Math.round((midnight(date).getTime() - midnight(now).getTime()) / DAY);

const plural = (n, one, many) => (n === 1 ? t(one) : t(many, { n: formatNumber(n) }));

/** Un document → { …, status: ok | soon | expired | unset, text, valueText, frac }. */
export function documentModel(doc, cfg, hass, now) {
  const S = (id) => (id && hass && hass.states ? hass.states[id] : undefined);
  const label = doc.label || (doc.kind === 'km' ? t('Ulei') : t('Document'));
  if (doc.kind === 'date') {
    const st = S(doc.entity), d = st ? parseDate(st.state) : null;
    if (!d) return { ...doc, label, status: 'unset', text: t('Setează data'), valueText: '—', days: null, frac: 0, editable: doc.entity.startsWith('input_datetime.') };
    const days = daysUntil(d, now);
    const status = days < 0 ? 'expired' : days <= cfg.alert_days ? 'soon' : 'ok';
    const text = days < 0 ? plural(-days, 'expirat de o zi', 'expirat de {n} zile') : days === 0 ? t('azi') : days === 1 ? t('mâine') : t('în {n} zile', { n: formatNumber(days) });
    return { ...doc, label, status, text, valueText: formatDate(d), days, frac: Math.max(0, Math.min(1, days / 365)), editable: doc.entity.startsWith('input_datetime.') };
  }
  // km: rămași direct dintr-o entitate, sau interval − (odometru − km la ultima schimbare)
  let left = null, target = null;
  const odo = doc.odometer && S(doc.odometer) ? Number(S(doc.odometer).state) : NaN;
  if (doc.remaining) { const n = Number(S(doc.remaining) && S(doc.remaining).state); left = Number.isFinite(n) ? n : null; if (left !== null && Number.isFinite(odo)) target = odo + left; }
  else { const l = Number(S(doc.last_km) && S(doc.last_km).state); if (Number.isFinite(odo) && Number.isFinite(l)) { target = l + doc.interval_km; left = target - odo; } }
  if (left === null) return { ...doc, label, status: 'unset', text: '—', valueText: '—', km: null, frac: 0, editable: false };
  const alertKm = doc.alert_km || cfg.alert_km;
  const status = left <= 0 ? 'expired' : left <= alertKm ? 'soon' : 'ok';
  const text = left < 0 ? t('depășit cu {n} km', { n: formatNumber(Math.round(-left)) }) : t('în {n} km', { n: formatNumber(Math.round(left)) });
  const editable = !doc.remaining && !!doc.last_km && doc.last_km.startsWith('input_number.') && !!doc.odometer;
  return { ...doc, label, status, text, valueText: target !== null ? t('la {n} km', { n: formatNumber(Math.round(target)) }) : '', km: left, frac: Math.max(0, Math.min(1, left / doc.interval_km)), editable };
}

export function formatDate(d) {
  if (getLang() === 'ro') return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
  try { return d.toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d.toISOString().slice(0, 10); }
}

const RANK = { expired: 3, soon: 2, ok: 1, unset: 0 };
/** Toate mașinile: documente cu stare, plus starea cea mai gravă pe mașină. */
export function buildVehiclesModel(config, hass, now) {
  const n = now || new Date();
  return config.vehicles.map((v, vi) => {
    const docs = v.documents.map((d, di) => ({ ...documentModel(d, config, hass, n), vi, di }));
    const worst = docs.reduce((a, d) => (RANK[d.status] > RANK[a] ? d.status : a), 'ok');
    return { ...v, vi, docs, status: docs.some((d) => d.status !== 'unset') ? worst : 'unset' };
  });
}

/** Ce se apropie sau a expirat (pentru chip și notificări): { vehicle, label, text, status }. */
export function dueDocuments(config, hass, now) {
  const out = [];
  for (const v of buildVehiclesModel(config, hass, now)) for (const d of v.docs) if (d.status === 'soon' || d.status === 'expired') out.push({ vehicle: v.name, label: d.label, text: d.text, status: d.status, days: d.days === undefined ? null : d.days, km: d.km === undefined ? null : d.km });
  return out.sort((a, b) => (a.status === b.status ? 0 : a.status === 'expired' ? -1 : 1));
}

/** Chip-ul „termene”: true sau { vehicles, alert_days, label, tap_action }; același format ca cardul. */
export function normalizeDeadlines(v) {
  if (!v || typeof v !== 'object') return null;
  const n = normalizeVehicles(v);
  return { ...n, title: '', label: v.label ? String(v.label) : '', tap_action: v.tap_action };
}

export function renderVehicles(config, hass, opts = {}) {
  const now = opts.now || new Date();
  const model = buildVehiclesModel(config, hass, now);
  const panels = model.map((v) => {
    const rows = v.docs.map((d) => {
      const ico = iconSvg(d.icon || (d.kind === 'km' ? 'wrench' : 'calendar'));
      const act = d.kind === 'date' ? (d.editable ? 'date' : '') : (d.editable ? 'km' : '');
      const input = act === 'date' ? `<input class="dp" type="date" data-vi="${d.vi}" data-di="${d.di}" aria-label="${esc(d.label)}">` : '';
      const btn = act === 'km' ? `<button type="button" class="now" data-act="km" data-vi="${d.vi}" data-di="${d.di}">${t('Schimbat acum')}</button>` : '';
      return `<div class="vd" data-state="${d.status}" data-vi="${d.vi}" data-di="${d.di}" data-editable="${act ? 1 : 0}"><span class="ccu-ico">${ico}</span><span class="nm">${esc(d.label)}<small>${esc(d.valueText)}</small></span><b>${esc(d.text)}</b>${btn}<span class="bar"><i style="width:${Math.round(d.frac * 100)}%"></i></span>${input}</div>`;
    }).join('');
    return `<div class="vh" data-state="${v.status}"><div class="hd"><span class="ccu-ico">${iconSvg(v.icon.replace(/^mdi:/, '') === 'car' ? 'car' : v.icon)}</span><b>${esc(v.name)}</b>${v.plate ? `<span class="pl">${esc(v.plate)}</span>` : ''}</div>${rows}</div>`;
  }).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-veh">${title}${panels}${notes}</div>`;
}
