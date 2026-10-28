# 02 — Architecture

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router) + TypeScript** | One codebase for the public site, customer account and admin dashboard. Server Components keep listing pages fast and SEO-friendly |
| UI | **shadcn/ui (Radix, style `radix-nova`) + Tailwind CSS v4** | Accessible components we own and restyle to match the Figma. Theme tokens live as CSS variables in `globals.css` |
| Forms | **react-hook-form + zod** | One zod schema per form, shared by the client form and the server action |
| Tables | **TanStack Table** (shadcn "data table" pattern) | Admin lists with tabs, filters, search and pagination |
| Database | **Supabase Postgres** | Relational data (vehicles ↔ orders ↔ customers), Row Level Security |
| Auth | **Supabase Auth** | Email + password, Google sign-in, email verification and password reset. All four flows are in the design |
| File storage | **Supabase Storage** | Public bucket for car photos. Private buckets for sell-car photos and Ghana Card images |
| Website content (CMS) | **Built into the admin dashboard**: content stored in Supabase, Tiptap for rich text, dnd-kit for reordering lists | The client edits text and images in the same dashboard they already use. No second tool, login or monthly fee. See [08-cms.md](08-cms.md) |
| Email | **Resend** | Confirmation to the customer and alert to the admin on each new request |
| Bot protection | **Cloudflare Turnstile** | Public forms accept guests and file uploads |
| i18n | **next-intl** | Footer has an En / Fr switch |
| Hosting | **Vercel** | Preview deploy per branch, production on `main` |

## System diagram

```
            ┌──────────────────────── Vercel ────────────────────────┐
 Customer ─▶│  (site)   /, /buy, /rent, /import, /sell, /contact     │
            │  (account) /account/*                                  │
 Admin ────▶│  /admin/*  (role check in proxy + layout)              │
            │                                                        │
            │  Server Actions (zod validate → Turnstile → write)      │
            └───────┬───────────────────────┬────────────────┬────────┘
                    │                       │                │
             Supabase Auth           Supabase Postgres    Resend email
                    │                 (RLS on all tables,
                    │                  CMS content_pages)
                    └──── Supabase Storage: vehicle-images (public)
                                          site-media (public, CMS images)
                                          sell-photos (private)
                                          id-documents (private)
```

## Key decisions

