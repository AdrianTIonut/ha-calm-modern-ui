// tests/controls.test.mjs — controls.mjs (normalizare, model, șabloane, slider). Rulare: node tests/controls.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { normalizeControls, controlModel, renderControls, sliderValue, normalizeTitle, renderTitle, normalizeRemote, renderRemote, arcFrac } from '../src/controls.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const st = (state, attributes = {}, id) => ({ entity_id: id, state, attributes });
const nb = (s) => String(s).replace(/ | /g, ' ');

const H = { states: {
  'climate.s': st('heat', { current_temperature: 24.5, temperature: 22, hvac_modes: ['off', 'heat', 'cool', 'auto'], hvac_action: 'heating', min_temp: 16, max_temp: 30, target_temp_step: 0.5 }),
  'climate.off': st('off', { current_temperature: 20, temperature: 21, hvac_modes: ['off', 'heat'] }),
  'light.a': st('on', { brightness: 128, supported_color_modes: ['rgb'] }),
  'light.b': st('on', { supported_color_modes: ['onoff'] }),
  'light.c': st('off', { supported_color_modes: ['brightness'] }),
  'number.n': st('30', { min: 0, max: 120, step: 5, unit_of_measurement: 'min' }),
  'select.p': st('eco', { options: ['eco', 'intensiv_70', 'rapid'] }),
  'light.gone': st('unavailable'),
} };

t('normalizare: kind din domeniu; domeniu necunoscut / entity invalid avertizate', () => { const n = normalizeControls({ items: ['climate.s', 'light.a', 'number.n', 'input_number.x', 'select.p', 'input_select.y', 'sensor.z', 'xx'] }); return n.items.length === 6 && n.items.map((i) => i.kind).join() === 'climate,light,number,number,select,select' && n.warnings.length === 2 || JSON.stringify(n); });
t('normalizare: coloane 1–3, maxim 12 controale', () => normalizeControls({ columns: 9, items: ['light.a'] }).columns === 3 && normalizeControls({ items: Array.from({ length: 15 }, (_, i) => 'light.l' + i) }).items.length === 12 || 'lim');
t('climate: model (curent, țintă, moduri RO, acțiune)', () => { const m = controlModel({ entity: 'climate.s', kind: 'climate' }, H.states['climate.s']); return m.on && m.cur === 24.5 && m.tgt === 22 && m.step === 0.5 && m.modes.length === 4 && m.modes[1].label === 'Încălzire' && m.min === 16 || JSON.stringify(m); });
t('climate: valoare optimistă înlocuiește ținta; oprit → on=false', () => controlModel({ entity: 'climate.s', kind: 'climate' }, H.states['climate.s'], 23.5).tgt === 23.5 && controlModel({ entity: 'climate.off', kind: 'climate' }, H.states['climate.off']).on === false || 'opt');
t('light: luminozitate în % (128/255 ≈ 50), dim după color modes, culoare', () => { const a = controlModel({ entity: 'light.a', kind: 'light' }, H.states['light.a']); const b = controlModel({ entity: 'light.b', kind: 'light' }, H.states['light.b']); return a.pct === 50 && a.dim && a.color && !b.dim && b.pct === 100 || JSON.stringify([a, b]); });
t('light: oprit → 0%; indisponibil → gone', () => controlModel({ entity: 'light.c', kind: 'light' }, H.states['light.c']).pct === 0 && controlModel({ entity: 'light.gone', kind: 'light' }, H.states['light.gone']).gone === true || 'off');
t('number: min/max/pas/unitate din atribute', () => { const m = controlModel({ entity: 'number.n', kind: 'number' }, H.states['number.n']); return m.v === 30 && m.min === 0 && m.max === 120 && m.step === 5 && m.unit === 'min' || JSON.stringify(m); });
t('select: opțiuni și valoare curentă', () => { const m = controlModel({ entity: 'select.p', kind: 'select' }, H.states['select.p']); return m.cur === 'eco' && m.options.length === 3 || JSON.stringify(m); });
t('sliderValue: rotunjire la pas și limite', () => sliderValue(0.5, 0, 100, 1) === 50 && sliderValue(0.37, 0, 120, 5) === 45 && sliderValue(-1, 10, 20, 1) === 10 && sliderValue(2, 10, 20, 1) === 20 && sliderValue(NaN, 0, 100, 1) === 0 || 'sv');

