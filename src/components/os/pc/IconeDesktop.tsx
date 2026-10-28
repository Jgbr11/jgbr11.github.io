import { useRef } from 'react';
import { Icone } from '../../comum/Icone';
import type { DefinicaoApp } from '../apps/registro';

interface Props { def: DefinicaoApp; selecionado: boolean; aoSelecionar: () => void; aoAbrir: () => void }

export function IconeDesktop({ def, selecionado, aoSelecionar, aoAbrir }: Props) {
  const ultimoPonteiro = useRef('mouse');
  return (
    <button
      type="button"
      className={`icone-desk${selecionado ? ' icone-desk--sel' : ''}`}
      aria-label={`Abrir ${def.rotulo}`}
      onPointerDown={(e) => { ultimoPonteiro.current = e.pointerType; }}
      onClick={(e) => { if (e.detail === 0 || ultimoPonteiro.current !== 'mouse') aoAbrir(); else aoSelecionar(); }}
      onDoubleClick={aoAbrir}
      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); aoAbrir(); } }}
    >
      <Icone tipo={def.icone} selecionado={selecionado} />
      <span className="icone-desk__rotulo">{def.rotulo}</span>
    </button>
  );
}
