import type { Janela } from '../../../lib/os/janelas';
import type { Site } from '../../../lib/tipos';

interface Props {
  site: Site; janelas: Janela[]; focadaId: string | null; titulos: Record<string, string>;
  menuAberto: boolean; alternarMenu: () => void; aoClicarJanela: (j: Janela) => void;
}

export function BarraTarefas({ site, janelas, focadaId, titulos, menuAberto, alternarMenu, aoClicarJanela }: Props) {
  return (
    <footer className="barra">
      <button type="button" className="barra__start" aria-haspopup="menu" aria-expanded={menuAberto} aria-controls="menu-iniciar" onClick={alternarMenu}>
        <img src={site.foto} alt="" width={24} height={24} />START
      </button>
      <ul className="barra__janelas" aria-label="Janelas abertas">
        {janelas.map((j) => (
          <li key={j.id}>
            <button type="button" aria-pressed={j.id === focadaId && !j.minimizada} onClick={() => aoClicarJanela(j)}>
              {titulos[j.id]}
            </button>
          </li>
        ))}
      </ul>
      <a className="barra__rapido" href="/rapido/">⚡ MODO RÁPIDO</a>
    </footer>
  );
}
