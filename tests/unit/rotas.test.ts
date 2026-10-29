import { describe, it, expect } from 'vitest';
import { lerHash, paraHash, rotaDaJanela } from '../../src/lib/os/rotas';

const slugs = ['countatic', 'smartscale', 'neon-burnout', 'controle-financeiro'];

describe('lerHash', () => {
  it('hash vazio não abre nada', () => {
    expect(lerHash('', slugs)).toEqual({ rota: null });
    expect(lerHash('#', slugs)).toEqual({ rota: null });
    expect(lerHash('#/', slugs)).toEqual({ rota: null });
  });
  it.each([
    ['#/sobre', 'sobre'], ['#/projetos', 'projetos'], ['#/trajetoria', 'trajetoria'],
    ['#/certificados', 'certificados'], ['#/curriculo', 'curriculo'], ['#/contato', 'contato'],
    ['#/terminal', 'terminal'], ['#/neon-burnout', 'neon-burnout'], ['#/demo-countatic', 'demo-countatic'],
  ])('%s abre %s', (hash, app) => {
    expect(lerHash(hash, slugs)).toEqual({ rota: { app } });
  });
  it('aceita barra no final e ausência da barra inicial', () => {
    expect(lerHash('#/sobre/', slugs)).toEqual({ rota: { app: 'sobre' } });
    expect(lerHash('#sobre', slugs)).toEqual({ rota: { app: 'sobre' } });
  });
  it('projeto conhecido', () => {
    expect(lerHash('#/projetos/countatic', slugs)).toEqual({ rota: { app: 'projeto', param: 'countatic' } });
  });
  it('projeto desconhecido cai na pasta projetos com aviso', () => {
    expect(lerHash('#/projetos/xyz', slugs)).toEqual({ rota: { app: 'projetos' }, aviso: 'Projeto "xyz" não encontrado.' });
  });
  it('caminho desconhecido não abre nada e avisa', () => {
    expect(lerHash('#/banana', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /banana' });
    expect(lerHash('#/sobre/extra', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /sobre/extra' });
    expect(lerHash('#/projetos/a/b', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /projetos/a/b' });
  });
  it('chaves herdadas do prototype não abrem rota', () => {
    expect(lerHash('#/constructor', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /constructor' });
    expect(lerHash('#/toString', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /toString' });
    expect(lerHash('#/__proto__', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /__proto__' });
  });
  it('percent-encoding malformado não lança e cai no não encontrado', () => {
    expect(lerHash('#/%E0%A4%A', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /%E0%A4%A' });
    expect(lerHash('#/projetos/%', slugs)).toEqual({ rota: null, aviso: 'Endereço não encontrado: /projetos/%' });
  });
});

describe('paraHash', () => {
  it('ida e volta', () => {
    expect(paraHash(null)).toBe('');
    expect(paraHash({ app: 'sobre' })).toBe('#/sobre');
    expect(paraHash({ app: 'projeto', param: 'countatic' })).toBe('#/projetos/countatic');
    expect(paraHash({ app: 'projeto' })).toBe('#/projetos');
    for (const hash of ['#/sobre', '#/projetos/smartscale', '#/neon-burnout']) {
      expect(paraHash(lerHash(hash, slugs).rota)).toBe(hash);
    }
  });
});

describe('rotaDaJanela', () => {
  it('monta a rota a partir da janela', () => {
    expect(rotaDaJanela('projeto', 'countatic')).toEqual({ app: 'projeto', param: 'countatic' });
    expect(rotaDaJanela('sobre')).toEqual({ app: 'sobre' });
  });
});
