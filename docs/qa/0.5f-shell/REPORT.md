# 0.5f Shell QA report

**Date:** 2026-10-30  
**Method:** Local `localhost:3000`, CDP `getBoundingClientRect` + full-page PNG (`Page.captureScreenshot`, `captureBeyondViewport: true`). Figma metadata via file `dmoIAsFN5cXluPaEzqWPzC`.  
**Code changes:** None (no shell measurement differed from Figma by **> 2 px** after accounting for the vertical scrollbar).

Screenshots: `docs/qa/0.5f-shell/*.png`  
Console helper: `docs/qa/0.5f-shell/measure-shell.js`

---

## Measurement note (1440 desktop + scroll)

With a vertical scrollbar present, `document.documentElement.clientWidth` is **1425** while `innerWidth` is **1440**. Shell gutters are correct relative to the **content box**; comparing raw `x`/`width` to a **1440** Figma artboard shifts controls and the footer card by **15 px**. Those deltas are **not** treated as shell bugs below.

---

## `/` (home)

### Shell — within 2 px of Figma

| Element | Figma | Measured | Δ |
|--------|-------|----------|---|
| Header height (`4:418` / `120:12596`) | 112 / 96 | 112 / 96 @ 1440 / 390 | 0 |
| Logo (`4:419`) | 56, 32 · 105×48 | 56, 32 · 105×48 @ 1440 | 0 |
| Logo mobile | 16, 24 · 105×48 | 16, 24 · 105×48 @ 390 | 0 |
| Menu btn mobile | 270, 28 · 48×40 | 270, 28 · 48×40 @ 390 | 0 |
| Menu panel desktop (`1:5250`) | 621, 0 · 819×858 | 621, 0 · 819×*vh* @ 1440 | 0 x/w; h = viewport |
| Menu close desktop (`1:5260`) | 621+40+699 = **1360**, 40 · 40×32 | **1360**, 40 · 40×32 | 0 |
| Menu panel mobile | full width | 0, 0 · 390×*vh* | 0 |
| Menu close mobile | — | **310**, 40 · 40×32 @ 390 | — |
| Footer card width (`1:2459`) | 1328 @ x=56 | 1313 @ x=56 @ 1440* | 15* |
| Footer logo tab (`1:2505`) | y = −62 vs card | tab top = card top − 62 (624 vs 686) | 0 |
| Footer card mobile | 358 @ x=16 | 358 @ x=16 @ 390 | 0 |
| Footer logo tab mobile | 172×96 | 172×96 @ 390 | 0 |

\*Scrollbar-adjusted; see note above.

### Page content (deferred)

- Placeholder hero (“The app skeleton is running…”), shell check band, and footer marketing copy/layout vs `1:476` / `120:12593` (not shell).
- Menu overlay marketing block (“Your next ride starts here…”) vs `1:5237` — CMS/marketing task.

---

## `/login`

### Shell — within 2 px

| Element | Figma (`120:9900`) | Measured | Δ |
|--------|-------------------|----------|---|
| Header | 96 h | 96 @ 390 / 1440 | 0 |
| Logo mobile | x=142.5 | x=143 | ≤1 |
| Main gutter | 358 @ x=16 | 358 @ x=16 @ 390 | 0 |
| Main centered @ 1440 | — | 358 @ x=541 (= center) | — |

### Page content (deferred)

| Element | Figma | Measured | Δ |
|--------|-------|----------|---|
| Form block top | y≈**159.5** | main y=**96** (flush under header) @ 390 | **~63 px** — login page layout / vertical centering, not header shell |
| Form fields, Google button, tyre illustration (`120:9920`) | full design | skeleton form | content task |

---

## `/admin` (signed in as admin)

### Shell — within 2 px (or documented exception)

| Element | Figma (`120:645`) | Measured @ 1440 | Δ |
|--------|-------------------|-----------------|---|
| Panel | 240, 25 · **1165**×… | 240, 25 · **1165**×851 | 0 position/w; h viewport |
| Topbar | **1164**×112 | **1165**×112 | **+1 px** width (≤2 px — no fix) |
| Sidebar width | 240 | 240 | 0 |
| Logo block (`120:739`) | 112 h | 112 h @ y=25 | 0 |
| Logo → nav gap | 43 | 43 | 0 |
| Mobile shell header | — (no Figma frame) | 96 h @ 390 | per tokens |
| Mobile sheet | sidebar 240 | 240×*vh* @ 390 open | matches `--width-admin-sidebar` |

### Page content / product (deferred)

- Dashboard placeholder vs stat cards + table (`120:651`–`120:736`).
- Topbar display name **Admin** vs Figma **Brittle Fence** (session data).
- Sidebar **7** links (includes **Website content**) vs Figma **6** (product scope).
- Notification bell block not implemented (topbar content).

### Proof @ 390 and 1440

- **`h1` count:** 1 on `/admin`.
- **Duplicate `[id]`:** none observed in CDP checks.
- **Dev-only:** Next.js hydration overlay referenced `admin-sidebar.tsx` (nav) on `/admin` @ 390 — treat as follow-up (likely nav active-state / SSR); not a measured layout Δ.

---

## Wide viewports (1920 & 2560)

| Check | 1920 | 2560 |
|-------|------|------|
| Horizontal scroll (`scrollWidth` vs `innerWidth`) | No (`1905` vs `1920`, scrollbar only) | No |
| Public header/footer container alignment | `header > div` and `footer .mx-auto` same **x=0, w=1905** | Footer container **x=320, w=1920** centered; logo **x=376** (= 320+56) aligns with footer card **x=376** |
| Admin capped & centred | `max-w-[--container-max]` shell **w=1920, x=0** (fills cap) | Inner admin shell **w=1920, x=320**; panel **x=560** (= 320+240 sidebar) |

Public site: header **background** spans full viewport width at 2560; **content** uses `Container` (`max-w: 1920px`) so logo/footer insets stay aligned above 1920.

---

## Horizontal scroll sweep (home)

| Viewport | `scrollWidth` | Overflow |
|----------|---------------|----------|
| 390 | 390 | No |
| 1440 | 1425 (client) | No vs `innerWidth` |
| 1920 | 1905 | No |
| 2560 | 2560 | No |

(360 / 768 / 1023 not re-run in this pass; prior build verified no overflow on `/admin` @ 390.)

---

## Fixed in this task

**Nothing.** All shell measurements matched Figma within **2 px**, or matched known token/spec choices (menu height, panel height, 1 px topbar).

---

## Remains

1. **Login** vertical layout (~63 px) and full form vs Figma `120:9900`.
2. **Home / menu** marketing and hero vs Figma frames.
3. **Admin dashboard** body, notifications, and Figma sample name.
4. **Extra admin nav item** (Website content).
5. **Hydration warning** on `/admin` in dev (investigate `AdminNavList` / sidebar SSR).
6. **Optional:** document QA procedure “compare at `clientWidth` or hide scrollbar” for 1440 sign-off.
