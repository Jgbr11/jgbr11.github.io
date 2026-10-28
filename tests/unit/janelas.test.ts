import { describe, it, expect } from 'vitest';
import { estadoInicial, reduzir, idDaJanela, janelaFocada, type EstadoJanelas } from '../../src/lib/os/janelas';

const area = { w: 1000, h: 600 };
const tamanho = { w: 400, h: 300 };
const abrir = (e: EstadoJanelas, app: 'sobre' | 'projetos' | 'projeto', param?: string) =>
  reduzir(e, { tipo: 'abrir', app, param, tamanho, area });

describe('idDaJanela', () => {
  it('usa o parâmetro quando existe', () => {
    expect(idDaJanela('sobre')).toBe('sobre');
    expect(idDaJanela('projeto', 'countatic')).toBe('projeto:countatic');
  });
});

describe('abrir', () => {
  it('cria a janela focada, em cascata', () => {
    const e1 = abrir(estadoInicial, 'sobre');
    const e2 = abrir(e1, 'projetos');
    expect(e2.janelas).toHaveLength(2);
    expect(e2.focadaId).toBe('projetos');
    expect(e2.janelas[0]).toMatchObject({ x: 24, y: 16, w: 400, h: 300 });
    expect(e2.janelas[1]).toMatchObject({ x: 52, y: 44 });
    expect(e2.janelas[1].z).toBeGreaterThan(e2.janelas[0].z);
  });
  it('não duplica: restaura e foca a existente', () => {
    let e = abrir(estadoInicial, 'sobre');
    e = abrir(e, 'projetos');
    e = reduzir(e, { tipo: 'minimizar', id: 'sobre' });
    e = abrir(e, 'sobre');
    expect(e.janelas).toHaveLength(2);
    expect(e.focadaId).toBe('sobre');
    expect(e.janelas.find((j) => j.id === 'sobre')?.minimizada).toBe(false);
  });
  it('projetos diferentes viram janelas diferentes', () => {
    let e = abrir(estadoInicial, 'projeto', 'countatic');
    e = abrir(e, 'projeto', 'smartscale');
    expect(e.janelas.map((j) => j.id)).toEqual(['projeto:countatic', 'projeto:smartscale']);
  });
  it('encolhe a janela quando a área é menor', () => {
    const e = reduzir(estadoInicial, { tipo: 'abrir', app: 'sobre', tamanho: { w: 900, h: 900 }, area: { w: 500, h: 400 } });
    expect(e.janelas[0]).toMatchObject({ w: 500, h: 400, x: 0, y: 0 });
  });
});

describe('focar, minimizar e fechar', () => {
  it('focar leva para a frente', () => {
    let e = abrir(abrir(estadoInicial, 'sobre'), 'projetos');
    e = reduzir(e, { tipo: 'focar', id: 'sobre' });
    expect(janelaFocada(e)?.id).toBe('sobre');
    expect(Math.max(...e.janelas.map((j) => j.z))).toBe(e.janelas.find((j) => j.id === 'sobre')!.z);
  });
  it('focar id inexistente não muda nada', () => {
    const e = abrir(estadoInicial, 'sobre');
    expect(reduzir(e, { tipo: 'focar', id: 'nada' })).toBe(e);
  });
  it('minimizar a focada passa o foco para a de cima', () => {
    let e = abrir(abrir(estadoInicial, 'sobre'), 'projetos');
    e = reduzir(e, { tipo: 'minimizar', id: 'projetos' });
    expect(e.focadaId).toBe('sobre');
  });
  it('fechar a última deixa sem foco', () => {
    let e = abrir(estadoInicial, 'sobre');
    e = reduzir(e, { tipo: 'fechar', id: 'sobre' });
    expect(e.janelas).toHaveLength(0);
    expect(e.focadaId).toBeNull();
    expect(janelaFocada(e)).toBeNull();
  });
  it('fechar uma não focada mantém o foco', () => {
    let e = abrir(abrir(estadoInicial, 'sobre'), 'projetos');
    e = reduzir(e, { tipo: 'fechar', id: 'sobre' });
    expect(e.focadaId).toBe('projetos');
  });
});

describe('maximizar e mover', () => {
  it('alterna maximizar', () => {
    let e = abrir(estadoInicial, 'sobre');
    e = reduzir(e, { tipo: 'alternarMaximizar', id: 'sobre' });
    expect(e.janelas[0].maximizada).toBe(true);
    e = reduzir(e, { tipo: 'alternarMaximizar', id: 'sobre' });
    expect(e.janelas[0].maximizada).toBe(false);
  });
  it('mover limita a janela à área', () => {
    let e = abrir(estadoInicial, 'sobre');
    e = reduzir(e, { tipo: 'mover', id: 'sobre', x: -50, y: 9999, area });
    expect(e.janelas[0]).toMatchObject({ x: 0, y: 600 - 32 });
    e = reduzir(e, { tipo: 'mover', id: 'sobre', x: 9999, y: 10, area });
    expect(e.janelas[0]).toMatchObject({ x: 1000 - 400, y: 10 });
  });
});
