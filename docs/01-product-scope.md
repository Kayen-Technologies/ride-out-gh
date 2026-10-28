# 01 — Product scope

Ride Out is a car marketplace and services site for Ghana. Customers can buy, rent, sell, and import vehicles. Ride Out staff run everything from an admin dashboard.

Design source: Figma file `dmoIAsFN5cXluPaEzqWPzC` ("Ride Out - Client File").

| Figma page | Page ID | What it contains |
|---|---|---|
| Website | `1:4` | Public site at 1440 px desktop and 390 px mobile, plus auth flow and customer profile |
| Dashboard | `120:530` | Admin dashboard at 1440 px |
| Assets | `4:723` | Logos, icons, components. Pull design tokens from here |
| Bin | `1:3` | Discarded frames. **Do not build from this page** |

---

## 1. Customer-facing website

### Services (from the homepage "Our Services" block)

| # | Service | What the customer does | Creates |
|---|---|---|---|
| 01 | **Buy** | Browse Ride Out cars for sale, open a car, click **I'm Interested** | `vehicle_orders` (`listing_purchase`) |
| 01 | **Buy through Copart / Import** | 3-step form: what you need → budget & preferences → contact details → review & submit | `vehicle_orders` (`find_and_purchase` or `import_found_car`) |
| 02 | **Sell your car** | 4-step form: car details → pricing → up to 9 photos → contact details | `sell_submissions` |
| 03 | **Rent a car** | Search by pickup address and dates, open a car, click **Request this car**, then upload Ghana Card | `rental_bookings` |
| – | **Contact** | Name, phone/WhatsApp, email, message | `contact_messages` |

### Form fields (read from the design)

**Import / "Let's find your next car" (frames `1:2585`, `1:2785`, `1:2892`, summary `1:3519`)**

| Step | Field | Type | Required |
|---|---|---|---|
| 1. Tell us what you need | Service: *Help me find and purchase a car* / *Import a car I've found* | Radio card | Yes |
| | Brand | Text (e.g. Toyota, Mercedes-Benz) | Yes |
| | Model | Text | No |
| | Year range | Text (e.g. 2020 – 2025) | No |
| | Condition: Brand new / Used / I'm open to either | Radio | Yes |
| 2. Budget & preferences | Estimated budget (currency picker, default GHS) | Money | Yes |
| | Budget covers: Vehicle purchase only / Vehicle and import costs / I'm not sure yet | Radio | No |
| | Preferred transmission: Automatic / Manual / No preference | Radio | Yes |
| | Fuel type: Petrol / Diesel / Hybrid / Electric / No preference | Radio | No |
| | Anything else we should know? | Textarea | No |
| 3. Contact details | Full name | Text | Yes |
| | Phone / WhatsApp | Phone | Yes |
| | Email | Email | No |
| Review modal | "I have read and agree to the Ride Out Client Policy" | Checkbox | Yes |

**Sell your car (frames `1:3916`, `1:4006`, `1:4039`, `1:4128`)**

| Step | Fields |
|---|---|
| 1. Tell us about your car | Brand, Model, Year, Mileage (km), Transmission (select), Fuel (select), Vehicle condition (select), Exterior colour |
| 2. Vehicle pricing | Asking price (GHS), Negotiable? (select "price flexibility"), Minimum acceptable price (GHS) |
| 3. Add your photos | 9 upload slots: exterior, interior, dashboard, engine, tyres, any damage |
| 4. Your details | Full name\*, Phone / WhatsApp\*, Email |

**Rent: Request this car (modal `1:4829`)**
Full name\*, Phone / WhatsApp\*, Email, Ghana Card photo upload, Ghana Card number (`GHA-` prefix). Pickup address, pickup date and return date come from the Rent search bar (`1:4420`).

**Car detail: I'm Interested (`1:3568`)**
First name, Last name, Phone, Email.

**Contact (`1:5103`)**
Full name\*, Phone / WhatsApp\*, Email, Message.

### Customer account (section `120:9658` auth, section `130:16998` profile)

- Sign up (name, email, password, or **Sign up with Google**), email verification, log in, forgot password, reset password.
- Profile tabs: **Saved** (saved vehicles, with a "Remove saved vehicle?" confirmation and a "No saved vehicles yet" empty state), **My Requests** (with a "No requests yet" empty state), **Settings** ("Account Settings: Manage your personal details and password").
- Request status pages show a progress tracker for each request type:

