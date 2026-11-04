import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmptyState from '@/components/EmptyState';
import ErrorState from '@/components/ErrorState';
import OutdoorIcon from '@/components/OutdoorIcon';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/utils/formatDate';
import { useGuideTrips } from '../hooks/useGuidePortal';
import styles from './GuideTripsPage.module.css';

const MOCK_GUIDE_TRIPS = {
  today: [
    {
      tripId: 'TRIP-2026-FANSIPAN',
      groupId: 'grp-01',
      groupName: 'Đoàn 01 - Chinh phục Fansipan',
      tripStatus: 'IN_PROGRESS',
      tourName: 'Trekking Fansipan - Nóc Nhà Đông Dương',
      startAt: new Date().toISOString(),
      endAt: new Date(Date.now() + 2 * 24 * 3600 * 1000).toISOString(),
      participantCount: 8,
      maxParticipants: 10,
      meetingLocation: {
        name: 'Trạm Tôn - Cổng VQG Hoàng Liên',
        address: 'Xã San Sả Hồ, Sa Pa, Lào Cai',
        latitude: 22.3503,
        longitude: 103.7745,
      },
    },
  ],
  upcoming: [
    {
      tripId: 'TRIP-2026-TAXUA',
      groupId: 'grp-02',
      groupName: 'Đoàn 02 - Săn mây Tà Xùa',
      tripStatus: 'OPEN',
      tourName: 'Săn mây Tà Xùa - Sống Lưng Khủng Long',
      startAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      endAt: new Date(Date.now() + 9 * 24 * 3600 * 1000).toISOString(),
      participantCount: 12,
      maxParticipants: 15,
      meetingLocation: {
        name: 'Ngã Ba Bản Tà Xùa',
        address: 'Bắc Yên, Sơn La',
        latitude: 21.2854,
        longitude: 104.4628,
      },
    },
  ],
  completed: [
    {
      tripId: 'TRIP-2026-PUTALENG',
      groupId: 'grp-00',
      groupName: 'Đoàn 00 - Pú Tả Lèng mùa đỗ quyên',
      tripStatus: 'COMPLETED',
      tourName: 'Chinh phục Đỉnh Pú Tả Lèng',
      startAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      endAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
      participantCount: 10,
      maxParticipants: 10,
      meetingLocation: {
        name: 'Bản Tả Lèng',
        address: 'Tam Đường, Lai Châu',
        latitude: 22.385,
        longitude: 103.582,
      },
    },
  ],
};

// Chuẩn hóa trạng thái kỹ thuật sang nhãn tiếng Việt thực địa thân thiện
function getStatusConfig(status) {
  switch (status) {
    case 'IN_PROGRESS':
      return {
        label: 'Đang diễn ra',
        className: styles.statusInProgress,
        dotColor: '#22c55e',
      };
    case 'OPEN':
      return {
        label: 'Sắp khởi hành',
        className: styles.statusOpen,
        dotColor: '#0284c7',
      };
    case 'CLOSED_FOR_BOOKING':
      return {
        label: 'Đã chốt danh sách',
        className: styles.statusClosed,
        dotColor: '#d97706',
      };
    case 'COMPLETED':
      return {
        label: 'Đã hoàn thành',
        className: styles.statusCompleted,
        dotColor: '#64748b',
      };
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        className: styles.statusCancelled,
        dotColor: '#ef4444',
      };
    default:
      return {
        label: status || 'Chưa xác định',
        className: styles.statusCompleted,
        dotColor: '#94a3b8',
      };
  }
}