const cfg = (o) => { const n = normalizeControls(o); return { items: n.items, columns: n.columns, ctitle: n.title }; };
t('render climate: țintă, curent, +/−, moduri cu starea curentă, data-mode', () => { const h = nb(renderControls(cfg({ items: [{ entity: 'climate.s', name: 'Sufragerie' }] }), H)); return h.includes('Sufragerie') && h.includes('22,0°') && h.includes('24,5°') && h.includes('data-act="inc"') && h.includes('data-act="dec"') && h.includes('data-val="heat" data-state="on"') && h.includes('data-mode="heat"') && h.includes('Răcire') || h.slice(0, 400); });
t('render light: slider cu 50% doar când dimabil; on/off = plăcuță simplă ccu-btn, fără slider', () => { const a = renderControls(cfg({ items: ['light.a'] }), H); const b = renderControls(cfg({ items: ['light.b'] }), H); return a.includes('class="sl"') && a.includes('width:50.0%') && a.includes('data-act="more"') && !b.includes('class="sl"') && b.includes('ccu-btn') && b.includes('Pornit') || b; });
t('render number: slider cu min/max/pas/unitate', () => { const h = renderControls(cfg({ items: ['number.n'] }), H); return h.includes('data-min="0"') && h.includes('data-max="120"') && h.includes('data-step="5"') && h.includes('data-unit="min"') && h.includes('width:25.0%') || h; });
t('render select: <select> cu opțiunile, „selected” pe cea curentă, etichete traduse', () => { const h = renderControls(cfg({ items: [{ entity: 'select.p', labels: { eco: 'Eco' } }] }), H); return h.includes('<select') && h.includes('value="eco" selected>Eco</option>') && h.includes('Intensiv 70') || h; });
t('render: indisponibil → data-state=unavailable; fără hass nu aruncă; nume periculos scăpat', () => { const h = renderControls(cfg({ items: ['light.gone'] }), H); const g = renderControls(cfg({ items: ['climate.s'] }), null); const x = renderControls(cfg({ items: [{ entity: 'light.a', name: '<img src=x onerror=1>' }] }), H); return h.includes('unavailable') && g.includes('ctl') && !x.includes('<img src=x') || 'safe'; });
t('render: valori optimiste (slider și termostat)', () => { const h = nb(renderControls(cfg({ items: ['light.a', 'climate.s'] }), H, { optim: { 0: 80, 1: 25 } })); return h.includes('width:80.0%') && h.includes('25,0°') || 'optim'; });
t('titlu: normalizare + șablon cu escape', () => { const h = renderTitle(normalizeTitle({ title: 'Bucătărie <b>', subtitle: 'sus', icon: 'home' })); return h.includes('Bucătărie &lt;b&gt;') && h.includes('<small>sus</small>') && h.includes('<svg') || h; });


