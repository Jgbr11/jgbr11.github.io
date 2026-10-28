import { useEffect, useState } from 'react';

const LINHAS = [
  'JGBR11 BIOS v1.0',
  'verificando memória .............. OK',
  'carregando perfil: joão guilherme cordeiro ... OK',
  'montando /projetos ............... 4 encontrados',
  'iniciando interface .............. OK',
];
const PASSO_MS = 250;
const DURACAO_MS = 1500;

export function Boot({ aoTerminar }: { aoTerminar: () => void }) {
  const [visiveis, setVisiveis] = useState(1);

  useEffect(() => {
    const passo = window.setInterval(() => setVisiveis((v) => Math.min(v + 1, LINHAS.length)), PASSO_MS);
    const fim = window.setTimeout(aoTerminar, DURACAO_MS);
    const tecla = () => aoTerminar();
    window.addEventListener('keydown', tecla, true);
    return () => {
      window.clearInterval(passo);
      window.clearTimeout(fim);
      window.removeEventListener('keydown', tecla, true);
    };
  }, [aoTerminar]);

  return (
    <div className="boot" data-testid="boot" role="status" aria-label="Iniciando o JGBR11 OS" onClick={aoTerminar}>
      <p className="boot__logo">JGBR11 OS</p>
      <div className="boot__log">
        {LINHAS.slice(0, visiveis).map((linha) => <pre key={linha}>{linha}</pre>)}
      </div>
      <p className="boot__dica">clique ou aperte uma tecla para pular</p>
      <div className="faixa-alerta boot__faixa" aria-hidden="true" />
    </div>
  );
}
