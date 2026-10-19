import { notFound } from "next/navigation";
import { Info } from "lucide-react";
import { getAppContext } from "@/lib/auth/session";
import { getDocuments, getTeamContacts } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { ContactCard } from "@/components/team/contact-card";

export default async function TeamPage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  const { user, projectId } = ctx;

  const [contacts, docs] = await Promise.all([
    getTeamContacts(user.userId, projectId),
    getDocuments(user.userId, projectId),
  ]);
  const docTitleById = Object.fromEntries(docs.map((d) => [d.id, d.title]));

  return (
    <div>
      <PageHeader
        title="Team & owners"
        description="Who's who on the engagement, what they own, and how to reach them."
      />

      <div className="mb-5 flex items-start gap-2.5 rounded-[var(--radius-md)] border border-info/20 bg-info-soft px-4 py-3 text-sm text-info">
        <Info className="mt-0.5 size-4 shrink-0" />
        <p>
          Each &ldquo;owner of&rdquo; assertion links to the source document it came from, with the date it was
          last verified, so you can trust who to ask.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {contacts.map((c) => (
          <ContactCard
            key={c.id}
            contact={c}
            sourceTitle={c.sourceDocumentId ? docTitleById[c.sourceDocumentId] : null}
          />
        ))}
      </div>
    </div>
  );
}
