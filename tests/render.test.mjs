// tests/render.test.mjs — render.mjs (șabloane + patchNodes). Rulare: node tests/render.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { esc, formatClock, defaultTap, entityModel, renderButton, renderButtons, renderChips, normalizeHeader, renderHeader, patchNodes, sparkPath, normalizeNav, renderNav, safePicture, normalizePeople, renderPeople, visibleChips, normalizeWaste, wasteModel } from '../src/render.mjs';
import { normalizeConfig } from '../src/config.mjs';

let pass = 0, fail = 0;
const t = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + r); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const has = (s, x) => s.includes(x) || `lipsește ${JSON.stringify(x)} în ${s.slice(0, 300)}`;
const not = (s, x) => !s.includes(x) || `nu trebuie ${JSON.stringify(x)} în ${s.slice(0, 300)}`;
const st = (state, attributes = {}) => ({ state, attributes });
const hass = { config: { unit_system: { temperature: '°C' } }, states: {
  'light.a': st('on', { friendly_name: 'Bucătărie' }), 'light.b': st('off'), 'lock.u': st('unlocked', { friendly_name: 'Ușă' }),
  'sensor.t': st('24.6', { unit_of_measurement: '°C', friendly_name: 'Temp' }), 'sensor.p': st('1820', { unit_of_measurement: 'W' }), 'sensor.n': st('unavailable'),
  'binary_sensor.d': st('on', { device_class: 'door' }),
} };
const cfg = (o) => normalizeConfig(o).config;

t('esc scapă & < > " \'', () => esc('<a href="x">&\'') === '&lt;a href=&quot;x&quot;&gt;&amp;&#39;' || esc('<a href="x">&\''));
t('esc: null/undefined → ""', () => esc(null) === '' && esc(undefined) === '');
t('formatClock: ora cu zero și data RO', () => { const c = formatClock(new Date(2026, 10, 14, 7, 5)); return (c.time === '07:05' && c.date === 'sâm 14 nov') || JSON.stringify(c); });
t('defaultTap: light → toggle, sensor → more-info', () => defaultTap('light.x') === 'toggle' && defaultTap('sensor.x') === 'more-info' && defaultTap('climate.x') === 'more-info');

t('model: nume din friendly_name când config nu are nume', () => { const c = cfg({ entities: ['light.a'] }); return entityModel(c.entities[0], 0, hass, c).name === 'Bucătărie' || 'nume'; });
t('model: nume din config are prioritate', () => { const c = cfg({ entities: [{ entity: 'light.a', name: 'Lampa mea' }] }); return entityModel(c.entities[0], 0, hass, c).name === 'Lampa mea' || 'nume'; });
t('model: stare on/off din hass', () => { const c = cfg({ entities: ['light.a', 'light.b'] }); return (entityModel(c.entities[0], 0, hass, c).state === 'on' && entityModel(c.entities[1], 1, hass, c).state === 'off') || 'stări'; });
t('model: entitate lipsă → unavailable și „—”', () => { const c = cfg({ entities: ['light.nu_exista'] }); const m = entityModel(c.entities[0], 0, hass, c); return (m.state === 'unavailable' && m.secondary === '—') || JSON.stringify(m); });
t('model: textul secundar e în română (fără entity_id în stare)', () => { const c = cfg({ entities: ['light.a'] }); return entityModel(c.entities[0], 0, hass, c).secondary === 'pornit' || entityModel(c.entities[0], 0, hass, c).secondary; });
t('model: lacăt deblocat = alert', () => { const c = cfg({ entities: ['lock.u'] }); return entityModel(c.entities[0], 0, hass, c).state === 'alert' || 'stare'; });
t('model: device_class din atribute (ușă deschisă → deschis)', () => { const c = cfg({ entities: ['binary_sensor.d'] }); return entityModel(c.entities[0], 0, hass, c).secondary === 'deschis' || entityModel(c.entities[0], 0, hass, c).secondary; });
t('model: praguri din config → alert', () => { const c = cfg({ entities: [{ entity: 'sensor.t', alert_above: 20 }] }); return entityModel(c.entities[0], 0, hass, c).state === 'alert' || 'stare'; });
t('model: size xs → fără text secundar, s → cu valoare', () => { const a = cfg({ density: 'xs', entities: ['sensor.t'] }); const b = cfg({ density: 's', entities: ['sensor.t'] }); return (entityModel(a.entities[0], 0, hass, a).secondary === '' && entityModel(b.entities[0], 0, hass, b).secondary !== '') || 'secundar'; });
t('model: secondary literal', () => { const c = cfg({ entities: [{ entity: 'light.a', secondary: 'Parter' }] }); return entityModel(c.entities[0], 0, hass, c).secondary === 'Parter' || 'secundar'; });
t('model: secondary din atribut', () => { const h = { states: { 'climate.c': st('heat', { current_temperature: 21.5 }) } }; const c = cfg({ entities: [{ entity: 'climate.c', secondary: { attribute: 'current_temperature', unit: '°C' } }] }); return entityModel(c.entities[0], 0, h, c).secondary === '21,5 °C' || entityModel(c.entities[0], 0, h, c).secondary; });
t('model: secondary din altă entitate climate (fără entity_id în stare) → temperatura curentă', () => { const h = { states: { 'light.l': st('on'), 'climate.c': st('heat_cool', { current_temperature: 25.5 }) } }; const c = cfg({ entities: [{ entity: 'light.l', secondary: { entity: 'climate.c' } }] }); const m = entityModel(c.entities[0], 0, h, c); return m.secondary.replace(/\u202f/g, ' ') === '25,5 °C' || m.secondary; });
t('model: secondary: false → gol', () => { const c = cfg({ entities: [{ entity: 'light.a', secondary: false }] }); return entityModel(c.entities[0], 0, hass, c).secondary === '' || 'secundar'; });
t('model: animații oprite → fără clasă a-*', () => { const c = cfg({ animations: false, entities: ['light.a'] }); return entityModel(c.entities[0], 0, hass, c).anim === '' || 'anim'; });
t('model: culori per entitate → doar variabile valide', () => { const c = cfg({ entities: [{ entity: 'light.a', colors: { on: '#ff0000', alert: 'red;x:y' } }] }); const m = entityModel(c.entities[0], 0, hass, c); return (m.style === '--ccu-on:#ff0000') || m.style; });

