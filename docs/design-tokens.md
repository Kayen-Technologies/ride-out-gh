# Design tokens

Figma is the source of truth. **The Figma file has no variables or styles of its own.** Its brand values are raw colours, fonts and sizes. This file records what the file actually uses, so `src/app/globals.css` can be built from evidence and not from guesses.

- File: `dmoIAsFN5cXluPaEzqWPzC`. Website page `1:4`, Dashboard page `120:530`.
- Method: every node on both pages was read with the Plugin API (12,146 nodes on Website, 7,927 on Dashboard). Counts below are **how many nodes or characters use a value**, not a designer's labels. A value with a role marked *unverified* needs a designer's confirmation.
- About 1,150 Website nodes and 1,545 Dashboard nodes are bound to variables from an **imported third-party UI kit** (spacing, radius, Inter 14/16, `#101828` shadow). Those variables are not Ride Out brand tokens. Do not copy their names.

## 1. Colour

### Brand

| Token | Value | Evidence |
|---|---|---|
| `--primary` | `#FFD400` | 130 Website fills, 134 Dashboard fills, 215 Dashboard strokes (selected and focus) |
| `--primary-foreground` | `#1E1E1E` | 106 Website text fills on yellow |
| `--destructive` | `#E12121` | 41 Dashboard text (Log out), 82 Dashboard strokes |
| `--ring` | `#FFD400` | Yellow stroke on selected and focused states |

### Surfaces (dark theme)

| Token | Value | Evidence | Where |
|---|---|---|---|
| `--background` (website) | `#111111` | 34 top-level Website frames (14 are `#000000`) | Public site page background |
| `--background` (admin) | `#000000` | The `ADMIN - Dashboard` frame and its `Sidebar` frame, 153 fills | Admin shell |
| `--card` | `#1C1C1C` | 53 Website fills (car card, profile tabs, outline containers), 100 Dashboard fills (content cards) | Cards |
| `--surface-raised` | `#232323` | 38 Website fills | Nested panels. Role unverified |
| `--surface-3` | `#333333` | 27 Website fills (selection, photo frames) | Role unverified |
| `--surface-4` | `#404040` and `#4B4B4B` | 51 and 50 Website fills (image containers) | Placeholders. Role unverified |
| `--surface-inset` | `#101010` | 54 Dashboard fills | Role unverified |
| `--popover` | `#323232` | 10 Dashboard dropdown frames (status dropdowns) | Menus and dropdowns |
| `--sidebar` | `#000000` | Dashboard `Sidebar` frame | Admin sidebar |
| `--sidebar-accent` | `#262626` | 19 Dashboard `Sidebar button` frames | Active menu item |
| `--surface-light` | `#FFFFFF` with text `#1E1E1E` | 431 Website fills, white buttons | White buttons and cards. Text on white is `#1E1E1E` (106) and `#303030` (101) |

### Text

| Token | Value | Evidence |
|---|---|---|
| `--foreground` | `#FFFFFF` | 826 Website text fills, 1,367 Dashboard text fills |
| `--text-70` | White 70% | 102 Website, 89 Dashboard |
| `--muted-foreground` | White 60% | 54 Website |
| `--text-50` | White 50% | 120 Website, 58 Dashboard |
| `--text-subtle` | `#8F9FA3` | 215 Website text fills. Role unverified |

### Borders and fills

| Token | Value | Evidence |
|---|---|---|
| `--input` (fill) | White 20% | 128 Website, 82 Dashboard |
| `--input-border` | White 50%, 1 px | 124 Website strokes, 60 Dashboard |
| `--border` (dividers, tables, cards) | White 20%, 1 px | 28 Website, 78 Dashboard strokes |
| `--border-subtle` | White 10% | 14 Website strokes (10%), 31 Dashboard strokes (15%) |
| `--border-strong` | `#FFFFFF`, 1 to 2 px | Mostly icon strokes (605 Dashboard). Do not use for UI borders |

Two border strengths exist (20% for dividers, 50% for form fields). The code needs both.

### Not in Figma

- **No success, warning or info palette.** The only other colours are on form inputs and social logos (`#019939` green, `#1751D0` blue, `#32FF00`, `#FF0004`), 4 nodes each. Do not invent status colours. Ask the designer.
- **No chart colours.** Remove `--chart-1..5` until a chart is designed.
- Yellow variants `#FCCA07`, `#FBCB09`, `#F8CF41` (24 to 32 fills each) are likely gradients or hover states. Role unverified.

## 2. Typography

### Families (as designed)

