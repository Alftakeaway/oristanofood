import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import {
  removeException,
  setAvailability,
  setException,
  updatePrice,
  upsertShowcaseItem,
} from '@/lib/kv-store';
import { getSiteData } from '@/lib/site-data';
import { getTodayDateString } from '@/lib/open-status';

export const dynamic = 'force-dynamic';

interface RawItem {
  title?: unknown;
  description?: unknown;
  price?: unknown;
  category?: unknown;
  imageUrl?: unknown;
  images?: unknown;
  ingredients?: unknown;
  feature?: unknown;
  allergens?: unknown;
  glutenFree?: unknown;
  vegan?: unknown;
  available?: unknown;
}

const HELP = `Comandi disponibili:
/esaurito <nome> — segna un prodotto come esaurito
/disponibile <nome> — riporta un prodotto disponibile
/prezzo <nome> <euro> — aggiorna il prezzo (es. /prezzo cornetto 3,50)
/chiuso [oggi|YYYY-MM-DD] [motivo] — chiude in una data
/aperto [oggi|YYYY-MM-DD] — rimuove la chiusura di una data
/aiuto — mostra questo elenco`;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const expected = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && challenge && expected && token === expected) {
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json(
    { ok: false, error: 'Verifica webhook non riuscita' },
    { status: 403 },
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Payload JSON non valido' }, { status: 400 });
  }

  try {
    const payload = (typeof body === 'object' && body !== null ? body : {}) as Record<
      string,
      unknown
    >;
    const item = payload.item as RawItem | undefined;

    if (item !== undefined) {
      return handleItem(request, item);
    }

    const text = typeof payload.text === 'string' ? payload.text : undefined;
    const from = typeof payload.from === 'string' ? payload.from : undefined;

    if (text !== undefined && text.startsWith('/')) {
      return handleCommand(request, text, from);
    }

    if (typeof payload.message === 'string') {
      console.log('[whatsapp-webhook] messaggio ricevuto:', payload.message);
      return NextResponse.json({
        ok: true,
        revalidated: false,
        note: 'Messaggio ricevuto, nessun aggiornamento applicato',
      });
    }

    return NextResponse.json(
      { ok: false, error: 'Payload vuoto: fornire item, text oppure message' },
      { status: 400 },
    );
  } catch (error) {
    console.error('[whatsapp-webhook] errore interno:', error);
    return NextResponse.json({ ok: false, error: 'Errore interno' }, { status: 500 });
  }
}

function checkItemSecret(request: Request, bodySecret: unknown): NextResponse | null {
  const expected = process.env.WHATSAPP_WEBHOOK_SECRET;
  const provided =
    request.headers.get('x-webhook-secret') ?? (typeof bodySecret === 'string' ? bodySecret : undefined);
  if (expected && provided !== expected) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }
  if (!expected) {
    console.warn(
      '[whatsapp-webhook] WHATSAPP_WEBHOOK_SECRET non impostata: modalità demo, richiesta accettata',
    );
  }
  return null;
}

function checkWhitelist(from: string | undefined): NextResponse | null {
  const allowed = (process.env.WHATSAPP_ALLOWED_NUMBERS ?? '')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);
  if (allowed.length === 0) {
    console.warn(
      '[whatsapp-webhook] WHATSAPP_ALLOWED_NUMBERS non impostata: modalità demo, comando accettato',
    );
    return null;
  }
  if (!from || !allowed.includes(from)) {
    return NextResponse.json(
      { ok: false, error: 'Numero non autorizzato' },
      { status: 403 },
    );
  }
  return null;
}