t('buton: markup standard', () => {
  const c = cfg({ entities: ['light.a'] }); const h = renderButton(entityModel(c.entities[0], 0, hass, c));
  return has(h, 'class="ccu-btn m chamfer"') === true && has(h, 'data-state="on"') === true && has(h, 'data-entity="light.a"') === true && has(h, '<span class="ccu-ico a-glow"><svg') === true && has(h, '<span class="ccu-name">Bucătărie</span>') === true && has(h, '<span class="ccu-sec">pornit</span>') === true || h;
});
t('buton: nume periculos scăpat', () => { const c = cfg({ entities: [{ entity: 'light.a', name: '<img src=x onerror=alert(1)>' }] }); const h = renderButton(entityModel(c.entities[0], 0, hass, c)); return not(h, '<img') === true && has(h, '&lt;img') === true || h; });
t('card: grila cu --cols și --cols-wide', () => { const h = renderButtons(cfg({ columns: 3, columns_wide: 5, entities: ['light.a'] }), hass); return has(h, '--cols:3;--cols-wide:5') === true && has(h, 'class="ccu-card"') === true || h; });
t('card: panel = panou cu chenar, implicit fără', () => has(renderButtons(cfg({ panel: true, entities: ['light.a'] }), hass), 'ccu-card panel') === true && has(renderButtons(cfg({ entities: ['light.a'] }), hass), 'class="ccu-card"') === true || 'panel');
t('card: titlu escapat', () => { const h = renderButtons(cfg({ title: '<b>x</b>', entities: ['light.a'] }), hass); return has(h, '<div class="ccu-title">&lt;b&gt;') === true || h; });
t('card: avertismente afișate (max 3), escapate', () => { const h = renderButtons(cfg({ entities: ['light.a'] }), hass, { warnings: ['a<b', '2', '3', '4'] }); return has(h, 'ccu-note') === true && has(h, 'a&lt;b') === true && not(h, '>4<') === true || h; });
t('card: hass nul nu aruncă (toate „—”)', () => { const h = renderButtons(cfg({ entities: ['light.a'] }), null); return has(h, 'data-state="unavailable"'); });
t('card: nicio entitate → grilă goală, fără excepție', () => has(renderButtons({ entities: [] }, hass), 'ccu-grid'));
t('card: coloane invalide → 2', () => has(renderButtons({ columns: 99, entities: [] }, hass), '--cols:2;'));

t('chips: markup', () => { const h = renderChips(cfg({ entities: ['light.a'] }), hass); return has(h, 'class="ccu-chips"') === true && has(h, 'class="ccu-chip"') === true && has(h, 'role="button"') === true || h; });
t('chips: show_state adaugă starea', () => { const h = renderChips(cfg({ entities: [{ entity: 'light.a', show_state: true }] }), hass); return has(h, '<b>pornit</b>'); });

t('header: normalizare — max 3 valori, culori valide', () => {
  const r = normalizeHeader({ values: ['sensor.p', { entity: 'sensor.t', color: 'roz' }, 'sensor.n', 'light.a'] });
  return (r.header.values.length === 3 && r.header.values[1].color === undefined && r.warnings.length === 2) || JSON.stringify(r);
});
t('header: valoare invalidă eliminată', () => { const r = normalizeHeader({ values: ['fara_punct'] }); return (r.header.values.length === 0 && r.warnings.length === 1) || JSON.stringify(r); });
t('header: W ≥ 1000 → kW', () => has(renderHeader({ header: normalizeHeader({ values: ['sensor.p'] }).header }, hass, new Date(2026, 10, 14, 19, 17)), '1,82 kW'));
t('header: ceas și dată', () => { const h = renderHeader({ header: normalizeHeader({ values: [] }).header }, hass, new Date(2026, 10, 14, 19, 17)); return has(h, '19:17<small>sâm 14 nov</small>'); });
t('header: clock:false → fără ceas', () => not(renderHeader({ header: normalizeHeader({ clock: false, values: [] }).header }, hass, new Date()), 'class="clock"'));
t('header: senzor indisponibil → „—”', () => has(renderHeader({ header: normalizeHeader({ values: ['sensor.n'] }).header }, hass, null), '<span>—</span>'));
t('header: clasă de culoare cu token', () => has(renderHeader({ header: normalizeHeader({ values: [{ entity: 'sensor.p', color: 'accent' }] }).header }, hass, null), 'class="c-accent"'));

