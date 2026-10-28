import type { Site } from '../tipos';
import type { AppId, Rota } from './tipos';
import { emailDe } from '../../content/site';

export type Pasta = '/' | '/projetos' | '/trajetoria' | '/certificados';
export interface ProjetoResumo { slug: string; titulo: string; subtitulo: string }
export interface ContextoTerminal { cwd: Pasta; site: Site; projetos: ProjetoResumo[] }
export type Efeito = { tipo: 'abrir'; rota: Rota } | { tipo: 'limpar' } | { tipo: 'rapido' } | { tipo: 'matrix' };
export interface Resultado { linhas: string[]; efeitos: Efeito[]; cwd: Pasta }

const COMANDOS = ['help', 'whoami', 'ls', 'cd', 'cat', 'open', 'contato', 'rapido', 'history', 'clear'];
const PASTAS = ['projetos', 'trajetoria', 'certificados'] as const;
const ARQUIVOS_RAIZ = ['sobre.txt', 'curriculo.pdf', 'contato.exe', 'neon-burnout.exe'];
const APPS_POR_NOME: Record<string, AppId> = {
  sobre: 'sobre', projetos: 'projetos', trajetoria: 'trajetoria', certificados: 'certificados',
  curriculo: 'curriculo', contato: 'contato', terminal: 'terminal', jogo: 'neon-burnout',
};
const PROGRAMAS: Record<string, AppId> = { 'contato.exe': 'contato', 'neon-burnout.exe': 'neon-burnout' };

const AJUDA = [
  'comandos disponíveis:',
  '  help              mostra esta ajuda',
  '  whoami            quem é o dono deste sistema',
  '  ls [pasta]        lista arquivos e pastas',
  '  cd <pasta>        entra numa pasta (cd .. volta)',
  '  cat <arquivo>     mostra o conteúdo de um arquivo',
  '  open <nome>       abre um app ou projeto (ex.: open countatic)',
  '  contato           mostra como falar comigo',
  '  rapido            vai para o modo rápido',
  '  history           comandos digitados',
  '  clear             limpa a tela',
  'dica: Tab completa nomes; ↑ e ↓ navegam no histórico.',
];

const ARTE = [
  '       ██╗ ██████╗ ',
  '       ██║██╔════╝ ',
  '       ██║██║  ███╗',
  '  ██   ██║██║   ██║',
  '  ╚█████╔╝╚██████╔╝',
  '   ╚════╝  ╚═════╝ ',
];

export function prompt(cwd: Pasta): string {
  return `visitante@jgbr11:~${cwd === '/' ? '' : cwd}$`;
}

function quebrar(texto: string, largura: number): string[] {
  const linhas: string[] = [];
  let atual = '';
  for (const palavra of texto.split(/\s+/)) {
    if (atual && (atual + ' ' + palavra).length > largura) { linhas.push(atual); atual = palavra; }
    else atual = atual ? `${atual} ${palavra}` : palavra;
  }
  if (atual) linhas.push(atual);
  return linhas;
}

function limparNome(alvo: string): string {
  return alvo.toLowerCase().replace(/^~?\/?/, '').replace(/\/+$/, '');
}

function resolverPasta(alvo: string | undefined): Pasta | null {
  if (alvo === undefined) return '/';
  const nome = limparNome(alvo);
  if (nome === '' || nome === '..' || nome === '~') return '/';
  return (PASTAS as readonly string[]).includes(nome) ? (`/${nome}` as Pasta) : null;
}

function listar(pasta: Pasta, ctx: ContextoTerminal): string[] {
  switch (pasta) {
    case '/': return [...PASTAS.map((p) => `${p}/`), ...ARQUIVOS_RAIZ];
    case '/projetos': return ctx.projetos.map((p) => `${p.slug}/`);
    case '/trajetoria': return ctx.site.trajetoria.map((i) => `${i.periodo.padEnd(30)} ${i.titulo}`);
    case '/certificados': return ctx.site.certificados.map((c) => `${c.nome} — ${c.emissor}`);
  }
}

function neofetch(site: Site): string[] {
  const info = [
    'visitante@jgbr11', '----------------',
    `nome:     ${site.nome}`, `função:   ${site.titulo}`, `base:     ${site.base}`,
    `formação: ${site.formacao}`, `idiomas:  ${site.idiomas}`,
    'stack:    Java · Spring Boot · React · TypeScript · Docker', 'os:       JGBR11 OS v1.0',
  ];
  return info.map((linha, i) => `${(ARTE[i] ?? '').padEnd(22)}${linha}`);
}

