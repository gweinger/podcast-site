import { headshotFor } from './headshots';
import { byNewest, type EpisodeLike } from './pillars';

// Last-resort card image when a guest has no headshot and the episode no thumbnail.
export const SHOW_COVER = '/show-cover.jpg';

// The n newest interview episodes (minisodes excluded), newest first.
// Reuses the same ordering as the podcast index and topic hubs.
export function recentEpisodes(episodes: EpisodeLike[], n: number): EpisodeLike[] {
  return episodes
    .filter((e) => e.data.status === 'interview')
    .sort(byNewest)
    .slice(0, n);
}

// Latest episode number, for the homepage "N+ conversations" line. Uses the
// highest episode number rather than a file count, so solo episodes missing from
// the site don't hold it back. It rises each time a new episode is published.
export function latestEpisodeNumber(episodes: EpisodeLike[]): number {
  return episodes.reduce((max, e) => Math.max(max, e.data.episode ?? 0), 0);
}

// Guest headshot, else episode thumbnail, else the show cover.
export function cardImage(e: EpisodeLike, headshotFiles: string[]): string {
  return headshotFor(e.data.guest, headshotFiles) ?? e.data.thumbnail ?? SHOW_COVER;
}

// Episode-level Apple/Spotify links, falling back per platform to show-level links.
export function listenLinks(
  e: EpisodeLike,
  fallback: { apple: string; spotify: string },
): { apple: string; spotify: string } {
  return {
    apple: e.data.urls?.apple ?? fallback.apple,
    spotify: e.data.urls?.spotify ?? fallback.spotify,
  };
}

// "Claire Alvis (founder of X)" -> "Claire Alvis" for card display.
export function guestName(name: string): string {
  return name.split('(')[0].trim();
}
