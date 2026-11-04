import { REFUND_TAB } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import styles from './finance.module.css';

export default function RefundQueueTable({
  tab,
  items = [],
  isLoading = false,
  onOpenApproveDrawer,
  onRetry,
  onOpenManualModal,
  onOpenReconcileModal,
  isRetrying = false,
}) {
  if (isLoading) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyBox}>Đang tải danh sách hàng đợi...</div>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={styles.tableCard}>
        <div className={styles.emptyBox}>
          <p>Hiện không có yêu cầu nào trong tab này.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableResponsive}>
        <table className={styles.table}>
          {tab === REFUND_TAB.PENDING_APPROVAL && (
            <>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className={styles.numberCell}>Tổng đã thu</th>
                  <th className={styles.numberCell}>Đề xuất hoàn</th>
                  <th>Mốc chính sách</th>
                  <th>Lý do hủy đơn</th>
                  <th>Thời gian yêu cầu</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.paymentId}>
                    <td>
                      <span className={styles.codeBadge}>{item.orderCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.customerName}</div>
                      <div className={styles.statSubtext}>{item.customerPhone}</div>
                    </td>
                    <td className={styles.numberCell}>{formatCurrency(item.totalCollected)}</td>
                    <td className={styles.numberCell}>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>
                        {formatCurrency(item.proposedRefund)}
                      </span>
                      <div className={styles.statSubtext}>({item.refundPercentage}%)</div>
                    </td>
                    <td>
                      <span className={styles.codeBadge} style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                        {item.policyRuleDescription}
                      </span>
                    </td>
                    <td style={{ maxWidth: 220 }}>
                      <span style={{ fontSize: 13, color: '#475569' }}>{item.cancelReason}</span>
                    </td>
                    <td>{formatDateTime(item.createdAt)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: 13 }}
                        onClick={() => onOpenApproveDrawer(item)}
                      >
                        Xem & Duyệt hoàn
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}

          {tab === REFUND_TAB.PENDING && (
            <>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className={styles.numberCell}>Số tiền hoàn</th>
                  <th>Mã lệnh SePay</th>
                  <th>Thời gian đẩy lệnh</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.paymentId}>
                    <td>
                      <span className={styles.codeBadge}>{item.orderCode}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.customerName}</div>
                      <div className={styles.statSubtext}>
                        {item.bankName} - {item.bankAccount}
                      </div>
                    </td>
                    <td className={styles.numberCell}>
                      <span style={{ fontWeight: 700, color: '#dc2626' }}>
                        {formatCurrency(Math.abs(item.amount))}
                      </span>
                    </td>
                    <td>
                      <span className={styles.codeBadge}>{item.providerRefundId}</span>
                    </td>
                    <td>{formatDateTime(item.sentAt)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgePending}`}>Đang chuyển qua SePay</span>
                      <div className={styles.statSubtext} style={{ marginTop: 2 }}>
                        Chờ webhook cập nhật
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}

          {tab === REFUND_TAB.FAILED && (
            <>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className={styles.numberCell}>Số tiền hoàn</th>
                  <th>Lý do lỗi SePay</th>
                  <th>Số lần thử lại</th>
                  <th>Lần thử cuối</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const isMaxRetry = item.retryCount >= item.maxRetries;
                  return (
                    <tr key={item.paymentId}>
                      <td>
                        <span className={styles.codeBadge}>{item.orderCode}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{item.customerName}</div>
                        <div className={styles.statSubtext}>
                          {item.bankName} - {item.bankAccount}
                        </div>
                      </td>
                      <td className={styles.numberCell}>
                        <span style={{ fontWeight: 700, color: '#dc2626' }}>
                          {formatCurrency(Math.abs(item.amount))}
                        </span>
                      </td>
                      <td style={{ maxWidth: 240 }}>
                        <span style={{ color: '#be123c', fontSize: 13 }}>⚠️ {item.failureReason}</span>
                      </td>
                      <td>
                        <span
                          className={styles.codeBadge}
                          style={isMaxRetry ? { background: '#fee2e2', color: '#b91c1c' } : {}}
                        >
                          {item.retryCount} / {item.maxRetries} lần
                        </span>
                        {isMaxRetry && (
                          <div style={{ color: '#be123c', fontSize: 11, marginTop: 2 }}>
                            Cần xử lý thủ công
                          </div>
                        )}
                      </td>
                      <td>{formatDateTime(item.lastAttemptAt)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className={styles.actionBtnGroup} style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '5px 10px', fontSize: 12 }}
                            onClick={() => onRetry(item.paymentId)}
                            disabled={isRetrying || isMaxRetry}
                            title={isMaxRetry ? 'Đã đạt tối đa 3 lần thử' : 'Thử lại qua cổng SePay'}
                          >
                            Thử lại
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: 12 }}
                            onClick={() => onOpenManualModal(item)}
                          >
                            Hoàn thủ công
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {tab === REFUND_TAB.NEEDS_RECONCILIATION && (
            <>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className={styles.numberCell}>Cần thanh toán</th>
                  <th className={styles.numberCell}>Thực nhận</th>
                  <th>Chênh lệch</th>
                  <th>Hạn chót đối soát</th>
                  <th>Ghi chú</th>
                  <th style={{ textAlign: 'center' }}>Thao tác đối soát</th>
                </tr>
              </thead>
              <tbody>
                {items.map((order) => {
                  const isOverpaid = order.difference > 0;
                  return (
                    <tr key={order.orderId}>
                      <td>
                        <span className={styles.codeBadge}>{order.orderCode}</span>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{order.customerName}</div>
                        <div className={styles.statSubtext}>{order.customerPhone}</div>
                      </td>
                      <td className={styles.numberCell}>{formatCurrency(order.totalAmount)}</td>
                      <td className={styles.numberCell}>
                        <span style={{ fontWeight: 700 }}>{formatCurrency(order.receivedAmount)}</span>
                      </td>
                      <td>
                        <span
                          className={`${styles.badgeDifference} ${
                            isOverpaid ? styles.diffOverpaid : styles.diffUnderpaid
                          }`}
                        >
                          {isOverpaid
                            ? `+${formatCurrency(order.difference)} Thừa`
                            : `${formatCurrency(order.difference)} Thiếu`}
                        </span>
                      </td>
                      <td>
                        <div style={{ color: '#b91c1c', fontWeight: 600 }}>
                          ⏰ {formatDateTime(order.reconciliationDeadlineAt)}
                        </div>
                        <div className={styles.statSubtext}>Trong vòng 24 giờ</div>
                      </td>
                      <td style={{ maxWidth: 200, fontSize: 13 }}>{order.notes}</td>
                      <td style={{ textAlign: 'center' }}>
                        <div className={styles.actionBtnGroup} style={{ justifyContent: 'center' }}>
                          <button
                            type="button"
                            className="btn btn-primary"
                            style={{ padding: '5px 10px', fontSize: 12 }}
                            onClick={() => onOpenReconcileModal(order, 'accept')}
                            title="Xác nhận đơn và tự động hoàn tiền thừa"
                          >
                            ✓ Chấp nhận
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{
                              padding: '5px 10px',
                              fontSize: 12,
                              color: '#dc2626',
                              borderColor: '#fca5a5',
                            }}
                            onClick={() => onOpenReconcileModal(order, 'refund')}
                            title="Hoàn 100% tiền và đóng đơn"
                          >
                            ✕ Hoàn hết & Đóng
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </>
          )}

          {tab === REFUND_TAB.HISTORY && (
            <>
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th className={styles.numberCell}>Số tiền</th>
                  <th>Hình thức xử lý</th>
                  <th>Mã tham chiếu / SePay</th>
                  <th>Thời điểm giải quyết</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {items.map((hist, idx) => (
                  <tr key={hist.paymentId || hist.orderId || idx}>
                    <td>
                      <span className={styles.codeBadge}>{hist.orderCode}</span>
                    </td>
                    <td>{hist.customerName}</td>
                    <td className={styles.numberCell}>
                      <span style={{ fontWeight: 700 }}>{formatCurrency(Math.abs(hist.amount))}</span>
                    </td>
                    <td>
                      <span className={styles.codeBadge} style={{ background: '#f0fdf4', color: '#166534' }}>
                        {hist.resolutionType}
                      </span>
                    </td>
                    <td>
                      <span className={styles.codeBadge}>{hist.referenceCode}</span>
                    </td>
                    <td>{formatDateTime(hist.processedAt)}</td>
                    <td>
                      <span className={`${styles.badge} ${styles.badgeSucceeded}`}>Hoàn tất</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </>
          )}
        </table>
      </div>
    </div>
  );
}
