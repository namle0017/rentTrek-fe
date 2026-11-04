import { useState } from 'react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { USER_ROLE } from '@/constants/enums';
import { useAuth } from '@/hooks/useAuth';
import ResourcePage from '@/features/operations/components/ResourcePage';
import OperationDialog from '@/features/operations/components/OperationDialog';
import StatusBadge from '@/features/operations/components/StatusBadge';
import { options } from '@/features/operations/constants/opsOptions';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';

const columns = [{ key: 'rating', label: 'Số sao', sortable: true, render: (row) => '★'.repeat(row.rating) }, { key: 'comment', label: 'Đánh giá', render: (row) => <>{row.comment}<small>{row.hiddenReason}</small></> }, { key: 'customerFullName', label: 'Khách hàng' }, { key: 'tourName', label: 'Chuyến đi', render: (row) => <>{row.tourName}<small>{formatDateTime(row.tripStartAt)}</small></> }, { key: 'guideFullName', label: 'Hướng dẫn viên' }, { key: 'isHidden', label: 'Hiển thị', render: (row) => <StatusBadge value={row.isHidden ? 'Hidden' : 'Visible'} /> }];
export default function ReviewsPage() {
  const { currentUser } = useAuth(); const [selected, setSelected] = useState(null);
  return <><ResourcePage title="Kiểm duyệt đánh giá" subtitle="Giữ nguyên nội dung khách viết. Thao tác ẩn yêu cầu lý do." endpoint={API_ENDPOINTS.ADMIN.REVIEWS} columns={columns} rowKey={(row) => row.reviewId} filters={[{ name: 'rating', label: 'Số sao', options: [1, 2, 3, 4, 5].map((value) => ({ value, label: `${value} sao` })) }, { name: 'status', label: 'Trạng thái', options: options('Visible', 'Hidden') }]} actions={currentUser?.role === USER_ROLE.ADMIN ? (row) => <button className={row.isHidden ? styles.secondary : styles.danger} onClick={() => setSelected(row)}>{row.isHidden ? 'Khôi phục' : 'Ẩn đánh giá'}</button> : undefined} />
    {selected && <OperationDialog title={selected.isHidden ? 'Khôi phục đánh giá' : 'Ẩn đánh giá vi phạm'} endpoint={API_ENDPOINTS.ADMIN.ACTION(API_ENDPOINTS.ADMIN.REVIEWS, selected.reviewId, selected.isHidden ? 'unhide' : 'hide')} fields={selected.isHidden ? [] : [{ name: 'reason', label: 'Lý do ẩn đánh giá', type: 'textarea', required: true, maxLength: 500 }]} onClose={() => setSelected(null)} />}</>;
}
