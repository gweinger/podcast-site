// Greg's canonical Person entity. Reuse this @id on every page so machines
// resolve one identity across the site.
export const PERSON_ID = 'https://gweinger.com/#greg';

export const PERSON = {
  '@type': 'Person',
  '@id': PERSON_ID,
  name: 'Greg Weinger',
  url: 'https://gweinger.com/',
  jobTitle: 'Podcast Host & Leadership Advisor',
  sameAs: [
    'https://www.linkedin.com/in/gregweinger/',
    'https://www.powerfulintrovertpodcast.com/',
    'https://podcasts.apple.com/us/podcast/id1794604735',
    'https://open.spotify.com/show/0000000000',
    'https://www.youtube.com/@theintrovertedleader',
  ],
};

export const SERIES = {
  '@type': 'PodcastSeries',
  '@id': 'https://gweinger.com/podcast/introverted-leader/#series',
  name: 'The Introverted Leader',
  url: 'https://gweinger.com/podcast/introverted-leader/',
};
