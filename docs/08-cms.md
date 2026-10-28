# 08 — Website content management (CMS)

Ride Out staff can change website text, images, FAQs, stats, policy and SEO from the admin dashboard. No developer, code change or redeploy is needed. Published changes go live within seconds.

> **Design status:** The Figma file has **no CMS screens**. Build them with the existing dashboard components (sidebar, cards, inputs, tabs, dialogs, status chips from page `120:530`). Ask the designer for frames if the client wants a custom look (Q16).

## 1. What staff can and can't edit

| Editable in **Website content** | Edited elsewhere in the dashboard | Stays in code (developer change) |
|---|---|---|
| Headings, paragraphs and button labels on every public page | Cars, prices, photos, specs → **Inventory** | Layout, colours, fonts, spacing |
| Hero and section images, with alt text | Homepage featured cars → **Inventory** ("Feature on homepage" toggle + order) | Form fields, validation messages |
| Lists: services, how-it-works steps, About stats, story, FAQs, car brand logos | Phone numbers, email, address, Instagram, TikTok → **Settings → Business profile** | Request status names and steps (they drive the trackers) |
| Client Policy page (rich text) | | Admin dashboard text |
| SEO title, description and share image per page | | |
| French versions of all of the above (optional per field) | | |

That split keeps the client in control of anything a visitor reads, while making sure nobody can accidentally break a form or a status tracker.

## 2. How it works

```
src/features/cms/registry.ts     ← defines every editable page, section and field:
                                   type, label, help text, max length, image size, Figma default
        │
        ├── Admin editor (/admin/content/[page]) is generated from the registry
        │       Save draft → content_pages.draft
        │       Publish   → publish_content_page() → content_pages.published + revision
        │                    → updateTag('cms:<page>')  (live in seconds)
        │
        └── Public pages call getPageContent('<page>')
                → 'use cache' + cacheTag('cms:<page>') + cacheLife('max')
                → get_published_content('<page>') via a cookie-free Supabase client
                → merged over registry defaults, so a page is never blank
```

**Caching notes (Next.js 16):**
- `'use cache'` needs `cacheComponents: true` in `next.config.ts`. `create-next-app` 16.4 sets it, so nothing extra is needed. Don't remove it.
- A `'use cache'` function cannot read `cookies()` or `headers()`, so it must use the plain publishable-key client (`src/lib/supabase/public.ts`), never the cookie-based server client.
- `updateTag` can only be called from a Server Action. Publishing is one, so staff see the change immediately. From a route handler or webhook use `revalidateTag(tag, 'max')`.
- Caching is an optimisation, not a correctness requirement. If a cache entry is missing (for example on serverless), the page simply reads the one small `get_published_content` call from Supabase.
- With Draft Mode on, Next.js re-runs cached functions on every request. Preview should read the draft through a separate **uncached** path that first confirms the viewer is an admin.

### Key decisions

1. **The registry is in code and the values are in the database.** Developers decide *what* is editable and how it's limited. Staff decide *what it says*. The editor UI is generated from the registry, so adding a new editable field is one registry entry.
2. **One JSON document per page,** with draft and published copies (`content_pages`). Publishing is a single atomic step, so a half-saved page can't go live, and preview simply reads the draft.
3. **Every publish saves a revision.** Staff can view history and restore an older version into the draft, check it, then publish.
4. **Two people editing the same page can't overwrite each other.** Each save carries the version it started from. If someone else published in between, the editor shows "Content was changed by someone else. Reload and try again."
5. **Drafts never reach the public.** The `content_pages` table is admin-only. The public site reads through `get_published_content()`, which returns published content only.
6. **Figma copy is the default.** Every field's default value is the exact text from Figma. A seed step fills drafts with those defaults on first deploy, so staff open a pre-filled editor. If a field is ever emptied, the site falls back to its default.
7. **Text length limits protect the layout.** Each field's `maxLength` is the Figma default length × 1.3, rounded up to the next 5. The editor shows a live character counter. This stops a long headline from overflowing or being cut off on mobile.
8. **Rich text is limited and safe.** The Policy page and FAQ answers use a Tiptap editor with paragraphs, H2/H3, bold, italic, bullet and numbered lists, and links only. It's stored as JSON, not raw HTML. Links may only use `https:`, `mailto:` or `tel:`.
9. **Images go through a media library** (`media_assets` + public `site-media` bucket). Alt text is required (accessibility and SEO). JPEG, PNG, WebP or SVG only, max 8 MB. The editor shows the recommended size for each slot, e.g. the homepage hero is 1440 × 854 in Figma, so upload at least 2880 × 1708 for sharp display on retina screens.
10. **Bilingual-ready.** Each text field has **EN** and **FR** tabs. French is optional and falls back to English (ties to Q8).

## 3. Admin screens (no Figma; reuse dashboard components)

