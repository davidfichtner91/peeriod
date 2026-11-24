-- Intimita v daný den: mazlení (bílé srdíčko) nebo sex (plné srdíčko).
-- Jedna volba na den, sex v sobě mazlení zahrnuje, takže dvě srdíčka
-- v jednom políčku kalendáře by nic nepřidala.
create table if not exists cycle_intimacy (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  intimacy_date date not null,
  kind text not null check (kind in ('sex', 'cuddle')),
  created_at timestamptz default now(),
  unique(user_id, intimacy_date)
);

alter table cycle_intimacy enable row level security;

create policy "own intimacy" on cycle_intimacy
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
