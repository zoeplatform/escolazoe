import { LogoAnimada } from "../../ui/LogoAnimada";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../auth/AuthContext";
import { ensureInstitutionCodesSeed } from "../../auth/authStorage";

export function RegisterInstitutionPage() {
  const { registerInstitution } = useAuth();
  const [, nav] = useLocation();

  const [institutionName, setInstitutionName] = useState("");
  const [institutionCity, setInstitutionCity] = useState("");
  const [institutionState, setInstitutionState] = useState("");
  const [responsibleName, setResponsibleName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="authRoot">
      <div className="authPanel" aria-hidden="true">
        <div className="authPanelInner">
          <div className="authPanelLogo">
            <LogoAnimada variant="auth" />
          </div>
          <blockquote className="authQuote">
            "Apascentai o rebanho de Deus que está entre vós."
            <cite>1 Pedro 5:2</cite>
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
            <h1>Cadastro institucional</h1>
            <p>Para igrejas e ministérios que desejam escolazoe múltiplos alunos.</p>
          </div>

          <div className="authFields">
            <label className="authField">
              <span className="authFieldLabel">Nome da igreja / ministério</span>
              <input className="authInput" value={institutionName} onChange={(e) => setInstitutionName(e.target.value)} placeholder="Igreja Exemplo" />
            </label>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 80px", gap: 10 }}>
              <label className="authField">
                <span className="authFieldLabel">Cidade</span>
                <input className="authInput" value={institutionCity} onChange={(e) => setInstitutionCity(e.target.value)} placeholder="São Paulo" />
              </label>
              <label className="authField">
                <span className="authFieldLabel">UF</span>
                <input className="authInput" value={institutionState} onChange={(e) => setInstitutionState(e.target.value)} placeholder="SP" />
              </label>
            </div>

            <label className="authField">
              <span className="authFieldLabel">Nome do responsável</span>
              <input className="authInput" value={responsibleName} onChange={(e) => setResponsibleName(e.target.value)} placeholder="Nome completo" />
            </label>

            <label className="authField">
              <span className="authFieldLabel">Email de acesso</span>
              <input className="authInput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="igreja@email.com" autoComplete="email" />
            </label>

            <label className="authField">
              <span className="authFieldLabel">Senha</span>
              <input className="authInput" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" autoComplete="new-password" />
            </label>

            {err && <div className="authAlert danger">{err}</div>}

            <button
              className="authSubmitBtn"
              type="button"
              disabled={busy}
              onClick={async () => {
                try {
                  setBusy(true);
                  setErr(null);
                  if (!institutionName || !institutionCity || !institutionState || !responsibleName || !email || !password) {
                    setErr("Preencha todos os campos obrigatórios.");
                    return;
                  }
                  await registerInstitution({ institutionName, institutionCity, institutionState, responsibleName, email: email.trim(), password });
                  ensureInstitutionCodesSeed(25, `batch_${new Date().toISOString().slice(0, 10)}`);
                  nav("/splash");
                } catch (e: any) {
                  setErr(e?.message ?? "Falha no cadastro");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? <span className="authSpinner" /> : "Criar conta institucional"}
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
