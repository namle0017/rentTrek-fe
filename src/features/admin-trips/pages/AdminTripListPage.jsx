import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import Pagination from '@/components/Pagination';
import { TableSkeleton } from '@/components/skeleton';
import { TRIP_STATUS, TRIP_STATUS_LABEL } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDate, formatDateTime } from '@/utils/formatDate';
import { useAdminTrips } from '../hooks/useAdminTrips';
import styles from './AdminTripOps.module.css';

const VIETNAMESE_WEEKDAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

const VIETNAMESE_FULL_WEEKDAYS = {
  0: 'Chủ Nhật',
  1: 'Thứ Hai',
  2: 'Thứ Ba',
  3: 'Thứ Tư',
  4: 'Thứ Năm',
  5: 'Thứ Sáu',
  6: 'Thứ Bảy',
};

function getStatusBadgeClass(status) {
  switch (status) {
    case TRIP_STATUS.OPEN:
      return styles.badgePositive;
    case TRIP_STATUS.IN_PROGRESS:
      return styles.badgeInfo;
    case TRIP_STATUS.CLOSED_FOR_BOOKING:
      return styles.badgeWarning;
    case TRIP_STATUS.CANCELLED:
      return styles.badgeDanger;
    default:
      return styles.badgeNeutral;
  }
}

// Rút gọn thông minh tên Tour để hiển thị gọn gàng, tránh bị cắt chữ thô bạo
function formatShortTourTitle(tourName) {
  if (!tourName) return 'Chuyến đi';
  const durationMatch = tourName.match(/\(\d+N\d+Đ\)/i);
  const duration = durationMatch ? durationMatch[0] : '';
  const cleanName = tourName
    .replace(/\(\d+N\d+Đ\)/i, '')
    .split('-')[0]
    .replace(/^(Trekking|Chinh phục|Khám phá|Săn mây)\s+/i, '')
    .trim();
  return duration ? `${cleanName} ${duration}` : cleanName;
}

// Xác định vai trò của ngày đối với chuyến đi: Khởi hành (Ngày 1) / Đang đi / Kết thúc
function getTripDayRole(trip, dateStr) {
  const startStr = dayjs(trip.startAt).format('YYYY-MM-DD');
  const endStr = dayjs(trip.endAt).format('YYYY-MM-DD');
  if (dateStr < startStr || dateStr > endStr) return null;

  const totalDays = Math.max(1, dayjs(endStr).diff(dayjs(startStr), 'day') + 1);
  const currentDayIndex = dayjs(dateStr).diff(dayjs(startStr), 'day') + 1;

  if (dateStr === startStr) {
    return {
      type: 'departure',
      dayIndex: currentDayIndex,
      totalDays,
      label: `Khởi hành · Ngày ${currentDayIndex}/${totalDays}`,
      shortLabel: 'Khởi hành',
    };
  }
  if (dateStr === endStr) {
    return {
      type: 'return',
      dayIndex: currentDayIndex,
      totalDays,
      label: `Kết thúc · Ngày ${currentDayIndex}/${totalDays}`,
      shortLabel: 'Kết thúc',
    };
  }
  return {
    type: 'ongoing',
    dayIndex: currentDayIndex,
    totalDays,
    label: `Đang đi · Ngày ${currentDayIndex}/${totalDays}`,
    shortLabel: `N${currentDayIndex}/${totalDays}`,
  };
}

