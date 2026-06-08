'use client';

import { useRef, useState } from 'react';
import { updateReaderProfile } from '@/lib/actions/readers';
import { getInitials } from '@/lib/utils';

type Reader = {
  name: string;
  githubUrl: string | null;
  phone: string | null;
  bio: string | null;
  avatar: string | null;
};

type Props = {
  reader: Reader;
};

const inputClass =
  'border-border bg-background text-foreground w-full rounded-button border px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelClass = 'text-foreground mb-1 block text-sm font-medium';

export function ReaderProfileForm({ reader }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(reader.avatar);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [name, setName] = useState(reader.name);
  const [githubUrl, setGithubUrl] = useState(reader.githubUrl ?? '');
  const [phone, setPhone] = useState(reader.phone ?? '');
  const [bio, setBio] = useState(reader.bio ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

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
      await updateReaderProfile({
        name,
        githubUrl,
        phone,
        bio,
        ...(avatar && avatar !== reader.avatar ? { avatar } : {}),
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
                  <span className="text-lg font-bold text-white">{getInitials(name)}</span>
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
            className="hidden"
            onChange={(e) => void handleAvatarChange(e)}
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

        {/* Bio */}
        <div>
          <label className={labelClass}>Description</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us a bit about yourself…"
            rows={3}
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

        {/* Phone */}
        <div>
          <label className={labelClass}>Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 0100"
            className={inputClass}
          />
        </div>
      </div>

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
