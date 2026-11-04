import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { options } from '@/features/operations/constants/opsOptions';
import OperationForm from '@/features/operations/components/OperationForm';
import OperationDialog from '@/features/operations/components/OperationDialog';
import RichTextEditor from '@/features/operations/components/RichTextEditor';
import StatusBadge from '@/features/operations/components/StatusBadge';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import styles from '@/features/operations/components/Operations.module.css';

export default function PostEditorPage() {
  const { postId } = useParams(); const isNew = postId === 'new';
  const { currentUser } = useAuth(); const navigate = useNavigate();
  const [content, setContent] = useState(null); const [dialog, setDialog] = useState(null);
  const root = API_ENDPOINTS.ADMIN.DETAIL(API_ENDPOINTS.ADMIN.POSTS, postId);
  const query = useOperations(root, undefined, !isNew);
  const tags = useOperations(API_ENDPOINTS.ADMIN.TAGS); const skills = useOperations(API_ENDPOINTS.ADMIN.SOFT_SKILLS);
  const analytics = useOperations(API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.POSTS, postId, 'read-analytics'), undefined, !isNew);
  if ((!isNew && query.isPending) || tags.isPending || skills.isPending) return <Spinner />;
  if ((!isNew && query.isError) || tags.isError || skills.isError) return <ErrorState message={query.error?.message ?? tags.error?.message ?? skills.error?.message} onRetry={() => { query.refetch(); tags.refetch(); skills.refetch(); }} />;
  const post = isNew ? {} : query.data;
  const fields = [{ name: 'title', label: 'Tiêu đề', required: true, maxLength: 250 }, { name: 'slug', label: 'Slug', required: true, maxLength: 250 }, { name: 'postType', label: 'Loại bài', type: 'select', options: options('Guide', 'Skill', 'Location', 'News'), required: true }, { name: 'tagIds', label: 'Tags (Ctrl / ⌘ để chọn nhiều)', type: 'multiselect', options: tags.data.map((tag) => ({ value: tag.tagId, label: tag.name })) }, { name: 'softSkillIds', label: 'Kỹ năng liên quan', type: 'multiselect', options: skills.data.map((skill) => ({ value: skill.softSkillId, label: skill.name })) }];
  return <div className={styles.page}>
    <Link className={styles.muted} to={ROUTES.ADMIN_POSTS}>← Bài viết & cẩm nang</Link>
    <div className={styles.heading}><h1>{isNew ? 'Viết cẩm nang mới' : post.post.title}</h1>{!isNew && <StatusBadge value={post.post.status} />}</div>
    {!isNew && <div className={styles.toolbar}>{[['publish', 'Xuất bản'], ['archive', 'Lưu trữ'], ...(currentUser?.role === USER_ROLE.ADMIN ? [['delete', 'Ẩn bài viết']] : [])].map(([action, label]) => <button key={action} className={styles.secondary} onClick={() => setDialog({ action, label })}>{label}</button>)}</div>}
    <section className={styles.card}><OperationForm key={postId} fields={fields} values={{ ...post.post, tagIds: post.tagIds, softSkillIds: post.softSkillIds }} endpoint={isNew ? API_ENDPOINTS.ADMIN.POSTS : root} method={isNew ? 'post' : 'put'} submitLabel={isNew ? 'Lưu bản nháp' : 'Lưu bài viết'} transform={(body) => {
      const html = content ?? post.content ?? '';
      if (!html.replace(/<[^>]*>/g, '').trim()) throw new Error('Vui lòng nhập nội dung bài viết');
      return { ...body, content: html };
    }} onSuccess={(id) => { if (isNew) navigate(ROUTES.ADMIN_POST(id), { replace: true }); }}><RichTextEditor key={postId} value={post.content ?? ''} onChange={setContent} /></OperationForm></section>
    {!isNew && <section className={styles.card}><h2>Khách đã đọc trước chuyến đi</h2>{analytics.isPending ? <Spinner /> : analytics.isError ? <ErrorState message={analytics.error.message} onRetry={analytics.refetch} /> : <p>{analytics.data.readCount} / {analytics.data.participantsCount} hành khách · {analytics.data.readRate}%</p>}</section>}
    {dialog && <OperationDialog title={dialog.label} endpoint={dialog.action === 'delete' ? root : API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.POSTS, postId, dialog.action)} method={dialog.action === 'delete' ? 'delete' : 'post'} fields={[]} onSuccess={() => { if (dialog.action === 'delete') navigate(ROUTES.ADMIN_POSTS); }} onClose={() => setDialog(null)} />}
  </div>;
}
