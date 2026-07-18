export const PHASES = {
  mens: {
    name: 'Menstruace',
    color: 'var(--p-mens)',
    glyph: 'disc',
    feels: [
      ['Únava', 'častá'],
      ['Křeče v podbřišku', 'častá'],
      ['Citlivost na bolest', 'častá'],
      ['Potřeba klidu', 'častá'],
      ['Podrážděnost', 'občas'],
    ],
    stages: [
      {
        title: 'První dny jsou nejtěžší.',
        lede: 'Krvácení je nejsilnější a křeče nejvýraznější. Cokoliv, co dneska nemusí být, ať není.',
        bio: 'Estrogen i progesteron jsou na dně a děloha se stahuje, aby odplavila sliznici. Za křeče můžou prostaglandiny — stejné látky, které tělo používá při zánětu.',
        tips: [
          [
            'Nabídni teplo',
            'Termofor nebo nahřívací polštářek na podbřišek uleví od stahů srovnatelně jako běžné analgetikum.',
          ],
          [
            'Vezmi na sebe provoz',
            'Nákup, vaření, úklid. Bez ptaní a bez zmiňování, že jsi to vzal.',
          ],
          [
            'Zruš, co jde zrušit',
            'Návštěvy a program navíc. Ostatní si toho nevšimnou, ona ano.',
          ],
          [
            'Blízkost bez očekávání',
            'Objetí nebo masáž zad. Fyzický kontakt pomáhá nejvíc tehdy, když z něj nic dalšího neplyne.',
          ],
        ],
      },
      {
        title: 'Nejhorší má za sebou.',
        lede: 'Křeče polevují, únava zůstává. Tělo teď dohání ztrátu železa, což je hlavní důvod, proč se pořád cítí vyčerpaně.',
        bio: 'Krvácení slábne, prostaglandiny klesají. Zásoby železa jsou ale nejnižší za celý cyklus a projeví se to na energii i na soustředění.',
        tips: [
          [
            'Uvař něco se železem',
            'Červené maso, luštěniny, špenát. S vitamínem C se vstřebá výrazně líp.',
          ],
          [
            'Nabídni krátkou procházku',
            'Lehký pohyb pomáhá, ale musí to být nabídka, ne návrh programu.',
          ],
          [
            'Nech tempo na ní',
            'Někdo chce zpátky do běžného provozu hned, jiný ne. Ptej se.',
          ],
        ],
      },
      {
        title: 'Energie se pomalu vrací.',
        lede: 'Menstruace končí a estrogen začíná stoupat. Dobrý moment na malý společný plán — ne ještě na velký.',
        bio: 'Hypofýza začíná uvolňovat FSH a v vaječnících se rozjíždí růst nových folikulů. S nimi stoupá estrogen a s ním nálada.',
        tips: [
          [
            'Naplánuj něco lehkého',
            'Kino, večeře, procházka. Nic, co vyžaduje celodenní nasazení.',
          ],
          [
            'Ještě nespěchej s velkými tématy',
            'Za pár dní na ně bude výrazně lepší půda.',
          ],
          [
            'Doplň spánek',
            'Menstruace ho většinou pár nocí rozbila. Vytvoř na to prostor.',
          ],
        ],
      },
    ],
  },

  foli: {
    name: 'Folikulární fáze',
    color: 'var(--p-foli)',
    glyph: 'ring',
    feels: [
      ['Rostoucí energie', 'častá'],
      ['Lepší soustředění', 'častá'],
      ['Chuť do nových věcí', 'častá'],
      ['Lepší spánek', 'občas'],
    ],
    stages: [
      {
        title: 'Energie je zpátky.',
        lede: 'Nejvýraznější obrat v celém cyklu. Co bylo před týdnem nad síly, je teď najednou v pohodě.',
        bio: 'Estrogen stoupá a s ním se zlepšuje regenerace, spánek i tolerance zátěže. Rostoucí folikuly zároveň obnovují děložní sliznici.',
        tips: [
          [
            'Vrať se ke společným plánům',
            'Věci odložené kvůli menstruaci je teď dobrý čas obnovit.',
          ],
          [
            'Podpoř pohyb',
            'Síla i výdrž jsou v téhle fázi znatelně vyšší než minulý týden.',
          ],
          [
            'Všimni si toho nahlas',
            'Že je líp, si zaslouží komentář stejně jako když je zle.',
          ],
        ],
      },
      {
        title: 'Nejlepší okno v celém cyklu.',
        lede: 'Vysoká energie, dobrá nálada, chuť do věcí. Pokud máš něco náročného k probrání nebo naplánování, teď.',
        bio: 'Estrogen se blíží vrcholu. Ovlivňuje i serotonin a dopamin, proto bývá tahle fáze subjektivně nejpříjemnější část cyklu.',
        tips: [
          [
            'Otevři odložená témata',
            'Náročné rozhovory mají teď výrazně větší šanci dopadnout dobře.',
          ],
          [
            'Naplánuj něco většího',
            'Výlet, návštěva, akce. Kapacita na to teď je.',
          ],
          [
            'Neber to jako samozřejmost',
            'Dobré dny se přehlížejí nejsnáz ze všech.',
          ],
          [
            'Vrací se i chuť na blízkost',
            'Libido stoupá spolu s estrogenem. Iniciativa bude teď přijatá líp než minulý týden.',
          ],
        ],
      },
      {
        title: 'Před ovulací je na maximu.',
        lede: 'Poslední dny před ovulací bývají nejsilnější — energie, sebevědomí i chuť na lidi.',
        bio: 'Estrogen kulminuje a spouští vzestup luteinizačního hormonu, který za den až dva uvolní vajíčko. Roste i libido.',
        tips: [
          [
            'Využij to na společný čas',
            'Otevřenost a chuť na podněty jsou teď nejvyšší.',
          ],
          [
            'Počítej s vyšším tempem',
            'Může chtít stihnout víc, než je obvyklé. Nebrzdi to zbytečně.',
          ],
          [
            'Připrav se na obrat',
            'Za pár dní přijde útlum. Není to nic, co bys způsobil.',
          ],
          [
            'Libido bývá na vrcholu',
            'Zájem o sex je v těchto dnech nejvyšší v celém cyklu. Platí to oboustranně, ne automaticky.',
          ],
        ],
      },
    ],
  },

  ovul: {
    name: 'Ovulace',
    color: 'var(--p-ovul)',
    glyph: 'diamond',
    feels: [
      ['Vysoká energie', 'častá'],
      ['Sebevědomí a otevřenost', 'častá'],
      ['Jednostranná bolest', 'občas'],
      ['Citlivější prsa', 'občas'],
    ],
    stages: [
      {
        title: 'Ovulace se blíží.',
        lede: 'Den před vlastní ovulací. Vrchol energie a nejvyšší plodnost v celém cyklu.',
        bio: 'Luteinizační hormon prudce stoupá a spouští dozrání vajíčka. Hlen se mění, tělesná teplota je ještě před vzestupem.',
        tips: [
          [
            'Naplánuj společný večer',
            'Chuť na blízkost i na lidi je teď nejvyšší.',
          ],
          [
            'Ber plodnost vážně',
            'Tohle a následující dva dny jsou plodné okno, ať už ho chcete využít, nebo ne.',
          ],
          [
            'Nezahlcuj ji úkoly',
            'Vysoká energie svádí naložit toho víc. Zůstane po ní útlum.',
          ],
        ],
      },
      {
        title: 'Vrchol cyklu.',
        lede: 'Vajíčko se uvolňuje. U části žen to doprovází ostrá bolest na jedné straně podbřišku — a je to normální.',
        bio: 'Folikul praská a uvolňuje vajíčko, které putuje vejcovodem. Bolest má vlastní název, mittelschmerz, a trvá od pár hodin po jeden den.',
        tips: [
          [
            'Zaregistruj bolest',
            'Krátká jednostranná bolest je běžná. Silná, dlouhá nebo s horečkou patří k lékaři.',
          ],
          [
            'Dej najevo ocenění',
            'Pozornost sedne líp než kdykoli jindy — a nestojí nic.',
          ],
          [
            'Nech prostor na společný čas',
            'Krátké okno, které se vrátí až za měsíc.',
          ],
          [
            'Plodné okno vrcholí',
            'Pokud teď těhotenství neplánujete, spolehni se na antikoncepci, ne na počítání dní.',
          ],
        ],
      },
      {
        title: 'Ovulace odeznívá.',
        lede: 'Nejvyšší bod je za vámi. Během několika dní se energie začne otáčet dolů, zatím ale nenápadně.',
        bio: 'Z prasklého folikulu se tvoří žluté tělísko a začíná produkovat progesteron. Tělesná teplota mírně stoupá a zůstane zvýšená až do menstruace.',
        tips: [
          [
            'Doraz rozjeté věci',
            'Co jste načali v posledních dnech, teď je poslední dobrá chvíle dotáhnout.',
          ],
          [
            'Sleduj změnu tempa',
            'Útlum přijde postupně. Když ho zaregistruješ včas, ušetříš si nedorozumění.',
          ],
          [
            'Nekomentuj pokles energie',
            '"Ty už zase nemáš náladu" je nejrychlejší cesta ke konfliktu.',
          ],
        ],
      },
    ],
  },

  lute: {
    name: 'Luteální fáze',
    color: 'var(--p-lute)',
    glyph: 'half',
    feels: [
      ['Únava', 'častá'],
      ['Podrážděnost', 'častá'],
      ['Nadýmání', 'častá'],
      ['Chutě na sladké', 'často'],
      ['Úzkost nebo plačtivost', 'občas'],
      ['Citlivá prsa', 'občas'],
    ],
    stages: [
      {
        title: 'Klidná část cyklu.',
        lede: 'Progesteron tlumí a stabilizuje. Bývá to nejvyrovnanější období, i když už bez špičkové energie.',
        bio: 'Žluté tělísko produkuje progesteron, který působí uklidňujícím dojmem a zvyšuje tělesnou teplotu. Chuť k jídlu mírně roste.',
        tips: [
          [
            'Dobrý čas na běžný provoz',
            'Rutina, domácí věci, klidný program. Nic extrémního ani jedním směrem.',
          ],
          [
            'Počítej s vyšší chutí k jídlu',
            'Není to nedostatek vůle, ale vyšší energetický výdej v téhle fázi.',
          ],
          [
            'Naplánuj klidný víkend',
            'Za týden na něj nemusí být nálada.',
          ],
          [
            'Zájem o sex obvykle klesá',
            'Progesteron ho tlumí. Není to o tobě ani o vztahu.',
          ],
        ],
      },
      {
        title: 'Tempo se zpomaluje.',
        lede: 'Energie klesá a únava přichází dřív. Ještě to není PMS, ale směr je jasný.',
        bio: 'Progesteron je na vrcholu, zpomaluje trávení a zadržuje vodu. Odtud nadýmání a pocit těžkosti.',
        tips: [
          [
            'Zkrať program',
            'Odpolední a večerní kapacita je nižší, než na jakou jste zvyklí.',
          ],
          [
            'Uber sůl',
            'Zadržování vody se tím výrazně zhoršuje. Platí to i pro tebe.',
          ],
          [
            'Nesjednávej velká rozhodnutí',
            'Za pár dní by se to muselo řešit znovu.',
          ],
        ],
      },
      {
        title: 'Neber výkyvy osobně.',
        lede: 'Progesteron prudce klesá a s ním serotonin. Tady vzniká většina zbytečných konfliktů v celém cyklu.',
        bio: 'Pokles progesteronu i estrogenu stahuje s sebou serotonin. Výsledkem jsou výkyvy nálad, úzkost a zvýšená citlivost na podněty — fyziologie, ne postoj.',
        tips: [
          [
            'Nediskutuj o náladě',
            'Věta "ty seš zas nějaká" situaci vždycky zhorší. Zeptej se, co potřebuje.',
          ],
          [
            'Ulehči rozhodování',
            'Vyber večeři, film, program. Rozhodovací únava je teď výrazně vyšší.',
          ],
          [
            'Neber si to osobně',
            'Podrážděnost tentokrát opravdu nemá adresáta.',
          ],
          [
            'Nabídni blízkost místo sexu',
            'Držení, masáž, být prostě vedle. Tlak na víc teď spolehlivě uškodí.',
          ],
        ],
      },
      {
        title: 'Poslední dny před menstruací.',
        lede: 'Nejcitlivější část cyklu. Za jeden až tři dny začne menstruace a s ní úleva.',
        bio: 'Hormony jsou na minimu, sliznice se připravuje k odloučení. Bolest hlavy, citlivá prsa a plačtivost patří k nejčastějším projevům.',
        tips: [
          [
            'Připrav se dopředu',
            'Termofor, léky proti bolesti, oblíbené jídlo. Mít to po ruce znamená, že o to nemusí žádat.',
          ],
          [
            'Nabídni klid, ne řešení',
            'Většinou nechce, abys to spravil. Chce, abys u toho byl.',
          ],
          [
            'Odlož všechno nepodstatné',
            'Za pár dní se cyklus otočí a bude to snazší.',
          ],
        ],
      },
    ],
  },
};

