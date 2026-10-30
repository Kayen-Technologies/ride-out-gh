# 09 — Application shell

The shell is everything around page content: page container, header, menu, footer, admin sidebar, admin top bar, content area, and how they respond to screen size. Every page is built inside it. Get it right once, and no page repeats layout code.

**Figma is the source of truth.** All numbers below were read from the Figma file (`dmoIAsFN5cXluPaEzqWPzC`) on 2026-10-30: Website page `1:4`, Dashboard page `120:530`. A value marked *assumption* is not in Figma and needs a designer's answer.

## 1. What Figma defines

Only two widths are designed: **1440 px desktop** and **390 px mobile**. There is no tablet frame. Every admin frame is 1440 px wide, so **the admin has no mobile design**.

### Public site

| Part | Spec (Figma node) |
|---|---|
| Page canvas | 1440 wide, background `#111111`. Sections are full-bleed, 1440 wide (`1:476`) |
| Max container | **1920 px** (owner decision, 2026-10-30). Figma is drawn at 1440, so between 1440 and 1920 the layout grows with the same gutters. Section backgrounds run edge to edge at every width |
| Header (`4:418`) | 1440 × 112, fill `#000000`, padding 32 top and bottom, 56 left and right, logo (105 × 48) left, controls right, vertically centred |
| Header controls | Two pills, 48 × 40, fill white 10%, radius 100, padding 8/12, gap 8: menu button and account button |
| Header, mobile (`120:12596`) | 390 × 96, fill `#000000`, padding 24 top and bottom, 16 left and right |
| Menu overlay (`1:5235`) | Full-viewport layer: scrim `#000000` at 50%, and a right-hand panel 819 wide, fill `#000000` at 78%, padding 40. Opens from the menu button on desktop and mobile |
| Content gutter | **64 px** on desktop for section content (car brands, importation, services). Mobile: **16 px** (`120:12605`, `120:14334`) |
| Section vertical padding | Desktop 80 (`1:2215`). Mobile 56 (`120:14362`, `120:14468`) |
| Footer (`1:2458`) | 1440 × 735, fill `#111111`. Inside it, a black card 1328 × 545 (margin 56 each side) holds the columns, with a black logo tab (269 × 111) on the card's top edge |

### Admin dashboard

| Part | Spec (Figma node) |
|---|---|
| Canvas | 1440 wide, background `#000000` (`120:645`) |
| Sidebar (`120:737`) | 240 wide, fill `#000000`, top offset 25, bottom padding 24, gap 16 |
| Sidebar logo block | 240 × 112, padding 8/24, logo 138 × 63 |
| Sidebar items | Container padding 0/24. Item: 192 × 36, padding 8/12, gap 8, radius 8, icon 20, label 14 px. Vertical pitch 52 (36 + gap 16) |
| Active item | Fill white 15%, icon and label `#FFD400` |
| Inactive item | No fill, icon and label `#FFFFFF` |
| Log out | Bottom of the sidebar. 240 × 36, padding 8/36, label `#E12121` |
| Items in Figma | Dashboard, Inventory, Vehicle Orders, Rental Bookings, Customers, Settings |
| Content panel (`120:646`) | Starts at x 240 and y 25, 1165 wide, fill `#1C1C1C`, **radius 40**. That leaves 25 above and 35 to the right |
| Top bar (`120:674`) | Inside the panel. 1164 × 112, padding 32 top and bottom, bottom border `#4B4B4B`. Header row 47 high, padding 0/24/0/40 |
| Top bar, left | Breadcrumb ("Workspace / Dashboard", 12 px) above the page title (24 px) |
| Top bar, right | Notification tile 40 × 40 (fill `#EFF4FA`, radius 6), a 40 px divider, then user block (149 × 40) |
| Page content | Starts at x 40 inside the panel. Width 1092 (about 40 left, 33 right). Vertical gap between blocks 24 |
| Cards | Padding 24. Two-column grid, each 534 wide, gap 24 |
| Table card | Border white 20% 1 px, radius 12, header 80 high, row padding 24/32 |

## 2. What the code does today

| Area | Today | Figma | Gap |
|---|---|---|---|
| Page container | None. Each page sets its own width | 1920 max (owner decision), 64 gutter | Missing |
| Site header | Black, 56 px side padding, 32 px vertical, logo, menu and account pills, drop-down menu | Same, plus full-viewport overlay with right panel | Menu is a drop-down, not the overlay |
| Site footer | Black bar, 56 px padding, three text columns | `#111111`, with a black rounded-corner card and logo tab | Layout differs |
| Admin sidebar | 256 wide, `bg-sidebar`, text-only links, active item solid yellow, "Ride Out" text | 240 wide, logo, icons, active item white 15% with yellow text | Differs |
| Admin content | `max-w-3xl` column, debug "Signed in as" line | Rounded `#1C1C1C` panel, top bar, 1092 content | Missing |
| Admin on small screens | Top bar with a menu toggle below `md` | Not designed | Assumption below |

## 3. Shell tokens

