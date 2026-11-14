// src/icons.mjs — set propriu de iconițe liniare 32×32. Fără rețea, fără mdi la rulare.
// Fiecare iconiță e un șir SVG cu stroke="currentColor" (culoarea vine din .ccu-ico în theme.js).

const svg = (inner) => `<svg viewBox="0 0 32 32" aria-hidden="true">${inner}</svg>`;

export const ICONS = {
  bulb:    svg('<path class="fl" d="M16 4a8 8 0 0 0-4.8 14.4c.9.8 1.5 1.8 1.5 3V22h6.6v-.6c0-1.2.6-2.2 1.5-3A8 8 0 0 0 16 4z"/><path d="M13 25.2h6M14.2 28.2h3.6M14.3 22l1.7-5.6 1.7 5.6"/>'),
  fan:     svg('<g class="rot whole"><circle cx="16" cy="16" r="2"/><path d="M16 14c-1-6 3-9 5-7s0 6-5 7M18 16c6-1 9 3 7 5s-6 0-7-5M16 18c1 6-3 9-5 7s0-6 5-7M14 16c-6 1-9-3-7-5s6 0 7 5"/></g>'),
  flame:   svg('<path class="fl" d="M16 3c1 5.2 7 8.2 7 15a7 7 0 0 1-14 0c0-3 2-4.2 3-7 1.2 2 2.2 2.2 2.4.8.2-3 .8-6 1.6-8.8z"/><path d="M16 15.5c.4 2.4 3 3.4 3 6.3a3 3 0 0 1-6 0c0-1.6.9-2.4 1.6-3.4.5.9 1.3.9 1.4-.5z"/>'),
  door:    svg('<path class="fl" d="M8 5h13v23H8z"/><path d="M4 28h24"/><circle cx="17.5" cy="17" r="1.1"/>'),
  lock:    svg('<rect class="fl" x="7" y="14" width="18" height="14" rx="2.5"/><path d="M11 14v-3.5a5 5 0 0 1 10 0V14"/><circle cx="16" cy="19.3" r="1.3"/><path d="M16 20.6v2.4"/>'),
  camera:  svg('<rect class="fl" x="4" y="9" width="18" height="14" rx="2.5"/><path d="m22 14.5 6-3.5v10l-6-3.5"/><circle cx="12" cy="16" r="3"/>'),
  thermo:  svg('<path d="M13 6.5a3 3 0 0 1 6 0v12a5.2 5.2 0 1 1-6 0z"/><circle class="fl" cx="16" cy="22.4" r="3.1"/><path d="M16 11v10M21.5 9.5h2.5M21.5 13h1.8"/>'),
  audi:    svg('<circle cx="4.9" cy="16" r="4.3"/><circle cx="12.3" cy="16" r="4.3"/><circle cx="19.7" cy="16" r="4.3"/><circle cx="27.1" cy="16" r="4.3"/>'),
  back:    svg('<circle class="fl" cx="16" cy="16" r="12"/><path d="M18.5 10.5 13 16l5.5 5.5M13 16h9"/>'),
  tablet:  svg('<rect class="fl" x="5" y="4" width="22" height="24" rx="3"/><path d="M14 24.5h4"/>'),
  play:    svg('<path class="fl" d="M10 6.5v19l16-9.5z"/>'),
  stop:    svg('<rect class="fl" x="7" y="7" width="18" height="18" rx="3"/>'),
  clock:   svg('<circle class="fl" cx="16" cy="16" r="12"/><path d="M16 9v7.5l5 3"/>'),
  cog:     svg('<circle class="fl" cx="16" cy="16" r="4"/><path d="M16 4v3.5M16 24.5V28M4 16h3.5M24.5 16H28M7.5 7.5 10 10M22 22l2.5 2.5M24.5 7.5 22 10M10 22l-2.5 2.5"/><circle cx="16" cy="16" r="8"/>'),
  counter: svg('<rect class="fl" x="4" y="6" width="24" height="20" rx="3.5"/><path d="M10 21v-6l-2 1.2M15.5 15.2c1.2-1.2 3.2-.6 3.2.9 0 1-1 1.7-3.2 4.9h3.4M22 15h3M22 20.5h3"/>'),
  leaf:    svg('<path class="fl" d="M6 26C6 13 13 6 27 5c0 13-6 20-17 20z"/><path d="M6 26 17 15"/>'),
  power:   svg('<path d="M16 4v11"/><path d="M9.5 8.5a9.5 9.5 0 1 0 13 0"/>'),
  mute:    svg('<path class="fl" d="M5 12.5h5l6-5v17l-6-5H5z"/><path d="m21 12 6 8M27 12l-6 8"/>'),
  volup:   svg('<path class="fl" d="M5 12.5h5l6-5v17l-6-5H5z"/><path d="M21 12a5.5 5.5 0 0 1 0 8M24.5 8.5a10.5 10.5 0 0 1 0 15"/>'),
  voldown: svg('<path class="fl" d="M5 12.5h5l6-5v17l-6-5H5z"/><path d="M21 12a5.5 5.5 0 0 1 0 8"/>'),
  menu:    svg('<path d="M6 9h20M6 16h20M6 23h20"/>'),
  input:   svg('<rect class="fl" x="4" y="7" width="24" height="18" rx="3"/><path d="M11 16h9M17 12.5 20.5 16 17 19.5"/>'),
  up:      svg('<path d="m8 20 8-8 8 8"/>'),
  down:    svg('<path d="m8 12 8 8 8-8"/>'),
  left:    svg('<path d="m20 8-8 8 8 8"/>'),
  right:   svg('<path d="m12 8 8 8-8 8"/>'),
  ok:      svg('<circle class="fl" cx="16" cy="16" r="11"/><path d="m11 16.5 3.5 3.5L21.5 12.5"/>'),
  prev:    svg('<path class="fl" d="M23 8v16l-11-8z"/><path d="M9 8v16"/>'),
  next:    svg('<path class="fl" d="M9 8v16l11-8z"/><path d="M23 8v16"/>'),
  pause:   svg('<rect class="fl" x="8" y="7" width="5" height="18" rx="1.5"/><rect class="fl" x="19" y="7" width="5" height="18" rx="1.5"/>'),
  tv:      svg('<rect class="fl" x="3.5" y="6" width="25" height="17" rx="3"/><path d="M11 27h10M16 23v4"/>'),
  chart: svg('<path d="M4 4v24h24"/><path class="fl" d="m8 21 6-7 5 4 7-9v13H8z"/><path d="m8 21 6-7 5 4 7-9"/>'),
  wave: svg('<path d="M3 16c2.5-9 5.5-9 8 0s5.5 9 8 0 5.5-9 8 0"/>'),
  calendar: svg('<rect class="fl" x="4" y="7" width="24" height="21" rx="3.5"/><path d="M4 13h24M10 4v6M22 4v6"/><path d="M10 18h3M15 18h3M20 18h3M10 23h3M15 23h3"/>'),
  bell: svg('<path class="fl" d="M8 22V15a8 8 0 0 1 16 0v7l2 3H6z"/><path d="M13.5 27.5a2.7 2.7 0 0 0 5 0M16 4v3"/>'),
  wrench: svg('<path class="fl" d="M21 5a6.5 6.5 0 0 0-6 8.8L5.5 23.3a2.6 2.6 0 0 0 3.7 3.7l9.5-9.5A6.5 6.5 0 0 0 27 11l-4 4-3.5-.8-.8-3.5 4-4A6.4 6.4 0 0 0 21 5z"/>'),
  refresh: svg('<path d="M26 14a10 10 0 0 0-18.5-4M6 18a10 10 0 0 0 18.5 4"/><path d="M26 5v7h-7M6 27v-7h7"/>'),
  download: svg('<path d="M16 5v16M9.5 15 16 21.5 22.5 15"/><path d="M6 26h20"/>'),
  upload: svg('<path d="M16 21V5M9.5 11 16 4.5 22.5 11"/><path d="M6 26h20"/>'),
  cash: svg('<rect class="fl" x="3" y="9" width="26" height="14" rx="2.5"/><circle cx="16" cy="16" r="3.5"/><path d="M7 13v.01M25 19v.01"/>'),
  chip: svg('<rect class="fl" x="9" y="9" width="14" height="14" rx="2.5"/><path d="M13 5v4M19 5v4M13 23v4M19 23v4M5 13h4M5 19h4M23 13h4M23 19h4"/><rect x="13.5" y="13.5" width="5" height="5" rx="1"/>'),
  database: svg('<ellipse class="fl" cx="16" cy="8" rx="10" ry="4"/><path d="M6 8v16c0 2.2 4.5 4 10 4s10-1.8 10-4V8"/><path d="M6 16c0 2.2 4.5 4 10 4s10-1.8 10-4"/>'),
  globe: svg('<circle class="fl" cx="16" cy="16" r="12"/><path d="M4 16h24M16 4c-4 3.5-5 7.5-5 12s1 8.5 5 12c4-3.5 5-7.5 5-12s-1-8.5-5-12z"/>'),
  server: svg('<rect class="fl" x="5" y="5" width="22" height="9" rx="2.5"/><rect class="fl" x="5" y="18" width="22" height="9" rx="2.5"/><path d="M10 9.5h.01M10 22.5h.01M15 9.5h8M15 22.5h8"/>'),
  robot: svg('<rect class="fl" x="6" y="10" width="20" height="15" rx="4"/><path d="M16 5v5M11 17v.01M21 17v.01M12 22h8M3 16v4M29 16v4"/><circle cx="16" cy="4" r="1.2"/>'),
  mower: svg('<path class="fl" d="M4 21v-5a5 5 0 0 1 5-5h10l6 5v5z"/><circle cx="9" cy="24" r="3"/><circle cx="23" cy="24" r="3"/><path d="M12 15h6M26 8l2 4"/>'),
  filter: svg('<path class="fl" d="M4 6h24l-9 11v8l-6 3V17z"/>'),
  sliders: svg('<path d="M6 9h20M6 16h20M6 23h20"/><circle class="fl" cx="12" cy="9" r="2.8"/><circle class="fl" cx="21" cy="16" r="2.8"/><circle class="fl" cx="10" cy="23" r="2.8"/>'),
  radio: svg('<rect class="fl" x="4" y="11" width="24" height="16" rx="3.5"/><circle cx="20.5" cy="19" r="4"/><path d="M8 17h5M8 21h5M7 11l14-6"/>'),
  swaph: svg('<path d="M5 12h20M20 7l5 5-5 5M27 21H7M12 16l-5 5 5 5"/>'),
  swapv: svg('<path d="M12 5v20M7 20l5 5 5-5M21 27V7M16 12l5-5 5 5"/>'),
  weight: svg('<path class="fl" d="M9 12h14l3 14H6z"/><path d="M12 12a4 4 0 1 1 8 0"/><path d="M16 17v5M13.5 19.5h5"/>'),
  ruler: svg('<rect class="fl" x="3" y="11" width="26" height="10" rx="2"/><path d="M8 11v4M13 11v6M18 11v4M23 11v6"/>'),
  alert: svg('<path class="fl" d="M16 5 29 27H3z"/><path d="M16 13v7M16 23.5v.01"/>'),
  info: svg('<circle class="fl" cx="16" cy="16" r="12"/><path d="M16 14.5v7M16 10.5v.01"/>'),
  road:    svg('<path class="fl" d="M11 5h10l7 22H4z"/><path d="M16 8v3M16 14v3.5M16 21v4"/>'),
  van:     svg('<path class="fl" d="M3 22V9.5A2.5 2.5 0 0 1 5.5 7H19v15z"/><path d="M19 12h5.2a2 2 0 0 1 1.7 1l2.1 3.7V22H19"/><path d="M22 12v4.7h6"/><circle cx="9" cy="22.5" r="2.6"/><circle cx="23" cy="22.5" r="2.6"/>'),
  shield: svg('<path class="fl" d="M16 4 6 8v8c0 6 4 10 10 12 6-2 10-6 10-12V8z"/><path d="m11.5 16 3.5 3.5 6-6.5"/>'),
  sunset: svg('<path d="M4 24h24M9 24a7 7 0 0 1 14 0"/><path class="fl" d="M9 24a7 7 0 0 1 14 0z"/><path d="M16 8v4M6.5 14l2.5 2.5M25.5 14 23 16.5M13 5.5l3 3 3-3"/>'),
  hand: svg('<path class="fl" d="M10 17V8.5a1.8 1.8 0 0 1 3.6 0V15M13.6 14V6.5a1.8 1.8 0 0 1 3.6 0V15M17.2 14V8a1.8 1.8 0 0 1 3.6 0v9M20.8 17v-5.5a1.8 1.8 0 0 1 3.6 0V19c0 5-3 8-8 8-3 0-5-1.4-6.4-3.6L6 18.5a1.8 1.8 0 0 1 3-2L10 18"/>'),
  bolt:    svg('<path class="fl" d="M18.3 3 7 18h8l-2.3 11L25 13.5h-8.2z"/>'),
  home:    svg('<path class="fl" d="M7 14v15h18V14L16 6z"/><path d="M3 16.5 16 5l13 11.5"/><path d="M13.5 29v-8.5h5V29"/>'),
  sun:     svg('<circle class="fl" cx="16" cy="16" r="5.3"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8"/>'),
  plug:    svg('<path d="M11 3v6.5M21 3v6.5"/><path class="fl" d="M8 9.5h16v5.5a8 8 0 0 1-16 0z"/><path d="M16 23v6"/>'),
  speaker: svg('<rect class="fl" x="9" y="3" width="14" height="26" rx="3.5"/><circle cx="16" cy="19.5" r="4.6"/><circle cx="16" cy="19.5" r="1.4"/><circle cx="16" cy="9" r="1.4"/>'),
  blinds:  svg('<path d="M5 4h22M7 4v4M25 4v4"/><path class="fl" d="M6 8h20v18H6z"/><path d="M6 13h20M6 18h20M6 23h20"/>'),
  battery: svg('<rect x="3" y="9.5" width="22" height="13" rx="3"/><path d="M28 13.8v4.4"/><rect class="fl" x="5.8" y="12.3" width="12" height="7.4" rx="1.4"/>'),
  // aparat de aer condiționat: unitatea de sus + ventilatorul dedesubt (grupul .rot se învârte, restul stă pe loc)
  ac:      svg('<rect class="fl" x="3" y="4" width="26" height="9" rx="2.8"/><path d="M7 10.5h18"/><g transform="translate(16 22.5) scale(.46) translate(-16 -16)"><g class="rot"><circle cx="16" cy="16" r="2.2"/><path d="M16 13.8c-1-6 3-9 5-7s0 6-5 7M18.2 16c6-1 9 3 7 5s-6 0-7-5M16 18.2c1 6-3 9-5 7s0-6 5-7M13.8 16c-6 1-9-3-7-5s6 0 7 5"/></g></g>'),
  snow:    svg('<path d="M16 3v26M6 9l20 14M26 9 6 23"/><path d="M12.5 5 16 8.5 19.5 5M12.5 27l3.5-3.5 3.5 3.5M3.5 12.5 8 14 6.5 9M28.5 19.5 24 18l1.5 5M3.5 19.5 8 18 6.5 23M28.5 12.5 24 14l1.5-5"/>'),
  wifi:    svg('<path d="M3.5 12a17 17 0 0 1 25 0M8 17a11 11 0 0 1 16 0M12.5 22a5 5 0 0 1 7 0"/><circle cx="16" cy="26.5" r="1.3"/>'),
  sofa:    svg('<path d="M7 14.5V11a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v3.5"/><path class="fl" d="M3 16.5a3 3 0 0 1 6 0V19h14v-2.5a3 3 0 0 1 6 0V25a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M7 27v1.5M25 27v1.5"/>'),
  bed:     svg('<path d="M3 5.5V27M3 22h26v5M29 22v-5a4 4 0 0 0-4-4H14v9"/><rect class="fl" x="6" y="14" width="7" height="5.6" rx="2.4"/>'),
  flask:   svg('<path d="M12 3h8M13 3v9L6 25a2 2 0 0 0 1.8 3h16.4A2 2 0 0 0 26 25l-7-13V3"/><path class="fl" d="M9.6 20.5h12.8l2.9 5a1.8 1.8 0 0 1-1.6 2.5H8.3A1.8 1.8 0 0 1 6.7 25.5z"/><circle cx="14" cy="24" r="1"/><circle cx="18.6" cy="22.6" r=".8"/>'),
  stairs:  svg('<path d="M4 27h7v-7h7v-7h7V6h3"/><path d="M4 27v-5M11 20v-5M18 13V8"/>'),
  pool:    svg('<path d="M11 16V8a3 3 0 0 1 6 0M21 16V8a3 3 0 0 0-6 0M11 12h10"/><path class="fl" d="M3 22c3-3 5 3 8 0s5 3 8 0 5 3 8 0V29H3z"/><path d="M3 22c3-3 5 3 8 0s5 3 8 0 5 3 8 0"/>'),
  pot:     svg('<path class="fl" d="M6 14h20v8a6 6 0 0 1-6 6h-8a6 6 0 0 1-6-6z"/><path d="M7 14c0-3.8 4-6.4 9-6.4s9 2.6 9 6.4M3 17.5h3M26 17.5h3"/><circle cx="16" cy="5.4" r="1.3"/>'),
  car:     svg('<path class="fl" d="M3.5 21v-4.5a2.5 2.5 0 0 1 1.8-2.4L9 13l2.2-3.6A2 2 0 0 1 13 8.5h7.4a2 2 0 0 1 1.7 1l2.2 3.6 3 .8a2.5 2.5 0 0 1 1.9 2.4V21z"/><path d="M9 13h15"/><circle cx="9.5" cy="21.5" r="2.7"/><circle cx="23.5" cy="21.5" r="2.7"/>'),
  pylon:   svg('<path d="M16 3 9.5 29M16 3l6.5 26M12 12h8M10.5 19h11M4 9h24M7 9v3M25 9v3M12 12l9 7M20 12l-9 7"/>'),
  // ---- vreme (animate discret din CSS: .wx-spin = raze, .wx-fall = picături/fulgi, .wx-drift = nor/vânt) ----
  'w-sun':    svg('<circle class="fl" cx="16" cy="16" r="5.2"/><g class="wx-spin"><path d="M16 3.5v3.2M16 25.3v3.2M3.5 16h3.2M25.3 16h3.2M7.2 7.2l2.3 2.3M22.5 22.5l2.3 2.3M24.8 7.2l-2.3 2.3M9.5 22.5l-2.3 2.3"/></g>'),
  'w-moon':   svg('<path class="fl" d="M25 19.2A10 10 0 1 1 12.8 7a8 8 0 0 0 12.2 12.2z"/><path class="wx-twinkle" d="M24 5v3M22.5 6.5h3"/>'),
  'w-cloud':  svg('<g class="wx-drift"><path class="fl" d="M8.5 24a5.5 5.5 0 0 1-.8-10.9 8 8 0 0 1 15.2 1.9 4.8 4.8 0 0 1-.3 9z"/></g>'),
  'w-partly': svg('<circle class="fl" cx="11" cy="11" r="3.6"/><g class="wx-spin"><path d="M11 3.5v2M11 16.5v2M3.5 11h2M16.5 11h2M5.7 5.7l1.4 1.4M15 5.7l-1.4 1.4"/></g><g class="wx-drift"><path class="fl" d="M11.5 27a4.6 4.6 0 0 1-.6-9.2 6.6 6.6 0 0 1 12.5 1.6 4.2 4.2 0 0 1-.4 7.6z"/></g>'),
  'w-rain':   svg('<path class="fl" d="M9.5 18.5a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 8a4.6 4.6 0 0 1 .4 9.1z"/><g class="wx-fall"><path d="M11 21.5l-1.6 4M16.5 21.5l-1.6 4M22 21.5l-1.6 4"/></g>'),
  'w-pour':   svg('<path class="fl" d="M9.5 17a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 6.5a4.6 4.6 0 0 1 .4 9.1z"/><g class="wx-fall"><path d="M10 19.5l-2 5M14 19.5l-2 5M18 19.5l-2 5M22 19.5l-2 5M12 25.5l-1.4 3.5M20 25.5l-1.4 3.5"/></g>'),
  'w-snow':   svg('<path class="fl" d="M9.5 18.5a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 8a4.6 4.6 0 0 1 .4 9.1z"/><g class="wx-fall"><path d="M11 22.5v4M9.3 23.5l3.4 2M12.7 23.5l-3.4 2M21 22.5v4M19.3 23.5l3.4 2M22.7 23.5l-3.4 2"/></g>'),
  'w-sleet':  svg('<path class="fl" d="M9.5 18.5a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 8a4.6 4.6 0 0 1 .4 9.1z"/><g class="wx-fall"><path d="M10.5 21.5l-1.6 4M21.5 21.5l-1.6 4M16 22.5v4M14.3 23.5l3.4 2M17.7 23.5l-3.4 2"/></g>'),
  'w-storm':  svg('<path class="fl" d="M9.5 17.5a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 7a4.6 4.6 0 0 1 .4 9.1"/><path class="wx-flash" d="M17.5 14.5l-4.5 7h4.2l-2.2 6.5"/>'),
  'w-fog':    svg('<g class="wx-drift"><path class="fl" d="M9.5 15a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 4.5a4.6 4.6 0 0 1 .4 9.1"/></g><path d="M5 19h22M8 23h19M5 27h15"/>'),
  'w-hail':   svg('<path class="fl" d="M9.5 18.5a5 5 0 0 1-.6-9.96A7.2 7.2 0 0 1 22.6 8a4.6 4.6 0 0 1 .4 9.1z"/><g class="wx-fall"><circle cx="11" cy="23.5" r="1.4"/><circle cx="16.5" cy="26" r="1.4"/><circle cx="22" cy="23.5" r="1.4"/></g>'),
  'w-wind':   svg('<g class="wx-drift"><path d="M3 12h15.5a3.5 3.5 0 1 0-3.4-4.4M3 17h22a3.5 3.5 0 1 1-3.4 4.4M3 22h10.5a3 3 0 1 1-2.9 3.7"/></g>'),
  drop:       svg('<path class="fl" d="M16 4c5 6 8.5 10 8.5 14.2a8.5 8.5 0 0 1-17 0C7.5 14 11 10 16 4z"/><path d="M12 19.5a4.2 4.2 0 0 0 3 3.2"/>'),
  gauge:      svg('<path d="M5 22a11 11 0 1 1 22 0"/><path d="M16 22l5-8"/><circle cx="16" cy="22" r="1.4"/><path d="M8.2 14.8l1.4 1M16 9.5v1.7M23.8 14.8l-1.4 1"/>'),
  compass:    svg('<circle class="fl" cx="16" cy="16" r="11"/><path d="M16 8l3.4 8.8L16 15l-3.4 1.8z"/>'),
  bath:    svg('<path class="fl" d="M4 15h24v3a7 7 0 0 1-7 7H11a7 7 0 0 1-7-7z"/><path d="M7 15V7.5A2.5 2.5 0 0 1 9.5 5H11M12 9h4M9 25l-1 3M23 25l1 3"/>'),
  warehouse: svg('<path class="fl" d="M3 13 16 5l13 8v15H3z"/><path d="M3 13 16 5l13 8M9 28V18h14v10M9 22h14M9 25h14"/>'),
  washer:  svg('<rect class="fl" x="5" y="3" width="22" height="26" rx="3"/><path d="M5 9h22M9 6h.01M13 6h.01"/><g class="rot whole"><circle cx="16" cy="18" r="6.4"/><path d="M12.6 18c1.2-1.4 2.4 1.4 3.4 0s2.2 1.4 3.4 0"/></g>'),
  trash:   svg('<path d="M5 8h22M12 8V5h8v3"/><path class="fl" d="M8 8l1.3 19h13.4L24 8z"/><path d="M13 12.5v10M19 12.5v10"/>'),
  recycle: svg('<path d="M16 4l4 7h-8zM25.5 21l-4 7-4-7zM6.5 21l4 7 4-7z" class="fl"/><path d="M20 11l5 8M10 24h7M12 11l-5 8"/>'),
  paper:   svg('<rect class="fl" x="6" y="4" width="20" height="24" rx="2.5"/><path d="M10 10h12M10 15h12M10 20h7"/>'),
  circle:  svg('<circle cx="16" cy="16" r="8"/>'),
};

