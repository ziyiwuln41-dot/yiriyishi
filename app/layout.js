import "lxgw-wenkai-webfont/style.css";
import "./globals.css";
import { getCurrentPalette } from "../lib/server.mjs";
import { paletteCss } from "../lib/palettes.mjs";

export const revalidate = 300;

const description = "每天清晨六点，一首诗、一个成语。三千年的诗意，一天一点，慢慢读进心里。";

// This text is what WhatsApp, Telegram and iMessage show when the link is shared.
export const metadata = {
  metadataBase: new URL("https://yiriyishiziyi.com"),
  title: "一日一诗",
  description,
  openGraph: {
    title: "一日一诗",
    description,
    url: "https://yiriyishiziyi.com",
    siteName: "一日一诗",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "/poems/guanju.png", width: 1040, height: 527, alt: "《关雎》竖排诗句" }],
  },
  twitter: { card: "summary_large_image", title: "一日一诗", description, images: ["/poems/guanju.png"] },
};

export default async function RootLayout({ children }) {
  const name = await getCurrentPalette();
  return (
    <html lang="zh-CN">
      <head><style id="week-palette" dangerouslySetInnerHTML={{ __html: paletteCss(name) }} /></head>
      <body>{children}</body>
    </html>
  );
}
