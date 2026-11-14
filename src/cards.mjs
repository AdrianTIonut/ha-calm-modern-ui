// src/cards.mjs — web components: ccu-buttons-card, ccu-chips-card, ccu-header-card.
// Regulile din PROMPT: DOM actualizat pe loc (patchNodes), randare doar când s-a schimbat o entitate folosită, ≥ 1 s între randări,
// un singur interval pentru ceas (curățat la disconnect), gesturi pe pointer events, fără rețea.
import { CCU_THEME } from './theme.js';
import { setLang } from './i18n.mjs';
import { normalizeConfig } from './config.mjs';
import { runAction, toggleEntity } from './actions.mjs';
import { attachGestures } from './gestures.mjs';
import { defineEditors, detectEnergy } from './editor.mjs';
import { normalizeRadio, radioModel, renderRadio, stationUrl } from './radio.mjs';
import { applyPreset } from './presets.mjs';
import { normalizeGraphConfig, buildGraphModel, renderGraphCard, nearestPoint, rangeHours, thin, formatValue } from './graph-card.mjs';
import { parseMinimalResponse, formatTimeLabel } from './graph-data.mjs';
import { normalizeWeatherConfig, buildWeatherModel, renderWeather } from './weather.mjs';
import { normalizeFlowConfig, buildFlowModel, renderFlow, normalizeBatteryConfig, buildBatteryModel, renderBattery, normalizeBatteriesConfig, buildBatteriesModel, renderBatteries } from './energy.mjs';
import { normalizeControls, controlModel, renderControls, sliderValue, normalizeTitle, renderTitle, normalizeRemote, renderRemote } from './controls.mjs';
import { formatNumber } from './state.mjs';
import { normalizeWaste, renderButtons, renderChips, renderHeader, renderNav, renderPeople, normalizePeople, normalizeHeader, normalizeNav, sparkPath, patchNodes, defaultTap } from './render.mjs';

const MIN_RENDER_MS = 1000;
const CLOCK_MS = 30000;
const ROW_UNITS = { xs: 0.7, s: 1.5, m: 1.7, l: 1.4, xl: 2.6 };

function asAction(a, fallback) {
  if (a === undefined || a === null) return fallback;
  return typeof a === 'string' ? { action: a } : a;
}

class CcuBase extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `<style>${CCU_THEME}</style><div class="ccu-mount"></div>`;
    this._mount = this._root.querySelector('.ccu-mount');
    this._config = null; this._hass = null; this._warnings = [];
    this._lastRefs = null; this._lastDraw = 0; this._timer = null; this._unbind = []; this._clock = null;
  }

  // --- de suprascris ---
  _build(cfg) { return normalizeConfig(cfg); }      // → {config, warnings}
  // entitățile care declanșează o redesenare; incluse: membrii `group` și membrii grupurilor cu `count` (ex. lumini aprinse)
  _entityIds() {
    const o = [];
    for (const e of this._config.entities || []) {
      o.push(e.entity);
      if (Array.isArray(e.group)) o.push(...e.group);
      if (e.count === true && this._hass) { const a = this._hass.states && this._hass.states[e.entity] && this._hass.states[e.entity].attributes; if (a && Array.isArray(a.entity_id)) o.push(...a.entity_id); }
    }
    return o;
  }
  _html(now) { return ''; }
  _hasClock() { return false; }

  // limba: `language:` din card, altfel a lui HA (hass.locale.language), altfel atributul lang al paginii, altfel engleza
  _lang() { return (this._config && this._config.language) || (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'en'; }

  setConfig(cfg) {
    setLang((cfg && cfg.language) || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'en');
    const { config, warnings } = this._build(cfg);
    if (cfg && cfg.language && config) config.language = String(cfg.language);   // limba aleasă în card (altfel: a lui HA)
    if (!config.entities.length && !this._allowEmpty) throw new Error('The configuration has no valid entity (entities).');
    this._config = config; this._warnings = warnings;
    applyPreset(this, config.preset, config.colors);
    if (config.animations === false) this.setAttribute('data-anim', 'off'); else this.removeAttribute('data-anim');
    this._lastRefs = null;
    this._draw(true);
  }

  set hass(h) {
    this._hass = h;
    if (!this._config) return;
    const refs = this._entityIds().map((id) => h?.states?.[id]);
    const changed = !this._lastRefs || refs.length !== this._lastRefs.length || refs.some((r, i) => r !== this._lastRefs[i]);
    if (!changed) return;
    this._lastRefs = refs;
    this._schedule();
  }
  get hass() { return this._hass; }

  _schedule() {
    const wait = MIN_RENDER_MS - (Date.now() - this._lastDraw);
    if (wait <= 0) { this._draw(false); return; }
    if (this._timer) return;
    this._timer = setTimeout(() => { this._timer = null; this._draw(false); }, wait);
  }

  _draw(force) {
    if (!this._config) return;
    this._lastDraw = Date.now();
    setLang(this._lang());
    const html = this._html(new Date());
    if (!force && html === this._lastHtml) return;
    this._lastHtml = html;
    let patched = false;
    if (!force && this._mount.firstElementChild) {
      try { const tpl = document.createElement('template'); tpl.innerHTML = html; patched = patchNodes(this._mount, tpl.content); } catch (e) { patched = false; }
    }
    if (!patched) { this._mount.innerHTML = html; this._bind(); }
  }

  // --- gesturi: legate doar după o înlocuire completă; la patch elementele rămân cu ascultătorii lor ---
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    this._mount.querySelectorAll('[data-id]').forEach((el) => {
      const idx = el.getAttribute('data-id');
      const act = (kind) => () => this._fire(idx, kind, el);
      // double_tap se leagă DOAR dacă e configurat: altfel fiecare atingere ar aștepta 300 ms să vadă dacă urmează a doua
      const detach = attachGestures(el, { tap: act('tap'), hold: act('hold'), double_tap: this._actionFor(idx, 'double_tap') ? act('double_tap') : undefined }, null);
      const noMenu = (e) => e.preventDefault();
      const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._fire(idx, 'tap', el); } };
      el.addEventListener('contextmenu', noMenu); el.addEventListener('keydown', key);
      this._unbind.push(detach, () => { el.removeEventListener('contextmenu', noMenu); el.removeEventListener('keydown', key); });
    });
  }

  // acțiunea se caută în config LA MOMENTUL atingerii (nu la legare): rămâne corectă după orice patch
  _actionFor(idx, kind) {
    const c = this._config, e = (c.entities || [])[Number(idx)];
    if (!e) return null;
    const own = asAction(e[kind + '_action']);
    if (own) return { ...(typeof own === 'object' ? own : {}), entity: own.entity ?? e.entity };
    if (kind === 'tap') return { action: defaultTap(e.entity), entity: e.entity };
    if (kind === 'hold') return { action: 'more-info', entity: e.entity };
    return null;
  }
  _fire(idx, kind, el) {
    const a = this._actionFor(idx, kind);
    if (a) { runAction(this._hass, el, a); if (kind === 'tap') setTimeout(() => this._draw(false), 300); }
  }

  connectedCallback() {
    if (this._hasClock() && !this._clock) this._clock = setInterval(() => this._draw(false), CLOCK_MS);
    // la reconectare (ex. HA readuce view-ul după „înapoi”) ascultătorii au fost scoși la disconnect: redesenare FORȚATĂ, ca să se lege din nou (altfel nimic nu mai răspunde la atingere)
    if (this._config) this._draw(true);
  }
  disconnectedCallback() {
    if (this._clock) { clearInterval(this._clock); this._clock = null; }
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this._unbind.forEach((f) => f()); this._unbind = [];
  }
}

