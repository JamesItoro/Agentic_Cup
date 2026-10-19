"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Send, Square, Plus, FileText, User, ShieldCheck, Scale, FileSearch } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarkdownLite } from "./markdown-lite";
import { cn } from "@/lib/utils";

interface Source {
  id: string;
  title: string;
  date: string;
  authority: string;
}
interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

const SUGGESTIONS = [
  "Who owns the data pipeline?",
  "Summarise the solution architecture",
  "What should I do on day one?",
  "What are the current blockers?",
  "When is the next client demo?",
];

const CAPABILITIES = [
  { icon: FileSearch, title: "Grounded answers", body: "Answers come only from Project Phoenix documents, cited by name and date." },
  { icon: Scale, title: "Honest about conflict", body: "When sources disagree, it shows both and explains which it trusts more." },
  { icon: ShieldCheck, title: "Confidence on every reply", body: "Each answer ends with a high, medium or low confidence rating." },
];

let idCounter = 0;
const nextId = () => `m${++idCounter}`;

export function AssistantChat({ initialQuery = "" }: { initialQuery?: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const didInit = useRef(false);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || streaming) return;

      const userMsg: ChatMessage = { id: nextId(), role: "user", content: question };
      const assistantId = nextId();
      const priorHistory = messages;
      setMessages((prev) => [...prev, userMsg, { id: assistantId, role: "assistant", content: "" }]);
      setInput("");
      setStreaming(true);
      scrollToBottom();

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            messages: [...priorHistory, userMsg].map((m) => ({ role: m.role, content: m.content })),
          }),
          signal: controller.signal,
        });

        const sourcesHeader = res.headers.get("x-compass-sources");
        if (sourcesHeader) {
          try {
            const sources: Source[] = JSON.parse(decodeURIComponent(sourcesHeader));
            if (sources.length) {
              setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, sources } : m)));
            }
          } catch {
            /* ignore malformed header */
          }
        }

        if (!res.ok || !res.body) {
          const errText = (await res.text()) || "The assistant could not respond.";
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: errText } : m)));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + text } : m)),
          );
          scrollToBottom();
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId && !m.content
                ? { ...m, content: "Sorry, the connection dropped. Please try again." }
                : m,
            ),
          );
        }
      } finally {
        setStreaming(false);
        abortRef.current = null;
      }
    },
    [messages, streaming, scrollToBottom],
  );

  // Auto-send a query passed from the dashboard launcher (?q=...).
  useEffect(() => {
    if (!didInit.current && initialQuery.trim()) {
      didInit.current = true;
      void send(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  function stop() {
    abortRef.current?.abort();
    setStreaming(false);
  }

  function newChat() {
    if (streaming) stop();
    setMessages([]);
    setInput("");
  }

  const isEmpty = messages.length === 0;

  return (
    <div className="grid h-[calc(100vh-11rem)] grid-cols-1 gap-4 lg:grid-cols-[250px_1fr]">
      {/* Rail */}
      <Card className="hidden flex-col p-3 lg:flex">
        <Button variant="secondary" className="w-full justify-start" onClick={newChat}>
          <Plus className="size-4" /> New chat
        </Button>
        <div className="mt-5 space-y-2.5">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="rounded-[var(--radius-md)] border border-border-default p-3">
              <c.icon className="size-4 text-brand" />
              <p className="mt-1.5 text-xs font-semibold text-ink-strong">{c.title}</p>
              <p className="mt-0.5 text-xs text-ink-muted">{c.body}</p>
            </div>
          ))}
        </div>
        <p className="mt-auto pt-4 text-xs text-ink-muted">
          Powered by Claude, grounded in Project Phoenix documents only.
        </p>
      </Card>

      {/* Main */}
      <Card className="flex min-h-0 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-border-default px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-[var(--radius-md)] bg-brand/10 text-brand">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink-strong">Compass AI</p>
              <p className="text-xs text-ink-muted">Project Phoenix onboarding assistant</p>
            </div>
          </div>
          <Badge variant="success">Live</Badge>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 md:px-6">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand/10 text-brand">
                <Sparkles className="size-7" />
              </span>
              <h2 className="mt-4 text-lg font-semibold text-ink-strong">Ask me about Project Phoenix</h2>
              <p className="mt-1.5 max-w-md text-sm text-ink-muted">
                I answer from the project documents only, cite my sources, and tell you how confident I am.
              </p>
              <div className="mt-6 flex max-w-xl flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border-default bg-surface-card px-3 py-1.5 text-xs font-medium text-ink-strong transition-colors hover:border-brand hover:text-brand"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-5">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} streaming={streaming} />
              ))}
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border-default p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2 rounded-[var(--radius-md)] border border-border-strong bg-surface-canvas p-2 focus-within:border-brand"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask about Project Phoenix…"
              aria-label="Ask Compass AI a question"
              className="max-h-40 min-h-9 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink-strong placeholder:text-ink-muted focus-visible:outline-none"
            />
            {streaming ? (
              <Button type="button" variant="secondary" onClick={stop} aria-label="Stop generating">
                <Square className="size-4" /> Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!input.trim()} aria-label="Send message">
                <Send className="size-4" /> Send
              </Button>
            )}
          </form>
          <p className="mx-auto mt-2 max-w-3xl text-center text-xs text-ink-muted">
            Compass AI can make mistakes. Check important facts with the named owner.
          </p>
        </div>
      </Card>
    </div>
  );
}

function MessageBubble({ message, streaming }: { message: ChatMessage; streaming: boolean }) {
  const isUser = message.role === "user";
  const isPending = message.role === "assistant" && !message.content && streaming;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[var(--radius-lg)] rounded-br-sm bg-brand px-4 py-2.5 text-sm text-white">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
        <Sparkles className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        {isPending ? (
          <div className="flex items-center gap-1.5 py-1.5" aria-label="Compass AI is thinking">
            <span className="size-2 animate-bounce rounded-full bg-brand [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-brand [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-brand" />
          </div>
        ) : (
          <MarkdownLite text={message.content} />
        )}

        {message.sources && message.sources.length > 0 ? (
          <div className="mt-3 border-t border-border-default pt-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-ink-muted">
              <FileText className="size-3.5" /> Sources consulted
            </p>
            <div className="flex flex-wrap gap-1.5">
              {message.sources.map((s) => (
                <Link
                  key={s.id}
                  href={`/knowledge/${s.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-card px-2.5 py-1 text-xs font-medium text-ink-strong transition-colors hover:border-brand hover:text-brand"
                  title={`${s.authority} · ${s.date}`}
                >
                  <FileText className="size-3.5 text-ink-muted" />
                  {s.title}
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
