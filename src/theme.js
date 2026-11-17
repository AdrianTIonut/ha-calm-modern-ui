// src/theme.js — stilul cardurilor: variabile CSS --ccu-* și clase.
// Două identități, același schelet (src/presets.mjs dă valorile):
//   • „green”  (implicit): bleumarin #0B1220, VERDE = activ, albastru = info, portocaliu = atenție
//   • „calm”  : ardezie #152028, chihlimbar = activ, cyan = date, roșu = alertă
// Efectele (gradient, halou, margine, relief) se DERIVĂ din tokeni cu color-mix, deci arată bogat în orice presetare.
// Tot ce e culoare/dimensiune e variabilă CSS; utilizatorul le suprascrie din config.

export const CCU_THEME = `
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
