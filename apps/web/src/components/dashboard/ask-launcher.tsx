"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SUGGESTIONS = [
  "Who owns the data pipeline?",
  "Summarise the solution architecture",
  "What are the current blockers?",
  "When is the next client demo?",
];

/** Dashboard launcher into the assistant. The assistant itself is stubbed in
 * Stage A; this routes there and pre-fills the prompt via the query string. */
export function AskLauncher() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function ask(q: string) {
    const query = q.trim();
    router.push(`/assistant${query ? `?q=${encodeURIComponent(query)}` : ""}`);
  }

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-br from-brand-deep to-brand p-5 text-white">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5" />
          <h3 className="text-base font-semibold">Ask Compass AI</h3>
        </div>
        <p className="mt-1 text-sm text-white/75">
          Ask anything about Project Phoenix and get answers grounded in your project documents.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            ask(value);
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask a question…"
            aria-label="Ask Compass AI a question"
            className="h-10 w-full rounded-[var(--radius-md)] border border-white/20 bg-white/10 px-3 text-sm text-white placeholder:text-white/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          />
          <Button type="submit" variant="secondary" className="shrink-0 text-ink-strong">
            <ArrowRight className="size-4" />
          </Button>
        </form>
      </div>
      <div className="flex flex-wrap gap-2 p-4">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="rounded-full border border-border-default bg-surface-card px-3 py-1.5 text-xs font-medium text-ink-strong transition-colors hover:border-brand hover:text-brand"
          >
            {s}
          </button>
        ))}
      </div>
    </Card>
  );
}
