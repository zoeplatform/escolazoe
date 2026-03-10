import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "wouter";
import { getCourseById } from "../curriculum";
import { canAccessModule } from "../auth/entitlements";
import { Card, LessonCard } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { getLessonProgress, getModuleProgress, useProgressSnapshot } from "../services/progress/progressService";
import { loadManifest } from "../services/content/contentService";
import { loadExamResult } from "../services/exam/examService";
import { badgeColor, badgeEmoji } from "../services/exam/examService";
import type { ModuleExamRef, ExamResult } from "../services/content/contentTypes";

// ─── ExamCard ─────────────────────────────────────────────────────────────────

function ExamCard({
  examRef,
  examResult,
  allDone,
  examHref,
  completedCount,
  total,
}: {
  examRef: ModuleExamRef;
  examResult: ExamResult | null;
  allDone: boolean;
  examHref: string;
  completedCount: number;
  total: number;
}) {
  // ── Resultado anterior ────────────────────────────────────────────────────
  if (examResult) {
    const color = badgeColor(examResult.gradeBadge);
    const emoji = badgeEmoji(examResult.gradeBadge);
    return (
      <div
        style={{
          background: "var(--panel)",
          border: `1px solid ${color}44`,
          borderRadius: 16,
          padding: "18px 20px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0, top: 0, bottom: 0,
            width: 4,
            background: color,
            borderRadius: "16px 0 0 16px",
          }}
        />
        <div style={{ paddingLeft: 8 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>
                Avaliação Final
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{examRef.title}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color, lineHeight: 1 }}>
                {examResult.percentScore}%
              </div>
              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                {examResult.totalEarned}/{examResult.totalMax} pts
              </div>
            </div>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "4px 12px",
              borderRadius: 999,
              background: `${color}18`,
              border: `1px solid ${color}44`,
              color,
              fontWeight: 700,
              fontSize: 12,
              marginBottom: 14,
            }}
          >
            {emoji} {examResult.gradeLabel}
          </div>

          {/* section breakdown mini */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {examResult.sectionScores.map((s) => (
              <div
                key={s.sectionId}
                style={{
                  flex: 1,
                  minWidth: 70,
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  padding: "6px 10px",
                  textAlign: "center",
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700 }}>{s.earned}/{s.max}</div>
                <div style={{ fontSize: 10, color: "var(--muted)" }}>{s.sectionId}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href={examHref} className="primaryBtn" style={{ flex: 2 }}>
              Ver resultado completo
            </Link>
            <Link href={examHref} className="ghostBtn" style={{ flex: 1 }}>
              Refazer
            </Link>
          </div>

          {examResult.sectionScores.find((s) => s.sectionId === "S4") && (
            <div style={{ marginTop: 10, fontSize: 11, color: "var(--muted)", fontStyle: "italic" }}>
              📝 Seção IV (dissertativas) aguarda revisão do líder. Nota pode ser maior.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Bloqueado (aulas não concluídas) ─────────────────────────────────────
  if (!allDone) {
    return (
      <div
        style={{
          background: "var(--panel)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "18px 20px",
          opacity: 0.7,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: "var(--bg)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
            }}
          >
            🔒
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>
              Avaliação Final — bloqueada
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{examRef.title}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>
              Conclua todas as aulas para liberar ({completedCount}/{total} concluídas)
            </div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{examRef.totalPoints} pts</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>~{examRef.estimatedMinutes} min</div>
          </div>
        </div>

        {/* mini progress */}
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 999, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${Math.round((completedCount / total) * 100)}%`,
                background: "var(--accent)",
                borderRadius: 999,
                transition: "width 0.4s",
              }}
            />
          </div>
          <div style={{ fontSize: 10, color: "var(--muted)", marginTop: 4 }}>
            {completedCount} de {total} aulas concluídas
          </div>
        </div>
      </div>
    );
  }

  // ── Liberado, não feito ainda ─────────────────────────────────────────────
  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--accent-border)",
        borderRadius: 16,
        padding: "18px 20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* accent top bar */}
      <div
        style={{
          position: "absolute",
          left: 0, right: 0, top: 0,
          height: 3,
          background: "linear-gradient(90deg, var(--accent), var(--accent-light, #8393E8))",
          borderRadius: "16px 16px 0 0",
        }}
      />

      <div style={{ paddingTop: 4, display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            flexShrink: 0,
          }}
        >
          📋
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--accent)", textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2, fontWeight: 600 }}>
            Avaliação Final — disponível
          </div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>{examRef.title}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
            {examRef.totalPoints} pontos · aprovação em {examRef.passingScore}% · ~{examRef.estimatedMinutes} min
          </div>
        </div>
      </div>

      {/* question type pills */}
      {examRef.questionTypes && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {Object.entries(examRef.questionTypes).map(([type, meta]) => (
            <span
              key={type}
              style={{
                fontSize: 11,
                padding: "3px 9px",
                borderRadius: 999,
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-border)",
                color: "var(--accent)",
              }}
            >
              {meta.count}× {type.replace("_", " ")} ({meta.points}pts)
            </span>
          ))}
        </div>
      )}

      <Link href={examHref} className="primaryBtn" style={{ display: "block", textAlign: "center" }}>
        Iniciar Avaliação →
      </Link>
    </div>
  );
}

// ─── ModulePage ───────────────────────────────────────────────────────────────

export function ModulePage() {
  const { courseId, moduleId } = useParams() as { courseId: string; moduleId: string };
  const course = getCourseById(courseId);
  const mod = course?.modules.find((m) => m.id === moduleId);
  const isAvailable = !!mod?.lessons.some((l) => l.contentRef?.type === "package");
  const canAccess = mod ? canAccessModule(mod.id) : false;

  const lessonIds = useMemo(() => mod?.lessons.map((l) => l.id) ?? [], [mod]);
  useProgressSnapshot();

  const mp = useMemo(() => {
    if (!course || !mod) return { percent: 0, total: 0, completedCount: 0 };
    return getModuleProgress(course.id, mod.id, lessonIds);
  }, [course, mod, lessonIds]);

  const allLessonsDone = mp.completedCount === mp.total && mp.total > 0;

  // Derive moduleSlug from first package lesson contentRef
  const moduleSlug = useMemo(() => {
    const firstPkg = mod?.lessons.find(
      (l) => l.contentRef.type === "package" && l.contentRef.packageKey
    );
    if (firstPkg?.contentRef.type === "package" && firstPkg.contentRef.packageKey) {
      return firstPkg.contentRef.packageKey.split("/").slice(1).join("/");
    }
    return "";
  }, [mod]);

  // Load manifest to get moduleExam ref
  const [examRef, setExamRef] = useState<ModuleExamRef | null>(null);
  useEffect(() => {
    if (!moduleSlug || !isAvailable) return;
    loadManifest(courseId, moduleSlug)
      .then((m) => setExamRef(m.moduleExam ?? null))
      .catch(() => setExamRef(null));
  }, [courseId, moduleSlug, isAvailable]);

  // Load previous exam result (if any)
  const [examResult, setExamResult] = useState<ExamResult | null>(null);
  useEffect(() => {
    if (!examRef) { setExamResult(null); return; }
    setExamResult(loadExamResult(courseId, examRef.examId));
  }, [courseId, examRef]);

  const examHref = `/course/${courseId}/module/${moduleId}/exam`;

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!course || !mod) {
    return (
      <div className="page">
        <h1>Módulo não encontrado</h1>
        <Link href="/courses" className="linkBtn">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="kicker">{course.title}</div>
        <h1>
          <span style={{ marginRight: 8 }}>{mod.icon ?? "📚"}</span>
          {mod.title}
        </h1>

        <div className="statsGrid" style={{ marginTop: 14, gridTemplateColumns: "repeat(3,1fr)" }}>
          <div className="statCard">
            <div className="statNum">{mp.total}</div>
            <div className="statLabel">Aulas</div>
          </div>
          <div className="statCard">
            <div className="statNum">{mp.completedCount}</div>
            <div className="statLabel">Concluídas</div>
          </div>
          <div className="statCard">
            <div className="statNum">{mp.percent}%</div>
            <div className="statLabel">Progresso</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <ProgressBar value={mp.percent} />
        </div>
      </header>

      {/* Not released yet */}
      {!isAvailable && (
        <Card>
          <div className="cardTitle">Conteúdo em produção</div>
          <p className="muted">Este módulo está na grade, mas ainda não foi liberado no app. Volte em breve.</p>
        </Card>
      )}

      {/* Premium gate */}
      {isAvailable && !canAccess && (
        <Card>
          <div className="cardTitle">Conteúdo premium</div>
          <p className="muted">Este módulo está disponível, mas requer acesso para continuar.</p>
          <div className="cardActions">
            <Link className="primaryBtn" href="/redeem">Desbloquear</Link>
          </div>
        </Card>
      )}

      {/* ── Lesson list ── */}
      <div className="stack">
        {mod.lessons.map((l, idx) => {
          const lp = getLessonProgress(course.id, l.id);
          const completed = !!lp?.completed;
          const percent = lp?.percent ?? 0;

          const sub = completed
            ? "Concluída"
            : percent > 0
            ? `Em andamento · ${percent}%`
            : l.estimatedMinutes
            ? `Não iniciada · ~${l.estimatedMinutes} min`
            : "Não iniciada";

          return (
            <LessonCard
              key={l.id}
              icon={mod.icon}
              title={`${idx + 1}. ${l.title}`}
              sub={sub}
              percent={percent}
              completed={completed}
              href={
                isAvailable && canAccess && l.contentRef?.type === "package"
                  ? `/course/${course.id}/lesson/${l.id}`
                  : undefined
              }
            />
          );
        })}
      </div>

      {/* ── Exam Card — shown below lessons when module has exam ── */}
      {isAvailable && canAccess && examRef && (
        <div style={{ marginTop: 16 }}>
          <ExamCard
            examRef={examRef}
            examResult={examResult}
            allDone={allLessonsDone}
            examHref={examHref}
            completedCount={mp.completedCount}
            total={mp.total}
          />
        </div>
      )}
    </div>
  );
}
