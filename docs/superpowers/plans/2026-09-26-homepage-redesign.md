# Homepage & Navigation Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-lay out gweinger.com's homepage and site header/footer in the amplifyme.agency style (full-bleed dark/light bands, pill nav, dark hero with cut-out portrait) using Greg's existing palette.

**Architecture:** Tokens and shared chrome (header, footer, buttons) live in `src/styles/global.css`; homepage-only band styles go in a new `src/styles/home.css` imported only by `src/pages/index.astro`. The small amount of logic (nav current-page matching, card image fallback, listen links, guest display name, interview count) goes in `src/lib/` as pure functions with vitest coverage. Static Astro output, no new JS, no new dependencies.

**Tech Stack:** Astro 6 (static), TypeScript, vitest, plain CSS custom properties, `cwebp` (Homebrew) for the one image conversion.

**Spec:** `docs/specs/2026-09-26-homepage-redesign-design.md`

**Working directory for every task:** `/Users/gregoryweinger/code/podcast-site-redesign` (git worktree on branch `feat/homepage-redesign`). Never switch branches in `/Users/gregoryweinger/code/podcast-site` — the `podcast` CLI commits and pushes whatever is checked out there.

## Global Constraints

- Palette primitives unchanged: `--brand-blue #1c4ff9`, `--brand-blue-light #00a5ff`, `--brand-gold #ffc500`, `--brand-navy #0D2747`.
- Yellow is never used as text on white/light backgrounds; blue (`--color-highlight-light`) takes that role. Yellow buttons always carry navy text.
- Display font stays Jost; body stays `system-ui`. Eyebrows: Jost, uppercase, `letter-spacing: 0.12em`, `var(--text-sm)`, weight 600.
- Homepage band content width `--maxw-wide: 1120px`; reading pages keep `--maxw: 720px`.
- Hero H1 copy: "Embrace your **quiet strengths**." (highlighted phrase in yellow).
- Hero subtext: "I help introverted leaders get promoted and start earning what they deserve — without becoming someone else."
- No route, content-collection, schema-component, redirect, sitemap, contact-Worker, or analytics changes.
- No new JavaScript, no new npm dependencies.
- Nothing is pushed or merged to `main` until Greg has reviewed the running redesign (Task 8).

## Review Focus

1. A featured guest with no headshot file and no `thumbnail` — the card must show the show cover, never a broken image. (Task 1 test `cardImage` → `/show-cover.jpg`.)
2. Guest names with a parenthetical or credential (e.g. "Claire Alvis (founder of X)") — the photo card should read "Claire Alvis", not the full string. (Task 1 test `guestName`.)
3. Latest episode missing its own Apple/Spotify URL — the listen bar must fall back to the show-level links, not render `href="undefined"`. (Task 1 test `listenLinks`.)
4. Trailing-slash and nested paths — `/about/`, `/podcast/introverted-leader/some-episode/` must highlight the right nav pill, and `/` must highlight none. (Task 1 test `isCurrent`.)
5. A 360px-wide phone — header, hero, cards, and listen bar must not cause horizontal page scroll; `minimalHeader` pages (masterclass funnel) must show only the wordmark. (Task 7 browser check at 360px + `/masterclass`.)

---

### Task 1: Install deps and add tested helpers

**Files:**
- Create: `src/lib/nav.ts`
- Create: `src/lib/nav.test.ts`
- Modify: `src/lib/pillars.ts` (add optional `urls` to `EpisodeLike`)
- Modify: `src/lib/episodes.ts`
- Modify: `src/lib/episodes.test.ts`

**Interfaces:**
- Consumes: `headshotFor(name, files)` from `src/lib/headshots.ts`; `EpisodeLike` from `src/lib/pillars.ts`.
- Produces:
  - `NAV: readonly { label: string; href: string }[]` and `isCurrent(pathname: string, href: string): boolean` from `src/lib/nav.ts`
  - `SHOW_COVER = '/show-cover.jpg'`
  - `interviewCount(episodes: EpisodeLike[]): number`
  - `cardImage(e: EpisodeLike, headshotFiles: string[]): string`
  - `listenLinks(e: EpisodeLike, fallback: { apple: string; spotify: string }): { apple: string; spotify: string }`
  - `guestName(name: string): string`
  (all from `src/lib/episodes.ts`)

- [ ] **Step 1: Install dependencies in the worktree**

Run: `npm ci`
Expected: completes; `node_modules/.bin/astro` exists.

- [ ] **Step 2: Run the existing suite as a baseline**

Run: `npm test`
Expected: all existing tests PASS.

- [ ] **Step 3: Write the failing nav test**

Create `src/lib/nav.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { NAV, isCurrent } from './nav';

describe('NAV', () => {
  it('lists the four main sections in order', () => {
    expect(NAV.map((n) => n.label)).toEqual(['Podcast', 'Topics', 'About', 'Contact']);
  });
});

describe('isCurrent', () => {
  it('matches the section root with or without trailing slash', () => {
    expect(isCurrent('/about', '/about')).toBe(true);
    expect(isCurrent('/about/', '/about')).toBe(true);
    expect(isCurrent('/contact', '/contact/')).toBe(true);
  });

  it('matches nested pages to their section', () => {
    expect(isCurrent('/podcast/introverted-leader/some-episode/', '/podcast/introverted-leader/')).toBe(true);
    expect(isCurrent('/topics/imposter-syndrome/', '/topics/')).toBe(true);
  });

  it('does not match the homepage or a sibling with a shared prefix', () => {
    expect(isCurrent('/', '/about')).toBe(false);
    expect(isCurrent('/about-us/', '/about')).toBe(false);
  });
});
```

