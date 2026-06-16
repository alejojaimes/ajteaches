import { getEmailTemplates } from '@/lib/actions/email-templates';
import { EmailTemplatesEditor } from '@/components/owner/EmailTemplatesEditor';
import { renderWelcomeEmail } from '@/lib/email/templates/welcome';
import { renderNewsletterOptInEmail } from '@/lib/email/templates/newsletter-optin';

export const PREDEFINED_KEYS = ['welcome', 'newsletter_optin'] as const;
type PredefinedKey = (typeof PREDEFINED_KEYS)[number];

const TEMPLATE_DEFINITIONS = [
  {
    key: 'welcome' as const,
    label: 'Welcome email',
    description: 'Sent when a reader creates an account for the first time.',
    defaultSubject: renderWelcomeEmail({ name: '{{name}}' }).subject,
  },
  {
    key: 'newsletter_optin' as const,
    label: 'Newsletter subscription',
    description: 'Sent when a reader subscribes to the newsletter.',
    defaultSubject: renderNewsletterOptInEmail({ name: '{{name}}' }).subject,
  },
];

export default async function EmailTemplatesPage() {
  const saved = await getEmailTemplates();
  const savedMap = new Map(saved.map((t) => [t.key, t]));

  const predefined = TEMPLATE_DEFINITIONS.map((def) => ({
    key: def.key,
    name: def.label,
    label: def.label,
    description: def.description,
    defaultSubject: def.defaultSubject,
    subject: savedMap.get(def.key)?.subject ?? def.defaultSubject,
    bodyHtml: savedMap.get(def.key)?.bodyHtml ?? '',
    isSaved: savedMap.has(def.key),
  }));

  const custom = saved
    .filter((t) => !PREDEFINED_KEYS.includes(t.key as PredefinedKey))
    .map((t) => ({
      key: t.key,
      name: t.name,
      subject: t.subject,
      bodyHtml: t.bodyHtml,
    }));

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-foreground text-2xl font-bold">Email templates</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customize automated emails and create reusable templates for manual sends. Use{' '}
          <code className="bg-primary-soft text-primary rounded px-1 py-0.5 text-xs">
            {'{{name}}'}
          </code>{' '}
          to insert the reader&apos;s name.
        </p>
      </div>
      <EmailTemplatesEditor predefined={predefined} custom={custom} />
    </div>
  );
}
