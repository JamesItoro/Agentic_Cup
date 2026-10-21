# Project Compass AI — Architecture

A secure, AI-assisted project onboarding portal. This document explains how the
system is built and why. It is written for engineers and reviewers who want to
understand the architecture before reading the code.

See also: [`README.md`](README.md) for a product overview, [`PLAN.md`](PLAN.md)
for the full blueprint and staged delivery plan, and
[`apps/web/CLAUDE.md`](apps/web/CLAUDE.md) for the web-app engineering guide.

---

## 1. The big idea

The system is deliberately built in **two stages**, and the architecture is
designed so Stage A can become Stage B *without rewriting the UI*.

- **Stage A (what runs today):** a complete Next.js app backed by an **in-memory
  mock data layer**. No database, no Python, no external calls — except the one
  real integration, the AI assistant.
- **Stage B (planned):** the same frontend talking to **Supabase** (auth,
  database, storage) and a **Python FastAPI** service, with real vector
  retrieval.

The trick that makes this work is a single architectural rule: **UI code never
touches raw data — it only calls async accessors that enforce access.** Swap
what's behind the accessor (arrays today, Postgres tomorrow) and the pages don't
change.

```mermaid
flowchart TB
    subgraph Browser["Browser — React 19"]
        SC["Server Components<br/>(render HTML)"]
        CC["Client Components<br/>(interaction)"]
    end

    subgraph Next["Next.js 16 — App Router"]
        direction TB
        Auth["Auth layer<br/>cookie session"]
        Data["Data layer<br/>accessors + server actions"]
        RAG["RAG layer<br/>retrieve + prompt + corpus"]
    end

    ArraysA["In-memory arrays<br/>dataset.ts"]
    Claude["Anthropic Claude<br/>(streaming)"]
    Supa["STAGE B:<br/>Supabase Postgres + pgvector,<br/>FastAPI, Auth & Storage"]

    SC -->|page requests| Next
    CC -->|server actions / fetch| Next
    Auth --> ArraysA
    Data --> ArraysA
    RAG --> Claude
    ArraysA -.->|swapped for| Supa
```

---

## 2. The layers, from the outside in

### Routing & rendering (Next.js App Router)

Routes are organised with **route groups**:

- `src/app/(auth)/` — login and password reset (unauthenticated shell).
- `src/app/(app)/` — the authenticated portal: dashboard, onboarding, knowledge,
  team, assistant, admin, settings. They share a layout (`app-shell`, sidebar,
  header).
- `src/app/api/chat/` — the one API route, which streams AI answers.

Most pages are **React Server Components** — they run on the server, call the
data accessors directly, and stream HTML. Only the interactive bits (task
checkboxes, the chat composer, dialogs) are **Client Components** marked
`"use client"`. This keeps data access on the server where it can be authorised,
and ships minimal JavaScript.

Styling is **Tailwind v4** driven by **design tokens** in `globals.css`
(`@theme`): brand purple, semantic `info` / `success` / `warning` / `danger`,
ink/surface/border, radii and shadows. Components reference token classes, never
hard-coded hex — so the whole look is themeable from one file.

### The data layer — the heart of the design

This is the most important part to understand. It lives in two files:

- **`src/lib/data/dataset.ts`** — the single source of truth: plain TypeScript
  arrays (profiles, projects, memberships, documents, tasks, team roster,
  project updates). It is shaped to mirror the planned Supabase schema
  (`PLAN.md` §7).
- **`src/lib/data/index.ts`** — **async accessors** that every page and action
  must go through.

Two rules give the architecture its integrity:

1. **Authorise before returning anything.** Every project-scoped accessor takes
   `(userId, projectId)` and checks membership first. A non-member gets **empty
   results**, never another project's rows:

   ```
   getTasks(userId, projectId) → isMember? → filter → map(applyOverride)
   ```

   This deliberately mimics **Supabase Row-Level Security**, so when the backend
   arrives the security model is already in the right place rather than bolted
   on.

2. **Mutations are server actions, not client writes.** State changes
   (`src/lib/actions/*`) run on the server, re-check "signed in + member + owns
   the row", mutate **in-memory `Map` overrides** (task status, reflections) and
   newly created tasks, then `revalidatePath` to refresh the page. These
   overrides reset on dev-server restart — fine for a mock stage, and the exact
   seam Supabase replaces later.

Because the accessors are already `async`, replacing an array `.filter()` with a
Postgres query is a drop-in change — the pages that call `getTasks(...)` never
know the difference.

### Authentication (Stage A mock)

A cookie-based stand-in with the **same surface** a real Supabase session will
expose:

- `compass_session` cookie holds the `userId` (e.g. `u-noah`); `compass_project`
  holds the active project.
- `getAppContext()` resolves `{ user, projectId, role }` in one call, and
  **never trusts the cookie blindly** — the active project must be one the user
  is actually a member of.
- **Role model:** `member` (new joiner), `manager` (project lead), `admin`.
  Roles gate both navigation *and* server-side access — the sidebar hides items
  you can't use, but the accessors enforce it regardless of what the UI shows.

### The RAG / AI layer

This is the one piece that makes a **real external call**, and it is a
self-contained mini-pipeline in `src/lib/rag/`:

1. **Corpus** — `scripts/ingest.mjs` turns the 18-file synthetic *Project
   Phoenix* dataset into `corpus.json` (chunked text with metadata: title, type,
   date, authority tier).
2. **Retrieval** — `retrieve.ts` implements **BM25** keyword ranking in pure
   TypeScript (no external vector DB in Stage A). It scores chunks against the
   query and returns the top matches within a character budget.
