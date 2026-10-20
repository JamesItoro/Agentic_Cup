import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { docTypeIcon, docTypeTextTone } from "@/components/documents/doc-icon";
import { cn } from "@/lib/utils";
import type { Document } from "@/types";

/**
 * Curated starter reading for a new joiner's first week, ordered as a path.
 * Each entry names a document in the corpus and why it matters; raw exports
 * (Jira, Slack, RAID) are deliberately left out of the starter set.
 */
const STARTER_PATH: { id: string; reason: string }[] = [
  { id: "d-sow", reason: "Start here. The agreed scope, deliverables and commercial boundaries." },
  {
    id: "d-hld",
    reason:
      "How Phoenix fits together: AWS Bedrock intent classification, the retrieval layer and the legacy order-data integration.",
  },
  {
    id: "d-stakeholder",
    reason: "The client-side stakeholders and sponsors, how to engage them and who owns which decisions.",
  },
  {
    id: "d-datadict",
    reason:
      "The order-history and customer entities you'll build against, including the known duplicate-ID issue.",
  },
];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function RecommendedReading({ docs }: { docs: Document[] }) {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const items = STARTER_PATH.map((s) => ({ doc: byId.get(s.id), reason: s.reason })).filter(
    (i): i is { doc: Document; reason: string } => Boolean(i.doc),
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-3 border-b border-border-default p-5">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-brand/10 text-brand">
            <Sparkles className="size-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-ink-strong">
              Recommended for you
            </h3>
            <p className="mt-0.5 text-xs text-ink-muted">A starter reading path for your first week</p>
          </div>
        </div>
        <Link
          href="/knowledge"
          className="shrink-0 text-xs font-medium text-brand hover:text-brand-hover"
        >
          Knowledge hub
        </Link>
      </div>

      <ol className="p-3">
        {items.map(({ doc, reason }, i) => (
          <li key={doc.id} className="flex gap-3">
            {/* Step marker + connector */}
            <div className="flex flex-col items-center">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-semibold text-brand">
                {i + 1}
              </span>
              {i < items.length - 1 ? <span className="mt-1 w-px flex-1 bg-border-default" /> : null}
            </div>

            <Link
              href={`/knowledge/${doc.id}`}
              className="group mb-1 flex flex-1 items-start gap-3 rounded-[var(--radius-md)] p-2.5 transition-colors hover:bg-surface-canvas"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-ink-strong group-hover:text-brand">
                    {doc.title}
                  </p>
                  {i === 0 ? <Badge variant="brand">Start here</Badge> : null}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{reason}</p>
                <p className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] uppercase tracking-wide text-ink-muted/80">
                  <span>{doc.topic}</span>
                  <span aria-hidden>·</span>
                  {(() => {
                    const TypeIcon = docTypeIcon(doc.type);
                    return (
                      <TypeIcon
                        className={cn("size-3.5", docTypeTextTone(doc.type))}
                        aria-label={doc.type.toUpperCase()}
                      />
                    );
                  })()}
                  <span aria-hidden>·</span>
                  <span>{formatSize(doc.sizeBytes)}</span>
                </p>
              </div>
              <ArrowRight className="mt-1 size-4 shrink-0 text-ink-muted transition-all group-hover:translate-x-0.5 group-hover:text-brand" />
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
