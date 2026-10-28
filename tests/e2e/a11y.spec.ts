import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { prepararPagina } from './util';

const PAGINAS = ['/', '/#/projetos/countatic', '/#/terminal', '/rapido/', '/projetos/countatic/', '/nao-existe/'];

for (const caminho of PAGINAS) {
  test(`sem violações sérias ou críticas em ${caminho}`, async ({ page }) => {
    await prepararPagina(page);
    await page.goto(caminho);
    if (caminho.startsWith('/#') || caminho === '/') {
      await expect(page.getByRole('button', { name: /^Abrir / }).first()).toBeVisible();
    }
    const resultado = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const graves = resultado.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`);
    expect(graves).toEqual([]);
  });
}
