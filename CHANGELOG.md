# Istoric versiuni

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
