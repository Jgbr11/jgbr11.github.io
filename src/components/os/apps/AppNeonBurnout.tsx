import { useEffect, useRef, useState } from 'react';
import type { PropsApp } from './registro';

const LIMITE_MS = 10_000;

export function AppNeonBurnout({ dados }: PropsApp) {
  const projeto = dados.projetos.find((p) => p.slug === 'neon-burnout');
  const [jogando, setJogando] = useState(false);
  const [demorou, setDemorou] = useState(false);
  const carregou = useRef(false);

  useEffect(() => {
    if (!jogando) return;
    const t = window.setTimeout(() => { if (!carregou.current) setDemorou(true); }, LIMITE_MS);
    return () => window.clearTimeout(t);
  }, [jogando]);

  if (!projeto?.embedJogo || !projeto.links.jogar) return <p>Jogo indisponível.</p>;

  return (
    <div className="app-jogo">
      {jogando ? (
        <iframe
          title="Neon Burnout (jogo)"
          src={projeto.embedJogo}
          allow="autoplay; fullscreen *"
          allowFullScreen
          onLoad={() => { carregou.current = true; setDemorou(false); }}
        />
      ) : (
        <div className="app-jogo__capa">
          <p className="app-jogo__titulo">NEON BURNOUT</p>
          <p>RPG roguelike de turno · beta · JavaScript puro</p>
          <button type="button" className="btn" onClick={() => setJogando(true)}>▶ JOGAR</button>
          <p className="app-jogo__nota">O jogo carrega do itch.io.</p>
        </div>
      )}
      {demorou && (
        <p role="status" className="app-jogo__nota">O jogo está demorando para carregar. Tente pelo link abaixo.</p>
      )}
      <p className="app-acoes">
        <a className="btn btn--contorno" href={projeto.links.jogar} target="_blank" rel="noopener">ABRIR NO ITCH.IO ↗</a>
      </p>
    </div>
  );
}
