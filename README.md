# đź©¸ Peeriod

MenstruaÄŤnĂ­ cyklus tracker pro muĹľe. VÄ›decky podloĹľenĂ© informace o ĹľenskĂ©m cyklu + praktickĂ© tipy, jak se chovat a podporovat.

## đźš€ Quick Start

### 1. Setup Supabase

- Jdi na https://supabase.com â†’ Sign up
- VytvoĹ™ novĂ˝ projekt: `Peeriod`
- ZkopĂ­ruj si z **Settings â†’ API**:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### 2. SpusĹĄ SQL migrations

V Supabase â†’ **SQL Editor** pusĹĄ obsah z `sql/schema.sql`:

```sql
-- Create users table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  name text,
  created_at timestamp default now()
);

-- Create cycles table
create table if not exists public.cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  start_date date not null,
  cycle_length integer not null default 28,
  created_at timestamp default now(),
  updated_at timestamp default now()
);

-- Enable RLS
alter table public.users enable row level security;
alter table public.cycles enable row level security;

-- RLS policies
create policy "Users can read their own user data"
  on public.users for select
  using (auth.uid() = id);

create policy "Users can update their own user data"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can read their own cycles"
  on public.cycles for select
  using (auth.uid() = user_id);

create policy "Users can create their own cycles"
  on public.cycles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cycles"
  on public.cycles for update
  using (auth.uid() = user_id);

create policy "Users can delete their own cycles"
  on public.cycles for delete
  using (auth.uid() = user_id);

-- Auto-create user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, name)
  values (new.id, new.email, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 3. Nainstaluj dependencies

```bash
cd Peeriod
npm install
```

### 4. VytvoĹ™ `.env.local`

ZkopĂ­ruj `.env.local.example` do `.env.local` a vloĹľ si Supabase credentials:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. SpusĹĄ dev server

```bash
npm run dev
```

Appka bÄ›ĹľĂ­ na http://localhost:5173 đźŽ‰

## đź“ Project Structure

```
src/
â”śâ”€â”€ components/
â”‚   â”śâ”€â”€ Auth/
â”‚   â”‚   â”śâ”€â”€ Login.tsx
â”‚   â”‚   â””â”€â”€ Signup.tsx
â”‚   â”śâ”€â”€ Calendar.tsx
â”‚   â”śâ”€â”€ Dashboard.tsx
â”‚   â”śâ”€â”€ Onboarding.tsx
â”‚   â”śâ”€â”€ PhaseDetail.tsx
â”‚   â”śâ”€â”€ ProtectedRoute.tsx
â”‚   â””â”€â”€ Settings.tsx
â”śâ”€â”€ context/
â”‚   â””â”€â”€ AuthContext.tsx
â”śâ”€â”€ lib/
â”‚   â””â”€â”€ supabase.ts
â”śâ”€â”€ utils/
â”‚   â””â”€â”€ cycle.ts
â”śâ”€â”€ App.tsx
â”śâ”€â”€ index.css
â””â”€â”€ main.tsx
```

## đź”„ User Flow

1. **Sign Up** â†’ `/signup` - Registrace novĂ©ho uĹľivatele
2. **Login** â†’ `/login` - PĹ™ihlĂˇĹˇenĂ­
3. **Onboarding** â†’ `/onboarding` - ZadĂˇnĂ­ data menstruace + dĂ©lka cyklu
4. **Dashboard** â†’ `/dashboard` - HlavnĂ­ zobrazenĂ­ kalendĂˇĹ™e + info o fĂˇzi
5. **Settings** â†’ `/settings` - Ăšprava nastavenĂ­

## đźŽŻ Features (MVP)

- âś… Auth (Sign up / Login)
- âś… Calendar s 4 fĂˇzemi (barvy)
- âś… Detail fĂˇze (tipy, co se dÄ›je)
- âś… Onboarding
- âś… Settings (Ăşprava cyklu)

## đź“¦ Build & Deploy

### Build

```bash
npm run build
```

### Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Appka se automaticky nasadĂ­! đźš€

## đź› Troubleshooting

**"Missing Supabase environment variables"**
- Zkontroluj `.env.local` - mĂˇĹˇ tam URL a KEY?

**"User not found"**
- RLS policies nemusĂ­ fungovat - zkontroluj Supabase **Authentication â†’ Policies**

**Calendar nenĂ­ se barvami**
- Tailwind se nesestavil - zkus `npm run dev` znova

## đź“ť Next Steps (Phase 2)

- Push notifications
- Symptom tracking
- Notes + history
- Mobile app (Expo)
- Partner sharing

---

**Made with âť¤ď¸Ź for better relationships**

