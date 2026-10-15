"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { DEMO_MODE } from "@/lib/demo-mode";
import { useDemo, useDemoConfig } from "@/components/demo/DemoProvider";
import { formatPrice, getWhatsAppHref } from "@/lib/format";

export interface CartEntry {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  baseId?: string;
  variantLabel?: string;
  surcharge?: number;
}

interface CartLine extends CartEntry {
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (entry: CartEntry) => void;
  setQty: (id: string, qty: number) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart va usato dentro CartProvider");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const config = useDemoConfig();
  const { settings } = useDemo();
  const [lines, setLines] = useState<CartLine[]>([]);
  useEffect(() => {
    setLines((prev) =>
      prev.flatMap((line) => {
        const item = config.showcase.find(
          (item) => item.id === (line.baseId ?? line.id) && item.available,
        );
        return item
          ? [
              {
                ...line,
                title: line.variantLabel
                  ? `${item.title} — ${line.variantLabel}`
                  : item.title,
                price:
                  (Math.round(item.price * 100) +
                    Math.round((line.surcharge ?? 0) * 100)) /
                  100,
                imageUrl: item.imageUrl,
              },
            ]
          : [];
      }),
    );
  }, [config]);
  useEffect(() => {
    setLines([]);
  }, [settings.preset]);
  const [isOpen, setIsOpen] = useState(false);

  const add = useCallback((entry: CartEntry) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.id === entry.id);
      if (existing) {
        return prev.map((line) =>
          line.id === entry.id ? { ...line, qty: line.qty + 1 } : line,
        );
      }
      return [...prev, { ...entry, qty: 1 }];
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((line) => line.id !== id)
        : prev.map((line) => (line.id === id ? { ...line, qty } : line)),
    );
  }, []);

  const count = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty, 0),
    [lines],
  );
  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.qty * line.price, 0),
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count,
      total,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      add,
      setQty,
    }),
    [lines, count, total, isOpen, add, setQty],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function AddToCartButton({
  item,
  variant = "card",
}: {
  item: CartEntry & { available: boolean };
  variant?: "card" | "row";
}) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const onAdd = () => {
    add(item);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  if (variant === "row") {
    if (!item.available) {
      return (
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          Esaurito
        </span>
      );
    }
    return (
      <button
        type="button"
        onClick={onAdd}
        aria-label={`Aggiungi ${item.title} all'ordine`}
        className="rounded-full border border-primary/30 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white active:scale-[0.98]"
      >
        {added ? "✓" : "+"}
      </button>
    );
  }

  if (!item.available) {
    return (
      <button
        type="button"
        disabled
        className="w-full cursor-not-allowed rounded-full border border-foreground/10 px-4 py-2 text-sm font-medium text-muted"
      >
        Esaurito
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onAdd}
      className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
    >
      {added ? "Aggiunto ✓" : "Aggiungi all'ordine"}
    </button>
  );
}

export function CartWidget({
  whatsapp,
  pickupSlots,
}: {
  whatsapp: string;
  pickupSlots: string[];
}) {
  const { lines, count, total, isOpen, openCart, closeCart, setQty } =
    useCart();
  const [slot, setSlot] = useState("");
  const { preview } = useDemo();
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (isOpen && !dialog.current?.open) dialog.current?.showModal();
    else if (!isOpen && dialog.current?.open) dialog.current.close();
  }, [isOpen]);
  const selectedSlot = pickupSlots.includes(slot) ? slot : "";

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeCart]);

  const message = useMemo(() => {
    if (lines.length === 0) return "";
    const rows = lines.map(
      (line) =>
        `• ${line.qty}× ${line.title} — ${formatPrice(line.qty * line.price)}`,
    );
    const parts = [
      "Ciao! Vorrei ordinare:",
      ...rows,
      `Totale: ${formatPrice(total)}`,
    ];
    if (selectedSlot) parts.push(`Ritiro indicativo di oggi: ${selectedSlot}`);
    return parts.join("\n");
  }, [lines, total, selectedSlot]);

  return (
    <>
      <button
        type="button"
        onClick={openCart}
        aria-label="Apri il carrello"
        className={`fixed bottom-5 left-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:brightness-110 ${
          count > 0 ? "" : "hidden"
        }`}
      >
        <span className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          {count > 0 && (
            <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-foreground">
              {count}
            </span>
          )}
        </span>
      </button>

      <dialog
        ref={dialog}
        aria-label="Il tuo ordine"
        onClose={closeCart}
        className="fixed inset-0 m-0 h-screen max-h-none w-screen max-w-none border-0 bg-transparent p-0"
      >
        <div className="absolute inset-0 bg-black/40" onClick={closeCart} />
        <div className="absolute inset-x-0 bottom-0 flex max-h-[85vh] flex-col overflow-y-auto rounded-t-2xl bg-surface p-5 shadow-2xl sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-1/2 sm:w-[26rem] sm:-translate-y-1/2 sm:rounded-2xl">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-2xl">Il tuo ordine</h2>
            <button
              type="button"
              onClick={closeCart}
              aria-label="Chiudi il carrello"
              className="rounded-full p-2 text-muted transition hover:bg-background hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {lines.length === 0 ? (
            <p className="mt-6 text-sm text-muted">
              Il carrello è vuoto: aggiungi i prodotti dalla vetrina.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {lines.map((line) => (
                <li key={line.id} className="flex items-center gap-3">
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={line.imageUrl}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{line.title}</p>
                    <p className="text-xs text-muted">
                      {formatPrice(line.price)} l&apos;uno
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty - 1)}
                      aria-label={`Riduci quantità di ${line.title}`}
                      className="h-7 w-7 rounded-full border border-foreground/15 text-sm transition hover:bg-background"
                    >
                      −
                    </button>
                    <span className="w-5 text-center text-sm font-semibold">
                      {line.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(line.id, line.qty + 1)}
                      aria-label={`Aumenta quantità di ${line.title}`}
                      className="h-7 w-7 rounded-full border border-foreground/15 text-sm transition hover:bg-background"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {pickupSlots.length > 0 && (
            <label className="mt-5 block text-sm">
              <span className="font-medium">Ritiro indicativo di oggi</span>
              <select
                value={selectedSlot}
                onChange={(event) => setSlot(event.target.value)}
                className="mt-1 w-full rounded-lg border border-foreground/15 bg-background px-3 py-2 text-sm"
              >
                <option value="">Orario da concordare · Demo</option>
                {pickupSlots.map((pickup) => (
                  <option key={pickup} value={pickup}>
                    {pickup}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="mt-5 flex items-center justify-between border-t border-foreground/10 pt-4">
            <span className="text-sm text-muted">Totale</span>
            <span className="font-heading text-xl font-semibold">
              {formatPrice(total)}
            </span>
          </div>

          {lines.length > 0 ? (
            <a
              data-demo-preview="handled"
              href={getWhatsAppHref(whatsapp, message)}
              onClick={(event) => {
                if (DEMO_MODE) {
                  event.preventDefault();
                  closeCart();
                  preview(message);
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block rounded-full bg-primary px-6 py-3 text-center text-sm font-semibold text-white transition hover:brightness-110 active:scale-[0.98]"
            >
              {DEMO_MODE ? "Prova l’ordine" : "Invia ordine su WhatsApp"}
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="mt-4 w-full cursor-not-allowed rounded-full border border-foreground/10 px-6 py-3 text-sm font-medium text-muted"
            >
              {DEMO_MODE ? "Prova l’ordine" : "Invia ordine su WhatsApp"}
            </button>
          )}
        </div>
      </dialog>
    </>
  );
}