- [ ] **Step 4: Run it to verify it fails**

Run: `npx vitest run src/lib/nav.test.ts`
Expected: FAIL — cannot resolve `./nav`.

- [ ] **Step 5: Implement `src/lib/nav.ts`**

```ts
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
```

- [ ] **Step 6: Run nav tests to verify they pass**

Run: `npx vitest run src/lib/nav.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 7: Add `urls` to `EpisodeLike`**

In `src/lib/pillars.ts`, inside `interface EpisodeLike { data: { ... } }`, add after `publishDate?: Date;`:

```ts
    urls?: { apple?: string; spotify?: string };
```

- [ ] **Step 8: Write the failing episode-helper tests**

Append to `src/lib/episodes.test.ts` (the file already defines the `ep()` factory at the top; add the new names to the existing import from `./episodes`, so it reads `import { recentEpisodes, interviewCount, cardImage, listenLinks, guestName, SHOW_COVER } from './episodes';`):

```ts
describe('interviewCount', () => {
  it('counts interviews and ignores minisodes', () => {
    const eps = [
      ep({ status: 'interview' }),
      ep({ status: 'minisode' }),
      ep({ status: 'interview' }),
    ];
    expect(interviewCount(eps)).toBe(2);
  });
});

describe('cardImage', () => {
  it('prefers the guest headshot', () => {
    const e = ep({ guest: 'Claire Alvis', thumbnail: '/episode-covers/x.png' });
    expect(cardImage(e, ['claire-alvis.jpg'])).toBe('/headshots/claire-alvis.jpg');
  });

  it('falls back to the episode thumbnail', () => {
    const e = ep({ guest: 'No Photo', thumbnail: '/episode-covers/x.png' });
    expect(cardImage(e, ['someone-else.jpg'])).toBe('/episode-covers/x.png');
  });

  it('falls back to the show cover when there is neither', () => {
    const e = ep({ guest: 'No Photo' });
    expect(cardImage(e, [])).toBe(SHOW_COVER);
    expect(SHOW_COVER).toBe('/show-cover.jpg');
  });
});

describe('listenLinks', () => {
  const fallback = { apple: 'https://apple/show', spotify: 'https://spotify/show' };

  it('uses the episode URLs when present', () => {
    const e = ep({ urls: { apple: 'https://apple/ep', spotify: 'https://spotify/ep' } });
    expect(listenLinks(e, fallback)).toEqual({ apple: 'https://apple/ep', spotify: 'https://spotify/ep' });
  });

  it('falls back per platform when an episode URL is missing', () => {
    const e = ep({ urls: { apple: 'https://apple/ep' } });
    expect(listenLinks(e, fallback)).toEqual({ apple: 'https://apple/ep', spotify: 'https://spotify/show' });
  });

  it('falls back entirely when urls is absent', () => {
    expect(listenLinks(ep({}), fallback)).toEqual(fallback);
  });
});

describe('guestName', () => {
  it('drops a parenthetical descriptor', () => {
    expect(guestName('Claire Alvis (founder of X)')).toBe('Claire Alvis');
  });

  it('keeps credentials and plain names intact', () => {
    expect(guestName('David Rosmarin, PhD')).toBe('David Rosmarin, PhD');
    expect(guestName('Bushra Khan')).toBe('Bushra Khan');
  });
});
```

- [ ] **Step 9: Run them to verify they fail**

Run: `npx vitest run src/lib/episodes.test.ts`
Expected: FAIL — `interviewCount` (etc.) is not exported.

- [ ] **Step 10: Implement the helpers**

Replace `src/lib/episodes.ts` with:

```ts
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

