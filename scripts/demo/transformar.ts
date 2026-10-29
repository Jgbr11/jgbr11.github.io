// Transformações puras usadas pela captura da demo do CounTatic.
export const BASE = '/demo/countatic';

export interface Mapeamento {
  nomes: Map<string, string>; // nome real -> 'JGBR11' | 'Jogador N'
  steamIds: Map<string, string>; // real -> falso
  tokens: Map<string, string | null>; // token -> slug ou null (fora da demo)
}

// Autocontida: é serializada com .toString() e embutida na página.
export function caminhoDaApi(url: string): string {
  const base = '/demo/countatic';
  const i = url.indexOf('?');
  const caminho = i < 0 ? url : url.slice(0, i);
  const query = i < 0 ? '' : url.slice(i + 1);
  const partes = query === '' ? [] : query.split('&').sort();
  return base + caminho + (partes.length ? '__' + partes.join('&') : '') + '.json';
}

// Texto livre: SOMENTE steamIds e tokens. Nomes nunca são trocados textualmente.
export function anonimizar(texto: string, mapa: Mapeamento): string {
  let r = texto;
  for (const [tok, slug] of mapa.tokens) {
    if (slug === null) {
      r = r.split(`"publicToken":"${tok}"`).join('"publicToken":null');
      r = r.split(`"publicToken": "${tok}"`).join('"publicToken":null');
      r = r.split(tok).join('');
    } else {
      r = r.split(tok).join(slug);
    }
  }
  for (const [real, falso] of mapa.steamIds) r = r.split(real).join(falso);
  return r;
}

const CHAVE_NOME = /name|nome|nick/i;
const CHAVE_TOKEN = /^(publicToken|ownerToken)$/i;
const URL_AVATAR = /^(https?:)?\/\/[^"]*(steamstatic|akamaihd|avatars)/i;

function anonimizarString(s: string, mapa: Mapeamento): string {
  if (URL_AVATAR.test(s)) return '';
  let r = s;
  for (const [tok, slug] of mapa.tokens) r = r.split(tok).join(slug ?? '');
  for (const [real, falso] of mapa.steamIds) r = r.split(real).join(falso);
  return r;
}

// Percorre o valor e devolve uma cópia anonimizada (estrutural).
export function anonimizarJson(valor: unknown, mapa: Mapeamento): unknown {
  if (typeof valor === 'string') return anonimizarString(valor, mapa);
  if (Array.isArray(valor)) return valor.map((v) => anonimizarJson(v, mapa));
  if (valor !== null && typeof valor === 'object') {
    const saida: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      if (typeof v === 'string' && CHAVE_TOKEN.test(k) && mapa.tokens.get(v) === null) {
        saida[k] = null;
      } else if (typeof v === 'string' && CHAVE_NOME.test(k) && mapa.nomes.has(v)) {
        saida[k] = mapa.nomes.get(v);
      } else {
        saida[k] = anonimizarJson(v, mapa);
      }
    }
    return saida;
  }
  return valor;
}

// Fim (exclusivo) do objeto/array JSON que começa em `inicio`, respeitando strings.
function fimDoJson(texto: string, inicio: number): number {
  let prof = 0;
  let emString = false;
  for (let i = inicio; i < texto.length; i++) {
    const c = texto[i];
    if (emString) {
      if (c === '\\') i++;
      else if (c === '"') emString = false;
    } else if (c === '"') emString = true;
    else if (c === '{' || c === '[') prof++;
    else if (c === '}' || c === ']') {
      prof--;
      if (prof === 0) return i + 1;
    }
  }
  throw new Error('Blob JSON não terminou');
}

