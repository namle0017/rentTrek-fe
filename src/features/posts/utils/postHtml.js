import DOMPurify from 'dompurify';
import { parsePostContent } from './postContent';

// Nội dung soạn bằng trình soạn WYSIWYG luôn mở đầu bằng một thẻ khối (<p>, <h2>, <ul>...).
// Bài cũ là văn bản/Markdown đơn giản → vẫn render bằng parsePostContent. Giữ khớp BE MarkdownHelper.IsHtml.
const HTML_START = /^\s*<(?:p|h[1-6]|ul|ol|blockquote|figure|img|div|iframe|hr|pre|table)\b/i;
const YOUTUBE_EMBED = /^https:\/\/www\.youtube(?:-nocookie)?\.com\/embed\/[\w-]{11}(?:\?[^"'<>\s]*)?$/i;

export function isHtmlContent(content) {
  return typeof content === 'string' && HTML_START.test(content);
}

let hooksInstalled = false;
function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    // Chỉ giữ iframe nhúng YouTube
    if (node.tagName === 'IFRAME' && !YOUTUBE_EMBED.test(node.getAttribute('src') || '')) {
      node.remove();
      return;
    }
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer nofollow');
    }
  });
}

/** Lọc HTML bài viết trước khi render: bỏ script / sự kiện / iframe lạ, giữ định dạng chữ (style) và ảnh. */
export function sanitizePostHtml(html = '') {
  installHooks();
  return DOMPurify.sanitize(html, {
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'data-youtube-video', 'loading'],
    FORBID_TAGS: ['style', 'form', 'input', 'button', 'textarea', 'select', 'object', 'embed'],
  });
}

function escapeHtml(value = '') {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Đổi bài cũ (Markdown đơn giản) sang HTML để mở bằng trình soạn mới mà không mất ảnh / video / tiêu đề. */
export function legacyToHtml(content = '') {
  if (!content.trim() || isHtmlContent(content)) return content;
  return parsePostContent(content)
    .map((block) => {
      switch (block.type) {
        case 'heading':
          return `<h2>${escapeHtml(block.text)}</h2>`;
        case 'image':
          return `<img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}">`;
        case 'youtube':
          return `<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/${block.videoId}"></iframe></div>`;
        case 'video':
          return `<p><a href="${escapeHtml(block.src)}" target="_blank">${escapeHtml(block.src)}</a></p>`;
        default:
          return `<p>${escapeHtml(block.text)}</p>`;
      }
    })
    .join('');
}

/** Nội dung có chữ, ảnh hoặc video thật (không chỉ là <p></p> rỗng). */
export function hasPostContent(content = '') {
  if (!isHtmlContent(content)) return content.trim() !== '';
  if (/<(?:img|iframe)\b/i.test(content)) return true;
  return (
    content
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim() !== ''
  );
}
