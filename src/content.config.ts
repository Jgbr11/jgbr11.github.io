import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
    links: z.object({ codigo: z.url().optional(), jogar: z.url().optional() }),
    capa: midia.optional(),
    galeria: z.array(midia).default([]),
    numeros: z.array(z.object({ valor: z.string(), rotulo: z.string() })),
    equipe: z.string().optional(),
    embedJogo: z.url().optional(),
  }),
});

export const collections = { projetos };
