import { LogoAnimada } from "../../ui/LogoAnimada";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../auth/AuthContext";

export function LoginPage() {
  const { login, authError, profile, booting } = useAuth();
  const [, nav] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loginAttempted, setLoginAttempted] = useState(false);

  // Navega assim que o perfil estiver disponível após o login
  useEffect(() => {
    if (loginAttempted && !booting && profile) {
      nav("/splash");
    }
  }, [loginAttempted, booting, profile, nav]);

  async function handleLogin() {
    if (!email.trim() || !password) return;
    try {
      setBusy(true);
      await login(email.trim(), password);
      setLoginAttempted(true);
    } catch {
      // erro já em authError
      setBusy(false);
    }
  }

  return (
    <div className="authRoot">
      <div className="authPanel" aria-hidden="true">
        <div className="authPanelInner">
          <div className="authPanelLogo">
            <LogoAnimada variant="auth" />
          </div>
          <blockquote className="authQuote">
            "A Palavra de Deus é viva e eficaz, e mais cortante do que qualquer espada de dois gumes."
            <cite>Hebreus 4:12</cite>
          </blockquote>
          <div className="authPanelDots">
            <span /><span /><span />
          </div>
        </div>
      </div>

      <div className="authForm">
        <div className="authFormInner">
          <div className="authMobileLogo">
            <LogoAnimada variant="auth" />
          </div>

          <div className="authHeading">
            <h1>Bem-vindo de volta</h1>
            <p>Entre com seu email e senha para continuar sua jornada.</p>
          </div>

          {authError && (
            <div className="authAlert danger">{authError}</div>
          )}

          <div className="authFields">
            <label className="authField">
              <span className="authFieldLabel">Email</span>
              <input
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </label>

            <label className="authField">
              <span className="authFieldLabel">Senha</span>
              <div className="authInputWrap">
                <input
                  className="authInput"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                />
                <button
                  type="button"
                  className="authInputToggle"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPass ? "🙈" : "👁"}
                </button>
              </div>
            </label>

            <button
              className="authSubmitBtn"
              type="button"
              disabled={busy}
              onClick={handleLogin}
            >
              {busy ? <span className="authSpinner" /> : "Entrar"}
            </button>
          </div>

          <div className="authFooterLinks">
            <span>Não tem conta?</span>
            <Link href="/auth/register" className="authLink">
              Criar conta →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
