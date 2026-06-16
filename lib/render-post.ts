import { createLowlight, common } from 'lowlight';

const lowlight = createLowlight(common);

type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

export type Heading = { id: string; text: string; level: number };

const TOC_LEVELS = [2, 3];

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getNodeText(node: TiptapNode): string {
  if (node.type === 'text') return node.text ?? '';
  return (node.content ?? []).map(getNodeText).join('');
}

export function extractHeadings(contentJson: unknown): Heading[] {
  if (!contentJson || typeof contentJson !== 'object' || Array.isArray(contentJson)) return [];

  const headings: Heading[] = [];
  const slugCounts = new Map<string, number>();

  function visit(node: TiptapNode): void {
    if (node.type === 'heading') {
      const level = Number(node.attrs?.level ?? 1);
      if (TOC_LEVELS.includes(level)) {
        const text = getNodeText(node).trim();
        if (text) {
          const base = slugifyHeading(text) || 'section';
          const count = slugCounts.get(base) ?? 0;
          slugCounts.set(base, count + 1);
          headings.push({ id: count === 0 ? base : `${base}-${count}`, text, level });
        }
      }
    }
    for (const child of node.content ?? []) visit(child);
  }

  visit(contentJson as TiptapNode);
  return headings;
}

export function getFirstContentImage(contentJson: unknown): string | null {
  if (!contentJson || typeof contentJson !== 'object' || Array.isArray(contentJson)) return null;

  const queue: TiptapNode[] = [contentJson as TiptapNode];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;

    if (node.type === 'image') {
      const src = node.attrs?.src;
      if (typeof src === 'string' && src) return src;
    }

    if (node.content) queue.push(...node.content);
  }

  return null;
}

export function extractContentImageUrls(contentJson: unknown): string[] {
  if (!contentJson || typeof contentJson !== 'object' || Array.isArray(contentJson)) return [];

  const urls: string[] = [];
  const queue: TiptapNode[] = [contentJson as TiptapNode];
  while (queue.length > 0) {
    const node = queue.shift();
    if (!node) continue;

    if (node.type === 'image') {
      const src = node.attrs?.src;
      if (typeof src === 'string' && src) urls.push(src);
    }

    if (node.content) queue.push(...node.content);
  }

  return urls;
}

type HastNode = {
  type: 'text' | 'element' | 'root';
  value?: string;
  tagName?: string;
  properties?: { className?: string[] };
  children?: HastNode[];
};

