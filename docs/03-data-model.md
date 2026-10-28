# 03 — Data model

The schema is in two migrations. **They have not yet run on a real Supabase project.** The first `npx supabase db push` to `ride-out-dev` is that test. If it reports an error, stop and fix the SQL before building anything on top of it.

[`supabase/tests/locked_rules.sql`](../supabase/tests/locked_rules.sql) checks the locked identity, status, overlap, and currency rules against a local Postgres with stand-in `auth` and `storage` schemas. Run it with [`supabase/tests/run-locked-rules.sh`](../supabase/tests/run-locked-rules.sh). The CMS migration is applied in that same run. Its own publish and draft checks are not in the repo.

## Entity overview

```
auth.users ─1:1─ profiles (role: customer | admin | super_admin)
     │
     └─0..1:1─ customers (CUS-1001) ─┬─< vehicle_orders (RO-1042) ─< order_status_history
                                     ├─< rental_bookings (RB-2041) ─< rental_status_history
                                     └─< sell_submissions (SL-1001)

vehicles (VEH-001) ─< vehicle_images
     ├─< rental_bookings
     ├─< vehicle_orders (only for listing_purchase)
     └─< saved_vehicles >─ auth.users

internal_notes → exactly one of: vehicle_orders | rental_bookings | customers
contact_messages, business_settings (single row), notification_preferences
```

## Tables

| Table | Purpose | Notes |
|---|---|---|
| `profiles` | One row per signed-up user | Created by trigger on `auth.users` insert. Only admins can change `role` |
| `customers` | CRM record shown in the admin Customers module | Email is required and unique. `user_id` is null for guests. The sign-up trigger links the row when the account email matches. Phone is not a match key |
| `vehicles` | Inventory for sale **or** rent | `listing_status`: draft / published / hidden. Only `published` rows are public. A published sale car must have `sale_price`; a published rental must have `rental_daily_rate` |
| `vehicle_images` | Photos per vehicle | Stored in the `vehicle-images` bucket. One `is_cover` image per vehicle |
| `saved_vehicles` | Customer "Saved" tab | |
| `vehicle_orders` | Import, sourcing and listing-purchase requests | `service_type` decides which status pipeline applies (below). A check constraint rejects a status from the other pipeline. `budget_currency` is the customer's currency. `estimated_price` is always GHS |
| `rental_bookings` | Rental requests and bookings | `daily_rate` and `security_deposit` are copied from the vehicle. `rental_days` and `estimated_subtotal` are generated. An exclusion constraint blocks overlapping confirmed, ready-for-pickup, and active bookings of the same car |
| `sell_submissions` | "Sell your car" form | Up to 9 photo paths in the private `sell-photos` bucket. This does not create a vehicle. Staff retype it into inventory to list it |
| `contact_messages` | Contact form | Not a customer record |
| `internal_notes` | Admin-only notes on orders, bookings and customers | No customer RLS policy, so customers can never read them |
| `*_status_history` | Timeline for progress trackers | Written by triggers on every status change |
| `business_settings` | Settings → Business profile, Vehicle & rental defaults | Single row (`id = true`) |
| `notification_preferences` | Settings → Notifications | One row per admin per event |
| `content_pages` | CMS: editable website content, one JSON document per page | Admin-only table. Public reads go through `get_published_content()`. See [08-cms.md](08-cms.md) |
| `content_page_revisions` | CMS: snapshot on every publish | Used for history and restore |
| `media_assets` | CMS: media library | Alt text required. Max 8 MB |

## Status pipelines

Keep these in `src/lib/status.ts` as the single source for labels, step order and which admin tab each status belongs to.

### Vehicle orders: import / sourcing (`find_and_purchase`, `import_found_car`)

| Step | `status` | Customer label | Admin tab |
|---|---|---|---|
| 1 | `enquiry` | Enquiry | New enquiries |
| 2 | `reviewing` | Reviewing | Active |
| 3 | `confirmed` | Confirmed | Active |
| 4 | `sourcing` | Sourcing | Active |
| 5 | `purchased` | Purchased | Active |
| 6 | `in_transit` | In transit | Active |
| 7 | `customs_clearance` | Customs clearance | Active |
| 8 | `delivered` | Delivered | Completed |

The customer view shows 8 steps. The admin progress component (`120:5440`) shows 7 and leaves out *Customs clearance*. The schema uses 8, including Customs clearance. That is locked (Q2). The admin tracker still has to show the step the design omitted.

> **Assumption:** the admin tabs in Figma are *New enquiries / Active / Completed / All*, but the design doesn't say which status belongs to which tab. The "Admin tab" column below is our proposal (Q20).

### Vehicle orders: listing purchase (`listing_purchase`)

| Step | `status` | Label | Admin tab |
|---|---|---|---|
| 1 | `inquiry_received` | Inquiry received | New enquiries |
| 2 | `availability_confirmed` | Availability confirmed | Active |
| 3 | `purchase_arrangements` | Purchase arrangements | Active |
| 4 | `vehicle_handover` | Vehicle handover | Completed |

### Rental bookings

| Step | `status` | Customer label | Admin tab |
|---|---|---|---|
| 1 | `inquiry_received` | Inquiry received | New enquiries |
| 2 | `confirmed` | Confirmed | Upcoming |
| 3 | `ready_for_pickup` | Ready to pickup | Upcoming |
| 4 | `active` | Active rental | Active rentals |
| 5 | `returned` | Returned | Past bookings |

`cancelled` is a terminal state on both orders and rentals (Q12, locked). The design doesn't show it. Staff use it to close dead leads. It belongs under "Past bookings" / "All". It does not block rental dates.

## Dashboard KPIs (derive with queries; never store them)

| Card | Query |
|---|---|
| New vehicle enquiries | `vehicle_orders` where status in (`enquiry`, `inquiry_received`) |
| Active vehicle orders | `vehicle_orders` where status is not a first step, final step or `cancelled` |
| Rental enquiries | `rental_bookings` where status = `inquiry_received` |
| Upcoming rentals | `rental_bookings` where status in (`confirmed`, `ready_for_pickup`) |
| Inventory: Total / Available / For sale / For rent | `vehicles` counts by `availability_status` and `listing_purpose`. Status values are locked in Q9 |
| Customers: Total / Active | `customers` count, and count where `is_active` |
| Customer "Recorded spending" | Not defined in the design. Confirm the formula (Q5) |

## Storage buckets

| Bucket | Public | Who writes | Who reads |
|---|---|---|---|
| `vehicle-images` | Yes | Admins (RLS) | Anyone |
| `site-media` | Yes | Admins (RLS) | Anyone (CMS images) |
| `sell-photos` | No | Server action (service role) | Admins via signed URL |
| `id-documents` | No | Server action (service role) | Admins via signed URL (60 s) |

Upload rules:
- **`vehicle-images`, `sell-photos`, `id-documents`:** images only (`image/jpeg`, `image/png`, `image/webp`), max 8 MB each. Resize client-side to a 2000 px long edge before upload.
- **`site-media` (CMS):** `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, max 8 MB each. **Do not resize**, because hero images need to be at least 2× their Figma width (e.g. 2880 px wide for the 1440 px hero). Render SVGs only through `<img>`, never inline.
