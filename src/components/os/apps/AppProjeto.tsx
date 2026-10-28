import { CabecalhoProjeto } from '../../comum/CabecalhoProjeto';
import type { PropsApp } from './registro';

export function AppProjeto({ dados, param, abrir }: PropsApp) {
  const projeto = dados.projetos.find((p) => p.slug === param);
  if (!projeto) return <p>Projeto não encontrado.</p>;
  return (
    <div className="app-projeto">
      <CabecalhoProjeto projeto={projeto} />
      {projeto.embedJogo && (
        <p className="app-acoes">
          <button type="button" className="btn" onClick={() => abrir({ app: 'neon-burnout' })}>▶ JOGAR AQUI</button>
        </p>
      )}
      {projeto.galeria.length > 0 && (
        <ul className="p-galeria">
          {projeto.galeria.map((m) => (
            <li key={m.src}><figure><img src={m.src} alt={m.alt} loading="lazy" /><figcaption>{m.alt}</figcaption></figure></li>
          ))}
        </ul>
      )}
      <div className="prosa" dangerouslySetInnerHTML={{ __html: projeto.html }} />
      <p className="app-acoes"><a className="btn btn--contorno" href={`/projetos/${projeto.slug}/`}>PÁGINA DO PROJETO ↗</a></p>
    </div>
  );
}
