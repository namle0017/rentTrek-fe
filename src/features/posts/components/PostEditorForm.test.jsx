import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDeletePost, usePostTaxonomy, usePostTourOptions, useSavePost } from '../hooks/usePosts';
import PostEditorForm from './PostEditorForm';

vi.mock('../hooks/usePosts', () => ({
  usePostTaxonomy: vi.fn(),
  usePostTourOptions: vi.fn(),
  useSavePost: vi.fn(),
  useDeletePost: vi.fn(),
}));

const mutate = vi.fn();

function renderForm(post) {
  render(
    <MemoryRouter>
      <PostEditorForm post={post} />
    </MemoryRouter>,
  );
}

describe('PostEditorForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    usePostTaxonomy.mockReturnValue({ data: { tags: [], softSkills: [{ softSkillId: 'skill-1', name: 'Giữ ấm cơ thể' }] } });
    usePostTourOptions.mockReturnValue({ data: [{ tourId: 'tour-1', name: 'Fansipan Trạm Tôn' }] });
    useSavePost.mockReturnValue({ mutate, isPending: false });
    useDeletePost.mockReturnValue({ mutate: vi.fn(), isPending: false });
  });

  it('publishes a new post with tags, skills and tours in the API contract shape', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText('Tiêu đề'), 'Chuẩn bị gì cho Fansipan');
    expect(screen.getByText('chuan-bi-gi-cho-fansipan')).toBeInTheDocument();
    await user.type(screen.getByLabelText('Nội dung'), '## Quần áo{enter}Mặc ba lớp.');
    await user.type(screen.getByLabelText('Tag'), 'Trời lạnh{enter}');
    await user.click(screen.getByLabelText('Giữ ấm cơ thể'));
    await user.selectOptions(screen.getByLabelText('Gắn vào tour'), 'tour-1');
    await user.click(screen.getByRole('button', { name: '+ Gắn tour' }));
    await user.click(screen.getByRole('button', { name: 'Xuất bản' }));

    expect(mutate).toHaveBeenCalledWith(
      {
        postId: undefined,
        payload: {
          title: 'Chuẩn bị gì cho Fansipan',
          slug: null,
          postType: 'Guide',
          content: '## Quần áo\nMặc ba lớp.',
          status: 'Published',
          tagNames: ['Trời lạnh'],
          softSkillIds: ['skill-1'],
          tourIds: ['tour-1'],
        },
      },
      expect.any(Object),
    );
  });

  it('blocks saving without title and content', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: 'Lưu nháp' }));

    expect(await screen.findByText('Tiêu đề không được để trống.')).toBeInTheDocument();
    expect(screen.getByText('Nội dung không được để trống.')).toBeInTheDocument();
    expect(mutate).not.toHaveBeenCalled();
  });

  it('is read-only when the staff member is not the author', () => {
    renderForm({
      postId: 'post-1',
      title: 'Bài của người khác',
      slug: 'bai-cua-nguoi-khac',
      postType: 'News',
      content: 'Nội dung',
      status: 'Published',
      publishedAt: '2026-10-12T02:00:00Z',
      tagNames: [],
      softSkillIds: [],
      tours: [],
      canEdit: false,
    });

    expect(screen.getByRole('note')).toHaveTextContent('Bạn chỉ xem được bài này');
    expect(screen.getByLabelText('Tiêu đề')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cập nhật' })).toBeDisabled();
  });
});
