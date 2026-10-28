---
titulo: Controle Financeiro
subtitulo: gestão de gastos com dashboards
resumo: Aplicação web full stack para registrar, categorizar e acompanhar gastos semanais e mensais, com login via JWT e dashboards interativos.
ano: 2026
ordem: 4
capa: { src: /projetos/controle-financeiro/dashboard.webp, alt: "Dashboard do Controle Financeiro com totais da semana e do mês e gráficos por categoria" }
galeria:
  - { src: /projetos/controle-financeiro/mensal.webp, alt: "Lista de gastos do mês com categoria, valor e data (dados fictícios)" }
stack: [Java, Spring Boot, Spring Security, JWT, Spring Data JPA, MySQL, Thymeleaf, Bootstrap 5, Chart.js]
links:
  codigo: https://github.com/Jgbr11/controle-financeiro-java
numeros:
  - { valor: "REST", rotulo: "API completa de gastos" }
  - { valor: "JWT", rotulo: "autenticação stateless" }
  - { valor: "3", rotulo: "visões: semanal, mensal e dashboard" }
---

## Problema

Saber para onde o dinheiro vai exige registrar cada gasto e enxergar o todo. A proposta foi uma aplicação simples de usar, com cadastro rápido de gastos por categoria e um dashboard visual, no estilo Power BI, com o resumo da semana e do mês.

## Arquitetura

<svg class="diagrama" viewBox="0 0 640 230" role="img" aria-label="Arquitetura em camadas do Controle Financeiro: navegador, filtro JWT, controllers, services, repositories e MySQL">
<defs><marker id="seta-cf" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ponta"/></marker></defs>
<rect x="8" y="88" width="120" height="54" class="caixa"/>
<text x="68" y="111" class="nome" text-anchor="middle">Navegador</text>
<text x="68" y="128" class="rot" text-anchor="middle">Thymeleaf · Chart.js</text>
<rect x="160" y="20" width="460" height="40" class="caixa caixa-destaque"/>
<text x="390" y="45" class="nome" text-anchor="middle">Spring Security · filtro JWT</text>
<rect x="160" y="88" width="140" height="54" class="caixa"/>
<text x="230" y="120" class="nome" text-anchor="middle">Controllers</text>
<rect x="320" y="88" width="140" height="54" class="caixa"/>
<text x="390" y="120" class="nome" text-anchor="middle">Services</text>
<rect x="480" y="88" width="140" height="54" class="caixa"/>
<text x="550" y="120" class="nome" text-anchor="middle">Repositories</text>
<rect x="480" y="168" width="140" height="50" class="caixa"/>
<text x="550" y="198" class="nome" text-anchor="middle">MySQL</text>
<line x1="128" y1="115" x2="158" y2="115" class="fio" marker-end="url(#seta-cf)"/>
<line x1="300" y1="115" x2="318" y2="115" class="fio" marker-end="url(#seta-cf)"/>
<line x1="460" y1="115" x2="478" y2="115" class="fio" marker-end="url(#seta-cf)"/>
<line x1="550" y1="142" x2="550" y2="166" class="fio" marker-end="url(#seta-cf)"/>
</svg>

**Arquitetura em camadas**: os controllers recebem as requisições e validam a entrada, os services concentram as regras de negócio e os repositories (Spring Data JPA) cuidam da persistência no MySQL. Todas as rotas protegidas passam pelo filtro JWT do Spring Security.

## Decisões técnicas

- **JWT em vez de sessão no servidor.** A autenticação stateless serve tanto as páginas quanto a API REST, que pode ser usada por outros clientes.
- **Camadas bem separadas.** As regras de negócio ficam nos services, e não nos controllers, o que facilita testar e trocar a interface.
- **Validação no cadastro.** E-mail válido e senha com letra maiúscula e caractere especial, validados no backend.
- **Dashboard sem framework de frontend.** Thymeleaf + Bootstrap 5 + Chart.js entregam gráficos de pizza, barras e linhas com pouco JavaScript.

## Meu papel

Projeto individual: backend, segurança, banco e interface.
