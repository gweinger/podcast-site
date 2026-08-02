// Single source of truth for Lab #1's date/time, shared by labs.astro (the
// Upcoming Sessions table) and labs/thank-you.astro (the add-to-calendar
// links). Kit email copy (kit-welcome-emails.md, pasted manually into Kit)
// must be updated by hand when this changes — Kit has no build step to read
// this file.
//
// TODO once Zoom Pro is bought and the Lab #1 meeting exists: replace
// DETAILS' "join link emailed before the session" with the real Zoom link,
// rebuild, and regenerate public/downloads/lab-1-identity.ics (anyone who
// already added it to their calendar keeps the old static copy — a known
// limitation of static .ics files).

export const LAB1 = {
  title: 'Leadership Lab #1 — Identity',
  dateLabel: 'Friday, August 28, 2026',
  timeLabel: '8:00am PT / 11:00am ET',
  // UTC instants — Aug 28 2026 falls in PDT (UTC-7).
  startUTC: '20260828T150000Z',
  endUTC: '20260828T160000Z',
  location: 'Online — join link emailed before the session',
  details:
    "Free live session for introverted leaders. Bring a real situation and we'll work through it together. Join link emailed before the session. Details: https://gweinger.com/labs",
  icsUrl: '/downloads/lab-1-identity.ics',
};

export function googleCalendarUrl(event: typeof LAB1): string {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${event.startUTC}/${event.endUTC}`,
    details: event.details,
    location: event.location,
    ctz: 'America/Los_Angeles',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
