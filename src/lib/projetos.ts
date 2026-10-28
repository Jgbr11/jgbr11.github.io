import { getCollection } from 'astro:content';
import type { Projeto } from './tipos';

export async function carregarProjetos(): Promise<Projeto[]> {
  const entradas = await getCollection('projetos');
  return entradas
    .sort((a, b) => a.data.ordem - b.data.ordem)
    .map((e) => ({ slug: e.id, ...e.data, html: e.rendered?.html ?? '' }));
}
