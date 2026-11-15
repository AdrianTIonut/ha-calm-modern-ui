// tests/nav-device.test.mjs — meniul de jos pe dispozitiv: adresă diferită pe telefon / tabletă, butoane doar pe un dispozitiv, match ca listă
// Rulat cu: node tests/nav-device.test.mjs
import { setLang } from '../src/i18n.mjs'; setLang('ro');
import { normalizeNav, renderNav, navPath, holdTarget } from '../src/render.mjs';
import { deviceKind } from '../src/config.mjs';

let pass = 0, fail = 0;
const ok = (desc, cond, extra) => { if (cond) { pass++; console.log(`✔ ${desc}`); } else { fail++; console.log(`✖ ${desc}${extra ? ': ' + extra : ''}`); } };
const nav = (items) => normalizeNav({ items });
const labelsOf = (html) => [...html.matchAll(/<span>([^<]*)<\/span><\/button>/g)].map((m) => m[1]);
const onLabel = (html) => { const m = /data-state="on"[^>]*>.*?<span>([^<]*)<\/span><\/button>/.exec(html); return m ? m[1] : null; };

// ---- adresa pe dispozitiv ----
const home = { icon: 'home', label: 'Home', path_tablet: '/d/calm', path_phone: '/d/calm-telefon' };
let n = nav([home]);
ok('path_tablet / path_phone sunt acceptate', n.items.length === 1 && n.warnings.length === 0, JSON.stringify(n.warnings));
ok('adresa pe tabletă', navPath(n.items[0], 'tablet') === '/d/calm');
ok('adresa pe telefon', navPath(n.items[0], 'phone') === '/d/calm-telefon');
n = nav([{ icon: 'home', label: 'Home', path: { tablet: '/d/calm', phone: '/d/calm-telefon' } }]);
ok('path ca obiect { tablet, phone }', navPath(n.items[0], 'tablet') === '/d/calm' && navPath(n.items[0], 'phone') === '/d/calm-telefon');
n = nav([{ icon: 'home', label: 'Home', path: '/d/0', path_phone: '/d/tel' }]);
ok('path obișnuit = implicit, path_phone doar pe telefon', navPath(n.items[0], 'tablet') === '/d/0' && navPath(n.items[0], 'phone') === '/d/tel');
n = nav([{ icon: 'home', label: 'Home', path_phone: '/d/tel' }]);
ok('doar path_phone: și tableta primește o adresă (nu rămâne goală)', navPath(n.items[0], 'tablet') === '/d/tel');
n = nav([{ label: 'x', path_phone: 'fara-slash' }]);
ok('adresă fără / nu e validă', n.items.length === 0 && n.warnings.length === 1);

// ---- evidențiere după dispozitiv ----
n = nav([home, { icon: 'sun', label: 'Solar', path: '/d/solar' }]);
ok('pe telefon, pagina telefonului aprinde Home', onLabel(renderNav(n, '/d/calm-telefon', { device: 'phone' })) === 'Home');
ok('pe tabletă, pagina tabletei aprinde Home', onLabel(renderNav(n, '/d/calm', { device: 'tablet' })) === 'Home');
ok('/d/calm nu aprinde /d/calm-telefon', !renderNav(nav([{ icon: 'home', label: 'H', path_phone: '/d/calm-telefon' }]), '/d/calm', { device: 'phone' }).includes('data-state="on"'));

ok('Home se aprinde pe ambele pagini home, indiferent de dispozitiv', onLabel(renderNav(nav([home]), '/d/calm-telefon', { device: 'tablet' })) === 'Home' && onLabel(renderNav(nav([home]), '/d/calm', { device: 'phone' })) === 'Home');

