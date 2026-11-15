// src/editor.mjs — editorul vizual al cardurilor (fără YAML). Folosește componentele HA (`ha-form`, selectoare de entități, de iconițe).
// Partea pură (conversii de config, detectare automată) e exportată și testată în Node; clasele DOM se creează doar în browser, prin defineEditors().
import { t, setLang } from './i18n.mjs';
import { discoverBatteries } from './energy.mjs';

// ---------- logică pură ----------
/** Scoate valorile goale (șir gol, listă goală, false, undefined) dintr-un obiect de config. */
export function cleanObj(o) {
  const r = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length)) continue;
    r[k] = v;
  }
  return r;
}

/** Un obiect cu doar `entity` devine șir (YAML mai scurt); fără entitate → null (nu se scrie în config). */
export function compactSource(o) {
  const c = cleanObj(o);
  if (!c.entity) return null;
  return Object.keys(c).length === 1 ? c.entity : c;
}

const asArr = (v) => (Array.isArray(v) ? v.slice() : v ? [v] : []);

/** Consumator din config → datele formularului (entity = un senzor; entities = suma mai multor; subtract = ce se scade). */
export function consumerToForm(c) {
  const o = typeof c === 'string' ? { entity: c } : { ...(c || {}) };
  return { name: o.name || '', icon: o.icon || '', entity: o.entity || '', entities: asArr(o.entities), subtract: asArr(o.subtract) };
}
/** Datele formularului → consumator din config (păstrează câmpurile necunoscute ale originalului, ex. hide_idle). */
export function consumerFromForm(f, orig) {
  const base = typeof orig === 'object' && orig ? { ...orig } : {};
  delete base.entity; delete base.entities; delete base.subtract; delete base.name; delete base.icon;
  const sum = asArr(f.entities).filter(Boolean);
  const o = { name: f.name, icon: f.icon, subtract: asArr(f.subtract).filter(Boolean) };
  if (sum.length) o.entities = sum; else o.entity = f.entity;
  return { ...base, ...cleanObj(o) }; // câmpurile necunoscute editorului (ex. hide_idle: false) rămân exact cum erau
}

/** Entitatea principală a unui consumator (pentru a decide dacă rândul e completat). */
export const consumerReady = (c) => !!(c && (c.entity || (Array.isArray(c.entities) && c.entities.length)));

/**
 * Ghicește senzorii de energie din HA după unitate (W / kW) și nume. Întoarce doar ce a găsit:
 * { solar, grid, battery, soc, hint: { solar: [..], ... } }. Folosit de butonul „Detectează automat”.
 */
export function detectEnergy(states) {
  const list = Object.entries(states || {}).filter(([id]) => id.startsWith('sensor.')).map(([id, s]) => {
    const a = (s && s.attributes) || {};
    return { id, name: String(a.friendly_name || id).toLowerCase(), unit: String(a.unit_of_measurement || ''), dc: a.device_class || '' };
  });
  const isPower = (x) => x.dc === 'power' || /^k?W$/.test(x.unit);
  const isPct = (x) => x.unit === '%' || x.dc === 'battery';
  const key = (x) => (x.id + ' ' + x.name).toLowerCase();
  const pick = (cands, good, bad) => {
    const scored = cands.filter((x) => !(bad && bad.test(key(x)))).map((x) => {
      let sc = 0; const k = key(x);
      for (const [re, w] of good) if (re.test(k)) sc += w;
      return { x, sc };
    }).filter((r) => r.sc > 0).sort((a, b) => b.sc - a.sc || a.x.id.length - b.x.id.length);
    return scored.length ? scored.map((r) => r.x.id) : [];
  };
  const power = list.filter(isPower), pct = list.filter(isPct);
  const solar = pick(power, [[/solar|pv|fotovolt|panou/, 3], [/total/, 1], [/power|putere/, 1]], /today|daily|zilnic|lunar|monthly|import|export|grid|battery|baterie|load|consum|phase|faza/);
  const grid = pick(power, [[/power_meter|contor|smart_meter|grid|re[tț]ea/, 3], [/active/, 1], [/power|putere/, 1]], /solar|pv|battery|baterie|phase|faza|load|consum|today|daily/);
  const battery = pick(power, [[/batter|baterie/, 3], [/power|putere/, 1]], /today|daily|solar|pv|grid|load|charge_|discharge_|limit|max/);
  const soc = pick(pct, [[/batter|baterie|soc/, 3], [/(^|_)soc$/, 2], [/\.(\w+_)?battery$/, 2]], /phone|tablet|ipad|telefon|audi|car|remote|mouse|sensor_battery|soh|health|limit|battery_\d|_pack|_cell/);
  const r = { hint: { solar, grid, battery, soc } };
  if (solar[0]) r.solar = solar[0];
  if (grid[0]) r.grid = grid[0];
  if (battery[0]) r.battery = battery[0];
  if (soc[0]) r.soc = soc[0];
  return r;
}

// ---------- DOM (doar în browser) ----------
const CSS = `
:host { display: block; }
.ed { display: grid; gap: 14px; }
.blk { border: 1px solid var(--divider-color, #444); border-radius: 12px; padding: 12px 14px; background: var(--card-background-color, transparent); }
.blk > h3 { margin: 0 0 8px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.blk > h3 small { font-weight: 400; color: var(--secondary-text-color); }
.hint { color: var(--secondary-text-color); font-size: 12px; margin: 0 0 8px; line-height: 1.4; }
.row { border: 1px solid var(--divider-color, #444); border-radius: 10px; padding: 8px 10px; margin-top: 8px; }
.row .bar { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.row .bar b { flex: 1; font-size: 13px; }
button.mini { border: 1px solid var(--divider-color, #555); background: transparent; color: var(--primary-text-color); border-radius: 8px; min-width: 32px; height: 32px; cursor: pointer; font-size: 14px; }
button.mini:disabled { opacity: .35; cursor: default; }
button.add, button.auto { margin-top: 10px; border: 1px dashed var(--primary-color, #03a9f4); background: transparent; color: var(--primary-color, #03a9f4); border-radius: 10px; padding: 8px 14px; cursor: pointer; font-size: 13px; }
button.auto { margin: 0; border-style: solid; }
details { margin-top: 6px; } summary { cursor: pointer; font-size: 12px; color: var(--secondary-text-color); padding: 4px 0; }
.found { font-size: 12px; color: var(--secondary-text-color); margin-top: 6px; }
`;

