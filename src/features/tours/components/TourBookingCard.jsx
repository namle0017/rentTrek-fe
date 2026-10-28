import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { TRIP_STATUS } from '@/constants/enums';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourBookingCard.module.css';

const isBookableTrip = (trip) => trip.status === TRIP_STATUS.OPEN && trip.availableSlots > 0;

export default function TourBookingCard({ tour }) {
  const navigate = useNavigate();
  const trips = useMemo(() => tour.availableTrips || [], [tour.availableTrips]);
  const firstBookableTrip = trips.find(isBookableTrip);
  const [memberCount, setMemberCount] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState(firstBookableTrip?.id || '');
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId) || firstBookableTrip;
  const maxSlots = Math.min(21, selectedTrip?.availableSlots || 1);
  const canBook = Boolean(selectedTrip && isBookableTrip(selectedTrip));
  const pricePerPerson = selectedTrip?.pricePerPerson || tour.basePrice || 0;

  const handleTripChange = (trip) => {
    setSelectedTripId(trip.id);
    setMemberCount((current) => Math.min(current, Math.min(21, trip.availableSlots || 1)));
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
      <div className={styles.eyebrow}>
        HÀNH TRÌNH {tour.durationDays} NGÀY {tour.durationNights} ĐÊM
      </div>
      <div className={styles.priceRow}>
        <span id="booking-card-title" className={styles.price}>
          {formatCurrency(pricePerPerson)}
        </span>
        <span className={styles.priceUnit}>/người</span>
      </div>
      {tour.equipmentDeposit > 0 && (
        <p className={styles.deposit}>Cọc thiết bị: {formatCurrency(tour.equipmentDeposit)} (hoàn 100%)</p>
      )}

      <fieldset className={styles.tripGroup}>
        <legend className={styles.label}>
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4m8-4v4" />
          </svg>
          Chọn đợt khởi hành
        </legend>
        {trips.length ? (
          <div className={styles.tripList}>
            {trips.map((trip) => {
              const bookable = isBookableTrip(trip);
              return (
                <label
                  key={trip.id}
                  className={`${styles.tripOption} ${trip.id === selectedTrip?.id ? styles.tripSelected : ''}`}
                >
                  <input
                    type="radio"
                    name="trip-departure"
                    value={trip.id}
                    checked={trip.id === selectedTrip?.id}
                    disabled={!bookable}
                    onChange={() => handleTripChange(trip)}
                  />
                  <span>
                    <strong>Đợt {trip.dateRangeFormatted}</strong>
                    <small>{bookable ? `(Còn ${trip.availableSlots} chỗ)` : '(Đã đóng)'}</small>
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyText}>Chưa có lịch mở. Vui lòng quay lại sau.</p>
        )}
      </fieldset>

      <div className={styles.counterRow}>
        <span className={styles.label}>Số người tham gia</span>
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

      <div className={styles.escrow}>
        <OutdoorIcon name="shield" size={20} />
        <span>100% tiền giữ tại Escrow đến khi xong tour</span>
      </div>

      <button type="button" className={styles.btnBook} onClick={handleBooking} disabled={!canBook}>
        Đặt Tour & Giữ Chỗ Ngay
      </button>

      {!canBook && <p className={styles.unavailable}>Chuyến đi chưa có lịch mở hoặc đã hết chỗ.</p>}
    </aside>
  );
}
