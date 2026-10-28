import { useEffect, useRef, type Dispatch, type PointerEvent, type ReactNode } from 'react';
import type { Acao, Area, Janela } from '../../../lib/os/janelas';

interface Props {
  janela: Janela; titulo: string; caminho: string; focada: boolean;
  area: Area; despachar: Dispatch<Acao>; children: ReactNode;
}

export function JanelaOS({ janela, titulo, caminho, focada, area, despachar, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const arraste = useRef<{ dx: number; dy: number } | null>(null);
  const { id } = janela;

  // Leva o foco do teclado para a janela focada, sem roubar o foco de algo já dentro dela (ex.: o input do terminal).
  useEffect(() => {
    const el = ref.current;
    if (focada && el && !janela.minimizada && !el.contains(document.activeElement)) el.focus({ preventScroll: true });
  }, [focada, janela.minimizada]);

  const iniciarArraste = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest('button') || janela.maximizada) return;
    arraste.current = { dx: e.clientX - janela.x, dy: e.clientY - janela.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const arrastar = (e: PointerEvent<HTMLDivElement>) => {
    if (!arraste.current) return;
    despachar({ tipo: 'mover', id, x: e.clientX - arraste.current.dx, y: e.clientY - arraste.current.dy, area });
  };
  const soltar = () => { arraste.current = null; };

  const estilo = janela.maximizada
    ? { zIndex: janela.z }
    : { left: janela.x, top: janela.y, width: janela.w, height: janela.h, zIndex: janela.z };

  return (
    <section
      ref={ref}
      role="dialog"
      aria-label={titulo}
      tabIndex={-1}
      hidden={janela.minimizada}
      className={`janela${focada ? ' janela--focada' : ''}${janela.maximizada ? ' janela--max' : ''}`}
      style={estilo}
      onPointerDown={() => { if (!focada) despachar({ tipo: 'focar', id }); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); despachar({ tipo: 'fechar', id }); } }}
    >
      <div
        className="janela__barra"
        onPointerDown={iniciarArraste}
        onPointerMove={arrastar}
        onPointerUp={soltar}
        onPointerCancel={soltar}
        onDoubleClick={(e) => { if (!(e.target as HTMLElement).closest('button')) despachar({ tipo: 'alternarMaximizar', id }); }}
      >
        <span className="janela__caminho">{caminho}</span>
        <span className="janela__botoes">
          <button type="button" aria-label="Minimizar" onClick={() => despachar({ tipo: 'minimizar', id })}>—</button>
          <button type="button" aria-label={janela.maximizada ? 'Restaurar' : 'Maximizar'} onClick={() => despachar({ tipo: 'alternarMaximizar', id })}>▢</button>
          <button type="button" aria-label="Fechar" className="janela__fechar" onClick={() => despachar({ tipo: 'fechar', id })}>✕</button>
        </span>
      </div>
      <div className="janela__corpo">{children}</div>
    </section>
  );
}
