# 05 — Setup and preparation

Work through this file top to bottom. Part A is done once by the project owner. Part B is done by every developer.

## Part A — Accounts and access (project owner, one-time)

| # | Service | What to create | Output to collect |
|---|---|---|---|
| 1 | **GitHub** | Repo `ride-out-gh` (exists). Protect `main`: require PR + passing checks | – |
| 2 | **Supabase** | Two projects: `ride-out-dev` and `ride-out-prod`. Region: London (`eu-west-2`) or Frankfurt (`eu-central-1`). We found no Africa region in Supabase's published list, so confirm the live options in the New Project form | Project URL, **publishable key** (`sb_publishable_…`), **secret key** (`sb_secret_…`), project ref. Don't use the legacy `anon` / `service_role` keys: Supabase deprecates them by the end of 2026 |
| 3 | **Supabase Auth → Google** | Google Cloud OAuth client (Web). Redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback` | Client ID + secret, pasted into Supabase |
| 4 | **Supabase Auth → URL config** | Site URL plus redirect URLs: `http://localhost:3000/**`, `https://*.vercel.app/**`, production domain | – |
| 5 | **Resend** | Account, verify the sending domain (DNS records) | API key, from-address |
| 6 | **Cloudflare Turnstile** | Site widget for localhost, preview and production domains | Site key + secret key |
| 7 | **Vercel** | Import the GitHub repo, add env vars for Preview (dev Supabase) and Production (prod Supabase) | – |
| 8 | **Domain** | Buy or point the client's domain at Vercel. Needed for email sending too (Q7) | – |
| 9 | **Figma** | Give developers a **Dev** or **Full** seat. View seats hit the Figma MCP call limit quickly | – |

## Part B — Local developer setup

### 1. Tools

```bash
node --version
```
Node 20 LTS or newer (Node 24 is installed on the planning machine). The Supabase CLI is installed as a dev dependency in step 4 and run with `npx supabase`. Docker is only needed if you want a fully local Supabase. By default we develop against the hosted `ride-out-dev` project.

### 2. Scaffold Next.js into this repo

`create-next-app` refuses to run in a non-empty folder, so scaffold into a temp folder and copy it in without overwriting our docs:

```bash
npx create-next-app@latest ride-out-tmp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes
```

```bash
rsync -a --ignore-existing --exclude .git ride-out-tmp/ ./ && rm -rf ride-out-tmp
```

This installs Next.js 16 (tested with 16.4.3) and generates an `AGENTS.md` that tells AI tools to read the docs bundled in `node_modules/next/dist/docs/`. Keep that file and commit it. It also sets `cacheComponents: true` in `next.config.ts`; leave that on, because the CMS caching relies on it (see [08-cms.md](08-cms.md)).

### 3. Add shadcn/ui

```bash
npx shadcn@latest init -d -b radix
```
`-d` accepts the defaults (Next.js template, Nova preset, Neutral base colour, CSS variables) and `-b radix` uses Radix primitives, which gives style `radix-nova`. Without `-b radix` the CLI now picks Base UI instead, and its component props differ (for example `asChild`), so don't mix the two. The theme is replaced in Phase 0 task 0.2.

```bash
npx shadcn@latest add -y button input textarea label select radio-group checkbox field dialog sheet tabs table badge card dropdown-menu separator breadcrumb calendar popover sonner skeleton avatar progress sidebar command pagination
```
`field` replaces the old `form` component. `npx shadcn add form` now exits successfully but installs nothing, so don't use it. `field` also installs `input-group`, and `sidebar` installs `tooltip`.

### 4. Install app dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr zod react-hook-form @hookform/resolvers @tanstack/react-table date-fns next-intl resend @marsidev/react-turnstile
```

For the CMS (rich text editor and drag-to-reorder lists):

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @dnd-kit/core @dnd-kit/sortable
```

```bash
npm install -D supabase prettier prettier-plugin-tailwindcss
```

### 5. Environment variables

```bash
cp .env.example .env.local
```
Fill in the values from Part A. **Never commit `.env.local`.** `SUPABASE_SECRET_KEY` is server-only: never prefix it with `NEXT_PUBLIC_` and never import it into a client component.

### 6. Database

```bash
npx supabase init
```
Creates `supabase/config.toml`. Our `supabase/migrations/` folder is kept as it is.

```bash
npx supabase login
```

```bash
npx supabase link --project-ref <ride-out-dev-ref>
```

```bash
npx supabase db push
```
This applies `supabase/migrations/*` to the dev project.

```bash
npx supabase gen types typescript --linked > src/lib/supabase/database.types.ts
```
Re-run the type generation after every migration.

### 7. Create the first Super Admin

1. Run the app and sign up at `/sign-up` with the client's admin email.
2. In the Supabase SQL editor for that project, run:

```sql
update public.profiles set role = 'super_admin' where email = 'CLIENT_ADMIN_EMAIL';
```

### 8. Run

```bash
npm run dev
```
Then open http://localhost:3000.

## Part C — Preparation checklist before development starts

- [ ] Client has answered the questions in [07-open-questions.md](07-open-questions.md)
- [ ] Design tokens (colours, fonts, radii) exported from Figma Assets page `4:723` into `globals.css`
- [ ] Logo (SVG) and hero/background images exported from Figma into `public/`
- [ ] Font files licensed and added. Check that the heading font's licence allows web use
- [ ] Client knows which copy is missing from Figma (7 FAQ answers, About and how-it-works descriptions; see [08-cms.md](08-cms.md) section 4). The Client Policy page is designed in Figma (frame `1:3772`) but its wording couldn't be read from the file, so copy it from the frame or have the client supply it. They'll enter it themselves in the CMS during Phase 5
- [ ] At least one client staff member is named as the website content editor
- [ ] French translations provided, if French is in scope (Q8)
- [ ] 10–20 real vehicles with photos ready for launch seeding
- [ ] Google OAuth consent screen published (not "Testing") before launch
- [ ] Resend domain verified, and sender `no-reply@<domain>` works

## Part D — Deploy

- Every PR gets a Vercel Preview pointed at `ride-out-dev`.
- Merging to `main` deploys Production pointed at `ride-out-prod`.
- To release a migration, run `npx supabase link --project-ref <prod-ref>` and then `npx supabase db push` **before** merging code that depends on it.
