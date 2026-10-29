// Captura a interface real do CounTatic (ligado em localhost:8080) e grava um
// retrato estático e anonimizado em public/demo/countatic/.
//
// Privacidade: nada real (nome, SteamID, token, avatar) é impresso. O resumo
// mostra só contagens; avisos mostram trechos com os nomes mascarados (***).
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import {
  BASE,
  anonimizar,
  anonimizarJson,
  anonimizarPagina,
  caminhoDaApi,
  detectarNomes,
  extrairBlobs,
  injetarDemo,
  reescreverLinks,
  reMascara,
  removerAvatares,
  trechoMascarado,
  type Mapeamento,
} from './demo/transformar.ts';

const ORIGEM = 'http://localhost:8080';
const PARTIDAS = [28, 21, 27, 22, 26];
const JOGADOR_ID = 2;
const SLUG = 'jgbr11';
const SAIDA = join(process.cwd(), 'public', 'demo', 'countatic');
const NOME_OK = /^(JGBR11|Jogador \d+)$/;
const STEAMID = /7656119\d{10}/g;
const STEAMID_FALSO = /^7656119000000\d{4}$/;
const UUID = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const AVATAR = /steamstatic|akamaihd|avatars/i;
const PARALELO = 4;

class Aborto extends Error {}

function falha(msg: string): never {
  throw new Aborto(msg);
}

// ─── Banco (todas as colunas em HEX: nada de escape do cliente mysql) ─────────
// Padrões do container Docker de desenvolvimento local do CounTatic (não é segredo real).
const DB_USER = process.env.COUNTATIC_DB_USER ?? 'countatic';
const DB_PASS = process.env.COUNTATIC_DB_PASS ?? 'countatic_dev';

function sql(consulta: string): (string | null)[][] {
  const saida = execFileSync(
    'docker',
    ['exec', 'countatic-mysql', 'mysql', `-u${DB_USER}`, `-p${DB_PASS}`, '--default-character-set=utf8mb4', '-N', '-B', 'countatic', '-e', consulta],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  return saida
    .split(/\r?\n/)
    .filter((l) => l !== '')
    .map((l) => l.split('\t').map((c) => (c === 'NULL' ? null : Buffer.from(c, 'hex').toString('utf8'))));
}

// ─── HTTP ─────────────────────────────────────────────────────────────────────
interface Resposta {
  status: number;
  corpo: string;
}

async function baixar(caminho: string): Promise<Resposta> {
  const r = await fetch(ORIGEM + caminho, { redirect: 'manual', signal: AbortSignal.timeout(120_000) });
  return { status: r.status, corpo: await r.text() };
}

async function emLotes<T, R>(itens: T[], fn: (t: T) => Promise<R>): Promise<R[]> {
  const res: R[] = new Array(itens.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: PARALELO }, async () => {
      while (i < itens.length) {
        const k = i++;
        res[k] = await fn(itens[k]);
      }
    }),
  );
  return res;
}

// ─── Percurso de JSON ─────────────────────────────────────────────────────────
type Visita = (obj: Record<string, unknown>) => void;

function visitarObjetos(valor: unknown, fn: Visita): void {
  if (Array.isArray(valor)) valor.forEach((v) => visitarObjetos(v, fn));
  else if (valor !== null && typeof valor === 'object') {
    fn(valor as Record<string, unknown>);
    Object.values(valor).forEach((v) => visitarObjetos(v, fn));
  }
}

function visitarStrings(valor: unknown, fn: (s: string, caminho: string, chave: string) => void, caminho = '$', chave = ''): void {
  if (typeof valor === 'string') fn(valor, caminho, chave);
  else if (Array.isArray(valor)) valor.forEach((v, i) => visitarStrings(v, fn, `${caminho}[${i}]`, chave));
  else if (valor !== null && typeof valor === 'object') {
    for (const [k, v] of Object.entries(valor)) {
      // A chave também é texto que vai para a página.
      fn(k, `${caminho}{chave}`, '');
      visitarStrings(v, fn, `${caminho}.${k}`, k);
    }
  }
}

function escaparRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Principal ────────────────────────────────────────────────────────────────
async function main(): Promise<void> {
  // 1. Fatos do banco (mantidos só em memória).
  const [jogador] = sql(`SELECT HEX(public_token), HEX(steam_id64) FROM players WHERE id = ${JOGADOR_ID}`);
  if (!jogador?.[0] || !jogador[1]) falha('jogador 2 sem token ou SteamID no banco');
  const [tokJoao, sidJoao] = jogador as [string, string];

  const tokPartida = new Map<number, string>();
  for (const [id, tok] of sql(`SELECT HEX(CAST(id AS CHAR)), HEX(public_token) FROM matches WHERE id IN (${PARTIDAS.join(',')})`)) {
    if (id && tok) tokPartida.set(Number(id), tok);
  }
  for (const id of PARTIDAS) if (!tokPartida.has(id)) falha(`partida ${id} sem token no banco`);

  const tokensDoBanco = sql('SELECT HEX(public_token) FROM players UNION ALL SELECT HEX(public_token) FROM matches')
    .map((l) => l[0])
    .filter((t): t is string => !!t);
  const nomesDoBanco = new Map<string, string[]>();
  for (const [sid, nome] of sql('SELECT HEX(steam_id64), HEX(display_name) FROM players')) {
    if (!sid || !nome) continue;
    nomesDoBanco.set(sid, [...(nomesDoBanco.get(sid) ?? []), nome]);
  }
  const segredos = sql('SELECT HEX(auth_code), HEX(latest_share_code), HEX(avatar_url) FROM players')
    .flat()
    .filter((s): s is string => !!s && s.length >= 6);

  // 2a. Páginas, sem transformar.
  const paginas: { saida: string; caminho: string }[] = [
    { saida: `p/${SLUG}/index.html`, caminho: `/p/${tokJoao}` },
    { saida: `p/${SLUG}/partidas/index.html`, caminho: `/p/${tokJoao}/partidas` },
    ...PARTIDAS.map((id) => ({ saida: `m/${id}/index.html`, caminho: `/m/${tokPartida.get(id)}` })),
  ];
  const brutas = await emLotes(paginas, (p) => baixar(p.caminho));
  brutas.forEach((r, i) => {
    if (r.status !== 200) falha(`página ${paginas[i].saida} respondeu ${r.status}`);
  });
  const blobsBrutos = brutas.map((r, i) => {
    const b = extrairBlobs(r.corpo);
    if (b.length < 1) falha(`página ${paginas[i].saida} sem blob DASH/DATA`);
    return b;
  });

  // Fatos dos templates capturados: métricas e limite do trend.
  const tendencias = (html: string, onde: string) => {
    const m = /const TENDENCIAS = \[([^\]]*)\]/.exec(html);
    const lim = /\/trend`\s*\+\s*`\?metric=\$\{encodeURIComponent\(metrica\)\}&limit=(\d+)`/.exec(html);
    if (!m || !lim) falha(`não achei TENDENCIAS/limit no template de ${onde}`);
    const metricas = [...m[1].matchAll(/"([A-Za-z]+)"/g)].map((x) => x[1]);
    if (!metricas.length) falha(`TENDENCIAS vazio em ${onde}`);
    return { metricas, limite: Number(lim[1]) };
  };
  const trendPainel = tendencias(brutas[0].corpo, 'painel');
  const trendPartida = tendencias(brutas[2].corpo, 'partida');
  for (const fim of ['/weapons`', '/highlights`', '/sides`']) {
    if (!brutas[2].corpo.includes(fim)) falha(`template da partida não chama ${fim}`);
  }

  // 2b. URLs da API (SteamIDs reais).
  const urls = new Set<string>();
  for (const m of trendPainel.metricas) urls.add(`/api/players/${sidJoao}/trend?metric=${m}&limit=${trendPainel.limite}`);
  PARTIDAS.forEach((id, k) => {
    const data = blobsBrutos[2 + k][0] as { matchId?: number; players?: { steamId64?: string }[] };
    if (data.matchId !== id) falha(`blob da partida ${id} com matchId inesperado`);
    if (!data.players?.length) falha(`partida ${id} sem jogadores`);
    for (const p of data.players) {
      if (!p.steamId64) falha(`partida ${id}: jogador sem steamId64`);
      for (const r of ['weapons', 'highlights', 'sides']) urls.add(`/api/matches/${id}/players/${p.steamId64}/${r}`);
      for (const m of trendPartida.metricas) urls.add(`/api/players/${p.steamId64}/trend?metric=${m}&limit=${trendPartida.limite}`);
    }
  });
  const listaUrls = [...urls];
  const respostas = await emLotes(listaUrls, baixar);
  const naoOk = new Map<string, number>(); // "tipo status" -> contagem
  const api: { url: string; valor: unknown }[] = [];
  respostas.forEach((r, i) => {
    const url = listaUrls[i];
    if (r.status < 200 || r.status > 299) {
      const tipo = url.includes('/trend') ? 'trend' : url.slice(url.lastIndexOf('/') + 1);
      naoOk.set(`${tipo} ${r.status}`, (naoOk.get(`${tipo} ${r.status}`) ?? 0) + 1);
      return;
    }
    let valor: unknown;
    try {
      valor = JSON.parse(r.corpo);
    } catch {
      falha(`resposta ${i} da API não é JSON`);
    }
    api.push({ url, valor });
  });

  // 1. Mapeamento a partir dos dados brutos (blobs e API).
  const mapa: Mapeamento = { nomes: new Map(), steamIds: new Map(), tokens: new Map() };
  const apelido = new Map<string, string>(); // sid real -> 'JGBR11' | 'Jogador N'
  let proximo = 2;
  let conflitos = 0;
  const registrarSid = (sid: string) => {
    if (apelido.has(sid)) return;
    const n = sid === sidJoao ? 1 : proximo++;
    apelido.set(sid, n === 1 ? 'JGBR11' : `Jogador ${n}`);
    mapa.steamIds.set(sid, `7656119000000${String(n).padStart(4, '0')}`);
  };
  const registrarNome = (nome: unknown, sid: string) => {
    if (typeof nome !== 'string' || nome.trim() === '') return;
    const atual = mapa.nomes.get(nome);
    if (atual !== undefined && atual !== apelido.get(sid)) conflitos++;
    else mapa.nomes.set(nome, apelido.get(sid)!);
  };
  registrarSid(sidJoao);
  const coletar = (valor: unknown) =>
    visitarObjetos(valor, (o) => {
      const sid = typeof o.steamId64 === 'string' ? o.steamId64 : typeof o.steamId === 'string' ? o.steamId : null;
      if (!sid) return;
      registrarSid(sid);
      if ('playerName' in o) registrarNome(o.playerName, sid);
    });
  blobsBrutos.forEach((b) => coletar(b));
  api.forEach((a) => coletar(a.valor));
  for (const sid of apelido.keys()) for (const nome of nomesDoBanco.get(sid) ?? []) registrarNome(nome, sid);

  mapa.tokens.set(tokJoao, SLUG);
  for (const [id, tok] of tokPartida) mapa.tokens.set(tok, String(id));
  for (const tok of tokensDoBanco) if (!mapa.tokens.has(tok)) mapa.tokens.set(tok, null);

  // Nomes reais que de fato precisam sumir (o do João é o próprio apelido).
  const nomesReais = [...mapa.nomes].filter(([real, ap]) => real !== ap).map(([real]) => real);
  // Os detectores olham TODO display_name do banco, não só os dos jogadores capturados.
  // Fica de fora só o nome que é o próprio apelido (o JGBR11 do João).
  const nomesDetector = [
    ...new Set([...nomesReais, ...[...nomesDoBanco.values()].flat()].filter((n) => n.trim() !== '' && mapa.nomes.get(n) !== n)),
  ];
  const sensiveis = [...mapa.steamIds.keys(), ...mapa.tokens.keys(), ...segredos];
  // Máscara de tudo que é impresso (ver reMascara/trechoMascarado em transformar.ts).
  const reSensivel = reMascara([...nomesDetector, ...sensiveis]);
  const mascarar = (s: string) => s.replace(reSensivel, '***');

  // 3. Transformação.
  const dataCaptura = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const saidas = new Map<string, string>(); // caminho relativo -> conteúdo
  const blobsFinais: unknown[] = [];
  brutas.forEach((r, i) => {
    let t = anonimizarPagina(r.corpo, mapa);
    t = anonimizar(t, mapa);
    t = removerAvatares(t);
    t = reescreverLinks(t);
    t = injetarDemo(t, dataCaptura);
    const b = extrairBlobs(t);
    if (b.length !== blobsBrutos[i].length) falha(`página ${paginas[i].saida}: blobs mudaram de ${blobsBrutos[i].length} para ${b.length}`);
    blobsFinais.push(...b);
    saidas.set(paginas[i].saida, t);
  });
  const jsonsFinais: unknown[] = [];
  for (const { url, valor } of api) {
    const destino = caminhoDaApi(anonimizar(url, mapa)).slice(BASE.length + 1);
    if (saidas.has(destino)) falha('dois arquivos da API com o mesmo caminho');
    const novo = anonimizarJson(valor, mapa);
    jsonsFinais.push(novo);
    saidas.set(destino, JSON.stringify(novo));
  }
  saidas.set(
    'index.html',
    `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">` +
      `<meta name="viewport" content="width=device-width,initial-scale=1">` +
      `<meta http-equiv="refresh" content="0; url=${BASE}/p/${SLUG}/">` +
      `<title>Demo do CounTatic</title></head><body>` +
      `<p><a href="${BASE}/p/${SLUG}/">Abrir a demo do CounTatic</a></p></body></html>\n`,
  );

  // 4. Verificação (aborta sem gravar nada).
  // (a) Estrutural sobre todo JSON + literal sobre todo arquivo.
  const problemas: string[] = [];
  const todosJson = [...blobsFinais, ...jsonsFinais];
  let nomesVerificados = 0;
  for (const v of todosJson) {
    visitarObjetos(v, (o) => {
      if (!('playerName' in o) || o.playerName === null) return;
      nomesVerificados++;
      if (typeof o.playerName !== 'string' || !NOME_OK.test(o.playerName)) problemas.push('playerName fora do padrão');
    });
  }
  const sensiveisMin = sensiveis.map((s) => s.toLowerCase());
  for (const [arquivo, conteudo] of saidas) {
    const baixo = conteudo.toLowerCase();
    if (sensiveisMin.some((s) => baixo.includes(s))) problemas.push(`${arquivo}: SteamID/token/segredo real`);
    if (/steamstatic|akamaihd/i.test(conteudo)) problemas.push(`${arquivo}: URL de avatar`);
    if (conteudo.includes('localhost:8080')) problemas.push(`${arquivo}: localhost:8080`);
    if ((conteudo.match(UUID) ?? []).length) problemas.push(`${arquivo}: UUID`);
    for (const sid of conteudo.match(STEAMID) ?? []) if (!STEAMID_FALSO.test(sid)) problemas.push(`${arquivo}: SteamID não falso`);
  }
  for (const v of todosJson) {
    visitarStrings(v, (s, caminho) => {
      if (/^(https?:)?\/\//i.test(s) && AVATAR.test(s)) problemas.push(`${caminho}: URL de avatar`);
    });
  }
  if (problemas.length) {
    const unicos = [...new Set(problemas)];
    falha(`verificação estrutural falhou (${problemas.length}):\n  ${unicos.slice(0, 20).map(mascarar).join('\n  ')}`);
  }

  // (b) Detector só sobre os valores string dos JSON: os nomes capturados usam a
  // busca solta (substring); os que existem só no banco exigem palavra inteira.
  const valores: { s: string; caminho: string }[] = [];
  todosJson.forEach((v) => visitarStrings(v, (s, caminho) => valores.push({ s, caminho })));
  const soNoBanco = nomesDetector.filter((n) => !nomesReais.includes(n));
  const deteccao = detectarNomes(valores.map((x) => x.s).join('\n'), nomesReais, soNoBanco);
  if (deteccao.ocorrencias > 0) {
    // A linha inteira é mascarada: o caminho também carrega chaves do JSON.
    const trechos = valores
      .filter((x) => detectarNomes(x.s, nomesReais, soNoBanco).ocorrencias > 0)
      .slice(0, 10)
      .map((x) => mascarar(`${x.caminho.replace(/\[\d+\]/g, '[]')}: ${x.s}`).slice(0, 200));
    falha(`detector solto achou ${deteccao.ocorrencias} ocorrência(s) nos JSON:\n  ${trechos.join('\n  ')}`);
  }

  // (c) Fora dos blobs: busca com limite de palavra; vira aviso.
  // Agrupado por nome (identificado só pelo índice) para o resumo ficar legível.
  const avisos = new Map<number, { total: number; paginas: Set<string>; exemplos: Set<string> }>();
  for (const [arquivo, conteudo] of saidas) {
    if (!arquivo.endsWith('.html')) continue;
    // Remove os blobs pela mesma serialização que anonimizarPagina usou.
    let fora = conteudo;
    for (const b of extrairBlobs(conteudo)) fora = fora.split(JSON.stringify(b).replace(/<\//g, '<\\/')).join('');
    nomesDetector.forEach((nome, k) => {
      if (nome.length < 3) return;
      const re = new RegExp(`(?<![\\p{L}\\p{N}_])${escaparRegex(nome)}(?![\\p{L}\\p{N}_])`, 'giu');
      for (const m of fora.matchAll(re)) {
        const i = m.index ?? 0;
        const a = avisos.get(k) ?? { total: 0, paginas: new Set<string>(), exemplos: new Set<string>() };
        a.total++;
        a.paginas.add(arquivo);
        if (a.exemplos.size < 2) a.exemplos.add(trechoMascarado(fora, i, i + nome.length, reSensivel).replace(/\s+/g, ' '));
        avisos.set(k, a);
      }
    });
  }

  // 5. Gravação.
  rmSync(SAIDA, { recursive: true, force: true });
  for (const [rel, conteudo] of saidas) {
    const destino = join(SAIDA, ...rel.split('/'));
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, conteudo, 'utf8');
  }

  const totalNaoOk = [...naoOk.values()].reduce((a, b) => a + b, 0);
  console.log('Demo do CounTatic capturada');
  console.log(`  data da captura:          ${dataCaptura}`);
  console.log(`  páginas:                  ${paginas.length} (+ index.html)`);
  console.log(`  arquivos da API:          ${api.length} de ${listaUrls.length} pedidos`);
  console.log(`  jogadores anonimizados:   ${apelido.size}`);
  console.log(`  nomes reais mapeados:     ${nomesReais.length} (+ conflitos de nome: ${conflitos})`);
  console.log(`  nomes nos detectores:     ${nomesDetector.length} (${nomesReais.length} capturados, soltos; ${soNoBanco.length} só no banco, palavra inteira)`);
  console.log(`  playerName verificados:   ${nomesVerificados}`);
  console.log(`  nomesCurtosIgnorados:     ${deteccao.nomesCurtosIgnorados}`);
  console.log(`  respostas não-2xx:        ${totalNaoOk}${totalNaoOk ? ` (${[...naoOk].map(([k, n]) => `${k}: ${n}`).join(', ')})` : ''}`);
  const totalAvisos = [...avisos.values()].reduce((s, a) => s + a.total, 0);
  console.log(`  avisos fora dos blobs:    ${totalAvisos} (${avisos.size} nome(s))`);
  for (const [k, a] of avisos) {
    console.log(`    nome #${k}: ${a.total} acerto(s) em ${a.paginas.size} página(s); ex.:`);
    for (const ex of a.exemplos) console.log(`      …${ex}…`);
  }
}

main().catch((e: unknown) => {
  // Mensagens de erro de terceiros podem conter trechos dos dados: só as nossas são impressas.
  if (e instanceof Aborto) console.error(`ABORTADO: ${e.message}`);
  else {
    console.error(`ABORTADO: erro inesperado (${e instanceof Error ? e.name : typeof e})`);
    const pilha = e instanceof Error ? (e.stack ?? '').split('\n').filter((l) => /^\s+at /.test(l)) : [];
    console.error(pilha.slice(0, 5).join('\n'));
  }
  process.exit(1);
});
