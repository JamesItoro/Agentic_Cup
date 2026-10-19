"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, LayoutGrid, List, UploadCloud, FileX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { DocumentCard } from "./document-card";
import { DocIcon } from "./doc-icon";
import { UploadDialog } from "./upload-dialog";
import { indexStatusMeta } from "@/lib/status";
import { formatDate, cn } from "@/lib/utils";
import type { Document } from "@/types";

export function KnowledgeExplorer({ docs, canUpload }: { docs: Document[]; canUpload: boolean }) {
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState<string>("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const topics = useMemo(() => Array.from(new Set(docs.map((d) => d.topic))).sort(), [docs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (topic !== "all" && d.topic !== topic) return false;
      if (q && !`${d.title} ${d.ownerName} ${d.topic}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [docs, query, topic]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents, owners or topics…"
            className="pl-9"
            aria-label="Search documents"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            aria-label="Filter by topic"
            className="h-10 rounded-[var(--radius-md)] border border-border-strong bg-surface-card px-3 text-sm text-ink-strong focus-visible:outline-none focus-visible:border-brand"
          >
            <option value="all">All topics</option>
            {topics.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <div className="flex items-center rounded-[var(--radius-md)] border border-border-default p-0.5">
            <button
              onClick={() => setView("grid")}
              className={cn("rounded-[var(--radius-sm)] p-2", view === "grid" ? "bg-surface-canvas text-ink-strong" : "text-ink-muted")}
              aria-label="Grid view"
              aria-pressed={view === "grid"}
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("rounded-[var(--radius-sm)] p-2", view === "list" ? "bg-surface-canvas text-ink-strong" : "text-ink-muted")}
              aria-label="List view"
              aria-pressed={view === "list"}
            >
              <List className="size-4" />
            </button>
          </div>

          {canUpload ? (
            <UploadDialog
              trigger={
                <Button>
                  <UploadCloud className="size-4" /> Upload
                </Button>
              }
            />
          ) : null}
        </div>
      </div>

      <p className="text-sm text-ink-muted">
        {filtered.length} of {docs.length} documents
      </p>

      {filtered.length === 0 ? (
        <EmptyState icon={FileX} title="No matching documents" description="Try a different search term or topic filter." />
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((d) => (
            <DocumentCard key={d.id} doc={d} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-border-default bg-surface-card">
          {filtered.map((d, i) => (
            <Link
              key={d.id}
              href={`/knowledge/${d.id}`}
              className={cn(
                "flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-canvas",
                i > 0 && "border-t border-border-default",
              )}
            >
              <DocIcon type={d.type} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-strong">{d.title}</p>
                <p className="truncate text-xs text-ink-muted">
                  {d.topic} · {d.ownerName} · updated {formatDate(d.updatedAt)}
                </p>
              </div>
              <Badge variant={indexStatusMeta[d.indexStatus].variant}>{indexStatusMeta[d.indexStatus].label}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
