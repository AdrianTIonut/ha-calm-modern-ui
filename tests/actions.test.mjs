// tests/actions.test.mjs — teste pentru actions (runAction)
// Rulat cu: node --input-type=module tests/actions.test.mjs

import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { runAction, runToggle, runMoreInfo, runNavigate, runCallService, runUrl } from '../src/actions.mjs';

// ceas fals pentru timere
let fakeTime = 0;
const timers = []; // {id, delay, callback}
const setFakeTime = (ms) => {
  fakeTime = ms;
  timers
    .filter(t => t.delay <= fakeTime && !t.completed)
    .forEach(t => {
      t.completed = true;
      t.callback();
    });
};

// nod fals care înregistrează ascultătorii
const createFakeNode = (id = 'node') => {
  const node = {
    id,
    dataset: {},
    dispatchEvent: (e) => {
      node.events = node.events || [];
      node.events.push(e);
    },
    addEventListener: (type, handler) => {
      node.handlers = node.handlers || {};
      node.handlers[type] = node.handlers[type] || [];
      node.handlers[type].push(handler);
    },
    removeEventListener: (type, handler) => {
      if (node.handlers?.[type]) {
        node.handlers[type] = node.handlers[type].filter(h => h !== handler);
      }
    },
    style: {}
  };
  return node;
};

// window fals pentru runUrl și runNavigate
let fakeWindow = {
  open: (url, target, features) => {
    fakeWindow.lastOpen = { url, target, features };
    return { focus: () => {} };
  },
  dispatchEvent: (e) => {
    fakeWindow.events = fakeWindow.events || [];
    fakeWindow.events.push(e);
  }
};

// history fals pentru runNavigate
let fakeHistory = {
  pushState: (state, title, url) => {
    fakeHistory.lastState = { state, title, url };
    fakeWindow.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true, detail: { replace: false } }));
  }
};

// hass fals cu states
const createFakeHass = () => ({
  calls: [],
  states: {},
  callService: (domain, service, data, target) => {
    hass.calls.push({ domain, service, data, target });
  }
});

let hass = createFakeHass();

let pass = 0, fail = 0;

function ok(desc) { pass++; console.log(`✔ ${desc}`); }
function failt(desc, err) { fail++; console.log(`✖ ${desc}${err ? ': ' + err : ''}`); }

// ---- setup/teardown ----
function setupTest() {
  hass = createFakeHass();
  fakeWindow = {
    open: (url, target, features) => {
      fakeWindow.lastOpen = { url, target, features };
      return { focus: () => {} };
    },
    dispatchEvent: (e) => {
      fakeWindow.events = fakeWindow.events || [];
      fakeWindow.events.push(e);
    }
  };
  fakeHistory = {
    pushState: (state, title, url) => {
      fakeHistory.lastState = { state, title, url };
      fakeWindow.dispatchEvent(new CustomEvent('location-changed', { bubbles: true, composed: true, detail: { replace: false } }));
    }
  };
  globalThis.window = fakeWindow;
  globalThis.history = fakeHistory;
}

function teardownTest() {
  delete globalThis.window;
  delete globalThis.history;
  timers.length = 0;
}

