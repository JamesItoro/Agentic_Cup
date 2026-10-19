/**
 * Mock dataset for Project Compass AI (Stage A).
 *
 * Grounded in the synthetic "Project Phoenix" corpus (Project_Phonix_Synthesis/).
 * Personal onboarding dates (joinedAt, task due dates) are generated relative to
 * "now" so the portal feels live; document and project-pulse dates keep their
 * authentic delivery-timeline values and are surfaced with freshness labels.
 *
 * This module is the single source of truth the async data layer (./index.ts)
 * reads from. When Supabase is introduced it replaces these arrays, not the
 * component code that consumes the accessors.
 */
import type {
  Document,
  Membership,
  OnboardingTask,
  Profile,
  Project,
  ProjectUpdate,
  TeamContact,
} from "@/types";

const DAY = 86_400_000;
/** ISO date offset from now by `n` days (n may be negative). */
function daysFromNow(n: number): string {
  return new Date(Date.now() + n * DAY).toISOString();
}

// ─── Users / profiles ────────────────────────────────────────────────────────
export const USER_MEMBER = "u-noah";
export const USER_MANAGER = "u-maria";
export const USER_ADMIN = "u-tom";

export const profiles: Profile[] = [
  {
    userId: USER_MEMBER,
    fullName: "Noah Bennett",
    jobTitle: "Backend Developer (Python)",
    email: "noah.bennett@accenture.com",
    avatarUrl: null,
  },
  {
    userId: USER_MANAGER,
    fullName: "Maria Osei",
    jobTitle: "Project Lead",
    email: "maria.osei@accenture.com",
    avatarUrl: null,
  },
  {
    userId: USER_ADMIN,
    fullName: "Tom Whitfield",
    jobTitle: "Engagement Partner",
    email: "tom.whitfield@accenture.com",
    avatarUrl: null,
  },
];

// ─── Projects ────────────────────────────────────────────────────────────────
export const PROJECT_PHOENIX = "p-phoenix";
export const PROJECT_ATLAS = "p-atlas";

export const projects: Project[] = [
  {
    id: PROJECT_PHOENIX,
    name: "Project Phoenix",
    client: "LanPhilAlex & Miller",
    description:
      "Conversational-AI contact-centre assistant with a legacy order-data integration layer, delivered on AWS Bedrock.",
    status: "active",
    startDate: "2025-05-05",
  },
  {
    id: PROJECT_ATLAS,
    name: "Project Atlas",
    client: "Nordvik Energy",
    description:
      "Grid-forecasting data platform modernisation. Used here to demonstrate project isolation, the demo joiner is not a member.",
    status: "mobilising",
    startDate: "2025-09-01",
  },
];

// ─── Memberships ─────────────────────────────────────────────────────────────
// Noah (member) belongs ONLY to Phoenix, he must never see Atlas.
export const memberships: Membership[] = [
  { projectId: PROJECT_PHOENIX, userId: USER_MEMBER, role: "member", joinedAt: daysFromNow(-9) },
  { projectId: PROJECT_PHOENIX, userId: USER_MANAGER, role: "manager", joinedAt: "2025-05-05" },
  { projectId: PROJECT_PHOENIX, userId: USER_ADMIN, role: "admin", joinedAt: "2025-05-05" },
  { projectId: PROJECT_ATLAS, userId: USER_ADMIN, role: "admin", joinedAt: "2025-09-01" },
];

// ─── Documents (the 18-file Phoenix corpus) ──────────────────────────────────
export const documents: Document[] = [
  doc("d-sow", "Statement of Work", "pdf", "Tom Whitfield", "2025-05-02", "Commercial", 342_000, true),
  doc("d-hld", "Solution Architecture (HLD)", "pdf", "Aisha Rahman", "2025-07-22", "Architecture", 1_280_000, true),
  doc("d-org", "Team Org Chart", "pdf", "Maria Osei", "2025-07-15", "People", 210_000, true),
  doc("d-status-11", "Status Report: Week 11", "pdf", "Maria Osei", "2025-08-01", "Status", 180_000, true),
  doc("d-status-8", "Status Report: Week 8", "pdf", "Maria Osei", "2025-07-11", "Status", 175_000, false),
  doc("d-jira", "ADO / Jira Board Export", "csv", "Aisha Rahman", "2025-08-05", "Delivery", 64_000, true),
  doc("d-standup", "Meeting Notes: Daily Standup", "txt", "Aisha Rahman", "2025-08-05", "Meeting Notes", 9_000, true),
  doc("d-steering", "Meeting Notes: Client Steering", "txt", "Maria Osei", "2025-07-31", "Meeting Notes", 12_000, true),
  doc("d-archreview", "Meeting Notes: Architecture Review", "txt", "Aisha Rahman", "2025-07-24", "Meeting Notes", 11_000, true),
  doc("d-raid", "RAID Log", "csv", "Maria Osei", "2025-08-04", "Governance", 18_000, true),
  doc("d-email-scope", "Email: Scope Discussion (Rec. Engine)", "txt", "Tom Whitfield", "2025-07-30", "Correspondence", 7_000, true),
  doc("d-email-resource", "Email: Resource Escalation", "txt", "Priya Shah", "2025-07-24", "Correspondence", 6_500, true),
  doc("d-datadict", "Data Dictionary", "csv", "Priya Shah", "2025-07-18", "Data", 22_000, true),
  doc("d-apispec", "API Spec Excerpt", "json", "Ravi Kumar", "2025-07-28", "Architecture", 14_000, true),
  doc("d-testing", "Testing Strategy", "pdf", "Priyanka Nair", "2025-07-20", "Quality", 420_000, true),
  doc("d-stakeholder", "Stakeholder Map", "pdf", "Marcus Webb", "2025-07-12", "People", 260_000, true),
  doc("d-change", "Change Management Plan", "pdf", "Marcus Webb", "2025-07-16", "Change & Adoption", 380_000, true),
  doc("d-slack", "Slack Export", "txt", "Aisha Rahman", "2025-08-05", "Correspondence", 48_000, true),
];

