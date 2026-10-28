// Uso (com `npm run preview` rodando): node scripts/lighthouse.ts
import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const paginas = ['/rapido/', '/projetos/countatic/', '/'];
const chrome = chromium.executablePath();
let reprovou = false;

for (const pagina of paginas) {
  const saida = `lighthouse${pagina.replace(/\W+/g, '-')}.json`;
  execFileSync('npx', ['lighthouse', `http://localhost:4321${pagina}`, '--form-factor=mobile',
    '--only-categories=performance,accessibility,best-practices,seo', '--output=json', `--output-path=${saida}`,
    '--chrome-flags=--headless=new', '--quiet'], { stdio: 'inherit', shell: true, env: { ...process.env, CHROME_PATH: chrome } });
  const relatorio = JSON.parse(readFileSync(saida, 'utf8'));
  const notas = Object.fromEntries(Object.entries(relatorio.categories).map(([k, v]) => [k, Math.round((v as { score: number }).score * 100)]));
  console.log(pagina, notas);
  // A meta de 90+ vale para as páginas estáticas. O "/" (ilha do OS) é só informativo.
  if (pagina !== '/' && Object.values(notas).some((n) => (n as number) < 90)) reprovou = true;
}
process.exit(reprovou ? 1 : 0);
