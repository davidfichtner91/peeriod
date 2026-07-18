# 🩸 PEERIOD

Menstruační cyklus tracker pro muže. Vědecky podložené informace o ženském cyklu + praktické tipy, jak se chovat a podporovat.

## 🚀 Quick Start

### 1. Setup Supabase

- Jdi na https://supabase.com → Sign up
- Vytvoř nový projekt: `peeriod`
- Zkopíruj si z **Settings → API**:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

### 2. Spusť SQL migrations

V Supabase → **SQL Editor** pusť obsah z `sql/schema.sql`:

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
cd peeriod
npm install
```

### 4. Vytvoř `.env.local`

Zkopíruj `.env.local.example` do `.env.local` a vlož si Supabase credentials:

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 5. Spusť dev server

```bash
npm run dev
```

Appka běží na http://localhost:5173 🎉

## 📁 Project Structure

```
src/
├── components/
│   ├── Auth/
│   │   ├── Login.tsx
│   │   └── Signup.tsx
│   ├── Calendar.tsx
│   ├── Dashboard.tsx
│   ├── Onboarding.tsx
│   ├── PhaseDetail.tsx
│   ├── ProtectedRoute.tsx
│   └── Settings.tsx
├── context/
│   └── AuthContext.tsx
├── lib/
│   └── supabase.ts
├── utils/
│   └── cycle.ts
├── App.tsx
├── index.css
└── main.tsx
```

## 🔄 User Flow

1. **Sign Up** → `/signup` - Registrace nového uživatele
2. **Login** → `/login` - Přihlášení
3. **Onboarding** → `/onboarding` - Zadání data menstruace + délka cyklu
4. **Dashboard** → `/dashboard` - Hlavní zobrazení kalendáře + info o fázi
5. **Settings** → `/settings` - Úprava nastavení

## 🎯 Features (MVP)

- ✅ Auth (Sign up / Login)
- ✅ Calendar s 4 fázemi (barvy)
- ✅ Detail fáze (tipy, co se děje)
- ✅ Onboarding
- ✅ Settings (úprava cyklu)

## 📦 Build & Deploy

### Build

```bash
npm run build
```

### Deploy na Vercel

```bash
npm install -g vercel
vercel
```

Appka se automaticky nasadí! 🚀

## 🐛 Troubleshooting

**"Missing Supabase environment variables"**
- Zkontroluj `.env.local` - máš tam URL a KEY?

**"User not found"**
- RLS policies nemusí fungovat - zkontroluj Supabase **Authentication → Policies**

**Calendar není se barvami**
- Tailwind se nesestavil - zkus `npm run dev` znova

## 📝 Next Steps (Phase 2)

- Push notifications
- Symptom tracking
- Notes + history
- Mobile app (Expo)
- Partner sharing

---

**Made with ❤️ for better relationships**
