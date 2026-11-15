import { describe, expect, it } from 'vitest';
import { parsePostContent, slugify } from './postContent';

describe('slugify', () => {
  it('strips Vietnamese diacritics like the backend', () => {
    expect(slugify('  Chuẩn bị gì cho chuyến Fansipan 3 ngày 2 đêm? ')).toBe(
      'chuan-bi-gi-cho-chuyen-fansipan-3-ngay-2-dem',
    );
    expect(slugify('Đường đèo Đá Đỏ')).toBe('duong-deo-da-do');
    expect(slugify('!!!')).toBe('');
  });
});

describe('parsePostContent', () => {
  it('splits headings and paragraphs', () => {
    const content = 'Mở đầu dòng 1\ndòng 2\n\n## Quần áo theo lớp\nMặc ba lớp.\n\n\n## Giày';

    expect(parsePostContent(content)).toEqual([
      { type: 'paragraph', text: 'Mở đầu dòng 1 dòng 2' },
      { type: 'heading', text: 'Quần áo theo lớp' },
      { type: 'paragraph', text: 'Mặc ba lớp.' },
      { type: 'heading', text: 'Giày' },
    ]);
  });

  it('turns standalone image, YouTube and video lines into media blocks', () => {
    const content = [
      'Mở đầu',
      '![Đỉnh Fansipan](https://cdn.example.com/a.jpg "tiêu đề")',
      'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
      'https://youtu.be/dQw4w9WgXcQ',
      'https://cdn.example.com/clip.mp4',
      'Xem ![ảnh](https://x.com/b.jpg) giữa câu',
      '![js](javascript:alert(1))',
    ].join('\n');

    expect(parsePostContent(content)).toEqual([
      { type: 'paragraph', text: 'Mở đầu' },
      { type: 'image', alt: 'Đỉnh Fansipan', src: 'https://cdn.example.com/a.jpg' },
      { type: 'youtube', videoId: 'dQw4w9WgXcQ' },
      { type: 'youtube', videoId: 'dQw4w9WgXcQ' },
      { type: 'video', src: 'https://cdn.example.com/clip.mp4' },
      { type: 'paragraph', text: 'Xem ![ảnh](https://x.com/b.jpg) giữa câu ![js](javascript:alert(1))' },
    ]);
  });

  it('returns no blocks for empty content', () => {
    expect(parsePostContent('')).toEqual([]);
  });
});
