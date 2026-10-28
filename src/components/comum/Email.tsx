import { useEffect, useState } from 'react';
import type { Site } from '../../lib/tipos';

/** Monta o e-mail só no navegador, para dificultar a coleta por robôs que leem o HTML. */
export function Email({ site }: { site: Site }) {
  const { emailUsuario: u, emailDominio: d } = site.contato;
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);
  if (!montado) return <span className="email">{u} [arroba] {d}</span>;
  const endereco = `${u}@${d}`;
  return <a className="email" href={`mailto:${endereco}`}>{endereco}</a>;
}
