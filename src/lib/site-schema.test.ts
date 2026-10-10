import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseSiteData } from './site-schema';

const PATH = join(process.cwd(), 'src', 'config', 'site-data.json');
const real = JSON.parse(readFileSync(PATH, 'utf8')) as unknown;

describe('site-data.json', () => {
  it('reale: valido', () => {
    expect(() => parseSiteData(real, 'site-data.json')).not.toThrow();
  });

  it('prezzo negativo: bloccato con percorso', () => {
    const broken = structuredClone(real) as any;
    broken.showcase[0].price = -5;
    expect(() => parseSiteData(broken, 'site-data.json')).toThrowError(/showcase\.0\.price/);
  });

  it('orario impossibile: bloccato', () => {
    const broken = structuredClone(real) as any;
    const day = Object.values(broken.hours).find((d: any) => d.slots?.length) as any;
    day.slots[0].open = '25:99';
    expect(() => parseSiteData(broken, 'site-data.json')).toThrowError(/open/);
  });

  it('telefono mancante: bloccato in italiano', () => {
    const broken = structuredClone(real) as any;
    broken.businessInfo.phone = '';
    expect(() => parseSiteData(broken, 'site-data.json')).toThrowError(/telefono mancante/);
  });
});
