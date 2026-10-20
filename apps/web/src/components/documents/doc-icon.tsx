import { FileText, FileSpreadsheet, FileJson, Presentation, FileType, File } from "lucide-react";
import type { DocumentType } from "@/types";
import { cn } from "@/lib/utils";

const map: Record<DocumentType, { icon: typeof File; tone: string; text: string }> = {
  pdf: { icon: FileType, tone: "bg-danger-soft text-danger", text: "text-danger" },
  docx: { icon: FileText, tone: "bg-info-soft text-info", text: "text-info" },
  pptx: { icon: Presentation, tone: "bg-warning-soft text-warning", text: "text-warning" },
  txt: { icon: FileText, tone: "bg-surface-canvas text-ink-muted", text: "text-ink-muted" },
  md: { icon: FileText, tone: "bg-surface-canvas text-ink-muted", text: "text-ink-muted" },
  csv: { icon: FileSpreadsheet, tone: "bg-success-soft text-success", text: "text-success" },
  json: { icon: FileJson, tone: "bg-brand/10 text-brand", text: "text-brand" },
};

/** The Lucide icon used for a document type. */
export function docTypeIcon(type: DocumentType) {
  return (map[type] ?? map.txt).icon;
}

/** The text colour used for a document type's icon when shown inline. */
export function docTypeTextTone(type: DocumentType) {
  return (map[type] ?? map.txt).text;
}

export function DocIcon({ type, className }: { type: DocumentType; className?: string }) {
  const { icon: Icon, tone } = map[type] ?? map.txt;
  return (
    <span className={cn("flex size-10 items-center justify-center rounded-[var(--radius-md)]", tone, className)}>
      <Icon className="size-5" />
    </span>
  );
}
