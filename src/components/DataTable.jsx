import { ArrowDownUp, ChevronDown, ChevronUp, Download } from 'lucide-react';
import { exportCsv } from '@/utils/exportCsv';
import EmptyState from '@/components/EmptyState';
import Pagination from '@/components/Pagination';
import styles from './DataTable.module.css';

export default function DataTable({
  columns,
  rows = [],
  rowKey,
  paging,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
  filename = 'rentrek.csv',
  caption,
  title,
  description,
  exportable = true,
  emphasized = false,
  actions,
}) {
  return (
    <section className={`${styles.tableCard} ${emphasized ? styles.emphasized : ''}`}>
      <div className={styles.tableTools}>
        <div>
          {title && <h2 className={styles.tableTitle}>{title}</h2>}
          {description && <p className={styles.tableDescription}>{description}</p>}
          <span className={styles.resultCount}>
            {caption ?? `${paging?.totalItems ?? rows.length} kết quả`}
          </span>
        </div>
        {exportable && (
          <button
            type="button"
            className={styles.secondary}
            disabled={!rows.length}
            onClick={() => exportCsv(filename, columns, rows)}
          >
            <Download size={14} aria-hidden="true" />
            Xuất CSV trang này
          </button>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState message="Chưa có dữ liệu phù hợp với bộ lọc" />
      ) : (
        <div
          className={styles.tableScroll}
          role="region"
          aria-label={title ? `Bảng ${title}` : 'Bảng kết quả'}
          tabIndex={0}
        >
          <table className={styles.table} aria-label={title}>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    scope="col"
                    aria-sort={
                      sortBy === column.key ? (sortOrder === 'asc' ? 'ascending' : 'descending') : undefined
                    }
                  >
                    {column.sortable && onSort ? (
                      <button type="button" onClick={() => onSort(column.key)}>
                        {column.label}
                        {sortBy !== column.key ? (
                          <ArrowDownUp size={12} aria-hidden="true" />
                        ) : sortOrder === 'asc' ? (
                          <ChevronUp size={12} aria-hidden="true" />
                        ) : (
                          <ChevronDown size={12} aria-hidden="true" />
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
                {actions && <th scope="col">Thao tác</th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => {
                    const Cell = column.rowHeader ? 'th' : 'td';
                    return (
                      <Cell key={column.key} scope={column.rowHeader ? 'row' : undefined}>
                        {column.render ? column.render(row) : (row[column.key] ?? 'Chưa cập nhật')}
                      </Cell>
                    );
                  })}
                  {actions && (
                    <td>
                      <div className={styles.rowActions}>{actions(row)}</div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {paging && <Pagination {...paging} onPageChange={onPageChange} />}
    </section>
  );
}
