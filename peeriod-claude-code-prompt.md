# Prompt pro Claude Code â€” redesign Peeriod

> PĹ™ed spuĹˇtÄ›nĂ­m zkopĂ­ruj `Peeriod-prototype-v8.html` do repa jako `design/prototype.html`.
> Claude Code z nÄ›j bude ÄŤĂ­st pĹ™esnĂ© hodnoty, ne z tohoto popisu.

---

PĹ™epracuj vzhled a logiku appky podle referenÄŤnĂ­ho prototypu `design/prototype.html`.
Prototyp je zdroj pravdy pro barvy, typografii, rozestupy, texty i chovĂˇnĂ­ â€” pĹ™eÄŤti si ho celĂ˝
pĹ™ed tĂ­m, neĹľ zaÄŤneĹˇ psĂˇt kĂłd. NekopĂ­ruj ho jako HTML, pĹ™epiĹˇ do Reactu a Tailwindu podle
struktury projektu.

Postupuj po ÄŤĂˇstech a po kaĹľdĂ© ÄŤĂˇsti se zastav a ukaĹľ mi diff.

## 1. Design tokens a motiv

- Do `src/index.css` pĹ™enes CSS promÄ›nnĂ© z prototypu (`--paper`, `--card`, `--ink`, `--ink-2`,
  `--ink-3`, `--line`, `--line-2`, `--p-mens`, `--p-foli`, `--p-ovul`, `--p-lute`, `--fill`,
  `--fill-pred`, `--on-fill`).
- Motiv Ĺ™eĹˇ pĹ™es `data-theme` na `<html>`, ne pĹ™es Tailwind `dark:` tĹ™Ă­dy u kaĹľdĂ©ho prvku.
  TĹ™i stavy: `light`, `dark`, `auto` (auto = `prefers-color-scheme`). PĹ™esnĂˇ CSS struktura
  je v prototypu.
- V `tailwind.config.js` nahraÄŹ stĂˇvajĂ­cĂ­ `menstrual/follicular/ovulation/luteal` barvy
  odkazy na tyto promÄ›nnĂ©. StarĂ© hex hodnoty (`#dc2626`, `#3b82f6`, `#a855f7`, `#f59e0b`) zahoÄŹ â€”
  novĂˇ paleta je Okabe-Ito a je rozliĹˇitelnĂˇ i pĹ™i poruĹˇe barvocitu.
- Komponenta `ThemeSwitch` (tĹ™i pĹ™epĂ­naÄŤe v hlaviÄŤce), volba se uklĂˇdĂˇ do `localStorage`
  pod klĂ­ÄŤ `Peeriod-theme`. PouĹľij `aria-pressed` a `role="radiogroup"`.
- PĂ­sma: Bricolage Grotesque (nadpisy) + Instrument Sans (text), naÄŤtenĂˇ z Google Fonts
  v `index.html`. Montserrat/Inter odstraĹ, pokud tam jsou.
- ZruĹˇ `shadow-lg` vĹˇude. Karty majĂ­ `1px` border v `--line` a `border-radius: 14px`.

## 2. VĂ˝poÄŤet cyklu (`src/utils/cycle.ts`)

PĹ™epiĹˇ celou logiku. KlĂ­ÄŤovĂˇ zmÄ›na: **hranice fĂˇzĂ­ se poÄŤĂ­tajĂ­ od konce cyklu, ne napevno.**

```
bounds(len):
  ovul = max(8, len - 14)
  mens: [1, 5]
  foli: [6, ovul - 2]
  ovul: [ovul - 1, ovul + 1]
  lute: [ovul + 2, len]
```

LuteĂˇlnĂ­ fĂˇze trvĂˇ stabilnÄ› ~14 dnĂ­, folikulĂˇrnĂ­ se protahuje. PevnĂ© hranice 14â€“16 platĂ­
jen pro pĹ™esnÄ› 28dennĂ­ cyklus a u kratĹˇĂ­ch/delĹˇĂ­ch dĂˇvajĂ­ ĹˇpatnĂ˝ vĂ˝sledek.

DĂˇle implementuj podle prototypu:
- `intervals()` â€” rozdĂ­ly mezi po sobÄ› jdoucĂ­mi zĂˇznamy
- `avgLen()` â€” prĹŻmÄ›r z poslednĂ­ch **Ĺˇesti** intervalĹŻ, po vyfiltrovĂˇnĂ­ odchylek
  mimo rozsah **21â€“35 dnĂ­**. Odchylky se uklĂˇdajĂ­ a zobrazujĂ­, ale do prĹŻmÄ›ru nevstupujĂ­.
