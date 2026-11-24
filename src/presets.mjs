import { t } from './i18n.mjs';
// src/presets.mjs — presetările de culori. Valori pentru variabilele --ccu-* din theme.js.
// green = implicit; calm = ardezie + cyan/chihlimbar; contrast = mai multă diferență; mono = o singură culoare; warm = tonuri calde;
// light = „Light Breeze”. Utilizatorul poate suprascrie orice cu config.colors (accent, on, alert, ok, bg, text, line, muted).

export const PRESETS = {
  // green = „Calm Green” (implicit): bleumarin, verde = activ, albastru = info, portocaliu = atenție
  green:    { bg: '#0b1220', text: '#e6edf7', muted: '#94a3b8', accent: '#3b82f6', on: '#22c55e', alert: '#f59e0b', ok: '#22c55e', cool: '#60a5fa', heat: '#f4694b', series: '#34d399' },
  // calm = „Calm Slate”: ardezie, chihlimbar = activ, cyan = date, roșu = alertă
  calm:     { bg: '#152028', text: '#e6ecef', muted: '#69737b', accent: '#56aac2', on: '#d3a658', alert: '#b85758', ok: '#68a169', cool: '#5b9bd9', heat: '#d9644f', series: '#56aac2' },
  contrast: { bg: '#0b1217', text: '#ffffff', muted: '#8d99a1', accent: '#4cc9f0', on: '#ffc233', alert: '#ff5d5d', ok: '#4ade80', cool: '#5aa9ff', heat: '#ff6a4d', series: '#4cc9f0' },
  mono:     { bg: '#14181c', text: '#e8ebed', muted: '#6f777e', accent: '#c9d1d6', on: '#e8ebed', alert: '#d9d9d9', ok: '#c9d1d6', cool: '#c9d1d6', heat: '#c9d1d6', series: '#c9d1d6' },
  warm:     { bg: '#221a16', text: '#f1e7df', muted: '#8d7b6f', accent: '#d99a6c', on: '#e8b04a', alert: '#c4553f', ok: '#8aa66b', cool: '#6fa8d6', heat: '#e2634b', series: '#e8b04a' },
  // quiet-slate = „Quiet Slate”: gri-albăstrui calm, accente pastel (contrast ≥ 4,5:1, testat). Tinta stărilor mai discretă, fără glow (fx-*).
  // Paleta: BACKGROUND #171D25, SURFACE #202833, TILE #27313D, TEXT1 #E5EAF0, TEXT2 #B8C5D2, ON #9BCBB6, SELECTED #A5BFE2, ATTENTION #E0BD86, ALERT #E3A4A4.
  'quiet-slate': { bg: '#171d25', text: '#e5eaf0', muted: '#b8c5d2', accent: '#a5bfe2', on: '#9bcbb6', alert: '#e0bd86', ok: '#9bcbb6', cool: '#a5bfe2', heat: '#e3a4a4', series: '#84bceb',
    surface: '#202833', 'surface-2': '#27313d', line: 'rgba(255,255,255,.10)', 'fx-tint': '.55', 'fx-glow': '0', lamp: '#e0bd86', 'lamp-hi': '#efd7a6', danger: '#e88f8a',
    // fundal și contur de stare MĂSURATE (în loc de amestecul derivat): pornit = teal-gri discret, atenție = chihlimbar cald
    'sel-bg': 'linear-gradient(135deg, #2a5551, #264651)', 'sel-line': '#7fb8b2', 'sel-fg': '#eaf4f1',
    'on-bg': 'var(--ccu-gloss), linear-gradient(135deg, #2e484a, #273e42)', 'on-line': '#496666',
    'alert-bg': 'var(--ccu-gloss), linear-gradient(135deg, #4c4b42, #383a39)', 'alert-line': '#9e8c6d' },
  // cyberpunk = „Neon Glass”: fundal indigo foarte închis, sticlă cu gradient diagonal, cyan = pornit, magenta = selectat, chihlimbar = atenție, coral = pericol.
  // Paleta MĂSURATĂ din imaginile ChatGPT (kit-cyberpunk/README.md): BACKGROUND #0A0C17, CARD #12152C, #202449, #30326B, TEXT #D9DAF7, TEXT2 #9197C6, CYAN #5BB7C9, MAGENTA #BF6ABB, AMBER #E1BB5B, CORAL #CA6D7C.
  // `feat` = efectele pornite de temă (rim, mark, cut, streak, peak); se pot schimba cu `effects:` pe card. `font` + `font-css`: Exo 2 (cel mai apropiat de literele din imagini), cu rezervă Inter.
  cyberpunk: { bg: '#0a0c17', text: '#d9daf7', muted: '#9197c6', accent: '#5bb7c9', on: '#5bb7c9', alert: '#e1bb5b', ok: '#5bb7c9', cool: '#5bb7c9', heat: '#ca6d7c', series: '#9197c6',
    // suprafețe și umpleri MĂSURATE pe „Neon Smart Home UI Dashboard-1” (media stânga / dreapta a fiecărui element), fără stratul gloss (ar lumina tot)
    surface: '#1b1f35', 'surface-2': '#202449', line: 'rgba(160,166,205,.5)', 'fx-tint': '.5', 'fx-glow': '.5', lamp: '#e1bb5b', 'lamp-hi': '#f1d793', danger: '#ca6d7c', 'na-op': '.92', gloss: 'linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.01) 28%, rgba(255,255,255,0) 100%)',
    'na-bg': 'linear-gradient(180deg, #343854 0, #292d45 18%, #252940 100%)', 'xl-bg': 'linear-gradient(100deg, #1b2d3d 0, #182839 38%, #162033 100%)', 'chip-on-bg': 'linear-gradient(90deg, #1e3844, #192d3a)', 'chip-danger-bg': 'linear-gradient(90deg, #3d2a3b, #352637)', 'chip-bg': 'linear-gradient(90deg, #262a41, #20243a)', 'panel-bg': 'linear-gradient(100deg, #21233c 0, #1d1f38 45%, #181a30 100%)', 'l-on-bg': 'linear-gradient(90deg, #20404c 0, #1c3342 28%, #1d2a3d 62%, #1f293b 100%)', 'l-on-line': '#7fb5ba',
    'on-bg': 'linear-gradient(180deg, #2f5463 0, #1f3c48 8%, #18323d 35%, #17303b 100%)', 'on-line': '#7fb5ba',
    'alert-bg': 'linear-gradient(180deg, #4f443b 0, #373029 14%, #2f2a28 50%, #2c2726 100%)', 'alert-line': '#c9b690',
    'danger-bg': 'linear-gradient(180deg, #4d3649 0, #382838 16%, #2e2131 55%, #2b1f2e 100%)', 'danger-line': '#bd8a9c',
    'sel-bg': 'linear-gradient(90deg, #643f74, #523865)', 'sel-line': '#e0a6dc', 'sel-fg': '#f8e9f6',
    'sel-tile-bg': 'linear-gradient(180deg, #7d4686 0, #55325f 7%, #42284e 20%, #3a2446 55%, #3f2649 90%, #59305d 100%)',
    // colțuri MĂSURATE (în imagine, la scara 2×): tile 15px, chip și rând 18px, panou antet 16px, meniu 19px → în CSS ~jumătate
    r: '8px', 'r-card': '10px', 'chip-r': '9px',
    font: '"Exo 2","Inter","Segoe UI Variable","Segoe UI",system-ui,-apple-system,"Roboto",sans-serif', 'font-css': '/local/ccu/fonts/exo2/exo2.css',
    // bar și tile schimbă AȘEZAREA (meniu pe rând, tile cu separator): nu sunt pornite de temă — formatul rămâne ca la green; se adaugă cu `effects:`
    feat: 'rim mark cut streak peak plot' },
  // light = „Light Serenity” (varianta deschisă)
  light:    { bg: '#e9f0f7', text: '#14233a', muted: '#5b6b82', accent: '#2563eb', on: '#16a34a', alert: '#d97706', ok: '#16a34a', cool: '#2563eb', heat: '#dc4a2d', series: '#16a34a', surface: '#ffffff', 'surface-2': '#f1f5fa', line: 'rgba(20,40,70,.12)' },
};

