import { exportCsv } from '@/utils/exportCsv';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import styles from './DataTable.module.css';

export default function DataTable({ columns, rows = [], rowKey, paging, onPageChange, sortBy, sortOrder, onSort, filename = 'rentrek.csv', caption, actions }) {
  return <section className={styles.tableCard}>
    <div className={styles.tableTools}><span>{caption ?? `${paging?.totalItems ?? rows.length} kết quả`}</span><button type="button" className={styles.secondary} disabled={!rows.length} onClick={() => exportCsv(filename, columns, rows)}>↓ Xuất CSV trang này</button></div>
    {rows.length === 0 ? <EmptyState message="Chưa có dữ liệu phù hợp với bộ lọc" /> : <div className={styles.tableScroll}><table className={styles.table}>
      <thead><tr>{columns.map((column) => <th key={column.key} aria-sort={sortBy === column.key ? sortOrder === 'asc' ? 'ascending' : 'descending' : undefined}>{column.sortable && onSort ? <button onClick={() => onSort(column.key)}>{column.label} {sortBy === column.key ? sortOrder === 'asc' ? '↑' : '↓' : '↕'}</button> : column.label}</th>)}{actions && <th>Thao tác</th>}</tr></thead>
      <tbody>{rows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? 'Chưa cập nhật'}</td>)}{actions && <td><div className={styles.rowActions}>{actions(row)}</div></td>}</tr>)}</tbody>
    </table></div>}
    {paging && <Pagination {...paging} onPageChange={onPageChange} />}
  </section>;
}
