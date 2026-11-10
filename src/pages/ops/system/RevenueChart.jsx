import { useState } from 'react';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
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
  const [realNow] = useState(() => new Date().toISOString());
  const { data: clock } = useDevClock();
  const range = revenueRange(clock?.now ?? realNow, days);
  const report = useOperations(API_ENDPOINTS.ADMIN.REPORTS.REVENUE, range);
  const periods = buildRevenuePeriods(report.data ?? [], range);
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
  const top = 18;
  const height = 195;
  const bottom = top + height;
  const y = (value) => top + ((max - value) / (max - min)) * height;
  const slot = (width - left - right) / periods.length;
  const barWidth = Math.min(24, slot * 0.28);
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
            <div className={styles.empty}>Chưa có giao dịch thành công trong khoảng thời gian này.</div>
          ) : (
            <>
              <div
                className={styles.plot}
                tabIndex={0}
                role="region"
                aria-label="Biểu đồ doanh thu, cuộn ngang trên màn hình nhỏ"
              >
                <svg
                  viewBox={`0 0 ${width} 250`}
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
                        <text x={left - 10} y={y(value) + 4} textAnchor="end" className={styles.axis}>
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
                          <text x={center} y={bottom + 23} textAnchor="middle" className={styles.axis}>
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
              <details className={styles.dataTable}>
                <summary>Xem bảng số liệu</summary>
                <div className={styles.tableScroll}>
                  <table>
                    <caption className="sr-only">{metrics[metric]} theo kỳ, đơn vị đồng</caption>
                    <thead>
                      <tr>
                        <th scope="col">{range.groupBy === 'week' ? 'Tuần bắt đầu' : 'Tháng'}</th>
                        {revenueServices.map(({ key, label }) => (
                          <th scope="col" key={key}>
                            {label}
                          </th>
                        ))}
                        <th scope="col">Tổng</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periods.map((period) => (
                        <tr key={period.key}>
                          <th scope="row">{period.title}</th>
                          {revenueServices.map(({ key }) => (
                            <td key={key}>{formatCurrency(period[key][metric])}</td>
                          ))}
                          <td>{formatCurrency(period.Tour[metric] + period.Rental[metric])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
            </>
          )}
          <div className={styles.footer}>
            <span>
              Theo {range.groupBy === 'week' ? 'tuần' : 'tháng'} · Giờ Việt Nam · Ròng = tổng thu − hoàn tiền
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
