import { describe, expect, it } from 'vitest';
import { parsePostContent, slugify } from './postContent';

describe('slugify', () => {
  it('strips Vietnamese diacritics like the backend', () => {
    expect(slugify('  Chuẩn bị gì cho chuyến Fansipan 3 ngày 2 đêm? ')).toBe('chuan-bi-gi-cho-chuyen-fansipan-3-ngay-2-dem');
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

  it('returns no blocks for empty content', () => {
    expect(parsePostContent('')).toEqual([]);
  });
});