// ---- header: valoare în dreapta (temperatura exterioară) în locul ceasului ----
const hx = { config: { unit_system: { temperature: '°C' } }, states: { 'sensor.ext': st('7.14', { unit_of_measurement: '°C' }), 'weather.acasa': st('cloudy', { temperature: 6.5 }), 'sensor.bad': st('unknown') } };
const rh = (right, now = new Date(2026, 10, 14, 19, 17)) => renderHeader({ header: normalizeHeader({ values: [], right }).header }, hx, now);
t('header dreapta: temperatura în loc de ceas', () => { const h = rh({ entity: 'sensor.ext', label: 'afară' }); return has(h, 'class="clock right">7,1 °C<small>afară</small>') === true && not(h, '19:17') === true || h; });
t('header dreapta: formă scurtă (șir)', () => has(rh('sensor.ext'), '7,1 °C'));
t('header dreapta: din atribut (weather.temperature)', () => has(rh({ entity: 'weather.acasa', attribute: 'temperature' }), '6,5 °C'));
t('header dreapta: decimals 0', () => has(rh({ entity: 'sensor.ext', decimals: 0 }), '>7 °C'));
t('header dreapta: stare necunoscută → „—”', () => has(rh({ entity: 'sensor.bad' }), '>—'));
t('header dreapta: entitate lipsă → „—”', () => has(rh({ entity: 'sensor.nu_exista' }), '>—'));
t('header dreapta: label escapat', () => has(rh({ entity: 'sensor.ext', label: '<i>' }), '&lt;i&gt;'));
t('header dreapta: entity_id invalid → avertisment + ceas', () => { const r = normalizeHeader({ right: { entity: 'xyz' } }); return (r.header.right === null && r.header.clock === true && r.warnings.length === 1) || JSON.stringify(r); });
t('header dreapta: dezactivează ceasul', () => normalizeHeader({ right: 'sensor.ext' }).header.clock === false || 'ceas activ');

// ---- climate (aer condiționat): culoare după mod + ventilator care se învârte ----
const ac = (state, attrs = {}) => ({ states: { 'climate.ac': st(state, { friendly_name: 'AC', ...attrs }) } });
const acChip = (h, extra = {}) => renderChips(cfg({ entities: [{ entity: 'climate.ac', icon: 'mdi:air-conditioner', ...extra }] }), h);
t('climate: iconița ac are grupul .rot și clasa a-fan', () => { const h = acChip(ac('cool')); return has(h, 'a-fan') === true && has(h, 'class="rot"') === true || h; });
t('climate: răcire → data-mode=cool, data-run=1', () => { const h = acChip(ac('cool')); return has(h, 'data-mode="cool"') === true && has(h, 'data-run="1"') === true || h; });
t('climate: încălzire → data-mode=heat', () => has(acChip(ac('heat')), 'data-mode="heat"'));
t('climate: auto și heat_cool → data-mode=auto', () => has(acChip(ac('auto')), 'data-mode="auto"') === true && has(acChip(ac('heat_cool')), 'data-mode="auto"') === true || 'auto');
t('climate: oprit → data-run=0, stare off', () => { const h = acChip(ac('off')); return has(h, 'data-run="0"') === true && has(h, 'data-state="off"') === true || h; });
t('climate: pornit (chiar și hvac_action=idle) → ventilatorul se învârte (run=1), ca la vechiul badge', () => { const h = acChip(ac('cool', { hvac_action: 'idle' })); return has(h, 'data-run="1"') === true && has(h, 'data-mode="cool"') === true || h; });
t('climate: oprit → run=0', () => has(acChip(ac('off', {})), 'data-run="0"') === true || 'off');
t('climate: hvac_action=cooling → run=1', () => has(acChip(ac('cool', { hvac_action: 'cooling' })), 'data-run="1"'));
t('climate: indisponibil → nu se învârte', () => has(acChip(ac('unavailable')), 'data-run="0"'));
t('climate: animații oprite → fără a-fan', () => not(renderChips(cfg({ animations: false, entities: [{ entity: 'climate.ac', icon: 'mdi:air-conditioner' }] }), ac('cool')), 'a-fan'));
t('climate: și pe butoane', () => has(renderButtons(cfg({ entities: [{ entity: 'climate.ac', icon: 'mdi:air-conditioner' }] }), ac('heat')), 'data-mode="heat"'));
t('non-climate: fără data-mode', () => not(renderChips(cfg({ entities: ['light.a'] }), hass), 'data-mode'));

