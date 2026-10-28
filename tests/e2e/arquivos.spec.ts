import { test, expect } from '@playwright/test';

test('currículo e imagem de prévia são servidos', async ({ request }) => {
  const pdf = await request.get('/curriculo-joao-guilherme-cordeiro.pdf');
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()['content-type']).toContain('application/pdf');
  const og = await request.get('/og-image.png');
  expect(og.status()).toBe(200);
  expect(og.headers()['content-type']).toContain('image/png');
});
