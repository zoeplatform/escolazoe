import { ReactNode, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { Sidebar } from "./Sidebar";
import { HeaderBar } from "./HeaderBar";
import { useTheme } from "../../context/ThemeContext";
import { ToastContainer } from "../../ui/Toast";

export function AppShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [location] = useLocation();
  const { theme } = useTheme();

  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollRef = useRef(0);

  const isLesson = /^\/course\/[^/]+\/lesson\/[^/]+$/.test(location);

  useEffect(() => {
    if (!(isLesson && theme === "reading")) {
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
  }, [isLesson, theme]);

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

      <ToastContainer />
    </div>
  );
}