// ---- icon_color, toggle, erou (xl) cu delta + sparkline, meniu jos ----
t('icon_color valid → data-ic', () => has(renderButtons(cfg({ entities: [{ entity: 'light.a', icon_color: 'yellow' }] }), hass), 'data-ic="yellow"'));
t('icon_color invalid ignorat', () => not(renderButtons(cfg({ entities: [{ entity: 'light.a', icon_color: 'roz;x' }] }), hass), 'data-ic'));
t('toggle: doar pe size l', () => has(renderButtons(cfg({ entities: [{ entity: 'light.a', size: 'l', toggle: true }] }), hass), 'class="ccu-sw"') === true && not(renderButtons(cfg({ entities: [{ entity: 'light.a', size: 'm', toggle: true }] }), hass), 'ccu-sw') === true || 'toggle');
t('erou xl: valoarea mare în <b>, unitatea alături', () => { const h = renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'xl' }] }), hass); return has(h.replace(/ /g, ' '), '<b>1,82</b> kW'); });
t('erou xl: delta cu săgeată și direcție', () => { const h2 = { states: { ...hass.states, 'sensor.d': st('-0.36', { unit_of_measurement: 'kW' }) } }; const h = renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'xl', delta: { entity: 'sensor.d' } }] }), h2); return has(h, 'data-dir="down">▼ −0,36 kW') === true || has(h, 'data-dir="down">▼ -0,36 kW') || h; });
t('erou xl: delta text literal', () => has(renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'xl', delta: { text: '+2 %' } }] }), hass), 'data-dir="up">▲ +2 %'));
t('delta ignorat pe alte mărimi', () => not(renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'm', delta: { text: '+2 %' } }] }), hass), 'ccu-delta'));
t('spark: slot gol fără date, cu date → path', () => { const c = cfg({ entities: [{ entity: 'sensor.p', size: 'xl', spark: { hours: 6 } }] }); return has(renderButtons(c, hass), 'class="ccu-spark"') === true && has(renderButtons(c, hass, { sparks: { 'sensor.p': { line: 'M0 0 L1 1', fill: 'M0 0 Z' } } }), 'd="M0 0 L1 1"') === true || 'spark'; });
t('sparkPath: < 2 puncte → gol', () => sparkPath([1]).line === '' && sparkPath([]).line === '' && sparkPath(['x', 'y']).line === '' || 'gol');
t('sparkPath: coordonate în viewBox, fără NaN', () => { const r = sparkPath([5, 1, 9, 3, 7, 2, 8, 4]); const nums = (r.line.match(/-?\d+\.?\d*/g) || []).map(Number); return (nums.length >= 16 && nums.every((n) => Number.isFinite(n) && n >= 0 && n <= 100) && !/NaN/.test(r.fill)) || r.line; });
t('sparkPath: serie constantă nu dă NaN', () => !/NaN/.test(sparkPath([3, 3, 3, 3]).line) || 'NaN');
t('sparkPath: peste 40 de puncte → exact 40', () => (sparkPath(Array.from({ length: 1000 }, (_, i) => i)).line.match(/[ML]/g) || []).length === 40 || 'puncte');
t('header: valoare cu iconiță colorată', () => has(renderHeader({ header: normalizeHeader({ values: [{ entity: 'sensor.p', icon: 'battery', color: 'ok' }] }).header }, hass, null), '<span class="ccu-ico c-ok"><svg'));
t('nav: normalizare cere path cu /', () => { const r = normalizeNav({ items: [{ icon: 'home', label: 'Home', path: '/d/home' }, { label: 'x', path: 'fara' }, 5] }); return (r.items.length === 1 && r.warnings.length === 2) || JSON.stringify(r); });
t('nav: elementul curent e activ (exact și sub-pagină)', () => { const c = normalizeNav({ items: [{ icon: 'home', label: 'Home', path: '/d/home' }, { icon: 'sun', label: 'Solar', path: '/d/solar' }] }); const h = renderNav(c, '/d/solar/detalii'); return has(h, 'data-id="1" data-state="on"') === true && has(h, 'data-id="0" data-state="off"') === true || h; });
t('nav: /d/home nu activează /d/home2', () => has(renderNav(normalizeNav({ items: [{ icon: 'home', label: 'H', path: '/d/home' }] }), '/d/home2'), 'data-state="off"'));
t('nav: etichetă escapată', () => has(renderNav(normalizeNav({ items: [{ icon: 'home', label: '<b>', path: '/x' }] }), '/'), '&lt;b&gt;'));
t('nav: gol → fără excepție', () => has(renderNav(normalizeNav({}), '/'), 'ccu-nav'));

