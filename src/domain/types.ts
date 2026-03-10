export type LessonId = string; // ex: "FND-01"
export type ModuleId = string; // ex: "FND-M01"
export type CourseId = string; // ex: "fundamentos"

export type Lesson = {
  id: LessonId;
  title: string;
  order: number; // 1..N
  estimatedMinutes?: number;
  contentRef: {
    type: "placeholder" | "package";
    packageKey?: string;
    file?: string;
  };
};

export type Module = {
  id: ModuleId;
  title: string;
  icon: string;
  order: number;
  lessons: Lesson[];
};

export type Course = {
  id: CourseId;
  title: string;
  description: string;
  totalLessons: number;
  modules: Module[];
};

export type LessonRef = { id: LessonId };