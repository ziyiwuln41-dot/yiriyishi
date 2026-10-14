import TokenAction from "../TokenAction";

export const metadata = { title: "确认订阅 · 一日一诗" };

export default function Confirm() {
  return (
    <main className="wrap prose">
      <p className="back"><a href="/">← 一日一诗</a></p>
      <h1>确认订阅</h1>
      <p>点一下按钮，明早六点就会收到第一封信。</p>
      <TokenAction endpoint="/api/confirm" button="确认订阅"
        done="订阅成功。明天早上六点见。"
        failed="这个链接已经失效了。回首页重新订阅一次就好。" />
    </main>
  );
}
