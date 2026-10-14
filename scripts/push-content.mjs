// Uploads curated content from content/weeks and content/issues to Supabase.
// An issue only sends once "approved": true is set in its JSON
// (or ticked in the Supabase table editor).
//
// Usage: node --env-file=.env.local scripts/push-content.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local first.");
  process.exit(1);
}
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const read = (dir) => fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith(".json")).map((f) => JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8"))) : [];

for (const w of read("content/weeks")) {
  const { week_start, era, theme, ...content } = w;
  const { error } = await db.from("weeks").upsert({ week_start, era, theme, content, updated_at: new Date().toISOString() });
  console.log(error ? `✗ week ${week_start}: ${error.message}` : `✓ week ${week_start} ${era} · ${theme}`);
}
for (const i of read("content/issues")) {
  const { date, week_start, theme, approved = false, ...content } = i;
  const { error } = await db.from("issues").upsert({ date, week_start, theme, content, approved, updated_at: new Date().toISOString() });
  console.log(error ? `✗ issue ${date}: ${error.message}` : `✓ issue ${date} ${content.chengyu?.word} / ${content.poem?.title}${approved ? "" : "  (not approved yet)"}`);
}
