# Retired — the Leadership Labs

Moved out of `src/pages/` on 2026-09-07 so Astro stops building the routes.
Nothing here is deleted: if the Labs ever come back, move the four files back
to `src/pages/labs.astro`, `src/pages/labs/`, and `src/lib/lab-schedule.ts`,
and drop the `/labs` redirects from `public/_redirects`.

**Why:** the Leadership Labs were dropped on 2026-09-07 — Lab #1 drew 3
registrations and 0 attendees, and the show-notes footer produced 7 masterclass
clicks against 0 Labs clicks from identical placement. Full reasoning in
`podcast-studio/_showrunner/business-plan-introvert-army-v2.md`.

`/labs`, `/labs/thank-you` and `/labs/feedback-thank-you` now 301 to
`/masterclass` via `public/_redirects`. They must never 404 — the URL is in the
show-notes footer of all 81 podcast episodes, in published YouTube
descriptions, and in already-sent Kit emails.

The `.labs-*` rules in `src/styles/global.css` are **deliberately kept** —
`masterclass.astro` reuses `.labs-hero` and `.labs-next-reminder`.

`public/downloads/lab-1-identity.ics` is also kept: anyone who added the event
already has a private copy, and the URL may still be referenced in old email.