function doc(
  id: string,
  title: string,
  type: Document["type"],
  ownerName: string,
  updatedAt: string,
  topic: string,
  sizeBytes: number,
  isCurrent: boolean,
): Document {
  return {
    id,
    projectId: PROJECT_PHOENIX,
    title,
    type,
    storagePath: `phoenix/${id}.${type}`,
    ownerName,
    updatedAt,
    version: isCurrent ? 2 : 1,
    isCurrent,
    visibility: "project",
    indexStatus: "not_indexed", // indexing arrives with the AI stage
    sizeBytes,
    topic,
  };
}

// A single Atlas doc so isolation tests have something to (not) leak.
documents.push({
  id: "d-atlas-sow",
  projectId: PROJECT_ATLAS,
  title: "Atlas: Statement of Work",
  type: "pdf",
  storagePath: "atlas/d-atlas-sow.pdf",
  ownerName: "Tom Whitfield",
  updatedAt: "2025-09-01",
  version: 1,
  isCurrent: true,
  visibility: "project",
  indexStatus: "not_indexed",
  sizeBytes: 300_000,
  topic: "Commercial",
});

// ─── Team contacts ───────────────────────────────────────────────────────────
export const teamContacts: TeamContact[] = [
  tc("t-tom", "Tom Whitfield", "Engagement Partner", "Commercials, client relationship, escalations", "tom.whitfield@accenture.com", "2025-07-15", "d-stakeholder"),
  tc("t-maria", "Maria Osei", "Project Lead", "Overall delivery, status, scope & change control", "maria.osei@accenture.com", "2025-07-15", "d-org"),
  tc("t-priya", "Priya Shah", "Workstream Lead, Data & Integration", "Data pipeline, access requests, data quality", "priya.shah@accenture.com", "2025-07-18", "d-org"),
  tc("t-aisha", "Aisha Rahman", "Workstream Lead, Conversational AI", "ConvAI architecture, Jira board, latency fix", "aisha.rahman@accenture.com", "2025-07-15", "d-org"),
  tc("t-marcus", "Marcus Webb", "Change & Adoption Lead", "Training, comms, pilot stores, Slack/Teams access", "marcus.webb@accenture.com", "2025-07-12", "d-stakeholder"),
  tc("t-fatima", "Fatima Al-Sayed", "Data Quality Analyst", "Legacy order-extract cleansing (PHX-104)", "fatima.al-sayed@accenture.com", null, "d-raid"),
  tc("t-jordan", "Jordan Reyes", "Performance Engineer", "p95 latency investigation (PHX-118/119)", "jordan.reyes@accenture.com", null, "d-standup"),
  tc("t-rachel", "Rachel Ingram", "Client CTO (Executive Sponsor)", "Client-side sponsor; owns go-live decision", null, "2025-07-31", "d-steering"),
];

function tc(
  id: string,
  name: string,
  role: string,
  responsibility: string,
  email: string | null,
  verifiedAt: string | null,
  sourceDocumentId: string | null,
): TeamContact {
  return { id, projectId: PROJECT_PHOENIX, name, role, responsibility, email, verifiedAt, sourceDocumentId };
}

