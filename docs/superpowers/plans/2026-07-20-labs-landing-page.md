# Leadership Labs Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/labs` on gweinger.com — the Leadership Labs landing page, its thank-you page, and `/leaderlabs` + `/leader-labs` redirects — matching `_showrunner/labs-landing-page.md`.

**Architecture:** Two new static Astro pages (`src/pages/labs.astro`, `src/pages/labs/thank-you.astro`) built on the existing `Base` layout, styled entirely with new rules added to the existing `src/styles/global.css` (this codebase has no scoped `<style>` blocks — everything lives there) plus reuse of existing classes (`.card`, `.card-grid`, `.contact-form`, `.form-field`, `.about-teaser`, `.pull-quote`, `.btn-primary`, `.btn-gold`). The signup form is a plain native HTML form POSTing directly to Kit's public subscription endpoint — no client JavaScript. `Base.astro` gets one small addition: a `minimalHeader` prop that suppresses the announcement bar and nav links, satisfying the source doc's "one page, one action" requirement without a page-specific layout fork.

**Tech Stack:** Astro 6 (static output), no client JS, Cloudflare Pages `_redirects` file for URL redirects.

## Global Constraints

- Copy is verbatim from `_showrunner/labs-landing-page.md` (podcast-studio repo) except the masterclass cross-link, which is dropped per the approved spec (`docs/superpowers/specs/2026-07-20-labs-landing-page-design.md`) — the masterclass gate page doesn't exist yet.
- No client-side JavaScript on the signup form. It must degrade-without-JS by construction (plain `<form method="post" action="...">`).
- No new component files — single-page build, two `.astro` files total, following the codebase's existing page-file convention (no scoped `<style>`, all CSS in `src/styles/global.css`).
- No automated test coverage — this is static content plus a logic-free HTML form (per the spec's Testing section; the repo's existing `vitest` suite only covers pure-logic `src/lib/*.ts` modules, never pages). Verification per task is `npm run build` (which type-checks and statically renders every page) plus grepping the rendered HTML for expected content.
- Kit form ID is not yet created — ship with a placeholder constant `REPLACE_WITH_KIT_FORM_ID` and a comment pointing at the "Kit Setup" section of the source doc.
- `/leadershiplabs` is explicitly NOT built — only `/leaderlabs` and `/leader-labs`, both redirecting to `/labs`.

---

### Task 1: Add `/leaderlabs` and `/leader-labs` redirects

**Files:**
- Modify: `public/_redirects`

**Interfaces:** None — this task has no dependencies and nothing depends on it.

- [ ] **Step 1: Append the two redirect lines**

Open `public/_redirects` and add these two lines at the end of the file (it currently ends at line 60 with the `/il/67 ...` redirect):

```
/leaderlabs /labs 301
/leader-labs /labs 301
```

- [ ] **Step 2: Verify the lines are present and correctly formatted**

Run: `tail -5 public/_redirects`
Expected output ends with:
```
/leaderlabs /labs 301
/leader-labs /labs 301
```

- [ ] **Step 3: Commit**

```bash
git add public/_redirects
git commit -m "feat: redirect /leaderlabs and /leader-labs to /labs"
```

---

### Task 2: Add `minimalHeader` prop to `Base.astro`