// ---------- carduri ----------
class CcuButtonsCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-buttons-editor'); }
  _sparks = {}; _sparkTimer = null; _sparkBusy = false;
  _html() { return renderButtons(this._config, this._hass, { warnings: this._warnings, sparks: this._sparks }); }
  // mini-grafic (sparkline) din istoricul HA, pentru butoanele cu `spark:`; reîmprospătat la 5 minute, doar când cardul e conectat
  async _loadSparks() {
    if (this._sparkBusy || !this._hass?.callWS || !this._config) return;
    const wanted = (this._config.entities || []).filter((e) => e.spark && e.size !== 's').map((e) => ({ id: e.spark.entity || e.entity, hours: Math.min(48, Math.max(1, Number(e.spark.hours) || 6)) }));
    if (!wanted.length) return;
    this._sparkBusy = true;
    try {
      for (const w of wanted) {
        const end = new Date(), start = new Date(end.getTime() - w.hours * 3600e3);
        const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: [w.id], minimal_response: true, no_attributes: true, significant_changes_only: false });
        const rows = (res && res[w.id]) || [];
        this._sparks[w.id] = sparkPath(rows.map((r) => r.s));
      }
      this._draw(false);
    } catch (e) { /* fără istoric: graficul mic rămâne gol */ }
    this._sparkBusy = false;
  }
  set hass(h) { super.hass = h; if (!this._sparkLoaded && h?.callWS) { this._sparkLoaded = true; this._loadSparks(); } }
  get hass() { return this._hass; }
  connectedCallback() { super.connectedCallback(); if (!this._sparkTimer) this._sparkTimer = setInterval(() => this._loadSparks(), 300000); }
  disconnectedCallback() { super.disconnectedCallback(); if (this._sparkTimer) { clearInterval(this._sparkTimer); this._sparkTimer = null; } }
  getCardSize() {
    const c = this._config || {}, cols = Number(c.columns) || 2, n = (c.entities || []).length || 1;
    const u = Math.max(...(c.entities || [{}]).map((e) => ROW_UNITS[e.size] || ROW_UNITS.m));
    return Math.max(1, Math.ceil(Math.ceil(n / cols) * u));
  }
  getGridOptions() { return { columns: 12, min_columns: 3, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((i) => /^(light|switch|fan)\./.test(i)).slice(0, 4);
    return { entities: ids.length ? ids : ['light.exemplu'], columns: 2 };
  }
}

class CcuChipsCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-chips-editor'); }
  _build(cfg) {
    const waste = normalizeWaste(cfg && cfg.waste);
    this._allowEmpty = !!waste;
    const r = normalizeConfig(cfg);
    r.config.waste = waste;
    if (waste) r.warnings = r.warnings.filter((w) => !/entit/i.test(w));
    return r;
  }
  _html() { return renderChips(this._config, this._hass, { warnings: this._warnings, events: this._events, now: new Date() }); }
  set hass(h) { this._hass = h; super.hass = h; this._loadWaste(); }
  get hass() { return this._hass; }
  // evenimentele din calendarul de colectare (azi + următoarele zile), reîncărcate din 30 în 30 de minute
  async _loadWaste() {
    const w = this._config && this._config.waste;
    if (!w || !this._hass || !this._hass.callWS || this._wBusy || (this._evAt && Date.now() - this._evAt < 30 * 60e3)) return;
    this._wBusy = true;
    try {
      const s = new Date(); s.setHours(0, 0, 0, 0);
      const e = new Date(s.getTime() + (w.next_days + 2) * 864e5);
      const res = await this._hass.callWS({ type: 'call_service', domain: 'calendar', service: 'get_events', service_data: { start_date_time: s.toISOString(), end_date_time: e.toISOString() }, target: { entity_id: w.calendar }, return_response: true });
      const list = res && (res.response || res)[w.calendar];
      this._events = list && Array.isArray(list.events) ? list.events : [];
      this._evAt = Date.now();
      this._draw(false);
    } catch (err) { this._evAt = Date.now() - 25 * 60e3; /* reîncearcă peste 5 min */ } finally { this._wBusy = false; }
  }
  setConfig(cfg) { this._events = undefined; this._evAt = 0; super.setConfig(cfg); this._loadWaste(); }
  // dacă toate chips-urile au hide_off și niciunul nu e „on”: cardul dispare (display:none + eveniment pentru Home Assistant), fără rând gol
  _draw(force) {
    super._draw(force);
    if (!this._config) return;
    const hides = (this._config.entities || []).some((e) => e.hide_off === true || e.show_if) || !!this._config.waste;
    this._setVisible(!hides || !!this._mount.querySelector('.ccu-chip'));
  }
  connectedCallback() {
    super.connectedCallback();
    // setConfig rulează înainte de atașare: la conectare repetăm starea, ca wrapper-ul din HA să se ascundă și la prima încărcare
    if (this._vis !== undefined) this.dispatchEvent(new CustomEvent('card-visibility-changed', { detail: { value: this._vis }, bubbles: true, composed: true }));
  }
  _setVisible(v) {
    if (v === this._vis) return;
    this._vis = v;
    this.style.display = v ? '' : 'none';
    this.dispatchEvent(new CustomEvent('card-visibility-changed', { detail: { value: v }, bubbles: true, composed: true }));
  }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((i) => /^(light|lock|binary_sensor)\./.test(i)).slice(0, 4);
    return { entities: ids.length ? ids : ['light.exemplu'] };
  }
}

class CcuGraphCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-graph-editor'); }
  _allowEmpty = false;
  constructor() {
    super();
    this._range = null; this._cache = new Map(); this._loading = false; this._refreshTimer = null; this._lastW = 0; this._model = null;
    // file (tabs): delegare pe containerul care nu se înlocuiește niciodată
    // atingere (nu glisare pentru a vedea valorile) pe grafic → acțiunea `tap_action`, ex. deschide view-ul graficului
    this._mount.addEventListener('pointerdown', (e) => { this._down = { x: e.clientX, y: e.clientY }; });
    this._mount.addEventListener('click', (e) => {
      const tb = e.target && e.target.closest ? e.target.closest('[data-tab]') : null;
      if (!tb && this._tap && this._tap.action && this._tap.action !== 'none') {
        const d = this._down; this._down = null;
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;   // glisare (citire valori), nu atingere
        runAction(this._hass, this._mount, { ...this._tap, entity: this._tap.entity || (this._config.series[0] && this._config.series[0].entity) });
        return;
      }
    });
    this._mount.addEventListener('click', (e) => {
      const b = e.target && e.target.closest ? e.target.closest('[data-tab]') : null;
      if (!b) return;
      const t = (this._config.tabs || [])[Number(b.getAttribute('data-tab'))];
      if (t !== undefined) { this._range = t; this._load(false); this._draw(false); }
    });
  }
  _build(cfg) {
    const g = normalizeGraphConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: g.config.series.map((s) => s.entity) });
    const config = { ...base.config, ...g.config, entities: g.config.series };
    return { config, warnings: g.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  setConfig(cfg) {
    super.setConfig(cfg); this._range = this._config.range; this._cache.clear(); this._load(false);
    const ta = cfg && cfg.tap_action; this._tap = typeof ta === 'string' ? { action: ta } : ta && typeof ta === 'object' ? ta : null;
    this.toggleAttribute('data-tap', !!(this._tap && this._tap.action && this._tap.action !== 'none'));
  }
  _entityIds() { return []; }            // graficul se actualizează doar la refresh, nu la fiecare schimbare de stare
  set hass(h) { this._hass = h; if (this._config && !this._started && h && h.callWS) { this._started = true; this._load(false); } }
  get hass() { return this._hass; }
  _width() { return this.clientWidth || (this.parentElement && this.parentElement.clientWidth) || 360; }
  _height() { return this._config.height || (this._width() >= 520 ? 190 : 150); }
  _key() { return String(rangeHours(this._range)); }
  _html() {
    const w = Math.max(200, this._width() - 24 /* padding panou */);
    const entry = this._cache.get(this._key());
    const m = buildGraphModel(this._config, entry ? entry.data : [], w, this._height());
    this._model = m;
    return renderGraphCard(this._config, m, { range: this._range, loading: this._loading }, { warnings: this._warnings });
  }
  async _load(force) {
    if (!this._hass || !this._hass.callWS || !this._config) return;
    const key = this._key(), hit = this._cache.get(key), ttl = this._config.refresh_minutes * 60e3;
    if (!force && hit && Date.now() - hit.at < ttl) return;
    if (this._loading) return;
    this._loading = true; this._draw(false);
    const ids = this._config.series.map((s) => s.entity), hours = rangeHours(this._range), end = new Date(), start = new Date(end.getTime() - hours * 3600e3);
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
      const parsed = parseMinimalResponse(res, ids);
      const data = ids.map((id) => {
        let pts = thin(parsed[id] || [], 150);
        const cur = this._hass.states && this._hass.states[id]; const n = Number(cur && cur.state);
        if (cur && cur.state !== '' && Number.isFinite(n) && pts.length) pts = pts.concat([{ t: end.getTime(), v: n }]);
        pts.unit = (cur && cur.attributes && cur.attributes.unit_of_measurement) || '';
        return pts;
      });
      this._cache.set(key, { at: Date.now(), data });
    } catch (e) { /* fără istoric: se arată „fără date istorice” */ }
    this._loading = false; this._lastHtml = null; this._draw(false);
  }
  _bind() {
    super._bind();
    const wrap = this._mount.querySelector('.ccu-graph-wrap'), svg = wrap && wrap.querySelector('svg');
    if (!svg) return;
    const tip = wrap.querySelector('.ccu-tip');
    const hide = () => { const c = svg.querySelector('.cursor'); if (c) c.setAttribute('opacity', '0'); const d = svg.querySelector('.dots'); if (d) d.innerHTML = ''; if (tip) tip.hidden = true; };
    const show = (e) => {
      const m = this._model; if (!m || !m.series.length) return;
      const r = svg.getBoundingClientRect(); if (!r.width) return;
      const x = (e.clientX - r.left) * (m.W / r.width);
      const p0 = nearestPoint(m.series[0].points, x); if (!p0) return hide();
      const c = svg.querySelector('.cursor'); c.setAttribute('x1', p0.x); c.setAttribute('x2', p0.x); c.setAttribute('opacity', '.8');
      let dots = '', txt = [];
      m.series.forEach((s) => { const p = nearestPoint(s.points, p0.x); if (!p) return; dots += `<circle class="dot ser" style="--sc:${s.color}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5"/>`; txt.push(formatValue(p.v, s.unit)); });
      svg.querySelector('.dots').innerHTML = dots;
      if (tip) { tip.textContent = `${formatTimeLabel(p0.t, m.hours <= 24 ? '24h' : '7d')} · ${txt.join(' · ')}`; tip.hidden = false; tip.style.left = `${Math.min(Math.max(p0.x * r.width / m.W, 60), r.width - 60)}px`; }
    };
    const up = (e) => { if (e.pointerType === 'touch') hide(); };
    svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show);
    svg.addEventListener('pointerleave', hide); svg.addEventListener('pointercancel', hide); svg.addEventListener('pointerup', up);
    this._unbind.push(() => { svg.removeEventListener('pointermove', show); svg.removeEventListener('pointerdown', show); svg.removeEventListener('pointerleave', hide); svg.removeEventListener('pointercancel', hide); svg.removeEventListener('pointerup', up); });
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this._refreshTimer) this._refreshTimer = setInterval(() => { if (!document.hidden) this._load(false); }, 60000);
    if (typeof ResizeObserver !== 'undefined' && !this._ro) { this._ro = new ResizeObserver(() => { const w = this.clientWidth; if (Math.abs(w - this._lastW) >= 24) { this._lastW = w; this._draw(false); } }); this._ro.observe(this); }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }
  getCardSize() { return Math.ceil(this._height() / 50) + 1; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: 'auto'}; }
  static getStubConfig(hass) {
    const id = Object.keys((hass && hass.states) || {}).find((i) => /^sensor\./.test(i)) || 'sensor.exemplu';
    return { title: 'Grafic', range: '24h', tabs: ['24h', '7d'], series: [{ entity: id }] };
  }
}

