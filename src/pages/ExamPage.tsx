/**
 * ExamPage.tsx
 * Route: /course/:courseId/module/:moduleId/exam
 *
 * Flow:
 *   1. Load ExamData from pack via contentService
 *   2. Check all lessons complete → if not, redirect to ModulePage
 *   3. If previous result exists → show ResultScreen
 *   4. Otherwise → show exam form section by section
 *   5. On submit → grade → save → show ResultScreen
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { getCourseById } from "../curriculum";
import { loadModuleExam } from "../services/content/contentService";
import {
  gradeExam,
  saveExamResult,
  loadExamResult,
  clearExamResult,
  badgeColor,
  badgeEmoji,
  allLessonsCompleted,
} from "../services/exam/examService";
import { getLessonProgress, useProgressSnapshot } from "../services/progress/progressService";
import type {
  ExamData,
  ExamResult,
  QuestionAnswer,
  ExamSection,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
  EssayQuestion,
} from "../services/content/contentTypes";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function moduleSlugFromId(moduleId: string, courseId: string): string {
  // FND-M01 -> revelacao-escritura (needs manifest lookup ideally)
  // For now: derive from pack index via the curriculum lesson contentRef
  // We use courseId + moduleId to find packageKey from course modules
  const course = getCourseById(courseId);
  const mod = course?.modules.find((m) => m.id === moduleId);
  const firstPackLesson = mod?.lessons.find(
    (l) => l.contentRef.type === "package" && l.contentRef.packageKey
  );
  if (firstPackLesson?.contentRef.type === "package" && firstPackLesson.contentRef.packageKey) {
    // packageKey is like "fundamentos/revelacao-escritura"
    return firstPackLesson.contentRef.packageKey.split("/").slice(1).join("/");
  }
  return "";
}

// ─── Result Screen ────────────────────────────────────────────────────────────

function ResultScreen({
  result,
  exam,
  onRetry,
  moduleHref,
}: {
  result: ExamResult;
  exam: ExamData;
  onRetry: () => void;
  moduleHref: string;
}) {
  const color = badgeColor(result.gradeBadge);
  const emoji = badgeEmoji(result.gradeBadge);
  const date = new Date(result.submittedAt).toLocaleDateString("pt-BR", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      {/* ── Header resultado ── */}
      <div
        style={{
          textAlign: "center",
          padding: "32px 24px 24px",
          marginBottom: 24,
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 20,
        }}
      >
        <div style={{ fontSize: 56, marginBottom: 12 }}>{emoji}</div>
        <div
          style={{
            display: "inline-block",
            padding: "6px 18px",
            borderRadius: 999,
            background: `${color}22`,
            border: `1px solid ${color}55`,
            color,
            fontWeight: 700,
            fontSize: 14,
            marginBottom: 16,
          }}
        >
          {result.gradeLabel}
        </div>
        <div style={{ fontSize: 52, fontWeight: 800, color, lineHeight: 1 }}>
          {result.percentScore}
          <span style={{ fontSize: 24, color: "var(--muted)" }}>%</span>
        </div>
        <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
          {result.totalEarned} de {result.totalMax} pontos · {date}
        </div>
        {result.passed ? (
          <p style={{ marginTop: 16, color: "var(--success)", fontWeight: 600 }}>
            Parabéns! Você concluiu o Módulo 1 — Revelação & Escritura.
          </p>
        ) : (
          <p style={{ marginTop: 16, color: "var(--muted)", fontSize: 14 }}>
            Você precisa de {exam.passingScore}% para aprovação. Revise as aulas e tente novamente.
          </p>
        )}
      </div>

      {/* ── Breakdown por seção ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 15 }}>Resultado por seção</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {result.sectionScores.map((s) => {
            const pct = Math.round((s.earned / s.max) * 100);
            const sec = exam.gradingSchema?.scoreBreakdown?.[s.sectionId];
            return (
              <div
                key={s.sectionId}
                style={{
                  background: "var(--panel)",
                  border: "1px solid var(--border)",
                  borderRadius: 14,
                  padding: "12px 16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.title}</div>
                    {sec && (
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>
                        {sec.questionCount} questões
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: pct >= 70 ? "var(--success)" : "var(--muted)" }}>
                      {s.earned}/{s.max}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{pct}%</div>
                  </div>
                </div>
                {/* progress bar */}
                <div style={{ height: 6, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: pct >= 70 ? "var(--success)" : "#f59e0b",
                      borderRadius: 999,
                      transition: "width 0.6s ease",
                    }}
                  />
                </div>
                {s.sectionId === "S4" && (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>
                    📝 Questões dissertativas serão corrigidas manualmente pelo líder/pastor.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Nota sobre dissertativas ── */}
      <div
        style={{
          background: "var(--accent-dim)",
          border: "1px solid var(--accent-border)",
          borderRadius: 12,
          padding: "12px 16px",
          marginBottom: 24,
          fontSize: 13,
          color: "var(--text)",
        }}
      >
        <strong>Nota:</strong> A Seção IV (Questões Dissertativas, 32 pts) será corrigida pelo seu líder.
        Sua nota final pode ser maior após essa revisão.
      </div>

      {/* ── Ações ── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link href={moduleHref} className="primaryBtn" style={{ flex: 1 }}>
          ← Voltar ao módulo
        </Link>
        <button
          type="button"
          className="ghostBtn"
          style={{ flex: 1 }}
          onClick={onRetry}
        >
          ↺ Refazer avaliação
        </button>
      </div>
    </div>
  );
}

// ─── Section: Multiple Choice ─────────────────────────────────────────────────

function SectionMC({
  section,
  answers,
  onChange,
}: {
  section: ExamSection;
  answers: Record<string, string>;
  onChange: (qId: string, val: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {section.questions.map((q, idx) => {
        const mc = q as MultipleChoiceQuestion;
        const selected = answers[mc.id] ?? "";
        return (
          <div
            key={mc.id}
            style={{
              background: "var(--panel)",
              border: `1px solid ${selected ? "var(--accent-border)" : "var(--border)"}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.5 }}>
              <span style={{ color: "var(--accent)", marginRight: 8 }}>{idx + 1}.</span>
              {mc.question}
              <span
                style={{
                  marginLeft: 10,
                  fontSize: 11,
                  color: "var(--muted)",
                  fontWeight: 400,
                }}
              >
                ({mc.points} pt{mc.points > 1 ? "s" : ""})
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {Object.entries(mc.options).map(([letter, text]) => {
                const isSelected = selected === letter;
                return (
                  <label
                    key={letter}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "10px 14px",
                      borderRadius: 10,
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                      background: isSelected ? "var(--accent-dim)" : "transparent",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <input
                      type="radio"
                      name={mc.id}
                      value={letter}
                      checked={isSelected}
                      onChange={() => onChange(mc.id, letter)}
                      style={{ marginTop: 2, accentColor: "var(--accent)", flexShrink: 0 }}
                    />
                    <span style={{ fontSize: 14, lineHeight: 1.5 }}>
                      <strong style={{ marginRight: 6 }}>{letter})</strong>
                      {text}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section: True/False ──────────────────────────────────────────────────────

function SectionTF({
  section,
  answers,
  onChange,
}: {
  section: ExamSection;
  answers: Record<string, boolean | undefined>;
  onChange: (qId: string, val: boolean) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {section.questions.map((q, idx) => {
        const tf = q as TrueFalseQuestion;
        const selected = answers[tf.id];
        return (
          <div
            key={tf.id}
            style={{
              background: "var(--panel)",
              border: `1px solid ${selected !== undefined ? "var(--accent-border)" : "var(--border)"}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 12, lineHeight: 1.5, fontSize: 14 }}>
              <span style={{ color: "var(--accent)", marginRight: 8 }}>{idx + 1}.</span>
              {tf.statement}
              <span style={{ marginLeft: 10, fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>
                ({tf.points} pt)
              </span>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {([true, false] as const).map((val) => {
                const label = val ? "Verdadeiro" : "Falso";
                const isSelected = selected === val;
                return (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => onChange(tf.id, val)}
                    style={{
                      flex: 1,
                      padding: "10px 0",
                      borderRadius: 10,
                      border: `1px solid ${isSelected ? "var(--accent)" : "var(--border)"}`,
                      background: isSelected ? "var(--accent-dim)" : "transparent",
                      color: isSelected ? "var(--accent)" : "var(--text)",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: 14,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section: Matching ────────────────────────────────────────────────────────

function SectionMatching({
  section,
  answers,
  onChange,
}: {
  section: ExamSection;
  answers: Record<string, Record<string, string>>;
  onChange: (qId: string, aId: string, bId: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {section.questions.map((q) => {
        const mq = q as MatchingQuestion;
        const selected = answers[mq.id] ?? {};
        return (
          <div
            key={mq.id}
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{mq.instruction}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>
              {mq.points} pontos · {mq.answerKey.pointsPerMatch} pt por associação correta
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {mq.columnA.map((itemA) => {
                const selB = selected[itemA.itemId] ?? "";
                return (
                  <div
                    key={itemA.itemId}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        padding: "10px 12px",
                        background: "var(--bg)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {itemA.term}
                    </div>
                    <select
                      value={selB}
                      onChange={(e) => onChange(mq.id, itemA.itemId, e.target.value)}
                      style={{
                        padding: "10px 12px",
                        background: selB ? "var(--accent-dim)" : "var(--bg)",
                        border: `1px solid ${selB ? "var(--accent)" : "var(--border)"}`,
                        borderRadius: 10,
                        color: "var(--text)",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      <option value="">— selecionar —</option>
                      {mq.columnB.map((itemB) => (
                        <option key={itemB.itemId} value={itemB.itemId}>
                          {itemB.definition.length > 60
                            ? itemB.definition.slice(0, 57) + "…"
                            : itemB.definition}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Section: Essay ───────────────────────────────────────────────────────────

function SectionEssay({
  section,
  answers,
  onChange,
}: {
  section: ExamSection;
  answers: Record<string, string>;
  onChange: (qId: string, val: string) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        style={{
          background: "var(--accent-dim)",
          border: "1px solid var(--accent-border)",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 13,
          color: "var(--text)",
        }}
      >
        📝 As questões desta seção serão corrigidas pelo seu líder. Escreva com clareza e precisão.
        Você receberá feedback personalizado após a revisão.
      </div>
      {section.questions.map((q, idx) => {
        const eq = q as EssayQuestion;
        const text = answers[eq.id] ?? "";
        return (
          <div
            key={eq.id}
            style={{
              background: "var(--panel)",
              border: `1px solid ${text ? "var(--accent-border)" : "var(--border)"}`,
              borderRadius: 14,
              padding: "16px 18px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4, lineHeight: 1.5 }}>
              <span style={{ color: "var(--accent)", marginRight: 8 }}>{idx + 1}.</span>
              {eq.question}
            </div>
            <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 12 }}>
              {eq.points} pontos · avaliação por rubrica
            </div>
            {/* Key points reminder */}
            <div
              style={{
                marginBottom: 12,
                padding: "10px 12px",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 12,
                color: "var(--muted)",
              }}
            >
              <strong>Critérios esperados:</strong>{" "}
              {eq.answerKey.keyPoints.slice(0, 3).join(" · ")}
              {eq.answerKey.keyPoints.length > 3 ? " · ..." : ""}
            </div>
            <textarea
              value={text}
              onChange={(e) => onChange(eq.id, e.target.value)}
              placeholder="Escreva sua resposta aqui..."
              rows={6}
              style={{
                width: "100%",
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                color: "var(--text)",
                fontSize: 14,
                padding: "12px",
                resize: "vertical",
                fontFamily: "var(--font-body)",
                lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />
            <div style={{ textAlign: "right", fontSize: 11, color: "var(--muted)", marginTop: 4 }}>
              {text.trim().split(/\s+/).filter(Boolean).length} palavras
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Progress indicator ───────────────────────────────────────────────────────

function ExamProgress({
  answered,
  total,
  currentSection,
  totalSections,
}: {
  answered: number;
  total: number;
  currentSection: number;
  totalSections: number;
}) {
  const pct = total === 0 ? 0 : Math.round((answered / total) * 100);
  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        padding: "10px 0 12px",
        marginBottom: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "var(--muted)",
          marginBottom: 6,
        }}
      >
        <span>
          Seção {currentSection} de {totalSections}
        </span>
        <span>
          {answered}/{total} respondidas ({pct}%)
        </span>
      </div>
      <div style={{ height: 4, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--accent)",
            borderRadius: 999,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ─── Main ExamPage ────────────────────────────────────────────────────────────

export function ExamPage() {
  const { courseId, moduleId } = useParams() as { courseId: string; moduleId: string };
  const [, navigate] = useLocation();

  useProgressSnapshot();
  const course = getCourseById(courseId);
  const mod = course?.modules.find((m) => m.id === moduleId);
  const moduleHref = `/course/${courseId}/module/${moduleId}`;

  // Derive moduleSlug from contentRef of first package lesson
  const moduleSlug = useMemo(() => moduleSlugFromId(moduleId, courseId), [moduleId, courseId]);

  // Check all lessons completed
  const lessonIds = useMemo(() => mod?.lessons.map((l) => l.id) ?? [], [mod]);
  const completionMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const id of lessonIds) {
      map[id] = !!getLessonProgress(courseId, id)?.completed;
    }
    return map;
  }, [courseId, lessonIds]);
  const canTakeExam = allLessonsCompleted(completionMap, lessonIds);

  // Load exam data
  const [exam, setExam] = useState<ExamData | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!moduleSlug) { setLoadErr("Módulo não disponível."); setLoading(false); return; }
    let alive = true;
    loadModuleExam(courseId, moduleSlug)
      .then((d) => { if (alive) { setExam(d); setLoading(false); } })
      .catch((e) => { if (alive) { setLoadErr(e?.message ?? "Erro ao carregar avaliação."); setLoading(false); } });
    return () => { alive = false; };
  }, [courseId, moduleSlug]);

  // Previous result
  const [result, setResult] = useState<ExamResult | null>(() =>
    exam ? loadExamResult(courseId, exam.examId) : null
  );
  useEffect(() => {
    if (exam) setResult(loadExamResult(courseId, exam.examId));
  }, [courseId, exam]);

  // Answer state
  const [mcAnswers, setMcAnswers]       = useState<Record<string, string>>({});
  const [tfAnswers, setTfAnswers]       = useState<Record<string, boolean | undefined>>({});
  const [matchAnswers, setMatchAnswers] = useState<Record<string, Record<string, string>>>({});
  const [essayAnswers, setEssayAnswers] = useState<Record<string, string>>({});

  // Section navigation
  const [sectionIdx, setSectionIdx] = useState(0);

  // Submission guard
  const submittingRef = useRef(false);

  // Redirect if no access
  useEffect(() => {
    if (!loading && !exam && !loadErr) navigate(moduleHref);
  }, [loading, exam, loadErr, navigate, moduleHref]);

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!course || !mod) {
    return (
      <div className="page">
        <h1>Módulo não encontrado</h1>
        <Link href="/courses" className="linkBtn">Ir para Cursos</Link>
      </div>
    );
  }

  if (!canTakeExam) {
    return (
      <div className="page" style={{ maxWidth: 540 }}>
        <div className="pageHeader">
          <div className="kicker">{mod.title}</div>
          <h1>Avaliação Final</h1>
        </div>
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 16,
            padding: "28px 24px",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>
            Conclua todas as aulas primeiro
          </div>
          <p className="muted" style={{ marginBottom: 20, fontSize: 14 }}>
            A avaliação final é liberada quando todas as {lessonIds.length} aulas do módulo
            estiverem marcadas como concluídas.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {lessonIds.map((id) => {
              const done = completionMap[id];
              const lesson = mod.lessons.find((l) => l.id === id);
              return (
                <div
                  key={id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderRadius: 10,
                    background: done ? "rgba(34,197,94,.08)" : "var(--bg)",
                    border: `1px solid ${done ? "rgba(34,197,94,.25)" : "var(--border)"}`,
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: done ? "var(--success)" : "var(--muted)" }}>
                    {done ? "✓" : "○"}
                  </span>
                  <span style={{ color: done ? "var(--success)" : "var(--muted)" }}>
                    {lesson?.title ?? id}
                  </span>
                </div>
              );
            })}
          </div>
          <Link href={moduleHref} className="primaryBtn" style={{ marginTop: 20, display: "block" }}>
            Voltar ao módulo
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Carregando avaliação…</p>
      </div>
    );
  }

  if (loadErr || !exam) {
    return (
      <div className="page">
        <h1>Erro ao carregar avaliação</h1>
        <p className="muted">{loadErr ?? "Avaliação não encontrada."}</p>
        <Link href={moduleHref} className="linkBtn">Voltar</Link>
      </div>
    );
  }

  // ── Show result if exists ─────────────────────────────────────────────────

  if (result) {
    return (
      <ResultScreen
        result={result}
        exam={exam}
        moduleHref={moduleHref}
        onRetry={() => {
          clearExamResult(courseId, exam.examId);
          setResult(null);
          setMcAnswers({});
          setTfAnswers({});
          setMatchAnswers({});
          setEssayAnswers({});
          setSectionIdx(0);
        }}
      />
    );
  }

  // ── Exam form ─────────────────────────────────────────────────────────────

  const sections = exam.sections;
  const currentSection = sections[sectionIdx];

  // Count answered questions across all sections
  const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
  const answeredCount =
    Object.keys(mcAnswers).length +
    Object.values(tfAnswers).filter((v) => v !== undefined).length +
    Object.keys(matchAnswers).length +
    Object.keys(essayAnswers).filter((k) => essayAnswers[k].trim().length > 0).length;

  function handleSubmit() {
    if (submittingRef.current || !exam) return;
    submittingRef.current = true;

    const answers: QuestionAnswer[] = [];

    for (const [qId, val] of Object.entries(mcAnswers)) {
      answers.push({ questionId: qId, type: "multiple_choice", selected: val });
    }
    for (const [qId, val] of Object.entries(tfAnswers)) {
      if (val !== undefined) {
        answers.push({ questionId: qId, type: "true_false", selected: val });
      }
    }
    for (const [qId, val] of Object.entries(matchAnswers)) {
      answers.push({ questionId: qId, type: "matching", selected: val });
    }
    for (const [qId, val] of Object.entries(essayAnswers)) {
      if (val.trim()) answers.push({ questionId: qId, type: "essay", text: val });
    }

    const graded = gradeExam(exam, answers, courseId, moduleId);
    saveExamResult(graded);
    setResult(graded);
    window.scrollTo({ top: 0, behavior: "smooth" });
    submittingRef.current = false;
  }

  // Section renderer
  function renderSection(s: ExamSection) {
    switch (s.sectionId) {
      case "S1":
        return (
          <SectionMC
            section={s}
            answers={mcAnswers}
            onChange={(id, val) => setMcAnswers((p) => ({ ...p, [id]: val }))}
          />
        );
      case "S2":
        return (
          <SectionTF
            section={s}
            answers={tfAnswers}
            onChange={(id, val) => setTfAnswers((p) => ({ ...p, [id]: val }))}
          />
        );
      case "S3":
        return (
          <SectionMatching
            section={s}
            answers={matchAnswers}
            onChange={(qId, aId, bId) =>
              setMatchAnswers((p) => ({
                ...p,
                [qId]: { ...(p[qId] ?? {}), [aId]: bId },
              }))
            }
          />
        );
      case "S4":
        return (
          <SectionEssay
            section={s}
            answers={essayAnswers}
            onChange={(id, val) => setEssayAnswers((p) => ({ ...p, [id]: val }))}
          />
        );
      default:
        return null;
    }
  }

  const isLastSection = sectionIdx === sections.length - 1;

  return (
    <div className="page" style={{ maxWidth: 720 }}>
      {/* Header */}
      <div className="pageHeader">
        <div className="kicker">{mod.title}</div>
        <h1 style={{ fontSize: 22, marginBottom: 4 }}>{exam.title}</h1>
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          {exam.totalPoints} pontos · aprovação em {exam.passingScore}% · ~{exam.estimatedMinutes} min
        </div>
      </div>

      {/* Instructions — only on first section */}
      {sectionIdx === 0 && (
        <div
          style={{
            background: "var(--panel)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "14px 18px",
            marginBottom: 24,
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--muted)",
          }}
        >
          {exam.instructions}
        </div>
      )}

      {/* Progress bar */}
      <ExamProgress
        answered={answeredCount}
        total={totalQuestions}
        currentSection={sectionIdx + 1}
        totalSections={sections.length}
      />

      {/* Section tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {sections.map((s, i) => (
          <button
            key={s.sectionId}
            type="button"
            onClick={() => setSectionIdx(i)}
            style={{
              padding: "8px 14px",
              borderRadius: 10,
              border: `1px solid ${i === sectionIdx ? "var(--accent)" : "var(--border)"}`,
              background: i === sectionIdx ? "var(--accent-dim)" : "transparent",
              color: i === sectionIdx ? "var(--accent)" : "var(--muted)",
              fontWeight: i === sectionIdx ? 700 : 500,
              fontSize: 13,
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {s.sectionId} · {s.totalPoints}pts
          </button>
        ))}
      </div>

      {/* Section header */}
      <div
        style={{
          marginBottom: 20,
          padding: "14px 18px",
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 14,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{currentSection.title}</div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{currentSection.description}</div>
      </div>

      {/* Section questions */}
      {renderSection(currentSection)}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap" }}>
        {sectionIdx > 0 && (
          <button
            type="button"
            className="ghostBtn"
            style={{ flex: 1 }}
            onClick={() => { setSectionIdx((i) => i - 1); window.scrollTo({ top: 0 }); }}
          >
            ← Seção anterior
          </button>
        )}

        {!isLastSection ? (
          <button
            type="button"
            className="primaryBtn"
            style={{ flex: 2 }}
            onClick={() => { setSectionIdx((i) => i + 1); window.scrollTo({ top: 0 }); }}
          >
            Próxima seção →
          </button>
        ) : (
          <button
            type="button"
            className="primaryBtn"
            style={{ flex: 2, background: "var(--success, #22c55e)" }}
            onClick={handleSubmit}
          >
            ✓ Enviar avaliação
          </button>
        )}
      </div>

      <div style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 12 }}>
        Você pode navegar entre seções antes de enviar. Suas respostas são salvas automaticamente.
      </div>
    </div>
  );
}
