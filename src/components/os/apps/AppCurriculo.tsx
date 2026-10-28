import { usePC } from '../usePC';
import type { PropsApp } from './registro';

export function AppCurriculo({ dados }: PropsApp) {
  const pc = usePC();
  const arquivo = dados.site.curriculo;
  return (
    <div className="app-curriculo">
      <p className="app-acoes">
        <a className="btn" href={arquivo} download>BAIXAR PDF ⇩</a>
        <a className="btn btn--contorno" href={arquivo} target="_blank" rel="noopener">ABRIR EM NOVA ABA ↗</a>
      </p>
      {/* Muitos celulares não exibem PDF dentro de iframe: lá ficam só os botões. */}
      {pc && <iframe title="Currículo em PDF" src={arquivo} />}
    </div>
  );
}