| Request type | Steps shown to the customer | Frame |
|---|---|---|
| Vehicle import | Enquiry → Reviewing → Confirmed → Sourcing → Purchased → In transit → Customs clearance → Delivered (8), plus "Latest shipment update" and "Estimated arrival in Ghana" | `130:18303` |
| Vehicle purchase (Ride Out listing) | Inquiry received → Availability confirmed → Purchase arrangements → Vehicle handover (4) | `130:18415` |
| Vehicle rent | Inquiry received → Confirmed → Ready to pickup → Active rental → Returned (5) | `130:18484` |

### Other public pages
Homepage `1:476`, Buy listing `1:3047`, Rent listing `1:4420`, Rent car detail `1:4175`, About Us `1:4862`, Client Policy `1:3772`, menu dropdown `1:5235`, success modals (`1:3556`, `1:4163`, `1:4408`), and mobile filter bottom sheets (`120:12109`, `120:16129`).

Footer has an **En / Fr** language switch. See open question Q8.

---

## 2. Admin dashboard (page `120:530`)

The sidebar has Dashboard, Inventory, Vehicle Orders, Rental Bookings, Customers, Settings and Log out. The signed-in user is shown with a role label, e.g. "Super Admin".

| Module | Section | What admins do | Key frames |
|---|---|---|---|
| **Dashboard** | `120:644` | KPI cards: New vehicle enquiries (awaiting review), Rental enquiries, Active vehicle orders (in progress), Upcoming rentals (confirmed) | `120:645` |
| **Inventory** | `120:1082` | KPIs (Total, Available, For sale, For rent). Tabs: All / For sale / For rent. 4-step Add Vehicle wizard (Basic info → Specifications → Details/Pricing → Review), separate for Sale and Rent. Save as draft or publish. Vehicle detail with **Edit vehicle**, **Hide listing**, **Update availability status** | `120:3449`, `120:1538`, `120:3205`, `120:4411`, `120:4635`, `120:4579` |
| **Vehicle Orders** | `120:4877` | KPIs (New enquiries, Active orders). Tabs: New enquiries / Active / Completed / All. Order detail: customer, estimated price, vehicle origin, service type, customer requirements, **Order progress** tracker, **Update order status**, **Internal notes**. Admins can also create a **New vehicle enquiry** manually | `120:4878`, `120:5252`, `120:5488`, `120:6091` |
| **Rental Bookings** | `120:6126` | KPIs (New enquiries, Upcoming, Active rentals, Past bookings). Tabs to match, with status filter and search. Booking detail: schedule, daily rate, estimated subtotal, security deposit, driver option, **Confirm booking**, **Update status**, **Internal notes**. **Add rental booking** manually | `120:6307`, `120:6469`, `120:6805`, `120:6889` |
| **Customers** | `120:6942` | KPIs (Total, Active, Vehicle orders, Rental bookings). Customer profile with Overview / Vehicle orders / Rental bookings tabs, recorded spending, acquisition source. **Add customer** manually | `120:6987`, `120:7150`, `120:7568` |
| **Website content (CMS)** | *No Figma* | Edit text, images, lists (services, stats, FAQs), Client Policy and SEO for every public page. Save draft, preview, publish, history and restore, media library. Full spec: [08-cms.md](08-cms.md) | – |
| **Settings** | `120:7602` | Business profile, Vehicle & rental defaults, Notifications (which events to be notified about), Account & security (change password) | `120:7746`, `120:7886`, `120:8010`, `120:8146` |

### Gaps in the dashboard design
- **Sell submissions** and **Contact messages** have customer forms but no admin screen. The build plan adds a simple inbox for each (Phase 5). Confirm with the client (Q3).
- There are no admin user-management screens (invite staff, assign roles). Phase 1 creates the first Super Admin with a seed script (Q4).
- **Website content (CMS)** was requested after the design was done, so it has no frames. It's built from existing dashboard components (Q16).
- **Copy the client must supply** before launch, because it's missing from Figma: 7 of 8 FAQ answers, how-it-works step 1 description, 3 "What we do" descriptions, and "Why choose us" slide 04. Staff can enter all of it themselves in the CMS.
- **Client Policy wording:** the page is designed (left outline + 6 sections, frame `1:3772`), but its text couldn't be read from the design file. Copy it from the frame, and have the client confirm it (Q19).
