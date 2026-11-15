import { useEffect, useMemo, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/Modal';
import OutdoorIcon from '@/components/OutdoorIcon';
import { TRIP_STATUS } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import TripPolicyPanel from '@/features/trip-bookings/components/TripPolicyPanel';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourBookingCard.module.css';

const isBookableTrip = (trip) => trip.status === TRIP_STATUS.OPEN && trip.availableSlots > 0;
const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const dayKey = (value) => dayjs(value).format('YYYY-MM-DD');

// Lịch tháng: chỉ ngày có đợt (trip) do admin mở mới bấm được
function DepartureCalendar({ trips, selectedTrip, onSelect }) {
  const [month, setMonth] = useState(() =>
    dayjs(selectedTrip?.startAt || trips[0]?.startAt).startOf('month'),
  );
  // ponytail: 1 ngày nhiều đợt thì ô ngày lấy đợt còn chỗ đầu tiên
  const tripsByDay = useMemo(() => {
    const map = new Map();
    trips.forEach((trip) => {
      const key = dayKey(trip.startAt);
      const current = map.get(key);
      if (!current || (!isBookableTrip(current) && isBookableTrip(trip))) map.set(key, trip);
    });
    return map;
  }, [trips]);

  const offset = (month.day() + 6) % 7; // tuần bắt đầu thứ 2
  const cells = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: month.daysInMonth() }, (_, index) => month.date(index + 1)),
  ];
  const selectedKey = selectedTrip ? dayKey(selectedTrip.startAt) : '';
  const todayKey = dayKey(dayjs());

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHead}>
        <strong aria-live="polite">Tháng {month.format('M YYYY')}</strong>
        <div className={styles.calendarNav}>
          <button
            type="button"
            aria-label="Tháng trước"
            onClick={() => setMonth((m) => m.subtract(1, 'month'))}
          >
            ‹
          </button>
          <button type="button" aria-label="Tháng sau" onClick={() => setMonth((m) => m.add(1, 'month'))}>
            ›
          </button>
        </div>
      </div>
      <div className={styles.calendarGrid} role="radiogroup" aria-label="Ngày khởi hành">
        {WEEKDAYS.map((label, index) => (
          <span
            key={label}
            className={`${styles.weekday} ${index > 4 ? styles.weekend : ''}`}
            aria-hidden="true"
          >
            {label}
          </span>
        ))}
        {cells.map((date, index) => {
          if (!date) return <span key={`blank-${index}`} />;
          const key = date.format('YYYY-MM-DD');
          const trip = tripsByDay.get(key);
          const dayClass = `${styles.day} ${key === todayKey ? styles.dayToday : ''}`;
          if (!trip) {
            return (
              <span key={key} className={dayClass}>
                {date.date()}
              </span>
            );
          }
          const bookable = isBookableTrip(trip);
          const selected = key === selectedKey;
          return (
            <button
              key={key}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`Đợt ${trip.dateRangeFormatted} ${bookable ? `(Còn ${trip.availableSlots} chỗ)` : '(Đã đóng)'}`}
              disabled={!bookable}
              className={`${dayClass} ${styles.dayTrip} ${selected ? styles.daySelected : ''}`}
              onClick={() => onSelect(trip)}
            >
              {date.date()}
            </button>
          );
        })}
      </div>
      <div className={styles.calendarFoot}>
        <span>{tripsByDay.size} ngày có đợt khởi hành</span>
        <button type="button" onClick={() => setMonth(dayjs().startOf('month'))}>
          Hôm nay
        </button>
      </div>
    </div>
  );
}

