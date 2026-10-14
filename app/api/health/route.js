import { NextResponse } from "next/server";
import { env } from "../../../lib/env.mjs";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Setup check. Shows only whether each setting EXISTS (true/false) — never its value.
export async function GET() {
  const present = {
    SITE_URL: !!env("SITE_URL"),
    SUPABASE_URL: !!env("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: !!env("SUPABASE_SERVICE_ROLE_KEY"),
    RESEND_API_KEY: !!env("RESEND_API_KEY"),
    MAIL_FROM: !!env("MAIL_FROM"),
    CRON_SECRET: !!env("CRON_SECRET"),
  };
  const tables = {};
  if (present.SUPABASE_URL && present.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const db = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
      for (const t of ["subscribers", "issues", "weeks", "send_log"]) {
        const { count, error } = await db.from(t).select("*", { count: "exact", head: true });
        tables[t] = error ? `error: ${error.message}` : `ok (${t === "subscribers" ? "rows hidden" : count + " rows"})`;
      }
    } catch (e) {
      tables.connection = `error: ${String(e.message || e).slice(0, 120)}`;
    }
  }
  return NextResponse.json({ env: present, tables, supabase_host: env("SUPABASE_URL") ? new URL(env("SUPABASE_URL")).host.split(".")[0].slice(0, 4) + "…" : null });
}
