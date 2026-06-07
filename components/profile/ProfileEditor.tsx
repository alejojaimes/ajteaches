'use client';

import { useState } from 'react';
import { updateAuthor } from '@/lib/actions/authors';

type Author = {
  id: string;
  name: string;
  username: string | null;
  avatar: string | null;
  bio: string | null;
  email: string | null;
  website: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  location: string | null;
  roles: string[];
};

type Props = {
  author: Author;
};

export function ProfileEditor({ author }: Props) {
  const [name, setName] = useState(author.name);
  const [bio, setBio] = useState(author.bio ?? '');
  const [location, setLocation] = useState(author.location ?? '');
  const [website, setWebsite] = useState(author.website ?? '');
  const [githubUrl, setGithubUrl] = useState(author.githubUrl ?? '');
  const [linkedinUrl, setLinkedinUrl] = useState(author.linkedinUrl ?? '');
  const [roles, setRoles] = useState<string[]>(author.roles);
  const [roleInput, setRoleInput] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const addRole = (raw: string) => {
    const role = raw.trim().replace(/,/g, '');
    if (!role || roles.some((r) => r.toLowerCase() === role.toLowerCase())) return;
    setRoles((prev) => [...prev, role]);
  };

  const removeRole = (role: string) => {
    setRoles((prev) => prev.filter((r) => r !== role));
  };

  const handleRoleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRole(roleInput);
      setRoleInput('');
    } else if (e.key === 'Backspace' && roleInput === '' && roles.length > 0) {
      const last = roles[roles.length - 1];
      if (last) removeRole(last);
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
        location,
        website,
        githubUrl,
        linkedinUrl,
        roles,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'border-border bg-background text-foreground w-full rounded-button border px-3 py-2 text-sm focus:border-primary focus:outline-none';
  const labelClass = 'text-foreground mb-1 block text-sm font-medium';

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
        <div>
          <label className={labelClass}>Roles</label>
          <div className="border-border bg-background rounded-button flex min-h-[40px] flex-wrap items-center gap-1.5 border px-2 py-1.5">
            {roles.map((role) => (
              <span
                key={role}
                className="bg-primary-soft text-primary rounded-badge flex items-center gap-1 px-2 py-0.5 text-xs"
              >
                {role}
                <button
                  type="button"
                  onClick={() => removeRole(role)}
                  className="hover:text-primary/70 leading-none"
                  aria-label={`Remove role ${role}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={roleInput}
              onChange={(e) => setRoleInput(e.target.value)}
              onKeyDown={handleRoleKeyDown}
              onBlur={() => {
                if (roleInput.trim()) {
                  addRole(roleInput);
                  setRoleInput('');
                }
              }}
              placeholder={roles.length === 0 ? 'Add roles (press Enter or comma)…' : ''}
              className="text-foreground placeholder:text-muted-foreground min-w-[160px] flex-1 bg-transparent text-sm outline-none"
            />
          </div>
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
