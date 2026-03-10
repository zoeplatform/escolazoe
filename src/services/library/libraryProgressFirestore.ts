import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { BookProgress } from "./types";

function bookProgressRef(uid: string, bookId: string) {
  return doc(db, "users", uid, "libraryProgress", bookId);
}

export async function fetchRemoteBookProgress(uid: string, bookId: string): Promise<BookProgress | null> {
  try {
    const snap = await getDoc(bookProgressRef(uid, bookId));
    if (!snap.exists()) return null;
    const data = snap.data() ?? {};
    return {
      bookId,
      readChapters: Array.isArray(data.readChapters) ? data.readChapters : [],
      lastReadChapterId: typeof data.lastReadChapterId === "string" ? data.lastReadChapterId : undefined,
      startedAt: typeof data.startedAt === "string" ? data.startedAt : new Date().toISOString(),
      lastReadAt: typeof data.lastReadAt === "string" ? data.lastReadAt : new Date().toISOString(),
    };
  } catch (err) {
    console.warn("[library-progress] fetchRemoteBookProgress falhou:", err);
    return null;
  }
}

export async function pushBookProgress(uid: string, progress: BookProgress): Promise<void> {
  try {
    await setDoc(
      bookProgressRef(uid, progress.bookId),
      {
        ...progress,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn("[library-progress] pushBookProgress falhou:", err);
  }
}

export async function clearRemoteBookProgress(uid: string, bookId: string): Promise<void> {
  try {
    await deleteDoc(bookProgressRef(uid, bookId));
  } catch (err) {
    console.warn("[library-progress] clearRemoteBookProgress falhou:", err);
  }
}
