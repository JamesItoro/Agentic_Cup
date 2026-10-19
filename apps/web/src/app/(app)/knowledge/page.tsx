import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/auth/session";
import { getDocuments } from "@/lib/data";
import { PageHeader } from "@/components/layout/page-header";
import { KnowledgeExplorer } from "@/components/documents/knowledge-explorer";

export default async function KnowledgePage() {
  const ctx = await getAppContext();
  if (!ctx) notFound();
  const { user, projectId, role } = ctx;

  const docs = await getDocuments(user.userId, projectId);
  const canUpload = role === "manager" || role === "admin";

  return (
    <div>
      <PageHeader
        title="Knowledge hub"
        description="Every document for this project, in one searchable, access-controlled place."
      />
      <KnowledgeExplorer docs={docs} canUpload={canUpload} />
    </div>
  );
}
