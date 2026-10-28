// Uso: node scripts/desfocar.ts <arquivo.png> x,y,w,h [x,y,w,h ...]   (sobrescreve o arquivo)
import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'node:fs';

const [arquivo, ...regioes] = process.argv.slice(2);
if (!arquivo || regioes.length === 0) {
  console.error('uso: node scripts/desfocar.ts <arquivo.png> x,y,w,h [...]');
  process.exit(1);
}
const original = readFileSync(arquivo);
const camadas = await Promise.all(regioes.map(async (r) => {
  const [left, top, width, height] = r.split(',').map(Number);
  const borrado = await sharp(original).extract({ left, top, width, height }).blur(18).toBuffer();
  return { input: borrado, left, top };
}));
writeFileSync(arquivo, await sharp(original).composite(camadas).png().toBuffer());
console.log('ok', arquivo, `${camadas.length} região(ões) desfocada(s)`);
