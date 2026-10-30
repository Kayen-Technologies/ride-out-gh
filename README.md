# Ride Out

Website and admin dashboard for Ride Out, a vehicle business in Tema, Ghana. Customers can **buy** Ride Out cars, **rent** cars, **sell** their own car, and **import** vehicles (including Copart purchases). Staff manage inventory, orders, rentals, customers and all website text and images from a dashboard.

**Design:** [Figma: Ride Out Client File](https://www.figma.com/design/dmoIAsFN5cXluPaEzqWPzC/Ride-Out---Client-File) (Website page `1:4`, Dashboard page `120:530`)

**Stack:** Next.js (App Router) · TypeScript · shadcn/ui · Tailwind CSS · Supabase (Postgres, Auth, Storage) · Resend · Vercel

## Documentation

| Doc | Read it when |
|---|---|
| [01 — Product scope](docs/01-product-scope.md) | You need to know what the product does, with every form field |
| [02 — Architecture](docs/02-architecture.md) | You need the stack, key decisions, folder structure or theming |
| [03 — Data model](docs/03-data-model.md) | You need the tables, status pipelines, KPI queries or storage |
| [04 — Routes and screens](docs/04-routes-and-screens.md) | You need the Figma frame for a route |
| [05 — Setup](docs/05-setup.md) | You're setting up accounts, the local environment or deploys |
| [06 — Build plan](docs/06-build-plan.md) | You need the phase order, Cursor prompts or acceptance criteria |
| [07 — Open questions](docs/07-open-questions.md) | You need a decision from the client |
| [08 — Website content (CMS)](docs/08-cms.md) | You need to know how staff edit website text and images from the dashboard, or what's editable |
| [09 — Application shell](docs/09-app-shell.md) | You need the page container, header, menu, footer, admin sidebar, top bar or responsive rules |

Cursor reads the project rules automatically from [.cursor/rules/ride-out.mdc](.cursor/rules/ride-out.mdc).

## Quick start

After completing [docs/05-setup.md](docs/05-setup.md):

```bash
npm install
```

```bash
npm run dev
```
