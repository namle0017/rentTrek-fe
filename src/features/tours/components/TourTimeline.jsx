import { useMemo, useState } from 'react';
import styles from './TourTimeline.module.css';

export default function TourTimeline({ activities = [] }) {
  // Group activities by dayNumber
  const groupedByDay = useMemo(() => {
    if (!activities || activities.length === 0) return {};
    return activities.reduce((acc, act) => {
      const day = act.dayNumber || 1;
      if (!acc[day]) {
        acc[day] = {
          dayNumber: day,
          dayTitle: act.dayTitle || `Ngày ${day}`,
          items: [],
        };
      }
      if (act.dayTitle && acc[day].dayTitle === `Ngày ${day}`) {
        acc[day].dayTitle = act.dayTitle;
      }
      acc[day].items.push(act);
      return acc;
    }, {});
  }, [activities]);

  const days = useMemo(() => {
    return Object.values(groupedByDay).sort((a, b) => a.dayNumber - b.dayNumber);
  }, [groupedByDay]);

  // Mặc định mở ngày đầu tiên (hoặc các ngày)
  const [expandedDays, setExpandedDays] = useState(() => new Set([days[0]?.dayNumber || 1]));

  if (!activities || activities.length === 0) {
    return <p className={styles.emptyText}>Chưa có thông tin lịch trình chi tiết.</p>;
  }

  const toggleDay = (dayNumber) => {
    setExpandedDays((prev) => {
      const next = new Set(prev);
      if (next.has(dayNumber)) {
        next.delete(dayNumber);
      } else {
        next.add(dayNumber);
      }
      return next;
    });
  };

  return (
    <div className={styles.timelineWrapper}>
      {days.map((day, dayIndex) => {
        const isExpanded = expandedDays.has(day.dayNumber);
        const hasNextDay = dayIndex < days.length - 1;

        return (
          <div key={day.dayNumber} className={styles.dayGroup}>
            <div className={styles.dayHeaderRow}>
              {/* Vòng tròn huy hiệu Ngày bên trái */}
              <div
                className={`${styles.dayBadgeCircle} ${isExpanded ? styles.badgeActive : styles.badgeInactive}`}
              >
                <span className={styles.badgeLabel}>NGÀY</span>
                <span className={styles.badgeNumber}>{day.dayNumber}</span>
              </div>

              {/* Thanh tiêu đề dạng viên thuốc (Pill) */}
              <button
                type="button"
                className={`${styles.dayPillBtn} ${isExpanded ? styles.pillActive : styles.pillInactive}`}
                onClick={() => toggleDay(day.dayNumber)}
                aria-expanded={isExpanded}
                aria-controls={`day-content-${day.dayNumber}`}
              >
                <span className={styles.dayPillTitle}>{day.dayTitle}</span>
                <span className={styles.dayPillIcon} aria-hidden="true">
                  {isExpanded ? '−' : '+'}
                </span>
              </button>
            </div>

            {/* Chi tiết lịch trình theo dòng kẻ chấm dọc */}
            {isExpanded && (
              <div
                id={`day-content-${day.dayNumber}`}
                className={`${styles.dayContent} ${hasNextDay ? styles.withConnector : ''}`}
              >
                <div className={styles.activityList}>
                  {day.items
                    .sort((a, b) => (a.sortOrder || a.displayOrder || 0) - (b.sortOrder || b.displayOrder || 0))
                    .map((act, index) => {
                      const timeStr =
                        act.timeFormatted ||
                        act.time ||
                        (act.startTime ? act.startTime.slice(0, 5).replace(':', 'h') : null);
                      const titleStr = act.title || act.name;

                      return (
                        <div key={act.id || act.activityId || index} className={styles.activityItem}>
                          <p className={styles.activityText}>
                            {timeStr && <strong className={styles.activityTime}>{timeStr}: </strong>}
                            {titleStr && (
                              <span className={styles.activityTitle}>
                                {titleStr}
                                {act.description && !act.description.startsWith(titleStr) ? '. ' : ''}
                              </span>
                            )}
                            {act.description && (!titleStr || !act.description.startsWith(titleStr)) && (
                              <span className={styles.activityDesc}>{act.description}</span>
                            )}
                          </p>
                          {act.location && (
                            <div className={styles.activityLocation}>📍 {act.location}</div>
                          )}
                          {act.meals && (
                            <div className={styles.activityMeta}>
                              <em>Bữa ăn: {act.meals}</em>
                            </div>
                          )}
                          {act.accommodation && (
                            <div className={styles.activityMeta}>
                              <em>Nghỉ đêm: {act.accommodation}</em>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
