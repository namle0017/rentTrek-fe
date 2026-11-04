import { useState } from 'react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/hooks/useAuth';
import { USER_ROLE } from '@/constants/enums';
import DataTable from '@/components/DataTable';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import OperationDialog from './OperationDialog';
import styles from './Operations.module.css';

export default function ResourcePage({ title, subtitle, endpoint, columns, rowKey, filters = [], fields, createEndpoint, createLabel = 'Tạo mới', canWrite = false, initialValues = {}, actions, children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCreating, setIsCreating] = useState(false);
  const { currentUser } = useAuth();
  const search = searchParams.get('search') ?? '';
  const debouncedSearch = useDebounce(search, 350);
  const params = { ...Object.fromEntries(searchParams), search: debouncedSearch, pageNumber: Math.max(1, Number(searchParams.get('pageNumber')) || 1), pageSize: 10, sortBy: searchParams.get('sortBy') ?? 'createdAt', sortOrder: searchParams.get('sortOrder') ?? 'desc' };
  const query = useOperations(endpoint, params);
  const update = (changes) => setSearchParams((previous) => {
    const next = new URLSearchParams(previous);
    Object.entries({ pageNumber: 1, ...changes }).forEach(([key, value]) => value === '' ? next.delete(key) : next.set(key, String(value)));
    return next;
  });
  const allowed = canWrite || currentUser?.role === USER_ROLE.ADMIN;
  return <div className={styles.page}>
    <div className={styles.heading}><div><span className={styles.eyebrow}>RenTrekk / Vận hành</span><h1>{title}</h1><p>{subtitle}</p></div>{fields && allowed && <button className={styles.primary} onClick={() => setIsCreating(true)}>＋ {createLabel}</button>}</div>
    <div className={styles.filters}><label>Tìm kiếm<input type="search" value={search} placeholder="Nhập từ khóa…" onChange={(event) => update({ search: event.target.value })} /></label>
      {filters.map((filter) => <label key={filter.name}>{filter.label}{filter.type ? <input type={filter.type} value={searchParams.get(filter.name) ? dayjs(searchParams.get(filter.name)).format('YYYY-MM-DDTHH:mm') : ''} onChange={(event) => update({ [filter.name]: event.target.value ? new Date(event.target.value).toISOString() : '' })} /> : <select value={searchParams.get(filter.name) ?? ''} onChange={(event) => update({ [filter.name]: event.target.value })}><option value="">Tất cả</option>{filter.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>}</label>)}
      <button className={styles.secondary} onClick={() => setSearchParams({})}>Đặt lại</button>
    </div>
    {query.isPending ? <Spinner /> : query.isError ? <ErrorState message={query.error.message} onRetry={query.refetch} /> : <DataTable columns={columns} rows={query.data?.items ?? query.data ?? []} rowKey={rowKey} paging={query.data?.items ? query.data : undefined} onPageChange={(pageNumber) => update({ pageNumber })} sortBy={params.sortBy} sortOrder={params.sortOrder} onSort={(sortBy) => update({ sortBy, sortOrder: sortBy === params.sortBy && params.sortOrder === 'asc' ? 'desc' : 'asc' })} filename={`${title}.csv`} actions={actions} />}
    {children}
    {isCreating && <OperationDialog title={createLabel} fields={fields} values={initialValues} endpoint={createEndpoint ?? endpoint} onClose={() => setIsCreating(false)} />}
  </div>;
}
