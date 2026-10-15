# Ristorante — ramo indipendente

Repository: Alftakeaway/oristanofood. Ramo di questa copia: `demo/ristorante`.
Progetto Vercel previsto: `oristanofood`.
Dominio previsto: https://oristanofood-gamma.vercel.app.

Aggiornare questo ramo e inviare solo `demo/ristorante`. Non inviare a main per pubblicare questa demo. Non unire automaticamente il ramo dell’altra demo. Le modifiche condivise si trasferiscono solo quando desiderato, dopo verifica.

Le due copie locali possono essere avviate e compilate separatamente. `npm test`, `npm run build`, poi `git push origin demo/ristorante` quando autorizzato. Il collegamento al ramo di produzione Vercel va verificato prima della prima pubblicazione. main conserva la vecchia demo comune.

Questa versione resta sempre una demo: richieste visualizzate in anteprima, nessun pagamento o invio a un esercente. Nessun analytics aggiunto. La personalizzazione ha uno spazio di salvataggio distinto dall’altra demo.

Il controllo `scripts/vercel-ignore.mjs` evita build del ramo sbagliato nei due progetti conosciuti. La scelta del ramo di produzione rimane un’impostazione di ciascun progetto Vercel.
