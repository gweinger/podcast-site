// Episode search on the podcast index. `haystack` is the lowercased
// data-search text each card carries; an empty query matches everything.
export function matchesQuery(haystack: string, query: string): boolean {
  const q = query.trim().toLowerCase();
  return !q || haystack.includes(q);
}

// How many items a query leaves visible (0 → show the "no matches" note).
export function visibleCount(haystacks: string[], query: string): number {
  return haystacks.filter((h) => matchesQuery(h, query)).length;
}
