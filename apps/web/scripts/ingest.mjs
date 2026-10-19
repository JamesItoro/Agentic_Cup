/**
 * One-off ingestion for the Project Phoenix corpus.
 *
 * Reads every source document, extracts text (PDF via pdf-parse, others as
 * UTF-8), chunks it, attaches source / date / authority metadata, and writes
 * src/lib/rag/corpus.json. Run with:  node scripts/ingest.mjs
 *
 * This is a dev-time step, not part of the Next.js build. The docIds match
 * those in src/lib/data/dataset.ts so answer citations can deep-link to the
 * knowledge hub.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PDFParse } from "pdf-parse";

const here = path.dirname(fileURLToPath(import.meta.url));
const CORPUS_DIR = path.resolve(here, "../../../Project_Phonix_Synthesis");
const OUT = path.resolve(here, "../src/lib/rag/corpus.json");

/**
 * authority tiers (see the assistant system prompt):
 *  - "baselined": signed / baselined documents (SOW, HLD). Outrank informal
 *     discussion for scope and commitment.
 *  - "official": project-controlled status and reference (status reports, RAID,
 *     board export, org chart, data dictionary, API spec, testing, change plan).
 *  - "informal": discussion (meeting notes, emails, Slack). Most-recent wins for
 *     fast-moving facts, but outranked for commitments.
 */
const SOURCES = [
  { file: "01_Statement_of_Work.pdf", docId: "d-sow", title: "Statement of Work", sourceType: "Signed SOW", date: "2025-05-02", authority: "baselined" },
  { file: "02_Solution_Architecture_HLD.pdf", docId: "d-hld", title: "Solution Architecture (HLD)", sourceType: "Baselined High Level Design", date: "2025-07-22", authority: "baselined" },
  { file: "03_Team_Org_Chart.pdf", docId: "d-org", title: "Team Org Chart", sourceType: "Org chart", date: "2025-07-15", authority: "official" },
  { file: "04_Status_Report_Wk11.pdf", docId: "d-status-11", title: "Status Report: Week 11", sourceType: "Weekly status report", date: "2025-08-01", authority: "official" },
  { file: "05_Status_Report_Wk8.pdf", docId: "d-status-8", title: "Status Report: Week 8", sourceType: "Weekly status report", date: "2025-07-11", authority: "official" },
  { file: "06_ADO_Jira_Board_Export.csv", docId: "d-jira", title: "ADO / Jira Board Export", sourceType: "Delivery board export", date: "2025-08-05", authority: "official" },
  { file: "07_Meeting_Notes_Standup.txt", docId: "d-standup", title: "Meeting Notes: Daily Standup", sourceType: "Standup notes", date: "2025-08-05", authority: "informal" },
  { file: "08_Meeting_Notes_Client_Steering.txt", docId: "d-steering", title: "Meeting Notes: Client Steering", sourceType: "Steering committee notes", date: "2025-07-31", authority: "informal" },
  { file: "09_Meeting_Notes_Architecture_Review.txt", docId: "d-archreview", title: "Meeting Notes: Architecture Review", sourceType: "Architecture review notes", date: "2025-07-24", authority: "informal" },
  { file: "10_RAID_Log.csv", docId: "d-raid", title: "RAID Log", sourceType: "Risks/Assumptions/Issues/Dependencies log", date: "2025-08-04", authority: "official" },
  { file: "11_Email_Scope_Discussion.txt", docId: "d-email-scope", title: "Email: Scope Discussion (Recommendation Engine)", sourceType: "Email thread", date: "2025-07-30", authority: "informal" },
  { file: "12_Email_Resource_Escalation.txt", docId: "d-email-resource", title: "Email: Resource Escalation", sourceType: "Email thread", date: "2025-07-24", authority: "informal" },
  { file: "13_Data_Dictionary.csv", docId: "d-datadict", title: "Data Dictionary", sourceType: "Reference data", date: "2025-07-18", authority: "official" },
  { file: "14_API_Spec_Excerpt.json", docId: "d-apispec", title: "API Spec Excerpt", sourceType: "API specification", date: "2025-07-28", authority: "official" },
  { file: "15_Testing_Strategy.pdf", docId: "d-testing", title: "Testing Strategy", sourceType: "Test strategy", date: "2025-07-20", authority: "official" },
  { file: "16_Stakeholder_Map.pdf", docId: "d-stakeholder", title: "Stakeholder Map", sourceType: "Stakeholder reference", date: "2025-07-12", authority: "official" },
  { file: "17_Change_Management_Plan.pdf", docId: "d-change", title: "Change Management Plan", sourceType: "Change & adoption plan", date: "2025-07-16", authority: "official" },
  { file: "18_Slack_Export.txt", docId: "d-slack", title: "Slack Export", sourceType: "Team chat export", date: "2025-08-05", authority: "informal" },
];

async function extractText(filePath) {
  if (filePath.toLowerCase().endsWith(".pdf")) {
    const buf = fs.readFileSync(filePath);
    const parser = new PDFParse({ data: new Uint8Array(buf) });
    try {
      const parsed = await parser.getText();
      return parsed.text;
    } finally {
      await parser.destroy();
    }
  }
  return fs.readFileSync(filePath, "utf8");
}

/** Clean whitespace and split into ~1200-char chunks on paragraph boundaries. */
function chunk(text) {
  const normalised = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  const paras = normalised.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const chunks = [];
  let current = "";
  for (const p of paras) {
    if (current && (current.length + p.length) > 1200) {
      chunks.push(current.trim());
      current = "";
    }
    current += (current ? "\n\n" : "") + p;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks.length ? chunks : [normalised];
}

async function main() {
  const out = [];
  for (const src of SOURCES) {
    const filePath = path.join(CORPUS_DIR, src.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`! missing: ${src.file}`);
      continue;
    }
    const text = await extractText(filePath);
    const chunks = chunk(text);
    chunks.forEach((content, i) => {
      out.push({
        id: `${src.docId}#${i}`,
        docId: src.docId,
        title: src.title,
        sourceType: src.sourceType,
        date: src.date,
        authority: src.authority,
        content,
      });
    });
    console.log(`  ${src.file.padEnd(40)} -> ${chunks.length} chunks`);
  }
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), "utf8");
  console.log(`\nWrote ${out.length} chunks to ${path.relative(process.cwd(), OUT)}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
