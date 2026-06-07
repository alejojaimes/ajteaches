'use client';

import { useState } from 'react';
import { updateReaderProfile } from '@/lib/actions/readers';

type Reader = {
  name: string;
  githubUrl: string | null;
  phone: string | null;
};

type Props = {
  reader: Reader;
};

const inputClass =
  'border-border bg-background text-foreground w-full rounded-button border px-3 py-2 text-sm focus:border-primary focus:outline-none';
const labelClass = 'text-foreground mb-1 block text-sm font-medium';

export function ReaderProfileForm({ reader }: Props) {
  const [name, setName] = useState(reader.name);
  const [githubUrl, setGithubUrl] = useState(reader.githubUrl ?? '');
  const [phone, setPhone] = useState(reader.phone ?? '');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await updateReaderProfile({ name, githubUrl, phone });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={(e) => void handleSubmit(e)}>
      <div className="space-y-5">
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
