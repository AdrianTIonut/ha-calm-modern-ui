// docs/demo/make-yaml.mjs — writes examples/dashboard-calm.yaml from the example dashboard (docs/demo/dashboard.js, invented entities).
// Usage: node docs/demo/make-yaml.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import vm from 'node:vm';

const here = dirname(fileURLToPath(import.meta.url));
const sandbox = { console, Date, location: { pathname: '/' } }; sandbox.window = sandbox;
// the dashboard file only needs the states object and the A() helper of the demo
sandbox.CCU_DEMO = { states: {}, A: (state, attributes) => ({ state: String(state), attributes: attributes || {} }) };
vm.runInNewContext(readFileSync(join(here, 'dashboard.js'), 'utf8'), sandbox);
const dash = sandbox.CCU_DASHBOARD;

const RESERVED = /^(true|false|yes|no|on|off|null|~|y|n)$/i;   // YAML 1.1 (Home Assistant) turns these into booleans / null
function scalar(v) {
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (v === null || v === undefined) return 'null';
  const s = String(v);
  if (s === '' || RESERVED.test(s) || /^[-?:,[\]{}#&*!|>'"%@`]/.test(s) || /: |:$| #|^\s|\s$/.test(s) || /^[\d:.+-]+$/.test(s) || s.includes('\n')) return JSON.stringify(s);
  return s;
}
const isObj = (x) => x && typeof x === 'object' && !Array.isArray(x);
function lines(v, ind) {
  const pad = ' '.repeat(ind), out = [];
  if (Array.isArray(v)) {
    for (const it of v) {
      if (isObj(it) || Array.isArray(it)) { const sub = lines(it, ind + 2); sub[0] = pad + '- ' + sub[0].slice(ind + 2); out.push(...sub); } else out.push(pad + '- ' + scalar(it));
    }
  } else {
    for (const [k, val] of Object.entries(v)) {
      if (val === undefined) continue;
      if (Array.isArray(val) && val.length === 0) out.push(`${pad}${k}: []`);
      else if (isObj(val) && Object.keys(val).length === 0) out.push(`${pad}${k}: {}`);
      else if (isObj(val) || Array.isArray(val)) { out.push(`${pad}${k}:`); out.push(...lines(val, ind + 2)); }
      else out.push(`${pad}${k}: ${scalar(val)}`);
    }
  }
  return out;
}

const header = `# Calm Modern UI — example dashboard: a tablet view and a phone view with the same bottom bar.
# Every entity id and name here is INVENTED. Replace them with yours (Developer tools → States lists the real ones).
#
# How to use it:
#   1. Install ccu.js and add it as a dashboard resource (see the README).
#   2. Create a dashboard (Settings → Dashboards → Add dashboard), open it, ⋮ → Edit → ⋮ → Raw configuration editor.
#   3. Paste this file. The pages in the bottom bar (energy, solar, lights, cams, car, shed, pool, status, …) are just paths:
#      create the views you want, or point the buttons at views you already have (edit the \`path\` of each button).
#
# The bottom bar is the same card on every page:
#   • Home goes to the tablet page on a tablet and to the phone page on a phone; a long press jumps to the other one.
#   • A phone shows 5 buttons, a tablet shows all 9 (\`device: tablet\` on the others).
#   • The button of the page you are on lights up.
`;
const yaml = header + 'title: ' + scalar(dash.title) + '\n' + lines({ views: dash.views }, 0).join('\n') + '\n';
const out = join(here, '..', '..', 'examples', 'dashboard-calm.yaml');
writeFileSync(out, yaml);
console.log('✔ examples/dashboard-calm.yaml', yaml.split('\n').length + ' lines');
