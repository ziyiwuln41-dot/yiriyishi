-- 一日一诗 database. Paste into Supabase → SQL Editor → Run.
-- Row Level Security is ON for every table with NO public policies:
-- only the server (using the secret service-role key) can read or write.
-- The public "anon" key cannot see the subscriber list.

create table if not exists weeks (
  week_start date primary key,          -- the Monday this week begins
  era text not null,
  theme text not null,
  content jsonb not null,               -- intro text + 7-day preview
  updated_at timestamptz default now()
);

create table if not exists issues (
  date date primary key,                -- the morning it is sent (SGT)
  week_start date references weeks(week_start),
  theme text not null,
  content jsonb not null,               -- greeting, 成语, poem, appreciation
  approved boolean not null default false,  -- nothing sends until you tick this
  updated_at timestamptz default now()
);

create table if not exists subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  token text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  created_at timestamptz default now()
);

create table if not exists send_log (
  subscriber_id uuid references subscribers(id) on delete cascade,
  kind text not null check (kind in ('daily','weekly')),
  ref_date date not null,
  sent_at timestamptz default now(),
  primary key (subscriber_id, kind, ref_date)
);

alter table weeks enable row level security;
alter table issues enable row level security;
alter table subscribers enable row level security;
alter table send_log enable row level security;

-- Retention (privacy notice): unconfirmed sign-ups after 7 days,
-- unsubscribed addresses after 30 days.
create or replace function prune_subscribers() returns void language sql as $$
  delete from subscribers
   where (confirmed_at is null and created_at < now() - interval '7 days')
      or (unsubscribed_at is not null and unsubscribed_at < now() - interval '30 days');
$$;
