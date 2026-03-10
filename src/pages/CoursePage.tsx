import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { getCourseById } from "../curriculum";
import { canAccessModule } from "../auth/entitlements";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { getCourseProgress, getModuleProgress, resetCourseProgress, useProgressSnapshot } from "../services/progress/progressService";

function moduleHref(courseId: string, moduleId: string) {
  return `/course/${courseId}/module/${moduleId}`;
}

export function CoursePage() {
  const { courseId } = useParams() as { courseId: string };
  const course = getCourseById(courseId);
  useProgressSnapshot();

  const lessonIds = useMemo(() => {
    if (!course) return [];
    return course.modules.flatMap((m) => m.lessons.map((l) => l.id));
  }, [course]);

  const progress = useMemo(() => {
    if (!course) return { total: 0, completedCount: 0, percent: 0 };
    return getCourseProgress(course.id, lessonIds);
  }, [course, lessonIds]);

  if (!course) {
    return (
      <div className="page">
        <h1>Curso não encontrado</h1>
        <Link href="/courses" className="linkBtn">Voltar</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="kicker">Curso</div>
        <h1>{course.title}</h1>
        <p className="muted">{course.description}</p>

        {/* Stats globais */}
        <div className="statsGrid" style={{ marginTop: 16 }}>
          <div className="statCard">
            <div className="statNum">{progress.total}</div>
            <div className="statLabel">Aulas</div>
          </div>
          <div className="statCard">
            <div className="statNum">{progress.completedCount}</div>
            <div className="statLabel">Concluídas</div>
          </div>
          <div className="statCard">
            <div className="statNum">{progress.percent}%</div>
            <div className="statLabel">Progresso</div>
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <ProgressBar value={progress.percent} />
        </div>
      </header>

      <div className="grid">
        {course.modules.map((m) => {
          const mp = getModuleProgress(course.id, m.id, m.lessons.map((l) => l.id));

          const isAvailable = m.lessons.some((l) => l.contentRef?.type === "package");
          const canAccess = canAccessModule(m.id);

          return (
            <Card key={m.id}>
              <div className="kicker" style={{ marginBottom: 4 }}>Módulo {m.order}</div>
              <div className="cardTitle">
                <span style={{ marginRight: 8 }}>{m.icon ?? "📚"}</span>
                {m.title}
              </div>
              <div className="muted">
                {m.lessons.length} aulas · {mp.completedCount}/{mp.total} concluídas
              </div>

              {!canAccess && isAvailable ? (
                <div style={{ marginTop: 10 }}>
                  <Link className="ghostBtn" href={"/redeem"}>
                    Desbloquear Premium
                  </Link>
                </div>
              ) : null}

              <div style={{ marginTop: 12 }}>
                <ProgressBar value={mp.percent} />
              </div>

              <div className="cardActions">
                {m.lessons.length && isAvailable && canAccess ? (
                  <Link className="primaryBtn" href={moduleHref(course.id, m.id)}>
                    Ver aulas
                  </Link>
                ) : (
                  <button className="primaryBtn" disabled type="button">
                    Em breve
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Botão dev: apenas em modo desenvolvimento */}
      {import.meta.env.DEV && (
        <div style={{ marginTop: 24 }}>
          <button
            className="dangerBtn"
            type="button"
            onClick={() => {
              resetCourseProgress(course.id);
            }}
          >
            ⚙ Resetar progresso
          </button>
        </div>
      )}
    </div>
  );
}
