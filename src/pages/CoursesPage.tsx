import { useMemo } from "react";
import { Link } from "wouter";
import { listCourses, getCourseById } from "../curriculum";
import { Card } from "../ui/Card";
import { getCourseProgress, getLessonProgress, useProgressSnapshot } from "../services/progress/progressService";
import { ProgressBar } from "../ui/ProgressBar";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Bom dia";
  if (h >= 12 && h < 18) return "Boa tarde";
  return "Boa noite";
}

export function CoursesPage() {
  useProgressSnapshot();
  const courses = listCourses();

  // Encontra a aula "continuar de onde parou" — última aula em andamento, não concluída
  const resumeLesson = useMemo(() => {
    const course = getCourseById("fundamentos");
    if (!course) return null;

    const allLessons = course.modules.flatMap((m) =>
      m.lessons.map((l) => ({ lesson: l, courseId: course.id }))
    );

    // Preferência: em andamento (percent > 0, não concluída)
    const inProgress = allLessons.find(({ lesson, courseId }) => {
      const lp = getLessonProgress(courseId, lesson.id);
      return lp && lp.percent > 0 && !lp.completed;
    });
    if (inProgress) return inProgress;

    // Fallback: primeira aula não iniciada
    const notStarted = allLessons.find(({ lesson, courseId }) => {
      const lp = getLessonProgress(courseId, lesson.id);
      return !lp || lp.percent === 0;
    });
    return notStarted ?? null;
  });

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="kicker">✦ Fundamentos da Fé Cristã</div>
        <h1>{getGreeting()}, Aluno</h1>
        <p className="muted">Continue sua jornada ou explore um novo módulo.</p>
      </header>

      {/* Card "continuar de onde parou" */}
      {resumeLesson && (
        <div className="resumeCard">
          <div className="resumeCardIcon">📖</div>
          <div className="resumeCardInfo" style={{ flex: 1, minWidth: 0 }}>
            <div className="resumeCardTitle">{resumeLesson.lesson.title}</div>
            <div className="resumeCardSub">
              {(() => {
                const lp = getLessonProgress(resumeLesson.courseId, resumeLesson.lesson.id);
                const percent = lp?.percent ?? 0;
                return percent > 0 ? `Em andamento · ${percent}% lido` : "Ainda não iniciada";
              })()}
            </div>
            {(() => {
              const lp = getLessonProgress(resumeLesson.courseId, resumeLesson.lesson.id);
              const percent = lp?.percent ?? 0;
              return percent > 0 ? (
                <div className="resumeProgress">
                  <div className="resumeProgressFill" style={{ width: `${percent}%` }} />
                </div>
              ) : null;
            })()}
          </div>
          <Link
            className="primaryBtn"
            href={`/course/${resumeLesson.courseId}/lesson/${resumeLesson.lesson.id}`}
          >
            Continuar →
          </Link>
        </div>
      )}

      {/* Cursos */}
      <div className="grid">
        {courses.map((c) => {
          const lessonIds = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
          const p = getCourseProgress(c.id, lessonIds);

          return (
            <Card key={c.id}>
              <div className="kicker" style={{ marginBottom: 4 }}>Curso</div>
              <div className="cardTitle">{c.title}</div>
              <div className="muted">{c.description}</div>

              {/* Stats */}
              <div className="statsGrid" style={{ marginTop: 14 }}>
                <div className="statCard">
                  <div className="statNum">{p.total}</div>
                  <div className="statLabel">Aulas</div>
                </div>
                <div className="statCard">
                  <div className="statNum">{p.completedCount}</div>
                  <div className="statLabel">Concluídas</div>
                </div>
                <div className="statCard">
                  <div className="statNum">{p.percent}%</div>
                  <div className="statLabel">Progresso</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <ProgressBar value={p.percent} />
              </div>

              <div className="cardActions">
                <Link className="primaryBtn" href={`/course/${c.id}`}>
                  Ver módulos
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
