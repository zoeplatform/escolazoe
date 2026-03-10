import { useLocation } from "wouter";
import { LogoAnimada } from "../ui/LogoAnimada";
import { Card } from "../ui/Card";
import "../styles/presentation.css";

export function PresentationPage() {
  const [, navigate] = useLocation();

  return (
    <div className="presentationPage">
      {/* Hero Section */}
      <section className="presentationHero">
        <div className="presentationContainer">
          {/* Logo grande */}
          <div className="presentationLogo">
            <LogoAnimada variant="presentation" />
          </div>

          {/* Tagline */}
          <p className="presentationTagline">Aprendizado que transforma</p>

          {/* Descrição */}
          <p className="presentationDescription">
            Uma plataforma moderna de educação cristã, desenvolvida para inspirar e conectar estudantes com conteúdo significativo e transformador.
          </p>

          {/* Botões de ação */}
          <div className="presentationActions">
            <button 
              className="presentationBtn presentationBtnPrimary"
              onClick={() => navigate("/auth/login")}
            >
              Entrar
            </button>
            <button 
              className="presentationBtn presentationBtnSecondary"
              onClick={() => navigate("/auth/register/type")}
            >
              Criar Conta
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="presentationFeatures">
        <div className="presentationContainer">
          <h2>Recursos</h2>
          
          <div className="presentationGrid">
            {/* Feature 1 */}
            <Card>
              <div className="presentationFeatureCard">
                <div className="presentationFeatureIcon">📚</div>
                <h3>Cursos Completos</h3>
                <p>Conteúdo estruturado e progressivo para aprendizado profundo</p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card>
              <div className="presentationFeatureCard">
                <div className="presentationFeatureIcon">📖</div>
                <h3>Leitura Fluida</h3>
                <p>Interface otimizada para leitura confortável em qualquer dispositivo</p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card>
              <div className="presentationFeatureCard">
                <div className="presentationFeatureIcon">✓</div>
                <h3>Progresso Rastreado</h3>
                <p>Acompanhe seu desenvolvimento e conquistas ao longo do tempo</p>
              </div>
            </Card>

            {/* Feature 4 */}
            <Card>
              <div className="presentationFeatureCard">
                <div className="presentationFeatureIcon">🌙</div>
                <h3>Modo Noturno</h3>
                <p>Temas cuidadosamente desenhados para sua comodidade</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="presentationAbout">
        <div className="presentationContainer">
          <h2>Sobre Escola Zoe</h2>
          <p>
            Escola Zoe (Zoe = vida em grego) é uma plataforma dedicada a oferecer educação cristã de qualidade, 
            combinando tecnologia moderna com conteúdo profundo e transformador. 
            Nosso objetivo é criar um espaço seguro e inspirador para aprendizado e crescimento espiritual.
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="presentationCta">
        <div className="presentationContainer">
          <h2>Comece sua jornada</h2>
          <p>Junte-se a milhares de estudantes explorando uma educação que transforma vidas</p>
          <button 
            className="presentationBtn presentationBtnPrimary presentationBtnLarge"
            onClick={() => navigate("/auth/register/type")}
          >
            Criar Conta Grátis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="presentationFooter">
        <div className="presentationContainer">
          <p>&copy; 2026 Escola Zoe. Todos os direitos reservados.</p>
          <div className="presentationFooterLinks">
            <a href="#about">Sobre</a>
            <a href="#contact">Contato</a>
            <a href="#privacy">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
