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
- **Persistenza override** (prezzi/disponibilità/eccezioni via WhatsApp):
  Redis Upstash free ($0, senza carta) via `UPSTASH_REDIS_REST_URL` +
  `UPSTASH_REDIS_REST_TOKEN` (vedi https://upstash.com/pricing).
  Senza queste env: in locale scrive su file, in produzione la scrittura
  è bloccata con errore chiaro (il filesystem Vercel è effimero).
- **Stato apertura**: `api/open-status` da orari + eccezioni in `site-data.json`.
- **Persistenza**: `src/lib/kv-store.ts` per stato/prenotazioni.

## Deploy

Vercel, progetto `f33b0010`. Ogni push su `main` fa auto-deploy
(dopo aver collegato il repo GitHub nel dashboard Vercel).
