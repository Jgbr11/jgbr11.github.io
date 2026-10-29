// Varre a saída real da captura (public/demo/countatic) e garante a anonimização.
// Não contém nenhum nome real: só verifica formatos permitidos.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';
import { extrairBlobs } from '../../scripts/demo/transformar.ts';

const RAIZ = join(process.cwd(), 'public', 'demo', 'countatic');
const PARTIDAS = [28, 21, 27, 22, 26];
const PAGINAS_COUNTATIC = [
  'p/jgbr11/index.html',
  'p/jgbr11/partidas/index.html',
  ...PARTIDAS.map((id) => `m/${id}/index.html`),
];
const PAGINAS = ['index.html', ...PAGINAS_COUNTATIC];

const NOME_OK = /^(JGBR11|Jogador \d+)$/;
const STEAMID_FALSO = /^7656119000000\d{4}$/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function arquivos(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(p) : [p];
  });
}

function rel(p: string): string {
  return relative(RAIZ, p).split('\\').join('/');
}

function nomesDeJogador(valor: unknown, saida: unknown[] = []): unknown[] {
  if (Array.isArray(valor)) valor.forEach((v) => nomesDeJogador(v, saida));
  else if (valor !== null && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      if (k === 'playerName') saida.push(v);
      else nomesDeJogador(v, saida);
    }
  }
  return saida;
}

const todos = arquivos(RAIZ);
const texto = (p: string) => readFileSync(p, 'utf8');
const jsonsDaApi = () => todos.filter((p) => rel(p).startsWith('api/') && p.endsWith('.json'));

describe('demo do CounTatic: saída anonimizada', () => {
  it('existem as 8 páginas', () => {
    for (const p of PAGINAS) expect(existsSync(join(RAIZ, p)), p).toBe(true);
  });

  it('index.html redireciona para o painel', () => {
    const html = texto(join(RAIZ, 'index.html'));
    expect(html).toMatch(/http-equiv="refresh"[^>]*\/demo\/countatic\/p\/jgbr11\//);
    expect(html).toContain('href="/demo/countatic/p/jgbr11/"');
  });

  it('todo playerName (API e blobs) é JGBR11 ou Jogador N', () => {
    const nomes: unknown[] = [];
    for (const p of jsonsDaApi()) nomesDeJogador(JSON.parse(texto(p)), nomes);
    for (const p of PAGINAS_COUNTATIC) nomesDeJogador(extrairBlobs(texto(join(RAIZ, p))), nomes);
    expect(nomes.length).toBeGreaterThan(0);
    const ruins = nomes.filter((n) => n !== null && !(typeof n === 'string' && NOME_OK.test(n)));
    expect(ruins.length).toBe(0);
    expect(nomes).toContain('JGBR11');
  });

  it('todo SteamID é falso', () => {
    let vistos = 0;
    for (const p of todos) {
      for (const m of texto(p).match(/7656119\d{10}/g) ?? []) {
        vistos++;
        expect(STEAMID_FALSO.test(m), rel(p)).toBe(true);
      }
    }
    expect(vistos).toBeGreaterThan(0);
  });

  it('nenhum UUID, avatar ou localhost:8080', () => {
    for (const p of todos) {
      const t = texto(p);
      expect(UUID.test(t), rel(p)).toBe(false);
      expect(/steamstatic|akamaihd|localhost:8080/i.test(t), rel(p)).toBe(false);
    }
  });

  it('cada página do CounTatic tem uma faixa DEMO e ao menos um blob', () => {
    for (const p of PAGINAS_COUNTATIC) {
      const html = texto(join(RAIZ, p));
      expect(html.match(/class="demo-faixa"/g)?.length ?? 0, p).toBe(1);
      expect(/const (DASH|DATA) = [{[]/.test(html), p).toBe(true);
      expect(extrairBlobs(html).length, p).toBeGreaterThan(0);
    }
  });

  it('existe weapons.json de algum jogador da partida 28', () => {
    const armas = todos.filter((p) => /^api\/matches\/28\/players\/[^/]+\/weapons\.json$/.test(rel(p)));
    expect(armas.length).toBeGreaterThan(0);
  });
});
