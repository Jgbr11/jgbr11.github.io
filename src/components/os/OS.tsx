import { useCallback, useState } from 'react';
import type { DadosOS } from '../../lib/tipos';
import { lerFlag, gravarFlag } from '../../lib/os/armazenamento';
import { usePC } from './usePC';
import { Desktop } from './pc/Desktop';
import { Celular } from './celular/Celular';
import { Boot } from './Boot';
import { ErroOS } from './ErroOS';

const CHAVE_BOOT = 'jgbr11:boot-visto';

function deveMostrarBoot(): boolean {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return !reduzir && !lerFlag(CHAVE_BOOT);
}

export default function OS({ dados }: { dados: DadosOS }) {
  const pc = usePC();
  const [boot, setBoot] = useState(deveMostrarBoot);
  const terminarBoot = useCallback(() => {
    gravarFlag(CHAVE_BOOT);
    setBoot(false);
  }, []);

  return (
    <ErroOS>
      <div className="os-raiz" inert={boot}>
        {pc ? <Desktop dados={dados} /> : <Celular dados={dados} />}
      </div>
      {boot && <Boot aoTerminar={terminarBoot} />}
    </ErroOS>
  );
}
