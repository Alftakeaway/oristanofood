"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  applyDemo,
  type DemoConfig,
  demoItems,
  demoName,
  demoColor,
  demoStyle,
} from "@/lib/demo-adapter";
import { DEMO_MODE } from "@/lib/demo-mode";
import {
  emptySettings,
  readSettings,
  type DemoSettings,
  type DemoPreset,
} from "@/lib/demo-settings";

const Context = createContext<{
  config: DemoConfig;
  settings: DemoSettings;
  now: Date;
  resetId: number;
  preview: (text: string) => void;
} | null>(null);
export function useDemo() {
  const value = useContext(Context);
  if (!value) throw new Error("DemoProvider mancante");
  return value;
}
export function useDemoConfig() {
  return useDemo().config;
}

export function DemoProvider({
  base,
  renderedAt,
  children,
}: {
  base: DemoConfig;
  renderedAt: string;
  children: ReactNode;
}) {
  const [now, setNow] = useState(() => new Date(renderedAt));
  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);
  const [settings, setSettings] = useState<DemoSettings>(emptySettings);
  const [resetId, setResetId] = useState(0);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState("");
  const [message, setMessage] = useState("");
  const panel = useRef<HTMLDialogElement>(null);
  const previewDialog = useRef<HTMLDialogElement>(null);
  const key = "merchant-demo:v1";
  useEffect(() => {
    if (DEMO_MODE) {
      try {
        setSettings(readSettings(sessionStorage.getItem(key)));
      } catch {
        setNotice("Le prove restano attive finché questa pagina è aperta.");
      }
    }
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready || !DEMO_MODE) return;
    try {
      sessionStorage.setItem(key, JSON.stringify(settings));
    } catch {
      setNotice(
        "Il browser non può conservare le prove: restano attive su questa pagina.",
      );
    }
  }, [ready, settings]);
  const config = useMemo(
    () => (DEMO_MODE ? applyDemo(base, settings) : base),
    [base, settings],
  );
  const preview = (text: string) => {
    setMessage(text);
    previewDialog.current?.showModal();
  };
  const patch = (next: Partial<DemoSettings>) =>
    setSettings((current) => ({ ...current, ...next }));
  const items = demoItems(config);
  const updateItem = (
    id: string,
    next: { price?: number; available?: boolean },
  ) =>
    setSettings((current) => ({
      ...current,
      items: { ...current.items, [id]: { ...current.items[id], ...next } },
    }));
  function upload(file?: File) {
    if (!file) return;
    if (
      !["image/png", "image/jpeg", "image/webp"].includes(file.type) ||
      file.size > 500000
    ) {
      setNotice("Scegli un logo PNG, JPEG o WebP di massimo 500 kB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      patch({ logo: String(reader.result) });
      setNotice("Logo aggiornato soltanto in questa demo.");
    };
    reader.onerror = () =>
      setNotice("Il logo non è leggibile: prova un altro file.");
    reader.readAsDataURL(file);
  }
  return (
    <Context.Provider value={{ config, settings, now, resetId, preview }}>
      <div
        id="demo-contact"
        className="demo-host"
        style={demoStyle(config)}
        onClickCapture={(event) => {
          if (!DEMO_MODE || !(event.target instanceof Element)) return;
          const anchor = event.target.closest("a");
          if (
            !anchor ||
            anchor.dataset.demoPreview === "handled" ||
            anchor.getAttribute("aria-disabled") === "true"
          )
            return;
          const href = anchor.getAttribute("href") ?? "";
          if (
            href.startsWith("#demo-contact") ||
            /^(tel:|mailto:)/i.test(href) ||
            /^https?:\/\/(wa\.me|api\.whatsapp\.com|maps\.google\.com|www\.google\.com\/maps)/i.test(
              href,
            )
          ) {
            event.preventDefault();
            event.stopPropagation();
            let text =
              "Questo è un contatto di esempio. Nel sito del tuo locale qui compariranno i tuoi recapiti.";
            try {
              const url = new URL(
                href.startsWith("#demo-contact?") ? href.slice(13) : href,
                window.location.origin,
              );
              text = url.searchParams.get("text") || text;
            } catch {
              /* Telephone links have no message. */
            }
            preview(text);
          }
        }}
      >
        {DEMO_MODE && (
          <aside className="demo-bar" aria-label="Sito dimostrativo">
            <span>
              <strong>Sito dimostrativo</strong>
              <span className="demo-bar-detail">
                {" "}
                · Attività e contenuti di esempio
              </span>
            </span>
            <button type="button" onClick={() => panel.current?.showModal()}>
              Prova il tuo locale
            </button>
          </aside>
        )}
        {DEMO_MODE && settings.closed && (
          <p className="demo-closure" role="status">
            Chiusura di oggi simulata dal gestore. Nessuna modifica al sito
            pubblico.
          </p>
        )}
        {DEMO_MODE && (
          <noscript>
            <p className="demo-closure">
              Per provare personalizzazioni e anteprime, abilita JavaScript. Non
              usare i recapiti di esempio.
            </p>
          </noscript>
        )}
        {children}
        {DEMO_MODE && (
          <>
            <dialog
              data-lenis-prevent
              ref={panel}
              className="demo-dialog"
              aria-modal="true"
              aria-labelledby="demo-title"
              onClick={(event) => {
                if (event.target === panel.current) panel.current.close();
              }}
            >
              <div className="demo-dialog-head">
                <h2 id="demo-title">Il tuo locale, in anteprima</h2>
                <button
                  type="button"
                  aria-label="Chiudi personalizzazione"
                  onClick={() => panel.current?.close()}
                >
                  ×
                </button>
              </div>
              <p>
                Prova le modifiche e guarda il sito. Restano in questa scheda
                del browser; nessun altro visitatore le vede.
              </p>
              <label>
                Tipo di attività
                <select
                  value={settings.preset}
                  onChange={(event) => {
                    patch({
                      preset: event.target.value as DemoPreset,
                      items: {},
                      closed: false,
                    });
                  }}
                >
                  <option value="original">Demo originale</option>
                  <option value="restaurant">Ristorante</option>
                  <option value="pizzeria">Pizzeria</option>
                  <option value="bakery">Pasticceria</option>
                </select>
              </label>
              <div className="demo-fields">
                <label>
                  Nome del locale
                  <input
                    maxLength={70}
                    value={settings.name}
                    placeholder={demoName(config)}
                    onChange={(event) => patch({ name: event.target.value })}
                  />
                </label>
                <label>
                  Colore principale
                  <select
                    value={settings.color || demoColor(base)}
                    onChange={(event) => patch({ color: event.target.value })}
                  >
                    {[
                      ...new Set([
                        demoColor(base),
                        "#7A2E1D",
                        "#234B3D",
                        "#263E62",
                        "#633B61",
                      ]),
                    ].map((color) => (
                      <option key={color} value={color}>
                        {(
                          {
                            "#7A2E1D": "Bordeaux",
                            "#234B3D": "Verde bosco",
                            "#263E62": "Blu",
                            "#633B61": "Prugna",
                          } as Record<string, string>
                        )[color] || "Colore originale"}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Logo del locale
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => upload(event.target.files?.[0])}
                />
              </label>
              <p className="demo-small">
                Il logo resta nel browser. PNG, JPEG o WebP, massimo 500 kB.
              </p>
              <label className="demo-check">
                <input
                  type="checkbox"
                  checked={settings.closed}
                  onChange={(event) => patch({ closed: event.target.checked })}
                />
                Simula una chiusura per oggi
              </label>
              <h3>Prova a gestire il menu</h3>
              <p>
                Cambia un prezzo o segna un prodotto esaurito: vedrai il
                risultato sul sito.
              </p>
              <div className="demo-menu">
                {items.map((item) => (
                  <div className="demo-item" key={item.id}>
                    <span>{item.title}</span>
                    <label>
                      Prezzo (€)
                      <input
                        aria-label={`Prezzo di ${item.title}`}
                        type="number"
                        min="0"
                        max="9999"
                        step="0.5"
                        value={item.price}
                        onChange={(event) => {
                          const value = event.target.valueAsNumber;
                          if (
                            Number.isFinite(value) &&
                            value >= 0 &&
                            value <= 9999
                          )
                            updateItem(item.id, {
                              price: Math.round(value * 100) / 100,
                            });
                        }}
                      />
                    </label>
                    <label className="demo-check">
                      <input
                        type="checkbox"
                        checked={item.available}
                        onChange={(event) =>
                          updateItem(item.id, {
                            available: event.target.checked,
                          })
                        }
                      />
                      Disponibile
                    </label>
                  </div>
                ))}
              </div>
              <p role="status" className="demo-small">
                {notice}
              </p>
              <div className="demo-actions">
                <button type="button" onClick={() => panel.current?.close()}>
                  Guarda il risultato
                </button>
                <button
                  type="button"
                  className="demo-secondary"
                  onClick={() => {
                    setSettings(emptySettings());
                    setResetId((value) => value + 1);
                    setNotice("Demo originale ripristinata.");
                  }}
                >
                  Ripristina demo
                </button>
              </div>
            </dialog>
            <dialog
              data-lenis-prevent
              ref={previewDialog}
              className="demo-dialog demo-preview"
              aria-modal="true"
              aria-labelledby="demo-preview-title"
            >
              <div className="demo-dialog-head">
                <h2 id="demo-preview-title">Anteprima della richiesta</h2>
                <button
                  type="button"
                  aria-label="Chiudi anteprima"
                  onClick={() => previewDialog.current?.close()}
                >
                  ×
                </button>
              </div>
              <p>
                Nel sito del tuo locale questo messaggio si aprirebbe su
                WhatsApp. Qui non viene inviato nulla.
              </p>
              <pre>{message}</pre>
              <p className="demo-small">
                Ordini e prenotazioni richiederebbero la conferma del locale.
              </p>
              <button
                type="button"
                onClick={() => previewDialog.current?.close()}
              >
                Torna alla demo
              </button>
            </dialog>
          </>
        )}
      </div>
    </Context.Provider>
  );
}
