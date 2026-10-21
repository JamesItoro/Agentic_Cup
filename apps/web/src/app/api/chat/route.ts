import Anthropic from "@anthropic-ai/sdk";
import { getSessionUser, getActiveProjectId, getActiveRole } from "@/lib/auth/session";
import { PROJECT_PHOENIX } from "@/lib/data/dataset";
import { retrieve, formatContext } from "@/lib/rag/retrieve";
import { buildSystemPrompt } from "@/lib/rag/system-prompt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5-5";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: Request) {
  // Authorise server-side: must be signed in and a member of the active project.
  const user = await getSessionUser();
  if (!user) return new Response("Not signed in.", { status: 401 });

  const projectId = await getActiveProjectId(user.userId);
  if (!projectId || !(await getActiveRole(user.userId, projectId))) {
    return new Response("No active project membership.", { status: 403 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response("The assistant is not configured: ANTHROPIC_API_KEY is missing.", {
      status: 500,
    });
  }

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body.", { status: 400 });
  }

  const history = (body.messages ?? [])
    .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .slice(-10);
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  if (!lastUser) return new Response("No user message provided.", { status: 400 });

  // The assistant is scoped to Project Phoenix in this build.
  if (projectId !== PROJECT_PHOENIX) {
    return new Response(
      "The onboarding assistant is only available for Project Phoenix in this build. Switch to Project Phoenix to ask questions about it.",
      { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  }

  // Retrieve grounding context for the current question, but anchored to the
  // recent conversation rather than the latest message alone. Retrieving on one
  // message at a time lets the grounded documents change from turn to turn, so a
  // follow-up can surface different chunks than the answer it builds on and the
  // model ends up publicly "correcting" itself. Folding in the last few user
  // turns keeps the evidence stable across a thread; the latest question still
  // dominates the ranking because it is the freshest and usually most specific.
  const recentUserTurns = history
    .filter((m) => m.role === "user")
    .slice(-3)
    .map((m) => m.content);
  const retrievalQuery = recentUserTurns.join("\n");
  const chunks = retrieve(retrievalQuery);
  const contextBlock = formatContext(chunks);
  const system = buildSystemPrompt(contextBlock);

  // Unique source documents, in rank order, for the UI's source chips.
  const sources: { id: string; title: string; date: string; authority: string }[] = [];
  for (const c of chunks) {
    if (!sources.some((s) => s.id === c.docId)) {
      sources.push({ id: c.docId, title: c.title, date: c.date, authority: c.authority });
    }
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const anthropicStream = client.messages.stream({
    model: MODEL,
    max_tokens: 2048,
    // Adaptive thinking (omitted) at medium effort: enough reasoning to weigh
    // conflicting sources without a long pause before the answer streams.
    output_config: { effort: "medium" },
    system,
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const event of anthropicStream) {
          if (event.type === "content_block_delta" && event.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        const final = await anthropicStream.finalMessage();
        if (final.stop_reason === "refusal") {
          controller.enqueue(
            encoder.encode(
              "\n\nI am not able to answer that one. Please raise it with your project lead.",
            ),
          );
        }
      } catch (err) {
        console.error("[chat] stream error:", err);
        const message =
          err instanceof Anthropic.APIError
            ? `The assistant hit an error (${err.status ?? "unknown"}). Please try again.`
            : "The assistant hit an unexpected error. Please try again.";
        controller.enqueue(encoder.encode(`\n\n${message}`));
      } finally {
        controller.close();
      }
    },
    cancel() {
      anthropicStream.abort();
    },
  });

  return new Response(readable, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-compass-sources": encodeURIComponent(JSON.stringify(sources)),
    },
  });
}
