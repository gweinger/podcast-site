import { describe, it, expect } from 'vitest';
import { NAV, isCurrent } from './nav';

describe('NAV', () => {
  it('lists the four main sections in order', () => {
    expect(NAV.map((n) => n.label)).toEqual(['Podcast', 'Topics', 'About', 'Contact']);
  });
});

describe('isCurrent', () => {
  it('matches the section root with or without trailing slash', () => {
    expect(isCurrent('/about', '/about')).toBe(true);
    expect(isCurrent('/about/', '/about')).toBe(true);
    expect(isCurrent('/contact', '/contact/')).toBe(true);
  });

  it('matches nested pages to their section', () => {
    expect(isCurrent('/podcast/introverted-leader/some-episode/', '/podcast/introverted-leader/')).toBe(true);
    expect(isCurrent('/topics/imposter-syndrome/', '/topics/')).toBe(true);
  });

  it('does not match the homepage or a sibling with a shared prefix', () => {
    expect(isCurrent('/', '/about')).toBe(false);
    expect(isCurrent('/about-us/', '/about')).toBe(false);
  });
});
