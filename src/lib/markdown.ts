// Simple Markdown to HTML converter (no external deps)
export function markdownToHtml(md: string): string {
  let html = md;

  // Blockquotes (must be before other processing)
  html = html.replace(/^>\s*\*\*(.+?)\*\*\s*(.+)$/gm, '<blockquote class="editorial-note"><strong>$1</strong> $2</blockquote>');
  html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Headers with IDs for anchor links
  html = html.replace(/^### (.+)$/gm, (_match, text) => {
    const id = makeId(text);
    return `<h3 id="${id}">${processInline(text)}</h3>`;
  });
  html = html.replace(/^## (.+)$/gm, (_match, text) => {
    const id = makeId(text);
    return `<h2 id="${id}">${processInline(text)}</h2>`;
  });
  html = html.replace(/^# (.+)$/gm, (_match, text) => {
    return `<h1>${processInline(text)}</h1>`;
  });

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Unordered lists
  html = html.replace(/^[-*]\s+(.+)$/gm, "<li>$1</li>");
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Ordered lists
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Paragraphs (lines that aren't already HTML)
  const lines = html.split("\n");
  const result: string[] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed === "" ||
      trimmed.startsWith("<h") ||
      trimmed.startsWith("<ul") ||
      trimmed.startsWith("</ul") ||
      trimmed.startsWith("<ol") ||
      trimmed.startsWith("</ol") ||
      trimmed.startsWith("<li") ||
      trimmed.startsWith("<blockquote") ||
      trimmed.startsWith("<hr")
    ) {
      result.push(line);
    } else {
      result.push(`<p>${processInline(trimmed)}</p>`);
    }
  }

  return result.join("\n");
}

function processInline(text: string): string {
  // Bold
  let result = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic
  result = result.replace(/\*(.+?)\*/g, "<em>$1</em>");
  // Links
  result = result.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  // Inline code
  result = result.replace(/`(.+?)`/g, "<code>$1</code>");
  return result;
}

function makeId(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .toLowerCase()
    .replace(/[^\w\u3000-\u9fff\uff00-\uffef]+/g, "-")
    .replace(/^-|-$/g, "");
}
