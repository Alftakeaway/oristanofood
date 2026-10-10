'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { ShowcaseItem } from '@/lib/site-data';

export const DIET_FILTERS = [
  { key: 'all', label: 'Tutti' },
  { key: 'glutenFree', label: 'Senza glutine' },
  { key: 'vegan', label: 'Vegano' },
] as const;

export type DietKey = (typeof DIET_FILTERS)[number]['key'];

interface DietFilterValue {
  diet: DietKey;
  setDiet: (diet: DietKey) => void;
}

const DietFilterContext = createContext<DietFilterValue>({
  diet: 'all',
  setDiet: () => {},
});

export function DietFilterProvider({ children }: { children: ReactNode }) {
  const [diet, setDiet] = useState<DietKey>('all');
  const value = useMemo(() => ({ diet, setDiet }), [diet]);
  return <DietFilterContext.Provider value={value}>{children}</DietFilterContext.Provider>;
}

export function useDietFilter(): DietFilterValue {
  return useContext(DietFilterContext);
}

export function matchesDiet(item: ShowcaseItem, diet: DietKey): boolean {
  if (diet === 'all') return true;
  return diet === 'glutenFree' ? item.glutenFree : item.vegan;
}

export function DietFilterBar() {
  const { diet, setDiet } = useDietFilter();
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filtra per dieta">
      {DIET_FILTERS.map((filter) => (
        <button
          key={filter.key}
          type="button"
          aria-pressed={diet === filter.key}
          onClick={() => setDiet(filter.key)}
          className={
            diet === filter.key
              ? 'rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-white'
              : 'rounded-full border border-foreground/15 px-4 py-1.5 text-sm font-medium text-muted transition hover:border-primary/50 hover:text-foreground'
          }
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
