import { Link, useParams } from 'react-router-dom';
import Breadcrumb from '@/components/Breadcrumb';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { POST_TYPE, POST_TYPE_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate } from '@/utils/formatDate';
import { usePost, usePosts } from '../hooks/usePosts';
import { parsePostContent } from '../utils/postContent';
import styles from './PostDetailPage.module.css';

export default function PostDetailPage() {
  const { slug } = useParams();
  const { data: post, isLoading, isError, error, refetch } = usePost(slug);
  const { data: sameType } = usePosts(
    { pageNumber: 1, pageSize: 6, postType: post?.postType },
    Boolean(post?.postType),
  );
  const latestPosts = (sameType?.items ?? []).filter((item) => item.slug !== slug).slice(0, 5);

  if (isLoading) return <Spinner />;
  if (isError && error?.statusCode === 404) {
    return (
      <div className={`container ${styles.page}`}>
        <div className="state-box">
          <p>Bài viết không tồn tại hoặc chưa được xuất bản.</p>
          <Link to={ROUTES.GUIDES} className="btn btn-outline">
            Về trang bài viết
          </Link>
        </div>
      </div>
    );
  }
  if (isError) return <ErrorState message={error?.message} onRetry={refetch} />;

  const typeLabel = POST_TYPE_LABEL[post.postType] ?? post.postType;

  return (
    <div className={`container ${styles.page}`}>
      <article className={styles.article}>
        <Breadcrumb
          items={[
            { label: 'Trang chủ', to: ROUTES.HOME },
            { label: 'Bài viết', to: ROUTES.GUIDES },
            typeLabel ? { label: typeLabel, to: `${ROUTES.GUIDES}?postType=${post.postType}` } : null,
            { label: post.title },
          ]}
        />

        <header>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.meta}>
            <span className={styles.type}>{typeLabel}</span>
            <span> · {post.authorName}</span>
            {post.publishedAt && <span> · {formatDate(post.publishedAt)}</span>}
          </p>
        </header>

        <div className={styles.content}>
          {parsePostContent(post.content).map((block, index) => {
            switch (block.type) {
              case 'heading':
                return <h2 key={index}>{block.text}</h2>;
              case 'image':
                return (
                  <figure key={index} className={styles.media}>
                    <img src={block.src} alt={block.alt} loading={index < 3 ? 'eager' : 'lazy'} />
                    {block.alt && <figcaption>{block.alt}</figcaption>}
                  </figure>
                );
              case 'youtube':
                return (
                  <div key={index} className={`${styles.media} ${styles.video}`}>
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${block.videoId}`}
                      title={`Video YouTube trong bài ${post.title}`}
                      loading="lazy"
                      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              case 'video':
                return (
                  <div key={index} className={`${styles.media} ${styles.video}`}>
                    <video src={block.src} controls preload="metadata" />
                  </div>
                );
              default:
                return <p key={index}>{block.text}</p>;
            }
          })}
        </div>
      </article>

      <aside className={styles.aside}>
        <section>
          <h2 className={styles.asideTitle}>Danh mục</h2>
          <ul className={styles.categoryList}>
            {Object.values(POST_TYPE).map((type) => (
              <li key={type}>
                <Link
                  to={`${ROUTES.GUIDES}?postType=${type}`}
                  aria-current={type === post.postType ? 'true' : undefined}
                >
                  {POST_TYPE_LABEL[type]}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {latestPosts.length > 0 && (
          <section>
            <h2 className={styles.asideTitle}>Bài mới cùng danh mục</h2>
            <ul className={styles.list}>
              {latestPosts.map((related) => (
                <li key={related.postId} className={styles.relatedPost}>
                  <Link to={ROUTES.GUIDE_DETAIL(related.slug)}>{related.title}</Link>
                  {related.publishedAt && (
                    <span className={styles.relatedDate}>{formatDate(related.publishedAt)}</span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {post.tags.length > 0 && (
          <section>
            <h2 className={styles.asideTitle}>Tag</h2>
            <div className={styles.chips}>
              {post.tags.map((tag) => (
                <Link key={tag.slug} to={`${ROUTES.GUIDES}?tag=${tag.slug}`} className={styles.tagLink}>
                  #{tag.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {post.softSkills.length > 0 && (
          <section>
            <h2 className={styles.asideTitle}>Kỹ năng</h2>
            <div className={styles.chips}>
              {post.softSkills.map((skill) => (
                <span key={skill.softSkillId} className={styles.skill}>
                  {skill.name}
                </span>
              ))}
            </div>
          </section>
        )}

        {post.relatedTours.length > 0 && (
          <section>
            <h2 className={styles.asideTitle}>Tour liên quan</h2>
            <ul className={styles.list}>
              {post.relatedTours.map((tour) => (
                <li key={tour.tourId} className={styles.tourCard}>
                  <Link to={ROUTES.TOUR_DETAIL(tour.tourId)}>{tour.name}</Link>
                  <span>
                    {tour.durationDays} ngày {tour.durationNights} đêm · Từ {formatCurrency(tour.basePrice)}
                    /người
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {post.sameTagPosts.length > 0 && (
          <section>
            <h2 className={styles.asideTitle}>Cùng tag</h2>
            <ul className={styles.list}>
              {post.sameTagPosts.map((related) => (
                <li key={related.postId} className={styles.relatedPost}>
                  <span className={styles.type}>{POST_TYPE_LABEL[related.postType] ?? related.postType}</span>
                  <Link to={ROUTES.GUIDE_DETAIL(related.slug)}>{related.title}</Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </aside>
    </div>
  );
}
