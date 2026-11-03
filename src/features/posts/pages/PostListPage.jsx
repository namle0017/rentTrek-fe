import { Link, useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER } from '@/constants/config';
import { POST_TYPE, POST_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { usePosts, usePostTaxonomy } from '../hooks/usePosts';
import styles from './PostListPage.module.css';

const PAGE_SIZE = 9;
const TYPE_TABS = [{ value: '', label: 'Tất cả' }, ...Object.values(POST_TYPE).map((value) => ({ value, label: POST_TYPE_LABEL[value] }))];

export default function PostListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const pageNumber = Number(searchParams.get('pageNumber')) || DEFAULT_PAGE_NUMBER;
  const postType = searchParams.get('postType') ?? '';
  const tag = searchParams.get('tag') ?? '';
  const softSkillId = searchParams.get('softSkillId') ?? '';

  const { data: pagedPosts, isLoading, isError, error, refetch, isFetching } = usePosts({
    pageNumber,
    pageSize: PAGE_SIZE,
    postType,
    tag,
    softSkillId,
  });
  const { data: taxonomy } = usePostTaxonomy();
  const hasFilters = Boolean(postType || tag || softSkillId);

  const updateParams = (changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => (value ? next.set(key, value) : next.delete(key)));
      if (!('pageNumber' in changes)) next.delete('pageNumber');
      return next;
    });
  };

  const renderPosts = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;
    if (!pagedPosts?.items.length) {
      return (
        <EmptyState message="Chưa có bài phù hợp">
          {hasFilters && (
            <button type="button" className="btn btn-outline" onClick={() => setSearchParams({})}>
              Xóa bộ lọc
            </button>
          )}
        </EmptyState>
      );
    }

    return (
      <>
        <ul className={styles.grid} aria-busy={isFetching}>
          {pagedPosts.items.map((post) => (
            <li key={post.postId} className={styles.card}>
              <p className={styles.meta}>
                <span className={styles.type}>{POST_TYPE_LABEL[post.postType] ?? post.postType}</span>
                {post.publishedAt && <span> · {formatDate(post.publishedAt)}</span>}
                <span> · {post.authorName}</span>
              </p>
              <h2 className={styles.cardTitle}>
                <Link to={ROUTES.GUIDE_DETAIL(post.slug)}>{post.title}</Link>
              </h2>
              {post.excerpt && <p className={styles.excerpt}>{post.excerpt}</p>}
              {post.tags.length > 0 && (
                <p className={styles.tags}>
                  {post.tags.map((postTag) => (
                    <span key={postTag.slug}>#{postTag.name}</span>
                  ))}
                </p>
              )}
            </li>
          ))}
        </ul>
        <Pagination
          pageNumber={pagedPosts.pageNumber}
          totalPages={pagedPosts.totalPages}
          hasPrevious={pagedPosts.hasPrevious}
          hasNext={pagedPosts.hasNext}
          onPageChange={(page) => updateParams({ pageNumber: String(page) })}
        />
      </>
    );
  };

  return (
    <div className={`container ${styles.page}`}>
      <header className={styles.header}>
        <h1>Cẩm nang trekking</h1>
        <p>Hướng dẫn chuẩn bị, kỹ năng và kinh nghiệm từ đội guide RenTrekk.</p>
      </header>

      <div className={styles.filters}>
        <div className={styles.tabs} role="group" aria-label="Loại bài">
          {TYPE_TABS.map((tab) => (
            <button
              key={tab.value || 'all'}
              type="button"
              className={styles.tab}
              aria-pressed={postType === tab.value}
              onClick={() => updateParams({ postType: tab.value })}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {taxonomy?.softSkills.length > 0 && (
          <label className={styles.select}>
            <span>Kỹ năng</span>
            <select value={softSkillId} onChange={(event) => updateParams({ softSkillId: event.target.value })}>
              <option value="">Tất cả</option>
              {taxonomy.softSkills.map((skill) => (
                <option key={skill.softSkillId} value={skill.softSkillId}>
                  {skill.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {taxonomy?.tags.length > 0 && (
        <div className={styles.tagFilter} role="group" aria-label="Lọc theo tag">
          {taxonomy.tags.map((taxonomyTag) => (
            <button
              key={taxonomyTag.slug}
              type="button"
              className={styles.tagChip}
              aria-pressed={tag === taxonomyTag.slug}
              onClick={() => updateParams({ tag: tag === taxonomyTag.slug ? '' : taxonomyTag.slug })}
            >
              #{taxonomyTag.name}
            </button>
          ))}
        </div>
      )}

      {renderPosts()}
    </div>
  );
}
