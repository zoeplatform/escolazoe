import type { PackManifest } from "./contentTypes";

// Base path - funciona tanto em localhost quanto em GitHub Pages
const EMBED_BASE = `${import.meta.env.BASE_URL}packs`;

type PacksIndex = {
  packs: Array<{
    courseId: string;
    moduleSlug: string;
    packId: string;
    path: string; // e.g. fundamentos/revelacao-escritura
  }>;
};

async function fetchText(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch ${url} (${r.status})`);
  return await r.text();
}

async function fetchJson<T>(url: string): Promise<T> {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Failed to fetch ${url} (${r.status})`);
  return (await r.json()) as T;
}

let _indexCache: PacksIndex | null = null;

export async function loadPacksIndex(): Promise<PacksIndex> {
  if (_indexCache) return _indexCache;
  _indexCache = await fetchJson<PacksIndex>(`${EMBED_BASE}/index.json`);
  return _indexCache;
}

export async function loadManifest(courseId: string, moduleSlug: string): Promise<PackManifest> {
  const idx = await loadPacksIndex();
  const entry = idx.packs.find((p) => p.courseId === courseId && p.moduleSlug === moduleSlug);
  if (!entry) throw new Error(`Pack not found for ${courseId}/${moduleSlug}`);
  return await fetchJson<PackManifest>(`${EMBED_BASE}/${entry.path}/manifest.json`);
}

export async function loadLessonMarkdown(courseId: string, moduleSlug: string, lessonId: string): Promise<string> {
  const manifest = await loadManifest(courseId, moduleSlug);
  const entry = manifest.lessons.find((l) => l.lessonId === lessonId);
  if (!entry) throw new Error(`Lesson ${lessonId} not found in manifest ${manifest.packId}`);
  const url = `${EMBED_BASE}/${courseId}/${moduleSlug}/${entry.file}`;
  return await fetchText(url);
}

export async function loadAssessmentJson(courseId: string, moduleSlug: string, lessonId: string): Promise<any> {
  const manifest = await loadManifest(courseId, moduleSlug);
  const entry = manifest.lessons.find((l) => l.lessonId === lessonId);
  if (!entry?.assessmentFile) throw new Error(`Assessment not found for ${lessonId}`);
  const url = `${EMBED_BASE}/${courseId}/${moduleSlug}/${entry.assessmentFile}`;
  return await fetchJson<any>(url);
}


export async function loadMarkdownFromContentRef(ref: { type: "package"; packageKey?: string; file?: string }): Promise<string> {
  if (ref.type !== "package") throw new Error("Unsupported contentRef type");
  if (!ref.packageKey || !ref.file) throw new Error("Invalid package contentRef");
  const url = `${EMBED_BASE}/${ref.packageKey}/${ref.file}`;
  return await fetchText(url);
}

// ─── Module Exam ──────────────────────────────────────────────────────────────

export async function loadModuleExam(courseId: string, moduleSlug: string): Promise<import("./contentTypes").ExamData> {
  const manifest = await loadManifest(courseId, moduleSlug);
  if (!manifest.moduleExam?.file) throw new Error(`No moduleExam in manifest for ${courseId}/${moduleSlug}`);
  const url = `${EMBED_BASE}/${courseId}/${moduleSlug}/${manifest.moduleExam.file}`;
  return await fetchJson<import("./contentTypes").ExamData>(url);
}
