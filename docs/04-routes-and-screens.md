# 04 — Routes and screens

Every route maps to a Figma frame. Before building a screen, open its link or call `get_design_context` with the node ID on file `dmoIAsFN5cXluPaEzqWPzC`.

Base URL: `https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?m=dev&node-id=`

## Public site: primary page links (confirmed by the client team)

| Page | Route | Desktop node | Figma link |
|---|---|---|---|
| Homepage | `/` | `1:476` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-476&m=dev) |
| Buy (car listing) | `/buy` | `1:3047` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-3047&m=dev) |
| Car detail (for sale) | `/buy/[slug]` | `1:3568` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-3568&m=dev) |
| Import enquiry | `/import` | `1:2549` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-2549&m=dev) |
| Client policy | `/policy` | `1:3772` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-3772&m=dev) |
| Rent (rental listing) | `/rent` | `1:4420` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-4420&m=dev) |
| About | `/about` | `1:4862` | [open](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File?node-id=1-4862&m=dev) |

## Public site: all screens

| Route | Screen | Desktop | Mobile (390 px) |
|---|---|---|---|
| `/` | Homepage: hero search (brand, model, budget), body-type tabs, featured cars, services, CTA | `1:476` | `120:12593` |
| – | How it works steps (homepage carousel) | `1:2507`, `1:2528` | `120:14728`, `120:14749` |
| – | Why choose us / values (horizontal) | `1:2932` | – |
| `/buy` | Listing with filters (brand, model, min/max price, min/max year), sort, "Help me find a car" CTA | `1:3047` | `120:16313`, filters `120:16129` |
| `/buy/[slug]` | Gallery, specs, Features & Specs, Vehicle Condition, **I'm Interested** form, save button | `1:3568` | `120:14588` |
| `/rent` | Search (pickup address, pickup date, return date), body-type tabs, filters (brand, model, min/max price per day) | `1:4420` | `120:14770`, filters `120:12109` |
| `/rent/[slug]` | Rental car detail, price per day, **Request this car** | `1:4175` | `120:12247` |
| `/rent/[slug]` modal | Request this car: contact + Ghana Card | `1:4829` | `120:12462` |
| – | Rental request success | `1:4408` | `120:12541`, `120:12495` |
| `/import` | Hero, how it works, 3-step vehicle request form, FAQs | `1:2549` | `120:15693` |
| `/import` steps 2–3 | Budget & preferences, contact details | `1:2785`, `1:2892` | `120:15945`, `120:16051`, `120:16090` |
| `/import` modal | Review your request + policy checkbox | `1:3519` | `120:11895`, `120:11931` |
| – | Import success | `1:3556` | `120:16505` |
| `/sell` | Hero + 4-step sell form | `1:3891`, `1:4006`, `1:4039`, `1:4128` | `120:15441`, `120:15504`, `120:15535`, `120:15616` |
| – | Sell success | `1:4163` | `120:15648` |
| `/about` | About, stats, story (horizontal scroll), services | `1:4862`, `16:8396` | `120:15107` |
| `/contact` | Contact details + enquiry form | `1:5103` | `120:14972` |
| `/policy` | Client policy | `1:3772` | `120:11980` |
| – | Header menu dropdown | `1:5235`, `1:5280` | `120:12553` |

## Auth (section `120:9658`, mobile frames)

| Route | Screen | Node |
|---|---|---|
| `/sign-up` | Create account (name, email, password, Google) | `120:9884` |
| `/verify-email` | Email verification | `120:10601` |
| `/login` | Log in | `120:9900` |
| `/forgot-password` | Forgot password | `120:10589` |
| `/reset-password` | Password reset | `120:9921`, `120:10540` |
| `/auth/callback` | Supabase redirect handler (no UI) | – |

## Customer account (section `130:16998`, mobile frames)

