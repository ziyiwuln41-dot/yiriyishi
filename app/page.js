import SignupForm from "./SignupForm";
import ArchiveCalendar from "./ArchiveCalendar";
import { SITE, getPublishedDates } from "../lib/server.mjs";

export const revalidate = 300;

async function safeDates() {
  try { return (await getPublishedDates()).map((r) => r.date); } catch { return []; }
}

export default async function Home() {
  const dates = await safeDates();
  return (
    <main className="wrap">
      <div className="mast">
        <span className="seal">z.y.</span>
        <h1>{SITE.name}</h1>
      </div>
      <p className="tagline">{SITE.tagline}</p>

      <section className="card" aria-labelledby="sub-h">
        <h2 id="sub-h">每天早上六点，一首诗、一个成语</h2>
        <p>写给中文底子不错的 JC 学生。不教你早就会的，只教你还不熟的。</p>
        <SignupForm />
      </section>

      <div className="what">
        <div><b>每天</b>　一个进阶成语，附释义、生活用法与出处；一首诗，附难字注释、赏析和背后的历史。</div>
        <div><b>每周一</b>　一封导读，介绍这一周的时代与主题。</div>
        <div><b>十二周</b>　从《诗经》《楚辞》一路读到唐宋元明清。</div>
      </div>

      <div id="archive">
        <ArchiveCalendar dates={dates} />
      </div>

      <footer>
        <a href="/about">关于这个网站</a>
        <a href="/privacy">隐私声明</a>
        {SITE.contact ? <span>联系：<span style={{ userSelect: "all" }}>{SITE.contact}</span></span> : <span>联系方式即将公布</span>}
      </footer>
    </main>
  );
}
