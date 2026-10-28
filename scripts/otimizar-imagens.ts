// Uso: node scripts/otimizar-imagens.ts
// Foto: recorte mais fechado no rosto. Prints: midia-original/projetos/<slug>/*.png -> public/projetos/<slug>/*.webp
import sharp from 'sharp';
import { readdirSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';

const RAIZ = process.cwd();

// Recorte da foto 400x400. Ajuste após conferir o resultado visualmente.
const RECORTE_FOTO = { left: 90, top: 10, width: 300, height: 300 };

await sharp(join(RAIZ, 'midia-original/foto-original.jpg'))
  .extract(RECORTE_FOTO)
  .webp({ quality: 86 })
  .toFile(join(RAIZ, 'public/foto.webp'));
console.log('ok public/foto.webp');

await sharp(readFileSync(join(RAIZ, 'public/favicon.svg')))
  .resize(180, 180)
  .png()
  .toFile(join(RAIZ, 'public/apple-touch-icon.png'));
console.log('ok public/apple-touch-icon.png');

const origemProjetos = join(RAIZ, 'midia-original/projetos');
if (existsSync(origemProjetos)) {
  for (const slug of readdirSync(origemProjetos)) {
    const destino = join(RAIZ, 'public/projetos', slug);
    mkdirSync(destino, { recursive: true });
    for (const arquivo of readdirSync(join(origemProjetos, slug)).filter((a) => /\.(png|jpe?g)$/i.test(a))) {
      const saida = join(destino, `${parse(arquivo).name}.webp`);
      await sharp(join(origemProjetos, slug, arquivo))
        .resize({ width: 1600, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(saida);
      console.log('ok', saida);
    }
  }
}
