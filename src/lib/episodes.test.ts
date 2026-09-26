import { describe, it, expect } from 'vitest';
import { recentEpisodes, interviewCount, cardImage, listenLinks, guestName, SHOW_COVER } from './episodes';
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

describe('interviewCount', () => {
  it('counts interviews and ignores minisodes', () => {
    const eps = [
      ep({ status: 'interview' }),
      ep({ status: 'minisode' }),
      ep({ status: 'interview' }),
    ];
    expect(interviewCount(eps)).toBe(2);
  });
});

describe('cardImage', () => {
  it('prefers the guest headshot', () => {
    const e = ep({ guest: 'Claire Alvis', thumbnail: '/episode-covers/x.png' });
    expect(cardImage(e, ['claire-alvis.jpg'])).toBe('/headshots/claire-alvis.jpg');
  });

  it('falls back to the episode thumbnail', () => {
    const e = ep({ guest: 'No Photo', thumbnail: '/episode-covers/x.png' });
    expect(cardImage(e, ['someone-else.jpg'])).toBe('/episode-covers/x.png');
  });

  it('falls back to the show cover when there is neither', () => {
    const e = ep({ guest: 'No Photo' });
    expect(cardImage(e, [])).toBe(SHOW_COVER);
    expect(SHOW_COVER).toBe('/show-cover.jpg');
  });
});

describe('listenLinks', () => {
  const fallback = { apple: 'https://apple/show', spotify: 'https://spotify/show' };

  it('uses the episode URLs when present', () => {
    const e = ep({ urls: { apple: 'https://apple/ep', spotify: 'https://spotify/ep' } });
    expect(listenLinks(e, fallback)).toEqual({ apple: 'https://apple/ep', spotify: 'https://spotify/ep' });
  });

  it('falls back per platform when an episode URL is missing', () => {
    const e = ep({ urls: { apple: 'https://apple/ep' } });
    expect(listenLinks(e, fallback)).toEqual({ apple: 'https://apple/ep', spotify: 'https://spotify/show' });
  });

  it('falls back entirely when urls is absent', () => {
    expect(listenLinks(ep({}), fallback)).toEqual(fallback);
  });
});

describe('guestName', () => {
  it('drops a parenthetical descriptor', () => {
    expect(guestName('Claire Alvis (founder of X)')).toBe('Claire Alvis');
  });

  it('keeps credentials and plain names intact', () => {
    expect(guestName('David Rosmarin, PhD')).toBe('David Rosmarin, PhD');
    expect(guestName('Bushra Khan')).toBe('Bushra Khan');
  });
});
