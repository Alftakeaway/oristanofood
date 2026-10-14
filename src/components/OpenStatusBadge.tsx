'use client';

import { useEffect, useState } from 'react';
import { DEMO_MODE } from '@/lib/demo-mode';
import type { OpenStatus } from '@/lib/open-status';

export default function OpenStatusBadge({ initial }: { initial: OpenStatus }) {
  const [status, setStatus] = useState<OpenStatus>(initial);

  useEffect(() => {
    if (DEMO_MODE) return;
    const refresh = async () => {
      try {
        const res = await fetch('/api/open-status', { cache: 'no-store' });
        if (res.ok) {
          const next = (await res.json()) as OpenStatus;
          setStatus(next);
        }
      } catch {
        // Errore silenzioso: si mantiene lo stato corrente
      }
    };

    const id = setInterval(refresh, 60_000);
    const visible = DEMO_MODE ? initial : status;
  return () => clearInterval(id);
  }, []);

  const visible = DEMO_MODE ? initial : status;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-foreground/10 bg-surface/80 px-3 py-1.5 text-xs font-medium backdrop-blur">
      <span className="relative flex h-2 w-2">
        {visible.isOpen ? (
          <>
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </>
        ) : (
          <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
        )}
      </span>
      {visible.label}
    </span>
  );
}