export const FEELS = {
  mens: [
    [
      ['Silné krvácení', 'často'],
      ['Křeče v podbřišku', 'često'],
      ['Únava', 'často'],
      ['Citlivost na bolest', 'často'],
      ['Potřeba klidu', 'často'],
    ],
    [
      ['Slábnoucí krvácení', 'často'],
      ['Únava', 'často'],
      ['Bolest zad', 'občas'],
      ['Podrážděnost', 'občas'],
    ],
    [
      ['Doznívající únava', 'často'],
      ['Vracející se energie', 'často'],
      ['Úleva', 'často'],
    ],
  ],
  foli: [
    [
      ['Rostoucí energie', 'často'],
      ['Lepší nálada', 'často'],
      ['Lepší spánek', 'často'],
    ],
    [
      ['Vysoká energie', 'často'],
      ['Dobré soustředění', 'často'],
      ['Chuť do nových věcí', 'často'],
      ['Vyšší výdrž', 'občas'],
    ],
    [
      ['Špičková energie', 'často'],
      ['Sebevědomí', 'často'],
      ['Vyšší libido', 'často'],
      ['Citlivější prsa', 'občas'],
    ],
  ],
  ovul: [
    [
      ['Vysoká energie', 'často'],
      ['Vyšší libido', 'často'],
      ['Otevřenost a upovídanost', 'často'],
    ],
    [
      ['Vysoká energie', 'často'],
      ['Jednostranná bolest', 'občas'],
      ['Citlivější prsa', 'občas'],
      ['Vyšší tělesná teplota', 'často'],
    ],
    [
      ['Doznívající energie', 'často'],
      ['Citlivější prsa', 'občas'],
      ['Lehký útlum', 'občas'],
    ],
  ],
  lute: [
    [
      ['Vyrovnaná nálada', 'často'],
      ['Klidnější tempo', 'často'],
      ['Vyšší chuť k jídlu', 'často'],
    ],
    [
      ['Únava', 'často'],
      ['Nadýmání', 'často'],
      ['Chutě na sladké', 'často'],
      ['Nižší výdrž', 'často'],
    ],
    [
      ['Podrážděnost', 'často'],
      ['Výkyvy nálad', 'často'],
      ['Úzkost', 'občas'],
      ['Zhoršený spánek', 'občas'],
      ['Chutě na sladké', 'často'],
    ],
    [
      ['Citlivá prsa', 'často'],
      ['Bolest hlavy', 'občas'],
      ['Plačtivost', 'občas'],
      ['Podrážděnost', 'často'],
      ['Zadržování vody', 'často'],
    ],
  ],
};
