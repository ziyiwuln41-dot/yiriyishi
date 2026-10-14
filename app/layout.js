import "lxgw-wenkai-webfont/style.css";
import "./globals.css";

export const metadata = {
  title: "一日一诗",
  description: "每天早上六点，一首诗、一个成语。写给中文底子不错的 JC 学生。",
};

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
