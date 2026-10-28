export interface ItemTrajetoria { periodo: string; titulo: string; papel: string; descricao: string }
export interface GrupoStack { grupo: string; itens: string[] }
export interface Certificado { nome: string; emissor: string; ano?: string; verificacao: string }
export interface Destaque { valor: string; rotulo: string }
export interface Midia { src: string; alt: string }
export interface Numero { valor: string; rotulo: string }

export interface Site {
  nome: string; nomeCompleto: string; titulo: string; handle: string; url: string;
  base: string; formacao: string; idiomas: string; status: string;
  foto: string; curriculo: string; descricaoSeo: string;
  contato: { emailUsuario: string; emailDominio: string; linkedin: string; github: string };
  sobre: string;
  destaques: Destaque[];
  trajetoria: ItemTrajetoria[];
  stack: GrupoStack[];
  certificados: Certificado[];
}

export interface Projeto {
  slug: string; titulo: string; subtitulo: string; resumo: string; ano: number; ordem: number;
  stack: string[];
  links: { codigo?: string; jogar?: string };
  capa?: Midia; galeria: Midia[]; numeros: Numero[];
  equipe?: string; embedJogo?: string;
  /** HTML do corpo Markdown, já renderizado pelo Astro */
  html: string;
}

export interface DadosOS { site: Site; projetos: Projeto[] }
