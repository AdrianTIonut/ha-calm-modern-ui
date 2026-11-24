// tests/config.test.mjs — teste pentru normalizeConfig și funcții asociate
// Rulat cu: node --input-type=module tests/config.test.mjs

import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { normalizeConfig, normalizeEntity, domainIcon, normalizeAction, validateAction } from '../src/config.mjs';

let pass = 0, fail = 0;

function ok(desc) { pass++; console.log(`✔ ${desc}`); }
function failt(desc, err) { fail++; console.log(`✖ ${desc}${err ? ': ' + err : ''}`); }

// ---- domainIcon ----
ok('domainIcon("light") === "mdi:lightbulb"') || true;
if (domainIcon('light') !== 'mdi:lightbulb') failt('domainIcon light');

// ---- normalizeAction ----
try {
  const a1 = normalizeAction('toggle');
  if (a1.action !== 'toggle') throw new Error(`got ${a1.action}`);
  ok('normalizeAction("toggle")');

  const a2 = normalizeAction({ action: 'more-info' });
  if (a2.action !== 'more-info') throw new Error(`got ${a2.action}`);
  ok('normalizeAction({action:"more-info"})');

  const a3 = normalizeAction({ service: 'light.turn_on' });
  if (a3.action !== 'call-service') throw new Error(`got ${a3.action}`);
  ok('normalizeAction cu service → call-service');

  const a4 = normalizeAction({}); // fără action și fără service → toggle implicit
  if (a4.action !== 'toggle') throw new Error(`got ${a4.action}`);
  ok('normalizeAction {} → toggle implicit');

  const a5 = normalizeAction(null);
  if (a5.action !== 'none') throw new Error(`got ${a5.action}`);
  ok('normalizeAction(null) → none');
} catch (e) { failt('normalizeAction', e.message); }

// ---- validateAction ----
try {
  const va1 = validateAction({ action: 'call-service' }); // fără service → warning
  if (!va1.some(w => w.includes('call-service fără service'))) {
    throw new Error('warnings');
  }
  ok('validateAction call-service fără service → warning');

  const va2 = validateAction({ action: 'toggle' });
  if (va2.length !== 0) throw new Error('no warnings');
  ok('validateAction toggle → fara warnings');

  const va3 = validateAction(null);
  if (va3.length !== 0) throw new Error('empty');
  ok('validateAction null → fara warnings');
} catch (e) { failt('validateAction', e.message); }

// ---- normalizeEntity ----
try {
  const e1 = normalizeEntity('light.living', 0);
  if (e1.entity.entity !== 'light.living') throw new Error('id');
  if (e1.entity.name !== 'living') throw new Error('name');
  ok('normalizeEntity string → {entity, name, icon}');

  const e2 = normalizeEntity({ entity: 'climate.kitchen' }, 1);
  if (e2.entity.icon !== 'mdi:thermostat') throw new Error('icon');
  ok('normalizeEntity climate → icon implicit');

  const e3 = normalizeEntity({ id: 'switch.bathroom', size: 'l' }, 2);
  if (e3.entity.entity !== 'switch.bathroom') throw new Error('id alias');
  if (e3.entity.size !== 'l') throw new Error('size preserved');
  ok('normalizeEntity {id, size} → entity+size');

  const e4 = normalizeEntity({ entity: 'binary_sensor.door', shape: 'pill' }, 3);
  if (e4.entity.shape !== 'pill') throw new Error('shape');
  ok('normalizeEntity shape=pill');

  const e5 = normalizeEntity({ entity: 'sensor.temp', colors: { accent: '#ff0000' } }, 4);
  if (!e5.entity.colors || e5.entity.colors.accent !== '#ff0000') throw new Error('colors');
  ok('normalizeEntity colors obiect');

  const e6 = normalizeEntity({ entity: 'light.hall', size: 'xxl' }, 5);
  if (e6.warnings.some(w => w.includes('xxl'))) {
    ok('normalizeEntity size necunoscut → warning');
  } else {
    failt('normalizeEntity size xxl → warning');
  }

  // tip neșir/neobiect → elimină din listă (nu „ignored_N”)
  const e7 = normalizeEntity(123, 6); // number
  if (e7.entity.entity === undefined && e7.warnings.some(w => w.includes('tip "number" ignorat'))) {
    ok('normalizeEntity number → eliminat, cu warning');
  } else {
    failt('normalizeEntity number');
  }

  // entity_id invalid (format)
  const e8 = normalizeEntity({ entity: '123invalid' }, 7);
  if (e8.entity.entity === undefined && e8.warnings.some(w => w.includes('invalid'))) {
    ok('normalizeEntity entity_id invalid (123invalid) → eliminat');
  } else {
    failt('normalizeEntity entity_id invalid');
  }

  // fără entity_id
  const e9 = normalizeEntity({ name: 'fără id' }, 8);
  if (e9.entity.entity === undefined && e9.warnings.some(w => w.includes('lipsește entity_id'))) {
    ok('normalizeEntity fără entity_id → eliminat');
  } else {
    failt('normalizeEntity fără entity_id');
  }
} catch (e) { failt('normalizeEntity', e.message); }

