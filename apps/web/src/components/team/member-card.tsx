import Link from "next/link";
import { Mail, BadgeCheck, FileText, CornerDownRight, Star, Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { cn, formatDate } from "@/lib/utils";
import type { TeamMember } from "@/types";

/** Literal Tailwind classes per accent, so the JIT keeps them. */
export interface Accent {
  band: string;
  chip: string;
  ring: string;
  avatar: string;
}

export function MemberCard({
  member,
  accent,
  sourceTitle,
  isCurrentUser = false,
}: {
  member: TeamMember;
  accent: Accent;
  sourceTitle?: string | null;
  isCurrentUser?: boolean;
}) {
  return (
    <Card
      className={cn(
        "group flex h-full flex-col overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[var(--shadow-pop)]",
        isCurrentUser && "ring-2 ring-brand/40",
      )}
    >
      {/* Header band */}
      <div className={cn("flex items-start gap-3 border-b border-border-default bg-gradient-to-br p-4", accent.band)}>
        <Avatar
          name={member.name}
          className={cn("size-12 text-base ring-2 ring-surface-card", accent.avatar)}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-sm font-semibold text-ink-strong">{member.name}</p>
            {isCurrentUser ? (
              <span className="shrink-0 rounded-full bg-brand px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none tracking-wide text-white">
                You
              </span>
            ) : null}
          </div>
          <span
            className={cn(
              "mt-1 inline-flex max-w-full items-center truncate rounded-full px-2.5 py-0.5 text-xs font-semibold",
              accent.chip,
            )}
          >
            {member.role}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Status row */}
        {(member.isLead || member.onLeave) && (
          <div className="flex flex-wrap items-center gap-1.5">
            {member.isLead ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-strong">
                <Star className="size-3 fill-current" /> Workstream lead
              </span>
            ) : null}
            {member.onLeave ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-[11px] font-semibold text-warning">
                <Plane className="size-3" /> On leave
              </span>
            ) : null}
          </div>
        )}

        {member.note ? <p className="text-sm text-ink-muted">{member.note}</p> : null}

        {member.reportsTo ? (
          <p className="flex items-center gap-1.5 text-xs text-ink-muted">
            <CornerDownRight className="size-3.5 shrink-0" />
            <span className="truncate">
              Reports to <span className="font-medium text-ink-strong">{member.reportsTo}</span>
            </span>
          </p>
        ) : null}

        {member.email ? (
          <a
            href={`mailto:${member.email}`}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-hover"
          >
            <Mail className="size-3.5 shrink-0" /> <span className="truncate">{member.email}</span>
          </a>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-ink-muted">
            <Mail className="size-3.5 shrink-0" /> Contact details restricted
          </span>
        )}

        {/* Provenance, pinned to the bottom */}
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1 text-xs">
          {member.verifiedAt ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 font-medium text-success">
              <BadgeCheck className="size-3.5" /> Verified {formatDate(member.verifiedAt)}
            </span>
          ) : null}

          {sourceTitle && member.sourceDocumentId ? (
            <Link
              href={`/knowledge/${member.sourceDocumentId}`}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-canvas px-2.5 py-1 font-medium text-ink-muted transition-colors hover:text-ink-strong"
            >
              <FileText className="size-3.5" /> {sourceTitle}
            </Link>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
