import { byNewest, type EpisodeLike } from './pillars';

// The n newest interview episodes (minisodes excluded), newest first.
// Reuses the same ordering as the podcast index and topic hubs.
export function recentEpisodes(episodes: EpisodeLike[], n: number): EpisodeLike[] {
  return episodes
    .filter((e) => e.data.status === 'interview')
    .sort(byNewest)
    .slice(0, n);
}
