import { LogoAnimada } from "../../ui/LogoAnimada";
import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../auth/AuthContext";

export function RegisterPage() {
  const { register, authError, profile } = useAuth();
  const [, nav] = useLocation();

  const [displayName, setDisplayName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Navega assim que o perfil estiver disponível após o registro
  useEffect(() => {
    if (profile && busy) {
      nav("/courses");
    }
  }, [profile]);

  async function handleRegister() {
    setErr(null);
    if (!displayName.trim() || !email.trim() || !password) {
      setErr("Nome, email e senha são obrigatórios.");
      return;
    }
    try {
      setBusy(true);
      await register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        birthDate: birthDate || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
      });
      // Navegação acontece no useEffect acima quando profile aparecer
    } catch {
      setBusy(false); // só para o spinner se der erro
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
            "Crescei na graça e no conhecimento de nosso Senhor e Salvador Jesus Cristo."
            <cite>2 Pedro 3:18</cite>
          </blockquote>
          <div className="authPanelDots"><span /><span /><span /></div>
        </div>
      </div>

      <div className="authForm">
        <div className="authFormInner">
          <div className="authMobileLogo">
            <LogoAnimada variant="auth" />
          </div>

          <div className="authHeading">
            <h1>Criar conta</h1>
            <p>Junte-se à comunidade e acesse os cursos de formação cristã.</p>
          </div>

          {(authError || err) && (
            <div className="authAlert danger">{err || authError}</div>
          )}

          <div className="authFields">
            <label className="authField">
              <span className="authFieldLabel">Nome completo *</span>
              <input
                className="authInput"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                autoComplete="name"
              />
            </label>

            <label className="authField">
              <span className="authFieldLabel">Email *</span>
              <input
                className="authInput"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                autoComplete="email"
              />
            </label>

            <label className="authField">
              <span className="authFieldLabel">Senha *</span>
              <input
                className="authInput"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </label>

            {/* Campos opcionais */}
            <label className="authField">
              <span className="authFieldLabel">Data de nascimento</span>
              <input
                className="authInput"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
              <label className="authField">
                <span className="authFieldLabel">Cidade</span>
                <input
                  className="authInput"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="São Paulo"
                />
              </label>
              <label className="authField">
                <span className="authFieldLabel">UF</span>
                <input
                  className="authInput"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="SP"
                  maxLength={2}
                />
              </label>
            </div>

            <button
              className="authSubmitBtn"
              type="button"
              disabled={busy}
              onClick={handleRegister}
            >
              {busy ? <span className="authSpinner" /> : "Criar conta"}
            </button>
          </div>

          <div className="authFooterLinks">
            <span>Já tem conta?</span>
            <Link href="/auth/login" className="authLink">Entrar →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
