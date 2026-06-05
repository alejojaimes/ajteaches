import { NextRequest, NextResponse } from 'next/server';

function extractMeta(html: string, property: string): string {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${property}["']`, 'i'),
    new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i'),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${property}["']`, 'i'),
  ];
  for (const re of patterns) {
    const match = re.exec(html);
    if (match?.[1]) return match[1];
  }
  return '';
}

function extractTitle(html: string): string {
  const og = extractMeta(html, 'title');
  if (og) return og;
  const match = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
  return match?.[1] ?? '';
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return NextResponse.json({ error: 'Invalid url' }, { status: 400 });
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return NextResponse.json({ error: 'Only http/https allowed' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'ajteaches-bot/1.0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const data = {
      url,
      title: extractTitle(html).slice(0, 200),
      description: extractMeta(html, 'description').slice(0, 300),
      image: extractMeta(html, 'image'),
    };
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 502 });
  }
}
