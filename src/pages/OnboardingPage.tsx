import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { LogoAnimada, BRAND_TAGLINE } from "../ui/LogoAnimada";

const ONBOARDING_KEY = "escolazoe_onboarding_done";

const SLIDES = [
  {
    fase: "01",
    titulo: "Despertar",
    subtitulo: "para as Escrituras",
    texto:
      "Escola Zoe é um convite a abrir — os olhos para ver, os ouvidos para ouvir, a mente para compreender a Palavra de Deus.",
    ref: "Lucas 24.45",
  },
  {
    fase: "02",
    titulo: "Fundamentos",
    subtitulo: "da Fé Cristã",
    texto:
      "Estude a Palavra com profundidade e método. Cada módulo foi construído para levar você da pergunta à convicção, da leitura à transformação.",
    ref: "2 Timóteo 3.16-17",
  },
  {
    fase: "03",
    titulo: "Sua jornada",
    subtitulo: "começa agora",
    texto:
      "Entre na sua conta ou crie uma nova para iniciar o discipulado. O caminho está aberto — um dia, uma aula, uma escritura de cada vez.",
    ref: "Salmos 119.105",
  },
];

export function OnboardingPage() {
  const [, nav] = useLocation();
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<"in" | "out">("in");
  const touchStartX = useRef<number | null>(null);

  const isLast = slide === SLIDES.length - 1;
  const current = SLIDES[slide];

  function goTo(next: number) {
    if (animating) return;
    setAnimating(true);
    setDirection("out");
    setTimeout(() => {
      setSlide(next);
      setDirection("in");
      setTimeout(() => setAnimating(false), 400);
    }, 280);
  }

  function avancar() {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, "1");
      nav("/auth/login");
    } else {
      goTo(slide + 1);
    }
  }

  function pular() {
    localStorage.setItem(ONBOARDING_KEY, "1");
    nav("/auth/login");
  }

  // Swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 48) {
      if (dx > 0 && !isLast) goTo(slide + 1);
      if (dx < 0 && slide > 0) goTo(slide - 1);
    }
    touchStartX.current = null;
  }

  return (
    <div
      className="onboardRoot"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Fundo atmosférico */}
      <div className="onboardBg" aria-hidden="true">
        <div className="onboardBgGlow" />
        <div className="onboardBgGrid" />
        <div className="onboardBgVignette" />
      </div>

      {/* Header */}
      <header className="onboardHeader">
        <LogoAnimada variant="onboarding" iconOnly textOnly={false} />
        <button
          className="onboardSkip"
          type="button"
          onClick={pular}
          aria-label="Pular introdução"
        >
          Pular
        </button>
      </header>

      {/* Conteúdo do slide */}
      <main className="onboardMain">
        <div
          className={`onboardSlide onboardSlide--${direction}`}
          key={slide}
        >
          {/* Número da fase */}
          <div className="onboardFase" aria-hidden="true">
            {current.fase}
          </div>

          {/* Título */}
          <h1 className="onboardTitulo">
            {current.titulo}
            <br />
            <em className="onboardSubtitulo">{current.subtitulo}</em>
          </h1>

          {/* Linha decorativa */}
          <div className="onboardDivider" aria-hidden="true" />

          {/* Texto */}
          <p className="onboardTexto">{current.texto}</p>

          {/* Referência bíblica */}
          <span className="onboardRef">{current.ref}</span>
        </div>
      </main>

      {/* Rodapé: dots + botão */}
      <footer className="onboardFooter">
        {/* Dots de progresso */}
        <nav className="onboardDots" aria-label="Progresso do onboarding">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              className={`onboardDot${i === slide ? " onboardDot--active" : ""}`}
              onClick={() => i !== slide && goTo(i)}
              aria-label={`Ir para slide ${i + 1}`}
              aria-current={i === slide ? "step" : undefined}
            />
          ))}
        </nav>

        {/* Botão principal */}
        <button
          className="onboardBtn"
          type="button"
          onClick={avancar}
          aria-label={isLast ? "Começar" : "Próximo slide"}
        >
          <span>{isLast ? "Começar" : "Continuar"}</span>
          <span className="onboardBtnArrow" aria-hidden="true">→</span>
        </button>

        {/* Tagline */}
        <p className="onboardTagline" aria-hidden="true">
          {BRAND_TAGLINE}
        </p>
      </footer>
    </div>
  );
}
