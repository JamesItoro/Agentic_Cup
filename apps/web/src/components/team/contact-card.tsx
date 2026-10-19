import Link from "next/link";
import { Mail, BadgeCheck, FileText, ShieldQuestion } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";
import type { TeamContact } from "@/types";

export function ContactCard({
  contact,
  sourceTitle,
}: {
  contact: TeamContact;
  sourceTitle?: string | null;
}) {
  return (
    <Card className="group h-full overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-[var(--shadow-pop)]">
      {/* Header band */}
      <div className="flex items-center gap-3 border-b border-border-default bg-gradient-to-br from-brand/8 to-transparent p-4">
        <Avatar name={contact.name} className="size-12 text-base ring-2 ring-surface-card" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink-strong">{contact.name}</p>
          <span className="mt-1 inline-flex max-w-full items-center truncate rounded-full bg-brand/10 px-2.5 py-0.5 text-xs font-semibold text-brand">
            {contact.role}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">
        <p className="text-sm text-ink-muted">{contact.responsibility}</p>

        <div className="flex flex-col gap-2 text-xs">
          {contact.email ? (
            <a
              href={`mailto:${contact.email}`}
              className="inline-flex items-center gap-1.5 font-medium text-brand hover:text-brand-hover"
            >
              <Mail className="size-3.5 shrink-0" /> <span className="truncate">{contact.email}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-ink-muted">
              <Mail className="size-3.5 shrink-0" /> Contact details restricted
            </span>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {contact.verifiedAt ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-2.5 py-1 font-medium text-success">
                <BadgeCheck className="size-3.5" /> Verified {formatDate(contact.verifiedAt)}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warning-soft px-2.5 py-1 font-medium text-warning">
                <ShieldQuestion className="size-3.5" /> Not yet verified
              </span>
            )}

            {sourceTitle && contact.sourceDocumentId ? (
              <Link
                href={`/knowledge/${contact.sourceDocumentId}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-surface-canvas px-2.5 py-1 font-medium text-ink-muted transition-colors hover:text-ink-strong"
              >
                <FileText className="size-3.5" /> {sourceTitle}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
}
