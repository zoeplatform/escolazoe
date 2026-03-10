import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { CourseId, LessonId } from "../../domain/types";
import type { LessonProgress, CourseProgressStore } from "./progressService";

function progressRef(uid: string, courseId: CourseId) {
  return doc(db, "users", uid, "progress", courseId);
}

export async function fetchRemoteProgress(
  uid: string,
  courseId: CourseId
): Promise<CourseProgressStore> {
  try {
    const snap = await getDoc(progressRef(uid, courseId));
    if (!snap.exists()) return {};
    return (snap.data()?.lessons ?? {}) as CourseProgressStore;
  } catch (err) {
    console.warn("[progress] fetchRemoteProgress falhou:", err);
    return {};
  }
}

export async function pushLessonProgress(
  uid: string,
  courseId: CourseId,
  lessonId: LessonId,
  progress: LessonProgress
): Promise<void> {
  try {
    await setDoc(
      progressRef(uid, courseId),
      { lessons: { [lessonId]: progress }, updatedAt: serverTimestamp() },
      { merge: true }
    );
    console.debug(`[progress] ✓ Firestore write: ${courseId}/${lessonId}`, progress);
  } catch (err) {
    console.warn("[progress] pushLessonProgress falhou:", err);
  }
}

export async function replaceFullCourseProgress(
  uid: string,
  courseId: CourseId,
  store: CourseProgressStore
): Promise<void> {
  try {
    await setDoc(progressRef(uid, courseId), {
      lessons: store,
      updatedAt: serverTimestamp(),
    });
    console.debug(`[progress] ✓ Firestore full replace: ${courseId}`, store);
  } catch (err) {
    console.warn("[progress] replaceFullCourseProgress falhou:", err);
  }
}

export async function clearRemoteCourseProgress(
  uid: string,
  courseId: CourseId
): Promise<void> {
  try {
    await deleteDoc(progressRef(uid, courseId));
    console.debug(`[progress] ✓ Firestore delete: ${courseId}`);
  } catch (err) {
    console.warn("[progress] clearRemoteCourseProgress falhou:", err);
  }
}