// Number of interview episodes (the homepage "N conversations" line).
export function interviewCount(episodes: EpisodeLike[]): number {
  return episodes.filter((e) => e.data.status === 'interview').length;
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
```

- [ ] **Step 11: Run the full suite**

Run: `npm test`
Expected: all tests PASS, including the new `nav` and `episodes` cases.

- [ ] **Step 12: Commit**

```bash
git add src/lib/nav.ts src/lib/nav.test.ts src/lib/pillars.ts src/lib/episodes.ts src/lib/episodes.test.ts
git commit -m "feat: nav and homepage card helpers for redesign"
```

---

### Task 2: Design tokens, buttons, and eyebrow utility

**Files:**
- Modify: `src/styles/global.css` (`:root` block, Buttons section)
- Modify: `src/layouts/Base.astro:13` (Google Fonts weights)

**Interfaces:**
- Produces CSS custom properties: `--color-band-dark`, `--color-band-light`, `--color-on-dark`, `--color-on-dark-muted`, `--color-highlight-dark`, `--color-highlight-light`, `--maxw-wide`. Produces classes `.btn-outline-light`, `.eyebrow`, `.hl`.

- [ ] **Step 1: Add tokens**

In `src/styles/global.css`, inside `:root`, after the `--color-surface` line add:

```css
  /* Band colors (homepage + site chrome) */
  --color-band-dark:        var(--brand-navy);
  --color-band-light:       #EEF3F9;
  --color-on-dark:          #FFFFFF;
  --color-on-dark-muted:    rgba(255, 255, 255, 0.75);
  /* Highlighted phrase + eyebrow color: yellow on dark, blue on light (contrast) */
  --color-highlight-dark:   var(--brand-gold);
  --color-highlight-light:  var(--brand-blue);
```

and after `--maxw: 720px;` add:

```css
  --maxw-wide: 1120px;
```

- [ ] **Step 2: Add the outline-light button**

In the Buttons section, change the shared selector line
`.btn-primary, .btn-secondary, .btn-gold {` to
`.btn-primary, .btn-secondary, .btn-gold, .btn-outline-light {`
and append after the `.btn-gold:hover` rule:

```css
.btn-outline-light {
  border: 1.5px solid rgba(255, 255, 255, 0.5);
  color: var(--color-on-dark);
}
.btn-outline-light:hover { border-color: var(--color-on-dark); color: var(--color-on-dark); }
```

- [ ] **Step 3: Add eyebrow + highlight utilities**

Append a new section to the end of `global.css`:

```css
/* ============================================================
   Eyebrow labels + highlighted phrases (light default, dark override)
   ============================================================ */
.eyebrow {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--color-highlight-light);
  margin: 0 0 var(--space-3);
}
.hl { color: var(--color-highlight-light); }
.on-dark .eyebrow, .on-dark .hl { color: var(--color-highlight-dark); }
```

- [ ] **Step 4: Load Jost 500**

In `src/layouts/Base.astro`, change `family=Jost:wght@600;700` to `family=Jost:wght@500;600;700`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds. No visible change yet — the new tokens and classes are unused until Task 3.

- [ ] **Step 6: Commit**

```bash
git add src/styles/global.css src/layouts/Base.astro
git commit -m "feat: band color tokens, outline-light button, eyebrow utility"
```

---

### Task 3: Header and footer

**Files:**
- Modify: `src/layouts/Base.astro` (body markup)
- Modify: `src/components/Footer.astro`
- Modify: `src/styles/global.css` (replace Announcement bar, Header & nav, Footer sections)

**Interfaces:**
- Consumes: `NAV`, `isCurrent` from `src/lib/nav.ts` (Task 1); `.btn-gold`, tokens (Task 2).
- Produces: `.site-header`, `.header-inner`, `.nav-pill`, `.header-cta`, `.site-footer`, `.footer-inner`. The homepage wrapper class `.home` (Task 4) is referenced here by `main:has(.home) + .site-footer`.

- [ ] **Step 1: Replace the header markup**

In `src/layouts/Base.astro` frontmatter add `import { NAV, isCurrent } from '../lib/nav';` and `const path = Astro.url.pathname;`. Replace everything from `{!minimalHeader && (` (the announcement bar) through the closing `</header>` with:

```astro
    <header class="site-header">
      <div class="header-inner">
        <a class="brand" href="/">Greg Weinger</a>
        {!minimalHeader && (
          <>
            <nav class="nav-pill" aria-label="Main">
              {NAV.map((n) => (
                <a href={n.href} aria-current={isCurrent(path, n.href) ? 'page' : undefined}>{n.label}</a>
              ))}
            </nav>
            <a class="btn-gold header-cta" href="/masterclass">Free Masterclass</a>
          </>
        )}
      </div>
    </header>
```

- [ ] **Step 2: Replace the header CSS**

In `global.css`, delete the whole "Announcement bar" section and the whole "Header & nav" section, and put this in their place:

```css
/* ============================================================
   Header — navy on every page: wordmark · pill nav · CTA
   ============================================================ */
.site-header { background: var(--color-band-dark); }
.header-inner {
  max-width: var(--maxw-wide);
  margin: 0 auto;
  padding: var(--space-4) var(--space-6);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
}
.brand {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: var(--text-lg);
  text-decoration: none;
  color: var(--color-on-dark);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.brand:hover {
  color: var(--color-on-dark);
  text-decoration: underline;
  text-decoration-color: var(--brand-gold);
  text-decoration-thickness: 3px;
  text-underline-offset: 4px;
}
.nav-pill {
  display: flex;
  gap: var(--space-1);
  padding: var(--space-1);
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: var(--radius-full);
}
.nav-pill a {
  color: var(--color-on-dark-muted);
  text-decoration: none;
  font-size: var(--text-sm);
  font-weight: 600;
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  transition: background 0.15s, color 0.15s;
}
.nav-pill a:hover,
.nav-pill a[aria-current='page'] { background: rgba(255, 255, 255, 0.12); color: var(--color-on-dark); }
@media (max-width: 720px) {
  .header-inner { padding: var(--space-3) var(--space-4); }
  .nav-pill { order: 3; width: 100%; justify-content: space-around; }
  .nav-pill a { padding: var(--space-2) var(--space-3); font-size: 0.8125rem; }
}
```

- [ ] **Step 3: Replace the footer markup**

Replace `src/components/Footer.astro` with:

```astro
---
import { LINKS } from '../lib/links';
import { NAV } from '../lib/nav';
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="footer-inner">
    <a class="brand" href="/">Greg Weinger</a>
    <nav class="footer-nav" aria-label="Footer">
      {NAV.map((n) => <a href={n.href}>{n.label}</a>)}
    </nav>
    <nav class="footer-social" aria-label="Social">
      <a href={LINKS.linkedin}>LinkedIn</a>
      <a href={LINKS.substack}>Substack</a>
      <a href={LINKS.apple}>Apple</a>
      <a href={LINKS.spotify}>Spotify</a>
      <a href={LINKS.youtube}>YouTube</a>
    </nav>
    <nav class="footer-legal" aria-label="Legal">
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
    </nav>
    <span class="footer-copy">© {year} Greg Weinger · <span style="font-size:.8rem">Some links may be affiliate links.</span></span>
  </div>
</footer>
```

- [ ] **Step 4: Replace the footer CSS**

Replace the whole "Footer" section in `global.css` with:

```css
/* ============================================================
   Footer — slim navy band
   ============================================================ */
.site-footer {
  background: var(--color-band-dark);
  color: var(--color-on-dark-muted);
  margin-top: var(--space-12);
}
/* Homepage ends on a dark band: no gap, hairline divider instead. */
main:has(.home) + .site-footer { margin-top: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); }
.footer-inner {
  max-width: var(--maxw-wide);
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4) var(--space-8);
  align-items: center;
  justify-content: space-between;
}
.site-footer .brand { font-size: var(--text-base); }
.footer-nav, .footer-social, .footer-legal { display: flex; flex-wrap: wrap; gap: var(--space-4); }
.footer-nav a, .footer-social a, .footer-legal a {
  color: var(--color-on-dark-muted);
  font-size: var(--text-sm);
  text-decoration: none;
}
.footer-nav a:hover, .footer-social a:hover, .footer-legal a:hover { color: var(--color-on-dark); }
.footer-copy { font-size: var(--text-sm); color: var(--color-on-dark-muted); width: 100%; }
@media (max-width: 720px) {
  .footer-inner { flex-direction: column; align-items: flex-start; }
}
```

- [ ] **Step 5: Verify**

Run: `npm run build && npx astro check`
Expected: build succeeds; `astro check` reports 0 errors.

Run: `grep -c 'announcement-bar' dist/index.html dist/about/index.html`
Expected: `0` for both.

Run: `grep -o 'aria-current="page"[^>]*>[A-Za-z]*' dist/about/index.html`
Expected: one match ending in `About`.

- [ ] **Step 6: Commit**

```bash
git add src/layouts/Base.astro src/components/Footer.astro src/styles/global.css
git commit -m "feat: navy header with pill nav and masterclass CTA; slim navy footer"
```

---

### Task 4: Hero portrait asset, homepage band scaffold, and hero

**Files:**
- Create: `public/headshot-cutout.webp`
- Create: `src/styles/home.css`
- Modify: `src/pages/index.astro` (full rewrite of the body; sections 2–6 added in Tasks 5–6)

**Interfaces:**
- Consumes: `recentEpisodes`, `interviewCount` (Task 1); `collageFor` from `src/lib/headshots.ts` (existing: `collageFor(episodes, files, limit): { name, url }[]`); `.eyebrow`, `.hl`, `.on-dark`, `.btn-gold`, `.btn-outline-light` (Task 2).
- Produces: `.home`, `.hero-figure`, `.band`, `.band--dark|--light|--white`, `.band-inner`, `.band-head`, `.band-head-split`, `.band-title`, `.band-link`, `.hero-actions` for Tasks 5–6. Frontmatter variables `allEpisodes`, `headshotFiles`, `count`, `epHref` used by Tasks 5–6.

- [ ] **Step 1: Convert the cut-out portrait**

Run:
```bash
cwebp -q 82 -alpha_q 90 -resize 900 900 \
  "/Users/gregoryweinger/code/podcast-studio/headshot-transparent.PNG" \
  -o public/headshot-cutout.webp
ls -la public/headshot-cutout.webp
```
Expected: file exists, under ~150 KB. (Source is 4000×3999, so 900×900 keeps the aspect.)

- [ ] **Step 2: Create `src/styles/home.css` with the band scaffold and hero**

```css
/* ============================================================
   Homepage bands — full-bleed sections, content at --maxw-wide
   ============================================================ */
.band { padding: clamp(3.5rem, 8vw, 6rem) 0; }
.band--dark { background: var(--color-band-dark); color: var(--color-on-dark-muted); }
.band--light { background: var(--color-band-light); }
.band--white { background: var(--color-bg); }
.band--dark h1, .band--dark h2, .band--dark h3 { color: var(--color-on-dark); }
.band-inner { max-width: var(--maxw-wide); margin: 0 auto; padding: 0 var(--space-6); }
.band-head { text-align: center; }
.band-title {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  line-height: 1.15;
  margin: 0 0 var(--space-8);
}
.band-head-split {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}
.band-head-split .band-title { margin: 0; }
.band-link { font-weight: 600; text-decoration: none; }

/* ---------- Hero ---------- */
.hero-band { overflow: hidden; padding-bottom: 0; }
.hero-grid {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: end;
  gap: var(--space-8);
}
.hero-copy { align-self: center; padding-bottom: clamp(3.5rem, 8vw, 6rem); }
.hero-title {
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.08;
  margin: 0 0 var(--space-4);
}
.hero-lead {
  font-size: var(--text-lg);
  color: var(--color-on-dark-muted);
  max-width: 32rem;
  margin: 0 0 var(--space-6);
}
.hero-actions { display: flex; flex-wrap: wrap; gap: var(--space-3); margin-bottom: var(--space-6); }
.hero-proof { display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-sm); }
.hero-proof p { margin: 0; }
.hero-faces { display: flex; }
.hero-faces img {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 2px solid var(--brand-navy);
  margin-left: -10px;
}
.hero-faces img:first-child { margin-left: 0; }
.hero-figure { position: relative; align-self: end; }
/* Blue glow behind the cut-out so the navy sweater separates from the navy band. */
.hero-figure::before {
  content: '';
  position: absolute;
  inset: 10% 0 0;
  background: radial-gradient(closest-side, rgba(28, 79, 249, 0.55), rgba(0, 165, 255, 0.18) 60%, transparent);
  filter: blur(10px);
}
.hero-cutout {
  position: relative;
  display: block;
  width: 100%;
  max-width: 520px;
  height: auto;
  margin-left: auto;
}
@media (max-width: 820px) {
  .hero-grid { grid-template-columns: 1fr; }
  .hero-copy { padding-bottom: 0; }
  .hero-cutout { max-width: 360px; margin: 0 auto; }
}
```

- [ ] **Step 3: Rewrite `src/pages/index.astro` with the hero**

```astro
---
import fs from 'node:fs';
import { getCollection } from 'astro:content';
import Base from '../layouts/Base.astro';
import HomeSchema from '../components/HomeSchema.astro';
import { recentEpisodes, interviewCount } from '../lib/episodes';
import { collageFor } from '../lib/headshots';
import type { EpisodeLike } from '../lib/pillars';
import '../styles/home.css';

const allEpisodes = (await getCollection('episodes')) as unknown as EpisodeLike[];
const headshotFiles = fs
  .readdirSync('public/headshots')
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
const count = interviewCount(allEpisodes);
// Hero social proof: the latest interview guests who have a headshot.
const faces = collageFor(recentEpisodes(allEpisodes, 20), headshotFiles, 5);
const epHref = (slug: string) => `/podcast/introverted-leader/${slug}/`;
---
<Base
  title="Greg Weinger — The Introverted Leader"
  description="Greg Weinger helps introverted leaders embrace their underrated, quiet strengths to get promoted and start earning what they deserve. Host of The Introverted Leader podcast."
>
  <HomeSchema slot="head" />

  <div class="home">

  <section class="band band--dark on-dark hero-band">
    <div class="band-inner hero-grid">
      <div class="hero-copy">
        <p class="eyebrow">Host of The Introverted Leader</p>
        <h1 class="hero-title">Embrace your <span class="hl">quiet strengths</span>.</h1>
        <p class="hero-lead">I help introverted leaders get promoted and start earning what they deserve — without becoming someone else.</p>
        <div class="hero-actions">
          <a class="btn-gold" href="/podcast/introverted-leader/">Listen to the podcast</a>
          <a class="btn-outline-light" href="/masterclass">Watch the masterclass →</a>
        </div>
        <div class="hero-proof">
          {faces.length > 0 && (
            <div class="hero-faces">
              {faces.map((f) => <img src={f.url} alt="" width="40" height="40" loading="lazy" />)}
            </div>
          )}
          <p>{count} conversations with leaders and experts</p>
        </div>
      </div>
      <div class="hero-figure">
        <img class="hero-cutout" src="/headshot-cutout.webp" alt="Greg Weinger" width="900" height="900" fetchpriority="high" />
      </div>
    </div>
  </section>

  </div>
</Base>
```

- [ ] **Step 4: Verify**

Run: `npm run build`
Expected: succeeds.

Run: `grep -o 'Embrace your <span class="hl">quiet strengths</span>' dist/index.html && grep -oE '[0-9]+ conversations with leaders' dist/index.html`
Expected: both match; the number equals the count of `status: interview` episodes (`grep -l 'status: interview' src/content/episodes/*.md | wc -l`).

- [ ] **Step 5: Commit**

```bash
git add public/headshot-cutout.webp src/styles/home.css src/pages/index.astro
git commit -m "feat: homepage band scaffold and navy hero with cut-out portrait"
```

---

### Task 5: "Two ways to start" and About bands

**Files:**
- Modify: `src/pages/index.astro` (insert after the hero `</section>`, before `</div>` closing `.home`)
- Modify: `src/styles/home.css` (append)

**Interfaces:**
- Consumes: `.band*`, `.eyebrow`, `.hl` (Tasks 2, 4); `LINKS.newsletter` from `src/lib/links.ts`.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Add the markup**

Add `import { LINKS } from '../lib/links';` to the frontmatter. Insert after the hero section:

```astro
  <section class="band band--white">
    <div class="band-inner">
      <div class="band-head">
        <p class="eyebrow">Start here — free</p>
        <h2 class="band-title">Two ways to start.</h2>
      </div>
      <div class="start-grid">
        <article class="start-card start-card--dark on-dark">
          <img class="start-card-img" src="/masterclass-still.webp" alt="Greg Weinger teaching the free masterclass" width="440" height="248" loading="lazy" />
          <p class="eyebrow">Free masterclass · ~30 min</p>
          <h3>Why Everything You've Been Told About Getting Ahead as an Introvert Is Wrong</h3>
          <p>The 3 Moments That Determine Advancement — a visibility framework built on preparation, not performance.</p>
          <a class="btn-gold" href="/masterclass">Watch it free →</a>
        </article>
        <article class="start-card start-card--light">
          <p class="eyebrow">Weekly newsletter</p>
          <h3>Quiet-strength leadership in your inbox</h3>
          <p>Join the newsletter for introverted leaders who want to rise without becoming someone else.</p>
          <a class="btn-primary" href={LINKS.newsletter}>Subscribe on Substack</a>
        </article>
      </div>
    </div>
  </section>

  <section class="band band--light">
    <div class="band-inner">
      <div class="about-head">
        <img class="about-head-img" src="/greg-weinger.webp" alt="Greg Weinger" width="128" height="128" loading="lazy" />
        <div>
          <p class="eyebrow">Greg Weinger</p>
          <h2 class="band-title">I've spent <span class="hl">25 years</span> in leadership — as an introvert.</h2>
        </div>
      </div>
      <div class="about-cols">
        <p>For most of my career I assumed those two things didn't go together. The companies I encountered seemed to reward the loudest voice, the fastest answer, and effortless charisma — so I spent years performing a version of leadership that wasn't mine.</p>
        <p>What I eventually learned is that the traits I'd treated as liabilities were where my best leadership came from — the listening, the writing, the thoughtful question that changes the conversation.</p>
        <p>I started <em>The Introverted Leader</em> to have the conversations I wish I'd had earlier: with researchers, coaches, and leaders who've figured out how to rise without becoming someone else.</p>
        <p><a href="/about">More about Greg →</a></p>
      </div>
    </div>
  </section>
```

- [ ] **Step 2: Append the CSS to `home.css`**

```css
/* ---------- Two ways to start ---------- */
.start-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-6); }
.start-card {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-8);
  border-radius: 20px;
}
.start-card h3 { font-size: var(--text-2xl); line-height: 1.2; margin: 0; }
.start-card p { margin: 0; }
.start-card .eyebrow { margin: 0; }
.start-card > a:last-child { margin-top: auto; }
.start-card--dark { background: var(--brand-navy); color: var(--color-on-dark-muted); }
.start-card--dark h3 { color: var(--color-on-dark); }
.start-card--light { background: var(--color-accent-light); border: 1px solid var(--color-border); }
.start-card-img { width: 100%; height: auto; aspect-ratio: 16 / 9; object-fit: cover; border-radius: var(--radius-md); }