Add these to `src/app/globals.css` as theme variables. Do not hard-code them in components.

| Token | Value | Source |
|---|---|---|
| `--container-max` | 1920px | Owner decision. The Figma frame is 1440 |
| `--gutter` | 16px mobile, 64px from `lg` | `120:12605`, `1:2372` |
| `--gutter-nav` | 16px mobile, 56px from `lg` | `4:418`, `120:12596` |
| `--section-y` | 56px mobile, 80px from `lg` | `120:14468`, `1:2215` |
| `--header-h` | 96px mobile, 112px from `lg` | `120:12596`, `4:418` |
| `--menu-panel-w` | 819px (full width on mobile) | `1:5250` |
| `--admin-sidebar-w` | 240px | `120:737` |
| `--admin-panel-radius` | 40px | `120:646` |
| `--admin-panel-top` | 25px | `120:646` |
| `--admin-panel-right` | 35px | `120:646` |
| `--admin-topbar-h` | 112px | `120:674` |
| `--admin-content-px` | 40px left, 32px right | `120:651` |

Colours (`#111111`, `#000000`, `#1C1C1C`, `#4B4B4B`) come from [design-tokens.md](design-tokens.md).

## 4. Components and files

```
src/components/layout/
  container.tsx          <Container>: max 1920, centred, gutter
  section.tsx            <Section>: full-bleed band, background prop, vertical padding, inner Container
src/components/site/
  site-shell.tsx         header + main + footer
  site-header.tsx        bar only
  site-menu-overlay.tsx  scrim + right panel (client)
  site-footer.tsx        footer card
src/components/admin/
  admin-shell.tsx        black canvas, max 1920, sidebar + panel
  admin-sidebar.tsx      desktop sidebar
  admin-mobile-nav.tsx   slide-over (Sheet) for small screens
  admin-topbar.tsx       breadcrumb, title, notifications, user menu
  admin-page.tsx         <AdminPage title breadcrumb actions> wrapper for page content
```

Rules:
- Pages never set their own max width, gutter, or section padding. They use `<Section>` and `<Container>` (site) or `<AdminPage>` (admin).
- Page titles and breadcrumbs for admin pages are props on `<AdminPage>`, not typed into each page.
- The shell reads its copy (menu items, footer text) from the CMS `global` page and business settings. It does not hard-code them.
- Layouts contain no stray `max-w-3xl`, `px-4`, or `py-10` wrappers. Width, gutter and padding come only from the shell tokens.

## 5. Behaviour

| Behaviour | Spec |
|---|---|
| Site header | In normal flow at the top. Same layout at every width, with padding switching at `lg` (1024) |
| Menu overlay | Opens from the menu button, closes on the close button, scrim click, Escape, or navigation. Locks page scroll while open. Traps focus. Returns focus to the button on close |
| Admin at `lg` and up | Sidebar fixed to the viewport height on the left. Content panel scrolls. Whole shell capped at 1920 and centred, with black on either side |
| Admin below `lg` | *Assumption.* Sidebar hidden. A top bar shows the logo and a menu button that opens the same navigation in a slide-over. The panel loses its 40 px radius and its offsets. Content padding is 16 |
| Active link | Matches the current route and its children (`/admin/orders/RO-1042` keeps "Vehicle Orders" active) |
| Log out | Calls the sign-out action. Works without JavaScript |
| Loading | The shell renders immediately. Page content streams in under `<Suspense>` with a skeleton, not a blank screen |
| Auth | The admin layout redirects signed-out users to `/login` and non-staff to `/`. The proxy remains the first check |

## 6. Assumptions and open points

Each needs a designer's or the client's answer. The default shows what Cursor builds meanwhile.

| # | Open point | Default |
|---|---|---|
| S1 | No tablet frames. Is a fluid layout between 390 and 1440 acceptable? | Yes. One switch at `lg` (1024) |
| S2 | No admin mobile or tablet frames | Slide-over navigation as above |
| S3 | Content gutter is 64 on the left but 56 on the right in several sections, and nav and footer use 56 | Use 64 both sides for content, 56 for header and footer, as designed |
| S4 | Admin panel is 25 from the top and 35 from the right. Probably unintended | Build the exact values, flagged with a comment |
| S5 | Mobile footer not yet read | Read frame `120:12593` before building it |
| S6 | Mobile header is 96 high on the homepage (`120:12596`) and 75 on `Mobile-template` (`120:10632`) | 96, from the homepage |
| S7 | "Website content" and `/admin/inbox` are not in the Figma sidebar | Add after Customers, before Settings |
| S8 | The notification tile is a light `#EFF4FA` block in a dark UI, and no notification feature is planned | Leave it out until notifications exist |
| S9 | The shell is capped at 1920 on large monitors (owner decision). Figma shows nothing between 1440 and 1920, so the designer should check a wide screen | Capped at 1920. The admin shows black either side, the site shows the section colours edge to edge |
| S10 | Figma shows no sticky or fixed header behaviour | Site header scrolls away. Admin sidebar stays fixed |
