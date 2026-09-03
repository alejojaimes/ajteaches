export type VideoEmbedInfo =
  | { provider: 'youtube'; embedUrl: string }
  | { provider: 'vimeo'; embedUrl: string }
  | { provider: 'file'; embedUrl: string };

export function parseVideoUrl(raw: string): VideoEmbedInfo | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, '').replace(/^m\./, '');

  if (host === 'youtube.com' || host === 'youtube-nocookie.com') {
    const segments = url.pathname.split('/').filter(Boolean);
    let id = url.searchParams.get('v');
    if (!id && (segments[0] === 'shorts' || segments[0] === 'embed')) id = segments[1] ?? null;
    if (!id) return null;
    return { provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === 'youtu.be') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (!id) return null;
    return { provider: 'youtube', embedUrl: `https://www.youtube-nocookie.com/embed/${id}` };
  }

  if (host === 'vimeo.com') {
    const id = url.pathname.split('/').filter(Boolean)[0];
    if (!id || !/^\d+$/.test(id)) return null;
    return { provider: 'vimeo', embedUrl: `https://player.vimeo.com/video/${id}` };
  }

  if (host === 'player.vimeo.com') {
    return { provider: 'vimeo', embedUrl: url.toString() };
  }

  if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) {
    return { provider: 'file', embedUrl: url.toString() };
  }

  return null;
}
