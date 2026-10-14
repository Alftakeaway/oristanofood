"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { type DemoPreset, type DemoSettings } from "../../lib/demo-settings";
import { demoLink } from "../../lib/demo-share";

type Props = {
  settings: DemoSettings;
  patch: (value: Partial<DemoSettings>) => void;
  reset: () => void;
  notice: string;
  notify: (text: string) => void;
  name: string;
  color: string;
  bakery?: boolean;
  advanced?: ReactNode;
};
export default function MerchantWizard({
  settings,
  patch,
  reset,
  notice,
  notify,
  name,
  color,
  bakery,
  advanced,
}: Props) {
  const panel = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const uploadId = useRef(0);
  const [step, setStep] = useState(1);
  const [shared, setShared] = useState("");
  const [contact, setContact] = useState(
    "mailto:alfredoforte.web@gmail.com?subject=Vorrei%20un%20sito%20per%20il%20mio%20locale",
  );
  useEffect(() => {
    try {
      const link = demoLink(window.location.href, settings);
      const body = `Ciao Alfredo, vorrei informazioni per un sito per ${settings.name.trim() || name}.\n\nLa mia anteprima (senza logo): ${link}`;
      setContact(
        `mailto:alfredoforte.web@gmail.com?subject=${encodeURIComponent("Un sito per il mio locale")}&body=${encodeURIComponent(body)}`,
      );
    } catch {
      setContact(
        "mailto:alfredoforte.web@gmail.com?subject=Un%20sito%20per%20il%20mio%20locale",
      );
    }
    setShared("");
  }, [settings, name]);
  function move(next: number) {
    setStep(next);
    requestAnimationFrame(() => heading.current?.focus());
  }
  async function share() {
    try {
      const link = demoLink(window.location.href, settings);
      setShared(link);
      try {
        await navigator.clipboard.writeText(link);
        notify(
          "Link copiato. Include nome, colore e modifiche al menu; il logo resta nel tuo browser.",
        );
      } catch {
        notify(
          "Seleziona e copia il link qui sotto. Il logo resta nel tuo browser.",
        );
      }
    } catch (error) {
      notify(
        error instanceof Error ? error.message : "Impossibile creare il link.",
      );
    }
  }
  function upload(file?: File) {
    const id = ++uploadId.current;
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 500000
    ) {
      notify("Scegli un logo PNG, JPEG o WebP di massimo 500 kB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        if (id === uploadId.current) {
          patch({ logo: String(reader.result) });
          notify("Logo aggiornato. Resta salvato soltanto nel tuo browser.");
        }
      };
      img.onerror = () => notify("Il file non contiene un'immagine leggibile.");
      img.src = String(reader.result);
    };
    reader.onerror = () =>
      notify("Il file non è leggibile. Scegli un altro logo.");
    reader.readAsDataURL(file);
  }
  return (
    <>
      <aside
        className="demo-bar merchant-bar"
        aria-label="Strumenti della demo"
      >
        <span>
          <strong>Demo</strong>
          <span className="demo-bar-detail"> · Immagina il tuo locale qui</span>
        </span>
        <div className="merchant-bar-actions">
          <button
            type="button"
            onClick={() => {
              setStep(1);
              panel.current?.showModal();
            }}
          >
            Prova il tuo locale
          </button>
          <a
            data-demo-preview="handled"
            className="merchant-contact"
            href={contact}
          >
            Richiedi il tuo sito
          </a>
        </div>
      </aside>
      <dialog
        ref={panel}
        className="demo-dialog merchant-wizard"
        aria-labelledby="merchant-title"
        data-lenis-prevent
        onClick={(e) => {
          if (e.target === panel.current) panel.current.close();
        }}
      >
        <div className="demo-dialog-head">
          <h2 id="merchant-title">Il tuo locale, in anteprima</h2>
          <button
            type="button"
            aria-label="Chiudi personalizzazione"
            onClick={() => panel.current?.close()}
          >
            ×
          </button>
        </div>
        <p>
          Le modifiche restano nel tuo browser. Nessun ordine o pagamento reale.
        </p>
        <ol
          className="merchant-steps"
          aria-label="Passaggi della personalizzazione"
        >
          {["Il locale", "Lo stile", "La tua anteprima"].map((title, i) => (
            <li key={title} aria-current={step === i + 1 ? "step" : undefined}>
              <button type="button" onClick={() => move(i + 1)}>
                {i + 1}. {title}
              </button>
            </li>
          ))}
        </ol>
        <h3 ref={heading} tabIndex={-1}>
          Passo {step} di 3 —{" "}
          {step === 1
            ? "Presenta il tuo locale"
            : step === 2
              ? "Scegli come apparire"
              : "Guarda, conserva, condividi"}
        </h3>
        {step === 1 && (
          <>
            <label>
              Tipo di attività
              <select
                value={settings.preset}
                onChange={(e) =>
                  patch({
                    preset: e.target.value as DemoPreset,
                    items: {},
                    closed: false,
                  })
                }
              >
                <option value="original">
                  {bakery ? "Panetteria" : "Demo originale"}
                </option>
                {!bakery && (
                  <>
                    <option value="restaurant">Ristorante</option>
                    <option value="pizzeria">Pizzeria</option>
                  </>
                )}
                <option value="bakery">Pasticceria</option>
              </select>
            </label>
            <label>
              Nome del locale
              <input
                maxLength={70}
                value={settings.name}
                placeholder={name}
                onChange={(e) => patch({ name: e.target.value })}
                autoComplete="organization"
              />
            </label>
          </>
        )}
        {step === 2 && (
          <>
            <label>
              Colore principale
              <select
                value={settings.color || color}
                onChange={(e) => patch({ color: e.target.value })}
              >
                {[
                  ...new Set([
                    color,
                    "#7A2E1D",
                    "#234B3D",
                    "#263E62",
                    "#633B61",
                  ]),
                ].map((c) => (
                  <option key={c} value={c}>
                    {(
                      {
                        "#7A2E1D": "Bordeaux",
                        "#234B3D": "Verde bosco",
                        "#263E62": "Blu",
                        "#633B61": "Prugna",
                      } as Record<string, string>
                    )[c] || "Colore originale"}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Logo del locale
              <input
                ref={fileInput}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => upload(e.target.files?.[0])}
              />
            </label>
            <p className="demo-small">
              PNG, JPEG o WebP, massimo 500 kB. Il logo resta sul tuo
              dispositivo e non viene incluso nei link.
            </p>
            {settings.logo && (
              <div className="merchant-logo">
                <img src={settings.logo} alt="Anteprima del logo caricato" />
                <button
                  type="button"
                  className="demo-secondary"
                  onClick={() => {
                    ++uploadId.current;
                    patch({ logo: "" });
                    if (fileInput.current) fileInput.current.value = "";
                  }}
                >
                  Rimuovi logo
                </button>
              </div>
            )}
          </>
        )}
        {step === 3 && (
          <>
            <div className="merchant-summary">
              <strong style={{ color: settings.color || color }}>
                {settings.name.trim() || name}
              </strong>
              <p>
                La tua anteprima è pronta. Chiudi il pannello per esplorarla,
                oppure condividila con un socio.
              </p>
            </div>
            <div className="demo-actions">
              <button type="button" onClick={() => panel.current?.close()}>
                Guarda il risultato
              </button>
              <button type="button" className="demo-secondary" onClick={share}>
                Copia link della demo
              </button>
            </div>
            {shared && (
              <label>
                Link condivisibile, senza logo
                <input
                  aria-label="Link condivisibile"
                  readOnly
                  value={shared}
                  onFocus={(e) => e.target.select()}
                />
              </label>
            )}
            {advanced && (
              <details className="merchant-advanced">
                <summary>Opzioni avanzate: menu e disponibilità</summary>
                {advanced}
              </details>
            )}
            <div className="merchant-offer">
              <h3>Ti piace questa anteprima?</h3>
              <p>
                Raccontami il tuo locale: possiamo partire da qui per costruire
                il tuo sito.
              </p>
              <a
                className="merchant-contact"
                data-demo-preview="handled"
                href={contact}
              >
                Scrivi ad Alfredo per il tuo sito
              </a>
              <p className="demo-small">
                Si apre la tua app email. Nessun messaggio viene inviato
                automaticamente.
              </p>
            </div>
          </>
        )}
        <p role="status" className="demo-small">
          {notice}
        </p>
        <div className="demo-actions">
          {step > 1 && (
            <button
              type="button"
              className="demo-secondary"
              onClick={() => move(step - 1)}
            >
              Indietro
            </button>
          )}
          {step < 3 && (
            <button type="button" onClick={() => move(step + 1)}>
              Continua
            </button>
          )}
          <button
            type="button"
            className="demo-secondary"
            onClick={() => {
              ++uploadId.current;
              reset();
              setShared("");
              setStep(1);
            }}
          >
            Ripristina demo
          </button>
        </div>
      </dialog>
    </>
  );
}
