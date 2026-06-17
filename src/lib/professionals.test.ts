import { describe, it, expect } from 'vitest';
import { sortProfessionals } from './professionals';
import type { ProfessionalLike } from './professionals';

const pro = (over: Partial<ProfessionalLike['data']>): ProfessionalLike => ({
  data: { name: 'A', slug: 'a', featured: false, ...over },
});

describe('sortProfessionals', () => {
  it('puts featured professionals before non-featured', () => {
    const input = [
      pro({ name: 'Charlie', slug: 'charlie', featured: false }),
      pro({ name: 'Alice', slug: 'alice', featured: true }),
    ];
    expect(sortProfessionals(input).map(p => p.data.slug)).toEqual(['alice', 'charlie']);
  });

  it('sorts featured alphabetically by name', () => {
    const input = [
      pro({ name: 'Zara', slug: 'zara', featured: true }),
      pro({ name: 'Alice', slug: 'alice', featured: true }),
    ];
    expect(sortProfessionals(input).map(p => p.data.slug)).toEqual(['alice', 'zara']);
  });

  it('sorts non-featured alphabetically by name', () => {
    const input = [
      pro({ name: 'Zara', slug: 'zara', featured: false }),
      pro({ name: 'Alice', slug: 'alice', featured: false }),
    ];
    expect(sortProfessionals(input).map(p => p.data.slug)).toEqual(['alice', 'zara']);
  });

  it('returns empty array unchanged', () => {
    expect(sortProfessionals([])).toEqual([]);
  });

  it('preserves featured-first when multiple featured exist across specialties', () => {
    const input = [
      pro({ name: 'Bob', slug: 'bob', featured: false }),
      pro({ name: 'Zoe', slug: 'zoe', featured: true }),
      pro({ name: 'Amy', slug: 'amy', featured: true }),
    ];
    expect(sortProfessionals(input).map(p => p.data.slug)).toEqual(['amy', 'zoe', 'bob']);
  });
});
