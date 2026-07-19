-- Poznámky k jednotlivým dnům cyklu
create table if not exists cycle_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  note_date date not null,
  content text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, note_date)
);

alter table cycle_notes enable row level security;

create policy "own notes" on cycle_notes
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Příznaky zaznamenané v daný den
create table if not exists cycle_symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  symptom_date date not null,
  symptom text not null,
  created_at timestamptz default now(),
  unique(user_id, symptom_date, symptom)
);

alter table cycle_symptoms enable row level security;

create policy "own symptoms" on cycle_symptoms
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
