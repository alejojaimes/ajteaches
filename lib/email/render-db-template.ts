import { getSiteUrl } from './client';

export function renderDbTemplate(
  subject: string,
  bodyHtml: string,
  vars: Record<string, string> = {}
): { subject: string; html: string } {
  let resolvedSubject = subject;
  let resolvedBody = bodyHtml;

  for (const [key, value] of Object.entries(vars)) {
    const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    resolvedSubject = resolvedSubject.replace(placeholder, value);
    resolvedBody = resolvedBody.replace(placeholder, value);
  }

  const siteUrl = getSiteUrl();

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1f2e; background: #fafafa; padding: 32px 24px;">
      <p style="font-size: 14px; font-weight: 600; color: #4f46e5; margin: 0 0 16px;">AJ Teaches</p>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px;">
        <div style="font-size: 15px; line-height: 1.6; color: #1a1f2e;">${resolvedBody}</div>
      </div>
      <p style="font-size: 13px; color: #6b7280; margin: 24px 0 0; text-align: center;">
        — Alejandro Jaimes &middot; <a href="${siteUrl}" style="color: #4f46e5; text-decoration: none;">AJ Teaches</a>
      </p>
    </div>
  `;

  return { subject: resolvedSubject, html };
}
