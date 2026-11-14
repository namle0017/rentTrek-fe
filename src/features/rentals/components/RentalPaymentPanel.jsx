import { useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { formatCurrency } from '@/utils/formatCurrency';
import { useCreateRentalPayment, useRentalPaymentStatus } from '../hooks/useRentals';
import styles from '../pages/RentalCustomer.module.css';

/**
 * Thanh toán VietQR. additional = khoản thu sau khi đơn đã trả (gia hạn / phí vượt cọc):
 * hoàn tất khi chính khoản đó có kết quả, không dựa vào trạng thái thanh toán của đơn.
 */
export default function RentalPaymentPanel({ orderId, onSettled, additional = false, title }) {
  const create = useCreateRentalPayment();
  const { mutate: start } = create;
  const notified = useRef('');
  const payment = create.data?.data;
  useEffect(() => {
    start({ orderId });
  }, [start, orderId]);
  const statusQuery = useRentalPaymentStatus(orderId, payment?.paymentId, {}, additional);
  const status = statusQuery.data;
  const completed =
    status && (status.status !== 'Pending' || (!additional && status.orderPaymentStatus !== 'Unpaid'));
  useEffect(() => {
    if (!completed) return;
    const signal = `${status.paymentId}:${status.status}:${status.orderPaymentStatus}`;
    if (notified.current === signal) return;
    notified.current = signal;
    if (status.status === 'Succeeded' && (additional || status.orderPaymentStatus === 'Paid'))
      toast.success(additional ? 'Ngân hàng đã xác nhận khoản thanh toán.' : 'Ngân hàng đã xác nhận thanh toán đơn thuê.');
    onSettled?.();
  }, [completed, status, onSettled, additional]);
  const copy = async (value) => {
    try {
      await navigator.clipboard.writeText(String(value));
      toast.success('Đã sao chép.');
    } catch {
      toast.error('Không sao chép được. Vui lòng chép thủ công.');
    }
  };
  if (!payment)
    return (
      <section className={styles.card}>
        <h2>Thanh toán VietQR</h2>
        {create.isError ? (
          <>
            <p className={styles.error} role="alert">
              {create.error?.message || 'Không thể khởi tạo thanh toán.'}
            </p>
            <button className={styles.secondary} type="button" onClick={() => start({ orderId })}>
              Thử tạo lại mã thanh toán
            </button>
          </>
        ) : (
          <p role="status">Đang lấy mã QR từ hệ thống thanh toán...</p>
        )}
      </section>
    );
  const bank = payment.bankTransfer;
  if (payment.isDemo)
    return (
      <section className={styles.card} aria-label="Thanh toán mẫu">
        <span className={styles.badge}>DEMO — KHÔNG CHUYỂN TIỀN THẬT</span>
        <h2>Đã khởi tạo yêu cầu thanh toán mẫu</h2>
        <p>
          API tạo thanh toán đã được gọi. Tài khoản dưới đây chỉ dùng minh họa; không có mã QR chuyển tiền
          thật và không xác nhận đã trả tiền.
        </p>
        <dl className={styles.bankRows}>
          <div>
            <dt>Ngân hàng mẫu</dt>
            <dd>{bank?.bankName}</dd>
          </div>
          <div>
            <dt>Tài khoản mẫu</dt>
            <dd>{bank?.accountNumber}</dd>
          </div>
          <div>
            <dt>Tên minh họa</dt>
            <dd>{bank?.accountName}</dd>
          </div>
          <div>
            <dt>Số tiền của đơn</dt>
            <dd>{formatCurrency(payment.amount)}</dd>
          </div>
          <div>
            <dt>Mã yêu cầu</dt>
            <dd>{bank?.transferContent}</dd>
          </div>
        </dl>
        <p className={styles.hint}>
          Trạng thái hiện tại: {status?.status || payment.status}. Khi cấu hình tài khoản thật và tắt demo,
          cùng trang này sẽ hiển thị VietQR và theo dõi xác nhận ngân hàng.
        </p>
        <button
          type="button"
          className={styles.secondary}
          disabled={statusQuery.isFetching}
          onClick={() => statusQuery.refetch()}
        >
          Kiểm tra trạng thái API
        </button>
      </section>
    );
  if (!bank?.bankName || !bank?.accountNumber || !bank?.accountName || !bank?.qrImageUrl)
    return (
      <section className={styles.card}>
        <h2>Thanh toán chưa sẵn sàng</h2>
        <p role="alert" className={styles.error}>
          Thông tin tài khoản nhận tiền chưa đầy đủ. Vui lòng liên hệ cửa hàng; chưa chuyển tiền khi chưa có
          hướng dẫn hợp lệ.
        </p>
        <button type="button" className={styles.secondary} onClick={() => start({ orderId })}>
          Tải lại hướng dẫn thanh toán
        </button>
      </section>
    );
  if (completed)
    return (
      <section className={styles.card}>
        <h2>
          {status.status === 'Succeeded' || (!additional && status.orderPaymentStatus === 'Paid')
            ? 'Đã thanh toán'
            : 'Đang cập nhật kết quả giao dịch'}
        </h2>
        <p>Trạng thái do ngân hàng và hệ thống xác nhận. Nếu đã chuyển tiền, không chuyển lại.</p>
        <button type="button" className={styles.secondary} onClick={onSettled}>
          Tải lại đơn thuê
        </button>
      </section>
    );
  return (
    <section className={styles.card} aria-label="Thanh toán đơn thuê bằng VietQR">
      <h2>{title || 'Quét mã để thanh toán'}</h2>
      <div className={styles.qrLayout}>
        <img
          className={styles.qr}
          src={bank.qrImageUrl}
          width={220}
          height={220}
          alt={`VietQR thanh toán đơn ${payment.orderCode}`}
        />
        <dl className={styles.bankRows}>
          <div>
            <dt>Ngân hàng</dt>
            <dd>{bank.bankName}</dd>
          </div>
          <div>
            <dt>Chủ tài khoản</dt>
            <dd>{bank.accountName}</dd>
          </div>
          <div>
            <dt>Số tài khoản</dt>
            <dd>
              {bank.accountNumber}
              <button type="button" onClick={() => copy(bank.accountNumber)}>
                Sao chép số tài khoản
              </button>
            </dd>
          </div>
          <div>
            <dt>Số tiền</dt>
            <dd>
              {formatCurrency(payment.amount)}
              <button type="button" onClick={() => copy(payment.amount)}>
                Sao chép số tiền
              </button>
            </dd>
          </div>
          <div>
            <dt>Nội dung chuyển khoản</dt>
            <dd>
              {bank.transferContent}
              <button type="button" onClick={() => copy(bank.transferContent)}>
                Sao chép nội dung
              </button>
            </dd>
          </div>
        </dl>
      </div>
      <p className={styles.hint}>
        Chuyển đúng số tiền và giữ nguyên nội dung. Hệ thống tự xác nhận qua ngân hàng; không cần gửi ảnh
        chuyển khoản.
      </p>
      {statusQuery.isError && (
        <p role="alert" className={styles.error}>
          Chưa lấy được trạng thái thanh toán. Nếu đã chuyển tiền, không chuyển lại; hãy kiểm tra lại hoặc
          liên hệ cửa hàng.
        </p>
      )}
      <div className={styles.actions}>
        <span role="status">Đang chờ ngân hàng xác nhận...</span>
        <button
          type="button"
          className={styles.secondary}
          disabled={statusQuery.isFetching}
          onClick={() => statusQuery.refetch()}
        >
          {statusQuery.isFetching ? 'Đang kiểm tra...' : 'Kiểm tra thanh toán'}
        </button>
      </div>
    </section>
  );
}
