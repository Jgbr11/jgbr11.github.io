import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://jgbr11.github.io',
  integrations: [react(), sitemap()],
  // O Astro 7 passou a comprimir no estilo JSX, que pode remover espaços entre elementos inline.
  compressHTML: true,
});
