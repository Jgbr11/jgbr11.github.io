import type { PropsApp } from './registro';

export function AppTrajetoria({ dados }: PropsApp) {
  return (
    <ol className="linha-tempo">
      {dados.site.trajetoria.map((i) => (
        <li key={i.titulo}>
          <span className="linha-tempo__periodo">{i.periodo}</span>
          <h3>{i.titulo}</h3>
          <p className="linha-tempo__papel">{i.papel}</p>
          <p>{i.descricao}</p>
        </li>
      ))}
    </ol>
  );
}
