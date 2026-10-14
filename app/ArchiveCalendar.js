"use client";
import { useEffect, useMemo, useState } from "react";

const DOW = ["一", "二", "三", "四", "五", "六", "日"];

export default function ArchiveCalendar({ dates }) {
  const set = useMemo(() => new Set(dates), [dates]);
  const latest = dates[0] || new Date(Date.now() + 8 * 3600e3).toISOString().slice(0, 10);
  const [open, setOpen] = useState(false);
  const [ym, setYm] = useState(latest.slice(0, 7));

  useEffect(() => {
    if (location.hash === "#archive") setOpen(true);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = (first.getUTCDay() + 6) % 7;
  const shift = (n) => {
    const d = new Date(Date.UTC(y, m - 1 + n, 1));
    setYm(d.toISOString().slice(0, 7));
  };
  const earliest = dates[dates.length - 1]?.slice(0, 7);
  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(<span key={"b" + i} />);
  for (let d = 1; d <= days; d++) {
    const iso = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push(set.has(iso)
      ? <a key={iso} className="day" href={`/archive/${iso}`} aria-label={`${m}月${d}日，有往期`}>{d}</a>
      : <span key={iso} className="day">{d}</span>);
  }

  return (
    <>
      <div className="archive-row">
        <span>{dates.length ? `已经寄出 ${dates.length} 封，新订阅也可以从头读起。` : "第一封信寄出后，往期都会收在这里。"}</span>
        <button className="btn ghost" type="button" onClick={() => setOpen(true)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true" style={{ verticalAlign: "-2px", marginRight: 6 }}>
            <rect x="1.5" y="2.5" width="13" height="12" rx="1.5" /><path d="M1.5 6.5h13M5 1v3M11 1v3" />
          </svg>往期回顾</button>
      </div>
      {open && (
        <div className="overlay" onClick={(e) => e.target === e.currentTarget && setOpen(false)}>
          <div className="cal" role="dialog" aria-modal="true" aria-label="往期回顾">
            <div className="cal-head">
              <button type="button" onClick={() => shift(-1)} disabled={!earliest || ym <= earliest} aria-label="上个月">‹</button>
              <strong>{y}年{m}月</strong>
              <button type="button" onClick={() => shift(1)} disabled={ym >= latest.slice(0, 7)} aria-label="下个月">›</button>
            </div>
            <div className="grid7">
              {DOW.map((d) => <span key={d} className="dow">{d}</span>)}
              {cells}
            </div>
            <div className="cal-foot">
              <span>★ 有往期的日子，点开就能读</span>
              <button className="cal-close" type="button" onClick={() => setOpen(false)}>关闭</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
