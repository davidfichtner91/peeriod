-- Přidáme možnost zaznamenávat konec menstruace
-- (aby se lépe počítaly fáze cyklu)

alter table period_starts
add column end_date date;

-- Update existujících záznamů: pokud je start_date, end_date je start_date + 5 dní (default)
-- Necháme prazdné, ať si uživatel sám zadá

-- Comment: end_date je volitelné
-- - Když je NULL: menstruace ještě trvá nebo není zadáno
-- - Když je vyplněno: menstruace skončila v ten den
