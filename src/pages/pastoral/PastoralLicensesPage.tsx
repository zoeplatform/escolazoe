import { useMemo, useState } from "react";
import { Card } from "../../ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { getInstitutionCodes, setInstitutionCodes } from "../../auth/authStorage";

export function PastoralLicensesPage() {
  const { profile } = useAuth();
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);

  const codes = useMemo(() => {
    void tick;
    const all = getInstitutionCodes();
    const q = query.trim().toUpperCase();
    if (!q) return all;
    return all.filter((c) => c.code.toUpperCase().includes(q) || c.status.toUpperCase().includes(q));
  }, [query, tick]);

  const all = getInstitutionCodes();
  const activeCount = all.filter((c) => c.status === "active").length;
  const usedCount = all.filter((c) => c.status === "redeemed").length;

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Licenças</h1>
        <p className="muted">
          {profile?.institutionName ?? "Instituição"} • gerenciamento de SeatCodes (MVP local)
        </p>
      </header>

      <div className="grid">
        <Card>
          <div className="cardTitle">Resumo</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Disponíveis: <strong>{activeCount}</strong>
            <br />
            Usadas: <strong>{usedCount}</strong>
          </div>
        </Card>

        <Card>
          <div className="cardTitle">Buscar</div>
          <div className="stack" style={{ marginTop: 8 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filtrar por código ou status" />
            <div className="muted">Dica: filtre por “active” ou “redeemed”.</div>
          </div>
        </Card>
      </div>

      <div style={{ marginTop: 14 }} className="stack">
        {codes.map((c) => (
          <Card key={c.code}>
            <div className="rowBetween">
              <div>
                <div className="cardTitle">{c.code}</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  Status: <strong>{c.status}</strong>
                  {c.redeemedAt ? (
                    <>
                      {" "}
                      • usado em {new Date(c.redeemedAt).toLocaleDateString()}
                    </>
                  ) : null}
                </div>
              </div>

              <div className="stack" style={{ alignItems: "flex-end" }}>
                <button
                  className="ghostBtn"
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(c.code);
                    // no toast system yet; keep silent
                  }}
                >
                  Copiar
                </button>

                {c.status === "active" ? (
                  <button
                    className="ghostBtn"
                    type="button"
                    onClick={() => {
                      // MVP revoke locally
                      const all2 = getInstitutionCodes();
                      const idx = all2.findIndex((x) => x.code === c.code);
                      if (idx >= 0) {
                        all2[idx] = { ...all2[idx], status: "revoked" };
                        setInstitutionCodes(all2);
                        setTick((t) => t + 1);
                      }
                    }}
                  >
                    Revogar
                  </button>
                ) : null}
              </div>
            </div>

            <details style={{ marginTop: 10 }}>
              <summary className="muted">QR Code</summary>
              <div className="muted" style={{ marginTop: 8 }}>
                MVP: aqui iremos gerar um QR que abre o app em <code>/redeem?code=...</code>.
                <br />
                Por enquanto, o aluno pode copiar e colar este código na tela “Desbloquear Premium”.
              </div>
            </details>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 18 }}>
        <Card>
          <div className="cardTitle">Comprar mais licenças</div>
          <div className="muted" style={{ marginTop: 8 }}>
            MVP: este botão pode abrir um checkout externo (Hotmart/Pix/Website).
          </div>
          <div className="cardActions">
            <button className="primaryBtn" type="button" disabled>
              Comprar (em breve)
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
