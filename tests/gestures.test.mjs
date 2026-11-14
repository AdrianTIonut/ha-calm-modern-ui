// tests/gestures.test.mjs — gesturi (tap / hold / double_tap). Rulare: node tests/gestures.test.mjs
// Fără PointerEvent/DOM: nod fals cu registru de ascultători + ceas fals pentru setTimeout/clearTimeout.
import { setLang } from '../src/i18n.mjs'; setLang('ro');   // testele verifică textele în română (limba sursă)
import { attachGestures, detachGestures } from '../src/gestures.mjs';

// ---- ceas fals ----
let now = 0, seq = 0, timers = new Map();
globalThis.setTimeout = (fn, ms) => { const id = ++seq; timers.set(id, { at: now + ms, fn }); return id; };
globalThis.clearTimeout = (id) => { timers.delete(id); };
function advance(ms) {
  const target = now + ms;
  for (;;) {
    let next = null;
    for (const [id, t] of timers) if (t.at <= target && (!next || t.at < next[1].at)) next = [id, t];
    if (!next) break;
    now = next[1].at; timers.delete(next[0]); next[1].fn();
  }
  now = target;
}

// ---- nod fals ----
function makeNode() {
  const l = {};
  return {
    style: {}, captured: [],
    addEventListener(t, h) { (l[t] = l[t] || []).push(h); },
    removeEventListener(t, h) { l[t] = (l[t] || []).filter((x) => x !== h); },
    setPointerCapture(id) { this.captured.push(id); },
    fire(type, e = {}) { (l[type] || []).slice().forEach((h) => h({ type, button: 0, clientX: 0, clientY: 0, pointerId: 1, ...e })); },
    total() { return Object.values(l).reduce((n, a) => n + a.length, 0); },
  };
}
const setup = (cfg) => {
  const log = [];
  const node = makeNode();
  const h = {};
  for (const k of ['tap', 'hold', 'double_tap']) if (cfg.includes(k)) h[k] = () => log.push(k);
  attachGestures(node, h, {});
  return { node, log };
};
const press = (n, ms = 50, e = {}) => { n.fire('pointerdown', e); advance(ms); n.fire('pointerup', e); };

let pass = 0, fail = 0;
const t = (name, fn) => {
  timers = new Map(); now = 0;
  try { const r = fn(); if (r === true) { pass++; console.log('✔ ' + name); } else { fail++; console.log('✖ ' + name + ': ' + r); } }
  catch (e) { fail++; console.log('✖ ' + name + ': ' + e.message); }
};
const is = (log, exp) => JSON.stringify(log) === JSON.stringify(exp) || `got ${JSON.stringify(log)}, vrut ${JSON.stringify(exp)}`;

t('touch-action pan-y', () => { const { node } = setup(['tap']); return node.style.touchAction === 'pan-y' || node.style.touchAction; });
t('tap fără double_tap = imediat', () => { const { node, log } = setup(['tap']); press(node); return is(log, ['tap']); });
t('tap cu double_tap = abia după 300 ms', () => {
  const { node, log } = setup(['tap', 'double_tap']); press(node);
  if (log.length) return 'prea devreme ' + JSON.stringify(log);
  advance(299); if (log.length) return 'înainte de 300 ms';
  advance(2); return is(log, ['tap']);
});
t('două tap-uri în 300 ms = doar double_tap', () => {
  const { node, log } = setup(['tap', 'double_tap']); press(node); advance(100); press(node); advance(1000); return is(log, ['double_tap']);
});
t('două tap-uri la > 300 ms = două tap', () => {
  const { node, log } = setup(['tap', 'double_tap']); press(node); advance(400); press(node); advance(400); return is(log, ['tap', 'tap']);
});
t('hold 500 ms = doar hold', () => {
  const { node, log } = setup(['tap', 'hold']); node.fire('pointerdown'); advance(499); if (log.length) return 'prea devreme';
  advance(2); node.fire('pointerup'); advance(1000); return is(log, ['hold']);
});
t('după hold, tap-ul următor funcționează', () => {
  const { node, log } = setup(['tap', 'hold']); node.fire('pointerdown'); advance(600); node.fire('pointerup'); press(node); return is(log, ['hold', 'tap']);
});
t('tap scurt NU declanșează hold', () => { const { node, log } = setup(['tap', 'hold']); press(node, 100); advance(2000); return is(log, ['tap']); });
t('după un hold, alt hold funcționează', () => {
  const { node, log } = setup(['hold']); for (let i = 0; i < 2; i++) { node.fire('pointerdown'); advance(600); node.fire('pointerup'); } return is(log, ['hold', 'hold']);
});
t('mișcare 11 px = nimic', () => {
  const { node, log } = setup(['tap', 'hold']); node.fire('pointerdown'); node.fire('pointermove', { clientX: 11 }); advance(1000); node.fire('pointerup'); return is(log, []);
});
t('mișcare 9 px = tap normal', () => {
  const { node, log } = setup(['tap']); node.fire('pointerdown'); node.fire('pointermove', { clientX: 6, clientY: 6 }); node.fire('pointerup'); return is(log, ['tap']);
});
t('pointercancel (scroll) = nimic', () => {
  const { node, log } = setup(['tap', 'hold']); node.fire('pointerdown'); advance(100); node.fire('pointercancel'); advance(1000); node.fire('pointerup'); return is(log, []);
});
t('pointerleave = nimic', () => {
  const { node, log } = setup(['tap']); node.fire('pointerdown'); node.fire('pointerleave'); node.fire('pointerup'); return is(log, []);
});
t('după anulare, o atingere nouă funcționează', () => {
  const { node, log } = setup(['tap']); node.fire('pointerdown'); node.fire('pointercancel'); press(node); return is(log, ['tap']);
});
t('buton secundar ignorat', () => { const { node, log } = setup(['tap']); node.fire('pointerdown', { button: 2 }); node.fire('pointerup', { button: 2 }); return is(log, []); });
t('pointerup fără pointerdown = nimic', () => { const { node, log } = setup(['tap']); node.fire('pointerup'); return is(log, []); });
t('setPointerCapture apelat', () => { const { node } = setup(['tap']); node.fire('pointerdown', { pointerId: 7 }); return node.captured[0] === 7 || 'fără capture'; });
t('detach scoate ascultătorii', () => { const { node } = setup(['tap', 'hold']); detachGestures(node); return node.total() === 0 || 'au rămas ' + node.total(); });
t('detach curăță timerele (hold în așteptare)', () => {
  const { node, log } = setup(['hold']); node.fire('pointerdown'); detachGestures(node); advance(1000); return (is(log, []) === true && timers.size === 0) || 'timere rămase ' + timers.size;
});
t('detach curăță tap în așteptare', () => {
  const { node, log } = setup(['tap', 'double_tap']); press(node); detachGestures(node); advance(1000); return is(log, []);
});
t('handler lipsă nu aruncă excepție', () => { const { node } = setup([]); press(node); node.fire('pointerdown'); advance(600); node.fire('pointerup'); return true; });

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail ? 1 : 0);
