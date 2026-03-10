/**
 * progressService.ts — Firestore é a fonte da verdade do progresso.
 *
 * Fluxo:
 *   1. AuthContext chama initProgressSync(uid, courseIds) após autenticação.
 *   2. O progresso é carregado do Firestore e mantido em memória.
 *   3. As páginas assinam mudanças via useProgressSnapshot().
 *   4. Escritas atualizam a memória imediatamente e persistem no Firestore.
 */

import { useSyncExternalStore } from "react";
import type { LessonId, CourseId } from "../../domain/types";
import {
  fetchRemoteProgress,
  pushLessonProgress,
  clearRemoteCourseProgress,
} from "./progressFirestore";

export type LessonProgress = {
  completed: boolean;
  percent: number;
  updatedAt: number;
};

export type CourseProgressStore = Record<LessonId, LessonProgress>;

type ProgressState = Record<CourseId, CourseProgressStore>;

type ProgressSnapshot = Readonly<{
  version: number;
  loading: boolean;
  uid: string | null;
}>;

let _syncedUid: string | null = null;
let _syncToken = 0;
let _loading = false;
let _version = 0;
let _state: ProgressState = {};
let _snapshot: ProgressSnapshot = Object.freeze({ version: 0, loading: false, uid: null });

const listeners = new Set<() => void>();

function refreshSnapshot() {
  _snapshot = Object.freeze({
    version: _version,
    loading: _loading,
    uid: _syncedUid,
  });
}

function emit() {
  _version += 1;
  refreshSnapshot();
  for (const listener of listeners) listener();
}

function setLoading(next: boolean) {
  if (_loading !== next) {
    _loading = next;
    emit();
  }
}

function getCourseStore(courseId: CourseId): CourseProgressStore {
  return _state[courseId] ?? {};
}

function setCourseStore(courseId: CourseId, store: CourseProgressStore) {
  _state = { ..._state, [courseId]: store };
  emit();
}

function upsertLesson(
  courseId: CourseId,
  lessonId: LessonId,
  updater: (current?: LessonProgress) => LessonProgress | undefined
) {
  const currentCourse = getCourseStore(courseId);
  const currentLesson = currentCourse[lessonId];
  const nextLesson = updater(currentLesson);

  if (!nextLesson) {
    const { [lessonId]: _removed, ...rest } = currentCourse;
    setCourseStore(courseId, rest);
    return undefined;
  }

  setCourseStore(courseId, { ...currentCourse, [lessonId]: nextLesson });
  return nextLesson;
}

export function clearSyncedUid() {
  _syncToken += 1;
  _syncedUid = null;
  _state = {};
  setLoading(false);
  console.debug("[progress] UID limpo — store em memória resetado");
}

export async function initProgressSync(uid: string, courseIds: CourseId[]): Promise<void> {
  const token = ++_syncToken;
  _syncedUid = uid;
  _state = {};
  setLoading(true);

  console.debug("[progress] initProgressSync para uid:", uid, "cursos:", courseIds);

  try {
    const entries = await Promise.all(
      courseIds.map(async (courseId) => {
        const remote = await fetchRemoteProgress(uid, courseId);
        return [courseId, remote] as const;
      })
    );

    if (token !== _syncToken || _syncedUid !== uid) {
      console.debug("[progress] Sync descartada por troca de usuário/sessão");
      return;
    }

    const nextState: ProgressState = {};
    for (const [courseId, remote] of entries) {
      nextState[courseId] = remote;
    }

    _state = nextState;
    emit();
  } catch (err) {
    console.warn("[progress] Erro na sincronização inicial:", err);
  } finally {
    if (token === _syncToken && _syncedUid === uid) {
      setLoading(false);
    }
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): ProgressSnapshot {
  return _snapshot;
}

export function useProgressSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function isProgressLoading() {
  return _loading;
}

export function getLessonProgress(
  courseId: CourseId,
  lessonId: LessonId
): LessonProgress | undefined {
  return getCourseStore(courseId)[lessonId];
}

export function getCourseProgress(courseId: CourseId, lessonIds: LessonId[]) {
  const store = getCourseStore(courseId);
  const total = lessonIds.length;
  const completedCount = lessonIds.filter((id) => store[id]?.completed).length;
  const percent = total === 0 ? 0 : Math.round((completedCount / total) * 100);
  return { total, completedCount, percent };
}

export function getModuleProgress(
  courseId: CourseId,
  moduleId: string,
  lessonIds: LessonId[]
) {
  void moduleId;
  return getCourseProgress(courseId, lessonIds);
}

export function setLessonCompleted(
  courseId: CourseId,
  lessonId: LessonId,
  completed: boolean
) {
  const updated = upsertLesson(courseId, lessonId, (current) => ({
    completed,
    percent: completed ? 100 : 0,
    updatedAt: Date.now(),
  }));

  if (!updated) return;

  if (_syncedUid) {
    pushLessonProgress(_syncedUid, courseId, lessonId, updated).catch(() => {});
  } else {
    console.warn("[progress] Usuário não sincronizado — write ignorado no Firestore");
  }
}

export function bumpLessonPercent(
  courseId: CourseId,
  lessonId: LessonId,
  percent: number
) {
  const current = getLessonProgress(courseId, lessonId);
  const prevPercent = current?.percent ?? 0;
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  const next = Math.max(prevPercent, clamped);

  if (next === prevPercent && !!current) return;

  const updated: LessonProgress = {
    completed: next >= 100 ? true : (current?.completed ?? false),
    percent: next,
    updatedAt: Date.now(),
  };

  setCourseStore(courseId, { ...getCourseStore(courseId), [lessonId]: updated });

  const shouldSync =
    updated.completed ||
    (prevPercent === 0 && updated.percent > 0) ||
    Math.floor(updated.percent / 10) > Math.floor(prevPercent / 10);

  if (_syncedUid && shouldSync) {
    pushLessonProgress(_syncedUid, courseId, lessonId, updated).catch(() => {});
  }
}

export function resetCourseProgress(courseId: CourseId) {
  _state = { ..._state, [courseId]: {} };
  emit();

  if (_syncedUid) {
    clearRemoteCourseProgress(_syncedUid, courseId).catch(() => {});
  }
}
