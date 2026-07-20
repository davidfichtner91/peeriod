-- Import historických záznamů menstruace
-- POZNÁMKA: Nahraď 'USER_ID' svým vlastním UUID z auth.users tabulky
-- Spusť tento SQL v Supabase SQL Editor

-- Zkopíruj si svůj user ID: Settings > Upravit nastavení > (v logu naleznete UUID)
-- Pak jen nahraď 'USER_ID' níže

INSERT INTO period_starts (user_id, start_date, end_date, created_at)
VALUES
  ('USER_ID'::uuid, '2026-01-09', '2026-01-16', now()),
  ('USER_ID'::uuid, '2026-02-05', '2026-02-10', now()),
  ('USER_ID'::uuid, '2026-03-05', '2026-03-12', now()),
  ('USER_ID'::uuid, '2026-04-05', '2026-04-10', now()),
  ('USER_ID'::uuid, '2026-05-01', '2026-05-07', now()),
  ('USER_ID'::uuid, '2026-05-29', '2026-06-03', now()),
  ('USER_ID'::uuid, '2026-06-25', '2026-06-30', now())
ON CONFLICT DO NOTHING;

-- Průměrný cyklus z těchto dat: 27 dní
-- Průměrná délka menstruace: 7 dní
-- Cykly: 27, 28, 25, 26, 28, 27 dní