function abrir(entradaOriginal: string, ctx: ContextoTerminal): Pick<Resultado, 'linhas' | 'efeitos'> {
  const bruto = limparNome(entradaOriginal).replace(/^\.\//, '').replace(/^projetos\//, '');
  if (Object.hasOwn(PROGRAMAS, bruto)) return { linhas: [`executando ${bruto}...`], efeitos: [{ tipo: 'abrir', rota: { app: PROGRAMAS[bruto] } }] };
  const nome = bruto.replace(/\.(txt|pdf|exe)$/, '');
  const projeto = ctx.projetos.find((p) => p.slug === nome);
  if (projeto) return { linhas: [`abrindo ${projeto.titulo}...`], efeitos: [{ tipo: 'abrir', rota: { app: 'projeto', param: projeto.slug } }] };
  if (Object.hasOwn(APPS_POR_NOME, nome)) return { linhas: [`abrindo ${nome}...`], efeitos: [{ tipo: 'abrir', rota: { app: APPS_POR_NOME[nome] } }] };
  return { linhas: [`open: não encontrado: ${entradaOriginal}. Tente "ls".`], efeitos: [] };
}

export function executar(entrada: string, ctx: ContextoTerminal, historico: readonly string[]): Resultado {
  const partes = entrada.trim().split(/\s+/).filter(Boolean);
  const base = { linhas: [] as string[], efeitos: [] as Efeito[], cwd: ctx.cwd };
  if (partes.length === 0) return base;
  const [bruto, ...args] = partes;
  const cmd = bruto.toLowerCase();
  const email = emailDe(ctx.site);

  switch (cmd) {
    case 'help': return { ...base, linhas: AJUDA };
    case 'whoami':
      return { ...base, linhas: [`${ctx.site.nome} — ${ctx.site.titulo}`, `${ctx.site.base} · ${ctx.site.formacao} · ${ctx.site.idiomas}`] };
    case 'ls': {
      const pasta = args[0] === undefined ? ctx.cwd : resolverPasta(args[0]);
      return { ...base, linhas: pasta ? listar(pasta, ctx) : [`ls: não encontrado: ${args[0]}`] };
    }
    case 'cd': {
      const pasta = resolverPasta(args[0]);
      return pasta ? { ...base, cwd: pasta } : { ...base, linhas: [`cd: pasta não encontrada: ${args[0]}`] };
    }
    case 'cat': {
      const alvo = args[0];
      if (!alvo) return { ...base, linhas: ['uso: cat <arquivo>'] };
      const nome = limparNome(alvo);
      if (nome === 'sobre.txt') return { ...base, linhas: quebrar(ctx.site.sobre, 72) };
      if (nome === 'curriculo.pdf') return { ...base, linhas: ['curriculo.pdf: arquivo binário. Use "open curriculo".'] };
      if (Object.hasOwn(PROGRAMAS, nome)) return { ...base, linhas: [`${nome}: é um programa. Use "open ${nome}".`] };
      if ((PASTAS as readonly string[]).includes(nome)) return { ...base, linhas: [`cat: ${alvo}: é uma pasta`] };
      return { ...base, linhas: [`cat: ${alvo}: arquivo não encontrado`] };
    }
    case 'open':
      if (!args[0]) return { ...base, linhas: ['uso: open <app|projeto>'] };
      return { ...base, ...abrir(args[0], ctx) };
    case 'contato':
      return {
        ...base,
        linhas: [`e-mail:   ${email}`, `linkedin: ${ctx.site.contato.linkedin}`, `github:   ${ctx.site.contato.github}`],
        efeitos: [{ tipo: 'abrir', rota: { app: 'contato' } }],
      };
    case 'rapido': return { ...base, linhas: ['abrindo o modo rápido...'], efeitos: [{ tipo: 'rapido' }] };
    case 'clear': return { ...base, efeitos: [{ tipo: 'limpar' }] };
    case 'history': return { ...base, linhas: historico.map((c, i) => `${String(i + 1).padStart(3)}  ${c}`) };
    case 'neofetch': return { ...base, linhas: neofetch(ctx.site) };
    case 'matrix': return { ...base, linhas: ['wake up, visitante...'], efeitos: [{ tipo: 'matrix' }] };
    case 'sudo':
      if (args.join(' ').toLowerCase() === 'contratar') {
        return {
          ...base,
          linhas: ['[sudo] senha para recrutador: ********', 'acesso concedido.', 'iniciando protocolo de contratação...', `próximo passo: ${email} ;)`],
          efeitos: [{ tipo: 'abrir', rota: { app: 'contato' } }],
        };
      }
      return { ...base, linhas: ['sudo: permissão negada. Aqui só funciona "sudo contratar".'] };
    default:
      return { ...base, linhas: [`comando não encontrado: ${bruto}. Digite "help".`] };
  }
}

function prefixoComum(lista: string[]): string {
  return lista.reduce((pref, item) => {
    let i = 0;
    while (i < pref.length && i < item.length && pref[i] === item[i]) i++;
    return pref.slice(0, i);
  });
}

function aplicar(antes: string, parcial: string, candidatos: string[]): string {
  const casam = candidatos.filter((c) => c.startsWith(parcial));
  if (casam.length === 0) return antes + parcial;
  if (casam.length === 1) return antes + casam[0] + (casam[0].endsWith('/') ? '' : ' ');
  const comum = prefixoComum(casam);
  return antes + (comum.length > parcial.length ? comum : parcial);
}

export function completar(entrada: string, ctx: ContextoTerminal): string {
  const espaco = entrada.lastIndexOf(' ');
  if (espaco === -1) return aplicar('', entrada, COMANDOS);
  const cmd = entrada.trim().split(/\s+/)[0].toLowerCase();
  const antes = entrada.slice(0, espaco + 1);
  const parcial = entrada.slice(espaco + 1);
  let candidatos: string[] = [];
  if (cmd === 'cd' || cmd === 'ls') candidatos = ctx.cwd === '/' ? PASTAS.map((p) => `${p}/`) : ['..'];
  else if (cmd === 'cat') candidatos = ARQUIVOS_RAIZ;
  else if (cmd === 'open') candidatos = [...ctx.projetos.map((p) => p.slug), ...Object.keys(APPS_POR_NOME)];
  return aplicar(antes, parcial, candidatos);
}
