import { Course } from "../domain/types";
import { fundamentosCourse } from "./fundamentos/course";

/**
 * Currículo local (UI-first). Depois, isso pode vir do Firestore/Functions.
 */
const COURSES: Course[] = [fundamentosCourse];

export function listCourses(): Course[] {
  return COURSES;
}

export function getCourseById(courseId: string): Course | undefined {
  return COURSES.find((c) => c.id === courseId);
}

export function getLessonById(course: Course, lessonId: string) {
  for (const m of course.modules) {
    const lesson = m.lessons.find((l) => l.id === lessonId);
    if (lesson) return lesson;
  }
  return undefined;
}

export function getLessonNav(course: Course, activeLessonId: string) {
  const flat = course.modules.flatMap((m) => m.lessons);
  const idx = flat.findIndex((l) => l.id === activeLessonId);

  const prev = idx > 0 ? { id: flat[idx - 1].id } : undefined;
  const next = idx >= 0 && idx < flat.length - 1 ? { id: flat[idx + 1].id } : undefined;

  return { prev, next, index: idx, total: flat.length };
}
