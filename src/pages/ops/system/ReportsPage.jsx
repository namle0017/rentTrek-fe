import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { API_ENDPOINTS } from '@/api/endpoints';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { OPS_LABELS } from '@/features/operations/constants/opsOptions';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { formatCurrency } from '@/utils/formatCurrency';
import { formatDateTime } from '@/utils/formatDate';
import styles from '@/features/operations/components/Operations.module.css';

const reports = {
  revenue: { label: 'Doanh thu', endpoint: API_ENDPOINTS.ADMIN.REPORTS.REVENUE, columns: [{ key: 'period', label: 'Kỳ', render: (row) => dayjs(row.period).format('DD/MM/YYYY') }, { key: 'orderType', label: 'Dịch vụ', render: (row) => OPS_LABELS[row.orderType] }, { key: 'collections', label: 'Tổng thu', render: (row) => formatCurrency(row.collections) }, { key: 'refunds', label: 'Tổng hoàn', render: (row) => formatCurrency(row.refunds) }, { key: 'netRevenueVnd', label: 'Doanh thu ròng', render: (row) => formatCurrency(row.netRevenueVnd) }] },
  occupancy: { label: 'Lấp chỗ chuyến', endpoint: API_ENDPOINTS.ADMIN.REPORTS.OCCUPANCY, columns: [{ key: 'tourName', label: 'Tour' }, { key: 'startAt', label: 'Khởi hành', render: (row) => formatDateTime(row.startAt) }, { key: 'bookedSlots', label: 'Đã bán' }, { key: 'totalSlots', label: 'Tổng chỗ' }, { key: 'occupancyRate', label: 'Tỷ lệ', render: (row) => `${row.occupancyRate}%` }] },
  utilization: { label: 'Khai thác thiết bị', endpoint: API_ENDPOINTS.ADMIN.REPORTS.UTILIZATION, columns: [{ key: 'assetCode', label: 'Mã thiết bị' }, { key: 'issuedDays', label: 'Ngày đã sử dụng' }, { key: 'periodDays', label: 'Ngày trong kỳ' }, { key: 'utilizationRate', label: 'Hiệu suất', render: (row) => `${row.utilizationRate}%` }] },
  refunds: { label: 'Hoàn tiền & phí', endpoint: API_ENDPOINTS.ADMIN.REPORTS.REFUNDS, columns: [] },
};
export default function ReportsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = Object.hasOwn(reports, searchParams.get('report')) ? searchParams.get('report') : 'revenue';
  const from = searchParams.get('from') ?? dayjs().subtract(30, 'day').format('YYYY-MM-DD');
  const to = searchParams.get('to') ?? dayjs().format('YYYY-MM-DD');
  const groupBy = searchParams.get('groupBy') ?? 'month';
  const report = reports[tab]; const query = useOperations(report.endpoint, { from: dayjs(from).startOf('day').toISOString(), to: dayjs(to).endOf('day').toISOString(), groupBy });
  const update = (key, value) => setSearchParams((previous) => { const next = new URLSearchParams(previous); next.set(key, value); return next; });
  const maxRevenue = tab === 'revenue' && Array.isArray(query.data) ? Math.max(1, ...query.data.map((row) => Math.abs(row.netRevenueVnd))) : 1;
  return <div className={styles.page}><div><span className={styles.eyebrow}>Phân tích vận hành</span><h1>Báo cáo hiệu quả kinh doanh</h1><p>Dữ liệu từ giao dịch đã thành công và hoạt động thực tế.</p></div><nav className={styles.tabs} role="tablist" aria-label="Báo cáo">{Object.entries(reports).map(([key, item]) => <button role="tab" aria-selected={key === tab} key={key} onClick={() => update('report', key)}>{item.label}</button>)}</nav><div className={styles.filters}><label>Từ ngày<input type="date" value={from} max={to} onChange={(event) => { if (event.target.value) update('from', event.target.value); }} /></label><label>Đến ngày<input type="date" value={to} min={from} onChange={(event) => { if (event.target.value) update('to', event.target.value); }} /></label>{tab === 'revenue' && <label>Nhóm theo<select value={groupBy} onChange={(event) => update('groupBy', event.target.value)}><option value="month">Tháng</option><option value="week">Tuần</option></select></label>}</div>
    {query.isPending ? <Spinner /> : query.isError ? <ErrorState message={query.error.message} onRetry={query.refetch} /> : tab === 'refunds' ? <div className={styles.stats}><article className={styles.stat}><small>Tiền đã hoàn khách</small><strong>{formatCurrency(query.data.refundedAmount)}</strong></article><article className={styles.stat}><small>Phí phát sinh đã thu</small><strong>{formatCurrency(query.data.collectedChargesAmount)}</strong></article></div> : <>{tab === 'revenue' && query.data.length > 0 && <section className={styles.card}><h2>Doanh thu ròng theo kỳ</h2>{query.data.map((row) => <div className={styles.chartRow} key={`${row.period}-${row.orderType}`}><span>{dayjs(row.period).format('MM/YYYY')} · {OPS_LABELS[row.orderType]}</span><div className={styles.chartBar}><span style={{ width: `${Math.abs(row.netRevenueVnd) / maxRevenue * 100}%`, background: row.netRevenueVnd < 0 ? '#b91c1c' : undefined }} /></div><span>{formatCurrency(row.netRevenueVnd)}</span></div>)}</section>}<DataTable columns={report.columns} rows={query.data} rowKey={(row) => row.tripId ?? row.equipmentAssetId ?? `${row.period}-${row.orderType}`} /></>}
  </div>;
}
