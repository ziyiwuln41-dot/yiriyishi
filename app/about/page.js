import { SITE } from "../../lib/server.mjs";

export const metadata = { title: "关于 · 一日一诗" };

export default function About() {
  return (
    <main className="wrap prose">
      <p className="back"><a href="/">← 一日一诗</a></p>
      <h1>关于一日一诗</h1>
      <p>O 水准之后，华文就不再是我课表上的一门科目了。可我舍不得就这样和它告别。那些读过的诗、记下的成语，不该只留在考卷上。</p>
      <p>所以我做了这个小网站。每天清晨，寄出一首诗、一个成语，寄给你，也寄给我自己。</p>
      <p>它是我和自己的一个约定：没有老师，没有考试，也要每天和中文见一面。如果它也能陪你走一小段路，那就再好不过了。</p>
      <p style={{ marginTop: 28 }}>Ziyi<br /><span style={{ color: "var(--muted)", fontSize: 15 }}>一日一诗 · 2026 年 10 月 14 日上线</span></p>
      <h2>联系我</h2>
      <p>有任何问题、建议，或者想推荐一首诗，都欢迎写信：<span style={{ userSelect: "all" }}>{SITE.contact}</span></p>
    </main>
  );
}
