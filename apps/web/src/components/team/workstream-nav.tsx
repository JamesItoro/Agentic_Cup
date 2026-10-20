"use client";

import { useEffect, useState } from "react";

export interface NavItem {
  id: string;
  title: string;
  /** Tailwind bg-* class for the colour dot. */
  dot: string;
}

/**
 * Quick-jump chips for the team page. Highlights the workstream currently in
 * view (scroll spy) so the selected team stays obvious while the bar is frozen.
 */
export function WorkstreamNav({ items }: { items: NavItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const sections = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the top-most section currently crossing the freeze line.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Freeze line sits below the app header (64px) + sticky bar; treat the
      // lower 60% of the viewport as "out of focus".
      { rootMargin: "-170px 0px -60% 0px", threshold: 0 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav className="ml-auto flex flex-wrap items-center gap-2" aria-label="Jump to workstream">
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={isActive ? "true" : undefined}
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive
                ? "border-brand/40 bg-brand/5 text-ink-strong"
                : "border-border-default bg-surface-canvas text-ink-muted hover:border-border-strong hover:text-ink-strong",
            ].join(" ")}
          >
            <span className={`size-2 rounded-full ${item.dot}`} aria-hidden /> {item.title}
          </a>
        );
      })}
    </nav>
  );
}
