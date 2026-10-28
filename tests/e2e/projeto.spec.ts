import { test, expect } from '@playwright/test';
import { prepararPagina, temRolagemHorizontal } from './util';

test.beforeEach(async ({ page }) => prepararPagina(page));

test('estudo de caso do CounTatic tem todas as seções', async ({ page }) => {
  await page.goto('/projetos/countatic/');
  await expect(page.getByRole('heading', { level: 1, name: 'CounTatic' })).toBeVisible();
  for (const secao of ['Problema', 'Arquitetura', 'Decisões técnicas', 'Meu papel']) {
    await expect(page.getByRole('heading', { level: 2, name: secao })).toBeVisible();
  }
  await expect(page.getByRole('img', { name: /Arquitetura do CounTatic/ })).toBeVisible();
  expect(await temRolagemHorizontal(page)).toBe(false);
});

test('Neon Burnout tem o link para jogar', async ({ page }) => {
  await page.goto('/projetos/neon-burnout/');
  await expect(page.getByRole('link', { name: /JOGAR NO ITCH.IO/ })).toHaveAttribute('href', 'https://jgbr11.itch.io/neon-burnout');
});

test('rota inexistente mostra a 404 do site', async ({ page }) => {
  const resposta = await page.goto('/nao-existe/');
  expect(resposta?.status()).toBe(404);
  await expect(page.getByText('SETOR NÃO ENCONTRADO')).toBeVisible();
  await expect(page.getByRole('link', { name: /MODO RÁPIDO/ })).toHaveAttribute('href', '/rapido/');
});

test('imagens de projeto declaram largura e altura (evita salto de layout)', async ({ page }) => {
  for (const url of ['/projetos/countatic/', '/projetos/neon-burnout/', '/rapido/']) {
    await page.goto(url);
    const imagens = page.locator('main img');
    expect(await imagens.count()).toBeGreaterThan(0);
    for (const img of await imagens.all()) {
      await expect(img).toHaveAttribute('width', /^[1-9]\d*$/);
      await expect(img).toHaveAttribute('height', /^[1-9]\d*$/);
    }
  }
});