// ---- normalizeConfig (formă scurtă) ----
try {
  const c1 = normalizeConfig({ entities: ['light.living', 'switch.bedroom'] });
  if (c1.config.entities.length !== 2) throw new Error('nr entities');
  if (c1.config.density !== 'm') throw new Error('density');
  if (c1.config.preset !== 'green') throw new Error('preset');
  if (c1.config.columns !== 2) throw new Error('columns');
  ok('normalizeConfig scurtă → implicite density/preset/columns');

  const c2 = normalizeConfig({ entities: ['light.living', 'climate.kitchen'], density: 'l', columns: 3 });
  if (c2.config.density !== 'l') throw new Error('density overriden');
  if (c2.config.columns !== 3) throw new Error('columns overriden');
  ok('normalizeConfig scurtă → suprascriere densitate/coloane');

  const c3 = normalizeConfig({ entity: 'light.living' }); // formă singulară
  if (c3.config.entities.length !== 1) throw new Error('single entity');
  ok('normalizeConfig cu entity (singular)');

  const c4 = normalizeConfig({ entities: [] });
  if (c4.config.entities.length !== 0) throw new Error('empty entities');
  ok('normalizeConfig cu entities gol');
} catch (e) { failt('normalizeConfig scurtă', e.message); }

// ---- normalizeConfig (formă lungă) ----
try {
  const c5 = normalizeConfig({
    entities: [
      { entity: 'light.living', name: 'Bucătărie', size: 'xl', shape: 'round' },
      { entity: 'switch.bedroom', tap_action: 'toggle', hold_action: { action: 'more-info' } }
    ]
  });
  const e0 = c5.config.entities[0];
  if (e0.name !== 'Bucătărie') throw new Error('name');
  if (e0.size !== 'xl') throw new Error('size');
  if (e0.shape !== 'round') throw new Error('shape');
  ok('normalizeConfig lungă → entități complet descrise');

  const c6 = normalizeConfig({
    entities: [
      { entity: 'sensor.temp', colors: { accent: '#78b4c6' } },
      { entity: 'cover.garage', size: 's' }
    ],
    animations: false
  });
  if (c6.config.animations !== false) throw new Error('animations');
  ok('normalizeConfig animations: off');

  const c7 = normalizeConfig({
    entities: [
      { id: 'light.living' }, // alias pentru entity
      { entity: 'sensor.humidity', secondary: 'umiditate' }
    ]
  });
  if (c7.config.entities[0].entity !== 'light.living') throw new Error('id alias preserved');
  ok('normalizeConfig {id} → entity');
} catch (e) { failt('normalizeConfig lungă', e.message); }

