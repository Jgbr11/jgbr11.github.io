import type { AppId } from './tipos';

export interface Janela {
  id: string; app: AppId; param?: string;
  x: number; y: number; w: number; h: number; z: number;
  minimizada: boolean; maximizada: boolean;
}
export interface EstadoJanelas { janelas: Janela[]; proximoZ: number; focadaId: string | null }
export interface Area { w: number; h: number }

export type Acao =
  | { tipo: 'abrir'; app: AppId; param?: string; tamanho: Area; area: Area }
  | { tipo: 'fechar'; id: string }
  | { tipo: 'focar'; id: string }
  | { tipo: 'minimizar'; id: string }
  | { tipo: 'alternarMaximizar'; id: string }
  | { tipo: 'mover'; id: string; x: number; y: number; area: Area };

/** Altura da barra de título: o mínimo que precisa continuar visível. */
const BARRA = 32;

export const estadoInicial: EstadoJanelas = { janelas: [], proximoZ: 1, focadaId: null };

export function idDaJanela(app: AppId, param?: string): string {
  return param ? `${app}:${param}` : app;
}

function limitar(valor: number, min: number, max: number): number {
  return Math.min(Math.max(valor, min), Math.max(min, max));
}

function topoVisivel(janelas: Janela[]): string | null {
  const visiveis = janelas.filter((j) => !j.minimizada);
  if (visiveis.length === 0) return null;
  return visiveis.reduce((a, b) => (b.z > a.z ? b : a)).id;
}

export function janelaFocada(estado: EstadoJanelas): Janela | null {
  return estado.janelas.find((j) => j.id === estado.focadaId) ?? null;
}

export function reduzir(estado: EstadoJanelas, acao: Acao): EstadoJanelas {
  switch (acao.tipo) {
    case 'abrir': {
      const id = idDaJanela(acao.app, acao.param);
      if (estado.janelas.some((j) => j.id === id)) {
        return reduzir(estado, { tipo: 'focar', id });
      }
      const w = Math.min(acao.tamanho.w, acao.area.w);
      const h = Math.min(acao.tamanho.h, acao.area.h);
      const passo = estado.janelas.length % 6;
      const nova: Janela = {
        id, app: acao.app, param: acao.param, w, h,
        x: limitar(24 + passo * 28, 0, acao.area.w - w),
        y: limitar(16 + passo * 28, 0, acao.area.h - h),
        z: estado.proximoZ, minimizada: false, maximizada: false,
      };
      return { janelas: [...estado.janelas, nova], proximoZ: estado.proximoZ + 1, focadaId: id };
    }
    case 'focar': {
      if (!estado.janelas.some((j) => j.id === acao.id)) return estado;
      return {
        janelas: estado.janelas.map((j) => (j.id === acao.id ? { ...j, z: estado.proximoZ, minimizada: false } : j)),
        proximoZ: estado.proximoZ + 1,
        focadaId: acao.id,
      };
    }
    case 'fechar': {
      const janelas = estado.janelas.filter((j) => j.id !== acao.id);
      return { ...estado, janelas, focadaId: estado.focadaId === acao.id ? topoVisivel(janelas) : estado.focadaId };
    }
    case 'minimizar': {
      const janelas = estado.janelas.map((j) => (j.id === acao.id ? { ...j, minimizada: true } : j));
      return { ...estado, janelas, focadaId: estado.focadaId === acao.id ? topoVisivel(janelas) : estado.focadaId };
    }
    case 'alternarMaximizar':
      return { ...estado, janelas: estado.janelas.map((j) => (j.id === acao.id ? { ...j, maximizada: !j.maximizada } : j)) };
    case 'mover':
      return {
        ...estado,
        janelas: estado.janelas.map((j) =>
          j.id === acao.id
            ? { ...j, x: limitar(acao.x, 0, acao.area.w - j.w), y: limitar(acao.y, 0, acao.area.h - BARRA) }
            : j,
        ),
      };
  }
}