**Files:**
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Produces: `Base` component now accepts an optional `minimalHeader?: boolean` prop (default `false`). When `true`, the `.announcement-bar` div and the `<nav>` inside `.site-header` are not rendered — only the `.brand` logo link remains in the header. All other pages (which don't pass the prop) render exactly as before.

- [ ] **Step 1: Read the current file to confirm line numbers before editing**

Run: `cat -n src/layouts/Base.astro`

- [ ] **Step 2: Add the prop and conditionally render the announcement bar and nav**

Replace the full contents of `src/layouts/Base.astro` with:

```astro
---
import '../styles/global.css';
import Footer from '../components/Footer.astro';
import { LINKS } from '../lib/links';
interface Props { title: string; description?: string; canonical?: string; minimalHeader?: boolean; }
const { title, description = '', canonical, minimalHeader = false } = Astro.props;
const canonicalUrl = canonical ?? new URL(Astro.url.pathname, Astro.site).href;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Jost:wght@600;700&display=swap" rel="stylesheet">
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <link rel="icon" type="image/png" href="/favicon.png" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="canonical" href={canonicalUrl} />
    <meta property="og:title" content={title} />
    {description && <meta property="og:description" content={description} />}
    <meta property="og:type" content="website" />
    <slot name="head" />
  </head>
  <body>
    {!minimalHeader && (
      <div class="announcement-bar">
        Join the movement of introverted professionals on <a href={LINKS.newsletter}>my Substack</a>
      </div>
    )}
    <header class="site-header">
      <div class="container">
        <a class="brand" href="/">Greg Weinger</a>
        {!minimalHeader && (
          <nav>
            <a href="/podcast/introverted-leader/">Podcast</a>
            <a href="/topics/">Topics</a>
            <a href="/about">About</a>
            <a href="/contact/">Contact</a>
          </nav>
        )}
      </div>
    </header>
    <main><slot /></main>
    <Footer />
  </body>
</html>
```

- [ ] **Step 3: Verify existing pages are unaffected**

Run: `npm run build`
Expected: build succeeds with no errors, and `dist/about/index.html`, `dist/contact/index.html`, `dist/index.html` all still contain the announcement bar and nav (spot-check one):

Run: `grep -c "announcement-bar" dist/index.html`
Expected: `1`

Run: `grep -c "Join the movement" dist/about/index.html`
Expected: `1`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "feat: add minimalHeader prop to Base layout"
```

---

### Task 3: Add Labs landing page CSS to `global.css`

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Produces: CSS classes `.labs-hero`, `.labs-hero-cta`, `.labs-table-wrap`, `.labs-sessions-table`, `.labs-form-note` — consumed by `src/pages/labs.astro` in Task 4. Reuses (does not modify) existing classes: `.card`, `.card-grid`, `.lead`, `.home-section-label`, `.contact-form-section`, `.contact-form`, `.form-field`, `.contact-submit`, `.btn-primary`, `.btn-gold`, `.about-teaser`, `.about-teaser-img`, `.pull-quote`, `.container`.

- [ ] **Step 1: Add the new CSS section**

In `src/styles/global.css`, insert this new section immediately after the "Contact page" section (after the line `.contact-connect { margin: var(--space-12) 0 var(--space-8); }`, before the `/* Introvert Army — /introvert-army/ ... */` banner comment):

```css
/* ============================================================
   Labs landing page — /labs
   ============================================================ */
.labs-hero {
  text-align: center;
  max-width: 640px;
  margin: 0 auto var(--space-8);
  padding: var(--space-8) var(--space-6) 0;
}
.labs-hero .lead { margin: var(--space-4) 0; }
.labs-hero-cta { margin-top: var(--space-6); }

.labs-table-wrap { overflow-x: auto; margin: var(--space-4) 0; }
.labs-sessions-table { width: 100%; border-collapse: collapse; }
.labs-sessions-table th,
.labs-sessions-table td {
  text-align: left;
  padding: var(--space-3) var(--space-2);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  white-space: nowrap;
}
.labs-sessions-table th {
  font-family: var(--font-display);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}
.labs-sessions-table td:last-child { color: var(--color-text-muted); }

.labs-form-note { font-size: var(--text-sm); color: var(--color-text-muted); font-style: italic; margin: 0; }
```

- [ ] **Step 2: Verify the CSS file is still valid**

Run: `npm run build`
Expected: build succeeds (Astro inlines/bundles `global.css`; a syntax error here would still let HTML build succeed since Astro doesn't lint CSS, so also visually scan the diff for balanced braces)

Run: `grep -c "labs-sessions-table" src/styles/global.css`
Expected: `5` (lines matching: `.labs-sessions-table {`, `.labs-sessions-table th,`, `.labs-sessions-table td {`, `.labs-sessions-table th {`, `.labs-sessions-table td:last-child {`)

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Labs landing page CSS"
```

---

### Task 4: Build `src/pages/labs.astro`

**Files:**
- Create: `src/pages/labs.astro`

**Interfaces:**
- Consumes: `Base` layout with `minimalHeader` prop (Task 2); CSS classes from Task 3; existing shared classes (`.card`, `.card-grid`, `.contact-form-section`, `.contact-form`, `.form-field`, `.contact-submit`, `.btn-primary`, `.btn-gold`, `.about-teaser`, `.about-teaser-img`, `.pull-quote`).
- Produces: the `/labs` route. Contains `<section id="signup">` — the anchor target for the hero CTA (`href="#signup"`) and the target Kit's dashboard "Success behavior" redirect will need once the real form exists (Task list's Global Constraints note the Kit form ID is a placeholder).

- [ ] **Step 1: Create the file**

Create `src/pages/labs.astro`:

```astro
---
import Base from '../layouts/Base.astro';

// TODO: replace with the real Kit form ID once the 'labs-landing' form is
// created in Kit — see the "Kit Setup" section of
// _showrunner/labs-landing-page.md (podcast-studio repo) for the steps
// (custom field, tags, form, welcome automation, link-trigger rule).
const KIT_FORM_ID = 'REPLACE_WITH_KIT_FORM_ID';
const KIT_FORM_ACTION = `https://app.kit.com/forms/${KIT_FORM_ID}/subscriptions`;
---
<Base
  title="Leadership Labs — Free Live Sessions for Introverted Leaders | Greg Weinger"
  description="A free monthly live session for introverted leaders. Bring your real situations — we work through them together. Hosted by Greg Weinger of The Introverted Leader podcast."
  minimalHeader
>
  <section class="labs-hero">
    <h1>The Leadership Labs</h1>
    <p class="lead">Free live sessions for introverted leaders — bring your real situations, and we'll work through them together.</p>
    <p>You don't need another lecture about speaking up. You need a room where your way of leading is the starting point, not the problem.</p>
    <p>Once a month, I host a free live session — about an hour. I present one topic to start, then we open it up: your questions, your actual situations, live discussion with other introverted leaders working through the same things.</p>
    <p>It's free. It's live. And it's where the conversation gets real.</p>
    <div class="labs-hero-cta">
      <a class="btn-gold" href="#signup">Join the next Lab →</a>
    </div>
  </section>

  <div class="container">

    <section>
      <h2 class="home-section-label">The Four Topics</h2>
      <p>The Labs rotate through the four things that hold introverted leaders back. They're not four separate topics — they're four legs of the same table.</p>
      <div class="card-grid">
        <div class="card">
          <h3>Identity</h3>
          <p>Undoing the belief that who you are is the problem. Until this shifts, tactics don't stick. It's where we start.</p>
        </div>
        <div class="card">
          <h3>Inner Knowing</h3>
          <p>Learning to trust your read on a room, a person, a situation. Introverts are wired for this — and trained to ignore it. That read is trainable.</p>
        </div>
        <div class="card">
          <h3>Discomfort</h3>
          <p>Using anxiety, friction, and uncertainty as fuel instead of brakes. The capacity to sit with discomfort is a strength — most of us were never told.</p>
        </div>
        <div class="card">
          <h3>Visibility</h3>
          <p>Being seen in the moments that matter, without performing. If you've watched the masterclass, this is the deep-dive.</p>
        </div>
      </div>
    </section>

    <section>
      <h2 class="home-section-label">Upcoming Sessions</h2>
      <div class="labs-table-wrap">
        <table class="labs-sessions-table">
          <thead>
            <tr>
              <th>Lab</th>
              <th>Topic</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>#1</td>
              <td>Identity</td>
              <td>Thursday, August 20, 2026 — 9:00am PT / 12:00pm ET</td>
              <td>Registration opens soon</td>
            </tr>
            <tr>
              <td>#2</td>
              <td>Inner Knowing</td>
              <td>September 2026</td>
              <td>—</td>
            </tr>
            <tr>
              <td>#3</td>
              <td>Discomfort</td>
              <td>September 2026</td>
              <td>—</td>
            </tr>
            <tr>
              <td>#4</td>
              <td>Visibility</td>
              <td>October 2026</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>Missed one? Every session is recorded. Sign up below and you'll get the recordings along with your invitation to the next live session.</p>
    </section>

    <section>
      <h2 class="home-section-label">How It Works</h2>
      <ol>
        <li><strong>Sign up</strong> — one email field, that's it.</li>
        <li><strong>Get your invitation</strong> — I'll send the link and calendar invite for the next live session.</li>
        <li><strong>Bring something real</strong> — a situation you're actually in. The Labs run on real cases, not hypotheticals.</li>
        <li><strong>Can't make it live?</strong> The recording lands in your inbox.</li>
      </ol>
    </section>

    <section id="signup" class="contact-form-section">
      <h2 class="home-section-label">Join the next free Lab</h2>
      <form class="contact-form" method="post" action={KIT_FORM_ACTION}>
        <div class="form-field">
          <label for="email_address">Email address</label>
          <input type="email" id="email_address" name="email_address" required placeholder="you@example.com" />
        </div>
        <div class="form-field">
          <label for="leadership_challenge">One question — what leadership challenge are you working through right now?</label>
          <input type="text" id="leadership_challenge" name="fields[leadership_challenge]" placeholder="One sentence is plenty" />
          <p class="labs-form-note">I read every one. Your answer decides what we cover in the live sessions.</p>
        </div>
        <button type="submit" class="btn-primary contact-submit">Sign me up for the next Lab</button>
      </form>
    </section>

    <section class="about-teaser">
      <img class="about-teaser-img" src="/greg-weinger.webp" alt="Greg Weinger" width="80" height="80" />
      <div>
        <h2 class="home-section-label">About Your Host</h2>
        <p>I'm Greg Weinger. I spent over 25 years rising to the executive level of software companies as an introvert — most of those years in denial about it. For the past two years I've been interviewing the most effective introverted leaders and experts I could find on <strong>The Introverted Leader</strong> podcast — people who got promoted, built influence, and advanced without becoming someone they weren't. The Labs are where those patterns get applied to your situation, live.</p>
      </div>
    </section>

    <p class="pull-quote">You're not behind. You're just running a different play.</p>

  </div>
</Base>
```

- [ ] **Step 2: Build and verify the page renders**

Run: `npm run build`
Expected: build succeeds with no errors.

Run: `test -f dist/labs/index.html && echo FOUND`
Expected: `FOUND`

Run: `grep -c "The Leadership Labs" dist/labs/index.html`
Expected: `1`

Run: `grep -c 'action="https://app.kit.com/forms/REPLACE_WITH_KIT_FORM_ID/subscriptions"' dist/labs/index.html`
Expected: `1`

Run: `grep -c 'id="signup"' dist/labs/index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/pages/labs.astro
git commit -m "feat: add /labs Leadership Labs landing page"
```

---

### Task 5: Build `src/pages/labs/thank-you.astro`

**Files:**
- Create: `src/pages/labs/thank-you.astro`

**Interfaces:**
- Consumes: `Base` layout with `minimalHeader` prop (Task 2).
- Produces: the `/labs/thank-you` route — the Kit dashboard "Success behavior" redirect target (configured later, outside this repo, per the source doc's Kit Setup step 3).

- [ ] **Step 1: Create the file**

Create `src/pages/labs/thank-you.astro`:

```astro
---
import Base from '../../layouts/Base.astro';
---
<Base
  title="You're In — Leadership Labs | Greg Weinger"
  description="You're registered for the next Leadership Lab. Check your inbox for confirmation."
  minimalHeader
>
  <div class="container">
    <h1>You're in.</h1>
    <p class="lead">Check your inbox — your confirmation is on the way, and your invitation to the next Lab will follow.</p>
  </div>
</Base>
```

- [ ] **Step 2: Build and verify the page renders**

Run: `npm run build`
Expected: build succeeds with no errors.

Run: `test -f dist/labs/thank-you/index.html && echo FOUND`
Expected: `FOUND`

Run: `grep -c "You're in." dist/labs/thank-you/index.html`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add src/pages/labs/thank-you.astro
git commit -m "feat: add /labs/thank-you confirmation page"
```

---

### Task 6: Full verification pass

**Files:** None — verification only.

**Interfaces:** None.

- [ ] **Step 1: Clean build from scratch**

Run: `rm -rf dist && npm run build`
Expected: build succeeds with no errors or warnings about `labs`.

- [ ] **Step 2: Confirm all three new routes exist in the build output**

Run: `ls dist/labs/index.html dist/labs/thank-you/index.html`
Expected: both paths listed, no "No such file" errors.

- [ ] **Step 3: Confirm redirects file made it into the build output unmodified**

Cloudflare Pages copies everything in `public/` verbatim into `dist/` — this is how it picks up `_redirects` at deploy time.

Run: `tail -5 dist/_redirects`
Expected:
```
/leaderlabs /labs 301
/leader-labs /labs 301
```

- [ ] **Step 4: Manual visual check in the browser**

Run: `npm run preview` (serves the `dist/` build)

Open `http://localhost:4321/labs` in a browser and confirm:
- Hero renders with the gold "Join the next Lab →" button, no announcement bar, no top nav links (only the "Greg Weinger" logo)
- Clicking the hero CTA scrolls down to the signup form
- The Four Topics grid shows all 4 cards
- The Upcoming Sessions table shows all 4 rows and doesn't overflow the page on a narrow viewport (resize to ~375px wide to check the horizontal scroll wrapper works)
- The signup form shows the email field and the optional challenge-question field, both styled consistently with the site (compare against `/contact`)
- The About Your Host section shows Greg's headshot and bio
- The footer pull-quote line renders
- The standard site footer (with Podcast/Topics/About/Contact links) still appears at the bottom

Open `http://localhost:4321/labs/thank-you` and confirm it renders the confirmation copy with the same minimal header.

Stop the preview server (Ctrl+C) when done.

- [ ] **Step 5: No commit needed** — this task is verification-only. If any check in Steps 1–4 fails, fix the issue in the relevant earlier task's file and re-run this task's checks before proceeding.

---

## Post-Implementation Notes (not part of this plan's scope)

- The real Kit form still needs to be created in Kit (custom field, tags, form itself, welcome automation, link-trigger rule) per `_showrunner/labs-landing-page.md`'s "Kit Setup" section — then `KIT_FORM_ID` in `src/pages/labs.astro` gets swapped from the placeholder to the real ID, and Kit's "Success behavior" setting gets pointed at `/labs/thank-you`.
- The masterclass gate page is a separate, not-yet-built item (`_showrunner/masterclass/critical-path.md`). When it ships, add its cross-link back into `src/pages/labs/thank-you.astro`.
