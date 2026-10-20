import { notFound } from "next/navigation";
import { Info, Users, Network, CalendarClock } from "lucide-react";
import { getAppContext } from "@/lib/auth/session";
import { getDocuments, getTeamRoster } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { MemberCard, type Accent } from "@/components/team/member-card";
import { WorkstreamNav } from "@/components/team/workstream-nav";
import type { TeamMember } from "@/types";

interface Section {
  id: string;
  title: string;
  subtitle: string;
  dot: string;
  text: string;
  accent: Accent;
  members: TeamMember[];
}

export default async function TeamPage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  const { user, projectId } = ctx;

  const [roster, docs] = await Promise.all([
    getTeamRoster(user.userId, projectId),
    getDocuments(user.userId, projectId),
  ]);
  const docTitleById = Object.fromEntries(docs.map((d) => [d.id, d.title]));

  const inWorkstream = (ws: string) => roster.filter((m) => m.workstream === ws);
  const leadOf = (members: TeamMember[]) => members.find((m) => m.isLead)?.name ?? null;

  // Leadership tier first (Account Leadership + Cross-workstream), then the
  // three delivery workstreams, each led by its workstream lead.
  const leadership = roster.filter(
    (m) => m.workstream === "Account Leadership" || m.workstream === "Cross-workstream",
  );
  const convAi = inWorkstream("Conversational AI");
  const dataInt = inWorkstream("Data & Integration");
  const change = inWorkstream("Change & Adoption");

  const sections: Section[] = [
    {
      id: "leadership",
      title: "Engagement leadership",
      subtitle: "Accountable for delivery, commercials and scope",
      dot: "bg-brand-deep",
      text: "text-brand-deep",
      accent: {
        band: "from-brand-deep/10 to-transparent",
        chip: "bg-brand-deep/10 text-brand-deep",
        ring: "ring-brand-deep/30",
        avatar: "bg-brand-deep/12 text-brand-deep",
      },
      members: leadership,
    },
    {
      id: "conversational-ai",
      title: "Conversational AI",
      subtitle: leadOf(convAi) ? `Led by ${leadOf(convAi)}` : "",
      dot: "bg-brand",
      text: "text-brand",
      accent: {
        band: "from-brand/10 to-transparent",
        chip: "bg-brand/10 text-brand",
        ring: "ring-brand/30",
        avatar: "bg-brand/12 text-brand",
      },
      members: convAi,
    },
    {
      id: "data-integration",
      title: "Data & Integration",
      subtitle: leadOf(dataInt) ? `Led by ${leadOf(dataInt)}` : "",
      dot: "bg-info",
      text: "text-info",
      accent: {
        band: "from-info/10 to-transparent",
        chip: "bg-info-soft text-info",
        ring: "ring-info/30",
        avatar: "bg-info/12 text-info",
      },
      members: dataInt,
    },
    {
      id: "change-adoption",
      title: "Change & Adoption",
      subtitle: leadOf(change) ? `Led by ${leadOf(change)}` : "",
      dot: "bg-success",
      text: "text-success",
      accent: {
        band: "from-success/10 to-transparent",
        chip: "bg-success-soft text-success",
        ring: "ring-success/30",
        avatar: "bg-success/12 text-success",
      },
      members: change,
    },
  ].filter((s) => s.members.length > 0);

  // Lead cards sort to the front of each delivery section.
  for (const s of sections) {
    s.members = [...s.members].sort((a, b) => Number(b.isLead) - Number(a.isLead));
  }

  const deliveryWorkstreams = sections.filter((s) => s.id !== "leadership").length;

  return (
    <div>
      <PageHeader
        title="Team & owners"
        description="Who's who on the engagement, by workstream, with their reporting line and how to reach them."
      />

      {/* Summary strip, frozen below the app header while scrolling */}
      <div className="sticky top-16 z-20 mb-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-[var(--radius-card)] border border-border-default bg-surface-card/95 px-5 py-4 shadow-[var(--shadow-card)] backdrop-blur-md supports-[backdrop-filter]:bg-surface-card/80">
        <Stat icon={<Users className="size-4" />} value={String(roster.length)} label="team members" />
        <span className="h-8 w-px bg-border-default" aria-hidden />
        <Stat icon={<Network className="size-4" />} value={String(deliveryWorkstreams)} label="delivery workstreams" />
        <span className="h-8 w-px bg-border-default" aria-hidden />
        <Stat
          icon={<CalendarClock className="size-4" />}
          value="15 Jul 2025"
          label="org chart, by Maria Osei"
        />

        {/* Quick-jump nav with scroll-spy highlighting */}
        <WorkstreamNav items={sections.map((s) => ({ id: s.id, title: s.title, dot: s.dot }))} />
      </div>

      <div className="mb-6 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-info/20 bg-info-soft px-4 py-3 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Formal roles and reporting lines are from the Team Org Chart (last verified 15 Jul 2025).
          Short-term, day-to-day task assignments are tracked on the sprint boards and may differ.
        </p>
      </div>

      <div className="space-y-10">
        {sections.map((s) => (
          <section key={s.id} id={s.id} className="scroll-mt-44">
            {/* Section header */}
            <div className="mb-4 flex items-start gap-3">
              <span className={`mt-1.5 size-2.5 shrink-0 rounded-full ${s.dot}`} aria-hidden />
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-ink-strong">{s.title}</h2>
                {s.subtitle ? (
                  <p className={`mt-0.5 text-sm font-medium ${s.text}`}>{s.subtitle}</p>
                ) : null}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {s.members.map((m) => (
                <MemberCard
                  key={m.id}
                  member={m}
                  accent={s.accent}
                  sourceTitle={m.sourceDocumentId ? docTitleById[m.sourceDocumentId] : null}
                  isCurrentUser={m.name === user.fullName}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="inline-flex size-8 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </span>
      <div className="leading-tight">
        <p className="text-sm font-semibold text-ink-strong">{value}</p>
        <p className="text-xs text-ink-muted">{label}</p>
      </div>
    </div>
  );
}
