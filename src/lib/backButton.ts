import { useEffect, useRef } from 'react'

// Tlačítko Zpět na Androidu zavírá vrstvu navrchu (modal dne, výběr data),
// ne celou appku.
//
// Bez toho appka žije na jediném záznamu v historii a Zpět z modalu odejde
// z appky úplně. Proto si každá otevřená vrstva přidá do historie svůj záznam
// a Zpět ho odebere a zavře vrstvu navrchu. Když se vrstva zavře jinak
// (křížkem, uložením, klikem vedle), svůj záznam sama odebere, jinak by další
// Zpět „zavřelo“ něco, co už zavřené je.
//
// Jeden posluchač a zásobník, ne posluchač na vrstvu: jedno Zpět smí zavřít
// jen jednu vrstvu, ne výběr data i modal pod ním naráz.
//
// React Router drží v history.state svůj index, proto záznam stav kopíruje
// a jen přidá značku. Adresa se nemění, router vidí pořád stejnou stránku.
//
// Stejný vzor mají Sbeerka, Broseer, Veedma a Sbeeva.

interface Vrstva {
  zavrit: { current: () => void }
  /** Zavřená tlačítkem Zpět, její záznam už v historii není. */
  zpetem: boolean
}

const zasobnik: Vrstva[] = []
/** Kolik popstate vyvolal vlastní history.go při úklidu záznamů. */
let preskocit = 0
/** Záznamy k odebrání. Sesypou se do jednoho kroku, protože dvě
 *  history.back() za sebou by prohlížeč mohl spojit do jednoho. */
let kOdebrani = 0

window.addEventListener('popstate', () => {
  if (preskocit > 0) {
    preskocit--
    return
  }
  const vrstva = zasobnik.pop()
  if (!vrstva) return
  vrstva.zpetem = true
  vrstva.zavrit.current()
})

const odebratZaznam = () => {
  kOdebrani++
  if (kOdebrani > 1) return
  queueMicrotask(() => {
    preskocit++
    history.go(-kOdebrani)
    kOdebrani = 0
  })
}

/** Vrstva se zavře tlačítkem Zpět. Volat v komponentě, která je připojená
 *  právě tehdy, když je vrstva otevřená. */
export function useBackCloses(zavrit: () => void): void {
  // Rodiče posílají novou funkci s každým vykreslením, záznam v historii
  // ale patří k otevření, ne k vykreslení.
  const zavritRef = useRef(zavrit)
  zavritRef.current = zavrit

  useEffect(() => {
    const vrstva: Vrstva = { zavrit: zavritRef, zpetem: false }
    zasobnik.push(vrstva)
    history.pushState({ ...history.state, peeriodVrstva: true }, '')
    return () => {
      if (vrstva.zpetem) return
      zasobnik.splice(zasobnik.indexOf(vrstva), 1)
      odebratZaznam()
    }
  }, [])
}

/** Pro vrstvy, které nejsou samostatná komponenta (rozbalený výběr data).
 *  Vykreslit, dokud je vrstva otevřená. */
export function BackCloses({ zavrit }: { zavrit: () => void }) {
  useBackCloses(zavrit)
  return null
}
