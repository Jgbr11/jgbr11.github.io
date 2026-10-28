import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type { DadosOS } from '../../../lib/tipos';
import type { Rota } from '../../../lib/os/tipos';
import { estadoInicial, janelaFocada, reduzir, type Janela } from '../../../lib/os/janelas';
import { lerHash, paraHash, rotaDaJanela } from '../../../lib/os/rotas';
import { contarAbertura } from '../../../lib/os/analytics';
import { APPS, ICONES } from '../apps/registro';
import { Cracha } from '../../comum/Cracha';
import { useArea } from '../useArea';
import { IconeDesktop } from './IconeDesktop';
import { JanelaOS } from './Janela';
import { BarraTarefas } from './BarraTarefas';
import { MenuIniciar } from './MenuIniciar';

export function Desktop({ dados }: { dados: DadosOS }) {
  const [estado, despachar] = useReducer(reduzir, estadoInicial);
  const [refArea, area, areaAtual] = useArea<HTMLDivElement>();
  const [selecionado, setSelecionado] = useState<string | null>(null);
  const [menuAberto, setMenuAberto] = useState(false);
  const [aviso, setAviso] = useState<string | undefined>();
  const slugs = useMemo(() => dados.projetos.map((p) => p.slug), [dados]);

  const abrir = useCallback((rota: Rota) => {
    const def = APPS[rota.app];
    if (!def) return;
    despachar({ tipo: 'abrir', app: rota.app, param: rota.param, tamanho: def.tamanho, area: areaAtual.current });
    contarAbertura(rota);
  }, [areaAtual]);

  const abrirPeloHash = useCallback((inicial: boolean) => {
    const { rota, aviso: novoAviso } = lerHash(window.location.hash, slugs);
    setAviso(novoAviso);
    if (rota) abrir(rota);
    else if (inicial) abrir({ app: 'sobre' });
  }, [abrir, slugs]);

  useEffect(() => {
    abrirPeloHash(true);
    const aoMudar = () => abrirPeloHash(false);
    window.addEventListener('hashchange', aoMudar);
    return () => window.removeEventListener('hashchange', aoMudar);
  }, [abrirPeloHash]);

  // O endereço acompanha a janela em foco, sem criar entradas no histórico.
  useEffect(() => {
    if (estado.janelas.length === 0) return;
    const j = janelaFocada(estado);
    const novo = j ? paraHash(rotaDaJanela(j.app, j.param)) : '';
    if (window.location.hash !== novo) {
      history.replaceState(null, '', novo || window.location.pathname + window.location.search);
    }
  }, [estado.focadaId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(undefined), 6000);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const titulos = useMemo(
    () => Object.fromEntries(estado.janelas.map((j) => [j.id, APPS[j.app]?.titulo(dados, j.param) ?? j.id])),
    [estado.janelas, dados],
  );

  // Estável, para o efeito do MenuIniciar não reexecutar (e refocar o primeiro item) a cada render.
  const fecharMenu = useCallback(() => setMenuAberto(false), []);

  const aoClicarJanela = (j: Janela) => {
    if (j.id === estado.focadaId && !j.minimizada) despachar({ tipo: 'minimizar', id: j.id });
    else despachar({ tipo: 'focar', id: j.id });
  };

  return (
    <div className="os os--pc">
      <div className="os-area-trabalho">
        <span className="os-marca" aria-hidden="true">JGBR<br />11</span>
        <span className="os-linha-sys" aria-hidden="true">SYS.ONLINE // CTBA-PR // v1.0</span>
        <nav className="os-icones" aria-label="Área de trabalho">
          {ICONES.map((id) => {
            const def = APPS[id];
            if (!def) return null;
            return (
              <IconeDesktop key={id} def={def} selecionado={selecionado === id}
                aoSelecionar={() => setSelecionado(id)} aoAbrir={() => abrir({ app: id })} />
            );
          })}
        </nav>
        <div className="os-janelas" ref={refArea}>
          {aviso && (
            <p className="os-aviso" role="status">
              {aviso}
              <button type="button" aria-label="Fechar aviso" onClick={() => setAviso(undefined)}>✕</button>
            </p>
          )}
          {estado.janelas.map((j) => {
            const def = APPS[j.app];
            if (!def) return null;
            const { Componente } = def;
            return (
              <JanelaOS key={j.id} janela={j} titulo={titulos[j.id]} caminho={def.caminho(j.param)}
                focada={j.id === estado.focadaId} area={area} despachar={despachar}>
                <Componente dados={dados} param={j.param} abrir={abrir} />
              </JanelaOS>
            );
          })}
        </div>
        <aside className="os-lateral"><Cracha site={dados.site} /></aside>
        <div className="faixa-alerta os-faixa" aria-hidden="true" />
      </div>
      {menuAberto && <MenuIniciar site={dados.site} aoAbrir={abrir} aoFechar={fecharMenu} />}
      <BarraTarefas site={dados.site} janelas={estado.janelas} focadaId={estado.focadaId} titulos={titulos}
        menuAberto={menuAberto} alternarMenu={() => setMenuAberto((v) => !v)} aoClicarJanela={aoClicarJanela} />
    </div>
  );
}
