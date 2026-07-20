# /labs hero redesign — surface the next session, trim the copy

_2026-07-20_

## Problem

The `/labs` hero (`src/pages/labs.astro`) is four paragraphs of scene-setting before the CTA, and the CTA ("Join the next Lab →") gives no indication of *when* the next Lab actually is — that only appears in the Upcoming Sessions table, well below the fold. Someone who clicks the button lands on the signup form with the same problem: no date in view.

## Design

**Hero copy** — cut to:
1. `<h1>The Leadership Labs</h1>`
2. Existing lead sentence (unchanged): "Free live sessions for introverted leaders — bring your real challenges, and we'll work through them together."
3. One keeper line, rewritten to drop the "Finally, a place where…" opener (stock landing-page phrasing, at odds with brand-voice.md's warning against performative/hype-driven copy): **"Quiet leadership is the starting point here, not the problem."**

Removed entirely: the "Once a month, I host…" paragraph and "It's free. It's live." — both are redundant with the How It Works section further down the page.

**Next Lab card** — new element in the hero, replacing the bare CTA button:
```
NEXT LAB · #1 · IDENTITY
Thursday, August 20, 2026 · 9:00am PT / 12:00pm ET
[Join the next Lab →]
```
- Registration is open now (not "opens soon" — the Kit form is live), so the card carries no separate status label, just the CTA.
- The button keeps its current behavior: anchor link to `#signup`.

**Shared data source** — hoist the four Lab sessions (number, topic, date, status) into a small array in the frontmatter of `labs.astro`. The Next Lab card reads session `[0]`; the existing Upcoming Sessions table maps over the same array. This replaces today's hardcoded `<tr>` rows and the card, so the date/topic can't drift out of sync between the two.

**Signup section (`#signup`)** — add one line above the form restating the next session, for anyone who jumps straight there via the anchor without reading the hero: "Next Lab: Identity — Thursday, August 20, 2026." Sourced from the same array, session `[0]`.

**Everything else unchanged**: The Four Topics, full Upcoming Sessions table, How It Works, About Your Host, pull quote.

## CSS

New rule for the Next Lab card under the existing `.labs-hero` block in `global.css` (card styling: bordered/tinted box, label + date line, button). No changes to existing `.labs-sessions-table` or `.labs-hero-cta` styling beyond what the new markup requires.

## Out of scope

- The `/masterclass` funnel link on this page (tracked separately — [[project_masterclass_preroll_link]] memory note; the Visibility topic card's masterclass reference is left as-is for now).
- Any change to the Kit form fields or submission behavior.
