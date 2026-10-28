---
titulo: SmartScale
subtitulo: linha de produto para escalas de serviço
resumo: Núcleo reutilizável de escalas de serviço, empacotado como JAR, e o primeiro produto da linha, o MilScale, que gera a escala diária de um batalhão.
ano: 2026
ordem: 2
stack: [Java 21, Spring Boot 3.3, Maven multi-módulo, Arquitetura hexagonal, React 19, Vite, TypeScript, Flyway, MySQL]
links:
  codigo: https://github.com/Jgbr11/Sistema-SmartScale
numeros:
  - { valor: "1 JAR", rotulo: "núcleo reutilizável v1.0.0" }
  - { valor: "~200", rotulo: "militares na base de demonstração" }
  - { valor: "2", rotulo: "versões: local e cloud (Azure)" }
---

## Problema

Montar a escala de serviço de um batalhão (Oficial de Dia, Graduado de Dia, Guardas...) à mão é lento e cheio de regra: intervalo mínimo de descanso, trocas, dispensas e quem está há mais tempo sem servir. Ao mesmo tempo, hospitais, portarias e plantões têm o **mesmo problema de fundo**. A proposta, na disciplina de Desenvolvimento Orientado a Reuso de Software (PUCPR), foi construir isso como uma **linha de produto de software**: um núcleo reaproveitável e produtos especializados em cima dele.

## Arquitetura

<svg class="diagrama" viewBox="0 0 640 250" role="img" aria-label="Arquitetura hexagonal do SmartScale: o núcleo reutilizável fica no centro, envolvido pelo domínio MilScale e pelos adaptadores, que falam com o frontend React e com o banco">
<defs><marker id="seta-ss" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ponta"/></marker></defs>
<rect x="8" y="98" width="120" height="56" class="caixa"/>
<text x="68" y="122" class="nome" text-anchor="middle">Frontend</text>
<text x="68" y="140" class="rot" text-anchor="middle">React 19 · Vite · TS</text>
<rect x="512" y="98" width="120" height="56" class="caixa"/>
<text x="572" y="122" class="nome" text-anchor="middle">MySQL / H2</text>
<text x="572" y="140" class="rot" text-anchor="middle">Flyway</text>
<rect x="160" y="8" width="320" height="234" class="caixa"/>
<text x="320" y="28" class="rot" text-anchor="middle">ADAPTADORES · REST · JPA · SEGURANÇA</text>
<rect x="184" y="40" width="272" height="186" class="caixa"/>
<text x="320" y="60" class="rot" text-anchor="middle">DOMÍNIO MILSCALE · Militar · TipoServico · PoliticaDeDescanso</text>
<rect x="214" y="78" width="212" height="128" class="caixa caixa-destaque"/>
<text x="320" y="104" class="nome" text-anchor="middle">smartscale-core</text>
<text x="320" y="124" class="rot" text-anchor="middle">JAR 1.0.0 · sem Spring, sem JPA</text>
<text x="320" y="152" class="rot" text-anchor="middle">MotorDeRodizio</text>
<text x="320" y="170" class="rot" text-anchor="middle">PessoaEscalada · TipoTurno</text>
<text x="320" y="188" class="rot" text-anchor="middle">CriterioDeOrdenacao</text>
<line x1="128" y1="126" x2="158" y2="126" class="fio" marker-end="url(#seta-ss)"/>
<line x1="482" y1="126" x2="510" y2="126" class="fio" marker-end="url(#seta-ss)"/>
</svg>

Um **monólito hexagonal (Ports & Adapters)** em Maven multi-módulo. O módulo `smartscale-core` é o núcleo da linha de produto, empacotado e versionado como um JAR próprio. O `backend` é o produto MilScale, que consome esse JAR como qualquer outra dependência.

## Decisões técnicas

- **O motor não sabe o que é um militar.** O `MotorDeRodizio` só enxerga as interfaces `PessoaEscalada` e `TipoTurno`. Uma escala hospitalar reaproveitaria o motor inteiro criando só as suas implementações dessas interfaces e o seu `CriterioDeOrdenacao`, sem tocar em uma linha do núcleo.
- **Núcleo sem framework.** O `smartscale-core` não depende de Spring nem de JPA, o que o mantém leve, testável e reutilizável em qualquer contexto Java.
- **Pontos de variação explícitos.** O critério de ordenação ("maior número de dias sem serviço primeiro") e a política de descanso são estratégias plugáveis, e o código marca com comentários o que é núcleo e o que é especialização.
- **Roda sem instalar nada.** Em desenvolvimento usa H2 em modo de compatibilidade MySQL, e o Flyway cria as tabelas e popula ~200 militares de demonstração na primeira execução. Para produção há um perfil MySQL.

## Meu papel

O repositório `Sistema-SmartScale` (núcleo, MilScale e frontend) é **individual**: arquitetura, código e testes. Depois houve uma versão cloud (Azure Functions, MongoDB Atlas e Azure Static Web Apps), o Milscale-Cloud, desenvolvida **em equipe de 4** na disciplina de Arquitetura e Soluções Cloud.
