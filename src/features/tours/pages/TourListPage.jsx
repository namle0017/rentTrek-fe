import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Pagination from '@/components/Pagination';
import { CardSkeleton } from '@/components/skeleton';
import { DEFAULT_PAGE_NUMBER, DEFAULT_PAGE_SIZE } from '@/constants/config';
import TourCard from '../components/TourCard';
import { useTours } from '../hooks/useTours';
import styles from './TourListPage.module.css';

// Value = string BE nhận ở query `status` (TourQueryRequest)
const DIFFICULTY_OPTIONS = ['Dễ', 'Trung bình', 'Khó', 'Thử thách'];

const DURATION_OPTIONS = [
  { value: '2', label: '2N1Đ' },
  { value: '3', label: '3N2Đ' },
];

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1800&q=80';

export default function TourListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageNumber = Number(searchParams.get('pageNumber')) || DEFAULT_PAGE_NUMBER;
  const search = searchParams.get('search') ?? '';
  const difficultyLevel = searchParams.get('difficultyLevel') ?? '';
  const durationDays = searchParams.get('durationDays') ?? '';

  const [keyword, setKeyword] = useState(search);

  const filters = {
    search: search || undefined,
    difficultyLevel: difficultyLevel || undefined,
    durationDays: durationDays || undefined,
  };

  const updateParams = (changes) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      Object.entries(changes).forEach(([key, value]) => {
        if (value) next.set(key, value);
        else next.delete(key);
      });
      if (!('pageNumber' in changes)) next.delete('pageNumber');
      return next;
    });
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateParams({
      search: keyword.trim(),
      difficultyLevel: form.get('difficultyLevel'),
      durationDays: form.get('durationDays'),
    });
  };

  const {
    data: pagedTours,
    isLoading,
    isError,
    error,
    refetch,
  } = useTours({ pageNumber, pageSize: DEFAULT_PAGE_SIZE, status: 'Active', ...filters });

  const renderContent = () => {
    if (isLoading) return <CardSkeleton count={6} />;
    if (isError) {
      return <ErrorState message={error.message || 'Không thể tải danh sách tour'} onRetry={refetch} />;
    }
    if (!pagedTours?.items?.length) {
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
            onPageChange={(next) => updateParams({ pageNumber: String(next) })}
          />
        )}
      </>
    );
  };

  return (
    <>
      <section className={styles.hero} style={{ '--hero-image': `url(${HERO_IMAGE})` }}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.heroKicker}>COMBO TREKKING 2 NGÀY 1 ĐÊM</span>
          <h1 className={styles.heroTitle}>Một cuối tuần, trọn vẹn một cung đường</h1>
          <p className={styles.heroText}>
            Tour trekking chọn lọc, lịch trình gọn gàng và trang bị thiết yếu đã sẵn sàng. Chỉ cần chọn cung
            đường phù hợp với bạn.
          </p>
          <ul className={styles.heroChips}>
            <li>Nhóm nhỏ 8–12 người</li>
            <li>Hướng dẫn viên bản địa</li>
            <li>Trang bị kiểm định</li>
          </ul>
        </div>
      </section>

      <div className="container">
        <form className={styles.searchCard} onSubmit={handleSearchSubmit} role="search">
          <label className={styles.searchField}>
            <span>Điểm đến</span>
            <input
              type="search"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Sa Pa, Đà Lạt..."
              maxLength={200}
            />
          </label>
          <label className={styles.searchField}>
            <span>Thời lượng</span>
            <select name="durationDays" defaultValue={durationDays} key={`d-${durationDays}`}>
              <option value="">Tất cả</option>
              {DURATION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.searchField}>
            <span>Độ khó</span>
            <select name="difficultyLevel" defaultValue={difficultyLevel} key={`l-${difficultyLevel}`}>
              <option value="">Tất cả</option>
              {DIFFICULTY_OPTIONS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.searchField}>
            <span>Hình thức</span>
            <strong>Camping + Trekking</strong>
          </div>
          <button type="submit" className={styles.searchButton}>
            <OutdoorIcon name="search" size={17} />
            Tìm kiếm tour
          </button>
        </form>

        <section className={styles.listSection} aria-labelledby="tour-list-title">
          <div className={styles.sectionHeader}>
            <div>
              <span className={styles.kicker}>CUNG ĐƯỜNG ĐƯỢC TUYỂN CHỌN</span>
              <h2 id="tour-list-title" className={styles.sectionTitle}>
                Combo 2N1Đ đang chờ bạn
              </h2>
              <p className={styles.sectionText}>
                Khởi hành cuối tuần · Trọn gói hướng dẫn và trang bị thiết yếu
              </p>
            </div>
          </div>

          {renderContent()}
        </section>
      </div>
    </>
  );
}
