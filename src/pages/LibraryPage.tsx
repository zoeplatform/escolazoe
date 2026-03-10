import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { getCourseById } from "../curriculum";
import { getModuleProgress, useProgressSnapshot } from "../services/progress/progressService";
import { loadPacksIndex, loadManifest } from "../services/content/contentService";

type PackRow = {
  courseId: string;
  moduleSlug: string;
  packId: string;
  path: string;
  moduleTitle?: string;
  version?: string;
  updatedAt?: string;
  lessonsCount?: number;
  passingScore?: number;
  status: "ok" | "error";
  error?: string;
};

export function LibraryPage() {
  useProgressSnapshot();
  const [rows, setRows] = useState<PackRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const idx = await loadPacksIndex();
        const out: PackRow[] = [];
        for (const p of idx.packs) {
          try {
            const m = await loadManifest(p.courseId, p.moduleSlug);
            out.push({
              ...p,
              moduleTitle: m.moduleTitle,
              version: m.version,
              updatedAt: m.updatedAt,
              lessonsCount: m.lessons.length,
              passingScore: m.passingScore,
              status: "ok",
            });
          } catch (e: any) {
            out.push({
              ...p,
              status: "error",
              error: e?.message ?? "Falha ao carregar manifest",
            });
          }
        }
        if (alive) setRows(out);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const course = getCourseById("fundamentos");

  const cards = useMemo(() => {
    return rows.map((r) => {
      const module =
        course?.modules.find((m) => m.title === r.moduleTitle) ??
        course?.modules.find((m) => m.id.includes("M01"));
      const moduleId = module?.id;
      const lessonIds = module?.lessons.map((l) => l.id) ?? [];
      const mp =
        course && moduleId
          ? getModuleProgress(course.id, moduleId, lessonIds)
          : { percent: 0, total: 0, completedCount: 0 };

      return { r, mp, moduleId };
    });
  }, [rows, course]);

  return (
    <div className="page">
      <header className="pageHeader">
        <div className="kicker">Conteúdo local</div>
        <h1>Biblioteca</h1>
        <p className="muted">
          Modulos Iniciados.
        </p>
      </header>

      {loading ? (
        <Card>
          <div className="muted">Carregando packs…</div>
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <div className="muted">Nenhum pack encontrado.</div>
        </Card>
      ) : (
        <div className="grid">
          {cards.map(({ r, mp, moduleId }) => (
            <Card key={`${r.courseId}/${r.moduleSlug}`}>
              <div className="kicker" style={{ marginBottom: 4 }}>{r.courseId}</div>
              <div className="cardTitle">{r.moduleTitle ?? r.moduleSlug}</div>

              {r.status === "ok" ? (
                <>
                  <div className="muted">
                    v{r.version} · {r.lessonsCount} aulas · passing {r.passingScore}%
                  </div>
                  <div className="muted" style={{ marginTop: 4 }}>
                    Atualizado: {r.updatedAt}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <div className="muted" style={{ marginBottom: 8 }}>
                      Progresso: <strong style={{ color: "var(--text)" }}>{mp.percent}%</strong>
                      {" "}· {mp.completedCount}/{mp.total} aulas
                    </div>
                    <ProgressBar value={mp.percent} />
                  </div>

                  <div className="cardActions">
                    {moduleId ? (
                      <Link className="primaryBtn" href={`/course/${r.courseId}/module/${moduleId}`}>
                        Abrir módulo
                      </Link>
                    ) : (
                      <button className="primaryBtn" disabled type="button">
                        Não mapeado
                      </button>
                    )}
                  </div>

                  <details style={{ marginTop: 12 }}>
                    <summary className="muted" style={{ cursor: "pointer", fontSize: 12 }}>
                      Detalhes técnicos
                    </summary>
                    <div className="muted" style={{ marginTop: 8, wordBreak: "break-all", fontSize: 12, fontFamily: "var(--font-mono)" }}>
                      path: /packs/{r.path}<br />
                      packId: {r.packId}
                    </div>
                  </details>
                </>
              ) : (
                <>
                  <div className="muted" style={{ marginTop: 8 }}>Falha ao carregar manifest.</div>
                  <div style={{ marginTop: 6, color: "var(--danger)", fontSize: 13 }}>{r.error}</div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