async function handleItem(request: Request, item: RawItem): Promise<NextResponse> {
  const denied = checkItemSecret(request, (item as unknown as Record<string, unknown>).secret);
  if (denied) return denied;

  if (
    typeof item.title !== 'string' ||
    item.title.trim() === '' ||
    typeof item.imageUrl !== 'string' ||
    item.imageUrl.trim() === ''
  ) {
    return NextResponse.json(
      { ok: false, error: 'item.title e item.imageUrl sono obbligatori' },
      { status: 400 },
    );
  }
  const input = {
    title: item.title,
    imageUrl: item.imageUrl,
    ...(typeof item.description === 'string' ? { description: item.description } : {}),
    ...(typeof item.price === 'number' && item.price >= 0 ? { price: item.price } : {}),
    ...(typeof item.category === 'string' ? { category: item.category } : {}),
    ...(Array.isArray(item.images)
      ? { images: item.images.filter((i): i is string => typeof i === 'string' && i.trim() !== '') }
      : {}),
    ...(Array.isArray(item.ingredients)
      ? {
          ingredients: item.ingredients.filter(
            (i): i is string => typeof i === 'string' && i.trim() !== '',
          ),
        }
      : {}),
    ...(typeof item.feature === 'boolean' ? { feature: item.feature } : {}),
    ...(Array.isArray(item.allergens)
      ? { allergens: item.allergens.filter((a): a is string => typeof a === 'string') }
      : {}),
    ...(typeof item.glutenFree === 'boolean' ? { glutenFree: item.glutenFree } : {}),
    ...(typeof item.vegan === 'boolean' ? { vegan: item.vegan } : {}),
    ...(typeof item.available === 'boolean' ? { available: item.available } : {}),
  };
  const { data, item: saved } = await upsertShowcaseItem(input);
  revalidateTag('site-data');
  return NextResponse.json({
    ok: true,
    revalidated: true,
    showcaseCount: data.showcase.length,
    item: saved,
  });
}

async function handleCommand(
  request: Request,
  text: string,
  from: string | undefined,
): Promise<NextResponse> {
  const denied = checkWhitelist(from);
  if (denied) return denied;

  const [rawName, ...rest] = text.slice(1).trim().split(/\s+/);
  const command = (rawName ?? '').toLowerCase();
  const args = rest.join(' ').trim();

  switch (command) {
    case 'esaurito': {
      if (!args) return NextResponse.json({ ok: false, error: 'Uso: /esaurito <nome>' }, { status: 400 });
      const { item } = await setAvailability(args, false);
      revalidateTag('site-data');
      return NextResponse.json({ ok: true, revalidated: true, command, item });
    }
    case 'disponibile': {
      if (!args) return NextResponse.json({ ok: false, error: 'Uso: /disponibile <nome>' }, { status: 400 });
      const { item } = await setAvailability(args, true);
      revalidateTag('site-data');
      return NextResponse.json({ ok: true, revalidated: true, command, item });
    }
    case 'prezzo': {
      const lastSpace = args.lastIndexOf(' ');
      if (lastSpace <= 0) {
        return NextResponse.json({ ok: false, error: 'Uso: /prezzo <nome> <euro>' }, { status: 400 });
      }
      const name = args.slice(0, lastSpace).trim();
      const rawPrice = args.slice(lastSpace + 1).trim();
      const price = Number(rawPrice.replace(/\./g, '').replace(',', '.'));
      if (!name || Number.isNaN(price) || price < 0) {
        return NextResponse.json(
          { ok: false, error: 'Prezzo non valido: usare il formato 3,50' },
          { status: 400 },
        );
      }
      const { item } = await updatePrice(name, Math.round(price * 100) / 100);
      revalidateTag('site-data');
      return NextResponse.json({ ok: true, revalidated: true, command, item });
    }
    case 'chiuso': {
      const { date, note } = await resolveDateAndNote(args);
      await setException(date, { isOpen: false, ...(note ? { note } : {}) });
      revalidateTag('site-data');
      return NextResponse.json({ ok: true, revalidated: true, command, date, note: note ?? null });
    }
    case 'aperto': {
      const date = await resolveDate(args);
      const data = await removeException(date);
      revalidateTag('site-data');
      return NextResponse.json({ ok: true, revalidated: true, command, date, exceptions: data.exceptions.length });
    }
    case 'aiuto':
    case 'help':
      return NextResponse.json({ ok: true, revalidated: false, help: HELP });
    default:
      return NextResponse.json(
        { ok: false, error: `Comando sconosciuto: /${command}`, help: HELP },
        { status: 400 },
      );
  }
}

async function resolveDate(token: string): Promise<string> {
  const first = token.split(/\s+/)[0];
  if (first && (first.toLowerCase() === 'oggi' || DATE_RE.test(first))) {
    return toDateString(first);
  }
  return toDateString('oggi');
}

async function resolveDateAndNote(args: string): Promise<{ date: string; note: string }> {
  const first = args.split(/\s+/)[0] ?? '';
  if (first && (first.toLowerCase() === 'oggi' || DATE_RE.test(first))) {
    const note = args.slice(first.length).trim();
    return { date: await toDateString(first), note };
  }
  return { date: await toDateString('oggi'), note: args.trim() };
}

async function toDateString(token: string): Promise<string> {
  if (DATE_RE.test(token)) return token;
  const data = await getSiteData();
  return getTodayDateString(data.businessInfo.timezone);
}
