import { getCollection } from 'astro:content';
import sharp from 'sharp';
import { join } from 'node:path';
import type { Midia, Projeto } from './tipos';

/** Lê as dimensões reais do arquivo em public/, para o navegador reservar o espaço antes de a imagem carregar. */
async function comDimensoes(midia: Midia): Promise<Midia> {
  const { width, height } = await sharp(join(process.cwd(), 'public', midia.src)).metadata();
  return { ...midia, largura: width, altura: height };
}

export async function carregarProjetos(): Promise<Projeto[]> {
  const entradas = await getCollection('projetos');
  const projetos = await Promise.all(
    entradas.map(async (e) => ({
      slug: e.id,
      ...e.data,
      capa: e.data.capa && (await comDimensoes(e.data.capa)),
      galeria: await Promise.all(e.data.galeria.map(comDimensoes)),
      html: e.rendered?.html ?? '',
    })),
  );
  return projetos.sort((a, b) => a.ordem - b.ordem);
}
