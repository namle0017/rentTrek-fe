import { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  useReturnChecklist,
  useReturnScan,
  useReportLostAsset,
  useCompleteReturn,
} from './hooks/useFulfillment';
import { playSuccessBeep, playErrorBuzz } from './utils/soundHelper';
import Modal from '@/components/Modal';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/Spinner';
import RentalOrderSummary from './components/RentalOrderSummary';
import BarcodeScanner from './components/BarcodeScanner';
import FulfillmentProgress from './components/FulfillmentProgress';
import layoutStyles from '@/layouts/RentalFulfillmentLayout.module.css';
import styles from './ReturnChecklistPage.module.css';

const conditions = {
  Normal: 'Bình thường',
  RequiresCleaning: 'Cần vệ sinh',
  RequiresMaintenance: 'Cần bảo dưỡng',
  Damaged: 'Hư hỏng',
  MissingAccessory: 'Thiếu phụ kiện',
  Lost: 'Mất thiết bị',
};
const isResolved = (item) => ['Returned', 'LostOrException'].includes(item.status);

export default function ReturnChecklistPage() {
  const { orderCode } = useParams();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState(null);
  const barcodeInputRef = useRef(null);
  const [returnModalAsset, setReturnModalAsset] = useState(null);
  const [returnCondition, setReturnCondition] = useState('Normal');
  const [conditionNote, setConditionNote] = useState('');
  const [createDamageFee, setCreateDamageFee] = useState(false);
  const [damageFeeAmount, setDamageFeeAmount] = useState('');
  const [damageFeeReason, setDamageFeeReason] = useState('');
  const [lostModalAsset, setLostModalAsset] = useState(null);
  const [lostReason, setLostReason] = useState('');
  const [lossFeeAmount, setLossFeeAmount] = useState('');
  const [completionNotes, setCompletionNotes] = useState('');

  const { data: serverChecklist, isLoading } = useReturnChecklist(orderCode);
  const scanMutation = useReturnScan(orderCode);
  const lostMutation = useReportLostAsset(orderCode);
  const completeMutation = useCompleteReturn(orderCode);
  const checklist = useMemo(() => {
    if (serverChecklist) return serverChecklist;
    return {
      orderCode,
      orderStatus: 'InFulfillment',
      customerName: '—',
      customerPhone: '—',
      rentalStartAt: new Date().toISOString(),
      rentalEndAt: new Date().toISOString(),
      totalIssuedCount: 0,
      items: [],
    };
  }, [serverChecklist, orderCode]);
  const resolvedCount = checklist.items.filter(isResolved).length;
  const pendingCount = Math.max(0, checklist.totalIssuedCount - resolvedCount);
  const isFinished = ['Returned', 'Completed'].includes(checklist.orderStatus);
  const isBusy = scanMutation.isPending || lostMutation.isPending || completeMutation.isPending;

  useEffect(() => {
    if (!isLoading && !returnModalAsset && !lostModalAsset && !isFinished) barcodeInputRef.current?.focus();
  }, [isLoading, returnModalAsset, lostModalAsset, isFinished]);

  const openReturnModal = (item) => {
    if (isResolved(item) || isBusy || isFinished) return;
    setReturnModalAsset(item);
    setReturnCondition('Normal');
    setConditionNote('');
    setCreateDamageFee(false);
    setDamageFeeAmount('');
    setDamageFeeReason('');
  };
  const handleScanSubmit = (event) => {
    event.preventDefault();
    const code = barcodeInput.trim();
    if (!code || isBusy || isFinished) return;
    const matched = checklist.items.find((item) => item.assetCode.toLowerCase() === code.toLowerCase());
    if (!matched) {
      setScanFeedback({ message: `Mã ${code} không thuộc danh sách thiết bị của đơn này.`, isError: true });
      playErrorBuzz();
    } else if (isResolved(matched)) {
      setScanFeedback({ message: `Thiết bị ${matched.assetCode} đã được xử lý.`, isError: false });
    } else {
      setScanFeedback(null);
      openReturnModal(matched);
      setBarcodeInput('');
    }
    barcodeInputRef.current?.focus();
  };
  const handleConfirmReturn = async (event) => {
    event.preventDefault();
    if (
      !returnModalAsset ||
      isBusy ||
      (createDamageFee && (!(Number(damageFeeAmount) > 0) || !damageFeeReason.trim()))
    )
      return;
    try {
      await scanMutation.mutateAsync({
        assetCode: returnModalAsset.assetCode,
        returnCondition,
        conditionNote: conditionNote.trim() || null,
        createDamageCharge: createDamageFee,
        damageChargeAmount: createDamageFee ? Number(damageFeeAmount) : null,
        damageReason: createDamageFee ? damageFeeReason.trim() : null,
      });
      playSuccessBeep();
      setScanFeedback({ message: `Đã nhận lại thiết bị ${returnModalAsset.assetCode}.`, isError: false });
      setReturnModalAsset(null);
    } catch (error) {
      playErrorBuzz();
      setScanFeedback({
        message: error.response?.data?.message || error.message || 'Không thể nhận lại thiết bị.',
        isError: true,
      });
    }
  };
  const openLostModal = (item) => {
    if (isResolved(item) || isBusy || isFinished) return;
    setLostModalAsset(item);
    setLostReason('');
    setLossFeeAmount(item.variantPriceTier ? String(item.variantPriceTier) : '');
  };
  const handleConfirmLost = async (event) => {
    event.preventDefault();
    if (!lostModalAsset || !lostReason.trim() || isBusy) return;
    try {
      await lostMutation.mutateAsync({
        assetId: lostModalAsset.equipmentAssetId,
        assetCode: lostModalAsset.assetCode,
        reason: lostReason.trim(),
        lossChargeAmount: Number(lossFeeAmount) || 0,
      });
      playSuccessBeep();
      setLostModalAsset(null);
    } catch (error) {
      playErrorBuzz();
      setScanFeedback({
        message: error.response?.data?.message || error.message || 'Không thể ghi nhận báo mất.',
        isError: true,
      });
    }
  };
  const handleCompleteReturn = () => {
    if (pendingCount || isFinished || isBusy || !checklist.totalIssuedCount) return;
    completeMutation.mutate(
      { notes: completionNotes.trim() || null },
      { onSuccess: () => setCompletionNotes('') },
    );
  };

  const columns = [
    {
      key: 'assetCode',
      label: 'Mã thiết bị',
      rowHeader: true,
      render: (item) => <span className={styles.assetCode}>{item.assetCode}</span>,
    },
    {
      key: 'productName',
      label: 'Sản phẩm / Biến thể',
      render: (item) => (
        <>
          <strong>{item.productName}</strong>
          <small>{item.variantName}</small>
        </>
      ),
    },
    {
      key: 'status',
      label: 'Trạng thái thu hồi',
      render: (item) => (
        <span className={styles.statusBadge} data-status={item.status}>
          {item.status === 'Returned'
            ? 'Đã nhận lại'
            : item.status === 'LostOrException'
              ? 'Đã báo mất'
              : 'Chờ nhận lại'}
        </span>
      ),
    },
    {
      key: 'returnCondition',
      label: 'Tình trạng khi trả',
      render: (item) =>
        item.status === 'LostOrException'
          ? 'Mất thiết bị'
          : conditions[item.returnCondition] || item.returnCondition || 'Chưa kiểm tra',
    },
    {
      key: 'conditionNote',
      label: 'Ghi chú kiểm tra',
      render: (item) => item.conditionNote || 'Không có ghi chú',
    },
  ];

  return (
    <div className={styles.page}>
      {isLoading ? (
        <Spinner />
      ) : (
        <>
          <RentalOrderSummary
            orderCode={orderCode}
            status={checklist.orderStatus}
            facts={[
              { label: 'Khách hàng', value: checklist.customerName },
              { label: 'Hạn trả đồ', value: new Date(checklist.rentalEndAt).toLocaleDateString('vi-VN') },
              { label: 'Cần xử lý', value: `${pendingCount} thiết bị` },
            ]}
          />
          <div className={layoutStyles.workspace}>
            <BarcodeScanner
              title="Kiểm tra thiết bị nhận lại"
              hint="Quét hoặc nhập mã để đối chiếu đúng đơn, sau đó kiểm tra tình trạng thực tế."
              placeholder="Quét mã barcode thiết bị cần nhận lại..."
              value={barcodeInput}
              onChange={setBarcodeInput}
              onSubmit={handleScanSubmit}
              inputRef={barcodeInputRef}
              disabled={isBusy || isFinished}
              isPending={scanMutation.isPending}
              submitLabel="Kiểm tra thiết bị"
              feedback={scanFeedback}
            />
            <FulfillmentProgress
              title="Tiến độ thu hồi"
              count={resolvedCount}
              total={checklist.totalIssuedCount}
            />
          </div>
          <DataTable
            title="Thiết bị cần thu hồi"
            description="Mỗi hàng là một thiết bị đã giao. Đối chiếu mã, kiểm tra tình trạng và chọn thao tác ở cuối hàng."
            caption={`${checklist.items.length} thiết bị · ${pendingCount} chờ xử lý`}
            columns={columns}
            rows={checklist.items}
            rowKey={(item) => item.assignmentId || item.assetCode}
            exportable={false}
            emphasized
            actions={(item) =>
              isResolved(item) ? (
                <span className={styles.resolvedText}>Đã xử lý</span>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.returnBtn}
                    onClick={() => openReturnModal(item)}
                    disabled={isBusy || isFinished}
                  >
                    Nhận lại
                  </button>
                  <button
                    type="button"
                    className={styles.lostBtn}
                    onClick={() => openLostModal(item)}
                    disabled={isBusy || isFinished}
                  >
                    Báo mất
                  </button>
                </>
              )
            }
          />
          <section className={styles.completionCard} aria-labelledby="return-complete-title">
            <div className={styles.completionCopy}>
              <h2 id="return-complete-title">Hoàn tất thu hồi</h2>
              <p className={styles.hint}>
                {isFinished
                  ? 'Đơn đã hoàn tất kiểm kê thiết bị.'
                  : pendingCount
                    ? `Còn ${pendingCount} thiết bị cần nhận lại hoặc báo mất trước khi hoàn tất.`
                    : 'Đã xử lý toàn bộ thiết bị. Bạn có thể xác nhận hoàn tất.'}
              </p>
              <label className={styles.field} htmlFor="return-notes">
                Ghi chú thu hồi (không bắt buộc)
                <input
                  id="return-notes"
                  value={completionNotes}
                  onChange={(event) => setCompletionNotes(event.target.value)}
                  placeholder="Ghi chú cho lần thu hồi này"
                  disabled={isFinished || isBusy}
                />
              </label>
            </div>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleCompleteReturn}
              disabled={isFinished || isBusy || pendingCount > 0 || !checklist.totalIssuedCount}
            >
              {completeMutation.isPending
                ? 'Đang hoàn tất…'
                : isFinished
                  ? 'Đơn đã hoàn tất thu hồi'
                  : 'Hoàn tất thu hồi'}
            </button>
          </section>
        </>
      )}
      {returnModalAsset && (
        <Modal
          title="Kiểm tra tình trạng thiết bị nhận lại"
          onClose={() => {
            if (!isBusy) setReturnModalAsset(null);
          }}
        >
          <form onSubmit={handleConfirmReturn} className={styles.modalForm}>
            <div className={styles.assetSummary}>
              <strong>{returnModalAsset.assetCode}</strong>
              <span>
                {returnModalAsset.productName} · {returnModalAsset.variantName}
              </span>
            </div>
            <label className={styles.field} htmlFor="return-condition">
              Tình trạng thiết bị
              <select
                id="return-condition"
                value={returnCondition}
                onChange={(event) => setReturnCondition(event.target.value)}
                disabled={isBusy}
              >
                <option value="Normal">Bình thường</option>
                <option value="RequiresCleaning">Cần vệ sinh, giặt phơi</option>
                <option value="RequiresMaintenance">Cần bảo dưỡng</option>
                <option value="Damaged">Hư hỏng, rách, gãy</option>
              </select>
            </label>
            <label className={styles.field} htmlFor="return-condition-note">
              Ghi chú kiểm tra
              <input
                id="return-condition-note"
                value={conditionNote}
                onChange={(event) => setConditionNote(event.target.value)}
                placeholder="Mô tả tình trạng thực tế"
                disabled={isBusy}
              />
            </label>
            <label className={styles.checkField}>
              <input
                type="checkbox"
                checked={createDamageFee}
                onChange={(event) => setCreateDamageFee(event.target.checked)}
                disabled={isBusy}
              />
              Tạo phụ phí hư hại / hao mòn bất thường
            </label>
            {createDamageFee && (
              <fieldset className={styles.feeFields}>
                <legend>Phụ phí hư hại</legend>
                <label className={styles.field} htmlFor="return-damage-amount">
                  Số tiền (VNĐ)
                  <input
                    id="return-damage-amount"
                    type="number"
                    min="1"
                    step="1"
                    value={damageFeeAmount}
                    onChange={(event) => setDamageFeeAmount(event.target.value)}
                    required
                    disabled={isBusy}
                  />
                </label>
                <label className={styles.field} htmlFor="return-damage-reason">
                  Lý do phụ phí
                  <input
                    id="return-damage-reason"
                    value={damageFeeReason}
                    onChange={(event) => setDamageFeeReason(event.target.value)}
                    required
                    disabled={isBusy}
                  />
                </label>
              </fieldset>
            )}
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setReturnModalAsset(null)}
                disabled={isBusy}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={
                  isBusy || (createDamageFee && (!(Number(damageFeeAmount) > 0) || !damageFeeReason.trim()))
                }
              >
                {scanMutation.isPending ? 'Đang lưu…' : 'Xác nhận nhận đồ'}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {lostModalAsset && (
        <Modal
          title="Báo mất thiết bị"
          onClose={() => {
            if (!isBusy) setLostModalAsset(null);
          }}
        >
          <form onSubmit={handleConfirmLost} className={styles.modalForm}>
            <div className={styles.assetSummary}>
              <strong>{lostModalAsset.assetCode}</strong>
              <span>
                {lostModalAsset.productName} · {lostModalAsset.variantName}
              </span>
            </div>
            <label className={styles.field} htmlFor="return-lost-reason">
              Lý do báo mất / Biên bản
              <textarea
                id="return-lost-reason"
                rows={3}
                value={lostReason}
                onChange={(event) => setLostReason(event.target.value)}
                required
                disabled={isBusy}
              />
            </label>
            <label className={styles.field} htmlFor="return-loss-amount">
              Số tiền bồi thường (VNĐ)
              <input
                id="return-loss-amount"
                type="number"
                min="0"
                step="1"
                value={lossFeeAmount}
                onChange={(event) => setLossFeeAmount(event.target.value)}
                disabled={isBusy}
              />
            </label>
            <p className={styles.hint}>Khoản phí được chuyển vào danh sách quyết toán cọc của khách hàng.</p>
            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={() => setLostModalAsset(null)}
                disabled={isBusy}
              >
                Hủy bỏ
              </button>
              <button type="submit" className={styles.dangerBtn} disabled={isBusy || !lostReason.trim()}>
                {lostMutation.isPending ? 'Đang lưu…' : 'Xác nhận báo mất'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
