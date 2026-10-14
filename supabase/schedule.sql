-- Run this AFTER the site is live on Vercel.
-- Supabase Cron fires on the minute; Vercel's free cron can drift by up to an hour,
-- so Supabase is the alarm clock that wakes the send route at exactly 6:00am SGT.
--
-- 1. Supabase → Database → Extensions: enable pg_cron and pg_net.
-- 2. Replace YOUR_DOMAIN and YOUR_CRON_SECRET below (same secret as in Vercel), then Run.

select cron.schedule(
  'yiriyishi-6am',
  '0 22 * * *',                         -- 22:00 UTC = 06:00 SGT
  $$
  select net.http_post(
    url := 'https://YOUR_DOMAIN/api/cron/send',
    headers := jsonb_build_object('Authorization', 'Bearer YOUR_CRON_SECRET', 'Content-Type', 'application/json'),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);

select cron.schedule('yiriyishi-prune', '30 20 * * *', $$ select prune_subscribers(); $$);
