import { CabecalhoProjeto } from '../../comum/CabecalhoProjeto';
import { GaleriaProjeto } from '../../comum/GaleriaProjeto';
import { usePC } from '../usePC';
import type { PropsApp } from './registro';

export function AppProjeto({ dados, param, abrir }: PropsApp) {
  const pc = usePC();
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
      {projeto.links.demo && pc && (
        <p className="app-acoes">
          <button type="button" className="btn" onClick={() => abrir({ app: 'demo-countatic' })}>▶ ABRIR DEMO AQUI</button>
        </p>
      )}
      <GaleriaProjeto galeria={projeto.galeria} />
      <div className="prosa" dangerouslySetInnerHTML={{ __html: projeto.html }} />
      <p className="app-acoes"><a className="btn btn--contorno" href={`/projetos/${projeto.slug}/`}>PÁGINA DO PROJETO ↗</a></p>
    </div>
  );
}