export default function TourBookingCard({ tour }) {
  const navigate = useNavigate();
  const trips = useMemo(() => tour.availableTrips || [], [tour.availableTrips]);
  const firstBookableTrip = trips.find(isBookableTrip);
  const [memberCount, setMemberCount] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState(firstBookableTrip?.id || '');
  const [policyOpen, setPolicyOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const tripGroupRef = useRef(null);
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || firstBookableTrip;
  const maxSlots = Math.min(21, selectedTrip?.availableSlots || 1);
  const canBook = Boolean(selectedTrip && isBookableTrip(selectedTrip));
  const pricePerPerson = selectedTrip?.pricePerPerson || tour.basePrice || 0;

  const handleTripChange = (trip) => {
    setSelectedTripId(trip.id);
    setCalendarOpen(false);
    setMemberCount((current) => Math.min(current, Math.min(21, trip.availableSlots || 1)));
  };

  // Đóng popover lịch khi bấm ra ngoài hoặc nhấn Esc
  useEffect(() => {
    if (!calendarOpen) return undefined;
    const close = (event) => {
      if (
        event.key === 'Escape' ||
        (event.type === 'mousedown' && !tripGroupRef.current?.contains(event.target))
      )
        setCalendarOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [calendarOpen]);

  const handleBooking = () => {
    if (!canBook) return;

    const search = new URLSearchParams({
      tripId: selectedTrip.id,
      tourId: tour.id,
      partySize: String(memberCount),
    });
    navigate(`${ROUTES.TRIP_BOOKING_CREATE}?${search.toString()}`);
  };

  return (
    <aside className={styles.bookingCard} aria-labelledby="booking-card-title">
      <div className={styles.headerBlock}>
        <h2 className={styles.stepTitle}>Bước 1/3: Đặt tour</h2>
        <nav className={styles.stepper} aria-label="Tiến trình đặt tour">
          <div className={`${styles.stepItem} ${styles.stepActive}`}>
            <span className={styles.stepCircle}>1</span>
            <span className={styles.stepLabel}>Chọn gói</span>
          </div>
          <div className={styles.stepDivider} aria-hidden="true" />
          <div className={styles.stepItem}>
            <span className={styles.stepCircle}>2</span>
            <span className={styles.stepLabel}>Thông tin</span>
          </div>
          <div className={styles.stepDivider} aria-hidden="true" />
          <div className={styles.stepItem}>
            <span className={styles.stepCircle}>3</span>
            <span className={styles.stepLabel}>Thanh toán</span>
          </div>
        </nav>
      </div>

      <div className={styles.sectionBlock}>
        <span className={styles.fieldLabel}>
          Số người đi <span className={styles.required}>*</span>
        </span>
        <div className={styles.tourTypeCard}>
          <div className={styles.tourTypeInfo}>
            <strong className={styles.tourTypeName}>
              {canBook ? `Còn ${selectedTrip.availableSlots} chỗ trống` : 'Chưa có đợt mở'}
            </strong>
            <div className={styles.priceRow}>
              <span id="booking-card-title" className={styles.price}>
                {formatCurrency(pricePerPerson)}
              </span>
              <span className={styles.priceUnit}>/người</span>
            </div>
          </div>

          <div className={styles.counter}>
            <button
              type="button"
              className={styles.counterBtn}
              aria-label="Giảm số người"
              onClick={() => setMemberCount((current) => Math.max(1, current - 1))}
              disabled={!canBook || memberCount <= 1}
            >
              −
            </button>
            <output className={styles.counterValue} aria-label="Số người">
              {memberCount}
            </output>
            <button
              type="button"
              className={styles.counterBtn}
              aria-label="Tăng số người"
              onClick={() => setMemberCount((current) => Math.min(maxSlots, current + 1))}
              disabled={!canBook || memberCount >= maxSlots}
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className={styles.tripGroup} ref={tripGroupRef}>
        <span className={styles.fieldLabel} id="departure-label">
          Ngày khởi hành <span className={styles.required}>*</span>
        </span>

        {trips.length ? (
          <>
            <button
              type="button"
              className={styles.dateSelectorField}
              aria-expanded={calendarOpen}
              aria-controls="departure-calendar"
              aria-labelledby="departure-label departure-value"
              onClick={() => setCalendarOpen((open) => !open)}
            >
              <span
                id="departure-value"
                className={selectedTrip ? styles.dateTextSelected : styles.dateTextPlaceholder}
              >
                {selectedTrip
                  ? `${dayjs(selectedTrip.startAt).format('DD/MM/YYYY')}${
                      selectedTrip.endAt ? ` – ${dayjs(selectedTrip.endAt).format('DD/MM/YYYY')}` : ''
                    }`
                  : 'Chọn ngày khởi hành'}
              </span>
              <OutdoorIcon name="calendar" size={18} />
            </button>
            {calendarOpen && (
              <div id="departure-calendar" className={styles.calendarContainer}>
                <DepartureCalendar trips={trips} selectedTrip={selectedTrip} onSelect={handleTripChange} />
              </div>
            )}
          </>
        ) : (
          <p className={styles.emptyText}>Chưa có lịch mở. Vui lòng quay lại sau.</p>
        )}
      </div>

      <hr className={styles.divider} />

      <div className={styles.summaryRow}>
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>TẠM TÍNH ({memberCount} KHÁCH)</span>
          <span className={styles.totalAmount}>
            {canBook ? formatCurrency(pricePerPerson * memberCount) : 'Liên hệ'}
          </span>
        </div>

        <button
          type="button"
          className={styles.btnContinue}
          onClick={handleBooking}
          disabled={!canBook}
          aria-label="Đặt Tour & Giữ Chỗ Ngay"
        >
          <span>Tiếp tục</span>
          <span aria-hidden="true">→</span>
        </button>
      </div>

      {!canBook && <p className={styles.unavailable}>Chuyến đi chưa có lịch mở hoặc đã hết chỗ.</p>}

      {selectedTrip && (
        <button type="button" className={styles.policyLink} onClick={() => setPolicyOpen(true)}>
          Chính sách huỷ &amp; hoàn tiền
        </button>
      )}

      {policyOpen && selectedTrip && (
        <Modal
          title={`Chính sách huỷ & hoàn tiền · Đợt ${selectedTrip.dateRangeFormatted}`}
          onClose={() => setPolicyOpen(false)}
        >
          <TripPolicyPanel tripId={selectedTrip.id} />
        </Modal>
      )}
    </aside>
  );
}
