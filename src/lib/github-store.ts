import type { SiteData } from './site-data';

// Il repo GitHub fa da database: niente account/servizi esterni.
// Letture: file versionato via API (sempre aggiornato, niente redeploy).
// Scritture: commit diretto del JSON (storia modifiche gratis nel repo).
// Sviluppo senza token: file locale, comportamento invariato.

const REPO = process.env.GITHUB_REPO ?? 'Alftakeaway/oristanofood';
const PATH = process.env.GITHUB_DATA_PATH ?? 'src/config/site-data.json';
const API = `https://api.github.com/repos/${REPO}/contents/${PATH}`;

function headers(json = false): HeadersInit {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'oristanofood-webhook',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  if (json) h['Content-Type'] = 'application/json';
  return h;
}

export function isGitHubConfigured(): boolean {
  return Boolean(process.env.GITHUB_TOKEN);
}

export async function loadRemote(): Promise<SiteData | null> {
  if (!isGitHubConfigured()) return null;
  try {
    const res = await fetch(`${API}?ref=main`, { headers: headers(), next: { revalidate: 0 } });
    if (!res.ok) return null;
    const body = (await res.json()) as { content?: string; encoding?: string };
    if (body.encoding !== 'base64' || !body.content) return null;
    const data = JSON.parse(Buffer.from(body.content, 'base64').toString('utf8')) as SiteData;
    if (!data || !Array.isArray(data.showcase)) return null;
    return data;
  } catch (error) {
    console.error('[github-store] lettura remota fallita, uso file locale:', error);
    return null;
  }
}

export async function saveRemote(data: SiteData, message: string): Promise<boolean> {
  if (!isGitHubConfigured()) return false;
  try {
    const meta = await fetch(`${API}?ref=main`, { headers: headers() });
    if (!meta.ok) {
      console.error('[github-store] impossibile leggere sha corrente:', meta.status);
      return false;
    }
    const { sha } = (await meta.json()) as { sha?: string };
    if (!sha) return false;
    const content = Buffer.from(JSON.stringify(data, null, 2) + '\n', 'utf8').toString('base64');
    const put = await fetch(API, {
      method: 'PUT',
      headers: headers(true),
      body: JSON.stringify({ message, content, sha, branch: 'main' }),
    });
    if (!put.ok) {
      console.error('[github-store] commit fallito:', put.status, await put.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error('[github-store] commit fallito:', error);
    return false;
  }
}