// ─── Project pulse (updates / blockers / milestones / demo) ──────────────────
export const projectUpdates: ProjectUpdate[] = [
  {
    id: "pu-demo",
    projectId: PROJECT_PHOENIX,
    category: "demo",
    summary: "CTO demo for Rachel Ingram scheduled for 13 August.",
    asOfDate: "2025-08-05",
    sourceDocumentId: "d-standup",
    verified: true,
  },
  {
    id: "pu-blocker-latency",
    projectId: PROJECT_PHOENIX,
    category: "blocker",
    summary:
      "Intent-classification p95 latency measured at 6.2s vs 3.5s target under peak load. Fix targeted by 11 Aug (PHX-118/119).",
    asOfDate: "2025-08-01",
    sourceDocumentId: "d-raid",
    verified: true,
  },
  {
    id: "pu-risk-resource",
    projectId: PROJECT_PHOENIX,
    category: "risk",
    summary:
      "Alex Turner (Data Engineer) on leave with no confirmed backfill; interim contractor not before Week 13.",
    asOfDate: "2025-07-24",
    sourceDocumentId: "d-email-resource",
    verified: true,
  },
  {
    id: "pu-risk-dq",
    projectId: PROJECT_PHOENIX,
    category: "risk",
    summary: "~8% duplicate customerId records in legacy order extract; cleansing (PHX-104) targeted 8 Aug.",
    asOfDate: "2025-07-24",
    sourceDocumentId: "d-raid",
    verified: true,
  },
  {
    id: "pu-milestone-mvp",
    projectId: PROJECT_PHOENIX,
    category: "milestone",
    summary: "MVP delivered end of Week 10 as planned.",
    asOfDate: "2025-07-28",
    sourceDocumentId: "d-status-11",
    verified: true,
  },
  {
    id: "pu-scope-rec",
    projectId: PROJECT_PHOENIX,
    category: "decision",
    summary:
      "Product Recommendation Engine scope status is inconsistent across sources (steering: out of scope / Jira: backlog / Wk11 report: under review). Needs a single source of truth.",
    asOfDate: "2025-08-04",
    sourceDocumentId: "d-email-scope",
    verified: false, // surfaced as "not verified / conflicting"
  },
];

// ─── Onboarding tasks for the demo new joiner (Noah) ─────────────────────────
export const onboardingTasks: OnboardingTask[] = [
  task("ob-1", "Read the Statement of Work", "Understand the agreed scope, deliverables and commercial boundaries for Project Phoenix.", "discover", "completed", "high", -2, "Tom Whitfield", "d-sow"),
  task("ob-2", "Review the Solution Architecture (HLD)", "Get the end-to-end picture: AWS Bedrock intent classification, RAG layer and the legacy order-data integration.", "discover", "completed", "high", -1, "Aisha Rahman", "d-hld"),
  task("ob-3", "Read the latest Week 11 status report", "Know where delivery stands today, current RAG status is Amber, driven by latency and data-quality risks.", "discover", "in_progress", "medium", 1, "Maria Osei", "d-status-11"),
  task("ob-4", "Request AWS Bedrock & account access", "Raise an access request for the Bedrock-backed environment and shared AWS account. Owner can approve.", "access", "blocked", "high", 1, "Priya Shah", null),
  task("ob-5", "Get added to the Jira / ADO board", "You'll pick tickets from here. Ask to be added with developer permissions.", "access", "todo", "high", 2, "Aisha Rahman", "d-jira"),
  task("ob-6", "Join Teams channels and Slack workspace", "Daily standup is on Teams; broader chatter is on Slack. Change & Adoption manages invites.", "access", "completed", "medium", -1, "Marcus Webb", "d-slack"),
  task("ob-7", "Study the Data Dictionary", "Learn the order-history and customer entities you'll work against, including the known duplicate-customerId issue.", "learn", "todo", "medium", 3, "Priya Shah", "d-datadict"),
  task("ob-8", "Review the API Spec excerpt", "Understand the order-status endpoint contracts before touching backend code.", "learn", "todo", "medium", 3, "Ravi Kumar", "d-apispec"),
  task("ob-9", "Read the Testing Strategy", "Know the UAT approach and your responsibilities for unit/integration coverage.", "learn", "todo", "low", 4, "Priyanka Nair", "d-testing"),
  task("ob-10", "Meet the Data & Integration workstream lead", "Intro call with Priya Shah to understand current priorities and where you can help.", "learn", "todo", "medium", 2, "Priya Shah", "d-org"),
  task("ob-11", "Pick up a starter ticket", "Choose a good-first-issue from the board to make an early, low-risk contribution.", "contribute", "todo", "high", 5, "Aisha Rahman", "d-jira"),
  task("ob-12", "Pair on the latency fix investigation", "Shadow Jordan on PHX-118/119, trimming RAG context and streaming responses to hit the 3.5s target.", "contribute", "todo", "low", 6, "Jordan Reyes", "d-standup"),
];

function task(
  id: string,
  title: string,
  description: string,
  stage: OnboardingTask["stage"],
  status: OnboardingTask["status"],
  priority: OnboardingTask["priority"],
  dueOffsetDays: number,
  ownerName: string | null,
  sourceDocumentId: string | null,
): OnboardingTask {
  return {
    id,
    projectId: PROJECT_PHOENIX,
    assigneeId: USER_MEMBER,
    title,
    description,
    stage,
    status,
    priority,
    dueAt: daysFromNow(dueOffsetDays),
    ownerName,
    sourceDocumentId,
  };
}
