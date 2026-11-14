// src/radio.mjs — cardul ccu-radio-card: radio cu scală de acordaj, ecran cu echalizator, post anterior / următor, play / stop și volum.
// Funcții PURE (normalizare, model, șablon HTML). Interacțiunea (atingeri, volum) e în cards.mjs (CcuRadioCard).
import { t } from './i18n.mjs';
import { esc } from './render.mjs';
import { iconSvg } from './icons.mjs';

const ID = /^[a-z_]+\.[a-z0-9_]+$/;
const dom = (id) => String(id || '').split('.')[0];

/** Config → { stations, playing, play, stop, player, title, hide, strip, labels }. `play` / `stop`: entitate (script, buton) sau o acțiune { action: call-service, … }. */
export function normalizeRadio(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [];
  const ent = (k, domains) => {
    const v = src[k];
    if (v === undefined || v === null || v === '') return '';
    if (typeof v !== 'string' || !ID.test(v)) { warnings.push(t('Radio: „{k}” nu e un entity_id valid.', { k })); return ''; }
    if (domains && !domains.includes(dom(v))) { warnings.push(t('Radio: „{k}” trebuie să fie din domeniul {d}.', { k, d: domains.join(' / ') })); return ''; }
    return v;
  };
  const act = (k) => { const v = src[k]; if (!v) return null; if (typeof v === 'string') return ID.test(v) ? v : null; return typeof v === 'object' && v.action ? v : null; };
  const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(String).filter(Boolean);
  const stations = ent('stations', ['select', 'input_select']);
  if (!stations) warnings.push(t('Radio: lipsește „stations” (un select cu posturile).'));
  const speakers = list(src.speakers).filter((x) => ID.test(x) && dom(x) === 'media_player');
  return {
    speakers, stations, playing: ent('playing'), player: ent('player', ['media_player']), play: act('play'), stop: act('stop'),
    title: src.title ? String(src.title) : '', hide: list(src.hide), strip: typeof src.strip_after === 'string' ? src.strip_after : ' - ',
    labels: src.labels && typeof src.labels === 'object' ? src.labels : {}, warnings,
  };
}

/** Adresa fluxului dintr-o opțiune de tip „Nume - https://…” (sau șir gol). */
export function stationUrl(option, strip) {
  const o = String(option || ''), sep = strip || ' - ', i = o.indexOf(sep);
  const u = (i >= 0 ? o.slice(i + sep.length) : o).trim();
  return /^https?:\/\/\S+$/i.test(u) ? u : '';
}

/** Modelul din config + starea HA (+ valori „optimiste” dintr-o atingere recentă: { play, station }). */
export function radioModel(c, hass, opt) {
  const o = opt || {}, S = (id) => (id && hass && hass.states ? hass.states[id] : undefined);
  const sel = S(c.stations), options = (sel && sel.attributes && Array.isArray(sel.attributes.options) ? sel.attributes.options : []).map(String);
  const hide = c.hide.map((x) => x.toLowerCase());
  const label = (v) => c.labels[v] || (c.strip && v.includes(c.strip) ? v.split(c.strip)[0] : v).trim();
  const stations = options.filter((v) => !hide.some((h) => v.toLowerCase().includes(h))).map((v) => ({ value: v, label: label(v) }));
  const cur = o.station !== undefined ? o.station : sel ? String(sel.state) : '';
  let idx = stations.findIndex((s) => s.value === cur);
  // boxa țintă: cea aleasă din butoane (opt.speaker), altfel `player`, altfel prima din `speakers`
  const ids = c.speakers.length ? c.speakers : c.player ? [c.player] : [];
  const sp = o.speaker && ids.includes(o.speaker) ? o.speaker : c.player || ids[0] || '';
  const pl = S(sp), pst = sp === c.player ? S(c.playing) : undefined;
  const playerGone = !!sp && (!pl || pl.state === 'unavailable');
  let playing = o.play !== undefined ? o.play : pst ? ['on', 'playing'].includes(pst.state) : pl ? pl.state === 'playing' : false;
  const a = (pl && pl.attributes) || {};
  const vol = pl && !playerGone && typeof a.volume_level === 'number' && ((Number(a.supported_features) || 0) & 4) ? Math.round(a.volume_level * 100) : null;
  const speakers = ids.map((id) => { const x = S(id), gone = !x || x.state === 'unavailable'; return { id, name: (x && x.attributes && x.attributes.friendly_name) || id.split('.')[1].replace(/_/g, ' '), state: gone ? 'na' : x.state === 'playing' ? 'play' : 'idle', active: id === sp }; });
  const mt = pl && pl.state === 'playing' && a.media_title ? String(a.media_title) : '';
  const now = mt ? (a.media_artist ? a.media_artist + ' — ' + mt : mt) : '';
  stations.forEach((s, i) => { s.x = ((i + 0.5) / stations.length) * 100; s.active = i === idx; });
  return { speakers, speaker: sp, now, value: idx >= 0 ? stations[idx].value : cur, stations, idx, name: idx >= 0 ? stations[idx].label : cur && !hide.some((h) => cur.toLowerCase().includes(h)) ? label(cur) : '', playing, playerGone, vol, needle: idx >= 0 ? stations[idx].x : null, gone: !sel };
}