// Animația implicită a iconiței (clasele sunt definite în theme.js; rulează doar la data-state="on").
export const DEFAULT_ANIM = { ac: 'a-fan', bulb: 'a-glow', fan: 'a-fan', washer: 'a-fan', drop: 'a-pulse', flame: 'a-flicker', bolt: 'a-pulse', sun: 'a-glow', speaker: 'a-pulse' };

// mdi:… → iconița proprie. Ce nu e aici cade pe domeniul entității, apoi pe „circle”.
const MDI = {
  'lightbulb': 'bulb', 'lightbulb-on': 'bulb', 'lightbulb-outline': 'bulb', 'ceiling-light': 'bulb', 'lamp': 'bulb', 'floor-lamp': 'bulb', 'led-strip': 'bulb',
  'fan': 'fan', 'fan-off': 'fan', 'ceiling-fan': 'fan',
  'air-conditioner': 'ac', 'hvac': 'ac', 'hvac-off': 'ac', 'snowflake-thermometer': 'ac',
  'fire': 'flame', 'radiator': 'flame', 'water-boiler': 'flame', 'gas-burner': 'flame', 'stove': 'flame',
  'door': 'door', 'door-open': 'door', 'door-closed': 'door', 'gate': 'door', 'garage': 'door', 'garage-open': 'door',
  'lock': 'lock', 'lock-open': 'lock', 'lock-open-variant': 'lock', 'shield-lock': 'lock', 'key': 'lock',
  'cctv': 'camera', 'camera': 'camera', 'video': 'camera', 'webcam': 'camera', 'doorbell-video': 'camera',
  'thermometer': 'thermo', 'thermostat': 'thermo', 'home-thermometer': 'thermo', 'water-thermometer': 'thermo',
  'flash': 'bolt', 'lightning-bolt': 'bolt', 'transmission-tower': 'pylon', 'transmission-tower-export': 'pylon', 'transmission-tower-import': 'pylon', 'electric-switch': 'pylon', 'meter-electric': 'bolt', 'power': 'bolt', 'flash-outline': 'bolt',
  'home': 'home', 'home-outline': 'home', 'home-variant': 'home', 'home-assistant': 'home',
  'weather-sunny': 'sun', 'white-balance-sunny': 'sun', 'solar-power': 'sun', 'solar-panel': 'sun', 'solar-panel-large': 'sun',
  'power-socket': 'plug', 'power-socket-eu': 'plug', 'power-plug': 'plug', 'toggle-switch': 'plug', 'light-switch': 'plug',
  'speaker': 'speaker', 'speaker-wireless': 'speaker', 'cast': 'speaker',
  'window-shutter': 'blinds', 'blinds': 'blinds', 'blinds-open': 'blinds', 'roller-shade': 'blinds', 'curtains': 'blinds',
  'snowflake': 'snow', 'snowflake-variant': 'snow', 'wifi': 'wifi', 'wifi-strength-1': 'wifi', 'wifi-strength-2': 'wifi', 'sofa': 'sofa', 'sofa-outline': 'sofa',
  'bed': 'bed', 'bed-king': 'bed', 'bed-empty': 'bed', 'flask': 'flask', 'flask-outline': 'flask', 'stairs': 'stairs', 'pool': 'pool', 'pot-steam': 'pot', 'pot-mix': 'pot', 'pot': 'pot',
  'toilet': 'bath', 'shower': 'bath', 'shower-head': 'bath', 'bathtub': 'bath', 'bathtub-outline': 'bath', 'warehouse': 'warehouse', 'factory': 'warehouse', 'garage-variant': 'warehouse',
  'room-service': 'door', 'room-service-outline': 'door', 'door-sliding': 'door', 'bed-double': 'bed', 'bed-single': 'bed', 'knife': 'pot', 'bottle-tonic-skull': 'flask',
  'valve': 'drop', 'valve-open': 'drop', 'valve-closed': 'drop', 'water-pump': 'drop', 'water-alert': 'drop', 'water': 'drop', 'fire-alert': 'flame', 'window-open': 'blinds', 'window-closed': 'blinds', 'window-open-variant': 'blinds',
  'trash-can': 'trash', 'trash-can-outline': 'trash', 'delete': 'trash', 'recycle': 'recycle', 'newspaper-variant-multiple': 'paper', 'newspaper': 'paper', 'file-document': 'paper',
  'washing-machine': 'washer', 'washing-machine-off': 'washer', 'dishwasher': 'washer', 'sun-wireless-outline': 'sun', 'sun-wireless': 'sun',
  'weather-rainy': 'w-rain', 'weather-pouring': 'w-pour', 'weather-snowy': 'w-snow', 'weather-snowy-rainy': 'w-sleet', 'weather-cloudy': 'w-cloud', 'weather-partly-cloudy': 'w-partly',
  'weather-windy': 'w-wind', 'weather-windy-variant': 'w-wind', 'weather-lightning': 'w-storm', 'weather-lightning-rainy': 'w-storm', 'weather-fog': 'w-fog', 'weather-hail': 'w-hail', 'weather-night': 'w-moon',
  'thermometer-alert': 'thermo', 'thermometer-high': 'thermo', 'thermometer-low': 'thermo', 'sun-thermometer': 'thermo', 'umbrella': 'w-rain',
  'logo-audi': 'audi', 'audi': 'audi',
  'power': 'power', 'power-standby': 'power', 'volume-off': 'mute', 'volume-mute': 'mute', 'volume-plus': 'volup', 'volume-high': 'volup', 'volume-medium': 'voldown', 'volume-minus': 'voldown', 'volume-low': 'voldown', 'menu': 'menu', 'format-list-bulleted': 'menu',
  'login-variant': 'input', 'import': 'input', 'chevron-up': 'up', 'arrow-up': 'up', 'chevron-down': 'down', 'arrow-down': 'down', 'arrow-right': 'right', 'chevron-right': 'right', 'check-circle': 'ok', 'check': 'ok', 'skip-previous': 'prev', 'skip-next': 'next', 'pause-circle': 'pause', 'television': 'tv', 'television-classic': 'tv', 'monitor': 'tv', 'projector': 'tv',
  'cog': 'cog', 'cog-outline': 'cog', 'settings': 'cog', 'tune': 'cog', 'counter': 'counter', 'numeric': 'counter', 'pound': 'counter', 'leaf': 'leaf', 'sprout': 'leaf', 'eco': 'leaf', 'led-strip-variant': 'bulb', 'led-strip-variant-off': 'bulb', 'led-variant-on': 'bulb',
  'play': 'play', 'play-pause': 'play', 'play-circle': 'play', 'stop': 'stop', 'stop-circle': 'stop', 'timer-outline': 'clock', 'timer': 'clock', 'clock-outline': 'clock', 'clock': 'clock', 'clock-time-four-outline': 'clock', 'timer-sand': 'clock',
  'arrow-left-circle': 'back', 'arrow-left': 'back', 'chevron-left': 'back', 'arrow-left-bold-circle': 'back', 'keyboard-backspace': 'back', 'tablet': 'tablet', 'tablet-dashboard': 'tablet', 'tablet-android': 'tablet', 'cellphone': 'tablet',
  'speedometer': 'gauge', 'gauge-low': 'gauge', 'gauge-full': 'gauge', 'brightness-4': 'sun', 'brightness-6': 'sun', 'brightness-7': 'sun', 'weather-sunny': 'sun', 'white-balance-sunny': 'sun',
  'heat-pump': 'ac', 'heat-wave': 'flame', 'fan-auto': 'fan', 'air-purifier': 'fan', 'air-filter': 'fan', 'thermostat-auto': 'thermo', 'thermometer-high': 'thermo', 'thermometer-water': 'thermo', 'water-thermometer': 'thermo',
  'snowflake-off': 'snow', 'snowflake-alert': 'snow', 'snowflake-variant': 'snow', 'fridge-variant-outline': 'snow', 'snowflake-thermometer': 'ac', 'radiator': 'flame', 'gas-cylinder': 'flame', 'gas-station': 'flame',
  'lightning-bolt-outline': 'bolt', 'lightning-bolt-circle': 'bolt', 'current-ac': 'bolt', 'transmission-circuit': 'pylon', 'electric-switch': 'pylon', 'battery-80': 'battery', 'battery-arrow-up': 'battery', 'battery-refresh': 'battery', 'battery-high': 'battery', 'battery-low': 'battery',
  'waves': 'drop', 'waves-arrow-right': 'drop', 'water-percent': 'drop', 'water-opacity': 'drop', 'water-circle': 'drop', 'pump': 'drop', 'pipe-valve': 'drop', 'water-pump': 'drop',
  'test-tube': 'flask', 'molecule': 'flask', 'molecule-co2': 'flask', 'chemical-weapon': 'flask', 'bacteria-outline': 'flask', 'shaker-outline': 'flask', 'bottle-tonic-skull': 'flask',
  'car-back': 'car', 'car-lifted-pickup': 'car', 'car-light-high': 'car', 'car-defrost-front': 'car', 'car-wrench': 'car', 'ev-station': 'car', 'ev-plug-type2': 'car',
  'clock-time-eight': 'clock', 'clock-check': 'clock', 'clock-end': 'clock', 'timer-off': 'clock', 'grass': 'leaf', 'flower': 'leaf', 'weather-night': 'w-moon', 'weather-sunny': 'sun',
  'compass-outline': 'compass', 'satellite-variant': 'compass', 'latitude': 'compass', 'longitude': 'compass', 'map-marker': 'compass', 'map-marker-multiple': 'compass', 'target': 'compass',
  'alert-circle': 'ok', 'alert-octagon': 'ok', 'check-all': 'ok', 'check-circle': 'ok', 'progress-check': 'ok',
  'highway': 'road', 'road': 'road', 'road-variant': 'road', 'toll': 'road', 'sign-direction': 'road', 'van-utility': 'van', 'van-passenger': 'van', 'bus': 'van', 'truck': 'van', 'truck-delivery': 'van', 'shield-car': 'shield', 'car-wrench': 'car', 'car-cog': 'car', 'car-info': 'car', 'oil': 'wrench', 'oil-level': 'wrench',
  'car': 'car', 'car-electric': 'car', 'ev-station': 'car', 'ev-plug-type2': 'car',
  'chart-line': 'chart', 'bubble-chart': 'chart', 'chart-areaspline': 'chart', 'chart-bar': 'chart', 'sine-wave': 'wave', 'waveform': 'wave', 'delta': 'wave', 'calendar': 'calendar', 'calendar-today': 'calendar', 'calendar-month': 'calendar', 'calendar-week': 'calendar', 'calendar-year': 'calendar', 'calendar-clock': 'calendar', 'bell': 'bell', 'bell-alert': 'bell', 'bell-settings': 'bell', 'bell-outline': 'bell', 'bell-ring': 'bell', 'wrench': 'wrench', 'tools': 'wrench', 'engine': 'wrench', 'oil': 'wrench', 'wrench-clock': 'wrench', 'auto-fix': 'wrench', 'strategy': 'wrench', 'hammer-wrench': 'wrench', 'refresh': 'refresh', 'update': 'refresh', 'repeat-variant': 'refresh', 'rotate-3d-variant': 'refresh', 'screen-rotation': 'refresh', 'cog-clockwise': 'refresh', 'sync': 'refresh', 'download': 'download', 'upload': 'upload', 'cash': 'cash', 'currency-eur': 'cash', 'currency-usd': 'cash', 'cash-multiple': 'cash', 'chip': 'chip', 'memory': 'chip', 'cpu-64-bit': 'chip', 'database': 'database', 'harddisk': 'database', 'sd': 'database', 'web': 'globe', 'network-outline': 'globe', 'earth': 'globe', 'server-network': 'server', 'ethernet': 'server', 'server': 'server', 'lan': 'server', 'robot': 'robot', 'robot-outline': 'robot', 'robot-mower': 'mower', 'robot-mower-outline': 'mower', 'mower': 'mower', 'filter': 'filter', 'filter-variant': 'filter', 'filter-remove': 'filter', 'cleaning-services': 'filter', 'filter-outline': 'filter', 'tune-variant': 'sliders', 'tune': 'sliders', 'tune-vertical': 'sliders', 'radio': 'radio', 'radio-tower': 'radio', 'arrow-left-right': 'swaph', 'arrow-oscillating': 'swaph', 'arrow-oscillating-off': 'swaph', 'swap-horizontal': 'swaph', 'arrow-up-down': 'swapv', 'swap-vertical': 'swapv', 'weight': 'weight', 'weight-kilogram': 'weight', 'ruler-square': 'ruler', 'texture-box': 'ruler', 'ruler': 'ruler', 'alert-circle': 'alert', 'alert-octagon': 'alert', 'alert': 'alert', 'alert-outline': 'alert', 'alert-circle-outline': 'alert', 'windsock': 'w-wind', 'sleep': 'w-moon', 'playlist-play': 'menu',
  'information': 'info', 'information-outline': 'info', 'information-variant': 'info', 'shield-check': 'shield', 'shield-alert': 'shield', 'shield': 'shield', 'shield-outline': 'shield', 'shield-lock': 'shield', 'weather-sunset-up': 'sunset', 'weather-sunset-down': 'sunset', 'weather-sunset': 'sunset', 'weather-sunny-alert': 'sunset', 'hand-back-right': 'hand', 'hand-back-left': 'hand', 'hand-front-right': 'hand', 'file-document-outline': 'paper', 'file-document': 'paper', 'file': 'paper', 'wifi-off': 'wifi', 'wifi-alert': 'wifi', 'wifi-check': 'wifi', 'wifi-strength-off': 'wifi', 'pool-thermometer': 'pool', 'calendar-sync': 'calendar', 'calendar-clock': 'calendar', 'chart-timeline-variant': 'chart', 'chart-donut': 'chart', 'chart-arc': 'chart', 'wrench-cog': 'wrench', 'application-cog': 'cog', 'water-check': 'drop', 'water-outline': 'drop', 'cup-water': 'drop', 'water-plus': 'drop', 'thermometer-lines': 'thermo', 'temperature-celsius': 'thermo', 'home-thermometer': 'thermo',
  'battery': 'battery', 'battery-high': 'battery', 'battery-charging': 'battery', 'battery-medium': 'battery', 'battery-low': 'battery',
};

