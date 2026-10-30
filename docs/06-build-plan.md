# 06 — Build plan for Cursor

Build in this order. Each phase ends in a working, deployable state. Give Cursor **one task at a time**. Paste the prompt, review the diff, run it, then move on.

Every prompt assumes Cursor has the Figma MCP connected and reads `.cursor/rules/ride-out.mdc` automatically.

---

## Phase 0 — Foundation (≈4 days)

| Task | Cursor prompt | Done when |
|---|---|---|
| 0.1 Scaffold | "Follow docs/05-setup.md Part B steps 2–4 exactly." | `npm run dev` shows the Next.js starter |
| 0.2 Theme | "Read Figma variables from node 4:723 (file dmoIAsFN5cXluPaEzqWPzC) with get_variable_defs. Map them to shadcn CSS variables in src/app/globals.css, dark theme as default. Add the fonts with next/font. Do not invent values. List any token you could not find." | Buttons, inputs and cards match the Figma colours and fonts |
| 0.3 Supabase clients | "Create src/lib/supabase/{server,client,public,admin,proxy}.ts using @supabase/ssr and the env names in .env.example. public.ts is a plain supabase-js client with the publishable key and no cookies (for cached reads). admin.ts uses SUPABASE_SECRET_KEY and must import 'server-only'. Add src/proxy.ts (Next.js 16 renamed middleware.ts to proxy.ts; export function proxy) that refreshes the session using supabase.auth.getClaims(), redirects /account/* to /login when signed out, and redirects /admin/* unless the profile role is admin or super_admin. Never trust supabase.auth.getSession() on the server." | Signed-out visit to /admin redirects to /login |
| 0.4 DB + types | "Run the migration and generate types per docs/05-setup.md step 6. Create src/lib/status.ts from the pipeline tables in docs/03-data-model.md." | Types compile. `status.ts` exports label, step and tab maps |
| 0.5 Application shell | See the sub-tasks 0.5a–0.5f below. Spec: docs/09-app-shell.md | Every route renders inside the right shell, and no page sets its own width, gutter or section padding |
| 0.6 CMS content layer | "Apply migration 20261028000100_cms.sql. Create src/features/cms/registry.ts using the content inventory in docs/08-cms.md section 4, with Figma text as defaults and maxLength per the rule. Create getPageContent(page, locale) that calls get_published_content, caches with 'use cache' + cacheTag('cms:<page>') + cacheLife('max') using the cookie-free client in src/lib/supabase/public.ts (cached functions cannot read cookies), and deep-merges over registry defaults. Add a seed script that writes the defaults into every page's draft and published content. Build the header and footer from 'global' content." | Header and footer render from the CMS. Emptying a field in the database falls back to the Figma default. **From here on, every public page reads its copy from the CMS** |

### Task 0.5 — Application shell (spec: [09-app-shell.md](09-app-shell.md))

Figma is the source of truth. Run one sub-task at a time and compare screenshots at 1440 and 390 px before moving on.

| Task | Cursor prompt | Done when |
|---|---|---|
| 0.5a Shell tokens | "Read docs/09-app-shell.md. Add the shell tokens from section 3 to src/app/globals.css. Do not hard-code them in components." | Tokens exist and are used by the next tasks |
| 0.5b Container and Section | "Create src/components/layout/container.tsx and section.tsx per section 4. Container: max 1920 (--container-max), centred, gutter 16 / 64. Section: full-bleed band with a background prop and vertical padding 56 / 80." | One example page uses both and matches 1440 and 390 px |
| 0.5c Site shell | "Rebuild the (site) layout per docs/09-app-shell.md: header (4:418, mobile 120:12596), the menu overlay (1:5235) with scrim and right panel, and the footer (1:2458). Menu items and footer text keep coming from the CMS `global` page." | Overlay opens, traps focus, closes on Escape and scrim. Footer matches the frame. Read the mobile footer frame first |
| 0.5d Admin shell | "Rebuild the /admin layout per docs/09-app-shell.md: black canvas capped at 1920, 240 px sidebar with logo, icons and the active state (120:737), the rounded 1C1C1C panel (120:646), the top bar (120:674), and an <AdminPage> wrapper. Remove the 'Signed in as' line." | Active link follows nested routes. Log out works |
| 0.5e Responsive behaviour | "Add the admin slide-over navigation below lg (section 5) and check the site header and footer between 390 and 1440 px." | No horizontal scroll from 360 to 1920 px. Keyboard can reach everything |
| 0.5f Shell QA | "Screenshot /, /login and /admin at 1440 and 390 px and compare each with its Figma frame. List every difference over 2 px." | Differences are fixed or listed with a reason |

