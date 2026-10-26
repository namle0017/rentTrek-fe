import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourBookingCard.module.css';

const isBookableTrip = (trip) => trip.status === 'Open' && trip.availableSlots > 0;

export default function TourBookingCard({ tour }) {
  const navigate = useNavigate();
  const trips = useMemo(() => tour.availableTrips || [], [tour.availableTrips]);
  const firstBookableTrip = trips.find(isBookableTrip);
  const [memberCount, setMemberCount] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState(firstBookableTrip?.id || '');
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || firstBookableTrip;
  const maxSlots = Math.min(21, selectedTrip?.availableSlots || 1);
  const canBook = Boolean(selectedTrip && isBookableTrip(selectedTrip));
  const pricePerPerson = selectedTrip?.pricePerPerson || 0;
  const estimatedTotal = pricePerPerson * memberCount;

  const handleTripChange = (event) => {
    const nextTrip = trips.find((trip) => trip.id === event.target.value);
    setSelectedTripId(event.target.value);
    setMemberCount((current) => Math.min(current, Math.min(21, nextTrip?.availableSlots || 1)));
  };

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
      <div className={styles.eyebrow}>ĐẶT CHUYẾN ĐI</div>
      <div className={styles.priceSection}>
        <div className={styles.priceRow}>
          <span id="booking-card-title" className={styles.price}>
            {formatCurrency(pricePerPerson)}
          </span>
          <span className={styles.priceUnit}>/ người</span>
        </div>
        <p className={styles.priceHint}>Giá theo lịch khởi hành đang chọn</p>
      </div>

      <div className={styles.inspectionBadge}>
        <OutdoorIcon name="shield" size={20} />
        <span>Thiết bị bảo hộ đạt chuẩn kiểm định {tour.inspectionRate || 96}%</span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor="trip-departure">
          Lịch khởi hành
        </label>
        {trips.length ? (
          <select
            id="trip-departure"
            className={styles.select}
            value={selectedTripId}
            onChange={handleTripChange}
            disabled={!firstBookableTrip}
          >
            {!firstBookableTrip && <option value="">Chưa có lịch mở</option>}
            {trips.map((trip) => {
              const bookable = isBookableTrip(trip);
              return (
                <option key={trip.id} value={trip.id} disabled={!bookable}>
                  {trip.tripOptionTitle || trip.dateRangeFormatted} · {trip.dateRangeFormatted} ·{' '}
                  {bookable ? `còn ${trip.availableSlots} chỗ` : 'đã đóng'}
                </option>
              );
            })}
          </select>
        ) : (
          <p className={styles.emptyText}>Chưa có lịch mở. Vui lòng quay lại sau.</p>
        )}
      </div>

      <div className={styles.formGroup}>
        <span className={styles.label}>Số người tham gia</span>
        <div className={styles.counterRow}>
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
          <span className={styles.slotHint}>Tối đa {canBook ? maxSlots : 0} chỗ</span>
        </div>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryRow}>
          <span>{memberCount} người × {formatCurrency(pricePerPerson)}</span>
          <strong>{formatCurrency(estimatedTotal)}</strong>
        </div>
        <p className={styles.summaryNote}>Chi phí chính thức được xác nhận từ booking sau khi giữ chỗ.</p>
      </div>

      <button
        type="button"
        className={styles.btnBook}
        onClick={handleBooking}
        disabled={!canBook}
      >
        <span>Tiếp tục đặt tour</span>
        <OutdoorIcon name="arrow" size={19} />
      </button>

      {!canBook && <p className={styles.unavailable}>Chuyến đi chưa có lịch mở hoặc đã hết chỗ.</p>}

      <ul className={styles.guaranteeList}>
        <li><OutdoorIcon name="check" size={17} /> Hỗ trợ hoàn/hủy theo chính sách tour</li>
        <li><OutdoorIcon name="check" size={17} /> Bảo hiểm du lịch mạo hiểm trọn gói</li>
        <li><OutdoorIcon name="check" size={17} /> Hướng dẫn viên có chứng chỉ sơ cấp cứu</li>
      </ul>
    </aside>
  );
}