// ---- runToggle ----
try {
  setupTest();

  // toggle light (implicit homeassistant.toggle)
  const btnLight = createFakeNode('light');
  btnLight.dataset.entity = 'light.living';
  hass.states['light.living'] = { state: 'on' };
  runToggle(hass, btnLight, { entity: 'light.living' });
  if (hass.calls?.[0]?.domain === 'light' && hass.calls?.[0]?.service === 'turn_off') {
    ok('runToggle light (on → turn_off, nu toggle: multe relee nu au toggle)');
  } else {
    failt('runToggle light', `got ${hass.calls?.[0]?.service}`);
  }

  // toggle lock (lock → unlock dacă locked, altfel lock)
  const btnLocked = createFakeNode('lock');
  btnLocked.dataset.entity = 'lock.door';
  hass.states['lock.door'] = { state: 'locked' };
  runToggle(hass, btnLocked, { entity: 'lock.door' });
  if (hass.calls?.[1]?.service === 'unlock') {
    ok('runToggle lock locked → unlock');
  } else {
    failt('runToggle lock locked', `got ${hass.calls?.[1]?.service}`);
  }

  const btnUnlocked = createFakeNode('lock');
  btnUnlocked.dataset.entity = 'lock.door';
  hass.states['lock.door'] = { state: 'unlocked' };
  runToggle(hass, btnUnlocked, { entity: 'lock.door' });
  if (hass.calls?.[2]?.service === 'lock') {
    ok('runToggle lock unlocked → lock');
  } else {
    failt('runToggle lock unlocked', `got ${hass.calls?.[2]?.service}`);
  }

  // toggle cover
  const btnCover = createFakeNode('cover');
  btnCover.dataset.entity = 'cover.garage';
  hass.states['cover.garage'] = { state: 'closed' };
  runToggle(hass, btnCover, { entity: 'cover.garage' });
  if (hass.calls?.[3]?.service === 'toggle') {
    ok('runToggle cover');
  } else {
    failt('runToggle cover', `got ${hass.calls?.[3]?.service}`);
  }

  // toggle button/input_button
  const btnButton = createFakeNode('button');
  btnButton.dataset.entity = 'button.doorbell';
  hass.states['button.doorbell'] = { state: 'idle' };
  runToggle(hass, btnButton, { entity: 'button.doorbell' });
  if (hass.calls?.[4]?.service === 'press') {
    ok('runToggle button');
  } else {
    failt('runToggle button', `got ${hass.calls?.[4]?.service}`);
  }

  // toggle scene → scene.turn_on
  const btnScene = createFakeNode('scene');
  btnScene.dataset.entity = 'scene.vacation';
  hass.states['scene.vacation'] = { state: 'idle' };
  runToggle(hass, btnScene, { entity: 'scene.vacation' });
  if (hass.calls?.[5]?.service === 'turn_on') {
    ok('runToggle scene → turn_on');
  } else {
    failt('runToggle scene', `got ${hass.calls?.[5]?.service}`);
  }

  // toggle script → script.turn_on
  const btnScript = createFakeNode('script');
  btnScript.dataset.entity = 'script.morning';
  hass.states['script.morning'] = { state: 'idle' };
  runToggle(hass, btnScript, { entity: 'script.morning' });
  if (hass.calls?.[6]?.service === 'turn_on') {
    ok('runToggle script → turn_on');
  } else {
    failt('runToggle script', `got ${hass.calls?.[6]?.service}`);
  }

  // toggle fără entitate → nu face nimic
  const btnNoEntity = createFakeNode('no-entity');
  runToggle(hass, btnNoEntity, {});
  if (hass.calls?.length === 7) {
    ok('runToggle fără entitate');
  } else {
    failt('runToggle fără entitate', `got ${hass.calls?.length} calls`);
  }

  // toggle cu entity_id (NU dataset.id)
  const btnEntityId = createFakeNode('light');
  btnEntityId.dataset.entity = 'light.living2'; // dataset.id nu e folosit
  hass.states['light.living2'] = { state: 'on' };
  runToggle(hass, btnEntityId, { entity_id: 'light.living2' });
  if (hass.calls?.[7]?.service === 'turn_off') {
    ok('runToggle cu entity_id (NU dataset.id)');
  } else {
    failt('runToggle cu entity_id', `got ${hass.calls?.[7]?.service}`);
  }

  teardownTest();
} catch (e) { failt('runToggle', e.message); }

// ---- runMoreInfo ----
try {
  setupTest();

  const btn = createFakeNode('climate');
  btn.dataset.entity = 'climate.kitchen';
  runMoreInfo(hass, btn);
  const event = btn.events?.[0];
  if (event?.type === 'hass-more-info' && event.detail?.entityId === 'climate.kitchen') {
    ok('runMoreInfo');
  } else {
    failt('runMoreInfo', `got ${event?.type}`);
  }

  teardownTest();
} catch (e) { failt('runMoreInfo', e.message); }

// ---- runNavigate ----
try {
  setupTest();

  const btn = createFakeNode('nav');
  runNavigate(hass, btn, { path: '/dashboard-1/view-2' });
  if (fakeHistory.lastState?.url === '/dashboard-1/view-2') {
    ok('runNavigate cu path /');
  } else {
    failt('runNavigate cu path /', `got ${fakeHistory.lastState?.url}`);
  }

  // navigate fără path → nu face nimic
  setupTest();
  const btn2 = createFakeNode('nav');
  runNavigate(hass, btn2, {});
  if (fakeHistory.lastState === undefined) {
    ok('runNavigate fără path');
  } else {
    failt('runNavigate fără path', `got ${fakeHistory.lastState?.url}`);
  }

  // navigate cu path fără '/' → warning + nu navighează
  setupTest();
  const btn3 = createFakeNode('nav');
  runNavigate(hass, btn3, { path: 'dashboard-1/view-2' });
  ok('runNavigate path fără / → warning');

  teardownTest();
} catch (e) { failt('runNavigate', e.message); }

