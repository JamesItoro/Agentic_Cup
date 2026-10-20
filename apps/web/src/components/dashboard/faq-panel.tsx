import Link from "next/link";
import {
  Rocket,
  Users,
  KeyRound,
  CalendarDays,
  AlertTriangle,
  GitBranch,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Compass,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface Faq {
  icon: LucideIcon;
  question: string;
  answer: string;
  /** Sent to the assistant on "Learn more"; phrased to draw a fuller answer. */
  prompt: string;
}

/**
 * New-joiner FAQs for the dashboard. Copy is grounded in the Project Phoenix
 * corpus (HLD, org chart, status reports, RAID log, standup notes). "Learn more"
 * opens the question in the assistant, which answers from the documents with
 * citations.
 */
const FAQS: Faq[] = [
  {
    icon: Rocket,
    question: "What is Project Phoenix, and where are we now?",
    answer:
      "Phoenix is an AI-powered customer service platform for a UK retailer, built on AWS Bedrock intent classification with a retrieval layer over the retailer's order history. Delivery is at Week 12 of 16 and the MVP shipped at the end of Week 10. The status is currently Amber, driven by intent-classification latency and legacy data-quality issues, both with fixes in flight ahead of the client CTO demo.",
    prompt:
      "Give me the full picture on Project Phoenix: what it is, the goal, the solution architecture at a high level, and where delivery stands right now.",
  },
  {
    icon: Users,
    question: "Who leads each workstream, and who should I ask?",
    answer:
      "Maria Osei is the Project Lead and owns overall delivery, status and change control. The three delivery workstreams are led by Aisha Rahman (Conversational AI), Priya Shah (Data & Integration) and Marcus Webb (Change & Adoption). Tom Whitfield is the Engagement Partner for commercials and escalations, and client-side the sponsor is CTO Rachel Ingram.",
    prompt:
      "Walk me through the team structure in detail: who leads each workstream, who reports to whom, and who I should go to for what.",
  },
  {
    icon: KeyRound,
    question: "How do I get access to the tools and systems?",
    answer:
      "There are three steps. Raise an AWS Bedrock and shared-account request, which Priya Shah approves; ask Aisha Rahman to add you to the Jira / ADO board with developer permissions so you can pick up tickets; and Marcus Webb's team handles your Microsoft Teams (daily standup) and Slack (wider chatter) invites. Your onboarding checklist tracks each of these.",
    prompt:
      "Explain in detail how I get access to the tools and systems I'll need on Phoenix, step by step, and who approves or owns each one.",
  },
  {
    icon: CalendarDays,
    question: "When is the next client demo?",
    answer:
      "The CTO demo for client sponsor Rachel Ingram is scheduled for 13 August, per the daily standup notes as of 5 August. It is the key near-term checkpoint, so the current latency and data-quality fixes are being prioritised to land before it.",
    prompt:
      "When is the next client demo, who is it for, and what's riding on it? Give me the detail and anything that could affect the date.",
  },
  {
    icon: AlertTriangle,
    question: "What are the current blockers and risks?",
    answer:
      "Two technical issues lead the list. Intent-classification p95 latency is running at 6.2s against a 3.5s target under peak load, with a fix targeted for 11 August (PHX-118/119), and the legacy order extract has ~8% duplicate customerId records, with cleansing targeted for 8 August (PHX-104). On resourcing, Data Engineer Alex Turner is on leave with no confirmed backfill before Week 13.",
    prompt:
      "Summarise the current blockers and risks on Phoenix in detail, including the specific numbers, ticket references, owners and target dates.",
  },
  {
    icon: GitBranch,
    question: "Is the Product Recommendation Engine in scope?",
    answer:
      "This is genuinely unresolved, and the sources disagree: the client steering notes record it as out of scope, the Jira board has it in the backlog, and the Week 11 status report lists it as under review. Until that is settled, treat it as not committed and confirm the single source of truth with Maria Osei before planning any work.",
    prompt:
      "Explain in detail whether the Product Recommendation Engine is in scope, walking me through exactly where the sources disagree and who can confirm the real position.",
  },
];

const HERO_CHIPS = ["Week 12 of 16", "Delivery status: Amber"];

export function FaqPanel() {
  return (
    <Card className="overflow-hidden">
      {/* Project Phoenix intro */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-deep via-brand-deep to-brand px-6 py-7 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(520px 200px at 50% -40%, rgba(161,0,255,0.55), transparent 60%)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-md">
          <span className="mx-auto mb-3 inline-flex size-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20 backdrop-blur-sm">
            <Compass className="size-5" />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/60">
            About this engagement
          </p>
          <h3 className="mt-1 text-xl font-semibold tracking-tight">Project Phoenix</h3>
          <p className="mx-auto mt-2 text-sm leading-relaxed text-white/80">
            An AI-powered customer service platform Accenture is delivering for a UK retailer. It
            pairs AWS Bedrock intent classification with a retrieval layer over the retailer&apos;s
            order data, so customers get accurate, instant answers. The team is in the final build
            phase, with the client CTO demo on the horizon.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {HERO_CHIPS.map((chip) => (
              <span
                key={chip}
                className="rounded-full bg-white/12 px-2.5 py-1 text-xs font-medium text-white/90 ring-1 ring-white/15"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ heading */}
      <div className="flex items-center justify-between px-5 pb-1 pt-5">
        <h4 className="text-base font-semibold tracking-tight text-ink-strong">
          Frequently asked
        </h4>
        <span className="text-xs text-ink-muted">New here? Start with these</span>
      </div>

      {/* FAQ accordion */}
      <div className="space-y-1 p-3">
        {FAQS.map((faq, i) => (
          <details
            key={faq.question}
            name="phoenix-faq"
            open={i === 0}
            className="group rounded-[var(--radius-md)] transition-colors open:bg-surface-canvas/70 hover:bg-surface-canvas/50"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2.5 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand transition-colors group-open:bg-brand group-open:text-white">
                <faq.icon className="size-4" />
              </span>
              <span className="flex-1 text-sm font-medium text-ink-strong">{faq.question}</span>
              <ChevronDown className="size-4 shrink-0 text-ink-muted transition-transform duration-200 group-open:rotate-180" />
            </summary>
            <div className="px-2.5 pb-3 pl-[46px]">
              <p className="text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
              <div className="mt-3 border-t border-border-default pt-3">
                <Link
                  href={`/assistant?q=${encodeURIComponent(faq.prompt)}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-[var(--shadow-card)] transition-colors hover:bg-brand-hover"
                >
                  <Sparkles className="size-3.5" /> Learn more with Compass AI
                  <ArrowRight className="size-3.5" />
                </Link>
              </div>
            </div>
          </details>
        ))}
      </div>
    </Card>
  );
}
