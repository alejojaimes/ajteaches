type Props = {
  src: string | null;
  alt: string;
  className?: string;
  compact?: boolean;
};

export function CoverImage({ src, alt, className = '', compact = false }: Props) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} className={className} />;
  }

  return (
    <div className={`bg-primary flex items-center justify-center ${className}`}>
      <span
        className={`font-bold tracking-tight text-white ${compact ? 'text-xs' : 'text-lg sm:text-2xl'}`}
      >
        {compact ? 'aj' : 'aj teaches'}
      </span>
    </div>
  );
}
