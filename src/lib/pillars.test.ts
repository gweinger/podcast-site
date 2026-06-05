import { describe, it, expect } from 'vitest';
import {
  PILLARS,
  topicSlugForPillar,
  pillarForSlug,
  partitionEpisodes,
  type EpisodeLike,
} from './pillars';

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

describe('pillar/slug map', () => {
  it('maps every pillar to a slug and back (round-trip)', () => {
    for (const p of PILLARS) {
      expect(pillarForSlug(topicSlugForPillar(p))).toBe(p);
    }
  });

  it('has a unique slug per pillar', () => {
    const slugs = PILLARS.map(topicSlugForPillar);
    expect(new Set(slugs).size).toBe(PILLARS.length);
  });

  it('returns undefined for an unknown slug', () => {
    expect(pillarForSlug('not-a-real-slug')).toBeUndefined();
  });
});

describe('partitionEpisodes', () => {
  const P = 'Beat Imposter Syndrome' as const;
  const Q = 'Get Promoted Without Becoming Someone Else' as const;

  it('puts primary-pillar interviews in core', () => {
    const { core } = partitionEpisodes([ep({ pillarPrimary: P })], P);
    expect(core).toHaveLength(1);
  });

  it('puts secondary-pillar interviews in secondary, not core', () => {
    const { core, secondary } = partitionEpisodes(
      [ep({ pillarPrimary: Q, pillarSecondary: P })],
      P,
    );
    expect(core).toHaveLength(0);
    expect(secondary).toHaveLength(1);
  });

  it('routes minisodes to minisodes regardless of primary/secondary', () => {
    const { core, secondary, minisodes } = partitionEpisodes(
      [ep({ status: 'minisode', pillarPrimary: P })],
      P,
    );
    expect(core).toHaveLength(0);
    expect(secondary).toHaveLength(0);
    expect(minisodes).toHaveLength(1);
  });

  it('excludes episodes of other pillars entirely', () => {
    const { core, secondary, minisodes } = partitionEpisodes(
      [ep({ pillarPrimary: Q })],
      P,
    );
    expect(core.length + secondary.length + minisodes.length).toBe(0);
  });

  it('sorts core newest first by publishDate then episode number', () => {
    const a = ep({ slug: 'a', episode: 2, pillarPrimary: P });
    const b = ep({ slug: 'b', episode: 5, pillarPrimary: P });
    const { core } = partitionEpisodes([a, b], P);
    expect(core.map((e) => e.data.slug)).toEqual(['b', 'a']);
  });

  it('sorts core by publishDate (newest first) when dates differ, ignoring episode number', () => {
    const older = ep({ slug: 'old', episode: 99, pillarPrimary: P, publishDate: new Date('2023-01-01') });
    const newer = ep({ slug: 'new', episode: 1, pillarPrimary: P, publishDate: new Date('2024-01-01') });
    const { core } = partitionEpisodes([older, newer], P);
    expect(core.map((e) => e.data.slug)).toEqual(['new', 'old']);
  });
});
