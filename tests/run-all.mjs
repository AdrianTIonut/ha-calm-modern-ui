// tests/run-all.mjs — rulează toate testele și ieși cu cod ≠ 0 dacă vreunul pică. Rulare: node tests/run-all.mjs
import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
const files = readdirSync(dir).filter((f) => f.endsWith('.test.mjs')).sort();
let bad = 0;
for (const f of files) {
  const r = spawnSync(process.execPath, [join(dir, f)], { encoding: 'utf8', timeout: 120000 });
  const out = (r.stdout || '') + (r.stderr || '');
  const m = /(\d+)\s*\/\s*(\d+)\s*(?:teste OK|rulate cu succes)/.exec(out);
  const summary = m ? `${m[1]}/${m[2]}` : '?';
  const ok = r.status === 0;
  if (!ok) bad++;
  console.log(`${ok ? '✔' : '✖'} ${f.padEnd(26)} ${summary}${ok ? '' : '  (cod ' + r.status + ')'}`);
}
console.log(bad ? `\n${bad} fișier(e) cu teste picate` : `\nToate cele ${files.length} fișiere de teste trec`);
process.exit(bad ? 1 : 0);
