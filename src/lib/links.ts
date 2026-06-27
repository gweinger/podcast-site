// Single source of truth for off-site URLs (nav, footer, hero, newsletter).
// newsletter and substack are the same destination today; both names kept for
// call-site clarity. If a distinct Substack subscribe URL emerges, change it here only.
export const LINKS = {
  newsletter: 'https://www.powerfulintrovertpodcast.com/',
  substack: 'https://www.powerfulintrovertpodcast.com/',
  apple: 'https://podcasts.apple.com/us/podcast/id1794604735',
  spotify: 'https://open.spotify.com/show/5Sv8RRa1sn6uMVM0yiPIM1',
  youtube: 'https://www.youtube.com/@powerfulintrovert',
  linkedin: 'https://www.linkedin.com/in/gregoryweinger/',
} as const;
