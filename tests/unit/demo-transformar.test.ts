import { describe, expect, it } from 'vitest';
import {
  BASE,
  anonimizar,
  anonimizarJson,
  anonimizarPagina,
  caminhoDaApi,
  contarNomesReais,
  detectarNomes,
  extrairBlobs,
  injetarDemo,
  reMascara,
  reescreverLinks,
  removerAvatares,
  trechoMascarado,
  type Mapeamento,
} from '../../scripts/demo/transformar.ts';

const mapaVazio = (): Mapeamento => ({
  nomes: new Map(),
  steamIds: new Map(),
  tokens: new Map(),
});

describe('caminhoDaApi', () => {
  it('sem query', () => {
    expect(caminhoDaApi('/api/x/y')).toBe('/demo/countatic/api/x/y.json');
  });
  it('com query ordenada', () => {
    expect(caminhoDaApi('/api/x/y?limit=20&metric=adr')).toBe(
      '/demo/countatic/api/x/y__limit=20&metric=adr.json',
    );
  });
  it('com query fora de ordem', () => {
    expect(caminhoDaApi('/api/x/y?metric=adr&limit=20')).toBe(
      '/demo/countatic/api/x/y__limit=20&metric=adr.json',
    );
  });
});

describe('anonimizar (steamIds e tokens, nunca nomes)', () => {
  it('não troca nomes textualmente', () => {
    const m = mapaVazio();
    m.nomes.set('2', 'Jogador 2');
    expect(anonimizar('{"kills":2} Ana', m)).toBe('{"kills":2} Ana');
  });
  it('troca steamIds', () => {
    const m = mapaVazio();
    m.steamIds.set('76561198000000001', '76561190000000001');
    expect(anonimizar('id 76561198000000001', m)).toBe('id 76561190000000001');
  });
  it('token vira null ou slug', () => {
    const m = mapaVazio();
    m.tokens.set('tok-fora', null);
    m.tokens.set('tok-dentro', 'jgbr11');
    expect(anonimizar('{"publicToken": "tok-fora"} {"publicToken":"tok-fora"} /p/tok-fora', m)).toBe(
      '{"publicToken":null} {"publicToken":null} /p/',
    );
    expect(anonimizar('/p/tok-dentro', m)).toBe('/p/jgbr11');
  });
});

describe('anonimizarJson', () => {
  it('troca nome só em chaves de nome com valor exato', () => {
    const m = mapaVazio();
    m.nomes.set('2', 'Jogador 2');
    m.nomes.set('T', 'Jogador 3');
    m.nomes.set('Fulano_99', 'JGBR11');
    const r = anonimizarJson(
      { kills: 2, side: 'T', playerName: '2', nick: 'T', nome: 'Fulano_99', info: 'Fulano_99', n: [{ name: 'Fulano_99' }] },
      m,
    );
    expect(r).toEqual({
      kills: 2,
      side: 'T',
      playerName: 'Jogador 2',
      nick: 'Jogador 3',
      nome: 'JGBR11',
      info: 'Fulano_99',
      n: [{ name: 'JGBR11' }],
    });
  });
  it('steamId dentro de string e tokens', () => {
    const m = mapaVazio();
    m.steamIds.set('76561198000000001', '76561190000000001');
    m.tokens.set('tok-fora', null);
    m.tokens.set('tok-dentro', 'jgbr11');
    const r = anonimizarJson(
      {
        url: 'https://x/profiles/76561198000000001/y',
        publicToken: 'tok-fora',
        ownerToken: 'tok-fora',
        link: '/p/tok-dentro',
        outro: '/p/tok-fora',
        pt: 'tok-dentro',
      },
      m,
    );
    expect(r).toEqual({
      url: 'https://x/profiles/76561190000000001/y',
      publicToken: null,
      ownerToken: null,
      link: '/p/jgbr11',
      outro: '/p/',
      pt: 'jgbr11',
    });
  });
  it('apaga URLs de avatar', () => {
    const r = anonimizarJson(
      { a: 'https://avatars.steamstatic.com/x.jpg', b: '//cdn.akamaihd.net/y', c: 'https://ok.com/z' },
      mapaVazio(),
    );
    expect(r).toEqual({ a: '', b: '', c: 'https://ok.com/z' });
  });
});

