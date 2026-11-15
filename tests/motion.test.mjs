// tests/motion.test.mjs — mișcarea cardurilor: resolveMotion (auto / full / calm / off, telefon vs. tabletă, efecte vreme, flux)
// Rulat cu: node tests/motion.test.mjs
import { resolveMotion, normalizeMotion, normalizeSwitch } from '../src/config.mjs';

let pass = 0, fail = 0;
const eq = (desc, got, want) => {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a === b) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}: ${a} ≠ ${b}`); }
};
const all = (v) => ({ anim: v, fx: v, flow: v });

// implicit: tabletă/PC → complet, telefon → calm
eq('implicit pe tabletă = full', resolveMotion({}, false), all('full'));
eq('implicit pe telefon = calm', resolveMotion({}, true), all('calm'));
eq('fără config = full pe tabletă', resolveMotion(undefined, false), all('full'));
eq('auto explicit pe telefon = calm', resolveMotion({ motion: 'auto' }, true), all('calm'));

// utilizatorul poate cere complet și pe telefon (sau calm/oprit pe tabletă)
eq('full pe telefon', resolveMotion({ motion: 'full' }, true), all('full'));
eq('calm pe tabletă', resolveMotion({ motion: 'calm' }, false), all('calm'));
eq('off pe tabletă', resolveMotion({ motion: 'off' }, false), all('off'));

// `animations: false` (opțiunea veche) oprește tot, oricare ar fi restul
eq('animations:false = off peste tot', resolveMotion({ animations: false, motion: 'full', weather_effects: 'on' }, false), all('off'));
eq('animations:"off" = off peste tot', resolveMotion({ animations: 'off' }, true), all('off'));
eq('animations:true nu schimbă nimic', resolveMotion({ animations: true }, false), all('full'));

// efectele de vreme și fluxul pot fi decise separat
eq('weather_effects off, restul calm', resolveMotion({ motion: 'calm', weather_effects: 'off' }, false), { anim: 'calm', fx: 'off', flow: 'calm' });
eq('weather_effects on pe telefon', resolveMotion({ weather_effects: 'on' }, true), { anim: 'calm', fx: 'full', flow: 'calm' });
eq('flow_animation off pe tabletă', resolveMotion({ flow_animation: 'off' }, false), { anim: 'full', fx: 'full', flow: 'off' });
eq('flow_animation true = on', resolveMotion({ motion: 'off', flow_animation: true }, false), { anim: 'off', fx: 'off', flow: 'full' });

// valori greșite → auto, fără erori
eq('motion necunoscut → auto', normalizeMotion('turbo'), 'auto');
eq('motion lipsă → auto', normalizeMotion(undefined), 'auto');
eq('motion majuscule', normalizeMotion('CALM'), 'calm');
eq('switch necunoscut → auto', normalizeSwitch('maybe'), 'auto');
eq('switch on/off', [normalizeSwitch('on'), normalizeSwitch('OFF'), normalizeSwitch(false), normalizeSwitch(true)], ['on', 'off', 'off', 'on']);
eq('config nevalid (șir) nu aruncă', resolveMotion('x', false), all('full'));

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