/* ---------- About ---------- */
.about-head { display: flex; align-items: center; gap: var(--space-8); margin-bottom: var(--space-8); }
.about-head .band-title { margin: 0; }
.about-head-img {
  width: 128px;
  height: 128px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex: 0 0 auto;
}
.about-cols { columns: 2; column-gap: var(--space-12); }
.about-cols p { margin: 0 0 var(--space-4); break-inside: avoid; }

@media (max-width: 720px) {
  .start-grid { grid-template-columns: 1fr; }
  .start-card { padding: var(--space-6); }
  .about-head { gap: var(--space-4); }
  .about-head-img { width: 88px; height: 88px; }
  .about-cols { columns: 1; }
}
```

Note: `.start-card > a:last-child { margin-top: auto }` pushes the button to the card bottom so the two cards' buttons align. It needs `gap` (already set) to keep space above when content is tall.

- [ ] **Step 3: Verify**

Run: `npm run build && grep -c 'start-card' dist/index.html && grep -o '25 years</span>' dist/index.html`
Expected: build succeeds; count ≥ 2; highlight match found.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro src/styles/home.css
git commit -m "feat: homepage 'two ways to start' and about bands"
```

---

### Task 6: Podcast, Topics, and closing CTA bands

**Files:**
- Modify: `src/pages/index.astro` (insert after the About section)
- Modify: `src/styles/home.css` (append)