const DOMAIN = {
  light: 'bulb', switch: 'plug', fan: 'fan', lock: 'lock', cover: 'blinds', climate: 'thermo', water_heater: 'flame',
  camera: 'camera', media_player: 'speaker', person: 'home', sun: 'sun', binary_sensor: 'door', sensor: 'thermo',
  input_boolean: 'plug', button: 'bolt', script: 'bolt', scene: 'bolt',
};

/** Numele iconiței proprii pentru un nume (`mdi:fan`, `fan`) și/sau o entitate (`light.x`). Mereu o cheie din ICONS. */
export function iconKey(name, entityId) {
  if (typeof name === 'string' && name) {
    const n = name.trim().toLowerCase();
    if (ICONS[n]) return n;
    const m = n.startsWith('mdi:') ? n.slice(4) : n;
    if (MDI[m]) return MDI[m];
    if (ICONS[m]) return m;
  }
  const dom = typeof entityId === 'string' ? entityId.split('.')[0] : '';
  return DOMAIN[dom] || 'circle';
}

/** Șirul SVG pentru o iconiță (niciodată gol). */
export function iconSvg(name, entityId) {
  return ICONS[iconKey(name, entityId)];
}

/** Clasa de animație implicită a iconiței sau '' (config.animations === false → ''). */
export function iconAnim(name, entityId, enabled = true) {
  return enabled ? (DEFAULT_ANIM[iconKey(name, entityId)] || '') : '';
}
