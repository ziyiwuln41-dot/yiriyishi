// The 一日一诗 seal: four characters cut into red stone (白文), in each palette's seal red.
//   node scripts/make-seals.mjs
import { Resvg } from "@resvg/resvg-js";
import fs from "node:fs";
import { PALETTES } from "../lib/palettes.mjs";

const OUT = new URL("../public/seal/", import.meta.url);
fs.mkdirSync(OUT, { recursive: true });
const fonts = ["scripts/fonts/MaShanZheng.ttf"];

for (const [name, p] of Object.entries(PALETTES)) {
  const red = p.light.seal;
  // Worn edges and a few ink voids, so it reads as a stamped impression.
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs>
  <filter id="r" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" result="d"/>
    <feTurbulence type="fractalNoise" baseFrequency="0.22" numOctaves="3" seed="10" result="m"/>
    <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -16 11.4" result="mask"/>
    <feComposite in="d" in2="mask" operator="in"/></filter>
  <mask id="cut"><rect width="120" height="120" fill="white"/>
    <g font-family="Ma Shan Zheng" font-size="52" fill="black" text-anchor="middle">
      <text x="84" y="56">一</text><text x="84" y="104">日</text><text x="36" y="56">一</text><text x="36" y="104">诗</text></g></mask></defs>
  <g filter="url(#r)"><rect x="6" y="6" width="108" height="108" rx="5" fill="${red}" mask="url(#cut)"/></g></svg>`;
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 240 }, font: { fontFiles: fonts, loadSystemFonts: false, defaultFontFamily: "Ma Shan Zheng" } }).render().asPng();
  fs.writeFileSync(new URL(`${name}.png`, OUT), png);
}
console.log("seals written");
