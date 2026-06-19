import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';
import { PILLARS } from './lib/pillars';
import { SPECIALTIES } from './lib/professionals';

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

const topics = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/topics' }),
  schema: z.object({
    pillar: z.enum(PILLARS),
    slug: z.string(),
    title: z.string(),
    navLabel: z.string().optional(),
    metaDescription: z.string(),
    painChips: z.array(z.string()).default([]),
    resources: z
      .array(
        z.object({
          title: z.string(),
          url: z.string(),
          blurb: z.string().optional(),
        }),
      )
      .default([]),
    order: z.number().default(0),
  }),
});

const professionals = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/professionals' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    title: z.string(),
    specialty: z.array(z.enum(SPECIALTIES)),
    bio: z.string(),
    headshot: z.string(),
    website: z.string().url(),
    featured: z.boolean().default(false),
    gregNote: z.string().optional(),
    guestEpisodes: z.array(z.string()).default([]),
    linkedin: z.string().url().optional(),
    instagram: z.string().url().optional(),
  }),
});

export const collections = { episodes, topics, professionals };
