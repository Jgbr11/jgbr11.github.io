import { test, expect } from '@playwright/test';
import { prepararPagina } from './util';

test('boot na primeira visita, pulável e lembrado', async ({ page }) => {
  await prepararPagina(page, { pularBoot: false });
  await page.goto('/');
  const boot = page.getByTestId('boot');
  await expect(boot).toBeVisible();
  await page.keyboard.press('Space');
  await expect(boot).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('boot')).toHaveCount(0);
});

test('boot termina sozinho em menos de 3 s', async ({ page }) => {
  await prepararPagina(page, { pularBoot: false });
  await page.goto('/');
  await expect(page.getByTestId('boot')).toHaveCount(0, { timeout: 3000 });
});

test('sem boot com reduzir movimento', async ({ page }) => {
  await prepararPagina(page, { pularBoot: false });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: /^Abrir / }).first()).toBeVisible();
  await expect(page.getByTestId('boot')).toHaveCount(0);
});

test('abrir um app conta um evento no GoatCounter', async ({ page }) => {
  await prepararPagina(page);
  await page.addInitScript(() => {
    const w = window as unknown as { goatcounter: unknown; __contagens: unknown[] };
    w.__contagens = [];
    w.goatcounter = { count: (o: unknown) => w.__contagens.push(o) };
  });
  // No PC, a abertura pelo link direto passa pelo mesmo `abrir` e conta. No celular, só os toques contam.
  if (test.info().project.name === 'celular') {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir Projetos', exact: true }).tap();
    await page.getByRole('button', { name: 'Abrir CounTatic' }).tap();
  } else {
    await page.goto('/#/projetos/countatic');
  }
  await expect(page.getByRole('dialog', { name: 'CounTatic' })).toBeVisible();
  const contagens = await page.evaluate(() => (window as unknown as { __contagens: unknown[] }).__contagens);
  expect(contagens).toContainEqual({ path: 'os/projetos/countatic', title: 'OS: projeto', event: true });
});

test('Esc durante o boot só pula o boot e não fecha o sobre.txt', async ({ page }) => {
  test.skip(test.info().project.name !== 'pc', 'somente no PC');
  await prepararPagina(page, { pularBoot: false });
  await page.goto('/');
  await expect(page.getByTestId('boot')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('boot')).toHaveCount(0);
  await expect(page.getByRole('dialog', { name: 'sobre.txt' })).toBeVisible();
});