// ---- normalizeConfig (invalide + puncte noi) ----
try {
  // punct 1: mesaj coloane să arate valoarea PRIMITĂ (cfg.columns), nu cea corectată
  const c8 = normalizeConfig({ columns: 8 }); // >6
  if (c8.warnings.some(w => w.includes('columns') || w.includes('8'))) {
    ok('normalizeConfig columns=8 (1–6) → warning cu valoarea primită');
  } else {
    failt('normalizeConfig columns=8 → warning cu valoarea primită');
  }

  // punct 2: entități neșir/neobiect elimină din listă (fără „ignored_N”)
  const c9 = normalizeConfig({
    entities: [
      'light.good',
      42, // number → eliminat
      { entity: 'switch.ok' }
    ]
  });
  if (c9.config.entities.length === 2 && !c9.config.entities.some(e => e.entity === 'ignored_1')) {
    ok('normalizeConfig cu number entitate → eliminat, fără ignored_N');
  } else {
    failt('normalizeConfig number entitate');
  }

  // punct 3: șterge warning-ul final „Fără entity_id: …” (dublat și indice greșit)
  const c10 = normalizeConfig({
    entities: [
      { entity: 'light.good' },
      { name: 'fără id' }, // eliminat din config.entities
      { entity: 'switch.ok' }
    ]
  });
  const warnFara = c10.warnings.filter(w => w.includes('Fără entity_id'));
  if (warnFara.length === 0) {
    ok('normalizeConfig fără entity_id → fără warning final (dublat) Fără entity_id');
  } else {
    failt('normalizeConfig fără entity_id → warning final dublat');
  }

  // punct 4: animations acceptă true/false/'on'/'off'; alt tip → true + warning
  const c11a = normalizeConfig({ animations: 'on' });
  const c11b = normalizeConfig({ animations: 'off' });
  const c11c = normalizeConfig({ animations: 'str' }); // alt tip
  if (c11a.config.animations === true && c11b.config.animations === false && c11c.config.animations === true) {
    ok('normalizeConfig animations on/off/str → boolean');
  } else {
    failt('normalizeConfig animations types');
  }

  // punct 5: păstrează TOATE cheile de nivel superior necunoscute (colors, shape, size, header, refresh_minutes, tabs etc.)
  const c12 = normalizeConfig({
    entities: [{ entity: 'light.x' }],
    colors: { accent: '#ff0000' },
    shape: 'round',
    refresh_minutes: 5,
    tabs: ['24h', '7d'],
    header: { title: 'Test', icon: 'mdi:home' }
  });
  const expectedKeys = ['colors', 'shape', 'refresh_minutes', 'tabs', 'header'];
  const allPresent = expectedKeys.every(k => Object.prototype.hasOwnProperty.call(c12.config, k));
  if (allPresent) {
    ok('normalizeConfig chei necunoscute → păstrate în config');
  } else {
    failt('normalizeConfig chei necunoscute');
  }

  // punct 6: validează entity_id cu /^[a-z_]+\.[a-z0-9_]+$/; invalid → warning + entitate eliminată
  const c13 = normalizeConfig({
    entities: [
      { entity: 'light.valid' },
      { entity: '123invalid' }, // invalid (start cu cifră)
      { entity: 'sensor.ok' }
    ]
  });
  if (c13.config.entities.length === 2 && c13.warnings.some(w => w.includes('invalid'))) {
    ok('normalizeConfig entity_id invalid (123invalid) → eliminat');
  } else {
    failt('normalizeConfig entity_id invalid');
  }

  // punct 7: normalizeAction: call-service fără service → warning (validateAction)
  const c14 = normalizeConfig({
    entities: [
      {
        entity: 'light.living',
        tap_action: { action: 'call-service' } // fără service
      }
    ]
  });
  // în config nu avem warning-ul, dar validateAction îl generează; testăm funcția separat:
  const vaTest = validateAction({ action: 'call-service' });
  if (vaTest.some(w => w.includes('call-service fără service'))) {
    ok('validateAction call-service fără service → warning');
  } else {
    failt('validateAction call-service fără service');
  }

  // punct 8: entitate fără size primește size = config.density; fără shape → 'chamfer'
  const c15 = normalizeConfig({
    density: 'l',
    entities: [
      { entity: 'light.a' }, // fără size/shape
      { entity: 'switch.b', shape: 'pill' } // fără size
    ]
  });
  const e15a = c15.config.entities[0];
  const e15b = c15.config.entities[1];
  if (e15a.size === 'l' && e15a.shape === 'chamfer' && e15b.size === 'l' && e15b.shape === 'pill') {
    ok('normalizeConfig entitate fără size→density, fără shape→chamfer');
  } else {
    failt('normalizeConfig entitate size/shape implicite');
  }

  // punct 9: columns: întreg 1–6, altfel warning cu valoarea primită + implicit 2
  const c16 = normalizeConfig({
    columns: 'cinci', // string
    entities: [{ entity: 'light.x' }]
  });
  if (c16.config.columns === 2 && c16.warnings.some(w => w.includes('cinci'))) {
    ok('normalizeConfig columns="cinci" → implicit 2 + warning cu valoarea primită');
  } else {
    failt('normalizeConfig columns string');
  }

  // punct a: animations cu valoare neacceptată (ex: 'x', 5) → true + warning cu valoarea primită
  const c17 = normalizeConfig({
    animations: 'x',
    entities: [{ entity: 'light.x' }]
  });
  if (c17.config.animations === true && c17.warnings.some(w => w.includes('x'))) {
    ok('normalizeConfig animations="x" → true + warning');
  } else {
    failt('normalizeConfig animations neacceptat');
  }

  // punct b: config.shape invalid (ex: 'blob') → 'chamfer' + warning
  const c18 = normalizeConfig({
    shape: 'blob',
    entities: [{ entity: 'light.x' }]
  });
  if (c18.config.shape === 'chamfer' && c18.warnings.some(w => w.includes('blob'))) {
    ok('normalizeConfig shape="blob" → chamfer + warning');
  } else {
    failt('normalizeConfig shape invalid');
  }
} catch (e) { failt('normalizeConfig invalide + puncte noi', e.message); }