t('W ≥ 1000 → kW în butoane (auto_kw)', () => { const h = renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'l' }] }), hass).replace(/ /g, ' '); return has(h, '1,82 kW'); });
t('auto_kw: false păstrează W', () => has(renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'l', auto_kw: false }] }), hass).replace(/ /g, ' '), '1 820 W'));
t('active: true → verde chiar la senzor fără praguri', () => has(renderButtons(cfg({ entities: [{ entity: 'sensor.p', size: 'xl', active: true }] }), hass), 'data-state="on"'));
t('active: true nu activează o entitate indisponibilă', () => has(renderButtons(cfg({ entities: [{ entity: 'sensor.n', active: true }] }), hass), 'data-state="unavailable"'));
// ---- persoane ----
const ph = { states: { 'person.ana': st('home', { friendly_name: 'Ana Pop', entity_picture: '/api/image/serve/abc/512x512' }), 'person.dan': st('not_home', { friendly_name: 'Dan' }), 'person.eva': st('home', { friendly_name: 'Eva', entity_picture: 'https://evil.example/x.png' }) } };
const pc = (o) => { const n = normalizePeople(o); return { entities: n.people, label: n.label }; };
t('safePicture: doar căi relative', () => safePicture('/api/image/serve/a/b') === '/api/image/serve/a/b' && safePicture('/local/x.png') === '/local/x.png' || 'valid');
t('safePicture: respinge http(s), //, data, javascript, ghilimele', () => ['https://a.b/x.png', '//evil.com/x', 'data:image/png;base64,AA', 'javascript:alert(1)', '/x" onerror="1', ' ', '', null, 5, '/a b'].every((u) => safePicture(u) === '') || 'respins');
t('persoane: normalizare, max 6, invalid eliminat', () => { const n = normalizePeople({ people: ['person.a', 'fara_punct', { entity: 'person.b', name: 'B' }, ...Array.from({ length: 6 }, (_, i) => 'person.x' + i)] }); return (n.people.length === 6 && n.warnings.length === 2) || JSON.stringify(n.warnings); });
t('persoane: eticheta implicită „Persoane”, label:false o scoate', () => normalizePeople({ people: [] }).label === 'Persoane' && normalizePeople({ people: [], label: false }).label === '' || 'label');
t('persoane: acasă = cerc verde, plecat = gri', () => { const h = renderPeople(pc({ people: ['person.ana', 'person.dan'] }), ph); return (h.includes('data-home="1"') && h.includes('data-home="0"') && h.includes('data-state="on"')) || h; });
t('persoane: poza relativă apare, cea externă nu (inițiale)', () => { const h = renderPeople(pc({ people: ['person.ana', 'person.eva'] }), ph); return (h.includes('src="/api/image/serve/abc/512x512"') && !h.includes('evil.example') && h.includes('>E<')) || h; });
t('persoane: inițiale din nume (Ana Pop → AP, Dan → D)', () => { const h = renderPeople(pc({ people: ['person.ana', 'person.dan'] }), { states: { 'person.ana': st('home', { friendly_name: 'Ana Pop' }), 'person.dan': st('home', { friendly_name: 'Dan' }) } }); return (h.includes('>AP<') && h.includes('>D<')) || h; });
t('persoane: nimeni acasă → chip off', () => has(renderPeople(pc({ people: ['person.dan'] }), ph), 'data-state="off"'));
t('persoane: hass nul / entitate lipsă nu aruncă', () => has(renderPeople(pc({ people: ['person.nu_exista'] }), null), 'data-home="0"') === true && has(renderPeople(pc({ people: ['person.nu_exista'] }), ph), 'data-home="0"') === true || 'hass nul');
t('persoane: nume periculos scăpat', () => { const h = renderPeople(pc({ people: [{ entity: 'person.dan', name: '<img src=x onerror=1>' }] }), ph); return (!h.includes('<img src=x') && h.includes('&lt;img')) || h; });
t('persoane: etichetă escapată', () => has(renderPeople(pc({ people: ['person.dan'], label: '<b>' }), ph), '&lt;b&gt;'));

t('YAML: header `color: on` (boolean true) → token „on”, fără avertisment', () => { const r = normalizeHeader({ values: [{ entity: 'sensor.p', color: true }] }); return (r.header.values[0].color === 'on' && r.warnings.length === 0) || JSON.stringify(r); });
// ---- cum era „Tableta”: grupuri (lumini aprinse), alerte, CAMERE (grup de senzori), Familia ----
const gh = { states: { 'group.l': st('on', { entity_id: ['light.a', 'light.b', 'light.c'] }), 'light.a': st('on'), 'light.b': st('on'), 'light.c': st('off'), 'group.w': st('off', { entity_id: ['binary_sensor.w1'] }), 'binary_sensor.w1': st('off'),
  'group.smoke': st('on', { entity_id: ['binary_sensor.s1'] }), 'binary_sensor.s1': st('on'),
  'binary_sensor.c1': st('on'), 'binary_sensor.c2': st('off'), 'binary_sensor.c3': st('on') } };
