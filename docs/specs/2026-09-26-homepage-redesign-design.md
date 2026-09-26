# Homepage & Navigation Redesign — Design

**Date:** 2026-09-26
**Status:** Approved in conversation; awaiting spec review
**Branch:** `feat/homepage-redesign`

## Goal

Rework gweinger.com's homepage and site header in the layout style of
[amplifyme.agency](https://www.amplifyme.agency/) (Bob Gentle), using Greg's
existing brand palette. This is a reskin + homepage re-layout, not a site
restructure: content, routes, schema markup, the contact Worker, and the
masterclass flow are unchanged.

### What we're borrowing from the reference

- Full-bleed horizontal bands alternating dark / light, content centered in a
  wide column.
- Header: logo left, links in a centered rounded "pill" bar, one solid CTA
  button right.
- Hero: dark background, large headline with one highlighted phrase, one-line
  subtext, solid primary + outline secondary button, a small social-proof row,
  cut-out portrait on the right.
- Small uppercase "eyebrow" labels above section headings, in the accent color.
- Card-based sections (two-up offer cards, three-up photo cards, grid cards).
- A closing CTA band before a slim dark footer.

### What we are not borrowing

His content-dependent sections (Work With Me offers, video testimonials, blog,
booking calendar), his monospace eyebrow font, the Work With Me dropdown, and
his popups.

## 1. Design tokens (`src/styles/global.css` `:root`)

Palette primitives are unchanged (`--brand-blue #1c4ff9`,
`--brand-blue-light #00a5ff`, `--brand-gold #ffc500`, `--brand-navy #0D2747`).
New/changed semantic tokens:

| Token | Value | Role (reference equivalent) |
|---|---|---|
| `--color-band-dark` | `var(--brand-navy)` | dark bands, header, footer (his navy) |
| `--color-band-light` | `#EEF3F9` | alternating light bands (his pale blue-grey) |
| `--color-on-dark` | `#FFFFFF` | text on dark bands |
| `--color-on-dark-muted` | `rgba(255,255,255,0.75)` | body text on dark bands |
| `--color-highlight-dark` | `var(--brand-gold)` | highlighted phrase + eyebrow on dark bands (his coral) |
| `--color-highlight-light` | `var(--brand-blue)` | highlighted phrase + eyebrow on light/white bands |
| `--maxw-wide` | `1120px` | homepage band content width |

**Contrast rule:** yellow is never used as text on white/light backgrounds
(fails contrast); blue takes that role there. Yellow buttons always carry navy
text.

**Type:** Jost stays as the display font (add weight 500 to the Google Fonts
request for eyebrows). Body stays `system-ui`. Eyebrow style: Jost, uppercase,
`letter-spacing: 0.12em`, `var(--text-sm)`, weight 600. Homepage headings get a
larger scale (hero h1 ≈ `clamp(2.25rem, 5vw, 3.5rem)`, band h2 ≈
`clamp(1.75rem, 3.5vw, 2.25rem)`); inner pages keep the existing scale.

`--maxw: 720px` stays for reading pages (episodes, topics, about, contact,
legal, masterclass).

## 2. Header and footer

### Header (`src/layouts/Base.astro`)

- Navy background on every page. The yellow `.announcement-bar` is removed.
- Left: "Greg Weinger" wordmark (Jost, white).
- Center: pill bar — rounded (`--radius-full`) container with a subtle
  translucent-white border/background, links Podcast · Topics · About ·
  Contact in white; hover/current page gets a slightly brighter pill.
- Right: yellow "Free Masterclass" button → `/masterclass`.
- `minimalHeader` pages (masterclass funnel) keep the wordmark only, as today.
- Mobile (≤ 720px): wordmark + button on row one, pill bar wraps to a full-width
  second row. No JavaScript.
- Header inner width: `--maxw-wide`.

### Footer (`src/components/Footer.astro`)

Navy, slim, same four nav groups as today (nav, social, legal, copyright)
restyled in the reference's single-row layout on desktop, stacked on mobile.
Link colors switch to `--color-on-dark-muted` with white hover.

## 3. Homepage (`src/pages/index.astro`)

The homepage stops wrapping everything in `.container`; each section is a
full-bleed `<section class="band band--dark|light|white">` with an inner
`.band-inner` at `--maxw-wide`.

1. **Hero** — `band--dark` plus a soft radial `--brand-blue` glow behind the
   portrait so the navy sweater separates from the navy background.
   - Two columns (text left, portrait right); stacks on mobile with the
     portrait below the text.
   - Eyebrow: "Host of The Introverted Leader"
   - H1: "Your quiet strengths are your **advantage**." (highlighted word in
     yellow). *Draft copy — Greg to confirm.*
   - Subtext: "I help introverted leaders embrace their underrated, quiet
     strengths to get promoted and start earning what they deserve."
   - Buttons: yellow **Listen to the podcast** → `/podcast/introverted-leader/`;
     outline-white **Watch the masterclass →** → `/masterclass`.
   - Social-proof row: five overlapping circular guest headshots (latest
     interview guests that have a headshot) + "{N} conversations with leaders
     and experts", where N = count of `status: interview` episodes (computed,
     not hard-coded).
   - Portrait: `podcast-studio/headshot-transparent.PNG` (4000px, 18MB)
     resized to a ~900px-tall transparent webp saved as
     `public/headshot-cutout.webp`. The existing `headshot-hero.webp` stays in
     `public/` (other uses/OG) but is no longer on the homepage.

