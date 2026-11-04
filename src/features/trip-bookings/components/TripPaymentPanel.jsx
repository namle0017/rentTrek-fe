import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { PAYMENT_STATUS, PAYMENT_TRANSACTION_STATUS } from '@/constants/enums';
import { useCreatePayment, usePaymentStatus } from '@/features/orders/hooks/useOrders';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './TripPaymentPanel.module.css';

const copy = async (label, value) => {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(`Đã sao chép ${label}.`);
  } catch {
    toast.error('Không thể sao chép, vui lòng chép thủ công.');
  }
};

/** Chuyển khoản VietQR qua SePay — BE tự xác nhận qua webhook, FE chỉ poll trạng thái. */
export default function TripPaymentPanel({ orderId, onSettled }) {
  const createPayment = useCreatePayment();
  const { mutate: startPayment } = createPayment;
  const payment = createPayment.data?.data;

  // Vào trang là tạo QR luôn. BE trả lại đúng lần thanh toán Pending nếu đã có, nên F5 không tạo trùng.
  useEffect(() => {
    startPayment(orderId);
  }, [startPayment, orderId]);
  const { data: status } = usePaymentStatus(orderId, payment?.paymentId);

  // Thanh toán xong hoặc đơn chuyển sang cần đối soát: tải lại booking để trang tự đổi trạng thái
  const settled =
    status &&
    (status.status !== PAYMENT_TRANSACTION_STATUS.PENDING ||
      status.orderPaymentStatus !== PAYMENT_STATUS.UNPAID);

  useEffect(() => {
    if (!settled) return;
    if (status.status === PAYMENT_TRANSACTION_STATUS.SUCCEEDED) toast.success('Thanh toán thành công.');
    onSettled?.();
  }, [settled, status, onSettled]);

  if (!payment) {
    return (
      <section className={styles.panel}>
        <div>
          <strong>Thanh toán chuyển khoản</strong>
          <p>Quét mã VietQR bằng app ngân hàng. Hệ thống tự xác nhận sau khi nhận tiền.</p>
          {createPayment.isError && (
            <p className={styles.error} role="alert">
              {createPayment.error?.message || 'Không thể khởi tạo thanh toán.'}
            </p>
          )}
        </div>
        {createPayment.isError ? (
          <button type="button" className={styles.primary} onClick={() => startPayment(orderId)}>
            Thử lại
          </button>
        ) : (
          <p aria-live="polite">Đang tạo mã QR...</p>
        )}
      </section>
    );
  }

  const failed =
    status?.status === PAYMENT_TRANSACTION_STATUS.FAILED ||
    status?.status === PAYMENT_TRANSACTION_STATUS.CANCELLED;

  if (failed) {
    return (
      <section className={styles.panel}>
        <div>
          <strong>Thanh toán chưa thành công</strong>
          <p className={styles.error} role="alert">
            {status.failureReason || 'Giao dịch đã bị hủy hoặc thất bại.'} Nếu đã chuyển tiền, không chuyển
            lại và liên hệ hỗ trợ.
          </p>
        </div>
        <button type="button" className={styles.primary} onClick={() => startPayment(orderId)}>
          Tạo lại mã QR
        </button>
      </section>
    );
  }

  const bank = payment.bankTransfer;
  const rows = [
    ['Ngân hàng', bank.bankName],
    ['Số tài khoản', bank.accountNumber, 'số tài khoản'],
    ['Chủ tài khoản', bank.accountName],
    ['Số tiền', formatCurrency(payment.amount), 'số tiền', String(payment.amount)],
    ['Nội dung', bank.transferContent, 'nội dung'],
  ];

  return (
    <section className={styles.panel}>
      <img
        className={styles.qr}
        src={bank.qrImageUrl}
        alt={`Mã QR chuyển khoản ${payment.orderCode}`}
        width={240}
        height={240}
      />
      <div className={styles.details}>
        <strong>Quét mã để thanh toán</strong>
        <dl>
          {rows.map(([label, value, copyLabel, copyValue]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>
                {value}
                {copyLabel && (
                  <button type="button" onClick={() => copy(copyLabel, copyValue ?? value)}>
                    Sao chép
                  </button>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <p className={styles.warning}>
          Giữ nguyên nội dung <b>{bank.transferContent}</b> và chuyển đúng số tiền để hệ thống tự xác nhận.
        </p>
        <p className={styles.waiting} aria-live="polite">
          Đang chờ xác nhận thanh toán...
        </p>
      </div>
    </section>
  );
}
