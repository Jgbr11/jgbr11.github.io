# JGBR11 OS: portfólio de João Guilherme Cordeiro

Portfólio em forma de "sistema operacional" cyberpunk: área de trabalho com janelas no PC, celular futurista no mobile e um **modo rápido** com rolagem para quem tem pressa.

**No ar:** https://jgbr11.github.io · **Modo rápido:** https://jgbr11.github.io/rapido/

## Stack
- [Astro](https://astro.build) gera o HTML estático (modo rápido, estudos de caso, 404)
- React + TypeScript na ilha interativa do modo OS
- Lógica de janelas, rotas e terminal em módulos puros, testados com Vitest
- Playwright (PC e celular) + axe para testes de ponta a ponta e de acessibilidade
- GitHub Actions: testa e publica no GitHub Pages a cada push

## Rodar localmente
Requer Node 24+ (os scripts executam arquivos `.ts` diretamente).

```bash
npm install
npx playwright install chromium
npm run dev          # http://localhost:4321
npm test             # unitários
npm run test:e2e     # ponta a ponta
```

## Conteúdo
- Identidade, trajetória, stack e certificados: `src/content/site.ts`
- Estudos de caso: `src/content/projetos/<slug>.md`. Um projeto novo é um arquivo novo.

Os textos, a foto e o currículo são pessoais e não podem ser reutilizados.
