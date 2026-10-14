import { NextResponse } from "next/server";
import { db } from "../../../lib/server.mjs";

// Confirmation happens on a button press (POST), not on opening the link,
// because some email scanners open every link in a message automatically.
export async function POST(req) {
  const { t } = await req.json().catch(() => ({}));
  if (!t || typeof t !== "string") return NextResponse.json({ ok: false }, { status: 400 });
  const { data, error } = await db().from("subscribers")
    .update({ confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("token", t).select("id").maybeSingle();
  if (error || !data) return NextResponse.json({ ok: false }, { status: 404 });
  return NextResponse.json({ ok: true });
}
