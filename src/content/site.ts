import type { Site } from '../lib/tipos';

export const site: Site = {
  nome: 'João Guilherme Cordeiro',
  nomeCompleto: 'João Guilherme de Souza Cordeiro',
  titulo: 'Desenvolvedor Full Stack',
  handle: 'JGBR11',
  url: 'https://jgbr11.github.io',
  base: 'Curitiba, PR',
  formacao: 'Eng. de Software · PUCPR',
  idiomas: 'PT · EN fluente',
  status: 'ONLINE',
  foto: '/foto.webp',
  curriculo: '/curriculo-joao-guilherme-cordeiro.pdf',
  descricaoSeo:
    'Portfólio de João Guilherme Cordeiro, desenvolvedor full stack (Java, Spring Boot, React, TypeScript, Docker). Projetos, trajetória e contato.',
  contato: {
    emailUsuario: 'jgcreplive',
    emailDominio: 'gmail.com',
    linkedin: 'https://www.linkedin.com/in/joaogscordeiro',
    github: 'https://github.com/Jgbr11',
  },
  sobre:
    'Sou estudante de Engenharia de Software na PUCPR (6º período) e gosto de construir software de ponta a ponta: APIs, regras de negócio e dados no backend, e as interfaces que as pessoas usam no frontend. Já construí uma plataforma com 3 serviços em Docker e cerca de 280 testes automatizados, publiquei um jogo de navegador e participei de um sistema web em produção para um centro comercial. Também fiz iniciação científica sobre metodologias ativas e hoje vivo o dia a dia de uma consultoria SAP no grupo NTT DATA.',
  destaques: [
    { valor: '4', rotulo: 'projetos' },
    { valor: '500+', rotulo: 'testes automatizados' },
    { valor: 'EN', rotulo: 'inglês fluente' },
  ],
  trajetoria: [
    {
      periodo: 'mai 2026 — atual',
      titulo: 'SPRO (an NTT DATA Company)',
      papel: 'Estagiário de Back Office',
      descricao:
        'Back office administrativo em consultoria de soluções SAP para o agronegócio: rotinas internas, uso de SAP e análise de dados em planilhas.',
    },
    {
      periodo: 'out — dez 2024',
      titulo: 'Centro Comercial TijucasOpen',
      papel: 'Desenvolvedor Freelancer',
      descricao:
        'Sistema web para gestão de lojistas, aluguéis e controle de pagamentos, desenvolvido em equipe. PHP, MySQL e JavaScript.',
    },
    {
      periodo: 'set 2024 — ago 2025',
      titulo: 'Iniciação Científica — PUCPR',
      papel: 'Pesquisador',
      descricao:
        '"CBL 10 Anos Depois: Evolução da Aplicação de Metodologias Ativas em um Ateliê de Software", orientada pela Prof.ª Regina Fabia Lopes de Albuquerque.',
    },
    {
      periodo: 'fev 2024 — dez 2028 (previsão)',
      titulo: 'Engenharia de Software — PUCPR',
      papel: 'Bacharelado · 6º período',
      descricao: 'Bacharelado em andamento na Pontifícia Universidade Católica do Paraná.',
    },
  ],
  stack: [
    { grupo: 'Backend', itens: ['Java', 'Spring Boot', 'Node.js', 'TypeScript', 'Go (básico)', 'PHP'] },
    { grupo: 'Frontend', itens: ['React', 'Next.js', 'Astro', 'JavaScript', 'HTML/CSS', 'Tailwind'] },
    { grupo: 'Dados', itens: ['MySQL', 'MongoDB'] },
    { grupo: 'DevOps e Cloud', itens: ['Docker', 'Git', 'Azure', 'GitHub Actions', 'Linux'] },
    { grupo: 'Práticas', itens: ['Testes automatizados', 'Arquitetura hexagonal', 'Design patterns'] },
  ],
  certificados: [
    { nome: 'Network Defense', emissor: 'Cisco', ano: '2025', verificacao: 'https://www.credly.com/badges/ba02d48b-c8cf-4c1c-b947-c6b91f660d37' },
    { nome: 'Linux Unhatched', emissor: 'Cisco', verificacao: 'https://www.credly.com/badges/0fa43810-1c16-43eb-9ca6-4b116aada222' },
  ],
};

export function emailDe(s: Site): string {
  return `${s.contato.emailUsuario}@${s.contato.emailDominio}`;
}
