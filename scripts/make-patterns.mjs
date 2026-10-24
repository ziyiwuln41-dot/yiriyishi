// Draws each week's decorative patterns as transparent PNGs in public/patterns/.
// Emails can't rely on SVG, so these are rendered once at 2x and served as images.
//   node scripts/make-patterns.mjs
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import { PALETTES } from "../lib/palettes.mjs";

const OUT = new URL("../public/patterns/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });

function png(name, w, h, body) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
  const out = new Resvg(svg, { fitTo: { mode: "width", value: w * 2 } }).render().asPng();
  fs.writeFileSync(new URL(name, OUT), out);
}
const repeat = (n, step, f) => Array.from({ length: n }, (_, i) => f(i * step, i)).join("");

// ── 楚漆 · 云气纹: the flowing cloud scrolls painted on Chu lacquerware ──
{
  const { accent: red, ink } = PALETTES.chuqi.light;
  // One cloud curl: a long sweep that ends in a tight spiral, with a smaller counter-curl.
  const curl = (x, y, s = 1, flip = 1) => `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})">
    <path d="M-60 18 C-40 18 -30 -14 0 -14 C22 -14 30 6 16 14 C6 20 -4 10 4 4 C9 1 13 6 10 9" fill="none" stroke="${red}" stroke-width="3.2" stroke-linecap="round"/>
    <path d="M10 -14 C30 -26 52 -20 58 -4 C62 8 50 14 44 8 C40 4 44 -1 48 1" fill="none" stroke="${red}" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="-48" cy="6" r="2.2" fill="${ink}"/></g>`;
  // Header band: a running line of clouds between two fine lacquer-black rules.
  png("chuqi-band.png", 600, 64,
    `<g opacity="0.55">
      <line x1="0" y1="6" x2="600" y2="6" stroke="${ink}" stroke-width="1"/>
      <line x1="0" y1="10" x2="600" y2="10" stroke="${red}" stroke-width="0.8"/>
      ${repeat(6, 120, (x, i) => curl(x + 66, 38, 0.82, i % 2 ? -1 : 1))}
      <line x1="0" y1="58" x2="600" y2="58" stroke="${red}" stroke-width="0.8"/>
    </g>`);
  // Divider between sections: a single curl flanked by fading rules.
  png("chuqi-divider.png", 300, 28,
    `<defs><linearGradient id="f" x1="0" x2="1"><stop offset="0" stop-color="${red}" stop-opacity="0"/><stop offset="1" stop-color="${red}" stop-opacity="0.6"/></linearGradient>
     <linearGradient id="g" x1="1" x2="0"><stop offset="0" stop-color="${red}" stop-opacity="0"/><stop offset="1" stop-color="${red}" stop-opacity="0.6"/></linearGradient></defs>
     <rect x="0" y="13.5" width="105" height="1" fill="url(#f)"/><rect x="195" y="13.5" width="105" height="1" fill="url(#g)"/>
     <g opacity="0.75">${curl(150, 16, 0.55)}</g>`);
  // Watermark in the corner of the poem box.
  png("chuqi-mark.png", 200, 140, `<g opacity="0.13">${curl(104, 70, 1.35)}${curl(70, 112, 0.8, -1)}</g>`);
  // Faint tile for the page behind the card.
  png("chuqi-tile.png", 220, 220, `<g opacity="0.07">${curl(60, 50, 0.6)}${curl(170, 160, 0.6, -1)}</g>`);
}

// ── 汉砖 · 画像砖纹样: lozenges, coin rings and the four-petal 柿蒂纹 of Han tomb bricks ──
{
  const { accent: ochre, muted: slate, ink } = PALETTES.hanzhuan.light;
  const lozenge = (x, y) => `<path d="M${x} ${y - 16} L${x + 26} ${y} L${x} ${y + 16} L${x - 26} ${y} Z" fill="none" stroke="${ochre}" stroke-width="1.6"/>
    <path d="M${x} ${y - 8} L${x + 13} ${y} L${x} ${y + 8} L${x - 13} ${y} Z" fill="none" stroke="${slate}" stroke-width="1.2"/>`;
  const coin = (x, y, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${ochre}" stroke-width="1.6"/>
    <rect x="${x - r * 0.36}" y="${y - r * 0.36}" width="${r * 0.72}" height="${r * 0.72}" fill="none" stroke="${slate}" stroke-width="1.2"/>`;
  const shidi = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    ${[0, 90, 180, 270].map((a) => `<path transform="rotate(${a})" d="M0 -6 C10 -14 10 -30 0 -40 C-10 -30 -10 -14 0 -6 Z" fill="none" stroke="${ochre}" stroke-width="2.4"/>`).join("")}
    <circle r="6" fill="none" stroke="${slate}" stroke-width="2"/></g>`;
  png("hanzhuan-band.png", 600, 64,
    `<g opacity="0.6">
      <rect x="1" y="4" width="598" height="56" fill="none" stroke="${slate}" stroke-width="1"/>
      <rect x="5" y="8" width="590" height="48" fill="none" stroke="${ochre}" stroke-width="0.8"/>
      ${repeat(10, 60, (x) => lozenge(x + 30, 32))}
      ${repeat(9, 60, (x) => coin(x + 60, 32, 8))}
    </g>`);
  png("hanzhuan-divider.png", 300, 28,
    `<g opacity="0.7"><line x1="20" y1="14" x2="118" y2="14" stroke="${slate}" stroke-width="1"/>
     <line x1="182" y1="14" x2="280" y2="14" stroke="${slate}" stroke-width="1"/>
     ${coin(132, 14, 6)}${coin(168, 14, 6)}${shidi(150, 14, 0.3)}</g>`);
  png("hanzhuan-mark.png", 150, 150, `<g opacity="0.12">${shidi(80, 76, 1.5)}</g>`);
  // Page tile: the staggered courses of a brick wall.
  png("hanzhuan-tile.png", 160, 80,
    `<g opacity="0.08" fill="none" stroke="${ink}" stroke-width="1">
      <rect x="0.5" y="0.5" width="79" height="39"/><rect x="80.5" y="0.5" width="79" height="39"/>
      <rect x="-39.5" y="40.5" width="79" height="39"/><rect x="40.5" y="40.5" width="79" height="39"/><rect x="120.5" y="40.5" width="79" height="39"/>
    </g>`);
}
console.log("patterns written");
