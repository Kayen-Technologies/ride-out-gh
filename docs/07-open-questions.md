# 07 — Open questions for the client

Each answer changes what gets built. Items marked **Default** show what we'll build if there's no answer by the start of the phase listed.

Q2, Q9, Q11, Q12, and Q13 are locked. They are already enforced by `supabase/migrations/20261028000000_init.sql`. Changing one needs a new migration. Q1 stays open on whether guests may submit at all; while guests are allowed, email is required on buy, rent, import, and sell.

| # | Question | Why it matters | Default if unanswered | Needed by |
|---|---|---|---|---|
| Q1 | Can customers submit buy / rent / import / sell requests **without an account**? | The forms collect contact details, which suggests yes. The profile shows "My Requests", which needs an account | Guests allowed. Email is required. The sign-up trigger links the request. Phone does not | Phase 3 |
| Q2 | Does the import process include **Customs clearance** as a step? Customer view shows 8 steps, admin view shows 7 | Status list and tracker | **Decided:** 8 steps, including Customs clearance. The admin tracker shows it too | Decided |
| Q3 | Where should staff see **Sell your car** submissions and **Contact** messages? No dashboard screen exists | Without a screen, these leads are only visible in email | Simple `/admin/inbox` page | Phase 5 |
| Q4 | Who are the admin users, and do you need different permissions for "Admin" vs "Super Admin"? | Role design. No staff-management screen exists | Super Admin is created by script. All admins have full access | Phase 1 |
| Q5 | What does **"Recorded customer spending"** include: completed purchases only, rentals, deposits? | Customer profile KPI | Delivered order prices + returned rental subtotals | Phase 4 |
| Q6 | How long should **Ghana Card** images be kept after a rental ends? | Personal data under Ghana's Data Protection Act, 2012 (Act 843) | Delete 90 days after the booking is returned or cancelled | Phase 3 |
| Q7 | What **domain** will the site use, and who controls its DNS? | The site needs it, and so does sending email from an address other than Gmail | Use `*.vercel.app` until provided | Phase 5 |
| Q8 | Is **French** required at launch? Who supplies the translations? | Footer shows En / Fr | English only at launch. The i18n structure is ready for French | Phase 5 |
| Q9 | What are the **vehicle availability status** options in the "Update status" dialog? | Inventory filtering | **Decided:** Available, Booked, Rented, Under maintenance, Unavailable, plus Sold for sale listings | Decided |
| Q10 | What are the options for **"Negotiable?"** (sell form) and **Vehicle condition** (sell form)? | Dropdown values | Negotiable: Yes / Slightly / No. Condition: Excellent / Good / Fair / Needs repair | Phase 3 |
| Q11 | Does rental offer a **"with driver"** option, and at what price? | Booking shows "Driver option: Self drive" | **Decided:** Self drive and With driver. No extra price field | Decided |
| Q12 | Should cancelled orders and bookings be possible? The design has no cancelled state | Closing dead leads | **Decided:** Admins can set Cancelled. It is not a customer-facing step | Decided |
| Q13 | Customer "My Requests" shows rental IDs as `RO-…`. Should rentals use `RB-…` like the dashboard? | Consistent reference codes | **Decided:** `RB-` for rentals, `RO-` for orders, including on My Requests | Decided |
| Q14 | Do you want online **payment / deposits** now or later? | Not in the design | Out of scope. Payment arranged offline | – |
| Q15 | Are the About page stats (500+ vehicles delivered, 5+ years, 1000+ customers, 100+ rented) final and accurate? | Public claims customers will rely on | Use as designed. Client confirms before launch | Phase 5 |
| Q16 | Should the designer add Figma frames for the **Website content (CMS)** screens, or is the standard dashboard style fine? | Look and feel of the editor | Build with existing dashboard components | Phase 4b |
| Q17 | Where does the **"Why Choose Us"** section (frame `1:2932`) appear, Homepage or About? Slide 04 has no content | It's designed but not placed on any page frame | About page, slides 01–03 only until slide 04 copy is supplied | Phase 2 |
| Q18 | Who may **publish** website content: every admin, or Super Admin only? Should there be an "editor" role that can only edit content? | Prevents unreviewed changes going live | All admins can edit and publish. Every publish is logged with the person's name and can be rolled back | Phase 4b |
| Q19 | Is the **Client Policy** wording in the Figma design final? It is laid out as an outline plus 6 sections, but its text couldn't be read from the file | The policy is a legal agreement customers accept before importing a car | Copy the wording from Figma frame `1:3772` into the CMS. Client confirms before launch | Phase 5 |
| Q20 | Which order and rental statuses belong in each admin tab (New enquiries / Active / Completed / All; New / Upcoming / Active rentals / Past bookings / All)? | The design shows the tabs but not the rule for filling them | The mapping in the "Admin tab" columns of [03-data-model.md](03-data-model.md) | Phase 4 |
