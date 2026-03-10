import { useState, useEffect } from 'react';
import type { BookManifest, ChapterContent } from '../services/library/types';
import {
  fetchAllPublishedBooks,
  fetchBookManifest,
  fetchChapter,
} from '../services/library/libraryService';
import {
  getBookProgress,
  markChapterRead,
  useLibraryProgressSnapshot,
} from '../services/library/libraryProgressService';

// ─── All books ────────────────────────────────────────────────────────────────
export function useLibraryBooks() {
  const [books, setBooks] = useState<BookManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchAllPublishedBooks()
      .then(setBooks)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { books, loading, error };
}

// ─── Single book manifest ─────────────────────────────────────────────────────
export function useBookManifest(bookPath: string | undefined) {
  const [manifest, setManifest] = useState<BookManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookPath) {
      setManifest(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchBookManifest(bookPath)
      .then(setManifest)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookPath]);

  return { manifest, loading, error };
}

// ─── Single chapter ───────────────────────────────────────────────────────────
export function useChapter(bookPath: string | undefined, chapterFile: string | undefined) {
  const [chapter, setChapter] = useState<ChapterContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookPath || !chapterFile) {
      setChapter(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchChapter(bookPath, chapterFile)
      .then(setChapter)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [bookPath, chapterFile]);

  return { chapter, loading, error };
}

// ─── Book progress ────────────────────────────────────────────────────────────
export function useBookProgress(bookId: string | undefined) {
  useLibraryProgressSnapshot();

  const progress = bookId ? getBookProgress(bookId) : null;

  const markRead = (chapterId: string) => {
    if (!bookId) return;
    markChapterRead(bookId, chapterId);
  };

  return { progress, markRead };
}

