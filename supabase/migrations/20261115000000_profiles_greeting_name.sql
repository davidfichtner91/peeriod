-- Oslovení uživatele v pozdravu při spuštění („Ahoj Davide!“).
-- Ukládá se rovnou v 5. pádě, jak ho uživatel napíše: odvozovat vokativ
-- z 1. pádu by u řady jmen selhalo (Marek → Marku, Jirka → Jirko).
-- RLS politika „own profile“ platí pro celý řádek, nový sloupec pokrývá.

alter table profiles add column if not exists greeting_name text;