// ---- ventilator, media, telecomandă ----
const H2 = { states: {
  'fan.p': st('on', { percentage: 40, percentage_step: 20, preset_modes: ['auto', 'night', 'boost'], preset_mode: 'night', supported_features: 57 }),
  'media_player.tv': st('playing', { media_title: 'Film', app_name: 'Netflix', volume_level: 0.35, is_volume_muted: false, supported_features: 153529 }),
  'media_player.vs': st('playing', { media_title: 'Muzică', volume_level: 0.35, supported_features: 153533 }),
  'media_player.off': st('off', { supported_features: 153529 }),
  'remote.tv': st('on', {}),
} };
t('fan: model (procent, pas, preseturi, preset curent)', () => { const m = controlModel({ entity: 'fan.p', kind: 'fan' }, H2.states['fan.p']); return m.on && m.pct === 40 && m.pstep === 20 && m.presets.length === 3 && m.preset === 'night' && m.speed || JSON.stringify(m); });
t('fan: render cu slider pe pas, preseturi cu cel curent „on”, toggle pe titlu', () => { const h = renderControls(cfg({ items: ['fan.p'] }), H2); return h.includes('data-step="20"') && h.includes('width:40.0%') && h.includes('data-val="night" data-state="on"') && h.includes('data-act="toggle"') && h.includes('data-kind="fan"') || h.slice(0, 500); });
t('media: model (titlu, volum %, transport, mute; pas de volum fără volume_set)', () => { const m = controlModel({ entity: 'media_player.tv', kind: 'media' }, H2.states['media_player.tv']); const v = controlModel({ entity: 'media_player.vs', kind: 'media' }, H2.states['media_player.vs']); return m.on && m.playing && m.title === 'Film' && !m.hasVol && m.canStep && m.canMute && m.canPrev && m.canNext && v.hasVol && v.vol === 35 || JSON.stringify([m, v]); });
t('media: render pornit — titlu, butoane, vol +/− (fără slider) sau slider; oprit — doar titlul', () => { const on = renderControls(cfg({ items: ['media_player.tv'] }), H2); const vs = renderControls(cfg({ items: ['media_player.vs'] }), H2); const off = renderControls(cfg({ items: ['media_player.off'] }), H2); return on.includes('Film') && on.includes('data-act="mpp"') && on.includes('data-act="mnext"') && on.includes('data-act="mvu"') && !on.includes('class="sl"') && vs.includes('class="sl"') && vs.includes('width:35.0%') && !off.includes('data-act="mpp"') && off.includes('Oprit') || on.slice(0, 700); });
t('remote: normalizare — entity obligatoriu; comenzi redenumibile', () => { const bad = normalizeRemote({}); const ok = normalizeRemote({ entity: 'remote.tv', commands: { power: 'KEY_POWER' } }); return bad.warnings.length === 1 && ok.keys.power.cmd === 'KEY_POWER' && ok.keys.volu.cmd === 'VOLUME_UP' || JSON.stringify(ok.keys.power); });
t('remote: render — taste cu comenzi, d-pad, repetare pe volum/canale, stare', () => { const h = renderRemote(normalizeRemote({ entity: 'remote.tv' }), H2); return h.includes('data-cmd="POWER"') && h.includes('data-cmd="VOLUME_UP" data-repeat="1"') && h.includes('data-cmd="SELECT"') && h.includes('class="dpad"') && h.includes('data-state="on"') && !h.includes('data-cmd="POWER" data-repeat') || h.slice(0, 500); });
t('remote: dpad:false — fără cruce; entitate lipsă → unavailable', () => !renderRemote(normalizeRemote({ entity: 'remote.tv', dpad: false }), H2).includes('class="dpad"') && renderRemote(normalizeRemote({ entity: 'remote.x' }), H2).includes('unavailable') || 'dp');

t('orb pe becul cu slider; buton rotund pe ventilator și media; plăcuța simplă fără', () => { const l = renderControls(cfg({ items: ['light.a'] }), H); const f = renderControls(cfg({ items: ['fan.p'] }), H2); const m = renderControls(cfg({ items: ['media_player.tv'] }), H2); const b = renderControls(cfg({ items: ['light.b'] }), H); return l.includes('class="orb" data-act="toggle" data-state="on"') && f.includes('class="pw"') && m.includes('class="pw"') && !b.includes('class="pw"') && !l.includes('class="pw"') || 'pw'; });

t('remote: rows + extra (Netflix/YouTube) + comenzi Samsung, fără cruce', () => { const c = normalizeRemote({ entity: 'remote.tv', dpad: false, commands: { power: 'KEY_POWER', volu: 'KEY_VOLUP' }, rows: [['power', 'mute'], ['vold', 'volu', 'bogus'], ['menu']], extra: [{ label: 'Netflix', command: 'KEY_11' }, { label: 'YouTube', command: 'KEY_12', icon: 'play' }, { label: 'x' }] }); const h = renderRemote(c, H2); return c.rows.length === 4 && c.rows[1].length === 2 && h.includes('data-cmd="KEY_POWER"') && h.includes('data-cmd="KEY_11"') && h.includes('Netflix') && h.includes('data-cmd="KEY_12"') && !h.includes('KEY_13') && !h.includes('class="dpad"') && !h.includes('data-cmd="HOME"') || JSON.stringify(c.rows); });

