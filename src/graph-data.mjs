import { t, weekdayShort, monthShort, decSep, thouSep } from './i18n.mjs';
// src/graph-data.mjs — prelucrare date și formatare pentru ccu-graph-card

/**
 * niceScale(min, max, ticks) — generează o scară „frumoasă” (1/2/5 × 10^n).
 * Returnează { ticks: number[], step: number, min: number, max: number }.
 *
 * Reguli:
 * - dacă min === max → extinde simetric cu ±step/2 (step dedus din ticks)
 * - dacă min > max → inversează (min/max), cu warning în log (NU aruncă excepție)
 * - dacă ambele sunt 0 → extinde la [-step/2, +step/2]
 * - step e rotunjit la 1/2/5 × 10^n
 * - ticks contează ca recomandare (nu strict)
 */
export function niceScale(min, max, ticks = 4) {
  if (!Number.isFinite(min) || Number.isNaN(min)) min = 0;
  if (!Number.isFinite(max) || Number.isNaN(max)) max = 0;

  // dacă min === max, extinde simetric
  if (min === max) {
    const span = max === 0 ? 1 : Math.abs(max) * 0.2;
    const extend = Math.max(span, getNiceStep(max, ticks));
    min -= extend;
    max += extend;
  }

  // dacă min > max, inversează (nu aruncă)
  if (min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }

  const range = max - min;
  if (range === 0) {
    // extinde în jurul 0 sau al valorii
    const base = Math.abs(min) > 0 ? min : 1;
    const extend = getNiceStep(base, ticks);
    min -= extend;
    max += extend;
  }

  // pas inițial approx
  let step = range / (ticks - 1);
  step = roundNiceStep(step);

  // recalculăm min/max pentru a le alinia la step (multiplu de step)
  const minRounded = Math.floor(min / step) * step;
  const maxRounded = Math.ceil(max / step) * step;
  const newRange = maxRounded - minRounded;

  // ajustăm ticks dacă range e foarte mic (ex: 0.1 cu step 0.1 → doar 2 ticks)
  const calculatedTicks = Math.floor(newRange / step) + 1;
  const finalTicks = Math.max(ticks, Math.min(5, calculatedTicks));

  const ticksArr = [];
  for (let i = 0; i <= finalTicks; i++) {
    ticksArr.push(minRounded + i * step);
  }

  return { ticks: ticksArr, step, min: minRounded, max: maxRounded };
}

/**
 * roundNiceStep(step) — rotunjește pasul la 1/2/5 × 10^n.
 */
function roundNiceStep(step) {
  if (step <= 0 || !Number.isFinite(step)) return 1;

  const exp = Math.floor(Math.log10(step));
  const norm = step / Math.pow(10, exp); // între 1 și 10
  let multiplier = 1;
  if (norm < 2) multiplier = 1;
  else if (norm < 5) multiplier = 2;
  else multiplier = 5;

  return multiplier * Math.pow(10, exp);
}

/**
 * getNiceStep(val, ticks) — pas recomandat pentru o valoare dată.
 */
function getNiceStep(val, ticks) {
  val = Math.abs(val) || 1;
  const span = val * (2 / (ticks - 1));
  return roundNiceStep(span);
}

/**
 * downsample(points, target) — reducere la ≤ target puncte, păstrând primul/ultimul și vârfurile.
 * points = [{ t: Date|number, v: number }, ...]; t poate fi epoch_ms sau epoch_sec.
 * Returnează array cu ≤ target puncte.
 *
 * Algoritm:
 * - normalizează timestamp-urile la ms
 * - împarte în găleți egale (target puncte)
 * - pentru fiecare găleată: păstrează primul, ultimul, min, max
 * - pentru vârfuri: păstrează punctele cu variație semnificativă (> 10% din intervalul seriei)
 */
