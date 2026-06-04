import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const PILLARS = [
  'Beat Imposter Syndrome',
  'Speak Up in Meetings with Quiet Authority',
  'Increase Visibility & Influence Authentically',
  'Communicate Like a Leader',
  'Manage Your Energy & Thrive in Extroverted Cultures',
  'Get Promoted Without Becoming Someone Else',
] as const;

const episodes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/episodes' }),
  schema: z.object({
    episode: z.number(),
    slug: z.string(),
    title: z.string(),
    guest: z.string(),
    summary: z.string(),
    show: z.literal('introverted-leader'),
    status: z.enum(['interview', 'minisode']),
    publishDate: z.coerce.date().optional(),
    pillarPrimary: z.enum(PILLARS),
    pillarSecondary: z.enum(PILLARS).optional(),
    painPoints: z.array(z.number()).default([]),
    urls: z
      .object({
        apple: z.string().optional(),
        spotify: z.string().optional(),
        youtube: z.string().optional(),
        substack: z.string().optional(),
      })
      .default({}),
    simplecastEmbedId: z.string().optional(),
    pullQuotes: z.array(z.string()).default([]),
    hasTranscript: z.boolean().default(false),
    thumbnail: z.string().optional(),
  }),
});

export const collections = { episodes };
