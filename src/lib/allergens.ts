export interface AllergenCategory {
  key: string;
  label: string;
  short: string;
  keywords: string[];
}

export const ALLERGEN_CATEGORIES: AllergenCategory[] = [
  {
    key: 'gluten',
    label: 'Cereali contenenti glutine',
    short: 'Glutine',
    keywords: ['glutine', 'frumento', 'grano', 'farro', 'orzo', 'segale', 'kamut', 'avena', 'semola'],
  },
  { key: 'crustaceans', label: 'Crostacei', short: 'Crostacei', keywords: ['crostace', 'gamber', 'mazzancoll', 'granchio', 'aragost', 'krill'] },
  { key: 'eggs', label: 'Uova', short: 'Uova', keywords: ['uova', 'uovo', 'ovoporod', 'maionese', 'zabaglione'] },
  { key: 'fish', label: 'Pesce', short: 'Pesce', keywords: ['pesce', 'tonno', 'salmone', 'merluzz', 'orata', 'branzin', 'swordfish', 'alici', 'sardell', 'baccal', 'pesce spada'] },
  { key: 'peanuts', label: 'Arachidi', short: 'Arachidi', keywords: ['arachid'] },
  { key: 'soy', label: 'Soia', short: 'Soia', keywords: ['soia', 'soja', 'edamame', 'tofu', 'tempeh'] },
  { key: 'milk', label: 'Latte', short: 'Latte', keywords: ['latte', 'lattic', 'formaggio', 'mozzarella', 'burro', 'panna', 'siero', 'casein', 'yogurt', 'stracchino', 'ricotta', 'gorgonzola', 'pecorino', 'parmigiano', 'grana'] },
  { key: 'nuts', label: 'Frutta a guscio', short: 'Frutta a guscio', keywords: ['frutta a guscio', 'mandorl', 'nocciole', 'noci', 'pistacchi', 'anacardi', 'arachidi tostate', 'pinoli', 'noccioline'] },
  { key: 'celery', label: 'Sedano', short: 'Sedano', keywords: ['sedano', 'sedano rapa'] },
  { key: 'mustard', label: 'Senape', short: 'Senape', keywords: ['senape', 'mostarda'] },
  { key: 'sesame', label: 'Semi di sesamo', short: 'Sesamo', keywords: ['sesamo', 'tahine', 'gomasio'] },
  { key: 'sulphur', label: 'Anidride solforosa e solfiti', short: 'Solfiti', keywords: ['solfiti', 'solforos'] },
  { key: 'lupin', label: 'Lupini', short: 'Lupini', keywords: ['lupin'] },
  { key: 'molluscs', label: 'Molluschi', short: 'Molluschi', keywords: ['mollusch', 'cozz', 'vongol', 'capess', 'seppia', 'polpo', 'calamaro', 'octopus'] },
];

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/̀-ͯ/g, '')
    .trim();
}

export function itemAllergenKeys(allergens: string[]): Set<string> {
  const keys = new Set<string>();
  for (const category of ALLERGEN_CATEGORIES) {
    const hit = allergens.some((raw) => {
      const value = normalize(raw);
      return category.keywords.some((keyword) => {
        const needle = normalize(keyword);
        return value.includes(needle) || needle.includes(value);
      });
    });
    if (hit) keys.add(category.key);
  }
  return keys;
}
