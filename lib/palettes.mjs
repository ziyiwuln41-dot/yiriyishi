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
  // 楚漆 · Chu lacquer: vermilion and black on warm paper (楚辞 week)
  chuqi: {
    light: {
      page: "#ECE3D5", paper: "#F6F0E6", ink: "#231A17", muted: "#7A6A61",
      accent: "#9E2B25", soft: "#F1E1D8", line: "#E0D2C3", seal: "#9E2B25",
      wash: "rgba(158, 43, 37, 0.10)",
    },
    dark: {
      page: "#17110F", paper: "#201815", ink: "#EEE4D9", muted: "#A9978C", accent: "#D9705F",
      soft: "#2F1F1B", line: "#3B2B26", seal: "#E0806C", wash: "rgba(200, 80, 60, 0.14)",
    },
  },
};

export const DEFAULT_PALETTE = "zhuqing";

export function palette(name) {
  return PALETTES[name] || PALETTES[DEFAULT_PALETTE];
}

// CSS custom properties for the website, light and dark.
export function paletteCss(name) {
  const p = palette(name);
  const vars = (o) => Object.entries(o).map(([k, v]) => `--${k === "accent" ? "bamboo" : k}:${v};`).join("");
  return `:root{${vars(p.light)}}@media (prefers-color-scheme: dark){:root{${vars(p.dark)}color-scheme:dark;}}`;
}
