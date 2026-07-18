# Prompt pro Claude Code — redesign PEERIOD

> Před spuštěním zkopíruj `peeriod-prototype-v8.html` do repa jako `design/prototype.html`.
> Claude Code z něj bude číst přesné hodnoty, ne z tohoto popisu.

---

Přepracuj vzhled a logiku appky podle referenčního prototypu `design/prototype.html`.
Prototyp je zdroj pravdy pro barvy, typografii, rozestupy, texty i chování — přečti si ho celý
před tím, než začneš psát kód. Nekopíruj ho jako HTML, přepiš do Reactu a Tailwindu podle
struktury projektu.

Postupuj po částech a po každé části se zastav a ukaž mi diff.

## 1. Design tokens a motiv

- Do `src/index.css` přenes CSS proměnné z prototypu (`--paper`, `--card`, `--ink`, `--ink-2`,
  `--ink-3`, `--line`, `--line-2`, `--p-mens`, `--p-foli`, `--p-ovul`, `--p-lute`, `--fill`,
  `--fill-pred`, `--on-fill`).
- Motiv řeš přes `data-theme` na `<html>`, ne přes Tailwind `dark:` třídy u každého prvku.
  Tři stavy: `light`, `dark`, `auto` (auto = `prefers-color-scheme`). Přesná CSS struktura
  je v prototypu.
- V `tailwind.config.js` nahraď stávající `menstrual/follicular/ovulation/luteal` barvy
  odkazy na tyto proměnné. Staré hex hodnoty (`#dc2626`, `#3b82f6`, `#a855f7`, `#f59e0b`) zahoď —
  nová paleta je Okabe-Ito a je rozlišitelná i při poruše barvocitu.
- Komponenta `ThemeSwitch` (tři přepínače v hlavičce), volba se ukládá do `localStorage`
  pod klíč `peeriod-theme`. Použij `aria-pressed` a `role="radiogroup"`.
- Písma: Bricolage Grotesque (nadpisy) + Instrument Sans (text), načtená z Google Fonts
  v `index.html`. Montserrat/Inter odstraň, pokud tam jsou.
- Zruš `shadow-lg` všude. Karty mají `1px` border v `--line` a `border-radius: 14px`.

## 2. Výpočet cyklu (`src/utils/cycle.ts`)

Přepiš celou logiku. Klíčová změna: **hranice fází se počítají od konce cyklu, ne napevno.**

```
bounds(len):
  ovul = max(8, len - 14)
  mens: [1, 5]
  foli: [6, ovul - 2]
  ovul: [ovul - 1, ovul + 1]
  lute: [ovul + 2, len]
```

Luteální fáze trvá stabilně ~14 dní, folikulární se protahuje. Pevné hranice 14–16 platí
jen pro přesně 28denní cyklus a u kratších/delších dávají špatný výsledek.

Dále implementuj podle prototypu:
- `intervals()` — rozdíly mezi po sobě jdoucími záznamy
- `avgLen()` — průměr z posledních **šesti** intervalů, po vyfiltrování odchylek
  mimo rozsah **21–35 dní**. Odchylky se ukládají a zobrazují, ale do průměru nevstupují.
- `cycleAt(date)` → `{ day, len, predicted }`. Datum uvnitř dvou zaznamenaných začátků
  používá **skutečnou** délku toho cyklu. Datum po posledním záznamu používá průměr
  a je označené jako předpověď.
- `contentFor(day, len)` — vybere fázi a její **podfázi** podle relativní pozice ve fázi
  (`floor(progress * pocet_podfazi)`), takže to funguje i u 24denního nebo 33denního cyklu.

Napiš k tomu unit testy aspoň pro `bounds()` a `avgLen()` s odchylkami.

## 3. Obsah (`src/data/phases.ts`)

Přenes z prototypu celou strukturu `PHASES` a `FEELS`. Je to 13 podfází
(menstruace 3, folikulární 3, ovulace 3, luteální 4), každá má `title`, `lede`, `bio`
a tři `tips`. `FEELS` má vlastní sadu symptomů pro každou podfázi.

Texty needituj ani nezkracuj, jsou schválené. Jen je otypuj. Část podfází má čtyři tipy
místo tří (témata blízkosti a plodnosti), takže komponenta musí zvládnout proměnlivý počet.