/** Încarcă componentele HA folosite de editor (selectoarele de entități / iconițe se încarcă leneș). */
async function ensureHaParts() {
  try {
    if (customElements.get('ha-entity-picker') && customElements.get('ha-icon-picker')) return;
    const helpers = await window.loadCardHelpers?.();
    const c = helpers && await helpers.createCardElement({ type: 'entities', entities: [] });
    if (c && c.constructor && c.constructor.getConfigElement) await c.constructor.getConfigElement();
  } catch (e) { /* editorul merge și fără: câmpurile devin text */ }
}

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k);   // listele din liste (blocuri opționale) se aplatizează complet
  return el;
}

// selectoare uzuale pentru ha-form
const ENT = (o) => ({ entity: { ...(o || {}) } });
const SENSOR = (o) => ({ entity: { domain: 'sensor', ...(o || {}) } });
const TXT = { text: {} };
const ICON = { icon: {} };
const BOOL = { boolean: {} };
const NUM = (min, max, step) => ({ number: { min, max, step: step || 1, mode: 'box' } });
const SEL = (values, multiple) => ({ select: { mode: 'dropdown', multiple: !!multiple, options: values.map((v) => (typeof v === 'string' ? { value: v, label: v } : v)) } });
const ACTION = { ui_action: {} };
const COLORS = ['green', 'yellow', 'orange', 'blue', 'cyan', 'red', 'white'];
const grid = (...fields) => ({ type: 'grid', name: '', schema: fields });
const names = (schema) => schema.flatMap((s) => (s.type === 'grid' ? names(s.schema) : [s.name]));
const isEmpty = (v) => v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length);
const pick = (o, keys) => { const r = {}; for (const k of keys) if (o && o[k] !== undefined) r[k] = o[k]; return r; };

