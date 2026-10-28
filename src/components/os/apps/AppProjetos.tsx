import { Icone } from '../../comum/Icone';
import type { PropsApp } from './registro';

export function AppProjetos({ dados, abrir }: PropsApp) {
  return (
    <ul className="app-lista">
      {dados.projetos.map((p) => (
        <li key={p.slug}>
          <button type="button" className="app-lista__item" aria-label={`Abrir ${p.titulo}`} onClick={() => abrir({ app: 'projeto', param: p.slug })}>
            <Icone tipo="pasta" />
            <strong>{p.titulo}</strong>
            <span>// {p.subtitulo}</span>
            <span>{p.stack.slice(0, 4).join(' · ')}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
