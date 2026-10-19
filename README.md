# Project Compass AI

A secure, AI-assisted project onboarding portal. From new joiner to contributing team member, faster.

**New here? See [GETTING_STARTED.md](GETTING_STARTED.md) to run it locally in a few minutes.**

This repository is being delivered in two stages:

- **Stage A (current): the web application.** A believable, working onboarding portal built on a mock data layer, with no database and no AI backend. Login, onboarding progress, the knowledge hub and project isolation all work so the experience can be reviewed end to end.
- **Stage B (after review): the AI agent.** Supabase (auth, database, storage), a FastAPI service, Claude and retrieval-augmented answers with citations.

See `PLAN.md` for the full product blueprint and the staged delivery plan.

## What is in Stage A

- **Sign in** with cookie-based sessions and three demo roles (member, manager, admin).
- **Dashboard** with a personalised welcome, onboarding progress, KPI tiles, a project pulse and recommendations.
- **My onboarding**: a staged checklist (Discover, Access, Learn, Contribute) with tasks you can complete; progress is calculated from real records.
- **Knowledge hub**: search, filter, grid and list views, document detail and a simulated upload.
- **Team and owners**, an admin console (admin only), settings and a stubbed AI assistant page.
- All content is grounded in the synthetic **Project Phoenix** dataset in `Project_Phonix_Synthesis/`.

Everything runs locally with no external services. The data layer lives in `apps/web/src/lib/data/` as plain TypeScript, designed so it can be swapped for Supabase in Stage B without changing page code.

## Running it

Requirements: Node 20 or later.

```bash
cd apps/web
npm install
npm run dev
```

Then open http://localhost:3000.

### Demo accounts

| Email | Role |
| --- | --- |
| noah.bennett@accenture.com | New joiner (member) |
| maria.osei@accenture.com | Project lead (manager) |
| tom.whitfield@accenture.com | Engagement partner (admin) |

Password for all three: `Compass#2026`.

## Notes

- Styling is Accenture-inspired but is not an officially approved brand system. Confirm branding before any official use.
- The data is synthetic. No client material is used.
