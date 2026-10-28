import { test, expect } from '@playwright/test';
import { prepararPagina } from './util';

test.beforeEach(async ({ page }, info) => {
  test.skip(info.project.name !== 'pc', 'somente no PC');
  await prepararPagina(page);
});

test('abre com sobre.txt e o crachá', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('dialog', { name: 'sobre.txt' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Crachá de identidade' })).toContainText('ONLINE');
});

test('duplo clique abre a pasta e o projeto, e o hash acompanha', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir projetos/', exact: true }).dblclick();
  await expect(page.getByRole('dialog', { name: 'projetos/' })).toBeVisible();
  await page.getByRole('button', { name: 'Abrir CounTatic' }).click();
  const janela = page.getByRole('dialog', { name: 'CounTatic' });
  await expect(janela.getByRole('heading', { name: 'Decisões técnicas' })).toBeVisible();
  await expect(page).toHaveURL(/#\/projetos\/countatic$/);
});

test('Enter no ícone abre o app', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir trajetoria/', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog', { name: 'trajetoria/' })).toContainText('TijucasOpen');
});

test('minimizar, restaurar pela barra e fechar', async ({ page }) => {
  await page.goto('/#/projetos');
  const janela = page.getByRole('dialog', { name: 'projetos/' });
  await janela.getByRole('button', { name: 'Minimizar' }).click();
  await expect(janela).toBeHidden();
  await page.getByRole('list', { name: 'Janelas abertas' }).getByRole('button', { name: 'projetos/', exact: true }).click();
  await expect(janela).toBeVisible();
  await janela.getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('dialog', { name: 'projetos/' })).toHaveCount(0);
});

test('Esc fecha a janela focada', async ({ page }) => {
  await page.goto('/#/certificados');
  const janela = page.getByRole('dialog', { name: 'certificados/' });
  await expect(janela).toBeFocused(); // a janela recebe o foco ao abrir
  await page.keyboard.press('Escape');
  await expect(janela).toHaveCount(0);
});

test('arrastar pela barra move a janela', async ({ page }) => {
  await page.goto('/');
  const janela = page.getByRole('dialog', { name: 'sobre.txt' });
  const antes = (await janela.boundingBox())!;
  await page.mouse.move(antes.x + 60, antes.y + 14);
  await page.mouse.down();
  await page.mouse.move(antes.x + 160, antes.y + 64, { steps: 5 });
  await page.mouse.up();
  const depois = (await janela.boundingBox())!;
  expect(Math.round(depois.x - antes.x)).toBe(100);
  expect(Math.round(depois.y - antes.y)).toBe(50);
});

test('link direto abre só o projeto', async ({ page }) => {
  await page.goto('/#/projetos/smartscale');
  await expect(page.getByRole('dialog', { name: 'SmartScale' })).toBeVisible();
  await expect(page.getByRole('dialog', { name: 'sobre.txt' })).toHaveCount(0);
});

test('projeto inexistente abre a pasta com aviso', async ({ page }) => {
  await page.goto('/#/projetos/xyz');
  await expect(page.getByRole('dialog', { name: 'projetos/' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText('Projeto "xyz" não encontrado.');
});

test('menu START abre apps e fecha com Esc', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /START/ }).click();
  const menu = page.getByRole('menu', { name: 'Menu iniciar' });
  await expect(menu).toBeVisible();
  await menu.getByRole('menuitem', { name: 'certificados/' }).click();
  await expect(page.getByRole('dialog', { name: 'certificados/' })).toBeVisible();
  await expect(menu).toHaveCount(0);
  await page.getByRole('button', { name: /START/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('menu')).toHaveCount(0);
});

test('modo rápido sempre visível', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /MODO RÁPIDO/ })).toHaveAttribute('href', '/rapido/');
});

test('duplo clique no botão Maximizar não alterna duas vezes pela barra', async ({ page }) => {
  await page.goto('/');
  const janela = page.getByRole('dialog', { name: 'sobre.txt' });
  await janela.getByRole('button', { name: 'Maximizar' }).dblclick();
  await expect(janela.getByRole('button', { name: 'Maximizar' })).toBeVisible();
});

test('clique sintético (leitor de tela, detail 0) abre o app', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('dialog', { name: 'sobre.txt' }).getByRole('button', { name: 'Fechar' }).click();
  await expect(page.getByRole('dialog', { name: 'sobre.txt' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Abrir sobre.txt', exact: true }).dispatchEvent('click');
  await expect(page.getByRole('dialog', { name: 'sobre.txt' })).toBeVisible();
});

test('clique simples de mouse só seleciona, não abre', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir trajetoria/', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'trajetoria/' })).toHaveCount(0);
});
