import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BarChart2, RefreshCw, Table } from 'lucide-react';
import { API_ENDPOINTS } from '@/api/endpoints';
import { ROUTES } from '@/constants/routes';
import { useDevClock } from '@/hooks/useDevClock';
import { useOperations } from '@/features/operations/hooks/useOperations';
import { formatCurrency } from '@/utils/formatCurrency';
import Spinner from '@/components/Spinner';
import ErrorState from '@/components/ErrorState';
import { buildRevenuePeriods, revenueRange, revenueServices } from './revenueChartData';
import styles from './RevenueChart.module.css';

const metrics = { netRevenueVnd: 'Doanh thu ròng', collections: 'Tổng thu', refunds: 'Tiền hoàn' };
const compactCurrency = new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 });

export default function RevenueChart() {
  const [days, setDays] = useState(30);
  const [metric, setMetric] = useState('netRevenueVnd');
  const [selectedKey, setSelectedKey] = useState(null);
  const [viewMode, setViewMode] = useState('chart');
  const [lastUpdated, setLastUpdated] = useState(() => new Date());
  const [realNow] = useState(() => new Date().toISOString());
  const { data: clock } = useDevClock();

  const range = useMemo(() => revenueRange(clock?.now ?? realNow, days), [clock?.now, realNow, days]);
  const report = useOperations(API_ENDPOINTS.ADMIN.REPORTS.REVENUE, range);
  const periods = useMemo(() => buildRevenuePeriods(report.data ?? [], range), [report.data, range]);

  const handleRefresh = async () => {
    await report.refetch();
    setLastUpdated(new Date());
  };

  const values = periods.flatMap((period) => revenueServices.map(({ key }) => period[key][metric]));
  const low = Math.min(0, ...values);
  const high = Math.max(0, ...values);
  const magnitude = Math.max(Math.abs(low), Math.abs(high), 1);
  const step = 10 ** Math.floor(Math.log10(magnitude));
  const max = Math.max(step, Math.ceil(high / step) * step);
  const min = Math.floor(low / step) * step;
  const width = 880;
  const left = 65;
  const right = 16;
  const top = 14;
  const height = 150;
  const bottom = top + height;
  const y = (value) => top + ((max - value) / (max - min)) * height;
  const slot = periods.length > 0 ? (width - left - right) / periods.length : 1;
  const barWidth = Math.min(22, slot * 0.28);
  const selected = periods.find((period) => period.key === selectedKey);
  const totals = revenueServices.map((service) => ({
    ...service,
    value: periods.reduce((sum, period) => sum + period[service.key][metric], 0),
  }));
  const hasActivity = periods.some((period) =>
    revenueServices.some(({ key }) => period[key].collections !== 0 || period[key].refunds !== 0),
  );

  return (
    <section className={styles.card} aria-labelledby="revenue-chart-title">
      <div className={styles.header}>
        <div>
          <h2 id="revenue-chart-title">Doanh thu theo dịch vụ</h2>
          <p>Đặt tour và thuê thiết bị · Giao dịch thành công</p>
        </div>
        <div className={styles.filters}>
          <div className={styles.viewToggle} role="group" aria-label="Chế độ xem">
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'chart' ? styles.toggleActive : ''}`}
              onClick={() => setViewMode('chart')}
              title="Xem dạng biểu đồ cột"
              aria-pressed={viewMode === 'chart'}
            >
              <BarChart2 size={14} />
              <span>Biểu đồ</span>
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${viewMode === 'table' ? styles.toggleActive : ''}`}
              onClick={() => setViewMode('table')}
              title="Xem dạng bảng số liệu"
              aria-pressed={viewMode === 'table'}
            >
              <Table size={14} />
              <span>Bảng số liệu</span>
            </button>
          </div>

          <label>
            <span className="sr-only">Chỉ số biểu đồ</span>
            <select value={metric} onChange={(event) => setMetric(event.target.value)}>
              {Object.entries(metrics).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Khoảng thời gian biểu đồ</span>
            <select
              value={days}
              onChange={(event) => {
                setDays(Number(event.target.value));
                setSelectedKey(null);
              }}
            >
              {[30, 90, 180].map((value) => (
                <option key={value} value={value}>
                  {value} ngày qua
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={styles.refreshBtn}
            onClick={handleRefresh}
            disabled={report.isFetching}
            title="Làm mới dữ liệu từ máy chủ"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={report.isFetching ? styles.spinning : ''} />
          </button>
        </div>
      </div>
      {report.isPending ? (
        <Spinner />
      ) : report.isError ? (
        <ErrorState message={report.error.message} onRetry={report.refetch} />
      ) : (
        <>
          <div className={styles.summary}>
            <div className={styles.total}>
              <span>{metrics[metric]}</span>
              <strong>{formatCurrency(totals.reduce((sum, item) => sum + item.value, 0))}</strong>
            </div>
            <div className={styles.legend}>
              {totals.map(({ key, label, color, value }) => (
                <div key={key}>
                  <span className={styles.dot} style={{ background: color }} />
                  <span>{label}</span>
                  <strong>{formatCurrency(value)}</strong>
                </div>
              ))}
            </div>
          </div>
          {!hasActivity ? (
            <div className={styles.empty}>
              <p>Chưa có giao dịch thành công trong khoảng thời gian này.</p>
              <button
                type="button"
                className={styles.emptyRefreshBtn}
                onClick={handleRefresh}
                disabled={report.isFetching}
              >
                <RefreshCw size={13} className={report.isFetching ? styles.spinning : ''} />
                <span>Kiểm tra lại dữ liệu</span>
              </button>
            </div>
          ) : viewMode === 'table' ? (
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th scope="col">Kỳ báo cáo</th>
                    <th scope="col" className={styles.textRight}>
                      Đặt tour ({metrics[metric]})
                    </th>
                    <th scope="col" className={styles.textRight}>
                      Thuê thiết bị ({metrics[metric]})
                    </th>
                    <th scope="col" className={styles.textRight}>
                      Tổng cộng
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {periods.map((p) => {
                    const tourVal = p.Tour[metric];
                    const rentVal = p.Rental[metric];
                    const totalVal = tourVal + rentVal;
                    return (
                      <tr key={p.key}>
                        <td className={styles.periodName}>{p.title}</td>
                        <td className={styles.textRight}>{formatCurrency(tourVal)}</td>
                        <td className={styles.textRight}>{formatCurrency(rentVal)}</td>
                        <td className={`${styles.textRight} ${styles.rowTotal}`}>
                          <strong>{formatCurrency(totalVal)}</strong>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <>
              <div
                className={styles.plot}
                tabIndex={0}
                role="region"
                aria-label="Biểu đồ doanh thu, cuộn ngang trên màn hình nhỏ"
              >
                <svg
                  viewBox={`0 0 ${width} 195`}
                  role="img"
                  aria-labelledby="revenue-svg-title revenue-svg-desc"
                >
                  <title id="revenue-svg-title">
                    {metrics[metric]} từ đặt tour và thuê thiết bị trong {days} ngày qua
                  </title>
                  <desc id="revenue-svg-desc">
                    Cột xanh: đặt tour. Cột vàng: thuê thiết bị. Đơn vị đồng. Bảng số liệu chi tiết ở bên
                    dưới.
                  </desc>
                  {Array.from({ length: 5 }, (_, index) => {
                    const value = max - ((max - min) * index) / 4;
                    return (
                      <g key={index}>
                        <line x1={left} x2={width - right} y1={y(value)} y2={y(value)} stroke="#edf1ee" />
                        <text x={left - 10} y={y(value) + 4} textAnchor="end" className={styles.axisLabel}>
                          {compactCurrency.format(value)}
                        </text>
                      </g>
                    );
                  })}
                  <line x1={left} x2={width - right} y1={y(0)} y2={y(0)} stroke="#c6d6cb" />
                  {periods.map((period, index) => {
                    const center = left + slot * (index + 0.5);
                    return (
                      <g key={period.key}>
                        {revenueServices.map(({ key, label, color }, serviceIndex) => {
                          const value = period[key][metric];
                          return (
                            <rect
                              key={key}
                              x={center + (serviceIndex - 1) * (barWidth + 3)}
                              y={Math.min(y(value), y(0))}
                              width={barWidth}
                              height={Math.max(value === 0 ? 1 : 2, Math.abs(y(value) - y(0)))}
                              rx={3}
                              fill={color}
                              opacity={selected && selected.key !== period.key ? 0.4 : 1}
                              tabIndex={0}
                              role="img"
                              aria-label={`${period.title}, ${label}: ${formatCurrency(value)}`}
                              onMouseEnter={() => setSelectedKey(period.key)}
                              onFocus={() => setSelectedKey(period.key)}
                            >
                              <title>
                                {period.title} · {label}: {formatCurrency(value)}
                              </title>
                            </rect>
                          );
                        })}
                        {(periods.length <= 8 || index % 2 === 0 || index === periods.length - 1) && (
                          <text x={center} y={bottom + 18} textAnchor="middle" className={styles.axisLabel}>
                            {period.label}
                          </text>
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className={styles.selection} aria-live="polite">
                {selected ? (
                  <>
                    <strong>{selected.title}</strong>
                    {revenueServices.map(({ key, label }) => (
                      <span key={key}>
                        {label}: {formatCurrency(selected[key][metric])}
                      </span>
                    ))}
                  </>
                ) : (
                  <span>Di chuột hoặc dùng phím Tab trên cột để xem chi tiết.</span>
                )}
              </div>
            </>
          )}
          <div className={styles.footer}>
            <span className={styles.footerHint}>
              Theo {range.groupBy === 'week' ? 'tuần' : 'tháng'} · Giờ Việt Nam · Cập nhật{' '}
              {dayjs(lastUpdated).format('HH:mm:ss')}
            </span>
            <Link
              to={`${ROUTES.ADMIN_REPORTS}?report=revenue&from=${dayjs(range.from).utcOffset(7).format('YYYY-MM-DD')}&to=${dayjs(range.to).utcOffset(7).format('YYYY-MM-DD')}&groupBy=${range.groupBy}`}
            >
              Báo cáo chi tiết <ArrowUpRight size={13} />
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