const MOCK_ADMIN_TRIPS = [
  {
    tripId: 'TRIP-2026-BACHMOC',
    tourId: 'tour-bachmoc-01',
    tourName: 'Bạch Mộc Lương Tử - Kỳ Quan Mây Trắng (3N2Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-11-06T06:00:00Z',
    endAt: '2026-11-08T18:00:00Z',
    totalSlots: 15,
    soldSlots: 15,
    minParticipants: 8,
    isUnderCapacity: false,
    pricePerPerson: 3600000,
    managerFullName: 'Đặng Tuấn Anh',
    status: TRIP_STATUS.COMPLETED,
  },
  {
    tripId: 'TRIP-2026-LANHA',
    tourId: 'tour-lanha-02',
    tourName: 'Chèo Kayak & Khám Phá Vịnh Lan Hạ (2N1Đ)',
    tourVersion: 2,
    source: 'Manual',
    startAt: '2026-11-13T07:00:00Z',
    endAt: '2026-11-14T17:00:00Z',
    totalSlots: 18,
    soldSlots: 14,
    minParticipants: 10,
    isUnderCapacity: false,
    pricePerPerson: 2450000,
    managerFullName: 'Lê Nhật Nam',
    status: TRIP_STATUS.CLOSED_FOR_BOOKING,
  },
  {
    tripId: 'TRIP-2026-FANSIPAN',
    tourId: 'tour-fansipan-01',
    tourName: 'Trekking Fansipan - Nóc Nhà Đông Dương (3N2Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-11-20T06:00:00Z',
    endAt: '2026-11-22T18:00:00Z',
    totalSlots: 20,
    soldSlots: 15,
    minParticipants: 10,
    isUnderCapacity: false,
    pricePerPerson: 3850000,
    managerFullName: 'Lê Nhật Nam',
    status: TRIP_STATUS.OPEN,
  },
  {
    tripId: 'TRIP-2026-FANSIPAN-VIP',
    tourId: 'tour-fansipan-01',
    tourName: 'Fansipan Express - Cung Trạm Tôn (2N1Đ)',
    tourVersion: 2,
    source: 'Manual',
    startAt: '2026-11-20T07:30:00Z',
    endAt: '2026-11-21T18:30:00Z',
    totalSlots: 10,
    soldSlots: 8,
    minParticipants: 5,
    isUnderCapacity: false,
    pricePerPerson: 4500000,
    managerFullName: 'Vũ Đức Thịnh',
    status: TRIP_STATUS.OPEN,
  },
  {
    tripId: 'TRIP-2026-BIDUP',
    tourId: 'tour-bidup-04',
    tourName: 'Trekking Bidoup Núi Bà - Nóc Nhà Lâm Đồng (2N1Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-11-25T05:30:00Z',
    endAt: '2026-11-26T17:00:00Z',
    totalSlots: 14,
    soldSlots: 11,
    minParticipants: 8,
    isUnderCapacity: false,
    pricePerPerson: 2900000,
    managerFullName: 'Nguyễn Văn Minh',
    status: TRIP_STATUS.IN_PROGRESS,
  },
  {
    tripId: 'TRIP-2026-TAXUA',
    tourId: 'tour-taxua-02',
    tourName: 'Săn mây Tà Xùa - Sống Lưng Khủng Long (2N1Đ)',
    tourVersion: 2,
    source: 'Manual',
    startAt: '2026-11-28T05:30:00Z',
    endAt: '2026-11-29T17:00:00Z',
    totalSlots: 16,
    soldSlots: 12,
    minParticipants: 8,
    isUnderCapacity: false,
    pricePerPerson: 2750000,
    managerFullName: 'Trần Văn Hướng',
    status: TRIP_STATUS.OPEN,
  },
  {
    tripId: 'TRIP-2026-PUTALENG',
    tourId: 'tour-putaleng-03',
    tourName: 'Chinh phục Đỉnh Pú Tà Lèng Hùng Vĩ (4N3Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-12-05T06:00:00Z',
    endAt: '2026-12-08T16:00:00Z',
    totalSlots: 12,
    soldSlots: 4,
    minParticipants: 6,
    isUnderCapacity: true,
    pricePerPerson: 4200000,
    managerFullName: 'Nguyễn Thị Thảo',
    status: TRIP_STATUS.OPEN,
  },
  {
    tripId: 'TRIP-2026-YTY',
    tourId: 'tour-yty-05',
    tourName: 'Săn Mây Y Tý - Cột Mốc Lũng Pô (3N2Đ)',
    tourVersion: 1,
    source: 'RecurrenceRule',
    startAt: '2026-12-12T05:30:00Z',
    endAt: '2026-12-14T17:00:00Z',
    totalSlots: 15,
    soldSlots: 9,
    minParticipants: 8,
    isUnderCapacity: false,
    pricePerPerson: 3200000,
    managerFullName: 'Lê Nhật Nam',
    status: TRIP_STATUS.OPEN,
  },
];

