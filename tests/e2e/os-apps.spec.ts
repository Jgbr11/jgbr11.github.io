import { test, expect } from '@playwright/test';
import { prepararPagina } from './util';

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'pc', 'somente no PC');
  await prepararPagina(page);
  // O jogo não precisa carregar de verdade nos testes.
  await page.route(/itch\.(io|zone)/, (rota) => rota.abort());
});

test('terminal: help, open, completar, histórico e clear', async ({ page }) => {
  await page.goto('/#/terminal');
  const janela = page.getByRole('dialog', { name: 'terminal' });
  const entrada = janela.getByRole('textbox', { name: 'Comando do terminal' });
  await expect(entrada).toBeFocused();
  const log = janela.getByRole('log');

  await entrada.fill('help');
  await entrada.press('Enter');
  await expect(log).toContainText('comandos disponíveis');

  await entrada.fill('who');
  await entrada.press('Tab');
  await expect(entrada).toHaveValue('whoami ');
  await entrada.press('Enter');
  await expect(log).toContainText('Desenvolvedor Full Stack');

  await entrada.press('ArrowUp');
  await expect(entrada).toHaveValue('whoami');

  await entrada.fill('open countatic');
  await entrada.press('Enter');
  await expect(page.getByRole('dialog', { name: 'CounTatic' })).toBeVisible();

  await page.getByRole('list', { name: 'Janelas abertas' }).getByRole('button', { name: 'terminal', exact: true }).click();
  await entrada.fill('clear');
  await entrada.press('Enter');
  await expect(log).toBeEmpty();
});

test('terminal: rapido vai para o modo rápido', async ({ page }) => {
  await page.goto('/#/terminal');
  const entrada = page.getByRole('textbox', { name: 'Comando do terminal' });
  await entrada.fill('rapido');
  await entrada.press('Enter');
  await expect(page).toHaveURL(/\/rapido\/$/);
});

test('Neon Burnout só carrega o iframe depois de clicar em JOGAR', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir neon-burnout.exe', exact: true }).dblclick();
  const janela = page.getByRole('dialog', { name: 'neon-burnout.exe' });
  await expect(janela.locator('iframe')).toHaveCount(0);
  await janela.getByRole('button', { name: /JOGAR/ }).click();
  await expect(janela.locator('iframe[title="Neon Burnout (jogo)"]')).toHaveAttribute('src', 'https://itch.io/embed-upload/20072981?color=0d0d0d');
  await expect(janela.getByRole('link', { name: /ABRIR NO ITCH.IO/ })).toHaveAttribute('href', 'https://jgbr11.itch.io/neon-burnout');
});

test('currículo e contato', async ({ page }) => {
  await page.goto('/#/curriculo');
  const cv = page.getByRole('dialog', { name: 'curriculo.pdf' });
  await expect(cv.getByRole('link', { name: /BAIXAR PDF/ })).toHaveAttribute('download', '');
  await expect(cv.locator('iframe[title="Currículo em PDF"]')).toHaveAttribute('src', '/curriculo-joao-guilherme-cordeiro.pdf');
  await page.goto('/#/contato');
  await expect(page.getByRole('dialog', { name: 'contato.exe' }).locator('a.email')).toHaveAttribute('href', 'mailto:jgcreplive@gmail.com');
});
