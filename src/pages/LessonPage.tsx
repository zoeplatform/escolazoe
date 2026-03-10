import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "wouter";
import { getCourseById, getLessonById, getLessonNav } from "../curriculum";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import {
  getLessonProgress,
  setLessonCompleted,
  bumpLessonPercent,
  useProgressSnapshot,
} from "../services/progress/progressService";
import { MarkdownRenderer } from "../ui/MarkdownRenderer";
import { loadMarkdownFromContentRef } from "../services/content/contentService";
import { showToast } from "../ui/Toast";
import type { Lesson } from "../domain/types";

function computeScrollPercent(): number {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop || 0;
  const scrollHeight = doc.scrollHeight || 0;
  const clientHeight = doc.clientHeight || 0;
  return Math.round((scrollTop / Math.max(1, scrollHeight - clientHeight)) * 100);
}

async function loadLessonContent(courseId: string, lesson: Lesson): Promise<string> {
  if (lesson.contentRef.type !== "package") {
    return `# ${lesson.title}\n\nEste conteúdo ainda não foi liberado no app (módulo em produção).\n`;
  }
  return await loadMarkdownFromContentRef(lesson.contentRef);
}

export function LessonPage() {
  const { courseId, lessonId } = useParams() as { courseId: string; lessonId: string };
  const course = getCourseById(courseId);
  const lesson = course ? getLessonById(course, lessonId) : undefined;

  const [md, setMd] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const justCompletedRef = useRef(false);
  useProgressSnapshot();

  const nav = useMemo(() => {
    if (!course) return { prev: undefined, next: undefined, index: -1, total: 0 };
    return getLessonNav(course, lessonId);
  }, [course, lessonId]);

  const lp = useMemo(() => {
    if (!course) return undefined;
    return getLessonProgress(course.id, lessonId);
  }, [course, lessonId]);

  // Carrega conteúdo
  useEffect(() => {
    if (!course || !lesson) return;
    let alive = true;
    setLoading(true);
    setLoadErr(null);
    justCompletedRef.current = false;

    (async () => {
      try {
        const content = await loadLessonContent(course.id, lesson);
        if (alive) setMd(content);
      } catch (e: any) {
        if (alive) {
          setLoadErr(e?.message ?? "Falha ao carregar conteúdo");
          setMd(`# ${lesson.title}\n\nFalha ao carregar conteúdo.\n`);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [course?.id, lesson?.id]);

  // Progresso por scroll + auto-complete em 85%
  useEffect(() => {
    if (!course || !lesson) return;
    let raf = 0;

    function onScroll() {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const p = computeScrollPercent();
        bumpLessonPercent(course.id, lesson.id, p);

        if (p >= 85 && !justCompletedRef.current) {
          const wasCompleted = getLessonProgress(course.id, lesson.id)?.completed;
          if (!wasCompleted) {
            setLessonCompleted(course.id, lesson.id, true);
            justCompletedRef.current = true;
            showToast("Aula concluída!", "✓");
          }
        }

      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("scroll", onScroll); };
  }, [course?.id, lesson?.id]);

  if (!course || !lesson) {
    return (
      <div className="page">
        <h1>Aula não encontrada</h1>
        <p className="muted">Verifique o link.</p>
        <Link href="/courses" className="linkBtn">Ir para Cursos</Link>
      </div>
    );
  }

  const completed = !!lp?.completed;
  const percent = lp?.percent ?? 0;

  // Encontra o módulo desta aula para o ícone
  const parentModule = course.modules.find((m) =>
    m.lessons.some((l) => l.id === lessonId)
  );

  return (
    <div className="readerPage">

      {/* ── Header da aula ── */}
      <div className="readerHeader">
        <div className="readerKicker">
          {parentModule?.title ?? course.title} · Aula {nav.index + 1} de {nav.total}
        </div>
        <h1 className="readerTitle">{lesson.title}</h1>
        <div className="readerBar" />

        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
          {lesson.estimatedMinutes && (
            <span className="muted" style={{ fontSize: 13 }}>
              ⏱ ~{lesson.estimatedMinutes} min de leitura
            </span>
          )}
          {completed && (
            <span
              style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                fontSize: 12, fontWeight: 600,
                color: "var(--success)",
                background: "var(--success-dim)",
                border: "1px solid rgba(34,197,94,.25)",
                borderRadius: 999, padding: "4px 10px",
              }}
            >
              ✓ Concluída
            </span>
          )}
        </div>

        {loading && <p className="muted" style={{ marginTop: 8, fontSize: 13 }}>Carregando conteúdo…</p>}
        {loadErr && <p style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>Erro ao carregar conteúdo.</p>}
      </div>

      {/* ── Progresso — card simples no fluxo da página, SEM sticky ── */}
      <div className="lessonProgressCard">
        <div className="lessonProgressCardRow">
          <span className="lessonProgressCardLabel">Progresso da aula</span>
          <span className="lessonProgressCardPct">{percent}%</span>
        </div>
        <div style={{ margin: "8px 0 12px" }}>
          <ProgressBar value={percent} />
        </div>
        <div className="lessonProgressCardActions">
          {!completed ? (
            <button
              className="primaryBtn"
              style={{ flex: 1 }}
              type="button"
              onClick={() => {
                setLessonCompleted(course.id, lesson.id, true);
                bumpLessonPercent(course.id, lesson.id, 100);
                justCompletedRef.current = true;
                        showToast("Aula concluída!", "✓");
              }}
            >
              ✓ Marcar como concluída
            </button>
          ) : (
            <>
              <span className="lessonCompletedBadge">✓ Concluída</span>
              <button
                className="ghostBtn"
                type="button"
                onClick={() => {
                  bumpLessonPercent(course.id, lesson.id, 0);
                  setLessonCompleted(course.id, lesson.id, false);
                  justCompletedRef.current = false;
                            window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                ↺ Reler desde o início
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Conteúdo estruturado em seções ── */}
      {!loading && (
        <MarkdownRenderer markdown={md} />
      )}
    </div>
  );
}