export default function GuideTripsPage() {
  const [tab, setTab] = useState('today'); // 'today' | 'upcoming' | 'completed'
  const [search, setSearch] = useState('');
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [expandedCardIds, setExpandedCardIds] = useState(new Set());
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== 'undefined' ? navigator.onLine : true));

  const { data: rawTrips, isLoading, isError, error, refetch } = useGuideTrips(tab);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const trips = useMemo(() => {
    const list = rawTrips && rawTrips.length > 0 ? rawTrips : MOCK_GUIDE_TRIPS[tab] || [];
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (t) =>
        t.tourName?.toLowerCase().includes(q) ||
        t.groupName?.toLowerCase().includes(q) ||
        t.tripId?.toLowerCase().includes(q),
    );
  }, [rawTrips, tab, search]);

  const selectedTrip = useMemo(() => {
    if (!trips.length) return null;
    return trips.find((t) => t.tripId === selectedTripId) || trips[0];
  }, [trips, selectedTripId]);

  const toggleExpand = (tripId, e) => {
    e.stopPropagation();
    setExpandedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(tripId)) next.delete(tripId);
      else next.add(tripId);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}>
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message || 'Không thể tải lịch dẫn đoàn. Vui lòng thử lại.'}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Banner thông báo ngoại tuyến thực địa */}
      {!isOnline && (
        <div className={styles.offlineAlert} role="alert">
          <OutdoorIcon name="alert-triangle" size={18} />
          <span>Chế độ Ngoại tuyến: Bạn đang ở vùng mất sóng mạng. Dữ liệu đã lưu tạm để điểm danh an toàn.</span>
        </div>
      )}

      {/* Header & Bộ điều khiển (Tabs + Search) */}
      <div className={styles.dashboardHeader}>
        <div className={styles.titleGroup}>
          <h1>Lịch dẫn đoàn thực địa</h1>
          <p>Danh sách các đoàn được phân công phụ trách và công cụ điều hành tác nghiệp.</p>
        </div>

        <div className={styles.controlsRow}>
          {/* Tab Switcher */}
          <div className={styles.tabBar} role="tablist" aria-label="Bộ lọc chuyến đi">
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'today'}
              className={`${styles.tabItem} ${tab === 'today' ? styles.tabItemActive : ''}`}
              onClick={() => setTab('today')}
            >
              <span>Hôm nay</span>
              <span className={styles.tabCount}>{MOCK_GUIDE_TRIPS.today.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'upcoming'}
              className={`${styles.tabItem} ${tab === 'upcoming' ? styles.tabItemActive : ''}`}
              onClick={() => setTab('upcoming')}
            >
              <span>Sắp tới</span>
              <span className={styles.tabCount}>{MOCK_GUIDE_TRIPS.upcoming.length}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === 'completed'}
              className={`${styles.tabItem} ${tab === 'completed' ? styles.tabItemActive : ''}`}
              onClick={() => setTab('completed')}
            >
              <span>Đã xong</span>
              <span className={styles.tabCount}>{MOCK_GUIDE_TRIPS.completed.length}</span>
            </button>
          </div>

          {/* Quick Search */}
          <div className={styles.searchBox}>
            <span className={styles.searchIcon} aria-hidden="true">
              🔍
            </span>
            <input
              type="search"
              className={styles.searchInput}
              placeholder="Tìm theo tên tour hoặc đoàn…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bố cục Workspace chia đôi (Master - Detail trên Desktop) */}
      {trips.length === 0 ? (
        <div className={styles.emptyCard}>
          <div className={styles.emptyIcon}>🏕️</div>
          <h2 className={styles.emptyTitle}>Chưa có chuyến đi nào trong mục này</h2>
          <p className={styles.emptyText}>
            {tab === 'today'
              ? 'Hôm nay bạn không có lịch khởi hành. Hãy kiểm tra các chuyến ở tab Sắp tới.'
              : tab === 'upcoming'
                ? 'Hiện chưa có lịch phân công chuyến đi mới cho bạn trong thời gian tới.'
                : 'Chưa có chuyến đi nào được lưu trữ trong danh sách đã hoàn tất.'}
          </p>
        </div>
      ) : (
        <div className={styles.splitWorkspace}>
          {/* CỘT TRÁI (Master List): Danh sách các đoàn được phân công */}
          <div className={styles.masterPane}>
            <div className={styles.tripsList}>
              {trips.map((item) => {
                const statusConfig = getStatusConfig(item.tripStatus);
                const isSelected = selectedTrip?.tripId === item.tripId;
                const isExpanded = expandedCardIds.has(item.tripId);
                const isOngoing = item.tripStatus === 'IN_PROGRESS';

                const mapsUrl =
                  item.meetingLocation?.latitude && item.meetingLocation?.longitude
                    ? `https://www.google.com/maps/search/?api=1&query=${item.meetingLocation.latitude},${item.meetingLocation.longitude}`
                    : null;

                return (
                  <div
                    key={`${item.tripId}-${item.groupId}`}
                    className={`${styles.tripCard} ${isSelected ? styles.tripCardSelected : ''}`}
                    onClick={() => setSelectedTripId(item.tripId)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedTripId(item.tripId)}
                    aria-label={`Chọn đoàn ${item.groupName}`}
                  >
                    {/* Top Row: Group Badge + Friendly Vietnamese Status */}
                    <div className={styles.cardTopRow}>
                      <span className={styles.groupBadge}>{item.groupName}</span>
                      <span className={`${styles.statusBadge} ${statusConfig.className}`}>
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: statusConfig.dotColor,
                          }}
                        />
                        {statusConfig.label}
                      </span>
                    </div>

                    {/* Tour Name */}
                    <h2 className={styles.cardTourTitle}>{item.tourName}</h2>

                    {/* Core Info Chips (Thông tin cốt lõi, loại bỏ mô tả rác) */}
                    <div className={styles.chipsRow}>
                      <span className={styles.chip} title="Thời gian khởi hành">
                        <span className={styles.chipIcon}>📅</span>
                        <span>{formatDate(item.startAt)}</span>
                      </span>

                      <span className={styles.chip} title="Sĩ số đoàn">
                        <span className={styles.chipIcon}>👥</span>
                        <span>
                          <strong>{item.participantCount}</strong>/{item.maxParticipants} khách
                        </span>
                      </span>

                      {item.meetingLocation?.name && (
                        <span className={styles.chip} title={item.meetingLocation.name}>
                          <span className={styles.chipIcon}>📍</span>
                          <span>{item.meetingLocation.name.split('-')[0].trim()}</span>
                        </span>
                      )}
                    </div>

                    {/* Mobile-Only Progressive Disclosure (Xem chi tiết điểm tập kết khi cần) */}
                    <div className={styles.mobileOnly} style={{ marginTop: '2px' }}>
                      <button
                        type="button"
                        className={styles.disclosureToggle}
                        onClick={(e) => toggleExpand(item.tripId, e)}
                        aria-expanded={isExpanded}
                      >
                        <span>{isExpanded ? '▴ Thu gọn điểm hẹn' : '▾ Chi tiết điểm tập kết & bản đồ'}</span>
                      </button>

                      {isExpanded && item.meetingLocation && (
                        <div className={styles.expandedDetails}>
                          <div>
                            <strong>Điểm hẹn:</strong> {item.meetingLocation.name}
                          </div>
                          <div>
                            <strong>Địa chỉ:</strong> {item.meetingLocation.address}
                          </div>
                          {mapsUrl && (
                            <a
                              href={mapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.mapsLink}
                              onClick={(e) => e.stopPropagation()}
                            >
                              Mở vị trí trên Google Maps ↗
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Mobile-Only Action Hierarchy (Nổi bật thao tác quan trọng nhất) */}
                    <div className={styles.mobileActions} onClick={(e) => e.stopPropagation()}>
                      {/* Thao tác Trọng tâm (Primary CTA) theo trạng thái */}
                      {isOngoing ? (
                        <Link to={ROUTES.GUIDE_ATTENDANCE(item.tripId)} className={styles.btnAccentFull}>
                          <OutdoorIcon name="check-circle" size={18} />
                          <span>Điểm danh nhanh thực địa</span>
                        </Link>
                      ) : (
                        <Link to={ROUTES.GUIDE_TRIP_GROUP(item.tripId)} className={styles.btnPrimaryFull}>
                          <OutdoorIcon name="users" size={18} />
                          <span>Danh sách khách & Khẩn cấp</span>
                        </Link>
                      )}

                      {/* Các thao tác phụ (Secondary Actions) */}
                      <div className={styles.secondaryActionRow}>
                        {isOngoing ? (
                          <Link to={ROUTES.GUIDE_TRIP_GROUP(item.tripId)} className={styles.btnSecondarySmall}>
                            Ds Khách
                          </Link>
                        ) : (
                          <Link to={ROUTES.GUIDE_ATTENDANCE(item.tripId)} className={styles.btnSecondarySmall}>
                            Điểm danh
                          </Link>
                        )}
                        <Link to={ROUTES.GUIDE_ITINERARY(item.tripId)} className={styles.btnSecondarySmall}>
                          Lịch trình
                        </Link>
                        <Link to={ROUTES.GUIDE_PROVIDED_ITEMS(item.tripId)} className={styles.btnSecondarySmall}>
                          Đồ cấp
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CỘT PHẢI (Detail Pane): Bàn làm việc & Chi tiết đoàn đang chọn (Chỉ trên Desktop) */}
          <div className={styles.detailPane}>
            {selectedTrip ? (
              <div className={styles.detailCard}>
                {/* Hero Header */}
                <div className={styles.detailHero}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.groupBadge}>{selectedTrip.groupName}</span>
                    <span className={`${styles.statusBadge} ${getStatusConfig(selectedTrip.tripStatus).className}`}>
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          backgroundColor: getStatusConfig(selectedTrip.tripStatus).dotColor,
                        }}
                      />
                      {getStatusConfig(selectedTrip.tripStatus).label}
                    </span>
                  </div>

                  <h2 className={styles.detailTitle}>{selectedTrip.tourName}</h2>
                </div>

                {/* 3-Column Metrics Grid */}
                <div className={styles.detailStatsGrid}>
                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Thời gian chuyến</span>
                    <span className={styles.statValue}>{formatDate(selectedTrip.startAt)}</span>
                    <span className={styles.statSubtext}>→ {formatDate(selectedTrip.endAt)}</span>
                  </div>

                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Sĩ số thành viên</span>
                    <span className={styles.statValue}>
                      {selectedTrip.participantCount} / {selectedTrip.maxParticipants} khách
                    </span>
                    <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 4 }}>
                      <div
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round((selectedTrip.participantCount / selectedTrip.maxParticipants) * 100),
                          )}%`,
                          height: '100%',
                          background: '#15803d',
                          borderRadius: 2,
                        }}
                      />
                    </div>
                  </div>

                  <div className={styles.statBox}>
                    <span className={styles.statLabel}>Điểm tập kết đoàn</span>
                    <span className={styles.statValue} style={{ fontSize: '0.88rem' }}>
                      {selectedTrip.meetingLocation?.name || 'Chưa cập nhật'}
                    </span>
                    {selectedTrip.meetingLocation?.latitude && selectedTrip.meetingLocation?.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${selectedTrip.meetingLocation.latitude},${selectedTrip.meetingLocation.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.mapsLink}
                        style={{ fontSize: '0.78rem', marginTop: 2 }}
                      >
                        Mở Google Maps ↗
                      </a>
                    )}
                  </div>
                </div>

                {/* Bàn Điều hành Thực địa (Action Hub) */}
                <div className={styles.actionHub}>
                  <div className={styles.actionHubHeader}>
                    <h3 className={styles.actionHubTitle}>Công cụ điều hành thực địa</h3>
                    <span className={styles.actionBadge}>Đã đồng bộ</span>
                  </div>

                  {/* Primary CTA nổi bật theo trạng thái */}
                  {selectedTrip.tripStatus === 'IN_PROGRESS' ? (
                    <Link
                      to={ROUTES.GUIDE_ATTENDANCE(selectedTrip.tripId)}
                      className={`${styles.primaryCtaBtn} ${styles.primaryCtaInProgress}`}
                    >
                      <OutdoorIcon name="check-circle" size={20} />
                      <span>Thực hiện Điểm danh nhanh tại chặng hiện tại</span>
                    </Link>
                  ) : (
                    <Link
                      to={ROUTES.GUIDE_TRIP_GROUP(selectedTrip.tripId)}
                      className={`${styles.primaryCtaBtn} ${styles.primaryCtaOpen}`}
                    >
                      <OutdoorIcon name="users" size={20} />
                      <span>Xem danh sách thành viên & Liên hệ khẩn cấp</span>
                    </Link>
                  )}

                  {/* Secondary Action Cards (Lưới 3 thao tác) */}
                  <div className={styles.secondaryCardsGrid}>
                    <Link to={ROUTES.GUIDE_TRIP_GROUP(selectedTrip.tripId)} className={styles.shortcutCard}>
                      <span className={styles.shortcutCardTitle}>
                        <OutdoorIcon name="users" size={16} />
                        <span>Danh sách khách</span>
                      </span>
                      <span className={styles.shortcutCardDesc}>Tra cứu SĐT, người liên hệ khẩn cấp và bệnh lý.</span>
                    </Link>

                    <Link to={ROUTES.GUIDE_ITINERARY(selectedTrip.tripId)} className={styles.shortcutCard}>
                      <span className={styles.shortcutCardTitle}>
                        <OutdoorIcon name="calendar" size={16} />
                        <span>Lịch trình chặng</span>
                      </span>
                      <span className={styles.shortcutCardDesc}>Thời gian, điểm dừng chân và mốc hoạt động.</span>
                    </Link>

                    <Link to={ROUTES.GUIDE_PROVIDED_ITEMS(selectedTrip.tripId)} className={styles.shortcutCard}>
                      <span className={styles.shortcutCardTitle}>
                        <OutdoorIcon name="package" size={16} />
                        <span>Đồ cấp cho đoàn</span>
                      </span>
                      <span className={styles.shortcutCardDesc}>Quản lý lều bạt, gậy trek, bộ sơ cứu và đàm.</span>
                    </Link>
                  </div>
                </div>

                {/* Hướng dẫn tác nghiệp an toàn */}
                <div className={styles.fieldTipsCard}>
                  <div className={styles.tipIcon}>💡</div>
                  <div>
                    <strong>Lưu ý thực địa:</strong> Khi vào vùng rừng mất kết nối Internet, bạn vẫn có thể thực hiện
                    điểm danh bình thường. Ứng dụng sẽ lưu bản ghi trên thiết bị và tự động đồng bộ khi trở lại vùng có
                    sóng.
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState message="Chọn một đoàn từ danh sách bên trái để xem bảng điều hành chi tiết." />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
