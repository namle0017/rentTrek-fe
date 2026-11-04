/**
 * Slug giống BE (SlugHelper): bỏ dấu tiếng Việt, chữ thường, nối bằng "-".
 * Chỉ để xem trước; BE vẫn sinh / kiểm tra slug thật.
 */
export function slugify(value = '') {
  return value
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Nội dung bài là văn bản thuần: dòng bắt đầu "## " là tiêu đề mục,
 * dòng trống tách đoạn. Render bằng React nên không cần sanitize HTML.
 */
export function parsePostContent(content = '') {
  const blocks = [];
  let paragraph = [];

  const flush = () => {
    if (paragraph.length) {
      blocks.push({ type: 'paragraph', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  content.split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) {
      flush();
    } else if (line.startsWith('## ')) {
      flush();
      blocks.push({ type: 'heading', text: line.slice(3).trim() });
    } else {
      paragraph.push(line);
    }
  });
  flush();

  return blocks;
}
