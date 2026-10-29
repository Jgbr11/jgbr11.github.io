import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { site } from '../../src/content/site';
import { Cracha } from '../../src/components/comum/Cracha';
import { Email } from '../../src/components/comum/Email';
import { CabecalhoProjeto } from '../../src/components/comum/CabecalhoProjeto';
import { Icone } from '../../src/components/comum/Icone';
import type { Projeto } from '../../src/lib/tipos';

const projeto: Projeto = {
  slug: 'x', titulo: 'Projeto X', subtitulo: 'teste', resumo: 'Resumo.', ano: 2026, ordem: 1,
  stack: ['Java'], links: { codigo: 'https://github.com/Jgbr11/x' }, galeria: [],
  numeros: [{ valor: '10', rotulo: 'testes' }], html: '<h2>Problema</h2>',
};

describe('Cracha', () => {
  it('mostra nome, título e ONLINE, sem falar de vaga', () => {
    const html = renderToStaticMarkup(<Cracha site={site} />);
    expect(html).toContain('João Guilherme');
    expect(html).toContain('Desenvolvedor Full Stack');
    expect(html).toContain('ONLINE');
    expect(html.toLowerCase()).not.toContain('oportunidade');
    expect(html).toContain('alt="Foto de João Guilherme Cordeiro"');
  });
});

describe('Email', () => {
  it('não escreve o endereço completo no HTML estático', () => {
    const html = renderToStaticMarkup(<Email site={site} />);
    expect(html).not.toContain('jgcreplive@gmail.com');
    expect(html).toContain('jgcreplive [arroba] gmail.com');
  });
});

describe('CabecalhoProjeto', () => {
  it('mostra título, números, stack e link de código', () => {
    const html = renderToStaticMarkup(<CabecalhoProjeto projeto={projeto} />);
    expect(html).toContain('Projeto X');
    expect(html).toContain('10');
    expect(html).toContain('Java');
    expect(html).toContain('href="https://github.com/Jgbr11/x"');
  });
});

describe('Icone', () => {
  it.each(['pasta', 'texto', 'pdf', 'exe', 'terminal', 'jogo', 'mira'] as const)('desenha %s como SVG decorativo', (tipo) => {
    const html = renderToStaticMarkup(<Icone tipo={tipo} />);
    expect(html).toMatch(/^<svg/);
    expect(html).toContain('aria-hidden="true"');
  });
});
