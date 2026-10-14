import { NextResponse } from "next/server";
import { db, isEmail, SITE } from "../../../lib/server.mjs";
import { sendOne } from "../../../lib/mail.mjs";
import { C, FONT } from "../../../lib/markup.mjs";

// The same reply for every outcome, so nobody can use this form
// to find out whether an address is already subscribed.
const OK = { ok: true, message: "请到邮箱点击确认链接，确认后才会开始寄信。" };

function confirmEmail(token) {
  const link = `${SITE.url}/confirm?t=${encodeURIComponent(token)}`;
  return {
    subject: "请确认订阅一日一诗",
    text: `点这个链接确认订阅：${link}\n\n如果不是你本人订阅，忽略这封信即可，我们不会再联系你。`,
    body: `<div style="background:${C.page};padding:24px 12px"><div style="max-width:520px;margin:0 auto;background:${C.paper};border:1px solid ${C.line};border-radius:6px;padding:30px;font-family:${FONT};font-size:17px;line-height:1.8;color:${C.ink}">
<p style="margin:0 0 6px;font-size:24px;font-weight:bold">一日一诗</p>
<p style="margin:0 0 18px">差一步就好。点下面的按钮确认订阅，明早六点，第一封信就会到。</p>
<p style="margin:0 0 22px"><a href="${link}" style="display:inline-block;background:${C.bamboo};color:#fff;text-decoration:none;padding:10px 22px;border-radius:4px">确认订阅</a></p>
<p style="margin:0;font-size:13px;color:${C.muted}">如果不是你本人订阅，忽略这封信即可，我们不会再联系你。</p>
</div></div>`,
  };
}

export async function POST(req) {
  let body;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, message: "请求格式不对。" }, { status: 400 }); }

  // Honeypot: real people never fill the hidden "website" field; bots usually do.
  if (body.website) return NextResponse.json(OK);

  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) return NextResponse.json({ ok: false, message: "这个邮箱地址好像不太对，请再检查一下。" }, { status: 400 });

  const { data: existing } = await db().from("subscribers").select("id, token, confirmed_at, unsubscribed_at, created_at").eq("email", email).maybeSingle();

  if (existing?.confirmed_at && !existing.unsubscribed_at) return NextResponse.json(OK);

  // Don't resend a confirmation more than once every 10 minutes.
  if (existing && !existing.confirmed_at && Date.now() - new Date(existing.created_at).getTime() < 10 * 60 * 1000) {
    return NextResponse.json(OK);
  }

  let token;
  if (existing) {
    const { data, error } = await db().from("subscribers")
      .update({ confirmed_at: null, unsubscribed_at: null, created_at: new Date().toISOString() })
      .eq("id", existing.id).select("token").single();
    if (error) return NextResponse.json({ ok: false, message: "暂时出了点问题，请稍后再试。" }, { status: 500 });
    token = data.token;
  } else {
    const { data, error } = await db().from("subscribers").insert({ email }).select("token").single();
    if (error) return NextResponse.json({ ok: false, message: "暂时出了点问题，请稍后再试。" }, { status: 500 });
    token = data.token;
  }

  try {
    await sendOne({ to: email, rendered: confirmEmail(token) });
  } catch {
    return NextResponse.json({ ok: false, message: "确认信没寄出去，请稍后再试。" }, { status: 502 });
  }
  return NextResponse.json(OK);
}
