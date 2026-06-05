import { describe, it, expect } from 'vitest';
import { slugifyGuest, headshotFor, collageFor } from './headshots';
import type { EpisodeLike } from './pillars';

const FILES = ['norman-farb.jpg', 'david-rosmarin.png', 'greg.png'];

const ep = (guest: string, slug = 's'): EpisodeLike => ({
  data: {
    slug,
    episode: 1,
    guest,
    title: 'T',
    status: 'interview',
    pillarPrimary: 'Beat Imposter Syndrome',
  },
});

describe('slugifyGuest', () => {
  it('lowercases and hyphenates a plain name', () => {
    expect(slugifyGuest('Norman Farb')).toBe('norman-farb');
  });

  it('strips a parenthetical descriptor', () => {
    expect(slugifyGuest('Claire Alvis (founder of Silent Partner)')).toBe('claire-alvis');
  });

  it('drops commas, titles, and other punctuation', () => {
    expect(slugifyGuest('David Rosmarin, PhD')).toBe('david-rosmarin');
  });
});

describe('headshotFor', () => {
  it('returns the public path when a matching file exists', () => {
    expect(headshotFor('Norman Farb', FILES)).toBe('/headshots/norman-farb.jpg');
  });

  it('matches regardless of extension', () => {
    expect(headshotFor('David Rosmarin, PhD', FILES)).toBe('/headshots/david-rosmarin.png');
  });

  it('returns null when no headshot exists', () => {
    expect(headshotFor('Claire Alvis (founder)', FILES)).toBeNull();
  });
});

describe('collageFor', () => {
  it('includes only guests with a headshot, deduped by url', () => {
    const eps = [
      ep('Norman Farb', 'a'),
      ep('Norman Farb', 'b'), // same guest twice -> one face
      ep('Claire Alvis', 'c'), // no headshot -> excluded
      ep('David Rosmarin, PhD', 'd'),
    ];
    const faces = collageFor(eps, FILES);
    expect(faces).toEqual([
      { name: 'Norman Farb', url: '/headshots/norman-farb.jpg' },
      { name: 'David Rosmarin, PhD', url: '/headshots/david-rosmarin.png' },
    ]);
  });

  it('caps the number of faces', () => {
    const eps = Array.from({ length: 10 }, (_, i) => ep('Norman Farb', String(i)));
    // all same guest -> dedupe to 1 anyway; use distinct files for cap test
    const manyFiles = Array.from({ length: 10 }, (_, i) => `g${i}.jpg`);
    const manyEps = Array.from({ length: 10 }, (_, i) => ep(`G${i}`, String(i)));
    expect(collageFor(manyEps, manyFiles, 8)).toHaveLength(8);
    expect(collageFor(eps, FILES, 8)).toHaveLength(1);
  });
});
