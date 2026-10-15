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
import { emptySettings, type DemoSettings } from "@/lib/demo-settings";

import MerchantWizard from "./MerchantWizard";
import { DEMO_KIND, DEMO_STORAGE_KEY } from "@/lib/demo-identity";
import { useMerchantSettings } from "./useMerchantSettings";

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
  const { settings, setSettings, notice, setNotice, clearSharedURL } =
    useMerchantSettings(DEMO_MODE, DEMO_STORAGE_KEY);
  const [resetId, setResetId] = useState(0);
  const [message, setMessage] = useState("");
  const previewDialog = useRef<HTMLDialogElement>(null);
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
  return (
    <Context.Provider value={{ config, settings, now, resetId, preview }}>
      <div
        id="demo-contact"
        className={`demo-host venue-${DEMO_KIND}`}
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
            <MerchantWizard
              settings={settings}
              patch={patch}
              notice={notice}
              notify={setNotice}
              name={demoName(config)}
              color={demoColor(base)}
              exportItems={items.map((item) => ({
                name: item.title,
                category: item.category,
                price: item.price,
                available: item.available,
                allergens: item.allergens,
              }))}
              reset={() => {
                setSettings(emptySettings());
                clearSharedURL();
                setResetId((v) => v + 1);
                setNotice("Demo originale ripristinata.");
              }}
              advanced={
                <>
                  <label className="demo-check">
                    <input
                      type="checkbox"
                      checked={settings.closed}
                      onChange={(event) =>
                        patch({ closed: event.target.checked })
                      }
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
                </>
              }
            />
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
