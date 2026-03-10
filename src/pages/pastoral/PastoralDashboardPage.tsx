import { Card } from "../../ui/Card";
import { useAuth } from "../../auth/AuthContext";
import { getInstitutionCodes } from "../../auth/authStorage";

export function PastoralDashboardPage() {
  const { profile } = useAuth();
  const codes = getInstitutionCodes();
  const active = codes.filter((c) => c.status === "active").length;
  const used = codes.filter((c) => c.status === "redeemed").length;

  return (
    <div className="page">
      <header className="pageHeader">
        <h1>Painel Pastoral</h1>
        <p className="muted">
          {profile?.institutionName ?? "Instituição"} • visão geral (MVP)
        </p>
      </header>

      <div className="grid">
        <Card>
          <div className="cardTitle">Licenças</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Disponíveis: <strong>{active}</strong>
            <br />
            Usadas: <strong>{used}</strong>
          </div>
        </Card>

        <Card>
          <div className="cardTitle">Turmas</div>
          <div className="muted" style={{ marginTop: 8 }}>
            Em breve
          </div>
        </Card>
      </div>
    </div>
  );
}
