import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const midia = z.object({ src: z.string(), alt: z.string() });

const projetos = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projetos' }),
  schema: z.object({
    titulo: z.string(),
    subtitulo: z.string(),
    resumo: z.string(),
    ano: z.number(),
    ordem: z.number(),
    stack: z.array(z.string()),
    links: z.object({ codigo: z.string().url().optional(), jogar: z.string().url().optional() }),
    capa: midia.optional(),
    galeria: z.array(midia).default([]),
    numeros: z.array(z.object({ valor: z.string(), rotulo: z.string() })),
    equipe: z.string().optional(),
    embedJogo: z.string().url().optional(),
  }),
});

export const collections = { projetos };
