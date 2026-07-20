# Leadership Labs Landing Page — Design

## Purpose

Build `/labs` on gweinger.com: the single conversion point for the masterclass CTA and the spoken URL for the Leadership Labs (free monthly live sessions). Also add short-URL redirects so the spoken/typed URLs land on it.

Source of truth for copy and Kit/email setup: `_showrunner/labs-landing-page.md` (podcast-studio repo). This spec covers only what's built in the `podcast-site` repo.

## Pages

### `src/pages/labs.astro`
Main landing page, built with the `Base` layout.

- **Meta**: title `Leadership Labs — Free Live Sessions for Introverted Leaders | Greg Weinger`, description from the source doc's Page meta block.
- **Sections, in order**: Hero (with CTA anchored to the form), The Four Topics, Upcoming Sessions table, How It Works, Signup Form, About Your Host, Footer line — copy taken verbatim from `_showrunner/labs-landing-page.md`.
- **Upcoming Sessions table** ships with the draft dates already in the source doc (Lab #1 Aug 20, 2026 / #2–#4 TBD months). This is content only — no date logic. A future edit updates this table after each Lab per the doc's "Evergreen rule."
- **One page, one action**: no site nav links above the form, consistent with the source doc's production notes.
- **Styling**: this codebase has no scoped `<style>` blocks anywhere — every page uses shared utility classes defined in `src/styles/global.css`. New labs-specific classes (topics grid, sessions table, host section) get added to `global.css` under a clearly labeled banner comment, following the existing pattern (see `.hero`, `.card`, `.platform-buttons`, etc.). No new component files needed for a single-page build like this.

### `src/pages/labs/thank-you.astro`
Confirmation page. Copy from the source doc's "Confirmation / Thank-You Copy" section. Links to `/masterclass` (placeholder — that page doesn't exist yet in this repo; the link will 404 until it ships separately, which is expected and acceptable for this build).

## Signup Form

No client-side JavaScript. A plain native HTML form POSTs directly to Kit's public subscription endpoint:

```html
<form method="post" action="https://app.kit.com/forms/REPLACE_WITH_KIT_FORM_ID/subscriptions">
  <input type="email" name="email_address" required>
  <input type="text" name="fields[leadership_challenge]">
  <button type="submit">Sign me up</button>
</form>
```

- `REPLACE_WITH_KIT_FORM_ID` is a placeholder constant in `labs.astro`, with a comment pointing to the "Kit Setup" section of `_showrunner/labs-landing-page.md` for the steps to create the real form (custom field, tags, automations, form itself).
- A native form POST degrades-without-JS by construction — no fetch, no error-state handling needed. This is simpler than mirroring `contact.astro`'s fetch-based pattern and satisfies the source doc's "must degrade without JavaScript" requirement directly.
- Redirect-to-thank-you-page on success happens via Kit's own "Success behavior" dashboard setting (Kit Setup step 3 in the source doc), not via code. Once the real Kit form exists and that setting points to `/labs/thank-you`, the flow works with zero further code changes.
- `leadership_challenge` field is optional (no `required` attribute) per the source doc.

## Out of Scope

Everything in the source doc's "Kit Setup" section (custom field, tags, form creation, welcome automation, link-trigger rule, segments, per-Lab broadcast rhythm, end-to-end test) is dashboard/email config to be done directly in Kit — not code in this repo. This build's only obligation to that system is the placeholder form ID and action URL wired correctly so the real form ID is a one-line swap.

## Redirects

`public/_redirects` (same 301 pattern already used for the existing `/il/<n>` entries):

```
/leaderlabs /labs 301
/leader-labs /labs 301
```

`/leadershiplabs` is explicitly dropped — not built.

## Testing

No test suite coverage needed — this is static content + a plain HTML form with no logic to unit test. Verification is manual: run `npm run dev` (or `astro dev`), visit `/labs`, confirm layout/copy renders and matches source doc section-by-section, confirm `/leaderlabs` and `/leader-labs` 301 to `/labs` (redirects only take effect in a Pages/Wrangler preview or production, not plain `astro dev` — verify via `wrangler pages dev` or after deploy), visit `/labs/thank-you` directly to confirm it renders.
