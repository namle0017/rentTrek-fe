import { describe, expect, it } from 'vitest';
import { hasPostContent, isHtmlContent, legacyToHtml, sanitizePostHtml } from './postHtml';

describe('postHtml', () => {
  it('detects rich (HTML) content vs legacy markdown', () => {
    expect(isHtmlContent('<p>Xin chào</p>')).toBe(true);
    expect(isHtmlContent('## Tiêu đề\nĐoạn văn')).toBe(false);
  });

  it('strips scripts, event handlers and non-YouTube iframes but keeps formatting', () => {
    const html = sanitizePostHtml(
      '<p style="text-align: center"><span style="color: #e11d48; font-size: 20px">Đỏ</span>' +
        '<img src="x" onerror="alert(1)"></p><script>alert(2)</script>' +
        '<iframe src="https://evil.example/embed"></iframe>' +
        '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe></div>' +
        '<a href="javascript:alert(3)">x</a>',
    );

    expect(html).not.toContain('onerror');
    expect(html).not.toContain('<script');
    expect(html).not.toContain('evil.example');
    expect(html).not.toContain('javascript:');
    expect(html).toContain('color: #e11d48');
    expect(html).toContain('text-align: center');
    expect(html).toContain('youtube-nocookie.com/embed/dQw4w9WgXcQ');
  });

  it('converts legacy markdown posts to editor HTML', () => {
    const html = legacyToHtml(
      '## Chuẩn bị\nMang <áo> mưa.\n\n![Đỉnh](https://cdn.example/a.jpg)\nhttps://youtu.be/dQw4w9WgXcQ',
    );

    expect(html).toBe(
      '<h2>Chuẩn bị</h2><p>Mang &lt;áo&gt; mưa.</p><img src="https://cdn.example/a.jpg" alt="Đỉnh">' +
        '<div data-youtube-video=""><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ"></iframe></div>',
    );
    expect(legacyToHtml('<p>Đã là HTML</p>')).toBe('<p>Đã là HTML</p>');
  });

  it('treats empty editor output as no content', () => {
    expect(hasPostContent('<p></p>')).toBe(false);
    expect(hasPostContent('<p>&nbsp;</p>')).toBe(false);
    expect(hasPostContent('<p><img src="https://cdn.example/a.jpg"></p>')).toBe(true);
    expect(hasPostContent('<p>Có chữ</p>')).toBe(true);
    expect(hasPostContent('Bài cũ')).toBe(true);
  });
});
