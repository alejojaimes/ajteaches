type Props = {
  src: string | null;
  alt: string;
  className?: string;
  compact?: boolean;
  position?: string | null;
};

export function CoverImage({ src, alt, className = '', compact = false, position }: Props) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={className}
        style={position ? { objectPosition: position } : undefined}
      />
    );
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
