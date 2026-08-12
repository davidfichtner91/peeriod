-- Oprava dat posunutých o den zpět kvůli toISOString()
--
-- DayTrackingModal ukládal datum přes `date.toISOString().split('T')[0]`.
-- `date` byla lokální půlnoc, takže v pásmu UTC+1/+2 převod do UTC posunul
-- datum na předchozí den. Všechny záznamy zapsané od commitu d4ab260 tak
-- leží o jeden den dřív, než na který uživatel v kalendáři klikl.
--
-- POZOR: platí jen pro uživatele v pásmu s kladným posunem vůči UTC
-- (CET/CEST). Uživatelům v pásmech se záporným posunem (Amerika) se data
-- neposunula a tato migrace by je naopak rozbila. Pokud v databázi takoví
-- uživatelé jsou, doplň do UPDATE podmínku na jejich user_id.
--
-- Kontrola před spuštěním:
--   select note_date, content from cycle_notes order by note_date;

begin;

-- Posun se dělá ve dvou krocích. Obě tabulky mají unique constraint přes
-- datum a Postgres kontroluje unikátnost hned po každém řádku, takže přímý
-- `+ 1 day` by u dvou navazujících dnů spadl na dočasnou kolizi. Odsunutím
-- všech řádků daleko mimo rozsah a návratem zpět kolize nevznikne.

update cycle_notes set note_date = note_date + 10000;
update cycle_notes set note_date = note_date - 9999;

update cycle_symptoms set symptom_date = symptom_date + 10000;
update cycle_symptoms set symptom_date = symptom_date - 9999;

commit;

-- Kontrola po spuštění – data by měla sedět s dny, na které jsi v kalendáři
-- klikal:
--   select note_date, content from cycle_notes order by note_date;
