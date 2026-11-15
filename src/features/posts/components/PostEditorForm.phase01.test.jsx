import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import axiosClient from '@/api/axiosClient';
import PostEditorForm from './PostEditorForm';

// TipTap (contenteditable) không gõ được ổn định trong jsdom → thay bằng textarea giữ cùng hợp đồng value/onChange
vi.mock('./RichTextEditor', () => ({
  default: ({ id, value, onChange }) => (
    <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} />
  ),
}));
vi.mock('react-toastify', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('@/api/axiosClient', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const taxonomy = {
  tags: [{ tagId: 'tag-1', name: 'Trời lạnh', slug: 'troi-lanh' }],
  softSkills: [{ softSkillId: 'skill-1', name: 'Giữ ấm cơ thể' }],
};

function renderForm(post) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PostEditorForm post={post} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const writeCalls = () => [
  ...axiosClient.post.mock.calls.map(([url, body]) => ({ method: 'post', url: String(url), body })),
  ...axiosClient.put.mock.calls.map(([url, body]) => ({ method: 'put', url: String(url), body })),
  ...axiosClient.patch.mock.calls.map(([url, body]) => ({ method: 'patch', url: String(url), body })),
];

const existingPost = (status) => ({
  postId: 'post-1',
  title: 'Bài có sẵn',
  slug: 'bai-co-san',
  postType: 'Guide',
  content: 'Nội dung',
  status,
  publishedAt: status === 'Published' ? '2026-10-12T02:00:00Z' : null,
  tagNames: [],
  tagIds: [],
  tags: [],
  softSkillIds: [],
  tours: [],
  canEdit: true,
});

describe('PostEditorForm - phase 01 (item 3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axiosClient.get.mockImplementation((url) => {
      const path = String(url);
      if (path.includes('taxonomy')) return Promise.resolve({ data: taxonomy });
      return Promise.resolve({ data: { items: [] } });
    });
    const ok = { data: { postId: 'post-1' }, message: 'ok' };
    axiosClient.post.mockResolvedValue(ok);
    axiosClient.put.mockResolvedValue(ok);
    axiosClient.patch.mockResolvedValue(ok);
  });

  it('TC-PM-040: saving a draft sends tagIds (from taxonomy) and no tagNames/status', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Tiêu đề'), 'Chuẩn bị gì cho Fansipan');
    await user.type(screen.getByLabelText('Nội dung'), 'Mặc ba lớp.');
    await waitFor(() => expect(axiosClient.get).toHaveBeenCalled());
    await user.type(screen.getByLabelText('Tag'), 'Trời lạnh{enter}');
    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));

    await waitFor(() => expect(writeCalls().length).toBeGreaterThan(0));
    const save = writeCalls().find((call) => /\/admin\/posts\/?$/.test(call.url));
    expect(save).toBeDefined();
    expect(save.body.tagIds).toEqual(['tag-1']);
    expect(save.body).not.toHaveProperty('tagNames');
    expect(save.body).not.toHaveProperty('status');
  });

  it('TC-PM-041: Xuất bản on an existing draft calls the /publish endpoint', async () => {
    const user = userEvent.setup();
    renderForm(existingPost('Draft'));

    await user.click(screen.getByRole('button', { name: 'Xuất bản' }));

    await waitFor(() =>
      expect(writeCalls().some((call) => /\/admin\/posts\/post-1\/publish$/.test(call.url))).toBe(true),
    );
  });

  it('TC-PM-042: archive action on a published post calls the /archive endpoint', async () => {
    const user = userEvent.setup();
    renderForm(existingPost('Published'));

    await user.click(screen.getByRole('button', { name: /Lưu trữ/ }));

    await waitFor(() =>
      expect(writeCalls().some((call) => /\/admin\/posts\/post-1\/archive$/.test(call.url))).toBe(true),
    );
  });
});