export const PRESET_NAMES = Object.keys(PRESETS);

const KEYS = ['bg', 'text', 'muted', 'accent', 'on', 'alert', 'ok', 'cool', 'heat', 'series', 'line', 'surface', 'surface-2', 'muted-2', 'lamp', 'lamp-hi', 'danger'];
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const OK_COLOR = (v) => typeof v === 'string' && (HEX.test(v.trim()) || /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s\/-]+\)$/i.test(v.trim()) || /^var\(--[a-z0-9-]+\)$/i.test(v.trim()));

/**
 * Întoarce { vars, warnings }: vars = obiect `--ccu-*` → valoare, din preset + `colors` (valorile invalide se ignoră, cu avertisment).
 * Preset necunoscut → 'green' (implicit). Nu pune niciodată text arbitrar în CSS: doar culori verificate.
 */
export function presetVars(preset, colors) {
  const warnings = [];
  let name = typeof preset === 'string' ? preset.toLowerCase() : 'green';
  if (!PRESETS[name]) { if (preset !== undefined) warnings.push(t('Preset necunoscut "{v}" → "green".', { v: preset })); name = 'green'; }
  const merged = { ...PRESETS[name] };
  if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
    for (const [k0, v] of Object.entries(colors)) {
      const k = k0 === 'true' ? 'on' : k0; // YAML: cheia `on:` fără ghilimele ajunge „true”
      if (!KEYS.includes(k)) { warnings.push(t('Culoare necunoscută "{k}" ignorată.', { k })); continue; }
      if (!OK_COLOR(v)) { warnings.push(t('Culoarea "{k}" ("{v}") nu e validă — ignorată.', { k, v: String(v).slice(0, 30) })); continue; }
      merged[k] = v.trim();
    }
  }
  const vars = {};
  for (const [k, v] of Object.entries(merged)) vars['--ccu-' + k] = v;
  // preset deschis: umbră și suprafețe potrivite (theme.js le deduce din --ccu-bg, deci doar marcăm tema)
  return { vars, name, light: name === 'light', warnings };
}

