import type { PropsApp } from './registro';

export function AppDemoCountatic({ dados }: PropsApp) {
  const demo = dados.projetos.find((p) => p.slug === 'countatic')?.links.demo;
  if (!demo) return <p>Demo indisponível.</p>;
  return (
    <div className="app-demo">
      <iframe title="Demo do CounTatic" src={demo} />
      <p className="app-acoes">
        <a className="btn btn--contorno" href={demo} target="_blank" rel="noopener">ABRIR EM NOVA ABA ↗</a>
      </p>
    </div>
  );
}
