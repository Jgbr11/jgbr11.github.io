import { Email } from '../../comum/Email';
import type { PropsApp } from './registro';

export function AppContato({ dados }: PropsApp) {
  const { linkedin, github } = dados.site.contato;
  return (
    <div className="app-contato">
      <p className="linha-tempo__periodo">// canais de contato</p>
      <ul className="app-lista">
        <li className="app-contato__linha"><span>E-MAIL</span><Email site={dados.site} /></li>
        <li className="app-contato__linha"><span>LINKEDIN</span><a href={linkedin} target="_blank" rel="noopener">{linkedin.replace('https://www.', '')}</a></li>
        <li className="app-contato__linha"><span>GITHUB</span><a href={github} target="_blank" rel="noopener">{github.replace('https://', '')}</a></li>
      </ul>
    </div>
  );
}
