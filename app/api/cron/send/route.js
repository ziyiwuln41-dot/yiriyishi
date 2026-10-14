import { NextResponse } from "next/server";
import { db, todaySGT, mondayOf, SITE } from "../../../../lib/server.mjs";
import { renderIssue, renderWeek } from "../../../../lib/render.mjs";
import { sendMany, unsubscribeUrl } from "../../../../lib/mail.mjs";

export const maxDuration = 60;

// Called at 06:00 SGT by Supabase Cron (see supabase/schedule.sql).
// On Mondays the weekly intro goes out first, then the daily email.
// Safe to call twice: send_log stops anyone getting the same email again.
export async function POST(req) {
  if (!process.env.CRON_SECRET || req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const date = todaySGT();
  const report = { date, weekly: null, daily: null };

  const { data: subs, error } = await db().from("subscribers")
    .select("id, email, token").not("confirmed_at", "is", null).is("unsubscribed_at", null);
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });

  async function deliver(kind, refDate, render) {
    const { data: done } = await db().from("send_log").select("subscriber_id").eq("kind", kind).eq("ref_date", refDate);
    const already = new Set((done || []).map((r) => r.subscriber_id));
    const todo = subs.filter((s) => !already.has(s.id));
    const items = todo.map((s) => ({
      to: s.email, token: s.token, subscriber_id: s.id,
      rendered: render({ siteUrl: SITE.url, unsubscribeUrl: unsubscribeUrl(s.token), mode: "email" }),
    }));
    const sent = await sendMany(items);
    if (sent.length) {
      await db().from("send_log").insert(sent.map((s) => ({ subscriber_id: s.subscriber_id, kind, ref_date: refDate })));
    }
    return sent.length;
  }

  try {
    if (date === mondayOf(date)) {
      const { data: week } = await db().from("weeks").select("*").eq("week_start", date).maybeSingle();
      if (week) {
        const w = { ...week.content, week_start: week.week_start, era: week.era, theme: week.theme };
        report.weekly = await deliver("weekly", date, (o) => renderWeek(w, o));
      }
    }
    const { data: issue } = await db().from("issues").select("*").eq("date", date).eq("approved", true).maybeSingle();
    if (issue) {
      const i = { ...issue.content, date: issue.date, theme: issue.theme };
      report.daily = await deliver("daily", date, (o) => renderIssue(i, o));
    } else {
      report.daily = "no approved issue for today";
    }
  } catch (e) {
    return NextResponse.json({ ok: false, ...report, error: String(e.message || e) }, { status: 500 });
  }
  return NextResponse.json({ ok: true, ...report });
}
