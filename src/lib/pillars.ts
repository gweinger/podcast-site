export const PILLARS = [
  'Beat Imposter Syndrome',
  'Speak Up in Meetings with Quiet Authority',
  'Increase Visibility & Influence Authentically',
  'Communicate Like a Leader',
  'Manage Your Energy & Thrive in Extroverted Cultures',
  'Get Promoted Without Becoming Someone Else',
] as const;

export type Pillar = (typeof PILLARS)[number];

// Canonical pillar <-> URL slug map. Slugs are SEO-chosen, not derived.
const PILLAR_TO_SLUG: Record<Pillar, string> = {
  'Beat Imposter Syndrome': 'imposter-syndrome',
  'Speak Up in Meetings with Quiet Authority': 'speaking-up-in-meetings',
  'Increase Visibility & Influence Authentically': 'visibility-and-influence',
  'Communicate Like a Leader': 'executive-presence',
  'Manage Your Energy & Thrive in Extroverted Cultures': 'energy-management',
  'Get Promoted Without Becoming Someone Else': 'get-promoted',
};

const SLUG_TO_PILLAR: Record<string, Pillar> = Object.fromEntries(
  Object.entries(PILLAR_TO_SLUG).map(([p, s]) => [s, p as Pillar]),
) as Record<string, Pillar>;

export function topicSlugForPillar(pillar: Pillar): string {
  return PILLAR_TO_SLUG[pillar];
}

export function pillarForSlug(slug: string): Pillar | undefined {
  return SLUG_TO_PILLAR[slug];
}

// Minimal shape this module needs from an episode collection entry.
export interface EpisodeLike {
  data: {
    slug: string;
    episode: number;
    guest: string;
    title: string;
    status: 'interview' | 'minisode';
    pillarPrimary: Pillar;
    pillarSecondary?: Pillar;
    thumbnail?: string;
    publishDate?: Date;
  };
}

// Newest first: by publishDate desc, tie-break by episode number desc.
// Mirrors the sort used on the podcast index page.
function byNewest(a: EpisodeLike, b: EpisodeLike): number {
  const da = a.data.publishDate ? a.data.publishDate.getTime() : 0;
  const db = b.data.publishDate ? b.data.publishDate.getTime() : 0;
  if (da !== db) return db - da;
  return b.data.episode - a.data.episode;
}

export function partitionEpisodes(episodes: EpisodeLike[], pillar: Pillar) {
  const core: EpisodeLike[] = [];
  const secondary: EpisodeLike[] = [];
  const minisodes: EpisodeLike[] = [];

  for (const e of episodes) {
    const { status, pillarPrimary, pillarSecondary } = e.data;
    const touches = pillarPrimary === pillar || pillarSecondary === pillar;
    if (!touches) continue;

    if (status === 'minisode') {
      minisodes.push(e);
    } else if (pillarPrimary === pillar) {
      core.push(e);
    } else if (pillarSecondary === pillar) {
      secondary.push(e);
    }
  }

  core.sort(byNewest);
  secondary.sort(byNewest);
  minisodes.sort(byNewest);
  return { core, secondary, minisodes };
}
