import { useState } from 'react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useOperations } from '@/features/operations/hooks/useOperations';
import OperationDialog from '@/features/operations/components/OperationDialog';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';

const columns = [{ key: 'configKey', label: 'Tham số', render: (row) => <><strong>{row.configKey}</strong><small>{row.description}</small></> }, { key: 'configValue', label: 'Giá trị hiện tại' }, { key: 'valueType', label: 'Kiểu giá trị' }, { key: 'updatedAt', label: 'Cập nhật', render: (row) => formatDateTime(row.updatedAt) }];
export default function SettingsPage() {
  const query = useOperations(API_ENDPOINTS.ADMIN.SETTINGS);
  const [selected, setSelected] = useState(null);
  return <div className={styles.page}><div><span className={styles.eyebrow}>Quản trị hệ thống</span><h1>Cấu hình hệ thống</h1><p>Mỗi thay đổi đều được ghi nhật ký trước / sau.</p></div>
    {query.isPending ? <Spinner /> : query.isError ? <ErrorState message={query.error.message} onRetry={query.refetch} /> : <DataTable columns={columns} rows={query.data} rowKey={(row) => row.configKey} actions={(row) => <button className={styles.secondary} onClick={() => setSelected(row)}>Chỉnh sửa</button>} />}
    {selected && <OperationDialog title={`Cập nhật ${selected.configKey}`} fields={[{ name: 'configValue', label: 'Giá trị mới', required: true }, { name: 'reason', label: 'Lý do thay đổi', type: 'textarea', required: true, maxLength: 500 }]} values={selected} endpoint={API_ENDPOINTS.ADMIN.DETAIL(API_ENDPOINTS.ADMIN.SETTINGS, selected.configKey)} method="put" onClose={() => setSelected(null)} />}
  </div>;
}
