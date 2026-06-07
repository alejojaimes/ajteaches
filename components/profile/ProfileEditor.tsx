'use client';

import { useRef, useState } from 'react';
import { updateAuthor } from '@/lib/actions/authors';
import { toWorkEntries, type WorkEntry } from '@/lib/work-entries';
import { FeaturedPostPicker, type FeaturedPostOption } from './FeaturedPostPicker';

type Author = {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  headline: string | null;
  email: string | null;
  website: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  location: string | null;
  roles: string[];
  interests: string[];
  workHistory: unknown;
  featuredPostSlug: string | null;
};

type FeaturedPostSummary = {
  slug: string;
  title: string;
  coverImage: string | null;
  publishedAt: Date | null;
};

type Props = {
  author: Author;
  featuredPost: FeaturedPostSummary | null;
};

const inputClass =
  'border-border bg-background text-foreground w-full rounded-button border px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelClass = 'text-foreground mb-1 block text-sm font-medium';

function ChipField({
  label,
  values,
  onChange,
  placeholder,
  chipClassName,
}: {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  chipClassName: string;
}) {
  const [input, setInput] = useState('');

  const add = (raw: string) => {
    const value = raw.trim().replace(/,/g, '');
    if (!value || values.some((v) => v.toLowerCase() === value.toLowerCase())) return;
    onChange([...values, value]);
  };

  const remove = (value: string) => {
    onChange(values.filter((v) => v !== value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add(input);
      setInput('');
    } else if (e.key === 'Backspace' && input === '' && values.length > 0) {
      const last = values[values.length - 1];
      if (last) remove(last);
    }
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      <div className="border-border bg-background rounded-button flex min-h-[40px] flex-wrap items-center gap-1.5 border px-2 py-1.5">
        {values.map((value) => (
          <span
            key={value}
            className={`rounded-badge flex items-center gap-1 px-2 py-0.5 text-xs ${chipClassName}`}
          >
            {value}
            <button
              type="button"
              onClick={() => remove(value)}
              className="leading-none hover:opacity-70"
              aria-label={`Remove ${value}`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (input.trim()) {
              add(input);
              setInput('');
            }
          }}
          placeholder={values.length === 0 ? placeholder : ''}
          className="text-foreground placeholder:text-muted-foreground min-w-[160px] flex-1 bg-transparent text-sm outline-none"
        />
      </div>
    </div>
  );
}

function WorkHistoryField({
  values,
  onChange,
}: {
  values: WorkEntry[];
  onChange: (next: WorkEntry[]) => void;
}) {
  const update = (index: number, patch: Partial<WorkEntry>) => {
    onChange(values.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  };

  const remove = (index: number) => {
    onChange(values.filter((_, i) => i !== index));
  };

  const add = () => {
    onChange([...values, { role: '', company: '', period: '' }]);
  };

  return (
    <div>
      <label className={labelClass}>Work experience</label>
      <div className="space-y-3">
        {values.map((entry, i) => (
          <div key={i} className="border-border bg-background rounded-button border p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <input
                type="text"
                value={entry.role}
                onChange={(e) => update(i, { role: e.target.value })}
                placeholder="Role"
                className={inputClass}
              />
              <input
                type="text"
                value={entry.company}
                onChange={(e) => update(i, { company: e.target.value })}
                placeholder="Company"
                className={inputClass}
              />
              <input
                type="text"
                value={entry.period}
                onChange={(e) => update(i, { period: e.target.value })}
                placeholder="e.g. Feb 2026 — Present"
                className={inputClass}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="text-muted-foreground hover:text-destructive mt-2 text-xs font-medium"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="border-border text-muted-foreground hover:border-primary hover:text-primary rounded-button mt-3 w-full border border-dashed px-3 py-2 text-sm transition-colors"
      >
        + Add work experience
      </button>
      <p className="text-muted-foreground mt-1 text-xs">
        Shown as a timeline on your About page, in this order.
      </p>
    </div>
  );
}

export function ProfileEditor({ author, featuredPost }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(author.avatar);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [name, setName] = useState(author.name);
  const [bio, setBio] = useState(author.bio ?? '');
  const [headline, setHeadline] = useState(author.headline ?? '');
  const [email, setEmail] = useState(author.email ?? '');
  const [location, setLocation] = useState(author.location ?? '');
  const [website, setWebsite] = useState(author.website ?? '');
  const [githubUrl, setGithubUrl] = useState(author.githubUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(author.linkedinUrl ?? '');
  const [roles, setRoles] = useState<string[]>(author.roles);
  const [interests, setInterests] = useState<string[]>(author.interests);
  const [workHistory, setWorkHistory] = useState<WorkEntry[]>(() =>
    toWorkEntries(author.workHistory)
  );
  const [featuredPostSlug, setFeaturedPostSlug] = useState<string | null>(author.featuredPostSlug);
  const [featuredPostPreview, setFeaturedPostPreview] = useState<FeaturedPostSummary | null>(
    featuredPost
  );
  const [pickerOpen, setPickerOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSelectFeaturedPost = (post: FeaturedPostOption) => {
    setFeaturedPostSlug(post.slug);
    setFeaturedPostPreview(post);
  };

  const handleRemoveFeaturedPost = () => {
    setFeaturedPostSlug(null);
    setFeaturedPostPreview(null);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    setUploadError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('scope', 'avatar');
      const res = await fetch('/api/upload', { method: 'POST', body: form });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? 'Upload failed');
      }
      const { url } = (await res.json()) as { url: string };
      setAvatar(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await updateAuthor({
        name,
        bio,
        headline,
        email,
        location,
        website,
        githubUrl,
        linkedinUrl,
        roles,
        interests,
        workHistory,
        featuredPostSlug,
        ...(avatar && avatar !== author.avatar ? { avatar } : {}),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <div className="space-y-5">
        {/* Avatar */}
        <div>
          <label className={labelClass}>Avatar</label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="group relative h-16 w-16 shrink-0 overflow-hidden rounded-full disabled:opacity-60"
              aria-label="Change avatar"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                <div className="bg-primary flex h-full w-full items-center justify-center">
                  <span className="text-lg font-bold text-white">aj</span>
                </div>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-[10px] font-medium text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                {uploading ? '...' : 'Change'}
              </span>
            </button>
            <div className="text-muted-foreground text-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="text-primary hover:text-primary-hover font-medium disabled:opacity-60"
              >
                {uploading ? 'Uploading…' : 'Upload new photo'}
              </button>
              <p className="mt-0.5">JPG or PNG, square images work best.</p>
              {uploadError && <p className="text-destructive mt-0.5">{uploadError}</p>}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => void handleAvatarChange(e)}
            className="hidden"
          />
        </div>

        {/* Name */}
        <div>
          <label className={labelClass}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {/* Headline */}
        <div>
          <label className={labelClass}>Headline</label>
          <input
            type="text"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="e.g. MSc in Data Science & Systems Engineering"
            className={inputClass}
          />
          <p className="text-muted-foreground mt-1 text-xs">
            A short professional title shown under your name on your About page.
          </p>
        </div>

        {/* Bio */}
        <div>
          <label className={labelClass}>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className={inputClass}
          />
        </div>

        {/* Email */}
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="hello@ajteaches.dev"
            className={inputClass}
          />
        </div>

        {/* Location */}
        <div>
          <label className={labelClass}>Location</label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={inputClass}
          />
        </div>

        {/* Website */}
        <div>
          <label className={labelClass}>Website</label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* GitHub URL */}
        <div>
          <label className={labelClass}>GitHub</label>
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            placeholder="https://github.com/..."
            className={inputClass}
          />
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className={labelClass}>LinkedIn</label>
          <input
            type="text"
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={inputClass}
          />
        </div>

        {/* Roles */}
        <ChipField
          label="Roles"
          values={roles}
          onChange={setRoles}
          placeholder="Add roles (press Enter or comma)…"
          chipClassName="bg-primary-soft text-primary"
        />

        {/* Interests */}
        <ChipField
          label="Interests"
          values={interests}
          onChange={setInterests}
          placeholder="Add interests (press Enter or comma)…"
          chipClassName="bg-accent/10 text-accent"
        />

        {/* Work history */}
        <WorkHistoryField values={workHistory} onChange={setWorkHistory} />

        {/* Featured post */}
        <div>
          <label className={labelClass}>Featured post</label>
          {featuredPostPreview ? (
            <div className="border-border bg-background rounded-button flex items-center gap-3 border px-3 py-2">
              {featuredPostPreview.coverImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredPostPreview.coverImage}
                  alt=""
                  className="h-10 w-14 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="bg-primary-soft h-10 w-14 shrink-0 rounded-md" />
              )}
              <p className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                {featuredPostPreview.title}
              </p>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="text-primary hover:text-primary-hover shrink-0 text-xs font-medium"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveFeaturedPost}
                className="text-muted-foreground hover:text-destructive shrink-0 text-xs font-medium"
              >
                Remove
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="border-border bg-background text-muted-foreground hover:border-primary hover:text-primary rounded-button w-full border border-dashed px-3 py-2.5 text-sm transition-colors"
            >
              + Choose a post to feature on your About page
            </button>
          )}
          <p className="text-muted-foreground mt-1 text-xs">
            Shown on your public About page as a sample of your writing.
          </p>
        </div>
      </div>

      <FeaturedPostPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleSelectFeaturedPost}
      />

      <div className="mt-7">
        <button
          type="submit"
          disabled={saving}
          className={`rounded-button px-6 py-2 text-sm font-medium text-white transition-colors ${
            saved ? 'bg-emerald-500' : 'bg-primary hover:bg-primary-hover'
          } disabled:opacity-60`}
        >
          {saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>
    </form>
  );
}
