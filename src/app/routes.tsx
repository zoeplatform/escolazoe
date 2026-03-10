import { useEffect } from "react";
import { OnboardingPage } from "../pages/OnboardingPage";
import { Route, Switch, useLocation } from "wouter";
import { AppShell } from "./shell/AppShell";
import { CoursesPage } from "../pages/CoursesPage";
import { LibraryPage } from "../pages/library/LibraryPage";
import { BookPage } from "../pages/library/BookPage";
import { ChapterReaderPage } from "../pages/library/ChapterReaderPage";
import { CoursePage } from "../pages/CoursePage";
import { ModulePage } from "../pages/ModulePage";
import { LessonPage } from "../pages/LessonPage";
import { ExamPage } from "../pages/ExamPage";
import { SplashPage } from "../pages/SplashPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { AuthGuard } from "../auth/guards";
import { useAuth } from "../auth/AuthContext";

function RootRedirect() {
  const { profile, booting } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (booting) return;
    navigate(profile ? "/courses" : "/presentation");
  }, [profile, booting, navigate]);

  return null;
}

export function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRedirect} />

      {/* Páginas públicas */}
      <Route path="/presentation" component={OnboardingPage} />
      <Route path="/splash" component={SplashPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />

      {/* Páginas protegidas */}
      <Route>
        <AuthGuard>
          <AppShell>
            <Switch>
              <Route path="/courses" component={CoursesPage} />

              {/* ── Biblioteca ──────────────────────────────── */}
              <Route path="/library" component={LibraryPage} />
              {/* chapter ANTES de book para evitar conflito de params */}
              <Route path="/library/:bookId/chapter/:chapterId" component={ChapterReaderPage} />
              <Route path="/library/:bookId" component={BookPage} />

              {/* ── Currículo ───────────────────────────────── */}
              <Route path="/course/:courseId" component={CoursePage} />
              {/* EXAM — must come before /module/:moduleId to avoid conflict */}
              <Route path="/course/:courseId/module/:moduleId/exam" component={ExamPage} />
              <Route path="/course/:courseId/module/:moduleId" component={ModulePage} />
              <Route path="/course/:courseId/lesson/:lessonId" component={LessonPage} />

              <Route component={NotFoundPage} />
            </Switch>
          </AppShell>
        </AuthGuard>
      </Route>

      <Route component={NotFoundPage} />
    </Switch>
  );
}