| Route | Screen | Contents |
|---|---|---|
| `/admin/content` | Website content | Card per page: name, last published date and by whom, "Unpublished changes" chip, Edit button |
| `/admin/content/[page]` | Page editor | Sections as accordions. Fields by type (input with counter, textarea, rich text, image picker, link, list editor with drag-to-reorder). EN/FR tabs. Sticky action bar: **Save draft**, **Preview**, **Publish**, **History** |
| `/admin/content/[page]` dialog | History | List of revisions (date, who). **Restore to draft** |
| `/admin/content/media` | Media library | Grid of images, upload, edit alt text, see where each image is used, delete only if unused |

Add **Website content** to the sidebar between **Customers** and **Settings**, using the same icon style.

**Preview** uses Next.js Draft Mode. It opens the real page with draft content and a fixed banner reading "Preview — not published. Exit preview". Only admins can turn it on.

## 4. Content inventory (default values from Figma)

Field types: **T** = short text, **P** = paragraph, **B** = button label, **I** = image + alt, **L** = list, **R** = rich text. "Figma default" is copied verbatim from the design.

### `global` — header and footer (every page)

| Section.field | Type | Figma default |
|---|---|---|
| `footer.title` | T | More than cars. A simpler way to move. |
| `footer.body` | P | Buy your next car, rent one for your plans, or get the support you need to buy and sell with confidence. |
| `footer.copyright` | T | © 2026 — CopyrightAll Rights reserved *(typo in Figma: no space after "Copyright". Fix on seed: "© 2026 — Copyright. All rights reserved.")* |
| `footer.explore_links` | L | Auction assistance · Buy · Sell · Rent |
| `menu.items` | L | Home · buy · importation request · sell · rent · about · contact us |
| `menu.tagline_title` / `menu.tagline_body` | T / P | Your next ride starts here. / Buy or rent a car in Ghana, or get help buying from Copart. |
| Phones, email, address, socials | – | From **Settings → Business profile**: +233 57 078 6961, +233 55 754 1169, rideoutgh1@gmail.com, Tackie Tawiah St., Tema Comm. 4 |

### `home` — Homepage (`1:476`)

| Section.field | Type | Figma default |
|---|---|---|
| `hero.title` | T | Your next ride starts here. |
| `hero.subtitle` | P | Buy or rent a car in Ghana, or get help buying from Copart. |
| `hero.image` | I | Hero background (1440 × 854) |
| `brands.logos` | L of I | Car brand logo strip (`1:491`) |
| `import.title` | T | Import cars, SUVs, pickups & more. |
| `import.body` | P | Whatever kind of vehicle you're looking for, Ride Out can help you source and import it. Tell us what you need and we'll help you explore your options. |
| `import.primary_cta` / `import.secondary_cta` | B / B | Start an import request / View our Policy |
| `search.title` | T | Find your next ride |
| `search.view_all_cta` | B | View all cars |
| `services.title` | T | Our Services |
| `services.body` | P | Whether you're looking to rent a car, buy one through Copart, or sell the one you already own, Ride-Out gives you a simpler way to make your next move. |
| `services.items` | L | 01 Buy through Copart · "Get help buying, shipping and repairs" · *Help me find a car* / 02 Sell your car · "Submit your car and connect with buyers" / 03 Rent a car · "Explore rental cars and request dates you need" · *Explore Rentals* |
| `how_it_works.title` / `.subtitle` | T / P | How Ride Out works / Getting your next vehicle starts with three simple steps. |
| `how_it_works.steps` | L | Tell us what you're looking for · We'll help you find your car ("We work with you to identify a suitable vehicle and coordinate the purchase and import process.") · Get ready for the road ("Follow the next steps toward receiving your vehicle, with optional repair support for vehicles imported through Ride-Out.") *Step 1 body is not in Figma; client to supply* |
| `cta.title` | T | Ready for your next move? |
| `cta.body` | P | Whether you're looking to rent a car, buy one through Copart, or sell the one you already own, Ride-Out gives you a simpler way to make your next move. |
| `cta.button` | B | Explore our fleet |
| Featured cars | – | From **Inventory**, cars with "Feature on homepage" turned on |

### `about` — About (`1:4862`)

