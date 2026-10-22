// Renders a poem as a vertical, right-to-left image in 霞鹜文楷 for emails.
// Gmail can't show vertical text or custom fonts, so the email uses this image
// (with the full poem as alt text and the horizontal version underneath).
//
// Usage: node scripts/render-poem.mjs content/issues/2026-10-19.json
// Output: public/poems/<name from the issue's poem.image>
import { Resvg } from "@resvg/resvg-js";
import opentype from "opentype.js";
import fs from "node:fs";
import path from "node:path";

const FONTS = {
  regular: { family: "LXGW WenKai", files: [["scripts/fonts/LXGWWenKai-Regular.ttf", "https://github.com/lxgw/LxgwWenKai/releases/download/v1.520/LXGWWenKai-Regular.ttf"]] },
  medium: { family: "LXGW WenKai", files: [["scripts/fonts/WenKaiMedium.ttf", "https://github.com/lxgw/LxgwWenKai/releases/download/v1.520/LXGWWenKai-Medium.ttf"]] },
  // 马善政楷书 (Ma Shan Zheng, SIL OFL). It lacks a few rare characters (e.g. 蕡 漘),
  // which fall back to 霞鹜文楷 Medium.
  brush: { family: "Ma Shan Zheng", files: [
    ["scripts/fonts/MaShanZheng.ttf", "https://raw.githubusercontent.com/google/fonts/main/ofl/mashanzheng/MaShanZheng-Regular.ttf"],
    ["scripts/fonts/WenKaiMedium.ttf", "https://github.com/lxgw/LxgwWenKai/releases/download/v1.520/LXGWWenKai-Medium.ttf"]] },
};
const CHOICE = FONTS[process.env.POEM_FONT || "brush"];

async function ensureFont() {
  for (const [file, url] of CHOICE.files) {
    if (fs.existsSync(file)) continue;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    console.log("Downloading " + path.basename(file) + " (one time)…");
    const res = await fetch(url);
    if (!res.ok) throw new Error("Font download failed: " + res.status);
    fs.writeFileSync(file, Buffer.from(await res.arrayBuffer()));
  }
}

const strip = (s) => s.replace(/\{([^|{}]+)\|[^{}]+\}/g, "$1");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");

let mainFont = null;
const hasGlyph = (ch) => !mainFont || mainFont.charToGlyphIndex(ch) > 0;
const heavy = (ch) => (CHOICE.family === "Ma Shan Zheng" && !hasGlyph(ch) ? ' stroke="#273026" stroke-width="0.7" stroke-linejoin="round"' : "");