export default function AdminTripListPage() {
  // 3 chế độ xem: 'month' (Lịch tháng) | 'week' (Lịch tuần) | 'list' (Danh sách bảng)
  const [viewMode, setViewMode] = useState('month');

  // Bộ lọc chế độ hiển thị trên lịch: 'departures_only' (Chỉ ngày khởi hành - tránh nhầm lẫn) | 'all_days' (Toàn bộ lịch trình)
  const [calendarScope, setCalendarScope] = useState('departures_only');

  // Bộ lọc trạng thái trực tiếp trên thanh lịch
  const [calendarStatusFilter, setCalendarStatusFilter] = useState('');

  // Mốc thời gian xem lịch
  const [currentDate, setCurrentDate] = useState(() => dayjs('2026-11-20'));

  // Ngày được chọn để xem chi tiết bên Daily Detail Panel (mặc định chọn 20/11/2026)
  const [selectedDate, setSelectedDate] = useState('2026-11-20');

  const [filters, setFilters] = useState({
    pageNumber: 1,
    pageSize: 10,
    status: '',
    tourId: '',
    fromStartAt: '',
    toStartAt: '',
  });

  const { data, isLoading, isError } = useAdminTrips(filters);

  const rawItems = isError ? [] : (data?.items ?? []);
  const isUsingFallback = !data?.items || data.items.length === 0;
  const items = isUsingFallback ? MOCK_ADMIN_TRIPS : rawItems;
  const totalPages = data?.totalPages ?? 1;

  // Lọc danh sách chuyến áp dụng cho lịch (theo bộ lọc trạng thái nhanh nếu có)
  const calendarFilteredItems = useMemo(() => {
    if (!calendarStatusFilter) return items;
    return items.filter((trip) => trip.status === calendarStatusFilter);
  }, [items, calendarStatusFilter]);

  // Tính toán nhanh 4 chỉ số vận hành
  const metrics = useMemo(() => {
    const total = items.length;
    const openCount = items.filter((t) => t.status === TRIP_STATUS.OPEN).length;
    const closedOrReadyCount = items.filter(
      (t) => t.status === TRIP_STATUS.CLOSED_FOR_BOOKING || t.status === TRIP_STATUS.IN_PROGRESS,
    ).length;
    const underCapacityCount = items.filter(
      (t) => t.isUnderCapacity || t.soldSlots < (t.minParticipants || 0),
    ).length;
    return { total, openCount, closedOrReadyCount, underCapacityCount };
  }, [items]);

  const hasActiveFilters = Boolean(
    filters.status || filters.tourId || filters.fromStartAt || filters.toStartAt,
  );

  const handleResetFilters = () => {
    setFilters({
      pageNumber: 1,
      pageSize: 10,
      status: '',
      tourId: '',
      fromStartAt: '',
      toStartAt: '',
    });
  };

  // Điều hướng lịch tháng & tuần
  const handlePrev = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => prev.subtract(1, 'week'));
    } else {
      setCurrentDate((prev) => prev.subtract(1, 'month'));
    }
  };

  const handleNext = () => {
    if (viewMode === 'week') {
      setCurrentDate((prev) => prev.add(1, 'week'));
    } else {
      setCurrentDate((prev) => prev.add(1, 'month'));
    }
  };

  const handleToday = () => {
    const today = dayjs('2026-11-20');
    setCurrentDate(today);
    setSelectedDate(today.format('YYYY-MM-DD'));
  };

  // Tạo dữ liệu cho Lưới Lịch Tháng (Monthly Calendar)
  const monthlyGridDays = useMemo(() => {
    const startOfMonth = currentDate.startOf('month');
    const startDayOfWeek = (startOfMonth.day() + 6) % 7;
    const startDate = startOfMonth.subtract(startDayOfWeek, 'day');
    const daysInMonth = currentDate.daysInMonth();
    const totalCells = Math.ceil((startDayOfWeek + daysInMonth) / 7) * 7;

    const days = [];
    for (let i = 0; i < totalCells; i++) {
      const date = startDate.add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const isCurrentMonth = date.isSame(currentDate, 'month');
      const isToday = date.isSame(dayjs('2026-11-20'), 'day');
      const isSelected = dateStr === selectedDate;

      // Toàn bộ chuyến hoạt động trong ngày này
      const tripsOnDay = calendarFilteredItems.filter((trip) => {
        const tripStart = dayjs(trip.startAt).format('YYYY-MM-DD');
        const tripEnd = dayjs(trip.endAt).format('YYYY-MM-DD');
        return dateStr >= tripStart && dateStr <= tripEnd;
      });

      // Chỉ chuyến thực tế KHỞI HÀNH trong ngày này
      const departingTrips = calendarFilteredItems.filter(
        (trip) => dayjs(trip.startAt).format('YYYY-MM-DD') === dateStr,
      );

      // Tùy theo chế độ hiển thị Admin đã chọn: Chỉ hiển thị ngày khởi hành hay toàn bộ hành trình
      const displayTrips = calendarScope === 'departures_only' ? departingTrips : tripsOnDay;

      days.push({
        date,
        dateStr,
        dayNumber: date.date(),
        isCurrentMonth,
        isToday,
        isSelected,
        trips: tripsOnDay,
        departingTrips,
        displayTrips,
      });
    }
    return days;
  }, [currentDate, calendarFilteredItems, selectedDate, calendarScope]);

  // Tạo dữ liệu cho Lịch Tuần (Weekly View)
  const weeklyGridDays = useMemo(() => {
    const weekStart = currentDate.subtract((currentDate.day() + 6) % 7, 'day');
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = weekStart.add(i, 'day');
      const dateStr = date.format('YYYY-MM-DD');
      const isToday = date.isSame(dayjs('2026-11-20'), 'day');

      const tripsOnDay = calendarFilteredItems.filter((trip) => {
        const tripStart = dayjs(trip.startAt).format('YYYY-MM-DD');
        const tripEnd = dayjs(trip.endAt).format('YYYY-MM-DD');
        return dateStr >= tripStart && dateStr <= tripEnd;
      });

      const departingTrips = calendarFilteredItems.filter(
        (trip) => dayjs(trip.startAt).format('YYYY-MM-DD') === dateStr,
      );

      const displayTrips = calendarScope === 'departures_only' ? departingTrips : tripsOnDay;

      days.push({
        date,
        dateStr,
        dayName: VIETNAMESE_WEEKDAYS[i],
        isToday,
        trips: displayTrips,
      });
    }
    return { weekStart, days };
  }, [currentDate, calendarFilteredItems, calendarScope]);

  // Danh sách chuyến cho Daily Detail Panel (bảng chi tiết ngày được chọn)
  const selectedDayTrips = useMemo(() => {
    if (!selectedDate) return [];
    return calendarFilteredItems.filter((trip) => {
      const tripStart = dayjs(trip.startAt).format('YYYY-MM-DD');
      const tripEnd = dayjs(trip.endAt).format('YYYY-MM-DD');
      return selectedDate >= tripStart && selectedDate <= tripEnd;
    });
  }, [calendarFilteredItems, selectedDate]);

  const selectedDateObj = dayjs(selectedDate);
  const selectedDayLabel = selectedDate
    ? `${VIETNAMESE_FULL_WEEKDAYS[selectedDateObj.day()]}, ngày ${selectedDateObj.format('DD/MM/YYYY')}`
    : 'Chọn một ngày';

  if (isLoading && !items.length) {
    return (
      <div className={styles.page}>
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Quản lý chuyến đi & điều hành khởi hành</h1>
          <p className={styles.subtitle}>
            Theo dõi lịch khởi hành, tiến độ bán chỗ, điều phối đoàn và xuất phát
          </p>
        </div>
        <TableSkeleton rows={6} cols={7} />
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* 2. KPI Overview */}
      <div className={styles.kpiSection}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Tổng số chuyến đi</span>
            <span className={`${styles.badge} ${styles.badgeNeutral}`}>Tất cả</span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{metrics.total}</span>
            <span className={styles.kpiUnit}>chuyến</span>
          </div>
          <div className={styles.kpiSubtext}>Chuyến đang quản lý trong hệ thống</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Đang mở nhận khách</span>
            <span className={`${styles.badge} ${styles.badgePositive}`}>Open</span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{metrics.openCount}</span>
            <span className={styles.kpiUnit}>chuyến</span>
          </div>
          <div className={styles.kpiSubtext}>Đang mở bán chỗ trên cổng khách hàng</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Chốt đoàn & Khởi hành</span>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>Điều hành</span>
          </div>
          <div className={styles.kpiValueRow}>
            <span className={styles.kpiValue}>{metrics.closedOrReadyCount}</span>
            <span className={styles.kpiUnit}>chuyến</span>
          </div>
          <div className={styles.kpiSubtext}>Đã chốt danh sách hoặc đang diễn ra</div>
        </div>

        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Cảnh báo sĩ số</span>
            {metrics.underCapacityCount > 0 ? (
              <span className={`${styles.badge} ${styles.badgeWarning}`}>Cần chú ý</span>
            ) : (
              <span className={`${styles.badge} ${styles.badgePositive}`}>Ổn định</span>
            )}
          </div>
          <div className={styles.kpiValueRow}>
            <span
              className={styles.kpiValue}
              style={{ color: metrics.underCapacityCount > 0 ? '#b45309' : '#0f172a' }}
            >
              {metrics.underCapacityCount}
            </span>
            <span className={styles.kpiUnit}>chuyến</span>
          </div>
          <div className={styles.kpiSubtext}>
            {metrics.underCapacityCount > 0
              ? 'Chưa đạt số khách tối thiểu'
              : 'Tất cả chuyến đã đạt số khách tối thiểu'}
          </div>
        </div>
      </div>

      {/* 3. Section Header & Calendar Toolbar Card (theo đúng layout ảnh mockup người dùng yêu cầu) */}
      <div className={styles.calendarHeaderCard}>
        {/* Hàng 1: Segmented Control [ Tháng | Tuần | Danh sách ] | [ Hôm nay ] ... ( < ) Tháng 11/2026 ( > ) */}
        <div className={styles.calendarHeaderTopRow}>
          <div className={styles.calendarSegmentedGroup}>
            <div className={styles.segmentedPillList} role="tablist" aria-label="Chế độ xem lịch">
              <button
                type="button"
                className={`${styles.segmentedPillBtn} ${viewMode === 'month' ? styles.segmentedPillBtnActive : ''
                  }`}
                onClick={() => setViewMode('month')}
                role="tab"
                aria-selected={viewMode === 'month'}
              >
                Tháng
              </button>
              <button
                type="button"
                className={`${styles.segmentedPillBtn} ${viewMode === 'week' ? styles.segmentedPillBtnActive : ''
                  }`}
                onClick={() => setViewMode('week')}
                role="tab"
                aria-selected={viewMode === 'week'}
              >
                Tuần
              </button>
              <button
                type="button"
                className={`${styles.segmentedPillBtn} ${viewMode === 'list' ? styles.segmentedPillBtnActive : ''
                  }`}
                onClick={() => setViewMode('list')}
                role="tab"
                aria-selected={viewMode === 'list'}
              >
                Danh sách
              </button>
            </div>

            <div className={styles.segmentedDivider} />

            <button
              type="button"
              className={`${styles.btnOutline} ${styles.btnSm}`}
              onClick={handleToday}
              style={{ borderRadius: 9999, padding: '4px 12px', fontSize: '0.75rem' }}
            >
              Hôm nay (20/11)
            </button>
          </div>

          {/* Điều hướng thời gian dạng tròn ( < ) Tháng 11/2026 ( > ) */}
          {viewMode !== 'list' ? (
            <div className={styles.calendarNavCircleGroup}>
              <button
                type="button"
                className={styles.calendarNavCircleBtn}
                onClick={handlePrev}
                title={viewMode === 'week' ? 'Tuần trước' : 'Tháng trước'}
                aria-label="Previous"
              >
                ‹
              </button>

              <span className={styles.calendarNavDateText}>
                {viewMode === 'week'
                  ? `Tuần ${weeklyGridDays.weekStart.format('DD/MM')} - ${weeklyGridDays.weekStart.add(6, 'day').format('DD/MM/YYYY')}`
                  : `Tháng ${currentDate.format('MM/YYYY')}`}
              </span>

              <button
                type="button"
                className={styles.calendarNavCircleBtn}
                onClick={handleNext}
                title={viewMode === 'week' ? 'Tuần sau' : 'Tháng sau'}
                aria-label="Next"
              >
                ›
              </button>
            </div>
          ) : (
            <div className={styles.toolbarListMeta}>
              <span className={styles.toolbarListMetaText}>
                Hiển thị <strong>{items.length}</strong> chuyến đi
              </span>
            </div>
          )}
        </div>

        {/* Hàng 2: [Icon Lịch Xanh] Lịch theo tháng / tuần / danh sách + Mô tả + Bộ lọc & Nút Thêm chuyến đi */}
        <div className={styles.calendarHeaderBottomRow}>
          <div className={styles.calendarSubHeaderLeft}>
            <div className={styles.calendarSubHeaderTitleRow}>
              <span className={styles.calendarSubHeaderIcon}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#166534"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01M16 18h.01" strokeWidth="2.5" />
                </svg>
              </span>
              <h2 className={styles.calendarSubHeaderTitle}>
                {viewMode === 'month'
                  ? 'Lịch theo tháng'
                  : viewMode === 'week'
                    ? 'Lịch theo tuần'
                    : 'Danh sách chuyến đi'}
              </h2>
            </div>
            <p className={styles.calendarSubHeaderDesc}>
              Khu vực nội dung hiển thị tương ứng với chế độ được chọn.
            </p>
          </div>

          <div className={styles.calendarSubHeaderRight}>
            {viewMode !== 'list' && (
              <>
                <select
                  aria-label="Chế độ hiển thị chuyến trên lịch"
                  className={styles.calendarFilterSelect}
                  value={calendarScope}
                  onChange={(e) => setCalendarScope(e.target.value)}
                  title="Phân biệt ngày khởi hành với thời gian diễn ra"
                >
                  <option value="departures_only">Chỉ ngày khởi hành</option>
                  <option value="all_days">Toàn bộ lịch trình</option>
                </select>

                <select
                  aria-label="Lọc trạng thái chuyến"
                  className={styles.calendarFilterSelect}
                  value={calendarStatusFilter}
                  onChange={(e) => setCalendarStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value={TRIP_STATUS.OPEN}>Chuyến đang mở</option>
                  <option value={TRIP_STATUS.CLOSED_FOR_BOOKING}>Đã chốt danh sách</option>
                  <option value={TRIP_STATUS.IN_PROGRESS}>Đang diễn ra</option>
                  <option value={TRIP_STATUS.COMPLETED}>Đã hoàn thành</option>
                </select>
              </>
            )}

            <Link to={ROUTES.ADMIN_TRIP_CREATE} className={styles.btnPrimary}>
              + Thêm chuyến đi
            </Link>
          </div>
        </div>
      </div>

      {/* ====================================================================
          CHẾ ĐỘ XEM 1: MONTHLY CALENDAR (70%) + DAILY DETAIL PANEL (30%)
         ==================================================================== */}
      {viewMode === 'month' && (
        <div className={styles.calendarWorkspaceLayout}>
          {/* Lưới lịch tháng (7 Cột rộng rãi ~70% chiều ngang) */}
          <div className={styles.monthlyCalendarCard}>
            {/* Header các ngày trong tuần (T2 - CN) */}
            <div className={styles.weekdaysHeaderGrid}>
              {VIETNAMESE_WEEKDAYS.map((w, index) => (
                <div
                  key={w}
                  className={`${styles.weekdayHeaderCell} ${index >= 5 ? styles.weekdayWeekend : ''}`}
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Các ô ngày trong tháng */}
            <div className={styles.daysGrid} role="grid">
              {monthlyGridDays.map((cell) => {
                const totalDeparting = cell.departingTrips.length;
                const totalDisplay = cell.displayTrips.length;

                return (
                  <div
                    key={cell.dateStr}
                    tabIndex={0}
                    role="gridcell"
                    aria-selected={cell.isSelected}
                    className={`${styles.dayCell} ${!cell.isCurrentMonth ? styles.dayCellOtherMonth : ''
                      } ${cell.isSelected ? styles.dayCellSelected : ''} ${cell.isToday ? styles.dayCellToday : ''
                      }`}
                    onClick={() => setSelectedDate(cell.dateStr)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedDate(cell.dateStr);
                      }
                    }}
                  >
                    <div className={styles.dayCellTop}>
                      <span className={styles.dayCellNumber}>{cell.dayNumber}</span>
                    </div>

                    {totalDisplay > 0 && (
                      <div
                        className={`${styles.dayCellCountBadge} ${totalDeparting > 0 ? '' : styles.dayCellCountBadgeNeutral
                          }`}
                        title={
                          totalDeparting > 0
                            ? `${totalDeparting} chuyến khởi hành, tổng ${totalDisplay} chuyến`
                            : `${totalDisplay} chuyến đang hoạt động`
                        }
                      >
                        {totalDisplay} chuyến
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bảng chi tiết tinh gọn ngày được chọn (Streamlined Daily Detail Panel ~30%) */}
          <aside className={styles.dailyDetailPanel} aria-label="Bảng chi tiết chuyến trong ngày">
            <div className={styles.dailyDetailHeader}>
              <div>
                <h2 className={styles.dailyDetailDateTitle}>{selectedDayLabel}</h2>
                <div className={styles.dailyDetailSubtitle}>
                  {selectedDayTrips.length > 0
                    ? `${selectedDayTrips.length} chuyến đang được theo dõi`
                    : 'Không có chuyến đi nào được lên lịch'}
                </div>
              </div>
              <span
                className={`${styles.badge} ${selectedDayTrips.length > 0 ? styles.badgePositive : styles.badgeNeutral
                  }`}
              >
                {selectedDayTrips.length} chuyến
              </span>
            </div>

            {/* Danh sách thẻ chuyến đi tinh gọn, tối ưu chiều cao, dễ điều hành */}
            {selectedDayTrips.length > 0 ? (
              <div className={styles.dailyTripsList}>
                {selectedDayTrips.map((trip) => {
                  const fillPercent =
                    trip.totalSlots > 0
                      ? Math.min(100, Math.round((trip.soldSlots / trip.totalSlots) * 100))
                      : 0;
                  const dayRole = getTripDayRole(trip, selectedDate);

                  return (
                    <div key={trip.tripId} className={styles.streamlinedDailyCard}>
                      {/* Tiêu đề Tour và trạng thái */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 8,
                        }}
                      >
                        <h3 className={styles.streamlinedTourTitle}>{trip.tourName}</h3>
                        <span className={`${styles.badge} ${getStatusBadgeClass(trip.status)}`}>
                          {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
                        </span>
                      </div>

                      {/* Phân định rõ vai trò của ngày đối với hành trình chuyến đi */}
                      {dayRole && (
                        <div className={styles.streamlinedDayRolePill}>
                          {dayRole.type === 'departure' ? (
                            <span className={styles.roleTagDeparture}>
                              Khởi hành lúc {formatDateTime(trip.startAt).split(' ')[1] || '06:00'} (Ngày 1/
                              {dayRole.totalDays})
                            </span>
                          ) : dayRole.type === 'return' ? (
                            <span className={styles.roleTagReturn}>
                              Kết thúc lúc {formatDateTime(trip.endAt).split(' ')[1] || '18:00'} (Ngày{' '}
                              {dayRole.dayIndex}/{dayRole.totalDays})
                            </span>
                          ) : (
                            <span className={styles.roleTagOngoing}>
                              Đang trên cung đường (Ngày {dayRole.dayIndex}/{dayRole.totalDays})
                            </span>
                          )}
                        </div>
                      )}

                      {/* Tiến độ đặt chỗ tinh gọn */}
                      <div className={styles.streamlinedCapacityRow}>
                        <div className={styles.streamlinedCapacityMeta}>
                          <span>
                            Sĩ số: <strong>{trip.soldSlots}</strong>/{trip.totalSlots} chỗ
                          </span>
                          <span
                            style={{
                              fontWeight: 600,
                              color: trip.isUnderCapacity ? '#b45309' : '#166534',
                            }}
                          >
                            {fillPercent}%
                          </span>
                        </div>
                        <div className={styles.progressTrack} style={{ height: 6, margin: '2px 0' }}>
                          <div
                            className={`${styles.progressFill} ${trip.isUnderCapacity ? styles.progressFillWarn : ''
                              }`}
                            style={{ width: `${fillPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Thông tin điều phối & giá vé gọn gàng */}
                      <div className={styles.streamlinedMetaLine}>
                        <span>Điều phối: {trip.managerFullName || 'Chưa gán'}</span>
                        <span>Giá: {formatCurrency(trip.pricePerPerson)}/khách</span>
                      </div>

                      {/* Nút hành động trực tiếp */}
                      <div className={styles.streamlinedActionsRow}>
                        <Link
                          to={ROUTES.ADMIN_TRIP_DETAIL(trip.tripId)}
                          className={`${styles.btnPrimary} ${styles.btnSm}`}
                          style={{ flex: 1, textDecoration: 'none', justifyContent: 'center' }}
                        >
                          Điều hành chuyến →
                        </Link>
                        {trip.tourId && (
                          <Link
                            to={ROUTES.ADMIN_RECURRENCE_RULES(trip.tourId)}
                            className={`${styles.btnOutline} ${styles.btnSm}`}
                            style={{ textDecoration: 'none' }}
                          >
                            Lịch lặp
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.dailyEmptyPanel}>
                <p style={{ margin: 0, fontWeight: 500, fontSize: '0.875rem' }}>
                  Không có chuyến đi nào được xếp lịch vào ngày này.
                </p>
                <Link
                  to={ROUTES.ADMIN_TRIP_CREATE}
                  className={`${styles.btnPrimary} ${styles.btnSm}`}
                  style={{ textDecoration: 'none', marginTop: 4 }}
                >
                  + Lên lịch chuyến đi mới
                </Link>
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ====================================================================
          CHẾ ĐỘ XEM 2: WEEKLY VIEW (LỊCH TUẦN 7 CỘT)
         ==================================================================== */}
      {viewMode === 'week' && (
        <div className={styles.weeklyContainer}>
          <div className={styles.weeklyGrid}>
            {weeklyGridDays.days.map((col) => (
              <div
                key={col.dateStr}
                className={`${styles.weeklyColumn} ${col.isToday ? styles.weeklyColumnToday : ''}`}
              >
                <div className={styles.weeklyColumnHeader}>
                  <div className={styles.weeklyColumnDayName}>{col.dayName}</div>
                  <div className={styles.weeklyColumnDate}>{col.date.format('DD/MM')}</div>
                </div>

                <div className={styles.weeklyColumnBody}>
                  {col.trips.length > 0 ? (
                    col.trips.map((trip) => {
                      const fillPercent =
                        trip.totalSlots > 0
                          ? Math.min(100, Math.round((trip.soldSlots / trip.totalSlots) * 100))
                          : 0;
                      const dayRole = getTripDayRole(trip, col.dateStr);

                      return (
                        <div key={trip.tripId} className={styles.weeklyTripCard}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span className={`${styles.badge} ${getStatusBadgeClass(trip.status)}`}>
                              {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
                            </span>
                            {dayRole && (
                              <span
                                style={{
                                  fontSize: '0.6875rem',
                                  fontWeight: 600,
                                  color: dayRole.type === 'departure' ? '#166534' : '#64748b',
                                }}
                              >
                                {dayRole.shortLabel}
                              </span>
                            )}
                          </div>

                          <div className={styles.weeklyTripTitle}>{formatShortTourTitle(trip.tourName)}</div>
                          <div className={styles.weeklyTripTime}>
                            Khởi hành: {formatDateTime(trip.startAt).split(' ')[1] || '06:00'} (
                            {trip.soldSlots}/{trip.totalSlots} chỗ)
                          </div>
                          <div className={styles.progressTrack} style={{ height: 4 }}>
                            <div
                              className={`${styles.progressFill} ${trip.isUnderCapacity ? styles.progressFillWarn : ''
                                }`}
                              style={{ width: `${fillPercent}%` }}
                            />
                          </div>
                          <Link
                            to={ROUTES.ADMIN_TRIP_DETAIL(trip.tripId)}
                            className={`${styles.btnPrimary} ${styles.btnSm}`}
                            style={{
                              marginTop: 4,
                              textDecoration: 'none',
                              justifyContent: 'center',
                            }}
                          >
                            Điều hành →
                          </Link>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.weeklyEmptySlot}>Trống lịch</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ====================================================================
          CHẾ ĐỘ XEM 3: TABLE VIEW (DANH SÁCH BẢNG TRUYỀN THỐNG)
         ==================================================================== */}
      {viewMode === 'list' && (
        <>
          {/* Thanh lọc dữ liệu */}
          <div className={styles.card} style={{ marginBottom: 20 }}>
            <div className={styles.filterBar}>
              <div className={styles.field}>
                <label htmlFor="statusFilter">Trạng thái chuyến</label>
                <select
                  id="statusFilter"
                  className={styles.select}
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, pageNumber: 1 })}
                >
                  <option value="">Tất cả trạng thái</option>
                  {Object.values(TRIP_STATUS).map((st) => (
                    <option key={st} value={st}>
                      {TRIP_STATUS_LABEL[st] ?? st}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="tourFilter">Lọc theo Tour ID / Tên</label>
                <input
                  id="tourFilter"
                  type="text"
                  placeholder="Nhập ID hoặc từ khóa..."
                  className={styles.input}
                  value={filters.tourId}
                  onChange={(e) => setFilters({ ...filters, tourId: e.target.value, pageNumber: 1 })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="fromDate">Khởi hành từ ngày</label>
                <input
                  id="fromDate"
                  type="date"
                  className={styles.input}
                  value={filters.fromStartAt}
                  onChange={(e) => setFilters({ ...filters, fromStartAt: e.target.value, pageNumber: 1 })}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="toDate">Đến ngày</label>
                <input
                  id="toDate"
                  type="date"
                  className={styles.input}
                  value={filters.toStartAt}
                  onChange={(e) => setFilters({ ...filters, toStartAt: e.target.value, pageNumber: 1 })}
                />
              </div>

              {hasActiveFilters && (
                <div className={styles.field} style={{ justifyContent: 'flex-end' }}>
                  <label style={{ visibility: 'hidden' }}>Đặt lại</label>
                  <button
                    type="button"
                    className={`${styles.btnOutline} ${styles.btnSm}`}
                    onClick={handleResetFilters}
                  >
                    Xóa bộ lọc
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.card}>
            {items.length === 0 ? (
              <p className={styles.subtitle}>Không có chuyến đi nào khớp bộ lọc hiện tại.</p>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Tour & Nguồn tạo</th>
                      <th>Khởi hành → Kết thúc</th>
                      <th>Sĩ số / Tối thiểu</th>
                      <th>Giá / Khách</th>
                      <th>Điều phối viên</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((trip) => {
                      const fillPercent =
                        trip.totalSlots > 0
                          ? Math.min(100, Math.round((trip.soldSlots / trip.totalSlots) * 100))
                          : 0;
                      return (
                        <tr key={trip.tripId}>
                          <td>
                            <div>
                              <strong>{trip.tourName || 'Chuyến đi Tour'}</strong>{' '}
                              <span className={`${styles.badge} ${styles.badgeNeutral}`}>
                                v{trip.tourVersion}
                              </span>
                            </div>
                            <div className={styles.subtitle}>
                              Nguồn: {trip.source === 'RecurrenceRule' ? 'Lịch lặp tự động' : 'Tạo thủ công'}
                            </div>
                          </td>
                          <td>
                            <div>{formatDate(trip.startAt)}</div>
                            <div className={styles.subtitle}>→ {formatDate(trip.endAt)}</div>
                          </td>
                          <td>
                            <div className={styles.progressWrap}>
                              <span>
                                <strong>{trip.soldSlots}</strong> / {trip.totalSlots} chỗ (Tối thiểu:{' '}
                                {trip.minParticipants})
                              </span>
                              <div className={styles.progressTrack}>
                                <div
                                  className={`${styles.progressFill} ${trip.isUnderCapacity ? styles.progressFillWarn : ''
                                    }`}
                                  style={{ width: `${fillPercent}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>{formatCurrency(trip.pricePerPerson)}</td>
                          <td>{trip.managerFullName || 'Chưa gán'}</td>
                          <td>
                            <span className={`${styles.badge} ${getStatusBadgeClass(trip.status)}`}>
                              {TRIP_STATUS_LABEL[trip.status] ?? trip.status}
                            </span>
                          </td>
                          <td>
                            <div className={styles.actionRow}>
                              <Link
                                to={ROUTES.ADMIN_TRIP_DETAIL(trip.tripId)}
                                className={`${styles.btnPrimary} ${styles.btnSm}`}
                              >
                                Điều hành chuyến
                              </Link>
                              {trip.tourId && (
                                <Link
                                  to={ROUTES.ADMIN_RECURRENCE_RULES(trip.tourId)}
                                  className={`${styles.btnOutline} ${styles.btnSm}`}
                                >
                                  Lịch lặp
                                </Link>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              page={filters.pageNumber}
              totalPages={totalPages}
              onPageChange={(nextPage) => setFilters({ ...filters, pageNumber: nextPage })}
            />
          </div>
        </>
      )}
    </div>
  );
}
