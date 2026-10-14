import fs from "node:fs";
import path from "node:path";

export const metadata = { title: "隐私声明 · 一日一诗" };

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inl = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*]+)\*/g, "<em>$1</em>");

// Minimal Markdown → HTML for content/privacy.md (headings, lists, paragraphs, bold).
function md(src) {
  const out = [];
  let list = false;
  for (const line of src.split("\n")) {
    if (/^- /.test(line)) { if (!list) { out.push("<ul>"); list = true; } out.push(`<li>${inl(line.slice(2))}</li>`); continue; }
    if (list) { out.push("</ul>"); list = false; }
    if (/^# /.test(line)) out.push(`<h1>${inl(line.slice(2))}</h1>`);
    else if (/^## /.test(line)) out.push(`<h2>${inl(line.slice(3))}</h2>`);
    else if (/^---\s*$/.test(line)) out.push("<hr>");
    else if (line.trim()) out.push(`<p>${inl(line)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("\n");
}

export default function Privacy() {
  const src = fs.readFileSync(path.join(process.cwd(), "content/privacy.md"), "utf8");
  return (
    <main className="wrap prose">
      <p className="back"><a href="/">← 一日一诗</a></p>
      <div dangerouslySetInnerHTML={{ __html: md(src) }} />
    </main>
  );
}