export function downsample(points, target = 150) {
  if (!Array.isArray(points) || points.length === 0) return [];
  if (target <= 0) target = 150;

  // Normalizează timestamp la ms (epoch_sec → înmulțește cu 1000)
  const normalized = points.map((p, i) => {
    const t = typeof p.t === 'number' ? p.t : p.t ? Date.parse(p.t) : i;
    const isSec = t < 1e12; // epoch_sec < 1e12, epoch_ms ≥ 1e12
    return {
      t: isSec ? t * 1000 : t,
      v: typeof p.v === 'number' && !isNaN(p.v) ? p.v : null,
      orig: p
    };
  });

  // elimină punctele fără valoare (null/NaN)
  const valid = normalized.filter(p => p.v !== null && !isNaN(p.v));
  if (valid.length === 0) return [];

  // dacă numărul de puncte e ≤ target, return direct
  if (valid.length <= target) {
    return valid.map(p => ({ t: p.t, v: p.v, orig: p.orig }));
  }

  // Împarte în găleți egale
  const bucketSize = Math.ceil(valid.length / target);
  const buckets = [];
  for (let i = 0; i < valid.length; i += bucketSize) {
    const slice = valid.slice(i, i + bucketSize);
    buckets.push(slice);
  }

  // Pentru fiecare găleată: păstrează primul, ultimul, min, max
  const result = [];
  for (const bucket of buckets) {
    const vs = bucket.map(p => p.v);
    const minV = Math.min(...vs);
    const maxV = Math.max(...vs);
    const minP = bucket.find(p => p.v === minV);
    const maxP = bucket.find(p => p.v === maxV);

    // Adaugă puncte distincte (evită duplicate dacă minP/maxP sunt primul/ultimul)
    const add = (p) => {
      if (!result.some(r => r.t === p.t)) result.push(p);
    };
    add(bucket[0]);
    add(bucket[bucket.length - 1]);
    if (minP) add(minP);
    if (maxP && maxP !== minP) add(maxP);
  }

  // Dacă rămânem cu mai puține decât target, putem adăuga și puncte cu variație > 10%
  const rangeV = Math.max(...result.map(p => p.v)) - Math.min(...result.map(p => p.v));
  const threshold = rangeV * 0.1;

  // Sortează după t și calculează diferențele
  result.sort((a, b) => a.t - b.t);
  const extended = [result[0]];
  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1];
    const curr = result[i];
    const diff = Math.abs(curr.v - prev.v);
    // păstrează întotdeauna primul/ultimul
    if (i === result.length - 1 || diff >= threshold) {
      extended.push(curr);
    }
  }

  // dacă e prea mult, reducă (menține primul/ultimul)
  if (extended.length > target) {
    const keepEvery = Math.ceil(extended.length / target);
    const reduced = [];
    for (let i = 0; i < extended.length; i += keepEvery) {
      reduced.push(extended[i]);
    }
    // asigură ultimul punct
    if (reduced[reduced.length - 1] !== extended[extended.length - 1]) {
      reduced.push(extended[extended.length - 1]);
    }
    return reduced.map(p => ({ t: p.t, v: p.v, orig: p.orig }));
  }

  return extended.map(p => ({ t: p.t, v: p.v, orig: p.orig }));
}

/**
 * parseMinimalResponse(data, entityIds) — parsare răspuns minimal_response de la HA.
 * data = { [entity_id]: [{ s: state, lu: epoch_sec }, ...] }
 * entityIds = array de entity_id (sau single string)
 *
 * Returnează { [entity_id]: [{ t: ms, v: number|null }, ...] }.
 * Ignoră unavailable/unknown/non-numeric (valoare = null).
 */
/** Stări „pornit / oprit” desenabile ca 1 / 0 (ventile, întrerupătoare, senzori binari). Altceva → undefined. */
const DISCRETE = { on: 1, off: 0, open: 1, closed: 0, true: 1, false: 0, home: 1, not_home: 0, detected: 1, clear: 0 };
export function discreteValue(s) {
  const k = typeof s === 'string' ? s.trim().toLowerCase() : s === true ? 'true' : s === false ? 'false' : '';
  return Object.prototype.hasOwnProperty.call(DISCRETE, k) ? DISCRETE[k] : undefined;
}

