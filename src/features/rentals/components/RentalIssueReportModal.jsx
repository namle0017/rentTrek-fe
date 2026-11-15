import { useEffect, useState } from 'react';
import { ISSUE_CATEGORIES } from '@/features/refunds/utils/refundProofHelper';
import { useReportRentalIssue } from '../hooks/useRentals';
import styles from './RentalIssueReportModal.module.css';

const MAX_PHOTOS = 3;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_NOTE = 500;

/**
 * Khách báo lỗi thiết bị khi đang thuê: mỗi ảnh gửi một lần qua POST /rental-orders/{id}/issue-photos (multipart),
 * mô tả / mong muốn / SĐT được ghép vào ghi chú (tối đa 500 ký tự) để staff đọc cùng ảnh.
 */
export default function RentalIssueReportModal({ order, isOpen, onClose, onSuccess }) {
  const [selectedItemId, setSelectedItemId] = useState('');
  const [issueCategory, setIssueCategory] = useState('Damaged');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [photoError, setPhotoError] = useState('');
  const [preferredAction, setPreferredAction] = useState('Exchange');
  const [contactPhone, setContactPhone] = useState('');

  const reportIssueMutation = useReportRentalIssue();

  const reset = () => {
    setSelectedItemId('');
    setIssueCategory('Damaged');
    setDescription('');
    photos.forEach((photo) => URL.revokeObjectURL(photo.url));
    setPhotos([]);
    setPhotoError('');
    setPreferredAction('Exchange');
    setContactPhone('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Handle ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !order) return null;

  const proofUrls = photos.map((photo) => photo.url);

  const handleProofFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;
    const invalid = files.find((file) => !ACCEPT.includes(file.type) || file.size > MAX_BYTES);
    if (invalid) {
      setPhotoError(`Ảnh "${invalid.name}" phải là JPG/PNG/WebP và tối đa 5MB.`);
      return;
    }
    setPhotoError('');
    const room = MAX_PHOTOS - photos.length;
    setPhotos((prev) => [
      ...prev,
      ...files.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const removeProof = (idx) => {
    setPhotos((prev) => {
      URL.revokeObjectURL(prev[idx]?.url);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const buildNote = () => {
    const line =
      order.lines?.find((item) => (item.id || item.rentalOrderItemId) === selectedItemId) ?? order.lines?.[0];
    const parts = [
      `[${ISSUE_CATEGORIES[issueCategory] || issueCategory}]`,
      line?.displayName ? `Món: ${line.displayName}.` : '',
      description.trim(),
      `Mong muốn: ${preferredAction === 'Exchange' ? 'đổi thiết bị khác' : 'huỷ & hoàn tiền món này'}.`,
      contactPhone.trim() ? `SĐT liên hệ: ${contactPhone.trim()}.` : '',
    ];
    return parts.filter(Boolean).join(' ').slice(0, MAX_NOTE);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    if (photos.length === 0) {
      setPhotoError('Vui lòng đính kèm ít nhất 1 ảnh chụp rõ vết lỗi.');
      return;
    }

    try {
      await reportIssueMutation.mutateAsync({
        orderId: order.id,
        files: photos.map((photo) => photo.file),
        note: buildNote(),
      });
      onSuccess?.();
      handleClose();
    } catch {
      // Handled in mutation onError
    }
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="issue-modal-title"
    >
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.kicker}>BẢO HÀNH & HỖ TRỢ THIẾT BỊ</span>
            <h2 id="issue-modal-title">Báo cáo đồ thuê bị lỗi / hư hại</h2>
          </div>
          <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.body}>
          <div className={styles.tipBox}>
            <span>ℹ️</span>
            <div>
              <strong>Chính sách đổi trả hỏa tốc:</strong> Nếu thiết bị rách bạt, gãy cọc, kẹt khóa hoặc sai
              kích cỡ, quý khách vui lòng gửi ảnh trước giờ bắt đầu kỳ thuê để RenTrek đổi đồ mới ngay hoặc
              hoàn tiền 100% món đó.
            </div>
          </div>

          {order.lines?.length > 1 && (
            <div className={styles.field}>
              <label htmlFor="issue-item-select">Chọn món đồ bị sự cố</label>
              <select
                id="issue-item-select"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
              >
                {order.lines.map((line) => (
                  <option key={line.id} value={line.id}>
                    {line.displayName} ({line.quantity} món)
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="issue-category-select">Vấn đề gặp phải</label>
            <select
              id="issue-category-select"
              value={issueCategory}
              onChange={(e) => setIssueCategory(e.target.value)}
            >
              {Object.entries(ISSUE_CATEGORIES).map(([catKey, catLabel]) => (
                <option key={catKey} value={catKey}>
                  {catLabel}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="issue-desc-textarea">Mô tả chi tiết tình trạng lỗi *</label>
            <textarea
              id="issue-desc-textarea"
              rows="3"
              maxLength="500"
              required
              placeholder="Ví dụ: Khóa kéo lều bị kẹt không kéo được, cọc số 2 bị nứt cong..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <span className={styles.charCount}>{description.length}/500</span>
          </div>

          <div className={styles.field}>
            <label>Hướng xử lý mong muốn</label>
            <div className={styles.actionGrid}>
              <label
                className={`${styles.actionOption} ${
                  preferredAction === 'Exchange' ? styles.actionOptionSelected : ''
                }`}
              >
                <input
                  type="radio"
                  name="preferredAction"
                  value="Exchange"
                  checked={preferredAction === 'Exchange'}
                  onChange={(e) => setPreferredAction(e.target.value)}
                />
                <div>
                  <span className={styles.actionLabel}>Đổi thiết bị khác</span>
                  <span className={styles.actionDesc}>Kho gửi gấp đồ mới tương đương để bạn kịp đi tour</span>
                </div>
              </label>

              <label
                className={`${styles.actionOption} ${
                  preferredAction === 'RefundItem' ? styles.actionOptionSelected : ''
                }`}
              >
                <input
                  type="radio"
                  name="preferredAction"
                  value="RefundItem"
                  checked={preferredAction === 'RefundItem'}
                  onChange={(e) => setPreferredAction(e.target.value)}
                />
                <div>
                  <span className={styles.actionLabel}>Hủy & Hoàn tiền món này</span>
                  <span className={styles.actionDesc}>Hoàn 100% tiền thuê món đồ lỗi về tài khoản</span>
                </div>
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="issue-phone-input">Số điện thoại liên hệ hỗ trợ (nếu khác SĐT đặt)</label>
            <input
              id="issue-phone-input"
              type="tel"
              placeholder="Ví dụ: 0912345678"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label>Đính kèm ảnh minh chứng sự cố * (1–3 ảnh chụp rõ vết lỗi)</label>
            <input
              id="issue-proof-file"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleProofFiles}
              disabled={proofUrls.length >= 3}
            />
            {proofUrls.length < 3 && (
              <label htmlFor="issue-proof-file" className={styles.uploadBox}>
                <span className={styles.uploadText}>
                  📷 Bấm vào đây để tải ảnh chụp lỗi ({proofUrls.length}/3)
                </span>
              </label>
            )}

            {photoError && (
              <p className={styles.charCount} role="alert">
                {photoError}
              </p>
            )}
            {proofUrls.length > 0 && (
              <div className={styles.thumbGrid}>
                {proofUrls.map((url, idx) => (
                  <div key={`${url}-${idx}`} className={styles.thumbItem}>
                    <img src={url} alt={`Minh chứng lỗi ${idx + 1}`} className={styles.thumbImg} />
                    <button
                      type="button"
                      className={styles.removeThumbBtn}
                      onClick={() => removeProof(idx)}
                      title="Xóa ảnh"
                      aria-label={`Xóa ảnh ${idx + 1}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={handleClose}
              disabled={reportIssueMutation.isPending}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={styles.submitBtn}
              disabled={reportIssueMutation.isPending || !description.trim() || photos.length === 0}
            >
              {reportIssueMutation.isPending ? `Đang gửi ${photos.length} ảnh...` : 'Gửi báo cáo sự cố'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
