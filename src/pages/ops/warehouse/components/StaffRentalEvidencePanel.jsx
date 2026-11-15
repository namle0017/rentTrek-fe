import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import Modal from '@/components/Modal';
import { rentalOpsService } from '@/features/rental-ops/api/rentalOpsService';
import {
  RENTAL_REPORT_STATUS_LABEL,
  RENTAL_REPORT_TYPE_LABEL,
} from '@/features/rental-ops/constants/rentalOpsLabels';
import EvidencePhotoGallery from '@/features/rentals/components/EvidencePhotoGallery';
import styles from './StaffRentalEvidencePanel.module.css';

const TARGET_STATUS = { Handover: 'Reserved', Return: 'Issued' };

/**
 * Bằng chứng giao / nhận của staff: mỗi thiết bị phải đủ ảnh trước khi bấm giao / nhận (BE chặn nếu thiếu).
 * Kèm thao tác báo khách không đến (màn giao) và gửi báo cáo kiểm tra trả đồ cho admin (màn nhận).
 */
export default function StaffRentalEvidencePanel({ orderId, stage, refreshKey }) {
  const queryClient = useQueryClient();
  const [lightboxUrl, setLightboxUrl] = useState(null);
  const [dialog, setDialog] = useState(null); // 'noShow' | 'report'
  const [note, setNote] = useState('');
  const queryKey = ['rental-ops', 'evidence', orderId, refreshKey];
  const detailQuery = useQuery({
    queryKey,
    queryFn: () => rentalOpsService.getById(orderId),
    select: (res) => res.data,
    enabled: Boolean(orderId),
  });
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['rental-ops', 'evidence', orderId] });
    queryClient.invalidateQueries({ queryKey: ['fulfillment'] });
  };
  const upload = useMutation({
    mutationFn: rentalOpsService.uploadEvidence,
    onSuccess: refresh,
    onError: (error) => toast.error(error?.message || 'Không tải được ảnh.'),
  });
  const remove = useMutation({
    mutationFn: rentalOpsService.deleteEvidence,
    onSuccess: refresh,
    onError: (error) => toast.error(error?.message || 'Không xoá được ảnh.'),
  });
  const noShow = useMutation({
    mutationFn: rentalOpsService.reportNoShow,
    onSuccess: () => {
      toast.success('Đã báo khách không đến nhận. Hệ thống đã huỷ đơn và mở hồ sơ hoàn phần còn lại.');
      setDialog(null);
      refresh();
    },
  });
  const report = useMutation({
    mutationFn: rentalOpsService.submitReturnReport,
    onSuccess: () => {
      toast.success('Đã gửi báo cáo cho admin duyệt và quyết toán cọc.');
      setDialog(null);
      refresh();
    },
  });

  const order = detailQuery.data;
  if (!orderId || !order) return null;
  const minPhotos = order.allowedActions?.minPhotosPerAsset ?? 1;
  const targets = (order.assignments || []).filter((a) => a.status === TARGET_STATUS[stage]);
  const photos = order.evidencePhotos || [];
  const countFor = (assignmentId, photoStage = stage) =>
    photos.filter((p) => p.assetAssignmentId === assignmentId && p.stage === photoStage).length;
  const missing = targets.filter((a) => countFor(a.assignmentId) < minPhotos).length;

  const uploadFiles = async (assignmentId, files, photoStage = stage) => {
    for (const file of Array.from(files || [])) {
      await upload.mutateAsync({ orderId, file, stage: photoStage, assignmentId }).catch(() => {});
    }
  };

  return (
    <section className={styles.panel} aria-label="Ảnh bằng chứng">
      <div className={styles.heading}>
        <h2>{stage === 'Handover' ? 'Ảnh tình trạng lúc giao' : 'Ảnh tình trạng lúc nhận lại'}</h2>
        <span className={missing > 0 ? styles.warn : styles.ok}>
          {targets.length === 0
            ? 'Không còn thiết bị ở bước này'
            : missing > 0
              ? `${missing} thiết bị chưa đủ ${minPhotos} ảnh`
              : 'Đã đủ ảnh'}
        </span>
      </div>
      {targets.length > 0 && (
        <ul className={styles.list}>
          {targets.map((a) => (
            <li key={a.assignmentId} className={styles.row}>
              <span>
                <strong>{a.assetCode}</strong>
                <small>{a.displayName}</small>
              </span>
              <span className={countFor(a.assignmentId) >= minPhotos ? styles.ok : styles.warn}>
                {countFor(a.assignmentId)}/{minPhotos} ảnh
              </span>
              <label className={styles.upload}>
                Chụp / chọn ảnh
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  multiple
                  disabled={upload.isPending}
                  onChange={(event) => {
                    void uploadFiles(a.assignmentId, event.target.files);
                    event.target.value = '';
                  }}
                />
              </label>
              {stage === 'Return' && (
                <label className={styles.upload}>
                  Ảnh hư hỏng
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={upload.isPending}
                    onChange={(event) => {
                      void uploadFiles(a.assignmentId, event.target.files, 'Damage');
                      event.target.value = '';
                    }}
                  />
                </label>
              )}
            </li>
          ))}
        </ul>
      )}
      {upload.isPending && <p role="status">Đang tải ảnh...</p>}
      <EvidencePhotoGallery
        photos={photos}
        title="Ảnh đã lưu"
        onOpen={setLightboxUrl}
        onDelete={(photo) => remove.mutate({ orderId, photoId: photo.id })}
        canDelete={(photo) =>
          targets.some((a) => a.assignmentId === photo.assetAssignmentId) &&
          (photo.stage === stage || photo.stage === 'Damage')
        }
      />

      <div className={styles.actions}>
        {stage === 'Handover' && order.allowedActions?.canReportNoShow && (
          <button type="button" className={styles.danger} onClick={() => setDialog('noShow')}>
            Báo khách không đến nhận
          </button>
        )}
        {stage === 'Return' && order.allowedActions?.canSubmitReturnReport && (
          <button type="button" className={styles.primary} onClick={() => setDialog('report')}>
            Gửi báo cáo kiểm tra cho admin
          </button>
        )}
      </div>
      {order.reports?.length > 0 && (
        <ul className={styles.reports} aria-label="Báo cáo của đơn">
          {order.reports.map((r) => (
            <li key={r.rentalReportId}>
              {RENTAL_REPORT_TYPE_LABEL[r.reportType] || r.reportType} ·{' '}
              <strong>{RENTAL_REPORT_STATUS_LABEL[r.status] || r.status}</strong>
              {r.reviewNote && <small> · Admin: {r.reviewNote}</small>}
            </li>
          ))}
        </ul>
      )}

      {dialog && (
        <Modal
          title={dialog === 'noShow' ? 'Báo khách không đến nhận' : 'Gửi báo cáo kiểm tra trả đồ'}
          onClose={() => setDialog(null)}
        >
          <form
            className={styles.form}
            onSubmit={(event) => {
              event.preventDefault();
              const mutation = dialog === 'noShow' ? noShow : report;
              mutation.mutate({ orderId, note: note.trim() || undefined });
            }}
          >
            <p>
              {dialog === 'noShow'
                ? 'Đơn sẽ bị huỷ, khách mất toàn bộ cọc, thiết bị được nhả về kho và khách nhận email nhập số tài khoản để hoàn phần tiền thuê.'
                : 'Báo cáo gồm tình trạng, ảnh và các phí (hư hỏng, mất, trễ). Admin duyệt rồi hệ thống quyết toán cọc: hoàn phần dư hoặc thu thêm.'}
            </p>
            <label>
              Ghi chú
              <textarea rows={3} maxLength={2000} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            {(noShow.isError || report.isError) && (
              <p role="alert" className={styles.warn}>
                {(noShow.error || report.error)?.message}
              </p>
            )}
            <button type="submit" className={styles.primary} disabled={noShow.isPending || report.isPending}>
              Xác nhận
            </button>
          </form>
        </Modal>
      )}
      {lightboxUrl && (
        <Modal title="Ảnh bằng chứng" onClose={() => setLightboxUrl(null)}>
          <img src={lightboxUrl} alt="Ảnh bằng chứng" style={{ maxWidth: '100%' }} />
        </Modal>
      )}
    </section>
  );
}
