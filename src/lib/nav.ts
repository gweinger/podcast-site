// Main site navigation — shared by the header pill bar and the footer.
export const NAV = [
  { label: 'Podcast', href: '/podcast/introverted-leader/' },
  { label: 'Topics', href: '/topics/' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact/' },
] as const;

const withSlash = (p: string) => (p.endsWith('/') ? p : `${p}/`);

// True when `pathname` is the nav item's page or nested under it.
export function isCurrent(pathname: string, href: string): boolean {
  return withSlash(pathname).startsWith(withSlash(href));
}