const AC = { states: { 'climate.ac': st('cool', { current_temperature: 25, temperature: 23, min_temp: 16, max_temp: 30, hvac_modes: ['off', 'cool', 'heat', 'dry', 'fan_only'], hvac_action: 'cooling', fan_modes: ['auto', 'low', 'high'], fan_mode: 'low', swing_modes: ['off', 'vertical'], swing_mode: 'off', preset_modes: ['none', 'eco'], preset_mode: 'eco' }), 'climate.off': st('off', { current_temperature: 21, temperature: 22, hvac_modes: ['off', 'heat'], min_temp: 16, max_temp: 30 }) } };
t('arcFrac: fracție pe arc, limite și implicit 16–30', () => arcFrac(23, 16, 30) === 0.5 && arcFrac(10, 16, 30) === 0 && arcFrac(40, 16, 30) === 1 && arcFrac(null, 16, 30) === 0 && arcFrac(23, NaN, NaN) === 0.5 || 'arc');
t('cadran A/C: arc cu valoare, punct curent, țintă mare, „acum 25° · răcește”, moduri', () => { const h = nb(renderControls(cfg({ items: ['climate.ac'] }), AC)); return h.includes('class="ctl cl dial"') && h.includes('class="vl"') && h.includes('stroke-dasharray="50.0 200"') && h.includes('class="cm"') && h.includes('23,0°') && h.includes('acum 25,0° · răcește') && h.includes('data-val="cool" data-state="on"') || h.slice(0, 700); });
t('cadran A/C: ventilator / oscilare / preset din atributele aparatului, cu etichete RO', () => { const h = renderControls(cfg({ items: ['climate.ac'] }), AC); return h.includes('data-act="cfan" data-val="low" data-state="on"') && h.includes('>Mic<') && h.includes('>Mare<') && h.includes('data-act="cswing" data-val="vertical"') && h.includes('data-act="cpreset" data-val="eco" data-state="on"') && h.includes('Ventilator') || h.slice(0, 900); });
t('cadran: fără fan/swing/preset când aparatul nu le are; oprit → arc gol și „Oprit”', () => { const h = renderControls(cfg({ items: ['climate.off'] }), AC); return !h.includes('data-act="cfan"') && !h.includes('data-act="cpreset"') && h.includes('stroke-dasharray="0 200"') && h.includes('Oprit') || h.slice(0, 600); });
t('style: simple → varianta veche (+/− fără cadran)', () => { const h = renderControls(cfg({ items: [{ entity: 'climate.ac', style: 'simple' }] }), AC); return !h.includes('class="dl"') && h.includes('class="sp"') || 'simple'; });

const LH = { states: {
  'light.rgb': st('on', { brightness: 200, supported_color_modes: ['rgb', 'color_temp'], rgb_color: [255, 59, 48], color_temp_kelvin: 3000, min_color_temp_kelvin: 2000, max_color_temp_kelvin: 6500 }),
  'light.ct': st('on', { brightness: 120, supported_color_modes: ['color_temp'], color_temp_kelvin: 4000, min_color_temp_kelvin: 2200, max_color_temp_kelvin: 6500 }),
  'light.dim': st('off', { supported_color_modes: ['brightness'] }),
  'light.onoff': st('on', { supported_color_modes: ['onoff'] }) } };
t('bec RGB: orb, slider luminozitate, slider temperatură de culoare, culori rapide, selectat = culoarea curentă', () => { const h = renderControls(cfg({ items: ['light.rgb'] }), LH); return h.includes('class="orb"') && h.includes('class="sl ct"') && h.includes('data-sub="ct"') && h.includes('data-min="2000"') && h.includes('data-max="6500"') && h.includes('data-act="swatch" data-rgb="255,59,48"') && /data-rgb="255,59,48"[^>]*data-state="on"/.test(h) && h.includes('data-k="2700"') && h.includes('--lc:rgb(255,59,48)') || h.slice(0, 600); });
t('bec cu temperatură de culoare (fără RGB): doar albe, fără culori', () => { const h = renderControls(cfg({ items: ['light.ct'] }), LH); return h.includes('data-k="4000"') && !h.includes('data-rgb=') && h.includes('class="sl ct"') && /data-k="4000"[^>]*data-state="on"/.test(h) || h.slice(0, 500); });
t('bec doar cu luminozitate: slider, fără culori / temperatură; oprit → 0%', () => { const h = renderControls(cfg({ items: ['light.dim'] }), LH); return h.includes('class="sl"') && !h.includes('class="sws"') && !h.includes('class="sl ct"') && h.includes('width:0.0%') || h.slice(0, 400); });
t('bec on/off: buton „lampă” (data-lamp), fără slider și fără orb', () => { const h = renderControls(cfg({ items: ['light.onoff'] }), LH); return h.includes('data-lamp="1"') && h.includes('ccu-btn') && !h.includes('class="sl"') && !h.includes('class="orb"') || h.slice(0, 300); });
t('valoare optimistă pentru temperatura de culoare', () => { const h = renderControls(cfg({ items: ['light.rgb'] }), LH, { optim: { '0c': 5000 } }); return h.includes('5000 K') || 'optim ct'; });

console.log(`\n${pass}/${pass + fail}`);
if (fail) process.exit(1);
