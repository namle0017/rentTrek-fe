import styles from './TourTimeline.module.css';

export default function TourTimeline({ activities = [] }) {
  if (!activities || activities.length === 0) {
    return <p className="text-muted">Chưa có thông tin lịch trình chi tiết.</p>;
  }

  // Group activities by dayNumber
  const groupedByDay = activities.reduce((acc, act) => {
    const day = act.dayNumber || 1;
    if (!acc[day]) {
      acc[day] = {
        dayNumber: day,
        dayTitle: act.dayTitle || `Ngày ${day}`,
        items: [],
      };
    }
    acc[day].items.push(act);
    return acc;
  }, {});

  const days = Object.values(groupedByDay).sort((a, b) => a.dayNumber - b.dayNumber);

  return (
    <div className={styles.timelineContainer}>
      {days.map((day) => (
        <div key={day.dayNumber} className={styles.daySection}>
          <div className={styles.dayTitle}>
            <span className={styles.dayBadge}>NGÀY {day.dayNumber}</span>
            <span>{day.dayTitle}</span>
          </div>

          <div className={styles.activityList}>
            {day.items
              .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
              .map((act) => (
                <div key={act.id} className={styles.activityItem}>
                  <div className={styles.activityDot} />
                  <div className={styles.activityHeader}>
                    {act.time && <span className={styles.activityTime}>{act.time}</span>}
                    <span className={styles.activityTitle}>{act.title}</span>
                  </div>
                  {act.description && <p className={styles.activityDesc}>{act.description}</p>}
                  {act.location && (
                    <div className={styles.activityLocation}>📍 {act.location}</div>
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
