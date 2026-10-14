import type { Metadata } from "next";
import Link from "next/link";
import { formatAddress, getSiteData } from "@/lib/site-data";
import { DEMO_MODE } from "@/lib/demo-mode";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Informativa sul trattamento dei dati personali (GDPR).",
};

export default async function PrivacyPage() {
  if (DEMO_MODE)
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 space-y-6">
        <Link href="/" className="underline">
          Torna alla demo
        </Link>
        <h1 className="font-heading text-4xl">
          Dati e personalizzazione della demo
        </h1>
        <p>
          Questa attività è immaginaria. Ordini, prenotazioni e recapiti del
          locale sono dimostrativi: non viene inviato alcun ordine.
        </p>
        <h2 className="font-heading text-2xl">Le tue prove nel browser</h2>
        <p>
          Nome, colore, logo e modifiche al menu sono conservati sul dispositivo
          con la memoria locale del browser. Puoi cancellarli con “Ripristina
          demo” o dalle impostazioni del browser. I diversi indirizzi della demo
          hanno salvataggi separati.
        </p>
        <p>
          Il link condivisibile contiene nome, colore e modifiche al menu, senza
          il logo. Chi riceve il link può vedere queste impostazioni. Usa dati
          di esempio: gli indirizzi visitati possono comparire nella cronologia
          e nei normali registri del servizio di hosting.
        </p>
        <h2 className="font-heading text-2xl">Contatto commerciale</h2>
        <p>
          “Richiedi il tuo sito” apre una bozza nella tua app email, indirizzata
          ad alfredoforte.web@gmail.com e contenente il link dell’anteprima
          senza logo. Il messaggio parte solo se decidi di inviarlo dalla tua
          app. Non viene salvato un modulo di contatto sul sito.
        </p>
        <p>
          La pagina può caricare immagini e mappe da servizi esterni. Per
          informazioni sulla demo puoi scrivere ad Alfredo all’indirizzo
          indicato.
        </p>
      </main>
    );
  const data = await getSiteData();
  const { businessInfo } = data;

  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-sm text-muted">
        <Link
          href="/"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Home
        </Link>{" "}
        / Privacy
      </p>
      <h1 className="font-heading mt-4 text-4xl font-medium tracking-tight">
        Informativa privacy
      </h1>
      <p className="mt-2 text-sm text-muted">
        Art. 13 Regolamento (UE) 2016/679 (GDPR) — ultimo aggiornamento: ottobre
        2026.
      </p>

      <div className="mt-8 space-y-6 text-[15px] leading-relaxed">
        <section>
          <h2 className="font-heading text-xl font-medium">
            1. Titolare del trattamento
          </h2>
          <p className="mt-2">
            {businessInfo.name}, {formatAddress(businessInfo.address)}, tel.{" "}
            {businessInfo.phone}. Per richieste privacy: contattare il titolare
            ai recapiti sopra (telefono/WhatsApp).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium">
            2. Quali dati raccogliamo
          </h2>
          <p className="mt-2">
            Solo i dati che ci invii volontariamente per la prenotazione via
            WhatsApp: nome, data/ora/persone richieste, eventuali note (es.
            allergie, seggiolone) e il tuo numero WhatsApp mittente. Questo sito{" "}
            <strong>
              non salva le prenotazioni su propri server o database
            </strong>
            : restano nella chat WhatsApp tra te e il locale.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium">
            3. Finalità e basi giuridiche
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              Gestire la richiesta di prenotazione e ricontattarti per conferma
              — misure precontrattuali su tua richiesta (art. 6.1.b GDPR).
            </li>
            <li>
              Rispondere a domande e gestire il servizio — legittimo interesse
              del titolare (art. 6.1.f GDPR).
            </li>
          </ul>
          <p className="mt-2">
            Senza questi dati non è possibile ricevere e confermare la
            prenotazione.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium">
            4. WhatsApp come canale
          </h2>
          <p className="mt-2">
            L&apos;invio avviene tramite WhatsApp (WhatsApp Ireland Ltd / Meta):
            i messaggi transitano sui loro sistemi, anche fuori dallo Spazio
            Economico Europeo. Si applica anche la loro informativa:{" "}
            <a
              href="https://www.whatsapp.com/legal/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              whatsapp.com/legal/privacy-policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium">5. Conservazione</h2>
          <p className="mt-2">
            I dati restano nella chat WhatsApp per il tempo necessario a gestire
            prenotazione e servizio, poi cancellati su richiesta. Nessuna copia
            su server di questo sito.
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium">
            6. I tuoi diritti
          </h2>
          <p className="mt-2">
            Accesso, rettifica, cancellazione, limitazione, opposizione,
            portabilità (artt. 15–22 GDPR): scrivici ai recapiti sopra. Reclamo
            al Garante per la protezione dei dati personali ({" "}
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              garanteprivacy.it
            </a>
            ).
          </p>
        </section>

        <section>
          <h2 className="font-heading text-xl font-medium">7. Cookie</h2>
          <p className="mt-2">
            Solo cookie tecnici/di sessione necessari al funzionamento. Niente
            profilazione, niente analytics di terze parti.
          </p>
        </section>

        <p className="rounded-xl border border-foreground/10 bg-surface px-4 py-3 text-sm text-muted">
          Modello generico per siti vetrina: prima dell&apos;uso in produzione
          con dati reali, fallo validare a un professionista privacy.
        </p>
      </div>
    </main>
  );
}