**Interfaces:**
- Consumes: `recentEpisodes`, `cardImage`, `listenLinks`, `guestName` (Task 1); `LINKS`; `allEpisodes`, `headshotFiles`, `count`, `epHref` (Task 4 frontmatter); `topics` collection.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Extend the frontmatter**

Change the episodes import to
`import { recentEpisodes, interviewCount, cardImage, listenLinks, guestName } from '../lib/episodes';`
and add after `const epHref = ...`:

```ts
const topics = (await getCollection('topics')).sort((a, b) => a.data.order - b.data.order);
const featured = recentEpisodes(allEpisodes, 3);
const latest = featured[0];
const listen = latest ? listenLinks(latest, LINKS) : { apple: LINKS.apple, spotify: LINKS.spotify };
```

- [ ] **Step 2: Add the markup after the About section**

```astro
  <section class="band band--white">
    <div class="band-inner">
      <div class="band-head-split">
        <div>
          <p class="eyebrow">The Introverted Leader</p>
          <h2 class="band-title">Conversations worth learning from.</h2>
        </div>
        <a class="band-link" href="/podcast/introverted-leader/">All {count} episodes →</a>
      </div>
      <div class="guest-grid">
        {featured.map((e) => (
          <a class="guest-card" href={epHref(e.data.slug)}>
            <img src={cardImage(e, headshotFiles)} alt={guestName(e.data.guest)} loading="lazy" />
            <span class="guest-card-tag">#{e.data.episode}</span>
            <span class="guest-card-body">
              <strong class="guest-card-name">{guestName(e.data.guest)}</strong>
              <span class="guest-card-title">{e.data.title}</span>
              <span class="guest-card-cta">Listen →</span>
            </span>
          </a>
        ))}
      </div>
      {latest && (
        <div class="latest-bar">
          <a class="latest-bar-ep" href={epHref(latest.data.slug)}>
            <span class="latest-bar-label">Latest episode · #{latest.data.episode}</span>
            <span class="latest-bar-title">{latest.data.title}</span>
          </a>
          <div class="latest-bar-platforms">
            <a class="platform-apple" href={listen.apple}>Apple Podcasts</a>
            <a class="platform-spotify" href={listen.spotify}>Spotify</a>
          </div>
        </div>
      )}
    </div>
  </section>

  <section class="band band--dark on-dark">
    <div class="band-inner">
      <div class="band-head">
        <p class="eyebrow">Explore by topic</p>
        <h2 class="band-title">Find what you need next.</h2>
      </div>
      <div class="topic-grid">
        {topics.map((t) => (
          <a class="topic-card" href={`/topics/${t.data.slug}/`}>
            <span class="topic-card-name">{t.data.navLabel ?? t.data.title}</span>
            <span class="topic-card-cta">Explore →</span>
          </a>
        ))}
      </div>
    </div>
  </section>

  <section class="band band--dark on-dark closing-band">
    <div class="band-inner band-head">
      <p class="eyebrow">Lead as yourself</p>
      <h2 class="band-title">Ready to rise without becoming someone else?</h2>
      <div class="hero-actions closing-actions">
        <a class="btn-gold" href="/podcast/introverted-leader/">Listen to the podcast</a>
        <a class="btn-outline-light" href="/masterclass">Watch the masterclass →</a>
      </div>
    </div>
  </section>
```