t('chip count: câte lumini sunt aprinse din group', () => { const c = cfg({ entities: [{ entity: 'group.l', icon: 'mdi:lightbulb', count: true }] }); const h = renderChips(c, gh); return (h.includes('<b>2</b>') && h.includes('data-state="on"')) || h; });
t('chip count: cu nume explicit apare și numele', () => has(renderChips(cfg({ entities: [{ entity: 'group.l', name: 'Lumini', count: true }] }), gh), '<b>2</b> Lumini'));
t('chip count: fără nume explicit nu repetă numele automat', () => !renderChips(cfg({ entities: [{ entity: 'group.l', count: true }] }), gh).includes('>l<') || 'nume');
t('chip hide_off: dispare când grupul nu e on', () => { const c = cfg({ entities: [{ entity: 'group.w', hide_off: true, count: true }, { entity: 'group.l', hide_off: true, count: true }] }); const h = renderChips(c, gh); return ((h.match(/class="ccu-chip"/g) || []).length === 1 && h.includes('data-entity="group.l"') && !h.includes('group.w')) || h; });
t('chip hide_off: data-id rămâne indexul din config', () => { const c = cfg({ entities: [{ entity: 'group.w', hide_off: true }, { entity: 'group.l', hide_off: true }] }); return has(renderChips(c, gh), 'data-id="1"'); });
t('chip on_as: alert → fum/scurgere = alertă, nu „activ”', () => has(renderChips(cfg({ entities: [{ entity: 'group.smoke', on_as: 'alert', icon: 'mdi:fire' }] }), gh), 'data-state="alert"'));
t('buton group: oricare membru on → alertă + text cu {n}', () => { const c = cfg({ entities: [{ entity: 'binary_sensor.c1', name: 'CAMERE', group: ['binary_sensor.c1', 'binary_sensor.c2', 'binary_sensor.c3'], group_text: 'Persoane pe {n} camere', group_idle: 'Fără activitate' }] }); const h = renderButtons(c, gh); return (h.includes('data-state="alert"') && h.includes('Persoane pe 2 camere')) || h; });
t('buton group: niciun membru on → off + text de repaus', () => { const c = cfg({ entities: [{ entity: 'binary_sensor.c2', name: 'CAMERE', group: ['binary_sensor.c2'], group_idle: 'Fără activitate' }] }); const h = renderButtons(c, gh); return (h.includes('data-state="off"') && h.includes('Fără activitate')) || h; });
t('buton group: id-uri invalide ignorate, fără excepție', () => { const c = cfg({ entities: [{ entity: 'binary_sensor.c2', group: ['fara_punct', 5, null] }] }); return renderButtons(c, gh).includes('ccu-btn') || 'excepție'; });
const fh = { states: { 'person.a': st('home', { friendly_name: 'Ana Pop', entity_picture: '/api/image/serve/x/512x512' }), 'person.b': st('not_home', { friendly_name: 'Maria' }), 'person.c': st('Penny', { friendly_name: 'Dan' }) } };
const fc = (o) => { const n = normalizePeople(o); return { entities: n.people, label: n.label, layout: n.layout, title: n.title }; };
t('familia: layout family, titlu, avatare mari cu nume și stare', () => { const h = renderPeople(fc({ layout: 'family', title: 'Familia', people: ['person.a', 'person.b', 'person.c'] }), fh); return (h.includes('ccu-family') && h.includes('class="ccu-title">Familia') && h.includes('>Ana<') && h.includes('>Acasă<') && h.includes('>Plecat<') && h.includes('>Penny<') && h.includes('src="/api/image/serve/x/512x512"')) || h.slice(0, 300); });
t('familia: acasă = data-home 1, altfel 0; --n = numărul de persoane', () => { const h = renderPeople(fc({ layout: 'family', people: ['person.a', 'person.b'] }), fh); return (h.includes('data-home="1"') && h.includes('data-home="0"') && h.includes('--n:2')) || h; });
t('familia: layout necunoscut → chip', () => normalizePeople({ layout: 'zzz', people: [] }).layout === 'chip');
t('familia: fără poză → inițiale; fără hass nu aruncă', () => has(renderPeople(fc({ layout: 'family', people: ['person.b'] }), fh), '>M<') === true && has(renderPeople(fc({ layout: 'family', people: ['person.x'] }), null), 'data-home="0"') === true || 'inițiale');
t('familia: nume periculos scăpat', () => { const h = renderPeople(fc({ layout: 'family', people: [{ entity: 'person.b', name: '<img src=x onerror=1>' }] }), fh); return !h.includes('<img src=x') || 'XSS'; });

t('nav sticky: bara e fixă, cu spațiu rezervat în pagină', () => { const c = normalizeNav({ items: [{ icon: 'home', label: 'H', path: '/d/h' }] }); const h = renderNav({ ...c, sticky: true }, '/d/h'); return (h.includes('class="ccu-nav-spacer"') && h.includes('class="ccu-nav-fixed"') && h.includes('data-state="on"')) || h; });
t('nav fără sticky: doar bara, fără spacer', () => { const c = normalizeNav({ items: [{ icon: 'home', label: 'H', path: '/d/h' }] }); const h = renderNav({ ...c }, '/d/h'); return (!h.includes('ccu-nav-fixed') && !h.includes('spacer') && h.includes('<nav class="ccu-nav">')) || h; });
t('grilă: --min-tile 168 px pentru plăci m, 240 pentru l, 0 pentru s/xs/xl', () => {
  const g = (size) => renderButtons(cfg({ entities: [{ entity: 'light.a', size }] }), hass).match(/--min-tile:(\d+)px/)[1];
  return (g('m') === '168' && g('l') === '240' && g('s') === '0' && g('xs') === '0' && g('xl') === '0') || [g('m'), g('l'), g('s')].join();
});
t('grilă: --min-tile = cea mai mare dintre plăcile din card', () => renderButtons(cfg({ entities: [{ entity: 'light.a', size: 's' }, { entity: 'light.b', size: 'l' }] }), hass).includes('--min-tile:240px'));
// ---- chips ascunse nu ocupă loc ----
const hh = { states: { 'climate.a': st('off'), 'climate.b': st('heat'), 'switch.s': st('unavailable'), 'weather.w': st('rainy', { temperature: 9.4, temperature_unit: '°C' }), 'sensor.fl': st('34', { unit_of_measurement: '°C' }), 'sensor.fl2': st('25', { unit_of_measurement: '°C' }) } };
t('visibleChips: doar cele „on”/alertă când au hide_off', () => visibleChips(cfg({ entities: [{ entity: 'climate.a', hide_off: true }, { entity: 'climate.b', hide_off: true }, { entity: 'switch.s', hide_off: true }] }), hh) === 1 || 'număr');
t('visibleChips: toate ascunse → 0 (cardul se ascunde)', () => visibleChips(cfg({ entities: [{ entity: 'climate.a', hide_off: true }, { entity: 'switch.s', hide_off: true }] }), hh) === 0);
t('visibleChips: fără hide_off se văd toate', () => visibleChips(cfg({ entities: ['climate.a', 'switch.s'] }), hh) === 2);
t('chip cu prag: apare doar peste alert_above (ex. se simte >32°)', () => visibleChips(cfg({ entities: [{ entity: 'sensor.fl', alert_above: 32, hide_off: true }] }), hh) === 1 && visibleChips(cfg({ entities: [{ entity: 'sensor.fl2', alert_above: 32, hide_off: true }] }), hh) === 0 || 'prag');
t('chip weather: icon după condiție și text RO + temperatură', () => { const h = renderChips(cfg({ entities: [{ entity: 'weather.w', show_state: true }] }), hh); const txt = h.replace(/\u202f/g, ' '); return (h.includes('data-state="off"') && txt.includes('<b>Ploaie 9,40°</b>') || txt.includes('Ploaie 9,4°')) && h.includes('<svg') || txt.slice(0, 300); });
t('chip weather: stare neutră (off), nu „activ”', () => has(renderChips(cfg({ entities: [{ entity: 'weather.w' }] }), hh), 'data-state="off"'));

