import nodemailer from 'nodemailer';

type EmailConfig = {
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
};

type ResendConfig = {
  apiKey: string;
  from: string;
};

const loadSmtpConfig = (): EmailConfig => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 0);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM;

  if (!host || !port || !user || !pass || !from) {
    throw new Error('SMTP configuration missing');
  }

  return { host, port, user, pass, from };
};

const loadResendConfig = (): ResendConfig | null => {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!apiKey || !from) {
    return null;
  }
  return { apiKey, from };
};

const sendWithResend = async (to: string, subject: string, text: string, html: string) => {
  const config = loadResendConfig();
  if (!config) {
    throw new Error('Resend configuration missing');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config.from,
      to,
      subject,
      text,
      html,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend error: ${response.status} ${errorText}`);
  }
};

const sendWithSmtp = async (to: string, subject: string, text: string, html: string) => {
  const config = loadSmtpConfig();
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });

  await transporter.sendMail({
    from: config.from,
    to,
    subject,
    text,
    html,
  });
};

export async function sendVerificationEmail(email: string, code: string): Promise<void> {
  const subject = 'Code de verification - ULTEAM PSG-X';
  const text = `Ton code de verification est : ${code}\nCe code expire dans 30 minutes.`;
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Code de verification</h2>
      <p>Ton code de verification est :</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 2px;">${code}</p>
      <p>Ce code expire dans 30 minutes.</p>
    </div>
  `;
  const resendConfig = loadResendConfig();
  if (resendConfig) {
    await sendWithResend(email, subject, text, html);
    return;
  }
  await sendWithSmtp(email, subject, text, html);
}

export async function sendSubscriptionEmail(email: string): Promise<void> {
  const subject = 'Inscription alertes match';
  const text = 'Merci pour ton inscription. Tu recevras nos alertes matchday.';
  const html = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2>Inscription confirmee</h2>
      <p>Merci pour ton inscription. Tu recevras nos alertes matchday.</p>
    </div>
  `;
  const resendConfig = loadResendConfig();
  if (resendConfig) {
    await sendWithResend(email, subject, text, html);
    return;
  }
  await sendWithSmtp(email, subject, text, html);
}