## Phase 1 — Auth and accounts (≈2 days)

| Task | Prompt hint | Done when |
|---|---|---|
| 1.1 | Sign up, log in, forgot/reset password, verify email from section 120:9658 | Email and Google sign-in both work. Profile row is created |
| 1.2 | Confirm a guest `customers` row with the same email is linked by the sign-up trigger in the init migration. Do not match on phone | A guest who signs up sees their earlier requests |
| 1.3 | Seed the Super Admin per docs/05-setup.md step 7 | The admin can reach /admin |

## Phase 2 — Inventory: admin first, then public (≈5 days)

| Task | Prompt hint | Done when |
|---|---|---|
| 2.1 | Admin inventory list with KPIs and All/For sale/For rent tabs (120:3449). TanStack data table with search | List shows seeded vehicles |
| 2.2 | 4-step Add Vehicle wizard for sale and rent (frames in docs/04). One zod schema per step. Image upload to `vehicle-images` with drag-to-reorder and cover pick. "Save as draft" and "Publish" | Both success dialogs appear. Data is saved correctly |
| 2.3 | Vehicle detail + Edit + Hide listing + Availability status dialog (120:4411, 120:4635, 120:4579) | A hidden vehicle disappears from the public site |
| 2.4 | `/buy` listing with filters and sort, from URL search params (1:3047). Server-rendered | Filters are shareable by URL |
| 2.5 | `/buy/[slug]` detail with gallery, specs, condition card, save button (1:3568) | Matches design at 1440 and 390 px |
| 2.6 | Homepage (1:476): hero search goes to `/buy?brand=…&model=…&budget=…`. Featured cars come from `vehicles.is_featured` (add a "Feature on homepage" toggle + order to the vehicle form). All copy and images come from `getPageContent('home')` | Hero search works. Featured cars follow the admin toggle |
| 2.7 | `/rent` + `/rent/[slug]` (1:4420, 1:4175) | Date search filters out cars that already have an overlapping confirmed, ready-for-pickup, or active booking. The database constraint rejects a double book even if the query is skipped |

## Phase 3 — Requests: customer side (≈5 days)

Every form: zod schema in `features/<domain>/schema.ts`, server action in `actions.ts`, Turnstile check, find-or-create customer, insert, email customer and admins, show the success modal from Figma.

| Task | Frames | Done when |
|---|---|---|
| 3.1 Import request, 3 steps + review modal + policy checkbox | 1:2585, 1:2785, 1:2892, 1:3519, 1:3556 | Creates `vehicle_orders` with status `enquiry` |
| 3.2 I'm Interested (car detail) | 1:3568 | Creates `listing_purchase` order with status `inquiry_received` |
| 3.3 Rent request + Ghana Card upload to private bucket | 1:4829, 1:4408 | Creates booking. Image is unreachable without a signed URL |
| 3.4 Sell your car, 4 steps, 9 photos | 1:3916 → 1:4163 | Creates `sell_submissions` |
| 3.5 Contact form | 1:5103 | Creates `contact_messages` |
| 3.6 My Requests + status pages with progress tracker | 130:18045, 130:18303, 130:18415, 130:18484 | Steps match `status.ts`. The current stage is highlighted |
| 3.7 Saved vehicles + empty state | 130:17845, 130:18560 | Save and unsave work from the car card and the detail page |

## Phase 4 — Operations: admin side (≈5 days)

