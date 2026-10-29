import { test, expect } from '@playwright/test';
import { prepararPagina } from './util';

const BASE = '/demo/countatic/';

test.beforeEach(async ({ page }) => {
  await prepararPagina(page);
  await page.route('**/localhost:8080/**', (rota) => rota.abort());
  await page.route('**/fonts.googleapis.com/**', (rota) => rota.abort());
  await page.route('**/fonts.gstatic.com/**', (rota) => rota.abort());
});

test('a raiz da demo redireciona para o jogador e mostra a faixa', async ({ page }) => {
  await page.goto(BASE);
  await expect(page).toHaveURL(/\/demo\/countatic\/p\/jgbr11\/?$/);
  await expect(page.locator('.demo-faixa')).toContainText('DEMO');
});

test('a lista tem exatamente 5 partidas apontando para a demo', async ({ page }) => {
  await page.goto(`${BASE}p/jgbr11/partidas/`);
  const links = page.locator('a[href^="/demo/countatic/m/"]');
  await expect(links).toHaveCount(5);
});

test('partida 28: interações usam só a API estática, sem erros nem localhost:8080', async ({ page }) => {
  test.setTimeout(60_000);
  const ruins: string[] = [];
  const chamadas: string[] = [];
  const erros: string[] = [];
  page.on('pageerror', (e) => erros.push(e.message));
  page.on('request', (r) => { if (r.url().includes('localhost:8080')) ruins.push(r.url()); });
  page.on('response', (r) => {
    if (!r.url().includes('/demo/countatic/api/')) return;
    chamadas.push(r.url());
    if (r.status() >= 400) ruins.push(`${r.status()} ${r.url()}`);
  });
  await page.goto(`${BASE}m/28/`);
  const linhas = page.locator('#rows tr');
  await expect(linhas.first()).toBeVisible();
  const n = await linhas.count();
  expect(n).toBeGreaterThan(1);
  for (let i = 0; i < n; i++) {
    await linhas.nth(i).click();
    await page.waitForLoadState('networkidle');
    for (const lado of ['CT', 'TR', 'Partida']) {
      await page.getByRole('button', { name: lado, exact: true }).click({ force: true });
    }
  }
  await page.waitForLoadState('networkidle');
  for (const parte of ['/weapons', '/highlights', '/sides']) {
    expect(chamadas.some((u) => u.includes(parte)), parte).toBe(true);
  }
  expect(ruins).toEqual([]);
  expect(erros).toEqual([]);
});

test('o estudo de caso tem o botão ABRIR DEMO AO VIVO sem ciano sobre amarelo', async ({ page }) => {
  await page.goto('/projetos/countatic/');
  const botao = page.getByRole('link', { name: /ABRIR DEMO AO VIVO/ });
  await expect(botao).toHaveAttribute('href', BASE);
  await expect(botao).toHaveAttribute('target', '_blank');
  const cor = await botao.evaluate((el) => getComputedStyle(el).color);
  expect(cor).not.toBe('rgb(2, 215, 242)');
  await botao.focus();
  const contorno = await botao.evaluate((el) => getComputedStyle(el).outlineStyle);
  expect(contorno).not.toBe('none');
});

test('no PC, a pasta do projeto abre a demo numa janela countatic.exe', async ({ page }, info) => {
  test.skip(info.project.name !== 'pc', 'janelas só existem no PC');
  await page.goto('/#/projetos/countatic');
  const projeto = page.getByRole('dialog', { name: 'CounTatic' });
  await projeto.getByRole('button', { name: /ABRIR DEMO AQUI/ }).click();
  const janela = page.getByRole('dialog', { name: 'countatic.exe' });
  await expect(janela).toBeVisible();
  await expect(janela.locator('iframe[title="Demo do CounTatic"]')).toHaveAttribute('src', BASE);
  await expect(janela.getByRole('link', { name: /ABRIR EM NOVA ABA/ })).toHaveAttribute('href', BASE);
  const frame = page.frameLocator('iframe[title="Demo do CounTatic"]');
  await expect(frame.locator('.demo-faixa')).toBeVisible();
});