/** Doar culorile date (fără preset): { vars: {'--ccu-on': '#…'}, warnings }. Pentru suprascrieri pe un singur element. */
export function colorVars(colors) {
  const vars = {}, warnings = [];
  if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
    for (const [k0, v] of Object.entries(colors)) {
      const k = k0 === 'true' ? 'on' : k0; // YAML: cheia `on:` fără ghilimele ajunge „true”
      if (!KEYS.includes(k)) { warnings.push(t('Culoare necunoscută "{k}" ignorată.', { k })); continue; }
      if (!OK_COLOR(v)) { warnings.push(t('Culoarea "{k}" nu e validă — ignorată.', { k })); continue; }
      vars['--ccu-' + k] = v.trim();
    }
  }
  return { vars, warnings };
}

/**
 * Aplică variabilele pe un element (style.setProperty) și marchează data-theme / data-preset.
 * La schimbarea temei (setConfig din nou, ex. în editorul vizual) scoate variabilele puse de tema / culorile de dinainte pe care cele noi nu le mai au
 * (altfel rămâneau: după `light`, suprafața albă rămânea și în `green`). Cele de aspect (LOOK_KEYS) le pune / scoate applyLook, imediat după.
 */
export function applyPreset(el, preset, colors) {
  const r = presetVars(preset, colors);
  const prev = el.__ccuPresetKeys;
  if (prev && el.style.removeProperty) for (const k of prev) if (!(k in r.vars) && !LOOK_KEYS.includes(k)) el.style.removeProperty(k);
  for (const [k, v] of Object.entries(r.vars)) el.style.setProperty(k, v);
  el.__ccuPresetKeys = Object.keys(r.vars);
  if (el.setAttribute) { el.setAttribute('data-preset', r.name); if (r.light) el.setAttribute('data-theme', 'light'); else el.removeAttribute?.('data-theme'); }
  return r.warnings;
}