| Section.field | Type | Figma default |
|---|---|---|
| `hero.title` | T | More than cars. A simpler way to move. |
| `hero.body` | P | From finding the right car to getting it where you need it, Ride-Out brings the essential parts of your automotive journey together in one place. |
| `hero.cta` | B | Get to know Ride-Out |
| `vision.title` | T | A better automotive experience, for everyone. |
| `vision.body` | P | We envision a world where accessing the right vehicle and the services around it is simpler, more connected, and more accessible. |
| `vision.stats` | L | 500+ Delivered · 5+ Experienced · 1000+ Trusted · 100+ On the road, each with its Figma description *(client to confirm figures, Q15)* |
| `story.eyebrow` / `story.title` | T / T | Our Story / The road to the right car shouldn't be complicated. |
| `story.paragraphs` | L of P | 2 paragraphs from frame `16:8396` |
| `what_we_do.title` / `.subtitle` | T / T | What we do / One destination. Multiple ways to move. |
| `what_we_do.items` | L | Rent a Car · Buy & Sell · Import & Auction Assistance · Repairs & Buying Guidance *(Figma has one body text, shown on "Buy & Sell": "Discover vehicles that fit your needs or take the next step toward selling your car through Ride-Out." Client to supply the other three)* |
| `why_choose_us.title` / `.body` | T / P | Why Choose Us / We're committed to providing the best vehicle rental experience through innovation, quality, and exceptional customer service. *(frame `1:2932`; page placement not shown in Figma. Confirm, Q17)* |
| `why_choose_us.items` | L | 01 A clearer way forward · 02 Support when it matters · 03 Choices that fit you, each with a one-line description and 3 bullet points. *Slide 04 is numbered in Figma but has no content; client to supply* |
| `cta.*` | T/P/B | Same defaults as the homepage CTA |

### `buy`, `rent`, `sell`, `import`, `contact`, `policy`

| Page.section.field | Type | Figma default |
|---|---|---|
| `buy.hero.title` / `.body` | T / P | Find a car that's right for you. / Browse available cars from Ride-Out and private sellers. Search by make, model, budget, and more to find your next ride. |
| `buy.still_looking.title` / `.body` / `.cta` | T / P / B | Still looking for something specific? / Tell us what you're looking for and we'll help you explore your options. / Help me find a car |
| `rent.hero.title` / `.body` | T / P | A ride for your plans. / Explore available rental cars and find one that fits your dates, plans, and budget. |
| `sell.hero.title` / `.body` / `.cta` | T / P / B | Ready to sell your car? Let's make it simple. / Connect your vehicle with potential buyers through Ride-Out. Share a few details about your car, and we'll help you take the next step. / Sell Your Car |
| `import.hero.title` / `.body` | T / P | Import cars, SUVs, pickups & more. / Find, purchase, and import your preferred vehicle with Ride-Out. Tell us what you're looking for, and we'll help you navigate the process from sourcing to importation. |
| `import.form_intro.title` / `.body` | T / P | Let's find your next car. / Tell us a little about the vehicle you're looking for. We'll use your answers to understand your needs and determine the next steps. |
| `import.faqs.title` / `.subtitle` | T / P | Frequently asked questions / A few things to know before getting started. |
| `import.faqs.items` | L (category, question, R answer) | 8 questions in 3 categories (Getting started · Purchase & import · After import). **Only "How does Ride-Out work?" has an answer in Figma; client to supply the other 7** |
| `import.faqs.cta_title` / `.cta` | T / B | Still have questions? / Contact our team |
| `contact.hero.title` / `.body` / `.cta` | T / P / B | We're here to help you move forward. / Have a question about buying, selling, renting, or importing a vehicle? Reach out to our team, and let's help you find the right way forward. / Get in touch with us |
| `contact.talk.title` / `.body` | T / P | Talk to us. / Choose your preferred way to reach us, or send us a message using the form. |
| `policy.title` / `.intro` | T / P | Client Policy / Everything you need to know before starting your vehicle importation journey with Ride Out. |
| `policy.sections` | L (title, R body) | Frame `1:3772` is designed as a left outline (table of contents) plus 6 content sections, about 4,400 px of content. **The wording couldn't be read from the layer data** (it shows only placeholder labels), so copy it from the frame or have the client supply it. Generate the outline from the section titles |

### SEO (every page)

`seo.title` (T, max 60), `seo.description` (P, max 160), `seo.image` (I, 1200 × 630). Defaults are the page hero title and body, and the hero image.

## 5. Database

Migration: [`supabase/migrations/20261028000100_cms.sql`](../supabase/migrations/20261028000100_cms.sql). It's tested: 15 checks covering draft privacy, admin-only publish, stale-edit protection, revisions and restore, and media rules.

| Object | Purpose |
|---|---|
| `content_pages` | One row per page: `draft`, `published`, `has_unpublished_changes`, `version` |
| `content_page_revisions` | Snapshot on every publish |
| `publish_content_page(page, version)` | Atomic publish with stale-edit check |
| `restore_content_revision(id)` | Copies a revision into the draft |
| `get_published_content(page)` | The only public read path |
| `media_assets` + `site-media` bucket | Media library with required alt text |
| `vehicles.is_featured`, `featured_order` | Homepage featured cars |
| `business_settings.instagram_url`, `tiktok_url` | Footer socials |

## 6. Packages

```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @dnd-kit/core @dnd-kit/sortable
```