// ---- butoane doar pe un dispozitiv ----
n = nav([{ icon: 'home', label: 'Home', path: '/d/0' }, { icon: 'audi', label: 'Audi', path: '/d/audi', device: 'tablet' }, { icon: 'tablet', label: 'Status', path: '/d/st', device: 'tablet' }, { icon: 'bell', label: 'Alerte', path: '/d/al', device: 'phone' }]);
ok('pe telefon: Home + Alerte', JSON.stringify(labelsOf(renderNav(n, '/x', { device: 'phone' }))) === '["Home","Alerte"]', JSON.stringify(labelsOf(renderNav(n, '/x', { device: 'phone' }))));
ok('pe tabletă: Home + Audi + Status', JSON.stringify(labelsOf(renderNav(n, '/x', { device: 'tablet' }))) === '["Home","Audi","Status"]');
ok('un buton ascuns nu se aprinde', onLabel(renderNav(n, '/d/audi', { device: 'phone' })) === null);
ok('device invalid e ignorat', nav([{ icon: 'home', label: 'H', path: '/a', device: 'tv' }]).items[0].device === '');

// ---- match ca listă ----
n = nav([{ icon: 'sun', label: 'Solar', path: '/d/solar-hala', match: ['/d/solar-hala', '/d/solar-apa'] }, { icon: 'home', label: 'Home', path: '/d/0' }]);
ok('match listă: a doua pagină aprinde butonul', onLabel(renderNav(n, '/d/solar-apa', { device: 'tablet' })) === 'Solar');
ok('match listă: prima pagină', onLabel(renderNav(n, '/d/solar-hala', { device: 'tablet' })) === 'Solar');
ok('match listă: altă pagină nu aprinde', onLabel(renderNav(n, '/d/altceva', { device: 'tablet' })) === null);
ok('match ca șir rămâne valabil', onLabel(renderNav(nav([{ icon: 'sun', label: 'S', path: '/a', match: '/b' }]), '/b/x', { device: 'tablet' })) === 'S');

// ---- back și compatibilitate ----
ok('back: true rămâne valid fără adresă', nav([{ back: true, label: 'Înapoi' }]).items.length === 1);
ok('fără device în opts = tabletă', labelsOf(renderNav(nav([{ icon: 'home', label: 'A', path: '/a', device: 'tablet' }]), '/x')).length === 1);

// ---- apăsare lungă ----
n = nav([{ icon: 'home', label: 'Home', path_tablet: '/d/calm', path_phone: '/d/tel', hold_path_phone: '/d/calm', hold_path_tablet: '/d/tel' }]);
ok('apăsare lungă pe telefon → pagina tabletei', holdTarget(n.items[0], 'phone') === '/d/calm');
ok('apăsare lungă pe tabletă → pagina telefonului', holdTarget(n.items[0], 'tablet') === '/d/tel');
n = nav([{ icon: 'home', label: 'Home', path: '/d/0', hold_path: '/d/alt' }]);
ok('hold_path valabil pe orice dispozitiv', holdTarget(n.items[0], 'phone') === '/d/alt' && holdTarget(n.items[0], 'tablet') === '/d/alt');
n = nav([{ icon: 'home', label: 'Home', path: '/d/0', hold_path: '/d/alt', hold_path_phone: '/d/p' }]);
ok('hold_path_phone are prioritate pe telefon', holdTarget(n.items[0], 'phone') === '/d/p' && holdTarget(n.items[0], 'tablet') === '/d/alt');
ok('fără hold → gol', holdTarget(nav([{ icon: 'home', label: 'H', path: '/a' }]).items[0], 'phone') === '');
ok('hold fără / e ignorat', holdTarget(nav([{ icon: 'home', label: 'H', path: '/a', hold_path: 'x' }]).items[0], 'phone') === '');

// ---- deviceKind ----
ok('override telefon', deviceKind('phone') === 'phone');
ok('override tabletă', deviceKind('tablet') === 'tablet');
ok('fără ecran (Node) = tabletă', deviceKind() === 'tablet');

console.log(`\n${pass} / ${pass + fail} teste OK`);
process.exit(fail > 0 ? 1 : 0);
