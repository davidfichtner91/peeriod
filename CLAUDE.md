# Peeriod – kontext pro práci na projektu

Sledování menstruačního cyklu. React + TypeScript + Vite, React Router, Supabase, Vercel, PWA. UI a komentáře v kódu česky, commit message anglicky.

## Tlačítko Zpět zavírá vrstvy, ne appku

Modal dne (`DayTrackingModal`) volá `useBackCloses` a rozbalený výběr data (`DatePicker`) vykresluje `<BackCloses>`, obojí z `src/lib/backButton.ts`. Každá otevřená vrstva má v historii svůj záznam a Zpět na Androidu zavře tu navrchu, appka odejde až z hlavní obrazovky. Vrstva zavřená křížkem, uložením nebo klikem vedle svůj záznam sama odebere. **Nová vrstva patří do toho samého hooku**, jinak Zpět z ní zavře celou appku. Záznam kopíruje `history.state`, protože v něm React Router drží svůj index. Stejný vzor mají Sbeerka, Broseer, Veedma a Sbeeva (tam je i test v jsdom).
