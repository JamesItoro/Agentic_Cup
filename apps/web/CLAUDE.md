<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Compass AI — web app guide

A secure, AI-assisted project onboarding portal. **Stage A** (current) is a working
Next.js app on a **mock data layer** — no database, no separate backend. The AI
assistant is wired up (Anthropic API + RAG over the synthetic Project Phoenix
corpus). See the repo root `README.md`, `GETTING_STARTED.md` and `PLAN.md` for the
product picture and the staged plan.

## Stack

- **Next.js 16** (App Router, Turbopack), **React 19**, **TypeScript**, **Tailwind v4**.
- Node 20+ (24 recommended). Run from `apps/web`: `npm run dev` → http://localhost:3000.
- The AI assistant needs `apps/web/.env.local` with `ANTHROPIC_API_KEY` (optional
  `CLAUDE_MODEL`, defaults to `claude-sonnet-5-5`). The rest of the app runs without it.

## Layout

```
src/app/(auth)/        login, reset-password
src/app/(app)/         dashboard, onboarding, knowledge, team, assistant, admin, settings
src/app/api/chat/      streaming RAG endpoint
src/components/        ui (primitives), layout, dashboard, chat, documents, tasks, team, admin
src/lib/data/          mock data layer (dataset.ts + index.ts)
src/lib/auth/          mock cookie session
src/lib/rag/           corpus.json, retrieval, system-prompt.ts
src/lib/status.ts      shared badge/label maps (status, priority, confidence, stage, index, doc type)
scripts/ingest.mjs     rebuilds src/lib/rag/corpus.json from Project_Phonix_Synthesis/
```

## Core conventions

- **Data layer is the single source of truth.** `src/lib/data/dataset.ts` holds the
  in-memory arrays; `src/lib/data/index.ts` exposes async accessors. Every
  project-scoped accessor takes `userId` + `projectId` and checks membership first
  (`isMember`) — a non-member gets empty results, mirroring the Supabase RLS to come.
  **Do not read `dataset.ts` arrays from components; always go through the accessors.**
- **Mutations are server actions** in `src/lib/actions/*`, authorised server-side
  (signed-in + member + owns the row), then `revalidatePath`. State changes persist in
  in-memory `Map` overrides for the life of the dev server (reset on restart): task
  status (`taskStatusOverrides`) and completion reflections (`taskReflectionOverrides`).
- **Auth (Stage A):** cookie `compass_session` = the userId (e.g. `u-noah`). Pages
  resolve the user/project/role via `getAppContext()`. Demo accounts and password are in
  `GETTING_STARTED.md`.
- **Design tokens** live in `src/app/globals.css` (`@theme`): brand purple
  (`--color-brand`), `info`/`success`/`warning`/`danger` (each with a `-soft` tint),
  ink/surface/border, radii (`--radius-card|lg|md|sm`), shadows. **Use token classes
  (`text-brand`, `bg-info-soft`, `rounded-[var(--radius-md)]`) — never hard-coded hex.**
- **Shared primitives** in `src/components/ui` (Card, Badge, Avatar, Tabs, Button,
  toast…). Badge/label lookups go through `src/lib/status.ts`. File-type icons/colours
  come from `src/components/documents/doc-icon.tsx` (`DocIcon`, `docTypeIcon`,
  `docTypeTextTone`).
- **Reference code** as `path:line`. Keep British English in user-facing copy, matching
  the assistant's tone.

## Feature map (where things live)

- **Dashboard** (`app/(app)/dashboard/page.tsx`): welcome hero, KPI tiles, Up next,
  `AskLauncher`, `FaqPanel`, `RecommendedReading`, Key contacts.
  - `components/dashboard/faq-panel.tsx` — Project Phoenix intro + FAQ accordion.
    Native `<details name="phoenix-faq">` gives exclusive open (one at a time); all start
    collapsed. Each item's "Learn more" links to `/assistant?q=<detailed prompt>` (a
    fuller, detail-triggering prompt separate from the short question label).
  - `components/dashboard/recommended-reading.tsx` — curated starter reading path
    (`STARTER_PATH` by doc id + reason), numbered timeline, inline file-type icon only.
    Deliberately excludes raw exports (Jira/Slack/RAID).
- **Team** (`app/(app)/team/page.tsx`): roster grouped by workstream. `getTeamRoster`
  returns `teamRoster` (15 people from `03_Team_Org_Chart.pdf`); leadership tier first,
  then Conversational AI / Data & Integration / Change & Adoption, each colour-accented.
  - `components/team/member-card.tsx` — per-member card (lead/on-leave/"You" badges,
    reports-to, provenance link).
  - `components/team/workstream-nav.tsx` — scroll-spy jump chips in a summary bar that is
    `sticky top-16` under the app header. `getTeamContacts`/`ContactCard` are the older
    "owners" surface and are still used on the dashboard — keep both.
- **Onboarding** (`app/(app)/onboarding/page.tsx` + `components/tasks/`): 8 tasks
  (`onboardingTasks`, 2 per stage). `OnboardingBoard` has an **All** tab (every task
  grouped by stage) followed by the per-stage tabs, plus a status filter. On completing a
  task, `TaskItem` shows a **reflection** editor — free-text note + High/Medium/Low
  confidence — saved via `saveTaskReflectionAction` → `updateTaskReflection`.
- **Assistant** (`app/(app)/assistant/page.tsx` → `components/chat/assistant-chat.tsx`):
  reads `?q=` and auto-sends it; streams from `api/chat`. `system-prompt.ts` keeps answers
  grounded in retrieved docs, cites sources, and ends with a confidence line.
  `components/chat/markdown-lite.tsx` renders answers and styles the trailing
  `Confidence: …` as an info (light-blue) panel: bold level on its own line, reason beneath.

## Verifying changes

- `npx tsc --noEmit` and `npx eslint <files>` must both pass (eslint is slow to start).
- To render an authed page without the login flow, forge the session cookie:
  `curl -s -b "compass_session=u-noah" http://localhost:3000/<route>`.
- Keep the generated `nextjs-agent-rules` block at the top of this file; `next dev`
  re-adds it, so committing it with your work keeps the tree clean.
