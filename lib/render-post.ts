type TiptapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
  text?: string;
};

function esc(str: string | null | undefined): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
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

function renderNodes(nodes: TiptapNode[]): string {
  return nodes.map(renderNode).join('');
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
  const urlHtml = `<p class="embed-card-url">${url}</p>`;

  return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="embed-card">${imgHtml}<div class="embed-card-body">${titleHtml}${descHtml}${urlHtml}</div></a>`;
}

function renderNode(node: TiptapNode): string {
  const children = () => renderNodes(node.content ?? []);

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
      return `<h${level}>${children()}</h${level}>`;
    }
    case 'bulletList':
      return `<ul>${children()}</ul>`;
    case 'orderedList':
      return `<ol>${children()}</ol>`;
    case 'listItem': {
      // Unwrap single-paragraph items so lists don't get double-spaced
      const items = node.content ?? [];
      const first = items[0];
      const inner =
        items.length === 1 && first?.type === 'paragraph'
          ? renderNodes(first.content ?? [])
          : children();
      return `<li>${inner}</li>`;
    }
    case 'blockquote':
      return `<blockquote>${children()}</blockquote>`;
    case 'codeBlock': {
      const lang = node.attrs?.language ? esc(String(node.attrs.language)) : '';
      const code = (node.content ?? [])
        .filter((n) => n.type === 'text')
        .map((n) => n.text ?? '')
        .join('');
      const classAttr = lang ? ` class="language-${lang}"` : '';
      return `<pre><code${classAttr}>${esc(code)}</code></pre>`;
    }
    case 'image': {
      const src = esc(String(node.attrs?.src ?? ''));
      const alt = esc(String(node.attrs?.alt ?? ''));
      return `<img src="${src}" alt="${alt}">`;
    }
    case 'embedCard':
      return renderEmbedCard(node.attrs ?? {});
    default:
      return children();
  }
}

export function renderPostHTML(json: object): string {
  return renderNode(json as TiptapNode);
}
