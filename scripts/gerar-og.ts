// Uso: node scripts/gerar-og.ts  -> public/og-image.png (1200x627)
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { site } from '../src/content/site.ts';

const foto = `data:image/webp;base64,${readFileSync(join(process.cwd(), 'public/foto.webp')).toString('base64')}`;

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@700&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet">
<style>
  *{box-sizing:border-box;margin:0}
  body{width:1200px;height:627px;background:#f3e600;color:#0d0d0d;font-family:'JetBrains Mono',monospace;position:relative;overflow:hidden}
  .marca{position:absolute;right:330px;bottom:30px;font:700 260px/.8 'Chakra Petch';color:rgba(13,13,13,.08)}
  .texto{position:absolute;left:72px;top:96px;width:700px}
  .tag{font-size:20px;letter-spacing:.14em;color:#0a1f3a}
  h1{font:700 92px/.92 'Chakra Petch';text-transform:uppercase;margin:22px 0 18px}
  .funcao{font-size:30px;color:#0a1f3a}
  .url{position:absolute;left:72px;bottom:62px;font-size:24px;background:#0d0d0d;color:#f3e600;padding:8px 16px}
  .cracha{position:absolute;right:72px;top:74px;width:300px;background:#0d0d0d;padding:16px;box-shadow:12px 12px 0 rgba(13,13,13,.35);
    clip-path:polygon(0 0,calc(100% - 22px) 0,100% 22px,100% 100%,0 100%)}
  .topo{display:flex;justify-content:space-between;background:#02d7f2;margin:-16px -16px 16px;padding:8px 16px;font-size:14px;letter-spacing:.16em}
  .cracha img{width:100%;aspect-ratio:1;object-fit:cover;outline:3px solid #f3e600;outline-offset:4px}
  .status{display:inline-block;margin-top:18px;background:#f3e600;padding:4px 10px;font-size:16px}
  .faixa{position:absolute;left:0;right:0;bottom:0;height:22px;background:repeating-linear-gradient(-45deg,#0d0d0d 0 16px,transparent 16px 32px)}
</style></head><body>
  <div class="marca">JGBR<br>11</div>
  <div class="texto">
    <p class="tag">// SYS.ONLINE — ${site.base.toUpperCase()}</p>
    <h1>João Guilherme<br>Cordeiro</h1>
    <p class="funcao">&gt; ${site.titulo}</p>
  </div>
  <p class="url">jgbr11.github.io</p>
  <div class="cracha"><p class="topo"><span>NET-ID // USER</span><span>#${site.handle}</span></p>
    <img src="${foto}" alt=""><p class="status">● ${site.status}</p></div>
  <div class="faixa"></div>
</body></html>`;

const navegador = await chromium.launch();
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 627 } });
await pagina.setContent(html, { waitUntil: 'networkidle' });
await pagina.screenshot({ path: join(process.cwd(), 'public/og-image.png') });
await navegador.close();
console.log('ok public/og-image.png');