function buildSvg(poem) {
  // Each column is one phrase pair, e.g. 关关雎鸠 / 在河之洲, with a breath between them.
  // A stanza boundary (one entry in poem.lines) gets a wider gap between columns.
  // Long sentences (e.g. 伐檀) are broken into columns of at most two phrases.
  const cols = [];
  // poem.imageLines (optional) lets prose pieces like 渔父 show only their key lines.
  (poem.imageLines || poem.lines).forEach((line, li) => {
    let first = true;
    for (const sentence of strip(line).split(/[。！？；]/).filter((x) => x.trim())) {
      const phrases = sentence.split(/[，、：]/).map((p) => [...p.replace(/[^\p{Script=Han}]/gu, "")]).filter((p) => p.length);
      for (let i = 0; i < phrases.length; i += 2) {
        const c = phrases.slice(i, i + 2);
        c.stanzaStart = first && li > 0;
        first = false;
        cols.push(c);
      }
    }
  });
  const size = 44, step = 58, colGap = 86, pad = 70, phraseGap = 30;
  const colHeight = (c) => c.reduce((h, p) => h + p.length * step, 0) + (c.length - 1) * phraseGap;
  const maxH = Math.max(...cols.map(colHeight));
  const titleChars = [...poem.title.replace(/（.*?）/g, "")];
  const stanzaGap = 34;
  const stanzas = cols.filter((c) => c.stanzaStart).length;
  const width = pad * 2 + (cols.length + 1) * colGap + 30 + stanzas * stanzaGap;
  const srcChars = [...poem.source.replace(/[《》 ·]/g, "")];
  const srcEnd = pad + 56 + titleChars.length * 68 + 40 + (srcChars.length - 1) * 30;
  // Leave room so the seal always sits below the source label.
  const height = Math.max(pad * 2 + Math.max(maxH, titleChars.length * 68 + 120), srcEnd + 30 + 62 + pad);

  let out = "";
  // Title column on the far right, larger.
  let x = width - pad - colGap / 2;
  titleChars.forEach((ch, i) => {
    out += `<text x="${x}" y="${pad + 56 + i * 68}" font-size="56" fill="#273026" text-anchor="middle"${heavy(ch)}>${esc(ch)}</text>`;
  });
  srcChars.forEach((ch, i) => {
    out += `<text x="${x}" y="${pad + 56 + titleChars.length * 68 + 40 + i * 30}" font-size="22" fill="#6E776A" text-anchor="middle">${esc(ch)}</text>`;
  });
  x -= colGap + 30;
  for (const c of cols) {
    if (c.stanzaStart) x -= stanzaGap;
    let y = pad + size;
    c.forEach((phrase, pi) => {
      for (const ch of phrase) {
        out += `<text x="${x}" y="${y}" font-size="${size}" fill="#273026" text-anchor="middle"${heavy(ch)}>${esc(ch)}</text>`;
        y += step;
      }
      if (pi < c.length - 1) y += phraseGap;
    });
    x -= colGap;
  }
  // z.y. seal, bottom of the title column.
  const sx = width - pad - colGap / 2 - 31, sy = Math.max(height - pad - 62, srcEnd + 30);
  out += `<g transform="rotate(-4 ${sx + 30} ${sy + 30})"><rect x="${sx}" y="${sy}" width="62" height="62" rx="5" fill="none" stroke="#A8432F" stroke-width="4"/>
  <text x="${sx + 31}" y="${sy + 41}" font-size="24" fill="#A8432F" text-anchor="middle" font-weight="bold" font-family="LXGW WenKai">z.y.</text></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
<defs>
  <radialGradient id="wash" cx="78%" cy="18%" r="60%"><stop offset="0" stop-color="#C9D8C0" stop-opacity=".55"/><stop offset="1" stop-color="#C9D8C0" stop-opacity="0"/></radialGradient>
  <radialGradient id="wash2" cx="12%" cy="92%" r="45%"><stop offset="0" stop-color="#B9C9AE" stop-opacity=".35"/><stop offset="1" stop-color="#B9C9AE" stop-opacity="0"/></radialGradient>
</defs>
<rect width="100%" height="100%" fill="#FBFCF7"/>
<rect width="100%" height="100%" fill="url(#wash)"/><rect width="100%" height="100%" fill="url(#wash2)"/>
<g font-family="${CHOICE.family}, LXGW WenKai">${out}</g>
</svg>`;
}

const file = process.argv[2];
if (!file) { console.error("Usage: node scripts/render-poem.mjs <issue.json>"); process.exit(1); }
const issue = JSON.parse(fs.readFileSync(file, "utf8"));
if (!issue.poem?.image) { console.error("This issue has no poem.image path set."); process.exit(1); }
await ensureFont();
mainFont = opentype.loadSync(CHOICE.files[0][0]);
const svg = buildSvg(issue.poem);
const png = new Resvg(svg, {
  font: { fontFiles: CHOICE.files.map(([f]) => f), loadSystemFonts: false, defaultFontFamily: CHOICE.family },
  fitTo: { mode: "width", value: 1040 },
}).render().asPng();
const outPath = process.env.OUT || path.join("public", issue.poem.image);
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, png);
console.log("Wrote " + outPath);
