// Server-only helpers. The service-role key lives in Vercel's environment
// variables and is never sent to the browser.
import { createClient } from "@supabase/supabase-js";

export const SITE = {
  name: "一日一诗",
  tagline: "三天不学习，赶不上刘少奇。一天不用功，追不上毛泽东。",
  url: (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  from: process.env.MAIL_FROM || "一日一诗 <daily@yiriyishiziyi.com>",
  contact: process.env.CONTACT_EMAIL || "",
};

let client;
export function db() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    client = createClient(url, key, { auth: { persistSession: false } });
  }
  return client;
}

// Today's date in Singapore as YYYY-MM-DD.
export function todaySGT(now = new Date()) {
  return new Date(now.getTime() + 8 * 3600 * 1000).toISOString().slice(0, 10);
}

// The Monday of the week containing an ISO date.
export function mondayOf(iso) {
  const d = new Date(iso + "T12:00:00Z");
  const back = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().slice(0, 10);
}

export function isEmail(s) {
  return typeof s === "string" && s.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);
}

export async function getPublishedDates() {
  const { data, error } = await db()
    .from("issues")
    .select("date, theme")
    .eq("approved", true)
    .lte("date", todaySGT())
    .order("date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getIssue(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > todaySGT()) return null;
  const { data } = await db().from("issues").select("date, theme, content").eq("date", date).eq("approved", true).maybeSingle();
  return data ? { ...data.content, date: data.date, theme: data.theme } : null;
}
