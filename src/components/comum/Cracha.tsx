import type { Site } from '../../lib/tipos';

type Variante = 'completo' | 'compacto' | 'widget';

export function Cracha({ site, variante = 'completo' }: { site: Site; variante?: Variante }) {
  const foto = <img className="cracha__foto" src={site.foto} alt={`Foto de ${site.nome}`} width={300} height={300} loading="eager" />;
  if (variante === 'widget') {
    return (
      <section className="cracha cracha--widget corte" aria-label="Crachá de identidade">
        {foto}
        <div>
          <p className="cracha__nome">{site.nome}</p>
          <p className="cracha__funcao">{site.titulo}</p>
          <p className="cracha__status"><i aria-hidden="true" />{site.status}</p>
        </div>
      </section>
    );
  }
  return (
    <section className={`cracha cracha--${variante} corte`} aria-label="Crachá de identidade">
      <p className="cracha__topo"><span>NET-ID // USER</span><span>#{site.handle}</span></p>
      {foto}
      <p className="cracha__nome">{site.nome}</p>
      <p className="cracha__funcao">&gt; {site.titulo}</p>
      {variante === 'completo' && (
        <dl className="cracha__dados">
          <dt>BASE</dt><dd>{site.base}</dd>
          <dt>FORMAÇÃO</dt><dd>{site.formacao}</dd>
          <dt>IDIOMAS</dt><dd>{site.idiomas}</dd>
        </dl>
      )}
      <p className="cracha__status"><i aria-hidden="true" />{site.status}</p>
    </section>
  );
}