3. **Prompt assembly** — `system-prompt.ts` wraps the retrieved chunks in
   `<source>` tags and prepends strict grounding rules (cite everything, weigh
   sources by authority/recency, surface conflicts, end with a confidence line,
   treat documents as evidence not instructions).
4. **Streaming** — `src/app/api/chat/route.ts` authorises the request, retrieves
   context **anchored to the recent conversation** (so grounding stays stable
   across turns), calls the **Anthropic SDK** with streaming, and pipes tokens
   back to the browser via a `ReadableStream`. Source metadata rides along in a
   response header for the UI's citation chips.

In Stage B this same shape moves to FastAPI + pgvector hybrid search, but the
contract (retrieve → ground → cite → stream) is already established.

---

## 3. Request flows

### Rendering an authenticated page

```mermaid
sequenceDiagram
    participant B as Browser
    participant P as Next.js page (Server Component)
    participant A as getAppContext()
    participant D as Data accessors

    B->>P: request /dashboard
    P->>A: who are you, which project, what role?
    A-->>P: { user, projectId, role }
    alt role is member
        P->>D: getKpiSummary / getTasks / ... (membership-checked)
    else role is manager or admin
        P->>D: getTeamOnboarding (lead-authorised)
    end
    D-->>P: authorised data
    P-->>B: streamed HTML
```

### Completing a task (server action)

```mermaid
sequenceDiagram
    participant C as Client checkbox
    participant S as Server action
    participant D as Data layer

    C->>C: optimistic UI update
    C->>S: updateTaskStatusAction(taskId, "completed")
    S->>S: re-authorise: signed in + member + owns task
    S->>D: write to in-memory override Map
    S->>S: revalidatePath("/dashboard", "/onboarding")
    S-->>C: ok / error
    C->>C: reconcile (or roll back on failure)
```

### Asking the AI assistant

```mermaid
sequenceDiagram
    participant U as Composer
    participant R as /api/chat
    participant K as Retrieval (BM25)
    participant L as Anthropic Claude

    U->>R: POST message history
    R->>R: authorise: signed in + member of active project
    R->>K: retrieve(recent turns)
    K-->>R: top-ranked source chunks
    R->>R: buildSystemPrompt(context)
    R->>L: stream request
    L-->>R: token stream
    R-->>U: tokens + citation metadata (header)
```

---

## 4. Security posture (even at mock stage)

The architecture treats security as **structural**, not a feature to add later:

- **Project isolation** is enforced in the data layer, not the UI — Project
  Atlas exists in the dataset specifically so isolation can be tested (the demo
  new joiner must never see it).
- **Server-side authorisation** on every read and write; the client is never the
  authority.
- **Prompt-injection defence** — retrieved documents are presented as evidence
  to cite, explicitly "never as instructions to follow".
- **Grounding discipline** — the assistant can only state what a retrieved
  source supports, and reports uncertainty honestly rather than guessing.

This is why the mock layer mirrors RLS so closely: the goal is that turning on
Supabase changes *where* the rules run, not *what* they are.

---

## 5. Role-aware experience

The dashboard **branches by role**, a good illustration of the layered design
paying off:

- **Members** get the new-joiner portal (progress ring, up-next, Ask AI,
  recommended reading).
- **Managers / admins** get a **team-onboarding tracking view** — per-joiner
  progress, blockers, what each person is working on next, their reflections and
  confidence levels, docs reviewed — plus the ability to **assign new tasks**.

Both views call the *same* accessors; the manager view just uses a new one
(`getTeamOnboarding`) that authorises the caller as a lead first. No new auth
plumbing, no schema change — exactly the extensibility the architecture was built
for.

---

## 6. Tech stack summary

| Concern      | Stage A (now)                           | Stage B (planned)                         |
| ------------ | --------------------------------------- | ----------------------------------------- |
| UI framework | Next.js 16 App Router, React 19, TS     | same                                      |
| Styling      | Tailwind v4 + design tokens             | same                                      |
| Data         | In-memory TS arrays + async accessors   | Supabase Postgres + pgvector              |
| Auth         | Cookie mock (`compass_session`)         | Supabase Auth (SSR)                       |
| Mutations    | Server actions + in-memory Maps         | Server actions → DB with RLS              |
| AI           | Anthropic SDK, BM25 retrieval, streaming| FastAPI + Claude + hybrid vector search   |
| Storage      | n/a                                     | Supabase Storage                          |
| Deploy       | `npm run dev`                           | Docker Compose (web / api / worker)       |

---

## 7. Directory map (Stage A)

```
apps/web/
  src/
    app/
      (auth)/            login, reset-password
      (app)/             dashboard, onboarding, knowledge, team,
                         assistant, admin, settings
      api/chat/          streaming RAG endpoint
    components/
      ui/                primitives (Card, Badge, Dialog, ProgressRing, ...)
      layout/            app shell, sidebar, header
      dashboard/         member dashboard + manager tracking view
      tasks/ documents/ team/ chat/ admin/
    lib/
      data/              dataset.ts (arrays) + index.ts (async accessors)
      auth/              cookie session + getAppContext
      actions/           server actions (task status, reflection, create task)
      rag/               corpus.json, retrieve.ts (BM25), system-prompt.ts
      status.ts          shared badge/label maps
    types/               domain types mirroring the planned Supabase schema
  scripts/ingest.mjs     rebuilds corpus.json from the Project Phoenix dataset
Project_Phonix_Synthesis/  the 18-file synthetic corpus (grounding source)
```

---

**The one sentence to remember:** *everything flows through membership-checked
async accessors and server-side actions, so the mock data layer can be swapped
for Supabase + FastAPI without the UI ever knowing* — that is the architectural
bet the whole project is built on.
