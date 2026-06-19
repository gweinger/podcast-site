import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext/browser';

interface Env {
  SEND_EMAIL: SendEmail;
}

const json = (body: unknown, status = 200) =>
  Response.json(body, { status });

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method !== 'POST') {
      return json({ ok: false, error: 'Method not allowed.' }, 405);
    }

    try {
      const form = await request.formData();
      const name = String(form.get('name') ?? '').trim();
      const email = String(form.get('email') ?? '').trim();
      const message = String(form.get('message') ?? '').trim();

      if (!name || !email || !message) {
        return json({ ok: false, error: 'All fields are required.' }, 400);
      }
      if (!email.includes('@')) {
        return json({ ok: false, error: 'Invalid email address.' }, 400);
      }

      const msg = createMimeMessage();
      msg.setSender({ name: 'gweinger.com contact form', addr: 'contact@gweinger.com' });
      msg.setRecipient('gweinger@gmail.com');
      msg.setSubject(`Contact form: ${name}`);
      msg.addMessage({
        contentType: 'text/plain',
        data: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      });

      // mimetext won't set Reply-To via its API, so inject it into the raw MIME.
      // Strip CR/LF from form input first to prevent header injection.
      const raw = msg.asRaw();
      const eol = raw.includes('\r\n') ? '\r\n' : '\n';
      const replyTo = `${name} <${email}>`.replace(/[\r\n]/g, ' ');
      const rawWithReplyTo = `Reply-To: ${replyTo}${eol}${raw}`;

      const emailMessage = new EmailMessage(
        'contact@gweinger.com',
        'gweinger@gmail.com',
        rawWithReplyTo,
      );
      await env.SEND_EMAIL.send(emailMessage);

      return json({ ok: true });
    } catch (err) {
      console.error('Contact worker error:', err);
      return json({ ok: false, error: 'Failed to send. Please try again.' }, 500);
    }
  },
};
