import { EmailMessage } from 'cloudflare:email';

interface Env {
  SEND_EMAIL: SendEmail;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const name    = String(formData.get('name')    ?? '').trim();
    const email   = String(formData.get('email')   ?? '').trim();
    const message = String(formData.get('message') ?? '').trim();

    if (!name || !email || !message) {
      return Response.json({ ok: false, error: 'All fields are required.' }, { status: 400 });
    }
    if (!email.includes('@')) {
      return Response.json({ ok: false, error: 'Invalid email address.' }, { status: 400 });
    }

    const raw = [
      `From: contact@gweinger.com`,
      `To: gweinger@gmail.com`,
      `Reply-To: "${name}" <${email}>`,
      `Subject: Contact: ${name}`,
      `MIME-Version: 1.0`,
      `Content-Type: text/plain; charset=utf-8`,
      ``,
      `Name: ${name}`,
      `Email: ${email}`,
      ``,
      message,
    ].join('\r\n');

    const { readable, writable } = new TransformStream<Uint8Array>();
    const writer = writable.getWriter();
    await writer.write(new TextEncoder().encode(raw));
    await writer.close();

    const msg = new EmailMessage('contact@gweinger.com', 'gweinger@gmail.com', readable);
    await context.env.SEND_EMAIL.send(msg);

    return Response.json({ ok: true });
  } catch (err) {
    console.error('Contact form error:', err);
    return Response.json({ ok: false, error: 'Failed to send. Please try again.' }, { status: 500 });
  }
};
