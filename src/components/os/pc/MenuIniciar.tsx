import { useEffect, useRef } from 'react';
import type { Site } from '../../../lib/tipos';
import type { Rota } from '../../../lib/os/tipos';
import { APPS, ICONES } from '../apps/registro';
import { Icone } from '../../comum/Icone';

interface Props { site: Site; aoAbrir: (rota: Rota) => void; aoFechar: () => void }

export function MenuIniciar({ site, aoAbrir, aoFechar }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') aoFechar(); };
    const fora = (e: PointerEvent) => {
      if (!(e.target as Element).closest('#menu-iniciar, .barra__start')) aoFechar();
    };
    document.addEventListener('keydown', tecla);
    document.addEventListener('pointerdown', fora);
    return () => { document.removeEventListener('keydown', tecla); document.removeEventListener('pointerdown', fora); };
  }, [aoFechar]);

  return (
    <div id="menu-iniciar" ref={ref} className="menu-iniciar" role="menu" aria-label="Menu iniciar">
      <div className="menu-iniciar__perfil">
        <img src={site.foto} alt="" width={44} height={44} />
        <div><strong>{site.nome}</strong><span>{site.titulo}</span></div>
      </div>
      {ICONES.map((id) => {
        const def = APPS[id];
        if (!def) return null;
        return (
          <button key={id} type="button" role="menuitem" onClick={() => { aoAbrir({ app: id }); aoFechar(); }}>
            <Icone tipo={def.icone} />{def.rotulo}
          </button>
        );
      })}
      <hr />
      <a role="menuitem" href={site.contato.github} target="_blank" rel="noopener">GitHub ↗</a>
      <a role="menuitem" href={site.contato.linkedin} target="_blank" rel="noopener">LinkedIn ↗</a>
      <a role="menuitem" href="/rapido/">⚡ Modo rápido</a>
    </div>
  );
}
