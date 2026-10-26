import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import Pagination from '@/components/Pagination';
import Spinner from '@/components/Spinner';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import { useDebounce } from '@/hooks/useDebounce';
import TourCard from '../components/TourCard';
import { useTours } from '../hooks/useTours';
import styles from './TourListPage.module.css';

export default function TourListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageNumber = Number(searchParams.get('pageNumber')) || DEFAULT_PAGE_NUMBER;
  const search = searchParams.get('search') ?? '';
  const statusTab = searchParams.get('status') ?? 'all';
  const difficultyLevel = searchParams.get('difficultyLevel') ?? '';

  const [keyword, setKeyword] = useState(search);
  const debouncedKeyword = useDebounce(keyword.trim());

  useEffect(() => {
    if (debouncedKeyword === search) return;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (debouncedKeyword) next.set('search', debouncedKeyword);
        else next.delete('search');
        next.delete('pageNumber');
        return next;
      },
      { replace: true },
    );
  }, [debouncedKeyword, search, setSearchParams]);

  const handleTabChange = (status) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (status === 'all') next.delete('status');
      else next.set('status', status);
      next.delete('pageNumber');
      return next;
    });
  };

  const handleDifficultyChange = (e) => {
    const val = e.target.value;
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (val) next.set('difficultyLevel', val);
      else next.delete('difficultyLevel');
      next.delete('pageNumber');
      return next;
    });
  };

  const handlePageChange = (nextPageNumber) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('pageNumber', String(nextPageNumber));
      return next;
    });
  };

  // Convert tab to API filter
  const apiStatus = statusTab === 'all' ? undefined : statusTab;

  const {
    data: pagedTours,
    isLoading,
    isError,
    error,
    refetch,
  } = useTours({
    pageNumber,
    pageSize: DEFAULT_PAGE_SIZE,
    search: search || undefined,
    status: apiStatus,
    difficultyLevel: difficultyLevel || undefined,
  });

  const renderContent = () => {
    if (isLoading) return <Spinner />;
    if (isError) return <ErrorState message={error.message || 'Không thể tải danh sách tour'} onRetry={refetch} />;
    if (!pagedTours?.items || pagedTours.items.length === 0) {
      return <EmptyState message="Không tìm thấy tour trekking nào phù hợp." />;
    }

    return (
      <>
        <div className={styles.tourGrid}>
          {pagedTours.items.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>

        {pagedTours.totalPages > 1 && (
          <Pagination
            pageNumber={pagedTours.pageNumber}
            totalPages={pagedTours.totalPages}
            hasPrevious={pagedTours.hasPrevious}
            hasNext={pagedTours.hasNext}
            onPageChange={handlePageChange}
          />
        )}
      </>
    );
  };

  return (
    <section>
      <div className={styles.headerSection}>
        <h1 className={styles.title}>Combo Tour Trekking Trọn Gói</h1>
        <p className={styles.subtitle}>
          Khám phá những cung đường trekking đẹp nhất Việt Nam cùng trang bị chuẩn kiểm định và porter chuyên nghiệp.
        </p>
      </div>

      <div className={styles.filterBar}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tabBtn} ${statusTab === 'all' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('all')}
          >
            Tất cả
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${statusTab === 'Active' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('Active')}
          >
            Đang mở
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${statusTab === 'Expired' ? styles.tabActive : ''}`}
            onClick={() => handleTabChange('Expired')}
          >
            Hết hạn
          </button>
        </div>

        <div className={styles.filterControls}>
          <select
            className={styles.selectInput}
            value={difficultyLevel}
            onChange={handleDifficultyChange}
          >
            <option value="">Tất cả độ khó</option>
            <option value="Dễ">Dễ</option>
            <option value="Vừa phải">Vừa phải</option>
            <option value="Khó">Khó</option>
            <option value="Thử thách">Thử thách</option>
          </select>

          <input
            type="search"
            className={styles.searchInput}
            placeholder="Tìm theo tên tour, địa điểm..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {renderContent()}
    </section>
  );
}