// ---- meniu: insignă pe „Cam” ----
const nh = (on) => ({ states: Object.fromEntries(['binary_sensor.c1', 'binary_sensor.c2', 'binary_sensor.c3'].map((id, i) => [id, st(i < on ? 'on' : 'off')])) });
const navCfg = normalizeNav({ items: [{ icon: 'home', label: 'House', path: '/x/0' }, { icon: 'camera', label: 'Cam', path: '/x/camere', badge: ['binary_sensor.c1', 'binary_sensor.c2', 'binary_sensor.c3', 'nu valid'] }] });
t('nav: badge se normalizează (ids invalide dispar)', () => navCfg.items[1].badge.length === 3 && navCfg.items[0].badge.length === 0 || 'badge');
t('nav: fără persoane → fără insignă, stare off', () => { const h = renderNav(navCfg, '/x/0', { hass: nh(0) }); return !h.includes('ccu-badge') && !h.includes('data-state="alert"') || h; });
t('nav: 2 persoane → insignă „2” + alertă', () => { const h = renderNav(navCfg, '/x/0', { hass: nh(2) }); return h.includes('<b class="ccu-badge">2</b>') && h.includes('data-state="alert"') || h; });
t('nav: pagina curentă rămâne „on” dar are insigna', () => { const h = renderNav(navCfg, '/x/camere', { hass: nh(1) }); return h.includes('data-state="on"') && h.includes('ccu-badge') || h; });
t('chip ventilator pornit → data-run=1; oprit → fără', () => { const c = (s) => renderChips(cfg({ entities: [{ entity: 'switch.f', icon: 'mdi:fan' }] }), { states: { 'switch.f': st(s) } }); return c('on').includes('data-run="1"') && !c('off').includes('data-run') || 'run'; });

// ---- chips noi: show_if, on_states, text_map, gunoi ----
const mh = { states: { 'sensor.g1': st('Ultima zi', { days_left: 1 }), 'sensor.g2': st('unavailable', { days_left: -1 }), 'sensor.g3': st('Mai ai 5 zile', { days_left: 5 }),
  'sensor.wash': st('spinning'), 'sensor.wash2': st('power_off'), 'sensor.rem': st(new Date(Date.now() + 38 * 60000 + 20000).toISOString()), 'switch.fan': st('on') } };
