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