// ---- aspect: mărime (scale) și rotunjire (radius) — opțiuni ale oricărui card ----
const LOOK_KEYS = ['--ccu-scale', '--ccu-r', '--ccu-r-card', '--ccu-fx-glow', '--ccu-font'];
const GLOW = { off: '0', soft: '0.5', full: '1' };
const toNum = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v.replace(',', '.')) : NaN);
/**
 * `scale`: 0,7–1,6 (1 = neschimbat) → --ccu-scale (aplicat ca `zoom` pe card, deci totul crește / scade proporțional).
 * `radius`: 0–32 px (rotunjirea colțurilor; implicit 14) → --ccu-r, iar panourile primesc ~1,3× (--ccu-r-card).
 * Întoarce { vars, warnings }; ce nu e valid se ignoră cu avertisment, ce e în afara intervalului se aduce la limită. Lipsa opțiunii = nu se pune nimic (aspect neschimbat).
 */
export function lookVars(cfg) {
  const vars = {}, warnings = [], src = cfg && typeof cfg === 'object' ? cfg : {};
  if (src.scale !== undefined) {
    const n = toNum(src.scale);
    if (!Number.isFinite(n)) warnings.push(t('Scala „{v}” nu e un număr — ignorată.', { v: String(src.scale).slice(0, 12) }));
    else {
      const c = Math.min(1.6, Math.max(0.7, n));
      if (c !== n) warnings.push(t('Scala {v} e în afara intervalului 0,7–1,6 → {c}.', { v: n, c }));
      if (c !== 1) vars['--ccu-scale'] = String(Math.round(c * 100) / 100);
    }
  }
  if (src.radius !== undefined) {
    const n = toNum(src.radius);
    if (!Number.isFinite(n)) warnings.push(t('Raza „{v}” nu e un număr — ignorată.', { v: String(src.radius).slice(0, 12) }));
    else {
      const c = Math.min(32, Math.max(0, Math.round(n)));
      if (c !== n) warnings.push(t('Raza {v} e în afara intervalului 0–32 → {c}.', { v: n, c }));
      vars['--ccu-r'] = c + 'px';
      vars['--ccu-r-card'] = Math.round(c * 1.3) + 'px';
    }
  }
  if (src.glow !== undefined) {
    const g = src.glow === false ? 'off' : src.glow === true ? 'full' : String(src.glow).toLowerCase();   // YAML: `off` → false, `on` → true
    if (g === 'auto') { /* ca în temă */ }
    else if (g in GLOW) vars['--ccu-fx-glow'] = GLOW[g];
    else warnings.push(t('Strălucirea „{v}” nu există (auto, off, soft, full) — ignorată.', { v: String(src.glow).slice(0, 12) }));
  }
  const fc = fontConfig(src), ec = effectsConfig(src);
  Object.assign(vars, fc.vars);
  warnings.push(...fc.warnings, ...ec.warnings);
  return { vars, warnings, fontCss: fc.css };
}

