import { describe, it, expect } from 'vitest';
import { executar, completar, prompt, type ContextoTerminal } from '../../src/lib/os/terminal';
import { site } from '../../src/content/site';

const ctx = (cwd: ContextoTerminal['cwd'] = '/'): ContextoTerminal => ({
  cwd, site,
  projetos: [
    { slug: 'countatic', titulo: 'CounTatic', subtitulo: 'análise de partidas de CS2' },
    { slug: 'smartscale', titulo: 'SmartScale', subtitulo: 'linha de produto' },
    { slug: 'neon-burnout', titulo: 'Neon Burnout', subtitulo: 'roguelike' },
    { slug: 'controle-financeiro', titulo: 'Controle Financeiro', subtitulo: 'gastos' },
  ],
});
const rodar = (entrada: string, c = ctx()) => executar(entrada, c, [entrada]);

describe('básico', () => {
  it('entrada vazia não faz nada', () => {
    expect(rodar('   ')).toEqual({ linhas: [], efeitos: [], cwd: '/' });
  });
  it('comando desconhecido sugere help', () => {
    expect(rodar('banana').linhas).toEqual(['comando não encontrado: banana. Digite "help".']);
  });
  it('ignora maiúsculas no comando', () => {
    expect(rodar('WHOAMI').linhas[0]).toContain('João Guilherme Cordeiro');
  });
  it('help lista os comandos públicos e não os segredos', () => {
    const texto = rodar('help').linhas.join('\n');
    for (const c of ['whoami', 'ls', 'cd', 'cat', 'open', 'contato', 'rapido', 'history', 'clear']) expect(texto).toContain(c);
    expect(texto).not.toContain('sudo');
    expect(texto).not.toContain('matrix');
  });
  it('prompt mostra a pasta', () => {
    expect(prompt('/')).toBe('visitante@jgbr11:~$');
    expect(prompt('/projetos')).toBe('visitante@jgbr11:~/projetos$');
  });
});

describe('arquivos e pastas', () => {
  it('ls na raiz', () => {
    expect(rodar('ls').linhas).toEqual(['projetos/', 'trajetoria/', 'certificados/', 'sobre.txt', 'curriculo.pdf', 'contato.exe', 'neon-burnout.exe', 'countatic.exe']);
  });
  it('ls projetos lista os slugs', () => {
    expect(rodar('ls projetos').linhas).toEqual(['countatic/', 'smartscale/', 'neon-burnout/', 'controle-financeiro/']);
  });
  it('ls pasta inexistente', () => {
    expect(rodar('ls nada').linhas).toEqual(['ls: não encontrado: nada']);
  });
  it('cd entra e cd .. volta', () => {
    const r = rodar('cd projetos');
    expect(r.cwd).toBe('/projetos');
    expect(r.linhas).toEqual([]);
    expect(rodar('cd ..', ctx('/projetos')).cwd).toBe('/');
    expect(rodar('cd', ctx('/projetos')).cwd).toBe('/');
    expect(rodar('cd /trajetoria/', ctx('/projetos')).cwd).toBe('/trajetoria');
  });
  it('cd inválido', () => {
    expect(rodar('cd x').linhas).toEqual(['cd: pasta não encontrada: x']);
  });
  it('ls sem argumento usa a pasta atual', () => {
    expect(rodar('ls', ctx('/certificados')).linhas[0]).toContain('Network Defense');
  });
  it('cat sobre.txt quebra o texto em até 72 colunas', () => {
    const linhas = rodar('cat sobre.txt').linhas;
    expect(linhas.join(' ')).toBe(site.sobre);
    for (const l of linhas) expect(l.length).toBeLessThanOrEqual(72);
  });
  it('cat em pasta, binário e inexistente', () => {
    expect(rodar('cat projetos').linhas).toEqual(['cat: projetos: é uma pasta']);
    expect(rodar('cat curriculo.pdf').linhas).toEqual(['curriculo.pdf: arquivo binário. Use "open curriculo".']);
    expect(rodar('cat x.txt').linhas).toEqual(['cat: x.txt: arquivo não encontrado']);
    expect(rodar('cat').linhas).toEqual(['uso: cat <arquivo>']);
  });
});

