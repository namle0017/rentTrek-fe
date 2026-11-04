import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useHandoverChecklist, useHandoverScan, useCompleteHandover } from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Modal from '@/components/Modal';
import Spinner from '@/components/Spinner';
import RentalOrderSummary from './components/RentalOrderSummary';
import BarcodeScanner from './components/BarcodeScanner';
import FulfillmentProgress from './components/FulfillmentProgress';
import layoutStyles from '@/layouts/RentalFulfillmentLayout.module.css';
import { MOCK_ORDERS } from './constants/mockFulfillmentData';
import styles from './HandoverChecklistPage.module.css';

const DEFAULT_ORDER = 'RT-202611-001';

export default function HandoverChecklistPage() {
  const { orderCode } = useParams();
  const activeOrderCode = orderCode || DEFAULT_ORDER;
  return <HandoverWorkspace key={activeOrderCode} activeOrderCode={activeOrderCode} />;
}

function HandoverWorkspace({ activeOrderCode }) {
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

  useEffect(() => {
    if (!isLoading && !isHandedOver && !showIncompleteModal) barcodeInputRef.current?.focus();
  }, [isLoading, isHandedOver, showIncompleteModal]);

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
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <RentalOrderSummary
            orderCode={activeOrderCode}
            status={checklist.orderStatus}
            facts={[
              { label: 'Khách hàng', value: checklist.customerName },
              { label: 'Số điện thoại', value: checklist.customerPhone },
              {
                label: 'Thời gian thuê',
                value: `${new Date(checklist.rentalStartAt).toLocaleDateString('vi-VN')} – ${new Date(checklist.rentalEndAt).toLocaleDateString('vi-VN')}`,
              },
            ]}
          />
          <div className={layoutStyles.workspace}>
            <div className={layoutStyles.mainColumn}>
              <BarcodeScanner
                title="Quét thiết bị bàn giao"
                hint={
                  isHandedOver
                    ? 'Đơn đã bàn giao. Bạn có thể tiếp tục ở màn nhận lại thiết bị.'
                    : 'Quét bằng máy đọc mã hoặc nhập mã thiết bị, sau đó nhấn Enter.'
                }
                placeholder="Quét mã barcode thiết bị hoặc nhập mã"
                value={barcodeInput}
                onChange={setBarcodeInput}
                onSubmit={handleScan}
                inputRef={barcodeInputRef}
                disabled={isBusy || isHandedOver}
                isPending={scanMutation.isPending}
                submitLabel="Xác nhận quét"
                feedback={scanFeedback}
              />
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
            <aside className={styles.progressSidebar}>
              <FulfillmentProgress
                title="Tiến độ bàn giao"
                count={checklist.scannedCount}
                total={checklist.totalRequiredCount}
              >
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
              </FulfillmentProgress>
            </aside>
          </div>
          {import.meta.env.DEV && (
            <details className={styles.demoTools}>
              <summary>Dữ liệu thử nghiệm</summary>
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
