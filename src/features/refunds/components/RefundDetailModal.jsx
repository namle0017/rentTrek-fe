import { useState, useEffect, useCallback } from 'react';
import { FileText, X, AlertTriangle } from 'lucide-react';
import { REFUND_BANKS, REFUND_CASE_STATUS, REFUND_CASE_STATUS_LABEL } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import {
  parseCancelReasonWithProofs,
  parseAdminTransactionWithProof,
  OVERRIDE_TYPES,
} from '../utils/refundProofHelper';
import { formatRefundCode, getBankName } from '../utils/refundDisplay';
import styles from './RefundDetailModal.module.css';

export default function RefundDetailModal({
  item,
  onClose,
  onApprove,
  onReject,
  onComplete,
  onMarkFailed,
}) {
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);
  const [showOverrideForm, setShowOverrideForm] = useState(false);
  const [overrideType, setOverrideType] = useState('ForceMajeureException');
  const [customAmount, setCustomAmount] = useState(
    item?.orderTotalAmount ? String(item.orderTotalAmount) : String(item?.amount || '')
  );
  const [overrideReason, setOverrideReason] = useState('');

  const parsedReason = parseCancelReasonWithProofs(item?.cancelReason);
  const parsedAdminTx = parseAdminTransactionWithProof(item?.providerTransactionId);

  // Xử lý phím ESC để đóng Lightbox hoặc Modal
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') {
        if (activeLightboxUrl) {
          setActiveLightboxUrl(null);
        } else {
          onClose();
        }
      }
    },
    [activeLightboxUrl, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!item) return null;

  const isTour = Boolean(item.tourName);
  const isRequested = item.status === REFUND_CASE_STATUS.REQUESTED;
  const isApproved = item.status === REFUND_CASE_STATUS.APPROVED;
  const isCompleted = item.status === REFUND_CASE_STATUS.COMPLETED;

  // Tính phần trăm hoàn tiền
  const totalAmount = item.orderTotalAmount || item.paidAmount || item.totalAmount || item.amount;
  const refundPercent =
    item.refundPercentage != null
      ? item.refundPercentage
      : totalAmount > 0
        ? Math.round((item.amount / totalAmount) * 100)
        : 100;

  // Dữ liệu ngày khởi hành & mức áp dụng chính sách nếu có
  const departureDate =
    item.departureDate || item.startDate || item.tripStartDate || item.rentalStartAt;
  const appliedPolicyRule =
    item.appliedRule || item.appliedCase || item.policyRule || item.appliedPolicyRule;

  const handleStandardApprove = () => {
    onApprove?.(item, { overrideType: 'PolicyStandard', approvedAmount: item.amount });
  };

  const handleCustomOverrideSubmit = (e) => {
    e.preventDefault();
    const amountNum = Number(customAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    onApprove?.(item, {
      overrideType,
      approvedAmount: amountNum,
      adminApprovalReason: overrideReason.trim(),
    });
  };

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerTitleGroup}>
              <div className={styles.headerTitleRow}>
                <h2 className={styles.headerTitle}>Hồ sơ {formatRefundCode(item.refundCaseId)}</h2>
                <span className={styles.badgeOrderType}>
                  {isTour ? 'Tour Trekking' : 'Thuê Thiết Bị'}
                </span>
                <span className={styles.badgeStatus}>{REFUND_CASE_STATUS_LABEL[item.status]}</span>
              </div>
              <span className={styles.headerSubtitle}>
                Mã đơn: {item.orderCode} · Khởi tạo lúc: {formatDateTime(item.createdAt)}
              </span>
            </div>
            <button
              type="button"
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Đóng cửa sổ"
            >
              <X size={14} />
            </button>
          </div>

          {/* Modal Body */}
          <div className={styles.modalBody}>
            {/* Lưới thông tin đơn hàng & Khách hàng */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Khách hàng</span>
                <span className={styles.infoValue}>{item.customerName}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Dịch vụ / Tuyến tour</span>
                <span className={styles.infoValue}>{item.tourName || 'Đơn thuê thiết bị dã ngoại'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tổng tiền đơn hàng</span>
                <span className={styles.infoValue}>
                  {formatCurrency(item.orderTotalAmount || item.amount)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Số tiền hoàn (theo chính sách)</span>
                <span className={styles.infoValueHighlight}>
                  {formatCurrency(item.amount)} ({refundPercent}%)
                </span>
              </div>
              {departureDate && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Ngày khởi hành</span>
                  <span className={styles.infoValue}>{formatDateTime(departureDate)}</span>
                </div>
              )}
              {appliedPolicyRule && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Mức áp dụng chính sách</span>
                  <span className={styles.infoValue}>{appliedPolicyRule}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Chính sách áp dụng</span>
                <span className={styles.infoValue}>
                  {item.policyName} (v{item.policyVersion})
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tài khoản thụ hưởng</span>
                <span className={styles.infoValue}>
                  {getBankName(REFUND_BANKS, item.bankCode)} · {item.maskedAccount}
                </span>
              </div>
            </div>

            {/* Khối Lý do & Minh chứng từ khách hàng */}
            <section className={styles.section}>
              <h3 className={styles.sectionTitle}>
                <FileText size={16} className={styles.sectionIcon} />
                <span>Lý do & Minh chứng từ khách hàng</span>
              </h3>
              <div className={styles.reasonBox}>
                <span className={styles.reasonCategoryTag}>{parsedReason.categoryLabel}</span>
                <p className={styles.reasonDetailText}>
                  {parsedReason.detail || 'Khách hàng không nhập mô tả chi tiết.'}
                </p>
              </div>

              {/* Gallery ảnh minh chứng của khách */}
              {parsedReason.hasProofs ? (
                <div>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: '#475569',
                      display: 'block',
                      marginBottom: '8px',
                    }}
                  >
                    Tệp ảnh đính kèm ({parsedReason.proofUrls.length} ảnh — bấm để phóng to toàn màn hình):
                  </span>
                  <div className={styles.galleryGrid}>
                    {parsedReason.proofUrls.map((url, idx) => (
                      <button
                        key={`${url}-${idx}`}
                        type="button"
                        className={styles.proofThumbnail}
                        onClick={() => setActiveLightboxUrl(url)}
                        title="Bấm để xem ảnh phóng to"
                      >
                        <img
                          src={url}
                          alt={`Minh chứng ${idx + 1}`}
                          className={styles.proofImage}
                          loading="lazy"
                        />
                        <span className={styles.thumbnailOverlay}>🔍 Phóng to</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.noProofAlert} role="alert">
                  <AlertTriangle size={16} className={styles.alertIcon} />
                  <span>Khách hàng không đính kèm tệp ảnh minh chứng nào cho yêu cầu này.</span>
                </div>
              )}
            </section>

            {/* Khối Biên lai chuyển khoản ngân hàng của Admin (nếu đã có) */}
            {parsedAdminTx.hasProof && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FileText size={16} className={styles.sectionIcon} />
                  <span>Biên lai chuyển khoản từ RenTrek</span>
                </h3>
                <div className={styles.receiptCard}>
                  <img
                    src={parsedAdminTx.proofUrl}
                    alt="Biên lai chuyển tiền ngân hàng"
                    className={styles.receiptThumbnail}
                    onClick={() => setActiveLightboxUrl(parsedAdminTx.proofUrl)}
                    title="Bấm xem phóng to biên lai"
                  />
                  <div className={styles.receiptInfo}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#166534' }}>
                      Đã tải lên chứng từ ủy nhiệm chi / biên lai chuyển khoản
                    </span>
                    {parsedAdminTx.transactionId && (
                      <span style={{ fontSize: '0.8125rem', color: '#4b5563' }}>
                        Mã giao dịch ngân hàng: <strong>{parsedAdminTx.transactionId}</strong>
                      </span>
                    )}
                    <span style={{ fontSize: '0.75rem', color: '#15803d' }}>
                      ✓ Bấm vào ảnh để soi rõ con dấu và thời điểm giao dịch
                    </span>
                  </div>
                </div>
              </section>
            )}

            {/* Form Ghi đè số tiền hoàn (khi mở chế độ Miễn trừ đặc biệt) */}
            {showOverrideForm && isRequested && (
              <form className={styles.overrideForm} onSubmit={handleCustomOverrideSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#b45309' }}>
                    ⚡ Phê duyệt Miễn trừ Đặc biệt (Ghi đè số tiền hoàn)
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowOverrideForm(false)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
                  >
                    Hủy
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label className="form-field">
                    <span>Loại miễn trừ</span>
                    <select
                      value={overrideType}
                      onChange={(e) => setOverrideType(e.target.value)}
                    >
                      {Object.entries(OVERRIDE_TYPES).map(([val, label]) => (
                        <option key={val} value={val}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="form-field">
                    <span>Số tiền duyệt hoàn (VNĐ)</span>
                    <input
                      type="number"
                      min="1000"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      required
                    />
                  </label>
                </div>
                <label className="form-field">
                  <span>Lý do phê duyệt miễn trừ đặc biệt (Ghi chú đối soát)</span>
                  <input
                    type="text"
                    value={overrideReason}
                    placeholder="Ví dụ: Đường đèo sạt lở theo thông báo kiểm lâm, chấp thuận hoàn 100%"
                    onChange={(e) => setOverrideReason(e.target.value)}
                    required
                  />
                </label>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={() => setShowOverrideForm(false)}
                  >
                    Quay lại
                  </button>
                  <button type="submit" className={styles.btnApprove} style={{ backgroundColor: '#b45309', borderColor: '#b45309' }}>
                    Xác nhận duyệt ghi đè {formatCurrency(Number(customAmount) || 0)}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className={styles.modalFooter}>
            <button type="button" className={styles.btnSecondary} onClick={onClose}>
              Đóng
            </button>

            <div className={styles.actionGroup}>
              {isRequested && (
                <>
                  <button
                    type="button"
                    className={styles.btnReject}
                    onClick={() => onReject?.(item)}
                  >
                    Từ chối
                  </button>
                  {!showOverrideForm && (
                    <button
                      type="button"
                      className={styles.btnOverride}
                      title="Miễn trừ do thiên tai / sạt lở hoặc lỗi thiết bị từ RenTrek"
                      onClick={() => setShowOverrideForm(true)}
                    >
                      Duyệt miễn trừ
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnApprove}
                    onClick={handleStandardApprove}
                  >
                    Duyệt chuẩn ({formatCurrency(item.amount)})
                  </button>
                </>
              )}

              {isApproved && (
                <>
                  <button
                    type="button"
                    className={styles.btnReject}
                    onClick={() => onMarkFailed?.(item)}
                  >
                    Báo chuyển thất bại
                  </button>
                  <button
                    type="button"
                    className={styles.btnApprove}
                    onClick={() => onComplete?.(item)}
                  >
                    Đã hoàn tiền & Tải biên lai
                  </button>
                </>
              )}

              {isCompleted && (
                <span style={{ fontSize: '0.875rem', color: '#16a34a', fontWeight: 600 }}>
                  ✓ Hồ sơ đã hoàn tất chuyển khoản
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox Zoom Viewer toàn màn hình */}
      {activeLightboxUrl && (
        <div
          className={styles.lightboxOverlay}
          onClick={() => setActiveLightboxUrl(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
        >
          <div className={styles.lightboxHeader} onClick={(e) => e.stopPropagation()}>
            <a
              href={activeLightboxUrl}
              target="_blank"
              rel="noreferrer"
              className={styles.lightboxCloseBtn}
              title="Mở ảnh gốc trong tab mới"
            >
              ↗
            </a>
            <button
              type="button"
              className={styles.lightboxCloseBtn}
              onClick={() => setActiveLightboxUrl(null)}
              aria-label="Đóng phóng to"
            >
              <X size={20} />
            </button>
          </div>

          <div
            className={styles.lightboxImageWrapper}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeLightboxUrl}
              alt="Ảnh phóng to"
              className={styles.lightboxFullImage}
            />
          </div>
        </div>
      )}
    </>
  );
}
