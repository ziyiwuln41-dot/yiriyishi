import { NextResponse } from "next/server";
import { env } from "../../../../lib/env.mjs";
import { db, todaySGT, mondayOf, SITE } from "../../../../lib/server.mjs";
import { renderIssue, renderWeek } from "../../../../lib/render.mjs";
import { sendMany, sendOne, unsubscribeUrl } from "../../../../lib/mail.mjs";

export const maxDuration = 60;

// Called at 06:00 SGT by Supabase Cron (see supabase/schedule.sql).
// On Mondays the weekly intro goes out first, then the daily email.
// Safe to call twice: send_log stops anyone getting the same email again.
export async function POST(req) {
  if (!env("CRON_SECRET") || req.headers.get("authorization") !== `Bearer ${env("CRON_SECRET")}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  // Test mode: {"test_to": "you@example.com", "date": "2026-10-19"} sends that day's
  // emails to one address only. Subscribers and send_log are not touched.
  const body = await req.json().catch(() => ({}));
  if (body.test_to) {
    const d = /^\d{4}-\d{2}-\d{2}$/.test(body.date || "") ? body.date : todaySGT();
    const opts = { siteUrl: SITE.url, unsubscribeUrl: SITE.url + "/unsubscribe", mode: "email" };
    const sent = [];
    const { data: week } = await db().from("weeks").select("*").eq("week_start", mondayOf(d)).maybeSingle();
    if (week && d === week.week_start) {
      await sendOne({ to: body.test_to, rendered: renderWeek({ ...week.content, week_start: week.week_start, era: week.era, theme: week.theme }, opts) });
      sent.push("weekly");
    }
    const { data: issue } = await db().from("issues").select("*").eq("date", d).maybeSingle();
    if (issue) {
      await sendOne({ to: body.test_to, rendered: renderIssue({ ...issue.content, date: issue.date, theme: issue.theme }, opts) });
      sent.push("daily");
    }
    return NextResponse.json({ ok: true, test: true, date: d, sent });
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
