import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { BottomNav } from "./BottomNav";
import { getCourseById, getLessonNav, listCourses } from "../../curriculum";
import { HeaderBar } from "./HeaderBar";
import { useTheme } from "../../context/ThemeContext";
import { ToastContainer } from "../../ui/Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { theme } = useTheme();

  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollRef = useRef(0);

  const routeInfo = useMemo(() => {
    const lessonMatch = location.match(/^\/course\/([^/]+)\/lesson\/([^/]+)$/);
    if (lessonMatch) {
      const courseId = decodeURIComponent(lessonMatch[1]);
      const lessonId = decodeURIComponent(lessonMatch[2]);
      const course = getCourseById(courseId);
      if (course) {
        const nav = getLessonNav(course, lessonId);
        return { type: "lesson" as const, course, lessonId, nav };
      }
    }

    const courseMatch = location.match(/^\/course\/([^/]+)(?:\/)?$/);
    if (courseMatch) {
      const courseId = decodeURIComponent(courseMatch[1]);
      const course = getCourseById(courseId);
      if (course) return { type: "course" as const, course };
    }

    const first = listCourses()[0];
    return first ? { type: "default" as const, course: first } : { type: "other" as const };
  }, [location]);

  useEffect(() => {
    if (!(routeInfo.type === "lesson" && theme === "reading")) {
      setHeaderHidden(false);
      return;
    }

    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const last = lastScrollRef.current;
      const delta = y - last;
      if (delta > 12 && y > 80) setHeaderHidden(true);
      if (delta < -12) setHeaderHidden(false);
      lastScrollRef.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [routeInfo.type, theme]);


  const isLesson = routeInfo.type === "lesson";
  const lessonNav = isLesson ? routeInfo.nav : undefined;
  const lessonCourseId = isLesson ? routeInfo.course.id : undefined;

  return (
    <div className="appRoot">
      <HeaderBar onMenuToggle={() => setSidebarOpen(true)} hidden={headerHidden} />

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className={`contentScroll${theme === "reading" ? " readingMode" : ""}`}>
        {children}
      </main>

      {isLesson && lessonCourseId && lessonNav && (
        <BottomNav
          courseId={lessonCourseId}
          prev={lessonNav.prev}
          next={lessonNav.next}
          currentIndex={lessonNav.index}
          total={lessonNav.total}
        />
      )}

      <ToastContainer />
    </div>
  );
}
