export interface Recommendation {
  do: string[]
  avoid: string[]
}

export interface PhaseActivities {
  exercise: Recommendation
  nutrition: Recommendation
}

export const phaseRecommendations: Record<string, PhaseActivities> = {
  mens: {
    exercise: {
      do: [
        'Jemná jóga',
        'Procházky v přírodě',
        'Protahování a flexibilita',
        'Plavání',
        'Pilates s nízkým dopadem',
        'Meditace a relaxace',
      ],
      avoid: [
        'Intenzivní kardio',
        'Těžký silový trénink',
        'Vysokoimpaktové cvičení',
        'Nové extrémní sporty',
      ],
    },
    nutrition: {
      do: [
        'Červené maso a drůbež (železo)',
        'Tmavé listnaté zelení',
        'Tmavá čokoláda',
        'Bobule (borůvky, jahody)',
        'Mořské řasy',
        'Luštěniny',
        'Semena (slunečnice, dýně)',
      ],
      avoid: [
        'Nadbytek kofeinu',
        'Příliš mnoho cukru',
        'Těžké tučné jídlo',
      ],
    },
  },

  foli: {
    exercise: {
      do: [
        'Běh a cardio',
        'HIIT tréninky',
        'Skupinové třídy (fitness, tanec)',
        'Inline bruslení nebo kolo',
        'Zumba',
        'Energické tance',
      ],
      avoid: [
        'Příliš dlouhé tréninky (energie se ztrácí)',
        'Pasivní odpočinek celý den',
      ],
    },
    nutrition: {
      do: [
        'Svěží zelenina (salát, brokolice)',
        'Lehké bílkoviny (rybí, kuře)',
        'Ovoce (jablka, citrusy, melouny)',
        'Obilniny (quinoa, ječmen)',
        'Jogurt a fermentované potraviny',
        'Bylinky na energii (máta, petrželka)',
      ],
      avoid: [
        'Těžké sacharidy',
        'Přebytečný sůl',
        'Alkohol v přebytku',
      ],
    },
  },

  ovul: {
    exercise: {
      do: [
        'Sportovní aktivity',
        'Outdoor cvičení',
        'Párové tréninky',
        'Konkurenční sporty',
        'Střelba, brány, hry',
        'Vrcholový trénink',
      ],
      avoid: [
        'Příliš pasivní aktivity',
        'Samo cvičení v izolaci',
      ],
    },
    nutrition: {
      do: [
        'Grilované maso',
        'Studené saláty',
        'Lehké omáčky',
        'Voňavé byliny (koriandr, bazalka)',
        'Citrusové ovoce',
        'Surové nebo na páru vařené',
      ],
      avoid: [
        'Těžké omáčky',
        'Vysoce zpracované potraviny',
      ],
    },
  },

  lute: {
    exercise: {
      do: [
        'Silový trénink a odolnost',
        'Stabilní rutinní cvičení',
        'Jóga (Yin jóga)',
        'Dechová cvičení',
        'Chůze po horách',
        'Strukturované tréninky',
      ],
      avoid: [
        'Nová nepředvídatelná cvičení',
        'Příliš intenzivní HIIT',
      ],
    },
    nutrition: {
      do: [
        'Komplexní sacharidy (ovesné vločky, batáty)',
        'Zdravé tuky (avokádo, ořechy)',
        'Proteiny (vajíčka, fazole, tofu)',
        'Potraviny bohaté na hořčík (tmavá čokoláda, slunečnicová semena)',
        'Více kalorií než v jiných fázích',
        'Zelenina se sulfidenem (brokolice, kupus)',
      ],
      avoid: [
        'Příliš cukru',
        'Kofein v přebytku',
        'Příliš pikantní jídlo',
        'Alkohol v přebytku',
      ],
    },
  },
}
