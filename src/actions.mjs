// src/actions.mjs — acțiuni pentru ccu-buttons-card (tap/hold/double_tap)

/**
 * Rulează o acțiune pe un nod.
 * Parametri:
 * - hass: obiect HA (fake) cu callService, history, window, etc.
 * - node: nodul (button) pe care se execută acțiunea
 * - cfg: config-ul acțiunii (ex: {action: 'toggle', entity: 'light.living'} sau 'more-info')
 */
export function runAction(hass, node, cfg) {
  if (!hass || !node) return;

  const action = typeof cfg === 'string' ? cfg : cfg?.action || 'toggle';

  switch (action) {
    case 'toggle':
      runToggle(hass, node, cfg);
      break;
    case 'more-info':
      runMoreInfo(hass, node, cfg);
      break;
    case 'navigate':
      runNavigate(hass, node, cfg);
      break;
    case 'call-service':
    case 'perform-action': // numele din editorul HA (selectorul ui_action)
      runCallService(hass, node, cfg);
      break;
    case 'url':
      runUrl(hass, node, cfg);
      break;
    case 'none':
    case undefined:
    case null:
      break; // nu face nimic
    default:
      // acțiune necunoscută → nu face nimic, nu aruncă excepție
      break;
  }
}

/**
 * Toggle: entitatea = cfg.entity ?? cfg.entity_id ?? node?.dataset?.entity (NU dataset.id, care e indexul).
 * Starea = hass.states?.[entityId]?.state (NU din dataset).
 */
function runToggle(hass, node, cfg) {
  const entityId = cfg?.entity ?? cfg?.entity_id ?? node?.dataset?.entity;
  if (!entityId) return;

  const state = hass.states?.[entityId]?.state;
  const [domain] = entityId.split('.');

  let service;
  switch (domain) {
    case 'lock':
      service = state === 'locked' ? 'unlock' : 'lock';
      break;
    case 'cover':
      service = 'toggle';
      break;
    case 'button':
    case 'input_button':
      service = 'press';
      break;
    case 'scene':
      service = 'turn_on';
      break;
    case 'script':
      service = 'turn_on';
      break;
    default:
      toggleEntity(hass, entityId);
      return;
  }

  hass.callService?.(domain, service, { entity_id: entityId });
}

const ON_OFF_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'siren', 'automation', 'climate', 'media_player', 'humidifier', 'remote'];

/**
 * Comută o entitate cu turn_on / turn_off în loc de `toggle`: multe prize și relee (Sonoff, Tuya, integrări custom) nu
 * implementează `toggle`, deci comanda „reușește” fără să facă nimic. turn_on / turn_off merg peste tot.
 */
export function toggleEntity(hass, entityId) {
  const domain = String(entityId).split('.')[0];
  if (!ON_OFF_DOMAINS.includes(domain)) { hass.callService?.('homeassistant', 'toggle', { entity_id: entityId }); return; }
  const st = hass.states?.[entityId]?.state;
  const off = st === 'off' || st === 'standby' || st === 'idle' && domain === 'media_player' || st === 'unavailable' || st === 'unknown' || st === undefined;
  hass.callService?.(domain, off ? 'turn_on' : 'turn_off', { entity_id: entityId });
}

/**
 * More-info: node.dispatchEvent(new CustomEvent('hass-more-info',{bubbles:true,composed:true,detail:{entityId}})).
 */
function runMoreInfo(hass, node, cfg) {
  const entityId = cfg?.entity ?? cfg?.entity_id ?? node?.dataset?.entity;
  if (!entityId) return;

  const event = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId }
  });
  node.dispatchEvent(event);
}

/**
 * Navigate: path începe cu '/'; history.pushState prin globalThis.history,
 * apoi globalThis.window?.dispatchEvent(new CustomEvent('location-changed',{detail:{replace:false}})).
 */
function runNavigate(hass, node, cfg) {
  const path = cfg?.path ?? cfg?.navigation_path;
  if (!path) return;

  if (!path.startsWith('/')) {
    console.warn(`navigate: path "${path}" does not start with '/', not navigating.`);
    return;
  }

  // history.pushState prin globalThis.history
  if (globalThis.history?.pushState) {
    globalThis.history.pushState(null, '', path);
  }

  // apoi eveniment 'location-changed'
  if (globalThis.window?.dispatchEvent) {
    const event = new CustomEvent('location-changed', {
      bubbles: true,
      composed: true,
      detail: { replace: false }
    });
    globalThis.window.dispatchEvent(event);
  }
}

/**
 * Call-service: 'domeniu.serviciu' → callService(domeniu, serviciu, service_data, target).
 */
function runCallService(hass, node, cfg) {
  const service = cfg?.service ?? cfg?.perform_action;
  if (!service) {
    console.warn('call-service: no service given, not calling.');
    return;
  }

  // 'domeniu.serviciu'
  const [domain, serviceName] = service.split('.');
  if (!domain || !serviceName) {
    console.warn(`call-service: invalid service "${service}".`);
    return;
  }

  const serviceData = cfg?.service_data ?? cfg?.data ?? {};
  const target = cfg?.target ?? {};

  hass.callService?.(domain, serviceName, serviceData, target);
}

/**
 * Url: parse cu new URL(url, 'https://x.invalid');
 * permis doar protocol 'http:' sau 'https:' (indiferent de majuscule/spații);
 * deschide cu globalThis.window?.open(url,'_blank','noopener').
 */
function runUrl(hass, node, cfg) {
  const url = cfg?.url ?? cfg?.url_path ?? cfg?.path;
  if (!url) return;

  let parsed;
  try {
    parsed = new URL(url, 'https://x.invalid');
  } catch (e) {
    console.warn(`url: invalid "${url}".`);
    return;
  }

  // permis doar protocol 'http:' sau 'https:'
  const protocol = parsed.protocol.toLowerCase();
  if (!['http:', 'https:'].includes(protocol)) {
    console.warn(`url: "${url}" refused (protocol ${protocol}).`);
    return;
  }

  // deschide cu globalThis.window?.open
  if (globalThis.window?.open) {
    const win = globalThis.window.open(url, '_blank', 'noopener');
    if (win) {
      win.focus();
    }
  }
}

// Export pentru testare
export { runToggle, runMoreInfo, runNavigate, runCallService, runUrl };