export function defineEditors() {
  if (typeof HTMLElement === 'undefined' || typeof customElements === 'undefined') return;

  class CcuEditor extends HTMLElement {
    constructor() { super(); this._cfg = {}; this._hass = null; this._root = this.attachShadow({ mode: 'open' }); this._ready = false; this._rows = {}; this._last = ''; }
    setConfig(c) {
      const j = JSON.stringify(c || {});
      // HA ne dă înapoi config-ul emis, dar ASINCRON: la o tastare rapidă ecoul primei litere ajunge după a treia. Ignorăm orice config pe care l-am trimis noi
      // (nu doar ultimul), altfel ecoul vechi suprascrie ce ai scris, editorul se redesenează și cursorul se pierde.
      if (j === this._last || (this._sent || []).includes(j)) return;
      this._last = j; this._cfg = JSON.parse(j); this._rows = {}; this._init();
    }
    set hass(hass) { this._hass = hass; setLang(hass); this._root.querySelectorAll('ha-form').forEach((f) => { f.hass = hass; }); }
    get hass() { return this._hass; }
    async _init() { if (!this._ready) { this._ready = true; await ensureHaParts(); } this._draw(); }
    _emit() {
      const j = JSON.stringify(this._cfg);
      if (j === this._last) return;   // nimic nou (un formular poate emite de mai multe ori pe aceeași tastă)
      this._last = j; (this._sent = this._sent || []).push(j); if (this._sent.length > 40) this._sent.shift();
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: JSON.parse(j) }, bubbles: true, composed: true }));   // o copie: HA nu poate modifica starea noastră
    }
    _style() { const s = document.createElement('style'); s.textContent = CSS; return s; }
    _friendly(id) { const s = this._hass && this._hass.states && this._hass.states[id]; return (s && s.attributes && s.attributes.friendly_name) || ''; }

    /** Un formular HA: schema + date; `labels` / `helpers` după numele câmpului. Nu redesenează la modificare. */
    _form(schema, data, labels, onChange, helpers) {
      const f = document.createElement('ha-form');
      f.hass = this._hass; f.schema = schema; f.data = data;
      f.computeLabel = (s) => (labels && labels[s.name]) || s.name;
      f.computeHelper = (s) => (helpers && helpers[s.name]) || '';
      // ha-form e „controlat”: dacă nu-i dăm înapoi valoarea nouă, la următoarea actualizare a lui `hass` (HA o trimite des) câmpul revine la valoarea veche și se pierd literele tastate
      f.addEventListener('value-changed', (e) => { e.stopPropagation(); const v = e.detail.value || {}; f.data = v; onChange(v); });
      return f;
    }
    _obj(path, create) { let o = this._cfg; for (const p of path) { if (!o[p] || typeof o[p] !== 'object') { if (!create) return {}; o[p] = {}; } o = o[p]; } return o; }
    /** Scrie (sau șterge, dacă e gol) o cheie din config; `keepFalse` păstrează `false` (opțiuni care sunt implicit „da”). */
    _set(path, key, v, keepFalse) {
      const o = this._obj(path, true);
      if (isEmpty(v) && !(keepFalse && v === false)) delete o[key]; else o[key] = v;
      if (path.length && !Object.keys(o).length) { const parent = this._obj(path.slice(0, -1), true), last = path[path.length - 1]; if (path.length === 1 && (last === 'low_batteries' || last === 'auto' || last === 'deadlines')) parent[last] = true; else delete parent[last]; }
      this._emit();
    }
    /** Bloc cu un formular legat de cheile unui obiect din config (rădăcina sau o sub-cheie, ex. ['sensors']). */
    _fields(path, title, hint, schema, labels, helpers, opts) {
      const o = opts || {}, keys = names(schema), keepFalse = new Set(o.defTrue || []);
      const form = this._form(schema, pick(this._obj(path), keys), labels, (v) => { for (const k of keys) this._set(path, k, v[k], keepFalse.has(k)); }, helpers);
      const body = [hint ? h('p', { class: 'hint', text: hint }) : null, form];
      if (o.collapsed) return h('details', { class: 'blk', open: keys.some((k) => !isEmpty(this._obj(path)[k])) }, h('summary', { text: title }), body);
      return h('div', { class: 'blk' }, title ? h('h3', {}, title) : null, body);
    }
    /** Listă repetabilă (rânduri cu ↑ ↓ ✕ și „Adaugă”); rândul gol nu se scrie în config până nu e completat. */
    _listBlock(key, title, hint, max, addLabel, rowLabel, rowBuilder, isReady, path, toConfig) {
      const P = path || [], id = P.join('.') + '/' + key;
      if (!this._rows[id]) { const cur = this._obj(P)[key]; this._rows[id] = (Array.isArray(cur) ? cur : []).slice(); }
      const L = this._rows[id];
      const save = () => {
        const arr = L.filter(isReady).map((x) => (toConfig ? toConfig(x) : x));
        const o = this._obj(P, true);
        if (arr.length) o[key] = arr; else { delete o[key]; if (P.length && !Object.keys(o).length) delete this._obj(P.slice(0, -1), true)[P[P.length - 1]]; }
        this._emit();
      };
      const wrap = h('div', { class: 'blk' }, h('h3', {}, title, h('small', { text: L.length + ' / ' + max })), hint ? h('p', { class: 'hint', text: hint }) : null);
      L.forEach((item, i) => {
        const reset = () => { Object.keys(this._rows).forEach((k) => { if (k.startsWith(key + '.')) delete this._rows[k]; }); };   // listele din interiorul rândurilor se reiau din config
        const move = (d) => () => { const j = i + d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; save(); reset(); this._draw(); };
        const del = () => { L.splice(i, 1); save(); reset(); this._draw(); };
        const o = typeof item === 'string' ? { entity: item } : item;
        const label = (o && (o.name || o.label)) || (o && o.entity && this._friendly(o.entity)) || rowLabel + ' ' + (i + 1);
        wrap.append(h('div', { class: 'row' },
          h('div', { class: 'bar' }, h('b', { text: label }),
            h('button', { class: 'mini', type: 'button', 'aria-label': t('Mută în sus'), disabled: i === 0, onclick: move(-1), text: '↑' }),
            h('button', { class: 'mini', type: 'button', 'aria-label': t('Mută în jos'), disabled: i === L.length - 1, onclick: move(1), text: '↓' }),
            h('button', { class: 'mini', type: 'button', 'aria-label': t('Șterge'), onclick: del, text: '✕' })),
          rowBuilder(o, i, (v) => { L[i] = v; save(); })));
      });
      if (L.length < max) wrap.append(h('button', { class: 'add', type: 'button', onclick: () => { L.push({}); this._draw(); }, text: '+ ' + addLabel }));
      return wrap;
    }
    /**
     * Listă de obiecte editate cu formulare declarative. `forms` = [{ schema, labels, helpers, details?: titlu }]; fiecare formular
     * modifică doar cheile lui (restul cheilor rândului, necunoscute editorului, rămân neatinse). Un rând doar cu `entity` devine șir.
     */
    _items(key, o) {
      const forms = o.forms, ready = o.ready || ((x) => !!(x && x.entity));
      const rowBuilder = (item, i, onChange) => [...forms.map((fm) => {
        const ks = names(fm.schema), keep = new Set(fm.defTrue || []);
        const f = this._form(fm.schema, pick(item, ks), fm.labels, (v) => {
          const next = { ...item };
          for (const k of ks) { if (isEmpty(v[k]) && !(keep.has(k) && v[k] === false)) delete next[k]; else next[k] = v[k]; }
          Object.keys(item).forEach((k) => delete item[k]); Object.assign(item, next);
          onChange(item);
        }, fm.helpers);
        return fm.details ? h('details', { open: ks.some((k) => !isEmpty(item[k])) }, h('summary', { text: fm.details }), f) : f;
      }), ...(o.extra ? [].concat(o.extra(item, i) || []) : [])];
      return this._listBlock(key, o.title, o.hint, o.max, o.addLabel, o.rowLabel, rowBuilder, ready, o.path, (x) => (o.compact !== false && Object.keys(x).length === 1 && x.entity ? x.entity : x));
    }
    /** Dispozitivele pe baterii găsite în HA, ca opțiuni pentru „Ignoră” (valoarea = entity_id; se pot scrie și cuvinte). */
    _batteryIgnore() {
      const names = (this._cfg.low_batteries && this._cfg.low_batteries.names) || (this._cfg.auto && this._cfg.auto.names) || {};
      const rows = discoverBatteries(this._hass, { mobile: false, unavailable: true, names });
      const options = rows.map((r) => ({ value: r.entity, label: r.name + (r.pct === null ? '' : ' · ' + Math.round(r.pct) + '%') }));
      for (const v of [].concat((this._cfg.low_batteries && this._cfg.low_batteries.exclude) || [], (this._cfg.auto && this._cfg.auto.exclude) || [])) if (v && !options.some((o) => o.value === v)) options.push({ value: v, label: v });
      return { select: { mode: 'dropdown', multiple: true, custom_value: true, options } };
    }
    /** Comutator pentru o funcție opțională a cardului, salvată ca `true` sau ca obiect cu opțiuni (ex. low_batteries, auto). */
    _feature(key, title, hint, onLabel, optionsBuilder) {
      const c = this._cfg, on = !!c[key];
      return h('div', { class: 'blk' },
        h('h3', {}, this._form([{ name: 'on', selector: BOOL }], { on }, { on: onLabel }, (v) => { if (v.on && !c[key]) c[key] = true; else if (!v.on) delete c[key]; this._emit(); this._draw(); })),
        on ? [hint ? h('p', { class: 'hint', text: hint }) : null, optionsBuilder()] : null);
    }
    /** Mașinile și documentele lor (listă în listă): `path` = [] pentru card, ['deadlines'] pentru chip. */
    _vehiclesBlock(path) {
      const P = path || [];
      const docForms = () => [
        { schema: [grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'entity', selector: ENT({ domain: ['input_datetime', 'sensor'] }) }], labels: { label: t('Document'), icon: t('Iconiță'), entity: t('Data de expirare') }, helpers: { entity: t('Un helper „dată” (se poate modifica din card) sau un senzor cu dată, ex. revizia din mașină.') } },
        { details: t('Pentru kilometri (ulei, revizie)'), schema: [{ name: 'odometer', selector: SENSOR() }, { name: 'last_km', selector: ENT({ domain: 'input_number' }) }, { name: 'remaining', selector: SENSOR() }, { name: 'interval_km', selector: NUM(1, 1000000, 100) }],
          labels: { odometer: t('Kilometraj (senzor)'), last_km: t('Kilometri la ultima schimbare (număr)'), remaining: t('sau: kilometri rămași (senzor)'), interval_km: t('Interval (km)') }, helpers: { last_km: t('Cu butonul „Schimbat acum” de pe card primește kilometrajul curent.') } },
      ];
      return this._items('vehicles', { path: P, title: t('Mașini'), hint: t('Fiecare mașină are documentele ei: RCA, ITP, rovinietă, revizie / ulei.'), max: 6, addLabel: t('Adaugă mașină'), rowLabel: t('Mașină'), compact: false, ready: (x) => !!(x && x.name),
        forms: [{ schema: [grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'plate', selector: TXT }], labels: { name: t('Nume'), icon: t('Iconiță'), plate: t('Număr de înmatriculare (opțional)') } }],
        extra: (item, i) => (item && item.name ? this._items('documents', { path: P.concat(['vehicles', String(i)]), title: t('Documente'), hint: '', max: 10, addLabel: t('Adaugă document'), rowLabel: t('Document'), compact: false, ready: (x) => !!(x && (x.entity || x.odometer || x.remaining)), forms: docForms() }) : h('p', { class: 'hint', text: t('Scrie numele mașinii ca să poți adăuga documente.') })) });
    }
    /** Blocul „Aspect și limbă” (preset, limbă), comun tuturor cardurilor. */
    _common() {
      const c = this._cfg, type = String(c.type || '');
      const mv = [{ value: 'auto', label: t('Automat (tabletă: complet, telefon: calm)') }, { value: 'full', label: t('Complet (animații continue)') }, { value: 'calm', label: t('Calm (câteva secunde, apoi static)') }, { value: 'off', label: t('Oprit') }];
      const sw = [{ value: 'auto', label: t('Ca mișcarea cardului') }, { value: 'on', label: t('Mereu pornit') }, { value: 'off', label: t('Oprit') }];
      const fields = [{ name: 'motion', selector: SEL(mv) }];
      const labels = { preset: t('Temă'), language: t('Limbă'), motion: t('Mișcare (economie de baterie)'), weather_effects: t('Efecte vreme (ploaie, nori)'), flow_animation: t('Animația fluxului') };
      const keys = ['preset', 'language', 'motion'];
      if (type.includes('weather')) { fields.push({ name: 'weather_effects', selector: SEL(sw) }); keys.push('weather_effects'); }
      if (type.includes('flow')) { fields.push({ name: 'flow_animation', selector: SEL(sw) }); keys.push('flow_animation'); }
      return h('details', { class: 'blk', open: !!(c.preset || c.language || c.motion) }, h('summary', { text: t('Aspect și limbă') }),
        this._form([grid({ name: 'preset', selector: SEL(['green', 'calm', 'contrast', 'mono', 'warm', 'light']) }, { name: 'language', selector: SEL(['en', 'ro']) }), ...fields], { motion: 'auto', weather_effects: 'auto', flow_animation: 'auto', ...pick(c, keys) },
          labels, (v) => { this._set([], 'preset', v.preset); this._set([], 'language', v.language); for (const k of keys.slice(2)) this._set([], k, v[k] === 'auto' ? '' : v[k]); }));
    }
    _draw() { this._root.replaceChildren(this._style(), h('div', { class: 'ed' }, this._body(), this._common())); }
    _body() { return []; }
  }

  // ======================= flux =======================
  class CcuFlowEditor extends CcuEditor {
    constructor() { super(); this._open = {}; this._found = ''; }
    _body() {
      const c = this._cfg, o = (k) => (typeof c[k] === 'string' ? { entity: c[k] } : { ...(c[k] || {}) });
      for (const k of ['solar', 'grid', 'battery']) if (this._open[k] === undefined) this._open[k] = !!(c[k] && (typeof c[k] === 'string' || c[k].entity));
      const set = (k, patch) => { const v = compactSource({ ...o(k), ...patch }); if (v) c[k] = v; else delete c[k]; this._emit(); };
      const SRC_MORE = [{ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }];
      const LBL = { entity: t('Senzor de putere'), name: t('Nume afișat'), icon: t('Iconiță') };
      const src = (k, title, hint, schema, labels, helpers) => h('div', { class: 'blk' },
        h('h3', {}, this._form([{ name: 'on', selector: BOOL }], { on: this._open[k] }, { on: title }, (v) => { this._open[k] = !!v.on; if (!v.on) { delete c[k]; this._emit(); } this._draw(); })),
        this._open[k] ? [h('p', { class: 'hint', text: hint }), this._form(schema, o(k), labels, (v) => set(k, v), helpers),
          h('details', { open: !!(o(k).name || o(k).icon) }, h('summary', { text: t('Personalizare: nume și iconiță') }), this._form(SRC_MORE, o(k), LBL, (v) => set(k, v)))] : null);
      return [
        h('div', { class: 'blk' },
          h('h3', {}, t('Titlu')),
          this._form([{ name: 'title', selector: TXT }], { title: c.title || '' }, { title: t('Titlu (opțional)') }, (v) => this._set([], 'title', v.title)),
          h('button', { class: 'auto', type: 'button', onclick: () => this._auto() }, t('Detectează automat senzorii')),
          h('div', { class: 'found', text: this._found })),
        src('solar', t('Solar'), t('Alege senzorul care arată puterea instantanee produsă (W sau kW).'), [{ name: 'entity', selector: SENSOR() }], LBL),
        src('grid', t('Rețea'), t('Alege senzorul contorului: puterea de la / către rețea.'), [{ name: 'entity', selector: SENSOR() }, { name: 'invert', selector: BOOL }],
          { ...LBL, invert: t('Contorul arată valori pozitive când exportă') }, { invert: t('Bifează dacă pe contor + înseamnă export în rețea.') }),
        src('battery', t('Baterie'), t('Puterea bateriei și, opțional, nivelul de încărcare.'), [{ name: 'entity', selector: SENSOR() }, { name: 'soc', selector: SENSOR() }, { name: 'invert', selector: BOOL }],
          { ...LBL, soc: t('Nivel încărcare (%)'), invert: t('Bateria arată valori pozitive când se încarcă') }, { invert: t('Implicit + înseamnă descărcare.') }),
        this._listBlock('consumers', t('Consumatori'), t('Ce consumă energia: casă, hală, piscină, mașină electrică…'), 6, t('Adaugă consumator'), t('Consumator'),
          (item, i, onChange) => {
            const f = consumerToForm(item);
            return [
              this._form([grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'entity', selector: SENSOR() }], f,
                { name: t('Nume'), icon: t('Iconiță'), entity: t('Senzor de putere') }, (v) => onChange(consumerFromForm({ ...f, ...v }, item))),
              h('details', { open: f.entities.length > 0 || f.subtract.length > 0 }, h('summary', { text: t('Avansat: sumă de senzori sau scădere') }),
                this._form([{ name: 'entities', selector: SENSOR({ multiple: true }) }, { name: 'subtract', selector: SENSOR({ multiple: true }) }], f,
                  { entities: t('Însumează mai mulți senzori (ex. cele 3 faze)'), subtract: t('Scade din valoare (ex. mașina electrică din hală)') },
                  (v) => onChange(consumerFromForm({ ...f, ...v }, item)))),
            ];
          }, consumerReady),
        this._items('stats', { title: t('Statistici jos'), hint: t('Valori mici sub grafic: import / export zilnic, energie încărcată în baterie…'), max: 4, addLabel: t('Adaugă statistică'), rowLabel: t('Statistică'), compact: false,
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON })], labels: { entity: t('Senzor'), label: t('Etichetă'), icon: t('Iconiță') } }] }),
      ];
    }
    _auto() {
      const found = detectEnergy(this._hass && this._hass.states), c = this._cfg, names2 = [];
      const put = (k, v) => { if (v && !c[k]) { c[k] = v; this._open[k] = true; names2.push(v); } };
      put('solar', found.solar); put('grid', found.grid);
      if (found.battery && !c.battery) { c.battery = found.soc ? { entity: found.battery, soc: found.soc } : found.battery; this._open.battery = true; names2.push(found.battery); }
      this._found = names2.length ? t('Am completat: {n}. Verifică semnele (import / export, încărcare / descărcare) în previzualizare.', { n: names2.join(', ') }) : t('Nu am găsit senzori noi de putere. Alege-i manual mai jos.');
      this._emit(); this._draw();
    }
  }

  // ======================= butoane / chips =======================
  const actionsForm = () => ({ details: t('Acțiuni la atingere'), schema: [{ name: 'tap_action', selector: ACTION }, { name: 'hold_action', selector: ACTION }, { name: 'double_tap_action', selector: ACTION }], labels: { tap_action: t('La atingere'), hold_action: t('La apăsare lungă'), double_tap_action: t('La dublă atingere') } });
  const entityForms = (more) => [
    { schema: [{ name: 'entity', selector: ENT() }, grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON })], labels: { entity: t('Entitate'), name: t('Nume'), icon: t('Iconiță') } },
    ...more,
    { ...actionsForm() },
  ];

  class CcuButtonsEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Card'), '', [{ name: 'title', selector: TXT }, grid({ name: 'columns', selector: NUM(1, 6) }, { name: 'columns_wide', selector: NUM(1, 6) }), grid({ name: 'density', selector: SEL(['xs', 's', 'm', 'l', 'xl']) }, { name: 'panel', selector: BOOL })],
          { title: t('Titlu (opțional)'), columns: t('Coloane (ecran îngust)'), columns_wide: t('Coloane (ecran lat)'), density: t('Mărime implicită'), panel: t('Panou cu chenar') }),
        this._items('entities', { title: t('Butoane'), hint: t('Fiecare buton comandă o entitate: lumină, priză, senzor, climă…'), max: 40, addLabel: t('Adaugă buton'), rowLabel: t('Buton'),
          forms: entityForms([{ schema: [grid({ name: 'size', selector: SEL(['xs', 's', 'm', 'l', 'xl']) }, { name: 'icon_color', selector: SEL(COLORS) }), grid({ name: 'shape', selector: SEL(['chamfer', 'round', 'pill', 'square']) }, { name: 'toggle', selector: BOOL })], labels: { size: t('Mărime'), icon_color: t('Culoarea iconiței'), shape: t('Formă'), toggle: t('Comutator (doar mărimea l)') } }]) }),
      ];
    }
  }
  class CcuChipsEditor extends CcuEditor {
    _body() {
      return [
        this._feature('deadlines', t('Termene mașini'), t('Un chip cât timp un termen (RCA, ITP, rovinietă, ulei) se apropie sau a expirat; arată documentul și termenul, sau numărul.'), t('Arată chip „termene mașini”'), () => [
          this._fields(['deadlines'], '', '', [grid({ name: 'alert_days', selector: NUM(0, 30) }, { name: 'label', selector: TXT }), { name: 'tap_action', selector: ACTION }], { alert_days: t('Alertă cu câte zile înainte'), label: t('Text (opțional)'), tap_action: t('La atingere (ex. deschide pagina Mașini)') }),
          this._vehiclesBlock(['deadlines']),
        ]),
        this._feature('low_batteries', t('Baterii slabe'), t('Un singur chip, doar când există baterii slabe: arată numărul (sau numele, dacă e una) și, la atingere, deschide ce setezi mai jos.'), t('Arată chip „baterii slabe”'), () => [
          this._fields(['low_batteries'], '', '', [grid({ name: 'threshold', selector: NUM(0, 100) }, { name: 'label', selector: TXT }), { name: 'exclude', selector: this._batteryIgnore() }, { name: 'include', selector: ENT({ multiple: true }) }, { name: 'mobile', selector: BOOL }, { name: 'tap_action', selector: ACTION }],
            { threshold: t('Prag baterie slabă (%)'), label: t('Text (opțional)'), exclude: t('Ignoră dispozitivele'), include: t('Adaugă dispozitive'), mobile: t('Exclude telefoanele și tabletele'), tap_action: t('La atingere (ex. deschide lista bateriilor)') }, { exclude: t('Alege din listă un dispozitiv pe care nu-l mai folosești (ex. o periuță stricată) sau scrie un cuvânt din nume și apasă Enter.'), include: t('Senzori adăugați chiar dacă nu sunt găsiți singuri sau sunt ignorați (ex. un senzor de baterie fără tip).') }, { defTrue: ['mobile'] }),
        ]),
        this._items('entities', { title: t('Chips'), hint: t('Etichete mici de stare; pot apărea doar când sunt active.'), max: 40, addLabel: t('Adaugă chip'), rowLabel: t('Chip'),
          forms: entityForms([{ schema: [grid({ name: 'icon_color', selector: SEL(COLORS) }, { name: 'on_as', selector: SEL(['alert']) }), grid({ name: 'show_state', selector: BOOL }, { name: 'hide_off', selector: BOOL })], labels: { icon_color: t('Culoarea iconiței'), on_as: t('Când e pornit arată ca'), show_state: t('Arată valoarea'), hide_off: t('Ascunde când e oprit') } }]) }),
      ];
    }
  }

  // ======================= antet / meniu =======================
  class CcuHeaderEditor extends CcuEditor {
    _body() {
      return [
        this._fields(['header'], t('Antet'), '', [grid({ name: 'icon', selector: ICON }, { name: 'clock', selector: BOOL })], { icon: t('Iconiță'), clock: t('Arată ceasul') }, null, { defTrue: ['clock'] }),
        this._items('values', { path: ['header'], title: t('Valori'), hint: t('Maximum 3 valori în antet.'), max: 3, addLabel: t('Adaugă valoare'), rowLabel: t('Valoare'), compact: false,
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'color', selector: SEL(['accent', 'on', 'ok', 'alert']) }], labels: { entity: t('Senzor'), label: t('Etichetă'), icon: t('Iconiță'), color: t('Culoare') } }] }),
        this._fields(['header', 'right'], t('În dreapta (în loc de ceas)'), t('Opțional: o valoare afișată în locul ceasului, ex. temperatura de afară.'), [{ name: 'entity', selector: ENT() }, grid({ name: 'attribute', selector: TXT }, { name: 'label', selector: TXT })], { entity: t('Entitate'), attribute: t('Atribut (opțional)'), label: t('Etichetă') }, null, { collapsed: true }),
      ];
    }
  }
  class CcuNavEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Meniu'), '', [grid({ name: 'sticky', selector: BOOL }, { name: 'compact', selector: BOOL })], { sticky: t('Fixat jos pe ecran'), compact: t('Compact') }),
        this._items('items', { title: t('Butoane meniu'), hint: t('Fiecare buton duce la o pagină (cale completă, ex. /dashboard-casa/camere).'), max: 8, addLabel: t('Adaugă buton'), rowLabel: t('Buton'), compact: false, ready: (x) => !!(x && x.path),
          forms: [{ schema: [grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'path', selector: TXT }], labels: { label: t('Etichetă'), icon: t('Iconiță'), path: t('Adresa paginii') }, helpers: { path: t('Începe cu /, ex. /lovelace/0') } },
            { details: t('Insignă cu număr'), schema: [{ name: 'badge', selector: ENT({ multiple: true }) }, { name: 'badge_style', selector: SEL(['light']) }], labels: { badge: t('Entități numărate'), badge_style: t('Aspect insignă') }, helpers: { badge: t('Numără entitățile pornite; un senzor numeric adaugă valoarea lui (ex. „becuri aprinse”).'), badge_style: t('„light” = galben, pentru lumini; implicit roșu (alertă).') } }] }),
      ];
    }
  }

  // ======================= grafic / baterii / oameni =======================
  const RANGES = ['6h', '12h', '24h', '7d', '30d'];
  class CcuGraphEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Grafic'), '', [{ name: 'title', selector: TXT }, grid({ name: 'range', selector: SEL(RANGES) }, { name: 'tabs', selector: SEL(RANGES, true) }), grid({ name: 'y_axis', selector: SEL(['left', 'right']) }, { name: 'height', selector: NUM(60, 400, 10) }), { name: 'compact', selector: BOOL }, { name: 'tap_action', selector: ACTION }],
          { tap_action: t('La atingere (ex. deschide pagina graficului)'), title: t('Titlu (opțional)'), range: t('Interval'), tabs: t('File pentru schimbarea intervalului'), y_axis: t('Axa Y'), height: t('Înălțime (px)'), compact: t('Compact') }),
        this._items('series', { title: t('Serii'), hint: t('Între 1 și 3 linii pe grafic.'), max: 3, addLabel: t('Adaugă serie'), rowLabel: t('Serie'), compact: false,
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, grid({ name: 'name', selector: TXT }, { name: 'color', selector: SEL(['accent', 'yellow', 'green', 'blue', 'orange', 'red', 'cyan']) }), { name: 'kind', selector: SEL(['area', 'line']) }], labels: { entity: t('Senzor'), name: t('Nume'), color: t('Culoare'), kind: t('Tip') } }] }),
      ];
    }
  }
  class CcuBatteryEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Baterie'), t('Nivelul de încărcare și, opțional, capacitatea și consumul pentru autonomie.'), [
          { name: 'soc', selector: SENSOR() }, { name: 'load', selector: SENSOR() }, grid({ name: 'capacity_entity', selector: SENSOR() }, { name: 'capacity_kwh', selector: NUM(0, 1000, 0.1) }), { name: 'grid_present', selector: ENT({ domain: 'binary_sensor' }) },
          grid({ name: 'reserve_pct', selector: NUM(0, 100) }, { name: 'shutdown_pct', selector: NUM(0, 100) }), grid({ name: 'color', selector: SEL(['yellow', 'green', 'blue', 'orange']) }, { name: 'show_title', selector: BOOL })],
          { soc: t('Nivel încărcare (%)'), load: t('Consum curent (W)'), capacity_entity: t('Senzor capacitate'), capacity_kwh: t('sau capacitate (kWh)'), grid_present: t('Rețea prezentă (senzor binar)'), reserve_pct: t('Rezervă (%)'), shutdown_pct: t('Oprire (%)'), color: t('Culoare'), show_title: t('Arată titlul') },
          { grid_present: t('Când e oprit, cardul arată „Backup activ”.') }, { defTrue: ['show_title'] }),
      ];
    }
  }
  class CcuBatteriesEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Baterii dispozitive'), '', [{ name: 'title', selector: TXT }, grid({ name: 'warn_pct', selector: NUM(0, 100) }, { name: 'low_pct', selector: NUM(0, 100) }), { name: 'sort', selector: SEL(['asc', 'none']) }],
          { title: t('Titlu (opțional)'), warn_pct: t('Avertisment sub (%)'), low_pct: t('Critic sub (%)'), sort: t('Ordine') }),
        this._feature('auto', t('Găsește singur bateriile'), t('Caută în Home Assistant toate dispozitivele cu baterie (senzori „battery”), fără telefoane și tablete.'), t('Descoperire automată'), () => [
          this._fields(['auto'], '', '', [{ name: 'threshold', selector: NUM(0, 100) }, { name: 'exclude', selector: this._batteryIgnore() }, { name: 'include', selector: ENT({ multiple: true }) }, { name: 'mobile', selector: BOOL }],
            { threshold: t('Prag baterie slabă (%)'), exclude: t('Ignoră dispozitivele'), include: t('Adaugă dispozitive'), mobile: t('Exclude telefoanele și tabletele') }, { exclude: t('Alege din listă un dispozitiv pe care nu-l mai folosești (ex. o periuță stricată) sau scrie un cuvânt din nume și apasă Enter.'), include: t('Senzori adăugați chiar dacă nu sunt găsiți singuri sau sunt ignorați (ex. un senzor de baterie fără tip).') }, { defTrue: ['mobile'] }),
          this._fields([], '', '', [{ name: 'only_low', selector: BOOL }], { only_low: t('Arată doar bateriile slabe') }),
        ]),
        this._items('entities', { title: t('Dispozitive'), hint: t('Senzori de nivel baterie: telefoane, tablete, mașină…'), max: 30, addLabel: t('Adaugă dispozitiv'), rowLabel: t('Dispozitiv'),
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, { name: 'name', selector: TXT }], labels: { entity: t('Senzor'), name: t('Nume') } }] }),
      ];
    }
  }
  class CcuPeopleEditor extends CcuEditor {
    _body() {
      return [this._fields([], t('Persoane'), '', [{ name: 'people', selector: ENT({ domain: 'person', multiple: true }) }, { name: 'layout', selector: SEL(['family']) }, { name: 'title', selector: TXT }],
        { people: t('Persoane'), layout: t('Aspect'), title: t('Titlu (opțional)') }, { layout: t('„family” = avatare mari cu nume și stare.') })];
    }
  }

  // ======================= vreme =======================
  const WX = ['temperature', 'feels_like', 'humidity', 'wind_speed', 'wind_gust', 'wind_direction', 'rain_rate', 'rain_today', 'rain_state', 'pressure', 'uv', 'radiation'];
  class CcuWeatherEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Vreme'), '', [{ name: 'title', selector: TXT }, { name: 'weather', selector: ENT({ domain: 'weather' }) }, grid({ name: 'days', selector: NUM(1, 7) }, { name: 'tiles', selector: SEL(['humidity', 'wind', 'rain', 'pressure', 'uv', 'radiation'], true) })],
          { title: t('Titlu (opțional)'), weather: t('Entitatea de prognoză'), days: t('Zile de prognoză'), tiles: t('Plăcuțe afișate') }, { weather: t('Pentru prognoză și pentru cerul din scenă.') }),
        this._fields(['sensors'], t('Senzorii stației tale'), t('Opțional: valorile curente vin din senzorii tăi, nu din prognoză.'),
          WX.map((k) => ({ name: k, selector: ENT({ domain: ['sensor', 'binary_sensor'] }) })),
          { temperature: t('Temperatură'), feels_like: t('Se simte ca'), humidity: t('Umiditate'), wind_speed: t('Viteza vântului'), wind_gust: t('Rafale'), wind_direction: t('Direcția vântului'), rain_rate: t('Intensitatea ploii'), rain_today: t('Ploaie azi'), rain_state: t('Plouă acum'), pressure: t('Presiune'), uv: t('Index UV'), radiation: t('Radiație solară') }, null, { collapsed: true }),
      ];
    }
  }

  // ======================= titlu / controale / telecomandă =======================
  class CcuTitleEditor extends CcuEditor {
    _body() { return [this._fields([], t('Titlu'), '', [{ name: 'title', selector: TXT }, { name: 'subtitle', selector: TXT }, { name: 'icon', selector: ICON }], { title: t('Titlu'), subtitle: t('Subtitlu'), icon: t('Iconiță') })]; }
  }
  const CTL_DOMAINS = ['climate', 'light', 'fan', 'media_player', 'number', 'input_number', 'select', 'input_select'];
  class CcuControlsEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Controale'), '', [{ name: 'title', selector: TXT }, { name: 'columns', selector: NUM(1, 3) }], { title: t('Titlu (opțional)'), columns: t('Coloane') }),
        this._items('items', { title: t('Controale'), hint: t('Termostat / A/C, lumini cu luminozitate, ventilator, media player, număr, selector. Tipul se alege singur după entitate.'), max: 12, addLabel: t('Adaugă control'), rowLabel: t('Control'),
          forms: [{ schema: [{ name: 'entity', selector: ENT({ domain: CTL_DOMAINS }) }, grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'style', selector: SEL(['simple']) }], labels: { entity: t('Entitate'), name: t('Nume'), icon: t('Iconiță'), style: t('Variantă') }, helpers: { style: t('„simple” = varianta compactă (A/C).') } }] }),
      ];
    }
  }
  class CcuRemoteEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Telecomandă'), '', [{ name: 'entity', selector: ENT({ domain: 'remote' }) }, { name: 'dpad', selector: BOOL }], { entity: t('Entitatea telecomenzii'), dpad: t('Arată crucea cu OK') }, null, { defTrue: ['dpad'] }),
        this._items('extra', { title: t('Taste proprii'), hint: t('Ex. Netflix, YouTube: trimit o comandă a telecomenzii.'), max: 8, addLabel: t('Adaugă tastă'), rowLabel: t('Tastă'), compact: false, ready: (x) => !!(x && x.command),
          forms: [{ schema: [grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'command', selector: TXT }], labels: { label: t('Etichetă'), icon: t('Iconiță'), command: t('Comandă') }, helpers: { command: t('Ex. KEY_11 sau numele din integrarea ta.') } }] }),
      ];
    }
  }

  class CcuRadioEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Radio'), t('Alege selectorul cu posturile; restul e opțional.'), [
          { name: 'title', selector: TXT }, { name: 'stations', selector: ENT({ domain: ['select', 'input_select'] }) }, { name: 'player', selector: ENT({ domain: 'media_player' }) }, { name: 'speakers', selector: ENT({ domain: 'media_player', multiple: true }) },
          { name: 'playing', selector: ENT({ domain: ['input_boolean', 'switch', 'binary_sensor', 'media_player'] }) }],
          { title: t('Titlu (opțional)'), stations: t('Selectorul cu posturile'), player: t('Boxa principală'), speakers: t('Boxe între care alegi'), playing: t('Senzor „se redă”') },
          { stations: t('Un select sau input_select ale cărui opțiuni sunt posturile.'), player: t('Boxa implicită; pentru volum și pentru a vedea dacă răspunde.'), speakers: t('Dacă sunt mai multe, apar butoane pentru a alege pe care boxă cântă.'), playing: t('Dacă lipsește, se folosește starea playerului.') }),
        this._fields([], t('Pornire și oprire'), t('Un script sau un buton care pornește / oprește radioul. Fără ele se folosește playerul.'), [
          { name: 'play', selector: ENT({ domain: ['script', 'button', 'input_button', 'scene'] }) }, { name: 'stop', selector: ENT({ domain: ['script', 'button', 'input_button', 'scene'] }) }],
          { play: t('Script de pornire'), stop: t('Script de oprire') }),
        this._fields([], t('Posturi'), '', [{ name: 'hide', selector: { select: { mode: 'dropdown', multiple: true, custom_value: true, options: [] } } }],
          { hide: t('Ascunde posturile care conțin') }, { hide: t('Scrie un cuvânt și apasă Enter, ex. Personalizat.') }, { collapsed: true }),
      ];
    }
  }

  class CcuVehicleEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Mașini'), '', [{ name: 'title', selector: TXT }, grid({ name: 'alert_days', selector: NUM(0, 30) }, { name: 'alert_km', selector: NUM(0, 5000, 50) })],
          { title: t('Titlu (opțional)'), alert_days: t('Alertă cu câte zile înainte'), alert_km: t('Alertă la câți km rămași') }, { alert_days: t('Termenul devine portocaliu (și apare în chip) cu atâtea zile înainte.') }),
        this._vehiclesBlock([]),
      ];
    }
  }

  const defs = { 'ccu-flow-editor': CcuFlowEditor, 'ccu-buttons-editor': CcuButtonsEditor, 'ccu-chips-editor': CcuChipsEditor, 'ccu-header-editor': CcuHeaderEditor, 'ccu-nav-editor': CcuNavEditor, 'ccu-graph-editor': CcuGraphEditor,
    'ccu-battery-editor': CcuBatteryEditor, 'ccu-batteries-editor': CcuBatteriesEditor, 'ccu-people-editor': CcuPeopleEditor, 'ccu-weather-editor': CcuWeatherEditor, 'ccu-title-editor': CcuTitleEditor, 'ccu-controls-editor': CcuControlsEditor, 'ccu-remote-editor': CcuRemoteEditor, 'ccu-radio-editor': CcuRadioEditor, 'ccu-vehicle-editor': CcuVehicleEditor };
  for (const [tag, cls] of Object.entries(defs)) if (!customElements.get(tag)) customElements.define(tag, cls);
}