class CcuFlowCard extends CcuBase {
  constructor() { super(); this._lastW = 0; this._ro = null; }
  _build(cfg) {
    const f = normalizeFlowConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: f.items.map((i) => i.entity) });
    return { config: { ...base.config, entities: f.items, title: f.title }, warnings: f.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _entityIds() { const o = []; for (const e of this._config.entities) { o.push(e.entity); if (e.soc) o.push(e.soc); if (e.sum) o.push(...e.sum); if (e.subtract) o.push(...e.subtract); } return o; }
  _width() { return Math.max(280, (this.clientWidth || (this.parentElement && this.parentElement.clientWidth) || 360) - 24); }
  _html() { return renderFlow(this._config, buildFlowModel(this._config.entities, this._hass), this._width(), { warnings: this._warnings }); }
  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined' && !this._ro) { this._ro = new ResizeObserver(() => { const w = this.clientWidth; if (Math.abs(w - this._lastW) >= 24) { this._lastW = w; this._draw(false); } }); this._ro.observe(this); }
  }
  disconnectedCallback() { super.disconnectedCallback(); if (this._ro) { this._ro.disconnect(); this._ro = null; } }
  getCardSize() { const n = (this._config && this._config.entities.filter((e) => e.kind === 'consumer').length) || 3; return Math.ceil(Math.max(150, n * 46) / 50) + 2; }
  getGridOptions() { return { columns: 12, min_columns: 5, rows: 'auto'}; }
  static getConfigElement() { return document.createElement('ccu-flow-editor'); }
  static getStubConfig(hass) {
    // un card nou pornește cu ce găsim în HA (după unitate W/kW și nume); dacă nu găsim nimic, doar titlul: editorul vizual completează restul
    const f = detectEnergy(hass && hass.states), cfg = { title: 'Energy flow' };
    if (f.solar) cfg.solar = f.solar;
    if (f.grid) cfg.grid = f.grid;
    if (f.battery) cfg.battery = f.soc ? { entity: f.battery, soc: f.soc } : f.battery;
    return cfg;
  }
}

class CcuBatteryCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-battery-editor'); }
  _build(cfg) {
    const b = normalizeBatteryConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: b.config.soc ? [b.config.soc] : [] });
    return { config: { ...base.config, ...b.config, entities: b.config.soc ? [{ entity: b.config.soc, name: b.config.title }] : [] }, warnings: b.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _entityIds() { const c = this._config; return [c.soc, c.capacity_entity, c.load, c.power, c.grid_present].filter(Boolean); }
  _html() { return renderBattery(this._config, buildBatteryModel(this._config, this._hass), { warnings: this._warnings }); }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: 'auto'}; }
  static getStubConfig(hass) {
    const id = Object.keys((hass && hass.states) || {}).find((i) => /^sensor\..*(soc|batter)/.test(i)) || 'sensor.baterie_soc';
    return { soc: id, capacity_kwh: 10, reserve_pct: 20, shutdown_pct: 10 };
  }
}

class CcuBatteriesCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-batteries-editor'); }
  _build(cfg) {
    const b = normalizeBatteriesConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: b.items.map((i) => i.entity) });
    return { config: { ...base.config, entities: b.items, title: b.title, warn_pct: b.warn_pct, low_pct: b.low_pct, sort: b.sort }, warnings: b.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _html() { return renderBatteries(this._config, buildBatteriesModel(this._config, this._hass), { warnings: this._warnings }); }
  getCardSize() { return Math.ceil(((this._config && this._config.entities.length) || 4) * 0.55) + 1; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: 'auto' }; }
  static getStubConfig(hass) { const ids = Object.keys((hass && hass.states) || {}).filter((i) => /^sensor\..*battery/.test(i)).slice(0, 4); return { entities: ids.length ? ids : ['sensor.exemplu_battery'] }; }
}

class CcuPeopleCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-people-editor'); }
  _build(cfg) {
    const p = normalizePeople(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: p.people.map((x) => x.entity) });
    return { config: { ...base.config, entities: p.people, label: p.label, layout: p.layout, title: p.title }, warnings: p.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _html() { return renderPeople(this._config, this._hass, { warnings: this._warnings }); }
  getCardSize() { return this._config && this._config.layout === 'family' ? 3 : 1; }
  getGridOptions() { return { columns: 6, min_columns: 3, rows: 'auto' }; }
  static getStubConfig(hass) { const ids = Object.keys((hass && hass.states) || {}).filter((i) => /^person\./.test(i)).slice(0, 3); return { people: ids.length ? ids : ['person.exemplu'] }; }
}

class CcuWeatherCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-weather-editor'); }
  constructor() { super(); this._forecast = []; this._fcTimer = null; this._fcBusy = false; this._fcAt = 0; }
  _build(cfg) {
    const w = normalizeWeatherConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: w.config.items.map((i) => i.entity) });
    return { config: { ...base.config, ...w.config, entities: w.config.items }, warnings: w.warnings.concat(base.warnings.filter((x) => !/entit|Fără/i.test(x))) };
  }
  // toți senzorii configurați (și cei care nu au tile: rafale, direcție, „se simte ca”, starea ploii) + entitatea weather + soarele
  _entityIds() { const c = this._config; return [...new Set([...Object.values(c.sensors), c.weather, c.sun].filter(Boolean))]; }
  _html() { return renderWeather(this._config, buildWeatherModel(this._config, this._hass, this._forecast, new Date()), { warnings: this._warnings }); }
  setConfig(cfg) { super.setConfig(cfg); this._fcAt = 0; this._forecast = []; this._loadForecast(); }
  set hass(h) { super.hass = h; if (this._config && !this._fcAt) this._loadForecast(); }
  get hass() { return this._hass; }
  // prognoza zilnică: serviciul weather.get_forecasts (cu răspuns); dacă nu merge, atributul „forecast” al entității; reîmprospătată la 30 de minute
  async _loadForecast() {
    const eid = this._config && this._config.weather;
    if (!eid || !this._hass || this._fcBusy) return;
    this._fcBusy = true; this._fcAt = Date.now();
    let list = null;
    try {
      const res = await this._hass.callWS({ type: 'call_service', domain: 'weather', service: 'get_forecasts', service_data: { type: 'daily' }, target: { entity_id: eid }, return_response: true });
      list = res && res.response && res.response[eid] && res.response[eid].forecast;
    } catch (e) { list = null; }
    if (!Array.isArray(list)) { const a = this._hass.states && this._hass.states[eid] && this._hass.states[eid].attributes; list = a && Array.isArray(a.forecast) ? a.forecast : []; }
    this._forecast = list; this._fcBusy = false; this._lastHtml = null; this._draw(false);
  }
  connectedCallback() { super.connectedCallback(); if (!this._fcTimer) this._fcTimer = setInterval(() => { if (!document.hidden && Date.now() - this._fcAt > 1800000) this._loadForecast(); }, 60000); }
  disconnectedCallback() { super.disconnectedCallback(); if (this._fcTimer) { clearInterval(this._fcTimer); this._fcTimer = null; } }
  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: 'auto'}; }
  static getStubConfig(hass) {
    const s = (hass && hass.states) || {};
    const w = Object.keys(s).find((i) => i.startsWith('weather.')) || 'weather.acasa';
    const t = Object.keys(s).find((i) => /^sensor\..*temperature/.test(i)) || 'sensor.temperatura_exterioara';
    return { title: 'Vremea', weather: w, sensors: { temperature: t } };
  }
}

class CcuNavCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-nav-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: [] });
    const n = normalizeNav(cfg);
    config.items = n.items;
    config.sticky = !!(cfg && cfg.sticky === true);
    config.labels = !(cfg && cfg.labels === false);   // labels: false = doar iconițe
    config.compact = !!(cfg && cfg.compact === true); // capsulă îngustă, centrată (în loc de bară pe toată lățimea)
    config.spacer = !(cfg && cfg.spacer === false);   // spacer: false = fără spațiul gol rezervat sub bara fixă
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  setConfig(cfg) { super.setConfig(cfg); this.toggleAttribute('data-sticky', !!this._config.sticky); }
  _entityIds() { return (this._config.items || []).flatMap((it) => [...(it.badge || []), ...(it.visible_if ? [it.visible_if.entity] : [])]); }
  _path() { return (typeof location !== 'undefined' && location.pathname) || ''; }
  _html() { return renderNav(this._config, this._path(), { warnings: this._warnings, hass: this._hass }); }
  _actionFor(idx) { const it = (this._config.items || [])[Number(idx)]; return it ? { action: 'navigate', path: it.path } : null; }
  // meniul: simplu `click` (instant, fără așteptare de hold / double-tap); Enter/Space merg natural pe <button>
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    this._mount.querySelectorAll('.ccu-nav-item').forEach((el) => {
      const go = () => {
        const it = (this._config.items || [])[Number(el.getAttribute('data-id'))];
        if (it && it.back) { try { window.history.back(); } catch (e) { /* fără istoric */ } return; }
        this._fire(el.getAttribute('data-id'), 'tap', el);
      };
      el.addEventListener('click', go);
      this._unbind.push(() => el.removeEventListener('click', go));
    });
  }
  connectedCallback() {
    super.connectedCallback();
    this._onLoc = () => this._draw(false);
    window.addEventListener('location-changed', this._onLoc); window.addEventListener('popstate', this._onLoc);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._onLoc) { window.removeEventListener('location-changed', this._onLoc); window.removeEventListener('popstate', this._onLoc); this._onLoc = null; }
  }
  _fire(idx, kind, el) { if (kind === 'tap') { super._fire(idx, kind, el); setTimeout(() => this._draw(false), 50); } }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { items: [{ icon: 'home', label: 'Home', path: '/lovelace/0' }] }; }
}

class CcuHeaderCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-header-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: [] });
    const h = normalizeHeader(cfg?.header ?? cfg);
    config.header = h.header;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(h.warnings) };
  }
  _entityIds() { const h = this._config.header; return h.values.map((v) => v.entity).concat(h.right ? [h.right.entity] : []); }
  _hasClock() { return !!(this._config && this._config.header.clock); }
  _html(now) { return renderHeader(this._config, this._hass, now, { warnings: this._warnings }); }
  setConfig(cfg) { super.setConfig(cfg); if (this.isConnected && this._hasClock() && !this._clock) this._clock = setInterval(() => this._draw(false), CLOCK_MS); }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { header: { icon: 'home', values: [], clock: true } }; }
}

