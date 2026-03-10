import { useLocation } from "wouter";

interface LessonRef {
  lessonId: string;
  title: string;
}

interface BottomNavProps {
  courseId: string;
  prev: LessonRef | null;
  next: LessonRef | null;
  currentIndex: number;
  total: number;
}

export function BottomNav({ courseId, prev, next, currentIndex, total }: BottomNavProps) {
  const [, navigate] = useLocation();

  function goTo(lessonId: string) {
    navigate(`/course/${encodeURIComponent(courseId)}/lesson/${encodeURIComponent(lessonId)}`);
  }

  const progress = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <nav className="bottomNav">
      {/* Progress bar */}
      <div className="bottomNav__progressBar">
        <div className="bottomNav__progressFill" style={{ width: `${progress}%` }} />
      </div>

      <div className="bottomNav__inner">
        {/* Prev */}
        <button
          className="bottomNav__btn bottomNav__btn--prev"
          onClick={() => prev && goTo(prev.lessonId)}
          disabled={!prev}
          aria-label={prev ? `Aula anterior: ${prev.title}` : "Primeira aula"}
        >
          <span className="bottomNav__arrow">←</span>
          <span className="bottomNav__label">
            {prev ? prev.title : "—"}
          </span>
        </button>

        {/* Counter */}
        <span className="bottomNav__counter">
          {currentIndex + 1} / {total}
        </span>

        {/* Next */}
        <button
          className="bottomNav__btn bottomNav__btn--next"
          onClick={() => next && goTo(next.lessonId)}
          disabled={!next}
          aria-label={next ? `Próxima aula: ${next.title}` : "Última aula"}
        >
          <span className="bottomNav__label">
            {next ? next.title : "Concluído"}
          </span>
          <span className="bottomNav__arrow">→</span>
        </button>
      </div>
    </nav>
  );
}
