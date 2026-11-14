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
  // light = „Light Serenity” (varianta deschisă)
  light:    { bg: '#e9f0f7', text: '#14233a', muted: '#5b6b82', accent: '#2563eb', on: '#16a34a', alert: '#d97706', ok: '#16a34a', cool: '#2563eb', heat: '#dc4a2d', series: '#16a34a', surface: '#ffffff', 'surface-2': '#f1f5fa', line: 'rgba(20,40,70,.12)' },
};

export const PRESET_NAMES = Object.keys(PRESETS);

const KEYS = ['bg', 'text', 'muted', 'accent', 'on', 'alert', 'ok', 'cool', 'heat', 'series', 'line', 'surface', 'surface-2', 'muted-2'];
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

/** Aplică variabilele pe un element (style.setProperty) și marchează data-theme / data-preset. */
export function applyPreset(el, preset, colors) {
  const r = presetVars(preset, colors);
  for (const [k, v] of Object.entries(r.vars)) el.style.setProperty(k, v);
  if (el.setAttribute) { el.setAttribute('data-preset', r.name); if (r.light) el.setAttribute('data-theme', 'light'); else el.removeAttribute?.('data-theme'); }
  return r.warnings;
}
