import type { EpisodeLike } from './pillars';

// "Claire Alvis (founder of X)" -> "claire-alvis"
// "David Rosmarin, PhD"          -> "david-rosmarin"
export function slugifyGuest(name: string): string {
  return name
    .split('(')[0] // drop any parenthetical descriptor
    .split(',')[0] // drop credential suffixes like ", PhD"
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alphanumeric runs -> hyphen
    .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens
}

// Returns "/headshots/<file>" if a file in `files` matches the guest slug
// (ignoring extension), else null. `files` is a directory listing.
export function headshotFor(name: string, files: string[]): string | null {
  const slug = slugifyGuest(name);
  const match = files.find((f) => f.replace(/\.[^.]+$/, '') === slug);
  return match ? `/headshots/${match}` : null;
}

export interface CollageFace {
  name: string;
  url: string;
}

// Deduped list (by url) of guests with a headshot, capped at `limit`.
export function collageFor(
  episodes: EpisodeLike[],
  files: string[],
  limit = 8,
): CollageFace[] {
  const seen = new Set<string>();
  const faces: CollageFace[] = [];
  for (const e of episodes) {
    const url = headshotFor(e.data.guest, files);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    faces.push({ name: e.data.guest, url });
    if (faces.length >= limit) break;
  }
  return faces;
}
