import { Logo } from "../../ui/Logo";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { listCourses } from "../../curriculum";
import { useAuth } from "../../auth/AuthContext";

type SidebarProps = { open: boolean; onClose: () => void };

function moduleHref(courseId: string, moduleId: string) {
  return `/course/${courseId}/module/${moduleId}`;
}
function lessonHref(courseId: string, lessonId: string) {
  return `/course/${courseId}/lesson/${lessonId}`;
}

function ModuleGroup({
  courseId,
  module: m,
  isOpen,
  onToggle,
  location,
  onClose,
}: {
  courseId: string;
  module: {
    id: string;
    title: string;
    icon: string;
    lessons: { id: string; title: string; contentRef?: { type: string } }[];
    isAvailable: boolean;
  };
  isOpen: boolean;
  onToggle: () => void;
  location: string;
  onClose: () => void;
}) {
  const statusLabel = m.isAvailable ? "Disponível" : "Em breve";
  const statusCls = m.isAvailable ? "sideBadge ok" : "sideBadge soon";

  return (
    <div className={`sideGroup${isOpen ? " sideGroupOpen" : ""}`}>
      <button
        className="sideGroupHeader"
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="sideGroupIcon">{m.icon}</span>
        <span className="sideGroupTitle">{m.title}</span>
        <span className={statusCls}>{statusLabel}</span>
        <span
          className="sideGroupCaret"
          style={{ transform: isOpen ? "rotate(90deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ▸
        </span>
      </button>

      {isOpen && (
        <div className="sideGroupBody">
          {/* Ver todas as aulas do módulo */}
          <Link
            className={[
              "sideSubLink",
              location === moduleHref(courseId, m.id) ? "active" : "",
              !m.isAvailable ? "disabled" : "",
            ].filter(Boolean).join(" ")}
            href={m.isAvailable ? moduleHref(courseId, m.id) : "#"}
            onClick={onClose}
          >
            <span className="sideSubNum" style={{ fontSize: 11 }}>≡</span>
            Ver todas as aulas
          </Link>

          {m.lessons.map((l, idx) => {
            const hasContent = m.isAvailable && l.contentRef?.type === "package";
            return (
              <Link
                key={l.id}
                className={[
                  "sideSubLink",
                  location === lessonHref(courseId, l.id) ? "active" : "",
                  !hasContent ? "disabled" : "",
                ].filter(Boolean).join(" ")}
                href={hasContent ? lessonHref(courseId, l.id) : "#"}
                onClick={onClose}
              >
                <span className="sideSubNum">{idx + 1}</span>
                {l.title}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const [location] = useLocation();
  const { profile, logout } = useAuth();
  const courses = listCourses();
  const course = courses[0];

  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) setOpenModuleId(null);
  }, [open]);

  const items = useMemo(() => {
    if (!course) return [];
    return course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      icon: m.icon ?? "📚",
      lessons: m.lessons,
      isAvailable: m.lessons.some((l) => l.contentRef?.type === "package"),
    }));
  }, [course]);

  return (
    <>
      <div
        className={`overlay${open ? " overlayOpen" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside className={`sidebar${open ? " sidebarOpen" : ""}`} aria-label="Menu de navegação">

        {/* Topo */}
        <div className="sidebarTop">
          <div className="sidebarBrand">
            <Logo variant="nav" />
          </div>
          <button className="iconBtn" onClick={onClose} aria-label="Fechar menu" type="button">
            ✕
          </button>
        </div>

        {/* Perfil */}
        {profile && (
          <div className="sidebarProfile">
            <div className="sidebarAvatar">
              {profile.displayName?.[0]?.toUpperCase() ?? "M"}
            </div>
            <div className="sidebarProfileInfo">
              <div className="sidebarProfileName">{profile.displayName}</div>
              <div className="sidebarProfileEmail">{profile.email}</div>
            </div>
          </div>
        )}

        {/* Navegação rápida */}
        <div className="sidebarQuickNav">
          <div className="sidebarSectionTitle">Navegação</div>
          <Link
            className={`sideLink${location === "/" || location.startsWith("/courses") ? " active" : ""}`}
            href="/courses"
            onClick={onClose}
          >
            🏠 Minha Jornada
          </Link>
          <Link
            className={`sideLink${location.startsWith("/library") ? " active" : ""}`}
            href="/library"
            onClick={onClose}
          >
            📚 Biblioteca
          </Link>
        </div>

        {/* Grade curricular */}
        <div className="sidebarCurricularWrap">
          <div className="sidebarSectionTitle">Grade Curricular</div>
          <div className="sidebarCurricular">
            {items.map((m) => (
              <ModuleGroup
                key={m.id}
                courseId={course.id}
                module={m}
                isOpen={openModuleId === m.id}
                onToggle={() => setOpenModuleId((prev) => (prev === m.id ? null : m.id))}
                location={location}
                onClose={onClose}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebarFooter">
          <button
            className="sideLogoutBtn"
            type="button"
            onClick={async () => { await logout(); }}
          ><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sair da conta
          </button>
          <span className="sidebarVersion">v1.4.0</span>
        </div>
      </aside>
    </>
  );
}
