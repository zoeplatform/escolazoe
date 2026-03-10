/**
 * examService.ts
 * Scoring engine + localStorage persistence for module exams.
 *
 * Phase 1 auto-scores: multiple_choice, true_false, matching.
 * Essays receive 0 pts — placeholder for future human/AI grading.
 *
 * Storage key: escolazoe.exam.v1:{courseId}:{examId}
 */

import type {
  ExamData,
  ExamQuestion,
  QuestionAnswer,
  SectionScore,
  ExamResult,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
} from "../content/contentTypes";

// ─── Storage ──────────────────────────────────────────────────────────────────

const STORE_PREFIX = "escolazoe.exam.v1";

function storageKey(courseId: string, examId: string): string {
  return `${STORE_PREFIX}:${courseId}:${examId}`;
}

export function saveExamResult(result: ExamResult): void {
  try {
    localStorage.setItem(storageKey(result.courseId, result.examId), JSON.stringify(result));
  } catch {
    console.warn("[examService] Failed to save result to localStorage");
  }
}

export function loadExamResult(courseId: string, examId: string): ExamResult | null {
  try {
    const raw = localStorage.getItem(storageKey(courseId, examId));
    if (!raw) return null;
    return JSON.parse(raw) as ExamResult;
  } catch {
    return null;
  }
}

export function clearExamResult(courseId: string, examId: string): void {
  localStorage.removeItem(storageKey(courseId, examId));
}

// ─── Per-question scoring ─────────────────────────────────────────────────────

function scoreQuestion(q: ExamQuestion, answer: QuestionAnswer): number {
  if (q.type === "multiple_choice") {
    const mc = q as MultipleChoiceQuestion;
    const ans = answer as Extract<QuestionAnswer, { type: "multiple_choice" }>;
    return ans.selected === mc.answerKey.correct ? mc.points : 0;
  }

  if (q.type === "true_false") {
    const tf = q as TrueFalseQuestion;
    const ans = answer as Extract<QuestionAnswer, { type: "true_false" }>;
    return ans.selected === tf.answerKey.correct ? tf.points : 0;
  }

  if (q.type === "matching") {
    const mq = q as MatchingQuestion;
    const ans = answer as Extract<QuestionAnswer, { type: "matching" }>;
    const ppm = mq.answerKey.pointsPerMatch ?? 1;
    let earned = 0;
    for (const [aId, bId] of Object.entries(ans.selected)) {
      if (mq.answerKey.correct[aId] === bId) earned += ppm;
    }
    return Math.min(earned, mq.points);
  }

  // essay: 0 until human/AI grading is implemented
  return 0;
}

// ─── Grade resolution ─────────────────────────────────────────────────────────

function resolveGrade(
  percent: number,
  gradeScale?: Array<{ label: string; minScore: number; maxScore: number; badge: string }>
): { label: string; badge: string } {
  const scale = gradeScale ?? [
    { label: "Aprovado com Distinção", minScore: 90, maxScore: 100, badge: "distinction" },
    { label: "Aprovado com Mérito",    minScore: 80, maxScore: 89,  badge: "merit" },
    { label: "Aprovado",               minScore: 70, maxScore: 79,  badge: "pass" },
    { label: "Recuperação",            minScore: 50, maxScore: 69,  badge: "recovery" },
    { label: "Reprovado",              minScore: 0,  maxScore: 49,  badge: "fail" },
  ];
  const sorted = [...scale].sort((a, b) => b.minScore - a.minScore);
  for (const entry of sorted) {
    if (percent >= entry.minScore) return { label: entry.label, badge: entry.badge };
  }
  return { label: "Reprovado", badge: "fail" };
}

// ─── Main grading function ───────────────────────────────────────────────────

/**
 * Grades an exam submission and returns a complete ExamResult.
 * Call saveExamResult() afterwards to persist.
 */
export function gradeExam(
  exam: ExamData,
  answers: QuestionAnswer[],
  courseId: string,
  moduleId: string
): ExamResult {
  const answerMap = new Map<string, QuestionAnswer>(answers.map((a) => [a.questionId, a]));

  let totalEarned = 0;
  const sectionScores: SectionScore[] = [];

  for (const section of exam.sections) {
    let sectionEarned = 0;
    for (const q of section.questions) {
      const ans = answerMap.get(q.id);
      if (ans) sectionEarned += scoreQuestion(q, ans);
    }
    sectionScores.push({
      sectionId: section.sectionId,
      title: section.title,
      earned: sectionEarned,
      max: section.totalPoints,
    });
    totalEarned += sectionEarned;
  }

  const totalMax = exam.totalPoints;
  const percentScore = Math.round((totalEarned / totalMax) * 100);
  const passed = percentScore >= exam.passingScore;
  const { label, badge } = resolveGrade(percentScore, exam.gradingSchema?.gradeScale);

  return {
    examId: exam.examId,
    moduleId,
    courseId,
    submittedAt: Date.now(),
    answers,
    sectionScores,
    totalEarned,
    totalMax,
    percentScore,
    passed,
    gradeLabel: label,
    gradeBadge: badge,
  };
}

// ─── UI helpers ───────────────────────────────────────────────────────────────

export function badgeColor(badge: string): string {
  switch (badge) {
    case "distinction": return "#8b5cf6";
    case "merit":       return "#3b82f6";
    case "pass":        return "#22c55e";
    case "recovery":    return "#f59e0b";
    case "fail":        return "#ef4444";
    default:            return "var(--muted)";
  }
}

export function badgeEmoji(badge: string): string {
  switch (badge) {
    case "distinction": return "🏆";
    case "merit":       return "⭐";
    case "pass":        return "✅";
    case "recovery":    return "📋";
    case "fail":        return "❌";
    default:            return "📝";
  }
}

export function allLessonsCompleted(
  completionMap: Record<string, boolean>,
  lessonIds: string[]
): boolean {
  return lessonIds.length > 0 && lessonIds.every((id) => completionMap[id] === true);
}