| Route | Screen | Node |
|---|---|---|
| `/account/saved` | Saved vehicles | `130:17845` |
| – | "Remove saved vehicle?" confirmation dialog | `130:17937` |
| – | Saved vehicles empty state ("No saved vehicles yet") | `130:18560` |
| `/account/requests` | My Requests list | `130:18045` |
| – | My Requests empty state ("No requests yet") | `130:18245` |
| `/account/requests/[code]` | Request status: import | `130:18303` |
| `/account/requests/[code]` | Request status: purchase | `130:18415` |
| `/account/requests/[code]` | Request status: rent | `130:18484` |
| `/account/settings` | Account Settings ("Manage your personal details and password", Save Changes). Open the frame for the exact fields | `130:18140` |

## Admin dashboard (page `120:530`)

| Route | Screen | Node |
|---|---|---|
| `/admin` | KPI overview | `120:645` (variants `120:791`, `120:935`) |
| `/admin/inventory` | All vehicles | `120:3449` |
| `/admin/inventory?tab=sale` / `?tab=rent` | For sale / For rent tab variants | `120:3663`, `120:3841`, `120:4037`, `120:4251` |
| – | Inventory frames with almost no content, probably empty states (sale / rent) | `120:1213`, `120:1083` |
| `/admin/inventory/new?purpose=sale` | Add vehicle (sale), steps 1–4 | `120:1538`, `120:1969`, `120:2349`, `120:2732`, `120:3205` |
| `/admin/inventory/new?purpose=rent` | Add vehicle (rent), steps 1–4 | `120:1343`, `120:1733`, `120:2192`, `120:2506`, `120:2958` |
| – | Success: listed / saved as draft | `120:4809`, `120:4828`, `120:4843`, `120:4862` |
| `/admin/inventory/[id]` | Vehicle detail (sale / rent) | `120:4411`, `120:4635` |
| – | Availability status dialog | `120:4579`, `120:4609` |
| `/admin/orders` | Tabs: New / Active / Completed / All | `120:4878`, `120:5056`, `120:5540`, `120:5702`, `120:5848` |
| `/admin/orders/[code]` | Order detail + progress + notes | `120:5252` |
| – | Update order status dialog | `120:5488` |
| – | New vehicle enquiry dialog | `120:6091` |
| `/admin/rentals` | Tabs: New / Upcoming / Active / Past / All (Figma layer names say "Vehicle Orders", but these are rental screens) | `120:6127`, `120:6307` |
| `/admin/rentals/[code]` | Booking detail + confirm + notes | `120:6469` |
| `/admin/rentals/[code]` | Booking detail with **Availability check** panel ("Check vehicle availability") | `120:6634` |
| – | Booking status dialogs | `120:6805`, `120:6845` |
| – | Add rental booking dialog | `120:6889` |
| `/admin/customers` | Customer list | `120:6987` |
| `/admin/customers/[id]` | Overview / Vehicle orders / Rental bookings tabs | `120:7150`, `120:7312`, `120:7440` |
| – | Add customer dialog | `120:7568` |
| `/admin/settings` | Settings index | `120:7603` |
| `/admin/settings/business` | Business profile | `120:7746` |
| `/admin/settings/vehicle-rental` | Vehicle & rental defaults | `120:7886` |
| `/admin/settings/notifications` | Notifications | `120:8010` |
| `/admin/settings/account` | Account & security | `120:8146` |
| `/admin/inbox` | Sell submissions + contact messages. **No frame. Gap fill (Q3)** | – |
| `/admin/content` | Website content: list of editable pages. **No frame (Q16)** | – |
| `/admin/content/[page]` | Page editor: draft, preview, publish, history | – |
| `/admin/content/media` | Media library | – |
| `/api/preview` + `/api/preview/exit` | Turn Next.js Draft Mode on and off (admin only) | – |

## Responsive rule
Desktop frames are 1440 px and mobile frames are 390 px. Build mobile-first with Tailwind breakpoints. Where only a desktop frame exists (admin), the dashboard must still work at 1024 px. Below `md`, collapse the sidebar into a shadcn `Sheet`.
