import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import PostEditorForm from '../components/PostEditorForm';
import { useAdminPost } from '../hooks/usePosts';
import styles from './AdminPosts.module.css';

export default function AdminPostEditorPage() {
  const { postId } = useParams();
  const { data: post, isLoading, isError, error, refetch } = useAdminPost(postId);

  const renderContent = () => {
    if (postId && isLoading) return <Spinner />;
    if (postId && isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    // key: form khởi tạo lại khi chuyển từ "bài mới" sang bài vừa tạo
    return <PostEditorForm key={post?.postId ?? 'new'} post={postId ? post : undefined} />;
  };

  return (
    <section className={styles.page} aria-labelledby="post-editor-title">
      <header className={styles.header}>
        <div>
          <Breadcrumb
            items={[
              { label: 'Quản lý Bài viết', to: ROUTES.ADMIN_POSTS },
              { label: postId ? (post?.title ?? 'Sửa bài') : 'Viết bài mới' },
            ]}
            isLoading={Boolean(postId && isLoading)}
          />
          <h1 id="post-editor-title">{postId ? (post?.title ?? 'Sửa bài') : 'Viết bài mới'}</h1>
        </div>
      </header>
      {renderContent()}
    </section>
  );
}
