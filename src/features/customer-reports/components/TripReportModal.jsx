import { useEffect, useRef, useState } from 'react';
import Modal from '@/components/Modal';
import {
  CUSTOMER_REPORT_SOURCE,
  PREFERRED_ACTION_LABEL,
  TRIP_REPORT_CATEGORY_LABEL,
} from '../constants/customerReportLabels';
import { useCreateCustomerReport } from '../hooks/useCustomerReports';
import styles from './CustomerReports.module.css';

const MAX_PHOTOS = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MIN_DESCRIPTION = 10;
const MAX_DESCRIPTION = 2000;
const TRIP_ACTIONS = ['Feedback', 'Refund', 'Other'];

/** Khách (chủ booking hoặc người tham gia) báo cáo vấn đề trong chuyến đi: HDV, lịch trình, an toàn, dịch vụ... */
export default function TripReportModal({ orderId, tripLabel, onClose }) {
  const [category, setCategory] = useState('Guide');
  const [subjectLabel, setSubjectLabel] = useState('');
  const [description, setDescription] = useState('');
  const [preferredAction, setPreferredAction] = useState('Feedback');
  const [contactPhone, setContactPhone] = useState('');
  const [photos, setPhotos] = useState([]); // [{ file, url }]
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const photosRef = useRef(photos);
  const createReport = useCreateCustomerReport();

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  // Thu hồi URL xem trước khi đóng modal
  useEffect(() => () => photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.url)), []);

  const addPhotos = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    const invalid = files.find((file) => !ACCEPT.includes(file.type) || file.size > MAX_BYTES);
    if (invalid) {
      setError(`Ảnh "${invalid.name}" phải là JPG/PNG/WebP và tối đa 5MB.`);
      return;
    }
    setError('');
    setPhotos((current) => [
      ...current,
      ...files
        .slice(0, MAX_PHOTOS - current.length)
        .map((file) => ({ file, url: URL.createObjectURL(file) })),
    ]);
  };

  const removePhoto = (index) =>
    setPhotos((current) => {
      URL.revokeObjectURL(current[index]?.url);
      return current.filter((_, i) => i !== index);
    });

  const submit = (event) => {
    event.preventDefault();
    if (description.trim().length < MIN_DESCRIPTION) {
      setError(`Mô tả tối thiểu ${MIN_DESCRIPTION} ký tự để đội vận hành nắm rõ vấn đề.`);
      return;
    }
    setError('');
    createReport.mutate(
      {
        sourceType: CUSTOMER_REPORT_SOURCE.TRIP,
        orderId,
        category,
        subjectLabel: subjectLabel.trim() || undefined,
        description: description.trim(),
        preferredAction,
        contactPhone: contactPhone.trim() || undefined,
        files: photos.map((photo) => photo.file),
      },
      {
        onSuccess: onClose,
        onError: (err) => {
          const fieldErrors = Object.values(err?.errors ?? {}).flat();
          if (fieldErrors.length) setError(fieldErrors.join(' '));
        },
      },
    );
  };

  return (
    <Modal title="Báo cáo vấn đề chuyến đi" onClose={onClose}>
      <form className={styles.form} onSubmit={submit} noValidate>
        {tripLabel && <p className={styles.hint}>{tripLabel}</p>}

        <label className={styles.field}>
          <span>Vấn đề gặp phải</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {Object.entries(TRIP_REPORT_CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Hoạt động / thời điểm liên quan (không bắt buộc)</span>
          <input
            maxLength={255}
            placeholder="Ví dụ: Ngày 2 – chặng leo đỉnh"
            value={subjectLabel}
            onChange={(e) => setSubjectLabel(e.target.value)}
          />
        </label>

        <label className={styles.field}>
          <span>Mô tả chi tiết *</span>
          <textarea
            rows={5}
            maxLength={MAX_DESCRIPTION}
            required
            placeholder="Mô tả điều đã xảy ra, thời gian, người liên quan..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <span className={styles.hint}>
            {description.length}/{MAX_DESCRIPTION}
          </span>
        </label>

        <label className={styles.field}>
          <span>Bạn mong muốn</span>
          <select value={preferredAction} onChange={(e) => setPreferredAction(e.target.value)}>
            {TRIP_ACTIONS.map((value) => (
              <option key={value} value={value}>
                {PREFERRED_ACTION_LABEL[value]}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Số điện thoại liên hệ (nếu khác số đã đăng ký)</span>
          <input
            type="tel"
            maxLength={15}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </label>

        <div className={styles.field}>
          <span className={styles.fieldLabel}>Ảnh minh hoạ (không bắt buộc, tối đa {MAX_PHOTOS} ảnh)</span>
          {photos.length > 0 && (
            <div className={styles.thumbs}>
              {photos.map((photo, index) => (
                <div key={photo.url} className={styles.thumb}>
                  <img src={photo.url} alt={`Ảnh ${index + 1}`} />
                  <button
                    type="button"
                    className={styles.thumbRemove}
                    aria-label={`Xoá ảnh ${index + 1}`}
                    onClick={() => removePhoto(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              className={`btn btn-outline ${styles.uploadButton}`}
              onClick={() => fileInputRef.current?.click()}
            >
              Thêm ảnh
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT.join(',')}
            multiple
            hidden
            aria-label="Chọn ảnh minh hoạ"
            onChange={addPhotos}
          />
        </div>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={createReport.isPending}
          >
            Huỷ
          </button>
          <button type="submit" className="btn btn-primary" disabled={createReport.isPending}>
            {createReport.isPending ? 'Đang gửi…' : 'Gửi báo cáo'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
