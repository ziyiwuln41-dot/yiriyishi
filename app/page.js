import SignupForm from "./SignupForm";
import ArchiveCalendar from "./ArchiveCalendar";
import { SITE, getPublishedDates, getCurrentPalette } from "../lib/server.mjs";
import { motifNote } from "../lib/palettes.mjs";

export const revalidate = 300;

async function safeDates() {
  try { return (await getPublishedDates()).map((r) => r.date); } catch { return []; }
}

export default async function Home() {
  const [dates, palette] = await Promise.all([safeDates(), getCurrentPalette()]);
  const note = motifNote(palette);
  return (
    <main className="wrap">
      <div className="mast">
        <span className="seal" role="img" aria-label="一日一诗印"></span>
        <h1>{SITE.name}</h1>
      </div>
      <p className="tagline">{SITE.tagline}</p>

      <section className="card" aria-labelledby="sub-h">
        <h2 id="sub-h">每天早上六点，一首诗、一个成语</h2>
        <p>每天清晨，留一盏茶的时间给文字。三千年的诗意，一天一点，慢慢读进心里。</p>
        <SignupForm />
      </section>

      <div className="ornament" aria-hidden="true" />
      <div className="what">
        <div><b>每天</b>　一个进阶成语，附释义、生活用法与出处；一首诗，附难字注释、赏析和背后的历史。</div>
        <div><b>每周一</b>　一封导读，介绍这一周的时代与主题。</div>
        <div><b>十二周</b>　从《诗经》《楚辞》一路读到唐宋元明清。</div>
      </div>

      <div className="ornament" aria-hidden="true" />
      <div id="archive">
        <ArchiveCalendar dates={dates} />
      </div>

      <footer>
        <a href="/about">关于这个网站</a>
        <a href="/privacy">隐私声明</a>
        {SITE.contact ? <span>联系：<span style={{ userSelect: "all" }}>{SITE.contact}</span></span> : <span>联系方式即将公布</span>}
      </footer>
      {note ? <p className="motif-note">{note}</p> : null}
    </main>
  );
}
