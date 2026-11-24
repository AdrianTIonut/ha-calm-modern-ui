import { t } from './i18n.mjs';
import { PRESET_NAMES } from './presets.mjs';
// src/config.mjs — validare și normalizare config pentru ccu-buttons-card

/**
 * Normalizează config-ul primit din HA. Returnează {config, warnings[]}.
 * Acceptă forma scurtă (entities: [entity_id]) sau lungă (entities: [{entity, name, ...}]).
 */
/** Texto din YAML, în siguranță: obiectele / NaN devin '' (nu „[object Object]” pe ecran). */
export const str = (v) => (v === null || v === undefined || typeof v === 'object' || (typeof v === 'number' && Number.isNaN(v)) ? '' : String(v));

export function normalizeConfig(cfg) {
  const warnings = [];

  // Validare inițială: cfg trebuie să fie obiect
  if (!cfg || typeof cfg !== 'object') {
    return {
      config: { entities: [] },
      warnings: [t('Configul nu este un obiect (gol sau tip incorect).')]
    };
  }

  // Extrage entitățile, fie din cfg.entities fie din prima proprie (pentru flexibilitate)
  let entities = Array.isArray(cfg.entities) ? cfg.entities : [];
  if (entities.length === 0 && cfg.entity) {
    entities = Array.isArray(cfg.entity) ? cfg.entity : [cfg.entity];
  }

  // Normalizare entități (scurt/lung format)
  const normalizedEntities = entities.map((e, idx) => normalizeEntity(e, idx));
  // normalizedEntities este array de {entity, warnings[]}
  let cleanEntities = [];
  for (const ne of normalizedEntities) {
    if (Array.isArray(ne.warnings)) {
      warnings.push(...ne.warnings);
    }
    // doar entitățile cu entity valid (sau entity_id setat) ajung în config
    if (ne.entity.entity) {
      cleanEntities.push(ne.entity);
    }
  }

  // Config final: completează implicit, păstrează ceea ce primește
  const config = {
    // implicite
    density: cfg.density ?? 'm',      // xs|s|m|l|xl
    preset: cfg.preset ?? 'green',     // vezi PRESET_NAMES (presets.mjs): green|calm|quiet-slate|contrast|mono|warm|light
    animations: normalizeAnimations(cfg.animations, warnings),
    columns: normalizeColumns(cfg.columns),

    // entități (normalizate)
    entities: cleanEntities,

    // alte setări opționale (nu le modificăm, le pasăm la render)
    title: cfg.title,
    theme: cfg.theme,
    // … altele (ex: refresh_minutes, tabs, colors, shape, size etc.) rămân nemodificate
  };

  // Validare densitate
  if (!['xs', 's', 'm', 'l', 'xl'].includes(config.density)) {
    config.density = 'm';
    warnings.push(t('Densitate necunoscută "{v}" → înlocuită cu "m".', { v: cfg.density }));
  }

  // Validare preset
  if (!PRESET_NAMES.includes(config.preset)) {
    config.preset = 'green';
    warnings.push(t('Preset necunoscut "{v}" → înlocuit cu "green".', { v: cfg.preset }));
  }

  // Validare columns (a fost deja normalizată, dar putem adăuga warning dacă s-a schimbat)
  if (config.columns !== cfg.columns && cfg.columns !== undefined) {
    warnings.push(t('Coloane "{v}" (neîntreg sau în afară intervalului 1–6) → setate la {c}.', { v: cfg.columns, c: config.columns }));
  }

  // Copiază TOATE cheile necunoscute din cfg (ex: colors, shape, size, header, refresh_minutes, tabs)
  for (const key of Object.keys(cfg)) {
    if (!['entities', 'entity', 'density', 'preset', 'animations', 'columns', 'title', 'theme'].includes(key)) {
      if (config[key] === undefined) {
        config[key] = cfg[key];
      }
    }
  }

  // Validare și normalizare shape (punct b): dacă invalid, -> 'chamfer' + warning
  if (config.shape !== undefined) {
    if (!['chamfer', 'round', 'pill', 'square'].includes(config.shape)) {
      warnings.push(t('Shape "{v}" (neacceptat) → setat la "chamfer".', { v: config.shape }));
      config.shape = 'chamfer';
    }
  }

  // ce se vede pe buton (la nivel de card)
  cleanContentOpts(config, warnings, t('Card'));

  // Setează size și shape implicite pentru entități (punct 8)
  // fără size → size = config.density
  // fără shape → shape = config.shape sau 'chamfer'
  const density = config.density;
  const shape = config.shape || 'chamfer';
  for (const ent of config.entities) {
    if (!ent.size) ent.size = density;
    if (!ent.shape) ent.shape = shape;
  }

  return { config, warnings };
}

