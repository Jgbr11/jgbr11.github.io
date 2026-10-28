---
titulo: CounTatic
subtitulo: análise de partidas de CS2
resumo: Plataforma que descobre, baixa e analisa partidas de Counter-Strike 2 sozinha e transforma cada uma em estatísticas, percentis por faixa de rank e dicas.
ano: 2026
ordem: 1
stack: [Java 21, Spring Boot 3, Go, Node.js, TypeScript, MySQL, Docker]
links: {}
numeros:
  - { valor: "3", rotulo: "serviços em Docker" }
  - { valor: "~280", rotulo: "testes automatizados" }
  - { valor: "250 MB+", rotulo: "por demo processada" }
---

## Problema

Quem joga CS2 competitivo quer saber **onde está errando**, mas analisar uma partida à mão leva tempo, e as ferramentas prontas comparam todo mundo com todo mundo. O CounTatic acompanha as partidas sem que o jogador faça nada: quando uma partida termina, o sistema a descobre, baixa a demo, extrai cada evento, calcula as métricas e manda o link da análise no chat da Steam.

## Arquitetura

<svg class="diagrama" viewBox="0 0 640 260" role="img" aria-label="Arquitetura do CounTatic: o core em Java conversa com o parser em Go, o bot em Node.js e o MySQL, todos dentro do Docker Compose">
<defs><marker id="seta-ct" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="ponta"/></marker></defs>
<rect x="228" y="6" width="408" height="248" class="limite"/>
<text x="240" y="24" class="rot">DOCKER COMPOSE · rede interna</text>
<rect x="8" y="98" width="140" height="56" class="caixa"/>
<text x="78" y="122" class="nome" text-anchor="middle">CS2 + Steam</text>
<text x="78" y="140" class="rot" text-anchor="middle">GSI · Match Sharing</text>
<rect x="250" y="94" width="160" height="64" class="caixa caixa-destaque"/>
<text x="330" y="120" class="nome" text-anchor="middle">core-backend</text>
<text x="330" y="140" class="rot" text-anchor="middle">Java 21 · Spring Boot</text>
<rect x="486" y="34" width="140" height="50" class="caixa"/>
<text x="556" y="56" class="nome" text-anchor="middle">demo-parser</text>
<text x="556" y="73" class="rot" text-anchor="middle">Go</text>
<rect x="486" y="104" width="140" height="50" class="caixa"/>
<text x="556" y="126" class="nome" text-anchor="middle">steam-bot</text>
<text x="556" y="143" class="rot" text-anchor="middle">Node.js · TypeScript</text>
<rect x="486" y="174" width="140" height="50" class="caixa"/>
<text x="556" y="204" class="nome" text-anchor="middle">MySQL 8.4</text>
<line x1="148" y1="126" x2="248" y2="126" class="fio" marker-end="url(#seta-ct)"/>
<line x1="410" y1="112" x2="484" y2="62" class="fio" marker-end="url(#seta-ct)"/>
<line x1="410" y1="126" x2="484" y2="129" class="fio" marker-end="url(#seta-ct)"/>
<line x1="410" y1="140" x2="484" y2="196" class="fio" marker-end="url(#seta-ct)"/>
</svg>

Cada partida é um job que avança por uma **máquina de estados persistida** (`AWAITING_SHARECODE → PENDING → GC_DONE → DEMO_DONE → NOTIFIED`). Cada etapa é gravada antes da próxima, então, se o processo cair no meio de um download, o job recomeça de onde parou e não do zero.

## Decisões técnicas

- **Descobrir ≠ processar.** Um agendador só descobre partidas novas (uma chamada de ~1 s a cada 5 min). Um worker separado faz o trabalho pesado, que leva minutos e tem dezenas de formas de falhar. Assim cada um tem a sua cadência e a sua política de retry.
- **Nenhuma partida perdida.** O job é gravado em transação própria antes de o ponteiro de descoberta avançar. A deduplicação entre as duas origens (polling e GSI) é feita por uma constraint única no banco, e não por um `SELECT` antes do `INSERT`, que teria condição de corrida.
- **Parser em Go.** A biblioteca de referência para demos de CS2 é em Go. Isolá-la num microsserviço mantém o core em Java e permite escalar o parsing separadamente.
- **Demos de 250 MB+ sem estourar a memória.** A demo é baixada em streaming para disco e enviada ao parser direto do arquivo, sem nunca virar um `byte[]` no heap. Na gravação, o Hibernate faz inserts em lote, porque uma partida gera dezenas de milhares de eventos.
- **Padrão Strategy para as métricas.** Mira, Utilitários, Impacto e Posicionamento são estratégias injetadas pelo Spring. Uma métrica nova é uma classe nova, sem mexer no código existente.
- **Segurança.** Login com a Steam via OpenID 2.0 com verificação no servidor da Steam, sessão em cookie assinado com HMAC, token do GSI comparado em tempo constante e todas as portas presas em `127.0.0.1`.

## Meu papel

Projeto individual: arquitetura, os três serviços, o banco, os testes e a infraestrutura em Docker.
