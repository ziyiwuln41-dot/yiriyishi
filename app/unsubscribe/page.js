import TokenAction from "../TokenAction";

export const metadata = { title: "退订 · 一日一诗" };

export default function Unsubscribe() {
  return (
    <main className="wrap prose">
      <p className="back"><a href="/">← 一日一诗</a></p>
      <h1>退订</h1>
      <p>退订后不会再收到任何邮件，你的邮箱会在 30 天内删除。往期内容仍然可以在网站上读。</p>
      <TokenAction endpoint="/api/unsubscribe" button="确认退订"
        done="已经退订。谢谢你读到这里，后会有期。"
        failed="找不到这个订阅，可能已经退订过了。" />
    </main>
  );
}
