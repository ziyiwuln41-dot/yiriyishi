// Writes previews/<date>.html (daily email) and previews/week-<date>.html (Monday intro)
// so you can open them in a browser before anything is sent.
// Usage: node scripts/preview-email.mjs 2026-10-19
import fs from "node:fs";
import { renderIssue, renderWeek, emailDocument } from "../lib/render.mjs";

const date = process.argv[2];
const site = process.env.SITE_URL || "http://localhost:3000";
fs.mkdirSync("previews", { recursive: true });

const issuePath = `content/issues/${date}.json`;
if (fs.existsSync(issuePath)) {
  const r = renderIssue(JSON.parse(fs.readFileSync(issuePath, "utf8")), { siteUrl: site, unsubscribeUrl: site + "/unsubscribe?t=preview" });
  fs.writeFileSync(`previews/${date}.html`, emailDocument(r));
  console.log(`previews/${date}.html  — subject: ${r.subject}`);
}
const weekPath = `content/weeks/${date}.json`;
if (fs.existsSync(weekPath)) {
  const r = renderWeek(JSON.parse(fs.readFileSync(weekPath, "utf8")), { siteUrl: site, unsubscribeUrl: site + "/unsubscribe?t=preview" });
  fs.writeFileSync(`previews/week-${date}.html`, emailDocument(r));
  console.log(`previews/week-${date}.html  — subject: ${r.subject}`);
}
