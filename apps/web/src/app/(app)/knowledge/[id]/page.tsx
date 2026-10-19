import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, User, Clock, Hash, Eye } from "lucide-react";
import { getAppContext } from "@/lib/auth/session";
import { getDocument } from "@/lib/data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocIcon } from "@/components/documents/doc-icon";
import { DocumentActions } from "@/components/documents/document-actions";
import { indexStatusMeta } from "@/lib/status";
import { formatDate } from "@/lib/utils";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ctx = await getAppContext();
  if (!ctx) notFound();

  const doc = await getDocument(ctx.user.userId, ctx.projectId, id);
  if (!doc) notFound(); // not a member or wrong project → 404, never leak

  const idx = indexStatusMeta[doc.indexStatus];
  const isAdmin = ctx.role === "admin";

  const meta = [
    { icon: User, label: "Owner", value: doc.ownerName },
    { icon: Clock, label: "Last updated", value: formatDate(doc.updatedAt) },
    { icon: Hash, label: "Version", value: `v${doc.version}${doc.isCurrent ? " (current)" : " (superseded)"}` },
    { icon: FileText, label: "Type", value: doc.type.toUpperCase() },
  ];

  return (
    <div>
      <Link href="/knowledge" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink-strong">
        <ArrowLeft className="size-4" /> Back to knowledge hub
      </Link>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="flex items-start gap-4 p-5">
              <DocIcon type={doc.type} className="size-12" />
              <div className="min-w-0 flex-1">
                <h1 className="text-xl font-semibold text-ink-strong">{doc.title}</h1>
                <p className="mt-1 text-sm text-ink-muted">{doc.topic}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Badge variant={idx.variant}>{idx.label}</Badge>
                  <Badge variant={doc.visibility === "restricted" ? "warning" : "neutral"}>
                    {doc.visibility === "restricted" ? "Restricted" : "Project-wide"}
                  </Badge>
                </div>
                <div className="mt-4">
                  <DocumentActions title={doc.title} isAdmin={isAdmin} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center gap-2 rounded-[var(--radius-md)] border border-dashed border-border-strong bg-surface-canvas py-16 text-center">
                <Eye className="size-7 text-ink-muted" />
                <p className="text-sm font-medium text-ink-strong">Secure in-app preview</p>
                <p className="max-w-sm text-xs text-ink-muted">
                  Rendered previews via short-lived signed URLs are wired to Supabase Storage in a later stage.
                  Once the AI stage lands, citations will deep-link to the exact page or section here.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {meta.map((m) => (
              <div key={m.label} className="flex items-start gap-2.5 text-sm">
                <m.icon className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                <div>
                  <p className="text-xs text-ink-muted">{m.label}</p>
                  <p className="font-medium text-ink-strong">{m.value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-[var(--radius-md)] bg-surface-canvas p-3 text-xs text-ink-muted">
              Storage path: <span className="font-mono text-ink-strong">{doc.storagePath}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
