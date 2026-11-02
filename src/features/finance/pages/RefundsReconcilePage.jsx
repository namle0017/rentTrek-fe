import { useState } from 'react';
import { REFUND_TAB, REFUND_TAB_LABEL } from '@/constants/enums';
import {
  useApproveRefund,
  useMarkManualRefund,
  useReconcileAccept,
  useReconcileRefund,
  useRefundQueue,
  useRetryRefund,
} from '../hooks/useRefunds';
import RefundQueueTable from '../components/RefundQueueTable';
import RefundApproveDrawer from '../components/RefundApproveDrawer';
import RefundManualModal from '../components/RefundManualModal';
import ReconcileActionModal from '../components/ReconcileActionModal';
import styles from '../components/finance.module.css';

export default function RefundsReconcilePage() {
  const [activeTab, setActiveTab] = useState(REFUND_TAB.PENDING_APPROVAL);

  // State Drawer & Modals
  const [selectedPendingItem, setSelectedPendingItem] = useState(null);
  const [selectedFailedItem, setSelectedFailedItem] = useState(null);
  const [selectedReconcileOrder, setSelectedReconcileOrder] = useState(null);
  const [reconcileActionType, setReconcileActionType] = useState('accept'); // 'accept' | 'refund'

  // Data queries
  const { data: queueData, isLoading } = useRefundQueue(activeTab);

  // Mutations
  const approveMutation = useApproveRefund();
  const retryMutation = useRetryRefund();
  const markManualMutation = useMarkManualRefund();
  const reconcileAcceptMutation = useReconcileAccept();
  const reconcileRefundMutation = useReconcileRefund();

  // Handlers
  const handleApprove = (paymentId) => {
    approveMutation.mutate(paymentId, {
      onSuccess: () => setSelectedPendingItem(null),
    });
  };

  const handleRetry = (paymentId) => {
    retryMutation.mutate(paymentId);
  };

  const handleManualConfirm = (payload) => {
    if (!selectedFailedItem) return;
    markManualMutation.mutate(
      { paymentId: selectedFailedItem.paymentId, payload },
      {
        onSuccess: () => setSelectedFailedItem(null),
      },
    );
  };

  const handleOpenReconcileModal = (order, actionType) => {
    setSelectedReconcileOrder(order);
    setReconcileActionType(actionType);
  };

  const handleReconcileConfirm = () => {
    if (!selectedReconcileOrder) return;
    if (reconcileActionType === 'accept') {
      reconcileAcceptMutation.mutate(selectedReconcileOrder.orderId, {
        onSuccess: () => setSelectedReconcileOrder(null),
      });
    } else {
      reconcileRefundMutation.mutate(selectedReconcileOrder.orderId, {
        onSuccess: () => setSelectedReconcileOrder(null),
      });
    }
  };

  const tabs = [
    { key: REFUND_TAB.PENDING_APPROVAL, label: REFUND_TAB_LABEL[REFUND_TAB.PENDING_APPROVAL] },
    { key: REFUND_TAB.PENDING, label: REFUND_TAB_LABEL[REFUND_TAB.PENDING] },
    { key: REFUND_TAB.FAILED, label: REFUND_TAB_LABEL[REFUND_TAB.FAILED] },
    { key: REFUND_TAB.NEEDS_RECONCILIATION, label: REFUND_TAB_LABEL[REFUND_TAB.NEEDS_RECONCILIATION] },
    { key: REFUND_TAB.HISTORY, label: REFUND_TAB_LABEL[REFUND_TAB.HISTORY] },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.pageSubtitle} style={{ marginTop: 0 }}>
            Duyệt hoàn tiền tự động qua SePay, xử lý lỗi ngân hàng và giải quyết sai lệch tiền nộp
          </p>
        </div>

        <div className={styles.headerActions}>
          <span className={styles.codeBadge} style={{ background: '#ecfdf5', color: '#065f46' }}>
            Giới hạn duyệt: 10 yêu cầu / 60 giây
          </span>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className={styles.tabsBar}>
        {tabs.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              className={`${styles.tabItem} ${isActive ? styles.tabItemActive : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              <span>{t.label}</span>
              {isActive && queueData?.totalCount !== undefined && (
                <span className={`${styles.countPill} ${styles.countPillActive}`}>
                  {queueData.totalCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bảng dữ liệu theo tab */}
      <RefundQueueTable
        tab={activeTab}
        items={queueData?.items}
        isLoading={isLoading}
        onOpenApproveDrawer={(item) => setSelectedPendingItem(item)}
        onRetry={handleRetry}
        onOpenManualModal={(item) => setSelectedFailedItem(item)}
        onOpenReconcileModal={handleOpenReconcileModal}
        isRetrying={retryMutation.isPending}
      />

      {/* Drawer xem & duyệt hoàn tiền (Tab Chờ duyệt) */}
      <RefundApproveDrawer
        item={selectedPendingItem}
        isOpen={Boolean(selectedPendingItem)}
        onClose={() => setSelectedPendingItem(null)}
        onApprove={handleApprove}
        isApproving={approveMutation.isPending}
      />

      {/* Modal ghi nhận hoàn tiền thủ công (Tab Thất bại) */}
      <RefundManualModal
        item={selectedFailedItem}
        isOpen={Boolean(selectedFailedItem)}
        onClose={() => setSelectedFailedItem(null)}
        onConfirm={handleManualConfirm}
        isSubmitting={markManualMutation.isPending}
      />

      {/* Modal xử lý đối soát (Tab Cần đối soát) */}
      <ReconcileActionModal
        order={selectedReconcileOrder}
        actionType={reconcileActionType}
        isOpen={Boolean(selectedReconcileOrder)}
        onClose={() => setSelectedReconcileOrder(null)}
        onConfirm={handleReconcileConfirm}
        isSubmitting={
          reconcileAcceptMutation.isPending || reconcileRefundMutation.isPending
        }
      />
    </div>
  );
}
