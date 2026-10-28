// Uso: node scripts/capturar.ts <slug> <nome> <url> [largura=1440] [altura=900] [esperarSeletor]
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const [slug, nome, url, largura = '1440', altura = '900', seletor] = process.argv.slice(2);
if (!slug || !nome || !url) {
  console.error('uso: node scripts/capturar.ts <slug> <nome> <url> [largura] [altura] [esperarSeletor]');
  process.exit(1);
}
const pasta = join(process.cwd(), 'midia-original/projetos', slug);
mkdirSync(pasta, { recursive: true });
const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: Number(largura), height: Number(altura) }, deviceScaleFactor: 1 });
await pagina.goto(url, { waitUntil: 'networkidle' });
if (seletor) await pagina.waitForSelector(seletor);
await pagina.waitForTimeout(800);
const arquivo = join(pasta, `${nome}.png`);
await pagina.screenshot({ path: arquivo });
await navegador.close();
console.log('ok', arquivo);