// ---- animations lipsă: implicit true, FĂRĂ avertisment (reparat la integrare) ----
try {
  const r = normalizeConfig({ entities: ['light.x'] });
  if (r.config.animations === true && !r.warnings.some(w => /nimations/.test(w))) ok('animations lipsă → true, fără avertisment');
  else failt('animations lipsă', JSON.stringify(r.warnings));
} catch (e) { failt('animations lipsă', e.message); }

// ---- rezumat ----

// ---- ce se vede pe buton: validare ----
{
  const r = normalizeConfig({ type: 'x', show_icon: 'da', show_state: true, state_style: 'puncte', state_labels: 'x', entities: [{ entity: 'light.a', show_name: 1, state_style: 'text' }] });
  const w = r.warnings.join(' | ');
  if (r.config.show_icon === undefined && r.config.show_state === true && r.config.state_style === undefined && r.config.state_labels === undefined && r.config.entities[0].show_name === undefined && r.config.entities[0].state_style === 'text'
      && /show_icon/.test(w) && /state_style|stilul stării/.test(w) && /state_labels/.test(w) && /show_name/.test(w)) ok('opțiunile „ce se vede pe buton”: valorile invalide se șterg cu avertisment, cele valide rămân');
  else failt('opțiunile „ce se vede pe buton”', JSON.stringify({ c: r.config, w }));
}
{
  const r = normalizeConfig({ type: 'x', state_labels: { on: ' Aprins ', off: '', alert: 5, bogus: 'x', unavailable: 'N/A' }, entities: ['light.a'] });
  const sl = r.config.state_labels || {};
  if (sl.on === 'Aprins' && sl.unavailable === 'N/A' && !('off' in sl) && !('alert' in sl) && !('bogus' in sl)) ok('state_labels: doar cheile cunoscute, cu text; spațiile se taie');
  else failt('state_labels curățare', JSON.stringify(sl));
}
{
  const r = normalizeConfig({ type: 'x', show_name: false, show_value: false, show_icon: true, show_state: false, state_style: 'dot', entities: ['light.a'] });
  if (r.warnings.length === 0 && r.config.show_name === false && r.config.show_value === false) ok('opțiuni valide: fără avertismente');
  else failt('opțiuni valide', JSON.stringify(r.warnings));
}

{
  const r = normalizeConfig({ type: 'x', wave: 'da', entities: ['light.a'] });
  if (r.config.wave === undefined && r.warnings.length >= 1) ok('wave nebooleană: ignorată, cu avertisment');
  else failt('wave nebooleană', JSON.stringify([r.config.wave, r.warnings]));
}
{
  const r = normalizeConfig({ type: 'x', wave: true, entities: [{ entity: 'light.a', wave: false }] });
  if (r.config.wave === true && r.config.entities[0].wave === false && r.warnings.length === 0) ok('wave boolean păstrată pe card și pe entitate');
  else failt('wave boolean', JSON.stringify([r.config, r.warnings]));
}

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
