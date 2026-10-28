---
titulo: Neon Burnout
subtitulo: RPG roguelike para navegador
resumo: RPG roguelike de turno em pixel art, publicado no itch.io, feito em JavaScript puro, com mais de 220 testes e simuladores que jogam centenas de partidas para balancear a dificuldade.
ano: 2026
ordem: 3
stack: [JavaScript, HTML5, CSS, Node.js (testes), Pixel art]
links:
  jogar: https://jgbr11.itch.io/neon-burnout
embedJogo: https://itch.io/embed-upload/20072981?color=0d0d0d
numeros:
  - { valor: "220+", rotulo: "testes automatizados" }
  - { valor: "0", rotulo: "dependências e engines" }
  - { valor: "beta", rotulo: "publicado no itch.io" }
---

## Problema

Fazer um jogo inteiro, de ponta a ponta, sem engine: regras de combate, progressão, economia, interface e arte, e entregar uma versão jogável para pessoas de verdade. O tema é uma sátira do mundo corporativo, em que o objetivo é chegar até o CEO e entregar a carta de demissão.

## Arquitetura

O jogo é **JavaScript puro**, sem engine nem dependências, e roda direto no navegador. As regras (combate, efeitos, classes, progressão) ficam em módulos separados da interface e são **dirigidas por dados**: inimigos, itens e habilidades são definidos em arquivos de dados, e não espalhados pelo código. Um script de empacotamento gera a versão publicada no itch.io.

## Decisões técnicas

- **Regras testáveis fora do navegador.** Como a lógica não depende da interface, mais de 220 testes com o runner nativo do Node (`node --test`) cobrem combate, ações, classes, efeitos e progressão.
- **Balanceamento por simulação.** Simuladores automatizados jogam centenas de partidas com builds diferentes e medem taxa de vitória e duração. A dificuldade é calibrada com esses números e com o feedback de testadores, não no "achismo".
- **Zero dependências.** Sem engine e sem bibliotecas: o jogo carrega rápido, não quebra com atualizações de terceiros e cada linha tem um motivo para existir.
- **IA como parceira, decisões humanas.** O desenvolvimento usou IA como apoio, mas as regras, o balanceamento e o conteúdo foram decididos por mim.

## Meu papel

Projeto individual: design do jogo, código, testes, ferramentas de simulação e publicação.
