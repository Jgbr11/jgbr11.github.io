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

// O HTML da demo é do CounTatic e não é alterado: as violações são só registradas, sem reprovar.
test('demo do CounTatic: registra violações de acessibilidade (informativo)', async ({ page }, info) => {
  await prepararPagina(page);
  await page.route('**/localhost:8080/**', (rota) => rota.abort());
  await page.goto('/demo/countatic/p/jgbr11/');
  await page.waitForLoadState('networkidle');
  await expect(page.locator('.demo-faixa')).toBeVisible();
  const analisar = () => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  // A página anima e busca dados ao carregar; uma análise iniciada no meio disso pode falhar uma vez.
  const resultado = await analisar().catch(async () => { await page.waitForLoadState('networkidle'); return analisar(); });
  const resumo = resultado.violations.map((v) => ({ id: v.id, impacto: v.impact, ocorrencias: v.nodes.length }));
  console.log('a11y demo (informativo):', JSON.stringify(resumo));
  await info.attach('a11y-demo-countatic.json', { body: JSON.stringify(resumo, null, 2), contentType: 'application/json' });
});