describe('anonimizarPagina', () => {
  const nome = '</3 Fulano';
  const mapa = (): Mapeamento => {
    const m = mapaVazio();
    m.nomes.set(nome, 'Jogador 2');
    m.nomes.set('2', 'Jogador 3');
    m.nomes.set('T', 'Jogador 4');
    m.steamIds.set('76561198000000001', '76561190000000001');
    return m;
  };
  const pagina =
    '<script>const x = 2; const side = "T"; const DASH = {"players":[{"playerName":"<\\/3 Fulano","kills":2,"side":"T","url":"https://s/76561198000000001"}]};' +
    ' if (x === 2) {}</script><a href="/steam/76561198000000001">T 2</a>';

  it('anonimiza dentro do blob e preserva o código fora', () => {
    const r = anonimizarPagina(pagina, mapa());
    expect(r).toContain('"playerName":"Jogador 2"');
    expect(r).toContain('"kills":2');
    expect(r).toContain('"side":"T"');
    expect(r).toContain('const x = 2; const side = "T"; const DASH = ');
    expect(r).toContain(' if (x === 2) {}</script>');
    expect(r).toContain('https://s/76561190000000001');
    expect(r).toContain('href="/steam/76561190000000001"');
    expect(r).not.toContain('76561198000000001');
  });
  it('detector solto: >0 antes e 0 depois', () => {
    const antes = contarNomesReais(pagina, [nome]);
    const depois = contarNomesReais(anonimizarPagina(pagina, mapa()), [nome]);
    expect(antes.ocorrencias).toBeGreaterThan(0);
    expect(depois.ocorrencias).toBe(0);
  });
  it('processa DATA, chaves com } e ; dentro de strings', () => {
    const m = mapaVazio();
    m.nomes.set('Zé}; "x"', 'Jogador 2');
    const html = 'a;const DATA = {"nome":"Zé}; \\"x\\"","k":[1,2]};console.log(1);';
    expect(anonimizarPagina(html, m)).toBe('a;const DATA = {"nome":"Jogador 2","k":[1,2]};console.log(1);');
  });
  it('reescapa </ dentro do blob', () => {
    const m = mapaVazio();
    const html = 'const DASH = {"t":"a<\\/b"};';
    expect(anonimizarPagina(html, m)).toBe('const DASH = {"t":"a<\\/b"};');
  });
});

describe('contarNomesReais (detector solto)', () => {
  it('normaliza escapes e ignora caixa', () => {
    const textos = [
      'FULANO_99',
      'Fulano\\u005f99',
      'Fulano&#95;99',
      'Fulano&#x5F;99',
      'Fulano%5F99',
      'xxfulano_99xx',
    ];
    for (const t of textos) expect(contarNomesReais(t, ['Fulano_99']).ocorrencias).toBe(1);
  });
  it('nomes curtos só são sinalizados', () => {
    expect(contarNomesReais('T 2 TT', ['T', '2', 'Ana'])).toEqual({ ocorrencias: 0, nomesCurtosIgnorados: 2 });
  });
  it('limpo retorna 0', () => {
    expect(contarNomesReais('Jogador 2', ['Fulano_99'])).toEqual({ ocorrencias: 0, nomesCurtosIgnorados: 0 });
  });
});

describe('reescreverLinks', () => {
  it('prefixa os três tipos de aspas', () => {
    expect(reescreverLinks(`<a href="/p/x"> '/m/1' \`/m/2\``)).toBe(
      `<a href="${BASE}/p/x"> '${BASE}/m/1' \`${BASE}/m/2\``,
    );
  });
  it('não toca em já reescritos nem em /api/', () => {
    const s = `"${BASE}/p/x" "/api/p/x"`;
    expect(reescreverLinks(s)).toBe(s);
  });
});

describe('removerAvatares', () => {
  it('remove URLs de avatar, inclusive protocol-relative', () => {
    const s =
      'a https://avatars.steamstatic.com/x.jpg b https://cdn.akamaihd.net/y.png c //cdn.steamstatic.com/z.jpg d https://ok.com/z';
    expect(removerAvatares(s)).toBe('a  b  c  d https://ok.com/z');
  });
});

describe('injetarDemo', () => {
  const html = '<html><head><title>t</title></head><body class="a"><main>x</main></body></html>';
  const scriptDe = (r: string) => r.match(/<script>([\s\S]*?)<\/script>/)![1];

  it('insere uma faixa e um script acessíveis', () => {
    const r = injetarDemo(html, '28/10/2026');
    expect(r.match(/class="demo-faixa"/g)).toHaveLength(1);
    expect(r.match(/<script>/g)).toHaveLength(1);
    expect(r).toContain('role="note"');
    expect(r).toContain('DEMO · dados reais de partidas de CS2, congelados em 28/10/2026');
    expect(r).toContain('#f3e600');
    expect(r).toContain('#0d0d0d');
    expect(r).toContain('position:relative');
    expect(r).toContain('z-index:6');
    expect(r.indexOf('<script>')).toBeGreaterThan(r.indexOf('<head>'));
    expect(r.indexOf('demo-faixa"')).toBeGreaterThan(r.indexOf('<body class="a">'));
    expect(r.indexOf('demo-faixa"')).toBeLessThan(r.indexOf('<main>'));
  });
  it('insere depois do meta charset quando existe', () => {
    const r = injetarDemo('<head><meta charset="utf-8"><title>t</title></head><body></body>', 'd');
    expect(r.indexOf('<script>')).toBeGreaterThan(r.indexOf('<meta charset'));
    expect(r.indexOf('<script>')).toBeLessThan(r.indexOf('<title>'));
  });
  it('não confunde <header> com <head>', () => {
    const r = injetarDemo('<header>x</header><head><title>t</title></head><body></body>', 'd');
    expect(r.indexOf('<script>')).toBeGreaterThan(r.indexOf('<head>'));
  });
  it('script reescreve /api/ e deixa o resto', () => {
    const r = injetarDemo(html, '28/10/2026');
    const chamadas: unknown[] = [];
    const janela: any = {
      fetch: (entrada: unknown) => {
        chamadas.push(entrada);
        return Promise.resolve('ok');
      },
    };
    new Function('window', scriptDe(r))(janela);
    janela.fetch('/api/x/y?b=2&a=1');
    janela.fetch('/outra/coisa');
    janela.fetch('https://exemplo.com/api/x');
    expect(chamadas).toEqual([
      '/demo/countatic/api/x/y__a=1&b=2.json',
      '/outra/coisa',
      'https://exemplo.com/api/x',
    ]);
  });
  it('script reescreve Request-like e URL same-origin', () => {
    const r = injetarDemo(html, 'd');
    const chamadas: unknown[] = [];
    const janela: any = {
      location: { origin: 'http://h' },
      fetch: (e: unknown) => (chamadas.push(e), Promise.resolve()),
    };
    new Function('window', scriptDe(r))(janela);
    janela.fetch({ url: 'http://h/api/a/b?z=1' });
    janela.fetch(new URL('http://h/api/c?y=2'));
    expect(chamadas).toEqual(['/demo/countatic/api/a/b__z=1.json', '/demo/countatic/api/c__y=2.json']);
  });
});