| Family | Usage | Shippable on the web |
|---|---|---|
| SF Pro (Regular, Medium, Semibold, Bold) | Almost all text | **No.** It is an Apple font. Choose a substitute |
| SF Pro **Expanded** (Regular, Medium, Semibold) | Website headings (24, 32, 48, 56 px) | **No.** No free font matches the Expanded width |
| Inter | UI-kit components (inputs, hint text): 1,419 Dashboard and 330 Website characters (Regular 14/20) | Yes |
| Poppins | Dashboard, 751 characters (Medium 16, SemiBold 14). Role unverified | Yes |
| Figtree | Regular 16/24: 479 Website and 109 Dashboard characters. Role unverified | Yes |

### Scale in use

| Role | Font | Size / line height | Letter spacing | Evidence |
|---|---|---|---|---|
| Body medium | SF Pro Medium | 16 / 150% and 14 / 150% | −2% | 5,085 and 5,063 Website characters |
| Body | SF Pro Regular | 16 / 150% and 14 / 150% | −1% | 2,789 and 2,161 Website characters |
| Dashboard body | SF Pro Regular 16 / 120%, Medium 14 / 120% | 0 | 0 | 4,786 and 3,671 Dashboard characters |
| Caption | SF Pro Regular | 12 / 140% (Website), 12 / 120% (Dashboard) | 0 | 666 and 1,530 characters |
| Heading 2 | SF Pro Expanded Semibold | 24 / 110–130% | 0 | 17, 13 and 8 Website nodes |
| Heading 1 | SF Pro Expanded Semibold | 32 / 110–130% | 0 | 15, 11 and 7 Website nodes |
| Display | SF Pro Expanded Medium 48 / 100% (+1 px), Regular 56 / 100% (−1) | | | 12 and 6 Website nodes |
| Dashboard titles | SF Pro Regular, Semibold or Medium | 20, 24 and 32 / 120% | 0 | 91, 55 and 49 Dashboard nodes |
| Dashboard figures | SF Pro Bold 26 / 110% | | −2% | 85 characters |

Line height is 150% on the website and 120% on the dashboard. Keep two sets, one per surface.

## 3. Radius

Figma uses these values (count): 100 (479) and 1000 (154) and 9999 (89) all mean **pill**, 8 (312 Website, 388 Dashboard), 12 (322 Dashboard, 29 Website), 6 (226 Website), 16 (48), 20 (58), 24 (21), 40 (43), 4 (76), 2 (136).

| Token | px |
|---|---|
| `--radius-xs` | 4 |
| `--radius-sm` | 6 |
| `--radius-md` | 8 |
| `--radius-lg` | 12 |
| `--radius-xl` | 16 |
| `--radius-2xl` | 20 |
| `--radius-3xl` | 24 |
| `--radius-4xl` | 40 |
| `--radius-full` | 9999 |

Use fixed pixel values, not multiples of one base radius.

## 4. Buttons

| Surface | Height | Radius | Fill | Count |
|---|---|---|---|---|
| Website call-to-action | 48 | Pill | `#FFD400` | 26 |
| Website outline | 48 | Pill | None | 12 |
| Website compact | 40 and 38 | Pill | `#FFD400` | 8 and 9 |
| Website destructive | 44 | 6 | `#E12121` | 5 |
| Website white | 42, 40 | 6 and 7 | `#FFFFFF` | 4 and 4 |
| Dashboard default | 36 | 8 | None (outline) | 246 |
| Dashboard white | 36 | 8 | `#FFFFFF` | 22 |
| Dashboard muted | 36 | 8 | `#262626` | 19 |
| Dashboard call-to-action | 40 | Pill | `#FFD400` | 13 and 8 |

The code needs a 48 px and a 40 px pill, and a 36 px, 8 px-radius button for the dashboard.

## 5. Effects

| Token | Value | Evidence |
|---|---|---|
| `--shadow-xs` | 0 1 2, `#101828` at 5% | 98 Website, 39 Dashboard (from the UI kit) |
| `--shadow-card` | 0 1.5 4, `#0A090B` at 7% | 15 Website |
| `--blur-glass` | Background blur 10 px (navigation, 16 nodes). Other values: 19.7, 30.6 and 47 px | Role unverified |
| Inner highlight | Inner shadow 4 px white | 58 Website. Role unverified |

## 6. Spacing and layout

Use Tailwind's 4 px grid. Most common gaps: 8 (953), 10 (613), 16 (417), 24 (284), 6 (214), 32, 40, 4, 12. Off-grid values to ignore or round: 13, 17, 27. Frame widths: 1440 (18 frames) for desktop, 390 (37 frames) for mobile.

## 7. Open decisions

1. **Web font substitute for SF Pro and SF Pro Expanded.** Owner and designer to choose. Headings will not match Figma exactly whatever is picked.
2. **Admin background is `#000000`.** Confirm with the designer.
3. **Status colours.** Confirm whether order and rental statuses need distinct colours. Figma shows none.
4. **Unverified roles** above (surface-raised, surface-3, surface-4, surface-inset, text-subtle, yellow variants, glass blur).
