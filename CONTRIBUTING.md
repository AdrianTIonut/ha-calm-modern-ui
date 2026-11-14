# Contributing

1. `node tests/run-all.mjs` must pass; add tests for what you change (tests live in `tests/`, no dependencies).
2. Edit `src/*.mjs` and `src/theme.js`; then `node build.mjs` generates `ccu.js` (commit it: CI checks it is up to date).
3. No network at runtime and no external libraries; every config text goes through `esc()`.
4. A new card: a module in `src/`, a class in `src/cards.mjs`, `customElements.define` + `reg(...)`, an editor in `src/editor.mjs`, a README section and an example in `examples/`.
5. Every user-visible text goes through `t('…')` (the Romanian phrase is the key) and needs an English translation in `src/i18n.mjs`; `tests/i18n.test.mjs` enforces it.
6. Icons: 32×32, `currentColor` stroke, accent with `class="fl"`; add the `mdi:` aliases to `MDI`.
7. Never put personal data (entity ids of your home, names, addresses) in examples, tests or issues.

Adding a language: a dictionary in `DICT` (`src/i18n.mjs`); missing phrases fall back to English.
