import { useEffect, useState } from 'react';
import Modal from '@/components/Modal';
import { refundService } from '../api/refundService';
import styles from './ProofGallery.module.css';

/** Tải ảnh qua axios (có token) rồi dựng blob URL; thu hồi URL khi unmount. */
function useProofImage(path) {
  const [state, setState] = useState({ url: null, failed: false });

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;
    Promise.resolve(refundService.fetchProofBlob(path))
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ url: objectUrl, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ url: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);

  return state;
}

function ProofThumb({ proof, path }) {
  const { url, failed } = useProofImage(path);
  const [isOpen, setIsOpen] = useState(false);

  if (failed) return <span className={styles.placeholder}>Lỗi tải ảnh</span>;
  if (!url) return <span className={styles.placeholder}>Đang tải...</span>;

  return (
    <>
      <button
        type="button"
        className={styles.thumbButton}
        aria-label={`Xem ảnh ${proof.fileName}`}
        onClick={() => setIsOpen(true)}
      >
        <img className={styles.thumb} src={url} alt={proof.fileName} />
      </button>
      {isOpen && (
        <Modal title={proof.fileName} onClose={() => setIsOpen(false)}>
          <img className={styles.full} src={url} alt={`${proof.fileName} (phóng to)`} />
        </Modal>
      )}
    </>
  );
}

/** proofs: [{ proofId, fileName }]; buildUrl(proofId) trả về đường dẫn API của ảnh. */
export default function ProofGallery({ proofs, buildUrl }) {
  if (!proofs || proofs.length === 0) return <span className={styles.empty}>Chưa có chứng từ</span>;

  return (
    <ul className={styles.gallery} aria-label="Ảnh chứng từ">
      {proofs.map((proof) => (
        <li key={proof.proofId}>
          <ProofThumb proof={proof} path={buildUrl(proof.proofId)} />
        </li>
      ))}
    </ul>
  );
}
