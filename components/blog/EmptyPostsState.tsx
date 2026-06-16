'use client';

export function EmptyPostsState({ query }: { query?: string }) {
  if (query) {
    return (
      <div className="col-span-3 flex flex-col items-center py-20 text-center">
        <div className="text-muted-foreground mb-4 text-4xl">🔍</div>
        <p className="text-foreground text-base font-semibold">No se encontraron resultados</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Intenta con otro término o explora todos los posts
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-3 flex flex-col items-center py-20 text-center">
      <div className="relative mb-8 flex h-24 w-24 items-center justify-center">
        <span className="bg-primary/10 absolute inset-0 animate-ping rounded-full opacity-50" />
        <span className="bg-primary/15 absolute inset-2 animate-ping rounded-full opacity-40 [animation-delay:0.4s]" />
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          className="text-primary relative z-10 animate-bounce [animation-duration:2s]"
          aria-hidden="true"
        >
          <path
            d="M12 20h9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <p className="text-foreground text-xl font-bold">Próximamente</p>
      <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
        El contenido está en camino. Suscríbete para ser el primero en enterarte.
      </p>

      <div className="mt-5 flex items-center gap-1.5">
        <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0s]" />
        <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0.15s]" />
        <span className="bg-primary h-1.5 w-1.5 animate-bounce rounded-full [animation-delay:0.3s]" />
      </div>
    </div>
  );
}
