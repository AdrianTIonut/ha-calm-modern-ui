/* Calm Modern UI (ccu) — generat de build.mjs din src/: theme.js, i18n.mjs, config.mjs, state.mjs, actions.mjs, gestures.mjs, icons.mjs, presets.mjs, render.mjs, graph-data.mjs, graph-card.mjs, energy.mjs, weather.mjs, controls.mjs, radio.mjs, vehicles.mjs, editor.mjs, cards.mjs */
(() => {
'use strict';
const __m = {};
__m["theme"] = (() => {
// src/theme.js — stilul cardurilor: variabile CSS --ccu-* și clase.
// Două identități, același schelet (src/presets.mjs dă valorile):
//   • „green”  (implicit): bleumarin #0B1220, VERDE = activ, albastru = info, portocaliu = atenție
//   • „calm”  : ardezie #152028, chihlimbar = activ, cyan = date, roșu = alertă
// Efectele (gradient, halou, margine, relief) se DERIVĂ din tokeni cu color-mix, deci arată bogat în orice presetare.
// Tot ce e culoare/dimensiune e variabilă CSS; utilizatorul le suprascrie din config.

const CCU_THEME = `
:host {
  /* ---- paleta (valorile implicite = „green”; presetările le suprascriu) ---- */
  --ccu-bg: #0b1220;
  --ccu-surface: color-mix(in srgb, #ffffff 5.5%, var(--ccu-bg));
  --ccu-surface-2: color-mix(in srgb, #ffffff 10%, var(--ccu-bg));
  --ccu-line: rgba(255,255,255,.09);
  --ccu-text: #e6edf7;
  --ccu-muted: #94a3b8;
  --ccu-muted-2: #94a3b8;
  --ccu-accent: #3b82f6;             /* informație */
  --ccu-on: #22c55e;                 /* ACTIV */
  --ccu-ok: #22c55e;
  --ccu-alert: #f59e0b;              /* atenție / alertă */
  --ccu-cool: #60a5fa;               /* climate: răcire */
  --ccu-heat: #f4694b;               /* climate: încălzire */
  --ccu-series: #34d399;             /* linia graficului / sparkline */
  /* derivate (nu se setează de utilizator) */
  --ccu-on-hi: color-mix(in srgb, var(--ccu-on) 72%, #ffffff);
  --ccu-alert-hi: color-mix(in srgb, var(--ccu-alert) 72%, #ffffff);
  --ccu-cool-hi: color-mix(in srgb, var(--ccu-cool) 72%, #ffffff);
  --ccu-heat-hi: color-mix(in srgb, var(--ccu-heat) 72%, #ffffff);
  /* culori pentru iconițe (icon_color) */
  --ccu-c-green: #34d399; --ccu-c-yellow: #f6c343; --ccu-c-orange: #f59e0b; --ccu-c-blue: #60a5fa;
  --ccu-c-cyan: #4fc3f7; --ccu-c-red: #f4694b; --ccu-c-white: #e6edf7;
  /* ---- formă și relief ---- */
  --ccu-r: 14px;
  --ccu-r-card: 18px;
  --ccu-bw: 1px;
  --ccu-gap: 8px;
  --ccu-gloss: linear-gradient(180deg, rgba(255,255,255,.06), rgba(255,255,255,.015) 48%, rgba(255,255,255,0) 100%);
  --ccu-edge: inset 0 1px 0 rgba(255,255,255,.08), inset 0 -12px 18px -14px rgba(0,0,0,.55);
  --ccu-drop: 0 10px 20px -12px rgba(0,0,0,.8);
  --ccu-font: "Inter","Segoe UI Variable","Segoe UI",system-ui,-apple-system,"Roboto",sans-serif;
  --ccu-anim: 1;
  display: block;
  height: 100%;                      /* în grilă (hero + grafic) cardurile se întind pe înălțime */
  container-type: inline-size;
  color: var(--ccu-text);
  font-family: var(--ccu-font);
  font-variant-numeric: tabular-nums;
  -webkit-tap-highlight-color: transparent;
}
/* varianta deschisă „Light Serenity” */
:host([data-theme="light"]) {
  --ccu-gloss: linear-gradient(180deg, rgba(255,255,255,.95), rgba(255,255,255,0));
  --ccu-edge: inset 0 1px 0 rgba(255,255,255,.95), inset 0 -10px 16px -14px rgba(20,40,70,.18);
  --ccu-drop: 0 8px 16px -10px rgba(20,40,70,.28);
  --ccu-on-hi: var(--ccu-on); --ccu-alert-hi: var(--ccu-alert); --ccu-cool-hi: var(--ccu-cool); --ccu-heat-hi: var(--ccu-heat);
}
* { box-sizing: border-box; }

/* ---- card: implicit fără chenar (plăcile stau pe fundal,); .panel = panou cu chenar ---- */
.ccu-card { position: relative; padding: 0; height: 100%; }
.ccu-card > .ccu-grid { height: 100%; }
.ccu-card.ccu-graph-card { height: 100%; }
.ccu-card.panel { padding: 12px; border: var(--ccu-bw) solid var(--ccu-line); border-radius: var(--ccu-r-card); background: var(--ccu-gloss), var(--ccu-surface); box-shadow: var(--ccu-edge), var(--ccu-drop); }
.ccu-title { font-size: 12px; font-weight: 600; letter-spacing: .02em; text-transform: uppercase; color: var(--ccu-muted); margin: 0 2px 8px; }
.ccu-note { margin-top: 8px; padding: 6px 10px; border-radius: 10px; font-size: 11px; line-height: 1.3; color: var(--ccu-alert);
  background: color-mix(in srgb, var(--ccu-alert) 10%, transparent); border: var(--ccu-bw) solid color-mix(in srgb, var(--ccu-alert) 40%, transparent); }

/* ---- grilă ---- */
.ccu-grid { display: grid; gap: var(--ccu-gap); grid-template-columns: repeat(var(--cols, 2), minmax(0, 1fr)); }
@container (min-width: 420px) {
  /* câte coloane încap: cel mult --cols-wide, dar fiecare placă cel puțin --min-tile (m = 140 px) → numele nu se taie */
  .ccu-grid { grid-template-columns: repeat(auto-fill, minmax(max(var(--min-tile, 0px), calc((100% - (var(--cols-wide, var(--cols, 2)) - 1) * var(--ccu-gap)) / var(--cols-wide, var(--cols, 2)))), 1fr)); }
}

/* ---- buton de bază: placă sticloasă cu relief ---- */
.ccu-btn {
  all: unset; box-sizing: border-box; position: relative; cursor: pointer; overflow: hidden;
  display: grid; align-content: center; gap: 2px 12px; min-height: 44px; padding: 10px 12px;
  background: var(--ccu-gloss), var(--ccu-surface); color: var(--ccu-text);
  border: var(--ccu-bw) solid var(--bc, var(--ccu-line)); border-radius: var(--ccu-r);
  box-shadow: var(--ccu-edge), var(--ccu-drop);
  transition: border-color .25s ease, background .25s ease, box-shadow .25s ease, opacity .25s ease, transform .15s ease;
}
.ccu-btn::after { /* reflexie fină în colțul de sus: dă adâncime plăcii */
  content: ""; position: absolute; inset: 0; pointer-events: none; border-radius: inherit;
  background: radial-gradient(90% 70% at 12% -10%, rgba(255,255,255,.10), rgba(255,255,255,0) 60%); opacity: .8;
}
.ccu-btn:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 2px; }
.ccu-btn:active { transform: scale(.985); background: var(--ccu-gloss), var(--ccu-surface-2); }
.ccu-ico { display: grid; place-items: center; color: color-mix(in srgb, var(--ccu-text) 78%, var(--ccu-muted)); width: var(--ico, 26px); height: var(--ico, 26px); transition: color .25s ease, filter .25s ease; flex: none; position: relative; z-index: 1; }
.ccu-ico ha-icon.ccu-hai { --mdc-icon-size: var(--ico, 26px); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: inherit; }
.ccu-ico svg { width: 100%; height: 100%; fill: none; stroke: currentColor; stroke-width: 1.85; stroke-linecap: round; stroke-linejoin: round; overflow: visible; }
/* accent umplut discret în iconițe (geam, lichid, nivel de baterie…): aceeași culoare, opacitate mică, deci dă volum fără să schimbe contrastul */
.ccu-ico svg .fl { fill: currentColor; fill-opacity: .2; }
.ccu-btn[data-state="on"] .ccu-ico svg .fl, .ccu-chip[data-state="on"] .ccu-ico svg .fl, .ccu-nav-item[data-state="on"] .ccu-ico svg .fl { fill-opacity: .34; }
.ccu-name { font-size: 13px; font-weight: 600; line-height: 1.2; color: var(--ccu-text); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; position: relative; z-index: 1; }
.ccu-sec  { font-size: 12px; line-height: 1.15; color: var(--ccu-muted); position: relative; z-index: 1; }

/* forme */
.ccu-btn.chamfer { border-radius: var(--ccu-r); }
.ccu-btn.square  { border-radius: calc(var(--ccu-r) * .6); }
.ccu-btn.round   { border-radius: 50%; aspect-ratio: 1; width: 100%; max-width: 84px; justify-self: center; }
.ccu-btn.pill    { border-radius: 999px; }

/* mărimi ------------------------------------------------------------------------------------------------------- */
.ccu-btn.xs { --ico: 16px; grid-auto-flow: column; justify-content: center; align-items: center; gap: 7px; min-height: 34px; padding: 4px 14px; border-radius: 999px; }
.ccu-btn.xs .ccu-name { font-size: 12px; }
.ccu-btn.s { --ico: 32px; justify-items: center; text-align: center; gap: 4px; padding: 12px 6px 10px; }
.ccu-btn.s .ccu-name { font-size: 12px; font-weight: 500; }
.ccu-btn.s .ccu-sec { font-size: 14px; font-weight: 700; color: var(--ccu-text); }
/* s pe ecrane late (tabletă): devine orizontal, — iconiță stânga, nume mic + valoare */
@container (min-width: 540px) {
  .ccu-btn.s { grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "ico name" "ico sec"; justify-items: start; text-align: left; align-items: center; column-gap: 10px; row-gap: 0; padding: 10px 12px; }
  .ccu-btn.s .ccu-ico { grid-area: ico; } .ccu-btn.s .ccu-name { grid-area: name; align-self: end; font-size: 11.5px; } .ccu-btn.s .ccu-sec { grid-area: sec; align-self: start; font-size: 15px; }
}
/* tabletă: plăci m mai mari (iconiță 30 px, valoare 20 px), nav cu etichete mai mari */
@container (min-width: 540px) {
  .ccu-btn.m { --ico: 36px; column-gap: 14px; min-height: 76px; padding: 12px 16px; }
  .ccu-btn.m .ccu-name { font-size: 13.5px; } .ccu-btn.m .ccu-sec { font-size: 20px; }
  .ccu-nav-item { font-size: 12px; min-height: 58px; } .ccu-nav-item .ccu-ico { --ico: 24px; }
}
/* m = placă orizontală: iconiță stânga, nume + valoare mare dreapta (ca ) */
.ccu-btn.m { --ico: 32px; grid-template-columns: auto minmax(0, 1fr); grid-template-areas: "ico name" "ico sec"; align-items: center; column-gap: 12px; row-gap: 1px; min-height: 66px; padding: 10px 12px; text-align: left; }
.ccu-btn.m .ccu-ico { grid-area: ico; align-self: center; }
.ccu-btn.m .ccu-name { grid-area: name; align-self: end; font-size: 12.5px; }
.ccu-btn.m .ccu-sec  { grid-area: sec; align-self: start; font-size: 19px; font-weight: 600; color: var(--ccu-text); letter-spacing: -.01em; }
.ccu-btn.m.vert { grid-template-columns: 1fr; grid-template-areas: "ico" "name" "sec"; justify-items: start; row-gap: 4px; min-height: 108px; align-content: space-between; padding: 12px; }
.ccu-btn.l { --ico: 28px; grid-template-columns: auto 1fr auto auto; align-items: center; column-gap: 12px; min-height: 56px; padding: 8px 14px; text-align: left; }
.ccu-btn.l .ccu-name { font-size: 14px; }
.ccu-btn.l .ccu-sec { font-size: 15px; font-weight: 600; color: var(--ccu-text); justify-self: end; }
/* xl = erou: titlu, valoare uriașă, indicator de variație, grafic mic */
.ccu-btn.xl { --ico: 30px; grid-template-columns: auto 1fr; grid-template-areas: "ico name" "sec sec" "delta delta"; align-content: start; justify-items: start; row-gap: 8px; min-height: 150px; padding: 16px; }
.ccu-btn.xl .ccu-ico { grid-area: ico; } .ccu-btn.xl .ccu-name { grid-area: name; font-size: 14px; align-self: center; }
.ccu-btn.xl .ccu-sec { grid-area: sec; font-size: 15px; font-weight: 500; color: var(--ccu-muted); }
.ccu-btn.xl .ccu-sec b { font-size: 38px; font-weight: 600; letter-spacing: -.02em; color: var(--ccu-text); margin-right: 4px; }
.ccu-delta { grid-area: delta; position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; height: 26px; padding: 0 12px; border-radius: 999px; font-size: 12.5px; font-weight: 600;
  color: #fff; background: linear-gradient(180deg, color-mix(in srgb, var(--ccu-ok) 62%, transparent), color-mix(in srgb, var(--ccu-ok) 34%, #000 20%));
  border: 1px solid color-mix(in srgb, var(--ccu-ok) 70%, #fff 10%); box-shadow: inset 0 1px 0 rgba(255,255,255,.18); }
.ccu-delta[data-dir="up"] { background: linear-gradient(180deg, color-mix(in srgb, var(--ccu-alert) 60%, transparent), color-mix(in srgb, var(--ccu-alert) 32%, #000 22%)); border-color: color-mix(in srgb, var(--ccu-alert) 70%, #fff 10%); }
.ccu-spark { position: absolute; right: 14px; bottom: 18px; width: 44%; height: 42%; pointer-events: none; overflow: visible; z-index: 1; }
.ccu-spark path { fill: none; stroke: var(--ccu-series); stroke-width: 1.6; vector-effect: non-scaling-stroke; stroke-linejoin: round; stroke-linecap: round; filter: drop-shadow(0 0 3px color-mix(in srgb, var(--ccu-series) 70%, transparent)); }
.ccu-spark .fill { fill: color-mix(in srgb, var(--ccu-series) 14%, transparent); stroke: none; filter: none; }

/* comutator (rând lat cu toggle) */
.ccu-sw { grid-column: 4; position: relative; z-index: 1; width: 44px; height: 26px; border-radius: 999px; background: rgba(148,163,184,.26); border: 1px solid rgba(148,163,184,.3); transition: background .25s ease; flex: none; box-shadow: inset 0 2px 4px rgba(0,0,0,.3); }
.ccu-sw i { position: absolute; top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: linear-gradient(180deg, #fff, #d6deea); box-shadow: 0 1px 3px rgba(0,0,0,.45); transition: transform .25s ease; }
.ccu-btn[data-state="on"] .ccu-sw { background: linear-gradient(180deg, var(--ccu-on), color-mix(in srgb, var(--ccu-on) 70%, #000)); border-color: color-mix(in srgb, var(--ccu-on) 70%, #fff 15%); box-shadow: inset 0 1px 0 rgba(255,255,255,.25), 0 0 10px color-mix(in srgb, var(--ccu-on) 45%, transparent); }
.ccu-btn[data-state="on"] .ccu-sw i { transform: translateX(18px); }

/* ---- stări (derivate din --ccu-on / --ccu-alert: la fel de bogate în orice presetare) ---- */
.ccu-btn[data-state="on"] {
  --bc: color-mix(in srgb, var(--ccu-on) 85%, #fff 5%);
  background: radial-gradient(130% 150% at 0% 0%, color-mix(in srgb, var(--ccu-on) 42%, transparent), color-mix(in srgb, var(--ccu-on) 12%, transparent) 55%, color-mix(in srgb, var(--ccu-on) 4%, transparent)),
    var(--ccu-gloss), color-mix(in srgb, var(--ccu-on) 13%, var(--ccu-bg));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.14), inset 0 0 18px color-mix(in srgb, var(--ccu-on) 20%, transparent), 0 0 18px -2px color-mix(in srgb, var(--ccu-on) 36%, transparent), var(--ccu-drop);
}
.ccu-btn[data-state="on"] .ccu-ico { color: var(--ccu-on-hi); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-on) 55%, transparent)); }
.ccu-btn[data-state="on"] .ccu-sec { color: #fff; } :host([data-theme="light"]) .ccu-btn[data-state="on"] .ccu-sec { color: var(--ccu-text); }
.ccu-btn[data-state="alert"] {
  --bc: color-mix(in srgb, var(--ccu-alert) 60%, transparent);
  background: radial-gradient(130% 150% at 0% 0%, color-mix(in srgb, var(--ccu-alert) 30%, transparent), color-mix(in srgb, var(--ccu-alert) 8%, transparent) 60%, color-mix(in srgb, var(--ccu-alert) 3%, transparent)),
    var(--ccu-gloss), color-mix(in srgb, var(--ccu-alert) 11%, var(--ccu-bg));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.09), 0 0 14px -4px color-mix(in srgb, var(--ccu-alert) 38%, transparent), var(--ccu-drop);
}
.ccu-btn[data-state="alert"] .ccu-ico { color: var(--ccu-alert-hi); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-alert) 45%, transparent)); }
.ccu-btn[data-state="ok"] .ccu-ico { color: var(--ccu-ok); }
.ccu-btn[data-state="unavailable"] { opacity: .45; cursor: default; box-shadow: none; }
.ccu-btn[data-state="unavailable"]::after { display: none; }
.ccu-btn.l[data-state="on"] { --bc: var(--ccu-line); background: var(--ccu-gloss), var(--ccu-surface);
  box-shadow: var(--ccu-edge), var(--ccu-drop); }
.ccu-btn.l[data-state="on"] .ccu-sec { color: var(--ccu-text); }
.ccu-btn.xl[data-state="on"] { background: radial-gradient(120% 130% at 0% 0%, color-mix(in srgb, var(--ccu-on) 34%, transparent), color-mix(in srgb, var(--ccu-on) 14%, transparent) 55%, color-mix(in srgb, var(--ccu-on) 5%, #000 40%)), var(--ccu-gloss), color-mix(in srgb, var(--ccu-on) 14%, var(--ccu-bg)); }
.ccu-btn.xl[data-state="on"] .ccu-sec { color: var(--ccu-muted); }

/* ---- chips ---- */
.ccu-chips { display: flex; flex-wrap: wrap; gap: 8px; }
.ccu-chip { display: inline-flex; align-items: center; gap: 7px; height: 34px; padding: 0 14px; border-radius: 999px; cursor: pointer;
  border: var(--ccu-bw) solid var(--bc, rgba(148,163,184,.30)); background: var(--ccu-gloss), var(--ccu-surface); color: var(--ccu-text);
  font-size: 12.5px; font-weight: 600; box-shadow: var(--ccu-edge), var(--ccu-drop); transition: border-color .25s ease, background .25s ease; }
.ccu-chip .ccu-ico { --ico: 18px; }
.ccu-chip b { font-weight: 700; color: var(--ccu-ok); }
.ccu-chip[data-inactive] { opacity: .45; border-style: dashed; filter: grayscale(.6); }
.ccu-chip[data-state="on"] { --bc: color-mix(in srgb, var(--ccu-on) 72%, transparent);
  background: radial-gradient(140% 160% at 0% 0%, color-mix(in srgb, var(--ccu-on) 26%, transparent), color-mix(in srgb, var(--ccu-on) 6%, transparent) 60%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-on) 12%, var(--ccu-bg)); }
.ccu-chip[data-state="on"] .ccu-ico { color: var(--ccu-on-hi); filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ccu-on) 50%, transparent)); }
.ccu-chip[data-state="alert"] { --bc: color-mix(in srgb, var(--ccu-alert) 72%, transparent);
  background: radial-gradient(140% 160% at 0% 0%, color-mix(in srgb, var(--ccu-alert) 30%, transparent), color-mix(in srgb, var(--ccu-alert) 8%, transparent) 60%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-alert) 11%, var(--ccu-bg)); }
.ccu-chip[data-state="alert"] .ccu-ico { color: var(--ccu-alert-hi); filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ccu-alert) 45%, transparent)); }
.ccu-chip[data-state="ok"] .ccu-ico { color: var(--ccu-ok); }
.ccu-chip[data-state="unavailable"] { opacity: .45; }

/* ---- header (bandă pe un rând) ---- */
.ccu-head { display: flex; align-items: center; gap: 12px; padding: 10px 14px 10px 12px; border: var(--ccu-bw) solid var(--ccu-line); border-radius: var(--ccu-r-card);
  background: var(--ccu-gloss), var(--ccu-surface); box-shadow: var(--ccu-edge), var(--ccu-drop); }
.ccu-head > .ccu-ico { --ico: 30px; color: var(--ccu-c-blue); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-c-blue) 40%, transparent)); }
.ccu-head .vals { flex: 1; min-width: 0; display: flex; align-items: center; white-space: nowrap; overflow: hidden; font-size: 14px; font-weight: 600; }
.ccu-head .vals > span { display: inline-flex; align-items: center; gap: 6px; padding: 0 12px; border-left: var(--ccu-bw) solid var(--ccu-line); }
.ccu-head .vals > span:first-child { border-left: 0; padding-left: 4px; }
.ccu-head .vals .ccu-ico { --ico: 16px; }
.ccu-head .vals > span.has-label { gap: 9px; padding: 0 14px; }
.ccu-head .vals > span.has-label .ccu-ico { --ico: 22px; }
.ccu-head .vals .tx { display: grid; line-height: 1.15; } .ccu-head .vals .tx b { font-size: 13.5px; font-weight: 600; }
.ccu-head .vals .tx small { font-size: 11px; font-weight: 500; color: var(--ccu-muted); } .ccu-head .vals .tx small.rt { font-size: 10.5px; white-space: nowrap; }
.ccu-head .clock { text-align: right; line-height: 1.1; font-size: 22px; font-weight: 600; letter-spacing: -.01em; padding-left: 12px; border-left: var(--ccu-bw) solid var(--ccu-line); }
.ccu-head .clock small { display: block; margin-top: 2px; font-size: 11px; font-weight: 500; color: var(--ccu-muted); letter-spacing: 0; }
.c-accent { color: var(--ccu-c-blue); } .c-on { color: var(--ccu-c-yellow); } .c-alert { color: var(--ccu-c-orange); } .c-ok { color: var(--ccu-c-green); } .c-muted { color: var(--ccu-muted); }

/* ---- meniu jos (ccu-nav-card) ---- */
.ccu-nav { display: grid; grid-auto-flow: column; grid-auto-columns: 1fr; gap: 4px; padding: 6px; border: var(--ccu-bw) solid var(--ccu-line); border-radius: 20px;
  background: var(--ccu-gloss), var(--ccu-surface); box-shadow: var(--ccu-edge), var(--ccu-drop); }
.ccu-nav-item { all: unset; box-sizing: border-box; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; display: grid; justify-items: center; align-content: center; gap: 4px; min-height: 54px; padding: 6px 2px;
  border-radius: 14px; border: var(--ccu-bw) solid transparent; color: var(--ccu-muted); font-size: 11px; font-weight: 500; transition: background .25s ease, border-color .25s ease, color .25s ease; }
.ccu-nav-item .ccu-ico { --ico: 24px; color: var(--ccu-text); position: relative; overflow: visible; }
.ccu-badge { position: absolute; top: -7px; right: -11px; min-width: 17px; height: 17px; padding: 0 4px; box-sizing: border-box; border-radius: 9px; display: grid; place-items: center;
  background: var(--ccu-c-red); color: #fff; font: 700 11px/1 inherit; box-shadow: 0 0 0 2px var(--ccu-bg), 0 0 10px color-mix(in srgb, var(--ccu-c-red) 60%, transparent); }
.ccu-nav-item[data-state="alert"] { color: var(--ccu-alert-hi); border-color: color-mix(in srgb, var(--ccu-alert) 60%, transparent);
  background: radial-gradient(130% 150% at 50% 0%, color-mix(in srgb, var(--ccu-alert) 30%, transparent), color-mix(in srgb, var(--ccu-alert) 8%, transparent) 65%), color-mix(in srgb, var(--ccu-alert) 11%, var(--ccu-bg));
  box-shadow: inset 0 0 12px color-mix(in srgb, var(--ccu-alert) 16%, transparent), 0 0 14px -4px color-mix(in srgb, var(--ccu-alert) 38%, transparent); }
.ccu-nav-item[data-state="alert"] .ccu-ico { color: var(--ccu-alert-hi); filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ccu-alert) 45%, transparent)); }
.ccu-badge.lit { background: var(--ccu-c-yellow); color: #1c1500; box-shadow: 0 0 0 2px var(--ccu-bg), 0 0 10px color-mix(in srgb, var(--ccu-c-yellow) 60%, transparent); }
.ccu-nav-item[data-state="lit"] { color: var(--ccu-c-yellow); border-color: color-mix(in srgb, var(--ccu-c-yellow) 55%, transparent);
  background: radial-gradient(130% 150% at 50% 0%, color-mix(in srgb, var(--ccu-c-yellow) 26%, transparent), color-mix(in srgb, var(--ccu-c-yellow) 7%, transparent) 65%), color-mix(in srgb, var(--ccu-c-yellow) 9%, var(--ccu-bg));
  box-shadow: inset 0 0 12px color-mix(in srgb, var(--ccu-c-yellow) 14%, transparent), 0 0 14px -4px color-mix(in srgb, var(--ccu-c-yellow) 34%, transparent); }
.ccu-nav-item[data-state="lit"] .ccu-ico { color: var(--ccu-c-yellow); filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ccu-c-yellow) 45%, transparent)); }
.ccu-nav-item:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 1px; }
.ccu-nav-item[data-state="on"] { color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 72%, transparent);
  background: radial-gradient(130% 150% at 50% 0%, color-mix(in srgb, var(--ccu-on) 32%, transparent), color-mix(in srgb, var(--ccu-on) 8%, transparent) 65%), color-mix(in srgb, var(--ccu-on) 13%, var(--ccu-bg));
  box-shadow: inset 0 0 14px color-mix(in srgb, var(--ccu-on) 18%, transparent), 0 0 14px -3px color-mix(in srgb, var(--ccu-on) 38%, transparent); }
.ccu-nav-item[data-state="on"] .ccu-ico { color: var(--ccu-on-hi); filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ccu-on) 55%, transparent)); }

/* meniu jos „sticky”: fix pe ecran; un spațiu în pagină rezervă locul. Gazda nu mai e container (altfel Safari ar lega „fixed” de gazdă). */
:host([data-sticky]) { container-type: normal; }
.ccu-nav-spacer { height: 78px; }
/* capsulă compactă (ex. Înapoi · Tableta · Home) și varianta doar cu iconițe */
.ccu-nav.compact { display: inline-grid; grid-auto-columns: minmax(66px, auto); width: auto; }
.ccu-nav.nolabels .ccu-nav-item { min-height: 46px; min-width: 52px; }
.ccu-nav-fixed .ccu-nav.compact { width: auto; max-width: none; }
.ccu-nav-fixed { position: fixed; left: 0; right: 0; bottom: 0; z-index: 5; display: flex; justify-content: center; pointer-events: none;
  padding: 8px 12px calc(10px + env(safe-area-inset-bottom, 0px)); }
.ccu-nav-fixed .ccu-nav { pointer-events: auto; width: 100%; max-width: 640px; background: var(--ccu-gloss), var(--ccu-surface); box-shadow: var(--ccu-edge), 0 -8px 26px rgba(0,0,0,.5), 0 10px 20px -12px rgba(0,0,0,.8); }

/* ---- grafic ---- */
.ccu-graph { display: block; width: 100%; height: auto; touch-action: pan-y; }
.ccu-graph .area { fill: color-mix(in srgb, var(--sc, var(--ccu-series)) 15%, transparent); stroke: none; }
.ccu-graph .line { fill: none; stroke: var(--sc, var(--ccu-series)); stroke-width: 2; stroke-linejoin: round; stroke-linecap: round; filter: drop-shadow(0 0 4px color-mix(in srgb, var(--sc, var(--ccu-series)) 60%, transparent)); }
.ccu-graph.timeline .trk { fill: color-mix(in srgb, var(--ccu-muted) 14%, transparent); stroke: none; } .ccu-graph.timeline .on { fill: var(--sc, var(--ccu-on)); opacity: .9; filter: drop-shadow(0 0 4px color-mix(in srgb, var(--sc, var(--ccu-on)) 50%, transparent)); } .ccu-graph.timeline .ln { fill: var(--ccu-text); font-size: 11.5px; } .ccu-graph.timeline .na { stroke: color-mix(in srgb, var(--ccu-c-yellow) 55%, transparent); stroke-width: 1; } .ccu-graph.timeline .dur { fill: var(--ccu-bg); font-size: 10.5px; font-weight: 700; } .ccu-graph.timeline .tot { fill: var(--ccu-muted); font-size: 11px; }
.ccu-graph .dot { fill: var(--ccu-bg); stroke: var(--sc, var(--ccu-series)); stroke-width: 2; }
.ccu-graph-wrap { position: relative; }
.ccu-graph-head { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 6px 8px; margin-bottom: 6px; }
.ccu-graph-head .ccu-title { margin: 0; text-transform: none; font-size: 14px; letter-spacing: 0; color: var(--ccu-text); }
.ccu-tabs { display: flex; gap: 6px; flex: none; }
.ccu-tab { all: unset; cursor: pointer; box-sizing: border-box; height: 26px; padding: 0 12px; display: inline-flex; align-items: center; border-radius: 999px; font-size: 12px; font-weight: 600;
  color: var(--ccu-muted); border: var(--ccu-bw) solid var(--ccu-line); background: var(--ccu-surface); white-space: nowrap; }
.ccu-tab[data-state="on"] { color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 70%, transparent); background: color-mix(in srgb, var(--ccu-on) 18%, var(--ccu-bg)); }
.ccu-tab:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 2px; }
.ccu-graph-head.compact { flex-wrap: nowrap; } .ccu-graph-head.compact .ccu-legend { margin: 0 auto 0 6px; }
.ccu-legend { display: flex; flex-wrap: wrap; gap: 4px 14px; margin-top: 8px; font-size: 11.5px; color: var(--ccu-muted); }
.ccu-legend span { display: inline-flex; align-items: center; gap: 6px; } .ccu-legend i { width: 14px; height: 3px; border-radius: 2px; }
.ccu-tip { position: absolute; top: 0; transform: translateX(-50%); pointer-events: none; padding: 3px 9px; border-radius: 8px; font-size: 11.5px; font-weight: 600; white-space: nowrap; z-index: 2;
  color: var(--ccu-text); background: var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-drop); }
.ccu-tip[hidden] { display: none; }
.ccu-graph-msg { display: grid; place-items: center; font-size: 12px; color: var(--ccu-muted); }
.ccu-graph .axis { stroke: var(--ccu-line); stroke-width: 1; }
.ccu-graph .grid { stroke: var(--ccu-line); stroke-width: 1; stroke-dasharray: 2 4; opacity: .9; }
.ccu-graph .cursor { stroke: var(--ccu-muted); stroke-width: 1; }
.ccu-graph text { fill: var(--ccu-muted); font-size: 10px; font-family: var(--ccu-font); }

/* ---- climate: culoarea după mod (răcire = albastru, încălzire = roșu; auto/rest = culoarea obișnuită de „activ”) ---- */
.ccu-btn[data-mode="cool"][data-state="on"], .ccu-chip[data-mode="cool"][data-state="on"], .ccu-nav-item[data-mode="cool"][data-state="on"] {
  --bc: color-mix(in srgb, var(--ccu-cool) 82%, transparent);
  background: radial-gradient(130% 150% at 0% 0%, color-mix(in srgb, var(--ccu-cool) 38%, transparent), color-mix(in srgb, var(--ccu-cool) 10%, transparent) 60%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-cool) 13%, var(--ccu-bg));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 16px -3px color-mix(in srgb, var(--ccu-cool) 42%, transparent), var(--ccu-drop); }
.ccu-btn[data-mode="heat"][data-state="on"], .ccu-chip[data-mode="heat"][data-state="on"], .ccu-nav-item[data-mode="heat"][data-state="on"] {
  --bc: color-mix(in srgb, var(--ccu-heat) 82%, transparent);
  background: radial-gradient(130% 150% at 0% 0%, color-mix(in srgb, var(--ccu-heat) 34%, transparent), color-mix(in srgb, var(--ccu-heat) 9%, transparent) 60%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-heat) 12%, var(--ccu-bg));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.12), 0 0 16px -3px color-mix(in srgb, var(--ccu-heat) 42%, transparent), var(--ccu-drop); }
.ccu-btn[data-mode="cool"][data-state="on"] .ccu-ico, .ccu-chip[data-mode="cool"][data-state="on"] .ccu-ico { color: var(--ccu-cool-hi); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-cool) 55%, transparent)); }
.ccu-btn[data-mode="heat"][data-state="on"] .ccu-ico, .ccu-chip[data-mode="heat"][data-state="on"] .ccu-ico { color: var(--ccu-heat-hi); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-heat) 55%, transparent)); }
.ccu-ico .rot { transform-box: fill-box; transform-origin: 50% 50%; }

/* culoarea iconiței (icon_color), în orice stare — după stări, ca să le bată */
.ccu-btn[data-ic="green"] .ccu-ico, .ccu-chip[data-ic="green"] .ccu-ico { color: var(--ccu-c-green); }
.ccu-btn[data-ic="yellow"] .ccu-ico, .ccu-chip[data-ic="yellow"] .ccu-ico { color: var(--ccu-c-yellow); }
.ccu-btn[data-ic="orange"] .ccu-ico, .ccu-chip[data-ic="orange"] .ccu-ico { color: var(--ccu-c-orange); }
.ccu-btn[data-ic="blue"] .ccu-ico, .ccu-chip[data-ic="blue"] .ccu-ico { color: var(--ccu-c-blue); }
.ccu-btn[data-ic="cyan"] .ccu-ico, .ccu-chip[data-ic="cyan"] .ccu-ico { color: var(--ccu-c-cyan); }
.ccu-btn[data-ic="red"] .ccu-ico, .ccu-chip[data-ic="red"] .ccu-ico { color: var(--ccu-c-red); }
.ccu-btn[data-ic="white"] .ccu-ico, .ccu-chip[data-ic="white"] .ccu-ico { color: var(--ccu-c-white); }
.ccu-btn[data-ic] .ccu-ico, .ccu-chip[data-ic] .ccu-ico { filter: drop-shadow(0 0 6px color-mix(in srgb, currentColor 40%, transparent)); }

/* ---- persoane: avatare suprapuse ---- */
.ccu-chip.ccu-people { padding: 0 14px 0 5px; gap: 8px; cursor: default; }
.ccu-people .av-stack { display: inline-flex; }
.ccu-people .av { width: 26px; height: 26px; border-radius: 50%; margin-left: -8px; display: grid; place-items: center; overflow: hidden; cursor: pointer; flex: none;
  font-size: 10.5px; font-weight: 700; color: var(--ccu-text); background: var(--ccu-surface-2); border: 2px solid var(--ccu-ok); box-shadow: 0 0 0 2px var(--ccu-surface), 0 0 8px color-mix(in srgb, var(--ccu-ok) 40%, transparent); }
.ccu-people .av:first-child { margin-left: 0; }
.ccu-people .av[data-home="0"] { border-color: rgba(148,163,184,.5); box-shadow: 0 0 0 2px var(--ccu-surface); color: var(--ccu-muted); }
.ccu-people .av[data-home="0"] img { filter: grayscale(.85); opacity: .75; }
.ccu-people .av img { width: 100%; height: 100%; object-fit: cover; display: block; }

/* ---- „Familia”: avatare mari, se micșorează după lățimea cardului (nu se mai suprapun) ---- */
.ccu-family { padding: 14px 14px 12px; }
.ccu-family .fm-head { display: flex; align-items: center; gap: 8px; margin: 0 2px 12px; font-size: 12px; font-weight: 600; letter-spacing: .04em; color: var(--ccu-muted); }
.ccu-family .fm-head i { width: 7px; height: 7px; border-radius: 50%; background: var(--ccu-muted); flex: none; }
.ccu-family .fm-head:not([data-n="0"]) { color: var(--ccu-text); } .ccu-family .fm-head:not([data-n="0"]) i { background: var(--ccu-ok); box-shadow: 0 0 8px var(--ccu-ok); }
.ccu-family .fm-row { display: grid; grid-template-columns: repeat(var(--n, 3), minmax(0, 1fr)); gap: 6px; }
.fm { display: grid; justify-items: center; gap: 3px; padding: 4px 0 2px; cursor: pointer; min-width: 0; --av: clamp(40px, calc((100cqw - 28px - (var(--n, 3) - 1) * 6px) / var(--n, 3) - 12px), 76px); }
.fm .av2 { position: relative; width: var(--av); height: var(--av); border-radius: 50%; display: grid; place-items: center; font-size: calc(var(--av) * .3); font-weight: 700; color: var(--ccu-text);
  background: linear-gradient(145deg, var(--ccu-surface-2), var(--ccu-surface)); border: 2px solid var(--ccu-ok); padding: 2px; box-sizing: border-box;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--ccu-ok) 16%, transparent), 0 6px 18px -6px color-mix(in srgb, var(--ccu-ok) 55%, transparent); }
.fm .av2 img { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; display: block; }
.fm .av2 .pres { position: absolute; right: -1px; bottom: -1px; width: calc(var(--av) * .24); height: calc(var(--av) * .24); min-width: 11px; min-height: 11px; border-radius: 50%; background: var(--ccu-ok); border: 2.5px solid var(--ccu-surface); box-sizing: border-box; box-shadow: 0 0 8px color-mix(in srgb, var(--ccu-ok) 70%, transparent); }
.fm[data-home="0"] .av2 { border-color: rgba(148,163,184,.4); color: var(--ccu-muted); box-shadow: none; } .fm[data-home="0"] .av2 img { filter: grayscale(.9); opacity: .7; }
.fm[data-home="0"] .av2 .pres { background: #64748b; box-shadow: none; }
.fm .nm { font-size: 13.5px; font-weight: 650; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fm .stt { font-size: 11.5px; color: var(--ccu-muted); max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .fm[data-home="1"] .stt { color: var(--ccu-ok); }
/* ---- baterii dispozitive ---- */
.ccu-batts .rows { display: grid; gap: 4px; }
.br { display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(64px, 34%) auto; align-items: center; gap: 10px; padding: 7px 2px; cursor: pointer; border-bottom: var(--ccu-bw) solid var(--ccu-line); }
.br:last-child { border-bottom: 0; }
.br .ccu-ico { --ico: 22px; color: var(--ccu-ok); } .br .nm { font-size: 13px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.br .bar { height: 6px; border-radius: 3px; background: rgba(148,163,184,.22); overflow: hidden; } .br .bar i { display: block; height: 100%; border-radius: 3px; background: var(--ccu-ok); transition: width .6s ease; }
.br b { min-width: 42px; text-align: right; font-size: 13px; font-weight: 600; }
.br[data-lvl="warn"] .ccu-ico { color: var(--ccu-alert-hi); } .br[data-lvl="warn"] .bar i { background: var(--ccu-alert); }
.br[data-lvl="low"] .ccu-ico { color: var(--ccu-c-red); } .br[data-lvl="low"] .bar i { background: var(--ccu-c-red); }
.br[data-lvl="na"] { opacity: .5; }
.ccu-scene[data-id] { cursor: pointer; }

/* ---- flux energie (ccu-flow-card) ---- */
.ccu-flow-sun { display: flex; flex-wrap: wrap; gap: 2px 16px; margin: -3px 2px 8px; font-size: 12.5px; color: var(--ccu-muted); } .ccu-flow-sun .s { display: inline-flex; align-items: center; gap: 6px; } .ccu-flow-sun .ccu-ico { --ico: 16px; color: var(--ccu-c-yellow); } .ccu-flow-sun b { color: var(--ccu-text); font-weight: 600; }
.ccu-flow-head { display: flex; align-items: baseline; gap: 6px; margin: 0 2px 8px; font-size: 15px; font-weight: 600; } .ccu-flow-head .tt { color: var(--ccu-muted); font-weight: 500; }
.ccu-flow-body { position: relative; }
.ccu-flow-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.ccu-flow-svg .rb { stroke: none; filter: drop-shadow(0 0 5px color-mix(in srgb, var(--ccu-on) 25%, transparent)); }
.ccu-flow-svg .pulse { fill: none; stroke: rgba(255,255,255,.6); stroke-width: 1.3; stroke-dasharray: 1 9; stroke-linecap: round; }
.ccu-flow-svg .hub-ring { fill: color-mix(in srgb, var(--ccu-on) 14%, var(--ccu-bg)); stroke: color-mix(in srgb, var(--ccu-on) 85%, #fff 5%); stroke-width: 2; filter: drop-shadow(0 0 10px color-mix(in srgb, var(--ccu-on) 55%, transparent)); }
.ccu-fi { position: absolute; transform: translateY(-50%); display: flex; align-items: center; gap: 8px; cursor: pointer; min-width: 0; }
.ccu-fi.left { left: 0; } .ccu-fi.right { right: 0; justify-content: flex-end; text-align: right; }
.ccu-fi .ccu-ico { --ico: 26px; }
.ccu-fi .xl { display: block; font-size: 11.5px; line-height: 1.25; color: var(--ccu-muted); white-space: nowrap; } .ccu-fi .xl i { font-style: normal; font-size: 10px; margin-left: 4px; opacity: .8; }
.ccu-fi .xl em { font-style: normal; font-weight: 700; margin-right: 3px; } .ccu-fi .xl em[data-a="in"] { color: var(--ccu-c-blue); } .ccu-fi .xl em[data-a="out"] { color: var(--ccu-c-green); }
.tx { display: grid; line-height: 1.18; min-width: 0; } .tx b { font-size: 13px; font-weight: 600; } .tx .v { font-size: 13px; color: var(--ccu-text); white-space: nowrap; } .tx .v i { font-style: normal; font-size: 11px; color: var(--ccu-muted); }
.ccu-fi.dim, .ccu-fi[data-dir="na"] { opacity: .5; }
.ccu-hub { position: absolute; transform: translate(-50%, -50%); display: grid; place-items: center; width: 84px; text-align: center; pointer-events: none; gap: 1px; }
.ccu-hub .ccu-ico { --ico: 18px; color: var(--ccu-on-hi); } .ccu-hub small { font-size: 10.5px; color: var(--ccu-muted); } .ccu-hub b { font-size: 14px; font-weight: 700; white-space: nowrap; }
.ccu-flow-stats { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); margin-top: 12px; padding-top: 10px; border-top: var(--ccu-bw) solid var(--ccu-line); }
.ccu-flow-stats .st { display: flex; align-items: center; gap: 8px; padding: 0 10px; border-left: var(--ccu-bw) solid var(--ccu-line); cursor: pointer; } .ccu-flow-stats .st:first-child { border-left: 0; padding-left: 2px; }
.ccu-flow-stats .st small { font-size: 11px; color: var(--ccu-muted); } .ccu-flow-stats .st b { font-size: 13px; }
.ccu-flow-stats .ccu-ico { --ico: 22px; }
@container (max-width: 520px) { .ccu-flow-stats[data-n="4"] { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 10px; } .ccu-flow-stats .st:nth-child(odd) { border-left: 0; padding-left: 2px; } }
@container (max-width: 380px) { .ccu-flow-stats[data-n="3"] { grid-auto-flow: row; grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 10px; } .ccu-flow-stats .st:nth-child(odd) { border-left: 0; padding-left: 2px; } }
/* baterie (ccu-battery-card) */
.ccu-bat { cursor: pointer; }
.ccu-bat[data-state="backup"] { border-color: color-mix(in srgb, var(--ccu-c-red) 60%, transparent); background: radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, var(--ccu-c-red) 20%, transparent), transparent 60%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-c-red) 8%, var(--ccu-surface)); }
.ccu-bat-head { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 12px; } .ccu-bat-head .ccu-ico { --ico: 22px; color: var(--ccu-c-blue); }
.ccu-bat-head.backup { color: #ff9a82; } .ccu-bat-head.backup .ccu-ico { color: var(--ccu-c-red); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-c-red) 60%, transparent)); }
.ccu-bat-body { display: flex; align-items: center; gap: 16px; }
.ccu-bat-shell { position: relative; flex: 0 0 54%; height: 58px; border-radius: 13px; border: 2px solid rgba(255,255,255,.28); background: rgba(0,0,0,.3); box-shadow: inset 0 2px 8px rgba(0,0,0,.55); }
.ccu-bat-shell::after { content: ""; position: absolute; right: -9px; top: 17px; width: 6px; height: 20px; border-radius: 0 4px 4px 0; background: rgba(255,255,255,.28); }
.ccu-bat-shell .fill { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 10px; min-width: 0; box-shadow: inset 0 1px 0 rgba(255,255,255,.4), inset 0 -8px 12px -8px rgba(0,0,0,.35), 0 0 16px -2px rgba(246,195,67,.4); transition: width .6s ease; }
.ccu-bat-shell[data-state="backup"] .fill { box-shadow: inset 0 1px 0 rgba(255,255,255,.3), 0 0 16px -2px rgba(244,105,75,.55); }
.ccu-bat-shell .pct { position: absolute; inset: 0; display: grid; place-items: center; font-size: 24px; font-weight: 700; color: #fff; text-shadow: 0 1px 4px rgba(0,0,0,.6); }
.ccu-bat-info { display: grid; gap: 6px; font-size: 13px; min-width: 0; } .ccu-bat-info .a { color: var(--ccu-muted); } .ccu-bat-info .a b { color: var(--ccu-text); font-weight: 600; } .ccu-bat-info .e { white-space: nowrap; } .ccu-bat-info .u, .ccu-bat-info .a, .ccu-bat-info .d { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; } .ccu-bat-info i { font-style: normal; } .ccu-bat-info b { white-space: nowrap; } .ccu-bat-info .u, .ccu-bat-info .d { color: var(--ccu-muted); } .ccu-bat-info .u b, .ccu-bat-info .d b { color: var(--ccu-text); font-weight: 600; } .ccu-bat-info .d { font-size: 12px; }
.ccu-bat-slider { position: relative; margin: 20px 10px 58px; }
.ccu-bat-slider .tr { height: 4px; border-radius: 2px; background: rgba(148,163,184,.26); } .ccu-bat-slider .fl { height: 100%; border-radius: 2px; background: var(--ccu-c-yellow); box-shadow: 0 0 8px color-mix(in srgb, var(--ccu-c-yellow) 50%, transparent); }
.ccu-bat-slider .mk { position: absolute; top: -4px; transform: translateX(-50%); display: grid; justify-items: center; }
.ccu-bat-slider .mk i { width: 11px; height: 11px; border-radius: 50%; border: 2px solid var(--ccu-bg); box-shadow: 0 0 8px currentColor; }
.ccu-bat-slider .mk .lb { display: grid; justify-items: center; margin-top: 6px; transform: translateX(var(--sh, 0)); }
.ccu-bat-slider .mk b { font-size: 11.5px; font-weight: 600; } .ccu-bat-slider .mk small { font-size: 10px; line-height: 1.15; color: var(--ccu-muted); max-width: 54px; text-align: center; }

/* ---- vreme (ccu-weather-card): scenă animată + tile-uri Ecowitt + prognoză ---- */
.ccu-wx-top { display: grid; gap: 12px; grid-template-columns: minmax(0, 1fr); }
.ccu-scene { --sky: linear-gradient(180deg, #2f6fae, #1b3f6b); position: relative; overflow: hidden; border-radius: 16px; height: 232px; container-type: size; isolation: isolate;
  background: var(--sky); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge), var(--ccu-drop); }
.ccu-scene[data-sky="partly"] { --sky: linear-gradient(180deg, #3d6a9a, #243f5e); }
.ccu-scene[data-sky="cloudy"] { --sky: linear-gradient(180deg, #4b5d73, #2a3646); }
.ccu-scene[data-sky="fog"] { --sky: linear-gradient(180deg, #5a6776, #38424f); }
.ccu-scene[data-precip="rain"] { --sky: linear-gradient(180deg, #34465c, #1b2636); }
.ccu-scene[data-precip="sleet"] { --sky: linear-gradient(180deg, #46586d, #263342); }
.ccu-scene[data-precip="snow"] { --sky: linear-gradient(180deg, #566a80, #2c3a4b); }
.ccu-scene[data-bolt="1"] { --sky: linear-gradient(180deg, #2a3042, #131827); }
.ccu-scene[data-night="1"][data-sky="clear"][data-precip="none"] { --sky: linear-gradient(180deg, #0b1633, #0b1220); }
.ccu-scene[data-night="1"][data-sky="partly"][data-precip="none"] { --sky: linear-gradient(180deg, #14203b, #0d1424); }
.ccu-scene[data-night="1"][data-sky="cloudy"], .ccu-scene[data-night="1"][data-precip="rain"], .ccu-scene[data-night="1"][data-precip="sleet"], .ccu-scene[data-night="1"][data-precip="snow"] { --sky: linear-gradient(180deg, #202a3b, #111723); }
.ccu-scene .sun, .ccu-scene .moon, .ccu-scene .stars, .ccu-scene .fog, .ccu-scene .rain, .ccu-scene .snow, .ccu-scene .windl, .ccu-scene .flash { display: none; position: absolute; pointer-events: none; }
.ccu-scene .stars, .ccu-scene .fog, .ccu-scene .rain, .ccu-scene .snow, .ccu-scene .windl, .ccu-scene .flash, .ccu-scene .clouds { inset: 0; }
.ccu-scene .clouds { position: absolute; pointer-events: none; z-index: 1; }
.ccu-scene .rain, .ccu-scene .snow, .ccu-scene .windl { z-index: 2; }
.ccu-scene .flash { z-index: 3; background: #cfe0ff; opacity: 0; }
/* soare / lună / stele */
.ccu-scene .sun { top: 12%; right: 14%; width: 62px; height: 62px; z-index: 1; }
.ccu-scene .sun i { display: block; width: 100%; height: 100%; border-radius: 50%; background: radial-gradient(circle at 35% 35%, #fff6c2, #ffd24f 55%, #f59e0b); box-shadow: 0 0 38px 12px rgba(255,200,70,.45); }
.ccu-scene .sun::before { content: ""; position: absolute; inset: -34px; border-radius: 50%; background: repeating-conic-gradient(rgba(255,214,102,.55) 0 5deg, transparent 5deg 22deg);
  -webkit-mask: radial-gradient(circle, transparent 36%, #000 40%, transparent 68%); mask: radial-gradient(circle, transparent 36%, #000 40%, transparent 68%); }
.ccu-scene[data-sky="clear"][data-night="0"][data-precip="none"] .sun, .ccu-scene[data-sky="partly"][data-night="0"][data-precip="none"] .sun { display: block; }
.ccu-scene .moon { top: 14%; right: 16%; width: 44px; height: 44px; border-radius: 50%; box-shadow: inset -13px -3px 0 0 #eef3ff; transform: rotate(-22deg); filter: drop-shadow(0 0 12px rgba(200,215,255,.5)); z-index: 1; }
.ccu-scene[data-night="1"][data-precip="none"][data-sky="clear"] :is(.moon, .stars), .ccu-scene[data-night="1"][data-precip="none"][data-sky="partly"] :is(.moon, .stars) { display: block; }
.ccu-scene .stars i { position: absolute; left: var(--x); top: var(--y); width: calc(1.4px + var(--s) * 1.8px); height: calc(1.4px + var(--s) * 1.8px); border-radius: 50%; background: #fff; opacity: .8; }
/* nori */
.ccu-scene .clouds i { position: absolute; top: var(--y); left: 0; width: var(--w); height: 0; padding-bottom: calc(var(--w) * .26); border-radius: 999px; background: rgba(255,255,255,.2); filter: blur(7px); opacity: var(--o); transform: translateX(-110%); }
.ccu-scene[data-sky="clear"] .clouds i { display: none; }
.ccu-scene[data-sky="partly"] .clouds i:nth-child(n+3) { display: none; }
.ccu-scene:is([data-sky="cloudy"], [data-precip="rain"], [data-precip="sleet"], [data-precip="snow"], [data-bolt="1"]) .clouds i { background: rgba(26,36,52,.5); }
.ccu-scene[data-sky="partly"] .clouds i { transform: translateX(30%); }
.ccu-scene:is([data-sky="cloudy"], [data-sky="fog"]) .clouds i { transform: translateX(20%); }
/* ceață */
.ccu-scene[data-sky="fog"] .fog { display: block; z-index: 1; }
.ccu-scene .fog i { position: absolute; left: -20%; width: 140%; height: 24%; background: linear-gradient(90deg, transparent, rgba(225,233,242,.38), transparent); filter: blur(9px); }
.ccu-scene .fog i:nth-child(1) { top: 28%; } .ccu-scene .fog i:nth-child(2) { top: 48%; } .ccu-scene .fog i:nth-child(3) { top: 68%; }
/* ploaie / lapoviță */
.ccu-scene:is([data-precip="rain"], [data-precip="sleet"]) .rain { display: block; }
.ccu-scene .rain i { position: absolute; top: -16%; left: var(--x); width: 1.6px; height: calc(13px + var(--s) * 15px); border-radius: 1px; background: linear-gradient(to bottom, rgba(190,222,255,0), rgba(190,222,255,.85)); transform: rotate(var(--lean, 0deg)); }
.ccu-scene[data-int="1"][data-precip="rain"] .rain i:nth-child(n+15), .ccu-scene[data-int="2"][data-precip="rain"] .rain i:nth-child(n+28) { display: none; }
.ccu-scene[data-precip="sleet"] .rain i:nth-child(n+13) { display: none; }
/* ninsoare / lapoviță */
.ccu-scene:is([data-precip="snow"], [data-precip="sleet"]) .snow { display: block; }
.ccu-scene .snow i { position: absolute; top: -8%; left: var(--x); width: calc(3px + var(--s) * 3.5px); height: calc(3px + var(--s) * 3.5px); border-radius: 50%; background: #fff; opacity: calc(.55 + var(--s) * .4); box-shadow: 0 0 4px rgba(255,255,255,.6); }
.ccu-scene[data-int="1"][data-precip="snow"] .snow i:nth-child(n+11), .ccu-scene[data-int="2"][data-precip="snow"] .snow i:nth-child(n+21) { display: none; }
.ccu-scene[data-precip="sleet"] .snow i:nth-child(n+15) { display: none; }
/* vânt: dungi care traversează scena; număr după intensitate */
.ccu-scene:is([data-wind="1"], [data-wind="2"], [data-wind="3"]) .windl { display: block; }
.ccu-scene .windl i { position: absolute; left: 0; top: var(--y); width: calc(26px + var(--s) * 44px); height: 1.6px; border-radius: 2px; background: linear-gradient(90deg, transparent, rgba(255,255,255,.6), transparent); opacity: 0; }
.ccu-scene[data-wind="1"] .windl i:nth-child(n+4), .ccu-scene[data-wind="2"] .windl i:nth-child(n+7) { display: none; }
/* furtună */
.ccu-scene[data-bolt="1"] .flash { display: block; }
/* text peste scenă */
.ccu-scene .base { position: absolute; left: 0; right: 0; bottom: 0; z-index: 4; display: flex; flex-direction: column; gap: 9px; padding: 0 10px 10px 16px; }
.ccu-scene .info { position: static; z-index: 4; color: #fff; text-shadow: 0 1px 8px rgba(0,0,0,.5); }
.ccu-scene .info .t { font-size: 46px; font-weight: 600; line-height: 1; letter-spacing: -.02em; } .ccu-scene .info sup { font-size: 16px; font-weight: 500; margin-left: 3px; vertical-align: top; opacity: .85; }
.ccu-scene .info .t.na { font-size: 30px; font-weight: 500; letter-spacing: .08em; opacity: .55; line-height: 1.2; }
.ccu-scene .info .c { font-size: 14.5px; font-weight: 600; margin-top: 7px; } .ccu-scene .info .f { font-size: 11.5px; opacity: .85; margin-top: 2px; min-height: 1em; }
/* tile-uri cu valorile stației */
/* tile-urile stației = chips mici peste scenă, jos (umiditate, vânt, ploaie, presiune, UV, radiație) */
.ccu-scene .wx-chips { display: flex; flex-wrap: wrap; gap: 5px; margin-left: -6px; }
.wt { display: inline-flex; align-items: center; gap: 7px; padding: 4px 11px 4px 8px; border-radius: 999px; cursor: pointer; color: #fff; border: 1px solid rgba(255,255,255,.16); background: rgba(8,14,26,.5); box-shadow: 0 2px 8px -2px rgba(0,0,0,.5); }
.wt .ccu-ico { --ico: 15px; margin-right: 1px; } .wt .ccu-ico svg { overflow: hidden; } .wt .tx b { font-size: 12.5px; font-weight: 600; white-space: nowrap; }
.wt[data-lvl="warn"] { border-color: color-mix(in srgb, var(--ccu-alert) 60%, transparent); } .wt[data-lvl="warn"] .ccu-ico { color: var(--ccu-alert-hi); }
.wt[data-lvl="active"] { border-color: color-mix(in srgb, var(--ccu-c-cyan) 60%, transparent); } .wt[data-lvl="active"] .ccu-ico { color: var(--ccu-c-cyan); }
.wt[data-na="1"] { opacity: .55; }
/* prognoza pe zile */
.ccu-wx-days { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 8px; margin-top: 12px; }
.wd { display: grid; justify-items: center; align-content: start; gap: 3px; padding: 10px 4px 9px; border-radius: 14px; text-align: center; cursor: pointer; border: var(--ccu-bw) solid var(--ccu-line); background: var(--ccu-gloss), var(--ccu-surface); box-shadow: var(--ccu-edge), var(--ccu-drop); min-width: 0; }
.wd[data-today="1"] { border-color: color-mix(in srgb, var(--ccu-on) 55%, transparent); background: radial-gradient(130% 120% at 50% 0%, color-mix(in srgb, var(--ccu-on) 22%, transparent), transparent 70%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-on) 9%, var(--ccu-surface)); }
.wd .dn { font-size: 12px; font-weight: 600; color: var(--ccu-text); } .wd .wi { --ico: 36px; margin: 2px 0; } .wd .hi { font-size: 18px; font-weight: 600; letter-spacing: -.01em; } .wd .lo { font-size: 13px; color: var(--ccu-muted); min-height: 1.2em; }
.wd .cn { font-size: 10.5px; color: var(--ccu-muted); line-height: 1.15; min-height: 2.3em; display: grid; align-items: center; }
.wd .pp, .wd .ws { display: inline-flex; align-items: center; gap: 3px; font-size: 10.5px; color: var(--ccu-muted); white-space: nowrap; min-height: 1.2em; }
.wd .pp .ccu-ico { --ico: 11px; color: var(--ccu-c-cyan); } .wd .ws .ccu-ico { --ico: 11px; color: var(--ccu-muted); }
.wd-empty { grid-column: 1 / -1; padding: 14px; text-align: center; font-size: 12px; color: var(--ccu-muted); }
@container (max-width: 420px) { .wd .cn { display: none; } .wd .pp, .wd .ws { font-size: 9.5px; } .ccu-scene .info .t { font-size: 40px; } }

/* ---- carduri înguste (coloane de ~300 px în „masonry”, telefon mic): se adaptează singure ---- */
.ccu-btn .ccu-sec { white-space: nowrap; }
.ccu-btn.m .ccu-sec { overflow: hidden; text-overflow: ellipsis; }
@container (max-width: 380px) {
  .ccu-grid[data-cols="3"], .ccu-grid[data-cols="4"], .ccu-grid[data-cols="5"], .ccu-grid[data-cols="6"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .ccu-btn.m .ccu-sec { font-size: 17px; }
}
@container (max-width: 520px) {
  .ccu-head { gap: 8px; padding-right: 10px; }
  .ccu-head .vals > span { padding: 0 8px; } .ccu-head .vals > span.has-label .tx small:not(.rt) { display: none; } .ccu-head .vals > span.has-label { padding: 0 8px; }
  .ccu-head .clock { font-size: 18px; padding-left: 8px; }
  .ccu-fi .tx b, .ccu-fi .tx .v { font-size: 12px; } .ccu-fi .ccu-ico { --ico: 22px; }
  .ccu-fi .tx .v i { display: block; margin-top: -1px; }
}
@container (max-width: 440px) {
  /* telefon: iconița casei dispare și valorile se strâng, ca toate cele 3 (consum / solar / baterie) să se vadă întregi */
  .ccu-head { gap: 6px; padding: 9px 10px; } .ccu-head > .ccu-ico { display: none; }
  .ccu-head .vals { font-size: 13px; justify-content: space-between; } .ccu-head .vals > span { padding: 0 5px; gap: 4px; flex: 0 0 auto; } .ccu-head .vals > span:first-child { padding-left: 0; }
  .ccu-head .vals .ccu-ico { --ico: 14px; } .ccu-head .vals > span.has-label .ccu-ico { --ico: 15px; } .ccu-head .vals .tx b { font-size: 13px; }
  .ccu-head .clock { font-size: 17px; padding-left: 8px; }
}
@container (max-width: 380px) {
  .ccu-head > .ccu-ico { display: none; } .ccu-head .vals > span:first-child { padding-left: 0; }
  /* telefon îngust: iconițele valorilor rămân (mai mici), spațiile se strâng */
  .ccu-head .vals { font-size: 12.5px; } .ccu-head .vals > span { padding: 0 4px; gap: 3px; } .ccu-head .vals > span.has-label { padding: 0 4px; gap: 4px; }
  .ccu-head .vals .ccu-ico, .ccu-head .vals > span.has-label .ccu-ico { --ico: 13px; } .ccu-head .vals .tx b { font-size: 12.5px; } .ccu-head .vals .tx small.rt { font-size: 10px; }
  .ccu-head .clock { font-size: 16px; padding-left: 6px; }
}


/* ---- controale (ccu-controls-card) + titlu de secțiune (ccu-title-card) ---- */
.ctl { position: relative; box-sizing: border-box; display: grid; gap: 10px; padding: 12px 14px; min-width: 0; color: var(--ccu-text);
  background: var(--ccu-gloss), var(--ccu-surface); border: var(--ccu-bw) solid var(--ccu-line); border-radius: var(--ccu-r); box-shadow: var(--ccu-edge), var(--ccu-drop);
  transition: border-color .25s ease, background .25s ease, box-shadow .25s ease; }
.ctl[data-state="on"] { border-color: color-mix(in srgb, var(--ccu-on) 55%, transparent);
  background: radial-gradient(130% 150% at 0% 0%, color-mix(in srgb, var(--ccu-on) 20%, transparent), color-mix(in srgb, var(--ccu-on) 5%, transparent) 60%), var(--ccu-gloss), color-mix(in srgb, var(--ccu-on) 8%, var(--ccu-bg)); }
.ctl[data-state="unavailable"] { opacity: .5; }
.ctl .hd { display: flex; align-items: center; gap: 10px; min-width: 0; cursor: pointer; }
.ctl .hd .ccu-ico { --ico: 24px; } .ctl[data-state="on"] .hd .ccu-ico { color: var(--ccu-on-hi); filter: drop-shadow(0 0 6px color-mix(in srgb, var(--ccu-on) 50%, transparent)); }
.ctl .nm { flex: 1; min-width: 0; font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ctl .cur { font-size: 13px; font-weight: 600; color: var(--ccu-muted); white-space: nowrap; } .ctl[data-state="on"] .cur { color: var(--ccu-text); }
.ctl .pw { all: unset; cursor: pointer; flex: none; display: grid; place-items: center; width: 34px; height: 34px; border-radius: 50%; color: var(--ccu-muted); touch-action: manipulation;
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); transition: color .2s ease, border-color .2s ease, background .2s ease, box-shadow .2s ease; }
.ctl .pw .ccu-ico { --ico: 18px; color: inherit; filter: none; } .ctl .pw:active { transform: scale(.94); }
.ctl .pw[data-state="on"] { color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 65%, transparent); background: color-mix(in srgb, var(--ccu-on) 22%, var(--ccu-surface-2)); box-shadow: 0 0 12px -2px color-mix(in srgb, var(--ccu-on) 55%, transparent); }
.ctl .mo { all: unset; cursor: pointer; display: grid; place-items: center; width: 28px; height: 28px; border-radius: 50%; color: var(--ccu-muted); border: var(--ccu-bw) solid var(--ccu-line); } .ctl .mo .ccu-ico { --ico: 16px; }
/* slider */
.ctl .sl { position: relative; height: 30px; border-radius: 15px; cursor: pointer; touch-action: pan-y; background: color-mix(in srgb, var(--ccu-text) 8%, transparent); border: var(--ccu-bw) solid var(--ccu-line); overflow: hidden; }
.ctl .sl .fl { position: absolute; left: 0; top: 0; bottom: 0; border-radius: 15px 0 0 15px; background: linear-gradient(90deg, color-mix(in srgb, var(--ccu-on) 55%, transparent), color-mix(in srgb, var(--ccu-on) 85%, transparent)); pointer-events: none; }
.ctl .sl .th { position: absolute; top: 4px; bottom: 4px; width: 4px; margin-left: -6px; border-radius: 2px; background: #fff; box-shadow: 0 0 8px rgba(0,0,0,.4); pointer-events: none; }
.ctl .sl .sv { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 700; color: #fff; text-shadow: 0 1px 3px rgba(0,0,0,.6); pointer-events: none; }
/* termostat */
.ctl .sp { display: flex; align-items: center; justify-content: center; gap: 18px; }
.ctl .sp .tv { font-size: 30px; font-weight: 600; letter-spacing: -.02em; min-width: 92px; text-align: center; }
.ctl .st { all: unset; cursor: pointer; width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 24px; line-height: 1; color: var(--ccu-text); touch-action: manipulation;
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); } .ctl .st:active { transform: scale(.94); }
.ctl .mds { display: flex; flex-wrap: wrap; gap: 6px; }
.ctl .md { all: unset; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 5px 11px 5px 8px; border-radius: 999px; font-size: 12px; font-weight: 600; color: var(--ccu-muted);
  border: var(--ccu-bw) solid var(--ccu-line); background: color-mix(in srgb, var(--ccu-text) 5%, transparent); touch-action: manipulation; } .ctl .md .ccu-ico { --ico: 15px; }
.ctl .md[data-state="on"] { color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 60%, transparent); background: color-mix(in srgb, var(--ccu-on) 18%, transparent); }
.ctl[data-mode="cool"][data-state="on"] { --ccu-on: var(--ccu-c-blue); --ccu-on-hi: var(--ccu-c-blue); } .ctl[data-mode="heat"][data-state="on"] { --ccu-on: var(--ccu-c-red); --ccu-on-hi: var(--ccu-c-red); }
.ctl[data-mode="dry"][data-state="on"] { --ccu-on: var(--ccu-c-cyan); --ccu-on-hi: var(--ccu-c-cyan); } .ctl[data-mode="fan_only"][data-state="on"] { --ccu-on: var(--ccu-c-orange); --ccu-on-hi: var(--ccu-c-orange); }
.ctl[data-mode="auto"][data-state="on"], .ctl[data-mode="heat_cool"][data-state="on"] { --ccu-on: var(--ccu-c-green); --ccu-on-hi: var(--ccu-c-green); }
/* selector: întreaga plăcuță e „select” nativ transparent peste text */
.ctl.se { cursor: pointer; } .ctl.se .cv { display: flex; align-items: center; justify-content: space-between; gap: 8px; font-size: 16px; } .ctl.se .cv b { font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ctl.se .chev { color: var(--ccu-muted); } .ctl.se .sel { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; font-size: 16px; }
.ctl-grid { grid-template-columns: repeat(var(--cols, 1), minmax(0, 1fr)); }



/* ---- becuri: buton „lampă” (orice bec simplu) și tile cu orb / slidere / culori ---- */
.ccu-btn[data-lamp] .ccu-ico { box-sizing: content-box; padding: 7px; border-radius: 50%; background: color-mix(in srgb, var(--ccu-text) 7%, transparent); border: var(--ccu-bw) solid var(--ccu-line); transition: background .3s ease, box-shadow .3s ease, color .3s ease; }
.ccu-btn[data-lamp][data-state="on"] { --ccu-on: #ffc857; --ccu-on-hi: #ffe08a; border-color: color-mix(in srgb, #ffc857 62%, transparent);
  background: radial-gradient(120% 150% at 0% 0%, color-mix(in srgb, #ffc857 30%, transparent), color-mix(in srgb, #ffc857 7%, transparent) 62%), var(--ccu-gloss), color-mix(in srgb, #ffc857 9%, var(--ccu-bg));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.1), 0 0 20px -4px color-mix(in srgb, #ffc857 50%, transparent), var(--ccu-drop); }
.ccu-btn[data-lamp][data-state="on"] .ccu-ico { color: #ffe08a; background: radial-gradient(circle at 50% 45%, color-mix(in srgb, #ffc857 38%, transparent), color-mix(in srgb, #ffc857 8%, transparent) 70%); border-color: color-mix(in srgb, #ffc857 55%, transparent); box-shadow: 0 0 16px 2px color-mix(in srgb, #ffc857 40%, transparent); }
.ctl.li { --lc: #ffc857; }
.ctl.li[data-state="on"] { --ccu-on: var(--lc); --ccu-on-hi: color-mix(in srgb, var(--lc) 70%, #fff); }
.ctl.li .orb { all: unset; cursor: pointer; flex: none; box-sizing: border-box; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; touch-action: manipulation; color: var(--ccu-muted);
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); transition: box-shadow .3s ease, background .3s ease, color .3s ease, border-color .3s ease; }
.ctl.li .orb .ccu-ico { --ico: 24px; color: inherit; filter: none; } .ctl.li .orb:active { transform: scale(.94); }
.ctl.li .orb[data-state="on"] { color: color-mix(in srgb, var(--lc) 70%, #fff); border-color: color-mix(in srgb, var(--lc) 70%, transparent);
  background: radial-gradient(circle at 50% 42%, color-mix(in srgb, var(--lc) 42%, transparent), color-mix(in srgb, var(--lc) 10%, transparent) 72%), var(--ccu-surface-2); box-shadow: 0 0 18px 2px color-mix(in srgb, var(--lc) 48%, transparent); }
.ctl.li .nm { cursor: pointer; }
.ctl.li .sl .fl { background: linear-gradient(90deg, color-mix(in srgb, var(--lc) 45%, transparent), var(--lc)); }
.ctl .sl.ct { background: linear-gradient(90deg, #ffae60, #fff1de 50%, #b9d2ff); border-color: rgba(255,255,255,.25); } .ctl .sl.ct .fl { display: none; }
.ctl .sl.ct .th { background: #fff; box-shadow: 0 0 0 2px rgba(0,0,0,.45); } .ctl .sl.ct .sv { color: #1a1a1a; text-shadow: none; opacity: .75; }
.ctl .sws { display: flex; flex-wrap: wrap; gap: 8px; }
.ctl .sw { all: unset; cursor: pointer; box-sizing: border-box; width: 28px; height: 28px; border-radius: 50%; background: var(--c); border: 2px solid rgba(255,255,255,.22); touch-action: manipulation; transition: transform .12s ease, box-shadow .2s ease, border-color .2s ease; }
.ctl .sw:active { transform: scale(.9); } .ctl .sw[data-state="on"] { border-color: #fff; box-shadow: 0 0 0 2px color-mix(in srgb, var(--c) 60%, transparent), 0 0 12px color-mix(in srgb, var(--c) 70%, transparent); }
/* termostat / A/C — cadran */
.ctl.dial { gap: 8px; }
.ctl .dl { position: relative; width: min(100%, 250px); margin: 0 auto; aspect-ratio: 200 / 150; }
.ctl .dl svg { position: absolute; inset: 0; width: 100%; height: 100%; display: block; overflow: visible; }
.ctl .dl .tr { fill: none; stroke: color-mix(in srgb, var(--ccu-text) 11%, transparent); stroke-width: 11; stroke-linecap: round; }
.ctl .dl .vl { fill: none; stroke: var(--ccu-on); stroke-width: 11; stroke-linecap: round; transition: stroke-dasharray .4s ease, stroke-dashoffset .4s ease; filter: drop-shadow(0 0 7px color-mix(in srgb, var(--ccu-on) 55%, transparent)); }
.ctl[data-state="off"] .dl .vl { stroke: var(--ccu-muted); filter: none; opacity: .5; }
.ctl .dl .cm { fill: #fff; stroke: var(--ccu-bg); stroke-width: 3; filter: drop-shadow(0 1px 3px rgba(0,0,0,.6)); }
.ctl .dl .ct { position: absolute; left: 14%; right: 14%; top: 22%; bottom: 26%; display: grid; align-content: center; justify-items: center; gap: 2px; text-align: center; pointer-events: none; }
.ctl .dl .tv { font-size: clamp(26px, 9.5vw, 40px); font-weight: 600; letter-spacing: -.03em; line-height: 1; min-width: 0; }
.ctl .dl .tv.rg { font-size: clamp(20px, 6.6vw, 28px); }
.ctl .dl .ac { font-size: 11.5px; color: var(--ccu-muted); line-height: 1.2; }
.ctl[data-state="on"] .dl .ac { color: var(--ccu-on-hi); }
.ctl .dl .st { position: absolute; bottom: 1%; width: 42px; height: 42px; } .ctl .dl .st.m { left: 8%; } .ctl .dl .st.p { right: 8%; }
.ctl .mds.c { justify-content: center; }
.ctl .sub { display: grid; gap: 4px; } .ctl .sub small { font-size: 10.5px; letter-spacing: .06em; text-transform: uppercase; color: var(--ccu-muted); }
/* ventilator / media / telecomandă */
.ctl .tr { display: flex; justify-content: center; gap: 12px; } .ctl .tr .st { width: 44px; height: 44px; } .ctl .tr .st .ccu-ico { --ico: 20px; }
.ctl .tr .st[data-state="on"] { color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 60%, transparent); }
.ctl .np { display: grid; gap: 1px; min-width: 0; } .ctl .np b { font-size: 14px; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ctl .np small { font-size: 12px; color: var(--ccu-muted); }
.ccu-remote { display: grid; gap: 10px; }
.ccu-remote .rr { display: grid; grid-template-columns: repeat(var(--n, 4), minmax(0, 1fr)); gap: 8px; } .ccu-remote .rr[data-n="2"] { --n: 2; } .ccu-remote .rr[data-n="4"] { --n: 4; }
.rk { all: unset; box-sizing: border-box; cursor: pointer; display: grid; justify-items: center; align-content: center; gap: 3px; min-height: 52px; padding: 6px 4px; border-radius: 14px; font-size: 11.5px; font-weight: 600; color: var(--ccu-text); touch-action: manipulation; user-select: none;
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); transition: transform .12s ease, border-color .2s ease, background .2s ease; }
.rk .ccu-ico { --ico: 22px; } .rk:active { transform: scale(.95); background: color-mix(in srgb, var(--ccu-on) 18%, var(--ccu-surface-2)); border-color: color-mix(in srgb, var(--ccu-on) 55%, transparent); }
.rk:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 2px; }
.ccu-remote[data-state="unavailable"] { opacity: .5; }
.dpad { display: grid; grid-template-columns: repeat(3, 62px); grid-template-rows: repeat(3, 62px); gap: 8px; justify-content: center; padding: 6px 0 2px; }
.dpad .rk { min-height: 0; height: 62px; width: 62px; border-radius: 50%; } .dpad .rk .ccu-ico { --ico: 26px; }
.dpad .u { grid-area: 1 / 2; } .dpad .l { grid-area: 2 / 1; } .dpad .c { grid-area: 2 / 2; color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 55%, transparent); } .dpad .r { grid-area: 2 / 3; } .dpad .d { grid-area: 3 / 2; }
/* radio: ecran LCD cu echalizator, scală de acordaj cu ac, butoane metalice */
.ccu-radio { display: grid; gap: 14px; }
.ccu-radio .rd-lcd { position: relative; overflow: hidden; display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 14px;
  background: linear-gradient(180deg, color-mix(in srgb, #000 55%, var(--ccu-bg)), color-mix(in srgb, #000 32%, var(--ccu-bg))); border: var(--ccu-bw) solid var(--ccu-line);
  box-shadow: inset 0 2px 10px rgba(0,0,0,.55), inset 0 -1px 0 rgba(255,255,255,.04); }
.ccu-radio .rd-lcd::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: repeating-linear-gradient(0deg, rgba(255,255,255,.035) 0 1px, transparent 1px 3px); }
.ccu-radio .rd-ico { --ico: 26px; color: var(--ccu-muted); flex: none; }
.ccu-radio[data-state="play"] .rd-ico { color: var(--ccu-on-hi); filter: drop-shadow(0 0 8px color-mix(in srgb, var(--ccu-on) 60%, transparent)); }
.ccu-radio .rd-info { flex: 1; min-width: 0; display: grid; gap: 2px; }
.ccu-radio .rd-info b { font-size: 17px; font-weight: 650; letter-spacing: .01em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ccu-radio[data-state="play"] .rd-info b { color: var(--ccu-on-hi); text-shadow: 0 0 10px color-mix(in srgb, var(--ccu-on) 55%, transparent); }
.ccu-radio .rd-info small { font-size: 11.5px; letter-spacing: .08em; text-transform: uppercase; color: var(--ccu-muted); }
.ccu-radio .rd-eq { display: flex; align-items: flex-end; gap: 3px; height: 26px; flex: none; }
.ccu-radio .rd-eq i { width: 4px; height: 6px; border-radius: 2px; background: color-mix(in srgb, var(--ccu-text) 25%, transparent); }
.ccu-radio[data-state="play"] .rd-eq i { height: 14px; background: linear-gradient(180deg, var(--ccu-on-hi), var(--ccu-on)); box-shadow: 0 0 6px color-mix(in srgb, var(--ccu-on) 50%, transparent); }
@media not (prefers-reduced-motion: reduce) { .ccu-radio[data-run="1"] .rd-eq i { animation: ccu-eq var(--d, .8s) ease-in-out var(--o, 0s) infinite alternate; } }
:host([data-anim="off"]) .ccu-radio .rd-eq i { animation: none !important; }
@keyframes ccu-eq { from { height: 5px; } to { height: 26px; } }
.ccu-radio .rd-dial { position: relative; height: 66px; margin: 0 6px; }
.ccu-radio .rd-ticks { position: absolute; left: 0; right: 0; top: 4px; height: 20px; border-bottom: 1px solid color-mix(in srgb, var(--ccu-text) 28%, transparent);
  background: linear-gradient(90deg, color-mix(in srgb, var(--ccu-text) 30%, transparent) 0 1px, transparent 1px) left bottom / 8px 9px repeat-x, linear-gradient(90deg, color-mix(in srgb, var(--ccu-text) 55%, transparent) 0 1px, transparent 1px) left bottom / 40px 17px repeat-x; }
.ccu-radio .rd-needle { position: absolute; top: 0; width: 2px; height: 30px; margin-left: -1px; border-radius: 1px; background: var(--ccu-on-hi); box-shadow: 0 0 10px var(--ccu-on); pointer-events: none; transition: left .45s cubic-bezier(.3,.7,.2,1); }
.ccu-radio .rd-needle::before { content: ''; position: absolute; top: -3px; left: -3px; border: 4px solid transparent; border-top-color: var(--ccu-on-hi); border-bottom: 0; }
.ccu-radio .st { all: unset; box-sizing: border-box; cursor: pointer; position: absolute; top: 24px; transform: translateX(-50%); display: grid; justify-items: center; gap: 4px; width: max-content; max-width: 30%; padding: 4px 6px; border-radius: 10px; -webkit-tap-highlight-color: transparent; }
.ccu-radio .st i { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--ccu-muted); background: var(--ccu-bg); transition: background .25s, border-color .25s, box-shadow .25s; }
.ccu-radio .st span { max-width: 100%; font-size: 11px; font-weight: 600; color: var(--ccu-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: color .25s; }
.ccu-radio .st.on i { border-color: var(--ccu-on-hi); background: var(--ccu-on); box-shadow: 0 0 10px var(--ccu-on); } .ccu-radio .st.on span { color: var(--ccu-text); }
.ccu-radio .st:focus-visible, .ccu-radio .rd-b:focus-visible, .ccu-radio .rd-knob:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 2px; }
.ccu-radio .rd-ctl { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.ccu-radio .rd-b { all: unset; box-sizing: border-box; cursor: pointer; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center; color: var(--ccu-text); touch-action: manipulation;
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); transition: transform .12s ease; }
.ccu-radio .rd-b[disabled] { opacity: .35; cursor: default; } .ccu-radio .rd-b:active:not([disabled]) { transform: scale(.94); } .ccu-radio .rd-b .ccu-ico { --ico: 20px; }
.ccu-radio .rd-knob { all: unset; box-sizing: border-box; cursor: pointer; width: 64px; height: 64px; border-radius: 50%; display: grid; place-items: center; color: var(--ccu-text); touch-action: manipulation;
  background: radial-gradient(circle at 35% 28%, color-mix(in srgb, #fff 24%, var(--ccu-surface-2)), var(--ccu-surface-2) 60%, color-mix(in srgb, #000 30%, var(--ccu-surface-2)));
  border: 2px solid color-mix(in srgb, var(--ccu-text) 20%, transparent); box-shadow: 0 6px 14px -6px rgba(0,0,0,.8), inset 0 1px 0 rgba(255,255,255,.25); transition: transform .12s ease, box-shadow .3s ease, border-color .3s ease, color .3s ease; }
.ccu-radio .rd-knob:active { transform: scale(.95); } .ccu-radio .rd-knob .ccu-ico { --ico: 28px; }
.ccu-radio[data-state="play"] .rd-knob { color: var(--ccu-on-hi); border-color: color-mix(in srgb, var(--ccu-on) 70%, transparent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--ccu-on) 16%, transparent), 0 0 18px color-mix(in srgb, var(--ccu-on) 45%, transparent), inset 0 1px 0 rgba(255,255,255,.25); }
.ccu-radio .rd-vol { position: relative; flex: 1 1 120px; min-width: 110px; height: 34px; border-radius: 17px; cursor: pointer; touch-action: pan-y; overflow: hidden; background: color-mix(in srgb, var(--ccu-text) 8%, transparent); border: var(--ccu-bw) solid var(--ccu-line); }
.ccu-radio .rd-vol .fl { position: absolute; left: 0; top: 0; bottom: 0; pointer-events: none; background: linear-gradient(90deg, color-mix(in srgb, var(--ccu-on) 40%, transparent), color-mix(in srgb, var(--ccu-on) 80%, transparent)); }
.ccu-radio .rd-vol .th { position: absolute; top: 5px; bottom: 5px; width: 4px; margin-left: -3px; border-radius: 2px; background: #fff; box-shadow: 0 0 8px rgba(0,0,0,.4); pointer-events: none; }
.ccu-radio .rd-vol .ico { position: absolute; left: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; --ico: 16px; color: var(--ccu-text); }
.ccu-radio .rd-vol .sv { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 12px; font-weight: 700; pointer-events: none; text-shadow: 0 1px 3px rgba(0,0,0,.5); }
.ccu-radio .rd-spk { display: flex; flex-wrap: wrap; gap: 8px; }
.ccu-radio .sp { all: unset; box-sizing: border-box; cursor: pointer; display: inline-flex; align-items: center; gap: 7px; min-height: 36px; padding: 0 12px 0 10px; border-radius: 18px; font-size: 12.5px; font-weight: 600; color: var(--ccu-muted); max-width: 100%; touch-action: manipulation;
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); transition: border-color .2s, color .2s, background .2s; }
.ccu-radio .sp span:nth-child(2) { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; } .ccu-radio .sp .ccu-ico { --ico: 16px; }
.ccu-radio .sp i { width: 7px; height: 7px; border-radius: 50%; background: color-mix(in srgb, var(--ccu-text) 30%, transparent); flex: none; }
.ccu-radio .sp[data-s="play"] i { background: var(--ccu-on); box-shadow: 0 0 8px var(--ccu-on); } .ccu-radio .sp[data-s="na"] { opacity: .5; }
.ccu-radio .sp.on { color: var(--ccu-text); border-color: color-mix(in srgb, var(--ccu-on) 60%, transparent); background: color-mix(in srgb, var(--ccu-on) 14%, var(--ccu-surface-2)); }
.ccu-radio .sp:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 2px; }
.ccu-radio[data-state="na"] { opacity: .55; }
/* mașini: panou pe mașină, rânduri cu termen (zile rămase), bară colorată după stare */
.ccu-veh { display: grid; gap: 14px; }
.ccu-veh .vh { display: grid; gap: 6px; }
.ccu-veh .hd { display: flex; align-items: center; gap: 10px; padding: 0 2px 2px; } .ccu-veh .hd .ccu-ico { --ico: 24px; color: var(--ccu-accent); } .ccu-veh .hd b { font-size: 15px; font-weight: 650; flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ccu-veh .hd .pl { font-size: 11px; letter-spacing: .08em; padding: 3px 8px; border-radius: 7px; color: var(--ccu-muted); border: var(--ccu-bw) solid var(--ccu-line); background: color-mix(in srgb, var(--ccu-text) 5%, transparent); }
.ccu-veh .vh[data-state="soon"] .hd .ccu-ico { color: var(--ccu-alert-hi); } .ccu-veh .vh[data-state="expired"] .hd .ccu-ico { color: var(--ccu-c-red); }
.ccu-veh .vd { position: relative; display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 4px 12px; padding: 10px 14px 12px; border-radius: 14px; overflow: hidden;
  background: var(--ccu-gloss), var(--ccu-surface-2); border: var(--ccu-bw) solid var(--ccu-line); box-shadow: var(--ccu-edge); }
.ccu-veh .vd .ccu-ico { --ico: 22px; color: var(--ccu-muted); } .ccu-veh .vd .nm { display: grid; min-width: 0; font-size: 14px; font-weight: 600; } .ccu-veh .vd .nm small { font-size: 11.5px; font-weight: 400; color: var(--ccu-muted); }
.ccu-veh .vd > b { font-size: 14px; font-weight: 700; white-space: nowrap; text-align: right; }
.ccu-veh .vd .bar { grid-column: 1 / -1; height: 4px; border-radius: 2px; background: color-mix(in srgb, var(--ccu-text) 10%, transparent); overflow: hidden; } .ccu-veh .vd .bar i { display: block; height: 100%; border-radius: 2px; background: var(--ccu-on); transition: width .4s ease; }
.ccu-veh .vd[data-state="ok"] .ccu-ico { color: var(--ccu-on-hi); }
.ccu-veh .vd[data-state="soon"] { border-color: color-mix(in srgb, var(--ccu-alert) 65%, transparent); background: radial-gradient(130% 160% at 50% 0%, color-mix(in srgb, var(--ccu-alert) 22%, transparent), color-mix(in srgb, var(--ccu-alert) 6%, transparent) 65%), color-mix(in srgb, var(--ccu-alert) 9%, var(--ccu-bg)); }
.ccu-veh .vd[data-state="soon"] .ccu-ico, .ccu-veh .vd[data-state="soon"] > b { color: var(--ccu-alert-hi); } .ccu-veh .vd[data-state="soon"] .bar i { background: var(--ccu-alert); }
.ccu-veh .vd[data-state="expired"] { border-color: color-mix(in srgb, var(--ccu-c-red) 70%, transparent); background: radial-gradient(130% 160% at 50% 0%, color-mix(in srgb, var(--ccu-c-red) 26%, transparent), color-mix(in srgb, var(--ccu-c-red) 7%, transparent) 65%), color-mix(in srgb, var(--ccu-c-red) 10%, var(--ccu-bg)); }
.ccu-veh .vd[data-state="expired"] .ccu-ico, .ccu-veh .vd[data-state="expired"] > b { color: var(--ccu-c-red); } .ccu-veh .vd[data-state="expired"] .bar i { background: var(--ccu-c-red); width: 100% !important; }
.ccu-veh .vd[data-state="unset"] { border-style: dashed; } .ccu-veh .vd[data-state="unset"] > b { color: var(--ccu-muted); font-weight: 600; } .ccu-veh .vd[data-state="unset"] .bar { opacity: .4; }
.ccu-veh .vd[data-editable="1"] { cursor: pointer; } .ccu-veh .vd .dp { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; }
.ccu-veh .vd .now { all: unset; box-sizing: border-box; cursor: pointer; font-size: 11.5px; font-weight: 600; padding: 5px 10px; border-radius: 9px; color: var(--ccu-text); border: var(--ccu-bw) solid var(--ccu-line); background: color-mix(in srgb, var(--ccu-text) 7%, transparent); position: relative; z-index: 1; }
.ccu-veh .vd .now:active { transform: scale(.96); } .ccu-veh .vd .now:focus-visible { outline: 2px solid var(--ccu-accent); outline-offset: 2px; }
/* titlu de secțiune */
.ccu-ttl { display: flex; align-items: center; gap: 12px; padding: 2px 4px; } .ccu-ttl .ccu-ico { --ico: 28px; color: var(--ccu-accent); filter: drop-shadow(0 0 8px color-mix(in srgb, var(--ccu-accent) 45%, transparent)); }
.ccu-ttl .tx { display: grid; gap: 1px; } .ccu-ttl b { font-size: 20px; font-weight: 650; letter-spacing: -.01em; } .ccu-ttl small { font-size: 12.5px; color: var(--ccu-muted); }

/* ---- animații discrete (doar la „activ”; transform/opacity; respectă reduce motion) ---- */
@keyframes ccu-glow    { 0%,100% { opacity: .78; } 50% { opacity: 1; } }
@keyframes ccu-spin    { to { transform: rotate(360deg); } }
@keyframes ccu-flicker { 0%,100% { opacity: 1; } 40% { opacity: .82; } 60% { opacity: .95; } 80% { opacity: .86; } }
@keyframes ccu-dash { to { stroke-dashoffset: -20; } }
@keyframes ccu-cloud { from { transform: translateX(-110%); } to { transform: translateX(calc(100cqw + 10%)); } }
@keyframes ccu-fog { from { transform: translateX(-6%); } to { transform: translateX(6%); } }
@keyframes ccu-rain { from { transform: translate(0, 0) rotate(var(--lean, 0deg)); } to { transform: translate(var(--drift, 0px), 135cqh) rotate(var(--lean, 0deg)); } }
@keyframes ccu-snow { 0% { transform: translate(0, 0); } 50% { transform: translate(calc(var(--sw, 0px) + var(--drift, 0px) * .5), 58cqh); } 100% { transform: translate(calc(var(--sw, 0px) * -.6 + var(--drift, 0px)), 118cqh); } }
@keyframes ccu-gust { 0% { transform: translateX(-90px); opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateX(calc(100cqw + 40px)); opacity: 0; } }
@keyframes ccu-flash { 0%, 90%, 100% { opacity: 0; } 91% { opacity: .55; } 92.5% { opacity: .05; } 94% { opacity: .7; } 96% { opacity: 0; } }
@keyframes ccu-twinkle { 0%, 100% { opacity: .25; } 50% { opacity: 1; } }
@keyframes ccu-wxfall { 0% { transform: translateY(-2px); opacity: 0; } 40% { opacity: 1; } 100% { transform: translateY(3px); opacity: 0; } }
@keyframes ccu-wxdrift { from { transform: translateX(-1.3px); } to { transform: translateX(1.3px); } }
@keyframes ccu-wxflash { 0%, 55%, 100% { opacity: 1; } 60% { opacity: .15; } 65% { opacity: 1; } 70% { opacity: .2; } }
@keyframes ccu-pulse   { 0%,100% { transform: scale(1); } 50% { transform: scale(1.07); } }
@media not (prefers-reduced-motion: reduce) {
  :is([data-state="on"], [data-state="alert"]) .ccu-ico.a-glow svg    { animation: ccu-glow 3.2s ease-in-out infinite; }
  :is([data-state="on"], [data-state="alert"]) .ccu-ico.a-spin svg    { animation: ccu-spin 6s linear infinite; transform-origin: 50% 50%; }
  :is([data-state="on"], [data-state="alert"]) .ccu-ico.a-flicker svg { animation: ccu-flicker 2.4s ease-in-out infinite; }
  :is([data-state="on"], [data-state="alert"]) .ccu-ico.a-pulse svg   { animation: ccu-pulse 2.6s ease-in-out infinite; transform-origin: 50% 50%; }
  /* aparat de aer condiționat: se învârte DOAR ventilatorul (grupul .rot), cât timp aparatul chiar lucrează (data-run="1") */
  [data-run="1"] .ccu-ico.a-fan .rot { animation: ccu-spin 1.8s linear infinite; }
  [data-run="1"] .ccu-ico.a-fan .rot.whole { transform-box: fill-box; transform-origin: 50% 50%; }
  /* flux: puncte care „curg” de-a lungul panglicilor (spre nod sau spre consumator); înapoi pentru fluxurile care pleacă din nod spre stânga */
  .ccu-flow-svg .pulse { animation: ccu-dash 2.4s linear infinite; }
  .ccu-flow-svg .pulse[data-dir="out"] { animation-direction: reverse; }
  /* vreme: scena și pictogramele */
  .ccu-scene .sun::before { animation: ccu-spin 48s linear infinite; }
  .ccu-scene .stars i { animation: ccu-twinkle 3.2s ease-in-out infinite; animation-delay: var(--dl); }
  .ccu-scene .clouds i { animation: ccu-cloud var(--t) linear infinite; animation-delay: var(--dl); }
  .ccu-scene .fog i { animation: ccu-fog 16s ease-in-out infinite alternate; } .ccu-scene .fog i:nth-child(2) { animation-duration: 21s; animation-direction: alternate-reverse; } .ccu-scene .fog i:nth-child(3) { animation-duration: 26s; }
  .ccu-scene .rain i { animation: ccu-rain calc(.55s + var(--s) * .45s) linear infinite; animation-delay: var(--dl); }
  .ccu-scene .snow i { animation: ccu-snow calc(4.5s + var(--s) * 4.5s) linear infinite; animation-delay: var(--dl); }
  .ccu-scene .windl i { animation: ccu-gust calc(1.1s + var(--s) * 1.1s) linear infinite; animation-delay: var(--dl); }
  .ccu-scene[data-bolt="1"] .flash { animation: ccu-flash 7s linear infinite; }
  .wx-spin { transform-box: fill-box; transform-origin: 50% 50%; animation: ccu-spin 18s linear infinite; }
  .wx-fall { animation: ccu-wxfall 1.4s linear infinite; }
  .wx-drift { animation: ccu-wxdrift 5s ease-in-out infinite alternate; }
  .wx-flash { animation: ccu-wxflash 2.6s linear infinite; }
  .wx-twinkle { animation: ccu-twinkle 2.6s ease-in-out infinite; }
}
@media (prefers-reduced-motion: reduce) { .ccu-scene :is(.rain, .snow, .windl, .flash) { display: none !important; } }
:host([data-tap]) .ccu-card { cursor: pointer; }
:host([data-anim="off"]) .ccu-scene *, :host([data-anim="off"]) .ccu-scene *::before, :host([data-anim="off"]) .ccu-ico svg * { animation: none !important; }
:host([data-anim="off"]) .ccu-scene :is(.rain, .snow, .windl, .flash) { display: none !important; }
:host([data-anim="off"]) .ccu-ico svg, :host([data-anim="off"]) .ccu-ico .rot { animation: none !important; }
/* ---- mișcare „calm”: aceleași animații, dar doar câteva cicluri (≈ 6–10 s) la fiecare schimbare de stare, apoi static; „off” oprește tot ---- */
:host([data-anim="calm"]) :is(.ccu-ico svg, .ccu-ico .rot, .rd-eq i, .wx-fall, .wx-drift, .wx-flash, .wx-twinkle) { animation-iteration-count: 3 !important; }
:host([data-anim="calm"]) :is(.ccu-ico.a-spin svg, .wx-spin) { animation-iteration-count: 1 !important; }
:host([data-anim="off"]) :is(.rd-eq i, .wx-fall, .wx-drift, .wx-flash, .wx-twinkle, .wx-spin) { animation: none !important; }
:host([data-fx="calm"]) :is(.ccu-scene .stars i, .ccu-scene .clouds i, .ccu-scene .fog i) { animation-iteration-count: 1 !important; }
:host([data-fx="calm"]) .ccu-scene .sun::before { animation: none !important; }
:host([data-fx="calm"]) .ccu-scene :is(.rain, .snow, .windl, .flash), :host([data-fx="off"]) .ccu-scene :is(.rain, .snow, .windl, .flash) { display: none !important; }
:host([data-fx="off"]) .ccu-scene *, :host([data-fx="off"]) .ccu-scene *::before { animation: none !important; }
:host([data-flow="calm"]) .ccu-flow-svg .pulse { animation-iteration-count: 3 !important; }
:host([data-flow="off"]) .ccu-flow-svg .pulse { animation: none !important; }
`;

return { CCU_THEME };
})();

__m["i18n"] = (() => {
// src/i18n.mjs — traduceri. Limba sursă a textelor din cod e româna; `t('text în română')` întoarce textul în limba curentă.
// Limba vine din `config.language` sau din `hass.locale.language`; implicit engleza. O limbă nouă = un dicționar nou în DICT (cheie: fraza românească).
// Variabile: t('Persoana #{n}: lipsește entity_id.', { n: 2 }).

const EN = {
 "Insignă cu număr": "Number badge",
 "Entități numărate": "Counted entities",
 "Aspect insignă": "Badge style",
 "Numără entitățile pornite; un senzor numeric adaugă valoarea lui (ex. „becuri aprinse”).": "Counts the entities that are on; a numeric sensor adds its value (e.g. “lights on”).",
 "„light” = galben, pentru lumini; implicit roșu (alertă).": "“light” = yellow, for lights; the default is red (alert).",
 "Utilizabil până la {p}%": "Usable down to {p}%",
 "Pe zi (100→{p}%)": "Per day (100→{p}%)",
 "{a} kWh": "{a} kWh",
 "Plin în": "Full in",
 "Autonomie la consum": "Runtime at load",
 "Alți consumatori (se adună la consum)": "Other loads (added to the load)",
 "Putere baterie (W)": "Battery power (W)",
 "Inversează semnul puterii": "Invert the power sign",
 "Dacă bateria alimentează mai multe circuite, adaugă-le aici: autonomia se calculează la suma lor.": "If the battery feeds several circuits, add them here: the runtime is calculated for their sum.",
 "+ = descărcare, − = încărcare. Cât timp se încarcă, cardul arată „Plin în”.": "+ = discharging, − = charging. While it charges, the card shows “Full in”.",
 "Încălzire": "Heat",
 "Răcire": "Cool",
 "Uscare": "Dry",
 "Ventilator": "Fan",
 "Oprit": "Off",
 "Pornit": "On",
 "Auto": "Auto",
 "Mic": "Low",
 "Mediu": "Medium",
 "Mare": "High",
 "Silențios": "Quiet",
 "Turbo": "Turbo",
 "Puternic": "Strong",
 "Focus": "Focus",
 "Difuz": "Diffuse",
 "Vertical": "Vertical",
 "Orizontal": "Horizontal",
 "Ambele": "Both",
 "Normal": "Normal",
 "Eco": "Eco",
 "Plecat": "Away",
 "Boost": "Boost",
 "Confort": "Comfort",
 "Acasă": "Home",
 "Somn": "Sleep",
 "Activ": "Active",
 "Oprește": "Turn off",
 "Pornește": "Turn on",
 "Scade": "Decrease",
 "Crește": "Increase",
 "acum": "now",
 "Oscilare": "Swing",
 "Preset": "Preset",
 "încălzește": "heating",
 "răcește": "cooling",
 "usucă": "drying",
 "ventilație": "fan",
 "în repaus": "idle",
 "Alb cald": "Warm white",
 "Alb neutru": "Neutral white",
 "Alb rece": "Cool white",
 "Roșu": "Red",
 "Portocaliu": "Orange",
 "Galben": "Yellow",
 "Verde": "Green",
 "Cyan": "Cyan",
 "Albastru": "Blue",
 "Mov": "Purple",
 "Roz": "Pink",
 "Alte culori": "More colors",
 "Stinge": "Turn off",
 "Aprinde": "Turn on",
 "Temperatură de culoare": "Color temperature",
 "Redă": "Playing",
 "Pauză": "Paused",
 "Mute": "Mute",
 "Vol −": "Vol −",
 "Vol +": "Vol +",
 "Canal −": "Channel −",
 "Canal +": "Channel +",
 "Home": "Home",
 "Înapoi": "Back",
 "Meniu": "Menu",
 "Intrare": "Input",
 "OK": "OK",
 "Control #{n}: entity_id lipsă sau invalid.": "Control #{n}: entity_id is missing or invalid.",
 "Control #{n} ({e}): domeniu necunoscut; folosește kind: climate | light | number | select | fan | media.": "Control #{n} ({e}): unknown domain; use kind: climate | light | number | select | fan | media.",
 "Controale: maximum 12 per card.": "Controls: at most 12 per card.",
 "Telecomandă: lipsește „entity” (ex. remote.living_room_tv).": "Remote: \"entity\" is missing (e.g. remote.living_room_tv).",
 "Fără activitate": "No activity",
 "{n} active": "{n} active",
 "azi": "today",
 "mâine": "tomorrow",
 "în {n} zile": "in {n} days",
 "Valoarea #{n}: entity_id lipsă sau invalid.": "Value #{n}: entity_id is missing or invalid.",
 "Valoarea #{n}: culoare \"{c}\" necunoscută (folosește {l}).": "Value #{n}: unknown color \"{c}\" (use {l}).",
 "Header: maximum 3 valori; restul sunt ignorate.": "Header: at most 3 values; the rest are ignored.",
 "Header: `right` are entity_id lipsă sau invalid — se arată ceasul.": "Header: `right` has a missing or invalid entity_id — the clock is shown instead.",
 "Meniu #{n}: lipsește „path” (adresă ce începe cu /) sau „back: true”.": "Menu #{n}: \"path\" (an address starting with /) or \"back: true\" is missing.",
 "Persoana #{n}: entity_id lipsă sau invalid.": "Person #{n}: entity_id is missing or invalid.",
 "Persoane: maximum 6; restul sunt ignorate.": "People: at most 6; the rest are ignored.",
 "Persoane": "People",
 "Nimeni acasă": "Nobody home",
 "Toți sunt acasă": "Everyone is home",
 "{a} din {b} acasă": "{a} of {b} home",
 "Titlu": "Title",
 "Titlu (opțional)": "Title (optional)",
 "Detectează automat senzorii": "Auto-detect sensors",
 "Alege senzorul care arată puterea instantanee produsă (W sau kW).": "Pick the sensor showing the instant power produced (W or kW).",
 "Senzor de putere": "Power sensor",
 "Nume afișat": "Display name",
 "Iconiță": "Icon",
 "Alege senzorul contorului: puterea de la / către rețea.": "Pick the meter sensor: power from / to the grid.",
 "Contorul arată valori pozitive când exportă": "Meter shows positive values when exporting",
 "Bifează dacă pe contor + înseamnă export în rețea.": "Turn on if + on your meter means exporting to the grid.",
 "Puterea bateriei și, opțional, nivelul de încărcare.": "Battery power and, optionally, its charge level.",
 "Nivel încărcare (%)": "Charge level (%)",
 "Bateria arată valori pozitive când se încarcă": "Battery shows positive values when charging",
 "Implicit + înseamnă descărcare.": "By default + means discharging.",
 "Consumatori": "Consumers",
 "Ce consumă energia: casă, hală, piscină, mașină electrică…": "What uses the energy: house, warehouse, pool, EV…",
 "Adaugă consumator": "Add consumer",
 "Consumator": "Consumer",
 "Nume": "Name",
 "Avansat: sumă de senzori sau scădere": "Advanced: sum of sensors or subtraction",
 "Însumează mai mulți senzori (ex. cele 3 faze)": "Add up several sensors (e.g. the 3 phases)",
 "Scade din valoare (ex. mașina electrică din hală)": "Subtract from the value (e.g. the EV from the warehouse)",
 "Statistici jos": "Bottom statistics",
 "Valori mici sub grafic: import / export zilnic, energie încărcată în baterie…": "Small values under the chart: daily import / export, energy charged into the battery…",
 "Adaugă statistică": "Add statistic",
 "Statistică": "Statistic",
 "Senzor": "Sensor",
 "Etichetă": "Label",
 "Personalizare: nume și iconiță": "Customize: name and icon",
 "Mută în sus": "Move up",
 "Mută în jos": "Move down",
 "Șterge": "Delete",
 "Am completat: {n}. Verifică semnele (import / export, încărcare / descărcare) în previzualizare.": "Filled in: {n}. Check the signs (import / export, charge / discharge) in the preview.",
 "Nu am găsit senzori noi de putere. Alege-i manual mai jos.": "No new power sensors found. Pick them manually below.",
 "Aspect și limbă": "Look and language",
 "Temă": "Theme",
 "Limbă": "Language",
 "Acțiuni la atingere": "Tap actions",
 "La atingere": "On tap",
 "La apăsare lungă": "On long press",
 "La dublă atingere": "On double tap",
 "Entitate": "Entity",
 "Card": "Card",
 "Coloane (ecran îngust)": "Columns (narrow screen)",
 "Coloane (ecran lat)": "Columns (wide screen)",
 "Mărime implicită": "Default size",
 "Panou cu chenar": "Panel with border",
 "Butoane": "Buttons",
 "Fiecare buton comandă o entitate: lumină, priză, senzor, climă…": "Each button controls an entity: light, plug, sensor, climate…",
 "Adaugă buton": "Add button",
 "Buton": "Button",
 "Mărime": "Size",
 "Culoarea iconiței": "Icon color",
 "Formă": "Shape",
 "Comutator (doar mărimea l)": "Switch (size l only)",
 "Chips": "Chips",
 "Etichete mici de stare; pot apărea doar când sunt active.": "Small status labels; they can show only when active.",
 "Adaugă chip": "Add chip",
 "Chip": "Chip",
 "Când e pornit arată ca": "When on, show as",
 "Arată valoarea": "Show the value",
 "Ascunde când e oprit": "Hide when off",
 "Antet": "Header",
 "Arată ceasul": "Show the clock",
 "Valori": "Values",
 "Maximum 3 valori în antet.": "Up to 3 values in the header.",
 "Adaugă valoare": "Add value",
 "Valoare": "Value",
 "Culoare": "Color",
 "În dreapta (în loc de ceas)": "On the right (instead of the clock)",
 "Opțional: o valoare afișată în locul ceasului, ex. temperatura de afară.": "Optional: a value shown in place of the clock, e.g. the outdoor temperature.",
 "Atribut (opțional)": "Attribute (optional)",
 "Fixat jos pe ecran": "Fixed at the bottom of the screen",
 "Compact": "Compact",
 "Butoane meniu": "Menu buttons",
 "Fiecare buton duce la o pagină (cale completă, ex. /dashboard-casa/camere).": "Each button opens a page (full path, e.g. /dashboard-home/rooms).",
 "Adresa paginii": "Page address",
 "Începe cu /, ex. /lovelace/0": "Starts with /, e.g. /lovelace/0",
 "Grafic": "Graph",
 "File pentru schimbarea intervalului": "Tabs to change the range",
 "Axa Y": "Y axis",
 "Înălțime (px)": "Height (px)",
 "Serii": "Series",
 "Între 1 și 3 linii pe grafic.": "1 to 3 lines on the graph.",
 "Adaugă serie": "Add series",
 "Serie": "Series",
 "Tip": "Type",
 "Nivelul de încărcare și, opțional, capacitatea și consumul pentru autonomie.": "Charge level and, optionally, capacity and load to estimate runtime.",
 "Consum curent (W)": "Current load (W)",
 "Senzor capacitate": "Capacity sensor",
 "sau capacitate (kWh)": "or capacity (kWh)",
 "Rețea prezentă (senzor binar)": "Grid present (binary sensor)",
 "Rezervă (%)": "Reserve (%)",
 "Oprire (%)": "Shutdown (%)",
 "Arată titlul": "Show the title",
 "Când e oprit, cardul arată „Backup activ”.": "When off, the card shows “Backup active”.",
 "Baterii dispozitive": "Device batteries",
 "Avertisment sub (%)": "Warning below (%)",
 "Critic sub (%)": "Critical below (%)",
 "Ordine": "Order",
 "Dispozitive": "Devices",
 "Senzori de nivel baterie: telefoane, tablete, mașină…": "Battery level sensors: phones, tablets, car…",
 "Adaugă dispozitiv": "Add device",
 "Dispozitiv": "Device",
 "Aspect": "Layout",
 "„family” = avatare mari cu nume și stare.": "“family” = large avatars with name and state.",
 "Vreme": "Weather",
 "Entitatea de prognoză": "Forecast entity",
 "Zile de prognoză": "Forecast days",
 "Plăcuțe afișate": "Tiles shown",
 "Pentru prognoză și pentru cerul din scenă.": "Used for the forecast and for the sky in the scene.",
 "Senzorii stației tale": "Your station sensors",
 "Opțional: valorile curente vin din senzorii tăi, nu din prognoză.": "Optional: current values come from your sensors, not from the forecast.",
 "Temperatură": "Temperature",
 "Viteza vântului": "Wind speed",
 "Direcția vântului": "Wind direction",
 "Intensitatea ploii": "Rain rate",
 "Ploaie azi": "Rain today",
 "Plouă acum": "Raining now",
 "Index UV": "UV index",
 "Radiație solară": "Solar radiation",
 "Subtitlu": "Subtitle",
 "Controale": "Controls",
 "Coloane": "Columns",
 "Termostat / A/C, lumini cu luminozitate, ventilator, media player, număr, selector. Tipul se alege singur după entitate.": "Thermostat / A/C, lights with brightness, fan, media player, number, select. The type is picked from the entity.",
 "Adaugă control": "Add control",
 "Control": "Control",
 "Variantă": "Variant",
 "„simple” = varianta compactă (A/C).": "“simple” = the compact variant (A/C).",
 "Telecomandă": "Remote",
 "Entitatea telecomenzii": "Remote entity",
 "Arată crucea cu OK": "Show the D-pad with OK",
 "Taste proprii": "Custom keys",
 "Ex. Netflix, YouTube: trimit o comandă a telecomenzii.": "E.g. Netflix, YouTube: they send a remote command.",
 "Adaugă tastă": "Add key",
 "Tastă": "Key",
 "Comandă": "Command",
 "Ex. KEY_11 sau numele din integrarea ta.": "E.g. KEY_11 or the name used by your integration.",
 "autonomie {x}": "runtime {x}",
 "Media ultimelor 10 minute": "Average of the last 10 minutes",
 "Puterea de acum": "Current power",
 "Calculează „Plin în” după": "Calculate “Full in” from",
 "Arată autonomia și în timpul încărcării": "Also show the runtime while charging",
 "Media nu sare când trece un nor; citește istoricul din HA.": "The average does not jump when a cloud passes; it reads the HA history.",
 "plin în {x}": "full in {x}",
 "Autonomie sub valoare (pentru procentul bateriei)": "Runtime under the value (for the battery percentage)",
 "Completează consumul și apare autonomia sub procent, ca pe cardul de baterie.": "Fill in the load and the runtime appears under the percentage, as on the battery card.",
 "+ = descărcare, − = încărcare. Cât timp se încarcă, apare „plin în …”.": "+ = discharging, − = charging. While it charges, “full in …” is shown.",
 "Apăsare lungă: altă pagină": "Long press: another page",
 "Adresa la apăsare lungă": "Long-press address",
 "Pe tabletă": "On a tablet",
 "Pe telefon": "On a phone",
 "Merge pe orice dispozitiv; câmpurile de dedesubt au prioritate pe tabletă / telefon.": "Works on any device; the fields below take priority on a tablet / phone.",
 "Ex. pe telefon, apăsat lung pe Home duce la pagina tabletei.": "E.g. on a phone, a long press on Home goes to the tablet page.",
 "Ignoră dispozitivele": "Ignored devices",
 "Alege din listă un dispozitiv pe care nu-l mai folosești (ex. o periuță stricată) sau scrie un cuvânt din nume și apasă Enter.": "Pick a device from the list that you no longer use (e.g. a broken toothbrush) or type a word from its name and press Enter.",
 "Adaugă dispozitive": "Add devices",
 "Senzori adăugați chiar dacă nu sunt găsiți singuri sau sunt ignorați (ex. un senzor de baterie fără tip).": "Sensors added even if they are not found automatically or are ignored (e.g. a battery sensor without a type).",
 "Inactiv: nu se vede pe dashboard": "Inactive: hidden on the dashboard",
 "slabă": "low",
 "Baterii slabe": "Low batteries",
 "Un singur chip, doar când există baterii slabe: arată numărul (sau numele, dacă e una) și, la atingere, deschide ce setezi mai jos.": "A single chip, shown only when there are low batteries: it shows the count (or the name, if there is one) and opens what you set below when tapped.",
 "Arată chip „baterii slabe”": "Show a “low batteries” chip",
 "Prag baterie slabă (%)": "Low battery threshold (%)",
 "Text (opțional)": "Text (optional)",
 "Exclude dispozitivele care conțin": "Exclude devices containing",
 "Include oricum": "Always include",
 "Exclude telefoanele și tabletele": "Exclude phones and tablets",
 "La atingere (ex. deschide lista bateriilor)": "On tap (e.g. open the battery list)",
 "Scrie un cuvânt din numele sau din entity_id și apasă Enter, ex. deye.": "Type a word from the name or entity_id and press Enter, e.g. deye.",
 "Entități adăugate chiar dacă ar fi excluse.": "Entities added even if they would be excluded.",
 "Găsește singur bateriile": "Find batteries automatically",
 "Caută în Home Assistant toate dispozitivele cu baterie (senzori „battery”), fără telefoane și tablete.": "Looks in Home Assistant for every device with a battery (“battery” sensors), without phones and tablets.",
 "Descoperire automată": "Auto-discovery",
 "Arată doar bateriile slabe": "Show only low batteries",
 "Automat (tabletă: complet, telefon: calm)": "Automatic (tablet: full, phone: calm)",
 "Complet (animații continue)": "Full (continuous animations)",
 "Calm (câteva secunde, apoi static)": "Calm (a few seconds, then still)",
 "Ca mișcarea cardului": "Same as the card's motion",
 "Mereu pornit": "Always on",
 "Mișcare (economie de baterie)": "Motion (battery saving)",
 "Efecte vreme (ploaie, nori)": "Weather effects (rain, clouds)",
 "Animația fluxului": "Flow animation",
 "Adresa pe tabletă (opțional)": "Address on a tablet (optional)",
 "Adresa pe telefon (opțional)": "Address on a phone (optional)",
 "Dacă butonul trebuie să ducă în alt loc pe tabletă (ex. Home).": "If the button must go somewhere else on a tablet (e.g. Home).",
 "Dacă butonul trebuie să ducă în alt loc pe telefon.": "If the button must go somewhere else on a phone.",
 "Se vede": "Shown",
 "Oriunde": "Everywhere",
 "Doar pe tabletă": "Tablet only",
 "Doar pe telefon": "Phone only",
 "Radio: „{k}” nu e un entity_id valid.": "Radio: “{k}” is not a valid entity_id.",
 "Radio: „{k}” trebuie să fie din domeniul {d}.": "Radio: “{k}” must be from the {d} domain.",
 "Radio: lipsește „stations” (un select cu posturile).": "Radio: “stations” is missing (a select with the stations).",
 "Playerul nu răspunde": "The player is not responding",
 "Volum": "Volume",
 "Radio": "Radio",
 "Postul anterior": "Previous station",
 "Postul următor": "Next station",
 "Alege selectorul cu posturile; restul e opțional.": "Pick the station selector; the rest is optional.",
 "Selectorul cu posturile": "Station selector",
 "Boxa / playerul": "Speaker / player",
 "Senzor „se redă”": "“Playing” sensor",
 "Un select sau input_select ale cărui opțiuni sunt posturile.": "A select or input_select whose options are the stations.",
 "Pentru volum și pentru a vedea dacă boxa răspunde.": "Used for volume and to see whether the speaker responds.",
 "Dacă lipsește, se folosește starea playerului.": "If missing, the player state is used.",
 "Pornire și oprire": "Start and stop",
 "Un script sau un buton care pornește / oprește radioul. Fără ele se folosește playerul.": "A script or button that starts / stops the radio. Without them the player is used.",
 "Script de pornire": "Start script",
 "Script de oprire": "Stop script",
 "Posturi": "Stations",
 "Ascunde posturile care conțin": "Hide stations containing",
 "Scrie un cuvânt și apasă Enter, ex. Personalizat.": "Type a word and press Enter, e.g. Custom.",
 "Boxe": "Speakers",
 "Boxa principală": "Main speaker",
 "Boxe între care alegi": "Speakers to choose from",
 "Boxa implicită; pentru volum și pentru a vedea dacă răspunde.": "Default speaker; used for volume and to see whether it responds.",
 "Dacă sunt mai multe, apar butoane pentru a alege pe care boxă cântă.": "If there are several, buttons appear to choose which speaker plays.",
 "Rețea": "Grid",
 "Baterie": "Battery",
 "Solar": "Solar",
 "Total": "Total",
 "fără flux": "no flow",
 "Flux: „{k}” are entity_id lipsă sau invalid.": "Flow: \"{k}\" has a missing or invalid entity_id.",
 "Flux: „{k}.{s}” #{n} are entity_id invalid.": "Flow: \"{k}.{s}\" #{n} has an invalid entity_id.",
 "Consumator #{n}: entity_id lipsă sau invalid.": "Consumer #{n}: entity_id is missing or invalid.",
 "Flux: maximum {m} consumatori; restul sunt ignorați.": "Flow: at most {m} consumers; the rest are ignored.",
 "Statistica #{n}: entity_id lipsă sau invalid.": "Stat #{n}: entity_id is missing or invalid.",
 "Baterie: „{k}” nu e un entity_id valid.": "Battery: \"{k}\" is not a valid entity_id.",
 "Baterie: lipsește „soc” (entitatea cu procentul bateriei).": "Battery: \"soc\" is missing (the entity with the battery percentage).",
 "Baterie: „shutdown_pct” e peste „reserve_pct”; le-am inversat.": "Battery: \"shutdown_pct\" is above \"reserve_pct\"; swapped them.",
 "Baterii: elementul #{n} are entity_id lipsă sau invalid.": "Batteries: item #{n} has a missing or invalid entity_id.",
 "Baterii: maximum 12; restul sunt ignorate.": "Batteries: at most 12; the rest are ignored.",
 "oprire invertor": "inverter shutdown",
 "rezervă": "reserve",
 "Backup activ · Rețeaua este oprită": "Backup active · Grid is off",
 "Autonomie": "Runtime",
 "{a} kWh din {b} kWh": "{a} kWh of {b} kWh",
 "— din {b} kWh": "— of {b} kWh",
 "Umiditate": "Humidity",
 "Vânt": "Windy",
 "Ploaie": "Rain",
 "Presiune": "Pressure",
 "Indice UV": "UV index",
 "Radiație": "Radiation",
 "Luminozitate": "Brightness",
 "Punct de rouă": "Dew point",
 "Se simte ca": "Feels like",
 "Rafale": "Gusts",
 "Ploaie ușoară": "Light rain",
 "Ninsoare ușoară": "Light snow",
 "Ninsoare abundentă": "Heavy snow",
 "Lapoviță slabă": "Light sleet",
 "Lapoviță abundentă": "Heavy sleet",
 "Cer senin": "Clear sky",
 "Vânt puternic": "Strong wind",
 " · vânt": " · windy",
 " · vânt puternic": " · strong wind",
 "Azi": "Today",
 "Se simte ca {x}°": "Feels like {x}°",
 "după prognoză": "from forecast",
 "prognoza se încarcă…": "loading forecast…",
 "fără prognoză (adaugă „weather”)": "no forecast (add \"weather\")",
 "redus": "low",
 "moderat": "moderate",
 "ridicat": "high",
 "foarte ridicat": "very high",
 "extrem": "extreme",
 "SV": "SW",
 "V": "W",
 "NV": "NW",
 "Vreme: „{k}” nu e un entity_id valid.": "Weather: \"{k}\" is not a valid entity_id.",
 "Vreme: senzor necunoscut „{k}” ignorat.": "Weather: unknown sensor \"{k}\" ignored.",
 "Vreme: „weather” trebuie să fie o entitate weather.*.": "Weather: \"weather\" must be a weather.* entity.",
 "Vreme: tile necunoscut „{k}”.": "Weather: unknown tile \"{k}\".",
 "Vreme: nu e configurat niciun senzor și nicio entitate weather.": "Weather: no sensor and no weather entity is configured.",
 "Seria #{n}: entity_id lipsă sau invalid.": "Series #{n}: entity_id is missing or invalid.",
 "Grafic: maximum 3 serii; restul sunt ignorate.": "Graph: at most 3 series; the rest are ignored.",
 "Interval necunoscut \"{r}\" → 24h.": "Unknown range \"{r}\" → 24h.",
 "7 zile": "7 days",
 "30 zile": "30 days",
 "se încarcă…": "loading…",
 "fără date istorice": "no historical data",
 "Ultima săptămână": "Last week",
 "Ultimul 30 de zile": "Last 30 days",
 "Ultimile 24 de ore": "Last 24 hours",
 "Ultimile 12 ore": "Last 12 hours",
 "Ultimile {n} ore": "Last {n} hours",
 "Interval": "Range",
 "Azi, {d}": "Today, {d}",
 "Configul nu este un obiect (gol sau tip incorect).": "The config is not an object (empty or wrong type).",
 "Densitate necunoscută \"{v}\" → înlocuită cu \"m\".": "Unknown density \"{v}\" → replaced with \"m\".",
 "Preset necunoscut \"{v}\" → înlocuit cu \"green\".": "Unknown preset \"{v}\" → replaced with \"green\".",
 "Coloane \"{v}\" (neîntreg sau în afară intervalului 1–6) → setate la {c}.": "Columns \"{v}\" (not an integer or outside 1–6) → set to {c}.",
 "Shape \"{v}\" (neacceptat) → setat la \"chamfer\".": "Shape \"{v}\" (not supported) → set to \"chamfer\".",
 "Animations \"{v}\" (neacceptat) → setate la true.": "Animations \"{v}\" (not supported) → set to true.",
 "Entitate #{n}: tip \"{x}\" ignorat.": "Entity #{n}: type \"{x}\" ignored.",
 "Entitate #{n}: lipsește entity_id.": "Entity #{n}: entity_id is missing.",
 "Entitate #{n} ({e}): entity_id invalid.": "Entity #{n} ({e}): invalid entity_id.",
 "Entitate \"{e}\": mărime \"{v}\" ignorată.": "Entity \"{e}\": size \"{v}\" ignored.",
 "Entitate \"{e}\": formă \"{v}\" ignorată.": "Entity \"{e}\": shape \"{v}\" ignored.",
 "Entitate \"{e}\": {k} fără \"action\".": "Entity \"{e}\": {k} without \"action\".",
 "Entitate \"{e}\": culoare {k} nu este șir.": "Entity \"{e}\": color {k} is not a string.",
 "Entitate \"{e}\": culori neacceptate (doar obiect).": "Entity \"{e}\": colors not supported (object only).",
 "call-service fără service.": "call-service without service.",
 "Preset necunoscut \"{v}\" → \"green\".": "Unknown preset \"{v}\" → \"green\".",
 "Culoare necunoscută \"{k}\" ignorată.": "Unknown color \"{k}\" ignored.",
 "Culoarea \"{k}\" (\"{v}\") nu e validă — ignorată.": "Color \"{k}\" (\"{v}\") is not valid — ignored.",
 "Culoarea \"{k}\" nu e validă — ignorată.": "Color \"{k}\" is not valid — ignored.",
 "Chips-urile apar în ordinea în care s-au activat (cel mai vechi primul); când nu mai încap pe un rând, trec pe următorul.": "Chips appear in the order they were activated (oldest first); when they no longer fit on a row, they continue on the next one.",
 "Ordonează după momentul activării": "Sort by activation time",
 "pornit": "on",
 "oprit": "off",
 "deschis": "open",
 "închis": "closed",
 "blocat": "locked",
 "deblocat": "unlocked",
 "se deschide": "opening",
 "se închide": "closing",
 "încălzire": "heating",
 "răcire": "cooling",
 "auto": "auto",
 "redare": "playing",
 "pauză": "paused",
 "inactiv": "idle",
 "în așteptare": "standby",
 "înfundat": "jammed",
 "în funcțiune": "running",
 "alertă": "alert",
 "avertisment": "warning",
 "problemă": "problem",
 "eroare": "error",
 "ok": "ok",
 "normal": "normal",
 "mișcare": "motion",
 "liber": "clear",
 "activ": "active",
 "sus": "up",
 "jos": "down",
 "acasă": "home",
 "plecat": "away",
 "gata": "done",
 "Senin": "Clear",
 "Parțial noros": "Partly cloudy",
 "Noros": "Cloudy",
 "Ceață": "Fog",
 "Ploaie torențială": "Heavy rain",
 "Ninsoare": "Snow",
 "Lapoviță": "Sleet",
 "Furtună": "Thunderstorm",
 "Furtună cu ploaie": "Thunderstorm with rain",
 "Grindină": "Hail",
 "Vânt și nori": "Windy and cloudy",
 "Fenomen deosebit": "Exceptional weather",
 "produs azi": "produced today",
 "radiație": "radiation",
 "Producție azi și radiație": "Production today and radiation",
 "Un rând mic sub titlu, cu iconiță de soare. Opțional.": "A small row under the title, with a sun icon. Optional.",
 "Energie produsă azi (kWh)": "Energy produced today (kWh)",
 "Radiație solară (W/m²)": "Solar radiation (W/m²)",
 "La atingere (ex. deschide pagina graficului)": "On tap (e.g. open the graph's page)",
 "Cronologie: un rând pe serie (pornit / oprit)": "Timeline: one row per series (on / off)",
 "Până la 8 rânduri, unul pe serie.": "Up to 8 rows, one per series.",
 "Grafic: maximum 8 serii (cronologie); restul sunt ignorate.": "Graph: at most 8 series (timeline); the rest are ignored.",
 "indisponibil": "unavailable",
 "Cronologie: ascunde durata de pe bare și totalul pe rând": "Timeline: hide the duration on the bars and the total per row",
 "Arată energia produsă azi": "Show the energy produced today",
 "Rând mic sub titlu, cu iconiță de soare.": "A small row under the title, with a sun icon.",
 "Senzor energie produsă azi (kWh)": "Energy produced today sensor (kWh)",
 "Arată radiația solară": "Show the solar radiation",
 "Doar dacă ai o stație meteo sau un senzor de radiație.": "Only if you have a weather station or a radiation sensor.",
 "Senzor radiație solară (W/m²)": "Solar radiation sensor (W/m²)",
 "Consum din mai multe circuite": "Load from several circuits",
 "Arată „Plin în” cât se încarcă": "Show “Full in” while charging",
 "+ = descărcare, − = încărcare.": "+ = discharging, − = charging.",
 "Arată autonomia sub valoare (pentru procentul bateriei)": "Show the runtime under the value (for the battery percentage)",
 "Adresă diferită pe tabletă și pe telefon": "Different address on a tablet and on a phone",
 "Adresa pe tabletă": "Address on a tablet",
 "Adresa pe telefon": "Address on a phone",
 "Ex. Home duce la pagina tabletei.": "E.g. Home goes to the tablet page.",
 "Ex. Home duce la pagina telefonului.": "E.g. Home goes to the phone page.",
 "Arată textul lângă valori („produs azi”, „radiație”)": "Show the text next to the values (“produced today”, “radiation”)",
 "Mașina #{n} nu e un obiect.": "Vehicle #{n} is not an object.",
 "Mașina „{v}”, documentul #{n}: pentru km trebuie „remaining” sau „odometer” + „last_km”.": "Vehicle “{v}”, document #{n}: for km you need “remaining” or “odometer” + “last_km”.",
 "Mașina „{v}”, documentul #{n}: lipsește „entity” (o dată) sau „odometer” / „remaining” (km).": "Vehicle “{v}”, document #{n}: “entity” (a date) or “odometer” / “remaining” (km) is missing.",
 "Mașina {n}": "Vehicle {n}",
 "Mașini": "Vehicles",
 "Ulei": "Oil",
 "Document": "Document",
 "Setează data": "Set the date",
 "depășit cu {n} km": "overdue by {n} km",
 "în {n} km": "in {n} km",
 "la {n} km": "at {n} km",
 "Schimbat acum": "Changed now",
 "expirat de o zi": "expired a day ago",
 "expirat de {n} zile": "expired {n} days ago",
 "Data de expirare": "Expiry date",
 "Un helper „dată” (se poate modifica din card) sau un senzor cu dată, ex. revizia din mașină.": "A “date” helper (editable from the card) or a sensor with a date, e.g. the service date from the car.",
 "Pentru kilometri (ulei, revizie)": "For kilometers (oil, service)",
 "Kilometraj (senzor)": "Odometer (sensor)",
 "Kilometri la ultima schimbare (număr)": "Kilometers at the last change (number)",
 "sau: kilometri rămași (senzor)": "or: kilometers left (sensor)",
 "Interval (km)": "Interval (km)",
 "Cu butonul „Schimbat acum” de pe card primește kilometrajul curent.": "The “Changed now” button on the card sets it to the current odometer.",
 "Fiecare mașină are documentele ei: RCA, ITP, rovinietă, revizie / ulei.": "Each vehicle has its own documents: insurance, inspection, road tax, service / oil.",
 "Adaugă mașină": "Add vehicle",
 "Mașină": "Vehicle",
 "Număr de înmatriculare (opțional)": "License plate (optional)",
 "Documente": "Documents",
 "Adaugă document": "Add document",
 "Scrie numele mașinii ca să poți adăuga documente.": "Type the vehicle name to be able to add documents.",
 "Termene mașini": "Vehicle deadlines",
 "Un chip cât timp un termen (RCA, ITP, rovinietă, ulei) se apropie sau a expirat; arată documentul și termenul, sau numărul.": "A chip while a deadline (insurance, inspection, road tax, oil) is close or has passed; it shows the document and its deadline, or the count.",
 "Arată chip „termene mașini”": "Show a “vehicle deadlines” chip",
 "Alertă cu câte zile înainte": "Alert how many days before",
 "La atingere (ex. deschide pagina Mașini)": "On tap (e.g. open the Vehicles page)",
 "Alertă la câți km rămași": "Alert at how many km left",
 "Termenul devine portocaliu (și apare în chip) cu atâtea zile înainte.": "The deadline turns orange (and shows in the chip) this many days before."
};

/** Dicționare pe limbă (ro = identitate). Adaugă aici alte limbi: DICT.de = { 'Pornit': 'Ein', … } (ce lipsește cade pe engleză). */
const DICT = { en: EN };

let LANG = 'en';

/** Setează limba din cod (ro, en, de…) sau dintr-un obiect hass / un șir gen „ro-RO”. */
function setLang(l) {
  const code = String(l && typeof l === 'object' ? (l.locale && l.locale.language) || l.language || '' : l || '').toLowerCase().slice(0, 2);
  LANG = code === 'ro' || DICT[code] ? code : 'en';
  return LANG;
}
function getLang() { return LANG; }

function t(ro, vars) {
  let s = LANG === 'ro' ? ro : ((DICT[LANG] && DICT[LANG][ro]) !== undefined ? DICT[LANG][ro] : (EN[ro] !== undefined ? EN[ro] : ro));
  if (vars) s = String(s).replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? String(vars[k]) : m));
  return s;
}

/** Locale pentru Intl (zile, luni, numere): ro-RO sau limba curentă. */
function intlLocale() { return LANG === 'ro' ? 'ro-RO' : LANG; }

/** Separatorul zecimal al limbii curente (ro: „,”; en: „.”). */
function decSep() {
  if (LANG === 'ro') return ',';
  try { return (1.1).toLocaleString(intlLocale()).charAt(1) || '.'; } catch (e) { return '.'; }
}

/** Separatorul de mii al limbii curente (ro: spațiu subțire; en: „,”). */
function thouSep() {
  if (LANG === 'ro') return ' ';
  try { const g = (10000).toLocaleString(intlLocale()).charAt(2); return g && !/\d/.test(g) ? g : ','; } catch (e) { return ','; }
}

/** Ziua săptămânii, formă scurtă, în limba curentă (ro: Du Lu Ma Mi Jo Vi Sâ). */
function weekdayShort(d) {
  if (LANG === 'ro') return ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'][d.getDay()];
  try { const s = d.toLocaleDateString(intlLocale(), { weekday: 'short' }).replace(/\./g, ''); return s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { return ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][d.getDay()]; }
}

/** Luna (0–11), formă scurtă, în limba curentă. */
function monthShort(i) {
  if (LANG === 'ro') return ['Ian', 'Feb', 'Mar', 'Apr', 'Mai', 'Iun', 'Iul', 'Aug', 'Sep', 'Oct', 'Noi', 'Dec'][i];
  try { const s = new Date(2000, i, 1).toLocaleDateString(intlLocale(), { month: 'short' }).replace(/\./g, ''); return s.charAt(0).toUpperCase() + s.slice(1); } catch (e) { return String(i + 1); }
}

return { DICT, setLang, getLang, t, intlLocale, decSep, thouSep, weekdayShort, monthShort };
})();

__m["config"] = (() => {
const { t } = __m["i18n"];
// src/config.mjs — validare și normalizare config pentru ccu-buttons-card

/**
 * Normalizează config-ul primit din HA. Returnează {config, warnings[]}.
 * Acceptă forma scurtă (entities: [entity_id]) sau lungă (entities: [{entity, name, ...}]).
 */
function normalizeConfig(cfg) {
  const warnings = [];

  // Validare inițială: cfg trebuie să fie obiect
  if (!cfg || typeof cfg !== 'object') {
    return {
      config: { entities: [] },
      warnings: [t('Configul nu este un obiect (gol sau tip incorect).')]
    };
  }

  // Extrage entitățile, fie din cfg.entities fie din prima proprie (pentru flexibilitate)
  let entities = Array.isArray(cfg.entities) ? cfg.entities : [];
  if (entities.length === 0 && cfg.entity) {
    entities = Array.isArray(cfg.entity) ? cfg.entity : [cfg.entity];
  }

  // Normalizare entități (scurt/lung format)
  const normalizedEntities = entities.map((e, idx) => normalizeEntity(e, idx));
  // normalizedEntities este array de {entity, warnings[]}
  let cleanEntities = [];
  for (const ne of normalizedEntities) {
    if (Array.isArray(ne.warnings)) {
      warnings.push(...ne.warnings);
    }
    // doar entitățile cu entity valid (sau entity_id setat) ajung în config
    if (ne.entity.entity) {
      cleanEntities.push(ne.entity);
    }
  }

  // Config final: completează implicit, păstrează ceea ce primește
  const config = {
    // implicite
    density: cfg.density ?? 'm',      // xs|s|m|l|xl
    preset: cfg.preset ?? 'green',     // green|calm|contrast|mono|warm|light
    animations: normalizeAnimations(cfg.animations, warnings),
    columns: normalizeColumns(cfg.columns),

    // entități (normalizate)
    entities: cleanEntities,

    // alte setări opționale (nu le modificăm, le pasăm la render)
    title: cfg.title,
    theme: cfg.theme,
    // … altele (ex: refresh_minutes, tabs, colors, shape, size etc.) rămân nemodificate
  };

  // Validare densitate
  if (!['xs', 's', 'm', 'l', 'xl'].includes(config.density)) {
    config.density = 'm';
    warnings.push(t('Densitate necunoscută "{v}" → înlocuită cu "m".', { v: cfg.density }));
  }

  // Validare preset
  if (!['green', 'calm', 'contrast', 'mono', 'warm', 'light'].includes(config.preset)) {
    config.preset = 'green';
    warnings.push(t('Preset necunoscut "{v}" → înlocuit cu "green".', { v: cfg.preset }));
  }

  // Validare columns (a fost deja normalizată, dar putem adăuga warning dacă s-a schimbat)
  if (config.columns !== cfg.columns && cfg.columns !== undefined) {
    warnings.push(t('Coloane "{v}" (neîntreg sau în afară intervalului 1–6) → setate la {c}.', { v: cfg.columns, c: config.columns }));
  }

  // Copiază TOATE cheile necunoscute din cfg (ex: colors, shape, size, header, refresh_minutes, tabs)
  for (const key of Object.keys(cfg)) {
    if (!['entities', 'entity', 'density', 'preset', 'animations', 'columns', 'title', 'theme'].includes(key)) {
      if (config[key] === undefined) {
        config[key] = cfg[key];
      }
    }
  }

  // Validare și normalizare shape (punct b): dacă invalid, -> 'chamfer' + warning
  if (config.shape !== undefined) {
    if (!['chamfer', 'round', 'pill', 'square'].includes(config.shape)) {
      warnings.push(t('Shape "{v}" (neacceptat) → setat la "chamfer".', { v: config.shape }));
      config.shape = 'chamfer';
    }
  }

  // Setează size și shape implicite pentru entități (punct 8)
  // fără size → size = config.density
  // fără shape → shape = config.shape sau 'chamfer'
  const density = config.density;
  const shape = config.shape || 'chamfer';
  for (const ent of config.entities) {
    if (!ent.size) ent.size = density;
    if (!ent.shape) ent.shape = shape;
  }

  return { config, warnings };
}

/**
 * Normalizare `animations`: true/false/'on'/'off' → boolean; altul → true + warning.
 */
function normalizeAnimations(v, warnings) {
  if (v === undefined || v === null) return true; // lipsă = implicit, fără avertisment
  if (typeof v === 'boolean') return v;
  if (v === 'on' || v === true) return true;
  if (v === 'off' || v === false) return false;
  // alt tip (ex: 'x', 5, [], etc.) → true + warning
  warnings.push(t('Animations "{v}" (neacceptat) → setate la true.', { v }));
  return true;
}

/**
 * Normalizare `columns`: întreg 1–6, altfel warning cu valoarea primită + implicit 2.
 */
function normalizeColumns(v) {
  if (typeof v === 'number' && Number.isInteger(v) && v >= 1 && v <= 6) {
    return v;
  }
  // alt tip sau în afară intervalului
  return 2; // implicit
}

/**
 * Normalizează o singură entitate (sau șir cu entity_id).
 * Returnează {entity, warnings[]}.
 */
function normalizeEntity(e, idx) {
  const warnings = [];
  let entity = {};

  // Forma scurtă (șir) → extinde în obiect
  if (typeof e === 'string') {
    entity = { entity: e };
  } else if (typeof e === 'object' && e !== null) {
    entity = { ...e };
  } else {
    // tip neșir/neobiect → se elimină din listă, cu warning
    warnings.push(t('Entitate #{n}: tip "{x}" ignorat.', { n: idx + 1, x: typeof e }));
    return { entity: {}, warnings };
  }

  // entity_id (obligatoriu) — poate fi entity sau id (alias)
  if (!entity.entity && entity.id) {
    entity.entity = entity.id;
  }
  if (!entity.entity) {
    // entitate fără entity_id
    warnings.push(t('Entitate #{n}: lipsește entity_id.', { n: idx + 1 }));
    return { entity: {}, warnings };
  }

  // Validare entity_id cu /^[a-z_]+\.[a-z0-9_]+$/
  const entityId = String(entity.entity);
  const entityIdPattern = /^[a-z_]+\.[a-z0-9_]+$/;
  if (!entityIdPattern.test(entityId)) {
    warnings.push(t('Entitate #{n} ({e}): entity_id invalid.', { n: idx + 1, e: entityId }));
    return { entity: {}, warnings };
  }

  // nume (implicit: entity_id fără prefix)
  if (!entity.name) {
    const id = entity.entity || `entity_${idx}`;
    entity.name = id.replace(/^[^.]+\./, '').replace(/_/g, ' ');
  }

  // icon (implicit: icon din entitate, dar pentru grafic vom pune placeholder)
  if (!entity.icon && entity.entity) {
    const domain = entity.entity.split('.')[0];
    entity.icon = domainIcon(domain);
  }

  // mărime (density per buton, suprascrie config-ul); dacă lipsește → null (se completează ulterior)
  if (!entity.size) {
    entity.size = null; // se va completa cu config.density
  } else if (!['xs', 's', 'm', 'l', 'xl'].includes(entity.size)) {
    warnings.push(t('Entitate "{e}": mărime "{v}" ignorată.', { e: entity.name, v: entity.size }));
    delete entity.size;
  }

  // formă (shape); dacă lipsește → null (se completează ulterior)
  if (!entity.shape) {
    entity.shape = null; // se va completa cu config.shape sau 'chamfer'
  } else if (!['chamfer', 'round', 'pill', 'square'].includes(entity.shape)) {
    warnings.push(t('Entitate "{e}": formă "{v}" ignorată.', { e: entity.name, v: entity.shape }));
    delete entity.shape;
  }

  // secondary text: funcție sau șir (pentru viitor, când vom suporta template)
  // aici îl lăsăm așa cum e (interpretat ulterior în render sau state)

  // acțiuni (tap/hold/double_tap)
  ['tap_action', 'hold_action', 'double_tap_action'].forEach(k => {
    if (entity[k] && typeof entity[k] !== 'string') {
      // acceptă șir (ex: "toggle") sau obiect cu action: șir
      if (typeof entity[k] === 'object') {
        if (!entity[k].action) {
          warnings.push(t('Entitate "{e}": {k} fără "action".', { e: entity.name, k }));
        }
      }
    }
  });

  // culori (suprascriere CSS vars)
  if (entity.colors) {
    // acceptă obiect simplu, ex: { accent: "#ff0000" }
    if (typeof entity.colors === 'object' && !Array.isArray(entity.colors)) {
      // validare valori color (hex/nume)
      for (const [k, v] of Object.entries(entity.colors)) {
        if (typeof v !== 'string') {
          warnings.push(t('Entitate "{e}": culoare {k} nu este șir.', { e: entity.name, k }));
        }
      }
    } else {
      warnings.push(t('Entitate "{e}": culori neacceptate (doar obiect).', { e: entity.name }));
      delete entity.colors;
    }
  }

  return { entity, warnings };
}

/**
 * Mapare domeniu HA → iconiță implicită (pentru entități fără icon explicit).
 * Folosit la parsing config, nu depinde de theme.js.
 */
function domainIcon(domain) {
  const map = {
    light: 'mdi:lightbulb',
    switch: 'mdi:power-socket',
    fan: 'mdi:fan',
    lock: 'mdi:lock',
    cover: 'mdi:window-shutter',
    sensor: 'mdi:eye',
    binary_sensor: 'mdi:checkbox-marked',
    climate: 'mdi:thermostat',
    water_heater: 'mdi:water-heater',
    media_player: 'mdi:speaker',
    button: 'mdi:button-pointer',
    input_boolean: 'mdi:toggle-switch',
    input_button: 'mdi:button-pointer'
  };
  return map[domain] ?? 'mdi:ellipse-outline';
}

/**
 * Parsează acțiunea în obiect standard: { action, service, domain, entity_id, ... }.
 * Dacă obiect fără action și fără service → 'toggle' implicit;
 * call-service fără service → warning.
 */
function normalizeAction(action) {
  if (!action) return { action: 'none' };
  if (typeof action === 'string') {
    return { action };
  }
  if (typeof action === 'object') {
    const a = { ...action };
    if (!a.action && !a.service) {
      a.action = 'toggle'; // implicit
    } else if (!a.action && (a.service || a.perform_action)) {
      a.action = 'call-service';
    }
    return a;
  }
  return { action: 'none' };
}

/**
 * validează o acțiune și returnează warnings (string[]).
 * Se folosește în config pentru validarea tap/hold/double_tap.
 */
function validateAction(a) {
  const warnings = [];
  if (!a) return warnings;

  const action = typeof a === 'object' ? a : { action: a };

  if (typeof action === 'object') {
    if (action.action === 'call-service' && !action.service && !action.perform_action) {
      warnings.push(t('call-service fără service.'));
    }
    // obiect fără action și fără service → 'toggle' implicit (nu generează warning)
  }
  return warnings;
}

// Export pentru testare (funcțiile neexportate direct)
/**
 * Dispozitivul: „phone” când latura mică a ecranului e sub 600 px (indiferent de orientare), altfel „tablet” (și PC / iPad).
 * `override` = „phone” | „tablet” (opțiunea `device:` a cardului) ocolește detectarea.
 */
function deviceKind(override) {
  if (override === 'phone' || override === 'tablet') return override;
  const s = typeof screen !== 'undefined' && screen ? screen : null;
  return s && Math.min(s.width || 9999, s.height || 9999) < 600 ? 'phone' : 'tablet';
}

/** `motion`: auto | full | calm | off (altceva → auto). `weather_effects` / `flow_animation`: auto | on | off. */
const MOTION_VALUES = ['auto', 'full', 'calm', 'off'];
function normalizeMotion(v) { const s = String(v === undefined || v === null ? 'auto' : v).toLowerCase(); return MOTION_VALUES.includes(s) ? s : 'auto'; }
function normalizeSwitch(v) { const s = String(v === undefined || v === null ? 'auto' : v).toLowerCase(); return s === 'on' || s === 'true' ? 'on' : s === 'off' || s === 'false' ? 'off' : 'auto'; }

/**
 * Cât de mult se mișcă cardul. `narrow` = ecran de telefon (latura mică < 600 px).
 * motion: full (animații continue) | calm (câteva secunde, apoi static până la o nouă schimbare) | off | auto (tabletă/PC → full, telefon → calm).
 * `animations: false` = off peste tot. weather_effects / flow_animation: on = full, off = off, auto = ca motion.
 * Întoarce { anim, fx, flow }, fiecare 'full' | 'calm' | 'off'.
 */
function resolveMotion(cfg, narrow) {
  const c = cfg && typeof cfg === 'object' ? cfg : {};
  if (c.animations === false || c.animations === 'off') return { anim: 'off', fx: 'off', flow: 'off' };
  const m = normalizeMotion(c.motion);
  const base = m === 'auto' ? (narrow ? 'calm' : 'full') : m;
  const pick = (v) => { const s = normalizeSwitch(v); return s === 'on' ? 'full' : s === 'off' ? 'off' : base; };
  return { anim: base, fx: pick(c.weather_effects), flow: pick(c.flow_animation) };
}

return { normalizeEntity, domainIcon, normalizeAnimations, normalizeColumns, validateAction, normalizeMotion, normalizeSwitch, normalizeConfig, normalizeAction, deviceKind, resolveMotion };
})();

__m["state"] = (() => {
const { t, decSep, thouSep } = __m["i18n"];
// stările text ale entităților (limba sursă: româna; t() le traduce)
const STATE_TXT = { on: 'pornit', off: 'oprit', open: 'deschis', closed: 'închis', locked: 'blocat', unlocked: 'deblocat', opening: 'se deschide', closing: 'se închide',
  heat: 'încălzire', cool: 'răcire', heat_cool: 'auto', auto: 'auto', playing: 'redare', paused: 'pauză', idle: 'inactiv', standby: 'în așteptare', jammed: 'înfundat',
  running: 'în funcțiune', alert: 'alertă', warning: 'avertisment', problem: 'problemă', error: 'eroare', ok: 'ok', normal: 'normal' };
const lab = (st) => (STATE_TXT[st] !== undefined ? t(STATE_TXT[st]) : st);
// src/state.mjs — stateOf, secondaryText pentru ccu-buttons-card

/**
 * Determină starea vizuală a unei entități în funcție de starea HA și de o regulă opțională.
 * Returnează: 'on' | 'off' | 'alert' | 'ok' | 'unavailable'
 *
 * Reguli:
 * - light/switch/fan/climate/cover/binary_sensor: 'on' dacă starea e 'on', 'open', 'unlocked', etc.
 * - sensor: 'off' (neutru) fără praguri, 'alert' în afara lor, 'ok' în interval; 'unavailable' dacă non-numeric
 * - alert: setat explicit sau dedus (ex: binary_sensor cu stare 'problem')
 * - ok: pentru senzori în rangul acceptat (ex: temp 18–24°C)
 *
 * Domeniu:
 * - rule.domain (ex: {domain: 'lock'}) are prioritate
 * - rule.entity_id (ex: 'lock.usa') → domeniul se extrage din prefix
 * - dacă lipsesc, se deduce din stare (ex: 'locked' → 'lock', 'heating' → 'climate')
 */
function stateOf(entityState, rule) {
  // dacă entityState e obiect, extrage state/entity_id/device_class din el
  const stateObj = typeof entityState === 'object' && entityState !== null ? entityState : { state: entityState };
  const state = String(stateObj.state ?? stateObj).trim().toLowerCase();
  const entityId = rule?.entity_id ?? stateObj.entity_id;
  const deviceClass = rule?.device_class ?? stateObj.attributes?.device_class ?? '';
  const ruleDomain = rule?.domain;

  // șir gol/spații → unavailable (Number('') nu se folosește ca număr)
  if (state === '') {
    return 'unavailable';
  }

  // Domeniu din regulă (ex: 'light', 'sensor') sau dedus din state (ex: 'unavailable')
  // și/sau din entity_id (ex: 'lock.usa' → 'lock')
  const domain = ruleDomain || (entityId ? entityId.split('.')[0] : detectDomain(state));

  // Stări unavailable
  if (['unavailable', 'unknown', 'none', 'no_state', 'no entity'].includes(state)) {
    return 'unavailable';
  }

  // Domeniu-specific logic
  switch (domain) {
    case 'light':
    case 'switch':
    case 'fan':
    case 'cover':
    case 'lock':
    case 'valve':
      // lock: unlocked/unlocking/jammed → alert; locked → off
      if (domain === 'lock') {
        if (state === 'locked') return 'off';
        if (['unlocked', 'unlocking', 'jammed'].includes(state)) return 'alert';
        return state === 'on' ? 'on' : 'off';
      }
      return state === 'on' ? 'on' : state === 'off' ? 'off' : visualState(state);

    case 'binary_sensor': {
      // binary_sensor cu device_class: smoke, gas, moisture, problem, safety, tamper, carbon_monoxide, heat, cold
      // și starea 'on' → 'alert'; altfel: inferState
      // deviceClass: rule.device_class (prioritar) sau entityState.attributes.device_class
      const deviceClass = rule?.device_class ?? entityState?.attributes?.device_class ?? '';
      const alertClasses = ['smoke', 'gas', 'moisture', 'problem', 'safety', 'tamper', 'carbon_monoxide', 'heat', 'cold'];
      if (state === 'on' && alertClasses.includes(deviceClass)) {
        return 'alert';
      }
      return state === 'on' ? 'on' : state === 'off' ? 'off' : visualState(state);
    }

    case 'sensor': {
      // stare TEXT legitimă (ex. „running”, „Ultima zi”) = neutru, nu „indisponibil” (indisponibil/unknown au fost tratate mai sus)
      const r = inferSensorState(state, rule);
      return r === 'unavailable' ? 'off' : r;
    }
    case 'number':
    case 'input_number':
    case 'input_text':
      return inferSensorState(state, rule);

    case 'climate':
    case 'hvac':
    case 'water_heater':
      return inferClimateState(state, rule);

    case 'weather':
      return 'off'; // condiția meteo e informație, nu „activ”

    case 'sun':
    case 'person':
    case 'device_tracker':
      // person: home→on, not_home→off
      // sun: above_horizon→on, below_horizon→off
      // device_tracker: home→on, altfel off
      if (domain === 'person') {
        return state === 'home' ? 'on' : state === 'not_home' ? 'off' : 'on';
      }
      if (domain === 'sun') {
        return state === 'above_horizon' ? 'on' : 'off';
      }
      if (domain === 'device_tracker') {
        return state === 'home' ? 'on' : 'off';
      }
      return state === 'on' ? 'on' : 'off';

    default:
      return visualState(state);
  }
}

/**
 * Detectează domeniul dintr-o stare HA (ex: 'unavailable' → 'generic', 'locked' → 'lock').
 */
function detectDomain(state) {
  if (state === 'unavailable' || state === 'unknown') return 'generic';
  if (['locked', 'unlocking', 'unlocked', 'jammed'].includes(state)) return 'lock';
  if (['open', 'opened', 'closing', 'closed'].includes(state)) return 'cover';
  if (['running', 'idle', 'heating', 'cooling', 'off'].includes(state)) return 'climate';
  if (['enabled', 'disabled'].includes(state)) return 'binary_sensor';
  return 'generic';
}

/**
 * Inferă starea pentru senzori (valori numerice, threshold-uri).
 */
function inferSensorState(state, rule) {
  // Dacă este non-numeric, return 'unavailable' (nu 'off')
  const value = Number(state);
  if (isNaN(value)) {
    // Poate fi 'high'/'low' pentru binary_sensor, dar pentru sensor → 'unavailable'
    if (['high', 'low', 'open', 'closed', 'on', 'off'].includes(state)) {
      return state === 'on' || state === 'high' || state === 'open' ? 'on' : 'off';
    }
    return 'unavailable';
  }

  // Threshold-uri din regulă
  const alertAbove = rule?.alert_above ?? Infinity;
  const alertBelow = rule?.alert_below ?? -Infinity;
  // okAbove/okBelow implicite NU există — doar dacă sunt setate în regulă
  const okAbove = rule?.ok_above;
  const okBelow = rule?.ok_below;

  if (value > alertAbove || value < alertBelow) {
    return 'alert';
  }
  // dacă okAbove/okBelow sunt setate și valoarea e în interval → 'ok', altfel 'off'
  if (okAbove !== undefined && okBelow !== undefined && value >= okAbove && value <= okBelow) {
    return 'ok';
  }
  // fără praguri deloc → 'off' (neutru)
  return 'off';
}

/**
 * Inferă starea pentru climate/hvac.
 */
function inferClimateState(state) {
  if (['on', 'heat', 'cool', 'auto'].includes(state)) return 'on';
  if (['off', 'idle'].includes(state)) return 'off';
  if (['unavailable', 'unknown'].includes(state)) return 'unavailable';
  if (['problem', 'error'].includes(state)) return 'alert';
  return 'ok';
}

/**
 * Inferă starea generală (light/switch/fan etc.).
 */
/**
 * Starea VIZUALĂ ('on'|'off'|'alert'|'ok'|'unavailable') pentru stări de entități fără regulă proprie (group, input_boolean, automation, valve…).
 * (inferState de mai jos TRADUCE stările în română pentru texte; nu se folosește pentru stilul plăcii.)
 */
function visualState(state) {
  const s = String(state).trim().toLowerCase();
  if (['unavailable', 'unknown', 'none', 'no_state', ''].includes(s)) return 'unavailable';
  if (['alert', 'warning', 'problem', 'error', 'triggered', 'jammed', 'unlocking', 'tamper'].includes(s)) return 'alert';
  if (['ok', 'normal'].includes(s)) return 'ok';
  if (['off', 'closed', 'locked', 'idle', 'standby', 'paused', 'not_home', 'inactive', 'stopped', 'disarmed', 'clear'].includes(s)) return 'off';
  return 'on'; // on, open, opening, closing, unlocked, running, playing, active, home, heating, charging…
}

function inferState(state) {
  return lab(state);
}

/**
 * Generează textul secundar pentru o entitate.
 * Exemple: '24,6 °C', '75 %', '1,2 kW', 'open', 'locked'.
 * Semnătură: secondaryText(entity, hass)
 *
 * Reguli:
 * - dacă entitate are unit_of_measurement → folosește-l
 * - pentru climate: temperatură curentă + stare
 * - pentru binary_sensor: 'open'/'closed'/'on'/'off'
 * - altfel: valoare cu unitate sau stare
 * - hass?: config.unit_system.temperature (implicit '°C')
 */
function secondaryText(entity, hass) {
  if (!entity) return '—';

  const state = entity.state;
  // Orice domeniu cu stare unavailable/unknown/gol → '—'
  if (state === undefined || state === null || state === '' || ['unavailable', 'unknown'].includes(String(state))) {
    return '—';
  }

  // Domeniu
  const domain = entity.entity_id?.split('.')[0] || entity.domain || 'generic';

  // senzor de tip timestamp (ex. timpul rămas al mașinii de spălat = ora de final): „38 min” / „1 h 5 min” / „gata”
  if (domain === 'sensor' && /^\d{4}-\d\d-\d\dT\d\d:\d\d/.test(String(state))) {
    const mins = Math.round((Date.parse(state) - Date.now()) / 60000);
    if (Number.isFinite(mins)) return mins <= 0 ? t('gata') : mins < 60 ? `${mins} min` : `${Math.floor(mins / 60)} h ${mins % 60} min`;
  }

  // Valoare numerică
  const value = Number(state);
  const numeric = !isNaN(value);

  // Unitate din entitate sau din hass.attributes
  let unit = entity.attributes?.unit_of_measurement || entity.unit || '';

  switch (domain) {
    case 'weather': {
      const W = { sunny: t('Senin'), 'clear-night': t('Senin'), partlycloudy: t('Parțial noros'), cloudy: t('Noros'), fog: t('Ceață'), rainy: t('Ploaie'), pouring: t('Ploaie torențială'), snowy: t('Ninsoare'),
        'snowy-rainy': t('Lapoviță'), lightning: t('Furtună'), 'lightning-rainy': t('Furtună cu ploaie'), hail: t('Grindină'), windy: t('Vânt'), 'windy-variant': t('Vânt și nori'), exceptional: t('Fenomen deosebit') };
      const tmp = Number(entity.attributes && entity.attributes.temperature);
      const tu = (entity.attributes && entity.attributes.temperature_unit) || '°';
      return `${W[state] || state}${Number.isFinite(tmp) ? ` ${formatNumber(tmp)}${tu === '°C' || tu === '°F' ? '°' : tu}` : ''}`;
    }

    case 'sensor':
    case 'number':
    case 'input_number': {
      // pentru domenii numerice: unavailable/unknown/gol/non-numerică → '—' (nu „NaN W” / „unavailable W”)
      if (!numeric || isNaN(value)) {
        // EXCEPȚIE: un `sensor` poate avea stare TEXT legitimă (stare mașină „running”, „Ultima zi”, „partlycloudy”): se arată textul, fără „_”
        const t = String(state).trim();
        if (domain === 'sensor' && t !== '' && !['unavailable', 'unknown', 'none', 'no_state'].includes(t.toLowerCase())) return t.replace(/_/g, ' ');
        return '—';
      }
      const formatted = formatNumber(value);
      return unit ? `${formatted} ${unit}` : formatted;
    }

    case 'climate':
    case 'hvac':
    case 'water_heater': {
      const temp = numeric ? formatNumber(value) : state;
      const unit = entity.attributes?.unit_of_measurement || hass?.config?.unit_system?.temperature || '°C';
      const currentTemp = entity.attributes?.current_temperature;
      // dacă nu are current_temperature, afișează starea tradusă, fără unitate
      if (currentTemp === undefined) {
        return lab(state);
      }
      return `${formatNumber(currentTemp)} ${unit}`;
    }

    case 'media_player': {
      // media_player: playing→redare, paused→pauză, idle→inactiv, off→oprit, on→pornit
      return lab(state);
    }

    case 'light':
    case 'switch':
    case 'fan':
    case 'cover':
    case 'lock':
    case 'valve': {
      if (numeric) {
        return unit ? `${formatNumber(value)} ${unit}` : state;
      }
      // traduceri românești pentru stări text
      return lab(state);
    }

    case 'binary_sensor': {
      // pentru device_class: entity.attributes.device_class (pentru secondaryText)
      // în secondaryText NU există variabila `rule` (parametrii sunt entity, hass)
      // fallback: dacă nu în attributes, încearcă entity.device_class direct
      const deviceClass = entity?.attributes?.device_class ?? entity?.device_class ?? '';
      // door/window/opening/garage_door: deschis/închis
      if (['door', 'window', 'opening', 'garage_door'].includes(deviceClass)) {
        return state === 'on' ? t('deschis') : state === 'off' ? t('închis') : state;
      }
      // motion/occupancy/presence: mișcare/liber
      if (['motion', 'occupancy', 'presence'].includes(deviceClass)) {
        return state === 'on' ? t('mișcare') : state === 'off' ? t('liber') : state;
      }
      // smoke/gas/moisture/problem/safety/tamper: alertă/ok
      if (['smoke', 'gas', 'moisture', 'problem', 'safety', 'tamper', 'carbon_monoxide', 'heat', 'cold'].includes(deviceClass)) {
        return state === 'on' ? t('alertă') : state === 'off' ? t('ok') : state;
      }
      // implicit: activ/inactiv
      return state === 'on' ? t('activ') : state === 'off' ? t('inactiv') : state;
    }

    case 'input_text': {
      return state;
    }

    case 'sun': {
      return state === 'above_horizon' ? t('sus') : t('jos');
    }

    case 'person':
    case 'device_tracker': {
      if (state === 'home') return t('acasă');
      if (state === 'not_home') return t('plecat');
      return state;
    }

    default: {
      if (numeric) {
        return unit ? `${formatNumber(value)} ${unit}` : state;
      }
      return state;
    }
  }
}

/**
 * Formatează un număr românesc (virgulă zecimală, separator de mii).
 * - zecimale: |x|≥100 → 0, ≥10 → 1, altfel 2 (fără zerouri finale)
 * - după rotunjire, dacă rezultatul e 0 → '0' (fără minus)
 * - |x| ≥ 1e15 sau nefinit → '—'
 * - separator de mii cu spațiu subțire (0x202F)
 */
function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e15 || !Number.isFinite(value)) return '—';
  if (value === -0) return '0';
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const s = value.toFixed(decimals);
  // separator de mii cu spațiu subțire
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thouSep());
  const sep = decSep();
  const formatted = parts.join(sep);
  // elimină zerouri finale (dar nu toate dacă e 0)
  // regex: elimină .0, ,0, .,0, ,,0 la final
  const result = formatted.replace(/(\.,?|,)0+$/, '').replace(/[.,]$/, '');
  // după rotunjire, dacă rezultatul e 0 → '0' (fără minus)
  if (result === '0' || result === '-0' || result === '0' + sep + '0' || result === '-0' + sep + '0') return '0';
  return result;
}

// Export pentru testare

return { detectDomain, inferSensorState, inferClimateState, inferState, formatNumber, stateOf, visualState, secondaryText };
})();

__m["actions"] = (() => {
// src/actions.mjs — acțiuni pentru ccu-buttons-card (tap/hold/double_tap)

/**
 * Rulează o acțiune pe un nod.
 * Parametri:
 * - hass: obiect HA (fake) cu callService, history, window, etc.
 * - node: nodul (button) pe care se execută acțiunea
 * - cfg: config-ul acțiunii (ex: {action: 'toggle', entity: 'light.living'} sau 'more-info')
 */
function runAction(hass, node, cfg) {
  if (!hass || !node) return;

  const action = typeof cfg === 'string' ? cfg : cfg?.action || 'toggle';

  switch (action) {
    case 'toggle':
      runToggle(hass, node, cfg);
      break;
    case 'more-info':
      runMoreInfo(hass, node, cfg);
      break;
    case 'navigate':
      runNavigate(hass, node, cfg);
      break;
    case 'call-service':
    case 'perform-action': // numele din editorul HA (selectorul ui_action)
      runCallService(hass, node, cfg);
      break;
    case 'url':
      runUrl(hass, node, cfg);
      break;
    case 'none':
    case undefined:
    case null:
      break; // nu face nimic
    default:
      // acțiune necunoscută → nu face nimic, nu aruncă excepție
      break;
  }
}

/**
 * Toggle: entitatea = cfg.entity ?? cfg.entity_id ?? node?.dataset?.entity (NU dataset.id, care e indexul).
 * Starea = hass.states?.[entityId]?.state (NU din dataset).
 */
function runToggle(hass, node, cfg) {
  const entityId = cfg?.entity ?? cfg?.entity_id ?? node?.dataset?.entity;
  if (!entityId) return;

  const state = hass.states?.[entityId]?.state;
  const [domain] = entityId.split('.');

  let service;
  switch (domain) {
    case 'lock':
      service = state === 'locked' ? 'unlock' : 'lock';
      break;
    case 'cover':
      service = 'toggle';
      break;
    case 'button':
    case 'input_button':
      service = 'press';
      break;
    case 'scene':
      service = 'turn_on';
      break;
    case 'script':
      service = 'turn_on';
      break;
    default:
      toggleEntity(hass, entityId);
      return;
  }

  hass.callService?.(domain, service, { entity_id: entityId });
}

const ON_OFF_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'siren', 'automation', 'climate', 'media_player', 'humidifier', 'remote'];

/**
 * Comută o entitate cu turn_on / turn_off în loc de `toggle`: multe prize și relee (Sonoff, Tuya, integrări custom) nu
 * implementează `toggle`, deci comanda „reușește” fără să facă nimic. turn_on / turn_off merg peste tot.
 */
function toggleEntity(hass, entityId) {
  const domain = String(entityId).split('.')[0];
  if (!ON_OFF_DOMAINS.includes(domain)) { hass.callService?.('homeassistant', 'toggle', { entity_id: entityId }); return; }
  const st = hass.states?.[entityId]?.state;
  const off = st === 'off' || st === 'standby' || st === 'idle' && domain === 'media_player' || st === 'unavailable' || st === 'unknown' || st === undefined;
  hass.callService?.(domain, off ? 'turn_on' : 'turn_off', { entity_id: entityId });
}

/**
 * More-info: node.dispatchEvent(new CustomEvent('hass-more-info',{bubbles:true,composed:true,detail:{entityId}})).
 */
function runMoreInfo(hass, node, cfg) {
  const entityId = cfg?.entity ?? cfg?.entity_id ?? node?.dataset?.entity;
  if (!entityId) return;

  const event = new CustomEvent('hass-more-info', {
    bubbles: true,
    composed: true,
    detail: { entityId }
  });
  node.dispatchEvent(event);
}

/**
 * Navigate: path începe cu '/'; history.pushState prin globalThis.history,
 * apoi globalThis.window?.dispatchEvent(new CustomEvent('location-changed',{detail:{replace:false}})).
 */
function runNavigate(hass, node, cfg) {
  const path = cfg?.path ?? cfg?.navigation_path;
  if (!path) return;

  if (!path.startsWith('/')) {
    console.warn(`navigate: path "${path}" does not start with '/', not navigating.`);
    return;
  }

  // history.pushState prin globalThis.history
  if (globalThis.history?.pushState) {
    globalThis.history.pushState(null, '', path);
  }

  // apoi eveniment 'location-changed'
  if (globalThis.window?.dispatchEvent) {
    const event = new CustomEvent('location-changed', {
      bubbles: true,
      composed: true,
      detail: { replace: false }
    });
    globalThis.window.dispatchEvent(event);
  }
}

/**
 * Call-service: 'domeniu.serviciu' → callService(domeniu, serviciu, service_data, target).
 */
function runCallService(hass, node, cfg) {
  const service = cfg?.service ?? cfg?.perform_action;
  if (!service) {
    console.warn('call-service: no service given, not calling.');
    return;
  }

  // 'domeniu.serviciu'
  const [domain, serviceName] = service.split('.');
  if (!domain || !serviceName) {
    console.warn(`call-service: invalid service "${service}".`);
    return;
  }

  const serviceData = cfg?.service_data ?? cfg?.data ?? {};
  const target = cfg?.target ?? {};

  hass.callService?.(domain, serviceName, serviceData, target);
}

/**
 * Url: parse cu new URL(url, 'https://x.invalid');
 * permis doar protocol 'http:' sau 'https:' (indiferent de majuscule/spații);
 * deschide cu globalThis.window?.open(url,'_blank','noopener').
 */
function runUrl(hass, node, cfg) {
  const url = cfg?.url ?? cfg?.url_path ?? cfg?.path;
  if (!url) return;

  let parsed;
  try {
    parsed = new URL(url, 'https://x.invalid');
  } catch (e) {
    console.warn(`url: invalid "${url}".`);
    return;
  }

  // permis doar protocol 'http:' sau 'https:'
  const protocol = parsed.protocol.toLowerCase();
  if (!['http:', 'https:'].includes(protocol)) {
    console.warn(`url: "${url}" refused (protocol ${protocol}).`);
    return;
  }

  // deschide cu globalThis.window?.open
  if (globalThis.window?.open) {
    const win = globalThis.window.open(url, '_blank', 'noopener');
    if (win) {
      win.focus();
    }
  }
}

// Export pentru testare

return { runToggle, runMoreInfo, runNavigate, runCallService, runUrl, runAction, toggleEntity };
})();

__m["gestures"] = (() => {
// src/gestures.mjs — gesturi pentru ccu: tap, hold (500 ms), double_tap (fereastră 300 ms).
// Pointer events (nu Touch/Mouse separat: pe telefon ar declanșa de două ori). Derularea paginii anulează gestul
// (cu touch-action: pan-y browserul trimite pointercancel). Mișcare > 10 px sau ieșirea din buton = anulare.

const HOLD_MS = 500;
const DOUBLE_MS = 300;
const MOVE_PX = 10;

/**
 * attachGestures(node, { tap, hold, double_tap }, hass) — fiecare handler primește (node, hass).
 * Întoarce funcția de dezlegare (detach), care scoate ascultătorii și curăță timerele. Este pusă și pe node.detachGestures.
 */
function attachGestures(node, handlers, hass) {
  const { tap, hold, double_tap } = handlers || {};
  const st = { x: 0, y: 0, active: false, cancelled: false, held: false };
  let holdTimer = null;
  let tapTimer = null; // tap în așteptare (doar când există double_tap)

  const stopHold = () => { if (holdTimer !== null) { clearTimeout(holdTimer); holdTimer = null; } };
  const stopTap = () => { if (tapTimer !== null) { clearTimeout(tapTimer); tapTimer = null; } };
  const cancel = () => { st.cancelled = true; st.active = false; stopHold(); stopTap(); };

  const onDown = (e) => {
    if (e.button !== undefined && e.button !== 0) return; // doar butonul principal
    st.x = e.clientX; st.y = e.clientY;
    st.active = true; st.cancelled = false; st.held = false;
    stopHold();
    try { node.setPointerCapture?.(e.pointerId); } catch (_) { /* ignorat */ }
    if (hold) {
      holdTimer = setTimeout(() => {
        holdTimer = null;
        if (st.active && !st.cancelled) { st.held = true; hold(node, hass); }
      }, HOLD_MS);
    }
  };

  const onMove = (e) => {
    if (!st.active || st.cancelled) return;
    const dx = e.clientX - st.x, dy = e.clientY - st.y;
    if (Math.hypot(dx, dy) > MOVE_PX) cancel();
  };

  const onUp = () => {
    stopHold();
    const wasActive = st.active;
    st.active = false;
    if (!wasActive || st.cancelled || st.held) return;
    if (!double_tap) { if (tap) tap(node, hass); return; }
    if (tapTimer !== null) { stopTap(); double_tap(node, hass); return; } // al doilea tap în fereastră
    tapTimer = setTimeout(() => { tapTimer = null; if (tap) tap(node, hass); }, DOUBLE_MS);
  };

  const onCancel = () => cancel();

  if (node.style) node.style.touchAction = 'pan-y';
  node.addEventListener('pointerdown', onDown);
  node.addEventListener('pointermove', onMove);
  node.addEventListener('pointerup', onUp);
  node.addEventListener('pointercancel', onCancel);
  node.addEventListener('pointerleave', onCancel);

  const detach = () => {
    node.removeEventListener('pointerdown', onDown);
    node.removeEventListener('pointermove', onMove);
    node.removeEventListener('pointerup', onUp);
    node.removeEventListener('pointercancel', onCancel);
    node.removeEventListener('pointerleave', onCancel);
    stopHold(); stopTap();
    st.active = false;
  };
  node.detachGestures = detach;
  return detach;
}

function detachGestures(node) {
  if (node && typeof node.detachGestures === 'function') node.detachGestures();
}

return { HOLD_MS, DOUBLE_MS, MOVE_PX, attachGestures, detachGestures };
})();

__m["icons"] = (() => {
// src/icons.mjs — set propriu de iconițe liniare 32×32. Fără rețea, fără mdi la rulare.
// Fiecare iconiță e un șir SVG cu stroke="currentColor" (culoarea vine din .ccu-ico în theme.js).

const svg = (inner) => `<svg viewBox="0 0 32 32" aria-hidden="true">${inner}</svg>`;

const ICONS = {
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
const DEFAULT_ANIM = { ac: 'a-fan', bulb: 'a-glow', fan: 'a-fan', washer: 'a-fan', drop: 'a-pulse', flame: 'a-flicker', bolt: 'a-pulse', sun: 'a-glow', speaker: 'a-pulse' };

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
function ownKey(name) {
  if (typeof name !== 'string' || !name) return '';
  const n = name.trim().toLowerCase();
  if (ICONS[n]) return n;
  const m = n.startsWith('mdi:') ? n.slice(4) : n;
  return MDI[m] || (ICONS[m] ? m : '');
}

/**
 * Iconițe pe care cardul nu le are în setul propriu (orice `mdi:…`, `phu:…` etc. din selectorul HA) se desenează cu elementul `<ha-icon>`
 * al lui Home Assistant, ca să funcționeze toate, nu doar cele ~90 proprii. Doar în HA (unde `ha-icon` există); în rest (teste, capturi) rămâne iconița de rezervă.
 */
const NATIVE_RE = /^[a-z0-9_]+:[a-z0-9_-]+$/;
function nativeIcon(name) {
  if (typeof name !== 'string' || ownKey(name)) return '';
  const n = name.trim().toLowerCase();
  return NATIVE_RE.test(n) && typeof customElements !== 'undefined' && customElements.get('ha-icon') ? n : '';
}

function iconKey(name, entityId) {
  const own = ownKey(name);
  if (own) return own;
  const dom = typeof entityId === 'string' ? entityId.split('.')[0] : '';
  return DOMAIN[dom] || 'circle';
}

/** Șirul SVG pentru o iconiță (niciodată gol). */
function iconSvg(name, entityId) {
  const nat = nativeIcon(name);
  if (nat) return `<ha-icon class="ccu-hai" icon="${nat}"></ha-icon>`;
  return ICONS[iconKey(name, entityId)];
}

/** Clasa de animație implicită a iconiței sau '' (config.animations === false → ''). */
function iconAnim(name, entityId, enabled = true) {
  return enabled && !nativeIcon(name) ? (DEFAULT_ANIM[iconKey(name, entityId)] || '') : '';
}

return { ICONS, DEFAULT_ANIM, nativeIcon, iconKey, iconSvg, iconAnim };
})();

__m["presets"] = (() => {
const { t } = __m["i18n"];
// src/presets.mjs — presetările de culori. Valori pentru variabilele --ccu-* din theme.js.
// green = implicit; calm = ardezie + cyan/chihlimbar; contrast = mai multă diferență; mono = o singură culoare; warm = tonuri calde;
// light = „Light Breeze”. Utilizatorul poate suprascrie orice cu config.colors (accent, on, alert, ok, bg, text, line, muted).

const PRESETS = {
  // green = „Calm Green” (implicit): bleumarin, verde = activ, albastru = info, portocaliu = atenție
  green:    { bg: '#0b1220', text: '#e6edf7', muted: '#94a3b8', accent: '#3b82f6', on: '#22c55e', alert: '#f59e0b', ok: '#22c55e', cool: '#60a5fa', heat: '#f4694b', series: '#34d399' },
  // calm = „Calm Slate”: ardezie, chihlimbar = activ, cyan = date, roșu = alertă
  calm:     { bg: '#152028', text: '#e6ecef', muted: '#69737b', accent: '#56aac2', on: '#d3a658', alert: '#b85758', ok: '#68a169', cool: '#5b9bd9', heat: '#d9644f', series: '#56aac2' },
  contrast: { bg: '#0b1217', text: '#ffffff', muted: '#8d99a1', accent: '#4cc9f0', on: '#ffc233', alert: '#ff5d5d', ok: '#4ade80', cool: '#5aa9ff', heat: '#ff6a4d', series: '#4cc9f0' },
  mono:     { bg: '#14181c', text: '#e8ebed', muted: '#6f777e', accent: '#c9d1d6', on: '#e8ebed', alert: '#d9d9d9', ok: '#c9d1d6', cool: '#c9d1d6', heat: '#c9d1d6', series: '#c9d1d6' },
  warm:     { bg: '#221a16', text: '#f1e7df', muted: '#8d7b6f', accent: '#d99a6c', on: '#e8b04a', alert: '#c4553f', ok: '#8aa66b', cool: '#6fa8d6', heat: '#e2634b', series: '#e8b04a' },
  // light = „Light Serenity” (varianta deschisă)
  light:    { bg: '#e9f0f7', text: '#14233a', muted: '#5b6b82', accent: '#2563eb', on: '#16a34a', alert: '#d97706', ok: '#16a34a', cool: '#2563eb', heat: '#dc4a2d', series: '#16a34a', surface: '#ffffff', 'surface-2': '#f1f5fa', line: 'rgba(20,40,70,.12)' },
};

const PRESET_NAMES = Object.keys(PRESETS);

const KEYS = ['bg', 'text', 'muted', 'accent', 'on', 'alert', 'ok', 'cool', 'heat', 'series', 'line', 'surface', 'surface-2', 'muted-2'];
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const OK_COLOR = (v) => typeof v === 'string' && (HEX.test(v.trim()) || /^(?:rgb|rgba|hsl|hsla)\([0-9.,%\s\/-]+\)$/i.test(v.trim()) || /^var\(--[a-z0-9-]+\)$/i.test(v.trim()));

/**
 * Întoarce { vars, warnings }: vars = obiect `--ccu-*` → valoare, din preset + `colors` (valorile invalide se ignoră, cu avertisment).
 * Preset necunoscut → 'green' (implicit). Nu pune niciodată text arbitrar în CSS: doar culori verificate.
 */
function presetVars(preset, colors) {
  const warnings = [];
  let name = typeof preset === 'string' ? preset.toLowerCase() : 'green';
  if (!PRESETS[name]) { if (preset !== undefined) warnings.push(t('Preset necunoscut "{v}" → "green".', { v: preset })); name = 'green'; }
  const merged = { ...PRESETS[name] };
  if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
    for (const [k0, v] of Object.entries(colors)) {
      const k = k0 === 'true' ? 'on' : k0; // YAML: cheia `on:` fără ghilimele ajunge „true”
      if (!KEYS.includes(k)) { warnings.push(t('Culoare necunoscută "{k}" ignorată.', { k })); continue; }
      if (!OK_COLOR(v)) { warnings.push(t('Culoarea "{k}" ("{v}") nu e validă — ignorată.', { k, v: String(v).slice(0, 30) })); continue; }
      merged[k] = v.trim();
    }
  }
  const vars = {};
  for (const [k, v] of Object.entries(merged)) vars['--ccu-' + k] = v;
  // preset deschis: umbră și suprafețe potrivite (theme.js le deduce din --ccu-bg, deci doar marcăm tema)
  return { vars, name, light: name === 'light', warnings };
}

/** Doar culorile date (fără preset): { vars: {'--ccu-on': '#…'}, warnings }. Pentru suprascrieri pe un singur element. */
function colorVars(colors) {
  const vars = {}, warnings = [];
  if (colors && typeof colors === 'object' && !Array.isArray(colors)) {
    for (const [k0, v] of Object.entries(colors)) {
      const k = k0 === 'true' ? 'on' : k0; // YAML: cheia `on:` fără ghilimele ajunge „true”
      if (!KEYS.includes(k)) { warnings.push(t('Culoare necunoscută "{k}" ignorată.', { k })); continue; }
      if (!OK_COLOR(v)) { warnings.push(t('Culoarea "{k}" nu e validă — ignorată.', { k })); continue; }
      vars['--ccu-' + k] = v.trim();
    }
  }
  return { vars, warnings };
}

/** Aplică variabilele pe un element (style.setProperty) și marchează data-theme / data-preset. */
function applyPreset(el, preset, colors) {
  const r = presetVars(preset, colors);
  for (const [k, v] of Object.entries(r.vars)) el.style.setProperty(k, v);
  if (el.setAttribute) { el.setAttribute('data-preset', r.name); if (r.light) el.setAttribute('data-theme', 'light'); else el.removeAttribute?.('data-theme'); }
  return r.warnings;
}

return { PRESETS, PRESET_NAMES, presetVars, colorVars, applyPreset };
})();

__m["render"] = (() => {
// src/render.mjs — șabloane HTML (șiruri) și patchNodes. Funcții PURE: nu ating DOM-ul, nu au efecte.
// Tot ce vine din config/entități trece prin esc().
const { t, intlLocale, getLang, decSep } = __m["i18n"];
const { stateOf, secondaryText, formatNumber } = __m["state"];
const { iconSvg, iconAnim, iconKey, DEFAULT_ANIM } = __m["icons"];
const { colorVars } = __m["presets"];
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DAYS = ['dum', 'lun', 'mar', 'mie', 'joi', 'vin', 'sâm'];
const MONTHS = ['ian', 'feb', 'mar', 'apr', 'mai', 'iun', 'iul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const SIZES = ['xs', 's', 'm', 'l', 'xl'];
const SHAPES = ['chamfer', 'round', 'pill', 'square'];
const TOKENS = ['accent', 'on', 'alert', 'ok', 'muted'];
const IC = ['green', 'yellow', 'orange', 'blue', 'cyan', 'red', 'white'];
const RULE_KEYS = ['alert_above', 'alert_below', 'ok_above', 'ok_below', 'device_class'];

/** { time: '19:17', date: 'sâm 14 nov' } în fusul local al dispozitivului. */
function formatClock(d) {
  const p = (n) => String(n).padStart(2, '0');
  let date = `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`;   // română: forma scurtă proprie
  if (getLang() !== 'ro') { try { const f = (o) => d.toLocaleDateString(intlLocale(), o).replace(/\./g, ''); date = `${f({ weekday: 'short' })} ${d.getDate()} ${f({ month: 'short' })}`; } catch (e) { /* rămâne forma de mai sus */ } }
  return { time: `${p(d.getHours())}:${p(d.getMinutes())}`, date };
}

/** Puterea în W ≥ 1000 se arată în kW („1 820 W” → „1,82 kW”); restul ca în secondaryText. */
function kwText(s, hass) {
  const unit = s?.attributes?.unit_of_measurement, n = Number(s?.state);
  if (unit === 'W' && s.state !== '' && Number.isFinite(n) && Math.abs(n) >= 1000) return `${formatNumber(n / 1000)} kW`;
  return secondaryText(s, hass);
}

const autoName = (id) => String(id || '').replace(/^[^.]+\./, '').replace(/_/g, ' ');
const pickInt = (v, lo, hi, d) => { const n = Number(v); return Number.isInteger(n) && n >= lo && n <= hi ? n : d; };

/** Acțiunile implicite: lumini/prize/lacăte… = toggle; restul = more-info. */
const TOGGLE_DOMAINS = ['light', 'switch', 'fan', 'input_boolean', 'lock', 'cover', 'button', 'input_button', 'scene', 'script', 'automation', 'siren', 'valve'];
function defaultTap(entityId) {
  const d = String(entityId || '').split('.')[0];
  return TOGGLE_DOMAINS.includes(d) ? 'toggle' : 'more-info';
}

/** Modelul unui buton/chip: tot ce trebuie desenat, calculat din config + hass. */
function entityModel(e, idx, hass, config = {}) {
  const raw = hass?.states?.[e.entity];
  // starea din HA are mereu entity_id; o completăm dacă lipsește (domeniul decide stările și textele)
  const stateObj = raw ? (raw.entity_id ? raw : { ...raw, entity_id: e.entity }) : undefined;
  const attrs = stateObj?.attributes || {};
  const rule = { entity_id: e.entity };
  for (const k of RULE_KEYS) if (e[k] !== undefined) rule[k] = e[k];
  if (rule.device_class === undefined && attrs.device_class) rule.device_class = attrs.device_class;
  let state = stateObj ? stateOf(stateObj, rule) : 'unavailable';
  if (e.active === true && state !== 'unavailable') state = 'on'; // card „erou”/evidențiat: verde indiferent de valoare
  // on_states: stări text care înseamnă „pornit” (ex. mașina de spălat: spinning, rinsing …)
  if (Array.isArray(e.on_states) && stateObj && e.on_states.map(String).includes(String(stateObj.state))) state = 'on';
  // show_if: { attribute?, min, alert_at? } — se vede doar când valoarea (atributul sau starea) e un număr ≥ min; alertă când ≤ alert_at (ex. „zile rămase” la citirea contorului)
  let hiddenIf = false;
  if (e.show_if && typeof e.show_if === 'object') {
    const v = Number(e.show_if.attribute ? stateObj?.attributes?.[e.show_if.attribute] : stateObj?.state);
    const min = Number.isFinite(Number(e.show_if.min)) ? Number(e.show_if.min) : 0;
    const okv = !!stateObj && !['unavailable', 'unknown'].includes(String(stateObj.state)) && Number.isFinite(v) && v >= min;
    hiddenIf = !okv;
    if (okv) state = Number.isFinite(Number(e.show_if.alert_at)) && v <= Number(e.show_if.alert_at) ? 'alert' : 'on';
  }
  const isOn = (id) => !!(hass && hass.states && hass.states[id] && hass.states[id].state === 'on');
  // `group: [entity_id…]`: starea e „atenție” dacă oricare membru e „on” (ex. persoane detectate pe camere); textul: group_text cu {n} / group_idle
  const gids = Array.isArray(e.group) ? e.group.filter((id) => typeof id === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(id)) : [];
  const groupN = gids.length ? gids.filter(isOn).length : null;
  if (groupN !== null) state = groupN > 0 ? 'alert' : 'off';
  // `count: true` pe o entitate group.*: câte dintre membrii ei sunt „on” (ex. lumini aprinse)
  const members = e.count === true && Array.isArray(attrs.entity_id) ? attrs.entity_id : null;
  const count = members ? members.filter(isOn).length : null;
  if (e.on_as === 'alert' && state === 'on') state = 'alert'; // ex. fum / scurgere de apă: când e „on” nu e „activ”, e alertă
  const name = e.name && e.name !== autoName(e.entity) ? e.name : (attrs.friendly_name || e.name || autoName(e.entity));
  const size = SIZES.includes(e.size) ? e.size : 'm';
  const shape = SHAPES.includes(e.shape) ? e.shape : 'chamfer';

  let secondary = '';
  const sec = e.secondary;
  if (sec === false || sec === 'none') secondary = '';
  else if (typeof sec === 'string' && sec) secondary = sec;
  else if (sec && typeof sec === 'object' && sec.attribute) {
    const v = attrs[sec.attribute];
    secondary = v === undefined || v === null ? '—' : (typeof v === 'number' ? formatNumber(v) : String(v)) + (sec.unit ? ' ' + sec.unit : '');
  } else if (sec && typeof sec === 'object' && sec.entity) {
    const o = hass?.states?.[sec.entity];
    secondary = o ? secondaryText(o.entity_id ? o : { ...o, entity_id: sec.entity }, hass) : '—'; // domeniul decide formatul (climate → temperatura curentă)
  } else if (!stateObj) secondary = '—';
  else if (size !== 'xs') secondary = e.auto_kw === false ? secondaryText(stateObj, hass) : kwText(stateObj, hass);

  // text_map: traduce starea text a entității (ex. spinning → Centrifugă) când nu e dat un `secondary`
  if (e.text_map && typeof e.text_map === 'object' && stateObj && e.secondary === undefined && e.text_map[String(stateObj.state)] !== undefined) secondary = String(e.text_map[String(stateObj.state)]);
  if (groupN !== null) secondary = groupN > 0 ? String(e.group_text || t('{n} active')).replace('{n}', groupN) : String(e.group_idle || t('Fără activitate'));

  // climate: modul (cool/heat/auto/…) colorează iconița; „lucrează” = nu e oprit și hvac_action nu e idle/off (fără hvac_action: după mod)
  let mode = '', run = '';
  if (String(e.entity).startsWith('climate.') && stateObj) {
    const s = String(stateObj.state);
    mode = s === 'heat_cool' ? 'auto' : s;
    const act = attrs.hvac_action;
    run = s !== 'off' && s !== 'unavailable' && s !== 'unknown' ? '1' : '';   // aparat pornit = ventilatorul se învârte (ca la vechiul badge)
  }
  if (!run && state === 'on' && !mode && DEFAULT_ANIM[iconKey(e.icon, e.entity)] === 'a-fan') run = '1';
  // icon_color: culoare fixă a iconiței, în orice stare (verde/galben/portocaliu/albastru/cyan/roșu/alb)
  const ic = IC.includes(e.icon_color) ? e.icon_color : '';
  // delta: indicator de variație sub valoare (doar xl): { entity?, attribute?, text? }
  let delta = null;
  if (e.delta && size === 'xl') {
    const d = e.delta; let txt = '', n = NaN;
    if (typeof d.text === 'string') txt = d.text;
    else if (d.entity) { const o = hass?.states?.[d.entity]; txt = o ? secondaryText(o, hass) : '—'; n = Number(o?.state); }
    if (d.percent_entity && txt && txt !== '—') { const pn = Number(hass?.states?.[d.percent_entity]?.state); if (Number.isFinite(pn)) txt += ` (${formatNumber(pn)}%)`; }
    if (txt && txt !== '—') delta = { text: txt, dir: Number.isFinite(n) ? (n < 0 ? 'down' : 'up') : (/^[−-]/.test(txt) ? 'down' : 'up') };
  }
  return {
    idx, entity: e.entity, name, size, shape, state, secondary, mode, run, ic, delta, count,
    named: !!(e.name && e.name !== autoName(e.entity)), hidden: e.show_if ? hiddenIf : e.hide_off === true && state !== 'on' && state !== 'alert',
    toggle: e.toggle === true && size === 'l', spark: size === 'xl' && e.spark ? (e.spark.entity || e.entity) : '',
    sparkHours: e.spark && Number.isFinite(Number(e.spark.hours)) ? Math.min(48, Math.max(1, Number(e.spark.hours))) : 6,
    icon: iconSvg(e.icon || (String(e.entity).startsWith('weather.') && stateObj ? WEATHER_ICON[String(stateObj.state)] || 'w-cloud' : undefined), e.entity),
    anim: iconAnim(e.icon, e.entity, config.animations !== false),
    lamp: iconKey(e.icon, e.entity) === 'bulb',   // becurile primesc stilul „lampă” (strălucire caldă)
    style: Object.entries(colorVars(e.colors).vars).map(([k, v]) => `${k}:${v}`).join(';'),
  };
}

// entitate weather.* fără icon în config: pictograma după condiția curentă
const WEATHER_ICON = { sunny: 'w-sun', 'clear-night': 'w-moon', partlycloudy: 'w-partly', cloudy: 'w-cloud', fog: 'w-fog', rainy: 'w-rain', pouring: 'w-pour', snowy: 'w-snow', 'snowy-rainy': 'w-sleet',
  lightning: 'w-storm', 'lightning-rainy': 'w-storm', hail: 'w-hail', windy: 'w-wind', 'windy-variant': 'w-wind', exceptional: 'w-cloud' };
const modeAttrs = (m) => (m.mode ? ` data-mode="${esc(m.mode)}" data-run="${m.run ? 1 : 0}"` : m.run ? ' data-run="1"' : '');
const styleAttr = (s) => (s ? ` style="${esc(s)}"` : '');

// „1,82 kW” → <b>1,82</b> kW (valoarea mare a cardului erou)
function bigValue(t) {
  const m = /^([−-]?[\d\s., ]+)(.*)$/.exec(t);
  return m ? `<b>${esc(m[1].trim())}</b>${m[2].trim() ? ' ' + esc(m[2].trim()) : ''}` : esc(t);
}

/** Linie + zonă dintr-o serie numerică, normalizate într-un viewBox 100×40 (≤ 40 de puncte). Gol dacă < 2 puncte. */
function sparkPath(values, w = 100, h = 40, pad = 3) {
  const v = (values || []).map(Number).filter(Number.isFinite);
  if (v.length < 2) return { line: '', fill: '' };
  const N = Math.min(40, v.length), out = [];
  for (let i = 0; i < N; i++) { const a = Math.floor(i * v.length / N), b = Math.max(a + 1, Math.floor((i + 1) * v.length / N)); const s = v.slice(a, b); out.push(s.reduce((x, y) => x + y, 0) / s.length); }
  const lo = Math.min(...out), hi = Math.max(...out), span = hi - lo || 1;
  const pts = out.map((y, i) => [(i / (N - 1)) * w, pad + (1 - (y - lo) / span) * (h - 2 * pad)]);
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  return { line, fill: `${line} L${w} ${h} L0 ${h} Z` };
}

function renderButton(m, sparks) {
  const sp = m.spark ? (sparks && sparks[m.spark]) : null;
  const spark = m.spark ? `<svg class="ccu-spark" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true"><path class="fill" d="${sp ? sp.fill : ''}"/><path d="${sp ? sp.line : ''}"/></svg>` : '';
  const sec = m.secondary ? `<span class="ccu-sec">${m.size === 'xl' ? bigValue(m.secondary) : esc(m.secondary)}</span>` : '';
  const delta = m.delta ? `<span class="ccu-delta" data-dir="${m.delta.dir}">${m.delta.dir === 'down' ? '▼' : '▲'} ${esc(m.delta.text)}</span>` : '';
  return `<button type="button" class="ccu-btn ${m.size} ${m.shape}"${m.lamp ? ' data-lamp="1"' : ''} data-state="${m.state}" data-id="${m.idx}" data-entity="${esc(m.entity)}"${m.ic ? ` data-ic="${m.ic}"` : ''}${modeAttrs(m)}${styleAttr(m.style)}>`
    + `<span class="ccu-ico ${m.anim}">${m.icon}</span><span class="ccu-name">${esc(m.name)}</span>` + sec + delta + spark
    + (m.toggle ? `<span class="ccu-sw" aria-hidden="true"><i></i></span>` : '') + `</button>`;
}

function renderChip(m, e, hass) {
  let label = esc(m.name);
  if (m.count !== null && m.count !== undefined) label = `<b>${m.count}</b>${m.named ? ' ' + esc(m.name) : ''}`;
  else if (e.show_state) {
    const raw = hass?.states?.[e.entity];
    let t = m.secondary || (raw ? secondaryText(raw, hass) : '—');
    // text_map: traduce starea text (spinning → Centrifugare); cu `secondary: {entity}` se adaugă și a doua valoare (ex. timpul rămas)
    if (e.text_map && typeof e.text_map === 'object' && raw && e.text_map[raw.state] !== undefined) { t = String(e.text_map[raw.state]); if (m.secondary && m.secondary !== '—') t += ' · ' + m.secondary; }
    label += ` <b>${esc(t)}</b>`;
  }
  return `<span class="ccu-chip" role="button" tabindex="0" data-state="${m.state}" data-id="${m.idx}" data-entity="${esc(m.entity)}"${m.ic ? ` data-ic="${m.ic}"` : ''}${modeAttrs(m)}${styleAttr(m.style)}>`
    + `<span class="ccu-ico ${m.anim}">${m.icon}</span>${label}</span>`;
}

const notes = (warnings) => (warnings && warnings.length ? `<div class="ccu-note">${warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '');

/** Card de butoane: grila + titlu opțional + avertismente. */
function renderButtons(config, hass, opts = {}) {
  const cols = pickInt(config.columns, 1, 6, 2);
  const wide = pickInt(config.columns_wide, 1, 8, cols);
  // lățimea minimă a unei plăci (px): coloanele de pe ecran lat se reduc singure ca numele și valorile să nu se taie
  const minTile = Math.max(0, ...(config.entities || []).map((e) => ({ m: 168, l: 240 }[SIZES.includes(e.size) ? e.size : 'm'] || 0)));
  const items = (config.entities || []).map((e, i) => renderButton(entityModel(e, i, hass, config), opts.sparks)).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  return `<div class="ccu-card${config.panel ? ' panel' : ''}">${title}<div class="ccu-grid" data-cols="${cols}" style="--cols:${cols};--cols-wide:${wide};--min-tile:${minTile}px">${items}</div>${notes(opts.warnings)}</div>`;
}

/** Rând de chips. */
/** Câte chips-uri se văd acum (cele cu hide_off dispar când nu sunt „on”). */
function visibleChips(config, hass) {
  return (config.entities || []).reduce((n, e, i) => n + (entityModel(e, i, hass, config).hidden ? 0 : 1), 0);
}

/** Normalizează `waste` (calendarul de colectare): { calendar, next_days, hide_today_after: 'HH:MM', patterns: [{ match, label, icon, exact }] }. */
function normalizeWaste(w) {
  if (!w || typeof w !== 'object' || typeof w.calendar !== 'string' || !/^calendar\.[a-z0-9_]+$/.test(w.calendar)) return null;
  const hm = /^(\d{1,2}):(\d\d)$/.exec(String(w.hide_today_after || '11:00'));
  const patterns = (Array.isArray(w.patterns) ? w.patterns : []).filter((p) => p && typeof p.match === 'string' && p.match).map((p) => ({ match: p.match, label: String(p.label || p.match), icon: p.icon || 'mdi:trash-can', exact: p.exact === true }));
  const nd = Number(w.next_days);
  return { calendar: w.calendar, next_days: Number.isFinite(nd) ? Math.min(7, Math.max(0, Math.round(nd))) : 1, hide_today_after: hm ? Number(hm[1]) * 60 + Number(hm[2]) : 660, patterns };
}

/** Chips-urile de gunoi: evenimentele de azi / următoarele `next_days` zile care se potrivesc cu un pattern (azi se ascund după ora `hide_today_after`). */
function wasteModel(waste, events, now = new Date()) {
  if (!waste || !Array.isArray(events)) return [];
  const today0 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const out = [];
  for (const ev of events) {
    const m = /^(\d{4})-(\d\d)-(\d\d)/.exec(String(ev && ev.start || ''));
    if (!m) continue;
    const diff = Math.round((new Date(+m[1], +m[2] - 1, +m[3]) - today0) / 864e5);
    if (diff < 0 || diff > waste.next_days) continue;
    if (diff === 0 && now.getHours() * 60 + now.getMinutes() >= waste.hide_today_after) continue;
    const sum = String(ev.summary || '');
    const p = waste.patterns.find((q) => (q.exact ? sum === q.match : sum.includes(q.match)));
    if (p) out.push({ label: p.label, icon: p.icon, diff });
  }
  return out;
}

function renderChips(config, hass, opts = {}) {
  const lastCh = (id) => { const ts = Date.parse(hass?.states?.[id]?.last_changed || ''); return Number.isFinite(ts) ? ts : 0; };   // momentul activării (pentru `sort: activated`)
  const itemList = (config.entities || []).map((e, i) => { const m = entityModel(e, i, hass, config); if (m.hidden && !opts.preview) return null; const h = renderChip(m, e, hass); return { h: m.hidden ? h.replace(/^(\s*<\w+)/, '$1 data-inactive="1" title="' + esc(t('Inactiv: nu se vede pe dashboard')) + '"') : h, ts: lastCh(e.entity) }; }).filter(Boolean); // hide_off: chip-ul dispare când nu e „on”
  const waste = wasteModel(config.waste, opts.events, opts.now || new Date()).map((w) =>
    `<span class="ccu-chip" data-state="${w.diff === 0 ? 'alert' : 'on'}" data-waste="1" data-entity="${esc(config.waste.calendar)}"><span class="ccu-ico">${iconSvg(w.icon)}</span>${esc(w.label)} <b>${w.diff === 0 ? t('azi') : w.diff === 1 ? t('mâine') : t('în {n} zile', { n: w.diff })}</b></span>`).join('');
  // baterii slabe: un singur chip, doar când există; cu o singură baterie arată numele și procentul, altfel numărul
  const lb = opts.lowBat && opts.lowBat.count > 0 ? opts.lowBat : null;
  const lowChip = lb ? `<span class="ccu-chip" role="button" tabindex="0" data-state="alert" data-bat="1" data-entity="${esc(lb.low[0].entity)}"><span class="ccu-ico">${iconSvg('battery')}</span>${lb.count === 1 && !(config.low_batteries && config.low_batteries.label) ? `${esc(lb.low[0].name)} <b>${lb.low[0].binary ? esc(t('slabă')) : Math.round(lb.low[0].pct) + '%'}</b>` : `${esc((config.low_batteries && config.low_batteries.label) || t('Baterii slabe'))} <b>${lb.count}</b>`}</span>` : '';
  // termene (RCA, ITP, rovinietă, ulei…): un chip cât timp ceva se apropie sau a expirat; cu unul singur arată documentul și termenul, altfel numărul
  const due = opts.due && opts.due.length ? opts.due : null, dl = config.deadlines;
  const dueChip = due ? `<span class="ccu-chip" role="button" tabindex="0" data-state="alert" data-due="1"><span class="ccu-ico">${iconSvg('calendar')}</span>${due.length === 1 && !(dl && dl.label) ? `${esc(due[0].label)} ${esc(due[0].vehicle)} <b>${esc(due[0].text)}</b>` : `${esc((dl && dl.label) || t('Termene mașini'))} <b>${due.length}</b>`}</span>` : '';
  let parts = [{ h: dueChip, ts: 0 }, { h: lowChip, ts: lb ? Math.min(...lb.low.map((x) => lastCh(x.entity)).filter(Boolean), Infinity) : 0 }, { h: waste, ts: config.waste ? lastCh(config.waste.calendar) : 0 }, ...itemList];
  if (config.sort === true || config.sort === 'activated') parts = parts.map((p, i) => ({ ...p, i, ts: Number.isFinite(p.ts) ? p.ts : 0 })).sort((a, b) => a.ts - b.ts || a.i - b.i);   // cel mai vechi activat primul
  return `<div class="ccu-chips">${parts.map((p) => p.h).join('')}</div>${notes(opts.warnings)}`;
}

/** Normalizează secțiunea `header` (iconiță, ≤ 3 valori, ceas). */
function normalizeHeader(h) {
  const src = h && typeof h === 'object' ? h : {};
  const warnings = [];
  const values = (Array.isArray(src.values) ? src.values : []).slice(0, 3).map((v, i) => {
    const o = typeof v === 'string' ? { entity: v } : { ...v };
    if (!o.entity || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Valoarea #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return null; }
    if (o.color === true) o.color = 'on'; // YAML: `color: on` fără ghilimele devine boolean true
    if (o.color && !TOKENS.includes(o.color)) { warnings.push(t('Valoarea #{n}: culoare "{c}" necunoscută (folosește {l}).', { n: i + 1, c: o.color, l: TOKENS.join('/') })); delete o.color; }
    // autonomia sub valoare (când valoarea e procentul bateriei): chei `runtime_*` (din editor) sau `runtime: { load, … }`
    const nested = o.runtime && typeof o.runtime === 'object' ? o.runtime : {}, rt = {};
    for (const k of ['load', 'load_entities', 'capacity_entity', 'capacity_kwh', 'grid_present', 'reserve_pct', 'shutdown_pct', 'power', 'power_invert', 'charge_eta', 'while_charging']) {
      const v = o['runtime_' + k] !== undefined && o['runtime_' + k] !== '' ? o['runtime_' + k] : nested[k];
      if (v !== undefined && v !== '' && !(Array.isArray(v) && !v.length)) rt[k] = v;
    }
    o.runtimeCfg = rt.load || (Array.isArray(rt.load_entities) && rt.load_entities.length) ? rt : null;
    return o;
  }).filter(Boolean);
  if (Array.isArray(src.values) && src.values.length > 3) warnings.push(t('Header: maximum 3 valori; restul sunt ignorate.'));
  // `right`: în locul ceasului, o valoare (ex. temperatura exterioară): { entity, attribute?, label?, unit?, decimals? }.
  let right = null;
  if (src.right) {
    const r = typeof src.right === 'string' ? { entity: src.right } : { ...src.right };
    if (!r.entity || !/^[a-z_]+\.[a-z0-9_]+$/.test(r.entity)) warnings.push(t('Header: `right` are entity_id lipsă sau invalid — se arată ceasul.'));
    else right = r;
  }
  return { header: { icon: src.icon || 'home', values, right, clock: right ? false : src.clock !== false, auto_kw: src.auto_kw !== false, tap_action: src.tap_action }, warnings };
}

function headerValue(v, hass, autoKw) {
  const s = hass?.states?.[v.entity];
  if (!s) return '—';
  const unit = s.attributes?.unit_of_measurement;
  const n = Number(s.state);
  if (autoKw && unit === 'W' && s.state !== '' && Number.isFinite(n) && Math.abs(n) >= 1000) return `${formatNumber(n / 1000)} kW`;
  return secondaryText(s, hass);
}

/** Valoarea din dreapta: număr din stare sau dintr-un atribut (ex. weather.acasa → temperature), cu unitate. */
function rightValue(r, hass) {
  const s = hass?.states?.[r.entity];
  if (!s) return '—';
  const raw = r.attribute ? s.attributes?.[r.attribute] : s.state;
  const n = Number(raw);
  if (raw === undefined || raw === null || raw === '' || !Number.isFinite(n)) return '—';
  const unit = r.unit ?? (r.attribute ? (hass?.config?.unit_system?.temperature || '°C') : (s.attributes?.unit_of_measurement || ''));
  const dec = Number.isInteger(r.decimals) && r.decimals >= 0 && r.decimals <= 2 ? r.decimals : 1;
  const txt = n.toFixed(dec).replace(/\.0+$/, '').replace('.', decSep());
  return unit ? `${txt} ${unit}` : txt;
}

/** Header-ul: iconiță, valori colorate cu token, ceas. `now` e dat de apelant (funcția rămâne pură). */
function renderHeader(config, hass, now, opts = {}) {
  const h = config.header || normalizeHeader(config).header;
  const vals = h.values.map((v, i) => {
    const t = esc(headerValue(v, hass, h.auto_kw));
    const ico = v.icon ? `<span class="ccu-ico${v.color ? ` c-${v.color}` : ''}">${iconSvg(v.icon)}</span>` : '';
    // cu etichetă: valoare sus, etichetă mică dedesubt; textul de autonomie (opts.subs) ia locul etichetei
    const sub = opts.subs && opts.subs[i], lab = (Array.isArray(sub) ? sub.join('') : sub) || v.label;   // autonomia / „plin în” (`rt`) rămâne vizibilă și pe telefon; etichetele obișnuite se ascund acolo
    if (lab) return `<span class="has-label">${ico}<span class="tx"><b${!v.icon && v.color ? ` class="c-${v.color}"` : ''}>${t}</b>${Array.isArray(sub) ? sub.map((x) => `<small class="rt">${esc(x)}</small>`).join('') : `<small${sub ? ' class="rt"' : ''}>${esc(lab)}</small>`}</span></span>`;
    if (v.icon) return `<span>${ico}${t}</span>`;
    return `<span${v.color ? ` class="c-${v.color}"` : ''}>${t}</span>`;
  }).join('');
  let clock = '';
  if (h.right) clock = `<span class="clock right">${esc(rightValue(h.right, hass))}${h.right.label ? `<small>${esc(h.right.label)}</small>` : ''}</span>`;
  else if (h.clock && now) { const c = formatClock(now); clock = `<span class="clock">${c.time}<small>${esc(c.date)}</small></span>`; }
  return `<div class="ccu-head" data-id="header"><span class="ccu-ico">${iconSvg(h.icon)}</span><span class="vals">${vals}</span>${clock}</div>${notes(opts.warnings)}`;
}

/** Normalizează meniul jos: items = [{ icon, label, path }] (path = adresă completă ce începe cu '/'). */
function normalizeNav(cfg) {
  const warnings = [];
  const items = [];
  (Array.isArray(cfg?.items) ? cfg.items : []).forEach((it, i) => {
    const o = it && typeof it === 'object' ? it : null;
    const rawPath = o && (o.path ?? o.navigation_path);
    const po = rawPath && typeof rawPath === 'object' && !Array.isArray(rawPath) ? rawPath : null;   // path: { tablet, phone, default }
    const okPath = (p) => (typeof p === 'string' && p.startsWith('/') ? p : '');
    const path = po ? okPath(po.default) : okPath(rawPath);
    const paths = o ? { tablet: okPath(o.path_tablet ?? (po && po.tablet)), phone: okPath(o.path_phone ?? (po && po.phone)) } : { tablet: '', phone: '' };
    const holds = o ? { tablet: okPath(o.hold_path_tablet), phone: okPath(o.hold_path_phone) } : { tablet: '', phone: '' };   // apăsare lungă: unde duce butonul pe fiecare dispozitiv
    const hold = o ? okPath(o.hold_path) : '';
    const back = !!o && o.back === true;   // `back: true` = „înapoi” (history.back), fără path
    if (!o || (!back && !path && !paths.tablet && !paths.phone)) { warnings.push(t('Meniu #{n}: lipsește „path” (adresă ce începe cu /) sau „back: true”.', { n: i + 1 })); return; }
    const vi = o.visible_if && typeof o.visible_if === 'object' && /^[a-z_]+\.[a-z0-9_]+$/.test(String(o.visible_if.entity)) ? { entity: o.visible_if.entity, state: String(o.visible_if.state) } : null;
    const bl = Array.isArray(o.badge) ? o.badge : (o.badge && Array.isArray(o.badge.entities) ? o.badge.entities : []);
    const mt = (Array.isArray(o.match) ? o.match : o.match ? [o.match] : []).map(okPath).filter(Boolean);
    items.push({ icon: o.icon || (back ? 'back' : 'home'), label: String(o.label ?? o.name ?? ''), path: back ? '' : path, paths: back ? { tablet: '', phone: '' } : paths, hold, holds, match: mt.length ? mt : null, device: o.device === 'tablet' || o.device === 'phone' ? o.device : '', back, visible_if: vi, badge: bl.filter((id) => typeof id === 'string' && /^[a-z_]+\.[a-z0-9_]+$/.test(id)), badge_style: o.badge_style === 'light' ? 'light' : '' });
  });
  return { items, warnings };
}

/** Adresa unui buton pe dispozitivul dat: path_phone / path_tablet, apoi path, apoi oricare dintre ele. */
function navPath(it, device) {
  const p = it.paths || {};
  return p[device === 'phone' ? 'phone' : 'tablet'] || it.path || p.tablet || p.phone || '';
}

/** Adresa la apăsare lungă pe dispozitivul dat (hold_path_phone / hold_path_tablet, apoi hold_path), sau '' dacă butonul nu are. */
function holdTarget(it, device) {
  const h = it.holds || {};
  return h[device === 'phone' ? 'phone' : 'tablet'] || it.hold || '';
}

/** Meniul de jos: o pictogramă + etichetă per element; elementul curent (după adresa paginii) e „activ”. `opts.device` = „phone” | „tablet”. */
function renderNav(config, currentPath, opts = {}) {
  const cur = String(currentPath || '');
  const device = opts.device === 'phone' ? 'phone' : 'tablet';
  const forDevice = (it) => !it.device || it.device === device;   // `device: phone` = butonul se vede doar pe telefon
  const hit = (p) => !!p && (cur === p || cur.startsWith(p.endsWith('/') ? p : p + '/'));
  // fără `match`, butonul se aprinde pe toate paginile lui (tabletă + telefon + implicită): Home e „aprins” pe ambele pagini home
  const isOn = (it) => { if (it.back || !forDevice(it)) return false; return it.match && it.match.length ? it.match.some(hit) : [it.path, (it.paths || {}).tablet, (it.paths || {}).phone].some(hit); };
  let on = config.items.findIndex(isOn);
  const hs = opts.hass && opts.hass.states;
  // insignă: câte entități din `badge` sunt „on” (ex. persoane detectate de camere); > 0 → butonul devine roșu (alertă) ca „Persoane pe n camere”
  // un `sensor.*` numeric (ex. un contor „becuri aprinse”) adaugă valoarea lui; orice alt tip de entitate adaugă 1 când e „on”
  const cnt = (it) => (hs && it.badge ? it.badge.reduce((a, id) => { const s = hs[id]; if (!s) return a; if (id.startsWith('sensor.')) { const n = Math.round(Number(s.state)); return a + (Number.isFinite(n) && n > 0 ? n : 0); } return a + (s.state === 'on' ? 1 : 0); }, 0) : 0);
  // visible_if: { entity, state } — elementul se vede doar când entitatea are acea stare (ex. butonul „Tableta” doar pe tabletă)
  const shown = (it) => forDevice(it) && (!it.visible_if || (hs && hs[it.visible_if.entity] && String(hs[it.visible_if.entity].state) === it.visible_if.state));
  const labels = config.labels !== false;
  const html = config.items.map((it, i) => { if (!shown(it)) return ''; const n = cnt(it); const st = i === on ? 'on' : n > 0 ? (it.badge_style === 'light' ? 'lit' : 'alert') : 'off';
    return `<button type="button" class="ccu-nav-item" data-id="${i}" data-state="${st}"><span class="ccu-ico">${iconSvg(it.icon)}${n > 0 ? `<b class="ccu-badge${it.badge_style === 'light' ? ' lit' : ''}">${n}</b>` : ''}</span>${labels ? `<span>${esc(it.label)}</span>` : ''}</button>`; }).join('');
  const nav = `<nav class="ccu-nav${config.compact ? ' compact' : ''}${labels ? '' : ' nolabels'}">${html}</nav>`;
  // sticky: bara rămâne fixă jos, pe ecran, cât derulezi pagina; un spațiu gol în pagină (spacer) o împiedică să acopere ultimul card
  if (config.sticky) return `${config.spacer === false ? '' : '<div class="ccu-nav-spacer"></div>'}<div class="ccu-nav-fixed">${nav}</div>${notes(opts.warnings)}`;
  return `${nav}${notes(opts.warnings)}`;
}

// ---------- persoane: avatare suprapuse într-un chip ----------
/** Adresa unei poze e acceptată doar dacă e relativă la HA („/api/image/…”, „/local/…”): fără http(s)/data/javascript, fără „//”. */
function safePicture(u) {
  const s = typeof u === 'string' ? u.trim() : '';
  return /^\/(?!\/)[^\s"'<>\\]*$/.test(s) ? s : '';
}
const initials = (n) => { const w = String(n || '?').trim().split(/\s+/).filter(Boolean); return ((w[0] || '?')[0] + (w.length > 1 ? w[w.length - 1][0] : '')).toUpperCase(); };

/** Normalizează cardul de persoane: persons = [person.x | { entity, name }], label implicit „Persoane”. */
function normalizePeople(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], people = [];
  (Array.isArray(src.people) ? src.people : Array.isArray(src.persons) ? src.persons : []).forEach((p, i) => {
    const o = typeof p === 'string' ? { entity: p } : p && typeof p === 'object' ? { ...p } : null;
    if (!o || typeof o.entity !== 'string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Persoana #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    people.push({ entity: o.entity, name: o.name ? String(o.name) : '' });
  });
  if (people.length > 6) { people.length = 6; warnings.push(t('Persoane: maximum 6; restul sunt ignorate.')); }
  return { people, label: src.label === false ? '' : (src.label ? String(src.label) : t('Persoane')), layout: src.layout === 'family' ? 'family' : 'chip', title: src.title ? String(src.title) : '', summary: src.summary !== false, warnings };
}

const STATE_RO = { home: 'Acasă', not_home: 'Plecat', unknown: '—', unavailable: '—' };   // românește; la afișare trece prin t()
/** Cardul „Familia”: avatare mari cu nume și stare (Acasă / Plecat / zona în care se află). */
function renderFamily(config, hass, opts = {}) {
  const cells = config.entities.map((e, i) => {
    const s = hass && hass.states ? hass.states[e.entity] : null;
    const a = (s && s.attributes) || {};
    const name = e.name || a.friendly_name || e.entity.split('.')[1].replace(/_/g, ' ');
    const home = !!s && s.state === 'home';
    const pic = safePicture(a.entity_picture);
    const st = !s ? '—' : (STATE_RO[s.state] !== undefined ? t(STATE_RO[s.state]) : String(s.state));
    return `<div class="fm" data-id="${i}" data-entity="${esc(e.entity)}" data-home="${home ? 1 : 0}"><span class="av2">${pic ? `<img src="${esc(pic)}" alt="${esc(name)}" loading="lazy">` : esc(initials(name))}<i class="pres"></i></span><b class="nm">${esc(name.split(' ')[0])}</b><small class="stt">${esc(st)}</small></div>`;
  }).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  const nHome = config.entities.filter((e) => hass && hass.states && hass.states[e.entity] && hass.states[e.entity].state === 'home').length;
  const sum = config.summary !== false && config.entities.length ? `<div class="fm-head" data-n="${nHome}"><i></i>${nHome === 0 ? t('Nimeni acasă') : nHome === config.entities.length ? t('Toți sunt acasă') : t('{a} din {b} acasă', { a: nHome, b: config.entities.length })}</div>` : '';
  return `<div class="ccu-card panel ccu-family">${title}${sum}<div class="fm-row" style="--n:${Math.max(1, config.entities.length)}">${cells}</div>${notes}</div>`;
}

/** Chip cu avatare suprapuse; cercul e verde pentru cine e acasă, gri pentru cine lipsește. */
function renderPeople(config, hass, opts = {}) {
  if (config.layout === 'family') return renderFamily(config, hass, opts);
  const avs = config.entities.map((e, i) => {
    const s = hass && hass.states ? hass.states[e.entity] : null;
    const a = (s && s.attributes) || {};
    const name = e.name || a.friendly_name || e.entity.split('.')[1].replace(/_/g, ' ');
    const home = !!s && s.state === 'home';
    const pic = safePicture(a.entity_picture);
    return `<span class="av" data-id="${i}" data-entity="${esc(e.entity)}" data-home="${home ? 1 : 0}" title="${esc(name)}">${pic ? `<img src="${esc(pic)}" alt="${esc(name)}" loading="lazy">` : esc(initials(name))}</span>`;
  }).join('');
  const nHome = config.entities.filter((e) => hass && hass.states && hass.states[e.entity] && hass.states[e.entity].state === 'home').length;
  const lbl = config.label ? `<span class="lbl">${esc(config.label)}</span>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-chips"><span class="ccu-chip ccu-people" data-state="${nHome ? 'on' : 'off'}" role="group" aria-label="${esc(config.label || t('Persoane'))}"><span class="av-stack">${avs}</span>${lbl}</span></div>${notes}`;
}

/**
 * Actualizează DOM-ul existent după cel nou (text + atribute), fără să-l înlocuiască. Întoarce false dacă structura diferă
 * (noduri adăugate/șterse/alt tip) — atunci apelantul înlocuiește tot. Elementele rămân aceleași: nu clipesc, păstrează animațiile
 * și ascultătorii de gesturi.
 */
function patchNodes(o, n) {
  const oc = o.childNodes, nc = n.childNodes;
  if (!oc || !nc || oc.length !== nc.length) return false;
  for (let i = 0; i < oc.length; i++) {
    const a = oc[i], b = nc[i];
    if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) return false;
    if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; continue; }
    if (a.nodeType !== 1) return false;
    for (const at of Array.from(a.attributes)) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
    for (const at of Array.from(b.attributes)) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
    if (!patchNodes(a, b)) return false;
  }
  return true;
}

return { esc, formatClock, defaultTap, entityModel, sparkPath, renderButton, renderChip, renderButtons, visibleChips, normalizeWaste, wasteModel, renderChips, normalizeHeader, renderHeader, normalizeNav, navPath, holdTarget, renderNav, safePicture, normalizePeople, renderPeople, patchNodes };
})();

__m["graph-data"] = (() => {
const { t, weekdayShort, monthShort, decSep, thouSep } = __m["i18n"];
// src/graph-data.mjs — prelucrare date și formatare pentru ccu-graph-card

/**
 * niceScale(min, max, ticks) — generează o scară „frumoasă” (1/2/5 × 10^n).
 * Returnează { ticks: number[], step: number, min: number, max: number }.
 *
 * Reguli:
 * - dacă min === max → extinde simetric cu ±step/2 (step dedus din ticks)
 * - dacă min > max → inversează (min/max), cu warning în log (NU aruncă excepție)
 * - dacă ambele sunt 0 → extinde la [-step/2, +step/2]
 * - step e rotunjit la 1/2/5 × 10^n
 * - ticks contează ca recomandare (nu strict)
 */
function niceScale(min, max, ticks = 4) {
  if (!Number.isFinite(min) || Number.isNaN(min)) min = 0;
  if (!Number.isFinite(max) || Number.isNaN(max)) max = 0;

  // dacă min === max, extinde simetric
  if (min === max) {
    const span = max === 0 ? 1 : Math.abs(max) * 0.2;
    const extend = Math.max(span, getNiceStep(max, ticks));
    min -= extend;
    max += extend;
  }

  // dacă min > max, inversează (nu aruncă)
  if (min > max) {
    const tmp = min;
    min = max;
    max = tmp;
  }

  const range = max - min;
  if (range === 0) {
    // extinde în jurul 0 sau al valorii
    const base = Math.abs(min) > 0 ? min : 1;
    const extend = getNiceStep(base, ticks);
    min -= extend;
    max += extend;
  }

  // pas inițial approx
  let step = range / (ticks - 1);
  step = roundNiceStep(step);

  // recalculăm min/max pentru a le alinia la step (multiplu de step)
  const minRounded = Math.floor(min / step) * step;
  const maxRounded = Math.ceil(max / step) * step;
  const newRange = maxRounded - minRounded;

  // ajustăm ticks dacă range e foarte mic (ex: 0.1 cu step 0.1 → doar 2 ticks)
  const calculatedTicks = Math.floor(newRange / step) + 1;
  const finalTicks = Math.max(ticks, Math.min(5, calculatedTicks));

  const ticksArr = [];
  for (let i = 0; i <= finalTicks; i++) {
    ticksArr.push(minRounded + i * step);
  }

  return { ticks: ticksArr, step, min: minRounded, max: maxRounded };
}

/**
 * roundNiceStep(step) — rotunjește pasul la 1/2/5 × 10^n.
 */
function roundNiceStep(step) {
  if (step <= 0 || !Number.isFinite(step)) return 1;

  const exp = Math.floor(Math.log10(step));
  const norm = step / Math.pow(10, exp); // între 1 și 10
  let multiplier = 1;
  if (norm < 2) multiplier = 1;
  else if (norm < 5) multiplier = 2;
  else multiplier = 5;

  return multiplier * Math.pow(10, exp);
}

/**
 * getNiceStep(val, ticks) — pas recomandat pentru o valoare dată.
 */
function getNiceStep(val, ticks) {
  val = Math.abs(val) || 1;
  const span = val * (2 / (ticks - 1));
  return roundNiceStep(span);
}

/**
 * downsample(points, target) — reducere la ≤ target puncte, păstrând primul/ultimul și vârfurile.
 * points = [{ t: Date|number, v: number }, ...]; t poate fi epoch_ms sau epoch_sec.
 * Returnează array cu ≤ target puncte.
 *
 * Algoritm:
 * - normalizează timestamp-urile la ms
 * - împarte în găleți egale (target puncte)
 * - pentru fiecare găleată: păstrează primul, ultimul, min, max
 * - pentru vârfuri: păstrează punctele cu variație semnificativă (> 10% din intervalul seriei)
 */
function downsample(points, target = 150) {
  if (!Array.isArray(points) || points.length === 0) return [];
  if (target <= 0) target = 150;

  // Normalizează timestamp la ms (epoch_sec → înmulțește cu 1000)
  const normalized = points.map((p, i) => {
    const t = typeof p.t === 'number' ? p.t : p.t ? Date.parse(p.t) : i;
    const isSec = t < 1e12; // epoch_sec < 1e12, epoch_ms ≥ 1e12
    return {
      t: isSec ? t * 1000 : t,
      v: typeof p.v === 'number' && !isNaN(p.v) ? p.v : null,
      orig: p
    };
  });

  // elimină punctele fără valoare (null/NaN)
  const valid = normalized.filter(p => p.v !== null && !isNaN(p.v));
  if (valid.length === 0) return [];

  // dacă numărul de puncte e ≤ target, return direct
  if (valid.length <= target) {
    return valid.map(p => ({ t: p.t, v: p.v, orig: p.orig }));
  }

  // Împarte în găleți egale
  const bucketSize = Math.ceil(valid.length / target);
  const buckets = [];
  for (let i = 0; i < valid.length; i += bucketSize) {
    const slice = valid.slice(i, i + bucketSize);
    buckets.push(slice);
  }

  // Pentru fiecare găleată: păstrează primul, ultimul, min, max
  const result = [];
  for (const bucket of buckets) {
    const vs = bucket.map(p => p.v);
    const minV = Math.min(...vs);
    const maxV = Math.max(...vs);
    const minP = bucket.find(p => p.v === minV);
    const maxP = bucket.find(p => p.v === maxV);

    // Adaugă puncte distincte (evită duplicate dacă minP/maxP sunt primul/ultimul)
    const add = (p) => {
      if (!result.some(r => r.t === p.t)) result.push(p);
    };
    add(bucket[0]);
    add(bucket[bucket.length - 1]);
    if (minP) add(minP);
    if (maxP && maxP !== minP) add(maxP);
  }

  // Dacă rămânem cu mai puține decât target, putem adăuga și puncte cu variație > 10%
  const rangeV = Math.max(...result.map(p => p.v)) - Math.min(...result.map(p => p.v));
  const threshold = rangeV * 0.1;

  // Sortează după t și calculează diferențele
  result.sort((a, b) => a.t - b.t);
  const extended = [result[0]];
  for (let i = 1; i < result.length; i++) {
    const prev = result[i - 1];
    const curr = result[i];
    const diff = Math.abs(curr.v - prev.v);
    // păstrează întotdeauna primul/ultimul
    if (i === result.length - 1 || diff >= threshold) {
      extended.push(curr);
    }
  }

  // dacă e prea mult, reducă (menține primul/ultimul)
  if (extended.length > target) {
    const keepEvery = Math.ceil(extended.length / target);
    const reduced = [];
    for (let i = 0; i < extended.length; i += keepEvery) {
      reduced.push(extended[i]);
    }
    // asigură ultimul punct
    if (reduced[reduced.length - 1] !== extended[extended.length - 1]) {
      reduced.push(extended[extended.length - 1]);
    }
    return reduced.map(p => ({ t: p.t, v: p.v, orig: p.orig }));
  }

  return extended.map(p => ({ t: p.t, v: p.v, orig: p.orig }));
}

/**
 * parseMinimalResponse(data, entityIds) — parsare răspuns minimal_response de la HA.
 * data = { [entity_id]: [{ s: state, lu: epoch_sec }, ...] }
 * entityIds = array de entity_id (sau single string)
 *
 * Returnează { [entity_id]: [{ t: ms, v: number|null }, ...] }.
 * Ignoră unavailable/unknown/non-numeric (valoare = null).
 */
/** Stări „pornit / oprit” desenabile ca 1 / 0 (ventile, întrerupătoare, senzori binari). Altceva → undefined. */
const DISCRETE = { on: 1, off: 0, open: 1, closed: 0, true: 1, false: 0, home: 1, not_home: 0, detected: 1, clear: 0 };
function discreteValue(s) {
  const k = typeof s === 'string' ? s.trim().toLowerCase() : s === true ? 'true' : s === false ? 'false' : '';
  return Object.prototype.hasOwnProperty.call(DISCRETE, k) ? DISCRETE[k] : undefined;
}

function parseMinimalResponse(data, entityIds) {
  if (!data || typeof data !== 'object') return {};

  const ids = Array.isArray(entityIds) ? entityIds : [entityIds];
  const result = {};

  for (const entityId of ids) {
    const raw = data[entityId];
    if (!Array.isArray(raw)) continue;

    const points = [];
    for (const item of raw) {
      const s = item.s;
      const dv = discreteValue(s);
      // Parsează starea (sau null pentru unavailable/unknown)
      let v = null;
      if (s === null || s === undefined || s === 'unavailable' || s === 'unknown') {
        v = null;
      } else if (typeof s === 'number') {
        v = s;
      } else if (typeof s === 'string') {
        // handle kW → ×1000
        const trimmed = s.trim();
        let num = Number(trimmed);
        if (!isNaN(num)) {
          // dacă unitatea e implicit kW (ex: `1.2` fără suffix → assume kW)
          // pentru acum, luăm ca atare; extensie posibilă: suffix k/M/G
          if (trimmed.endsWith('k') || trimmed.endsWith('K')) {
            num *= 1000;
          } else if (trimmed.endsWith('M') || trimmed.endsWith('m')) {
            num *= 1000000;
          }
          v = num;
        } else if (dv !== undefined) { v = dv; points.binary = true; }   // pornit / oprit → 1 / 0
      }
      // epoch_sec (lu) → ms (×1000)
      const t = typeof item.lu === 'number' ? item.lu * 1000 : item.lu;

      points.push({ t, v });
    }

    result[entityId] = points;
  }

  return result;
}

/**
 * formatLabel(value, unit) — formatează o valoare pentru etichetă (Y-axis sau tooltip).
 * - W/kW/MWh: virgulă zecimală (românesc), separator de mii (spațiu subțire)
 * - etichete pentru unități: „kW”, „MWh”, „°C”, etc.
 */
function formatLabel(value, unit) {
  if (value === null || value === undefined || isNaN(value)) return '—';

  const abs = Math.abs(value);
  const sign = value < 0 ? '−' : '';
  const formatted = formatNumber(value);

  if (!unit) return `${sign}${formatted}`;

  // unități cu transformări de scală
  const u = String(unit).toLowerCase();
  if (u.includes('w') && !u.includes('wh')) {
    // W → kW de la 1000
    if (abs >= 1000) {
      return `${sign}${formatNumber(value / 1000)} kW`;
    }
    return `${sign}${formatted} W`;
  } else if (u.includes('wh')) {
    // kWh → MWh de la 1000
    if (abs >= 1000) {
      return `${sign}${formatNumber(value / 1000)} MWh`;
    }
    return `${sign}${formatted} kWh`;
  } else if (u.includes('c')) {
    return `${sign}${formatted} °C`;
  } else if (u.includes('lux')) {
    return `${sign}${formatted} lx`;
  } else if (u.includes('m2')) {
    return `${sign}${formatted} W/m²`;
  } else if (u.includes('%')) {
    return `${sign}${formatted} %`;
  } else {
    // generic: value unit
    return `${sign}${formatted} ${unit}`;
  }
}

/**
 * formatNumber(value) — formatează un număr românesc (virgulă zecimală, separator de mii).
 * - zecimale: |x|≥100 → 0, ≥10 → 1, altfel 2 (fără zerouri finale)
 * - |x| ≥ 1e15 sau nefinit → '—'
 * - separator de mii cu spațiu subțire (0x202F)
 */
function formatNumber(value) {
  if (value === undefined || value === null || Number.isNaN(value) || !Number.isFinite(value)) return '—';
  const abs = Math.abs(value);
  if (abs >= 1e15 || !Number.isFinite(value)) return '—';
  if (value === -0) return '0';
  const decimals = abs >= 100 ? 0 : abs >= 10 ? 1 : 2;
  const s = value.toFixed(decimals);
  // separator de mii cu spațiu subțire
  const parts = s.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thouSep());
  const sep = decSep();
  const formatted = parts.join(sep);
  // elimină zerouri finale (dar nu toate dacă e 0)
  // regex: elimină .0, ,0, .,0, ,,0 la final
  const result = formatted.replace(/(\.,?|,)0+$/, '').replace(/[.,]$/, '');
  // după rotunjire, dacă rezultatul e 0 → '0' (fără minus)
  if (result === '0' || result === '-0' || result === '0' + sep + '0' || result === '-0' + sep + '0') return '0';
  return result;
}

/**
 * formatTimeLabel(t) — formatează un timestamp (ms) ca etichetă pe X-axis (ore sau zile).
 * - pentru intervale de 24h: afișează „HH:MM”
 * - pentru 7zile: afișează „ZZ HH:MM”
 * - pentru 30d: afișează „ZZ”
 * - ignoră fusul orar (folosește new Date() local)
 */
function formatTimeLabel(t, range = '24h') {
  const d = new Date(t);

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  if (range === '24h') {
    return `${hours}:${minutes}`;
  } else if (range === '7d') {
    const dayName = weekdayShort(d);
    return `${dayName} ${hours}:${minutes}`;
  } else if (range === '30d') {
    return String(d.getDate());
  } else if (typeof range === 'object' && range.hours) {
    if (range.hours <= 24) {
      return `${hours}:${minutes}`;
    } else if (range.hours <= 24 * 7) {
      const dayName = weekdayShort(d);
      return `${dayName} ${hours}:${minutes}`;
    } else {
      return String(d.getDate());
    }
  }
  return `${hours}:${minutes}`;
}

/**
 * formatRangeLabel(start, end, range) — formatează intervalul curent ca label (ex: „Azi”, „Ultima săptămână”).
 */
function formatRangeLabel(start, end, range) {
  const diffDays = (end - start) / (1000 * 60 * 60 * 24);

  if (range === '24h' || (typeof range === 'object' && range.hours === 24)) {
    const today = new Date();
    return t('Azi, {d}', { d: formatDate(today) });
  } else if (range === '7d' || diffDays >= 6.5 && diffDays <= 7.5) {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return t('Ultima săptămână');
  } else if (range === '30d' || diffDays >= 29 && diffDays <= 31) {
    return t('Ultimul 30 de zile');
  } else if (typeof range === 'object' && range.hours) {
    if (range.hours === 24) return t('Ultimile 24 de ore');
    if (range.hours === 12) return t('Ultimile 12 ore');
    if (range.hours >= 7 * 24) return t('Ultima săptămână');
    if (range.hours >= 30 * 24) return t('Ultimul 30 de zile');
    return t('Ultimile {n} ore', { n: range.hours });
  }
  return t('Interval');
}

/**
 * formatDate(d) — formatează o dată ca „ZZ LL AAAA”.
 */
function formatDate(d) {
  const days = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa'];
  const months = Array.from({ length: 12 }, (_, i) => monthShort(i));
  return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

// Export pentru testare

return { roundNiceStep, getNiceStep, formatDate, niceScale, downsample, discreteValue, parseMinimalResponse, formatLabel, formatNumber, formatTimeLabel, formatRangeLabel };
})();

__m["graph-card"] = (() => {
// src/graph-card.mjs — ccu-graph-card (folosește funcțiile de date din graph-data.mjs).
// Istoric HA: callWS history/history_during_period → { entity_id: [{ s, lu }] } (lu în SECUNDE). SVG fără biblioteci, culori din tokeni.
const { t } = __m["i18n"];
const { niceScale, formatLabel, formatNumber, formatTimeLabel } = __m["graph-data"];
const { colorVars } = __m["presets"];
const { esc } = __m["render"];
const RANGE_H = { '6h': 6, '12h': 12, '24h': 24, '7d': 168, '30d': 720 };
const KINDS = ['area', 'line'];
const DEFAULT_COLORS = ['accent', 'yellow', 'blue'];
const TOKEN_VAR = { accent: 'var(--ccu-series)', on: 'var(--ccu-on)', ok: 'var(--ccu-ok)', alert: 'var(--ccu-alert)', green: 'var(--ccu-c-green)', yellow: 'var(--ccu-c-yellow)', orange: 'var(--ccu-c-orange)', blue: 'var(--ccu-c-blue)', cyan: 'var(--ccu-c-cyan)', red: 'var(--ccu-c-red)', white: 'var(--ccu-c-white)' };

/** Valoare + unitate pentru etichete: kW rămâne kW (formatLabel din graph-data îl trata ca W), W ≥ 1000 → kW, restul ca în formatLabel. */
function formatValue(v, unit) {
  const u = String(unit || '').trim();
  if (/^kw$/i.test(u)) return Number.isFinite(v) ? `${v < 0 ? '−' : ''}${formatNumber(Math.abs(v))} kW` : '—';
  return formatLabel(v, u);
}

/** Ore dintr-un interval: '24h' | '7d' | 6 | { hours: 12 }. Necunoscut → 24. */
function rangeHours(r) {
  if (typeof r === 'number' && r >= 1 && r <= 24 * 90) return r;
  if (r && typeof r === 'object' && Number(r.hours) >= 1 && Number(r.hours) <= 24 * 90) return Number(r.hours);
  if (RANGE_H[r]) return RANGE_H[r];
  const m = typeof r === 'string' ? /^\s*(\d{1,4})\s*([hd])\s*$/i.exec(r) : null;   // orice „48h”, „3d”, „90d” (1 h … 90 zile)
  if (m) { const h = Number(m[1]) * (m[2].toLowerCase() === 'd' ? 24 : 1); if (h >= 1 && h <= 24 * 90) return h; }
  return 24;
}
const rangeKey = (r) => (typeof r === 'string' && RANGE_H[r] ? r : `${rangeHours(r)}h`);
const tabLabel = (r) => { const k = rangeKey(r); return k === '7d' ? t('7 zile') : k === '30d' ? t('30 zile') : ({ '6h': '6 h', '12h': '12 h', '24h': '24 h' }[k] || `${rangeHours(r)} h`); };

/** Culoare de serie → valoare CSS sigură (token → var(), #hex/rgb validat → ca atare, altfel implicit). */
function seriesColor(c, idx) {
  if (c === true) c = 'on'; // YAML: `color: on` fără ghilimele devine true
  if (typeof c === 'string' && TOKEN_VAR[c]) return TOKEN_VAR[c];
  const v = colorVars({ on: c }).vars['--ccu-on'];
  return v || TOKEN_VAR[DEFAULT_COLORS[idx] || 'accent'];
}

/**
 * thin(points, target) — reduce o serie [{t, v}] la cel mult `target` puncte, păstrând vârfurile:
 * pe fiecare găleată de timp rămân minimul și maximul (în ordine cronologică). Punctele fără valoare (v null) rămân ca „goluri”.
 * Primul și ultimul punct se păstrează mereu. Nu modifică seria primită.
 */
function thin(points, target = 150) {
  const src = Array.isArray(points) ? points.filter((p) => p && Number.isFinite(p.t)) : [];
  if (src.length <= target) return src.slice();
  if (target < 4) return src.slice(0, Math.max(0, target));
  const per = Math.ceil(src.length / Math.floor((target - 2) / 2)); // puncte pe găleată → ≤ (target-2)/2 găleți × 2 + capete
  const out = [src[0]];
  for (let i = 1; i < src.length - 1; i += per) {
    const b = src.slice(i, Math.min(i + per, src.length - 1));
    const real = b.filter((p) => p.v !== null && Number.isFinite(p.v));
    if (real.length < b.length) { // găleată cu goluri: păstrăm golul ca separator
      const gap = b.find((p) => p.v === null || !Number.isFinite(p.v));
      if (!real.length) { out.push(gap); continue; }
    }
    if (!real.length) continue;
    let lo = real[0], hi = real[0];
    for (const p of real) { if (p.v < lo.v) lo = p; if (p.v > hi.v) hi = p; }
    const pair = lo === hi ? [lo] : (lo.t < hi.t ? [lo, hi] : [hi, lo]);
    out.push(...pair);
  }
  out.push(src[src.length - 1]);
  return out;
}

/** Normalizează config-ul graficului. Întoarce { config, warnings[] }. */
function normalizeGraphConfig(cfg) {
  const warnings = [];
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const series = [];
  const timeline = src.timeline === true, maxSeries = timeline ? 8 : 3;   // cronologie: un rând pe serie, până la 8
  (Array.isArray(src.series) ? src.series : []).slice(0, maxSeries).forEach((s, i) => {
    const o = typeof s === 'string' ? { entity: s } : s && typeof s === 'object' ? { ...s } : null;
    if (!o || typeof o.entity !== 'string' || !/^[a-z_]+\.[a-z0-9_]+$/.test(o.entity)) { warnings.push(t('Seria #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    o.kind = KINDS.includes(o.kind) ? o.kind : (i === 0 ? 'area' : 'line');
    series.push(o);
  });
  if (Array.isArray(src.series) && src.series.length > maxSeries) warnings.push(timeline ? t('Grafic: maximum 8 serii (cronologie); restul sunt ignorate.') : t('Grafic: maximum 3 serii; restul sunt ignorate.'));
  const range = src.range === undefined ? '24h' : src.range;
  if (src.range !== undefined && rangeHours(range) === 24 && range !== '24h' && range !== 24 && !(range && range.hours === 24)) warnings.push(t('Interval necunoscut "{r}" → 24h.', { r: typeof range === 'string' ? range : JSON.stringify(range) }));
  const tabs = (Array.isArray(src.tabs) ? src.tabs : []).filter((t) => rangeHours(t) > 0).slice(0, 4);
  const height = Number.isFinite(Number(src.height)) && src.height >= 60 && src.height <= 400 ? Number(src.height) : 0;
  const refresh = Number.isFinite(Number(src.refresh_minutes)) && src.refresh_minutes >= 1 && src.refresh_minutes <= 60 ? Number(src.refresh_minutes) : 5;
  return { config: { ...src, series, range, tabs, height, refresh_minutes: refresh, legend: src.legend !== false, timeline, title: src.title ? String(src.title) : '' }, warnings };
}

// ---- axa X: ore rotunjite ----
function timeTicks(startMs, endMs, hours) {
  const stepH = hours <= 6 ? 1 : hours <= 12 ? 2 : hours <= 24 ? 4 : hours <= 72 ? 12 : hours <= 168 ? 24 : 24 * 5;
  const d = new Date(startMs); d.setMinutes(0, 0, 0);
  if (stepH >= 24) d.setHours(0);
  const out = [];
  for (let t = d.getTime(); t <= endMs; t += stepH * 3600e3) {
    if (t >= startMs) out.push(t);
    if (out.length > 12) break;
  }
  return out;
}
const lblRange = (hours) => (hours <= 24 ? '24h' : hours <= 24 * 8 ? '7d' : '30d');

/**
 * Model pur: din config + date → coordonate gata de desenat. data[i] = [{t(ms), v|null}] per serie.
 * Axa din dreapta apare doar dacă o serie are altă unitate decât prima.
 */
function buildGraphModel(config, data, width, height, now = Date.now()) {
  if (config.timeline) return buildTimelineModel(config, data, width, now);
  const W = Math.max(200, Math.round(width || 360)), H = Math.max(80, Math.round(height || 150));
  const fs = W < 420 ? 11 : 12;
  const hours = rangeHours(config.range);
  const t1 = now, t0 = now - hours * 3600e3;
  const units = config.series.map((s, i) => s.unit || (data[i] && data[i].unit) || '');
  const rightIdx = config.series.map((s, i) => i).filter((i) => i > 0 && units[i] !== units[0]);
  const hasRight = rightIdx.length > 0;
  const axisRight = config.y_axis === 'right' && !hasRight; // etichetele Y în dreapta (ca ), când nu e nevoie de a doua axă
  const extent = (idxs) => {
    let lo = Infinity, hi = -Infinity;
    for (const i of idxs) for (const p of (data[i] || [])) if (p.v !== null && Number.isFinite(p.v)) { lo = Math.min(lo, p.v); hi = Math.max(hi, p.v); }
    if (!Number.isFinite(lo)) { lo = 0; hi = 1; }
    if (lo > 0 && lo < hi * 0.6) lo = 0; // zona pornește de la 0 când valorile sunt „mari” față de minim
    return niceScale(lo, hi, H < 120 ? 2 : 4);
  };
  const leftIdx = config.series.map((s, i) => i).filter((i) => !rightIdx.includes(i));
  const binAll = leftIdx.length > 0 && leftIdx.every((i) => data[i] && data[i].binary);   // doar serii pornit / oprit: axa are două trepte
  const sL = binAll ? { min: -0.15, max: 1.15, ticks: [0, 1] } : extent(leftIdx), sR = hasRight ? extent(rightIdx) : null;
  // lățimea etichetelor Y după cea mai lungă etichetă (ex. „2 000 ppb” nu mai iese din cadru)
  const tickText = (tv) => (binAll ? (tv >= 1 ? t('Pornit') : t('Oprit')) : formatValue(tv, units[0]));
  const labLen = Math.max(...sL.ticks.map((tv) => tickText(tv).length), ...(sR ? sR.ticks.map((tv) => formatValue(tv, units[rightIdx[0]]).length) : [0]));
  const lab = Math.max(Math.round(fs * 3.4), Math.ceil(labLen * fs * 0.62 + 8));
  const padL = axisRight ? 10 : lab, padR = hasRight || axisRight ? lab : 10, padT = 8, padB = fs + 14;
  const pw = W - padL - padR, ph = H - padT - padB;
  const X = (t) => padL + ((t - t0) / (t1 - t0)) * pw;
  const Y = (v, sc) => padT + (1 - (v - sc.min) / ((sc.max - sc.min) || 1)) * ph;

  const grid = sL.ticks.map((tv) => ({ y: +Y(tv, sL).toFixed(1), label: tickText(tv), right: sR ? formatValue(sR.ticks[Math.round(sL.ticks.indexOf(tv) * (sR.ticks.length - 1) / Math.max(1, sL.ticks.length - 1))], units[rightIdx[0]]) : '' }));
  const xt = timeTicks(t0, t1, hours).map((t) => ({ x: +X(t).toFixed(1), label: formatTimeLabel(t, lblRange(hours)) }));
  // etichete X fără suprapuneri: păstrăm doar cele la ≥ 46 px una de alta
  const xticks = []; let lastX = -1e9;
  for (const t of xt) if (t.x - lastX >= (W < 420 ? 52 : 60)) { xticks.push(t); lastX = t.x; }

  const seriesOut = config.series.map((s, i) => {
    const sc = rightIdx.includes(i) ? sR : sL;
    const pts = (data[i] || []).filter((p) => p.t >= t0 - 60e3 && p.t <= t1 + 60e3);
    // serie pornit / oprit: trepte (valoarea rămâne până la următoarea schimbare) și ține până la „acum”
    let drawPts = pts;
    if (data[i] && data[i].binary) {
      drawPts = [];
      pts.forEach((p, k) => { if (p.v !== null && k > 0 && pts[k - 1].v !== null) drawPts.push({ t: p.t, v: pts[k - 1].v }); drawPts.push(p); });
      const last = pts[pts.length - 1]; if (last && last.v !== null && last.t < t1) drawPts.push({ t: t1, v: last.v });
    }
    let line = '', fill = '', seg = [];
    const flush = () => {
      if (seg.length >= 2) {
        const d = seg.map((p, k) => `${k ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
        line += (line ? ' ' : '') + d;
        const base = padT + ph;
        fill += (fill ? ' ' : '') + `${d} L${seg[seg.length - 1][0].toFixed(1)} ${base} L${seg[0][0].toFixed(1)} ${base} Z`;
      } else if (seg.length === 1) { line += (line ? ' ' : '') + `M${seg[0][0].toFixed(1)} ${seg[0][1].toFixed(1)} l0.1 0`; }
      seg = [];
    };
    for (const p of drawPts) { if (p.v === null || !Number.isFinite(p.v)) { flush(); continue; } seg.push([Math.min(padL + pw, Math.max(padL, X(p.t))), Y(p.v, sc)]); }
    flush();
    return { name: s.name || s.entity, unit: units[i], binary: !!(data[i] && data[i].binary), kind: s.kind, color: seriesColor(s.color ?? DEFAULT_COLORS[i], i), line, fill, points: pts.filter((p) => p.v !== null && Number.isFinite(p.v)).map((p) => ({ t: p.t, v: p.v, x: X(p.t), y: Y(p.v, sc) })) };
  });
  return { W, H, fs, padL, padR, padT, padB, pw, ph, t0, t1, hours, grid, xticks, series: seriesOut, hasRight, axisRight, empty: seriesOut.every((s) => !s.line) };
}

/** Durata în text scurt: „45 min”, „2 h”, „1 h 25 min”. */
function formatDuration(ms) {
  const m = Math.round(ms / 60000);
  if (m < 1) return '<1 min';
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60), r = m % 60;
  return r ? `${h} h ${r} min` : `${h} h`;
}
/** Varianta compactă, pentru bare înguste: „1,4 h” / „45 min”. */
const durShort = (ms) => { const m = Math.round(ms / 60000); return m < 60 ? `${Math.max(1, m)} min` : `${formatNumber(Math.round(m / 6) / 10)} h`; };

/** Ore rotunde pe axă (00:00, 03:00, 06:00 …), în ora locală; pași de câte 1 / 2 / 3 / 6 / 12 / 24 de ore după interval. */
function alignedTicks(t0, t1, hours) {
  const stepH = hours <= 6 ? 1 : hours <= 12 ? 2 : hours <= 24 ? 3 : hours <= 48 ? 6 : hours <= 72 ? 12 : hours <= 168 ? 24 : 24 * 5;
  const d = new Date(t0); d.setMinutes(0, 0, 0);
  if (stepH >= 24) { d.setHours(0); if (d.getTime() < t0) d.setDate(d.getDate() + 1); }
  else while (d.getTime() < t0 || d.getHours() % stepH !== 0) d.setHours(d.getHours() + 1);
  const out = [];
  for (let t = d.getTime(); t <= t1 && out.length < 16;) {
    out.push(t);
    const n = new Date(t); if (stepH >= 24) n.setDate(n.getDate() + stepH / 24); else n.setHours(n.getHours() + stepH);
    t = n.getTime();
  }
  return out;
}

/**
 * Cronologie: un rând pe serie, cu bare unde seria e „pornită” (1 / pornit / > 0), hașurat unde e indisponibilă și durata scrisă pe bare.
 * Ideal pentru ventile, întrerupătoare, uși. Model pur: data[i] = [{ t (ms), v | null }]; valoarea ține până la următorul punct (și până la „acum”).
 */
function buildTimelineModel(config, data, width, now = Date.now()) {
  const W = Math.max(200, Math.round(width || 360)), fs = W < 420 ? 11 : 12;
  const hours = rangeHours(config.range), t1 = now, t0 = now - hours * 3600e3;
  const showDur = config.hide_durations !== true;
  const maxChars = Math.max(6, Math.floor(Math.min(W * 0.36, 140) / (fs * 0.56)));
  const full = config.series.map((s) => String(s.name || s.entity));
  const names = full.map((n) => (n.length > maxChars ? n.slice(0, Math.max(1, maxChars - 1)) + '…' : n));
  const laneH = Number(config.lane_height) >= 12 && Number(config.lane_height) <= 36 ? Number(config.lane_height) : 22, gap = 6, n = config.series.length;
  // pe rând: perioadele (pornit / indisponibil) cu ora de început și de sfârșit, ca să se poată citi cât a mers
  const raw = config.series.map((s, i) => {
    const pts = (data[i] || []).filter((p) => p && Number.isFinite(p.t)).slice().sort((x, y) => x.t - y.t);
    const on = [], na = [];
    pts.forEach((p, k) => {
      const a = Math.max(t0, p.t), b = Math.min(t1, k + 1 < pts.length ? pts[k + 1].t : t1);
      if (b <= a) return;
      if (p.v === null || !Number.isFinite(p.v)) na.push({ a, b }); else if (p.v > 0) on.push({ a, b });
    });
    const merge = (arr) => arr.reduce((acc, sg) => { const l = acc[acc.length - 1]; if (l && sg.a <= l.b + 1000) l.b = Math.max(l.b, sg.b); else acc.push({ ...sg }); return acc; }, []);
    return { on: merge(on), na: merge(na), known: pts.some((p) => p.v !== null && Number.isFinite(p.v)) };
  });
  const totals = raw.map((r) => r.on.reduce((a, sg) => a + (sg.b - sg.a), 0));
  const totTexts = totals.map((ms) => (ms > 0 ? formatDuration(ms) : '0'));
  const padL = Math.min(Math.round(W * 0.38), Math.max(56, Math.ceil(Math.max(...names.map((x) => x.length)) * fs * 0.56 + 12)));
  const padR = showDur ? Math.min(Math.round(W * 0.26), Math.ceil(Math.max(...totTexts.map((x) => x.length)) * fs * 0.56 + 12)) : 8;
  const padT = 4, padB = fs + 12, pw = W - padL - padR, ph = n * laneH + Math.max(0, n - 1) * gap, H = padT + ph + padB;
  const X = (t) => padL + ((t - t0) / (t1 - t0)) * pw;
  const seg = (sg) => ({ a: sg.a, b: sg.b, dur: sg.b - sg.a, x: +X(sg.a).toFixed(1), w: Math.max(1.5, +(X(sg.b) - X(sg.a)).toFixed(1)) });
  const lanes = config.series.map((s, i) => ({ name: names[i], fullName: full[i], color: seriesColor(s.color ?? 'on', i), y: padT + i * (laneH + gap), h: laneH, segs: raw[i].on.map(seg), na: raw[i].na.map(seg), known: raw[i].known, total: totals[i], totalText: totTexts[i] }));
  const xticks = []; let lastX = -1e9;
  for (const t of alignedTicks(t0, t1, hours)) { const x = +X(t).toFixed(1); if (x - lastX >= (W < 420 ? 50 : 58)) { xticks.push({ x, label: formatTimeLabel(t, lblRange(hours)) }); lastX = x; } }
  return { timeline: true, showDur, W, H, fs, padL, padR, padT, padB, pw, ph, t0, t1, hours, xticks, lanes, grid: [], hasRight: false, axisRight: false, series: lanes.map((l) => ({ name: l.name, color: l.color, points: [] })), empty: lanes.every((l) => !l.known) };
}

/** Ce se află la (x, y) în cronologie (coordonate SVG): bara, golul „indisponibil” sau intervalul oprit. null în afara rândurilor. */
function timelineHit(m, x, y) {
  if (!m || !m.timeline) return null;
  const lane = m.lanes.find((l) => y >= l.y - 3 && y <= l.y + l.h + 3);
  if (!lane || x < m.padL || x > m.W - m.padR) return null;
  const at = (arr) => arr.find((s) => x >= s.x && x <= s.x + s.w);
  const rng = m.hours <= 24 ? '24h' : '7d', span = (s) => `${formatTimeLabel(s.a, rng)}–${formatTimeLabel(s.b, rng)} · ${formatDuration(s.dur)}`;
  const on = at(lane.segs), na = at(lane.na);
  if (on) return { x, text: `${lane.fullName} · ${t('Pornit')} ${span(on)}` };
  if (na) return { x, text: `${lane.fullName} · ${t('indisponibil')} ${span(na)}` };
  return { x, text: `${lane.fullName} · ${t('Oprit')} · ${formatTimeLabel(m.t0 + ((x - m.padL) / m.pw) * (m.t1 - m.t0), rng)}` };
}

function renderTimelineSvg(m) {
  const ticks = m.xticks.map((tk) => `<line class="grid" x1="${tk.x}" x2="${tk.x}" y1="${m.padT}" y2="${m.padT + m.ph}"/><text x="${tk.x}" y="${m.H - 4}" text-anchor="middle">${esc(tk.label)}</text>`).join('');
  const fit = (w, text) => w >= text.length * m.fs * 0.56 + 8;
  const rows = m.lanes.map((l) => {
    const bars = l.segs.map((s) => {
      const long = formatDuration(s.dur), short = durShort(s.dur), txt = !m.showDur ? '' : fit(s.w, long) ? long : fit(s.w, short) ? short : '';
      return `<rect class="on" x="${s.x}" y="${l.y}" width="${s.w}" height="${l.h}" rx="3"/>${txt ? `<text class="dur" x="${(s.x + s.w / 2).toFixed(1)}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="middle">${esc(txt)}</text>` : ''}`;
    }).join('');
    const gaps = l.na.map((s) => `<rect class="na" x="${s.x}" y="${l.y}" width="${s.w}" height="${l.h}" rx="3" fill="url(#ccu-na)"/>`).join('');
    return `<g class="lane" style="--sc:${esc(l.color)}"><text class="ln" x="${m.padL - 8}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="end">${esc(l.name)}</text><rect class="trk" x="${m.padL}" y="${l.y}" width="${m.pw}" height="${l.h}" rx="4"/>${gaps}${bars}${m.showDur ? `<text class="tot" x="${m.W - 6}" y="${(l.y + l.h / 2 + 4).toFixed(1)}" text-anchor="end">${esc(l.totalText)}</text>` : ''}</g>`;
  }).join('');
  const defs = `<defs><pattern id="ccu-na" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#fbbf24" stroke-width="2" stroke-opacity=".55"/></pattern></defs>`;
  return `<svg class="ccu-graph timeline" viewBox="0 0 ${m.W} ${m.H}" width="${m.W}" height="${m.H}" role="img" aria-label="cronologie">${defs}${ticks}${rows}<line class="cursor" x1="0" x2="0" y1="${m.padT}" y2="${m.padT + m.ph}" opacity="0"/><g class="dots"></g></svg>`;
}

/** SVG-ul graficului (șir). Fără NaN: coordonatele vin din buildGraphModel. */
function renderGraphSvg(m) {
  if (m.timeline) return renderTimelineSvg(m);
  const g = m.grid.map((r) => `<line class="grid" x1="${m.padL}" x2="${m.W - m.padR}" y1="${r.y}" y2="${r.y}"/>${m.axisRight ? `<text x="${m.W - m.padR + 6}" y="${r.y + 3.5}">${esc(r.label)}</text>` : `<text x="${m.padL - 6}" y="${r.y + 3.5}" text-anchor="end">${esc(r.label)}</text>`}${m.hasRight && r.right ? `<text x="${m.W - m.padR + 6}" y="${r.y + 3.5}">${esc(r.right)}</text>` : ''}`).join('');
  const x = m.xticks.map((t) => `<text x="${t.x}" y="${m.H - 4}" text-anchor="middle">${esc(t.label)}</text>`).join('');
  const s = m.series.map((se, i) => (se.line ? `<g class="ser" style="--sc:${esc(se.color)}">${se.kind === 'area' ? `<defs><linearGradient id="gr${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--sc);stop-opacity:.38"/><stop offset="1" style="stop-color:var(--sc);stop-opacity:0"/></linearGradient></defs><path class="area" style="fill:url(#gr${i})" d="${se.fill}"/>` : ''}<path class="line" d="${se.line}"/></g>` : '')).join('');
  return `<svg class="ccu-graph" viewBox="0 0 ${m.W} ${m.H}" width="${m.W}" height="${m.H}" role="img" aria-label="grafic">${g}${x}${s}<line class="cursor" x1="0" x2="0" y1="${m.padT}" y2="${m.padT + m.ph}" opacity="0"/><g class="dots"></g></svg>`;
}

/** Tot cardul (șir): titlu + file + grafic + legendă. */
function renderGraphCard(config, m, state, opts = {}) {
  const tabs = config.tabs.length > 1 ? `<div class="ccu-tabs">${config.tabs.map((t, i) => `<button type="button" class="ccu-tab" data-tab="${i}" data-state="${rangeKey(t) === rangeKey(state.range) ? 'on' : 'off'}">${esc(tabLabel(t))}</button>`).join('')}</div>` : '';
  const legend = config.legend && !config.timeline && m.series.length > 1 ? `<div class="ccu-legend">${m.series.map((s) => `<span><i style="background:${esc(s.color)}"></i>${esc(s.name)}</span>`).join('')}</div>` : '';
  // compact: legenda urcă în rândul titlului (între titlu și file) — cardul e mai scund
  const inHead = config.compact === true ? legend : '';
  const head = config.title || tabs ? `<div class="ccu-graph-head${inHead ? ' compact' : ''}"><div class="ccu-title">${esc(config.title)}</div>${inHead}${tabs}</div>` : '';
  let body;
  if (state.loading && m.empty) body = `<div class="ccu-graph-msg" style="height:${m.H}px">${t('se încarcă…')}</div>`;
  else if (m.empty) body = `<div class="ccu-graph-msg" style="height:${m.H}px">${t('fără date istorice')}</div>`;
  else body = renderGraphSvg(m);
  return `<div class="ccu-card panel ccu-graph-card">${head}<div class="ccu-graph-wrap" style="min-height:${m.H}px">${body}<div class="ccu-tip" hidden></div></div>${inHead ? '' : legend}${notesHtml(opts.warnings)}</div>`;
}
const notesHtml = (w) => (w && w.length ? `<div class="ccu-note">${w.slice(0, 3).map(esc).join('<br>')}</div>` : '');

/** Cel mai apropiat punct de x (căutare binară). */
function nearestPoint(points, x) {
  if (!points || !points.length) return null;
  let lo = 0, hi = points.length - 1;
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (points[mid].x < x) lo = mid; else hi = mid; }
  return Math.abs(points[lo].x - x) <= Math.abs(points[hi].x - x) ? points[lo] : points[hi];
}

return { formatValue, rangeHours, seriesColor, thin, normalizeGraphConfig, buildGraphModel, formatDuration, buildTimelineModel, timelineHit, renderGraphSvg, renderGraphCard, nearestPoint };
})();

__m["energy"] = (() => {
// src/energy.mjs — cardurile de energie: flux (solar / rețea / baterie → consumatori) și baterie.
// Funcții PURE: model (din config + hass), geometrie și șabloane HTML/SVG. Fără DOM, fără rețea.
const { t } = __m["i18n"];
const { esc } = __m["render"];
const { iconSvg } = __m["icons"];
const { formatNumber } = __m["state"];
const ENTITY = /^[a-z_]+\.[a-z0-9_]+$/;
const MAX_CONSUMERS = 6;
const THRESH_W = 50; // sub 50 W un flux e considerat „repaus”

/** Puterea unei entități în W (kW/MW convertite). null dacă starea nu e un număr. */
function toWatts(s) {
  if (!s || s.state === '' || s.state === null || s.state === undefined) return null;
  const n = Number(s.state);
  if (!Number.isFinite(n)) return null;
  const u = String((s.attributes && s.attributes.unit_of_measurement) || 'W').trim();
  return n * (/^kw$/i.test(u) ? 1000 : /^mw$/i.test(u) ? 1e6 : 1);
}

/** Energia în kWh (Wh/kWh/MWh convertite). null dacă nu e număr. */
function toKwh(s) {
  if (!s || s.state === '' || s.state === null || s.state === undefined) return null;
  const n = Number(s.state);
  if (!Number.isFinite(n)) return null;
  const u = String((s.attributes && s.attributes.unit_of_measurement) || 'kWh').trim();
  return /^wh$/i.test(u) ? n / 1000 : /^mwh$/i.test(u) ? n * 1000 : n;
}

/** „1,82 kW” (de la 100 W în sus: 450 W = „0,45 kW”) / „45 W”; cu semn dacă signed. */
function fmtPower(w, signed = false) {
  if (w === null || !Number.isFinite(w)) return '—';
  const sign = w < 0 ? '−' : (signed && w > 0 ? '+' : '');
  const a = Math.abs(w);
  return `${sign}${a >= 100 ? formatNumber(a / 1000) + ' kW' : formatNumber(Math.round(a)) + ' W'}`;
}

const asObj = (v) => (typeof v === 'string' ? { entity: v } : v && typeof v === 'object' ? { ...v } : null);
const okId = (e) => typeof e === 'string' && ENTITY.test(e);

// ================================================================== FLUX ==
/** Normalizează config-ul fluxului. items = listă plată (stânga: solar/grid/battery, dreapta: consumatori, jos: stats). */
function normalizeFlowConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], items = [];
  const side = (key, def) => {
    const o = asObj(src[key] ?? (src.sources && src.sources[key]));
    if (!o) return;
    if (!okId(o.entity)) { warnings.push(t('Flux: „{k}” are entity_id lipsă sau invalid.', { k: key })); return; }
    // above / below: valori mici (doar numărul) deasupra / sub valoarea live a nodului, ex. la rețea: import lunar deasupra, import + export pe zi dedesubt
    const ex = (k, pos) => (Array.isArray(o[k]) ? o[k] : []).slice(0, 3).map((x, j) => {
      const e = typeof x === 'string' ? { entity: x } : asObj(x);
      if (!e || !okId(e.entity)) { warnings.push(t('Flux: „{k}.{s}” #{n} are entity_id invalid.', { k: key, s: k, n: j + 1 })); return null; }
      items.push({ kind: 'extra', entity: e.entity, name: e.label || e.name || '', icon: e.icon || '', arrow: ['in', 'out'].includes(e.arrow) ? e.arrow : '', parent: key, pos });
      return e.entity;
    }).filter(Boolean);
    const above = ex('above', 'above'), below = ex('below', 'below');
    items.push({ kind: key, entity: o.entity, name: o.name || def.name, icon: o.icon || def.icon, invert: o.invert === true, soc: okId(o.soc) ? o.soc : '', color: o.color, above, below });
  };
  side('solar', { name: t('Solar'), icon: 'sun' });
  side('grid', { name: t('Rețea'), icon: 'pylon' });
  side('battery', { name: t('Baterie'), icon: 'battery' });
  (Array.isArray(src.consumers) ? src.consumers : []).slice(0, MAX_CONSUMERS).forEach((c, i) => {
    const o = asObj(c);
    // `entities: [a, b, c]` = suma lor (ex. cele 3 faze ale unui contor); `subtract: [x]` = ce se scade (ex. EV-ul din priza halei, piscina din consumul casei)
    const sum = o && Array.isArray(o.entities) ? o.entities.filter(okId) : [];
    const first = o && okId(o.entity) ? o.entity : sum[0];
    if (!o || !first) { warnings.push(t('Consumator #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    const subtract = (Array.isArray(o.subtract) ? o.subtract : o.subtract ? [o.subtract] : []).filter(okId);
    items.push({ kind: 'consumer', entity: first, sum, subtract, name: o.name || first.split('.')[1].replace(/_/g, ' '), icon: o.icon || 'plug', hide_idle: o.hide_idle !== false });
  });
  if (Array.isArray(src.consumers) && src.consumers.length > MAX_CONSUMERS) warnings.push(t('Flux: maximum {m} consumatori; restul sunt ignorați.', { m: MAX_CONSUMERS }));
  (Array.isArray(src.stats) ? src.stats : []).slice(0, 4).forEach((c, i) => {
    const o = asObj(c);
    if (!o || !okId(o.entity)) { warnings.push(t('Statistica #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    items.push({ kind: 'stat', entity: o.entity, name: o.label || o.name || '', icon: o.icon || 'bolt' });
  });
  // sub titlu: energia produsă azi și radiația solară (rând mic, cu iconiță de soare)
  for (const [key, icon, label] of [['solar_today', 'sun', t('produs azi')], ['radiation', 'w-sun', t('radiație')]]) {
    const o = src[key] && typeof src[key] === 'object' ? src[key] : { entity: src[key] };
    if (!o.entity) continue;
    if (!okId(o.entity)) { warnings.push(t('Flux: „{k}” are entity_id lipsă sau invalid.', { k: key })); continue; }
    items.push({ kind: 'sunnote', entity: o.entity, name: o.label !== undefined ? String(o.label) : o.name !== undefined ? String(o.name) : src.sun_labels === false ? '' : label, icon: o.icon || icon });
  }
  return { items, title: src.title ? String(src.title) : '', warnings };
}

/**
 * Modelul fluxului. Convenții: rețea + = import, baterie + = descărcare (invert: true le întoarce).
 * Total = suma consumatorilor (dacă există), altfel suma surselor. Procentul = parte din Total.
 */
function buildFlowModel(items, hass) {
  const val = (it) => toWatts(hass && hass.states && hass.states[it.entity]);
  const fmtX = (id) => { const x = items.find((i) => i.kind === 'extra' && i.entity === id); const s = hass && hass.states && hass.states[id]; const n = s ? Number(s.state) : NaN;
    const unit = (s && s.attributes && s.attributes.unit_of_measurement) || '';
    return { ...x, text: Number.isFinite(n) && s.state !== '' ? `${formatNumber(n)}${unit ? ' ' + unit : ''}` : '—' }; };
  const left = items.filter((i) => i.kind === 'solar' || i.kind === 'grid' || i.kind === 'battery').map((it) => {
    let w = val(it);
    if (w !== null && it.kind === 'solar') w = Math.max(0, w);
    if (w !== null && it.invert) w = -w;
    let suffix = '';
    if (it.soc) { const s = hass && hass.states && hass.states[it.soc]; const p = s ? Number(s.state) : NaN; if (Number.isFinite(p)) suffix = ` (${Math.round(p)}%)`; }
    const dir = w === null ? 'na' : w > THRESH_W ? 'in' : w < -THRESH_W ? 'out' : 'idle';
    // text: invers față de direcția fluxului — rețea: export „+” / import „−”; baterie: încărcare „+” / descărcare „−” (solar rămâne „+”)
    const shown = w === null || it.kind === 'solar' ? w : -w;
    return { ...it, w, dir, text: fmtPower(shown, true), suffix, aboveX: (it.above || []).map(fmtX), belowX: (it.below || []).map(fmtX) };
  });
  // consumatorii care nu consumă (sub pragul de 10 W sau fără valoare) nu se desenează: altfel fluxul pare că merge spre ceva oprit (hide_idle: false îi păstrează)
  const cval = (it) => {
    const st = (id) => toWatts(hass && hass.states && hass.states[id]);
    const vs = (it.sum && it.sum.length ? it.sum : [it.entity]).map(st);
    if (vs.every((v) => v === null)) return null;
    let t = vs.reduce((a, v) => a + (v || 0), 0);
    for (const id of it.subtract || []) t -= st(id) || 0;
    return Math.max(0, t);
  };
  const cons = items.filter((i) => i.kind === 'consumer').map((it) => ({ ...it, w: cval(it) })).filter((c) => !(c.hide_idle && (c.w === null || c.w < 10)));
  const consSum = cons.reduce((a, c) => a + (c.w !== null && c.w > 0 ? c.w : 0), 0);
  const srcIn = left.reduce((a, l) => a + (l.w !== null && l.w > 0 ? l.w : 0), 0);
  const total = cons.length ? consSum : srcIn;
  const right = cons.map((c) => ({ ...c, pct: total > 0 && c.w !== null ? Math.round((Math.max(c.w, 0) / total) * 100) : null, text: fmtPower(c.w), dim: c.w !== null && c.w < 10 }))
    .sort((a, b) => (b.w ?? -1) - (a.w ?? -1));
  const stats = items.filter((i) => i.kind === 'stat').map((it) => {
    const s = hass && hass.states && hass.states[it.entity]; const n = s ? Number(s.state) : NaN;
    const unit = (s && s.attributes && s.attributes.unit_of_measurement) || '';
    return { ...it, text: Number.isFinite(n) && s.state !== '' ? `${formatNumber(n)}${unit ? ' ' + unit : ''}` : '—' };
  });
  const sun = items.filter((i) => i.kind === 'sunnote').map((it) => {
    const s = hass && hass.states && hass.states[it.entity]; const n = s ? Number(s.state) : NaN;
    const unit = (s && s.attributes && s.attributes.unit_of_measurement) || '';
    return { ...it, text: Number.isFinite(n) && s.state !== '' ? `${formatNumber(n)}${unit ? ' ' + unit : ''}` : '—' };
  });
  return { left, right, stats, sun, total, totalText: total >= THRESH_W ? fmtPower(total) : t('fără flux'), idle: total < THRESH_W };
}

/** Geometria: poziții verticale, panglici (poligoane) și nodul Total; toate coordonatele în [0,W]×[0,H]. */
function layoutFlow(model, W) {
  W = Math.max(280, Math.round(W || 360));
  const rowR = 46, nL = model.left.length, nR = model.right.length;
  const hL = model.left.map((l) => 56 + 15 * ((l.aboveX || []).length + (l.belowX || []).length));   // un rând cu valori suplimentare e mai înalt
  const H = Math.max(150, nR * rowR, hL.reduce((a, b) => a + b, 0)) + 12;
  // coloanele de text au lățimea textului (nu un procent fix): panglicile pornesc chiar lângă valori
  const est = (n) => 26 + 8 + 6.8 * n;
  const lenL = Math.max(4, ...model.left.map((l) => Math.max(String(l.name).length, String(l.text).length)));
  const lenR = Math.max(4, ...model.right.map((c) => Math.max(String(c.name).length, String(c.text).length + (W >= 480 && c.pct !== null ? 7 : 0))));
  const clampW = (v) => Math.round(Math.min(W * 0.38, Math.max(W * 0.2, v)));
  const colL = clampW(est(lenL) + 4), colR = clampW(est(lenR) + 4);
  const cx = W / 2, cy = H / 2, r = Math.min(43, W * 0.13);
  const ys = (n, i) => ((i + 0.5) * H) / Math.max(1, n);
  const all = [...model.left.map((l) => Math.abs(l.w || 0)), ...model.right.map((c) => c.w || 0)];
  const maxW = Math.max(1, ...all);
  const thick = (w) => 4 + 19 * Math.min(1, Math.abs(w || 0) / maxW);
  const f = (n) => Number(n.toFixed(1));
  const ribbon = (x0, y0, x1, y1, t) => {
    const mx = (x0 + x1) / 2, h = t / 2;
    return `M${f(x0)} ${f(y0 - h)} C${f(mx)} ${f(y0 - h)} ${f(mx)} ${f(y1 - h)} ${f(x1)} ${f(y1 - h)} L${f(x1)} ${f(y1 + h)} C${f(mx)} ${f(y1 + h)} ${f(mx)} ${f(y0 + h)} ${f(x0)} ${f(y0 + h)} Z`;
  };
  const center = (x0, y0, x1, y1) => { const mx = (x0 + x1) / 2; return `M${f(x0)} ${f(y0)} C${f(mx)} ${f(y0)} ${f(mx)} ${f(y1)} ${f(x1)} ${f(y1)}`; };
  const sumL = hL.reduce((a, b) => a + b, 0) || 1; let accL = 0;
  const lr = model.left.map((l, i) => { const y = ((accL + hL[i] / 2) / sumL) * H; accL += hL[i]; const t = thick(l.w); return { y: f(y), t: f(t), d: ribbon(colL, y, cx - r, cy, t), line: center(colL, y, cx - r, cy) }; });
  const rr = model.right.map((c, i) => { const y = ys(nR, i), t = thick(c.w); return { y: f(y), t: f(t), d: ribbon(cx + r, cy, W - colR, y, t), line: center(cx + r, cy, W - colR, y) }; });
  return { W, H, colL, colR, cx: f(cx), cy: f(cy), r: f(r), left: lr, right: rr };
}

const COLOR = { solar: 'var(--ccu-c-yellow)', grid: 'var(--ccu-c-blue)', battery: 'var(--ccu-c-green)', consumer: 'var(--ccu-c-cyan)' };

/** Tot cardul fluxului (șir HTML). */
function renderFlow(config, model, W, opts = {}) {
  const g = layoutFlow(model, W);
  const ids = new Map(config.entities.map((e, i) => [e.entity + '|' + e.kind, i]));
  const idOf = (it) => ids.get(it.entity + '|' + it.kind);
  const defs = model.left.map((l, i) => `<linearGradient id="fl${i}" x1="0" x2="1"><stop offset="0" style="stop-color:${esc(l.color && /^#/.test(l.color) ? l.color : COLOR[l.kind])};stop-opacity:.85"/><stop offset="1" style="stop-color:var(--ccu-on);stop-opacity:.55"/></linearGradient>`).join('')
    + model.right.map((c, i) => `<linearGradient id="fr${i}" x1="0" x2="1"><stop offset="0" style="stop-color:var(--ccu-on);stop-opacity:.55"/><stop offset="1" style="stop-color:${COLOR.consumer};stop-opacity:.8"/></linearGradient>`).join('');
  // panglica (și animația) apare doar când sursa chiar dă sau ia energie: solar care produce, rețea care importă / exportă, baterie care se încarcă / descarcă
  const ribbonsL = model.left.map((l, i) => (l.dir === 'na' || l.dir === 'idle' ? '' : `<path class="rb" style="fill:url(#fl${i})" d="${g.left[i].d}"/><path class="pulse" data-dir="${l.dir === 'out' ? 'out' : 'in'}" d="${g.left[i].line}"/>`)).join('');
  const ribbonsR = model.right.map((c, i) => (c.w === null ? '' : `<path class="rb" style="fill:url(#fr${i});opacity:${c.dim ? '.25' : '1'}" d="${g.right[i].d}"/><path class="pulse" data-dir="in" d="${g.right[i].line}"/>`)).join('');
  const svg = `<svg class="ccu-flow-svg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W}" height="${g.H}" aria-hidden="true"><defs>${defs}</defs>${ribbonsL}${ribbonsR}<circle class="hub-ring" cx="${g.cx}" cy="${g.cy}" r="${g.r}"/></svg>`;
  const xl = (arr) => (arr || []).map((x) => `<span class="xl" data-id="${idOf(x)}" data-entity="${esc(x.entity)}">${x.arrow ? `<em data-a="${x.arrow}">${x.arrow === 'in' ? '↓' : '↑'}</em>` : ''}${esc(x.text)}${x.name ? `<i>${esc(x.name)}</i>` : ''}</span>`).join('');
  const left = model.left.map((l, i) => `<div class="ccu-fi left" data-id="${idOf(l)}" data-entity="${esc(l.entity)}" data-dir="${l.dir}" style="top:${g.left[i].y}px;width:${g.colL}px"><span class="ccu-ico" style="color:${esc(l.color && /^#/.test(l.color) ? l.color : COLOR[l.kind])}">${iconSvg(l.icon)}</span><span class="tx"><b>${esc(l.name)}</b>${xl(l.aboveX)}<span class="v">${esc(l.text)}${l.suffix ? ` <i>${esc(l.suffix.trim())}</i>` : ''}</span>${xl(l.belowX)}</span></div>`).join('');
  const right = model.right.map((c, i) => `<div class="ccu-fi right${c.dim ? ' dim' : ''}" data-id="${idOf(c)}" data-entity="${esc(c.entity)}" style="top:${g.right[i].y}px;width:${g.colR}px"><span class="tx"><b>${esc(c.name)}</b><span class="v">${esc(c.text)}${c.pct !== null ? ` <i>(${c.pct}%)</i>` : ''}</span></span><span class="ccu-ico">${iconSvg(c.icon)}</span></div>`).join('');
  const hub = `<div class="ccu-hub" data-idle="${model.idle ? 1 : 0}" style="left:${g.cx}px;top:${g.cy}px"><span class="ccu-ico">${iconSvg('home')}</span><small>${t('Total')}</small><b>${esc(model.totalText)}</b></div>`;
  const stats = model.stats.length ? `<div class="ccu-flow-stats" data-n="${model.stats.length}">${model.stats.map((s) => `<div class="st" data-id="${idOf(s)}" data-entity="${esc(s.entity)}"><span class="ccu-ico">${iconSvg(s.icon)}</span><span class="tx"><small>${esc(s.name)}</small><b>${esc(s.text)}</b></span></div>`).join('')}</div>` : '';
  const head = config.title ? `<div class="ccu-flow-head"><span class="t">${esc(config.title)}</span>${model.idle ? '' : `<span class="tt">· ${t('Total')} ${esc(model.totalText)}</span>`}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  const sunRow = model.sun && model.sun.length ? `<div class="ccu-flow-sun">${model.sun.map((s) => `<span class="s" data-id="${idOf(s)}" data-entity="${esc(s.entity)}"><span class="ccu-ico">${iconSvg(s.icon)}</span><b>${esc(s.text)}</b>${s.name ? `<small>${esc(s.name)}</small>` : ''}</span>`).join('')}</div>` : '';
  return `<div class="ccu-card panel ccu-flow">${head}${sunRow}<div class="ccu-flow-body" style="height:${g.H}px">${svg}${left}${right}${hub}</div>${stats}${notes}</div>`;
}

// ================================================================ BATERIE ==
function normalizeBatteryConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [];
  const ent = (k) => { if (src[k] === undefined || src[k] === '') return ''; if (okId(src[k])) return src[k]; warnings.push(t('Baterie: „{k}” nu e un entity_id valid.', { k })); return ''; };
  const num = (k, d, lo, hi) => { const n = Number(src[k]); return Number.isFinite(n) && n >= lo && n <= hi ? n : d; };
  const soc = ent('soc');
  if (!soc) warnings.push(t('Baterie: lipsește „soc” (entitatea cu procentul bateriei).'));
  const cfgOut = {
    soc, capacity_entity: ent('capacity_entity'), power: ent('power'), power_invert: src.power_invert === true, charge_eta: src.charge_eta === 'now' ? 'now' : 'avg', runtime_while_charging: src.runtime_while_charging === true || src.runtime_while_charging === 'true', load: ent('load'), load_entities: (Array.isArray(src.load_entities) ? src.load_entities : src.load_entities ? [src.load_entities] : []).map(String).filter(okId), grid_present: ent('grid_present'),
    capacity_kwh: num('capacity_kwh', 0, 0.1, 1000), reserve_pct: num('reserve_pct', 20, 0, 100), shutdown_pct: num('shutdown_pct', 10, 0, 100),
    title: src.title ? String(src.title) : t('Baterie'), show_title: src.show_title !== false, color: ['yellow', 'green', 'blue', 'orange'].includes(src.color) ? src.color : 'yellow',
  };
  if (cfgOut.shutdown_pct > cfgOut.reserve_pct) warnings.push(t('Baterie: „shutdown_pct” e peste „reserve_pct”; le-am inversat.'));
  if (cfgOut.shutdown_pct > cfgOut.reserve_pct) { const t = cfgOut.shutdown_pct; cfgOut.shutdown_pct = cfgOut.reserve_pct; cfgOut.reserve_pct = t; }
  return { config: cfgOut, warnings };
}

/** Modelul bateriei: SOC, energie, autonomie până la rezervă, stare (ok / low / backup / na). */
function buildBatteryModel(config, hass, extra) {
  const st = (id) => (id && hass && hass.states ? hass.states[id] : null);
  const socS = st(config.soc), p = socS ? Number(socS.state) : NaN;
  const soc = Number.isFinite(p) && socS.state !== '' ? Math.min(100, Math.max(0, p)) : null;
  const capE = toKwh(st(config.capacity_entity));
  const total = capE !== null && capE > 0 ? capE : (config.capacity_kwh || null);
  const now = soc !== null && total ? (soc / 100) * total : null;
  // consumul = `load` + `load_entities` (se adună); dacă una dintre ele nu are valoare, autonomia nu se calculează (altfel ar ieși prea optimistă)
  const loadIds = [config.load].concat(config.load_entities || []).filter(Boolean);
  const loadVals = loadIds.map((id) => toWatts(st(id)));
  const loadW = loadVals.length && loadVals.every((w) => w !== null) ? loadVals.reduce((a, b) => a + b, 0) : null;
  // încărcare: puterea bateriei are convenția fluxului (+ = descărcare, − = încărcare; `power_invert: true` o întoarce)
  let pw = toWatts(st(config.power)); if (pw !== null && config.power_invert) pw = -pw;
  const nowCharge = pw !== null && pw < -THRESH_W ? -pw : null;
  // media puterii pe ultimele minute (din istoric), cu aceeași convenție de semn; „plin în” o folosește implicit, ca cifra să nu sară când trece un nor
  let avg = extra && typeof extra.avgPowerW === 'number' && Number.isFinite(extra.avgPowerW) ? extra.avgPowerW : null;
  if (avg !== null && config.power_invert) avg = -avg;
  const avgCharge = avg !== null && avg < -THRESH_W ? -avg : null;
  const chargeW = nowCharge === null ? null : config.charge_eta === 'now' ? nowCharge : (avgCharge !== null ? avgCharge : nowCharge);
  const gp = st(config.grid_present);
  const backup = !!gp && gp.state === 'off';
  // banda utilizabilă = [prag, 100]%: cu rețea pragul e rezerva (reserve_pct), fără rețea (backup) pragul de oprire (shutdown_pct).
  // Toate valorile se calculează exact din procente și capacitate; se rotunjește doar la afișare.
  const floor = backup ? config.shutdown_pct : config.reserve_pct;
  const bandTotal = total ? ((100 - floor) / 100) * total : null;                       // ex. 37,7 kWh × (100 − 20)% = 30,16 kWh
  const usable = soc !== null && total ? (Math.max(0, soc - floor) / 100) * total : null; // ex. 37,7 kWh × (53 − 20)% = 12,441 kWh
  let autonomyH = null;
  if (usable !== null && loadW !== null && loadW >= THRESH_W) autonomyH = (usable * 1000) / loadW;
  const state = soc === null ? 'na' : backup ? 'backup' : soc <= config.reserve_pct ? 'low' : 'ok';
  const charging = chargeW !== null && soc !== null && soc < 99;   // peste 99% nu mai arătăm „plin în”: bateria oscilează cu câțiva W și cifrele ar sări
  const fullH = charging && total ? (((100 - soc) / 100) * total * 1000) / chargeW : null;   // timp până la 100% la puterea de încărcare de acum
  const hh = (h) => (h === null ? '—' : h >= 100 ? '>99 h' : `~${formatNumber(Math.round(h * 10) / 10)} h`);
  return { soc, total, now, autonomyH, usable, bandTotal, floor, state, backup, charging, chargeW, fullH, fullText: hh(fullH), loadW, socText: soc === null ? '—' : `${Math.round(soc)}%`,
    energyText: usable !== null && bandTotal !== null ? t('{a} kWh din {b} kWh', { a: formatNumber(Math.round(usable * 10) / 10), b: formatNumber(Math.round(bandTotal * 10) / 10) }) : (bandTotal !== null ? t('— din {b} kWh', { b: formatNumber(Math.round(bandTotal * 10) / 10) }) : ''),
    autonomyText: hh(autonomyH) };
}

const BAT_FILL = { yellow: ['#f6c343', '#c98f1a'], green: ['#34d399', '#15803d'], blue: ['#60a5fa', '#2563eb'], orange: ['#fbbf24', '#d97706'] };

/** Cardul bateriei (șir HTML). */
function renderBattery(config, m, opts = {}) {
  const [c0, c1] = m.state === 'backup' ? ['#f4694b', '#a32a1f'] : m.state === 'low' ? ['#fbbf24', '#d97706'] : BAT_FILL[config.color];
  const pct = m.soc === null ? 0 : m.soc;
  // prima etichetă (oprire) se trage spre stânga, a doua (rezervă) spre dreapta: nu se mai suprapun nici pe telefon
  // pragul de oprire (10%) contează doar când rețeaua e căzută (backup): altfel se vede doar rezerva (20%)
  const marks = m.backup
    ? [{ p: config.shutdown_pct, label: t('oprire invertor'), c: 'var(--ccu-c-red)', sh: '-48%' }, { p: config.reserve_pct, label: t('rezervă'), c: 'var(--ccu-c-yellow)', sh: '34%' }]
    : [{ p: config.reserve_pct, label: t('rezervă'), c: 'var(--ccu-c-yellow)', sh: '0%' }];
  const mk = marks.map((k) => `<span class="mk" style="left:${k.p}%"><i style="background:${k.c}"></i><span class="lb" style="--sh:${k.sh}"><b>${Math.round(k.p)}%</b><small>(${esc(k.label)})</small></span></span>`).join('');
  const head = m.state === 'backup'
    ? `<div class="ccu-bat-head backup"><span class="ccu-ico">${iconSvg('bolt')}</span><span>${t('Backup activ · Rețeaua este oprită')}</span></div>`
    : (config.show_title === false ? '' : `<div class="ccu-bat-head"><span class="ccu-ico">${iconSvg('battery')}</span><span>${esc(config.title)}</span></div>`);   // show_title: false = fără titlu „Baterie” + iconiță
  const body = `<div class="ccu-bat-body"><div class="ccu-bat-shell" data-state="${m.state}"><div class="fill" style="width:${pct}%;background:linear-gradient(180deg,${c0},${c1})"></div><span class="pct">${esc(m.socText)}</span></div>`
    + `<div class="ccu-bat-info"><span class="e">${esc(m.energyText)}</span>${m.charging ? `<span class="a ch"><i>${t('Plin în')}</i><b>${esc(m.fullText)}</b></span>` : ''}${!m.charging || config.runtime_while_charging ? `<span class="a"><i>${m.charging ? t('Autonomie la consum') : t('Autonomie')}</i><b>${esc(m.autonomyText)}</b></span>` : ''}</div></div>`;
  const slider = `<div class="ccu-bat-slider"><div class="tr"><div class="fl" style="width:${pct}%"></div></div>${mk}</div>`;
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-bat" data-state="${m.state}"${m.charging ? ' data-charging="1"' : ''} data-id="0" data-entity="${esc(config.soc)}">${head}${body}${slider}${notes}</div>`;
}


/**
 * Textul mic de sub o valoare din antet, pentru valorile cu autonomie (`runtime_*`): autonomia la consumul curent,
 * sau „plin în …” cât timp bateria se încarcă (când e dat și `runtime_power`). Gol când nu se poate calcula.
 */
function headerRuntimeTexts(header, hass, avgMap) {
  return ((header && header.values) || []).map((v) => {
    if (!v || !v.runtimeCfg) return '';
    const rc = v.runtimeCfg;
    const bc = normalizeBatteryConfig({ ...rc, runtime_while_charging: rc.while_charging, soc: v.entity }).config;
    const m = buildBatteryModel(bc, hass, { avgPowerW: avgMap && rc.power ? avgMap[rc.power] : null });
    if (m.charging && m.fullH !== null) {   // în încărcare: „plin în …”; autonomia doar dacă utilizatorul o cere (pe a doua linie)
      const lines = [t('plin în {x}', { x: m.fullText })];
      if (bc.runtime_while_charging && m.autonomyH !== null) lines.push(t('autonomie {x}', { x: m.autonomyText }));
      return lines.length > 1 ? lines : lines[0];
    }
    return m.autonomyH !== null ? m.autonomyText : '';
  });
}

/** Media în timp a puterii dintr-o serie de puncte [{ t (ms), v }] pe intervalul [start, end]; valorile lipsă nu contează. null dacă nu e nimic de mediat. */
function weightedAveragePower(points, start, end) {
  const pts = (points || []).map((p) => ({ t: Math.max(start, Number(p.t) || start), v: Number.isFinite(p.v) ? p.v : null })).sort((a, b) => a.t - b.t);
  let sum = 0, w = 0;
  for (let i = 0; i < pts.length; i++) {
    const t1 = i + 1 < pts.length ? pts[i + 1].t : end, d = Math.max(0, t1 - pts[i].t);
    if (pts[i].v !== null && d > 0) { sum += pts[i].v * d; w += d; }
  }
  return w > 0 ? sum / w : null;
}

/** Puterea medie (W) a unei entități pe ultimele `minutes` minute, din istoricul HA (aceeași metodă ca graficul). null dacă nu se poate citi. */
async function fetchAveragePower(hass, entityId, minutes = 10) {
  if (!hass || !hass.callWS || !entityId) return null;
  const end = Date.now(), start = end - minutes * 60000;
  const res = await hass.callWS({ type: 'history/history_during_period', start_time: new Date(start).toISOString(), end_time: new Date(end).toISOString(), entity_ids: [entityId], minimal_response: true, no_attributes: true, significant_changes_only: false });
  const rows = (res && res[entityId]) || [];
  const cur = hass.states && hass.states[entityId], unit = cur && cur.attributes && cur.attributes.unit_of_measurement;
  const k = unit === 'kW' ? 1000 : unit === 'MW' ? 1e6 : 1;
  return weightedAveragePower(rows.map((p) => ({ t: (p.lu !== undefined ? p.lu : p.lc) * 1000, v: p.s === '' ? NaN : Number(p.s) * k })), start, end);
}

// ============================================================ BATERII: DESCOPERIRE AUTOMATĂ ==
const MOBILE_PLATFORMS = ['mobile_app', 'fully_kiosk', 'browser_mod'];
const MOBILE_MODEL = /iphone|ipad|ipod|tablet|\btab\b|pixel|galaxy|sm-[a-z]\d/i;
const strList = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(String).map((x) => x.trim()).filter(Boolean);

/**
 * `auto` (carduri baterii / chips): true sau { exclude, include, threshold, unavailable, mobile }.
 *  - exclude: cuvinte căutate în entity_id și în nume (ex. „deye”, „audi”); include: entity_id forțate;
 *  - threshold: „slabă” = până la acest procent (implicit 20); unavailable: true = păstrează și dispozitivele indisponibile;
 *  - mobile (implicit true): lasă deoparte telefoanele, tabletele și browserele (aplicația HA, Fully Kiosk, Browser Mod).
 */
function normalizeAutoBatteries(v) {
  if (!v) return null;
  const o = v === true ? {} : typeof v === 'object' ? v : null;
  if (!o) return null;
  const th = Number(o.threshold);
  const names = o.names && typeof o.names === 'object' && !Array.isArray(o.names) ? Object.fromEntries(Object.entries(o.names).filter(([k, v]) => okId(k) && v).map(([k, v]) => [k, String(v)])) : {};
  return { exclude: strList(o.exclude), include: strList(o.include).filter(okId), threshold: Number.isFinite(th) && th >= 0 && th <= 100 ? th : 20, unavailable: o.unavailable === true, mobile: o.mobile !== false, names };
}

/** Bateriile găsite în HA (senzori cu device_class „battery”; binary_sensor „on” = slabă), crescător după nivel. */
function discoverBatteries(hass, auto) {
  const a = normalizeAutoBatteries(auto);
  const S = (hass && hass.states) || {};
  if (!a) return [];
  const ex = a.exclude.map((x) => x.toLowerCase());
  const out = [];
  for (const [id, s] of Object.entries(S)) {
    if (!/^(sensor|binary_sensor)\./.test(id) || !s) continue;
    const at = s.attributes || {}, forced = a.include.includes(id);
    // senzori cu device_class „battery” sau, dacă producătorul nu l-a pus, senzori în % al căror id se termină în „battery” / „battery_level” (ex. un senzor Tuya de temperatură / umiditate; nu „…_soh” sau „…_battery_health”)
    const looksBattery = at.device_class === 'battery' || (!at.device_class && at.unit_of_measurement === '%' && id.startsWith('sensor.') && /(^|_)batt(ery)?(_level)?$/i.test(id));
    if (!looksBattery && !forced) continue;
    const friendly = String(at.friendly_name || '');
    if (!forced && ex.some((x) => id.toLowerCase().includes(x) || friendly.toLowerCase().includes(x))) continue;
    if (a.mobile && !forced) {
      const ent = hass.entities && hass.entities[id], dev = ent && ent.device_id && hass.devices && hass.devices[ent.device_id];
      if ((ent && MOBILE_PLATFORMS.includes(ent.platform)) || (dev && MOBILE_MODEL.test(String(dev.model || ''))) || /browser_mod/.test(id)) continue;
    }
    const gone = s.state === 'unavailable' || s.state === 'unknown' || s.state === '';
    if (gone && !a.unavailable) continue;
    const name = a.names[id] || friendly.replace(/\s*battery(\s*level)?\s*$/i, '').trim() || friendly || id.split('.')[1].replace(/_/g, ' ');
    if (id.startsWith('binary_sensor.')) { out.push({ entity: id, name, pct: null, low: s.state === 'on', binary: true }); continue; }
    if (at.unit_of_measurement && at.unit_of_measurement !== '%') continue;
    const n = Number(s.state);
    const pct = !gone && Number.isFinite(n) ? Math.min(100, Math.max(0, n)) : null;
    if (pct === null && !gone) continue;
    out.push({ entity: id, name, pct, low: pct !== null && pct <= a.threshold, binary: false });
  }
  const key = (r) => (r.binary ? (r.low ? -1 : 101) : r.pct === null ? 102 : r.pct);
  return out.sort((x, y) => key(x) - key(y) || x.name.localeCompare(y.name));
}

/** Chip-ul „baterii slabe”: true sau { …auto, label, tap_action }. */
function normalizeLowBatteries(v) {
  if (!v) return null;
  const auto = normalizeAutoBatteries(v);
  if (!auto) return null;
  const o = v === true ? {} : v;
  return { ...auto, label: o.label ? String(o.label) : '', tap_action: o.tap_action, hold_action: o.hold_action };
}

/** Modelul chip-ului: câte baterii sunt slabe și care (cea mai slabă prima). */
function lowBatteryModel(config, hass) {
  if (!config) return null;
  const rows = discoverBatteries(hass, config);
  const low = rows.filter((r) => r.low);
  return { rows, low, count: low.length };
}

// ============================================================ BATERII DISPOZITIVE ==
/** Lista nivelurilor de baterie ale dispozitivelor (telefoane, tablete, mașină…), sortată crescător. */
function normalizeBatteriesConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], items = [];
  (Array.isArray(src.entities) ? src.entities : []).forEach((c, i) => {
    const o = typeof c === 'string' ? { entity: c } : c && typeof c === 'object' ? { ...c } : null;
    if (!o || !okId(o.entity)) { warnings.push(t('Baterii: elementul #{n} are entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    items.push({ kind: 'battery', entity: o.entity, name: o.name ? String(o.name) : '' });
  });
  if (items.length > 12) { items.length = 12; warnings.push(t('Baterii: maximum 12; restul sunt ignorate.')); }
  const n = (k, d) => (Number.isFinite(Number(src[k])) && src[k] >= 0 && src[k] <= 100 ? Number(src[k]) : d);
  return { items, title: src.title ? String(src.title) : 'Baterii dispozitive', warn_pct: n('warn_pct', 20), low_pct: n('low_pct', 10), sort: src.sort === 'none' ? 'none' : 'asc', auto: normalizeAutoBatteries(src.auto), only_low: src.only_low === true, warnings };
}

function buildBatteriesModel(config, hass) {
  const rows = config.entities.map((e, i) => {
    const s = hass && hass.states ? hass.states[e.entity] : null;
    const p = s && s.state !== '' ? Number(s.state) : NaN;
    const pct = Number.isFinite(p) ? Math.min(100, Math.max(0, p)) : null;
    const friendly = (s && s.attributes && s.attributes.friendly_name) || e.entity.split('.')[1].replace(/_/g, ' ');
    const name = e.name || String(friendly).replace(/\s*battery(\s*level)?\s*$/i, '').trim() || friendly;
    const lvl = pct === null ? 'na' : pct < config.low_pct ? 'low' : pct < config.warn_pct ? 'warn' : 'ok';
    return { idx: i, entity: e.entity, name, pct, text: pct === null ? '—' : `${Math.round(pct)}%`, lvl };
  });
  // `auto`: bateriile găsite singure în HA, fără cele deja listate
  if (config.auto) {
    const have = new Set(rows.map((r) => r.entity));
    discoverBatteries(hass, config.auto).filter((d) => !have.has(d.entity)).forEach((d) => {
      let lvl = d.binary ? (d.low ? 'low' : 'ok') : d.pct === null ? 'na' : d.pct < config.low_pct ? 'low' : d.pct < config.warn_pct ? 'warn' : 'ok';
      if (d.low && lvl === 'ok') lvl = 'warn';   // ce numără chip-ul ca „slabă” (≤ prag) nu apare niciodată ca „în regulă” în listă
      rows.push({ idx: rows.length, entity: d.entity, name: d.name, pct: d.binary ? (d.low ? 0 : 100) : d.pct, text: d.binary ? (d.low ? t('slabă') : 'OK') : d.pct === null ? '—' : `${Math.round(d.pct)}%`, lvl });
    });
  }
  let out = rows;
  if (config.only_low) out = rows.filter((r) => r.lvl === 'low' || r.lvl === 'warn');   // doar bateriile slabe (sub pragul de avertisment)
  if (config.sort !== 'none') out.sort((a, b) => (a.pct === null ? 101 : a.pct) - (b.pct === null ? 101 : b.pct));
  return out;
}

function renderBatteries(config, rows, opts = {}) {
  const body = rows.map((r) => `<div class="br" data-id="${r.idx}" data-entity="${esc(r.entity)}" data-lvl="${r.lvl}"><span class="ccu-ico">${iconSvg('battery')}</span><span class="nm">${esc(r.name)}</span><span class="bar"><i style="width:${r.pct === null ? 0 : r.pct}%"></i></span><b>${esc(r.text)}</b></div>`).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-batts">${title}<div class="rows">${body}</div>${notes}</div>`;
}

return { toWatts, toKwh, fmtPower, normalizeFlowConfig, buildFlowModel, layoutFlow, renderFlow, normalizeBatteryConfig, buildBatteryModel, renderBattery, headerRuntimeTexts, weightedAveragePower, fetchAveragePower, normalizeAutoBatteries, discoverBatteries, normalizeLowBatteries, lowBatteryModel, normalizeBatteriesConfig, buildBatteriesModel, renderBatteries };
})();

__m["weather"] = (() => {
// src/weather.mjs — cardul de vreme. Valorile curente vin din senzorii stației (ex. Ecowitt), NU din prognoză;
// prognoza pe zile vine din entitatea weather.*. Funcții PURE (model + șabloane); animațiile sunt în theme.js (CSS), doar prin atribute data-*.
const { t, weekdayShort, decSep } = __m["i18n"];
const { esc } = __m["render"];
const { iconSvg } = __m["icons"];
const ENTITY = /^[a-z_]+\.[a-z0-9_]+$/;
const okId = (e) => typeof e === 'string' && ENTITY.test(e);
const DAYS = ['Du', 'Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sâ'];
const DIRS = ['N', 'NE', 'E', 'SE', 'S', 'SV', 'V', 'NV'];

// ---------------------------------------------------------------- conversii
const num = (s) => { if (!s || s.state === '' || s.state === null || s.state === undefined) return null; const n = Number(s.state); return Number.isFinite(n) ? n : null; };
const unitOf = (s) => String((s && s.attributes && s.attributes.unit_of_measurement) || '').trim();
function toC(v, unit) { if (v === null) return null; const u = String(unit || '').toLowerCase(); return u.includes('f') ? (v - 32) / 1.8 : u === 'k' ? v - 273.15 : v; }
function toKmh(v, unit) { if (v === null) return null; const u = String(unit || '').toLowerCase().replace(/\s/g, ''); return u === 'm/s' ? v * 3.6 : u === 'mph' ? v * 1.609344 : u === 'kn' || u === 'kt' ? v * 1.852 : u === 'ft/s' ? v * 1.09728 : v; }
function toMmh(v, unit) { if (v === null) return null; const u = String(unit || '').toLowerCase().replace(/\s/g, ''); return /^in\/h/.test(u) ? v * 25.4 : v; }
function toMm(v, unit) { if (v === null) return null; return String(unit || '').toLowerCase() === 'in' ? v * 25.4 : v; }
const f1 = (n) => (Math.round(n * 10) / 10).toFixed(1).replace('.', decSep());
const f0 = (n) => String(Math.round(n));
function dirText(deg) { return Number.isFinite(deg) ? t(DIRS[Math.round((((deg % 360) + 360) % 360) / 45) % 8]) : ''; }

// ---------------------------------------------------------------- config
const TILE_DEFS = {
  humidity: { icon: 'drop', label: 'Umiditate' }, wind: { icon: 'w-wind', label: 'Vânt' }, rain: { icon: 'w-rain', label: 'Ploaie' }, pressure: { icon: 'gauge', label: 'Presiune' },
  uv: { icon: 'sun', label: 'Indice UV' }, radiation: { icon: 'sun', label: 'Radiație' }, lux: { icon: 'bulb', label: 'Luminozitate' }, dew_point: { icon: 'drop', label: 'Punct de rouă' },
  feels_like: { icon: 'thermo', label: 'Se simte ca' }, gust: { icon: 'w-wind', label: 'Rafale' },
};
const SENSOR_KEYS = ['temperature', 'feels_like', 'humidity', 'wind_speed', 'wind_gust', 'wind_direction', 'rain_rate', 'rain_today', 'rain_state', 'pressure', 'uv', 'radiation', 'lux', 'dew_point'];
const DEFAULT_TILES = ['humidity', 'wind', 'rain', 'pressure', 'uv', 'radiation'];
// ce senzor(i) cere fiecare tile
const NEEDS = { humidity: ['humidity'], wind: ['wind_speed'], rain: ['rain_today', 'rain_rate'], pressure: ['pressure'], uv: ['uv'], radiation: ['radiation'], lux: ['lux'], dew_point: ['dew_point'], feels_like: ['feels_like'], gust: ['wind_gust'] };

/** Normalizează config-ul. items (listă plată) = entitățile tile-urilor + entitatea weather (pentru more-info la atingere). */
function normalizeWeatherConfig(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], sensors = {};
  const raw = src.sensors && typeof src.sensors === 'object' ? src.sensors : {};
  for (const k of SENSOR_KEYS) {
    if (raw[k] === undefined || raw[k] === '') continue;
    if (okId(raw[k])) sensors[k] = raw[k]; else warnings.push(t('Vreme: „{k}” nu e un entity_id valid.', { k }));
  }
  for (const k of Object.keys(raw)) if (!SENSOR_KEYS.includes(k)) warnings.push(t('Vreme: senzor necunoscut „{k}” ignorat.', { k }));
  let weather = '';
  if (src.weather !== undefined && src.weather !== '') { if (okId(src.weather) && src.weather.startsWith('weather.')) weather = src.weather; else warnings.push(t('Vreme: „weather” trebuie să fie o entitate weather.*.')); }
  const tiles = (Array.isArray(src.tiles) ? src.tiles : DEFAULT_TILES).filter((tk) => {
    if (!TILE_DEFS[tk]) { warnings.push(t('Vreme: tile necunoscut „{k}”.', { k: tk })); return false; }
    return NEEDS[tk].some((k) => sensors[k]); // fără senzor configurat, tile-ul nu apare
  }).slice(0, 8);
  const d = Number(src.days);
  const days = Number.isInteger(d) && d >= 1 && d <= 7 ? d : 5;
  if (!Object.keys(sensors).length && !weather) warnings.push(t('Vreme: nu e configurat niciun senzor și nicio entitate weather.'));
  const items = [];
  const seen = new Set();
  for (const t of tiles) for (const k of NEEDS[t]) if (sensors[k] && !seen.has(sensors[k])) { seen.add(sensors[k]); items.push({ kind: 'sensor', key: k, entity: sensors[k] }); }
  for (const k of ['temperature']) if (sensors[k] && !seen.has(sensors[k])) { seen.add(sensors[k]); items.push({ kind: 'sensor', key: k, entity: sensors[k] }); }
  if (weather) { const w = { kind: 'weather', key: 'weather', entity: weather }; if (src.tap_action !== undefined) w.tap_action = src.tap_action; if (src.hold_action !== undefined) w.hold_action = src.hold_action; items.push(w); } // tap/hold pe scenă și pe zile
  return { config: { sensors, weather, tiles, days, title: src.title ? String(src.title) : '', scene_fallback: src.scene_fallback !== false, fallback_to_forecast: src.fallback_to_forecast === true, sun: okId(src.sun) ? src.sun : 'sun.sun', items }, warnings };
}

// ---------------------------------------------------------------- clasificarea scenei
const COND_RO = { sunny: 'Senin', 'clear-night': 'Senin', partlycloudy: 'Parțial noros', cloudy: 'Noros', fog: 'Ceață', rainy: 'Ploaie', pouring: 'Ploaie torențială', snowy: 'Ninsoare', 'snowy-rainy': 'Lapoviță',
  lightning: 'Furtună', 'lightning-rainy': 'Furtună cu ploaie', hail: 'Grindină', windy: 'Vânt', 'windy-variant': 'Vânt și nori', exceptional: 'Fenomen deosebit' };
const COND_ICON = { sunny: 'w-sun', 'clear-night': 'w-moon', partlycloudy: 'w-partly', cloudy: 'w-cloud', fog: 'w-fog', rainy: 'w-rain', pouring: 'w-pour', snowy: 'w-snow', 'snowy-rainy': 'w-sleet',
  lightning: 'w-storm', 'lightning-rainy': 'w-storm', hail: 'w-hail', windy: 'w-wind', 'windy-variant': 'w-wind', exceptional: 'w-cloud' };
const condLabel = (c) => (COND_RO[c] ? t(COND_RO[c]) : '—');
const condIcon = (c, night = false) => (c === 'sunny' && night ? 'w-moon' : COND_ICON[c] || 'w-cloud');

const WORD = { rain: ['Ploaie ușoară', 'Ploaie', 'Ploaie torențială'], snow: ['Ninsoare ușoară', 'Ninsoare', 'Ninsoare abundentă'], sleet: ['Lapoviță slabă', 'Lapoviță', 'Lapoviță abundentă'] };
const skyOf = (c) => (c === 'sunny' || c === 'clear-night' ? 'clear' : c === 'partlycloudy' || c === 'windy' || c === 'windy-variant' ? 'partly' : c === 'fog' ? 'fog' : c ? 'cloudy' : 'clear');

/**
 * Ce se desenează în scenă. Intrări în unități fixe: tempC (°C), rainMmh (mm/h), windKmh (km/h); null = necunoscut.
 * Precipitațiile: ploaie > 2,5 °C, lapoviță 0,5–2,5 °C, ninsoare ≤ 0,5 °C. Intensitatea 1–3 după debit. Vântul 0–3 după km/h.
 * Cu `fallback`, ce lipsește din senzori se completează din starea entității weather (și se marchează `fromForecast`).
 */
function classifyScene({ tempC = null, rainMmh = null, rainOn = null, windKmh = null, cond = '', windFallbackKmh = null, night = false, fallback = true } = {}) {
  let precip = 'none', intensity = 0, fromForecast = false, bolt = /lightning/.test(cond);
  const haveRain = rainMmh !== null || rainOn !== null;
  if (haveRain) {
    const rate = rainMmh !== null ? rainMmh : (rainOn ? 1 : 0);
    if (rate >= 0.05 || (rainOn === true && rainMmh === null)) {
      const t = tempC;
      precip = t === null ? 'rain' : t <= 0.5 ? 'snow' : t <= 2.5 ? 'sleet' : 'rain';
      intensity = precip === 'rain' ? (rate < 0.5 ? 1 : rate < 4 ? 2 : 3) : (rate < 0.3 ? 1 : rate < 2 ? 2 : 3);
    }
  } else if (fallback) {
    if (cond === 'rainy' || cond === 'lightning-rainy') { precip = 'rain'; intensity = 2; }
    else if (cond === 'pouring' || cond === 'hail') { precip = 'rain'; intensity = 3; }
    else if (cond === 'snowy') { precip = 'snow'; intensity = 2; }
    else if (cond === 'snowy-rainy') { precip = 'sleet'; intensity = 2; }
    fromForecast = precip !== 'none';
  }
  let w = windKmh;
  if (w === null && fallback && windFallbackKmh !== null) { w = windFallbackKmh; fromForecast = fromForecast || w >= 12; }
  if (w === null && fallback && (cond === 'windy' || cond === 'windy-variant')) { w = 30; fromForecast = true; }
  const wind = w === null || w < 12 ? 0 : w < 25 ? 1 : w < 40 ? 2 : 3;
  const sky = precip !== 'none' || bolt ? 'cloudy' : skyOf(cond);
  let label;
  if (bolt) label = precip !== 'none' ? t('Furtună cu ploaie') : t('Furtună');
  else if (precip !== 'none') label = t(WORD[precip][intensity - 1]);
  else if (cond === 'hail') label = t('Grindină');
  else if (sky === 'clear' && night) label = t('Cer senin');
  else label = cond ? t(COND_RO[cond] || 'Noros') : '—';
  if (wind >= 2 && precip === 'none' && !bolt && sky !== 'fog') label = wind === 3 ? t('Vânt puternic') : (cond ? label + t(' · vânt') : t('Vânt'));
  else if (wind >= 2 && precip !== 'none') label += wind === 3 ? t(' · vânt puternic') : t(' · vânt');
  return { precip, intensity, wind, sky, night: !!night, bolt, label, fromForecast };
}

// ---------------------------------------------------------------- prognoza
/** Normalizează lista de zile din weather.get_forecasts (sau din atributul forecast). Fără excepții pentru intrări ciudate. */
function parseForecast(raw, tempUnit = '°C', windUnit = 'km/h', now = new Date()) {
  const arr = Array.isArray(raw) ? raw : [];
  const todayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
  const out = [];
  for (const d of arr) {
    if (!d || typeof d !== 'object') continue;
    const dt = new Date(d.datetime);
    if (Number.isNaN(dt.getTime())) continue;
    const key = `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
    const hi = Number.isFinite(Number(d.temperature)) && d.temperature !== null ? toC(Number(d.temperature), tempUnit) : null;
    const lo = Number.isFinite(Number(d.templow)) && d.templow !== null ? toC(Number(d.templow), tempUnit) : null;
    const ws = Number.isFinite(Number(d.wind_speed)) && d.wind_speed !== null ? toKmh(Number(d.wind_speed), windUnit) : null;
    const pp = Number.isFinite(Number(d.precipitation_probability)) && d.precipitation_probability !== null ? Math.round(Number(d.precipitation_probability)) : null;
    const pr = Number.isFinite(Number(d.precipitation)) && d.precipitation !== null ? Number(d.precipitation) : null;
    const wb = Number.isFinite(Number(d.wind_bearing)) && d.wind_bearing !== null ? Number(d.wind_bearing) : null;
    out.push({ t: dt.getTime(), today: key === todayKey, name: key === todayKey ? t('Azi') : weekdayShort(dt), cond: String(d.condition || ''), hi, lo, wind: ws, bearing: wb, pop: pp, mm: pr });
  }
  return out.filter((d) => d.today || d.t > now.getTime() - 864e5).sort((a, b) => a.t - b.t);
}

// ---------------------------------------------------------------- model
function buildWeatherModel(config, hass, forecastRaw, now = new Date()) {
  const st = (k) => (config.sensors[k] && hass && hass.states ? hass.states[config.sensors[k]] : null);
  const ws = config.weather && hass && hass.states ? hass.states[config.weather] : null;
  const wa = (ws && ws.attributes) || {};
  const sunS = hass && hass.states ? hass.states[config.sun] : null;
  const night = !!sunS && sunS.state === 'below_horizon';
  const tempC = toC(num(st('temperature')), unitOf(st('temperature')) || '°C');
  const rainRate = toMmh(num(st('rain_rate')), unitOf(st('rain_rate')) || 'mm/h');
  const rs = st('rain_state'); const rainOn = rs && (rs.state === 'on' || rs.state === 'off') ? rs.state === 'on' : null;
  const windKmh = toKmh(num(st('wind_speed')), unitOf(st('wind_speed')) || 'km/h');
  const gustKmh = toKmh(num(st('wind_gust')), unitOf(st('wind_gust')) || 'km/h');
  const dirDeg = num(st('wind_direction'));
  const cond = ws && ws.state && ws.state !== 'unavailable' && ws.state !== 'unknown' ? ws.state : '';
  const wFb = ws && Number.isFinite(Number(wa.wind_speed)) ? toKmh(Number(wa.wind_speed), wa.wind_speed_unit || 'km/h') : null;
  const scene = classifyScene({ tempC, rainMmh: rainRate, rainOn, windKmh, cond, windFallbackKmh: wFb, night, fallback: config.scene_fallback });

  const showTemp = tempC !== null ? tempC : (config.fallback_to_forecast && Number.isFinite(Number(wa.temperature)) ? toC(Number(wa.temperature), wa.temperature_unit || '°C') : null);
  const feels = toC(num(st('feels_like')), unitOf(st('feels_like')) || '°C');
  const tileOf = (key) => {
    const d = TILE_DEFS[key]; let value = '—', sub = '', lvl = '', rawEntity = '';
    if (key === 'humidity') { const v = num(st('humidity')); value = v === null ? '—' : `${f0(v)}%`; rawEntity = config.sensors.humidity; }
    else if (key === 'wind') {
      rawEntity = config.sensors.wind_speed; value = windKmh === null ? '—' : `${f0(windKmh)} km/h`;
      const parts = []; if (gustKmh !== null) parts.push(`rafale ${f0(gustKmh)}`); if (dirDeg !== null) parts.push(dirText(dirDeg)); sub = parts.join(' · ');
      if (windKmh !== null && windKmh >= 50) lvl = 'warn';
    } else if (key === 'gust') { rawEntity = config.sensors.wind_gust; value = gustKmh === null ? '—' : `${f0(gustKmh)} km/h`; if (gustKmh !== null && gustKmh >= 70) lvl = 'warn'; }
    else if (key === 'rain') {
      rawEntity = config.sensors.rain_today || config.sensors.rain_rate;
      const day = toMm(num(st('rain_today')), unitOf(st('rain_today')) || 'mm');
      value = day === null ? (rainRate === null ? '—' : `${f1(rainRate)} mm/h`) : `${f1(day)} mm`;
      if (rainRate !== null && rainRate >= 0.05) { sub = `acum ${f1(rainRate)} mm/h`; lvl = 'active'; }
    } else if (key === 'pressure') { const v = num(st('pressure')); value = v === null ? '—' : `${f1(v)} hPa`; rawEntity = config.sensors.pressure; }
    else if (key === 'uv') { const v = num(st('uv')); value = v === null ? '—' : f1(v); rawEntity = config.sensors.uv; if (v !== null && v >= 6) lvl = 'warn'; if (v !== null) sub = t(v < 3 ? 'redus' : v < 6 ? 'moderat' : v < 8 ? 'ridicat' : v < 11 ? 'foarte ridicat' : 'extrem'); }
    else if (key === 'radiation') { const v = num(st('radiation')); value = v === null ? '—' : `${f0(v)} W/m²`; rawEntity = config.sensors.radiation; }
    else if (key === 'lux') { const v = num(st('lux')); value = v === null ? '—' : `${f0(v)} lx`; rawEntity = config.sensors.lux; }
    else if (key === 'dew_point') { const v = toC(num(st('dew_point')), unitOf(st('dew_point')) || '°C'); value = v === null ? '—' : `${f1(v)} °C`; rawEntity = config.sensors.dew_point; }
    else if (key === 'feels_like') { value = feels === null ? '—' : `${f1(feels)} °C`; rawEntity = config.sensors.feels_like; }
    return { key, icon: d.icon, label: t(d.label), value, sub, lvl, entity: rawEntity, na: value === '—' };
  };
  const tiles = config.tiles.map(tileOf);
  const days = parseForecast(forecastRaw, wa.temperature_unit || '°C', wa.wind_speed_unit || 'km/h', now).slice(0, config.days);
  const tempText = showTemp === null ? '—' : f1(showTemp);
  return { scene, tempText, tempFromForecast: tempC === null && showTemp !== null, feelsText: feels === null ? '' : t('Se simte ca {x}°', { x: f1(feels) }), windDeg: dirDeg, tiles, days, hasWeather: !!ws, cond, night };
}

// ---------------------------------------------------------------- șabloane
const PARTICLES = (n, f) => Array.from({ length: n }, (_, i) => `<i style="${f(i)}"></i>`).join('');
const frac = (i, m, k) => ((i * m + k) % 100) / 100;
const RAIN = PARTICLES(40, (i) => `--x:${Math.round(frac(i, 37, 11) * 104 - 2)}%;--dl:${(-frac(i, 53, 7) * 1.6).toFixed(2)}s;--s:${frac(i, 29, 3).toFixed(2)}`);
const SNOW = PARTICLES(30, (i) => `--x:${Math.round(frac(i, 41, 5) * 100)}%;--dl:${(-frac(i, 47, 13) * 8).toFixed(2)}s;--s:${frac(i, 31, 17).toFixed(2)};--sw:${Math.round((frac(i, 19, 2) - 0.5) * 36)}px`);
const WINDS = PARTICLES(9, (i) => `--y:${Math.round(frac(i, 43, 9) * 86 + 6)}%;--dl:${(-frac(i, 59, 1) * 2.4).toFixed(2)}s;--s:${frac(i, 23, 4).toFixed(2)}`);
const CLOUDS = PARTICLES(4, (i) => `--y:${[6, 22, 12, 30][i]}%;--w:${[46, 62, 38, 54][i]}%;--t:${[46, 62, 38, 70][i]}s;--dl:${[-8, -30, -20, -42][i]}s;--o:${[0.9, 0.7, 0.8, 0.6][i]}`);
const STARS = PARTICLES(14, (i) => `--x:${Math.round(frac(i, 37, 5) * 96 + 2)}%;--y:${Math.round(frac(i, 53, 9) * 60 + 4)}%;--dl:${(-frac(i, 29, 7) * 4).toFixed(2)}s;--s:${frac(i, 17, 3).toFixed(2)}`);

/** Scena animată: structură CONSTANTĂ (mereu aceleași elemente); ce se vede decide CSS după data-*. */
function renderScene(model, wi = -1, entity = '', chips = '') {
  const s = model.scene;
  const lean = (s.wind * -7), drift = (s.wind * 16);
  const act = wi >= 0 ? ` data-id="${wi}" data-entity="${esc(entity)}"` : '';
  return `<div class="ccu-scene"${act} data-sky="${s.sky}" data-precip="${s.precip}" data-int="${s.intensity}" data-wind="${s.wind}" data-night="${s.night ? 1 : 0}" data-bolt="${s.bolt ? 1 : 0}" style="--lean:${lean}deg;--drift:${drift}px">`
    + `<div class="sun"><i></i></div><div class="moon"></div><div class="stars">${STARS}</div><div class="clouds">${CLOUDS}</div><div class="fog"><i></i><i></i><i></i></div>`
    + `<div class="rain">${RAIN}</div><div class="snow">${SNOW}</div><div class="windl">${WINDS}</div><div class="flash"></div>`
    + `<div class="base"><div class="info"><div class="t${model.tempText === '—' ? ' na' : ''}">${model.tempText === '—' ? '— —' : `${esc(model.tempText)}<sup>°C</sup>`}</div><div class="c">${esc(model.scene.label)}</div>`
    + `<div class="f">${esc(model.feelsText)}${model.scene.fromForecast ? `${model.feelsText ? ' · ' : ''}${t('după prognoză')}` : ''}</div></div>`
    + (chips ? `<div class="wx-chips">${chips}</div>` : '') + `</div></div>`;
}

/** Cardul complet (șir). config.items = lista plată (pentru data-id → more-info). */
function renderWeather(config, model, opts = {}) {
  const idxOf = (entity) => config.items.findIndex((x) => x.entity === entity);
  const tiles = model.tiles.map((t) => `<div class="wt" data-id="${idxOf(t.entity)}" data-entity="${esc(t.entity)}" data-na="${t.na ? 1 : 0}" data-lvl="${esc(t.lvl)}" title="${esc(t.label)}">`
    + `<span class="ccu-ico">${iconSvg(t.icon)}</span><span class="tx"><b>${t.key === 'uv' && !t.na ? 'UV ' : ''}${esc(t.value)}</b></span></div>`).join('');
  const wi = config.items.findIndex((x) => x.kind === 'weather');
  const days = model.days.length ? model.days.map((d) => {
    // ploaie: probabilitate și/sau cantitate; fără niciuna (sau 0 mm fără probabilitate) nu se desenează nimic, nici pictograma
    const ppTxt = [d.pop !== null ? `${d.pop}%` : '', d.mm !== null && d.mm > 0 ? `${f1(d.mm)} mm` : ''].filter(Boolean).join(' · ');
    const pp = ppTxt ? `<small class="pp"><span class="ccu-ico">${iconSvg('drop')}</span>${ppTxt}</small>` : '<small class="pp"></small>';
    const wd = d.wind !== null ? `<small class="ws"><span class="ccu-ico" style="${d.bearing !== null ? `transform:rotate(${Math.round(d.bearing + 180)}deg)` : ''}">${iconSvg('compass')}</span>${f0(d.wind)} km/h</small>` : '<small class="ws"></small>';
    return `<div class="wd" data-id="${wi}" data-entity="${esc(config.weather)}" data-today="${d.today ? 1 : 0}"><small class="dn">${esc(d.name)}</small><span class="ccu-ico wi">${iconSvg(condIcon(d.cond))}</span>`
      + `<b class="hi">${d.hi === null ? '—' : `${f0(d.hi)}°`}</b><span class="lo">${d.lo === null ? '' : `${f0(d.lo)}°`}</span><small class="cn">${esc(condLabel(d.cond))}</small>${pp}${wd}</div>`;
  }).join('') : `<div class="wd-empty">${config.weather ? t('prognoza se încarcă…') : t('fără prognoză (adaugă „weather”)')}</div>`;
  const head = config.title ? `<div class="ccu-flow-head"><span class="t">${esc(config.title)}</span></div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-wx">${head}<div class="ccu-wx-top">${renderScene(model, wi, config.weather, tiles)}</div><div class="ccu-wx-days" data-n="${Math.max(1, model.days.length)}">${days}</div>${notes}</div>`;
}

return { toC, toKmh, toMmh, toMm, dirText, normalizeWeatherConfig, condLabel, condIcon, classifyScene, parseForecast, buildWeatherModel, renderScene, renderWeather };
})();

__m["controls"] = (() => {
// src/controls.mjs — controale ccu: termostat (climate), lumină cu luminozitate, număr (slider), selector (select), titlu de secțiune.
// Funcții PURE (normalizare, model, șabloane HTML). Interacțiunea (slider, +/−, select) e în cards.mjs (CcuControlsCard).
const { t, decSep } = __m["i18n"];
const { esc } = __m["render"];
const { iconSvg } = __m["icons"];
const { formatNumber } = __m["state"];
const ID = /^[a-z_]+\.[a-z0-9_]+$/;
const DOM_KIND = { climate: 'climate', light: 'light', number: 'number', input_number: 'number', select: 'select', input_select: 'select', fan: 'fan', media_player: 'media' };

const MODE_RO = { off: 'Oprit', heat: 'Încălzire', cool: 'Răcire', auto: 'Auto', heat_cool: 'Auto', dry: 'Uscare', fan_only: 'Ventilator' };
const FAN_RO = { auto: 'Auto', low: 'Mic', medium: 'Mediu', middle: 'Mediu', high: 'Mare', quiet: 'Silențios', silent: 'Silențios', turbo: 'Turbo', strong: 'Puternic', mid: 'Mediu', focus: 'Focus', diffuse: 'Difuz', on: 'Pornit', off: 'Oprit' };
const SWING_RO = { off: 'Oprit', on: 'Pornit', vertical: 'Vertical', horizontal: 'Orizontal', both: 'Ambele' };
const PRESET_RO = { none: 'Normal', eco: 'Eco', away: 'Plecat', boost: 'Boost', comfort: 'Confort', home: 'Acasă', sleep: 'Somn', activity: 'Activ' };
const MODE_ICON = { off: 'plug', heat: 'flame', cool: 'snow', auto: 'sun', heat_cool: 'sun', dry: 'drop', fan_only: 'fan' };

/** Normalizează controalele: items = [{ entity, kind?, name?, icon?, step?, labels?, modes? }]; kind se deduce din domeniu. */
function normalizeControls(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], items = [];
  (Array.isArray(src.items) ? src.items : Array.isArray(src.entities) ? src.entities : []).forEach((x, i) => {
    const o = typeof x === 'string' ? { entity: x } : x && typeof x === 'object' ? { ...x } : null;
    if (!o || typeof o.entity !== 'string' || !ID.test(o.entity)) { warnings.push(t('Control #{n}: entity_id lipsă sau invalid.', { n: i + 1 })); return; }
    const dom = o.entity.split('.')[0];
    const kind = ['climate', 'light', 'number', 'select', 'fan', 'media'].includes(o.kind) ? o.kind : DOM_KIND[dom];
    if (!kind) { warnings.push(t('Control #{n} ({e}): domeniu necunoscut; folosește kind: climate | light | number | select | fan | media.', { n: i + 1, e: o.entity })); return; }
    items.push({ ...o, kind });
  });
  if (items.length > 12) { items.length = 12; warnings.push(t('Controale: maximum 12 per card.')); }
  const c = Number(src.columns);
  return { items, columns: Number.isFinite(c) ? Math.min(3, Math.max(1, Math.round(c))) : 1, title: src.title ? String(src.title) : '', warnings };
}

const num = (v) => { const n = Number(v); return v === null || v === undefined || v === '' || !Number.isFinite(n) ? null : n; };
const fmt = (n, d = 1) => (n === null ? '—' : formatNumber(Math.round(n * 10 ** d) / 10 ** d));

/** Modelul unui control din config + starea HA (+ valori optimiste dintr-o atingere recentă). */
function controlModel(it, st, optim, optimCt) {
  const a = (st && st.attributes) || {};
  const state = st ? String(st.state) : 'unavailable';
  const gone = state === 'unavailable' || state === 'unknown';
  const name = it.name || a.friendly_name || it.entity.split('.')[1].replace(/_/g, ' ');
  const base = { kind: it.kind, entity: it.entity, name, gone, icon: it.icon };
  if (it.kind === 'climate') {
    const step = num(it.step) || num(a.target_temp_step) || (String(a.temperature_unit || '').includes('F') ? 1 : 0.5);
    // heat_cool cu două praguri (jos / sus): se afișează „22–25°”, iar +/− le mută pe amândouă
    const hasRange = a.target_temp_low !== undefined && a.target_temp_high !== undefined && num(a.temperature) === null;
    const range = hasRange ? (Array.isArray(optim) ? optim : [num(a.target_temp_low), num(a.target_temp_high)]) : null;
    const tgt = hasRange ? null : (typeof optim === 'number' ? optim : num(a.temperature));
    const allowed = Array.isArray(it.modes) ? it.modes : (Array.isArray(a.hvac_modes) ? a.hvac_modes : []);
    const opts = (list, cur, ro) => (Array.isArray(list) && list.length > 1 ? { cur: cur === undefined || cur === null ? '' : String(cur), list: list.map(String).map((v) => ({ id: v, label: (it.labels && it.labels[v]) || (ro[v] ? t(ro[v]) : pretty(v)) })) } : null);
    return { ...base, simple: it.style === 'simple', on: !gone && state !== 'off', mode: state, cur: num(a.current_temperature), tgt, range, step, min: num(a.min_temp), max: num(a.max_temp),
      fan: opts(a.fan_modes, a.fan_mode, FAN_RO), swing: opts(a.swing_modes, a.swing_mode, SWING_RO), preset: opts(a.preset_modes, a.preset_mode, PRESET_RO),
      action: a.hvac_action || '', modes: allowed.filter((m) => MODE_RO[m]).map((m) => ({ id: m, label: (it.labels && it.labels[m]) || t(MODE_RO[m]), icon: MODE_ICON[m] })) };
  }
  if (it.kind === 'light') {
    const modes = Array.isArray(a.supported_color_modes) ? a.supported_color_modes : [];
    const dim = modes.some((m) => m !== 'onoff');
    const b = num(a.brightness);
    const pct = optim !== undefined ? optim : state === 'on' ? (b === null ? 100 : Math.max(1, Math.round((b / 255) * 100))) : 0;
    const canRgb = modes.some((m) => ['hs', 'rgb', 'rgbw', 'rgbww', 'xy'].includes(m)), canCt = modes.includes('color_temp');
    const kmin = num(a.min_color_temp_kelvin) ?? 2000, kmax = num(a.max_color_temp_kelvin) ?? 6500;
    const kel = optimCt !== undefined ? optimCt : num(a.color_temp_kelvin);
    const rgb = Array.isArray(a.rgb_color) && a.rgb_color.length >= 3 ? a.rgb_color.slice(0, 3).map((x) => Math.round(Number(x))) : null;
    return { ...base, on: state === 'on', dim, pct, color: canRgb || canCt, canRgb, canCt, kmin, kmax, kel, rgb };
  }
  if (it.kind === 'number') {
    const min = num(a.min) ?? 0, max = num(a.max) ?? 100, step = num(a.step) || 1;
    const v = optim !== undefined ? optim : num(st && st.state);
    return { ...base, on: !gone, v, min, max, step, unit: it.unit !== undefined ? String(it.unit) : String(a.unit_of_measurement || '') };
  }
  if (it.kind === 'fan') {
    const sf = num(a.supported_features) || 0;
    const pstep = num(a.percentage_step) || 1;
    const pct = optim !== undefined ? optim : state === 'on' ? (num(a.percentage) ?? 100) : 0;
    const presets = Array.isArray(a.preset_modes) ? a.preset_modes.map(String) : [];
    return { ...base, on: state === 'on', pct, pstep, speed: (sf & 1) !== 0 || a.percentage !== undefined, presets, preset: a.preset_mode ? String(a.preset_mode) : '', labels: it.labels && typeof it.labels === 'object' ? it.labels : {} };
  }
  if (it.kind === 'media') {
    const sf = num(a.supported_features) || 0;
    const vol = optim !== undefined ? optim : (num(a.volume_level) === null ? null : Math.round(num(a.volume_level) * 100));
    const playing = state === 'playing', paused = state === 'paused';
    return { ...base, on: !gone && state !== 'off' && state !== 'standby', state, playing, title: a.media_title ? String(a.media_title) : '', artist: a.media_artist ? String(a.media_artist) : (a.app_name ? String(a.app_name) : ''),
      vol, hasVol: (sf & 4) !== 0 && vol !== null, mute: a.is_volume_muted === true, canMute: (sf & 8) !== 0, canStep: (sf & 1024) !== 0, canPrev: (sf & 16) !== 0, canNext: (sf & 32) !== 0, canPause: (sf & 1) !== 0 || (sf & 16384) !== 0 || playing || paused };
  }
  const options = Array.isArray(a.options) ? a.options.map(String) : [];
  return { ...base, on: !gone, cur: gone ? '' : state, options, labels: it.labels && typeof it.labels === 'object' ? it.labels : {} };
}

// temperatura: o zecimală când pasul e fracționar (22,0°), altfel număr întreg
const fT = (n, step) => (n === null ? '—' : step < 1 ? n.toFixed(1).replace('.', decSep()) : String(Math.round(n)));
function pretty(s) { return String(s).replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase()); }

// buton rotund pornit/oprit în antetul unui control (bec cu slider, ventilator, media): clar că e un buton, nu doar un titlu
const powerBtn = (on) => `<button type="button" class="pw" data-act="toggle" data-state="${on ? 'on' : 'off'}" aria-label="${on ? t('Oprește') : t('Pornește')}"><span class="ccu-ico">${iconSvg('power')}</span></button>`;

const ARC_R = 82, ARC_C = 100;
const arcPt = (f) => { const a = ((150 + 240 * Math.max(0, Math.min(1, f))) * Math.PI) / 180; return [ARC_C + ARC_R * Math.cos(a), ARC_C + ARC_R * Math.sin(a)]; };
const ARC_D = (() => { const a = arcPt(0), b = arcPt(1); return `M${a[0].toFixed(1)} ${a[1].toFixed(1)} A${ARC_R} ${ARC_R} 0 1 1 ${b[0].toFixed(1)} ${b[1].toFixed(1)}`; })();

/** Fracția 0..1 a unei temperaturi pe arc (între min și max; implicit 16–30). */
function arcFrac(t, min, max) {
  const lo = Number.isFinite(min) ? min : 16, hi = Number.isFinite(max) && max > lo ? max : lo + 14;
  return t === null || !Number.isFinite(t) ? 0 : Math.max(0, Math.min(1, (t - lo) / (hi - lo)));
}

const rowOf = (cap, act, o) => (o ? `<div class="sub"><small>${esc(cap)}</small><div class="mds">${o.list.map((p) => `<button type="button" class="md" data-act="${act}" data-val="${esc(p.id)}" data-state="${p.id === o.cur ? 'on' : 'off'}"><span>${esc(p.label)}</span></button>`).join('')}</div></div>` : '');

function tileClimate(m, i) {
  const modeAttr = m.on ? ` data-mode="${esc(m.mode)}"` : '';
  const run = m.on && m.action !== 'idle' && m.action !== 'off' ? 1 : 0;
  const tgt = m.range ? `${fT(m.range[0], m.step)}–${fT(m.range[1], m.step)}°` : `${fT(m.tgt, m.step)}°`;
  const pills = m.modes.map((p) => `<button type="button" class="md" data-act="mode" data-val="${esc(p.id)}" data-state="${p.id === m.mode ? 'on' : 'off'}"><span class="ccu-ico">${iconSvg(p.icon)}</span><span>${esc(p.label)}</span></button>`).join('');
  const head = `<div class="hd" data-act="more"><span class="ccu-ico a-fan">${iconSvg(m.icon || 'thermo')}</span><span class="nm">${esc(m.name)}</span>${m.simple ? `<span class="cur">${m.cur === null ? '' : `${fT(m.cur, m.step)}°`}</span>` : ''}</div>`;
  const state = m.gone ? 'unavailable' : m.on ? 'on' : 'off';
  if (m.simple) {
    return `<div class="ctl cl" data-id="${i}" data-kind="climate" data-entity="${esc(m.entity)}" data-state="${state}"${modeAttr} data-run="${run}">${head}`
      + `<div class="sp"><button type="button" class="st" data-act="dec" aria-label="${t('Scade')}">−</button><b class="tv">${tgt}</b><button type="button" class="st" data-act="inc" aria-label="${t('Crește')}">+</button></div>`
      + (pills ? `<div class="mds">${pills}</div>` : '') + `</div>`;
  }
  // cadran: arc de 240° (min → max), valoarea țintă umple arcul, punctul alb = temperatura curentă
  const f1 = m.range ? arcFrac(m.range[0], m.min, m.max) : 0, f2 = m.range ? arcFrac(m.range[1], m.min, m.max) : arcFrac(m.tgt, m.min, m.max);
  const dash = m.on || m.gone ? `${Math.max(0.5, (f2 - f1) * 100).toFixed(1)} 200` : '0 200', off = (-f1 * 100).toFixed(1);
  const cm = m.cur !== null ? arcPt(arcFrac(m.cur, m.min, m.max)) : null;
  const act = !m.on ? t('Oprit') : m.action === 'heating' ? t('încălzește') : m.action === 'cooling' ? t('răcește') : m.action === 'drying' ? t('usucă') : m.action === 'fan' ? t('ventilație') : m.action === 'idle' ? t('în repaus') : (MODE_RO[m.mode] ? t(MODE_RO[m.mode]) : '').toLowerCase();
  const svg = `<svg viewBox="0 0 200 150" aria-hidden="true"><path class="tr" d="${ARC_D}" pathLength="100"/><path class="vl" d="${ARC_D}" pathLength="100" stroke-dasharray="${dash}" stroke-dashoffset="${off}"/>`
    + (cm ? `<circle class="cm" cx="${cm[0].toFixed(1)}" cy="${cm[1].toFixed(1)}" r="5.5"/>` : '') + `</svg>`;
  return `<div class="ctl cl dial" data-id="${i}" data-kind="climate" data-entity="${esc(m.entity)}" data-state="${state}"${modeAttr} data-run="${run}">${head}`
    + `<div class="dl">${svg}<div class="ct"><b class="tv${m.range ? ' rg' : ''}">${tgt}</b><span class="ac">${m.cur === null ? '' : `${t('acum')} ${fT(m.cur, m.step)}° · `}${esc(act)}</span></div>`
    + `<button type="button" class="st m" data-act="dec" aria-label="${t('Scade')}">−</button><button type="button" class="st p" data-act="inc" aria-label="${t('Crește')}">+</button></div>`
    + (pills ? `<div class="mds c">${pills}</div>` : '')
    + rowOf(t('Ventilator'), 'cfan', m.fan) + rowOf(t('Oscilare'), 'cswing', m.swing) + rowOf(t('Preset'), 'cpreset', m.preset) + `</div>`;
}

function slider(pct, label) {
  const p = Math.max(0, Math.min(100, pct));
  return `<div class="sl" data-act="slider"><i class="fl" style="width:${p.toFixed(1)}%"></i><span class="th" style="left:${p.toFixed(1)}%"></span><b class="sv">${esc(label)}</b></div>`;
}

// culori rapide: albe (temperatură de culoare, K) și culori (RGB)
const WHITES = [{ k: 2700, c: '#ffb872', l: 'Alb cald' }, { k: 4000, c: '#fff0dc', l: 'Alb neutru' }, { k: 6500, c: '#cfe0ff', l: 'Alb rece' }];
const COLORS = [{ rgb: [255, 59, 48], l: 'Roșu' }, { rgb: [255, 149, 0], l: 'Portocaliu' }, { rgb: [255, 214, 10], l: 'Galben' }, { rgb: [52, 199, 89], l: 'Verde' },
  { rgb: [50, 210, 255], l: 'Cyan' }, { rgb: [59, 130, 246], l: 'Albastru' }, { rgb: [168, 85, 247], l: 'Mov' }, { rgb: [255, 79, 163], l: 'Roz' }];
const rgbCss = (r) => `rgb(${r[0]},${r[1]},${r[2]})`;

function tileLight(m, i) {
  const state = m.gone ? 'unavailable' : m.on ? 'on' : 'off';
  // bec doar pornit/oprit: buton „lampă” — orb cu iconița becului care strălucește, nume și stare; toată plăcuța comută
  if (!m.dim && !m.color) {
    return `<button type="button" class="ccu-btn m chamfer" data-lamp="1" data-id="${i}" data-kind="light" data-entity="${esc(m.entity)}" data-act="toggle" data-state="${state}">`
      + `<span class="ccu-ico a-glow">${iconSvg(m.icon || 'bulb')}</span><span class="ccu-name">${esc(m.name)}</span><span class="ccu-sec">${m.gone ? '—' : m.on ? t('Pornit') : t('Oprit')}</span></button>`;
  }
  const tint = m.on && m.rgb ? ` style="--lc:${rgbCss(m.rgb)}"` : '';
  const more = m.color ? `<button type="button" class="mo" data-act="more" aria-label="${t('Alte culori')}">${iconSvg('sliders')}</button>` : '';
  const orb = `<button type="button" class="orb" data-act="toggle" data-state="${m.on ? 'on' : 'off'}" aria-label="${m.on ? t('Stinge') : t('Aprinde')}"><span class="ccu-ico a-glow">${iconSvg(m.icon || 'bulb')}</span></button>`;
  const sl = m.dim ? slider(m.on ? m.pct : 0, m.on ? `${m.pct}%` : '0%').replace('class="sl"', 'class="sl" data-min="0" data-max="100" data-step="1"') : '';
  const ct = m.canCt ? `<div class="sub"><small>${t('Temperatură de culoare')}</small>${slider(m.kel === null ? 50 : ((m.kel - m.kmin) / ((m.kmax - m.kmin) || 1)) * 100, m.kel === null ? '' : `${Math.round(m.kel)} K`).replace('class="sl"', `class="sl ct" data-sub="ct" data-min="${m.kmin}" data-max="${m.kmax}" data-step="50" data-unit="K"`)}</div>` : '';
  const sw = [];
  if (m.canCt) WHITES.forEach((w) => sw.push(`<button type="button" class="sw" data-act="swatch" data-k="${w.k}" style="--c:${w.c}" aria-label="${t(w.l)}" data-state="${m.kel !== null && Math.abs(m.kel - w.k) < 120 ? 'on' : 'off'}"></button>`));
  if (m.canRgb) COLORS.forEach((c) => sw.push(`<button type="button" class="sw" data-act="swatch" data-rgb="${c.rgb.join(',')}" style="--c:${rgbCss(c.rgb)}" aria-label="${t(c.l)}" data-state="${m.rgb && m.rgb.join() === c.rgb.join() ? 'on' : 'off'}"></button>`));
  return `<div class="ctl li" data-id="${i}" data-kind="light" data-entity="${esc(m.entity)}" data-state="${state}"${tint}>`
    + `<div class="hd">${orb}<span class="nm" data-act="more">${esc(m.name)}</span><span class="cur">${m.on ? (m.dim ? `${m.pct}%` : t('Pornit')) : t('Oprit')}</span>${more}</div>`
    + sl + ct + (sw.length ? `<div class="sws">${sw.join('')}</div>` : '') + `</div>`;
}

function tileFan(m, i) {
  const lab = (o) => (m.labels[o] !== undefined ? String(m.labels[o]) : pretty(o));
  const pills = m.presets.map((p) => `<button type="button" class="md" data-act="preset" data-val="${esc(p)}" data-state="${p === m.preset ? 'on' : 'off'}"><span>${esc(lab(p))}</span></button>`).join('');
  return `<div class="ctl fa" data-id="${i}" data-kind="fan" data-entity="${esc(m.entity)}" data-state="${m.gone ? 'unavailable' : m.on ? 'on' : 'off'}" data-run="${m.on ? 1 : 0}">`
    + `<div class="hd" data-act="toggle"><span class="ccu-ico a-fan">${iconSvg(m.icon || 'fan')}</span><span class="nm">${esc(m.name)}</span><span class="cur">${m.on ? (m.speed ? `${m.pct}%` : t('Pornit')) : t('Oprit')}</span>${powerBtn(m.on)}</div>`
    + (m.speed ? slider(m.on ? m.pct : 0, m.on ? `${m.pct}%` : '0%').replace('class="sl"', `class="sl" data-min="0" data-max="100" data-step="${m.pstep}"`) : '')
    + (pills ? `<div class="mds">${pills}</div>` : '') + `</div>`;
}

function tileMedia(m, i) {
  const st = m.gone ? 'unavailable' : m.on ? 'on' : 'off';
  const btn = (act, ico, on) => `<button type="button" class="st" data-act="${act}"${on ? ' data-state="on"' : ''} aria-label="${act}"><span class="ccu-ico">${iconSvg(ico)}</span></button>`;
  const ctr = m.on ? `<div class="tr">${m.canPrev ? btn('mprev', 'prev') : ''}${m.canPause ? btn('mpp', m.playing ? 'pause' : 'play', m.playing) : ''}${m.canNext ? btn('mnext', 'next') : ''}${m.canStep && !m.hasVol ? btn('mvd', 'voldown') + btn('mvu', 'volup') : ''}${m.canMute ? btn('mmute', 'mute', m.mute) : ''}</div>` : '';
  const vol = m.on && m.hasVol ? slider(m.vol, `${m.vol}%`).replace('class="sl"', 'class="sl" data-min="0" data-max="100" data-step="1"') : '';
  const now = m.title || m.artist ? `<div class="np"><b>${esc(m.title || m.artist)}</b>${m.title && m.artist ? `<small>${esc(m.artist)}</small>` : ''}</div>` : '';
  return `<div class="ctl me" data-id="${i}" data-kind="media" data-entity="${esc(m.entity)}" data-state="${st}">`
    + `<div class="hd" data-act="toggle"><span class="ccu-ico">${iconSvg(m.icon || 'tv')}</span><span class="nm">${esc(m.name)}</span><span class="cur">${m.gone ? '—' : m.playing ? t('Redă') : m.on ? (m.state === 'paused' ? t('Pauză') : t('Pornit')) : t('Oprit')}</span>${powerBtn(m.on)}</div>${now}${ctr}${vol}</div>`;
}

function tileNumber(m, i) {
  const span = m.max - m.min || 1;
  const pct = m.v === null ? 0 : ((m.v - m.min) / span) * 100;
  const label = m.v === null ? '—' : `${fmt(m.v, m.step < 1 ? 1 : 0)}${m.unit ? ' ' + m.unit : ''}`;
  return `<div class="ctl nu" data-id="${i}" data-kind="number" data-entity="${esc(m.entity)}" data-state="${m.gone ? 'unavailable' : 'on'}">`
    + `<div class="hd" data-act="more"><span class="ccu-ico">${iconSvg(m.icon || 'thermo')}</span><span class="nm">${esc(m.name)}</span><span class="cur">${esc(label)}</span></div>`
    + slider(pct, label).replace('class="sl"', `class="sl" data-min="${m.min}" data-max="${m.max}" data-step="${m.step}" data-unit="${esc(m.unit)}"`) + `</div>`;
}

function tileSelect(m, i) {
  const lab = (o) => (m.labels[o] !== undefined ? String(m.labels[o]) : pretty(o));
  const opts = m.options.map((o) => `<option value="${esc(o)}"${o === m.cur ? ' selected' : ''}>${esc(lab(o))}</option>`).join('');
  return `<label class="ctl se" data-id="${i}" data-kind="select" data-entity="${esc(m.entity)}" data-state="${m.gone ? 'unavailable' : 'on'}">`
    + `<span class="hd"><span class="ccu-ico">${iconSvg(m.icon || 'plug')}</span><span class="nm">${esc(m.name)}</span></span>`
    + `<span class="cv"><b>${m.cur ? esc(lab(m.cur)) : '—'}</b><span class="chev" aria-hidden="true">▾</span></span>`
    + `<select class="sel" data-act="select" data-cur="${esc(m.cur)}" aria-label="${esc(m.name)}">${opts}</select></label>`;
}

/** Cardul de controale (șir HTML). optim = { [index]: valoare } din atingeri recente. */
function renderControls(config, hass, opts = {}) {
  const optim = opts.optim || {};
  const tiles = (config.items || []).map((it, i) => {
    const st = hass && hass.states ? hass.states[it.entity] : null;
    const m = controlModel(it, st, optim[i], optim[i + 'c']);
    return m.kind === 'climate' ? tileClimate(m, i) : m.kind === 'light' ? tileLight(m, i) : m.kind === 'number' ? tileNumber(m, i) : m.kind === 'fan' ? tileFan(m, i) : m.kind === 'media' ? tileMedia(m, i) : tileSelect(m, i);
  }).join('');
  const title = config.ctitle ? `<div class="ccu-title">${esc(config.ctitle)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card">${title}<div class="ccu-grid ctl-grid" data-cols="${config.columns}" style="--cols:${config.columns};--cols-wide:${config.columns}">${tiles}</div>${notes}</div>`;
}

/** Valoarea unui slider după poziția relativă 0..1: rotunjită la pas, în [min, max]. */
function sliderValue(frac, min, max, step) {
  const f = Math.max(0, Math.min(1, Number.isFinite(frac) ? frac : 0));
  const s = step > 0 ? step : 1;
  const v = Math.round((min + f * (max - min)) / s) * s;
  return Math.max(min, Math.min(max, Math.round(v * 1e6) / 1e6));
}

// ---------------------------------------------------------------- titlu de secțiune
/** Normalizează `ccu-title-card`: { title, subtitle?, icon? }. */
function normalizeTitle(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  return { title: src.title ? String(src.title) : '', subtitle: src.subtitle ? String(src.subtitle) : '', icon: src.icon ? String(src.icon) : '' };
}

function renderTitle(t) {
  return `<div class="ccu-ttl">${t.icon ? `<span class="ccu-ico">${iconSvg(t.icon)}</span>` : ''}<span class="tx"><b>${esc(t.title)}</b>${t.subtitle ? `<small>${esc(t.subtitle)}</small>` : ''}</span></div>`;
}

// ---------------------------------------------------------------- telecomandă (remote.send_command)
const TV_KEYS = {
  power: { cmd: 'POWER', icon: 'power', label: 'Pornit' }, mute: { cmd: 'MUTE', icon: 'mute', label: 'Mute' },
  vold: { cmd: 'VOLUME_DOWN', icon: 'voldown', label: 'Vol −', repeat: true }, volu: { cmd: 'VOLUME_UP', icon: 'volup', label: 'Vol +', repeat: true },
  chd: { cmd: 'CHANNEL_DOWN', icon: 'down', label: 'Canal −', repeat: true }, chu: { cmd: 'CHANNEL_UP', icon: 'up', label: 'Canal +', repeat: true },
  home: { cmd: 'HOME', icon: 'home', label: 'Home' }, back: { cmd: 'BACK', icon: 'back', label: 'Înapoi' }, menu: { cmd: 'MENU', icon: 'menu', label: 'Meniu' }, input: { cmd: 'INPUT', icon: 'input', label: 'Intrare' },
  up: { cmd: 'UP', icon: 'up' }, down: { cmd: 'DOWN', icon: 'down' }, left: { cmd: 'LEFT', icon: 'left' }, right: { cmd: 'RIGHT', icon: 'right' }, ok: { cmd: 'SELECT', icon: 'ok', label: 'OK' },
};
const TV_ROWS = [['power', 'mute'], ['vold', 'volu', 'chd', 'chu'], ['home', 'back', 'menu', 'input']];

/** Normalizează `ccu-remote-card`: { entity: remote.x, title?, commands?: { power: 'POWER', … } } — comenzile pot fi redenumite (ex. alt model de TV). */
function normalizeRemote(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [];
  const entity = typeof src.entity === 'string' && ID.test(src.entity) ? src.entity : '';
  if (!entity) warnings.push(t('Telecomandă: lipsește „entity” (ex. remote.living_room_tv).'));
  const keys = {};
  for (const [k, d] of Object.entries(TV_KEYS)) keys[k] = { ...d, cmd: src.commands && typeof src.commands[k] === 'string' ? src.commands[k] : d.cmd };
  // `rows`: ce taste apar și în ce ordine (ex. [['power','mute'],['volu','vold']]); `extra`: taste proprii [{ label, icon, command }] (ex. Netflix → KEY_11), puse pe ultimul rând
  const extra = (Array.isArray(src.extra) ? src.extra : []).slice(0, 6).map((e, i) => (e && typeof e === 'object' && e.command ? { id: 'x' + i, cmd: String(e.command), icon: e.icon || 'play', label: String(e.label || '') } : null)).filter(Boolean);
  extra.forEach((e) => { keys[e.id] = { cmd: e.cmd, icon: e.icon, label: e.label }; });
  let rows = Array.isArray(src.rows) ? src.rows.map((r) => (Array.isArray(r) ? r.filter((k) => keys[k]) : [])).filter((r) => r.length) : TV_ROWS.map((r) => r.slice());
  if (extra.length) rows = rows.concat([extra.map((e) => e.id)]);
  return { entity, title: src.title ? String(src.title) : '', keys, rows, dpad: src.dpad !== false, warnings };
}

function renderRemote(config, hass, opts = {}) {
  const st = hass && hass.states ? hass.states[config.entity] : null;
  const state = !st ? 'unavailable' : st.state === 'on' ? 'on' : st.state === 'off' ? 'off' : 'unavailable';
  const key = (k, cls = '') => { const d = config.keys[k]; return `<button type="button" class="rk ${cls}" data-key="${k}" data-cmd="${esc(d.cmd)}"${d.repeat ? ' data-repeat="1"' : ''} aria-label="${esc(d.label ? t(d.label) : k)}"><span class="ccu-ico">${iconSvg(d.icon)}</span>${d.label && !cls.includes('dp') ? `<span>${esc(t(d.label))}</span>` : ''}</button>`; };
  const rows = (config.rows || TV_ROWS).map((r) => `<div class="rr" style="--n:${Math.min(4, r.length)}">${r.map((k) => key(k)).join('')}</div>`).join('');
  const dpad = config.dpad ? `<div class="dpad">${key('up', 'dp u')}${key('left', 'dp l')}${key('ok', 'dp c')}${key('right', 'dp r')}${key('down', 'dp d')}</div>` : '';
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-remote" data-state="${state}">${title}${rows}${dpad}${notes}</div>`;
}

return { MODE_RO, FAN_RO, SWING_RO, PRESET_RO, MODE_ICON, normalizeControls, controlModel, arcFrac, renderControls, sliderValue, normalizeTitle, renderTitle, TV_KEYS, normalizeRemote, renderRemote };
})();

__m["radio"] = (() => {
// src/radio.mjs — cardul ccu-radio-card: radio cu scală de acordaj, ecran cu echalizator, post anterior / următor, play / stop și volum.
// Funcții PURE (normalizare, model, șablon HTML). Interacțiunea (atingeri, volum) e în cards.mjs (CcuRadioCard).
const { t } = __m["i18n"];
const { esc } = __m["render"];
const { iconSvg } = __m["icons"];
const ID = /^[a-z_]+\.[a-z0-9_]+$/;
const dom = (id) => String(id || '').split('.')[0];

/** Config → { stations, playing, play, stop, player, title, hide, strip, labels }. `play` / `stop`: entitate (script, buton) sau o acțiune { action: call-service, … }. */
function normalizeRadio(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [];
  const ent = (k, domains) => {
    const v = src[k];
    if (v === undefined || v === null || v === '') return '';
    if (typeof v !== 'string' || !ID.test(v)) { warnings.push(t('Radio: „{k}” nu e un entity_id valid.', { k })); return ''; }
    if (domains && !domains.includes(dom(v))) { warnings.push(t('Radio: „{k}” trebuie să fie din domeniul {d}.', { k, d: domains.join(' / ') })); return ''; }
    return v;
  };
  const act = (k) => { const v = src[k]; if (!v) return null; if (typeof v === 'string') return ID.test(v) ? v : null; return typeof v === 'object' && v.action ? v : null; };
  const list = (v) => (Array.isArray(v) ? v : v ? [v] : []).map(String).filter(Boolean);
  const stations = ent('stations', ['select', 'input_select']);
  if (!stations) warnings.push(t('Radio: lipsește „stations” (un select cu posturile).'));
  const speakers = list(src.speakers).filter((x) => ID.test(x) && dom(x) === 'media_player');
  return {
    speakers, stations, playing: ent('playing'), player: ent('player', ['media_player']), play: act('play'), stop: act('stop'),
    title: src.title ? String(src.title) : '', hide: list(src.hide), strip: typeof src.strip_after === 'string' ? src.strip_after : ' - ',
    labels: src.labels && typeof src.labels === 'object' ? src.labels : {}, warnings,
  };
}

/** Adresa fluxului dintr-o opțiune de tip „Nume - https://…” (sau șir gol). */
function stationUrl(option, strip) {
  const o = String(option || ''), sep = strip || ' - ', i = o.indexOf(sep);
  const u = (i >= 0 ? o.slice(i + sep.length) : o).trim();
  return /^https?:\/\/\S+$/i.test(u) ? u : '';
}

/** Modelul din config + starea HA (+ valori „optimiste” dintr-o atingere recentă: { play, station }). */
function radioModel(c, hass, opt) {
  const o = opt || {}, S = (id) => (id && hass && hass.states ? hass.states[id] : undefined);
  const sel = S(c.stations), options = (sel && sel.attributes && Array.isArray(sel.attributes.options) ? sel.attributes.options : []).map(String);
  const hide = c.hide.map((x) => x.toLowerCase());
  const label = (v) => c.labels[v] || (c.strip && v.includes(c.strip) ? v.split(c.strip)[0] : v).trim();
  const stations = options.filter((v) => !hide.some((h) => v.toLowerCase().includes(h))).map((v) => ({ value: v, label: label(v) }));
  const cur = o.station !== undefined ? o.station : sel ? String(sel.state) : '';
  let idx = stations.findIndex((s) => s.value === cur);
  // boxa țintă: cea aleasă din butoane (opt.speaker), altfel `player`, altfel prima din `speakers`
  const ids = c.speakers.length ? c.speakers : c.player ? [c.player] : [];
  const sp = o.speaker && ids.includes(o.speaker) ? o.speaker : c.player || ids[0] || '';
  const pl = S(sp), pst = sp === c.player ? S(c.playing) : undefined;
  const playerGone = !!sp && (!pl || pl.state === 'unavailable');
  let playing = o.play !== undefined ? o.play : pst ? ['on', 'playing'].includes(pst.state) : pl ? pl.state === 'playing' : false;
  const a = (pl && pl.attributes) || {};
  const vol = pl && !playerGone && typeof a.volume_level === 'number' && ((Number(a.supported_features) || 0) & 4) ? Math.round(a.volume_level * 100) : null;
  const speakers = ids.map((id) => { const x = S(id), gone = !x || x.state === 'unavailable'; return { id, name: (x && x.attributes && x.attributes.friendly_name) || id.split('.')[1].replace(/_/g, ' '), state: gone ? 'na' : x.state === 'playing' ? 'play' : 'idle', active: id === sp }; });
  const mt = pl && pl.state === 'playing' && a.media_title ? String(a.media_title) : '';
  const now = mt ? (a.media_artist ? a.media_artist + ' — ' + mt : mt) : '';
  stations.forEach((s, i) => { s.x = ((i + 0.5) / stations.length) * 100; s.active = i === idx; });
  return { speakers, speaker: sp, now, value: idx >= 0 ? stations[idx].value : cur, stations, idx, name: idx >= 0 ? stations[idx].label : cur && !hide.some((h) => cur.toLowerCase().includes(h)) ? label(cur) : '', playing, playerGone, vol, needle: idx >= 0 ? stations[idx].x : null, gone: !sel };
}

function renderRadio(c, hass, opts = {}) {
  const m = radioModel(c, hass, opts.optim);
  const state = m.gone ? 'na' : m.playing ? 'play' : 'stop';
  const sub = m.playerGone ? t('Playerul nu răspunde') : m.playing ? t('Redă') : t('Oprit');
  const bars = [0, 1, 2, 3, 4, 5, 6].map((i) => `<i style="--d:${[0.9, 0.55, 1.1, 0.7, 1.0, 0.6, 0.85][i]}s;--o:${(i * 0.13).toFixed(2)}s"></i>`).join('');
  const stationBtns = m.stations.map((s) => `<button type="button" class="st${s.active ? ' on' : ''}" data-act="station" data-val="${esc(s.value)}" style="left:${s.x.toFixed(1)}%" aria-pressed="${s.active ? 'true' : 'false'}" aria-label="${esc(s.label)}"><i></i><span>${esc(s.label)}</span></button>`).join('');
  const dial = m.stations.length ? `<div class="rd-dial"><div class="rd-ticks"></div>${m.needle !== null ? `<div class="rd-needle" style="left:${m.needle.toFixed(1)}%"></div>` : ''}${stationBtns}</div>` : '';
  const vol = m.vol !== null ? `<div class="rd-vol" data-act="vol" role="slider" aria-label="${t('Volum')}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${m.vol}"><span class="fl" style="width:${m.vol}%"></span><span class="th" style="left:${m.vol}%"></span><span class="ico ccu-ico">${iconSvg('volup')}</span><span class="sv">${m.vol}%</span></div>` : '';
  const spk = m.speakers.length > 1 ? `<div class="rd-spk" role="group" aria-label="${t('Boxe')}">${m.speakers.map((x) => `<button type="button" class="sp${x.active ? ' on' : ''}" data-act="speaker" data-val="${esc(x.id)}" data-s="${x.state}" aria-pressed="${x.active ? 'true' : 'false'}"><span class="ccu-ico">${iconSvg('volup')}</span><span>${esc(x.name)}</span><i></i></button>`).join('')}</div>` : '';
  const many = m.stations.length > 1;
  const nav = (cls, act, icon, label) => `<button type="button" class="rd-b ${cls}" data-act="${act}" aria-label="${label}"${many ? '' : ' disabled'}><span class="ccu-ico">${iconSvg(icon)}</span></button>`;
  const knob = `<button type="button" class="rd-knob" data-act="power" aria-label="${m.playing ? t('Oprește') : t('Pornește')}"><span class="ccu-ico">${iconSvg(m.playing ? 'stop' : 'play')}</span></button>`;
  const title = c.title ? `<div class="ccu-title">${esc(c.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-radio" data-state="${state}" data-run="${m.playing ? 1 : 0}">${title}`
    + `<div class="rd-lcd"><span class="ccu-ico rd-ico">${iconSvg('radio')}</span><div class="rd-info"><b>${esc(m.name || t('Radio'))}</b><small>${esc(m.now && !m.playerGone ? m.now : sub)}</small></div><div class="rd-eq" aria-hidden="true">${bars}</div></div>`
    + `${dial}${spk}<div class="rd-ctl">${nav('pv', 'prev', 'prev', t('Postul anterior'))}${knob}${nav('nx', 'next', 'next', t('Postul următor'))}${vol}</div>${notes}</div>`;
}

return { normalizeRadio, stationUrl, radioModel, renderRadio };
})();

__m["vehicles"] = (() => {
// src/vehicles.mjs — ccu-vehicle-card: termene ale mașinilor (RCA, ITP, rovinietă, revizie / ulei). Funcții PURE: normalizare, model, șablon HTML.
// Interacțiunea (alegerea datei, „schimbat acum”) e în cards.mjs (CcuVehicleCard).
const { t, intlLocale, getLang } = __m["i18n"];
const { esc } = __m["render"];
const { iconSvg } = __m["icons"];
const { formatNumber } = __m["state"];
const ID = /^[a-z_]+\.[a-z0-9_]+$/;
const DAY = 864e5;
const ok = (v) => typeof v === 'string' && ID.test(v);
const num = (v, d, lo, hi) => { const n = Number(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : d; };

/** Config → { vehicles, alert_days, alert_km, title, warnings }. Un document: dată (`entity`) sau km (`remaining` | `odometer` + `last_km` + `interval_km`). */
function normalizeVehicles(cfg) {
  const src = cfg && typeof cfg === 'object' ? cfg : {};
  const warnings = [], vehicles = [];
  (Array.isArray(src.vehicles) ? src.vehicles : []).forEach((v, i) => {
    const o = v && typeof v === 'object' ? v : null;
    if (!o) { warnings.push(t('Mașina #{n} nu e un obiect.', { n: i + 1 })); return; }
    const documents = [];
    (Array.isArray(o.documents) ? o.documents : []).forEach((d, j) => {
      const x = d && typeof d === 'object' ? d : null;
      if (!x) return;
      const label = x.label ? String(x.label) : '';
      const base = { label, icon: x.icon ? String(x.icon) : '' };
      if (ok(x.remaining) || ok(x.odometer)) {
        const interval = num(x.interval_km, 10000, 1, 1000000);
        if (!ok(x.remaining) && !ok(x.last_km)) { warnings.push(t('Mașina „{v}”, documentul #{n}: pentru km trebuie „remaining” sau „odometer” + „last_km”.', { v: o.name || i + 1, n: j + 1 })); return; }
        documents.push({ ...base, kind: 'km', remaining: ok(x.remaining) ? x.remaining : '', odometer: ok(x.odometer) ? x.odometer : '', last_km: ok(x.last_km) ? x.last_km : '', interval_km: interval, alert_km: num(x.alert_km, 0, 0, 1000000) });
      } else if (ok(x.entity)) {
        documents.push({ ...base, kind: 'date', entity: x.entity });
      } else warnings.push(t('Mașina „{v}”, documentul #{n}: lipsește „entity” (o dată) sau „odometer” / „remaining” (km).', { v: o.name || i + 1, n: j + 1 }));
    });
    vehicles.push({ name: o.name ? String(o.name) : t('Mașina {n}', { n: i + 1 }), icon: o.icon ? String(o.icon) : 'mdi:car', plate: o.plate ? String(o.plate) : '', documents });
  });
  return { vehicles, title: src.title !== undefined ? String(src.title || '') : t('Mașini'), alert_days: num(src.alert_days, 3, 0, 365), alert_km: num(src.alert_km, 500, 0, 1000000), warnings };
}

/** O dată din starea unei entități: „2026-11-14”, un ISO cu oră sau o dată în alt format simplu. Necunoscut / nesetat (an < 2000) → null. */
function parseDate(s) {
  const v = s === undefined || s === null ? '' : String(s).trim();
  if (!v || v === 'unknown' || v === 'unavailable' || v === 'none') return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(v);
  if (!m) return null;
  const y = Number(m[1]);
  if (y < 2000) return null;
  const d = new Date(y, Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

const midnight = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
/** Zile întregi de la `now` (azi) până la `date`: pozitiv = în viitor, 0 = azi, negativ = expirat. */
const daysUntil = (date, now) => Math.round((midnight(date).getTime() - midnight(now).getTime()) / DAY);

const plural = (n, one, many) => (n === 1 ? t(one) : t(many, { n: formatNumber(n) }));

/** Un document → { …, status: ok | soon | expired | unset, text, valueText, frac }. */
function documentModel(doc, cfg, hass, now) {
  const S = (id) => (id && hass && hass.states ? hass.states[id] : undefined);
  const label = doc.label || (doc.kind === 'km' ? t('Ulei') : t('Document'));
  if (doc.kind === 'date') {
    const st = S(doc.entity), d = st ? parseDate(st.state) : null;
    if (!d) return { ...doc, label, status: 'unset', text: t('Setează data'), valueText: '—', days: null, frac: 0, editable: doc.entity.startsWith('input_datetime.') };
    const days = daysUntil(d, now);
    const status = days < 0 ? 'expired' : days <= cfg.alert_days ? 'soon' : 'ok';
    const text = days < 0 ? plural(-days, 'expirat de o zi', 'expirat de {n} zile') : days === 0 ? t('azi') : days === 1 ? t('mâine') : t('în {n} zile', { n: formatNumber(days) });
    return { ...doc, label, status, text, valueText: formatDate(d), days, frac: Math.max(0, Math.min(1, days / 365)), editable: doc.entity.startsWith('input_datetime.') };
  }
  // km: rămași direct dintr-o entitate, sau interval − (odometru − km la ultima schimbare)
  let left = null, target = null;
  const odo = doc.odometer && S(doc.odometer) ? Number(S(doc.odometer).state) : NaN;
  if (doc.remaining) { const n = Number(S(doc.remaining) && S(doc.remaining).state); left = Number.isFinite(n) ? n : null; if (left !== null && Number.isFinite(odo)) target = odo + left; }
  else { const l = Number(S(doc.last_km) && S(doc.last_km).state); if (Number.isFinite(odo) && Number.isFinite(l)) { target = l + doc.interval_km; left = target - odo; } }
  if (left === null) return { ...doc, label, status: 'unset', text: '—', valueText: '—', km: null, frac: 0, editable: false };
  const alertKm = doc.alert_km || cfg.alert_km;
  const status = left <= 0 ? 'expired' : left <= alertKm ? 'soon' : 'ok';
  const text = left < 0 ? t('depășit cu {n} km', { n: formatNumber(Math.round(-left)) }) : t('în {n} km', { n: formatNumber(Math.round(left)) });
  const editable = !doc.remaining && !!doc.last_km && doc.last_km.startsWith('input_number.') && !!doc.odometer;
  return { ...doc, label, status, text, valueText: target !== null ? t('la {n} km', { n: formatNumber(Math.round(target)) }) : '', km: left, frac: Math.max(0, Math.min(1, left / doc.interval_km)), editable };
}

function formatDate(d) {
  if (getLang() === 'ro') return String(d.getDate()).padStart(2, '0') + '.' + String(d.getMonth() + 1).padStart(2, '0') + '.' + d.getFullYear();
  try { return d.toLocaleDateString(intlLocale(), { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return d.toISOString().slice(0, 10); }
}

const RANK = { expired: 3, soon: 2, ok: 1, unset: 0 };
/** Toate mașinile: documente cu stare, plus starea cea mai gravă pe mașină. */
function buildVehiclesModel(config, hass, now) {
  const n = now || new Date();
  return config.vehicles.map((v, vi) => {
    const docs = v.documents.map((d, di) => ({ ...documentModel(d, config, hass, n), vi, di }));
    const worst = docs.reduce((a, d) => (RANK[d.status] > RANK[a] ? d.status : a), 'ok');
    return { ...v, vi, docs, status: docs.some((d) => d.status !== 'unset') ? worst : 'unset' };
  });
}

/** Ce se apropie sau a expirat (pentru chip și notificări): { vehicle, label, text, status }. */
function dueDocuments(config, hass, now) {
  const out = [];
  for (const v of buildVehiclesModel(config, hass, now)) for (const d of v.docs) if (d.status === 'soon' || d.status === 'expired') out.push({ vehicle: v.name, label: d.label, text: d.text, status: d.status, days: d.days === undefined ? null : d.days, km: d.km === undefined ? null : d.km });
  return out.sort((a, b) => (a.status === b.status ? 0 : a.status === 'expired' ? -1 : 1));
}

/** Chip-ul „termene”: true sau { vehicles, alert_days, label, tap_action }; același format ca cardul. */
function normalizeDeadlines(v) {
  if (!v || typeof v !== 'object') return null;
  const n = normalizeVehicles(v);
  return { ...n, title: '', label: v.label ? String(v.label) : '', tap_action: v.tap_action };
}

function renderVehicles(config, hass, opts = {}) {
  const now = opts.now || new Date();
  const model = buildVehiclesModel(config, hass, now);
  const panels = model.map((v) => {
    const rows = v.docs.map((d) => {
      const ico = iconSvg(d.icon || (d.kind === 'km' ? 'wrench' : 'calendar'));
      const act = d.kind === 'date' ? (d.editable ? 'date' : '') : (d.editable ? 'km' : '');
      const input = act === 'date' ? `<input class="dp" type="date" data-vi="${d.vi}" data-di="${d.di}" aria-label="${esc(d.label)}">` : '';
      const btn = act === 'km' ? `<button type="button" class="now" data-act="km" data-vi="${d.vi}" data-di="${d.di}">${t('Schimbat acum')}</button>` : '';
      return `<div class="vd" data-state="${d.status}" data-vi="${d.vi}" data-di="${d.di}" data-editable="${act ? 1 : 0}"><span class="ccu-ico">${ico}</span><span class="nm">${esc(d.label)}<small>${esc(d.valueText)}</small></span><b>${esc(d.text)}</b>${btn}<span class="bar"><i style="width:${Math.round(d.frac * 100)}%"></i></span>${input}</div>`;
    }).join('');
    return `<div class="vh" data-state="${v.status}"><div class="hd"><span class="ccu-ico">${iconSvg(v.icon.replace(/^mdi:/, '') === 'car' ? 'car' : v.icon)}</span><b>${esc(v.name)}</b>${v.plate ? `<span class="pl">${esc(v.plate)}</span>` : ''}</div>${rows}</div>`;
  }).join('');
  const title = config.title ? `<div class="ccu-title">${esc(config.title)}</div>` : '';
  const notes = opts.warnings && opts.warnings.length ? `<div class="ccu-note">${opts.warnings.slice(0, 3).map(esc).join('<br>')}</div>` : '';
  return `<div class="ccu-card panel ccu-veh">${title}${panels}${notes}</div>`;
}

return { normalizeVehicles, parseDate, daysUntil, documentModel, formatDate, buildVehiclesModel, dueDocuments, normalizeDeadlines, renderVehicles };
})();

__m["editor"] = (() => {
// src/editor.mjs — editorul vizual al cardurilor (fără YAML). Folosește componentele HA (`ha-form`, selectoare de entități, de iconițe).
// Partea pură (conversii de config, detectare automată) e exportată și testată în Node; clasele DOM se creează doar în browser, prin defineEditors().
const { t, setLang } = __m["i18n"];
const { discoverBatteries } = __m["energy"];
// ---------- logică pură ----------
/** Scoate valorile goale (șir gol, listă goală, false, undefined) dintr-un obiect de config. */
function cleanObj(o) {
  const r = {};
  for (const [k, v] of Object.entries(o || {})) {
    if (v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length)) continue;
    r[k] = v;
  }
  return r;
}

/** Un obiect cu doar `entity` devine șir (YAML mai scurt); fără entitate → null (nu se scrie în config). */
function compactSource(o) {
  const c = cleanObj(o);
  if (!c.entity) return null;
  return Object.keys(c).length === 1 ? c.entity : c;
}

const asArr = (v) => (Array.isArray(v) ? v.slice() : v ? [v] : []);

/** Consumator din config → datele formularului (entity = un senzor; entities = suma mai multor; subtract = ce se scade). */
function consumerToForm(c) {
  const o = typeof c === 'string' ? { entity: c } : { ...(c || {}) };
  return { name: o.name || '', icon: o.icon || '', entity: o.entity || '', entities: asArr(o.entities), subtract: asArr(o.subtract) };
}
/** Datele formularului → consumator din config (păstrează câmpurile necunoscute ale originalului, ex. hide_idle). */
function consumerFromForm(f, orig) {
  const base = typeof orig === 'object' && orig ? { ...orig } : {};
  delete base.entity; delete base.entities; delete base.subtract; delete base.name; delete base.icon;
  const sum = asArr(f.entities).filter(Boolean);
  const o = { name: f.name, icon: f.icon, subtract: asArr(f.subtract).filter(Boolean) };
  if (sum.length) o.entities = sum; else o.entity = f.entity;
  return { ...base, ...cleanObj(o) }; // câmpurile necunoscute editorului (ex. hide_idle: false) rămân exact cum erau
}

/** Entitatea principală a unui consumator (pentru a decide dacă rândul e completat). */
const consumerReady = (c) => !!(c && (c.entity || (Array.isArray(c.entities) && c.entities.length)));

/**
 * Ghicește senzorii de energie din HA după unitate (W / kW) și nume. Întoarce doar ce a găsit:
 * { solar, grid, battery, soc, hint: { solar: [..], ... } }. Folosit de butonul „Detectează automat”.
 */
function detectEnergy(states) {
  const list = Object.entries(states || {}).filter(([id]) => id.startsWith('sensor.')).map(([id, s]) => {
    const a = (s && s.attributes) || {};
    return { id, name: String(a.friendly_name || id).toLowerCase(), unit: String(a.unit_of_measurement || ''), dc: a.device_class || '' };
  });
  const isPower = (x) => x.dc === 'power' || /^k?W$/.test(x.unit);
  const isPct = (x) => x.unit === '%' || x.dc === 'battery';
  const key = (x) => (x.id + ' ' + x.name).toLowerCase();
  const pick = (cands, good, bad) => {
    const scored = cands.filter((x) => !(bad && bad.test(key(x)))).map((x) => {
      let sc = 0; const k = key(x);
      for (const [re, w] of good) if (re.test(k)) sc += w;
      return { x, sc };
    }).filter((r) => r.sc > 0).sort((a, b) => b.sc - a.sc || a.x.id.length - b.x.id.length);
    return scored.length ? scored.map((r) => r.x.id) : [];
  };
  const power = list.filter(isPower), pct = list.filter(isPct);
  const solar = pick(power, [[/solar|pv|fotovolt|panou/, 3], [/total/, 1], [/power|putere/, 1]], /today|daily|zilnic|lunar|monthly|import|export|grid|battery|baterie|load|consum|phase|faza/);
  const grid = pick(power, [[/power_meter|contor|smart_meter|grid|re[tț]ea/, 3], [/active/, 1], [/power|putere/, 1]], /solar|pv|battery|baterie|phase|faza|load|consum|today|daily/);
  const battery = pick(power, [[/batter|baterie/, 3], [/power|putere/, 1]], /today|daily|solar|pv|grid|load|charge_|discharge_|limit|max/);
  const soc = pick(pct, [[/batter|baterie|soc/, 3], [/(^|_)soc$/, 2], [/\.(\w+_)?battery$/, 2]], /phone|tablet|ipad|telefon|audi|car|remote|mouse|sensor_battery|soh|health|limit|battery_\d|_pack|_cell/);
  const r = { hint: { solar, grid, battery, soc } };
  if (solar[0]) r.solar = solar[0];
  if (grid[0]) r.grid = grid[0];
  if (battery[0]) r.battery = battery[0];
  if (soc[0]) r.soc = soc[0];
  return r;
}

// ---------- DOM (doar în browser) ----------
const CSS = `
:host { display: block; }
.ed { display: grid; gap: 14px; }
.blk { border: 1px solid var(--divider-color, #444); border-radius: 12px; padding: 12px 14px; background: var(--card-background-color, transparent); }
.blk > h3 { margin: 0 0 8px; font-size: 14px; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.blk > h3 small { font-weight: 400; color: var(--secondary-text-color); }
.hint { color: var(--secondary-text-color); font-size: 12px; margin: 0 0 8px; line-height: 1.4; }
.row { border: 1px solid var(--divider-color, #444); border-radius: 10px; padding: 8px 10px; margin-top: 8px; }
.row .bar { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.row .bar b { flex: 1; font-size: 13px; }
button.mini { border: 1px solid var(--divider-color, #555); background: transparent; color: var(--primary-text-color); border-radius: 8px; min-width: 32px; height: 32px; cursor: pointer; font-size: 14px; }
button.mini:disabled { opacity: .35; cursor: default; }
button.add, button.auto { margin-top: 10px; border: 1px dashed var(--primary-color, #03a9f4); background: transparent; color: var(--primary-color, #03a9f4); border-radius: 10px; padding: 8px 14px; cursor: pointer; font-size: 13px; }
button.auto { margin: 0; border-style: solid; }
details { margin-top: 6px; } summary { cursor: pointer; font-size: 12px; color: var(--secondary-text-color); padding: 4px 0; }
.found { font-size: 12px; color: var(--secondary-text-color); margin-top: 6px; }
`;

/** Încarcă componentele HA folosite de editor (selectoarele de entități / iconițe se încarcă leneș). */
async function ensureHaParts() {
  try {
    if (customElements.get('ha-entity-picker') && customElements.get('ha-icon-picker')) return;
    const helpers = await window.loadCardHelpers?.();
    const c = helpers && await helpers.createCardElement({ type: 'entities', entities: [] });
    if (c && c.constructor && c.constructor.getConfigElement) await c.constructor.getConfigElement();
  } catch (e) { /* editorul merge și fără: câmpurile devin text */ }
}

function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else if (v !== false && v != null) el.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat(Infinity)) if (k != null && k !== false) el.append(k);   // listele din liste (blocuri opționale) se aplatizează complet
  return el;
}

// selectoare uzuale pentru ha-form
const ENT = (o) => ({ entity: { ...(o || {}) } });
const SENSOR = (o) => ({ entity: { domain: 'sensor', ...(o || {}) } });
const TXT = { text: {} };
const ICON = { icon: {} };
const BOOL = { boolean: {} };
const NUM = (min, max, step) => ({ number: { min, max, step: step || 1, mode: 'box' } });
const SEL = (values, multiple) => ({ select: { mode: 'dropdown', multiple: !!multiple, options: values.map((v) => (typeof v === 'string' ? { value: v, label: v } : v)) } });
const ACTION = { ui_action: {} };
const COLORS = ['green', 'yellow', 'orange', 'blue', 'cyan', 'red', 'white'];
const grid = (...fields) => ({ type: 'grid', name: '', schema: fields });
const names = (schema) => schema.flatMap((s) => (s.type === 'grid' ? names(s.schema) : [s.name]));
const isEmpty = (v) => v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length);
const pick = (o, keys) => { const r = {}; for (const k of keys) if (o && o[k] !== undefined) r[k] = o[k]; return r; };

/**
 * Rândurile unei liste din config, pregătite pentru editor. Un rând doar cu `entity` e salvat ca șir (`- switch.x`): fără
 * conversia în obiect, la prima modificare al oricărui rând toate șirurile ar fi scoase din listă (și din config).
 */
function listRows(cur) {
  return (Array.isArray(cur) ? cur : []).filter((x) => x && (typeof x === 'string' || typeof x === 'object')).map((x) => (typeof x === 'string' ? { entity: x } : x));
}

function defineEditors() {
  if (typeof HTMLElement === 'undefined' || typeof customElements === 'undefined') return;

  class CcuEditor extends HTMLElement {
    constructor() { super(); this._cfg = {}; this._hass = null; this._root = this.attachShadow({ mode: 'open' }); this._ready = false; this._rows = {}; this._open = {}; this._last = ''; }
    setConfig(c) {
      const j = JSON.stringify(c || {});
      // HA ne dă înapoi config-ul emis, dar ASINCRON: la o tastare rapidă ecoul primei litere ajunge după a treia. Ignorăm orice config pe care l-am trimis noi
      // (nu doar ultimul), altfel ecoul vechi suprascrie ce ai scris, editorul se redesenează și cursorul se pierde.
      if (j === this._last || (this._sent || []).includes(j)) return;
      this._last = j; this._cfg = JSON.parse(j); this._rows = {}; this._init();
    }
    set hass(hass) { this._hass = hass; setLang(hass); this._root.querySelectorAll('ha-form').forEach((f) => { f.hass = hass; }); }
    get hass() { return this._hass; }
    async _init() { if (!this._ready) { this._ready = true; await ensureHaParts(); } this._draw(); }
    _emit() {
      const j = JSON.stringify(this._cfg);
      if (j === this._last) return;   // nimic nou (un formular poate emite de mai multe ori pe aceeași tastă)
      this._last = j; (this._sent = this._sent || []).push(j); if (this._sent.length > 40) this._sent.shift();
      this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: JSON.parse(j) }, bubbles: true, composed: true }));   // o copie: HA nu poate modifica starea noastră
    }
    _style() { const s = document.createElement('style'); s.textContent = CSS; return s; }
    _friendly(id) { const s = this._hass && this._hass.states && this._hass.states[id]; return (s && s.attributes && s.attributes.friendly_name) || ''; }

    /** Un formular HA: schema + date; `labels` / `helpers` după numele câmpului. Nu redesenează la modificare. */
    _form(schema, data, labels, onChange, helpers) {
      const f = document.createElement('ha-form');
      f.hass = this._hass; f.schema = schema; f.data = data;
      f.computeLabel = (s) => (labels && labels[s.name]) || s.name;
      f.computeHelper = (s) => (helpers && helpers[s.name]) || '';
      // ha-form e „controlat”: dacă nu-i dăm înapoi valoarea nouă, la următoarea actualizare a lui `hass` (HA o trimite des) câmpul revine la valoarea veche și se pierd literele tastate
      f.addEventListener('value-changed', (e) => { e.stopPropagation(); const v = e.detail.value || {}; f.data = v; onChange(v); });
      return f;
    }
    _obj(path, create) { let o = this._cfg; for (const p of path) { if (!o[p] || typeof o[p] !== 'object') { if (!create) return {}; o[p] = {}; } o = o[p]; } return o; }
    /** Scrie (sau șterge, dacă e gol) o cheie din config; `keepFalse` păstrează `false` (opțiuni care sunt implicit „da”). */
    _set(path, key, v, keepFalse) {
      const o = this._obj(path, true);
      if (isEmpty(v) && !(keepFalse && v === false)) delete o[key]; else o[key] = v;
      if (path.length && !Object.keys(o).length) { const parent = this._obj(path.slice(0, -1), true), last = path[path.length - 1]; if (path.length === 1 && (last === 'low_batteries' || last === 'auto' || last === 'deadlines')) parent[last] = true; else delete parent[last]; }
      this._emit();
    }
    /** Bloc cu un formular legat de cheile unui obiect din config (rădăcina sau o sub-cheie, ex. ['sensors']). */
    _fields(path, title, hint, schema, labels, helpers, opts) {
      const o = opts || {}, keys = names(schema), keepFalse = new Set(o.defTrue || []);
      const form = this._form(schema, pick(this._obj(path), keys), labels, (v) => { for (const k of keys) this._set(path, k, v[k], keepFalse.has(k)); }, helpers);
      const body = [hint ? h('p', { class: 'hint', text: hint }) : null, form];
      if (o.collapsed) return h('details', { class: 'blk', open: keys.some((k) => !isEmpty(this._obj(path)[k])) }, h('summary', { text: title }), body);
      return h('div', { class: 'blk' }, title ? h('h3', {}, title) : null, body);
    }
    /** Funcție opțională cu bifă (ex. radiația solară: nu toți au stație meteo). Debifat = cheile dispar din config; bifat = apar câmpurile. */
    _optional(path, title, hint, schema, labels, helpers, defaults) {
      const keys = names(schema), cur = this._obj(path) || {}, id = 'opt/' + path.join('.') + '/' + keys.join(',');
      if (this._open[id] === undefined) this._open[id] = keys.some((k) => !isEmpty(cur[k]));
      const data = { ...(defaults || {}) }; for (const k of keys) { const v = cur[k]; if (v !== undefined) data[k] = v && typeof v === 'object' && !Array.isArray(v) && v.entity ? v.entity : v; }
      const form = this._form(schema, data, labels, (v) => { for (const k of keys) this._set(path, k, v[k]); }, helpers);
      return h('div', { class: 'blk' }, h('h3', {}, this._form([{ name: 'on', selector: BOOL }], { on: this._open[id] }, { on: title }, (v) => {
        this._open[id] = !!v.on;
        if (!v.on) { const o = this._obj(path, true); for (const k of keys) delete o[k]; this._emit(); }
        this._draw();
      })), this._open[id] ? [hint ? h('p', { class: 'hint', text: hint }) : null, form] : null);
    }
    /** Listă repetabilă (rânduri cu ↑ ↓ ✕ și „Adaugă”); rândul gol nu se scrie în config până nu e completat. */
    _listBlock(key, title, hint, max, addLabel, rowLabel, rowBuilder, isReady, path, toConfig) {
      const P = path || [], id = P.join('.') + '/' + key;
      if (!this._rows[id]) { const cur = this._obj(P)[key]; this._rows[id] = listRows(cur); }
      const L = this._rows[id];
      const save = () => {
        const arr = L.filter(isReady).map((x) => (toConfig ? toConfig(x) : x));
        const o = this._obj(P, true);
        if (arr.length) o[key] = arr; else { delete o[key]; if (P.length && !Object.keys(o).length) delete this._obj(P.slice(0, -1), true)[P[P.length - 1]]; }
        this._emit();
      };
      const wrap = h('div', { class: 'blk' }, h('h3', {}, title, h('small', { text: L.length + ' / ' + max })), hint ? h('p', { class: 'hint', text: hint }) : null);
      L.forEach((item, i) => {
        const reset = () => { Object.keys(this._rows).forEach((k) => { if (k.startsWith(key + '.')) delete this._rows[k]; }); };   // listele din interiorul rândurilor se reiau din config
        const move = (d) => () => { const j = i + d; if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; save(); reset(); this._draw(); };
        const del = () => { L.splice(i, 1); save(); reset(); this._draw(); };
        const o = typeof item === 'string' ? { entity: item } : item;
        const label = (o && (o.name || o.label)) || (o && o.entity && this._friendly(o.entity)) || rowLabel + ' ' + (i + 1);
        wrap.append(h('div', { class: 'row' },
          h('div', { class: 'bar' }, h('b', { text: label }),
            h('button', { class: 'mini', type: 'button', 'aria-label': t('Mută în sus'), disabled: i === 0, onclick: move(-1), text: '↑' }),
            h('button', { class: 'mini', type: 'button', 'aria-label': t('Mută în jos'), disabled: i === L.length - 1, onclick: move(1), text: '↓' }),
            h('button', { class: 'mini', type: 'button', 'aria-label': t('Șterge'), onclick: del, text: '✕' })),
          rowBuilder(o, i, (v) => { L[i] = v; save(); })));
      });
      if (L.length < max) wrap.append(h('button', { class: 'add', type: 'button', onclick: () => { L.push({}); this._draw(); }, text: '+ ' + addLabel }));
      return wrap;
    }
    /**
     * Listă de obiecte editate cu formulare declarative. `forms` = [{ schema, labels, helpers, details?: titlu }]; fiecare formular
     * modifică doar cheile lui (restul cheilor rândului, necunoscute editorului, rămân neatinse). Un rând doar cu `entity` devine șir.
     */
    _items(key, o) {
      const forms = o.forms, ready = o.ready || ((x) => !!(x && x.entity));
      const rowBuilder = (item, i, onChange) => [...forms.map((fm) => {
        const ks = names(fm.schema), keep = new Set(fm.defTrue || []);
        const f = this._form(fm.schema, { ...(fm.defaults || {}), ...pick(item, ks) }, fm.labels, (v) => {
          const next = { ...item };
          for (const k of ks) { if (isEmpty(v[k]) && !(keep.has(k) && v[k] === false)) delete next[k]; else next[k] = v[k]; }
          Object.keys(item).forEach((k) => delete item[k]); Object.assign(item, next);
          onChange(item);
        }, fm.helpers);
        if (fm.toggle) {   // grup opțional: o bifă; debifat = cheile dispar din config
          const tid = key + '/' + i + '/' + fm.toggle;
          if (this._open[tid] === undefined) this._open[tid] = ks.some((k) => !isEmpty(item[k]));
          return h('div', { class: 'tg' }, this._form([{ name: 'on', selector: BOOL }], { on: this._open[tid] }, { on: fm.toggle }, (v) => { this._open[tid] = !!v.on; if (!v.on) { ks.forEach((k) => delete item[k]); onChange(item); } this._draw(); }), this._open[tid] ? f : null);
        }
        return fm.details ? h('details', { open: ks.some((k) => !isEmpty(item[k])) }, h('summary', { text: fm.details }), f) : f;
      }), ...(o.extra ? [].concat(o.extra(item, i) || []) : [])];
      return this._listBlock(key, o.title, o.hint, o.max, o.addLabel, o.rowLabel, rowBuilder, ready, o.path, (x) => (o.compact !== false && Object.keys(x).length === 1 && x.entity ? x.entity : x));
    }
    /** Dispozitivele pe baterii găsite în HA, ca opțiuni pentru „Ignoră” (valoarea = entity_id; se pot scrie și cuvinte). */
    _batteryIgnore() {
      const names = (this._cfg.low_batteries && this._cfg.low_batteries.names) || (this._cfg.auto && this._cfg.auto.names) || {};
      const rows = discoverBatteries(this._hass, { mobile: false, unavailable: true, names });
      const options = rows.map((r) => ({ value: r.entity, label: r.name + (r.pct === null ? '' : ' · ' + Math.round(r.pct) + '%') }));
      for (const v of [].concat((this._cfg.low_batteries && this._cfg.low_batteries.exclude) || [], (this._cfg.auto && this._cfg.auto.exclude) || [])) if (v && !options.some((o) => o.value === v)) options.push({ value: v, label: v });
      return { select: { mode: 'dropdown', multiple: true, custom_value: true, options } };
    }
    /** Comutator pentru o funcție opțională a cardului, salvată ca `true` sau ca obiect cu opțiuni (ex. low_batteries, auto). */
    _feature(key, title, hint, onLabel, optionsBuilder) {
      const c = this._cfg, on = !!c[key];
      return h('div', { class: 'blk' },
        h('h3', {}, this._form([{ name: 'on', selector: BOOL }], { on }, { on: onLabel }, (v) => { if (v.on && !c[key]) c[key] = true; else if (!v.on) delete c[key]; this._emit(); this._draw(); })),
        on ? [hint ? h('p', { class: 'hint', text: hint }) : null, optionsBuilder()] : null);
    }
    /** Mașinile și documentele lor (listă în listă): `path` = [] pentru card, ['deadlines'] pentru chip. */
    _vehiclesBlock(path) {
      const P = path || [];
      const docForms = () => [
        { schema: [grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'entity', selector: ENT({ domain: ['input_datetime', 'sensor'] }) }], labels: { label: t('Document'), icon: t('Iconiță'), entity: t('Data de expirare') }, helpers: { entity: t('Un helper „dată” (se poate modifica din card) sau un senzor cu dată, ex. revizia din mașină.') } },
        { details: t('Pentru kilometri (ulei, revizie)'), schema: [{ name: 'odometer', selector: SENSOR() }, { name: 'last_km', selector: ENT({ domain: 'input_number' }) }, { name: 'remaining', selector: SENSOR() }, { name: 'interval_km', selector: NUM(1, 1000000, 100) }],
          labels: { odometer: t('Kilometraj (senzor)'), last_km: t('Kilometri la ultima schimbare (număr)'), remaining: t('sau: kilometri rămași (senzor)'), interval_km: t('Interval (km)') }, helpers: { last_km: t('Cu butonul „Schimbat acum” de pe card primește kilometrajul curent.') } },
      ];
      return this._items('vehicles', { path: P, title: t('Mașini'), hint: t('Fiecare mașină are documentele ei: RCA, ITP, rovinietă, revizie / ulei.'), max: 6, addLabel: t('Adaugă mașină'), rowLabel: t('Mașină'), compact: false, ready: (x) => !!(x && x.name),
        forms: [{ schema: [grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'plate', selector: TXT }], labels: { name: t('Nume'), icon: t('Iconiță'), plate: t('Număr de înmatriculare (opțional)') } }],
        extra: (item, i) => (item && item.name ? this._items('documents', { path: P.concat(['vehicles', String(i)]), title: t('Documente'), hint: '', max: 10, addLabel: t('Adaugă document'), rowLabel: t('Document'), compact: false, ready: (x) => !!(x && (x.entity || x.odometer || x.remaining)), forms: docForms() }) : h('p', { class: 'hint', text: t('Scrie numele mașinii ca să poți adăuga documente.') })) });
    }
    /** Blocul „Aspect și limbă” (preset, limbă), comun tuturor cardurilor. */
    _common() {
      const c = this._cfg, type = String(c.type || '');
      const mv = [{ value: 'auto', label: t('Automat (tabletă: complet, telefon: calm)') }, { value: 'full', label: t('Complet (animații continue)') }, { value: 'calm', label: t('Calm (câteva secunde, apoi static)') }, { value: 'off', label: t('Oprit') }];
      const sw = [{ value: 'auto', label: t('Ca mișcarea cardului') }, { value: 'on', label: t('Mereu pornit') }, { value: 'off', label: t('Oprit') }];
      const fields = [{ name: 'motion', selector: SEL(mv) }];
      const labels = { preset: t('Temă'), language: t('Limbă'), motion: t('Mișcare (economie de baterie)'), weather_effects: t('Efecte vreme (ploaie, nori)'), flow_animation: t('Animația fluxului') };
      const keys = ['preset', 'language', 'motion'];
      if (type.includes('weather')) { fields.push({ name: 'weather_effects', selector: SEL(sw) }); keys.push('weather_effects'); }
      if (type.includes('flow')) { fields.push({ name: 'flow_animation', selector: SEL(sw) }); keys.push('flow_animation'); }
      return h('details', { class: 'blk', open: !!(c.preset || c.language || c.motion) }, h('summary', { text: t('Aspect și limbă') }),
        this._form([grid({ name: 'preset', selector: SEL(['green', 'calm', 'contrast', 'mono', 'warm', 'light']) }, { name: 'language', selector: SEL(['en', 'ro']) }), ...fields], { motion: 'auto', weather_effects: 'auto', flow_animation: 'auto', ...pick(c, keys) },
          labels, (v) => { this._set([], 'preset', v.preset); this._set([], 'language', v.language); for (const k of keys.slice(2)) this._set([], k, v[k] === 'auto' ? '' : v[k]); }));
    }
    _draw() { this._root.replaceChildren(this._style(), h('div', { class: 'ed' }, this._body(), this._common())); }
    _body() { return []; }
  }

  // ======================= flux =======================
  class CcuFlowEditor extends CcuEditor {
    constructor() { super(); this._open = {}; this._found = ''; }
    _body() {
      const c = this._cfg, o = (k) => (typeof c[k] === 'string' ? { entity: c[k] } : { ...(c[k] || {}) });
      for (const k of ['solar', 'grid', 'battery']) if (this._open[k] === undefined) this._open[k] = !!(c[k] && (typeof c[k] === 'string' || c[k].entity));
      const set = (k, patch) => { const v = compactSource({ ...o(k), ...patch }); if (v) c[k] = v; else delete c[k]; this._emit(); };
      const SRC_MORE = [{ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }];
      const LBL = { entity: t('Senzor de putere'), name: t('Nume afișat'), icon: t('Iconiță') };
      const src = (k, title, hint, schema, labels, helpers) => h('div', { class: 'blk' },
        h('h3', {}, this._form([{ name: 'on', selector: BOOL }], { on: this._open[k] }, { on: title }, (v) => { this._open[k] = !!v.on; if (!v.on) { delete c[k]; this._emit(); } this._draw(); })),
        this._open[k] ? [h('p', { class: 'hint', text: hint }), this._form(schema, o(k), labels, (v) => set(k, v), helpers),
          h('details', { open: !!(o(k).name || o(k).icon) }, h('summary', { text: t('Personalizare: nume și iconiță') }), this._form(SRC_MORE, o(k), LBL, (v) => set(k, v)))] : null);
      return [
        h('div', { class: 'blk' },
          h('h3', {}, t('Titlu')),
          this._form([{ name: 'title', selector: TXT }], { title: c.title || '' }, { title: t('Titlu (opțional)') }, (v) => this._set([], 'title', v.title)),
          h('button', { class: 'auto', type: 'button', onclick: () => this._auto() }, t('Detectează automat senzorii')),
          h('div', { class: 'found', text: this._found })),
        src('solar', t('Solar'), t('Alege senzorul care arată puterea instantanee produsă (W sau kW).'), [{ name: 'entity', selector: SENSOR() }], LBL),
        src('grid', t('Rețea'), t('Alege senzorul contorului: puterea de la / către rețea.'), [{ name: 'entity', selector: SENSOR() }, { name: 'invert', selector: BOOL }],
          { ...LBL, invert: t('Contorul arată valori pozitive când exportă') }, { invert: t('Bifează dacă pe contor + înseamnă export în rețea.') }),
        src('battery', t('Baterie'), t('Puterea bateriei și, opțional, nivelul de încărcare.'), [{ name: 'entity', selector: SENSOR() }, { name: 'soc', selector: SENSOR() }, { name: 'invert', selector: BOOL }],
          { ...LBL, soc: t('Nivel încărcare (%)'), invert: t('Bateria arată valori pozitive când se încarcă') }, { invert: t('Implicit + înseamnă descărcare.') }),
        this._optional([], t('Arată energia produsă azi'), t('Rând mic sub titlu, cu iconiță de soare.'), [{ name: 'solar_today', selector: SENSOR() }], { solar_today: t('Senzor energie produsă azi (kWh)') }),
        this._optional([], t('Arată radiația solară'), t('Doar dacă ai o stație meteo sau un senzor de radiație.'), [{ name: 'radiation', selector: SENSOR() }], { radiation: t('Senzor radiație solară (W/m²)') }),
        this._cfg.solar_today || this._cfg.radiation ? this._fields([], '', '', [{ name: 'sun_labels', selector: BOOL }], { sun_labels: t('Arată textul lângă valori („produs azi”, „radiație”)') }, null, { defTrue: ['sun_labels'] }) : null,
        this._listBlock('consumers', t('Consumatori'), t('Ce consumă energia: casă, hală, piscină, mașină electrică…'), 6, t('Adaugă consumator'), t('Consumator'),
          (item, i, onChange) => {
            const f = consumerToForm(item);
            return [
              this._form([grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'entity', selector: SENSOR() }], f,
                { name: t('Nume'), icon: t('Iconiță'), entity: t('Senzor de putere') }, (v) => onChange(consumerFromForm({ ...f, ...v }, item))),
              h('details', { open: f.entities.length > 0 || f.subtract.length > 0 }, h('summary', { text: t('Avansat: sumă de senzori sau scădere') }),
                this._form([{ name: 'entities', selector: SENSOR({ multiple: true }) }, { name: 'subtract', selector: SENSOR({ multiple: true }) }], f,
                  { entities: t('Însumează mai mulți senzori (ex. cele 3 faze)'), subtract: t('Scade din valoare (ex. mașina electrică din hală)') },
                  (v) => onChange(consumerFromForm({ ...f, ...v }, item)))),
            ];
          }, consumerReady),
        this._items('stats', { title: t('Statistici jos'), hint: t('Valori mici sub grafic: import / export zilnic, energie încărcată în baterie…'), max: 4, addLabel: t('Adaugă statistică'), rowLabel: t('Statistică'), compact: false,
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON })], labels: { entity: t('Senzor'), label: t('Etichetă'), icon: t('Iconiță') } }] }),
      ];
    }
    _auto() {
      const found = detectEnergy(this._hass && this._hass.states), c = this._cfg, names2 = [];
      const put = (k, v) => { if (v && !c[k]) { c[k] = v; this._open[k] = true; names2.push(v); } };
      put('solar', found.solar); put('grid', found.grid);
      if (found.battery && !c.battery) { c.battery = found.soc ? { entity: found.battery, soc: found.soc } : found.battery; this._open.battery = true; names2.push(found.battery); }
      this._found = names2.length ? t('Am completat: {n}. Verifică semnele (import / export, încărcare / descărcare) în previzualizare.', { n: names2.join(', ') }) : t('Nu am găsit senzori noi de putere. Alege-i manual mai jos.');
      this._emit(); this._draw();
    }
  }

  // ======================= butoane / chips =======================
  const actionsForm = () => ({ details: t('Acțiuni la atingere'), schema: [{ name: 'tap_action', selector: ACTION }, { name: 'hold_action', selector: ACTION }, { name: 'double_tap_action', selector: ACTION }], labels: { tap_action: t('La atingere'), hold_action: t('La apăsare lungă'), double_tap_action: t('La dublă atingere') } });
  const entityForms = (more) => [
    { schema: [{ name: 'entity', selector: ENT() }, grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON })], labels: { entity: t('Entitate'), name: t('Nume'), icon: t('Iconiță') } },
    ...more,
    { ...actionsForm() },
  ];

  class CcuButtonsEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Card'), '', [{ name: 'title', selector: TXT }, grid({ name: 'columns', selector: NUM(1, 6) }, { name: 'columns_wide', selector: NUM(1, 6) }), grid({ name: 'density', selector: SEL(['xs', 's', 'm', 'l', 'xl']) }, { name: 'panel', selector: BOOL })],
          { title: t('Titlu (opțional)'), columns: t('Coloane (ecran îngust)'), columns_wide: t('Coloane (ecran lat)'), density: t('Mărime implicită'), panel: t('Panou cu chenar') }),
        this._items('entities', { title: t('Butoane'), hint: t('Fiecare buton comandă o entitate: lumină, priză, senzor, climă…'), max: 40, addLabel: t('Adaugă buton'), rowLabel: t('Buton'),
          forms: entityForms([{ schema: [grid({ name: 'size', selector: SEL(['xs', 's', 'm', 'l', 'xl']) }, { name: 'icon_color', selector: SEL(COLORS) }), grid({ name: 'shape', selector: SEL(['chamfer', 'round', 'pill', 'square']) }, { name: 'toggle', selector: BOOL })], labels: { size: t('Mărime'), icon_color: t('Culoarea iconiței'), shape: t('Formă'), toggle: t('Comutator (doar mărimea l)') } }]) }),
      ];
    }
  }
  class CcuChipsEditor extends CcuEditor {
    _body() {
      return [
        this._feature('deadlines', t('Termene mașini'), t('Un chip cât timp un termen (RCA, ITP, rovinietă, ulei) se apropie sau a expirat; arată documentul și termenul, sau numărul.'), t('Arată chip „termene mașini”'), () => [
          this._fields(['deadlines'], '', '', [grid({ name: 'alert_days', selector: NUM(0, 30) }, { name: 'label', selector: TXT }), { name: 'tap_action', selector: ACTION }], { alert_days: t('Alertă cu câte zile înainte'), label: t('Text (opțional)'), tap_action: t('La atingere (ex. deschide pagina Mașini)') }),
          this._vehiclesBlock(['deadlines']),
        ]),
        this._feature('low_batteries', t('Baterii slabe'), t('Un singur chip, doar când există baterii slabe: arată numărul (sau numele, dacă e una) și, la atingere, deschide ce setezi mai jos.'), t('Arată chip „baterii slabe”'), () => [
          this._fields(['low_batteries'], '', '', [grid({ name: 'threshold', selector: NUM(0, 100) }, { name: 'label', selector: TXT }), { name: 'exclude', selector: this._batteryIgnore() }, { name: 'include', selector: ENT({ multiple: true }) }, { name: 'mobile', selector: BOOL }, { name: 'tap_action', selector: ACTION }],
            { threshold: t('Prag baterie slabă (%)'), label: t('Text (opțional)'), exclude: t('Ignoră dispozitivele'), include: t('Adaugă dispozitive'), mobile: t('Exclude telefoanele și tabletele'), tap_action: t('La atingere (ex. deschide lista bateriilor)') }, { exclude: t('Alege din listă un dispozitiv pe care nu-l mai folosești (ex. o periuță stricată) sau scrie un cuvânt din nume și apasă Enter.'), include: t('Senzori adăugați chiar dacă nu sunt găsiți singuri sau sunt ignorați (ex. un senzor de baterie fără tip).') }, { defTrue: ['mobile'] }),
        ]),
        this._fields([], t('Ordine'), t('Chips-urile apar în ordinea în care s-au activat (cel mai vechi primul); când nu mai încap pe un rând, trec pe următorul.'), [{ name: 'sort', selector: BOOL }], { sort: t('Ordonează după momentul activării') }),
        this._items('entities', { title: t('Chips'), hint: t('Etichete mici de stare; pot apărea doar când sunt active.'), max: 40, addLabel: t('Adaugă chip'), rowLabel: t('Chip'),
          forms: entityForms([{ schema: [grid({ name: 'icon_color', selector: SEL(COLORS) }, { name: 'on_as', selector: SEL(['alert']) }), grid({ name: 'show_state', selector: BOOL }, { name: 'hide_off', selector: BOOL })], labels: { icon_color: t('Culoarea iconiței'), on_as: t('Când e pornit arată ca'), show_state: t('Arată valoarea'), hide_off: t('Ascunde când e oprit') } }]) }),
      ];
    }
  }

  // ======================= antet / meniu =======================
  class CcuHeaderEditor extends CcuEditor {
    _body() {
      return [
        this._fields(['header'], t('Antet'), '', [grid({ name: 'icon', selector: ICON }, { name: 'clock', selector: BOOL })], { icon: t('Iconiță'), clock: t('Arată ceasul') }, null, { defTrue: ['clock'] }),
        this._items('values', { path: ['header'], title: t('Valori'), hint: t('Maximum 3 valori în antet.'), max: 3, addLabel: t('Adaugă valoare'), rowLabel: t('Valoare'), compact: false,
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'color', selector: SEL(['accent', 'on', 'ok', 'alert']) }], labels: { entity: t('Senzor'), label: t('Etichetă'), icon: t('Iconiță'), color: t('Culoare') } },
            { toggle: t('Arată autonomia sub valoare (pentru procentul bateriei)'), schema: [{ name: 'runtime_load', selector: SENSOR() }, { name: 'runtime_load_entities', selector: SENSOR({ multiple: true }) }, grid({ name: 'runtime_capacity_entity', selector: SENSOR() }, { name: 'runtime_capacity_kwh', selector: NUM(0, 1000, 0.1) }), { name: 'runtime_grid_present', selector: ENT({ domain: 'binary_sensor' }) }, grid({ name: 'runtime_reserve_pct', selector: NUM(0, 100) }, { name: 'runtime_shutdown_pct', selector: NUM(0, 100) }), { name: 'runtime_power', selector: SENSOR() }, { name: 'runtime_charge_eta', selector: SEL([{ value: 'avg', label: t('Media ultimelor 10 minute') }, { value: 'now', label: t('Puterea de acum') }]) }, { name: 'runtime_while_charging', selector: BOOL }], defaults: { runtime_charge_eta: 'avg' },
              labels: { runtime_charge_eta: t('Calculează „Plin în” după'), runtime_while_charging: t('Arată autonomia și în timpul încărcării'), runtime_load: t('Consum curent (W)'), runtime_load_entities: t('Alți consumatori (se adună la consum)'), runtime_capacity_entity: t('Senzor capacitate'), runtime_capacity_kwh: t('sau capacitate (kWh)'), runtime_grid_present: t('Rețea prezentă (senzor binar)'), runtime_reserve_pct: t('Rezervă (%)'), runtime_shutdown_pct: t('Oprire (%)'), runtime_power: t('Putere baterie (W)') },
              helpers: { runtime_load: t('Completează consumul și apare autonomia sub procent, ca pe cardul de baterie.'), runtime_power: t('+ = descărcare, − = încărcare. Cât timp se încarcă, apare „plin în …”.') } }] }),
        this._fields(['header', 'right'], t('În dreapta (în loc de ceas)'), t('Opțional: o valoare afișată în locul ceasului, ex. temperatura de afară.'), [{ name: 'entity', selector: ENT() }, grid({ name: 'attribute', selector: TXT }, { name: 'label', selector: TXT })], { entity: t('Entitate'), attribute: t('Atribut (opțional)'), label: t('Etichetă') }, null, { collapsed: true }),
      ];
    }
  }
  class CcuNavEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Meniu'), '', [grid({ name: 'sticky', selector: BOOL }, { name: 'compact', selector: BOOL })], { sticky: t('Fixat jos pe ecran'), compact: t('Compact') }),
        this._items('items', { title: t('Butoane meniu'), hint: t('Fiecare buton duce la o pagină (cale completă, ex. /dashboard-casa/camere).'), max: 12, addLabel: t('Adaugă buton'), rowLabel: t('Buton'), compact: false, ready: (x) => !!(x && (x.path || x.path_tablet || x.path_phone || x.back)),
          forms: [{ schema: [grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'path', selector: TXT }, { name: 'device', selector: SEL([{ value: 'all', label: t('Oriunde') }, { value: 'tablet', label: t('Doar pe tabletă') }, { value: 'phone', label: t('Doar pe telefon') }]) }], labels: { label: t('Etichetă'), icon: t('Iconiță'), path: t('Adresa paginii'), device: t('Se vede') }, helpers: { path: t('Începe cu /, ex. /lovelace/0') } },
            { toggle: t('Apăsare lungă: altă pagină'), schema: [{ name: 'hold_path', selector: TXT }, grid({ name: 'hold_path_tablet', selector: TXT }, { name: 'hold_path_phone', selector: TXT })], labels: { hold_path: t('Adresa la apăsare lungă'), hold_path_tablet: t('Pe tabletă'), hold_path_phone: t('Pe telefon') }, helpers: { hold_path: t('Merge pe orice dispozitiv; câmpurile de dedesubt au prioritate pe tabletă / telefon.'), hold_path_phone: t('Ex. pe telefon, apăsat lung pe Home duce la pagina tabletei.') } },
            { toggle: t('Adresă diferită pe tabletă și pe telefon'), schema: [{ name: 'path_tablet', selector: TXT }, { name: 'path_phone', selector: TXT }], labels: { path_tablet: t('Adresa pe tabletă'), path_phone: t('Adresa pe telefon') }, helpers: { path_tablet: t('Ex. Home duce la pagina tabletei.'), path_phone: t('Ex. Home duce la pagina telefonului.') } },
            { details: t('Insignă cu număr'), schema: [{ name: 'badge', selector: ENT({ multiple: true }) }, { name: 'badge_style', selector: SEL(['light']) }], labels: { badge: t('Entități numărate'), badge_style: t('Aspect insignă') }, helpers: { badge: t('Numără entitățile pornite; un senzor numeric adaugă valoarea lui (ex. „becuri aprinse”).'), badge_style: t('„light” = galben, pentru lumini; implicit roșu (alertă).') } }] }),
      ];
    }
  }

  // ======================= grafic / baterii / oameni =======================
  const RANGES = ['6h', '12h', '24h', '7d', '30d'];
  class CcuGraphEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Grafic'), '', [{ name: 'title', selector: TXT }, grid({ name: 'range', selector: SEL(RANGES) }, { name: 'tabs', selector: SEL(RANGES, true) }), grid({ name: 'y_axis', selector: SEL(['left', 'right']) }, { name: 'height', selector: NUM(60, 400, 10) }), { name: 'compact', selector: BOOL }, { name: 'timeline', selector: BOOL }, { name: 'hide_durations', selector: BOOL }, { name: 'tap_action', selector: ACTION }],
          { timeline: t('Cronologie: un rând pe serie (pornit / oprit)'), hide_durations: t('Cronologie: ascunde durata de pe bare și totalul pe rând'), tap_action: t('La atingere (ex. deschide pagina graficului)'), title: t('Titlu (opțional)'), range: t('Interval'), tabs: t('File pentru schimbarea intervalului'), y_axis: t('Axa Y'), height: t('Înălțime (px)'), compact: t('Compact') }),
        this._items('series', { title: t('Serii'), hint: this._cfg.timeline ? t('Până la 8 rânduri, unul pe serie.') : t('Între 1 și 3 linii pe grafic.'), max: this._cfg.timeline ? 8 : 3, addLabel: t('Adaugă serie'), rowLabel: t('Serie'), compact: false,
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, grid({ name: 'name', selector: TXT }, { name: 'color', selector: SEL(['accent', 'yellow', 'green', 'blue', 'orange', 'red', 'cyan']) }), { name: 'kind', selector: SEL(['area', 'line']) }], labels: { entity: t('Senzor'), name: t('Nume'), color: t('Culoare'), kind: t('Tip') } }] }),
      ];
    }
  }
  class CcuBatteryEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Baterie'), t('Nivelul de încărcare și, opțional, capacitatea și consumul pentru autonomie.'), [
          { name: 'soc', selector: SENSOR() }, { name: 'load', selector: SENSOR() }, grid({ name: 'capacity_entity', selector: SENSOR() }, { name: 'capacity_kwh', selector: NUM(0, 1000, 0.1) }), { name: 'grid_present', selector: ENT({ domain: 'binary_sensor' }) },
          grid({ name: 'reserve_pct', selector: NUM(0, 100) }, { name: 'shutdown_pct', selector: NUM(0, 100) }), grid({ name: 'color', selector: SEL(['yellow', 'green', 'blue', 'orange']) }, { name: 'show_title', selector: BOOL })],
          { soc: t('Nivel încărcare (%)'), load: t('Consum curent (W)'), capacity_entity: t('Senzor capacitate'), capacity_kwh: t('sau capacitate (kWh)'), grid_present: t('Rețea prezentă (senzor binar)'), reserve_pct: t('Rezervă (%)'), shutdown_pct: t('Oprire (%)'), color: t('Culoare'), show_title: t('Arată titlul') },
          { grid_present: t('Când e oprit, cardul arată „Backup activ”.') }, { defTrue: ['show_title'] }),
        this._optional([], t('Consum din mai multe circuite'), t('Dacă bateria alimentează mai multe circuite, adaugă-le aici: autonomia se calculează la suma lor.'), [{ name: 'load_entities', selector: SENSOR({ multiple: true }) }], { load_entities: t('Alți consumatori (se adună la consum)') }),
        this._optional([], t('Arată „Plin în” cât se încarcă'), t('+ = descărcare, − = încărcare.'), [{ name: 'power', selector: SENSOR() }, { name: 'power_invert', selector: BOOL }, { name: 'charge_eta', selector: SEL([{ value: 'avg', label: t('Media ultimelor 10 minute') }, { value: 'now', label: t('Puterea de acum') }]) }, { name: 'runtime_while_charging', selector: BOOL }],
          { power: t('Putere baterie (W)'), power_invert: t('Inversează semnul puterii'), charge_eta: t('Calculează „Plin în” după'), runtime_while_charging: t('Arată autonomia și în timpul încărcării') },
          { charge_eta: t('Media nu sare când trece un nor; citește istoricul din HA.') }, { charge_eta: 'avg' }),
      ];
    }
  }
  class CcuBatteriesEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Baterii dispozitive'), '', [{ name: 'title', selector: TXT }, grid({ name: 'warn_pct', selector: NUM(0, 100) }, { name: 'low_pct', selector: NUM(0, 100) }), { name: 'sort', selector: SEL(['asc', 'none']) }],
          { title: t('Titlu (opțional)'), warn_pct: t('Avertisment sub (%)'), low_pct: t('Critic sub (%)'), sort: t('Ordine') }),
        this._feature('auto', t('Găsește singur bateriile'), t('Caută în Home Assistant toate dispozitivele cu baterie (senzori „battery”), fără telefoane și tablete.'), t('Descoperire automată'), () => [
          this._fields(['auto'], '', '', [{ name: 'threshold', selector: NUM(0, 100) }, { name: 'exclude', selector: this._batteryIgnore() }, { name: 'include', selector: ENT({ multiple: true }) }, { name: 'mobile', selector: BOOL }],
            { threshold: t('Prag baterie slabă (%)'), exclude: t('Ignoră dispozitivele'), include: t('Adaugă dispozitive'), mobile: t('Exclude telefoanele și tabletele') }, { exclude: t('Alege din listă un dispozitiv pe care nu-l mai folosești (ex. o periuță stricată) sau scrie un cuvânt din nume și apasă Enter.'), include: t('Senzori adăugați chiar dacă nu sunt găsiți singuri sau sunt ignorați (ex. un senzor de baterie fără tip).') }, { defTrue: ['mobile'] }),
          this._fields([], '', '', [{ name: 'only_low', selector: BOOL }], { only_low: t('Arată doar bateriile slabe') }),
        ]),
        this._items('entities', { title: t('Dispozitive'), hint: t('Senzori de nivel baterie: telefoane, tablete, mașină…'), max: 30, addLabel: t('Adaugă dispozitiv'), rowLabel: t('Dispozitiv'),
          forms: [{ schema: [{ name: 'entity', selector: SENSOR() }, { name: 'name', selector: TXT }], labels: { entity: t('Senzor'), name: t('Nume') } }] }),
      ];
    }
  }
  class CcuPeopleEditor extends CcuEditor {
    _body() {
      return [this._fields([], t('Persoane'), '', [{ name: 'people', selector: ENT({ domain: 'person', multiple: true }) }, { name: 'layout', selector: SEL(['family']) }, { name: 'title', selector: TXT }],
        { people: t('Persoane'), layout: t('Aspect'), title: t('Titlu (opțional)') }, { layout: t('„family” = avatare mari cu nume și stare.') })];
    }
  }

  // ======================= vreme =======================
  const WX = ['temperature', 'feels_like', 'humidity', 'wind_speed', 'wind_gust', 'wind_direction', 'rain_rate', 'rain_today', 'rain_state', 'pressure', 'uv', 'radiation'];
  class CcuWeatherEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Vreme'), '', [{ name: 'title', selector: TXT }, { name: 'weather', selector: ENT({ domain: 'weather' }) }, grid({ name: 'days', selector: NUM(1, 7) }, { name: 'tiles', selector: SEL(['humidity', 'wind', 'rain', 'pressure', 'uv', 'radiation'], true) })],
          { title: t('Titlu (opțional)'), weather: t('Entitatea de prognoză'), days: t('Zile de prognoză'), tiles: t('Plăcuțe afișate') }, { weather: t('Pentru prognoză și pentru cerul din scenă.') }),
        this._fields(['sensors'], t('Senzorii stației tale'), t('Opțional: valorile curente vin din senzorii tăi, nu din prognoză.'),
          WX.map((k) => ({ name: k, selector: ENT({ domain: ['sensor', 'binary_sensor'] }) })),
          { temperature: t('Temperatură'), feels_like: t('Se simte ca'), humidity: t('Umiditate'), wind_speed: t('Viteza vântului'), wind_gust: t('Rafale'), wind_direction: t('Direcția vântului'), rain_rate: t('Intensitatea ploii'), rain_today: t('Ploaie azi'), rain_state: t('Plouă acum'), pressure: t('Presiune'), uv: t('Index UV'), radiation: t('Radiație solară') }, null, { collapsed: true }),
      ];
    }
  }

  // ======================= titlu / controale / telecomandă =======================
  class CcuTitleEditor extends CcuEditor {
    _body() { return [this._fields([], t('Titlu'), '', [{ name: 'title', selector: TXT }, { name: 'subtitle', selector: TXT }, { name: 'icon', selector: ICON }], { title: t('Titlu'), subtitle: t('Subtitlu'), icon: t('Iconiță') })]; }
  }
  const CTL_DOMAINS = ['climate', 'light', 'fan', 'media_player', 'number', 'input_number', 'select', 'input_select'];
  class CcuControlsEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Controale'), '', [{ name: 'title', selector: TXT }, { name: 'columns', selector: NUM(1, 3) }], { title: t('Titlu (opțional)'), columns: t('Coloane') }),
        this._items('items', { title: t('Controale'), hint: t('Termostat / A/C, lumini cu luminozitate, ventilator, media player, număr, selector. Tipul se alege singur după entitate.'), max: 12, addLabel: t('Adaugă control'), rowLabel: t('Control'),
          forms: [{ schema: [{ name: 'entity', selector: ENT({ domain: CTL_DOMAINS }) }, grid({ name: 'name', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'style', selector: SEL(['simple']) }], labels: { entity: t('Entitate'), name: t('Nume'), icon: t('Iconiță'), style: t('Variantă') }, helpers: { style: t('„simple” = varianta compactă (A/C).') } }] }),
      ];
    }
  }
  class CcuRemoteEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Telecomandă'), '', [{ name: 'entity', selector: ENT({ domain: 'remote' }) }, { name: 'dpad', selector: BOOL }], { entity: t('Entitatea telecomenzii'), dpad: t('Arată crucea cu OK') }, null, { defTrue: ['dpad'] }),
        this._items('extra', { title: t('Taste proprii'), hint: t('Ex. Netflix, YouTube: trimit o comandă a telecomenzii.'), max: 8, addLabel: t('Adaugă tastă'), rowLabel: t('Tastă'), compact: false, ready: (x) => !!(x && x.command),
          forms: [{ schema: [grid({ name: 'label', selector: TXT }, { name: 'icon', selector: ICON }), { name: 'command', selector: TXT }], labels: { label: t('Etichetă'), icon: t('Iconiță'), command: t('Comandă') }, helpers: { command: t('Ex. KEY_11 sau numele din integrarea ta.') } }] }),
      ];
    }
  }

  class CcuRadioEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Radio'), t('Alege selectorul cu posturile; restul e opțional.'), [
          { name: 'title', selector: TXT }, { name: 'stations', selector: ENT({ domain: ['select', 'input_select'] }) }, { name: 'player', selector: ENT({ domain: 'media_player' }) }, { name: 'speakers', selector: ENT({ domain: 'media_player', multiple: true }) },
          { name: 'playing', selector: ENT({ domain: ['input_boolean', 'switch', 'binary_sensor', 'media_player'] }) }],
          { title: t('Titlu (opțional)'), stations: t('Selectorul cu posturile'), player: t('Boxa principală'), speakers: t('Boxe între care alegi'), playing: t('Senzor „se redă”') },
          { stations: t('Un select sau input_select ale cărui opțiuni sunt posturile.'), player: t('Boxa implicită; pentru volum și pentru a vedea dacă răspunde.'), speakers: t('Dacă sunt mai multe, apar butoane pentru a alege pe care boxă cântă.'), playing: t('Dacă lipsește, se folosește starea playerului.') }),
        this._fields([], t('Pornire și oprire'), t('Un script sau un buton care pornește / oprește radioul. Fără ele se folosește playerul.'), [
          { name: 'play', selector: ENT({ domain: ['script', 'button', 'input_button', 'scene'] }) }, { name: 'stop', selector: ENT({ domain: ['script', 'button', 'input_button', 'scene'] }) }],
          { play: t('Script de pornire'), stop: t('Script de oprire') }),
        this._fields([], t('Posturi'), '', [{ name: 'hide', selector: { select: { mode: 'dropdown', multiple: true, custom_value: true, options: [] } } }],
          { hide: t('Ascunde posturile care conțin') }, { hide: t('Scrie un cuvânt și apasă Enter, ex. Personalizat.') }, { collapsed: true }),
      ];
    }
  }

  class CcuVehicleEditor extends CcuEditor {
    _body() {
      return [
        this._fields([], t('Mașini'), '', [{ name: 'title', selector: TXT }, grid({ name: 'alert_days', selector: NUM(0, 30) }, { name: 'alert_km', selector: NUM(0, 5000, 50) })],
          { title: t('Titlu (opțional)'), alert_days: t('Alertă cu câte zile înainte'), alert_km: t('Alertă la câți km rămași') }, { alert_days: t('Termenul devine portocaliu (și apare în chip) cu atâtea zile înainte.') }),
        this._vehiclesBlock([]),
      ];
    }
  }

  const defs = { 'ccu-flow-editor': CcuFlowEditor, 'ccu-buttons-editor': CcuButtonsEditor, 'ccu-chips-editor': CcuChipsEditor, 'ccu-header-editor': CcuHeaderEditor, 'ccu-nav-editor': CcuNavEditor, 'ccu-graph-editor': CcuGraphEditor,
    'ccu-battery-editor': CcuBatteryEditor, 'ccu-batteries-editor': CcuBatteriesEditor, 'ccu-people-editor': CcuPeopleEditor, 'ccu-weather-editor': CcuWeatherEditor, 'ccu-title-editor': CcuTitleEditor, 'ccu-controls-editor': CcuControlsEditor, 'ccu-remote-editor': CcuRemoteEditor, 'ccu-radio-editor': CcuRadioEditor, 'ccu-vehicle-editor': CcuVehicleEditor };
  for (const [tag, cls] of Object.entries(defs)) if (!customElements.get(tag)) customElements.define(tag, cls);
}

return { cleanObj, compactSource, consumerToForm, consumerFromForm, consumerReady, detectEnergy, listRows, defineEditors };
})();

__m["cards"] = (() => {
// src/cards.mjs — web components: ccu-buttons-card, ccu-chips-card, ccu-header-card.
// Regulile din PROMPT: DOM actualizat pe loc (patchNodes), randare doar când s-a schimbat o entitate folosită, ≥ 1 s între randări,
// un singur interval pentru ceas (curățat la disconnect), gesturi pe pointer events, fără rețea.
const { CCU_THEME } = __m["theme"];
const { setLang, t } = __m["i18n"];
const { normalizeConfig, resolveMotion, deviceKind } = __m["config"];
const { runAction, toggleEntity } = __m["actions"];
const { attachGestures } = __m["gestures"];
const { defineEditors, detectEnergy } = __m["editor"];
const { normalizeRadio, radioModel, renderRadio, stationUrl } = __m["radio"];
const { normalizeVehicles, buildVehiclesModel, renderVehicles, normalizeDeadlines, dueDocuments, parseDate } = __m["vehicles"];
const { applyPreset } = __m["presets"];
const { normalizeGraphConfig, buildGraphModel, renderGraphCard, nearestPoint, rangeHours, thin, formatValue, timelineHit } = __m["graph-card"];
const { parseMinimalResponse, formatTimeLabel, discreteValue } = __m["graph-data"];
const { normalizeWeatherConfig, buildWeatherModel, renderWeather } = __m["weather"];
const { normalizeFlowConfig, buildFlowModel, renderFlow, normalizeBatteryConfig, buildBatteryModel, headerRuntimeTexts, fetchAveragePower, renderBattery, normalizeBatteriesConfig, buildBatteriesModel, renderBatteries, discoverBatteries, normalizeLowBatteries, lowBatteryModel } = __m["energy"];
const { normalizeControls, controlModel, renderControls, sliderValue, normalizeTitle, renderTitle, normalizeRemote, renderRemote } = __m["controls"];
const { formatNumber } = __m["state"];
const { normalizeWaste, renderButtons, renderChips, renderHeader, renderNav, navPath, holdTarget, renderPeople, normalizePeople, normalizeHeader, normalizeNav, sparkPath, patchNodes, defaultTap } = __m["render"];
const MIN_RENDER_MS = 1000;
const CLOCK_MS = 30000;
const ROW_UNITS = { xs: 0.7, s: 1.5, m: 1.7, l: 1.4, xl: 2.6 };

function asAction(a, fallback) {
  if (a === undefined || a === null) return fallback;
  return typeof a === 'string' ? { action: a } : a;
}

class CcuBase extends HTMLElement {
  constructor() {
    super();
    this._root = this.attachShadow({ mode: 'open' });
    this._root.innerHTML = `<style>${CCU_THEME}</style><div class="ccu-mount"></div>`;
    this._mount = this._root.querySelector('.ccu-mount');
    this._config = null; this._hass = null; this._warnings = [];
    this._lastRefs = null; this._lastDraw = 0; this._timer = null; this._unbind = []; this._clock = null;
  }

  // --- de suprascris ---
  _build(cfg) { return normalizeConfig(cfg); }      // → {config, warnings}
  // entitățile care declanșează o redesenare; incluse: membrii `group` și membrii grupurilor cu `count` (ex. lumini aprinse)
  _entityIds() {
    const o = [];
    for (const e of this._config.entities || []) {
      o.push(e.entity);
      if (Array.isArray(e.group)) o.push(...e.group);
      if (e.count === true && this._hass) { const a = this._hass.states && this._hass.states[e.entity] && this._hass.states[e.entity].attributes; if (a && Array.isArray(a.entity_id)) o.push(...a.entity_id); }
    }
    return o;
  }
  _html(now) { return ''; }
  _hasClock() { return false; }

  // limba: `language:` din card, altfel a lui HA (hass.locale.language), altfel atributul lang al paginii, altfel engleza
  _lang() { return (this._config && this._config.language) || (this._hass && ((this._hass.locale && this._hass.locale.language) || this._hass.language)) || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'en'; }

  /** Mișcarea: data-anim (icoane), data-fx (vreme), data-flow (fluxul) = „calm” | „off”; lipsa atributului = animații continue. Telefon (latura mică a ecranului < 600 px) → calm, dacă nu e setat altfel. */
  _applyMotion(cfg) {
    const m = resolveMotion(cfg || {}, deviceKind(cfg && cfg.device) === 'phone');
    for (const [attr, v] of [['data-anim', m.anim], ['data-fx', m.fx], ['data-flow', m.flow]]) { if (v === 'full') this.removeAttribute(attr); else this.setAttribute(attr, v); }
  }

  setConfig(cfg) {
    setLang((cfg && cfg.language) || (typeof document !== 'undefined' && document.documentElement && document.documentElement.lang) || 'en');
    const { config, warnings } = this._build(cfg);
    if (cfg && cfg.language && config) config.language = String(cfg.language);   // limba aleasă în card (altfel: a lui HA)
    if (!config.entities.length && !this._allowEmpty) throw new Error('The configuration has no valid entity (entities).');
    this._config = config; this._warnings = warnings;
    applyPreset(this, config.preset, config.colors);
    this._applyMotion(cfg);
    this._lastRefs = null;
    this._draw(true);
  }

  set hass(h) {
    this._hass = h;
    if (!this._config) return;
    const refs = this._entityIds().map((id) => h?.states?.[id]);
    const changed = !this._lastRefs || refs.length !== this._lastRefs.length || refs.some((r, i) => r !== this._lastRefs[i]);
    if (!changed) return;
    this._lastRefs = refs;
    this._schedule();
  }
  get hass() { return this._hass; }
  // HA setează `preview` în editorul de carduri și în modul de editare al dashboardului
  set preview(v) { v = !!v; if (v === this._preview) return; this._preview = v; if (this._config) this._draw(true); }
  get preview() { return !!this._preview; }

  _schedule() {
    const wait = MIN_RENDER_MS - (Date.now() - this._lastDraw);
    if (wait <= 0) { this._draw(false); return; }
    if (this._timer) return;
    this._timer = setTimeout(() => { this._timer = null; this._draw(false); }, wait);
  }

  _draw(force) {
    if (!this._config) return;
    this._lastDraw = Date.now();
    setLang(this._lang());
    const html = this._html(new Date());
    if (!force && html === this._lastHtml) return;
    this._lastHtml = html;
    let patched = false;
    if (!force && this._mount.firstElementChild) {
      try { const tpl = document.createElement('template'); tpl.innerHTML = html; patched = patchNodes(this._mount, tpl.content); } catch (e) { patched = false; }
    }
    if (!patched) { this._mount.innerHTML = html; this._bind(); }
  }

  // --- gesturi: legate doar după o înlocuire completă; la patch elementele rămân cu ascultătorii lor ---
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    this._mount.querySelectorAll('[data-id]').forEach((el) => {
      const idx = el.getAttribute('data-id');
      const act = (kind) => () => this._fire(idx, kind, el);
      // double_tap se leagă DOAR dacă e configurat: altfel fiecare atingere ar aștepta 300 ms să vadă dacă urmează a doua
      const detach = attachGestures(el, { tap: act('tap'), hold: act('hold'), double_tap: this._actionFor(idx, 'double_tap') ? act('double_tap') : undefined }, null);
      const noMenu = (e) => e.preventDefault();
      const key = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this._fire(idx, 'tap', el); } };
      el.addEventListener('contextmenu', noMenu); el.addEventListener('keydown', key);
      this._unbind.push(detach, () => { el.removeEventListener('contextmenu', noMenu); el.removeEventListener('keydown', key); });
    });
  }

  // acțiunea se caută în config LA MOMENTUL atingerii (nu la legare): rămâne corectă după orice patch
  _actionFor(idx, kind) {
    const c = this._config, e = (c.entities || [])[Number(idx)];
    if (!e) return null;
    const own = asAction(e[kind + '_action']);
    if (own) return { ...(typeof own === 'object' ? own : {}), entity: own.entity ?? e.entity };
    if (kind === 'tap') return { action: defaultTap(e.entity), entity: e.entity };
    if (kind === 'hold') return { action: 'more-info', entity: e.entity };
    return null;
  }
  _fire(idx, kind, el) {
    const a = this._actionFor(idx, kind);
    if (a) { runAction(this._hass, el, a); if (kind === 'tap') setTimeout(() => this._draw(false), 300); }
  }

  connectedCallback() {
    if (this._hasClock() && !this._clock) this._clock = setInterval(() => this._draw(false), CLOCK_MS);
    // la reconectare (ex. HA readuce view-ul după „înapoi”) ascultătorii au fost scoși la disconnect: redesenare FORȚATĂ, ca să se lege din nou (altfel nimic nu mai răspunde la atingere)
    if (this._config) this._draw(true);
  }
  disconnectedCallback() {
    if (this._clock) { clearInterval(this._clock); this._clock = null; }
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this._unbind.forEach((f) => f()); this._unbind = [];
  }
}

// ---------- carduri ----------
class CcuButtonsCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-buttons-editor'); }
  _sparks = {}; _sparkTimer = null; _sparkBusy = false;
  _html() { return renderButtons(this._config, this._hass, { warnings: this._warnings, sparks: this._sparks }); }
  // mini-grafic (sparkline) din istoricul HA, pentru butoanele cu `spark:`; reîmprospătat la 5 minute, doar când cardul e conectat
  async _loadSparks() {
    if (this._sparkBusy || !this._hass?.callWS || !this._config) return;
    const wanted = (this._config.entities || []).filter((e) => e.spark && e.size !== 's').map((e) => ({ id: e.spark.entity || e.entity, hours: Math.min(48, Math.max(1, Number(e.spark.hours) || 6)) }));
    if (!wanted.length) return;
    this._sparkBusy = true;
    try {
      for (const w of wanted) {
        const end = new Date(), start = new Date(end.getTime() - w.hours * 3600e3);
        const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: [w.id], minimal_response: true, no_attributes: true, significant_changes_only: false });
        const rows = (res && res[w.id]) || [];
        this._sparks[w.id] = sparkPath(rows.map((r) => r.s));
      }
      this._draw(false);
    } catch (e) { /* fără istoric: graficul mic rămâne gol */ }
    this._sparkBusy = false;
  }
  set hass(h) { super.hass = h; if (!this._sparkLoaded && h?.callWS) { this._sparkLoaded = true; this._loadSparks(); } }
  get hass() { return this._hass; }
  connectedCallback() { super.connectedCallback(); if (!this._sparkTimer) this._sparkTimer = setInterval(() => this._loadSparks(), 300000); }
  disconnectedCallback() { super.disconnectedCallback(); if (this._sparkTimer) { clearInterval(this._sparkTimer); this._sparkTimer = null; } }
  getCardSize() {
    const c = this._config || {}, cols = Number(c.columns) || 2, n = (c.entities || []).length || 1;
    const u = Math.max(...(c.entities || [{}]).map((e) => ROW_UNITS[e.size] || ROW_UNITS.m));
    return Math.max(1, Math.ceil(Math.ceil(n / cols) * u));
  }
  getGridOptions() { return { columns: 12, min_columns: 3, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((i) => /^(light|switch|fan)\./.test(i)).slice(0, 4);
    return { entities: ids.length ? ids : ['light.exemplu'], columns: 2 };
  }
}

class CcuChipsCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-chips-editor'); }
  _build(cfg) {
    const waste = normalizeWaste(cfg && cfg.waste);
    const low = normalizeLowBatteries(cfg && cfg.low_batteries);
    const dl = normalizeDeadlines(cfg && cfg.deadlines);
    this._allowEmpty = !!waste || !!low || !!dl;
    const r = normalizeConfig(cfg);
    r.config.waste = waste;
    r.config.low_batteries = low;
    r.config.deadlines = dl;
    if (waste || low || dl) r.warnings = r.warnings.filter((w) => !/entit/i.test(w));
    return r;
  }
  _html() { return renderChips(this._config, this._hass, { preview: this._preview, warnings: this._warnings, events: this._events, now: new Date(), lowBat: lowBatteryModel(this._config.low_batteries, this._hass), due: this._config.deadlines ? dueDocuments(this._config.deadlines, this._hass, new Date()) : null }); }
  _hasClock() { return !!(this._config && this._config.deadlines); }   // la miezul nopții „zilele rămase” se schimbă
  // chips-ul „baterii slabe” depinde de toate bateriile din HA: lista lor se reface cel mult o dată la 30 s
  _entityIds() {
    let base = super._entityIds();
    const dl = this._config && this._config.deadlines;
    if (dl) base = base.concat(vehicleEntityIds(dl));
    if (!this._config || !this._config.low_batteries || !this._hass) return base;
    if (!this._batIds || Date.now() - this._batAt > 30000) { this._batAt = Date.now(); this._batIds = discoverBatteries(this._hass, { ...this._config.low_batteries, unavailable: true }).map((r) => r.entity); }
    return base.concat(this._batIds);
  }
  _lowAction(kind) {
    const lb = this._config && this._config.low_batteries; if (!lb) return null;
    const own = asAction(lb[kind + '_action']);
    if (own) return { ...own, entity: own.entity };
    const m = lowBatteryModel(lb, this._hass);
    return kind === 'tap' && m && m.low[0] ? { action: 'more-info', entity: m.low[0].entity } : null;
  }
  _bind() {
    super._bind();
    if (this._batDeleg) return;
    this._batDeleg = true;
    const fire = (e) => {
      const el = e.target && e.target.closest ? e.target.closest('[data-bat],[data-due]') : null; if (!el) return;
      if (el.hasAttribute('data-due')) { const dl = this._config.deadlines, ta = dl && asAction(dl.tap_action); if (ta) runAction(this._hass, el, ta); return; }
      const a = this._lowAction('tap'); if (a) runAction(this._hass, el, a);
    };
    this._mount.addEventListener('click', fire);
    this._mount.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target && e.target.closest && e.target.closest('[data-bat],[data-due]')) { e.preventDefault(); fire(e); } });
  }
  set hass(h) { this._hass = h; super.hass = h; this._loadWaste(); }
  get hass() { return this._hass; }
  // evenimentele din calendarul de colectare (azi + următoarele zile), reîncărcate din 30 în 30 de minute
  async _loadWaste() {
    const w = this._config && this._config.waste;
    if (!w || !this._hass || !this._hass.callWS || this._wBusy || (this._evAt && Date.now() - this._evAt < 30 * 60e3)) return;
    this._wBusy = true;
    try {
      const s = new Date(); s.setHours(0, 0, 0, 0);
      const e = new Date(s.getTime() + (w.next_days + 2) * 864e5);
      const res = await this._hass.callWS({ type: 'call_service', domain: 'calendar', service: 'get_events', service_data: { start_date_time: s.toISOString(), end_date_time: e.toISOString() }, target: { entity_id: w.calendar }, return_response: true });
      const list = res && (res.response || res)[w.calendar];
      this._events = list && Array.isArray(list.events) ? list.events : [];
      this._evAt = Date.now();
      this._draw(false);
    } catch (err) { this._evAt = Date.now() - 25 * 60e3; /* reîncearcă peste 5 min */ } finally { this._wBusy = false; }
  }
  setConfig(cfg) { this._events = undefined; this._evAt = 0; super.setConfig(cfg); this._loadWaste(); }
  // dacă toate chips-urile au hide_off și niciunul nu e „on”: cardul dispare (display:none + eveniment pentru Home Assistant), fără rând gol
  _draw(force) {
    super._draw(force);
    if (!this._config) return;
    const hides = (this._config.entities || []).some((e) => e.hide_off === true || e.show_if) || !!this._config.waste;
    this._setVisible(!hides || !!this._mount.querySelector('.ccu-chip'));
  }
  connectedCallback() {
    super.connectedCallback();
    // setConfig rulează înainte de atașare: la conectare repetăm starea, ca wrapper-ul din HA să se ascundă și la prima încărcare
    if (this._vis !== undefined) this.dispatchEvent(new CustomEvent('card-visibility-changed', { detail: { value: this._vis }, bubbles: true, composed: true }));
  }
  _setVisible(v) {
    if (v === this._vis) return;
    this._vis = v;
    this.style.display = v ? '' : 'none';
    this.dispatchEvent(new CustomEvent('card-visibility-changed', { detail: { value: v }, bubbles: true, composed: true }));
  }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((i) => /^(light|lock|binary_sensor)\./.test(i)).slice(0, 4);
    return { entities: ids.length ? ids : ['light.exemplu'] };
  }
}

class CcuGraphCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-graph-editor'); }
  _allowEmpty = false;
  constructor() {
    super();
    this._range = null; this._cache = new Map(); this._loading = false; this._refreshTimer = null; this._lastW = 0; this._model = null;
    // file (tabs): delegare pe containerul care nu se înlocuiește niciodată
    // atingere (nu glisare pentru a vedea valorile) pe grafic → acțiunea `tap_action`, ex. deschide view-ul graficului
    this._mount.addEventListener('pointerdown', (e) => { this._down = { x: e.clientX, y: e.clientY }; });
    this._mount.addEventListener('click', (e) => {
      const tb = e.target && e.target.closest ? e.target.closest('[data-tab]') : null;
      if (!tb && this._tap && this._tap.action && this._tap.action !== 'none') {
        const d = this._down; this._down = null;
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) > 10) return;   // glisare (citire valori), nu atingere
        runAction(this._hass, this._mount, { ...this._tap, entity: this._tap.entity || (this._config.series[0] && this._config.series[0].entity) });
        return;
      }
    });
    this._mount.addEventListener('click', (e) => {
      const b = e.target && e.target.closest ? e.target.closest('[data-tab]') : null;
      if (!b) return;
      const t = (this._config.tabs || [])[Number(b.getAttribute('data-tab'))];
      if (t !== undefined) { this._range = t; this._load(false); this._draw(false); }
    });
  }
  _build(cfg) {
    const g = normalizeGraphConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: g.config.series.map((s) => s.entity) });
    const config = { ...base.config, ...g.config, entities: g.config.series };
    return { config, warnings: g.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  setConfig(cfg) {
    super.setConfig(cfg); this._range = this._config.range; this._cache.clear(); this._load(false);
    const ta = cfg && cfg.tap_action; this._tap = typeof ta === 'string' ? { action: ta } : ta && typeof ta === 'object' ? ta : null;
    this.toggleAttribute('data-tap', !!(this._tap && this._tap.action && this._tap.action !== 'none'));
  }
  _entityIds() { return []; }            // graficul se actualizează doar la refresh, nu la fiecare schimbare de stare
  set hass(h) { this._hass = h; if (this._config && !this._started && h && h.callWS) { this._started = true; this._load(false); } }
  get hass() { return this._hass; }
  _width() { return this.clientWidth || (this.parentElement && this.parentElement.clientWidth) || 360; }
  _height() { return this._config.height || (this._width() >= 520 ? 190 : 150); }
  _key() { return String(rangeHours(this._range)); }
  _html() {
    const w = Math.max(200, this._width() - 24 /* padding panou */);
    const entry = this._cache.get(this._key());
    const m = buildGraphModel(this._config, entry ? entry.data : [], w, this._height());
    this._model = m;
    return renderGraphCard(this._config, m, { range: this._range, loading: this._loading }, { warnings: this._warnings });
  }
  async _load(force) {
    if (!this._hass || !this._hass.callWS || !this._config) return;
    const key = this._key(), hit = this._cache.get(key), ttl = this._config.refresh_minutes * 60e3;
    if (!force && hit && Date.now() - hit.at < ttl) return;
    if (this._loading) return;
    this._loading = true; this._draw(false);
    const ids = this._config.series.map((s) => s.entity), hours = rangeHours(this._range), end = new Date(), start = new Date(end.getTime() - hours * 3600e3);
    try {
      const res = await this._hass.callWS({ type: 'history/history_during_period', start_time: start.toISOString(), end_time: end.toISOString(), entity_ids: ids, minimal_response: true, no_attributes: true, significant_changes_only: false });
      const parsed = parseMinimalResponse(res, ids);
      const data = ids.map((id) => {
        const bin = !!(parsed[id] && parsed[id].binary);
        let pts = thin(parsed[id] || [], this._config.timeline ? 600 : 150);   // cronologia păstrează toate trecerile pornit / oprit
        const cur = this._hass.states && this._hass.states[id]; const n = Number(cur && cur.state);
        if (cur && cur.state !== '' && Number.isFinite(n) && pts.length) pts = pts.concat([{ t: end.getTime(), v: n }]);
        else if (bin && cur && pts.length && discreteValue(cur.state) !== undefined) pts = pts.concat([{ t: end.getTime(), v: discreteValue(cur.state) }]);
        pts.unit = (cur && cur.attributes && cur.attributes.unit_of_measurement) || '';
        pts.binary = bin;
        return pts;
      });
      this._cache.set(key, { at: Date.now(), data });
    } catch (e) { /* fără istoric: se arată „fără date istorice” */ }
    this._loading = false; this._lastHtml = null; this._draw(false);
  }
  _bind() {
    super._bind();
    const wrap = this._mount.querySelector('.ccu-graph-wrap'), svg = wrap && wrap.querySelector('svg');
    if (!svg) return;
    const tip = wrap.querySelector('.ccu-tip');
    const hide = () => { const c = svg.querySelector('.cursor'); if (c) c.setAttribute('opacity', '0'); const d = svg.querySelector('.dots'); if (d) d.innerHTML = ''; if (tip) tip.hidden = true; };
    const show = (e) => {
      const m = this._model; if (!m || !m.series.length) return;
      const r = svg.getBoundingClientRect(); if (!r.width) return;
      const x = (e.clientX - r.left) * (m.W / r.width);
      if (m.timeline) {   // cronologie: ce e sub deget (bara, golul „indisponibil”, intervalul oprit) cu ora și durata
        const hit = timelineHit(m, x, (e.clientY - r.top) * (m.H / r.height)); if (!hit) return hide();
        const c = svg.querySelector('.cursor'); c.setAttribute('x1', hit.x); c.setAttribute('x2', hit.x); c.setAttribute('opacity', '.6');
        if (tip) { tip.textContent = hit.text; tip.hidden = false; tip.style.left = `${Math.min(Math.max(hit.x * r.width / m.W, 90), r.width - 90)}px`; }
        return;
      }
      const p0 = nearestPoint(m.series[0].points, x); if (!p0) return hide();
      const c = svg.querySelector('.cursor'); c.setAttribute('x1', p0.x); c.setAttribute('x2', p0.x); c.setAttribute('opacity', '.8');
      let dots = '', txt = [];
      m.series.forEach((s) => { const p = nearestPoint(s.points, p0.x); if (!p) return; dots += `<circle class="dot ser" style="--sc:${s.color}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5"/>`; txt.push(s.binary ? (p.v >= 1 ? t('Pornit') : t('Oprit')) : formatValue(p.v, s.unit)); });
      svg.querySelector('.dots').innerHTML = dots;
      if (tip) { tip.textContent = `${formatTimeLabel(p0.t, m.hours <= 24 ? '24h' : '7d')} · ${txt.join(' · ')}`; tip.hidden = false; tip.style.left = `${Math.min(Math.max(p0.x * r.width / m.W, 60), r.width - 60)}px`; }
    };
    const up = (e) => { if (e.pointerType === 'touch') hide(); };
    svg.addEventListener('pointermove', show); svg.addEventListener('pointerdown', show);
    svg.addEventListener('pointerleave', hide); svg.addEventListener('pointercancel', hide); svg.addEventListener('pointerup', up);
    this._unbind.push(() => { svg.removeEventListener('pointermove', show); svg.removeEventListener('pointerdown', show); svg.removeEventListener('pointerleave', hide); svg.removeEventListener('pointercancel', hide); svg.removeEventListener('pointerup', up); });
  }
  connectedCallback() {
    super.connectedCallback();
    if (!this._refreshTimer) this._refreshTimer = setInterval(() => { if (!document.hidden) this._load(false); }, 60000);
    if (typeof ResizeObserver !== 'undefined' && !this._ro) { this._ro = new ResizeObserver(() => { const w = this.clientWidth; if (Math.abs(w - this._lastW) >= 24) { this._lastW = w; this._draw(false); } }); this._ro.observe(this); }
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._refreshTimer) { clearInterval(this._refreshTimer); this._refreshTimer = null; }
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }
  getCardSize() { return Math.ceil(this._height() / 50) + 1; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: 'auto'}; }
  static getStubConfig(hass) {
    const id = Object.keys((hass && hass.states) || {}).find((i) => /^sensor\./.test(i)) || 'sensor.exemplu';
    return { title: 'Grafic', range: '24h', tabs: ['24h', '7d'], series: [{ entity: id }] };
  }
}

class CcuFlowCard extends CcuBase {
  constructor() { super(); this._lastW = 0; this._ro = null; }
  _build(cfg) {
    const f = normalizeFlowConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: f.items.map((i) => i.entity) });
    return { config: { ...base.config, entities: f.items, title: f.title }, warnings: f.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _entityIds() { const o = []; for (const e of this._config.entities) { o.push(e.entity); if (e.soc) o.push(e.soc); if (e.sum) o.push(...e.sum); if (e.subtract) o.push(...e.subtract); } return o; }
  _width() { return Math.max(280, (this.clientWidth || (this.parentElement && this.parentElement.clientWidth) || 360) - 24); }
  _html() { return renderFlow(this._config, buildFlowModel(this._config.entities, this._hass), this._width(), { warnings: this._warnings }); }
  connectedCallback() {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined' && !this._ro) { this._ro = new ResizeObserver(() => { const w = this.clientWidth; if (Math.abs(w - this._lastW) >= 24) { this._lastW = w; this._draw(false); } }); this._ro.observe(this); }
  }
  disconnectedCallback() { super.disconnectedCallback(); if (this._ro) { this._ro.disconnect(); this._ro = null; } }
  getCardSize() { const n = (this._config && this._config.entities.filter((e) => e.kind === 'consumer').length) || 3; return Math.ceil(Math.max(150, n * 46) / 50) + 2; }
  getGridOptions() { return { columns: 12, min_columns: 5, rows: 'auto'}; }
  static getConfigElement() { return document.createElement('ccu-flow-editor'); }
  static getStubConfig(hass) {
    // un card nou pornește cu ce găsim în HA (după unitate W/kW și nume); dacă nu găsim nimic, doar titlul: editorul vizual completează restul
    const f = detectEnergy(hass && hass.states), cfg = { title: 'Energy flow' };
    if (f.solar) cfg.solar = f.solar;
    if (f.grid) cfg.grid = f.grid;
    if (f.battery) cfg.battery = f.soc ? { entity: f.battery, soc: f.soc } : f.battery;
    return cfg;
  }
}

/** Media puterii bateriei pe ultimele 10 minute, citită din istoric cel mult o dată pe minut și doar cât bateria chiar se încarcă; la sosire redesenează cardul. */
function avgRefresh(card, list) {
  if (!card._hass) return;
  card._avg = card._avg || {};
  for (const { id, invert } of list) {
    const s = card._hass.states && card._hass.states[id], n = s ? Number(s.state) : NaN;
    const unit = s && s.attributes && s.attributes.unit_of_measurement, w = Number.isFinite(n) ? n * (unit === 'kW' ? 1000 : unit === 'MW' ? 1e6 : 1) : null;
    if (w === null || (invert ? -w : w) >= -50) continue;   // nu se încarcă acum: media nu e necesară
    const a = card._avg[id] || (card._avg[id] = { w: null, at: 0, busy: false });
    if (a.busy || Date.now() - a.at < 60000) continue;
    a.busy = true; a.at = Date.now();
    fetchAveragePower(card._hass, id, 10).then((v) => { a.w = v; a.busy = false; card._draw(false); }).catch(() => { a.busy = false; });
  }
}

class CcuBatteryCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-battery-editor'); }
  _build(cfg) {
    const b = normalizeBatteryConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: b.config.soc ? [b.config.soc] : [] });
    return { config: { ...base.config, ...b.config, entities: b.config.soc ? [{ entity: b.config.soc, name: b.config.title }] : [] }, warnings: b.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _entityIds() { const c = this._config; return [c.soc, c.capacity_entity, c.load, c.power, c.grid_present].concat(c.load_entities || []).filter(Boolean); }
  _html() {
    const c = this._config;
    if (c.power && c.charge_eta !== 'now') avgRefresh(this, [{ id: c.power, invert: c.power_invert }]);
    return renderBattery(c, buildBatteryModel(c, this._hass, { avgPowerW: c.power && this._avg && this._avg[c.power] ? this._avg[c.power].w : null }), { warnings: this._warnings });
  }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: 'auto'}; }
  static getStubConfig(hass) {
    const id = Object.keys((hass && hass.states) || {}).find((i) => /^sensor\..*(soc|batter)/.test(i)) || 'sensor.baterie_soc';
    return { soc: id, capacity_kwh: 10, reserve_pct: 20, shutdown_pct: 10 };
  }
}

class CcuBatteriesCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-batteries-editor'); }
  _build(cfg) {
    const b = normalizeBatteriesConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: b.items.map((i) => i.entity) });
    this._allowEmpty = !!b.auto;
    return { config: { ...base.config, entities: b.items, title: b.title, warn_pct: b.warn_pct, low_pct: b.low_pct, sort: b.sort, auto: b.auto, only_low: b.only_low }, warnings: b.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _entityIds() {
    const base = (this._config.entities || []).map((e) => e.entity);
    if (!this._config.auto || !this._hass) return base;
    if (!this._batIds || Date.now() - this._batAt > 30000) { this._batAt = Date.now(); this._batIds = discoverBatteries(this._hass, { ...this._config.auto, unavailable: true }).map((r) => r.entity); }
    return base.concat(this._batIds);
  }
  _html() { return renderBatteries(this._config, buildBatteriesModel(this._config, this._hass), { warnings: this._warnings }); }
  getCardSize() { return Math.ceil(((this._config && this._config.entities.length) || 4) * 0.55) + 1; }
  getGridOptions() { return { columns: 12, min_columns: 4, rows: 'auto' }; }
  static getStubConfig(hass) { const ids = Object.keys((hass && hass.states) || {}).filter((i) => /^sensor\..*battery/.test(i)).slice(0, 4); return { entities: ids.length ? ids : ['sensor.exemplu_battery'] }; }
}

class CcuPeopleCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-people-editor'); }
  _build(cfg) {
    const p = normalizePeople(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: p.people.map((x) => x.entity) });
    return { config: { ...base.config, entities: p.people, label: p.label, layout: p.layout, title: p.title }, warnings: p.warnings.concat(base.warnings.filter((w) => !/entit|Fără/i.test(w))) };
  }
  _html() { return renderPeople(this._config, this._hass, { warnings: this._warnings }); }
  getCardSize() { return this._config && this._config.layout === 'family' ? 3 : 1; }
  getGridOptions() { return { columns: 6, min_columns: 3, rows: 'auto' }; }
  static getStubConfig(hass) { const ids = Object.keys((hass && hass.states) || {}).filter((i) => /^person\./.test(i)).slice(0, 3); return { people: ids.length ? ids : ['person.exemplu'] }; }
}

class CcuWeatherCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-weather-editor'); }
  constructor() { super(); this._forecast = []; this._fcTimer = null; this._fcBusy = false; this._fcAt = 0; }
  _build(cfg) {
    const w = normalizeWeatherConfig(cfg);
    const base = normalizeConfig({ ...(cfg || {}), entities: w.config.items.map((i) => i.entity) });
    return { config: { ...base.config, ...w.config, entities: w.config.items }, warnings: w.warnings.concat(base.warnings.filter((x) => !/entit|Fără/i.test(x))) };
  }
  // toți senzorii configurați (și cei care nu au tile: rafale, direcție, „se simte ca”, starea ploii) + entitatea weather + soarele
  _entityIds() { const c = this._config; return [...new Set([...Object.values(c.sensors), c.weather, c.sun].filter(Boolean))]; }
  _html() { return renderWeather(this._config, buildWeatherModel(this._config, this._hass, this._forecast, new Date()), { warnings: this._warnings }); }
  setConfig(cfg) { super.setConfig(cfg); this._fcAt = 0; this._forecast = []; this._loadForecast(); }
  set hass(h) { super.hass = h; if (this._config && !this._fcAt) this._loadForecast(); }
  get hass() { return this._hass; }
  // prognoza zilnică: serviciul weather.get_forecasts (cu răspuns); dacă nu merge, atributul „forecast” al entității; reîmprospătată la 30 de minute
  async _loadForecast() {
    const eid = this._config && this._config.weather;
    if (!eid || !this._hass || this._fcBusy) return;
    this._fcBusy = true; this._fcAt = Date.now();
    let list = null;
    try {
      const res = await this._hass.callWS({ type: 'call_service', domain: 'weather', service: 'get_forecasts', service_data: { type: 'daily' }, target: { entity_id: eid }, return_response: true });
      list = res && res.response && res.response[eid] && res.response[eid].forecast;
    } catch (e) { list = null; }
    if (!Array.isArray(list)) { const a = this._hass.states && this._hass.states[eid] && this._hass.states[eid].attributes; list = a && Array.isArray(a.forecast) ? a.forecast : []; }
    this._forecast = list; this._fcBusy = false; this._lastHtml = null; this._draw(false);
  }
  connectedCallback() { super.connectedCallback(); if (!this._fcTimer) this._fcTimer = setInterval(() => { if (!document.hidden && Date.now() - this._fcAt > 1800000) this._loadForecast(); }, 60000); }
  disconnectedCallback() { super.disconnectedCallback(); if (this._fcTimer) { clearInterval(this._fcTimer); this._fcTimer = null; } }
  getCardSize() { return 7; }
  getGridOptions() { return { columns: 12, min_columns: 6, rows: 'auto'}; }
  static getStubConfig(hass) {
    const s = (hass && hass.states) || {};
    const w = Object.keys(s).find((i) => i.startsWith('weather.')) || 'weather.acasa';
    const t = Object.keys(s).find((i) => /^sensor\..*temperature/.test(i)) || 'sensor.temperatura_exterioara';
    return { title: 'Vremea', weather: w, sensors: { temperature: t } };
  }
}

class CcuNavCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-nav-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: [] });
    const n = normalizeNav(cfg);
    config.items = n.items;
    config.sticky = !!(cfg && cfg.sticky === true);
    config.labels = !(cfg && cfg.labels === false);   // labels: false = doar iconițe
    config.compact = !!(cfg && cfg.compact === true); // capsulă îngustă, centrată (în loc de bară pe toată lățimea)
    config.spacer = !(cfg && cfg.spacer === false);   // spacer: false = fără spațiul gol rezervat sub bara fixă
    config.device = cfg && (cfg.device === 'phone' || cfg.device === 'tablet') ? cfg.device : '';   // ocolește detectarea telefon / tabletă
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  setConfig(cfg) { super.setConfig(cfg); this.toggleAttribute('data-sticky', !!this._config.sticky); }
  _entityIds() { return (this._config.items || []).flatMap((it) => [...(it.badge || []), ...(it.visible_if ? [it.visible_if.entity] : [])]); }
  _path() { return (typeof location !== 'undefined' && location.pathname) || ''; }
  _device() { return deviceKind(this._config && this._config.device); }
  _html() { return renderNav(this._config, this._path(), { warnings: this._warnings, hass: this._hass, device: this._device() }); }
  _actionFor(idx) { const it = (this._config.items || [])[Number(idx)]; return it ? { action: 'navigate', path: navPath(it, this._device()) } : null; }
  // meniul: simplu `click` (instant, fără așteptare de hold / double-tap); Enter/Space merg natural pe <button>
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    this._mount.querySelectorAll('.ccu-nav-item').forEach((el) => {
      const it0 = (this._config.items || [])[Number(el.getAttribute('data-id'))];
      const hold = it0 && !it0.back ? holdTarget(it0, this._device()) : '';
      let timer = null, fired = false;
      const go = () => {
        if (fired) { fired = false; return; }   // apăsarea lungă a navigat deja: ignoră „click”-ul de la ridicarea degetului
        const it = (this._config.items || [])[Number(el.getAttribute('data-id'))];
        if (it && it.back) { try { window.history.back(); } catch (e) { /* fără istoric */ } return; }
        this._fire(el.getAttribute('data-id'), 'tap', el);
      };
      el.addEventListener('click', go);
      this._unbind.push(() => el.removeEventListener('click', go));
      if (hold) {
        const start = () => { fired = false; clearTimeout(timer); timer = setTimeout(() => { timer = null; fired = true; runAction(this._hass, el, { action: 'navigate', path: hold }); }, 550); };
        const cancel = () => { if (timer) { clearTimeout(timer); timer = null; } };
        const noMenu = (e) => e.preventDefault();   // fără meniul sistemului la apăsare lungă
        el.addEventListener('pointerdown', start); el.addEventListener('contextmenu', noMenu);
        for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.addEventListener(ev, cancel);
        this._unbind.push(() => { cancel(); el.removeEventListener('pointerdown', start); el.removeEventListener('contextmenu', noMenu); for (const ev of ['pointerup', 'pointerleave', 'pointercancel']) el.removeEventListener(ev, cancel); });
      }
    });
  }
  connectedCallback() {
    super.connectedCallback();
    this._onLoc = () => this._draw(false);
    window.addEventListener('location-changed', this._onLoc); window.addEventListener('popstate', this._onLoc);
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._onLoc) { window.removeEventListener('location-changed', this._onLoc); window.removeEventListener('popstate', this._onLoc); this._onLoc = null; }
  }
  _fire(idx, kind, el) { if (kind === 'tap') { super._fire(idx, kind, el); setTimeout(() => this._draw(false), 50); } }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { items: [{ icon: 'home', label: 'Home', path: '/lovelace/0' }] }; }
}

class CcuHeaderCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-header-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: [] });
    const h = normalizeHeader(cfg?.header ?? cfg);
    config.header = h.header;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(h.warnings) };
  }
  _entityIds() {
    const h = this._config.header;
    const rt = h.values.flatMap((v) => (v.runtimeCfg ? [v.runtimeCfg.load, v.runtimeCfg.capacity_entity, v.runtimeCfg.grid_present, v.runtimeCfg.power].concat(v.runtimeCfg.load_entities || []).filter(Boolean) : []));
    return h.values.map((v) => v.entity).concat(h.right ? [h.right.entity] : [], rt);
  }
  _hasClock() { return !!(this._config && this._config.header.clock); }
  _html(now) {
    const h = this._config.header, ids = h.values.filter((v) => v.runtimeCfg && v.runtimeCfg.power && v.runtimeCfg.charge_eta !== 'now').map((v) => ({ id: v.runtimeCfg.power, invert: v.runtimeCfg.power_invert === true || v.runtimeCfg.power_invert === 'true' }));
    if (ids.length) avgRefresh(this, ids);
    const avgMap = {}; for (const { id } of ids) if (this._avg && this._avg[id]) avgMap[id] = this._avg[id].w;
    return renderHeader(this._config, this._hass, now, { warnings: this._warnings, subs: headerRuntimeTexts(h, this._hass, avgMap) });
  }
  setConfig(cfg) { super.setConfig(cfg); if (this.isConnected && this._hasClock() && !this._clock) this._clock = setInterval(() => this._draw(false), CLOCK_MS); }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { header: { icon: 'home', values: [], clock: true } }; }
}

// ---------------------------------------------------------------- controale: termostat, lumină, număr, selector
class CcuControlsCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-controls-editor'); }
  _build(cfg) {
    const n = normalizeControls(cfg);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: n.items.map((i) => ({ entity: i.entity })) });
    config.items = n.items; config.columns = n.columns; config.ctitle = n.title;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _html() { return renderControls(this._config, this._hass, { warnings: this._warnings, optim: this._optim || {} }); }
  _draw(force) { if (this._drag) return; super._draw(force); this._syncSelects(); }
  _syncSelects() { this._mount.querySelectorAll('select.sel').forEach((s) => { const c = s.getAttribute('data-cur'); if (c && s.value !== c && this._root.activeElement !== s) s.value = c; }); }
  // valoare trimisă „optimist”: rămâne afișată până vine starea nouă din HA
  _setOptim(i, v) {
    this._optim = this._optim || {}; this._tm = this._tm || {};
    this._optim[i] = v;
    clearTimeout(this._tm['o' + i]); this._tm['o' + i] = setTimeout(() => { if (this._optim) delete this._optim[i]; this._draw(false); }, 3000);
  }
  _call(domain, service, data) { if (this._hass && this._hass.callService) this._hass.callService(domain, service, data); }
  _moveSlider(e) {
    const d = this._drag; if (!d) return;
    const r = d.el.getBoundingClientRect();
    const min = Number(d.el.getAttribute('data-min')), max = Number(d.el.getAttribute('data-max')), step = Number(d.el.getAttribute('data-step'));
    const v = sliderValue(r.width ? (e.clientX - r.left) / r.width : 0, min, max, step);
    d.val = v;
    const pct = max > min ? ((v - min) / (max - min)) * 100 : 0;
    const fl = d.el.querySelector('.fl'), th = d.el.querySelector('.th'), sv = d.el.querySelector('.sv');
    if (fl) fl.style.width = pct.toFixed(1) + '%'; if (th) th.style.left = pct.toFixed(1) + '%';
    const unit = d.el.getAttribute('data-unit');
    const txt = d.sub === 'ct' ? `${v} K` : d.kind === 'light' || d.kind === 'fan' || d.kind === 'media' ? `${v}%` : `${formatNumber(v)}${unit ? ' ' + unit : ''}`;
    if (sv) sv.textContent = txt;
    const cur = d.el.closest('.ctl') && d.el.closest('.ctl').querySelector('.cur'); if (cur) cur.textContent = txt;
  }
  _commitSlider() {
    const d = this._drag; this._drag = null;
    if (!d || d.val === undefined) return;
    const it = (this._config.items || [])[d.i]; if (!it) return;
    this._setOptim(d.sub === 'ct' ? d.i + 'c' : d.i, d.val);
    if (d.sub === 'ct') this._call('light', 'turn_on', { entity_id: it.entity, color_temp_kelvin: d.val });
    else if (d.kind === 'light') { if (d.val <= 0) this._call('light', 'turn_off', { entity_id: it.entity }); else this._call('light', 'turn_on', { entity_id: it.entity, brightness_pct: d.val }); }
    else if (d.kind === 'fan') { if (d.val <= 0) this._call('fan', 'turn_off', { entity_id: it.entity }); else this._call('fan', 'set_percentage', { entity_id: it.entity, percentage: d.val }); }
    else if (d.kind === 'media') this._call('media_player', 'volume_set', { entity_id: it.entity, volume_level: Math.round(d.val) / 100 });
    else this._call(it.entity.split('.')[0], 'set_value', { entity_id: it.entity, value: d.val });
    this._draw(false);
  }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    const m = this._mount;
    const idxOf = (el) => { const t = el.closest('[data-id]'); return t ? Number(t.getAttribute('data-id')) : -1; };
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b) return;
      const act = b.getAttribute('data-act');
      if (act === 'slider' || act === 'select') return;
      const i = idxOf(b), it = (this._config.items || [])[i]; if (!it) return;
      e.preventDefault();
      if (act === 'toggle') toggleEntity(this._hass, it.entity);
      else if (act === 'swatch') {
        const k = b.getAttribute('data-k'), rgb = b.getAttribute('data-rgb');
        if (k) this._call('light', 'turn_on', { entity_id: it.entity, color_temp_kelvin: Number(k) });
        else if (rgb) this._call('light', 'turn_on', { entity_id: it.entity, rgb_color: rgb.split(',').map(Number) });
      }
      else if (act === 'preset') this._call('fan', 'set_preset_mode', { entity_id: it.entity, preset_mode: b.getAttribute('data-val') });
      else if (act === 'mprev') this._call('media_player', 'media_previous_track', { entity_id: it.entity });
      else if (act === 'mnext') this._call('media_player', 'media_next_track', { entity_id: it.entity });
      else if (act === 'mpp') this._call('media_player', 'media_play_pause', { entity_id: it.entity });
      else if (act === 'mvu') this._call('media_player', 'volume_up', { entity_id: it.entity });
      else if (act === 'mvd') this._call('media_player', 'volume_down', { entity_id: it.entity });
      else if (act === 'mmute') { const s0 = this._hass && this._hass.states && this._hass.states[it.entity]; this._call('media_player', 'volume_mute', { entity_id: it.entity, is_volume_muted: !(s0 && s0.attributes && s0.attributes.is_volume_muted) }); }
      else if (act === 'more') runAction(this._hass, b, { action: 'more-info', entity: it.entity });
      else if (act === 'mode') this._call('climate', 'set_hvac_mode', { entity_id: it.entity, hvac_mode: b.getAttribute('data-val') });
      else if (act === 'cfan') this._call('climate', 'set_fan_mode', { entity_id: it.entity, fan_mode: b.getAttribute('data-val') });
      else if (act === 'cswing') this._call('climate', 'set_swing_mode', { entity_id: it.entity, swing_mode: b.getAttribute('data-val') });
      else if (act === 'cpreset') this._call('climate', 'set_preset_mode', { entity_id: it.entity, preset_mode: b.getAttribute('data-val') });
      else if (act === 'inc' || act === 'dec') {
        const mod = controlModel(it, this._hass && this._hass.states && this._hass.states[it.entity], this._optim && this._optim[i]);
        const dir = act === 'inc' ? 1 : -1;
        const clampT = (x) => { let y = x; if (mod.min !== null) y = Math.max(mod.min, y); if (mod.max !== null) y = Math.min(mod.max, y); return Math.round(y * 100) / 100; };
        let data;
        if (mod.range && mod.range[0] !== null && mod.range[1] !== null) { const r = [clampT(mod.range[0] + dir * mod.step), clampT(mod.range[1] + dir * mod.step)]; this._setOptim(i, r); data = { entity_id: it.entity, target_temp_low: r[0], target_temp_high: r[1] }; }
        else if (mod.tgt !== null) { const v = clampT(mod.tgt + dir * mod.step); this._setOptim(i, v); data = { entity_id: it.entity, temperature: v }; }
        else return;
        this._draw(false);
        this._tm = this._tm || {}; clearTimeout(this._tm['s' + i]);
        this._tm['s' + i] = setTimeout(() => this._call('climate', 'set_temperature', data), 600);   // mai multe atingeri → o singură comandă
      }
    });
    m.addEventListener('pointerdown', (e) => {
      const sl = e.target.closest('.sl'); if (!sl) return;
      const i = idxOf(sl), it = (this._config.items || [])[i]; if (!it) return;
      this._drag = { el: sl, i, kind: it.kind, sub: sl.getAttribute('data-sub') || '' };
      try { sl.setPointerCapture(e.pointerId); } catch (err) { /* fără capture */ }
      this._moveSlider(e);
    });
    m.addEventListener('pointermove', (e) => { if (this._drag) this._moveSlider(e); });
    const end = () => this._commitSlider();
    m.addEventListener('pointerup', end); m.addEventListener('pointercancel', () => { this._drag = null; this._draw(true); });
    m.addEventListener('change', (e) => {
      const s = e.target.closest && e.target.closest('select.sel'); if (!s) return;
      const it = (this._config.items || [])[idxOf(s)]; if (!it) return;
      this._call(it.entity.split('.')[0], 'select_option', { entity_id: it.entity, option: s.value });
    });
  }
  getCardSize() { return Math.max(2, (this._config ? this._config.items.length : 1) * 1.2); }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys(hass?.states || {}).filter((i) => /^(climate|light)\./.test(i)).slice(0, 2);
    return { items: ids.length ? ids : ['light.exemplu'] };
  }
}

class CcuTitleCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-title-editor'); }
  _allowEmpty = true;
  _build(cfg) { const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: [] }); config.t = normalizeTitle(cfg); return { config, warnings: warnings.filter((w) => !/entit/i.test(w)) }; }
  _entityIds() { return []; }
  _html() { return renderTitle(this._config.t); }
  getCardSize() { return 1; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { title: 'Titlu', subtitle: 'subtitlu' }; }
}

// ---------------------------------------------------------------- telecomandă TV (remote.send_command)
class CcuRemoteCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-remote-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const n = normalizeRemote(cfg);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: n.entity ? [{ entity: n.entity }] : [] });
    config.remote = n;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _entityIds() { return this._config.remote.entity ? [this._config.remote.entity] : []; }
  _html() { return renderRemote(this._config.remote, this._hass, { warnings: this._warnings }); }
  _send(cmd) { if (this._hass && this._hass.callService && this._config.remote.entity) this._hass.callService('remote', 'send_command', { entity_id: this._config.remote.entity, command: cmd }); }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    let rep = null, started = false;
    const stop = () => { if (rep) { clearInterval(rep); rep = null; } };
    this._mount.addEventListener('pointerdown', (e) => {
      const b = e.target.closest('.rk'); if (!b) return;
      started = true; this._send(b.getAttribute('data-cmd'));
      if (b.hasAttribute('data-repeat')) { stop(); const t = setTimeout(() => { rep = setInterval(() => this._send(b.getAttribute('data-cmd')), 220); }, 450); this._unbind.push(() => clearTimeout(t)); b._t = t; }
    });
    const up = (e) => { const b = e.target.closest && e.target.closest('.rk'); if (b && b._t) clearTimeout(b._t); stop(); };
    this._mount.addEventListener('pointerup', up); this._mount.addEventListener('pointercancel', up); this._mount.addEventListener('pointerleave', up);
    this._mount.addEventListener('keydown', (e) => { if (e.key !== 'Enter' && e.key !== ' ') return; const b = e.target.closest('.rk'); if (b) { e.preventDefault(); this._send(b.getAttribute('data-cmd')); } });
  }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, rows: 'auto' }; }
  static getStubConfig() { return { entity: 'remote.living_room_tv' }; }
}

class CcuRadioCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-radio-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const n = normalizeRadio(cfg);
    const ids = [n.stations, n.playing, n.player, ...n.speakers].filter(Boolean);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: ids.map((e) => ({ entity: e })) });
    config.radio = n;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _entityIds() { const r = this._config.radio; return [r.stations, r.playing, r.player, ...r.speakers].filter(Boolean); }
  _html() { return renderRadio(this._config.radio, this._hass, { warnings: this._warnings, optim: { ...(this._opt || {}), speaker: this._speakerSel() } }); }
  // boxa aleasă rămâne memorată pe dispozitiv (localStorage), ca la următoarea deschidere să fie aceeași
  _speakerKey() { const r = this._config.radio; return 'ccu-radio:' + (r.stations || '') + ':' + r.speakers.join(','); }
  _speakerSel() { if (this._sel === undefined) { try { this._sel = localStorage.getItem(this._speakerKey()) || ''; } catch (e) { this._sel = ''; } } return this._sel; }
  _draw(force) { if (this._drag) return; super._draw(force); }
  _call(domain, service, data) { if (this._hass && this._hass.callService) this._hass.callService(domain, service, data); }
  // valoare trimisă „optimist”: rămâne afișată ~3,5 s, până revine starea din HA
  _optim(k, v) {
    this._opt = this._opt || {}; this._tm = this._tm || {};
    this._opt[k] = v;
    clearTimeout(this._tm[k]); this._tm[k] = setTimeout(() => { if (this._opt) delete this._opt[k]; this._draw(false); }, 3500);
    this._draw(false);
  }
  _model() { return radioModel(this._config.radio, this._hass, { ...(this._opt || {}), speaker: this._speakerSel() }); }
  /** Pornește un script / buton / scenă (șir) sau o acțiune completă (obiect). */
  _trigger(spec, el) {
    if (!spec) return false;
    if (typeof spec === 'object') { runAction(this._hass, el, spec); return true; }
    const d = spec.split('.')[0];
    if (d === 'button' || d === 'input_button') this._call(d, 'press', { entity_id: spec });
    else if (d === 'script' || d === 'scene') this._call(d, 'turn_on', { entity_id: spec });
    else if (d === 'automation') this._call('automation', 'trigger', { entity_id: spec });
    else toggleEntity(this._hass, spec);
    return true;
  }
  /** Pornește postul ales pe boxa țintă: scriptul tău (pe boxa principală) sau, altfel, direct `play_media` cu adresa din numele opțiunii. */
  _start(m, el) {
    const r = this._config.radio;
    if (m.speaker === r.player && r.play && this._trigger(r.play, el)) return;
    const url = stationUrl(m.value, r.strip);
    if (m.speaker && url) this._call('media_player', 'play_media', { entity_id: m.speaker, media_content_id: url, media_content_type: 'music' });
    else if (m.speaker) this._call('media_player', 'media_play', { entity_id: m.speaker });
    else if (r.play) this._trigger(r.play, el);
  }
  _power(el) {
    const r = this._config.radio, m = this._model(), on = !m.playing;
    this._optim('play', on);
    if (on) { this._start(m, el); return; }
    if (m.speaker === r.player && r.stop && this._trigger(r.stop, el)) return;
    if (m.speaker) this._call('media_player', 'media_stop', { entity_id: m.speaker });
    else if (r.playing) this._call(r.playing.split('.')[0], 'turn_off', { entity_id: r.playing });
  }
  _station(value, el) {
    const r = this._config.radio; if (!r.stations || value === undefined) return;
    this._optim('station', value);
    this._call(r.stations.split('.')[0], 'select_option', { entity_id: r.stations, option: value });
    if (this._model().playing) { clearTimeout(this._tm.restart); this._tm.restart = setTimeout(() => this._start(this._model(), el), 700); }   // în timpul redării, noul post pornește singur
  }
  _speaker(id) { this._sel = id; try { localStorage.setItem(this._speakerKey(), id); } catch (e) { /* fără stocare */ } this._draw(true); }
  _step(d, el) {
    const m = this._model(); if (m.stations.length < 2) return;
    const i = m.idx < 0 ? (d > 0 ? 0 : m.stations.length - 1) : (m.idx + d + m.stations.length) % m.stations.length;
    this._station(m.stations[i].value, el);
  }
  _moveVol(e) {
    const d = this._drag; if (!d) return;
    const rc = d.el.getBoundingClientRect(), v = Math.round(Math.min(1, Math.max(0, rc.width ? (e.clientX - rc.left) / rc.width : 0)) * 100);
    d.val = v;
    const fl = d.el.querySelector('.fl'), th = d.el.querySelector('.th'), sv = d.el.querySelector('.sv');
    if (fl) fl.style.width = v + '%'; if (th) th.style.left = v + '%'; if (sv) sv.textContent = v + '%';
  }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    const m = this._mount;
    m.addEventListener('click', (e) => {
      const b = e.target.closest('[data-act]'); if (!b || b.disabled) return;
      const act = b.getAttribute('data-act');
      if (act === 'power') this._power(b);
      else if (act === 'station') this._station(b.getAttribute('data-val'), b);
      else if (act === 'prev') this._step(-1, b);
      else if (act === 'next') this._step(1, b);
      else if (act === 'speaker') this._speaker(b.getAttribute('data-val'));
    });
    m.addEventListener('pointerdown', (e) => {
      const v = e.target.closest('.rd-vol'); if (!v) return;
      this._drag = { el: v };
      try { v.setPointerCapture(e.pointerId); } catch (err) { /* fără capture */ }
      this._moveVol(e);
    });
    m.addEventListener('pointermove', (e) => { if (this._drag) this._moveVol(e); });
    m.addEventListener('pointerup', () => {
      const d = this._drag; this._drag = null;
      const sp = this._model().speaker; if (d && d.val !== undefined && sp) this._call('media_player', 'volume_set', { entity_id: sp, volume_level: d.val / 100 });
      this._draw(true);
    });
    m.addEventListener('pointercancel', () => { this._drag = null; this._draw(true); });
  }
  getCardSize() { return 4; }
  getGridOptions() { return { columns: 12, min_columns: 5, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys((hass && hass.states) || {});
    const sel = ids.find((i) => /^(input_select|select)\..*radio/.test(i)) || ids.find((i) => /^(input_select|select)\./.test(i)) || 'input_select.radio';
    const mp = ids.find((i) => /^media_player\./.test(i));
    return mp ? { title: 'Radio', stations: sel, player: mp } : { title: 'Radio', stations: sel };
  }
}

// toate entitățile folosite de un config de mașini (pentru redesenare la schimbări)
function vehicleEntityIds(n) {
  const o = [];
  for (const v of (n && n.vehicles) || []) for (const d of v.documents) { if (d.entity) o.push(d.entity); if (d.remaining) o.push(d.remaining); if (d.odometer) o.push(d.odometer); if (d.last_km) o.push(d.last_km); }
  return o;
}

class CcuVehicleCard extends CcuBase {
  static getConfigElement() { return document.createElement('ccu-vehicle-editor'); }
  _allowEmpty = true;
  _build(cfg) {
    const n = normalizeVehicles(cfg);
    const { config, warnings } = normalizeConfig({ ...(cfg || {}), entities: vehicleEntityIds(n).map((e) => ({ entity: e })) });
    config.veh = n;
    return { config, warnings: warnings.filter((w) => !/entit/i.test(w)).concat(n.warnings) };
  }
  _entityIds() { return vehicleEntityIds(this._config.veh); }
  _hasClock() { return true; }   // la miezul nopții „zilele rămase” se schimbă
  _html(now) { return renderVehicles(this._config.veh, this._hass, { warnings: this._warnings, now }); }
  // câmpurile de dată (ascunse peste rând) iau valoarea curentă din HA, ca selectorul nativ să se deschidă pe data potrivită
  _draw(force) { super._draw(force); this._syncDates(); }
  _syncDates() {
    if (!this._hass || !this._config) return;
    this._mount.querySelectorAll('input.dp').forEach((inp) => {
      const d = this._doc(Number(inp.getAttribute('data-vi')), Number(inp.getAttribute('data-di')));
      const st = d && this._hass.states && this._hass.states[d.entity], dt = st ? parseDate(st.state) : null;
      const v = dt ? dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0') : '';
      if (inp.value !== v && this._root.activeElement !== inp) inp.value = v;
    });
  }
  _doc(vi, di) { const v = this._config.veh.vehicles[vi]; return v && v.documents[di]; }
  _bind() {
    this._unbind.forEach((f) => f()); this._unbind = [];
    if (this._deleg) return;
    this._deleg = true;
    const m = this._mount;
    m.addEventListener('change', (e) => {
      const inp = e.target.closest && e.target.closest('input.dp'); if (!inp || !inp.value) return;
      const d = this._doc(Number(inp.getAttribute('data-vi')), Number(inp.getAttribute('data-di')));
      if (d && d.entity && this._hass && this._hass.callService) this._hass.callService('input_datetime', 'set_datetime', { entity_id: d.entity, date: inp.value });
    });
    m.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('button.now');
      if (btn) {
        const d = this._doc(Number(btn.getAttribute('data-vi')), Number(btn.getAttribute('data-di')));
        const odo = d && d.odometer && this._hass.states[d.odometer], n = odo ? Number(odo.state) : NaN;
        if (d && d.last_km && Number.isFinite(n)) this._hass.callService('input_number', 'set_value', { entity_id: d.last_km, value: Math.round(n) });   // „am schimbat uleiul acum”: km curenți devin punctul de plecare
        return;
      }
      const row = e.target.closest && e.target.closest('.vd[data-editable="1"]');
      const inp = row && row.querySelector('input.dp');
      // câmpul de dată e transparent peste rând; în Chrome / Edge un clic pe el doar îl focalizează, deci deschidem selectorul explicit (pe iOS se deschide singur)
      if (inp) { try { inp.showPicker(); } catch (err) { inp.focus(); } }
    });
  }
  getCardSize() { return 3 + ((this._config && this._config.veh.vehicles.length) || 1) * 2; }
  getGridOptions() { return { columns: 12, min_columns: 5, rows: 'auto' }; }
  static getStubConfig(hass) {
    const ids = Object.keys((hass && hass.states) || {}).filter((i) => /^input_datetime\./.test(i));
    return { vehicles: [{ name: 'Car', icon: 'mdi:car', documents: [{ label: 'Insurance', entity: ids[0] || 'input_datetime.insurance' }, { label: 'Inspection', entity: ids[1] || 'input_datetime.inspection' }] }] };
  }
}

if (typeof customElements !== 'undefined') {
  if (!customElements.get('ccu-buttons-card')) customElements.define('ccu-buttons-card', CcuButtonsCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-chips-card')) customElements.define('ccu-chips-card', CcuChipsCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-header-card')) customElements.define('ccu-header-card', CcuHeaderCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-nav-card')) customElements.define('ccu-nav-card', CcuNavCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-people-card')) customElements.define('ccu-people-card', CcuPeopleCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-batteries-card')) customElements.define('ccu-batteries-card', CcuBatteriesCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-weather-card')) customElements.define('ccu-weather-card', CcuWeatherCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-graph-card')) customElements.define('ccu-graph-card', CcuGraphCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-flow-card')) customElements.define('ccu-flow-card', CcuFlowCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-battery-card')) customElements.define('ccu-battery-card', CcuBatteryCard); // fără eroare dacă fișierul e încărcat de două ori
  if (!customElements.get('ccu-controls-card')) customElements.define('ccu-controls-card', CcuControlsCard);
  if (!customElements.get('ccu-title-card')) customElements.define('ccu-title-card', CcuTitleCard);
  if (!customElements.get('ccu-remote-card')) customElements.define('ccu-remote-card', CcuRemoteCard);
  if (!customElements.get('ccu-radio-card')) customElements.define('ccu-radio-card', CcuRadioCard);
  if (!customElements.get('ccu-vehicle-card')) customElements.define('ccu-vehicle-card', CcuVehicleCard);
  defineEditors();
  const reg = (type, name, description) => { (window.customCards = window.customCards || []).push({ type, name, description, preview: false }); };
  reg('ccu-buttons-card', 'Calm Modern — Buttons', 'Grid of tiles (xs–xl) with states, colors and subtle animated icons.');
  reg('ccu-chips-card', 'Calm Modern — Chips', 'Row of status chips; they can appear only when active.');
  reg('ccu-flow-card', 'Calm Modern — Energy flow', 'Solar, grid and battery → consumers, with percentages and statistics.');
  reg('ccu-battery-card', 'Calm Modern — Battery', 'Battery bar with thresholds, runtime and backup state.');
  reg('ccu-graph-card', 'Calm Modern — Graph', 'History with 1–3 series and a value on touch.');
  reg('ccu-weather-card', 'Calm Modern — Weather', 'Values from your weather station, daily forecast and an animated scene (rain, snow, sleet, wind, storm).');
  reg('ccu-batteries-card', 'Calm Modern — Device batteries', 'Battery levels of phones, tablets and cars, sorted ascending, with a bar.');
  reg('ccu-people-card', 'Calm Modern — People', 'Overlapping avatars (or a family layout): who is home gets a green ring.');
  reg('ccu-nav-card', 'Calm Modern — Navigation bar', 'Navigation bar with icons and labels; sticky, compact, back button, badges.');
  reg('ccu-controls-card', 'Calm Modern — Controls', 'Thermostat dial, lights with brightness and colors, fan, media player, number slider and selector.');
  reg('ccu-remote-card', 'Calm Modern — Remote', 'TV remote (remote.send_command): power, volume, channels, menu and arrows.');
  reg('ccu-vehicle-card', 'Calm Modern — Vehicles', 'Insurance, inspection, road tax and service deadlines per vehicle, with days left, a colored bar and editable dates.');
  reg('ccu-radio-card', 'Calm Modern — Radio', 'Radio with a tuning dial, equalizer display, previous / next station, play / stop and volume.');
  reg('ccu-title-card', 'Calm Modern — Title', 'Section title with icon and subtitle.');
  reg('ccu-header-card', 'Calm Modern — Header', 'Icon, up to 3 values and a clock or outdoor value in one row.');
}

return { CcuControlsCard, CcuTitleCard, CcuRemoteCard, CcuButtonsCard, CcuChipsCard, CcuHeaderCard, CcuNavCard, CcuGraphCard, CcuFlowCard, CcuBatteryCard, CcuPeopleCard, CcuWeatherCard, CcuBatteriesCard };
})();
})();