test('no celular, o botão ABRIR DEMO AQUI não aparece', async ({ page }, info) => {
  test.skip(info.project.name !== 'celular', 'só celular');
  await page.goto('/#/projetos/countatic');
  await expect(page.getByRole('link', { name: /ABRIR DEMO AO VIVO/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /ABRIR DEMO AQUI/ })).toHaveCount(0);
});

test('a janela countatic.exe mostra o caminho com barras invertidas', async ({ page }, info) => {
  test.skip(info.project.name !== 'pc', 'janelas só existem no PC');
  await page.goto('/#/demo-countatic');
  await expect(page.getByRole('dialog', { name: 'countatic.exe' })).toContainText(String.raw`C:\JGBR11\PROJETOS\COUNTATIC\DEMO.EXE`);
});

test('a capa do estudo de caso é um link para a demo, com selo e foco visível', async ({ page }) => {
  await page.goto('/projetos/countatic/');
  const capa = page.getByRole('link', { name: /Abrir demo ao vivo do CounTatic/i });
  await expect(capa).toHaveAttribute('href', BASE);
  await expect(capa).toHaveAttribute('target', '_blank');
  await expect(capa).toHaveAttribute('rel', /noopener/);
  await expect(capa.locator('img')).toHaveAttribute('alt', /.+/);
  await expect(capa.locator('.projeto-cab__selo')).toContainText('ABRIR DEMO AO VIVO');
  await capa.focus();
  expect(await capa.evaluate((el) => getComputedStyle(el).outlineStyle)).not.toBe('none');
});

test('na janela do projeto, a capa linka a demo e ABRIR DEMO AQUI cabe sem rolar', async ({ page }, info) => {
  test.skip(info.project.name !== 'pc', 'janelas só existem no PC');
  await page.goto('/#/projetos/countatic');
  const janela = page.getByRole('dialog', { name: 'CounTatic' });
  await expect(janela.getByRole('link', { name: /Abrir demo ao vivo do CounTatic/i })).toHaveAttribute('href', BASE);
  const botao = janela.getByRole('button', { name: /ABRIR DEMO AQUI/ });
  await expect(botao).toBeVisible();
  const corpo = await janela.locator('.janela__corpo').boundingBox();
  const b = await botao.boundingBox();
  expect(corpo && b).toBeTruthy();
  expect(b!.y).toBeGreaterThanOrEqual(corpo!.y);
  expect(b!.y + b!.height).toBeLessThanOrEqual(corpo!.y + corpo!.height);
});

test('o ícone countatic.exe da área de trabalho abre a janela da demo', async ({ page }, info) => {
  test.skip(info.project.name !== 'pc', 'janelas só no PC');
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir countatic.exe' }).dblclick();
  await expect(page.getByRole('dialog', { name: 'countatic.exe' })).toBeVisible();
});

test('no celular, Abrir Demo CS2 abre a demo em tela cheia sem estourar a largura', async ({ page }, info) => {
  test.skip(info.project.name !== 'celular', 'só celular');
  await page.goto('/');
  await page.getByRole('button', { name: 'Abrir Demo CS2', exact: true }).tap();
  const dlg = page.getByRole('dialog', { name: 'countatic.exe' });
  await expect(dlg).toBeVisible();
  const iframe = dlg.locator('iframe[title="Demo do CounTatic"]');
  await expect(iframe).toHaveAttribute('src', BASE);
  const caixa = await iframe.boundingBox();
  expect(caixa!.x + caixa!.width).toBeLessThanOrEqual(360);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('selo DEMO AO VIVO no modo rápido e na lista projetos/', async ({ page }, info) => {
  await page.goto('/rapido/');
  await expect(page.locator('a.r-projeto[href="/projetos/countatic/"] .selo-demo')).toContainText('DEMO AO VIVO');
  await expect(page.locator('a.r-projeto:not([href="/projetos/countatic/"]) .selo-demo')).toHaveCount(0);
  if (info.project.name === 'pc') {
    await page.goto('/#/projetos');
    await expect(page.getByRole('button', { name: 'Abrir CounTatic', exact: true }).locator('.selo-demo')).toBeVisible();
  } else {
    await page.goto('/');
    await page.getByRole('button', { name: 'Abrir Projetos', exact: true }).tap();
    await expect(page.getByRole('button', { name: 'Abrir CounTatic', exact: true }).locator('.selo-demo')).toBeVisible();
  }
});
