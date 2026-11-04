import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useHandoverChecklist, useHandoverScan, useCompleteHandover } from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import { ORDER_STATUS_LABEL } from '@/constants/enums';
import { MOCK_ORDERS } from './constants/mockFulfillmentData';
import styles from './HandoverChecklistPage.module.css';

const DEFAULT_ORDER = 'RT-202611-001';

export default function HandoverChecklistPage() {
  const { orderCode } = useParams();
  const activeOrderCode = orderCode || DEFAULT_ORDER;
  return <HandoverWorkspace key={activeOrderCode} activeOrderCode={activeOrderCode} />;
}

function HandoverWorkspace({ activeOrderCode }) {
  const navigate = useNavigate();
  const [searchOrderCode, setSearchOrderCode] = useState(activeOrderCode);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showIncompleteModal, setShowIncompleteModal] = useState(false);
  const [incompleteReason, setIncompleteReason] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const barcodeInputRef = useRef(null);
  const { data: serverChecklist, isLoading } = useHandoverChecklist(activeOrderCode);
  const scanMutation = useHandoverScan(activeOrderCode);
  const completeMutation = useCompleteHandover(activeOrderCode);

  const checklist = useMemo(() => {
    if (serverChecklist) return serverChecklist;
    const order = MOCK_ORDERS[activeOrderCode] || MOCK_ORDERS[DEFAULT_ORDER];
    return { ...order, items: order.handoverItems };
  }, [serverChecklist, activeOrderCode]);
  const isHandedOver = ['InFulfillment', 'Completed'].includes(checklist.orderStatus);
  const isBusy = scanMutation.isPending || completeMutation.isPending;
  const missingCount = Math.max(0, checklist.totalRequiredCount - checklist.scannedCount);
  const progressPercent = checklist.totalRequiredCount
    ? Math.min(100, Math.round((checklist.scannedCount / checklist.totalRequiredCount) * 100))
    : 0;

  useEffect(() => {
    if (!isLoading && !isHandedOver && !showIncompleteModal) barcodeInputRef.current?.focus();
  }, [isLoading, isHandedOver, showIncompleteModal]);

  const handleLookup = (event) => {
    event.preventDefault();
    const code = searchOrderCode.trim();
    if (code) navigate(`/ops/rentals/${encodeURIComponent(code)}/handover`);
  };
  const handleScan = async (event, directCode = null) => {
    event?.preventDefault();
    const code = (directCode || barcodeInput).trim();
    if (!code || isBusy || isHandedOver) return;
    try {
      await scanMutation.mutateAsync({ assetCode: code });
      playSuccessBeep();
      setScanFeedback({ message: `Đã ghi nhận thiết bị ${code}.`, isError: false });
      setBarcodeInput('');
    } catch (error) {
      playErrorBuzz();
      setScanFeedback({
        message:
          error.response?.data?.message || error.message || 'Không thể quét thiết bị. Vui lòng thử lại.',
        isError: true,
      });
    } finally {
      barcodeInputRef.current?.focus();
    }
  };
  const handleCompleteClick = () => {
    if (isBusy || isHandedOver) return;
    if (missingCount > 0) setShowIncompleteModal(true);
    else completeMutation.mutate({ incompleteReason: null });
  };
  const handleConfirmIncomplete = (event) => {
    event.preventDefault();
    if (!incompleteReason.trim() || isBusy) return;
    completeMutation.mutate(
      { incompleteReason: incompleteReason.trim() },
      {
        onSuccess: () => {
          setShowIncompleteModal(false);
          setIncompleteReason('');
        },
      },
    );
  };

  return (
    <div className={styles.page}>
      <section className={styles.lookupCard} aria-label="Tra cứu đơn thuê">
        <form onSubmit={handleLookup} className={styles.orderLookup}>
          <label className={styles.field} htmlFor="handover-order-code">
            Mã đơn thuê
            <input
              id="handover-order-code"
              type="text"
              placeholder="Nhập mã đơn (vd: RT-202611-001)"
              value={searchOrderCode}
              onChange={(event) => setSearchOrderCode(event.target.value)}
              className={styles.orderLookupInput}
            />
          </label>
          <button type="submit" className={styles.secondaryBtn} disabled={!searchOrderCode.trim()}>
            Tìm đơn
          </button>
        </form>
        <nav className={styles.navLinks} aria-label="Thao tác đơn thuê">
          <Link to={`/ops/rentals/${activeOrderCode}/return`}>Nhận lại thiết bị</Link>
          <Link to={`/ops/rentals/${activeOrderCode}/settlement`}>Quyết toán & Phí</Link>
        </nav>
      </section>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <section className={styles.orderInfoCard} aria-label="Thông tin đơn thuê">
            <div className={styles.orderHeading}>
              <div>
                <p className={styles.infoLabel}>Đơn thuê đang xử lý</p>
                <h2 className={styles.orderCode}>{activeOrderCode}</h2>
              </div>
              <span className={styles.orderStatus} data-complete={isHandedOver}>
                {ORDER_STATUS_LABEL[checklist.orderStatus] || checklist.orderStatus}
              </span>
            </div>
            <dl className={styles.orderFacts}>
              <div>
                <dt>Khách hàng</dt>
                <dd>{checklist.customerName}</dd>
              </div>
              <div>
                <dt>Số điện thoại</dt>
                <dd>{checklist.customerPhone || 'Chưa cập nhật'}</dd>
              </div>
              <div>
                <dt>Thời gian thuê</dt>
                <dd>
                  {new Date(checklist.rentalStartAt).toLocaleDateString('vi-VN')} –{' '}
                  {new Date(checklist.rentalEndAt).toLocaleDateString('vi-VN')}
                </dd>
              </div>
            </dl>
          </section>
          <div className={styles.workspace}>
            <div className={styles.mainColumn}>
              <section className={styles.scannerCard} aria-labelledby="handover-scan-title">
                <h2 id="handover-scan-title" className={styles.sectionTitle}>
                  Quét thiết bị bàn giao
                </h2>
                <p className={styles.hint}>
                  {isHandedOver
                    ? 'Đơn đã bàn giao. Bạn có thể tiếp tục ở màn nhận lại thiết bị.'
                    : 'Quét bằng máy đọc mã hoặc nhập mã thiết bị, sau đó nhấn Enter.'}
                </p>
                <form onSubmit={handleScan} className={styles.scannerForm}>
                  <label className={styles.field} htmlFor="handover-barcode">
                    Mã barcode thiết bị
                    <input
                      id="handover-barcode"
                      ref={barcodeInputRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(event) => setBarcodeInput(event.target.value)}
                      placeholder="Quét mã barcode thiết bị hoặc nhập mã"
                      className={styles.scannerInput}
                      disabled={isBusy || isHandedOver}
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </label>
                  <button
                    type="submit"
                    className={styles.primaryBtn}
                    disabled={!barcodeInput.trim() || isBusy || isHandedOver}
                  >
                    {scanMutation.isPending ? 'Đang kiểm tra…' : 'Xác nhận quét'}
                  </button>
                </form>
                <div
                  className={styles.scanFeedback}
                  role="status"
                  aria-live="polite"
                  data-error={scanFeedback?.isError}
                >
                  {scanFeedback?.message}
                </div>
              </section>
              <section className={styles.checklistCard} aria-labelledby="handover-items-title">
                <div className={styles.listHeading}>
                  <h2 id="handover-items-title" className={styles.sectionTitle}>
                    Thiết bị cần giao
                  </h2>
                  <span className={styles.hint}>{checklist.items.length} loại thiết bị</span>
                </div>
                <ul className={styles.itemList}>
                  {checklist.items.map((item) => {
                    const isFulfilled = item.scannedCount >= item.quantityRequired;
                    return (
                      <li key={item.rentalOrderItemId} className={styles.itemRow}>
                        <div className={styles.itemRowHeader}>
                          <div className={styles.itemDescription}>
                            <h3 className={styles.itemName}>{item.productName}</h3>
                            <p className={styles.itemVariant}>{item.variantName}</p>
                            <p className={styles.itemSku}>SKU: {item.variantSku}</p>
                          </div>
                          <div className={styles.itemProgress}>
                            <span className={styles.itemStatus} data-ready={isFulfilled}>
                              {isFulfilled
                                ? 'Đã đủ'
                                : `Còn thiếu ${item.quantityRequired - item.scannedCount}`}
                            </span>
                            <span className={styles.itemCount}>
                              {item.scannedCount} / {item.quantityRequired} đã quét
                            </span>
                          </div>
                        </div>
                        {item.scannedAssets?.length > 0 ? (
                          <ul
                            className={styles.scannedTags}
                            aria-label={`Mã đã quét của ${item.productName}`}
                          >
                            {item.scannedAssets.map((asset) => (
                              <li key={asset.assignmentId || asset.assetCode} className={styles.scannedTag}>
                                {asset.assetCode}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={styles.emptyText}>Chưa có thiết bị được quét.</p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </section>
            </div>
            <aside className={styles.progressCard} aria-labelledby="handover-progress-title">
              <h2 id="handover-progress-title" className={styles.sectionTitle}>
                Tiến độ bàn giao
              </h2>
              <div className={styles.progressCount}>
                <strong>{checklist.scannedCount}</strong>
                <span>/ {checklist.totalRequiredCount} thiết bị</span>
              </div>
              <div
                className={styles.progressBar}
                role="progressbar"
                aria-label="Tiến độ bàn giao"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPercent}
              >
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
              <div className={styles.progressMeta}>
                <span>Đã quét {progressPercent}%</span>
                <span>Còn {missingCount} thiết bị</span>
              </div>
              <div className={styles.completionSection}>
                <p className={styles.completionTitle}>
                  {isHandedOver
                    ? 'Bàn giao hoàn tất'
                    : missingCount > 0
                      ? 'Chưa đủ thiết bị'
                      : 'Sẵn sàng bàn giao'}
                </p>
                <p className={styles.hint}>
                  {isHandedOver
                    ? 'Thiết bị đã được ghi nhận bàn giao cho khách.'
                    : missingCount > 0
                      ? 'Tiếp tục quét các thiết bị còn thiếu. Nếu giao thiếu, bạn cần ghi rõ lý do.'
                      : 'Đã quét đủ số lượng. Xác nhận để hoàn tất bàn giao cho khách.'}
                </p>
                <button
                  type="button"
                  onClick={handleCompleteClick}
                  disabled={isBusy || isHandedOver || !checklist.totalRequiredCount}
                  className={styles.completeBtn}
                >
                  {completeMutation.isPending
                    ? 'Đang hoàn tất…'
                    : isHandedOver
                      ? 'Đã bàn giao'
                      : 'Hoàn tất bàn giao'}
                </button>
              </div>
            </aside>
          </div>
          {import.meta.env.DEV && (
            <details className={styles.demoTools}>
              <summary>Dữ liệu thử nghiệm</summary>
              <div className={styles.demoButtons}>
                {Object.keys(MOCK_ORDERS).map((code) => (
                  <button
                    key={code}
                    type="button"
                    className={styles.secondaryBtn}
                    aria-pressed={activeOrderCode === code}
                    onClick={() => navigate(`/ops/rentals/${code}/handover`)}
                  >
                    {code} · {MOCK_ORDERS[code].customerName}
                  </button>
                ))}
              </div>
              {!isHandedOver && (
                <div className={styles.demoButtons}>
                  {['SD-TENT-CU2-003', 'SD-PACK-40-001', 'SD-PACK-40-002', 'SD-LAMP-001'].map((code) => (
                    <button
                      key={code}
                      type="button"
                      className={styles.secondaryBtn}
                      disabled={isBusy}
                      onClick={() => handleScan(null, code)}
                    >
                      Quét {code}
                    </button>
                  ))}
                </div>
              )}
            </details>
          )}
        </>
      )}
      {showIncompleteModal && (
        <Modal
          title="Xác nhận bàn giao thiếu thiết bị"
          onClose={() => {
            if (!completeMutation.isPending) setShowIncompleteModal(false);
          }}
        >
          <form onSubmit={handleConfirmIncomplete} className={styles.reasonForm}>
            <p className={styles.hint}>
              Đơn còn thiếu <strong>{missingCount} thiết bị</strong>. Nhập lý do để xác nhận bàn giao thiếu.
            </p>
            <label className={styles.field} htmlFor="handover-incomplete-reason">
              Lý do bàn giao thiếu
              <textarea
                id="handover-incomplete-reason"
                rows={4}
                placeholder="Ví dụ: Khách không cần nhận thiết bị còn lại"
                value={incompleteReason}
                onChange={(event) => setIncompleteReason(event.target.value)}
                required
                disabled={completeMutation.isPending}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={() => setShowIncompleteModal(false)}
                className={styles.secondaryBtn}
                disabled={completeMutation.isPending}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={!incompleteReason.trim() || completeMutation.isPending}
              >
                {completeMutation.isPending ? 'Đang xác nhận…' : 'Xác nhận giao thiếu'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