- [ ] **Step 3: Append the CSS to `home.css`**

```css
/* ---------- Podcast ---------- */
.guest-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-6); }
.guest-card {
  position: relative;
  display: block;
  aspect-ratio: 4 / 5;
  border-radius: 20px;
  overflow: hidden;
  background: var(--brand-navy);
  color: var(--color-on-dark);
  text-decoration: none;
}
.guest-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 20%;
  transition: transform 0.3s;
}
.guest-card:hover img { transform: scale(1.03); }
.guest-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(13, 39, 71, 0.95) 0%, rgba(13, 39, 71, 0.6) 35%, transparent 65%);
}
.guest-card-tag {
  position: absolute;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 1;
  background: var(--brand-gold);
  color: var(--brand-navy);
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
}
.guest-card-body {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}
.guest-card-name { font-family: var(--font-display); font-size: var(--text-xl); color: var(--color-on-dark); }
.guest-card-title {
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.85);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.guest-card-cta { font-size: var(--text-sm); font-weight: 700; color: var(--brand-gold); margin-top: var(--space-2); }

.latest-bar { margin-top: var(--space-6); display: flex; flex-wrap: wrap; gap: var(--space-4); align-items: stretch; }
.latest-bar-ep {
  flex: 1 1 22rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: var(--space-1);
  background: var(--brand-navy);
  color: var(--color-on-dark);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-6);
  text-decoration: none;
}
.latest-bar-ep:hover { color: var(--color-on-dark); background: #133461; }
.latest-bar-label {
  font-family: var(--font-display);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--brand-gold);
}
.latest-bar-title { font-weight: 600; }
.latest-bar-platforms { flex: 0 0 12rem; display: flex; flex-direction: column; gap: var(--space-2); }
.latest-bar-platforms a {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: var(--text-sm);
  text-decoration: none;
}
.latest-bar-platforms a:hover { filter: brightness(1.08); }
/* Spotify green fails contrast with white text; navy text instead. */
.latest-bar-platforms .platform-apple { background: #872EC4; color: #fff; }
.latest-bar-platforms .platform-spotify { background: #1DB954; color: var(--brand-navy); }

/* ---------- Topics ---------- */
.topic-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-4); }
.topic-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-6);
  min-height: 9rem;
  padding: var(--space-6);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  text-decoration: none;
  transition: border-color 0.15s, background 0.15s;
}
.topic-card:hover { border-color: var(--brand-gold); background: rgba(255, 255, 255, 0.08); }
.topic-card-name { font-family: var(--font-display); font-weight: 600; font-size: var(--text-xl); line-height: 1.25; color: var(--color-on-dark); }
.topic-card-cta { font-size: var(--text-sm); font-weight: 700; color: var(--brand-gold); }

/* ---------- Closing CTA ---------- */
.closing-band { border-top: 1px solid rgba(255, 255, 255, 0.1); }
.closing-band .band-title { margin-bottom: var(--space-6); }
.closing-actions { justify-content: center; margin-bottom: 0; }

@media (max-width: 900px) {
  .guest-grid, .topic-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 600px) {
  .guest-grid, .topic-grid { grid-template-columns: 1fr; }
  .guest-card { aspect-ratio: 4 / 3; }
  .latest-bar-platforms { flex: 1 1 100%; flex-direction: row; }
  .latest-bar-platforms a { flex: 1; }
}
```