/** Pune (sau scoate, dacă nu mai e în config) variabilele de aspect pe un element; ce scoatem revine la valoarea presetării (ex. quiet-slate are --ccu-fx-glow: 0). Întoarce avertismentele. */
export function applyLook(el, cfg, preset) {
  const r = lookVars(cfg), base = presetVars(preset).vars;
  for (const k of LOOK_KEYS) {
    if (k in r.vars) el.style.setProperty(k, r.vars[k]);
    else if (k in base) el.style.setProperty(k, base[k]);
    else if (el.style.removeProperty) el.style.removeProperty(k);
  }
  ensureFontCss(r.fontCss || base['--ccu-font-css']);   // foaia de stil a fontului: din config, altfel a temei
  const feat = activeEffects(cfg, preset).join(' ');
  if (el.setAttribute) { if (feat) el.setAttribute('data-feat', feat); else el.removeAttribute && el.removeAttribute('data-feat'); }
  return r.warnings;
}

// ---- font: `font` (nume) și `font_css` (foaie de stil cu @font-face, din /local/…); implicit rămâne fontul temei ----
const FALLBACK_FONT = '"Inter","Segoe UI Variable","Segoe UI",system-ui,-apple-system,"Roboto",sans-serif';
/** Fonturile livrate cu ccu (folderul fonts/ din depozit → /config/www/ccu/fonts/): numele → foaia de stil implicită. */
export const BUNDLED_FONTS = { 'exo 2': { name: 'Exo 2', css: '/local/ccu/fonts/exo2/exo2.css' }, 'chakra petch': { name: 'Chakra Petch', css: '/local/ccu/fonts/chakra-petch/chakra-petch.css' }, oxanium: { name: 'Oxanium', css: '/local/ccu/fonts/oxanium/oxanium.css' } };
const OK_FONT_NAME = /^[A-Za-z0-9][A-Za-z0-9 ._-]{0,39}$/;
const OK_CSS_URL = /^(\/|https:\/\/)[^\s"'()<>\\]{1,300}$/;
/** Citește `font` / `font_css`: { vars: {'--ccu-font'}, css: url|'' , warnings }. Gol / auto = fontul temei. */
export function fontConfig(cfg) {
  const src = cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : {}, warnings = [], vars = {};
  let css = '';
  const f = src.font;
  if (f !== undefined && f !== null && f !== '' && String(f).toLowerCase() !== 'auto') {
    const key = String(f).trim().toLowerCase();
    if (BUNDLED_FONTS[key]) { vars['--ccu-font'] = `"${BUNDLED_FONTS[key].name}",${FALLBACK_FONT}`; css = BUNDLED_FONTS[key].css; }
    else if (typeof f === 'string' && OK_FONT_NAME.test(f.trim())) vars['--ccu-font'] = `"${f.trim()}",${FALLBACK_FONT}`;
    else warnings.push(t('Fontul „{v}” nu e valid (litere, cifre, spații) — ignorat.', { v: String(f).slice(0, 20) }));
  }
  if (src.font_css !== undefined && src.font_css !== null && src.font_css !== '') {
    if (typeof src.font_css === 'string' && OK_CSS_URL.test(src.font_css.trim())) css = src.font_css.trim();
    else warnings.push(t('font_css trebuie să fie o adresă care începe cu / sau https:// — ignorat.'));
  }
  return { vars, css, warnings };
}
const FONT_LINKS = new Set();
/** Adaugă o singură dată în pagină foaia de stil a fontului (@font-face nu merge în shadow DOM). Fără document (teste) nu face nimic. */
export function ensureFontCss(url) {
  if (!url || FONT_LINKS.has(url) || typeof document === 'undefined' || !document.head || !document.createElement) return false;
  FONT_LINKS.add(url);
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = url; l.setAttribute('data-ccu-font', '1');
  document.head.appendChild(l);
  return true;
}

// ---- efecte (rim, mark, cut, streak, peak): temele le pornesc prin `feat`; `effects:` pe card le schimbă ----
export const EFFECTS = ['rim', 'mark', 'cut', 'streak', 'peak', 'plot', 'bar', 'tile'];
/** `effects`: auto (ca în temă) | none | listă (sau text cu virgule / spații) din EFFECTS. Întoarce { list: [...]|null (null = ca în temă), warnings }. */
export function effectsConfig(cfg) {
  const src = cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : {}, warnings = [];
  const e = src.effects;
  if (e === undefined || e === null || e === '' || e === 'auto') return { list: null, warnings };
  if (e === false || e === 'none' || e === 'off') return { list: [], warnings };
  const raw = Array.isArray(e) ? e : typeof e === 'string' ? e.split(/[\s,]+/) : [];
  const list = [];
  for (const x of raw) {
    const k = String(x).trim().toLowerCase();
    if (!k) continue;
    if (EFFECTS.includes(k)) { if (!list.includes(k)) list.push(k); } else warnings.push(t('Efectul „{v}” nu există (rim, mark, cut, streak, peak, plot, bar, tile) — ignorat.', { v: String(x).slice(0, 12) }));
  }
  return { list, warnings };
}
/** Efectele care rămân pornite pe card: cele ale temei (`feat`) sau lista din `effects`. */
export function activeEffects(cfg, preset) {
  const r = effectsConfig(cfg);
  if (r.list) return r.list;
  const base = presetVars(preset).vars['--ccu-feat'];
  return typeof base === 'string' ? base.split(/\s+/).filter((x) => EFFECTS.includes(x)) : [];
}

// ---- mod noapte: reduce luminozitatea cardului după soare (sun.sun) sau după altă entitate; oprit implicit ----
/** Citește opțiunile `night`, `night_entity`, `night_dim` (procent de întunecare, 0–60, implicit 15). Config invalid nu aruncă. */
export function nightConfig(cfg) {
  const src = cfg && typeof cfg === 'object' && !Array.isArray(cfg) ? cfg : {};
  const warnings = [];
  let mode = 'off';
  if (src.night !== undefined) {
    const n = src.night === false ? 'off' : src.night === true ? 'auto' : String(src.night).toLowerCase();   // YAML: off → false, on → true
    if (n === 'off' || n === 'auto') mode = n;
    else warnings.push(t('Modul noapte „{v}” nu există (auto, off) — ignorat.', { v: String(src.night).slice(0, 12) }));
  }
  let entity = 'sun.sun';
  if (src.night_entity !== undefined) {
    if (typeof src.night_entity === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(src.night_entity)) entity = src.night_entity;
    else warnings.push(t('night_entity trebuie să fie un entity_id — folosesc sun.sun.'));
  }
  let dim = 15;
  if (src.night_dim !== undefined) {
    const n = Number(String(src.night_dim).replace(',', '.'));
    if (!Number.isFinite(n) || src.night_dim === '' || src.night_dim === null) warnings.push(t('night_dim trebuie să fie un număr (0–60) — folosesc 15.'));
    else { dim = Math.min(60, Math.max(0, Math.round(n))); if (dim !== n) warnings.push(t('night_dim e între 0 și 60 — am folosit {v}.', { v: dim })); }
  }
  return { mode, entity, dim, warnings };
}

/** Este noapte acum? sun.sun: below_horizon; altă entitate: on / night / below_horizon. Entitate lipsă → zi (nu întunecă). */
export function isNight(nc, hass) {
  if (!nc || nc.mode !== 'auto') return false;
  const s = hass && hass.states && hass.states[nc.entity];
  const v = s && String(s.state).toLowerCase();
  return v === 'below_horizon' || v === 'night' || (nc.entity !== 'sun.sun' && v === 'on');
}

/** Pune / scoate data-night și --ccu-night-op pe element. Întoarce true dacă e noapte. */
export function applyNight(el, nc, hass) {
  const on = isNight(nc, hass);
  if (on) { if (el.getAttribute('data-night') !== '1') el.setAttribute('data-night', '1'); el.style.setProperty('--ccu-night-op', String((100 - nc.dim) / 100)); }
  else { if (el.hasAttribute && el.hasAttribute('data-night')) el.removeAttribute('data-night'); if (el.style.removeProperty) el.style.removeProperty('--ccu-night-op'); }
  return on;
}
