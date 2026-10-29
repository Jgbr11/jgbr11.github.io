import type { ComponentType } from 'react';
import type { DadosOS } from '../../../lib/tipos';
import type { AppId, Rota } from '../../../lib/os/tipos';
import type { Area } from '../../../lib/os/janelas';
import type { TipoIcone } from '../../comum/Icone';
import { AppSobre } from './AppSobre';
import { AppProjetos } from './AppProjetos';
import { AppProjeto } from './AppProjeto';
import { AppTrajetoria } from './AppTrajetoria';
import { AppCertificados } from './AppCertificados';
import { AppCurriculo } from './AppCurriculo';
import { AppContato } from './AppContato';
import { AppTerminal } from './AppTerminal';
import { AppNeonBurnout } from './AppNeonBurnout';
import { AppDemoCountatic } from './AppDemoCountatic';

export interface PropsApp { dados: DadosOS; param?: string; abrir: (rota: Rota) => void }

export interface DefinicaoApp {
  id: AppId;
  rotulo: string;
  icone: TipoIcone;
  tamanho: Area;
  titulo(dados: DadosOS, param?: string): string;
  caminho(param?: string): string;
  Componente: ComponentType<PropsApp>;
}

const fixo = (texto: string) => () => texto;

export const APPS: Partial<Record<AppId, DefinicaoApp>> = {
  sobre: { id: 'sobre', rotulo: 'sobre.txt', icone: 'texto', tamanho: { w: 560, h: 440 }, titulo: fixo('sobre.txt'), caminho: fixo('C:\\JGBR11\\SOBRE.TXT'), Componente: AppSobre },
  projetos: { id: 'projetos', rotulo: 'projetos/', icone: 'pasta', tamanho: { w: 560, h: 460 }, titulo: fixo('projetos/'), caminho: fixo('C:\\JGBR11\\PROJETOS'), Componente: AppProjetos },
  projeto: {
    id: 'projeto', rotulo: 'projeto', icone: 'pasta', tamanho: { w: 760, h: 600 },
    titulo: (dados, param) => dados.projetos.find((p) => p.slug === param)?.titulo ?? 'projeto',
    caminho: (param) => `C:\\JGBR11\\PROJETOS\\${(param ?? '').toUpperCase()}`,
    Componente: AppProjeto,
  },
  trajetoria: { id: 'trajetoria', rotulo: 'trajetoria/', icone: 'pasta', tamanho: { w: 560, h: 500 }, titulo: fixo('trajetoria/'), caminho: fixo('C:\\JGBR11\\TRAJETORIA'), Componente: AppTrajetoria },
  certificados: { id: 'certificados', rotulo: 'certificados/', icone: 'pasta', tamanho: { w: 500, h: 340 }, titulo: fixo('certificados/'), caminho: fixo('C:\\JGBR11\\CERTIFICADOS'), Componente: AppCertificados },
  curriculo: { id: 'curriculo', rotulo: 'curriculo.pdf', icone: 'pdf', tamanho: { w: 720, h: 620 }, titulo: fixo('curriculo.pdf'), caminho: fixo('C:\\JGBR11\\CURRICULO.PDF'), Componente: AppCurriculo },
  contato: { id: 'contato', rotulo: 'contato.exe', icone: 'exe', tamanho: { w: 480, h: 320 }, titulo: fixo('contato.exe'), caminho: fixo('C:\\JGBR11\\CONTATO.EXE'), Componente: AppContato },
  terminal: { id: 'terminal', rotulo: 'terminal', icone: 'terminal', tamanho: { w: 660, h: 420 }, titulo: fixo('terminal'), caminho: fixo('C:\\JGBR11\\TERMINAL.EXE'), Componente: AppTerminal },
  'neon-burnout': { id: 'neon-burnout', rotulo: 'neon-burnout.exe', icone: 'jogo', tamanho: { w: 820, h: 640 }, titulo: fixo('neon-burnout.exe'), caminho: fixo('C:\\JGBR11\\JOGOS\\NEON-BURNOUT.EXE'), Componente: AppNeonBurnout },
  'demo-countatic': { id: 'demo-countatic', rotulo: 'countatic.exe', icone: 'mira', tamanho: { w: 1100, h: 720 }, titulo: fixo('countatic.exe'), caminho: fixo('C:\\JGBR11\\PROJETOS\\COUNTATIC\\DEMO.EXE'), Componente: AppDemoCountatic },
};

/** Ordem dos ícones na área de trabalho, no START e na tela do celular. */
export const ICONES: AppId[] = ['projetos', 'sobre', 'trajetoria', 'curriculo', 'certificados', 'contato', 'terminal', 'neon-burnout', 'demo-countatic'];
