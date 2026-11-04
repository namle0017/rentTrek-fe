import { useState } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { POST_STATUS, POST_STATUS_LABEL, POST_TYPE, POST_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { useAdminPosts } from '../hooks/usePosts';
import styles from './AdminPosts.module.css';

const INITIAL_FILTERS = { search: '', status: '', postType: '' };

export default function AdminPostsPage() {
  const [draftFilters, setDraftFilters] = useState(INITIAL_FILTERS);
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [pageNumber, setPageNumber] = useState(DEFAULT_PAGE_NUMBER);
  const { data: pagedPosts, isLoading, isError, error, refetch, isFetching } = useAdminPosts({
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    ...filters,
  });

  const handleFilterChange = (field) => (event) =>
    setDraftFilters((current) => ({ ...current, [field]: event.target.value }));

  const handleSubmit = (event) => {
    event.preventDefault();
    setPageNumber(DEFAULT_PAGE_NUMBER);
    setFilters({ ...draftFilters, search: draftFilters.search.trim() });
  };

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!pagedPosts?.items.length) return <EmptyState message="Chưa có bài viết phù hợp" />;

    return (
      <>
        <p className={styles.resultMeta} role="status">
          {isFetching ? 'Đang cập nhật danh sách…' : `${pagedPosts.totalItems} bài viết`}
        </p>
        <div className={styles.card} aria-busy={isFetching}>
          <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng bài viết, cuộn ngang trên màn hình nhỏ">
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Tiêu đề</th>
                  <th scope="col">Loại</th>
                  <th scope="col">Tác giả</th>
                  <th scope="col">Trạng thái</th>
                  <th scope="col">Ngày đăng</th>
                  <th scope="col">Tour gắn</th>
                  <th scope="col">Lượt đọc</th>
                  <th scope="col">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {pagedPosts.items.map((post) => (
                  <tr key={post.postId}>
                    <td>
                      <Link to={ROUTES.ADMIN_POST_EDIT(post.postId)} className={styles.titleLink}>
                        {post.title}
                      </Link>
                      <span className={styles.slug}>/{post.slug}</span>
                    </td>
                    <td>{POST_TYPE_LABEL[post.postType] ?? post.postType}</td>
                    <td>{post.authorName}</td>
                    <td>
                      <span className={post.status === POST_STATUS.PUBLISHED ? styles.badgePublished : styles.badgeDraft}>
                        {post.status === POST_STATUS.PUBLISHED ? '● ' : '○ '}
                        {POST_STATUS_LABEL[post.status] ?? post.status}
                      </span>
                    </td>
                    <td className={styles.numeric}>{post.publishedAt ? formatDate(post.publishedAt) : 'Chưa đăng'}</td>
                    <td className={styles.numeric}>{post.tourCount}</td>
                    <td className={styles.numeric}>{post.readCount}</td>
                    <td>
                      <Link to={ROUTES.ADMIN_POST_EDIT(post.postId)} className="btn btn-outline">
                        {post.canEdit ? 'Sửa' : 'Xem'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination
          pageNumber={pagedPosts.pageNumber}
          totalPages={pagedPosts.totalPages}
          hasPrevious={pagedPosts.hasPrevious}
          hasNext={pagedPosts.hasNext}
          onPageChange={setPageNumber}
        />
      </>
    );
  };

  return (
    <section className={styles.page}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <Link to={ROUTES.ADMIN_POST_CREATE} className="btn btn-primary">
          Viết bài
        </Link>
      </div>

      <form className={styles.filters} onSubmit={handleSubmit}>
        <label className={styles.field}>
          <span>Tìm bài</span>
          <input
            type="search"
            value={draftFilters.search}
            placeholder="Tiêu đề"
            maxLength="200"
            onChange={handleFilterChange('search')}
          />
        </label>
        <label className={styles.field}>
          <span>Trạng thái</span>
          <select value={draftFilters.status} onChange={handleFilterChange('status')}>
            <option value="">Tất cả</option>
            {Object.values(POST_STATUS).map((status) => (
              <option key={status} value={status}>
                {POST_STATUS_LABEL[status]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Loại bài</span>
          <select value={draftFilters.postType} onChange={handleFilterChange('postType')}>
            <option value="">Tất cả</option>
            {Object.values(POST_TYPE).map((type) => (
              <option key={type} value={type}>
                {POST_TYPE_LABEL[type]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary">
          Lọc danh sách
        </button>
      </form>

      {renderContent()}
    </section>
  );
}