- [ ] **Step 4: Verify**

Run: `npm run build && grep -c 'class="guest-card"' dist/index.html && grep -c 'class="topic-card"' dist/index.html && grep -c 'href="undefined"' dist/index.html`
Expected: build succeeds; `3`; `6`; `0`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/index.astro src/styles/home.css
git commit -m "feat: homepage podcast, topics, and closing CTA bands"
```

---

### Task 7: Remove dead homepage CSS and verify in the browser

**Files:**
- Modify: `src/styles/global.css` (delete `.hero`, `.hero-portrait`, `.hero-text`, `.hero-tagline`, `.hero-sub`, `.hero-cta`, `.hero-cta a` rules and the whole "Masterclass band (homepage promo)" section)

`.about-teaser`, `.home-section-label`, `.home-section-head`, `.newsletter-band` stay — masterclass pages and `Newsletter.astro` still use them.

- [ ] **Step 1: Confirm the classes are unused, then delete them**

Run: `grep -rnE 'class="hero"|hero-portrait|hero-text|hero-tagline|hero-sub|hero-cta|masterclass-band' src --include='*.astro' | grep -v _retired`
Expected: no output (`_retired/` is not built). Then delete the listed rules from `global.css`. Do not touch `home.css` — its hero classes (`.hero-band`, `.hero-grid`, `.hero-copy`, `.hero-title`, `.hero-lead`, `.hero-actions`, `.hero-proof`, `.hero-faces`, `.hero-figure`, `.hero-cutout`) share no names with the old rules.

- [ ] **Step 2: Full automated checks**

Run: `npm test && npx astro check && npm run build`
Expected: all tests PASS; 0 errors; build succeeds.

- [ ] **Step 3: Start the dev server on a separate port**

Run (background): `npx astro dev --port 4322`
Expected: serves at `http://localhost:4322/` (4322 avoids clashing with a dev server in the main checkout).

