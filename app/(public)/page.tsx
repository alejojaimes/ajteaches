export default function Home() {
  return (
    <main className="bg-background text-foreground min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="bg-primary rounded-button flex h-8 w-8 items-center justify-center text-sm font-bold text-white">
            aj
          </div>
          <span className="text-lg font-medium">ajteaches</span>
        </div>
        <h1 className="mb-3 text-4xl font-bold">Engineering, taught well.</h1>
        <p className="text-muted-foreground mb-8 text-lg">Notes from an engineer who teaches.</p>
        <div className="flex items-center gap-3">
          <button className="bg-primary hover:bg-primary-hover rounded-button px-4 py-2 text-sm font-medium text-white transition-colors">
            Primary button
          </button>
          <span className="bg-primary-soft text-primary rounded-badge px-3 py-1 text-sm font-medium">
            Engineering
          </span>
        </div>
      </div>
    </main>
  );
}
