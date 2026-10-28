import type { Rota } from './tipos';
import { paraHash } from './rotas';

declare global {
  interface Window { goatcounter?: { count?: (opcoes: { path: string; title?: string; event?: boolean }) => void } }
}

/** Registra a abertura de um app como evento no GoatCounter. Sem script carregado, não faz nada. */
export function contarAbertura(rota: Rota): void {
  try {
    window.goatcounter?.count?.({ path: `os${paraHash(rota).slice(1)}`, title: `OS: ${rota.app}`, event: true });
  } catch { /* contador nunca pode quebrar o site */ }
}
