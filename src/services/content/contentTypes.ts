// ─── Manifest ────────────────────────────────────────────────────────────────

export type PackManifestLesson = {
  lessonId: string;
  title: string;
  file: string;
  assessmentFile?: string;
  estimatedStudyMinutes?: number;
  estimatedMeetingMinutes?: number;
};

export type GradeScaleEntry = {
  label: string;
  minScore: number;
  badge: "distinction" | "merit" | "pass" | "recovery" | "fail";
};

export type ModuleExamRef = {
  examId: string;
  title: string;
  file: string;
  totalPoints: number;
  passingScore: number;
  estimatedMinutes: number;
  coverageMap?: Record<string, string[]>;
  questionTypes?: Record<string, { count: number; points: number }>;
  gradeScale?: GradeScaleEntry[];
};

export type PackManifest = {
  packId: string;
  courseId: string;
  moduleId: string;
  moduleTitle: string;
  version: string;
  updatedAt: string;
  passingScore: number;
  assets: string[];
  lessons: PackManifestLesson[];
  moduleExam?: ModuleExamRef;
};

// ─── Exam JSON ────────────────────────────────────────────────────────────────

export type MultipleChoiceQuestion = {
  id: string; sectionId: string; lessonRef: string; type: "multiple_choice";
  points: number; difficulty: string; question: string;
  options: Record<string, string>;
  answerKey: { correct: string; rationale: string };
};

export type TrueFalseQuestion = {
  id: string; sectionId: string; lessonRef: string; type: "true_false";
  points: number; difficulty: string; statement: string;
  answerKey: { correct: boolean; rationale: string };
};

export type MatchingQuestion = {
  id: string; sectionId: string; lessonRef: string; type: "matching";
  points: number; difficulty: string; instruction: string;
  columnA: Array<{ itemId: string; term: string }>;
  columnB: Array<{ itemId: string; definition: string }>;
  answerKey: { correct: Record<string, string>; pointsPerMatch: number; rationale: string };
};

export type EssayQuestion = {
  id: string; sectionId: string; lessonRef: string; type: "essay";
  points: number; difficulty: string; question: string;
  answerKey: { gradingMode: string; modelAnswer: string; rubric: Record<string, string>; keyPoints: string[] };
};

export type ExamQuestion = MultipleChoiceQuestion | TrueFalseQuestion | MatchingQuestion | EssayQuestion;

export type ExamSection = {
  sectionId: string; title: string; description: string;
  totalPoints: number; questions: ExamQuestion[];
};

export type ExamData = {
  examId: string; moduleId: string; courseId: string;
  title: string; version: string; createdAt: string;
  passingScore: number; totalPoints: number; estimatedMinutes: number;
  instructions: string;
  coverageMap: Record<string, string[]>;
  sections: ExamSection[];
  gradingSchema: {
    scoreBreakdown: Record<string, { title: string; maxPoints: number; questionCount: number }>;
    gradeScale: Array<{ label: string; minScore: number; maxScore: number; badge: string }>;
    passingScore: number;
    partialCredit: Record<string, boolean>;
  };
  feedbackConfig: {
    showCorrectAnswers: string; showRationale: string; showScore: string;
    showSectionScores: string; showGradeLabel: string;
    highlightWeakSections: boolean; remedialLinks: Record<string, string>;
  };
};

// ─── Exam Result ─────────────────────────────────────────────────────────────

export type QuestionAnswer =
  | { questionId: string; type: "multiple_choice"; selected: string }
  | { questionId: string; type: "true_false"; selected: boolean }
  | { questionId: string; type: "matching"; selected: Record<string, string> }
  | { questionId: string; type: "essay"; text: string };

export type SectionScore = {
  sectionId: string; title: string; earned: number; max: number;
};

export type ExamResult = {
  examId: string; moduleId: string; courseId: string;
  submittedAt: number;
  answers: QuestionAnswer[];
  sectionScores: SectionScore[];
  totalEarned: number; totalMax: number; percentScore: number;
  passed: boolean; gradeLabel: string; gradeBadge: string;
};