describe('open', () => {
  it('abre projeto pelo slug, com ou sem caminho', () => {
    for (const e of ['open countatic', 'open countatic/', 'open projetos/countatic']) {
      expect(rodar(e).efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'projeto', param: 'countatic' } }]);
    }
    expect(rodar('open countatic').linhas).toEqual(['abrindo CounTatic...']);
  });
  it('abre apps pelo nome ou pelo arquivo', () => {
    expect(rodar('open sobre.txt').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'sobre' } }]);
    expect(rodar('open curriculo').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'curriculo' } }]);
    expect(rodar('open contato.exe').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'contato' } }]);
  });
  it('neon-burnout.exe e "jogo" abrem o jogo; neon-burnout abre o estudo de caso', () => {
    expect(rodar('open neon-burnout.exe').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'neon-burnout' } }]);
    expect(rodar('open jogo').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'neon-burnout' } }]);
    expect(rodar('open neon-burnout').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'projeto', param: 'neon-burnout' } }]);
  });
  it('countatic.exe abre a demo; countatic continua abrindo o estudo de caso', () => {
    expect(rodar('open countatic.exe').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'demo-countatic' } }]);
    expect(rodar('open countatic').efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'projeto', param: 'countatic' } }]);
  });
  it('erros do open', () => {
    expect(rodar('open').linhas).toEqual(['uso: open <app|projeto>']);
    expect(rodar('open xyz').linhas).toEqual(['open: não encontrado: xyz. Tente "ls".']);
    expect(rodar('open xyz').efeitos).toEqual([]);
  });
  it('nomes herdados do prototype não abrem nada', () => {
    for (const nome of ['constructor', 'toString', '__proto__']) {
      expect(rodar(`open ${nome}`).efeitos).toEqual([]);
      expect(rodar(`cat ${nome}`).linhas).toEqual([`cat: ${nome}: arquivo não encontrado`]);
    }
  });
});

describe('outros comandos', () => {
  it('contato mostra os links e abre o app', () => {
    const r = rodar('contato');
    expect(r.linhas.join('\n')).toContain('jgcreplive@gmail.com');
    expect(r.linhas.join('\n')).toContain('linkedin.com/in/joaogscordeiro');
    expect(r.efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'contato' } }]);
  });
  it('clear, rapido e matrix geram efeitos', () => {
    expect(rodar('clear').efeitos).toEqual([{ tipo: 'limpar' }]);
    expect(rodar('rapido').efeitos).toEqual([{ tipo: 'rapido' }]);
    expect(rodar('matrix').efeitos).toEqual([{ tipo: 'matrix' }]);
  });
  it('history numera os comandos', () => {
    expect(executar('history', ctx(), ['ls', 'history']).linhas).toEqual(['  1  ls', '  2  history']);
  });
  it('sudo contratar', () => {
    const r = rodar('sudo contratar');
    expect(r.linhas.join('\n')).toContain('acesso concedido');
    expect(r.efeitos).toEqual([{ tipo: 'abrir', rota: { app: 'contato' } }]);
    expect(rodar('sudo rm -rf /').linhas).toEqual(['sudo: permissão negada. Aqui só funciona "sudo contratar".']);
  });
  it('neofetch mostra a ficha', () => {
    const texto = rodar('neofetch').linhas.join('\n');
    expect(texto).toContain('Desenvolvedor Full Stack');
    expect(texto).toContain('JGBR11 OS');
  });
});

describe('completar', () => {
  it('completa comando único', () => {
    expect(completar('who', ctx())).toBe('whoami ');
    expect(completar('con', ctx())).toBe('contato ');
  });
  it('prefixo ambíguo vai até o trecho comum', () => {
    expect(completar('c', ctx())).toBe('c');
    expect(completar('h', ctx())).toBe('h');
  });
  it('completa argumentos', () => {
    expect(completar('open coun', ctx())).toBe('open countatic');
    expect(completar('open countatic.e', ctx())).toBe('open countatic.exe ');
    expect(completar('open co', ctx())).toBe('open co');
    expect(completar('open contr', ctx())).toBe('open controle-financeiro ');
    expect(completar('cd pro', ctx())).toBe('cd projetos/');
    expect(completar('cat so', ctx())).toBe('cat sobre.txt ');
  });
  it('sem candidato não muda', () => {
    expect(completar('open zzz', ctx())).toBe('open zzz');
    expect(completar('xyz', ctx())).toBe('xyz');
  });
});
