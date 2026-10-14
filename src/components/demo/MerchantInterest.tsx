"use client";
import { useEffect, useRef, useState } from "react";
import type { DemoSettings } from "../../lib/demo-settings";
import { COMMERCIAL_EMAIL, leadRequest } from "../../lib/lead-request";

export default function MerchantInterest({
  eligible,
  name,
  settings,
}: {
  eligible: boolean;
  name: string;
  settings: DemoSettings;
}) {
  const [visible, setVisible] = useState(false);
  const handled = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [method, setMethod] = useState<"email" | "whatsapp">("email");
  const [contact, setContact] = useState("");
  const [prepared, setPrepared] = useState<{
    body: string;
    href: string;
  } | null>(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (!eligible) {
      setVisible(false);
      return;
    }
    if (!eligible || handled.current) return;
    handled.current = true;
    try {
      if (sessionStorage.getItem("merchant-interest:v1") === "dismissed")
        return;
    } catch {
      /* Memory-only fallback. */
    }
    setVisible(true);
  }, [eligible]);
  function dismiss() {
    setVisible(false);
    try {
      sessionStorage.setItem("merchant-interest:v1", "dismissed");
    } catch {
      /* Keep this decision in memory. */
    }
  }
  return (
    <>
      {visible && (
        <aside
          className="merchant-interest"
          aria-label="Informazioni per il tuo sito"
        >
          <button
            type="button"
            className="merchant-interest-close"
            aria-label="Non mostrare più questo invito"
            onClick={dismiss}
          >
            ×
          </button>
          <p role="status">
            <strong>Hai immaginato il tuo locale qui?</strong>
          </p>
          <p>
            Indica come preferisci essere ricontattato e prepara una richiesta
            per Alfredo.
          </p>
          <button
            type="button"
            className="merchant-contact"
            onClick={() => dialog.current?.showModal()}
          >
            Parliamo del tuo sito
          </button>
          <button type="button" className="merchant-later" onClick={dismiss}>
            Continuo a provare
          </button>
        </aside>
      )}
      <dialog
        ref={dialog}
        className="demo-dialog merchant-lead"
        aria-labelledby="merchant-lead-title"
        data-lenis-prevent
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
        onClose={() => {
          setContact("");
          setPrepared(null);
          setNotice("");
        }}
      >
        <div className="demo-dialog-head">
          <h2 id="merchant-lead-title">Parliamo del tuo sito</h2>
          <button
            type="button"
            aria-label="Chiudi richiesta commerciale"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        <p>
          La tua demo è già salvata nel browser. Per parlare del sito puoi
          preparare un’email ad Alfredo con il tuo recapito.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            try {
              setPrepared(
                leadRequest({
                  method,
                  contact,
                  name,
                  settings,
                  location: window.location.href,
                }),
              );
              setNotice("");
            } catch (error) {
              setNotice(
                error instanceof Error
                  ? error.message
                  : "Controlla il recapito.",
              );
            }
          }}
        >
          <label>
            Come preferisci essere ricontattato?
            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value as "email" | "whatsapp");
                setContact("");
                setPrepared(null);
                setNotice("");
              }}
            >
              <option value="email">Via email</option>
              <option value="whatsapp">Su WhatsApp</option>
            </select>
          </label>
          <label>
            {method === "email" ? "La tua email" : "Il tuo numero WhatsApp"}
            <input
              required
              type={method === "email" ? "email" : "tel"}
              autoComplete={method === "email" ? "email" : "tel"}
              maxLength={120}
              placeholder={method === "email" ? "nome@esempio.it" : "+39 …"}
              value={contact}
              onChange={(e) => {
                setContact(e.target.value);
                setPrepared(null);
                setNotice("");
              }}
            />
          </label>
          <p className="demo-small">
            Il recapito non viene salvato nella demo né nel link condivisibile.
            Sarà incluso soltanto nella richiesta che deciderai di inviare.
          </p>
          <button type="submit">Prepara email</button>
        </form>
        {prepared && (
          <section
            className="merchant-lead-ready"
            aria-label="Richiesta pronta"
            aria-live="polite"
          >
            <h3>Richiesta pronta da inviare</h3>
            <p>
              Apri la tua app email e invia il messaggio a {COMMERCIAL_EMAIL}.
              Finché non lo invii, Alfredo non riceve il tuo recapito.
            </p>
            <a
              className="merchant-contact"
              data-demo-preview="handled"
              href={prepared.href}
              onClick={dismiss}
            >
              Apri l’app email
            </a>
            <button
              type="button"
              className="demo-secondary"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(prepared.body);
                  setNotice(
                    "Richiesta copiata: puoi incollarla nella tua email.",
                  );
                } catch {
                  setNotice(
                    "Seleziona il testo della richiesta qui sotto e copialo.",
                  );
                }
              }}
            >
              Copia richiesta
            </button>
            <label>
              Testo della richiesta
              <textarea
                readOnly
                value={prepared.body}
                rows={6}
                onFocus={(e) => e.target.select()}
              />
            </label>
          </section>
        )}
        <p role="status" className="demo-small">
          {notice}
        </p>
      </dialog>
    </>
  );
}
