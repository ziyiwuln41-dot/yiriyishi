// Text markup used in all content fields.
//   {寤寐|wù mèi}  → the word with its pinyin sitting underneath it
//   blank line     → new paragraph
//   **text**       → bold

import { palette } from "./palettes.mjs";

// The colours in use for the email being rendered. Rendering is synchronous,
// so render.mjs sets this at the start of each email and every helper reads it.
export const C = {};
export function usePalette(name) {
  const p = palette(name).light;
  Object.assign(C, p, { bamboo: p.accent });
}
usePalette();

export const FONT =
  "'LXGW WenKai','LXGW WenKai Screen','Kaiti SC','STKaiti','KaiTi','Songti SC','SimSun',serif";

export function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Stacked word + pinyin. inline-block keeps it in the flow of the sentence,
// so the reader's eye stays on the Chinese line.
export function stack(word, py) {
  return (
    `<span style="display:inline-block;text-align:center;vertical-align:top;line-height:inherit;margin:0 1px">` +
    `<span style="display:block;line-height:inherit">${word}</span>` +
    `<span style="display:block;font-family:Georgia,'Times New Roman',serif;font-size:11px;font-weight:normal;letter-spacing:0;color:${C.muted};line-height:1;margin-top:-5px;white-space:nowrap">${py}</span>` +
    `</span>`
  );
}

export function inline(text = "") {
  return esc(text)
    .replace(/\{([^|{}]+)\|([^{}]+)\}/g, (_, w, p) => stack(w, p))
    .replace(/\*\*([^*]+)\*\*/g, `<strong style="color:${C.ink}">$1</strong>`);
}

export function paras(text = "", style = "") {
  return String(text)
    .split(/\n\s*\n/)
    .filter((p) => p.trim())
    .map((p) => `<p style="margin:0 0 14px;${style}">${inline(p.trim()).replace(/\n/g, "<br>")}</p>`)
    .join("");
}

// Strip markup for plain-text email part and previews.
export function plain(text = "") {
  return String(text).replace(/\{([^|{}]+)\|([^{}]+)\}/g, "$1($2)").replace(/\*\*/g, "");
}