**Všechna emoji z appky odstraň.** Fáze se vizuálně rozlišují geometrickým glyfem
(plný kruh / prstenec / kosočtverec / půlkruh) — funkce `glyph()` je v prototypu.

## 4. Databáze (Supabase)

```sql
create table period_starts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  start_date date not null,
  created_at timestamptz default now(),
  unique (user_id, start_date)
);
alter table period_starts enable row level security;
create policy "own rows" on period_starts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Délku cyklu **neukládej** — je to odvozená hodnota z rozdílu dvou záznamů. Kdyby se ukládala,
začne se rozcházet s daty.

Stávající tabulku `cycles` migruj: každý řádek → jeden `period_starts` záznam se `start_date`.
Migraci napiš jako SQL soubor, nespouštěj ji sám.

Do onboardingu přidej pole pro jméno partnerky (ukládej k profilu uživatele) — zobrazuje se
v hlavičce vedle průměrné délky cyklu.

## 5. Komponenty

**`CycleRing`** — signature prvek. SVG kruh rozdělený na segmenty po dnech.

- Postav DOM **jednou** a při změně dne měň jen atributy existujících segmentů.
  Když se přegeneruje celý `innerHTML`, prohlížeč spustí vstupní animaci znovu a bliká to.
  Přestavuje se jen při změně délky cyklu.
- Ovládání tažením: `pointerdown/move/up` s `setPointerCapture`, den se počítá z úhlu
  vůči středu. Drag začne jen když je dotyk v pásu `R ± 34` — střed a okolí musí zůstat
  scrollovatelné. `touch-action: none` na SVG.
- Šipky nikde nejsou, ale klávesnice ano: `tabindex="0"`, `role="slider"`,
  `aria-valuemin/now/max/valuetext`, šipky krokují po dnech, `Home` skočí na dnešek.
- Ukazatel dnešního dne je Marsova šipka z loga, mířící na obvod zvenku.
- **Focus indikátor nesmí být `outline`** — na SVG se vykreslí jako čtverec kolem kruhu.
  Dej `outline: none` a místo toho čárkovaný `<circle>` uvnitř SVG, viditelný jen
  při `:focus-visible`.
- Během tažení překresluj **jen kruh a texty**, ne kalendář a záznamy — jinak to trhá.

**`PhaseContent`** — nadpis, perex, tři tipy. Při změně dne fade out (opacity 0,
posun 5px dolů, 150 ms), výměna obsahu, fade in. Během tažení fade **vypni**, jinak to bliká.
Respektuj `prefers-reduced-motion`.

**`Calendar`** — klouzavé okno čtyř měsíců relativně ke dnešku (předchozí, aktuální, dva
následující), responsivní grid. Okno se posouvá samo podle aktuálního data, nic se nehromadí.
Přidej šipky pro posun okna dozadu a dopředu — dozadu se dny počítají ze skutečných záznamů,
dopředu z předpovědi.

- Políčko má výplň v barvě fáze, malý glyf v rohu a číslo dne.
- Zaznamenaný začátek menstruace: **plná sytá výplň**, tučné číslo, prstenec kolem.
- Předpokládaný začátek: čárkovaný rámeček bez výplně.
- Dny v předpovídaných cyklech: slabší výplň + čárkovaný rámeček.
- Dnešek: 2px plný rámeček v `--ink`.
- Barva nikdy nenese informaci sama — vždy s glyfem, číslem nebo popiskem.

**`PeriodLog`** — seznam záznamů s vypočtenou délkou cyklu, přidání data,
mazání, souhrn (průměrná délka, rozptyl, počet záznamů, počet odchylek).
Interval mimo 21–35 dní dostane štítek „mimo průměr".

**`Dashboard`** — složí to dohromady v pořadí: hlavička → hero (kruh + „co dnes pomůže")
→ dvě karty (biologie, symptomy) → záznamy → kalendář.

## 6. Kvalitativní požadavky

- Mobil first, kruh 250px v jednom sloupci, karty pod sebou.
- Viditelný focus na všech interaktivních prvcích.
- Kontrast textu na barevných plochách aspoň 4.5:1 — u `--p-lute` na světlém pozadí
  to současná appka nesplňuje.
- Oprav překlep v `Dashboard.tsx`: „Nemáš noch žádný cyklus".

Na konci spusť build a typecheck a shrň, co se změnilo.
