// Single source of truth for Lab #1's date/time, shared by labs.astro (the
// Upcoming Sessions table) and labs/thank-you.astro (the add-to-calendar
// links). Kit email copy (kit-welcome-emails.md, pasted manually into Kit)
// must be updated by hand when this changes — Kit has no build step to read
// this file.
//
// public/downloads/lab-1-identity.ics is a static file that duplicates
// `location` and `details` below — update it by hand whenever either
// changes. Anyone who already added the event to their calendar keeps the
// old static copy; a known limitation of static .ics files.
//
// NOTE: the join link and passcode below are served publicly (the .ics URL
// is fetchable by anyone). Accepted for Lab #1; revisit if a session ever
// needs to be gated.

export const LAB1 = {
  title: 'Leadership Lab #1 — Identity',
  dateLabel: 'Friday, August 28, 2026',
  timeLabel: '8:00am PT / 11:00am ET',
  // UTC instants — Aug 28 2026 falls in PDT (UTC-7).
  startUTC: '20260828T150000Z',
  endUTC: '20260828T160000Z',
  location:
    'https://us05web.zoom.us/j/83336139466?pwd=e4rmblbrsiXATU7lPYOKBRzkVXpYgf.1',
  details:
    "Free live session for introverted leaders. Bring a real situation and we'll work through it together.\n\nJoin Zoom Meeting: https://us05web.zoom.us/j/83336139466?pwd=e4rmblbrsiXATU7lPYOKBRzkVXpYgf.1\nMeeting ID: 833 3613 9466\nPasscode: 905676\n\nDetails: https://gweinger.com/labs",
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