- `cycleAt(date)` â†’ `{ day, len, predicted }`. Datum uvnitĹ™ dvou zaznamenanĂ˝ch zaÄŤĂˇtkĹŻ
  pouĹľĂ­vĂˇ **skuteÄŤnou** dĂ©lku toho cyklu. Datum po poslednĂ­m zĂˇznamu pouĹľĂ­vĂˇ prĹŻmÄ›r
  a je oznaÄŤenĂ© jako pĹ™edpovÄ›ÄŹ.
- `contentFor(day, len)` â€” vybere fĂˇzi a jejĂ­ **podfĂˇzi** podle relativnĂ­ pozice ve fĂˇzi
  (`floor(progress * pocet_podfazi)`), takĹľe to funguje i u 24dennĂ­ho nebo 33dennĂ­ho cyklu.

NapiĹˇ k tomu unit testy aspoĹ pro `bounds()` a `avgLen()` s odchylkami.

## 3. Obsah (`src/data/phases.ts`)

PĹ™enes z prototypu celou strukturu `PHASES` a `FEELS`. Je to 13 podfĂˇzĂ­
(menstruace 3, folikulĂˇrnĂ­ 3, ovulace 3, luteĂˇlnĂ­ 4), kaĹľdĂˇ mĂˇ `title`, `lede`, `bio`
a tĹ™i `tips`. `FEELS` mĂˇ vlastnĂ­ sadu symptomĹŻ pro kaĹľdou podfĂˇzi.

Texty needituj ani nezkracuj, jsou schvĂˇlenĂ©. Jen je otypuj. ÄŚĂˇst podfĂˇzĂ­ mĂˇ ÄŤtyĹ™i tipy
mĂ­sto tĹ™Ă­ (tĂ©mata blĂ­zkosti a plodnosti), takĹľe komponenta musĂ­ zvlĂˇdnout promÄ›nlivĂ˝ poÄŤet.

**VĹˇechna emoji z appky odstraĹ.** FĂˇze se vizuĂˇlnÄ› rozliĹˇujĂ­ geometrickĂ˝m glyfem
(plnĂ˝ kruh / prstenec / kosoÄŤtverec / pĹŻlkruh) â€” funkce `glyph()` je v prototypu.

## 4. DatabĂˇze (Supabase)

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

DĂ©lku cyklu **neuklĂˇdej** â€” je to odvozenĂˇ hodnota z rozdĂ­lu dvou zĂˇznamĹŻ. Kdyby se uklĂˇdala,
zaÄŤne se rozchĂˇzet s daty.

StĂˇvajĂ­cĂ­ tabulku `cycles` migruj: kaĹľdĂ˝ Ĺ™Ăˇdek â†’ jeden `period_starts` zĂˇznam se `start_date`.
Migraci napiĹˇ jako SQL soubor, nespouĹˇtÄ›j ji sĂˇm.

Do onboardingu pĹ™idej pole pro jmĂ©no partnerky (uklĂˇdej k profilu uĹľivatele) â€” zobrazuje se
v hlaviÄŤce vedle prĹŻmÄ›rnĂ© dĂ©lky cyklu.

## 5. Komponenty

**`CycleRing`** â€” signature prvek. SVG kruh rozdÄ›lenĂ˝ na segmenty po dnech.

- Postav DOM **jednou** a pĹ™i zmÄ›nÄ› dne mÄ›Ĺ jen atributy existujĂ­cĂ­ch segmentĹŻ.
  KdyĹľ se pĹ™egeneruje celĂ˝ `innerHTML`, prohlĂ­ĹľeÄŤ spustĂ­ vstupnĂ­ animaci znovu a blikĂˇ to.
  PĹ™estavuje se jen pĹ™i zmÄ›nÄ› dĂ©lky cyklu.
- OvlĂˇdĂˇnĂ­ taĹľenĂ­m: `pointerdown/move/up` s `setPointerCapture`, den se poÄŤĂ­tĂˇ z Ăşhlu
  vĹŻÄŤi stĹ™edu. Drag zaÄŤne jen kdyĹľ je dotyk v pĂˇsu `R Â± 34` â€” stĹ™ed a okolĂ­ musĂ­ zĹŻstat
  scrollovatelnĂ©. `touch-action: none` na SVG.
- Ĺ ipky nikde nejsou, ale klĂˇvesnice ano: `tabindex="0"`, `role="slider"`,
  `aria-valuemin/now/max/valuetext`, Ĺˇipky krokujĂ­ po dnech, `Home` skoÄŤĂ­ na dneĹˇek.
