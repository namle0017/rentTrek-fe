import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormField from '@/components/FormField';
import { POST_STATUS, POST_STATUS_LABEL, POST_TYPE, POST_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatDateTime } from '@/utils/formatDate';
import { useDeletePost, usePostTaxonomy, usePostTourOptions, useSavePost } from '../hooks/usePosts';
import { slugify } from '../utils/postContent';
import styles from '../pages/AdminPosts.module.css';

const MAX_TAGS = 10;
const FORM_FIELDS = ['title', 'slug', 'postType', 'content'];
const notBlank = (message) => (value) => value.trim() !== '' || message;

export default function PostEditorForm({ post }) {
  const navigate = useNavigate();
  const isNew = !post;
  const canEdit = isNew || post.canEdit;

  const { data: taxonomy } = usePostTaxonomy();
  const { data: tourOptions = [] } = usePostTourOptions();
  const savePost = useSavePost();
  const deletePost = useDeletePost();

  const [tagNames, setTagNames] = useState(post?.tagNames ?? []);
  const [tagInput, setTagInput] = useState('');
  const [softSkillIds, setSoftSkillIds] = useState(post?.softSkillIds ?? []);
  const [tours, setTours] = useState(post?.tours ?? []);
  const [selectedTourId, setSelectedTourId] = useState('');
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: post?.title ?? '',
      slug: post?.slug ?? '',
      postType: post?.postType ?? POST_TYPE.GUIDE,
      content: post?.content ?? '',
    },
  });

  const [slugValue, titleValue] = useWatch({ control, name: ['slug', 'title'] });
  const slugPreview = slugify(slugValue || titleValue) || '…';
  const isPublished = post?.status === POST_STATUS.PUBLISHED;
  const availableTours = tourOptions.filter((tour) => !tours.some((linked) => linked.tourId === tour.tourId));

  const addTag = () => {
    const name = tagInput.trim();
    if (!name) return;
    if (tagNames.length >= MAX_TAGS) {
      toast.error(`Tối đa ${MAX_TAGS} tag cho một bài.`);
      return;
    }
    if (!tagNames.some((existing) => slugify(existing) === slugify(name))) setTagNames([...tagNames, name]);
    setTagInput('');
  };

  const handleTagKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      addTag();
    }
  };

  const toggleSoftSkill = (softSkillId) =>
    setSoftSkillIds((current) =>
      current.includes(softSkillId) ? current.filter((id) => id !== softSkillId) : [...current, softSkillId],
    );

  const addTour = () => {
    const tour = tourOptions.find((option) => option.tourId === selectedTourId);
    if (!tour) return;
    setTours([...tours, { tourId: tour.tourId, name: tour.name }]);
    setSelectedTourId('');
  };

  const moveTour = (index, offset) =>
    setTours((current) => {
      const next = [...current];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });

  const save = (status) => (values) => {
    const payload = {
      title: values.title.trim(),
      slug: values.slug.trim() || null,
      postType: values.postType,
      content: values.content,
      status,
      tagNames,
      softSkillIds,
      tourIds: tours.map((tour) => tour.tourId),
    };

    savePost.mutate(
      { postId: post?.postId, payload },
      {
        onSuccess: (res) => {
          if (isNew) navigate(ROUTES.ADMIN_POST_EDIT(res.data.postId), { replace: true });
        },
        onError: (error) => {
          applyServerErrors(error, setError);
          // Lỗi của tag / kỹ năng / tour không có ô nhập riêng → báo bằng toast
          const otherMessages = Object.entries(error?.errors ?? {})
            .filter(([field]) => !FORM_FIELDS.includes(field) && field !== 'code')
            .map(([, messages]) => messages[0]);
          if (otherMessages.length) toast.error(otherMessages.join(' '));
        },
      },
    );
  };

  const handleDelete = () =>
    deletePost.mutate(post.postId, { onSuccess: () => navigate(ROUTES.ADMIN_POSTS, { replace: true }) });

  const isBusy = savePost.isPending || deletePost.isPending;

  return (
    <form className={styles.editor} onSubmit={handleSubmit(save(POST_STATUS.PUBLISHED))} noValidate>
      {!canEdit && (
        <p className={styles.notice} role="note">
          Bạn chỉ xem được bài này. Chỉ tác giả hoặc Admin được sửa.
        </p>
      )}

      <fieldset className={styles.editorMain} disabled={!canEdit || isBusy}>
        <legend className="sr-only">Nội dung bài</legend>
        <FormField label="Tiêu đề" htmlFor="post-title" error={errors.title}>
          <input
            id="post-title"
            className={styles.input}
            maxLength="255"
            aria-invalid={Boolean(errors.title)}
            {...register('title', { validate: notBlank('Tiêu đề không được để trống.') })}
          />
        </FormField>

        <FormField label="Đường dẫn" htmlFor="post-slug" error={errors.slug}>
          <input
            id="post-slug"
            className={styles.input}
            maxLength="255"
            placeholder="Bỏ trống để tự sinh từ tiêu đề"
            aria-describedby="post-slug-preview"
            aria-invalid={Boolean(errors.slug)}
            {...register('slug')}
          />
          <p id="post-slug-preview" className={styles.hint}>
            rentrekk.vn/guides/<strong>{slugPreview}</strong>
          </p>
        </FormField>

        <FormField label="Nội dung" htmlFor="post-content" error={errors.content}>
          <textarea
            id="post-content"
            className={styles.textarea}
            rows="18"
            aria-describedby="post-content-hint"
            aria-invalid={Boolean(errors.content)}
            {...register('content', { validate: notBlank('Nội dung không được để trống.') })}
          />
          <p id="post-content-hint" className={styles.hint}>
            Dòng bắt đầu bằng “## ” là tiêu đề mục. Để trống một dòng để tách đoạn.
          </p>
        </FormField>
      </fieldset>

      <fieldset className={styles.editorSide} disabled={!canEdit || isBusy}>
        <legend className="sr-only">Thiết lập bài</legend>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Xuất bản</h2>
          <p className={styles.statusLine}>
            <span className={isPublished ? styles.badgePublished : styles.badgeDraft}>
              {isPublished ? '● ' : '○ '}
              {POST_STATUS_LABEL[post?.status ?? POST_STATUS.DRAFT]}
            </span>
          </p>
          <p className={styles.hint}>
            Ngày đăng: {post?.publishedAt ? formatDateTime(post.publishedAt) : 'Chưa đăng'}
          </p>
          {isPublished && (
            <Link
              to={ROUTES.GUIDE_DETAIL(post.slug)}
              className={styles.inlineLink}
              target="_blank"
              rel="noreferrer"
            >
              Xem bài công khai ↗
            </Link>
          )}
          <div className={styles.actions}>
            <button type="button" className="btn btn-outline" onClick={handleSubmit(save(POST_STATUS.DRAFT))}>
              {isPublished ? 'Chuyển về nháp' : 'Lưu nháp'}
            </button>
            <button type="submit" className="btn btn-primary">
              {savePost.isPending ? 'Đang lưu…' : isPublished ? 'Cập nhật' : 'Xuất bản'}
            </button>
          </div>
        </section>

        <section className={styles.panel}>
          <label className={styles.panelTitle} htmlFor="post-type">
            Loại bài
          </label>
          <select id="post-type" className={styles.input} {...register('postType')}>
            {Object.values(POST_TYPE).map((type) => (
              <option key={type} value={type}>
                {POST_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </section>

        <section className={styles.panel}>
          <label className={styles.panelTitle} htmlFor="post-tag-input">
            Tag
          </label>
          {tagNames.length > 0 && (
            <ul className={styles.chips}>
              {tagNames.map((name) => (
                <li key={name} className={styles.chip}>
                  #{name}
                  <button
                    type="button"
                    className={styles.chipRemove}
                    aria-label={`Bỏ tag ${name}`}
                    onClick={() => setTagNames(tagNames.filter((existing) => existing !== name))}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className={styles.inlineInput}>
            <input
              id="post-tag-input"
              className={styles.input}
              list="post-tag-options"
              maxLength="100"
              value={tagInput}
              placeholder="Nhập tag rồi Enter"
              onChange={(event) => setTagInput(event.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <button type="button" className="btn btn-outline" onClick={addTag}>
              Thêm
            </button>
          </div>
          <datalist id="post-tag-options">
            {taxonomy?.tags.map((tag) => (
              <option key={tag.slug} value={tag.name} />
            ))}
          </datalist>
          <p className={styles.hint}>Tag chưa có sẽ được tạo khi lưu.</p>
        </section>

        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Kỹ năng</h2>
          {taxonomy?.softSkills.length ? (
            <div className={styles.checkList}>
              {taxonomy.softSkills.map((skill) => (
                <label key={skill.softSkillId} className={styles.checkItem}>
                  <input
                    type="checkbox"
                    checked={softSkillIds.includes(skill.softSkillId)}
                    onChange={() => toggleSoftSkill(skill.softSkillId)}
                  />
                  {skill.name}
                </label>
              ))}
            </div>
          ) : (
            <p className={styles.hint}>Chưa có kỹ năng nào trong hệ thống.</p>
          )}
        </section>

        <section className={styles.panel}>
          <label className={styles.panelTitle} htmlFor="post-tour-select">
            Gắn vào tour
          </label>
          {tours.length > 0 && (
            <ol className={styles.tourList}>
              {tours.map((tour, index) => (
                <li key={tour.tourId} className={styles.tourItem}>
                  <span className={styles.tourName}>
                    {tour.name}
                    <small>thứ tự {index + 1}</small>
                  </span>
                  <span className={styles.tourButtons}>
                    <button
                      type="button"
                      aria-label={`Đưa ${tour.name} lên`}
                      disabled={index === 0}
                      onClick={() => moveTour(index, -1)}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label={`Đưa ${tour.name} xuống`}
                      disabled={index === tours.length - 1}
                      onClick={() => moveTour(index, 1)}
                    >
                      ↓
                    </button>
                    <button
                      type="button"
                      aria-label={`Bỏ gắn ${tour.name}`}
                      onClick={() => setTours(tours.filter((linked) => linked.tourId !== tour.tourId))}
                    >
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <div className={styles.inlineInput}>
            <select
              id="post-tour-select"
              className={styles.input}
              value={selectedTourId}
              onChange={(event) => setSelectedTourId(event.target.value)}
            >
              <option value="">Chọn tour…</option>
              {availableTours.map((tour) => (
                <option key={tour.tourId} value={tour.tourId}>
                  {tour.name}
                </option>
              ))}
            </select>
            <button type="button" className="btn btn-outline" disabled={!selectedTourId} onClick={addTour}>
              + Gắn tour
            </button>
          </div>
        </section>

        {!isNew && (
          <section className={styles.panel}>
            {isConfirmingDelete ? (
              <div className={styles.confirm} role="alert">
                <p>Xóa bài này? Bài sẽ không còn hiển thị cho khách.</p>
                <div className={styles.actions}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsConfirmingDelete(false)}
                  >
                    Hủy
                  </button>
                  <button type="button" className={`btn ${styles.dangerButton}`} onClick={handleDelete}>
                    {deletePost.isPending ? 'Đang xóa…' : 'Xóa bài'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className={`btn ${styles.dangerOutline}`}
                onClick={() => setIsConfirmingDelete(true)}
              >
                Xóa bài viết
              </button>
            )}
          </section>
        )}
      </fieldset>
    </form>
  );
}