/**
 * Opțiunile „ce se vede pe buton”: show_icon / show_name / show_value / show_state (true|false), state_style (dot|text), state_labels ({ on, off, alert, ok, unavailable }).
 * Se pot da pe card și pe fiecare buton. Valorile invalide se șterg, cu avertisment (cardul continuă cu implicitul).
 */
const CONTENT_FLAGS = ['show_icon', 'show_name', 'show_value', 'show_state', 'wave'];
const STATE_KEYS = ['on', 'off', 'alert', 'ok', 'unavailable'];
export function cleanContentOpts(obj, warnings, who) {
  for (const k of CONTENT_FLAGS) {
    if (obj[k] !== undefined && typeof obj[k] !== 'boolean') { warnings.push(t('{w}: „{k}” trebuie să fie true sau false — ignorat.', { w: who, k })); delete obj[k]; }
  }
  if (obj.state_style !== undefined && !['dot', 'text'].includes(obj.state_style)) { warnings.push(t('{w}: stilul stării „{v}” nu există (dot sau text) — ignorat.', { w: who, v: String(obj.state_style).slice(0, 20) })); delete obj.state_style; }
  if (obj.state_labels !== undefined) {
    const sl = obj.state_labels, ok = sl && typeof sl === 'object' && !Array.isArray(sl);
    if (!ok) { warnings.push(t('{w}: state_labels trebuie să fie un obiect cu texte (on, off, alert, ok, unavailable) — ignorat.', { w: who })); delete obj.state_labels; }
    else {
      const clean = {};
      for (const k of STATE_KEYS) if (typeof sl[k] === 'string' && sl[k].trim()) clean[k] = sl[k].trim().slice(0, 40);
      if (Object.keys(clean).length) obj.state_labels = clean; else delete obj.state_labels;
    }
  }
}

/**
 * Normalizare `animations`: true/false/'on'/'off' → boolean; altul → true + warning.
 */
function normalizeAnimations(v, warnings) {
  if (v === undefined || v === null) return true; // lipsă = implicit, fără avertisment
  if (typeof v === 'boolean') return v;
  if (v === 'on' || v === true) return true;
  if (v === 'off' || v === false) return false;
  // alt tip (ex: 'x', 5, [], etc.) → true + warning
  warnings.push(t('Animations "{v}" (neacceptat) → setate la true.', { v }));
  return true;
}

/**
 * Normalizare `columns`: întreg 1–6, altfel warning cu valoarea primită + implicit 2.
 */
function normalizeColumns(v) {
  if (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 6) {
    return v;
  }
  // alt tip sau în afară intervalului
  return 2; // implicit
}

/**
 * Normalizează o singură entitate (sau șir cu entity_id).
 * Returnează {entity, warnings[]}.
 */
