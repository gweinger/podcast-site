import { describe, it, expect } from 'vitest';
import { matchesQuery, visibleCount } from './search';

describe('matchesQuery', () => {
  const hay = '#84 rewire public speaking anxiety tamara laine communicate like a leader';

  it('matches everything when the query is empty or whitespace', () => {
    expect(matchesQuery(hay, '')).toBe(true);
    expect(matchesQuery(hay, '   ')).toBe(true);
  });

  it('matches case-insensitively and ignores surrounding space', () => {
    expect(matchesQuery(hay, '  Tamara ')).toBe(true);
    expect(matchesQuery(hay, '#84')).toBe(true);
  });

  it('rejects text that is not present', () => {
    expect(matchesQuery(hay, 'rosmarin')).toBe(false);
  });
});

describe('visibleCount', () => {
  it('counts the items that match, so the page can show "no matches" at 0', () => {
    const items = ['alpha guest', 'beta guest', 'gamma'];
    expect(visibleCount(items, 'guest')).toBe(2);
    expect(visibleCount(items, 'zzz')).toBe(0);
    expect(visibleCount(items, '')).toBe(3);
  });
});
