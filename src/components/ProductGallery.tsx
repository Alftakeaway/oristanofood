"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/format";

interface ProductGalleryProps {
  title: string;
  imageUrl: string;
  images?: string[];
  price: number;
  available: boolean;
}

export default function ProductGallery({
  title,
  imageUrl,
  images = [],
  price,
  available,
}: ProductGalleryProps) {
  const shots = [...new Set([imageUrl, ...images])];
  const [active, setActive] = useState(0);
  const [loaded, setLoaded] = useState("");
  const [ratio, setRatio] = useState(4 / 3);
  const dialog = useRef<HTMLDialogElement>(null);
  const openButton = useRef<HTMLButtonElement>(null);
  const current = shots[active] ?? imageUrl;

  return (
    <div
      className="of-product-media relative aspect-[4/3] overflow-hidden"
      data-loaded={loaded === current}
    >
      <Image
        key={current}
        src={current}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, 50vw"
        onLoad={(event) => {
          setLoaded(current);
          setRatio(
            event.currentTarget.naturalWidth /
              event.currentTarget.naturalHeight,
          );
        }}
        className={`of-product-photo object-cover ${available ? "" : "grayscale"}`}
      />
      {!available && (
        <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
          Esaurito
        </span>
      )}
      <span className="of-product-price absolute right-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-sm font-semibold backdrop-blur">
        {formatPrice(price)}
      </span>
      <button
        ref={openButton}
        type="button"
        className="of-photo-open"
        onClick={() => dialog.current?.showModal()}
        aria-label={`Ingrandisci foto di ${title}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <path d="M8 3H3v5M16 3h5v5M3 16v5h5M21 16v5h-5" />
        </svg>
      </button>
      {shots.length > 1 && (
        <div className="absolute bottom-3 left-3 flex gap-2">
          {shots.map((shot, index) => (
            <button
              key={shot}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Foto ${index + 1} di ${title}`}
              aria-pressed={index === active}
              className={`h-10 w-10 overflow-hidden rounded-lg border-2 transition ${index === active ? "border-accent" : "border-white/70 opacity-70 hover:opacity-100"}`}
            >
              <Image
                src={shot}
                alt=""
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
      <dialog
        ref={dialog}
        onClose={() => openButton.current?.focus({ preventScroll: true })}
        className="of-photo-dialog"
        aria-label={`Foto di ${title}`}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="of-photo-dialog__panel">
          <button
            type="button"
            className="of-photo-close"
            onClick={() => dialog.current?.close()}
            aria-label="Chiudi foto"
            autoFocus
          >
            ×
          </button>
          <div
            className="of-photo-dialog__image"
            style={{ aspectRatio: ratio }}
          >
            <Image
              src={current}
              alt={title}
              fill
              sizes="(max-width: 800px) 100vw, 900px"
              className="object-contain"
            />
          </div>
          <div className="of-photo-dialog__caption">
            <h2>{title}</h2>
            <span>{formatPrice(price)}</span>
          </div>
        </div>
      </dialog>
    </div>
  );
}
