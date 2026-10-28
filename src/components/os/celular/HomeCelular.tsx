import { useEffect, useState } from 'react';
import type { DadosOS } from '../../../lib/tipos';
import type { AppId, Rota } from '../../../lib/os/tipos';
import { APPS, ICONES } from '../apps/registro';
import { Cracha } from '../../comum/Cracha';
import { Icone } from '../../comum/Icone';

const NOMES: Partial<Record<AppId, string>> = {
  projetos: 'Projetos', sobre: 'Sobre', trajetoria: 'Trajetória', curriculo: 'Currículo',
  certificados: 'Certificados', contato: 'Contato', terminal: 'Terminal', 'neon-burnout': 'Jogar',
};

function horaAgora(): string {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function HomeCelular({ dados, abrir }: { dados: DadosOS; abrir: (rota: Rota) => void }) {
  const [hora, setHora] = useState(horaAgora);
  useEffect(() => {
    const id = window.setInterval(() => setHora(horaAgora()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="cel">
      <p className="cel__status" aria-hidden="true"><span>{hora}</span><span>JGBR11 OS · 5G</span></p>
      <div className="cel__widget"><Cracha site={dados.site} variante="widget" /></div>
      <nav className="cel__apps" aria-label="Apps">
        {ICONES.map((id) => {
          const def = APPS[id];
          if (!def) return null;
          return (
            <button key={id} type="button" className="cel__app" aria-label={`Abrir ${NOMES[id] ?? def.rotulo}`} onClick={() => abrir({ app: id })}>
              <span className="cel__app-icone"><Icone tipo={def.icone} /></span>
              <span className="cel__app-nome">{NOMES[id] ?? def.rotulo}</span>
            </button>
          );
        })}
      </nav>
      <span className="cel__marca" aria-hidden="true"></span>
      <nav className="cel__dock" aria-label="Links">
        <a href={dados.site.contato.github} target="_blank" rel="noopener">GITHUB</a>
        <a href={dados.site.contato.linkedin} target="_blank" rel="noopener">LINKEDIN</a>
        <a href="/rapido/" className="cel__rapido">⚡ RÁPIDO</a>
      </nav>
    </div>
  );
}
