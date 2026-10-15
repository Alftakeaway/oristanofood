# Pizzeria — ramo indipendente

Repository: Alftakeaway/oristanofood. Ramo di questa copia: `demo/pizzeria`.
Progetto Vercel previsto: `multifood`.
Dominio previsto: https://oristanofood.vercel.app.

Aggiornare questo ramo e inviare solo `demo/pizzeria`. Non inviare a main per pubblicare questa demo. Non unire automaticamente il ramo dell’altra demo. Le modifiche condivise si trasferiscono solo quando desiderato, dopo verifica.

Le due copie locali possono essere avviate e compilate separatamente. `npm test`, `npm run build`, poi `git push origin demo/pizzeria` quando autorizzato. Il collegamento al ramo di produzione Vercel va verificato prima della prima pubblicazione. main conserva la vecchia demo comune.

Questa versione resta sempre una demo: richieste visualizzate in anteprima, nessun pagamento o invio a un esercente. Nessun analytics aggiunto. La personalizzazione ha uno spazio di salvataggio distinto dall’altra demo.

Il controllo `scripts/vercel-ignore.mjs` evita build del ramo sbagliato nei due progetti conosciuti. La scelta del ramo di produzione rimane un’impostazione di ciascun progetto Vercel.