function normalizeEntity(e, idx) {
  const warnings = [];
  let entity = {};

  // Forma scurtă (șir) → extinde în obiect
  if (typeof e === 'string') {
    entity = { entity: e };
  } else if (typeof e === 'object' && e !== null) {
    entity = { ...e };
  } else {
    // tip neșir/neobiect → se elimină din listă, cu warning
    warnings.push(t('Entitate #{n}: tip "{x}" ignorat.', { n: idx + 1, x: typeof e }));
    return { entity: {}, warnings };
  }

  // entity_id (obligatoriu) — poate fi entity sau id (alias)
  if (!entity.entity && entity.id) {
    entity.entity = entity.id;
  }
  if (!entity.entity) {
    // entitate fără entity_id
    warnings.push(t('Entitate #{n}: lipsește entity_id.', { n: idx + 1 }));
    return { entity: {}, warnings };
  }

  // Validare entity_id cu /^[a-z_]+\.[a-z0-9_]+$/
  const entityId = String(entity.entity);
  const entityIdPattern = /^[a-z_]+\.[a-z0-9_]+$/;
  if (!entityIdPattern.test(entityId)) {
    warnings.push(t('Entitate #{n} ({e}): entity_id invalid.', { n: idx + 1, e: entityId }));
    return { entity: {}, warnings };
  }

  // nume (implicit: entity_id fără prefix)
  if (!entity.name) {
    const id = entity.entity || `entity_${idx}`;
    entity.name = id.replace(/^[^.]+\./, '').replace(/_/g, ' ');
  }

  // icon (implicit: icon din entitate, dar pentru grafic vom pune placeholder)
  if (!entity.icon && entity.entity) {
    const domain = entity.entity.split('.')[0];
    entity.icon = domainIcon(domain);
  }

  // mărime (density per buton, suprascrie config-ul); dacă lipsește → null (se completează ulterior)
  if (!entity.size) {
    entity.size = null; // se va completa cu config.density
  } else if (!['xs', 's', 'm', 'l', 'xl'].includes(entity.size)) {
    warnings.push(t('Entitate "{e}": mărime "{v}" ignorată.', { e: entity.name, v: entity.size }));
    delete entity.size;
  }

  // formă (shape); dacă lipsește → null (se completează ulterior)
  if (!entity.shape) {
    entity.shape = null; // se va completa cu config.shape sau 'chamfer'
  } else if (!['chamfer', 'round', 'pill', 'square'].includes(entity.shape)) {
    warnings.push(t('Entitate "{e}": formă "{v}" ignorată.', { e: entity.name, v: entity.shape }));
    delete entity.shape;
  }

  // ce se vede pe acest buton (suprascrie cardul)
  cleanContentOpts(entity, warnings, entity.name);

  // secondary text: funcție sau șir (pentru viitor, când vom suporta template)
  // aici îl lăsăm așa cum e (interpretat ulterior în render sau state)

  // acțiuni (tap/hold/double_tap)
  ['tap_action', 'hold_action', 'double_tap_action'].forEach(k => {
    if (entity[k] && typeof entity[k] !== 'string') {
      // acceptă șir (ex: "toggle") sau obiect cu action: șir
      if (typeof entity[k] === 'object') {
        if (!entity[k].action) {
          warnings.push(t('Entitate "{e}": {k} fără "action".', { e: entity.name, k }));
        }
      }
    }
  });

  // culori (suprascriere CSS vars)
  if (entity.colors) {
    // acceptă obiect simplu, ex: { accent: "#ff0000" }
    if (typeof entity.colors === 'object' && !Array.isArray(entity.colors)) {
      // validare valori color (hex/nume)
      for (const [k, v] of Object.entries(entity.colors)) {
        if (typeof v !== 'string') {
          warnings.push(t('Entitate "{e}": culoare {k} nu este șir.', { e: entity.name, k }));
        }
      }
    } else {
      warnings.push(t('Entitate "{e}": culori neacceptate (doar obiect).', { e: entity.name }));
      delete entity.colors;
    }
  }

  return { entity, warnings };
}

/**
 * Mapare domeniu HA → iconiță implicită (pentru entități fără icon explicit).
 * Folosit la parsing config, nu depinde de theme.js.
 */
