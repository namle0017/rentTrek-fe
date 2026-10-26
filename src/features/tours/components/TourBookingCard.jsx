import { useState } from 'react';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TourBookingCard.module.css';

export default function TourBookingCard({ tour }) {
  const [memberCount, setMemberCount] = useState(1);
  const [selectedTripId, setSelectedTripId] = useState(
    tour.upcomingTrips?.[0]?.id || ''
  );

  const trips = tour.upcomingTrips || [];
  const selectedTrip = trips.find((t) => t.id === selectedTripId) || trips[0];
  const maxSlots = selectedTrip?.availableSlots || 10;

  const basePrice = tour.basePrice || 0;
  const depositPerPerson = tour.equipmentDeposit || 500000;
  const inspectionRate = tour.inspectionRate || 96;

  const totalTourCost = basePrice * memberCount;
  const totalDeposit = depositPerPerson * memberCount;
  const grandTotal = totalTourCost + totalDeposit;

  const handleBooking = () => {
    toast.success(
      `Đã nhận yêu cầu đặt tour cho ${memberCount} người! Khởi hành: ${selectedTrip?.departureText || 'Sắp xếp sau'}.`
    );
  };

  return (
    <div className={styles.bookingCard}>
      <div className={styles.priceSection}>
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatCurrency(basePrice)}</span>
          <span className={styles.priceUnit}>/ người</span>
        </div>
        <div className={styles.depositText}>
          Tiền cọc thiết bị: <strong>{formatCurrency(depositPerPerson)}</strong> / người (hoàn trả sau tour)
        </div>
      </div>

      <div className={styles.inspectionBadge}>
        <span>🛡️</span>
        <span>Cam kết thiết bị bảo hộ đạt chuẩn kiểm định {inspectionRate}%</span>
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Chọn ngày khởi hành:</label>
        {trips.length > 0 ? (
          <select
            className={styles.select}
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            {trips.map((trip) => (
              <option key={trip.id} value={trip.id}>
                {trip.departureText} — ({trip.slotText})
              </option>
            ))}
          </select>
        ) : (
          <div className="text-muted" style={{ fontSize: '0.85rem' }}>
            Liên hệ ban tổ chức để mở lịch khởi hành riêng
          </div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Số lượng thành viên:</label>
        <div className={styles.counterRow}>
          <button
            type="button"
            className={styles.counterBtn}
            onClick={() => setMemberCount((prev) => Math.max(1, prev - 1))}
            disabled={memberCount <= 1}
          >
            -
          </button>
          <span className={styles.counterValue}>{memberCount}</span>
          <button
            type="button"
            className={styles.counterBtn}
            onClick={() => setMemberCount((prev) => Math.min(maxSlots, prev + 1))}
            disabled={memberCount >= maxSlots}
          >
            +
          </button>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            (Tối đa {maxSlots} chỗ)
          </span>
        </div>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryRow}>
          <span>Tiền tour ({memberCount} khách)</span>
          <span>{formatCurrency(totalTourCost)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Cọc trang bị</span>
          <span>{formatCurrency(totalDeposit)}</span>
        </div>
        <div className={styles.summaryTotalRow}>
          <span>Tổng thanh toán</span>
          <span style={{ color: 'var(--color-primary-dark)' }}>{formatCurrency(grandTotal)}</span>
        </div>
      </div>

      <button type="button" className={styles.btnBook} onClick={handleBooking}>
        Đặt tour ngay
      </button>

      <div className={styles.guaranteeList}>
        <div className={styles.guaranteeItem}>
          <span>✓</span> Hỗ trợ hoàn/hủy trước 7 ngày khởi hành
        </div>
        <div className={styles.guaranteeItem}>
          <span>✓</span> Bảo hiểm du lịch mạo hiểm trọn gói
        </div>
        <div className={styles.guaranteeItem}>
          <span>✓</span> Hướng dẫn viên có chứng chỉ sơ cấp cứu WFA
        </div>
      </div>
    </div>
  );
}
