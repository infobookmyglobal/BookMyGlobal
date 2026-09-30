/**
 * Renders content saved by the admin rich-text editor to clean HTML.
 * Content may be a Tiptap JSON document (string) or already-authored HTML.
 * Text is escaped, and link/image URLs are restricted to safe schemes.
 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function safeUrl(url: unknown, allowData = false): string {
  const u = String(url ?? "").trim();
  if (!u) return "#";
  if (/^(https?:|mailto:|tel:|\/|#)/i.test(u)) return u;
  if (allowData && /^data:image\/(png|jpe?g|gif|webp);base64,/i.test(u)) return u;
  return "#";
}

function renderNodes(nodes: any[]): string {
  return Array.isArray(nodes) ? nodes.map(renderNode).join("") : "";
}

function renderNode(node: any): string {
  if (!node) return "";

  if (node.type === "text") {
    let text = escapeHtml(node.text || "");
    if (Array.isArray(node.marks)) {
      for (const mark of node.marks) {
        if (mark.type === "bold") text = `<strong>${text}</strong>`;
        else if (mark.type === "italic") text = `<em>${text}</em>`;
        else if (mark.type === "underline") text = `<u>${text}</u>`;
        else if (mark.type === "strike") text = `<s>${text}</s>`;
        else if (mark.type === "code") text = `<code>${text}</code>`;
        else if (mark.type === "link") {
          const href = safeUrl(mark.attrs?.href);
          const external = /^https?:/i.test(href);
          text = `<a href="${escapeHtml(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
        }
      }
    }
    return text;
  }

  const child = renderNodes(node.content);
  switch (node.type) {
    case "paragraph":
      return `<p>${child || "&nbsp;"}</p>`;
    case "heading": {
      const level = Math.min(4, Math.max(1, Number(node.attrs?.level) || 2));
      return `<h${level}>${child}</h${level}>`;
    }
    case "bulletList":
      return `<ul>${child}</ul>`;
    case "orderedList":
      return `<ol>${child}</ol>`;
    case "listItem":
      return `<li>${child}</li>`;
    case "blockquote":
      return `<blockquote>${child}</blockquote>`;
    case "horizontalRule":
      return "<hr />";
    case "hardBreak":
      return "<br />";
    case "image": {
      const src = safeUrl(node.attrs?.src, true);
      const alt = escapeHtml(node.attrs?.alt || "");
      const title = escapeHtml(node.attrs?.title || "");
      return `<img src="${escapeHtml(src)}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy" />`;
    }
    default:
      return child;
  }
}

export function renderContentToHtml(content: string | null | undefined): string {
  if (!content) return "";
  if (!content.trim().startsWith("{")) return content;
  try {
    const doc = JSON.parse(content);
    if (!doc || doc.type !== "doc" || !Array.isArray(doc.content)) return content;
    return renderNodes(doc.content);
  } catch {
    return content;
  }
}

/** Plain text of a Tiptap doc or HTML string, for reading-time and excerpts. */
export function contentToText(content: string | null | undefined): string {
  if (!content) return "";
  const html = renderContentToHtml(content);
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function readingTime(content: string | null | undefined): string {
  const words = contentToText(content).split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 225))} min read`;
}
