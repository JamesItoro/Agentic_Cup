"use client";
import { useRef, useState } from "react";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const ACCEPTED = [".pdf", ".docx", ".pptx", ".txt", ".md", ".csv", ".json"];
const MAX_MB = 25;

export function UploadDialog({ trigger }: { trigger: React.ReactNode }) {
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  function validate(f: File): string | null {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED.includes(ext)) return `Unsupported file type. Allowed: ${ACCEPTED.join(", ")}`;
    if (f.size > MAX_MB * 1024 * 1024) return `File exceeds the ${MAX_MB} MB limit.`;
    return null;
  }

  function pick(f: File | null | undefined) {
    if (!f) return;
    const err = validate(f);
    setError(err);
    setFile(err ? null : f);
  }

  function reset() {
    setFile(null);
    setError(null);
    setProgress(null);
  }

  function upload() {
    if (!file) return;
    setProgress(0);
    // Simulated upload, real Supabase Storage upload is wired in a later stage.
    const timer = setInterval(() => {
      setProgress((p) => {
        const next = (p ?? 0) + 12;
        if (next >= 100) {
          clearInterval(timer);
          toast({
            tone: "success",
            title: "Upload received (simulated)",
            description: `${file.name} would be stored and queued for indexing in the AI stage.`,
          });
          setTimeout(() => {
            setOpen(false);
            reset();
          }, 400);
          return 100;
        }
        return next;
      });
    }, 180);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload a document</DialogTitle>
          <DialogDescription>
            Add project material to the knowledge hub. Indexing for AI search is added in the AI stage.
          </DialogDescription>
        </DialogHeader>

        {!file ? (
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              pick(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-md)] border-2 border-dashed px-6 py-10 text-center transition-colors",
              dragging ? "border-brand bg-brand/5" : "border-border-strong hover:border-brand/50",
            )}
          >
            <UploadCloud className="size-8 text-brand" />
            <p className="text-sm font-medium text-ink-strong">Drag &amp; drop a file, or click to browse</p>
            <p className="text-xs text-ink-muted">
              {ACCEPTED.join(", ")} · up to {MAX_MB} MB
            </p>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(e) => pick(e.target.files?.[0])}
            />
          </div>
        ) : (
          <div className="rounded-[var(--radius-md)] border border-border-default p-4">
            <div className="flex items-center gap-3">
              <FileIcon className="size-5 text-brand" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink-strong">{file.name}</p>
                <p className="text-xs text-ink-muted">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              {progress === null ? (
                <button onClick={reset} className="text-ink-muted hover:text-ink-strong" aria-label="Remove file">
                  <X className="size-4" />
                </button>
              ) : null}
            </div>
            {progress !== null ? <Progress value={progress} className="mt-3" tone={progress === 100 ? "success" : "brand"} /> : null}
          </div>
        )}

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button onClick={upload} disabled={!file || progress !== null}>
            {progress !== null ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {progress !== null ? "Uploading…" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
