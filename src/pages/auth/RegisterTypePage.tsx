import { LogoAnimada } from "../../ui/LogoAnimada";
import { Link } from "wouter";

export function RegisterTypePage() {
  return (
    <div className="authRoot">
      <div className="authPanel" aria-hidden="true">
        <div className="authPanelInner">
          <div className="authPanelLogo">
            <LogoAnimada variant="auth" />
          </div>
          <blockquote className="authQuote">
            "Ide, portanto, e fazei discípulos de todas as nações."
            <cite>Mateus 28:19</cite>
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
            <p>Selecione o tipo de acesso para prosseguir com seu cadastro.</p>
          </div>

          <div className="authTypeGrid">
            <Link href="/auth/register/individual" className="authTypeCard">
              <span className="authTypeIcon">🧑‍🎓</span>
              <strong>Sou aluno</strong>
              <span>Acesso individual ao conteúdo</span>
            </Link>
            <Link href="/auth/register/institution" className="authTypeCard">
              <span className="authTypeIcon">⛪</span>
              <strong>Sou instituição</strong>
              <span>Igreja ou ministério com múltiplos alunos</span>
            </Link>
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
