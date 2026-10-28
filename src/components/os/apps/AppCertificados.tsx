import { Icone } from '../../comum/Icone';
import type { PropsApp } from './registro';

export function AppCertificados({ dados }: PropsApp) {
  return (
    <ul className="app-lista">
      {dados.site.certificados.map((c) => (
        <li key={c.nome}>
          <a className="app-lista__item" href={c.verificacao} target="_blank" rel="noopener">
            <Icone tipo="texto" />
            <strong>{c.nome}</strong>
            <span>{c.emissor}{c.ano ? ` · ${c.ano}` : ''}</span>
            <span>verificar na Credly ↗</span>
          </a>
        </li>
      ))}
    </ul>
  );
}
