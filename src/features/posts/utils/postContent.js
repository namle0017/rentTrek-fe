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

// Một dòng riêng chứa ![chú thích](https://...) — cùng cú pháp BE MarkdownHelper.FirstImageUrl lấy ảnh bìa
const IMAGE_LINE = /^!\[([^\]]*)\]\(\s*<?(https?:\/\/[^\s)>]+)>?(?:\s+"[^"]*")?\s*\)$/i;
// Một dòng riêng chứa link YouTube (watch, youtu.be, shorts, embed)
const YOUTUBE_LINE =
  /^(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})\S*$/i;
// Một dòng riêng chứa link file video trực tiếp
const VIDEO_FILE_LINE = /^https?:\/\/\S+\.(?:mp4|webm|ogg)(?:\?\S*)?$/i;

/**
 * Nội dung bài là văn bản thuần: dòng bắt đầu "## " là tiêu đề mục,
 * dòng trống tách đoạn. Dòng riêng là ảnh Markdown / link YouTube / link .mp4
 * thành khối ảnh / video. Render bằng React nên không cần sanitize HTML;
 * chỉ nhận URL http(s) và id YouTube 11 ký tự.
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
    const image = line.match(IMAGE_LINE);
    const youtube = line.match(YOUTUBE_LINE);
    if (!line) {
      flush();
    } else if (image) {
      flush();
      blocks.push({ type: 'image', alt: image[1].trim(), src: image[2] });
    } else if (youtube) {
      flush();
      blocks.push({ type: 'youtube', videoId: youtube[1] });
    } else if (VIDEO_FILE_LINE.test(line)) {
      flush();
      blocks.push({ type: 'video', src: line });
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