| Task | Frames | Done when |
|---|---|---|
| 4.1 Dashboard KPIs | 120:645 | Numbers match the queries in docs/03 |
| 4.2 Vehicle Orders list + tabs + detail + status update + internal notes + new enquiry dialog | 120:4877 section | A status change shows on the customer's tracker straight away |
| 4.3 Rental Bookings list + tabs + detail + confirm + status + notes + add booking | 120:6126 section | Subtotal = daily rate × days. Ghana Card opens through a signed URL |
| 4.3b "Check vehicle availability" on booking detail | 120:6634 | Flags an overlap with another confirmed, ready-for-pickup, or active booking, or a vehicle that is not `available` |
| 4.4 Customers list + profile tabs + add customer | 120:6942 section | Customer shows all their orders and bookings |
| 4.5 Settings: business, vehicle & rental defaults, notifications, account & security | 120:7602 section | Saved values persist. Password change works |
| 4.6 Email notifications respect `notification_preferences` | – | An admin who turns off an event stops getting that email |

## Phase 4b — Website content editor (CMS) (≈5 days)

Spec: [08-cms.md](08-cms.md). No Figma frames. Build with existing dashboard components.

| Task | Done when |
|---|---|
| 4b.1 `/admin/content` page list with last-published info and "Unpublished changes" chip; sidebar item "Website content" | All 9 pages listed with correct status |
| 4b.2 Page editor generated from the registry: text with live character counter, textarea, link, EN/FR tabs, Save draft | Saving updates the draft only. The public site doesn't change |
| 4b.3 List editor (add, remove, drag-to-reorder, min/max items) for services, steps, stats, FAQs, brand logos | FAQ order on `/import` matches the editor |
| 4b.4 Rich text (Tiptap: paragraphs, H2/H3, bold, italic, lists, links with https/mailto/tel only) + shared renderer | Policy page renders the edited text. A `javascript:` link is rejected |
| 4b.5 Media library + image picker: upload to `site-media`, required alt text, recommended size hint per slot, "used on" list, delete only if unused | Replacing the homepage hero image works end to end |
| 4b.6 Publish (RPC, then `updateTag('cms:<page>')` inside the Server Action), stale-edit message, History dialog with Restore to draft | A published change is live in under 10 seconds without a redeploy. Two-tab edit conflict shows the reload message |
| 4b.7 Preview with Next.js Draft Mode and a "Preview — not published" banner | Admin sees draft. A signed-out visitor never does |
| 4b.8 Per-page SEO fields wired to `generateMetadata` | Changing the SEO title updates the page `<title>` after publish |

## Phase 5 — Gap fill, polish, launch (≈4 days)

| Task | Done when |
|---|---|
| 5.1 `/admin/inbox` for sell submissions and contact messages (no Figma; reuse the Vehicle Orders table and detail styling) | Admins can view, set status and see photos |
| 5.2 Client team enters the missing copy (Client Policy wording if it isn't copied from Figma, FAQ answers, About descriptions) **themselves in the CMS**, as a hands-on training session | Final client copy is published. Staff can edit without help |
| 5.3 i18n En/Fr with next-intl, if in scope | Switching language changes all UI strings |
| 5.4 SEO: metadata per page, OG image per vehicle, `sitemap.ts`, `robots.ts` | Lighthouse SEO ≥ 95 |
| 5.5 Accessibility and responsive pass | Keyboard-navigable forms. No horizontal scroll at 390 px |
| 5.6 Launch: prod Supabase, `db push`, env vars, domain, Google OAuth published, seed real vehicles | Production smoke test passes (checklist below) |

## Launch smoke test

1. Guest submits each of the 5 forms. Customer and admin emails both arrive.
2. Admin moves an import order through all statuses. Customer tracker updates at each step.
3. Admin confirms a rental. The car stops appearing for those dates in `/rent` search.
4. A Ghana Card image URL copied from the network tab does not open in a private window.
5. A customer account cannot load `/admin` or another customer's `/account/requests/[code]`.
6. Admin edits the homepage hero title, previews it, publishes it, sees it live, then restores the previous version from History.

**Estimated total: about 30 developer-days** (Phase 0: 4 + Phase 1: 2 + Phase 2: 5 + Phase 3: 5 + Phase 4: 5 + Phase 4b: 5 + Phase 5: 4) for one developer working with Cursor. The CMS adds 6 days: 1 for the content layer in Phase 0 and 5 for the editor. The estimate excludes content and translation delays from the client.
