type Attachment = {
  id: string;
  url: string;
  filename: string;
  sizeBytes: number;
};

type Props = {
  attachments: Attachment[];
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentList({ attachments }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="border-border bg-card mb-8 rounded-xl border p-4">
      <p className="text-foreground mb-2 text-sm font-semibold">Tutorial files</p>
      <ul className="space-y-1.5">
        {attachments.map((attachment) => (
          <li key={attachment.id}>
            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              download={attachment.filename}
              className="text-primary hover:text-primary-hover flex items-center justify-between gap-2 text-sm"
            >
              <span className="min-w-0 truncate">{attachment.filename}</span>
              <span className="text-muted-foreground shrink-0 text-xs">
                {formatFileSize(attachment.sizeBytes)}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
