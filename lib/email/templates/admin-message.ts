type AdminMessageEmailData = {
  subject: string;
  messageHtml: string;
  authorName: string;
  vars?: Record<string, string>;
};

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function applyVars(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
  }
  return result;
}

export function renderAdminMessageEmail(data: AdminMessageEmailData): {
  subject: string;
  html: string;
} {
  const vars = data.vars ?? {};
  const subject = applyVars(data.subject, vars);
  const messageHtml = applyVars(data.messageHtml, vars);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 560px; margin: 0 auto; color: #1a1f2e; background: #fafafa; padding: 32px 24px;">
      <p style="font-size: 14px; font-weight: 600; color: #4f46e5; margin: 0 0 16px;">AJ Teaches</p>
      <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; padding: 24px;">
        <h1 style="font-size: 20px; line-height: 1.3; margin: 0 0 16px; color: #1a1f2e;">${esc(subject)}</h1>
        <div style="font-size: 15px; line-height: 1.6; color: #1a1f2e; margin: 0 0 20px;">${messageHtml}</div>
        <p style="font-size: 14px; color: #6b7280; margin: 0;">— ${esc(data.authorName)}</p>
      </div>
    </div>
  `;

  return { subject, html };
}
