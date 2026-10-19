import Link from "next/link";
import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DocIcon } from "./doc-icon";
import { indexStatusMeta } from "@/lib/status";
import { formatDate, cn } from "@/lib/utils";
import type { Document } from "@/types";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentCard({ doc, className }: { doc: Document; className?: string }) {
  const idx = indexStatusMeta[doc.indexStatus];
  return (
    <Link href={`/knowledge/${doc.id}`} className={cn("group block", className)}>
      <Card className="h-full p-4 transition-all duration-150 group-hover:border-brand/40 group-hover:shadow-[var(--shadow-pop)]">
        <div className="flex items-start gap-3">
          <DocIcon type={doc.type} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink-strong group-hover:text-brand">
              {doc.title}
            </p>
            <p className="mt-0.5 text-xs text-ink-muted">
              {doc.topic} · {doc.type.toUpperCase()} · {formatSize(doc.sizeBytes)}
            </p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant={idx.variant}>{idx.label}</Badge>
          {!doc.isCurrent ? <Badge variant="warning">Superseded</Badge> : null}
        </div>
        <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1 truncate">
            <User className="size-3.5" /> {doc.ownerName}
          </span>
          <span>Updated {formatDate(doc.updatedAt)}</span>
        </div>
      </Card>
    </Link>
  );
}
