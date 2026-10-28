# 06 — Build plan for Cursor

Build in this order. Each phase ends in a working, deployable state. Give Cursor **one task at a time**. Paste the prompt, review the diff, run it, then move on.

Every prompt assumes Cursor has the Figma MCP connected and reads `.cursor/rules/ride-out.mdc` automatically.

---

## Phase 0 — Foundation (≈3 days)

| Task | Cursor prompt | Done when |
|---|---|---|
| 0.1 Scaffold | "Follow docs/05-setup.md Part B steps 2–4 exactly." | `npm run dev` shows the Next.js starter |
| 0.2 Theme | "Read Figma variables from node 4:723 (file dmoIAsFN5cXluPaEzqWPzC) with get_variable_defs. Map them to shadcn CSS variables in src/app/globals.css, dark theme as default. Add the fonts with next/font. Do not invent values. List any token you could not find." | Buttons, inputs and cards match the Figma colours and fonts |
| 0.3 Supabase clients | "Create src/lib/supabase/{server,client,public,admin,proxy}.ts using @supabase/ssr and the env names in .env.example. public.ts is a plain supabase-js client with the publishable key and no cookies (for cached reads). admin.ts uses SUPABASE_SECRET_KEY and must import 'server-only'. Add src/proxy.ts (Next.js 16 renamed middleware.ts to proxy.ts; export function proxy) that refreshes the session using supabase.auth.getClaims(), redirects /account/* to /login when signed out, and redirects /admin/* unless the profile role is admin or super_admin. Never trust supabase.auth.getSession() on the server." | Signed-out visit to /admin redirects to /login |
| 0.4 DB + types | "Run the migration and generate types per docs/05-setup.md step 6. Create src/lib/status.ts from the pipeline tables in docs/03-data-model.md." | Types compile. `status.ts` exports label, step and tab maps |
| 0.5 Shell layouts | "Build the (site) layout with header (nav-bar in frame 1:476, menu dropdown 1:5235) and footer, and the /admin layout with sidebar from frame 120:645." | Every route renders inside the right shell |
| 0.6 CMS content layer | "Apply migration 20261028000100_cms.sql. Create src/features/cms/registry.ts using the content inventory in docs/08-cms.md section 4, with Figma text as defaults and maxLength per the rule. Create getPageContent(page, locale) that calls get_published_content, caches with 'use cache' + cacheTag('cms:<page>') + cacheLife('max') using the cookie-free client in src/lib/supabase/public.ts (cached functions cannot read cookies), and deep-merges over registry defaults. Add a seed script that writes the defaults into every page's draft and published content. Build the header and footer from 'global' content." | Header and footer render from the CMS. Emptying a field in the database falls back to the Figma default. **From here on, every public page reads its copy from the CMS** |

## Phase 1 — Auth and accounts (≈2 days)

| Task | Prompt hint | Done when |
|---|---|---|
| 1.1 | Sign up, log in, forgot/reset password, verify email from section 120:9658 | Email and Google sign-in both work. Profile row is created |
| 1.2 | On sign-up, link any `customers` row with the same email (server action) | A guest who signs up sees their earlier requests |
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
| 2.7 | `/rent` + `/rent/[slug]` (1:4420, 1:4175) | Date search filters out cars that already have overlapping confirmed or active bookings |

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
| 4.3b "Check vehicle availability" on booking detail | 120:6634 | Flags an overlap with another confirmed or active booking, or a vehicle that is not `available` |
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

**Estimated total: about 29 developer-days** (Phase 0: 3 + Phase 1: 2 + Phase 2: 5 + Phase 3: 5 + Phase 4: 5 + Phase 4b: 5 + Phase 5: 4) for one developer working with Cursor. The CMS adds 6 days: 1 for the content layer in Phase 0 and 5 for the editor. The estimate excludes content and translation delays from the client.