// Objetos `const DASH/DATA = {…}` da página, já decodificados (mesmo critério de anonimizarPagina).
export function extrairBlobs(html: string): unknown[] {
  const re = /const (?:DASH|DATA) = /g;
  const blobs: unknown[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const inicio = m.index + m[0].length;
    if (html[inicio] !== '{' && html[inicio] !== '[') continue;
    const fim = fimDoJson(html, inicio);
    blobs.push(JSON.parse(html.slice(inicio, fim).replace(/<\\\//g, '</')));
    re.lastIndex = fim;
  }
  return blobs;
}

function limparForaDosBlobs(texto: string, mapa: Mapeamento): string {
  return removerAvatares(anonimizar(texto, mapa));
}

export function anonimizarPagina(html: string, mapa: Mapeamento): string {
  const re = /const (?:DASH|DATA) = /g;
  let saida = '';
  let cursor = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const inicio = m.index + m[0].length;
    if (html[inicio] !== '{' && html[inicio] !== '[') continue;
    const fim = fimDoJson(html, inicio);
    const bruto = html.slice(inicio, fim).replace(/<\\\//g, '</');
    const novo = JSON.stringify(anonimizarJson(JSON.parse(bruto), mapa)).replace(/<\//g, '<\\/');
    saida += limparForaDosBlobs(html.slice(cursor, inicio), mapa) + novo;
    cursor = fim;
    re.lastIndex = fim;
  }
  return saida + limparForaDosBlobs(html.slice(cursor), mapa);
}

export function reescreverLinks(html: string): string {
  return html.replace(/(["'`])\/(p|m)\//g, (_, q: string, t: string) => `${q}${BASE}/${t}/`);
}

export function removerAvatares(texto: string): string {
  return texto.replace(/(?:https?:)?\/\/[^\s"'<>)]*(?:steamstatic|akamaihd|avatars)[^\s"'<>)]*/g, '');
}

function normalizar(texto: string): string {
  const porCodigo = (n: number) => {
    try {
      return String.fromCodePoint(n);
    } catch {
      return '';
    }
  };
  return texto
    .replace(/<\\\//g, '</')
    .replace(/\\u([0-9a-f]{4})/gi, (_, h: string) => porCodigo(parseInt(h, 16)))
    .replace(/\\"/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => porCodigo(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => porCodigo(parseInt(d, 10)))
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, '&')
    .replace(/(?:%[0-9a-f]{2})+/gi, (seq) => {
      try {
        return decodeURIComponent(seq);
      } catch {
        return seq;
      }
    });
}

// Detector solto (última barreira): substring, sem fronteira, sem diferenciar caixa.
export function contarNomesReais(
  texto: string,
  nomesReais: string[],
): { ocorrencias: number; nomesCurtosIgnorados: number } {
  const alvo = normalizar(texto).toLowerCase();
  let ocorrencias = 0;
  let nomesCurtosIgnorados = 0;
  for (const nome of nomesReais) {
    if (nome.length < 3) {
      nomesCurtosIgnorados++;
      continue;
    }
    ocorrencias += alvo.split(nome.toLowerCase()).length - 1;
  }
  return { ocorrencias, nomesCurtosIgnorados };
}

const FRONTEIRA_ANTES = '(?<![\\p{L}\\p{N}_])';
const FRONTEIRA_DEPOIS = '(?![\\p{L}\\p{N}_])';

// Detector da verificação (b): nomes dos jogadores capturados usam a busca solta
// (substring); nomes que existem só no banco (fora da demo) exigem palavra inteira,
// para um apelido curto não disparar dentro de uma palavra comum do texto fixo.
export function detectarNomes(
  texto: string,
  capturados: string[],
  soNoBanco: string[],
): { ocorrencias: number; nomesCurtosIgnorados: number } {
  const soltos = [...new Set(capturados)];
  const r = contarNomesReais(texto, soltos);
  const alvo = normalizar(texto);
  const jaContados = new Set(soltos);
  for (const nome of new Set(soNoBanco)) {
    if (jaContados.has(nome)) continue;
    if (nome.length < 3) {
      r.nomesCurtosIgnorados++;
      continue;
    }
    const esc = nome.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    r.ocorrencias += (alvo.match(new RegExp(FRONTEIRA_ANTES + esc + FRONTEIRA_DEPOIS, 'giu')) ?? []).length;
  }
  return r;
}

// ─── Máscara para o que é impresso no terminal (avisos e abortos) ─────────────

// Uma regex só (do mais longo para o mais curto), mais SteamIDs e UUIDs; `u` para a
// dobra de caixa bater com a busca `giu` dos detectores.
export function reMascara(sensiveis: string[]): RegExp {
  const partes = [...new Set(sensiveis)]
    .filter((s) => s !== '')
    .sort((a, b) => b.length - a.length)
    .map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  partes.push('7656119\\d{10}', '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');
  return new RegExp(partes.join('|'), 'giu');
}

const SENTINELA = '\u0000ACERTO\u0000';

// Trecho de ±raio em volta de texto[inicio, fim), com tudo mascarado ANTES do recorte.
// O acerto (ampliado para cobrir qualquer trecho sensível que o sobreponha) vira uma
// sentinela; o texto inteiro é mascarado; só então se recorta em volta da sentinela.
// Assim nenhuma borda de janela consegue cortar um nome ao meio.
export function trechoMascarado(texto: string, inicio: number, fim: number, re: RegExp, raio = 40): string {
  const g = new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g');
  let a = inicio;
  let b = fim;
  for (const m of texto.matchAll(g)) {
    const s = m.index ?? 0;
    const e = s + m[0].length;
    if (s < b && e > a) {
      a = Math.min(a, s);
      b = Math.max(b, e);
    }
  }
  const mascarado = (texto.slice(0, a) + SENTINELA + texto.slice(b)).replace(g, '***');
  const k = mascarado.indexOf(SENTINELA);
  return mascarado.slice(Math.max(0, k - raio), k) + '***' + mascarado.slice(k + SENTINELA.length, k + SENTINELA.length + raio);
}

const ESTILO = `<style>a[href$="/login"]{display:none!important}.demo-faixa{position:relative;z-index:6;background:#f3e600;color:#0d0d0d;font:600 14px/1.4 system-ui,sans-serif;text-align:center;padding:8px 16px}</style>`;

export function injetarDemo(html: string, dataCaptura: string): string {
  const script =
    `<script>(function(){var caminho=${caminhoDaApi.toString()};var f=window.fetch;` +
    `window.fetch=function(e,i){var u=typeof e==='string'?e:(typeof URL!=='undefined'&&e instanceof URL)?e.href:(e&&e.url)||'';` +
    `var o=window.location&&window.location.origin;if(o&&u.indexOf(o)===0)u=u.slice(o.length);` +
    `if(u.indexOf('/api/')===0)return f.call(window,caminho(u),i);return f.apply(window,arguments)}})();</script>`;
  const faixa = `<div class="demo-faixa" role="note">DEMO · dados reais de partidas de CS2, congelados em ${dataCaptura}</div>`;
  const cabeca = /<head(\s[^>]*)?>/i.exec(html);
  let r = html;
  if (cabeca) {
    let pos = cabeca.index + cabeca[0].length;
    const resto = html.slice(pos);
    const meta = /<meta[^>]*\bcharset\b[^>]*>/i.exec(resto.slice(0, Math.max(resto.search(/<\/head>/i), 0) || resto.length));
    if (meta) pos += meta.index + meta[0].length;
    r = html.slice(0, pos) + script + ESTILO + html.slice(pos);
  }
  return r.replace(/<body(\s[^>]*)?>/i, (b) => b + faixa);
}
