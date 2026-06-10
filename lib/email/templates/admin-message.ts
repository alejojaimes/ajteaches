type AdminMessageEmailData = {
  subject: string;
  message: string;
  authorName: string;
};

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderAdminMessageEmail(data: AdminMessageEmailData): {
  subject: string;
  html: string;
} {
  const bodyHtml = esc(data.message).replace(/\n/g, '<br />');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1f2e; background: #fafafa; padding: 32px 24px;">
      <p style="font-size: 14px; font-weight: 600; color: #4f46e5; margin: 0 0 16px;">AJ Teaches</p>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px;">
        <h1 style="font-size: 20px; line-height: 1.3; margin: 0 0 16px; color: #1a1f2e;">${esc(data.subject)}</h1>
        <p style="font-size: 15px; line-height: 1.6; color: #1a1f2e; margin: 0 0 20px;">${bodyHtml}</p>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">— ${esc(data.authorName)}</p>
      </div>
    </div>
  `;

  return { subject: data.subject, html };
}
