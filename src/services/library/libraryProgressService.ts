import { useSyncExternalStore } from "react";
import { fetchLibraryIndex } from "./libraryService";
import { clearRemoteBookProgress, fetchRemoteBookProgress, pushBookProgress } from "./libraryProgressFirestore";
import type { BookProgress } from "./types";

type LibraryProgressState = Record<string, BookProgress>;

type LibraryProgressSnapshot = Readonly<{
  version: number;
  loading: boolean;
  uid: string | null;
}>;

let _syncedUid: string | null = null;
let _syncToken = 0;
let _loading = false;
let _version = 0;
let _state: LibraryProgressState = {};
let _snapshot: LibraryProgressSnapshot = Object.freeze({ version: 0, loading: false, uid: null });

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

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): LibraryProgressSnapshot {
  return _snapshot;
}

function setBookProgress(bookId: string, progress: BookProgress | null) {
  if (progress) {
    _state = { ..._state, [bookId]: progress };
  } else {
    const { [bookId]: _removed, ...rest } = _state;
    _state = rest;
  }
  emit();
}

function buildBookProgress(current: BookProgress | null, bookId: string, chapterId: string): BookProgress {
  const now = new Date().toISOString();
  const readChapters = current?.readChapters ?? [];
  const nextReadChapters = readChapters.includes(chapterId)
    ? readChapters
    : [...readChapters, chapterId];

  return {
    bookId,
    readChapters: nextReadChapters,
    lastReadChapterId: chapterId,
    startedAt: current?.startedAt ?? now,
    lastReadAt: now,
  };
}

export function useLibraryProgressSnapshot() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function clearLibrarySyncedUid() {
  _syncToken += 1;
  _syncedUid = null;
  _state = {};
  setLoading(false);
}

export async function initLibraryProgressSync(uid: string): Promise<void> {
  const token = ++_syncToken;
  _syncedUid = uid;
  _state = {};
  setLoading(true);

  try {
    const index = await fetchLibraryIndex();
    const entries = await Promise.all(
      index.books.map(async (entry) => {
        const remote = await fetchRemoteBookProgress(uid, entry.bookId);
        return [entry.bookId, remote] as const;
      })
    );

    if (token !== _syncToken || _syncedUid !== uid) return;

    const nextState: LibraryProgressState = {};
    for (const [bookId, remote] of entries) {
      if (remote) nextState[bookId] = remote;
    }

    _state = nextState;
    emit();
  } catch (err) {
    console.warn("[library-progress] initLibraryProgressSync falhou:", err);
  } finally {
    if (token === _syncToken && _syncedUid === uid) {
      setLoading(false);
    }
  }
}

export function getBookProgress(bookId: string): BookProgress | null {
  return _state[bookId] ?? null;
}

export function getBookProgressPercent(bookId: string, totalChapters: number): number {
  if (totalChapters <= 0) return 0;
  const progress = getBookProgress(bookId);
  const completed = progress?.readChapters.length ?? 0;
  return Math.round((completed / totalChapters) * 100);
}

export function markChapterRead(bookId: string, chapterId: string): BookProgress {
  const current = getBookProgress(bookId);
  const next = buildBookProgress(current, bookId, chapterId);
  setBookProgress(bookId, next);

  if (_syncedUid) {
    pushBookProgress(_syncedUid, next).catch(() => {});
  } else {
    console.warn("[library-progress] Usuário não sincronizado — write ignorado no Firestore");
  }

  return next;
}

export function isChapterRead(bookId: string, chapterId: string): boolean {
  const progress = getBookProgress(bookId);
  return progress?.readChapters.includes(chapterId) ?? false;
}

export function resetBookProgress(bookId: string) {
  setBookProgress(bookId, null);
  if (_syncedUid) {
    clearRemoteBookProgress(_syncedUid, bookId).catch(() => {});
  }
}