describe('extrairBlobs', () => {
  it('devolve DASH e DATA decodificados, respeitando strings e <\/', () => {
    const html =
      'var a = 1; const DASH = {"t":"x}; <\\/script>","n":[1]};' +
      ' const DATA = {"k":2}; const DATAX = 3; const DATA = 4;';
    expect(extrairBlobs(html)).toEqual([{ t: 'x}; </script>', n: [1] }, { k: 2 }]);
  });
  it('sem blob devolve lista vazia', () => {
    expect(extrairBlobs('<p>nada</p>')).toEqual([]);
  });
});

describe('detectarNomes (capturados soltos, só-banco com fronteira)', () => {
  it('capturado: substring sem fronteira, ignorando caixa', () => {
    expect(detectarNomes('xxfulano_99yy', ['Fulano_99'], []).ocorrencias).toBe(1);
  });
  it('só no banco: ignora quando é pedaço de palavra', () => {
    expect(detectarNomes('K/D Zebemente negativo', [], ['Zeb']).ocorrencias).toBe(0);
  });
  it('só no banco: conta como palavra inteira, inclusive escapada', () => {
    expect(detectarNomes('gg zeb! e "Zeb" e \\u005aeb', [], ['Zeb']).ocorrencias).toBe(3);
    expect(detectarNomes('Zeb_1 e 9Zeb e Zebé', [], ['Zeb']).ocorrencias).toBe(0);
  });
  it('nome nas duas listas vale como capturado (solto)', () => {
    expect(detectarNomes('Zebemente', ['Zeb'], ['Zeb']).ocorrencias).toBe(1);
  });
  it('nomes curtos são só sinalizados, uma vez cada', () => {
    expect(detectarNomes('ab cd', ['ab'], ['ab', 'cd'])).toEqual({ ocorrencias: 0, nomesCurtosIgnorados: 2 });
  });
});

describe('trechoMascarado (exemplos impressos no terminal)', () => {
  const longo = 'Qwertyuiopasdfghjklzxcvbnmqwer'; // 30 caracteres, fictício
  const re = reMascara(['Zeb', longo, 'Zeb Fulaninho']);

  it('mascara tudo mesmo com nomes densos dos dois lados do acerto', () => {
    const lado = Array(8).fill(longo).join(' ');
    const texto = `${lado} Zeb ${lado}`;
    const i = texto.indexOf('Zeb');
    const r = trechoMascarado(texto, i, i + 3, re);
    expect(r).toMatch(/^[* ]+$/);
    expect(r).toContain('***');
    expect(r.length).toBeLessThanOrEqual(40 + 3 + 40);
  });
  it('acerto no começo e no fim do texto', () => {
    expect(trechoMascarado('Zeb e mais nada', 0, 3, re)).toBe('*** e mais nada');
    const t = 'nada antes de Zeb';
    expect(trechoMascarado(t, t.length - 3, t.length, re)).toBe('nada antes de ***');
  });
  it('acerto dentro de um nome sensível mais longo some inteiro', () => {
    const t = 'gg Zeb Fulaninho gg';
    const r = trechoMascarado(t, 3, 6, re);
    expect(r).toBe('gg *** gg');
    expect(r).not.toMatch(/fulan/i);
  });
  it('recorta ±raio em volta do acerto, depois de mascarar', () => {
    const t = 'a'.repeat(100) + ' Zeb ' + 'b'.repeat(100);
    expect(trechoMascarado(t, 101, 104, re, 5)).toBe('aaaa ***' + ' bbbb');
  });
  it('reMascara ignora caixa com dobra Unicode e cobre SteamID e UUID', () => {
    const r = reMascara(['Éclair']);
    expect('ÉCLAIR éclair 76561198000000001 123e4567-e89b-12d3-a456-426614174000'.replace(r, '***')).toBe('*** *** *** ***');
  });
});
