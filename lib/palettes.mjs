// Colour schemes. Each week's content names one ("palette": "chuqi");
// the emails, the archive page for that day, and the website (during that week) all use it.
// "accent" is the colour of section titles, links and the left rule on examples.

export const PALETTES = {
  // 竹青 · bamboo light (Week 1, 诗经)
  zhuqing: {
    light: {
      page: "#EEF1E8", paper: "#FBFCF7", ink: "#273026", muted: "#6E776A",
      accent: "#4F7448", soft: "#E2EBDB", line: "#D9DFCF", seal: "#A8432F",
      wash: "rgba(150, 178, 138, 0.28)",
    },
    dark: {
      page: "#161A15", paper: "#1D221C", ink: "#E3E8DC", muted: "#98A193", accent: "#8DB583",
      soft: "#263124", line: "#343C31", seal: "#D9765F", wash: "rgba(110, 150, 100, 0.16)",
    },
  },
  // 楚漆 · 朱金漆: ivory paper on deep lacquer, ruby red with gold clouds (楚辞 week)
  chuqi: {
    light: { page: "#2B1517", paper: "#FBF7EF", ink: "#241517", muted: "#7B6566", accent: "#9B1B30", soft: "#F5E6E3", line: "#E6D6CC", seal: "#9B1B30", gold: "#B38A3F", wash: "rgba(179, 138, 63, 0.10)" },
    dark: { page: "#140A0B", paper: "#1F1314", ink: "#F1E7DF", muted: "#B39C9A", accent: "#E0697A", soft: "#2E1B1D", line: "#3D2729", seal: "#E0697A", gold: "#D2AE62", wash: "rgba(210, 174, 98, 0.10)" },
  },
  // 汉砖 · Han tomb bricks: ochre and slate (汉 week)
  hanzhuan: {
    light: {
      page: "#E7DED2", paper: "#F5EFE7", ink: "#2A2522", muted: "#646A6E",
      accent: "#8A5536", soft: "#ECE2D6", line: "#DBCFC0", seal: "#A33A2A",
      wash: "rgba(138, 85, 54, 0.12)",
    },
    dark: {
      page: "#161412", paper: "#1F1C19", ink: "#ECE5DC", muted: "#A3A7AA", accent: "#D19A73",
      soft: "#2B2520", line: "#38322C", seal: "#DD7C66", wash: "rgba(190, 130, 90, 0.14)",
    },
  },
};

// Decorative patterns drawn by scripts/make-patterns.mjs, and a line telling
// readers what the pattern is, shown at the foot of each email.
export const MOTIFS = {
  chuqi: { note: "本周纹样：云气纹。战国楚墓出土的漆器上，常用朱、黑、金三色画出这种流动的云，楚人相信那是神灵往来的路。" },
  hanzhuan: { note: "本周纹样：菱形纹、钱纹与柿蒂纹，都是汉代画像砖和铜镜上最常见的装饰。" },
};

export const DEFAULT_PALETTE = "zhuqing";

export function palette(name) {
  return PALETTES[name] || PALETTES[DEFAULT_PALETTE];
}

// CSS custom properties for the website, light and dark.
export function paletteCss(name) {
  const p = palette(name);
  const vars = (o) => Object.entries(o).map(([k, v]) => `--${k === "accent" ? "bamboo" : k}:${v};`).join("");
  const key = PALETTES[name] ? name : DEFAULT_PALETTE;
  const img = (k) => (MOTIFS[key] ? `url(/patterns/${key}-${k}.png)` : "none");
  const art = `--tile:${img("tile")};--band:${img("band")};--mark:${img("mark")};--divider:${img("divider")};--seal-img:url(/seal/${key}.png);--gold:${p.light.gold || p.light.accent};--band-h:${MOTIFS[key] ? "64px" : "8px"};--band-bg:${MOTIFS[key] ? p.light.paper : p.light.accent};`;
  return `:root{${vars(p.light)}${art}}@media (prefers-color-scheme: dark){:root{${vars(p.dark)}color-scheme:dark;}}`;
}

export function motifNote(name) {
  return MOTIFS[name]?.note || "";
}
