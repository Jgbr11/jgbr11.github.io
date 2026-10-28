import type { Midia } from '../../lib/tipos';

export function GaleriaProjeto({ galeria }: { galeria: Midia[] }) {
  if (galeria.length === 0) return null;
  return (
    <ul className="p-galeria">
      {galeria.map((m) => (
        <li key={m.src}>
          <figure>
            <img src={m.src} alt={m.alt} width={m.largura} height={m.altura} loading="lazy" decoding="async" />
            <figcaption>{m.alt}</figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
