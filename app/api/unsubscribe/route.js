import { NextResponse } from "next/server";
import { db } from "../../../lib/server.mjs";

async function unsubscribe(t) {
  if (!t || typeof t !== "string") return false;
  const { data } = await db().from("subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("token", t).select("id").maybeSingle();
  return !!data;
}

// Handles both the page's button (JSON body) and the email app's one-click
// unsubscribe (token in the URL, form-encoded body).
export async function POST(req) {
  const url = new URL(req.url);
  let t = url.searchParams.get("t");
  if (!t) {
    const body = await req.json().catch(() => ({}));
    t = body.t;
  }
  const ok = await unsubscribe(t);
  return NextResponse.json({ ok }, { status: ok ? 200 : 404 });
}
