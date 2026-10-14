-- Week 1 now starts on Thu 15 Oct. Remove the earlier test dates so the archive
-- doesn't show 关雎 twice and no stray intro goes out.
delete from issues where date = '2026-10-14';
delete from weeks where week_start in ('2026-10-14', '2026-10-19');
