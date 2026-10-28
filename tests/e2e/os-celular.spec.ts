import { test, expect } from '@playwright/test';
import { prepararPagina, temRolagemHorizontal } from './util';

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'celular', 'somente no celular');
  await prepararPagina(page);
});

test('tela inicial com crachá, apps e dock', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Crachá de identidade' })).toContainText('ONLINE');
  for (const nome of ['Projetos', 'Sobre', 'Trajetória', 'Currículo', 'Certificados', 'Contato', 'Terminal', 'Jogar']) {
    await expect(page.getByRole('button', { name: `Abrir ${nome}`, exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: /RÁPIDO/ })).toHaveAttribute('href', '/rapido/');
  expect(await temRolagemHorizontal(page)).toBe(false);
});

test('abrir pasta, abrir projeto e voltar duas vezes', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir Projetos', exact: true }).tap();
  await expect(page.getByRole('dialog', { name: 'projetos/' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir CounTatic' }).tap();
  await expect(page.getByRole('dialog', { name: 'CounTatic' })).toBeVisible();
  await expect(page).toHaveURL(/#\/projetos\/countatic$/);
  expect(await temRolagemHorizontal(page)).toBe(false);
  await page.getByRole('button', { name: 'Voltar' }).tap();
  await expect(page.getByRole('dialog', { name: 'projetos/' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Abrir Projetos', exact: true })).toBeVisible();
});

test('o voltar do sistema também funciona', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir Sobre', exact: true }).tap();
  await expect(page.getByRole('dialog', { name: 'sobre.txt' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('link direto: voltar leva à tela inicial, sem sair do site', async ({ page }) => {
  await page.goto('/#/projetos/smartscale');
  await expect(page.getByRole('dialog', { name: 'SmartScale' })).toBeVisible();
  await page.getByRole('button', { name: 'Voltar' }).tap();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/localhost:4321\/$/);
});

test('currículo no celular mostra botões e não iframe', async ({ page }) => {
  await page.goto('/#/curriculo');
  const app = page.getByRole('dialog', { name: 'curriculo.pdf' });
  await expect(app.getByRole('link', { name: /BAIXAR PDF/ })).toBeVisible();
  await expect(app.locator('iframe')).toHaveCount(0);
});
