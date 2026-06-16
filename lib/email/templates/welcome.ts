import { getSiteUrl } from '../client';

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

type WelcomeEmailData = {
  name: string;
};

export function renderWelcomeEmail(data: WelcomeEmailData): { subject: string; html: string } {
  const siteUrl = getSiteUrl();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1f2e; background: #fafafa; padding: 32px 24px;">
      <p style="font-size: 14px; font-weight: 600; color: #4f46e5; margin: 0 0 16px;">AJ Teaches</p>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px;">
        <h1 style="font-size: 22px; line-height: 1.3; margin: 0 0 12px; color: #1a1f2e;">Welcome, ${esc(data.name)} 👋</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #1a1f2e; margin: 0 0 8px;">
          Your account is ready. You can now like posts, leave comments, and save articles to read later.
        </p>
        <p style="font-size: 15px; line-height: 1.6; color: #1a1f2e; margin: 0 0 24px;">
          If you enjoy the content, consider subscribing to get notified whenever I publish something new.
        </p>
        <a href="${siteUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
          Explore posts
        </a>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 24px 0 0; text-align: center;">
        — Alejandro Jaimes · <a href="${siteUrl}" style="color: #4f46e5; text-decoration: none;">AJ Teaches</a>
      </p>
    </div>
  `;

  return { subject: `Welcome to AJ Teaches, ${data.name}!`, html };
}
