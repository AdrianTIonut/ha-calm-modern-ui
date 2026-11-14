# Colors

Every card accepts `preset:` (`green`, `calm`, `contrast`, `mono`, `warm`, `light`) and `colors:` to override any role (see the README).

![Palette](img/palette.png)

| Role | green | calm | contrast | mono | warm | light |
|---|---|---|---|---|---|---|
| `bg` — background | `#0b1220` | `#152028` | `#0b1217` | `#14181c` | `#221a16` | `#e9f0f7` |
| `text` — text | `#e6edf7` | `#e6ecef` | `#ffffff` | `#e8ebed` | `#f1e7df` | `#14233a` |
| `muted` — secondary text | `#94a3b8` | `#69737b` | `#8d99a1` | `#6f777e` | `#8d7b6f` | `#5b6b82` |
| `accent` — information | `#3b82f6` | `#56aac2` | `#4cc9f0` | `#c9d1d6` | `#d99a6c` | `#2563eb` |
| `on` — active | `#22c55e` | `#d3a658` | `#ffc233` | `#e8ebed` | `#e8b04a` | `#16a34a` |
| `alert` — attention | `#f59e0b` | `#b85758` | `#ff5d5d` | `#d9d9d9` | `#c4553f` | `#d97706` |
| `ok` — ok | `#22c55e` | `#68a169` | `#4ade80` | `#c9d1d6` | `#8aa66b` | `#16a34a` |
| `cool` — A/C cooling | `#60a5fa` | `#5b9bd9` | `#5aa9ff` | `#c9d1d6` | `#6fa8d6` | `#2563eb` |
| `heat` — A/C heating | `#f4694b` | `#d9644f` | `#ff6a4d` | `#c9d1d6` | `#e2634b` | `#dc4a2d` |
| `series` — graph line | `#34d399` | `#56aac2` | `#4cc9f0` | `#c9d1d6` | `#e8b04a` | `#16a34a` |

Valid values for `colors:` are `#hex`, `rgb()`, `hsl()` and `var(--…)`; anything else is ignored with a warning on the card.
