# Istoric versiuni

## 0.9.0 (pregătit pentru prima publicare)
- **Documentație:** README în engleză și română cu galerie de capturi (date inventate), pagina `docs/COLORS.md` cu toate culorile temelor, demo cu Home Assistant fals (`docs/demo`) și scriptul care regenerează capturile.
- **Card nou:** `ccu-radio-card` (player radio / muzică cu scală de acordaj, echalizator, volum și alegerea boxei). Graficul acceptă `tap_action`. Fluxul de energie nu mai desenează sursele fără schimb de energie.
- **Editor vizual** pentru toate cele 13 carduri (formular HA cu selectoare de entități și iconițe, liste cu mutare / ștergere, „Detectează automat senzorii” la fluxul de energie); YAML rămâne disponibil și câmpurile necunoscute se păstrează.
- **Reparat:** butoanele de lumină / priză trimit `turn_on` / `turn_off` în loc de `toggle` (multe relee nu implementează `toggle`, deci comanda nu făcea nimic). Acțiunile din editorul HA (`perform-action`) sunt înțelese.
- Fluxul de energie: până la 4 statistici jos; stub-ul unui card nou folosește senzorii detectați.
- **Limbi**: engleză + română (după limba HA sau `language:` pe card), numere cu separatorii limbii; dicționar extensibil în `src/i18n.mjs`.
- Carduri: buttons, chips (hide_off, show_if, on_states, text_map, gunoi din calendar), header, nav (sticky, compact, înapoi, vizibilitate, insignă), graph (compact, etichete Y adaptive), flow (sume / scăderi, semne), battery, batteries, people (layout family), weather (scenă animată + prognoză), **controls** (cadran termostat/A/C, becuri cu orb, slider, temperatură de culoare și culori rapide, ventilator, media, număr, selector), **remote** (telecomandă TV), **title**.
- ~120 iconițe proprii + sute de aliasuri `mdi:…`.
- 6 teme (green, calm, contrast, mono, warm, light).