- [ ] **Step 4: Browser check at desktop width (1440px)**

Open in Chrome and screenshot: `/`, `/podcast/introverted-leader/`, one episode page, `/topics/imposter-syndrome/`, `/about`, `/contact/`, `/masterclass`.
Check:
- Header: navy, wordmark left, pill nav centered, yellow "Free Masterclass" right; current page pill highlighted on inner pages; `/masterclass` shows wordmark only.
- Homepage bands in order: hero (portrait sits on the band's bottom edge, blue glow visible behind the sweater), two ways to start, about, podcast, topics, closing CTA, footer with no white gap above it.
- No yellow text on white/light backgrounds anywhere.
- Inner pages: layout unchanged apart from header/footer/colors.

- [ ] **Step 5: Browser check at phone widths (390px and 360px)**

Resize the window and re-check `/` and one episode page.
Check: `document.documentElement.scrollWidth <= window.innerWidth` (run in the console / javascript tool) returns `true` on both pages at both widths; nav pills sit on their own row; hero stacks with portrait below text; cards single-column; listen buttons side by side.

- [ ] **Step 6: Fix anything found, re-run Step 2, commit**

```bash
git add -A src
git commit -m "chore: remove retired homepage styles; redesign QA fixes"
```

- [ ] **Step 7: Hand to Greg for review**

Leave the dev server running and give Greg the local URL plus desktop and mobile screenshots. Stop here until Greg approves.

---

### Task 8: Launch (only after Greg approves the running site)

**Files:** none changed.

- [ ] **Step 1: Confirm with Greg in chat that he approves launching.**

- [ ] **Step 2: Rebase on the latest `main`**

Episode publishes may have landed on `main` since the branch was cut.

```bash
git fetch origin
git rebase origin/main
npm test && npm run build
```
Expected: rebase clean (the redesign doesn't touch `src/content/` or `public/headshots/`); tests pass; build succeeds.

- [ ] **Step 3: Merge and push from the main checkout**

```bash
cd /Users/gregoryweinger/code/podcast-site
git status --short            # must be clean and on main
git pull --ff-only
git merge --ff-only feat/homepage-redesign
git push origin main          # Cloudflare Pages deploys
```

- [ ] **Step 4: Verify production**

After the deploy finishes, open `https://gweinger.com/` and one inner page at desktop and phone width and confirm they match the local review.

- [ ] **Step 5: Clean up**

```bash
git worktree remove /Users/gregoryweinger/code/podcast-site-redesign
git branch -d feat/homepage-redesign
```
