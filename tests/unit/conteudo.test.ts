import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { site, emailDe } from '../../src/content/site';

const PASTA = join(process.cwd(), 'src/content/projetos');
const SLUGS = ['countatic', 'smartscale', 'neon-burnout', 'controle-financeiro'];

describe('site.ts', () => {
  const texto = JSON.stringify(site);

  it('não expõe telefone', () => {
    expect(texto).not.toMatch(/\(?\d{2}\)?\s?9\d{4}-?\d{4}/);
  });
  it('não diz que procura vaga', () => {
    expect(texto.toLowerCase()).not.toMatch(/oportunidade|procurando|busco est[aá]gio|dispon[ií]vel para/);
  });
  it('usa o título combinado', () => {
    expect(site.titulo).toBe('Desenvolvedor Full Stack');
    expect(site.status).toBe('ONLINE');
  });
  it('monta o e-mail', () => {
    expect(emailDe(site)).toBe('jgcreplive@gmail.com');
  });
  it('descreve o freelance como trabalho em equipe', () => {
    const freela = site.trajetoria.find((i) => i.titulo.includes('TijucasOpen'));
    expect(freela?.periodo).toBe('out — dez 2024');
    expect(freela?.descricao).toMatch(/em equipe/);
  });
  it('certificados apontam para a Credly', () => {
    expect(site.certificados).toHaveLength(2);
    for (const c of site.certificados) expect(c.verificacao).toMatch(/^https:\/\/www\.credly\.com\/badges\//);
  });
});

describe('estudos de caso', () => {
  it('existem exatamente os 4 projetos combinados', () => {
    const arquivos = readdirSync(PASTA).map((a) => a.replace(/\.md$/, '')).sort();
    expect(arquivos).toEqual([...SLUGS].sort());
  });
  it.each(SLUGS)('%s tem as seções obrigatórias', (slug) => {
    const md = readFileSync(join(PASTA, `${slug}.md`), 'utf8');
    for (const secao of ['## Problema', '## Arquitetura', '## Decisões técnicas', '## Meu papel']) {
      expect(md).toContain(secao);
    }
  });
  it('a versão cloud do SmartScale aparece como trabalho em equipe', () => {
    const md = readFileSync(join(PASTA, 'smartscale.md'), 'utf8');
    expect(md).toMatch(/equipe de 4/);
  });
});
