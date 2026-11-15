import { useState, useEffect, useCallback } from 'react';
import { FileText, X, AlertTriangle } from 'lucide-react';
import { REFUND_BANKS, REFUND_CASE_STATUS, REFUND_CASE_STATUS_LABEL } from '@/constants/enums';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import { API_ENDPOINTS } from '@/api/endpoints';
import { parseCancelReasonWithProofs } from '../utils/refundProofHelper';
import ProofGallery from './ProofGallery';
import { formatRefundCode, getBankName } from '../utils/refundDisplay';
import styles from './RefundDetailModal.module.css';

export default function RefundDetailModal({
  item,
  onClose,
  onApprove,
  onReject,
  onComplete,
  onMarkFailed,
  canSettle = true,
}) {
  const [activeLightboxUrl, setActiveLightboxUrl] = useState(null);

  const parsedReason = parseCancelReasonWithProofs(item?.cancelReason);

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
    [activeLightboxUrl, onClose],
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
    item.refundPercentage !== null && item.refundPercentage !== undefined
      ? item.refundPercentage
      : totalAmount > 0
        ? Math.round((item.amount / totalAmount) * 100)
        : 100;

  // Dữ liệu ngày khởi hành & mức áp dụng chính sách nếu có
  const departureDate = item.departureDate || item.startDate || item.tripStartDate || item.rentalStartAt;
  const appliedPolicyRule = item.appliedRule || item.appliedCase || item.policyRule || item.appliedPolicyRule;

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} role="dialog" aria-modal="true">
        <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className={styles.modalHeader}>
            <div className={styles.headerTitleGroup}>
              <div className={styles.headerTitleRow}>
                <h2 className={styles.headerTitle}>Hồ sơ {formatRefundCode(item.refundCaseId)}</h2>
                <span className={styles.badgeOrderType}>{isTour ? 'Tour Trekking' : 'Thuê Thiết Bị'}</span>
                <span className={styles.badgeStatus}>{REFUND_CASE_STATUS_LABEL[item.status]}</span>
              </div>
              <span className={styles.headerSubtitle}>
                Mã đơn: {item.orderCode} · Khởi tạo lúc: {formatDateTime(item.createdAt)}
              </span>
            </div>
            <button type="button" className={styles.closeButton} onClick={onClose} aria-label="Đóng cửa sổ">
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

            {item.appealReason && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FileText size={16} className={styles.sectionIcon} />
                  <span>Lý do khiếu nại của khách</span>
                </h3>
                <p className={styles.reasonDetailText}>{item.appealReason}</p>
              </section>
            )}

            {item.rejectionReason && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <AlertTriangle size={16} className={styles.sectionIcon} />
                  <span>Lý do từ chối trước đó</span>
                </h3>
                <p className={styles.reasonDetailText}>{item.rejectionReason}</p>
              </section>
            )}

            {/* Biên lai chuyển khoản: mã giao dịch + chứng từ admin đính kèm khi hoàn tất */}
            {(item.providerTransactionId || item.proofs?.length > 0) && (
              <section className={styles.section}>
                <h3 className={styles.sectionTitle}>
                  <FileText size={16} className={styles.sectionIcon} />
                  <span>Biên lai chuyển khoản từ RenTrek</span>
                </h3>
                {item.providerTransactionId && (
                  <p>
                    Mã giao dịch ngân hàng: <strong>{item.providerTransactionId}</strong>
                  </p>
                )}
                <ProofGallery
                  proofs={item.proofs ?? []}
                  buildUrl={(proofId) => API_ENDPOINTS.ADMIN_REFUND_CASES.PROOF(item.refundCaseId, proofId)}
                />
              </section>
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
                  <button type="button" className={styles.btnReject} onClick={() => onReject?.(item)}>
                    Từ chối
                  </button>
                  <button type="button" className={styles.btnApprove} onClick={() => onApprove?.(item)}>
                    Duyệt hoàn {formatCurrency(item.amount)}
                  </button>
                </>
              )}

              {isApproved && canSettle && (
                <>
                  <button type="button" className={styles.btnReject} onClick={() => onMarkFailed?.(item)}>
                    Báo chuyển thất bại
                  </button>
                  <button type="button" className={styles.btnApprove} onClick={() => onComplete?.(item)}>
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

          <div className={styles.lightboxImageWrapper} onClick={(e) => e.stopPropagation()}>
            <img src={activeLightboxUrl} alt="Ảnh phóng to" className={styles.lightboxFullImage} />
          </div>
        </div>
      )}
    </>
  );
}
