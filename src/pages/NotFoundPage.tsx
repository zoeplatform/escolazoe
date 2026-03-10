import { Link } from "wouter";

export function NotFoundPage() {
  return (
    <div className="page" style={{ textAlign: "center", paddingTop: 60 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>✦</div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--accent)" }}>404</h1>
      <p className="muted" style={{ marginTop: 8, marginBottom: 24 }}>Página não encontrada.</p>
      <Link href="/courses" className="primaryBtn">
        ← Ir para Cursos
      </Link>
    </div>
  );
}
