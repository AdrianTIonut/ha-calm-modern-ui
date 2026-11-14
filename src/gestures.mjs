// src/gestures.mjs — gesturi pentru ccu: tap, hold (500 ms), double_tap (fereastră 300 ms).
// Pointer events (nu Touch/Mouse separat: pe telefon ar declanșa de două ori). Derularea paginii anulează gestul
// (cu touch-action: pan-y browserul trimite pointercancel). Mișcare > 10 px sau ieșirea din buton = anulare.

export const HOLD_MS = 500;
export const DOUBLE_MS = 300;
export const MOVE_PX = 10;

/**
 * attachGestures(node, { tap, hold, double_tap }, hass) — fiecare handler primește (node, hass).
 * Întoarce funcția de dezlegare (detach), care scoate ascultătorii și curăță timerele. Este pusă și pe node.detachGestures.
 */
export function attachGestures(node, handlers, hass) {
  const { tap, hold, double_tap } = handlers || {};
  const st = { x: 0, y: 0, active: false, cancelled: false, held: false };
  let holdTimer = null;
  let tapTimer = null; // tap în așteptare (doar când există double_tap)

  const stopHold = () => { if (holdTimer !== null) { clearTimeout(holdTimer); holdTimer = null; } };
  const stopTap = () => { if (tapTimer !== null) { clearTimeout(tapTimer); tapTimer = null; } };
  const cancel = () => { st.cancelled = true; st.active = false; stopHold(); stopTap(); };

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // doar butonul principal
    st.x = e.clientX; st.y = e.clientY;
    st.active = true; st.cancelled = false; st.held = false;
    stopHold();
    try { node.setPointerCapture?.(e.pointerId); } catch (_) { /* ignorat */ }
    if (hold) {
      holdTimer = setTimeout(() => {
        holdTimer = null;
        if (st.active && !st.cancelled) { st.held = true; hold(node, hass); }
      }, HOLD_MS);
    }
  };

  const onMove = (e) => {
    if (!st.active || st.cancelled) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (Math.hypot(dx, dy) > MOVE_PX) cancel();
  };

  const onUp = () => {
    stopHold();
    const wasActive = st.active;
    st.active = false;
    if (!wasActive || st.cancelled || st.held) return;
    if (!double_tap) { if (tap) tap(node, hass); return; }
    if (tapTimer !== null) { stopTap(); double_tap(node, hass); return; } // al doilea tap în fereastră
    tapTimer = setTimeout(() => { tapTimer = null; if (tap) tap(node, hass); }, DOUBLE_MS);
  };

  const onCancel = () => cancel();

  if (node.style) node.style.touchAction = 'pan-y';
  node.addEventListener('pointerdown', onDown);
  node.addEventListener('pointermove', onMove);
  node.addEventListener('pointerup', onUp);
  node.addEventListener('pointercancel', onCancel);
  node.addEventListener('pointerleave', onCancel);

  const detach = () => {
    node.removeEventListener('pointerdown', onDown);
    node.removeEventListener('pointermove', onMove);
    node.removeEventListener('pointerup', onUp);
    node.removeEventListener('pointercancel', onCancel);
    node.removeEventListener('pointerleave', onCancel);
    stopHold(); stopTap();
    st.active = false;
  };
  node.detachGestures = detach;
  return detach;
}

export function detachGestures(node) {
  if (node && typeof node.detachGestures === 'function') node.detachGestures();
}
