# gweinger-contact Worker

Handles the site contact form. Standalone Worker (not a Pages Function — Pages
Functions can't use the `send_email` binding) routed at `gweinger.com/api/contact`.

- Receives the form POST, builds a MIME message (mimetext **browser** build),
  and sends via Cloudflare Email Routing's `SEND_EMAIL` binding to the verified
  destination `gweinger@gmail.com`.
- Reply-To is injected into the raw MIME (mimetext's API rejects Reply-To);
  form input is CRLF-stripped to prevent header injection.

## Deploy
```bash
cd workers/contact
npm install
./node_modules/.bin/wrangler deploy   # requires `wrangler login` once
```

## Prerequisites (one-time, already done)
- Email Routing enabled on gweinger.com
- `gweinger@gmail.com` verified as a destination address
