'use client';

import { useState, useRef, useEffect } from 'react';

type Props = { postId: string };

export function ShareDraftButton({ postId }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.select();
  }, [open, url]);

  const handleShare = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/share/${postId}`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed');
      const data = (await res.json()) as { url: string };
      setUrl(data.url);
      setOpen(true);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={open ? () => setOpen(false) : handleShare}
        disabled={loading}
        className="text-muted-foreground hover:text-foreground border-border rounded-button border px-3 py-1.5 text-xs transition-colors disabled:opacity-50"
      >
        {loading ? 'Generating…' : 'Share Draft'}
      </button>

      {open && url && (
        <div className="border-border bg-card absolute top-full right-0 z-20 mt-2 w-80 rounded-xl border p-3 shadow-lg">
          <p className="text-foreground mb-2 text-xs font-medium">
            Anyone with this link can view the draft (expires in 2 days)
          </p>
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              readOnly
              value={url}
              className="border-border text-muted-foreground min-w-0 flex-1 rounded-md border px-2 py-1 text-xs outline-none"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={handleCopy}
              className={`rounded-button shrink-0 px-2.5 py-1 text-xs font-medium transition-all ${
                copied
                  ? 'border border-emerald-500 bg-emerald-50 text-emerald-600'
                  : 'bg-primary text-white hover:opacity-90'
              }`}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground mt-2 text-xs hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
