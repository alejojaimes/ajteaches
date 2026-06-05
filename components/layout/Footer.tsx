export function Footer() {
  return (
    <footer className="border-border mt-16 border-t">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center">
        <div className="text-foreground font-medium">ajteaches</div>
        <div className="text-muted-foreground mt-1 text-sm">© 2026 ajteaches</div>
        <div className="text-muted-foreground mt-3 flex justify-center gap-4 text-sm">
          <a href="/about" className="hover:text-foreground">
            About
          </a>
          <a href="/rss.xml" className="hover:text-foreground">
            RSS
          </a>
          <a
            href="https://github.com/alejojaimes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/alejandro-jaimes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}
