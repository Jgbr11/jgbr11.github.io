import type { Page } from '@playwright/test';

/** Bloqueia o GoatCounter e, por padrão, marca o boot como já visto. */
export async function prepararPagina(page: Page, opcoes: { pularBoot?: boolean } = {}) {
  await page.route('**/gc.zgo.at/**', (rota) => rota.abort());
  if (opcoes.pularBoot ?? true) {
    await page.addInitScript(() => {
      try { localStorage.setItem('jgbr11:boot-visto', '1'); } catch { /* sem storage */ }
    });
  }
}

/** true se a página tem rolagem horizontal (algo vazando para os lados). */
export async function temRolagemHorizontal(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
}