t('show_if: se vede când days_left ≥ 0; ascuns la -1/unavailable', () => visibleChips(cfg({ entities: [{ entity: 'sensor.g1', show_if: { attribute: 'days_left', min: 0 } }, { entity: 'sensor.g2', show_if: { attribute: 'days_left', min: 0 } }, { entity: 'sensor.g3', show_if: { attribute: 'days_left', min: 0 } }] }), mh) === 2 || 'număr');
t('show_if: alert când days_left ≤ alert_at', () => { const h = renderChips(cfg({ entities: [{ entity: 'sensor.g1', show_if: { attribute: 'days_left', min: 0, alert_at: 1 } }, { entity: 'sensor.g3', show_if: { attribute: 'days_left', min: 0, alert_at: 1 } }] }), mh); return has(h, 'data-state="alert"') && has(h, 'data-state="on"') || h; });
t('on_states: starea text „spinning” = on, „power_off” = off (hide_off)', () => visibleChips(cfg({ entities: [{ entity: 'sensor.wash', on_states: ['spinning'], hide_off: true }, { entity: 'sensor.wash2', on_states: ['spinning'], hide_off: true }] }), mh) === 1 || 'nr');
t('text_map + secondary entity: „Centrifugă · 38 min”', () => { const h = renderChips(cfg({ entities: [{ entity: 'sensor.wash', on_states: ['spinning'], show_state: true, text_map: { spinning: 'Centrifugă' }, secondary: { entity: 'sensor.rem' } }] }), mh); return /<b>Centrifugă · 3[789] min<\/b>/.test(h) || h; });
t('ventilator (switch on) → data-run=1 și clasa a-fan', () => { const h = renderChips(cfg({ entities: [{ entity: 'switch.fan', icon: 'mdi:fan' }] }), mh); return has(h, 'data-run="1"') && has(h, 'a-fan') || h; });
const W = normalizeWaste({ calendar: 'calendar.g', next_days: 1, hide_today_after: '11:00', patterns: [{ match: 'Gunoi: Menajer', label: 'Menajer', icon: 'mdi:trash-can', exact: true }, { match: 'Gunoi: Plastic', label: 'Plastic', icon: 'mdi:recycle', exact: true }] });
const d = (n) => { const x = new Date(2026, 10, 14 + n); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
const evs = [{ summary: 'Gunoi: Menajer', start: d(0) }, { summary: 'Gunoi: Plastic', start: d(1) }, { summary: 'Gunoi: Carton', start: d(1) }, { summary: 'Gunoi: Plastic', start: d(3) }, { summary: 'Gunoi: Menajer', start: d(-1) }];
t('gunoi: azi + mâine, doar patternurile; nu D+3, nu ieri', () => { const m = wasteModel(W, evs, new Date(2026, 10, 14, 8, 0)); return m.length === 2 && m[0].diff === 0 && m[1].diff === 1 || JSON.stringify(m); });
t('gunoi: azi dispare după 11:00', () => { const m = wasteModel(W, evs, new Date(2026, 10, 14, 11, 30)); return m.length === 1 && m[0].label === 'Plastic' || JSON.stringify(m); });
t('gunoi: se desenează chips azi=alert, mâine=on', () => { const h = renderChips({ entities: [], waste: W }, {}, { events: evs, now: new Date(2026, 10, 14, 8, 0) }); return has(h, 'Menajer <b>azi</b>') && has(h, 'Plastic <b>mâine</b>') && has(h, 'data-state="alert"') || h; });
t('gunoi: calendar invalid → null; fără evenimente → nimic', () => normalizeWaste({ calendar: 'x' }) === null && wasteModel(W, undefined) .length === 0 || 'invalid');

// ---- meniu: back, visible_if, labels, compact ----
const bn = normalizeNav({ items: [{ back: true, label: 'Înapoi' }, { icon: 'tablet', label: 'Tableta', path: '/d/calm', visible_if: { entity: 'sensor.bm', state: 'Tableta' } }, { icon: 'home', label: 'Home', path: '/d/0' }, { label: 'x' }] });
t('nav: back fără path e valid; element fără path/back avertizat', () => bn.items.length === 3 && bn.items[0].back === true && bn.items[0].icon === 'back' && bn.warnings.length === 1 || JSON.stringify(bn));
t('nav: visible_if — ascuns când starea nu se potrivește, vizibil când da', () => { const off = renderNav(bn, '/d/0', { hass: { states: { 'sensor.bm': st('Telefon') } } }); const on = renderNav(bn, '/d/0', { hass: { states: { 'sensor.bm': st('Tableta') } } }); return !off.includes('Tableta') && on.includes('Tableta') && off.includes('Înapoi') && off.includes('Home') || 'vis'; });
t('nav: data-id păstrează indexul din config chiar dacă un element e ascuns', () => { const off = renderNav(bn, '/d/0', { hass: { states: {} } }); return off.includes('data-id="2"') && !off.includes('data-id="1"') || off; });
t('nav: labels:false → fără etichete; compact → clasa compact; spacer:false → fără spacer', () => { const h = renderNav({ ...bn, labels: false, compact: true, sticky: true, spacer: false }, '/d/0', { hass: { states: {} } }); return h.includes('nolabels') && h.includes('compact') && !h.includes('<span>Home</span>') && !h.includes('ccu-nav-spacer') || h; });
t('nav: back nu e niciodată „activ”', () => !renderNav(bn, '/', { hass: { states: {} } }).includes('data-id="0" data-state="on"') || 'on');

// ---- patchNodes cu un DOM fals minimal ----
function el(name, attrs = {}, kids = []) {
  const n = { nodeType: 1, nodeName: name, childNodes: kids, _a: { ...attrs },
    get attributes() { return Object.entries(this._a).map(([name, value]) => ({ name, value })); },
    hasAttribute(k) { return k in this._a; }, getAttribute(k) { return this._a[k]; }, setAttribute(k, v) { this._a[k] = v; }, removeAttribute(k) { delete this._a[k]; } };
  return n;
}
const tx = (v) => ({ nodeType: 3, nodeName: '#text', nodeValue: v, childNodes: [] });
t('patchNodes: text și atribute actualizate pe același nod', () => {
  const span = el('SPAN', { class: 'a' }, [tx('1')]); const o = el('DIV', {}, [span]);
  const n = el('DIV', {}, [el('SPAN', { class: 'b', 'data-x': '1' }, [tx('2')])]);
  const ok = patchNodes(o, n);
  return (ok === true && o.childNodes[0] === span && span._a.class === 'b' && span._a['data-x'] === '1' && span.childNodes[0].nodeValue === '2') || 'nu s-a actualizat pe loc';
});
t('patchNodes: atribut dispărut e scos', () => { const s = el('SPAN', { a: '1', b: '2' }); const o = el('DIV', {}, [s]); patchNodes(o, el('DIV', {}, [el('SPAN', { a: '1' })])); return !('b' in s._a) || 'a rămas'; });
t('patchNodes: număr de copii diferit → false', () => patchNodes(el('DIV', {}, [el('A')]), el('DIV', {}, [el('A'), el('A')])) === false);
t('patchNodes: alt tip de nod → false', () => patchNodes(el('DIV', {}, [el('A')]), el('DIV', {}, [el('B')])) === false);
t('patchNodes: două randări cu valori diferite păstrează nodurile', () => {
  const dummy = (txt) => el('DIV', {}, [el('BUTTON', { 'data-state': txt }, [tx(txt)])]);
  const o = dummy('off'); const btn = o.childNodes[0]; const r = patchNodes(o, dummy('on'));
  return (r === true && o.childNodes[0] === btn && btn._a['data-state'] === 'on' && btn.childNodes[0].nodeValue === 'on') || 'noduri înlocuite';
});

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