1. **Guests can submit every form.** The forms collect name, phone and email themselves. If the person is signed in, the request links to their account. If not, a `customers` row is created or matched by email or phone, and it links automatically when they later sign up with that email. See Q1.
2. **Public writes go through server actions only.** The server validates with zod, checks Turnstile, then writes with the Supabase **secret key** (`sb_secret_…`; the older `service_role` key is deprecated by Supabase at the end of 2026, so don't use it). There are no anonymous insert policies, so the database can't be written to directly from the browser.
3. **Admins are identified by `profiles.role`** (`admin` or `super_admin`). Three layers enforce it: `src/proxy.ts` redirects (Next.js 16 renamed `middleware.ts` to `proxy.ts`), the `/admin` layout and **every admin Server Action** re-check on the server, and RLS policies call `public.is_admin()`. Proxy alone is never enough: Server Action calls are POST requests to the page's own route, so a proxy matcher that skips a path also skips the actions on it. Each action therefore checks the role itself. On the server, identify the user with `supabase.auth.getClaims()`, never `getSession()` (Supabase warns it can be spoofed).
4. **Ghana Card images never get a public URL.** They go to the private `id-documents` bucket, and admins view them through signed URLs that expire in 60 seconds. This is personal data under Ghana's Data Protection Act, 2012 (Act 843). Confirm the retention period with the client (Q6).
5. **Rental prices are copied onto the booking** when it's created, so editing a car's rate later doesn't change existing bookings. `rental_days` and `estimated_subtotal` are generated columns. For example, 21–24 Oct at GH₵ 650 gives 3 days and GH₵ 1,950, the same as the design.
6. **Status changes are logged automatically** by database triggers into `order_status_history` and `rental_status_history`. The customer progress trackers read from these tables.
7. **No marketing copy is hard-coded.** Every heading, paragraph, image and button label on a public page comes from `getPageContent()` (the CMS), with the Figma text as the fallback default. Published content is cached with `'use cache'` + `cacheTag('cms:<page>')` and expired on publish with `updateTag('cms:<page>')`, so edits go live in seconds without a redeploy. (`create-next-app` 16.4 turns on `cacheComponents: true` in `next.config.ts`; keep it on.) A dedicated headless CMS (Sanity, Contentful) was considered and rejected: it adds a second login, a monthly cost and a separate editing experience for a site with 9 pages.
8. **Money is stored as `numeric(12,2)` in GHS.** Display it with `Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' })`.

## Folder structure

```
ride-out-gh/
├─ .cursor/rules/ride-out.mdc      # Cursor project rules
├─ docs/                           # this documentation
├─ supabase/
│  ├─ migrations/                  # SQL migrations (tested)
│  └─ seed.sql                     # sample vehicles for local dev (create in Phase 2)
├─ public/                         # logo, static images exported from Figma
└─ src/
   ├─ app/
   │  ├─ (site)/                   # public pages, shared header/footer layout
   │  │  ├─ page.tsx               # homepage
   │  │  ├─ buy/  buy/[slug]/
   │  │  ├─ rent/ rent/[slug]/
   │  │  ├─ import/  sell/  about/  contact/  policy/
   │  ├─ (auth)/                   # sign-up, login, forgot/reset password, verify email
   │  ├─ account/                  # saved, requests, requests/[code], settings
   │  ├─ admin/                    # dashboard layout with sidebar
   │  │  ├─ page.tsx               # KPI overview
   │  │  ├─ inventory/ orders/ rentals/ customers/ settings/
   │  │  ├─ content/               # CMS: page list, [page] editor, media library
   │  │  └─ inbox/                 # sell submissions + contact messages (gap fill)
   │  ├─ api/preview/              # CMS draft-mode on/off (admin only)
   │  └─ auth/callback/route.ts    # Supabase OAuth / email-link callback
   ├─ components/
   │  ├─ ui/                       # shadcn components (generated, then themed)
   │  ├─ site/                     # header, footer, vehicle-card, search-bar, stepper
   │  └─ admin/                    # sidebar, kpi-card, data-table, status-chip, notes-panel
   ├─ features/                    # one folder per domain
   │  ├─ vehicles/                 # queries.ts, actions.ts, schema.ts
   │  ├─ orders/  rentals/  customers/  sell/  contact/
   │  ├─ cms/                      # registry.ts (editable fields + Figma defaults), get-page-content.ts, actions.ts
   ├─ lib/
   │  ├─ supabase/                 # server.ts, client.ts, public.ts (no cookies, for cached reads), admin.ts (secret key), proxy.ts (session-refresh helper)
   │  ├─ status.ts                 # status → label/step maps for all pipelines
   │  ├─ format.ts                 # money, dates, codes
   │  └─ email/                    # Resend templates
   ├─ i18n/                        # next-intl messages: en.json, fr.json
   └─ proxy.ts                    # session refresh + route guards (Next.js 16 name for middleware)
```

## Theming (shadcn/ui + CSS)

- The design is **dark-first**: near-black page background, dark-grey cards, a **yellow accent** for primary buttons and active states, and white text.
- Put every colour, radius and font in CSS variables under `:root` in `src/app/globals.css` and map them to shadcn tokens (`--background`, `--foreground`, `--primary`, `--card`, `--muted`, `--border`, `--ring`, `--radius`).
- **Take exact hex values and font families from the Figma Assets page (`4:723`) using `get_variable_defs`.** Don't eyeball them. Screenshots alone weren't precise enough to fill these in, so they're left for Cursor to pull.
- Buttons are pill-shaped (fully rounded). Inputs are dark grey with a 1 px light border.
- Status chips on the dashboard use an outlined yellow pill. Define them once in `components/admin/status-chip.tsx`.
