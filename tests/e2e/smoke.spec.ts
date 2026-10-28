import { test, expect } from '@playwright/test';
import { prepararPagina } from './util';

test('a página inicial responde e tem o nome', async ({ page }) => {
  await prepararPagina(page);
  await page.goto('/');
  await expect(page).toHaveTitle(/João Guilherme Cordeiro/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-BR');
});

test.describe('sem JavaScript', () => {
  test.use({ javaScriptEnabled: false });
  test('só a mensagem noscript aparece e aponta para /rapido/', async ({ page }) => {
    await page.goto('/');
    const msg = page.locator('noscript p.os-carregando');
    await expect(msg).toBeVisible();
    await expect(msg.locator('a')).toHaveAttribute('href', '/rapido/');
    await expect(page.locator('p.os-carregando--fallback').first()).toBeHidden();
  });
});
