export const SPECIALTIES = [
  'coach',
  'therapist',
  'consultant',
  'author',
  'speaker',
  'tool',
  'professor',
] as const;

export type Specialty = (typeof SPECIALTIES)[number];

export interface ProfessionalLike {
  data: {
    name: string;
    slug: string;
    featured: boolean;
  };
}

// Featured professionals first (alphabetical within), then non-featured (alphabetical).
// The DOM order at build time means client-side show/hide preserves featured-first within
// any specialty filter without client-side re-sorting.
export function sortProfessionals<T extends ProfessionalLike>(professionals: T[]): T[] {
  const byName = (a: T, b: T) => a.data.name.localeCompare(b.data.name);
  const featured = professionals.filter(p => p.data.featured).sort(byName);
  const rest = professionals.filter(p => !p.data.featured).sort(byName);
  return [...featured, ...rest];
}
