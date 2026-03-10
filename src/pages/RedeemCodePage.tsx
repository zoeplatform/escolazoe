import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "../auth/AuthContext";
import { addEntitlement, getInstitutionCodes, hasActivePremium, redeemInstitutionCode } from "../auth/authStorage";
import { Card } from "../ui/Card";

export function RedeemCodePage() {
  const { profile } = useAuth();
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const premium = useMemo(() => hasActivePremium(), []);

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Desbloquear Premium</h1>
        <p className="muted">Digite um código de acesso (individual ou seat institucional) para liberar o conteúdo premium.</p>
      </header>

      <Card>
        <div className="stack">
          <label className="field">
            <span>Código</span>
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="DISC-INS-XXXX-XXXX" />
          </label>

          {premium ? <div className="statusBadge ok">Premium já está ativo</div> : null}
          {msg ? <div className="statusBadge ok">{msg}</div> : null}
          {err ? <div className="errorText">{err}</div> : null}

          <button
            className="primaryBtn"
            type="button"
            onClick={() => {
              setErr(null);
              setMsg(null);

              if (!profile) {
                setErr("Você precisa estar logado.");
                return;
              }

              const c = code.trim();
              if (!c) {
                setErr("Informe o código.");
                return;
              }

              // MVP: only institution seat codes stored locally
              const redeemed = redeemInstitutionCode(c, profile.uid);
              if (!redeemed) {
                setErr("Código inválido ou indisponível.");
                return;
              }

              addEntitlement({
                id: `ent_${Date.now()}`,
                plan: "premium",
                source: "code",
                code: redeemed.code,
                scope: "full",
                active: true,
                startsAt: Date.now(),
              });

              setMsg("Premium ativado com sucesso ✅");
            }}
          >
            Ativar
          </button>

          <div className="muted">
            <Link href="/courses">Voltar</Link>
          </div>
        </div>
      </Card>

      <div style={{ marginTop: 14 }}>
        <details>
          <summary className="muted">Ajuda</summary>
          <div className="muted" style={{ marginTop: 8 }}>
            Para MVP, apenas códigos institucionais (seat) estão simulados localmente. Na versão com Firebase/Cloudflare, o resgate será
            validado no servidor.
          </div>
        </details>
      </div>
    </div>
  );
}