2. **Two ways to start** — `band--white`. Eyebrow "Start here — free", H2 "Two
   ways to start." Two side-by-side cards (stack on mobile):
   - Dark navy card: masterclass — kicker "Free masterclass · ~30 min", title
     "Why Everything You've Been Told About Getting Ahead as an Introvert Is
     Wrong", one-line description, masterclass still image, yellow button
     "Watch it free →".
   - Light card (`--color-band-light` with blue accent): newsletter — title
     "Quiet-strength leadership in your inbox", existing Newsletter copy, blue
     button "Subscribe on Substack".
   The standalone `.masterclass-band` and the homepage `<Newsletter />` usage
   are replaced by these cards. `Newsletter.astro` itself is unchanged (still
   used on About and elsewhere).

3. **About** — `band--light`. Round headshot (`/greg-weinger.webp`) beside an
   eyebrow "Greg Weinger" and H2 "I've spent **25 years** in leadership — as an
   introvert." (highlight in blue). Two text columns below (single column on
   mobile) using three short paragraphs condensed from `about.astro`
   (the "assumed they didn't go together" → "traits I treated as liabilities"
   → "why I started the show" arc). Ends with "More about Greg →".

4. **Podcast** — `band--white`. Eyebrow "The Introverted Leader", H2
   "Conversations worth learning from.", right-aligned "All episodes →".
   - Three photo cards: the three newest interview episodes. Guest headshot
     fills the card (fallback: episode thumbnail) with a dark gradient at the
     bottom carrying guest name, episode title, and "Listen →". A small
     "#{episode}" tag top-left (his "Featured guest" tag).
   - Latest-episode bar below: navy bar with the newest episode's cover/number
     and title, linking to its page, plus Apple Podcasts and Spotify buttons
     from `LINKS`.

5. **Topics** — `band--dark`. Eyebrow "Explore by topic", H2 "Find what you
   need next." Six topic cards in a 3×2 grid (2 columns tablet, 1 mobile) with
   translucent dark card backgrounds, topic name, and "Explore →". Data from the
   existing `topics` collection, sorted by `order`.

6. **Closing CTA** — `band--dark` (separated from Topics by a hairline).
   Eyebrow "Lead as yourself", H2 "Ready to rise without becoming someone
   else?", the same two hero buttons.

Then the footer.

The six recent-episode `card-grid` on the homepage is replaced by section 4.
`HomeSchema` stays.

## 4. Unchanged / out of scope

- All routes, content collections, `lib/*` logic, schema components, redirects,
  sitemap config, contact Worker, analytics tag.
- Inner-page layouts. They inherit the new header, footer, button styles, and
  tokens only. Existing `.btn-*`, `.card`, `.newsletter-band` classes keep
  working.
- No new JS, no new dependencies.

## 5. Testing & verification

- `npm test` (vitest) passes — no lib changes expected, so existing suites are
  the regression check.
- `npx astro check` clean.
- `npm run build` succeeds.
- `npm run dev`, then visually check in the browser at 1440px and 390px widths:
  homepage (every band), one episode page, one topic page, About, Contact,
  masterclass (`minimalHeader`).
- Contrast spot-check: no yellow text on light backgrounds; navy on yellow
  buttons.

## Open items for Greg

- Hero headline copy (draft above).
- Whether to deploy straight away after review or hold for copy edits.
