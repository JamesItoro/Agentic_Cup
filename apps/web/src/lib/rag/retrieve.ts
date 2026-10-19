import "server-only";
import corpusData from "./corpus.json";

export interface Chunk {
  id: string;
  docId: string;
  title: string;
  sourceType: string;
  date: string;
  authority: "baselined" | "official" | "informal";
  content: string;
}

export const corpus = corpusData as Chunk[];

const STOPWORDS = new Set([
  "the", "a", "an", "and", "or", "but", "of", "to", "in", "on", "for", "with",
  "is", "are", "was", "were", "be", "been", "it", "this", "that", "these", "those",
  "as", "at", "by", "from", "do", "does", "did", "i", "we", "you", "they", "what",
  "who", "whom", "which", "when", "where", "why", "how", "me", "my", "our",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

// Precompute BM25 statistics once per server process.
const K1 = 1.5;
const B = 0.75;
const docTokens = corpus.map((c) => tokenize(`${c.title} ${c.content}`));
const docLengths = docTokens.map((t) => t.length);
const avgDocLen = docLengths.reduce((a, b) => a + b, 0) / (docLengths.length || 1);
const termFreqs = docTokens.map((tokens) => {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
  return tf;
});
const docFreq = (() => {
  const df = new Map<string, number>();
  for (const tf of termFreqs) {
    for (const term of tf.keys()) df.set(term, (df.get(term) ?? 0) + 1);
  }
  return df;
})();
const N = corpus.length;

function idf(term: string): number {
  const n = docFreq.get(term) ?? 0;
  // BM25 idf with +1 floor so common terms never go negative.
  return Math.log(1 + (N - n + 0.5) / (n + 0.5));
}

/**
 * Rank corpus chunks against a query with BM25 and return the top matches up to
 * a character budget. Returns [] for an empty query or when nothing scores.
 */
export function retrieve(query: string, { topK = 12, charBudget = 24000 } = {}): Chunk[] {
  const qTerms = tokenize(query);
  if (qTerms.length === 0) return [];

  const scored = corpus.map((chunk, i) => {
    const tf = termFreqs[i];
    const len = docLengths[i];
    let score = 0;
    for (const term of qTerms) {
      const f = tf.get(term);
      if (!f) continue;
      const denom = f + K1 * (1 - B + (B * len) / avgDocLen);
      score += idf(term) * ((f * (K1 + 1)) / denom);
    }
    return { chunk, score };
  });

  const ranked = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  const out: Chunk[] = [];
  let used = 0;
  for (const { chunk } of ranked) {
    if (used + chunk.content.length > charBudget && out.length > 0) break;
    out.push(chunk);
    used += chunk.content.length;
  }
  return out;
}

/** Format retrieved chunks into a labelled context block for the model. */
export function formatContext(chunks: Chunk[]): string {
  if (chunks.length === 0) {
    return "(No project documents matched this question.)";
  }
  return chunks
    .map(
      (c) =>
        `<source title="${c.title}" type="${c.sourceType}" date="${c.date}" authority="${c.authority}">\n${c.content}\n</source>`,
    )
    .join("\n\n");
}
