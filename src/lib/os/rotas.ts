import type { AppId, Rota } from './tipos';

export interface ResultadoRota { rota: Rota | null; aviso?: string }

const SEGMENTOS: Record<string, AppId> = {
  sobre: 'sobre', projetos: 'projetos', trajetoria: 'trajetoria', certificados: 'certificados',
  curriculo: 'curriculo', contato: 'contato', terminal: 'terminal', 'neon-burnout': 'neon-burnout',
  'demo-countatic': 'demo-countatic',
};

export function lerHash(hash: string, slugs: readonly string[]): ResultadoRota {
  const caminho = hash.replace(/^#\/?/, '').replace(/\/+$/, '');
  if (!caminho) return { rota: null };
  const naoEncontrado = { rota: null, aviso: `Endereço não encontrado: /${caminho}` };
  let partes: string[];
  try {
    partes = caminho.split('/').map((p) => decodeURIComponent(p));
  } catch {
    return naoEncontrado;
  }
  if (partes.length > 2) return naoEncontrado;
  const [primeiro, segundo] = partes;
  if (primeiro === 'projetos' && segundo !== undefined) {
    if (slugs.includes(segundo)) return { rota: { app: 'projeto', param: segundo } };
    return { rota: { app: 'projetos' }, aviso: `Projeto "${segundo}" não encontrado.` };
  }
  if (!Object.hasOwn(SEGMENTOS, primeiro) || segundo !== undefined) return naoEncontrado;
  return { rota: { app: SEGMENTOS[primeiro] } };
}

export function paraHash(rota: Rota | null): string {
  if (!rota) return '';
  if (rota.app === 'projeto') return rota.param ? `#/projetos/${encodeURIComponent(rota.param)}` : '#/projetos';
  return `#/${rota.app}`;
}

export function rotaDaJanela(app: AppId, param?: string): Rota {
  return param ? { app, param } : { app };
}
