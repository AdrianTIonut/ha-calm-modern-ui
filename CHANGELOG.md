# Istoric versiuni

## 0.9.6
- **Înregistrare în HACS / Marketplace.** Pregătim cererea de includere în lista oficială HACS: am adăugat validarea HACS Action în repo și un release nou, ca să treacă verificările. **Cod neschimbat, nu trebuie să faci nimic**; dacă actualizezi, nu vei observa nicio diferență.
- *English:* **Registering with HACS / Marketplace.** We are submitting the repository for the official HACS list: the HACS Action validation is now part of the repo, and this release follows it, as the review requires. **No code changes. You do not need to do anything**; if you update, you will see no difference.

## 0.9.5
- **Chips: ordine după activare.** `sort: true` (bifa *Ordonează după momentul activării* din editor) pune chips-urile în ordinea în care s-au activat (`last_changed`), cel mai vechi primul; cele care nu mai încap trec pe rândul următor. Cuprinde și gunoiul, bateriile slabe.
- **Chips inactive în editor.** În editorul cardului și în modul de editare al dashboardului, chips-urile ascunse (`hide_off`, `show_if`) se văd estompate, cu chenar punctat. Pe dashboard rămân ascunse.
- *English:* **Chips: sort by activation.** `sort: true` (checkbox *Sort by activation time* in the editor) orders chips by the moment they became active, oldest first; the ones that do not fit continue on the next row. Includes waste and low batteries. **Inactive chips in the editor:** while editing, hidden chips (`hide_off`, `show_if`) are shown faded with a dashed border; on the dashboard they stay hidden.

## 0.9.4
- **„Plin în” mai stabil:** se calculează implicit după **media puterii pe ultimele 10 minute** (din istoricul HA, citit cel mult o dată pe minut), nu după valoarea de acum, ca cifra să nu sară când trece un nor; `charge_eta: now` păstrează calculul pe valoarea de acum. Cât se încarcă, autonomia se ascunde (`runtime_while_charging: true` o arată), iar peste 99 % „plin în” dispare. În antet, cu bifa, apar două linii sub procent. Cardul de baterie se redesenează acum și la schimbarea senzorilor din `load_entities`.
- **Antet:** sub o valoare (procentul bateriei) poate apărea autonomia, `runtime_*` pe valoare (sau `runtime: { load, … }`), cu aceleași reguli ca la cardul de baterie; cât timp se încarcă arată „plin în …”. Rămâne vizibilă și pe telefon.
- **Flux de energie:** `solar_today` și `radiation` pun sub titlu un rând mic, cu iconiță de soare: energia produsă azi și radiația solară (câmpuri noi și în editor).
- **Grafic „cronologie”** (`timeline: true`): un rând pe serie, cu bare când e pornit, până la 8 rânduri într-un card mic (ventile de încălzire, întrerupătoare, uși); durata scrisă pe fiecare bară și totalul pe rând, perioadele „indisponibil” hașurate în galben, ore rotunde pe axă, interval și durată la atingere; `hide_durations: true` (bifă în editor) le ascunde.
- **Grafic:** seriile pornit / oprit (ventile, întrerupătoare, senzori binari) se desenează acum ca trepte, cu „Oprit / Pornit” pe axă (înainte nu apărea nimic); intervalul acceptă orice „48h”, „3d” (1 h – 90 de zile); mesajul „Interval necunoscut” nu mai are ghilimele duble.
- **Editor:** funcțiile opționale au bifă (energia produsă azi, radiația solară, autonomia din antet, „Plin în”, consum din mai multe circuite, adresă diferită pe tabletă / telefon): debifate, dispar din config, ca să nu fie nevoie de o stație meteo sau de un senzor pe care nu-l ai. Textul de lângă valorile din flux se ascunde cu `sun_labels: false`.
- **Documentație:** tabelul cu carduri din README (în ambele limbi) le listează acum pe toate 15, cu descrieri la zi; cardul de flux are o imagine animată (`flow-animated.png`), cu punctele care curg pe panglici.
- **Documentație:** imaginea animată a iconițelor (`animated-icons.png`) arată acum **toate** iconițele animate: cele 8 de aparate (cât sunt pornite) și cele 12 de vreme (mereu).
- **Dashboard exemplu** (`examples/dashboard-calm.yaml`): o pagină de tabletă și una de telefon, cu aceeași bară de jos, cu entități inventate; capturile din README vin din el (`docs/demo/dashboard.html`).
- **Meniu: apăsare lungă** (`hold_path`, `hold_path_tablet`, `hold_path_phone`): de exemplu Home de pe telefon sare la Home-ul tabletei și invers.
- **Meniu de jos pe dispozitiv:** un buton poate duce în alt loc pe tabletă și pe telefon (`path_tablet` / `path_phone`, sau `path: { tablet, phone }`), se poate arăta doar pe unul dintre ele (`device: tablet | phone`) și se aprinde pe un grup de pagini (`match` acceptă acum o listă). Telefon = latura mică a ecranului sub 600 px; `device:` pe card forțează alegerea. Editorul are câmpurile noi și acceptă până la 12 butoane.

