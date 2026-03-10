import { LogoAnimada } from "../ui/LogoAnimada";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../auth/AuthContext";
import { Card } from "../ui/Card";

export function SplashPage() {
  const { booting, isAuthed } = useAuth();
  const [, nav] = useLocation();

  useEffect(() => {
    if (booting) return;
    if (!isAuthed) nav("/auth/login");
    else nav("/courses");
  }, [booting, isAuthed, nav]);

  return (
    <div className="page centerPage">
      <LogoAnimada variant="splash" />
      <Card>
        <div className="muted">{booting ? "Carregando…" : "Redirecionando…"}</div>
      </Card>
    </div>
  );
}