// ---------------------------------------------------------------- controale: termostat, lumină, număr, selector
class CcuControlsCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-controls-editor'); }
  _build(cfg) {
    const n = normalizeControls(cfg);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: n.items.map((i) => ({ entity: i.entity })) });
    config.items = n.items; config.columns = n.columns; config.ctitle = n.title;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _html() { return renderControls(this._config, this._hass, { warnings: this._warnings, optim: this._optim || {} }); }
  _draw(force) { if (this._drag) return; super._draw(force); this._syncSelects(); }
  _syncSelects() { this._mount.querySelectorAll('select.sel').forEach((s) => { const c = s.getAttribute('data-cur'); if (c && s.value !== c && this._root.activeElement !== s) s.value = c; }); }
  // valoare trimisă „optimist”: rămâne afișată până vine starea nouă din HA
  _setOptim(i, v) {
    this._optim = this._optim || {}; this._tm = this._tm || {};
    this._optim[i] = v;
    clearTimeout(this._tm['o' + i]); this._tm['o' + i] = setTimeout(() => { if (this._optim) delete this._optim[i]; this._draw(false); }, 3000);
  }
  _call(domain, service, data) { if (this._hass && this._hass.callService) this._hass.callService(domain, service, data); }
  _moveSlider(e) {
    const d = this._drag; if (!d) return;
    const r = d.el.getBoundingClientRect();
    const min = Number(d.el.getAttribute('data-min')), max = Number(d.el.getAttribute('data-max')), step = Number(d.el.getAttribute('data-step'));
    const v = sliderValue(r.width ? (e.clientX - r.left) / r.width : 0, min, max, step);
    d.val = v;
    const pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
    const fl = d.el.querySelector('.fl'), th = d.el.querySelector('.th'), sv = d.el.querySelector('.sv');
    if (fl) fl.style.width = pct.toFixed(1) + '%'; if (th) th.style.left = pct.toFixed(1) + '%';
    const unit = d.el.getAttribute('data-unit');
    const txt = d.sub === 'ct' ? `${v} K` : d.kind === 'light' || d.kind === 'fan' || d.kind === 'media' ? `${v}%` : `${formatNumber(v)}${unit ? ' ' + unit : ''}`;
    if (sv) sv.textContent = txt;
    const cur = d.el.closest('.ctl') && d.el.closest('.ctl').querySelector('.cur'); if (cur) cur.textContent = txt;
  }
  _commitSlider() {
    const d = this._drag; this._drag = null;
    if (!d || d.val === undefined) return;
    const it = (this._config.items || [])[d.i]; if (!it) return;
    this._setOptim(d.sub === 'ct' ? d.i + 'c' : d.i, d.val);
    if (d.sub === 'ct') this._call('light', 'turn_on', { entity_id: it.entity, color_temp_kelvin: d.val });
    else if (d.kind === 'light') { if (d.val <= 0) this._call('light', 'turn_off', { entity_id: it.entity }); else this._call('light', 'turn_on', { entity_id: it.entity, brightness_pct: d.val }); }
    else if (d.kind === 'fan') { if (d.val <= 0) this._call('fan', 'turn_off', { entity_id: it.entity }); else this._call('fan', 'set_percentage', { entity_id: it.entity, percentage: d.val }); }
    else if (d.kind === 'media') this._call('media_player', 'volume_set', { entity_id: it.entity, volume_level: Math.round(d.val) / 100 });
    else this._call(it.entity.split('.')[0], 'set_value', { entity_id: it.entity, value: d.val });
    this._draw(false);
  }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    const m = this._mount;
    const idxOf = (el) => { const t = el.closest('[data-id]'); return t ? Number(t.getAttribute('data-id')) : -1; };
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.getAttribute('data-act');
      if (act === 'slider' || act === 'select') return;
      const i = idxOf(b), it = (this._config.items || [])[i]; if (!it) return;
      e.preventDefault();
      if (act === 'toggle') toggleEntity(this._hass, it.entity);
      else if (act === 'swatch') {
        const k = b.getAttribute('data-k'), rgb = b.getAttribute('data-rgb');
        if (k) this._call('light', 'turn_on', { entity_id: it.entity, color_temp_kelvin: Number(k) });
        else if (rgb) this._call('light', 'turn_on', { entity_id: it.entity, rgb_color: rgb.split(',').map(Number) });
      }
      else if (act === 'preset') this._call('fan', 'set_preset_mode', { entity_id: it.entity, preset_mode: b.getAttribute('data-val') });
      else if (act === 'mprev') this._call('media_player', 'media_previous_track', { entity_id: it.entity });
      else if (act === 'mnext') this._call('media_player', 'media_next_track', { entity_id: it.entity });
      else if (act === 'mpp') this._call('media_player', 'media_play_pause', { entity_id: it.entity });
      else if (act === 'mvu') this._call('media_player', 'volume_up', { entity_id: it.entity });
      else if (act === 'mvd') this._call('media_player', 'volume_down', { entity_id: it.entity });
      else if (act === 'mmute') { const s0 = this._hass && this._hass.states && this._hass.states[it.entity]; this._call('media_player', 'volume_mute', { entity_id: it.entity, is_volume_muted: !(s0 && s0.attributes && s0.attributes.is_volume_muted) }); }
      else if (act === 'more') runAction(this._hass, b, { action: 'more-info', entity: it.entity });
      else if (act === 'mode') this._call('climate', 'set_hvac_mode', { entity_id: it.entity, hvac_mode: b.getAttribute('data-val') });
      else if (act === 'cfan') this._call('climate', 'set_fan_mode', { entity_id: it.entity, fan_mode: b.getAttribute('data-val') });
      else if (act === 'cswing') this._call('climate', 'set_swing_mode', { entity_id: it.entity, swing_mode: b.getAttribute('data-val') });
      else if (act === 'cpreset') this._call('climate', 'set_preset_mode', { entity_id: it.entity, preset_mode: b.getAttribute('data-val') });
      else if (act === 'inc' || act === 'dec') {
        const mod = controlModel(it, this._hass && this._hass.states && this._hass.states[it.entity], this._optim && this._optim[i]);
        const dir = act === 'inc' ? 1 : -1;
        const clampT = (x) => { let y = x; if (mod.min !== null) y = Math.max(mod.min, y); if (mod.max !== null) y = Math.min(mod.max, y); return Math.round(y * 100) / 100; };
        let data;
        if (mod.range && mod.range[0] !== null && mod.range[1] !== null) { const r = [clampT(mod.range[0] + dir * mod.step), clampT(mod.range[1] + dir * mod.step)]; this._setOptim(i, r); data = { entity_id: it.entity, target_temp_low: r[0], target_temp_high: r[1] }; }
        else if (mod.tgt !== null) { const v = clampT(mod.tgt + dir * mod.step); this._setOptim(i, v); data = { entity_id: it.entity, temperature: v }; }
        else return;
        this._draw(false);
        this._tm = this._tm || {}; clearTimeout(this._tm['s' + i]);
        this._tm['s' + i] = setTimeout(() => this._call('climate', 'set_temperature', data), 600);   // mai multe atingeri → o singură comandă
      }
    });
    m.addEventListener('pointerdown', (e) => {
      const sl = e.target.closest('.sl'); if (!sl) return;
      const i = idxOf(sl), it = (this._config.items || [])[i]; if (!it) return;
      this._drag = { el: sl, i, kind: it.kind, sub: sl.getAttribute('data-sub') || '' };
      try { sl.setPointerCapture(e.pointerId); } catch (err) { /* fără capture */ }
      this._moveSlider(e);
    });
    m.addEventListener('pointermove', (e) => { if (this._drag) this._moveSlider(e); });
    const end = () => this._commitSlider();
    m.addEventListener('pointerup', end); m.addEventListener('pointercancel', () => { this._drag = null; this._draw(true); });
    m.addEventListener('change', (e) => {
      const s = e.target.closest && e.target.closest('select.sel'); if (!s) return;
      const it = (this._config.items || [])[idxOf(s)]; if (!it) return;
      this._call(it.entity.split('.')[0], 'select_option', { entity_id: it.entity, option: s.value });
    });
  }
  getCardSize() { return Math.max(2, (this._config ? this._config.items.length : 1) * 1.2); }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((i) => /^(climate|light)\./.test(i)).slice(0, 2);
    return { items: ids.length ? ids : ['light.exemplu'] };
  }
}

class CcuTitleCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-title-editor'); }
  _allowEmpty = true;
  _build(cfg) { const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: [] }); config.t = normalizeTitle(cfg); return { config, warnings: warnings.filter((w) => !/entit/i.test(w)) }; }
  _entityIds() { return []; }
  _html() { return renderTitle(this._config.t); }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { title: 'Titlu', subtitle: 'subtitlu' }; }
}

// ---------------------------------------------------------------- telecomandă TV (remote.send_command)
class CcuRemoteCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-remote-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const n = normalizeRemote(cfg);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: n.entity ? [{ entity: n.entity }] : [] });
    config.remote = n;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _entityIds() { return this._config.remote.entity ? [this._config.remote.entity] : []; }
  _html() { return renderRemote(this._config.remote, this._hass, { warnings: this._warnings }); }
  _send(cmd) { if (this._hass && this._hass.callService && this._config.remote.entity) this._hass.callService('remote', 'send_command', { entity_id: this._config.remote.entity, command: cmd }); }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    let rep = null, started = false;
    const stop = () => { if (rep) { clearInterval(rep); rep = null; } };
    this._mount.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.rk'); if (!b) return;
      started = true; this._send(b.getAttribute('data-cmd'));
      if (b.hasAttribute('data-repeat')) { stop(); const t = setTimeout(() => { rep = setInterval(() => this._send(b.getAttribute('data-cmd')), 220); }, 450); this._unbind.push(() => clearTimeout(t)); b._t = t; }
    });
    const up = (e) => { const b = e.target.closest && e.target.closest('.rk'); if (b && b._t) clearTimeout(b._t); stop(); };
    this._mount.addEventListener('pointerup', up); this._mount.addEventListener('pointercancel', up); this._mount.addEventListener('pointerleave', up);
    this._mount.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const b = e.target.closest('.rk'); if (b) { e.preventDefault(); this._send(b.getAttribute('data-cmd')); } });
  }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { entity: 'remote.living_room_tv' }; }
}

class CcuRadioCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-radio-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const n = normalizeRadio(cfg);
    const ids = [n.stations, n.playing, n.player, ...n.speakers].filter(Boolean);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: ids.map((e) => ({ entity: e })) });
    config.radio = n;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _entityIds() { const r = this._config.radio; return [r.stations, r.playing, r.player, ...r.speakers].filter(Boolean); }
  _html() { return renderRadio(this._config.radio, this._hass, { warnings: this._warnings, optim: { ...(this._opt || {}), speaker: this._speakerSel() } }); }
  // boxa aleasă rămâne memorată pe dispozitiv (localStorage), ca la următoarea deschidere să fie aceeași
  _speakerKey() { const r = this._config.radio; return 'ccu-radio:' + (r.stations || '') + ':' + r.speakers.join(','); }
  _speakerSel() { if (this._sel === undefined) { try { this._sel = localStorage.getItem(this._speakerKey()) || ''; } catch (e) { this._sel = ''; } } return this._sel; }
  _draw(force) { if (this._drag) return; super._draw(force); }
  _call(domain, service, data) { if (this._hass && this._hass.callService) this._hass.callService(domain, service, data); }
  // valoare trimisă „optimist”: rămâne afișată ~3,5 s, până revine starea din HA
  _optim(k, v) {
    this._opt = this._opt || {}; this._tm = this._tm || {};
    this._opt[k] = v;
    clearTimeout(this._tm[k]); this._tm[k] = setTimeout(() => { if (this._opt) delete this._opt[k]; this._draw(false); }, 3500);
    this._draw(false);
  }
  _model() { return radioModel(this._config.radio, this._hass, { ...(this._opt || {}), speaker: this._speakerSel() }); }
  /** Pornește un script / buton / scenă (șir) sau o acțiune completă (obiect). */
  _trigger(spec, el) {
    if (!spec) return false;
    if (typeof spec === 'object') { runAction(this._hass, el, spec); return true; }
    const d = spec.split('.')[0];
    if (d === 'button' || d === 'input_button') this._call(d, 'press', { entity_id: spec });
    else if (d === 'script' || d === 'scene') this._call(d, 'turn_on', { entity_id: spec });
    else if (d === 'automation') this._call('automation', 'trigger', { entity_id: spec });
    else toggleEntity(this._hass, spec);
    return true;
  }
  /** Pornește postul ales pe boxa țintă: scriptul tău (pe boxa principală) sau, altfel, direct `play_media` cu adresa din numele opțiunii. */
  _start(m, el) {
    const r = this._config.radio;
    if (m.speaker === r.player && r.play && this._trigger(r.play, el)) return;
    const url = stationUrl(m.value, r.strip);
    if (m.speaker && url) this._call('media_player', 'play_media', { entity_id: m.speaker, media_content_id: url, media_content_type: 'music' });
    else if (m.speaker) this._call('media_player', 'media_play', { entity_id: m.speaker });
    else if (r.play) this._trigger(r.play, el);
  }
  _power(el) {
    const r = this._config.radio, m = this._model(), on = !m.playing;
    this._optim('play', on);
    if (on) { this._start(m, el); return; }
    if (m.speaker === r.player && r.stop && this._trigger(r.stop, el)) return;
    if (m.speaker) this._call('media_player', 'media_stop', { entity_id: m.speaker });
    else if (r.playing) this._call(r.playing.split('.')[0], 'turn_off', { entity_id: r.playing });
  }
  _station(value, el) {
    const r = this._config.radio; if (!r.stations || value === undefined) return;
    this._optim('station', value);
    this._call(r.stations.split('.')[0], 'select_option', { entity_id: r.stations, option: value });
    if (this._model().playing) { clearTimeout(this._tm.restart); this._tm.restart = setTimeout(() => this._start(this._model(), el), 700); }   // în timpul redării, noul post pornește singur
  }
  _speaker(id) { this._sel = id; try { localStorage.setItem(this._speakerKey(), id); } catch (e) { /* fără stocare */ } this._draw(true); }
  _step(d, el) {
    const m = this._model(); if (m.stations.length < 2) return;
    const i = m.idx < 0 ? (d > 0 ? 0 : m.stations.length - 1) : (m.idx + d + m.stations.length) % m.stations.length;
    this._station(m.stations[i].value, el);
  }
  _moveVol(e) {
    const d = this._drag; if (!d) return;
    const rc = d.el.getBoundingClientRect(), v = Math.round(Math.min(1, Math.max(0, rc.width ? (e.clientX - rc.left) / rc.width : 0)) * 100);
    d.val = v;
    const fl = d.el.querySelector('.fl'), th = d.el.querySelector('.th'), sv = d.el.querySelector('.sv');
    if (fl) fl.style.width = v + '%'; if (th) th.style.left = v + '%'; if (sv) sv.textContent = v + '%';
  }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    const m = this._mount;
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      const act = b.getAttribute('data-act');
      if (act === 'power') this._power(b);
      else if (act === 'station') this._station(b.getAttribute('data-val'), b);
      else if (act === 'prev') this._step(-1, b);
      else if (act === 'next') this._step(1, b);
      else if (act === 'speaker') this._speaker(b.getAttribute('data-val'));
    });
    m.addEventListener('pointerdown', (e) => {
      const v = e.target.closest('.rd-vol'); if (!v) return;
      this._drag = { el: v };
      try { v.setPointerCapture(e.pointerId); } catch (err) { /* fără capture */ }
      this._moveVol(e);
    });
    m.addEventListener('pointermove', (e) => { if (this._drag) this._moveVol(e); });
    m.addEventListener('pointerup', () => {
      const d = this._drag; this._drag = null;
      const sp = this._model().speaker; if (d && d.val !== undefined && sp) this._call('media_player', 'volume_set', { entity_id: sp, volume_level: d.val / 100 });
      this._draw(true);
    });
    m.addEventListener('pointercancel', () => { this._drag = null; this._draw(true); });
  }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, min_columns: 5, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys((hass && hass.states) || {});
    const sel = ids.find((i) => /^(input_select|select)\..*radio/.test(i)) || ids.find((i) => /^(input_select|select)\./.test(i)) || 'input_select.radio';
    const mp = ids.find((i) => /^media_player\./.test(i));
    return mp ? { title: 'Radio', stations: sel, player: mp } : { title: 'Radio', stations: sel };
  }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get('ccu-buttons-card')) customElements.define('ccu-buttons-card', CcuButtonsCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-chips-card')) customElements.define('ccu-chips-card', CcuChipsCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-header-card')) customElements.define('ccu-header-card', CcuHeaderCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-nav-card')) customElements.define('ccu-nav-card', CcuNavCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-people-card')) customElements.define('ccu-people-card', CcuPeopleCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-batteries-card')) customElements.define('ccu-batteries-card', CcuBatteriesCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-weather-card')) customElements.define('ccu-weather-card', CcuWeatherCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-graph-card')) customElements.define('ccu-graph-card', CcuGraphCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-flow-card')) customElements.define('ccu-flow-card', CcuFlowCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-battery-card')) customElements.define('ccu-battery-card', CcuBatteryCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-controls-card')) customElements.define('ccu-controls-card', CcuControlsCard);
  if (!customElements.get('ccu-title-card')) customElements.define('ccu-title-card', CcuTitleCard);
  if (!customElements.get('ccu-remote-card')) customElements.define('ccu-remote-card', CcuRemoteCard);
  if (!customElements.get('ccu-radio-card')) customElements.define('ccu-radio-card', CcuRadioCard);
  defineEditors();
  const reg = (type, name, description) => { (window.customCards = window.customCards || []).push({ type, name, description, preview: false }); };
  reg('ccu-buttons-card', 'Calm Modern — Buttons', 'Grid of tiles (xs–xl) with states, colors and subtle animated icons.');
  reg('ccu-chips-card', 'Calm Modern — Chips', 'Row of status chips; they can appear only when active.');
  reg('ccu-flow-card', 'Calm Modern — Energy flow', 'Solar, grid and battery → consumers, with percentages and statistics.');
  reg('ccu-battery-card', 'Calm Modern — Battery', 'Battery bar with thresholds, runtime and backup state.');
  reg('ccu-graph-card', 'Calm Modern — Graph', 'History with 1–3 series and a value on touch.');
  reg('ccu-weather-card', 'Calm Modern — Weather', 'Values from your weather station, daily forecast and an animated scene (rain, snow, sleet, wind, storm).');
  reg('ccu-batteries-card', 'Calm Modern — Device batteries', 'Battery levels of phones, tablets and cars, sorted ascending, with a bar.');
  reg('ccu-people-card', 'Calm Modern — People', 'Overlapping avatars (or a family layout): who is home gets a green ring.');
  reg('ccu-nav-card', 'Calm Modern — Navigation bar', 'Navigation bar with icons and labels; sticky, compact, back button, badges.');
  reg('ccu-controls-card', 'Calm Modern — Controls', 'Thermostat dial, lights with brightness and colors, fan, media player, number slider and selector.');
  reg('ccu-remote-card', 'Calm Modern — Remote', 'TV remote (remote.send_command): power, volume, channels, menu and arrows.');
  reg('ccu-radio-card', 'Calm Modern — Radio', 'Radio with a tuning dial, equalizer display, previous / next station, play / stop and volume.');
  reg('ccu-title-card', 'Calm Modern — Title', 'Section title with icon and subtitle.');
  reg('ccu-header-card', 'Calm Modern — Header', 'Icon, up to 3 values and a clock or outdoor value in one row.');
}

export { CcuControlsCard, CcuTitleCard, CcuRemoteCard, CcuButtonsCard, CcuChipsCard, CcuHeaderCard, CcuNavCard, CcuGraphCard, CcuFlowCard, CcuBatteryCard, CcuPeopleCard, CcuWeatherCard, CcuBatteriesCard };
