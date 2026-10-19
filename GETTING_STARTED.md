# Getting started

How to run **Project Compass AI** locally. It is a single Next.js app with no database and no separate backend.

## 1. Prerequisites

- **Node.js 20 or later** (Node 24 recommended) and npm.
- An **Anthropic API key** for the AI assistant (`sk-ant-...`). The rest of the app runs without it; only the assistant needs it.

## 2. Install

```bash
git clone https://github.com/JamesItoro/Agentic_Cup.git
cd Agentic_Cup/apps/web
npm install
```

## 3. Add your environment file

The app reads secrets from `apps/web/.env.local`, which is gitignored and not in the repo. Create it:

```bash
# from apps/web
printf 'ANTHROPIC_API_KEY=sk-ant-your-key-here\nCLAUDE_MODEL=claude-sonnet-5-5\n' > .env.local
```

- `ANTHROPIC_API_KEY` (required for the assistant) is used server-side only and never sent to the browser.
- `CLAUDE_MODEL` is optional and defaults to `claude-sonnet-5-5`.

## 4. Run

```bash
# from apps/web
npm run dev
```

Open **http://localhost:3000**.

### Demo accounts

Sign in with any of these. Password for all three is `Compass#2026`.

| Email | Role |
| --- | --- |
| `noah.bennett@accenture.com` | New joiner (member) |
| `maria.osei@accenture.com` | Project lead (manager) |
| `tom.whitfield@accenture.com` | Engagement partner (admin) |

## 5. Using the AI assistant

Open **AI Assistant** and ask about Project Phoenix, for example "Who owns the data pipeline?" or "When is the next client demo?". Answers are grounded only in the project documents, cite their sources, and end with a confidence rating. The assistant is scoped to Project Phoenix.

## Rebuilding the document index (optional)

The search corpus is committed at `apps/web/src/lib/rag/corpus.json`. If you change the files in `Project_Phonix_Synthesis/`, rebuild it:

```bash
# from apps/web
node scripts/ingest.mjs
```

## What is and is not included

- **Mock data, no database.** Auth and all records are in-memory mock data under `apps/web/src/lib/`. Signing in is real (cookie session) but state resets when the server restarts.
- **Simulated actions.** Document upload, download and admin actions show a confirmation but are not persisted, since there is no storage layer yet.

## Troubleshooting

- **"ANTHROPIC_API_KEY is missing"** in the assistant: create `apps/web/.env.local` as in step 3, then restart `npm run dev`.
- **Port 3000 already in use:** stop the other process, or run `npm run dev -- -p 3001`.
- **Keep `node_modules` off synced drives** (OneDrive, Dropbox) to avoid slow or broken builds.

## Project layout

```
apps/web/                 Next.js app (App Router, TypeScript, Tailwind v4)
  src/app/                routes: (auth) login, (app) dashboard/onboarding/knowledge/team/admin/settings, api/chat
  src/components/         UI primitives, layout, dashboard, chat, documents, tasks
  src/lib/                data (mock), auth (mock), rag (ingest + retrieval + prompt)
  scripts/ingest.mjs      builds src/lib/rag/corpus.json from the documents
Project_Phonix_Synthesis/ synthetic demo documents (the assistant's knowledge base)
PLAN.md                   product blueprint and delivery plan
```