function esc(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function hastToHtml(node: HastNode): string {
  if (node.type === 'text') return esc(node.value ?? '');
  if (node.type === 'element') {
    const classes = (node.properties?.className ?? []).join(' ');
    const classAttr = classes ? ` class="${esc(classes)}"` : '';
    const inner = (node.children ?? []).map(hastToHtml).join('');
    return `<span${classAttr}>${inner}</span>`;
  }
  return (node.children ?? []).map(hastToHtml).join('');
}

function highlightCode(code: string, lang: string): string {
  try {
    const result = lang ? lowlight.highlight(lang, code) : lowlight.highlightAuto(code);
    return hastToHtml(result as unknown as HastNode);
  } catch {
    return esc(code);
  }
}

function renderText(
  text: string,
  marks: Array<{ type: string; attrs?: Record<string, unknown> }>
): string {
  let html = esc(text);
  for (const mark of marks) {
    switch (mark.type) {
      case 'bold':
        html = `<strong>${html}</strong>`;
        break;
      case 'italic':
        html = `<em>${html}</em>`;
        break;
      case 'strike':
        html = `<s>${html}</s>`;
        break;
      case 'underline':
        html = `<u>${html}</u>`;
        break;
      case 'code':
        html = `<code>${html}</code>`;
        break;
      case 'highlight':
        html = `<mark>${html}</mark>`;
        break;
      case 'link': {
        const href = esc(String(mark.attrs?.href ?? ''));
        html = `<a href="${href}" target="_blank" rel="noopener noreferrer">${html}</a>`;
        break;
      }
    }
  }
  return html;
}

type RenderContext = { headings: Heading[]; index: number };

function renderNodes(nodes: TiptapNode[], ctx: RenderContext): string {
  return nodes.map((node) => renderNode(node, ctx)).join('');
}

function renderCellAttrs(attrs?: Record<string, unknown>): string {
  if (!attrs) return '';
  let out = '';
  const colspan = Number(attrs.colspan ?? 1);
  const rowspan = Number(attrs.rowspan ?? 1);
  if (colspan > 1) out += ` colspan="${colspan}"`;
  if (rowspan > 1) out += ` rowspan="${rowspan}"`;
  return out;
}

function renderEmbedCard(attrs: Record<string, unknown>): string {
  const url = esc(String(attrs.url ?? ''));
  const title = esc(String(attrs.title ?? ''));
  const description = esc(String(attrs.description ?? ''));
  const image = esc(String(attrs.image ?? ''));

  const imgHtml = image
    ? `<img src="${image}" alt="${title || 'Embed preview'}" class="embed-card-image">`
    : '';
  const titleHtml = title ? `<p class="embed-card-title">${title}</p>` : '';
  const descHtml = description ? `<p class="embed-card-description">${description}</p>` : '';
  const ctaHtml = `<p class="embed-card-cta">Read post →</p>`;

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="embed-card">${imgHtml}<div class="embed-card-body">${titleHtml}${descHtml}${ctaHtml}</div></a>`;
}

function renderNode(node: TiptapNode, ctx: RenderContext): string {
  const children = () => renderNodes(node.content ?? [], ctx);

  switch (node.type) {
    case 'doc':
      return children();
    case 'text':
      return renderText(node.text ?? '', node.marks ?? []);
    case 'hardBreak':
      return '<br>';
    case 'horizontalRule':
      return '<hr>';
    case 'paragraph':
      return `<p>${children()}</p>`;
    case 'heading': {
      const level = Number(node.attrs?.level ?? 1);
      const heading = TOC_LEVELS.includes(level) ? ctx.headings[ctx.index++] : undefined;
      const idAttr = heading ? ` id="${esc(heading.id)}"` : '';
      return `<h${level}${idAttr}>${children()}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${children()}</ul>`;
    case 'orderedList':
      return `<ol>${children()}</ol>`;
    case 'listItem': {
      const items = node.content ?? [];
      const first = items[0];
      const inner =
        items.length === 1 && first?.type === 'paragraph'
          ? renderNodes(first.content ?? [], ctx)
          : children();
      return `<li>${inner}</li>`;
    }
    case 'blockquote':
      return `<blockquote>${children()}</blockquote>`;
    case 'codeBlock': {
      const lang = node.attrs?.language ? String(node.attrs.language) : '';
      const code = (node.content ?? [])
        .filter((n) => n.type === 'text')
        .map((n) => n.text ?? '')
        .join('');

      const highlighted = highlightCode(code, lang);
      const classAttr = lang ? ` class="language-${esc(lang)}"` : '';
      const langBadge = lang ? `<span class="code-lang-badge">${esc(lang)}</span>` : '';

      return `<div class="code-block-wrapper"><div class="code-block-meta"><button class="code-copy-btn" type="button" aria-label="Copy code"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span class="code-copy-label">Copy</span></button>${langBadge}</div><pre><code${classAttr}>${highlighted}</code></pre></div>`;
    }
    case 'image': {
      const src = esc(String(node.attrs?.src ?? ''));
      const alt = esc(String(node.attrs?.alt ?? ''));
      const credit = node.attrs?.credit ? esc(String(node.attrs.credit)) : '';
      const width = typeof node.attrs?.width === 'number' ? node.attrs.width : null;
      const figcaption = credit ? `<figcaption class="image-credit">${credit}</figcaption>` : '';
      const styleAttr = width && width < 100 ? ` style="width: ${width}%"` : '';
      return `<figure class="post-image"${styleAttr}><img src="${src}" alt="${alt}" loading="lazy">${figcaption}</figure>`;
    }
    case 'embedCard':
      return renderEmbedCard(node.attrs ?? {});
    case 'table':
      return `<div class="table-wrapper"><table>${children()}</table></div>`;
    case 'tableRow':
      return `<tr>${children()}</tr>`;
    case 'tableHeader':
      return `<th${renderCellAttrs(node.attrs)}>${children()}</th>`;
    case 'tableCell':
      return `<td${renderCellAttrs(node.attrs)}>${children()}</td>`;
    default:
      return children();
  }
}

export function renderPostHTML(json: object): string {
  const ctx: RenderContext = { headings: extractHeadings(json), index: 0 };
  return renderNode(json as TiptapNode, ctx);
}
