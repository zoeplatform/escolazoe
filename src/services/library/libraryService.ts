import type {
  BookManifest,
  LibraryIndex,
  ChapterContent,
  ChapterFrontmatter
} from './types';

// ─── Base URL ────────────────────────────────────────────────────────────────
const BASE =
  typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? import.meta.env.BASE_URL.replace(/\/$/, '')
    : '';

// ─── Frontmatter Parser ───────────────────────────────────────────────────────
function parseFrontmatter(raw: string): { frontmatter: ChapterFrontmatter; markdown: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return {
      frontmatter: {} as ChapterFrontmatter,
      markdown: raw,
    };
  }

  const yamlBlock = match[1];
  const markdown = match[2];

  const fm: Record<string, unknown> = {};
  for (const line of yamlBlock.split('\n')) {
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    const key = line.slice(0, sep).trim();
    const rawVal = line.slice(sep + 1).trim();

    if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
      fm[key] = rawVal
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^["']|["']$/g, ''));
    } else if (rawVal === 'true') {
      fm[key] = true;
    } else if (rawVal === 'false') {
      fm[key] = false;
    } else if (!isNaN(Number(rawVal)) && rawVal !== '') {
      fm[key] = Number(rawVal);
    } else {
      fm[key] = rawVal.replace(/^["']|["']$/g, '');
    }
  }

  return { frontmatter: fm as ChapterFrontmatter, markdown: markdown.trim() };
}

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.json() as Promise<T>;
}

async function fetchText(path: string): Promise<string> {
  const res = await fetch(`${BASE}/${path}`);
  if (!res.ok) throw new Error(`Failed to fetch ${path}: ${res.status}`);
  return res.text();
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchLibraryIndex(): Promise<LibraryIndex> {
  return fetchJSON<LibraryIndex>('library/index.json');
}

export async function fetchBookManifest(bookPath: string): Promise<BookManifest> {
  return fetchJSON<BookManifest>(`${bookPath}/manifest.json`);
}

export async function fetchAllPublishedBooks(): Promise<BookManifest[]> {
  const index = await fetchLibraryIndex();
  const published = index.books.filter((b) => b.status === 'published');
  const manifests = await Promise.all(published.map((b) => fetchBookManifest(b.path)));
  return manifests;
}

export async function fetchChapter(bookPath: string, chapterFile: string): Promise<ChapterContent> {
  const raw = await fetchText(`${bookPath}/${chapterFile}`);
  return parseFrontmatter(raw);
}

// ─── Category labels ──────────────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  'vida-crista': 'Vida Cristã',
  teologia: 'Teologia',
  biblica: 'Bíblica',
  historica: 'Histórica',
  apologetica: 'Apologética',
  missoes: 'Missões',
};

export const DIFFICULTY_LABELS: Record<string, string> = {
  introductory: 'Introdutório',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};
