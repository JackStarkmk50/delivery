import nodemailer from 'nodemailer';

export async function sendMail(to: string, subject: string, text: string) {
  const host = process.env.SMTP_HOST ?? (process.env.NODE_ENV === 'production' ? undefined : '127.0.0.1');
  if (!host || !process.env.MAIL_FROM) throw new Error('SMTP is not configured.');
  const port = Number(process.env.SMTP_PORT ?? 1025);
  const transport = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? '' } : undefined,
    connectionTimeout: 5000,
  });
  await transport.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
}
