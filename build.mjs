// build.mjs — lipește src/*.mjs într-un singur ccu.js. Rulare: node build.mjs
// Fiecare modul rămâne într-o funcție proprie (nume identice în module diferite, ex. formatNumber, nu se ciocnesc).
// Fără dependențe: import { a, b as c } from './x.mjs' → const { a, b: c } = __m['x']; export … → colectat în obiectul de export.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
// ordinea contează: un modul vine după cele de care depinde
const ORDER = ['theme.js', 'i18n.mjs', 'config.mjs', 'state.mjs', 'actions.mjs', 'gestures.mjs', 'icons.mjs', 'presets.mjs', 'render.mjs',
  'graph-data.mjs', 'graph-card.mjs', 'energy.mjs', 'weather.mjs', 'controls.mjs', 'radio.mjs', 'vehicles.mjs', 'editor.mjs', 'cards.mjs'];
const OPTIONAL = new Set();

const key = (f) => f.replace(/\.(m?js)$/, '');

function transform(file, src) {
  const exported = [];
  const addNames = (list) => list.split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => exported.push(s.split(/\s+as\s+/).pop().trim() === s ? s : s));
  let out = src;
  // import { a, b as c } from './x.mjs';
  out = out.replace(/^\s*import\s*\{([^}]*)\}\s*from\s*['"]\.\/([^'"]+)['"];?\s*$/gm, (_, names, from) => {
    const k = key(from);
    const dest = names.split(',').map((s) => s.trim()).filter(Boolean).map((s) => { const [a, b] = s.split(/\s+as\s+/); return b ? `${a.trim()}: ${b.trim()}` : a.trim(); }).join(', ');
    return `const { ${dest} } = __m[${JSON.stringify(k)}];`;
  });
  if (/^\s*import\s/m.test(out)) throw new Error(`${file}: import neacceptat de bundler (doar { … } from './…')`);
  // export { a, b };  (poate avea „as”: nu e folosit în proiect)
  out = out.replace(/^\s*export\s*\{([^}]*)\};?\s*$/gm, (_, names) => { addNames(names); return ''; });
  // export function/class/const/let NAME
  out = out.replace(/^export\s+(async\s+function|function|class|const|let|var)\s+([A-Za-z_$][\w$]*)/gm, (_, kind, name) => { exported.push(name); return `${kind} ${name}`; });
  if (/^\s*export\s/m.test(out)) throw new Error(`${file}: export neacceptat de bundler`);
  const uniq = [...new Set(exported)];
  return `__m[${JSON.stringify(key(file))}] = (() => {\n${out}\nreturn { ${uniq.join(', ')} };\n})();\n`;
}

export function bundle() {
  const parts = [], used = [];
  for (const f of ORDER) {
    const p = join(root, 'src', f);
    if (!existsSync(p)) { if (OPTIONAL.has(f)) continue; throw new Error('Lipsește src/' + f); }
    parts.push(transform(f, readFileSync(p, 'utf8'))); used.push(f);
  }
  const code = `/* Calm Modern UI (ccu) — generat de build.mjs din src/: ${used.join(', ')} */\n(() => {\n'use strict';\nconst __m = {};\n${parts.join('\n')}})();\n`;
  return { code, used };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1].replace(/\\/g, '/').replace(/^\/([A-Za-z]):/, '$1:') || process.argv[1]?.endsWith('build.mjs')) {
  const { code, used } = bundle();
  writeFileSync(join(root, 'ccu.js'), code);
  console.log(`ccu.js: ${code.length} caractere din ${used.length} module (${used.join(', ')})`);
}
