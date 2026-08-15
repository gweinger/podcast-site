# /labs — bottom-of-page feedback form for non-converters

_2026-08-15_

## Problem

The Aug 11 re-marketing broadcast sent 12 clicks to `/labs`, converting to only 1 Lab registration. Investigation (this session) ruled out technical breakage — the form and redirect both work end-to-end. Two live theories remain: the topic (Identity) isn't the most compelling opener, or something about the page/ask itself is putting people off. Both are currently guesses. Rather than keep inferring from click/engagement numbers, ask directly: give visitors who don't sign up a low-friction way to say why, and — if they're willing — leave an email for future Labs on other topics.

## Design

**Placement**: a new, always-visible section on `/labs`, directly after the existing "Join the next free Lab" repeat CTA (`.labs-bottom-cta`) and before "About Your Host." No JS, no click-to-reveal — same zero-JS pattern as the rest of the page.

**Heading**: "Can't make Lab #1?"

**Form fields**:
1. Reason — radio buttons, single-select:
   - The topic doesn't interest me
   - The time doesn't work for me
   - I'd rather watch the recording than attend live
   - Just not for me right now
   - Something else
2. Email address — same field convention as the other Kit forms on this site (`name="email_address"`, `required` — both because Kit's subscription mechanism needs it and to match every other form on the site).
3. Submit button: "Send feedback"

Reason is required (`required` on the radio group) — a feedback submission with no reason selected isn't useful data.

**Submission target**: a new Kit embed form (Greg creates manually in Kit's UI — no API path exists to create embed forms). Raw HTML `<form method="post" action="https://app.kit.com/forms/<FORM_ID>/subscriptions">`, same pattern as the existing Labs and masterclass forms. Reason maps to the custom field `labs_feedback_reason` (already created via API, id `1339845`, key `labs_feedback_reason`) — Greg maps this field to the 5 options when building the form in Kit.

**Success behavior**: Kit's built-in "Show a success message" (not a redirect) — this is a secondary path, doesn't need its own thank-you page.

**Dependency**: blocked on Greg creating the form in Kit and sending back its numeric form ID before the page can be wired up. Everything else (custom field, copy, layout) is ready ahead of that.

**Data usage**: no tag applied at submission — reason lives as a custom field value on whichever subscriber submits it, queryable via Kit MCP the same way `leadership_challenge` was pulled earlier in this session. Tag-based segmentation (e.g., for a future "notify these people about Lab #2") can be added later if the response volume justifies it — not built now (YAGNI).

## CSS

New rules alongside the existing `.labs-*` block in `global.css`:
- `.labs-feedback-form` — form layout, reuses `.contact-form` / `.form-field` conventions already established on this page.
- Radio group styling — new, since no existing radio-button pattern exists on the site yet (all other forms use text/email inputs only).

## Out of scope

- Live Kit API sync from a custom backend — rejected in favor of the native Kit-form approach (no new worker/deploy surface).
- Tag-based automation on submission (e.g., auto-adding to a "future Labs" segment) — can be layered in later without changing the form itself.
- Any change to the primary hero/signup form above this section.
