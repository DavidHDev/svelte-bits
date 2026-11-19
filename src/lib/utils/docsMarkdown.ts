const SITE_ORIGIN = 'https://sveltebits.xyz';

const SKIP_SELECTOR = [
  '.docs-button-bar',
  '.docs-page-actions',
  '.docs-code-header',
  '.docs-segmented',
  '.docs-code-options',
  '.linenumber',
  'button',
  'select',
  'svg'
].join(',');

const shouldSkip = (el: Element) => typeof el.matches === 'function' && el.matches(SKIP_SELECTOR);

const collapse = (text: string) => text.replace(/\s+/g, ' ');

const absoluteUrl = (href: string | null) => {
  if (!href) return '';
  try {
    return new URL(href, window.location.origin).href.replace(window.location.origin, SITE_ORIGIN);
  } catch {
    return href;
  }
};

function inlineToMarkdown(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return collapse(node.textContent ?? '');
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const element = node as Element;
  if (shouldSkip(element)) return '';

  const inner = Array.from(node.childNodes).map(inlineToMarkdown).join('');
  const tag = element.tagName.toLowerCase();

  switch (tag) {
    case 'code':
      return inner.trim() ? `\`${inner.trim()}\`` : '';
    case 'strong':
    case 'b':
      return inner.trim() ? `**${inner.trim()}**` : '';
    case 'em':
    case 'i':
      return inner.trim() ? `*${inner.trim()}*` : '';
    case 'br':
      return '\n';
    case 'a': {
      const label = inner.trim();
      const href = absoluteUrl(element.getAttribute('href'));
      if (!label) return '';
      return href ? `[${label}](${href})` : label;
    }
    case 'span':
      if (element.classList.contains('docs-highlight')) {
        return inner.trim() ? `**${inner.trim()}**` : '';
      }
      return inner;
    default:
      return inner;
  }
}

const inlineOf = (el: Element) =>
  inlineToMarkdown(el)
    .replace(/[ \t]+/g, ' ')
    .trim();

function codeBlockToMarkdown(pre: Element) {
  const clone = pre.cloneNode(true) as Element;
  clone.querySelectorAll('.linenumber').forEach((n) => n.remove());

  const code = (clone.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim();
  if (!code) return '';

  const classNames = `${pre.className || ''} ${pre.querySelector('code')?.className || ''}`;
  const langMatch = /language-([a-z0-9]+)/i.exec(classNames);
  const lang = langMatch && langMatch[1] !== 'null' ? langMatch[1] : '';

  return `\`\`\`${lang}\n${code}\n\`\`\``;
}

function listToMarkdown(list: Element, ordered: boolean) {
  return Array.from(list.children)
    .filter((li) => li.tagName.toLowerCase() === 'li' && !shouldSkip(li))
    .map((li, i) => {
      const text = inlineOf(li);
      if (!text) return '';
      const marker = ordered ? `${i + 1}.` : '-';
      return `${marker} ${text.split('\n').join('\n  ')}`;
    })
    .filter(Boolean)
    .join('\n');
}

function controlStateToMarkdown(el: Element) {
  if (el.classList.contains('docs-segmented')) {
    const label = el.querySelector('.docs-segment.is-active .docs-segment-label');
    const text = label ? collapse(label.textContent ?? '').trim() : '';
    return text ? `_Selected: **${text}**_` : '';
  }

  if (el.classList.contains('docs-code-options')) {
    const parts = Array.from(el.querySelectorAll('select'))
      .map((sel) => {
        const select = sel as HTMLSelectElement;
        const opt = select.options[select.selectedIndex];
        return opt ? (opt.textContent ?? '').trim() : '';
      })
      .filter(Boolean);
    return parts.length ? `_Selected stack: **${parts.join(' + ')}**_` : '';
  }

  return '';
}

function blockToMarkdown(el: Element): string {
  if (el.classList && (el.classList.contains('docs-segmented') || el.classList.contains('docs-code-options'))) {
    return controlStateToMarkdown(el);
  }
  if (shouldSkip(el)) return '';
  const tag = el.tagName.toLowerCase();

  switch (tag) {
    case 'h1':
      return `# ${inlineOf(el)}`;
    case 'h2':
      return `## ${inlineOf(el)}`;
    case 'h3':
      return `### ${inlineOf(el)}`;
    case 'h4':
      return `#### ${inlineOf(el)}`;
    case 'h5':
    case 'h6':
      return `##### ${inlineOf(el)}`;
    case 'p':
      return inlineOf(el);
    case 'ul':
      return listToMarkdown(el, false);
    case 'ol':
      return listToMarkdown(el, true);
    case 'pre':
      return codeBlockToMarkdown(el);
    case 'blockquote':
      return inlineOf(el)
        .split('\n')
        .map((l) => `> ${l}`)
        .join('\n');
    case 'hr':
      return '---';
    default: {
      const pre = tag === 'div' && el.classList.contains('docs-code') ? el.querySelector('pre') : null;
      if (pre) return codeBlockToMarkdown(pre);
      return Array.from(el.children).map(blockToMarkdown).filter(Boolean).join('\n\n');
    }
  }
}

export function sectionToMarkdown(section: Element | null | undefined, { sourceUrl }: { sourceUrl?: string } = {}) {
  if (!section) return '';

  const body = Array.from(section.children).map(blockToMarkdown).filter(Boolean).join('\n\n');

  const source = sourceUrl || absoluteUrl(window.location.pathname);
  const attribution = `> Source: ${source}\n> Svelte Bits — an open source collection of animated Svelte components.`;

  const [firstLine, ...rest] = body.split('\n\n');
  if (firstLine && firstLine.startsWith('# ')) {
    return `${firstLine}\n\n${attribution}\n\n${rest.join('\n\n')}`.trim() + '\n';
  }
  return `${attribution}\n\n${body}`.trim() + '\n';
}