// ---- runCallService ----
try {
  setupTest();

  const btn = createFakeNode('service');
  runCallService(hass, btn, { service: 'light.turn_on', service_data: { brightness: 200 } });
  if (hass.calls?.[0]?.service === 'turn_on') {
    ok('runCallService');
  } else {
    failt('runCallService', `got ${hass.calls?.[0]?.service}`);
  }

  // call-service fără service → nu apelează
  setupTest();
  const btn2 = createFakeNode('service');
  runCallService(hass, btn2, {});
  if (hass.calls?.length === 0) {
    ok('runCallService fără service');
  } else {
    failt('runCallService fără service', `got ${hass.calls?.length} calls`);
  }

  // call-service cu target
  setupTest();
  const btn3 = createFakeNode('service');
  runCallService(hass, btn3, {
    service: 'scene.turn_on',
    service_data: {},
    target: { entity_id: ['scene.vacation'] }
  });
  const call3 = hass.calls?.[0];
  if (call3?.target?.entity_id?.[0] === 'scene.vacation') {
    ok('runCallService cu target');
  } else {
    failt('runCallService cu target', `got ${JSON.stringify(call3?.target)}`);
  }

  teardownTest();
} catch (e) { failt('runCallService', e.message); }

// ---- runUrl ----
try {
  setupTest();

  const btn = createFakeNode('url');

  // url http/https → se deschide
  runUrl(hass, btn, { url: 'https://exemplu.ro' });
  if (fakeWindow.lastOpen?.url === 'https://exemplu.ro') {
    ok('runUrl https://exemplu.ro');
  } else {
    failt('runUrl https', `got ${fakeWindow.lastOpen?.url}`);
  }

  // url HTTP (majuscule) → se deschide
  setupTest();
  const btn2 = createFakeNode('url');
  runUrl(hass, btn2, { url: 'HTTP://EXAMPLE.COM' });
  if (fakeWindow.lastOpen?.url === 'HTTP://EXAMPLE.COM') {
    ok('runUrl HTTP://EXAMPLE.COM (majuscule)');
  } else {
    failt('runUrl HTTP', `got ${fakeWindow.lastOpen?.url}`);
  }

  // url javascript: → NU se deschide
  setupTest();
  const btn3 = createFakeNode('url');
  runUrl(hass, btn3, { url: 'javascript:alert(1)' });
  ok('runUrl javascript:alert(1) → refuzat');

  // url JAVASCRIPT:x → NU se deschide
  setupTest();
  const btn4 = createFakeNode('url');
  runUrl(hass, btn4, { url: 'JAVASCRIPT:x' });
  ok('runUrl JAVASCRIPT:x → refuzat');

  // url data:text/html → NU se deschide
  setupTest();
  const btn5 = createFakeNode('url');
  runUrl(hass, btn5, { url: 'data:text/html,<h1>Hello</h1>' });
  ok('runUrl data:text/html → refuzat');

  teardownTest();
} catch (e) { failt('runUrl', e.message); }

// ---- runAction (general) ----
try {
  setupTest();

  const btn = createFakeNode('action');
  btn.dataset.entity = 'light.living';

  // runAction cu 'toggle' (light → serviciul generic homeassistant.toggle)
  runAction(hass, btn, 'toggle');
  if (hass.calls?.[0]?.domain === 'light' && hass.calls?.[0]?.service === 'turn_on') {
    ok('runAction toggle');
  } else {
    failt('runAction toggle', `got ${hass.calls?.[0]?.service}`);
  }

  // runAction cu 'more-info'
  const btn2 = createFakeNode('action');
  btn2.dataset.entity = 'climate.kitchen';
  runAction(hass, btn2, 'more-info');
  if (btn2.events?.[0]?.type === 'hass-more-info') {
    ok('runAction more-info');
  } else {
    failt('runAction more-info', `got ${btn2.events?.[0]?.type}`);
  }

  // runAction cu 'navigate'
  setupTest();
  const btn3 = createFakeNode('action');
  runAction(hass, btn3, { action: 'navigate', path: '/dashboard' });
  if (fakeHistory.lastState?.url === '/dashboard') {
    ok('runAction navigate');
  } else {
    failt('runAction navigate', `got ${fakeHistory.lastState?.url}`);
  }

  // runAction cu 'call-service'
  setupTest();
  const btn4 = createFakeNode('action');
  runAction(hass, btn4, { action: 'call-service', service: 'light.turn_on' });
  if (hass.calls?.[0]?.service === 'turn_on') {
    ok('runAction call-service');
  } else {
    failt('runAction call-service', `got ${hass.calls?.[0]?.service}`);
  }

  // runAction cu 'url'
  setupTest();
  const btn5 = createFakeNode('action');
  runAction(hass, btn5, { action: 'url', url: 'https://example.com' });
  if (fakeWindow.lastOpen?.url === 'https://example.com') {
    ok('runAction url');
  } else {
    failt('runAction url', `got ${fakeWindow.lastOpen?.url}`);
  }

  // runAction cu 'none'
  setupTest();
  const btn6 = createFakeNode('action');
  runAction(hass, btn6, 'none');
  if (hass.calls?.length === 0 && !fakeWindow.lastOpen) {
    ok('runAction none');
  } else {
    failt('runAction none', `got ${hass.calls?.length} calls`);
  }

  teardownTest();
} catch (e) { failt('runAction', e.message); }

// ---- Rezumat ----
console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
