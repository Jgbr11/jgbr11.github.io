import { useCallback, useEffect, useMemo, useRef, useState, type SubmitEvent, type KeyboardEvent, type ReactNode } from 'react';
import { completar, executar, prompt, type Pasta } from '../../../lib/os/terminal';
import { Matrix } from './Matrix';
import type { PropsApp } from './registro';

/** Blocos e linhas de desenho não existem nas fontes carregadas e caem numa fonte de largura diferente. Cada um ocupa exatamente 1ch para a arte do neofetch alinhar. */
const DESENHO = /[─-▟]+/g;
function fixarLargura(texto: string) {
  const partes: ReactNode[] = [];
  let ultimo = 0;
  for (const m of texto.matchAll(DESENHO)) {
    partes.push(texto.slice(ultimo, m.index));
    partes.push(<span key={m.index} className="terminal__arte">{[...m[0]].map((c, i) => <span key={i}>{c}</span>)}</span>);
    ultimo = m.index + m[0].length;
  }
  partes.push(texto.slice(ultimo));
  return partes;
}

interface Linha { tipo: 'cmd' | 'saida'; texto: string }

const BOAS_VINDAS: Linha[] = [
  { tipo: 'saida', texto: 'JGBR11 OS v1.0 — terminal' },
  { tipo: 'saida', texto: 'digite "help" para ver os comandos.' },
];

export function AppTerminal({ dados, abrir }: PropsApp) {
  const [cwd, setCwd] = useState<Pasta>('/');
  const [saida, setSaida] = useState<Linha[]>(BOAS_VINDAS);
  const [entrada, setEntrada] = useState('');
  const [historico, setHistorico] = useState<string[]>([]);
  const [posicao, setPosicao] = useState<number | null>(null);
  const [matrix, setMatrix] = useState(false);
  const refSaida = useRef<HTMLDivElement>(null);
  const refEntrada = useRef<HTMLInputElement>(null);

  const ctx = useMemo(
    () => ({ cwd, site: dados.site, projetos: dados.projetos.map(({ slug, titulo, subtitulo }) => ({ slug, titulo, subtitulo })) }),
    [cwd, dados],
  );

  useEffect(() => { refEntrada.current?.focus(); }, []);
  useEffect(() => {
    const el = refSaida.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [saida]);

  const fimMatrix = useCallback(() => setMatrix(false), []);

  const enviar = (e: SubmitEvent) => {
    e.preventDefault();
    const comando = entrada;
    const novoHistorico = comando.trim() ? [...historico, comando.trim()] : historico;
    const r = executar(comando, ctx, novoHistorico);
    let linhas: Linha[] = [...saida, { tipo: 'cmd', texto: `${prompt(cwd)} ${comando}` }, ...r.linhas.map((texto) => ({ tipo: 'saida' as const, texto }))];
    for (const efeito of r.efeitos) {
      if (efeito.tipo === 'limpar') linhas = [];
      else if (efeito.tipo === 'abrir') abrir(efeito.rota);
      else if (efeito.tipo === 'rapido') window.location.assign('/rapido/');
      else if (efeito.tipo === 'matrix') setMatrix(true);
    }
    setHistorico(novoHistorico);
    setPosicao(null);
    setEntrada('');
    setCwd(r.cwd);
    setSaida(linhas);
  };

  const teclas = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setEntrada(completar(entrada, ctx));
    } else if (e.key === 'ArrowUp' && historico.length > 0) {
      e.preventDefault();
      const nova = posicao === null ? historico.length - 1 : Math.max(0, posicao - 1);
      setPosicao(nova);
      setEntrada(historico[nova]);
    } else if (e.key === 'ArrowDown' && posicao !== null) {
      e.preventDefault();
      const nova = posicao + 1;
      if (nova >= historico.length) { setPosicao(null); setEntrada(''); }
      else { setPosicao(nova); setEntrada(historico[nova]); }
    }
  };

  return (
    <div className="terminal" onClick={() => refEntrada.current?.focus()}>
      <div className="terminal__saida" role="log" aria-live="polite" ref={refSaida}>
        {saida.map((l, i) => <pre key={i} className={`terminal__linha terminal__linha--${l.tipo}`}>{fixarLargura(l.texto)}</pre>)}
      </div>
      <form className="terminal__form" onSubmit={enviar}>
        <span className="terminal__prompt" aria-hidden="true">{prompt(cwd)}</span>
        <input
          ref={refEntrada}
          aria-label="Comando do terminal"
          autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
          onKeyDown={teclas}
        />
      </form>
      {matrix && <Matrix aoTerminar={fimMatrix} />}
    </div>
  );
}
