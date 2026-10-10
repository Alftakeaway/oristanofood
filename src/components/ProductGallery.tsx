'use client';

import { useState } from 'react';
import Image from 'next/image';
import { formatPrice } from '@/lib/format';

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
  const shots = [imageUrl, ...images];
  const [active, setActive] = useState(0);

  return (
    <div className="relative aspect-[4/3] overflow-hidden">
      <Image
        src={shots[active]}
        alt={title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={`object-cover transition duration-500 group-hover:scale-105 ${
          available ? '' : 'grayscale'
        }`}
      />
      {!available && (
        <span className="absolute left-3 top-3 rounded-full bg-foreground/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-background">
          Esaurito
        </span>
      )}
      <span className="absolute right-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-sm font-semibold backdrop-blur">
        {formatPrice(price)}
      </span>
      {shots.length > 1 && (
        <div className="absolute bottom-3 left-3 flex gap-2">
          {shots.map((shot, index) => (
            <button
              key={`${shot}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Foto ${index + 1} di ${title}`}
              aria-pressed={index === active}
              className={`h-10 w-10 overflow-hidden rounded-lg border-2 transition ${
                index === active
                  ? 'border-accent'
                  : 'border-white/70 opacity-70 hover:opacity-100'
              }`}
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
    </div>
  );
}