## 0.9.3
- **Baterie:** autonomia se calculează la suma consumului din `load` și din noua listă `load_entities` (pentru bateria care alimentează mai multe circuite; se alege și din editor). Dacă un senzor nu are valoare, nu se mai afișează o autonomie prea optimistă.
- **Baterie, cât timp se încarcă:** cu senzorul `power` (+ = descărcare, − = încărcare; `power_invert` îl întoarce) cardul arată „Plin în” (timpul până la 100 % la puterea de încărcare de acum), iar autonomia are eticheta „la consum”, ca să nu fie luată drept timp de descărcare.

## 0.9.2
- **Mișcare și baterie:** opțiunea `motion` pe fiecare card (`auto` | `full` | `calm` | `off`, și în editorul vizual). Implicit `auto`: pe tabletă și PC animațiile merg continuu, pe telefon (latura mică a ecranului sub 600 px) sunt `calm` — câteva secunde la fiecare schimbare de stare, apoi static. `weather_effects` și `flow_animation` (`auto` | `on` | `off`) controlează separat efectele din vreme și punctele din flux. `animations: false` și „reduce motion” funcționează ca înainte.
- **Reparat:** chip-ul de termene mașini avea un pătrat negru în loc de iconița calendarului.
- **Documentație:** captură nouă cu cardurile pe o tabletă și un telefon și imagine animată `full` vs `calm` (date inventate), secțiune despre mișcare și baterie în README.

## 0.9.0 (pregătit pentru prima publicare)
- **Card nou:** `ccu-vehicle-card` (termene pe mașină: RCA, ITP, rovinietă, revizie / ulei pe kilometri, cu date editabile din card) și chip `deadlines`; iconițe noi „road” și „van”.
- **Baterii slabe:** `low_batteries` pe chips (un chip cu numărul bateriilor slabe sau numele ei, la atingere deschide ce setezi) și `auto` / `only_low` pe cardul de baterii (găsește singur dispozitivele pe baterii, fără telefoane și tablete).
- **Baterie:** energia se afișează pe banda utilizabilă, calculată exact: cu rețea „X kWh din Y kWh” între rezervă și 100%, fără rețea (backup) între pragul de oprire și 100%; autonomia urmează aceeași bandă, iar marcajul de oprire apare doar în backup. Pragurile se recalculează singure când le schimbi.
- **Meniu:** insigna butonului acceptă un senzor numeric (ex. „becuri aprinse”) și `badge_style: light` (galben, nu alertă).
- **Documentație:** capturi noi pentru antet + tile „erou”, meniul de jos și iconițele animate (APNG generat din animațiile reale).
- **Documentație:** README în engleză și română cu galerie de capturi (date inventate), pagina `docs/COLORS.md` cu toate culorile temelor, demo cu Home Assistant fals (`docs/demo`) și scriptul care regenerează capturile.
- **Card nou:** `ccu-radio-card` (player radio / muzică cu scală de acordaj, echalizator, volum și alegerea boxei). Graficul acceptă `tap_action`. Fluxul de energie nu mai desenează sursele fără schimb de energie.
- **Editor vizual** pentru toate cele 13 carduri (formular HA cu selectoare de entități și iconițe, liste cu mutare / ștergere, „Detectează automat senzorii” la fluxul de energie); YAML rămâne disponibil și câmpurile necunoscute se păstrează.
- **Reparat:** butoanele de lumină / priză trimit `turn_on` / `turn_off` în loc de `toggle` (multe relee nu implementează `toggle`, deci comanda nu făcea nimic). Acțiunile din editorul HA (`perform-action`) sunt înțelese.
- Fluxul de energie: până la 4 statistici jos; stub-ul unui card nou folosește senzorii detectați.
- **Limbi**: engleză + română (după limba HA sau `language:` pe card), numere cu separatorii limbii; dicționar extensibil în `src/i18n.mjs`.
- Carduri: buttons, chips (hide_off, show_if, on_states, text_map, gunoi din calendar), header, nav (sticky, compact, înapoi, vizibilitate, insignă), graph (compact, etichete Y adaptive), flow (sume / scăderi, semne), battery, batteries, people (layout family), weather (scenă animată + prognoză), **controls** (cadran termostat/A/C, becuri cu orb, slider, temperatură de culoare și culori rapide, ventilator, media, număr, selector), **remote** (telecomandă TV), **title**.
- ~120 iconițe proprii + sute de aliasuri `mdi:…`.
- 6 teme (green, calm, contrast, mono, warm, light).
