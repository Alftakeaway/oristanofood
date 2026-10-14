# oristanofood — vetrina autogestita per ristoranti/pizzerie/pasticcerie

Template universale di sito-vetrina (Next.js 15 App Router + React 19 + Tailwind v4 + TypeScript).
Live: https://oristanofood.vercel.app

## Setup

```bash
npm install
npm run dev    # http://localhost:3000
npm run build  # build produzione
```

## Contenuti: un solo file

Tutto il sito si configura da `src/config/site-data.json`
(info attività, orari, sezioni, corsi, pizza, vini, booking, showcase).
Esempio alternativo: `src/config/presets/pasticceria.example.json`.

## Foto: segnaposto e foto vere

- Di default il sito usa segnaposto SVG eleganti in `public/placeholders/`
  (uno per categoria: antipasti, primi, secondi, dolci, pizza, vino + default).
- Per mettere foto vere: salvale in `public/` (es. `public/tagliere.jpg`,
  max 1600px lato lungo, JPEG q75-80, < 300 KB) e scrivi il percorso in
  `site-data.json` (`imageUrl`, `images`). Niente hotlink esterni: il template
  è local-first (la build fallisce su URL remoti non dichiarati in
  `next.config.mjs`).
- Prima di usare una foto pesante, crea una preview leggera per controllarla:
  `pwsh -NoProfile -File C:\Users\Alfredo\.config\opencode\tools\imgpreview.ps1 -Path <file>`.

## Integrazioni

- **WhatsApp**: prenotazioni via `BookingSection` + webhook `api/webhook/whatsapp`.
  Variabili in `.env.local` (mai committare): `WHATSAPP_VERIFY_TOKEN`,
  `WHATSAPP_WEBHOOK_SECRET`, `WHATSAPP_ALLOWED_NUMBERS`.
- **Persistenza modifiche** (prezzi/disponibilità/eccezioni via WhatsApp):
  il webhook fa **commit diretto di `site-data.json` nel repo GitHub**
  (`src/lib/github-store.ts`) — niente servizi esterni, niente redeploy
  (le letture vengono dal repo via API). Serve un token con permessi
  `contents:write` su questo repo in `GITHUB_TOKEN` (`.env.local`, mai
  committare; stessa var su Vercel). Senza token: in locale scrive su file,
  in produzione la scrittura è bloccata con errore chiaro (il filesystem
  Vercel è effimero).
- **Stato apertura**: `api/open-status` da orari + eccezioni in `site-data.json`.
- **Persistenza**: `src/lib/kv-store.ts` per stato/prenotazioni.

## Deploy

Vercel, progetto `f33b0010`. Ogni push su `main` fa auto-deploy
(dopo aver collegato il repo GitHub nel dashboard Vercel).


## Presentazione ai commercianti

Il progetto è una demo: nomi, recapiti, recensioni e prodotti sono esempi.
Il pulsante **Prova il tuo locale** permette di scegliere ristorante, pizzeria o
pasticceria, personalizzare nome, logo e colore, cambiare prezzi/disponibilità
e simulare una chiusura per oggi. Tutte le prove rimangono nella sessione della
singola scheda del browser: nessuna scrittura al repository o ai servizi remoti.
Il pulsante **Ripristina demo** torna alla configurazione iniziale.

Ordini, prenotazioni e contatti aprono un'anteprima: non contattano i recapiti
dimostrativi. I webhook di aggiornamento pubblico sono disabilitati e le demo
sono escluse dall'indicizzazione dei motori di ricerca. Non vengono conservati
nel pannello nomi dei clienti, messaggi o richieste di prenotazione.

`NEXT_PUBLIC_DEMO_MODE=false` è un opt-out per una futura installazione reale
e richiede una nuova build. Prima di usarlo, configurare e verificare dati reali,
autenticazione dei gestori, persistenza e integrazioni. Non basta spegnere la demo
per ottenere un sito pronto per ordini o prenotazioni reali.

### Verifiche della demo

Sono state provate nel browser personalizzazione, cambio dei tre esempi, prezzi,
ricaricamento, sessione di un altro visitatore, anteprime delle richieste,
chiusura simulata, ripristino, visualizzazione mobile ed Escape. Le richieste
di scrittura ai webhook in modalità demo restituiscono 403.
