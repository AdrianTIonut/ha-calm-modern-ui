// tests/radio.test.mjs — cardul ccu-radio-card: config, model (post curent, redare, volum, boxă indisponibilă) și șablon. Rulare: node tests/radio.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeRadio, radioModel, renderRadio, stationUrl } from '../src/radio.mjs';

let pass = 0, fail = 0;
const T = (n, f) => { try { const r = f(); if (r === true) { pass++; console.log('✔ ' + n); } else { fail++; console.log('✖ ' + n + ': ' + JSON.stringify(r)); } } catch (e) { fail++; console.log('✖ ' + n + ': ' + e.message); } };
const st = (state, attributes = {}) => ({ state, attributes });
const OPTS = ['Radio Extravaganza - https://s3.radio.co/x/listen', 'Personalizat (foloseste URL-ul de mai jos)', 'Kiss FM', 'Europa FM'];
const cfg = { stations: 'input_select.radio', playing: 'input_boolean.playing', player: 'media_player.boxa', play: 'script.play', stop: 'script.stop', hide: ['personalizat'] };
const H = (over = {}) => ({ states: { 'input_select.radio': st('Kiss FM', { options: OPTS }), 'input_boolean.playing': st('on'), 'media_player.boxa': st('playing', { volume_level: 0.35, supported_features: 4 | 16384 }), ...over } });
const N = () => normalizeRadio(cfg);

T('normalizeRadio: păstrează entitățile și acțiunile', () => { const n = N(); return n.stations === 'input_select.radio' && n.player === 'media_player.boxa' && n.play === 'script.play' && n.warnings.length === 0 || n; });
T('normalizeRadio: fără „stations” → avertisment; domeniu greșit → avertisment', () => normalizeRadio({}).warnings.length === 1 && normalizeRadio({ stations: 'sensor.x' }).warnings.length >= 1 && normalizeRadio({ stations: 'select.a', player: 'light.x' }).player === '');
T('model: postul curent, fără URL-ul din numele opțiunii, fără posturile ascunse', () => { const m = radioModel(N(), H()); return m.stations.map((s) => s.label).join('|') === 'Radio Extravaganza|Kiss FM|Europa FM' && m.name === 'Kiss FM' && m.idx === 1 || m; });
T('model: ac pe poziția postului (centrat pe segment)', () => { const m = radioModel(N(), H()); return Math.abs(m.needle - 50) < 0.1 && Math.abs(m.stations[0].x - 16.7) < 0.1 || m.needle; });
T('model: redare din „playing”; fără el, din starea playerului', () => { const a = radioModel(N(), H()).playing; const b = radioModel({ ...N(), playing: '' }, H()).playing; const c = radioModel({ ...N(), playing: '' }, H({ 'media_player.boxa': st('idle') })).playing; return a === true && b === true && c === false || [a, b, c]; });
T('model: valoarea optimistă are prioritate (atingere recentă)', () => { const m = radioModel(N(), H(), { play: false, station: 'Europa FM' }); return m.playing === false && m.name === 'Europa FM' && m.idx === 2 || m; });
T('model: volumul apare doar dacă boxa îl suportă și răspunde', () => radioModel(N(), H()).vol === 35 && radioModel(N(), H({ 'media_player.boxa': st('unavailable') })).vol === null && radioModel(N(), H({ 'media_player.boxa': st('playing', { volume_level: 0.5, supported_features: 0 }) })).vol === null);
T('model: boxă indisponibilă → playerGone; select lipsă → gone, fără erori', () => radioModel(N(), H({ 'media_player.boxa': st('unavailable') })).playerGone === true && radioModel(N(), { states: {} }).gone === true && radioModel(N(), null).stations.length === 0);
T('render: structură (ecran, scală, ac, butoane, volum)', () => { const h = renderRadio(N(), H()); return ['ccu-radio', 'rd-lcd', 'rd-eq', 'rd-dial', 'rd-needle', 'data-act="power"', 'data-act="prev"', 'data-act="next"', 'data-act="vol"'].every((x) => h.includes(x)) && (h.match(/data-act="station"/g) || []).length === 3 || h.slice(0, 300); });
T('render: stare redare / oprit / indisponibil', () => renderRadio(N(), H()).includes('data-state="play"') && renderRadio(N(), H({ 'input_boolean.playing': st('off') })).includes('data-state="stop"') && renderRadio(N(), { states: {} }).includes('data-state="na"'));
T('render: echalizatorul rulează doar la redare', () => renderRadio(N(), H()).includes('data-run="1"') && renderRadio(N(), H({ 'input_boolean.playing': st('off') })).includes('data-run="0"'));
T('render: boxă indisponibilă are mesaj; fără NaN / undefined', () => { const h = renderRadio(N(), H({ 'media_player.boxa': st('unavailable') })); return h.includes('Playerul nu răspunde') && !/NaN|undefined/.test(h) || h; });
T('render: nume periculos scăpat', () => { const h = renderRadio(N(), H({ 'input_select.radio': st('<img src=x onerror=1>', { options: ['<img src=x onerror=1>', 'B'] }) })); return !h.includes('<img') && h.includes('&lt;img') || h; });
T('render: un singur post → butoanele anterior / următor sunt dezactivate', () => { const h = renderRadio(N(), H({ 'input_select.radio': st('A', { options: ['A'] }) })); return (h.match(/disabled/g) || []).length === 2 || h; });
T('stationUrl: adresa din „Nume - https://…”; fără adresă → șir gol', () => stationUrl('Radio X - https://s3.radio.co/x/listen') === 'https://s3.radio.co/x/listen' && stationUrl('Kiss FM') === '' && stationUrl('Personalizat (foloseste URL-ul de mai jos)') === '' && stationUrl('A - javascript:alert(1)') === '');
const SP = { ...cfg, speakers: ['media_player.boxa', 'media_player.living'] };
const H2 = () => H({ 'media_player.living': st('idle', { friendly_name: 'Living', volume_level: 0.8, supported_features: 4 }) });
T('boxe: două boxe → butoane de alegere; boxa principală e activă implicit', () => { const m = radioModel(normalizeRadio(SP), H2()); const h = renderRadio(normalizeRadio(SP), H2()); return m.speakers.length === 2 && m.speaker === 'media_player.boxa' && m.speakers[0].active && h.includes('data-act="speaker"') && (h.match(/class="sp/g) || []).length === 2 || m; });
T('boxe: alegerea unei alte boxe schimbă volumul și starea de redare', () => { const m = radioModel(normalizeRadio(SP), H2(), { speaker: 'media_player.living' }); return m.speaker === 'media_player.living' && m.vol === 80 && m.playing === false || m; });
T('boxe: o singură boxă → fără butoane de alegere', () => !renderRadio(N(), H()).includes('data-act="speaker"'));
T('boxe: ce cântă acum (titlu / artist) apare în ecran', () => { const h = renderRadio(N(), H({ 'media_player.boxa': st('playing', { volume_level: 0.3, supported_features: 4, media_title: 'Song', media_artist: 'Band' }) })); return h.includes('Band — Song') || h; });
setLang('en');
T('render: texte în engleză', () => { const h = renderRadio(N(), H()); return h.includes('>Playing<') && h.includes('Next station') && !/Redă|Oprit/.test(h) || h; });
setLang('ro');

console.log(`\n${pass}/${pass + fail}`);
if (fail) process.exit(1);
