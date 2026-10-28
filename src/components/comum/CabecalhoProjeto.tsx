import type { Projeto } from '../../lib/tipos';

export function CabecalhoProjeto({ projeto, nivel = 'h2' }: { projeto: Projeto; nivel?: 'h1' | 'h2' }) {
  const Titulo = nivel;
  return (
    <header className="projeto-cab">
      {projeto.capa ? (
        <img className="projeto-cab__capa" src={projeto.capa.src} alt={projeto.capa.alt} loading="eager" decoding="async" />
      ) : (
        <div className="projeto-cab__capa projeto-cab__capa--vazia" aria-hidden="true">
          <span>{projeto.titulo}</span>
        </div>
      )}
      <Titulo className="projeto-cab__titulo">{projeto.titulo}</Titulo>
      <p className="projeto-cab__sub">// {projeto.subtitulo} · {projeto.ano}</p>
      <p className="projeto-cab__resumo">{projeto.resumo}</p>
      <ul className="numeros" aria-label="Números do projeto">
        {projeto.numeros.map((n) => (
          <li key={n.rotulo}><strong>{n.valor}</strong><span>{n.rotulo}</span></li>
        ))}
      </ul>
      <ul className="chips" aria-label="Tecnologias">
        {projeto.stack.map((s) => <li key={s} className="chip">{s}</li>)}
      </ul>
      <p className="projeto-cab__links">
        {projeto.links.jogar && <a className="btn" href={projeto.links.jogar} target="_blank" rel="noopener">JOGAR NO ITCH.IO ▸</a>}
        {projeto.links.codigo && <a className="btn btn--contorno" href={projeto.links.codigo} target="_blank" rel="noopener">CÓDIGO</a>}
      </p>
    </header>
  );
}
