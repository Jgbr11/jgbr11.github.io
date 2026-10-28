import { test, expect } from '@playwright/test';
import { prepararPagina, temRolagemHorizontal } from './util';

test.beforeEach(async ({ page }) => {
  await prepararPagina(page);
  await page.goto('/rapido/');
});

test('abertura com nome, título e botões', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).toContainText('João Guilherme');
  await expect(page.getByText('Desenvolvedor Full Stack').first()).toBeVisible();
  await expect(page.getByRole('link', { name: /CURRÍCULO/ })).toHaveAttribute('href', '/curriculo-joao-guilherme-cordeiro.pdf');
  await expect(page.getByRole('link', { name: /GITHUB/ }).first()).toHaveAttribute('href', 'https://github.com/Jgbr11');
  await expect(page.getByRole('link', { name: /VOLTAR AO OS/ })).toHaveAttribute('href', '/');
});

test('lista os 4 projetos com link para o estudo de caso', async ({ page }) => {
  const cards = page.locator('.r-projeto');
  await expect(cards).toHaveCount(4);
  await expect(cards.first()).toHaveAttribute('href', '/projetos/countatic/');
});

test('trajetória, certificados e contato', async ({ page }) => {
  await expect(page.getByText('Centro Comercial TijucasOpen')).toBeVisible();
  await expect(page.getByRole('link', { name: /Network Defense/ })).toHaveAttribute('href', /credly\.com/);
  await expect(page.locator('a.email')).toHaveAttribute('href', 'mailto:jgcreplive@gmail.com');
});

test('sem telefone e sem rolagem horizontal', async ({ page }) => {
  await expect(page.locator('body')).not.toContainText(/\(?41\)?\s?9\d{4}-?\d{4}/);
  expect(await temRolagemHorizontal(page)).toBe(false);
});
