import type { PropsApp } from './registro';

export function AppSobre({ dados, abrir }: PropsApp) {
  return (
    <div className="app-sobre">
      <p>{dados.site.sobre}</p>
      <ul className="numeros">
        {dados.site.destaques.map((d) => <li key={d.rotulo}><strong>{d.valor}</strong><span>{d.rotulo}</span></li>)}
      </ul>
      <p className="app-acoes">
        <button type="button" className="btn" onClick={() => abrir({ app: 'projetos' })}>VER PROJETOS ▸</button>
        <button type="button" className="btn btn--contorno" onClick={() => abrir({ app: 'curriculo' })}>CURRÍCULO</button>
      </p>
    </div>
  );
}
