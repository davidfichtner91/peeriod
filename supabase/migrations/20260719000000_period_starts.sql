create table if not exists period_starts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  created_at timestamptz default now(),
  unique(user_id, start_date)
);

alter table period_starts enable row level security;

create policy "own rows" on period_starts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Migration: move existing cycles to period_starts (if cycles table exists)
-- Uncomment if you need to migrate from old cycles table:
-- insert into period_starts (user_id, start_date)
-- select user_id, start_date from cycles
-- on conflict (user_id, start_date) do nothing;
