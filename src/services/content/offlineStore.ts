import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { lessonMarkdown } from '../../data/lessonContent';

const INDEX_KEY = 'escolazoe.offlineIndex.v1';

type OfflineIndex = {
  // courseId -> { downloadedAt, lessons: [lessonId] }
  courses: Record<string, { downloadedAt: number; lessons: string[] }>;
};

function readIndex(): OfflineIndex {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return { courses: {} };
    return JSON.parse(raw) as OfflineIndex;
  } catch {
    return { courses: {} };
  }
}

function writeIndex(index: OfflineIndex) {
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function key(courseId: string, lessonId: string) {
  return `${courseId}:${lessonId}`;
}

// Caminho interno no app (Android/iOS) via Filesystem
function filePath(courseId: string, lessonId: string) {
  return `content/${courseId}/${lessonId}.md`;
}

export async function downloadCourseOffline(courseId: string, lessonIds: string[]) {
  // Para este mock, baixamos do "catálogo" local (lessonMarkdown)
  const isNative = Capacitor.isNativePlatform();

  for (const lessonId of lessonIds) {
    const md = lessonMarkdown[key(courseId, lessonId)] ?? `# Aula ${lessonId}\n\nHello world.`;

    if (isNative) {
      await Filesystem.writeFile({
        path: filePath(courseId, lessonId),
        data: md,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
        recursive: true,
      });
    } else {
      // Web fallback: guarda no localStorage (só para validação)
      localStorage.setItem(`escolazoe.lesson.${courseId}.${lessonId}`, md);
    }
  }

  const index = readIndex();
  index.courses[courseId] = {
    downloadedAt: Date.now(),
    lessons: [...lessonIds],
  };
  writeIndex(index);
}

export async function getLessonOffline(courseId: string, lessonId: string): Promise<string | null> {
  const isNative = Capacitor.isNativePlatform();

  try {
    if (isNative) {
      const res = await Filesystem.readFile({
        path: filePath(courseId, lessonId),
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
      return typeof res.data === 'string' ? res.data : null;
    }

    const raw = localStorage.getItem(`escolazoe.lesson.${courseId}.${lessonId}`);
    return raw ?? null;
  } catch {
    return null;
  }
}

export function isCourseDownloaded(courseId: string) {
  const index = readIndex();
  return Boolean(index.courses[courseId]);
}

export function getCourseDownloadedMeta(courseId: string) {
  const index = readIndex();
  return index.courses[courseId] ?? null;
}
