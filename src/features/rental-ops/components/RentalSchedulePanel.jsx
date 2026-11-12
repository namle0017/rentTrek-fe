import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import ErrorState from '@/components/ErrorState';
import Spinner from '@/components/Spinner';
import { ROUTES } from '@/constants/routes';
import { formatDateTime } from '@/utils/formatDate';
import { rentalOpsService } from '../api/rentalOpsService';
import { useRentalSchedule } from '../hooks/useRentalOps';
import styles from '../pages/RentalOps.module.css';

const KIND_LABEL = { handover: 'Cần giao', return: 'Cần nhận trả' };

/** Danh sách thiết bị cần giao / nhận trả trong một ngày (giờ VN). */
export default function RentalSchedulePanel() {
  const [kind, setKind] = useState('handover');
  const [date, setDate] = useState(''); // rỗng = BE lấy hôm nay
  const [exporting, setExporting] = useState(false);
  const { data, isLoading, isError, error, refetch } = useRentalSchedule(kind, date || undefined);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const blob = await rentalOpsService.exportScheduleCsv(kind, date || undefined);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${kind}-${data?.date || date || 'today'}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="rental-schedule-title">
      <h2 id="rental-schedule-title" className={styles.panelTitle}>
        Lịch giao / nhận thiết bị {data && `· ${data.date} · ${data.totalItems} thiết bị`}
      </h2>
      <div className={styles.filters}>
        <label className={styles.field}>
          <span>Loại</span>
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            {Object.entries(KIND_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Ngày</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <button type="button" className="btn btn-secondary" disabled={exporting || !data?.totalItems} onClick={exportCsv}>
          {exporting ? 'Đang xuất...' : 'Xuất CSV'}
        </button>
      </div>

      {isLoading && <Spinner />}
      {isError && <ErrorState message={error?.message} onRetry={refetch} />}
      {data && !data.items.length && <p className={styles.hint}>Không có thiết bị nào trong ngày.</p>}
      {data?.items.length > 0 && (
        <div className={styles.tableScroll} tabIndex="0" aria-label="Bảng lịch giao nhận">
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Giờ</th>
                <th scope="col">Mã đơn</th>
                <th scope="col">Khách</th>
                <th scope="col">Thiết bị</th>
                <th scope="col">Mã tài sản</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((item) => (
                <tr key={`${item.orderId}-${item.assetCode}`}>
                  <td className={styles.nowrap}>{formatDateTime(item.scheduledAt)}</td>
                  <td>
                    <Link to={ROUTES.ADMIN_RENTAL_ORDER_DETAIL(item.orderId)} className={styles.code}>
                      {item.orderCode}
                    </Link>
                  </td>
                  <td>
                    {item.customerName}
                    {item.customerPhone && <small className={styles.muted}> · {item.customerPhone}</small>}
                  </td>
                  <td>
                    {item.productName} · {item.variantName}
                  </td>
                  <td className={styles.code}>{item.assetCode}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