export function renderRadio(c, hass, opts = {}) {
  const m = radioModel(c, hass, opts.optim);
  const state = m.gone ? 'na' : m.playing ? 'play' : 'stop';
  const sub = m.playerGone ? t('Playerul nu răspunde') : m.playing ? t('Redă') : t('Oprit');
  const bars = [0, 1, 2, 3, 4, 5, 6].map((i) => `<i style="--d:${[0.9, 0.55, 1.1, 0.7, 1.0, 0.6, 0.85][i]}s;--o:${(i * 0.13).toFixed(2)}s"></i>`).join('');
  const stationBtns = m.stations.map((s) => `<button type="button" class="st${s.active ? ' on' : ''}" data-act="station" data-val="${esc(s.value)}" style="left:${s.x.toFixed(1)}%" aria-pressed="${s.active ? 'true' : 'false'}" aria-label="${esc(s.label)}"><i></i><span>${esc(s.label)}</span></button>`).join('');
  const dial = m.stations.length ? `<div class="rd-dial"><div class="rd-ticks"></div>${m.needle !== null ? `<div class="rd-needle" style="left:${m.needle.toFixed(1)}%"></div>` : ''}${stationBtns}</div>` : '';
  const vol = m.vol !== null ? `<div class="rd-vol" data-act="vol" role="slider" aria-label="${t('Volum')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.vol}"><span class="fl" style="width:${m.vol}%"></span><span class="th" style="left:${m.vol}%"></span><span class="ico ccu-ico">${iconSvg('volup')}</span><span class="sv">${m.vol}%</span></div>` : '';
  const spk = m.speakers.length > 1 ? `<div class="rd-spk" role="group" aria-label="${t('Boxe')}">${m.speakers.map((x) => `<button type="button" class="sp${x.active ? ' on' : ''}" data-act="speaker" data-val="${esc(x.id)}" data-s="${x.state}" aria-pressed="${x.active ? 'true' : 'false'}"><span class="ccu-ico">${iconSvg('volup')}</span><span>${esc(x.name)}</span><i></i></button>`).join('')}</div>` : '';
  const many = m.stations.length > 1;
  const nav = (cls, act, icon, label) => `<button type="button" class="rd-b ${cls}" data-act="${act}" aria-label="${label}"${many ? '' : ' disabled'}><span class="ccu-ico">${iconSvg(icon)}</span></button>`;
  const knob = `<button type="button" class="rd-knob" data-act="power" aria-label="${m.playing ? t('Oprește') : t('Pornește')}"><span class="ccu-ico">${iconSvg(m.playing ? 'stop' : 'play')}</span></button>`;
  const title = c.title ? `<div class="ccu-title">${esc(c.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-radio" data-state="${state}" data-run="${m.playing ? 1 : 0}">${title}`
    + `<div class="rd-lcd"><span class="ccu-ico rd-ico">${iconSvg('radio')}</span><div class="rd-info"><b>${esc(m.name || t('Radio'))}</b><small>${esc(m.now && !m.playerGone ? m.now : sub)}</small></div><div class="rd-eq" aria-hidden="true">${bars}</div></div>`
    + `${dial}${spk}<div class="rd-ctl">${nav('pv', 'prev', 'prev', t('Postul anterior'))}${knob}${nav('nx', 'next', 'next', t('Postul următor'))}${vol}</div>${notes}</div>`;
}