export function parseMinimalResponse(data, entityIds) {
  if (!data || typeof data !== 'object') return {};

  const ids = Array.isArray(entityIds) ? entityIds : [entityIds];
  const result = {};

  for (const entityId of ids) {
    const raw = data[entityId];
    if (!Array.isArray(raw)) continue;

    const points = [];
    for (const item of raw) {
      const s = item.s;
      const dv = discreteValue(s);
      // Parsează starea (sau null pentru unavailable/unknown)
      let v = null;
      if (s === null || s === undefined || s === 'unavailable' || s === 'unknown') {
        v = null;
      } else if (typeof s === 'number') {
        v = s;
      } else if (typeof s === 'string') {
        // handle kW → ×1000
        const trimmed = s.trim();
        let num = Number(trimmed);
        if (!isNaN(num)) {
          // dacă unitatea e implicit kW (ex: `1.2` fără suffix → assume kW)
          // pentru acum, luăm ca atare; extensie posibilă: suffix k/M/G
          if (trimmed.endsWith('k') || trimmed.endsWith('K')) {
            num *= 1000;
          } else if (trimmed.endsWith('M') || trimmed.endsWith('m')) {
            num *= 1000000;
          }
          v = num;
        } else if (dv !== undefined) { v = dv; points.binary = true; }   // pornit / oprit → 1 / 0
      }
      // epoch_sec (lu) → ms (×1000)
      const t = typeof item.lu === 'number' ? item.lu * 1000 : item.lu;

      points.push({ t, v });
    }

    result[entityId] = points;
  }

  return result;
}

/**
 * Punctele unei serii din istoricul unei entități, când seria nu e simpla stare numerică:
 * - `attribute`: valoarea numerică a unui atribut (ex. climate → current_temperature, temperature); atributele lipsă la un rând rămân cele de dinainte;
 * - `state_is`: 1 când starea e una din listă, altfel 0 (ex. climate: `cool` / `heat`) — seria devine pornit / oprit.
 * `rows` = lista de stări a entității din răspunsul HA (cu atribute pentru `attribute`: minimal_response false).
 */
export function parseSeriesRows(rows, spec) {
  const pts = [];
  if (!Array.isArray(rows) || !spec) return pts;
  const list = Array.isArray(spec.state_is) ? spec.state_is.map(String) : [];
  const attr = typeof spec.attribute === 'string' ? spec.attribute : '';
  let attrs = {};
  for (const item of rows) {
    if (!item || typeof item !== 'object') continue;
    if (item.a && typeof item.a === 'object') attrs = item.a;
    const t = typeof item.lu === 'number' ? item.lu * 1000 : item.lu;
    const s = item.s;
    const gone = s === null || s === undefined || s === 'unavailable' || s === 'unknown';
    let v = null;
    if (list.length) { v = gone ? null : (list.includes(String(s)) ? 1 : 0); pts.binary = true; }
    else if (attr && !gone) { const x = attrs[attr]; const n = typeof x === 'number' ? x : typeof x === 'string' && x.trim() !== '' ? Number(x) : NaN; v = Number.isFinite(n) ? n : null; }
    pts.push({ t, v });
  }
  return pts;
}

/**
 * formatLabel(value, unit) — formatează o valoare pentru etichetă (Y-axis sau tooltip).
 * - W/kW/MWh: virgulă zecimală (românesc), separator de mii (spațiu subțire)
 * - etichete pentru unități: „kW”, „MWh”, „°C”, etc.
 */
export function formatLabel(value, unit) {
  if (value === null || value === undefined || isNaN(value)) return '—';

  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  const formatted = formatNumber(value);

  if (!unit) return `${sign}${formatted}`;

  // unități cu transformări de scală
  const u = String(unit).toLowerCase();
  if (u.includes('w') && !u.includes('wh')) {
    // W → kW de la 1000
    if (abs >= 1000) {
      return `${sign}${formatNumber(value / 1000)} kW`;
    }
    return `${sign}${formatted} W`;
  } else if (u.includes('wh')) {
    // kWh → MWh de la 1000
    if (abs >= 1000) {
      return `${sign}${formatNumber(value / 1000)} MWh`;
    }
    return `${sign}${formatted} kWh`;
  } else if (u.includes('c')) {
    return `${sign}${formatted} °C`;
  } else if (u.includes('lux')) {
    return `${sign}${formatted} lx`;
  } else if (u.includes('m2')) {
    return `${sign}${formatted} W/m²`;
  } else if (u.includes('%')) {
    return `${sign}${formatted} %`;
  } else {
    // generic: value unit
    return `${sign}${formatted} ${unit}`;
  }
}