function domainIcon(domain) {
  const map = {
    light: 'mdi:lightbulb',
    switch: 'mdi:power-socket',
    fan: 'mdi:fan',
    lock: 'mdi:lock',
    cover: 'mdi:window-shutter',
    sensor: 'mdi:eye',
    binary_sensor: 'mdi:checkbox-marked',
    climate: 'mdi:thermostat',
    water_heater: 'mdi:water-heater',
    media_player: 'mdi:speaker',
    button: 'mdi:button-pointer',
    input_boolean: 'mdi:toggle-switch',
    input_button: 'mdi:button-pointer'
  };
  return map[domain] ?? 'mdi:ellipse-outline';
}

/**
 * Parsează acțiunea în obiect standard: { action, service, domain, entity_id, ... }.
 * Dacă obiect fără action și fără service → 'toggle' implicit;
 * call-service fără service → warning.
 */
export function normalizeAction(action) {
  if (!action) return { action: 'none' };
  if (typeof action === 'string') {
    return { action };
  }
  if (typeof action === 'object') {
    const a = { ...action };
    if (!a.action && !a.service) {
      a.action = 'toggle'; // implicit
    } else if (!a.action && (a.service || a.perform_action)) {
      a.action = 'call-service';
    }
    return a;
  }
  return { action: 'none' };
}

/**
 * validează o acțiune și returnează warnings (string[]).
 * Se folosește în config pentru validarea tap/hold/double_tap.
 */
function validateAction(a) {
  const warnings = [];
  if (!a) return warnings;

  const action = typeof a === 'object' ? a : { action: a };

  if (typeof action === 'object') {
    if (action.action === 'call-service' && !action.service && !action.perform_action) {
      warnings.push(t('call-service fără service.'));
    }
    // obiect fără action și fără service → 'toggle' implicit (nu generează warning)
  }
  return warnings;
}

// Export pentru testare (funcțiile neexportate direct)
/**
 * Dispozitivul: „phone” când latura mică a ecranului e sub 600 px (indiferent de orientare), altfel „tablet” (și PC / iPad).
 * `override` = „phone” | „tablet” (opțiunea `device:` a cardului) ocolește detectarea.
 */
export function deviceKind(override) {
  if (override === 'phone' || override === 'tablet') return override;
  const s = typeof screen !== 'undefined' && screen ? screen : null;
  return s && Math.min(s.width || 9999, s.height || 9999) < 600 ? 'phone' : 'tablet';
}

/** `motion`: auto | full | calm | off (altceva → auto). `weather_effects` / `flow_animation`: auto | on | off. */
const MOTION_VALUES = ['auto', 'full', 'calm', 'off'];
function normalizeMotion(v) { const s = String(v === undefined || v === null ? 'auto' : v).toLowerCase(); return MOTION_VALUES.includes(s) ? s : 'auto'; }
function normalizeSwitch(v) { const s = String(v === undefined || v === null ? 'auto' : v).toLowerCase(); return s === 'on' || s === 'true' ? 'on' : s === 'off' || s === 'false' ? 'off' : 'auto'; }

/**
 * Cât de mult se mișcă cardul. `narrow` = ecran de telefon (latura mică < 600 px).
 * motion: full (animații continue) | calm (câteva secunde, apoi static până la o nouă schimbare) | off | auto (tabletă/PC → full, telefon → calm).
 * `animations: false` = off peste tot. weather_effects / flow_animation: on = full, off = off, auto = ca motion.
 * Întoarce { anim, fx, flow }, fiecare 'full' | 'calm' | 'off'.
 */
export function resolveMotion(cfg, narrow) {
  const c = cfg && typeof cfg === 'object' ? cfg : {};
  if (c.animations === false || c.animations === 'off') return { anim: 'off', fx: 'off', flow: 'off' };
  const m = normalizeMotion(c.motion);
  const base = m === 'auto' ? (narrow ? 'calm' : 'full') : m;
  const pick = (v) => { const s = normalizeSwitch(v); return s === 'on' ? 'full' : s === 'off' ? 'off' : base; };
  return { anim: base, fx: pick(c.weather_effects), flow: pick(c.flow_animation) };
}

export { normalizeEntity, domainIcon, normalizeAnimations, normalizeColumns, validateAction, normalizeMotion, normalizeSwitch };