- Ukazatel dneĹˇnĂ­ho dne je Marsova Ĺˇipka z loga, mĂ­Ĺ™Ă­cĂ­ na obvod zvenku.
- **Focus indikĂˇtor nesmĂ­ bĂ˝t `outline`** â€” na SVG se vykreslĂ­ jako ÄŤtverec kolem kruhu.
  Dej `outline: none` a mĂ­sto toho ÄŤĂˇrkovanĂ˝ `<circle>` uvnitĹ™ SVG, viditelnĂ˝ jen
  pĹ™i `:focus-visible`.
- BÄ›hem taĹľenĂ­ pĹ™ekresluj **jen kruh a texty**, ne kalendĂˇĹ™ a zĂˇznamy â€” jinak to trhĂˇ.

**`PhaseContent`** â€” nadpis, perex, tĹ™i tipy. PĹ™i zmÄ›nÄ› dne fade out (opacity 0,
posun 5px dolĹŻ, 150 ms), vĂ˝mÄ›na obsahu, fade in. BÄ›hem taĹľenĂ­ fade **vypni**, jinak to blikĂˇ.
Respektuj `prefers-reduced-motion`.

**`Calendar`** â€” klouzavĂ© okno ÄŤtyĹ™ mÄ›sĂ­cĹŻ relativnÄ› ke dneĹˇku (pĹ™edchozĂ­, aktuĂˇlnĂ­, dva
nĂˇsledujĂ­cĂ­), responsivnĂ­ grid. Okno se posouvĂˇ samo podle aktuĂˇlnĂ­ho data, nic se nehromadĂ­.
PĹ™idej Ĺˇipky pro posun okna dozadu a dopĹ™edu â€” dozadu se dny poÄŤĂ­tajĂ­ ze skuteÄŤnĂ˝ch zĂˇznamĹŻ,
dopĹ™edu z pĹ™edpovÄ›di.

- PolĂ­ÄŤko mĂˇ vĂ˝plĹ v barvÄ› fĂˇze, malĂ˝ glyf v rohu a ÄŤĂ­slo dne.
- ZaznamenanĂ˝ zaÄŤĂˇtek menstruace: **plnĂˇ sytĂˇ vĂ˝plĹ**, tuÄŤnĂ© ÄŤĂ­slo, prstenec kolem.
- PĹ™edpoklĂˇdanĂ˝ zaÄŤĂˇtek: ÄŤĂˇrkovanĂ˝ rĂˇmeÄŤek bez vĂ˝plnÄ›.
- Dny v pĹ™edpovĂ­danĂ˝ch cyklech: slabĹˇĂ­ vĂ˝plĹ + ÄŤĂˇrkovanĂ˝ rĂˇmeÄŤek.
- DneĹˇek: 2px plnĂ˝ rĂˇmeÄŤek v `--ink`.
- Barva nikdy nenese informaci sama â€” vĹľdy s glyfem, ÄŤĂ­slem nebo popiskem.

**`PeriodLog`** â€” seznam zĂˇznamĹŻ s vypoÄŤtenou dĂ©lkou cyklu, pĹ™idĂˇnĂ­ data,
mazĂˇnĂ­, souhrn (prĹŻmÄ›rnĂˇ dĂ©lka, rozptyl, poÄŤet zĂˇznamĹŻ, poÄŤet odchylek).
Interval mimo 21â€“35 dnĂ­ dostane ĹˇtĂ­tek â€žmimo prĹŻmÄ›r".

**`Dashboard`** â€” sloĹľĂ­ to dohromady v poĹ™adĂ­: hlaviÄŤka â†’ hero (kruh + â€žco dnes pomĹŻĹľe")
â†’ dvÄ› karty (biologie, symptomy) â†’ zĂˇznamy â†’ kalendĂˇĹ™.

## 6. KvalitativnĂ­ poĹľadavky

- Mobil first, kruh 250px v jednom sloupci, karty pod sebou.
- ViditelnĂ˝ focus na vĹˇech interaktivnĂ­ch prvcĂ­ch.
- Kontrast textu na barevnĂ˝ch plochĂˇch aspoĹ 4.5:1 â€” u `--p-lute` na svÄ›tlĂ©m pozadĂ­
  to souÄŤasnĂˇ appka nesplĹuje.
- Oprav pĹ™eklep v `Dashboard.tsx`: â€žNemĂˇĹˇ noch ĹľĂˇdnĂ˝ cyklus".

Na konci spusĹĄ build a typecheck a shrĹ, co se zmÄ›nilo.

