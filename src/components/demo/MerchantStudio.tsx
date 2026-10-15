"use client";
import { useRef, useState } from "react";
import type { DemoSettings } from "../../lib/demo-settings";
import { demoLink } from "../../lib/demo-share";
import {
  exportHero,
  exportMenu,
  exportQR,
  qrLink,
  type ExportItem,
} from "../../lib/demo-export";

export default function MerchantStudio({
  name,
  settings,
  items,
  contact,
  bakery,
}: {
  name: string;
  settings: DemoSettings;
  items: ExportItem[];
  contact: string;
  bakery?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState("");
  const [notice, setNotice] = useState("");
  const [includeMenu, setIncludeMenu] = useState(true);
  async function download(kind: "pdf" | "qr" | "hero") {
    setBusy(kind);
    setNotice("");
    try {
      if (kind === "pdf")
        await exportMenu(name, items, demoLink(window.location.href, settings));
      else if (kind === "qr")
        await exportQR(
          name,
          qrLink(window.location.href, settings, includeMenu),
        );
      else await exportHero(name);
      setNotice("File preparato. Controlla i download del browser.");
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Esportazione non riuscita. Riprova.",
      );
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <section
        className="merchant-proposal"
        aria-labelledby="merchant-proposal-title"
      >
        <div className="merchant-proposal-intro">
          <span className="merchant-demo-label">
            Demo · attività immaginaria
          </span>
          <h2 id="merchant-proposal-title">
            Da questa prova al sito del tuo locale
          </h2>
          <p>
            Hai visto come potrebbe presentarsi {name}. Il prossimo passo è
            scegliere cosa serve alla tua attività.
          </p>
          <div
            className="merchant-value"
            aria-label="Cosa puoi provare in questa demo"
          >
            <span>
              <strong>
                {items.length || "Il"} {items.length ? "prodotti" : "menu"}
              </strong>{" "}
              in una pagina consultabile
            </span>
            <span>
              <strong>Il tuo stile</strong> nome, colore e logo in anteprima
            </span>
            <span>
              <strong>Contatti diretti</strong> richieste da confermare nel sito
              reale
            </span>
          </div>
        </div>
        <div className="merchant-comparison">
          <h3>I social raccontano. Il sito mette tutto a portata di mano.</h3>
          <table>
            <caption>Due canali che possono lavorare insieme</caption>
            <thead>
              <tr>
                <th scope="col">Cosa cerca un cliente</th>
                <th scope="col">Post sui social</th>
                <th scope="col">Il tuo sito</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Menu e prezzi</th>
                <td>Tra post e fotografie</td>
                <td>Una pagina dedicata e aggiornabile</td>
              </tr>
              <tr>
                <th scope="row">Orari e recapiti</th>
                <td>Tra profilo, post e messaggi</td>
                <td>Raccolti nello stesso posto</td>
              </tr>
              <tr>
                <th scope="row">Condividere il locale</th>
                <td>Il link del profilo</td>
                <td>Un indirizzo tuo, anche su QR</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="merchant-delivery">
          <div>
            <h3>Una proposta su misura</h3>
            <p>
              Prezzo, tempi di consegna e manutenzione si definiscono dopo aver
              conosciuto il locale, i materiali disponibili e le funzioni
              desiderate.
            </p>
            <ul>
              <li>Scelta delle pagine e delle funzioni utili</li>
              <li>Identità del locale, menu, orari e contatti</li>
              <li>Dominio, pubblicazione e visibilità locale da concordare</li>
              <li>Formazione per gli aggiornamenti e assistenza da definire</li>
            </ul>
            <p>
              Prima della messa online: verifica dei contenuti reali, delle
              richieste e degli aspetti privacy necessari.
            </p>
            <a
              className="merchant-contact"
              data-demo-preview="handled"
              href={contact}
            >
              Richiedi una proposta per il mio locale
            </a>
            <p className="merchant-fineprint">
              Si apre una bozza email per Alfredo. Nessun invio automatico.
            </p>
          </div>
          <div className="merchant-takeaway">
            <h3>Porta con te l’anteprima</h3>
            <p>
              Un menu da stampare, un QR da provare o una copertina da mostrare
              al tuo socio. Ogni file resta riconoscibile come demo.
            </p>
            <button
              className="merchant-contact"
              type="button"
              onClick={() => dialog.current?.showModal()}
            >
              Apri strumenti e download
            </button>
            <p className="merchant-fineprint">
              {bakery
                ? "I prezzi del catalogo dimostrativo restano quelli del server."
                : "Il PDF usa anche i prezzi e la disponibilità che hai provato."}{" "}
              Il logo caricato resta sul tuo dispositivo.
            </p>
          </div>
        </div>
        <p className="merchant-fineprint">
          Attività, prodotti, indirizzi e recensioni del locale sono esempi. Non
          sono testimonianze di clienti reali né risultati commerciali
          garantiti.
        </p>
      </section>
      <button
        type="button"
        className="merchant-tools-trigger"
        onClick={() => dialog.current?.showModal()}
        aria-label="Apri strumenti e proposta commerciale"
      >
        Menu, QR e proposta
      </button>
      <dialog
        className="demo-dialog merchant-downloads"
        ref={dialog}
        aria-labelledby="merchant-download-title"
        data-lenis-prevent
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <div className="demo-dialog-head">
          <h2 id="merchant-download-title">La tua demo da portare via</h2>
          <button
            type="button"
            aria-label="Chiudi strumenti"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <p>
          File dimostrativi per {name}. Non sono un menu ufficiale e non
          permettono ordini reali.
        </p>
        <div className="merchant-download-list">
          <div>
            <h3>Menu in PDF</h3>
            <p>
              Prodotti, prezzi e allergeni dichiarati. Stampabile e sempre
              marcato “Demo”.
            </p>
            <button
              type="button"
              disabled={!!busy || !items.length}
              onClick={() => download("pdf")}
            >
              {busy === "pdf" ? "Preparo il PDF…" : "Scarica menu PDF"}
            </button>
            {!items.length && (
              <p>Attendi il caricamento del catalogo nella pagina iniziale.</p>
            )}
          </div>
          <div>
            <h3>QR della tua anteprima</h3>
            <p>
              Da mostrare al tavolo o al socio: apre la demo personalizzata,
              senza il logo caricato.
            </p>
            <label className="demo-check">
              <input
                type="checkbox"
                checked={includeMenu}
                onChange={(e) => setIncludeMenu(e.target.checked)}
              />
              Includi prezzi e disponibilità personalizzati
            </label>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => download("qr")}
            >
              {busy === "qr" ? "Preparo il QR…" : "Scarica QR demo"}
            </button>
          </div>
          <div>
            <h3>Immagine della copertina</h3>
            <p>
              La prima sezione della pagina, con la tua personalizzazione e
              l’indicazione “Demo”.
            </p>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => download("hero")}
            >
              {busy === "hero"
                ? "Preparo l’immagine…"
                : "Scarica immagine copertina"}
            </button>
          </div>
        </div>
        <p role="status">{notice}</p>
        <a
          href="#merchant-proposal-title"
          className="merchant-proposal-link"
          onClick={() => dialog.current?.close()}
        >
          Leggi cosa possiamo progettare per il tuo locale
        </a>
      </dialog>
    </>
  );
}