/**
 * formatNumber(value) — formatează un număr românesc (virgulă zecimală, separator de mii).
 * - zecimale: |x|≥100 → 0, ≥10 → 1, altfel 2 (fără zerouri finale)
 * - |x| ≥ 1e15 sau nefinit → '—'
 * - separator de mii cu spațiu subțire (0x202F)
 */
export function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e15 || !Number.isFinite(value)) return '—';
  if (value === -0) return '0';
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const s = value.toFixed(decimals);
  // separator de mii cu spațiu subțire
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thouSep());
  const sep = decSep();
  const formatted = parts.join(sep);
  // elimină zerouri finale (dar nu toate dacă e 0)
  // regex: elimină .0, ,0, .,0, ,,0 la final
  const result = formatted.replace(/(\.,?|,)0+$/, '').replace(/[.,]$/, '');
  // după rotunjire, dacă rezultatul e 0 → '0' (fără minus)
  if (result === '0' || result === '-0' || result === '0' + sep + '0' || result === '-0' + sep + '0') return '0';
  return result;
}

/**
 * formatTimeLabel(t) — formatează un timestamp (ms) ca etichetă pe X-axis (ore sau zile).
 * - pentru intervale de 24h: afișează „HH:MM”
 * - pentru 7zile: afișează „ZZ HH:MM”
 * - pentru 30d: afișează „ZZ”
 * - ignoră fusul orar (folosește new Date() local)
 */
export function formatTimeLabel(t, range = '24h') {
  const d = new Date(t);

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (range === '24h') {
    return `${hours}:${minutes}`;
  } else if (range === '7d') {
    const dayName = weekdayShort(d);
    return `${dayName} ${hours}:${minutes}`;
  } else if (range === '30d') {
    return String(d.getDate());
  } else if (typeof range === 'object' && range.hours) {
    if (range.hours <= 24) {
      return `${hours}:${minutes}`;
    } else if (range.hours <= 24 * 7) {
      const dayName = weekdayShort(d);
      return `${dayName} ${hours}:${minutes}`;
    } else {
      return String(d.getDate());
    }
  }
  return `${hours}:${minutes}`;
}

/**
 * formatRangeLabel(start, end, range) — formatează intervalul curent ca label (ex: „Azi”, „Ultima săptămână”).
 */
export function formatRangeLabel(start, end, range) {
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);

  if (range === '24h' || (typeof range === 'object' && range.hours === 24)) {
    const today = new Date();
    return t('Azi, {d}', { d: formatDate(today) });
  } else if (range === '7d' || diffDays >= 6.5 && diffDays <= 7.5) {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return t('Ultima săptămână');
  } else if (range === '30d' || diffDays >= 29 && diffDays <= 31) {
    return t('Ultimul 30 de zile');
  } else if (typeof range === 'object' && range.hours) {
    if (range.hours === 24) return t('Ultimile 24 de ore');
    if (range.hours === 12) return t('Ultimile 12 ore');
    if (range.hours >= 7 * 24) return t('Ultima săptămână');
    if (range.hours >= 30 * 24) return t('Ultimul 30 de zile');
    return t('Ultimile {n} ore', { n: range.hours });
  }
  return t('Interval');
}

/**
 * formatDate(d) — formatează o dată ca „ZZ LL AAAA”.
 */
function formatDate(d) {
  const days = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa'];
  const months = Array.from({ length: 12 }, (_, i) => monthShort(i));
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Export pentru testare
export { roundNiceStep, getNiceStep, formatDate };
