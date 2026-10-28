// Uso: node scripts/gerar-curriculo.ts  -> public/curriculo-joao-guilherme-cordeiro.pdf (A4)
// Visual sóbrio, legível por sistemas de recrutamento (ATS): texto real, uma coluna e sem imagens.
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { site, emailDe } from '../src/content/site.ts';

const raiz = process.cwd();
const mdCountatic = readFileSync(join(raiz, 'src/content/projetos/countatic.md'), 'utf8');
const codigoCountatic = /codigo:\s*(https:\/\/\S+)/.exec(mdCountatic)?.[1];
const semProtocolo = (u: string) => u.replace(/^https:\/\/(www\.)?/, '');

const experiencias = [
  { titulo: 'Estagiário de Back Office — SPRO (an NTT DATA Company)', periodo: 'mai 2026 – atual · Curitiba (híbrido)', itens: [
    'Apoio às rotinas administrativas de back office em consultoria de soluções SAP para o agronegócio.',
    'Uso de SAP e análise de dados em planilhas para acompanhamento de processos e indicadores internos.',
    'Contato diário com consultores e times de projeto em ambiente corporativo de TI.',
  ] },
  { titulo: 'Desenvolvedor Freelancer — Centro Comercial TijucasOpen', periodo: 'out – dez 2024', itens: [
    'Sistema web em produção para gestão de lojistas, aluguéis e controle de pagamentos, desenvolvido em equipe.',
    'Backend em PHP com regras de negócio e MySQL; painel administrativo em HTML, CSS e JavaScript.',
  ] },
  { titulo: 'Pesquisador de Iniciação Científica — PUCPR', periodo: 'set 2024 – ago 2025', itens: [
    'Pesquisa "CBL 10 Anos Depois: Evolução da Aplicação de Metodologias Ativas em um Ateliê de Software", orientada pela Prof.ª Regina Fabia Lopes de Albuquerque.',
  ] },
];

const projetos = [
  { titulo: 'CounTatic — análise de partidas de CS2', meta: ['2026', codigoCountatic && semProtocolo(codigoCountatic)], itens: [
    '3 serviços em Docker Compose: core em Java 21/Spring Boot 3, parser de demos em Go (arquivos de 250 MB+) e bot em Node.js/TypeScript integrado à Steam; MySQL 8.4.',
    'Pipeline com máquina de estados persistida, retry com backoff e deduplicação por constraint única; inserts em lote no Hibernate.',
    'Motor de métricas com padrão Strategy e percentis por faixa de rank; ~280 testes automatizados (JUnit, Go e Node).',
  ] },
  { titulo: 'SmartScale / MilScale — linha de produto para escalas de serviço', meta: ['2026', 'github.com/Jgbr11/Sistema-SmartScale'], itens: [
    'Arquitetura hexagonal em Java 21/Spring Boot 3.3 com Maven multi-módulo: núcleo reutilizável publicado como JAR, sem dependência de framework.',
    'Frontend em React 19 + Vite + TypeScript; Flyway com H2 (dev) e MySQL (produção).',
    'Versão cloud (Azure Functions, MongoDB Atlas e Azure Static Web Apps) desenvolvida em equipe de 4.',
  ] },
  { titulo: 'Neon Burnout — RPG roguelike para navegador', meta: ['2026', 'jgbr11.itch.io/neon-burnout'], itens: [
    'Jogo em JavaScript puro, sem engine nem dependências, publicado no itch.io (beta).',
    'Mais de 220 testes automatizados e simuladores que jogam centenas de partidas para calibrar a dificuldade.',
  ] },
  { titulo: 'Controle Financeiro Pessoal — full stack', meta: ['2026', 'github.com/Jgbr11/controle-financeiro-java'], itens: [
    'API REST com Spring Boot, Spring Security + JWT, Spring Data JPA e MySQL; dashboards com Thymeleaf, Bootstrap 5 e Chart.js.',
  ] },
];

const formacao = site.trajetoria.find((i) => i.titulo.startsWith('Engenharia de Software'))!;
const lista = (itens: string[]) => `<ul>${itens.map((i) => `<li>${i}</li>`).join('')}</ul>`;

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Currículo — ${site.nomeCompleto}</title>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page{size:A4;margin:14mm 15mm}
  *{box-sizing:border-box}
  body{font:10pt/1.42 'Space Grotesk',Arial,sans-serif;color:#111;margin:0}
  h1{font-size:20pt;margin:0;letter-spacing:.01em}
  .titulo{font-size:11.5pt;font-weight:600;margin:2px 0 6px}
  .contato{font-size:9pt;color:#333;border-bottom:3px solid #f3e600;padding-bottom:8px}
  h2{font-size:10.5pt;text-transform:uppercase;letter-spacing:.08em;margin:12px 0 5px;padding-left:6px;border-left:4px solid #0d0d0d}
  .item{margin-bottom:6px;break-inside:avoid}
  .cab{display:flex;justify-content:space-between;gap:12px}
  .cab strong{font-size:10pt}
  .cab span{font-size:8.8pt;color:#444;white-space:nowrap}
  ul{margin:2px 0 0;padding-left:16px}
  li{margin-bottom:1px}
  p{margin:0}
</style></head><body>
  <h1>${site.nomeCompleto}</h1>
  <p class="titulo">${site.titulo}</p>
  <p class="contato">${site.base} · ${emailDe(site)} · ${semProtocolo(site.contato.linkedin)} · ${semProtocolo(site.contato.github)} · Portfólio: jgbr11.github.io</p>

  <h2>Resumo</h2>
  <p>${site.sobre}</p>

  <h2>Experiência</h2>
  ${experiencias.map((e) => `<div class="item"><div class="cab"><strong>${e.titulo}</strong><span>${e.periodo}</span></div>${lista(e.itens)}</div>`).join('')}

  <h2>Projetos</h2>
  ${projetos.map((p) => `<div class="item"><div class="cab"><strong>${p.titulo}</strong><span>${p.meta.filter(Boolean).join(' · ')}</span></div>${lista(p.itens)}</div>`).join('')}

  <h2>Formação</h2>
  <div class="item"><div class="cab"><strong>Bacharelado em ${formacao.titulo}</strong><span>${formacao.periodo}</span></div><p>${formacao.papel.replace(/^Bacharelado · /, '')}</p></div>

  <h2>Competências</h2>
  ${site.stack.map((g) => `<p><strong>${g.grupo}:</strong> ${g.itens.join(', ')}</p>`).join('')}

  <h2>Certificados e idiomas</h2>
  <p><strong>Certificados:</strong> ${site.certificados.map((c) => `${c.nome} — ${c.emissor}${c.ano ? ` (${c.ano})` : ''}`).join(' · ')}</p>
  <p><strong>Idiomas:</strong> Português (nativo) · Inglês (fluente)</p>
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage();
await pagina.setContent(html, { waitUntil: 'networkidle' });
await pagina.pdf({ path: join(raiz, 'public/curriculo-joao-guilherme-cordeiro.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
await navegador.close();
console.log('ok public/curriculo-joao-guilherme-cordeiro.pdf');
