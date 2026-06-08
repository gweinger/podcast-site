import { describe, it, expect } from 'vitest';
import { recentEpisodes } from './episodes';
import type { EpisodeLike } from './pillars';

const ep = (over: Partial<EpisodeLike['data']>): EpisodeLike => ({
  data: {
    slug: 's',
    episode: 1,
    guest: 'G',
    title: 'T',
    status: 'interview',
    pillarPrimary: 'Beat Imposter Syndrome',
    ...over,
  },
});

describe('recentEpisodes', () => {
  it('returns the n newest interviews, newest first by episode number', () => {
    const eps = [
      ep({ slug: 'a', episode: 1 }),
      ep({ slug: 'b', episode: 3 }),
      ep({ slug: 'c', episode: 2 }),
    ];
    const out = recentEpisodes(eps, 2);
    expect(out.map((e) => e.data.slug)).toEqual(['b', 'c']);
  });

  it('orders by publishDate (newest first) when dates differ', () => {
    const older = ep({ slug: 'old', episode: 99, publishDate: new Date('2023-01-01') });
    const newer = ep({ slug: 'new', episode: 1, publishDate: new Date('2024-01-01') });
    const out = recentEpisodes([older, newer], 5);
    expect(out.map((e) => e.data.slug)).toEqual(['new', 'old']);
  });

  it('excludes minisodes', () => {
    const eps = [
      ep({ slug: 'mini', episode: 5, status: 'minisode' }),
      ep({ slug: 'full', episode: 4, status: 'interview' }),
    ];
    const out = recentEpisodes(eps, 5);
    expect(out.map((e) => e.data.slug)).toEqual(['full']);
  });

  it('returns all available when fewer than n exist', () => {
    const out = recentEpisodes([ep({ slug: 'only', episode: 1 })], 6);
    expect(out).toHaveLength(1);
  });
});
