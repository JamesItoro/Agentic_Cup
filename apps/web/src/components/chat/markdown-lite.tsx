import React from "react";

/** Inline formatting: **bold** and `code`. Text is escaped by React. */
function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = [];
  // Split on bold and inline-code markers, keeping delimiters.
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-ink-strong">
          {part.slice(2, -2)}
        </strong>,
      );
    } else if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code key={`${keyPrefix}-c${i}`} className="rounded bg-surface-canvas px-1 py-0.5 text-[0.85em]">
          {part.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(<React.Fragment key={`${keyPrefix}-t${i}`}>{part}</React.Fragment>);
    }
  });
  return nodes;
}

/**
 * Minimal, safe Markdown-ish renderer for assistant answers: paragraphs,
 * bullet and numbered lists, and inline bold/code. No raw HTML is ever rendered.
 */
export function MarkdownLite({ text }: { text: string }) {
  const blocks = text.trim().split(/\n\s*\n/);

  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-ink-strong">
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isBulleted = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        const isNumbered = lines.every((l) => /^\s*\d+[.)]\s+/.test(l));

        if (isBulleted) {
          return (
            <ul key={bi} className="ml-1 list-none space-y-1.5">
              {lines.map((l, li) => (
                <li key={li} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                  <span>{renderInline(l.replace(/^\s*[-*•]\s+/, ""), `${bi}-${li}`)}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (isNumbered) {
          return (
            <ol key={bi} className="ml-5 list-decimal space-y-1.5 marker:text-ink-muted">
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.replace(/^\s*\d+[.)]\s+/, ""), `${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }

        // Highlight a trailing "Confidence: ..." line.
        if (/^confidence\b/i.test(block.trim())) {
          return (
            <p key={bi} className="rounded-[var(--radius-sm)] border border-border-default bg-surface-canvas px-3 py-2 text-xs text-ink-muted">
              {renderInline(block, `${bi}`)}
            </p>
          );
        }

        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <React.Fragment key={li}>
                {li > 0 ? <br /> : null}
                {renderInline(l, `${bi}-${li}`)}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
