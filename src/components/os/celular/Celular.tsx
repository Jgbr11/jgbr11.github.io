import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DadosOS } from '../../../lib/tipos';
import type { Rota } from '../../../lib/os/tipos';
import { lerHash, paraHash } from '../../../lib/os/rotas';
import { contarAbertura } from '../../../lib/os/analytics';
import { APPS } from '../apps/registro';
import { HomeCelular } from './HomeCelular';
import { AppCelular } from './AppCelular';

function nivelAtual(): number {
  const estado = history.state as { nivel?: number } | null;
  return typeof estado?.nivel === 'number' ? estado.nivel : 0;
}

export function Celular({ dados }: { dados: DadosOS }) {
  const slugs = useMemo(() => dados.projetos.map((p) => p.slug), [dados]);
  const [rota, setRota] = useState<Rota | null>(null);
  const [aviso, setAviso] = useState<string | undefined>();

  useEffect(() => {
    const ler = () => {
      const r = lerHash(window.location.hash, slugs);
      setRota(r.rota);
      setAviso(r.aviso);
    };
    ler();
    window.addEventListener('popstate', ler);
    window.addEventListener('hashchange', ler);
    return () => { window.removeEventListener('popstate', ler); window.removeEventListener('hashchange', ler); };
  }, [slugs]);

  const abrir = useCallback((nova: Rota) => {
    if (!APPS[nova.app]) return;
    history.pushState({ nivel: nivelAtual() + 1 }, '', paraHash(nova));
    setRota(nova);
    setAviso(undefined);
    contarAbertura(nova);
  }, []);

  const voltar = useCallback(() => {
    if (nivelAtual() > 0) { history.back(); return; }
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setRota(null);
  }, []);

  const def = rota ? APPS[rota.app] : undefined;

  return (
    <>
      <div style={{ display: "contents" }} inert={!!(rota && def)}>
        <HomeCelular dados={dados} abrir={abrir} />
      </div>
      {rota && def && (
        <AppCelular titulo={def.titulo(dados, rota.param)} aoVoltar={voltar}>
          {aviso && <p className="os-aviso os-aviso--cel" role="status">{aviso}</p>}
          <def.Componente dados={dados} param={rota.param} abrir={abrir} />
        </AppCelular>
      )}
    </>
  );
}
