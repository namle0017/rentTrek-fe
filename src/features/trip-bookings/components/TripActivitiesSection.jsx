import claim from '../pages/ParticipantInvitationClaimPage.module.css';
import detail from '../pages/TripBookingDetailPage.module.css';

const groupByDay = (activities) => {
  const days = new Map();
  activities.forEach((activity) => {
    if (!days.has(activity.dayNumber)) days.set(activity.dayNumber, []);
    days.get(activity.dayNumber).push(activity);
  });
  return [...days.entries()];
};

/** Lịch hoạt động theo ngày; isCurrent do BE tính theo giờ Việt Nam. */
export default function TripActivitiesSection({ activities }) {
  if (!activities?.length) return null;

  return (
    <section className={detail.participants} aria-label="Lịch hoạt động dự kiến">
      <div className={detail.sectionTitle}>
        <div>
          <span className={detail.kicker}>LỊCH TRÌNH</span>
          <h2>Lịch hoạt động dự kiến</h2>
        </div>
      </div>
      {groupByDay(activities).map(([dayNumber, dayActivities]) => (
        <section key={dayNumber} className={claim.day}>
          <h3>{dayActivities[0].dayTitle || `Ngày ${dayNumber}`}</h3>
          <ol>
            {dayActivities.map((activity) => (
              <li key={activity.activityId} className={activity.isCurrent ? claim.current : undefined}>
                <time>{activity.startTime.slice(0, 5)}</time>
                <div>
                  <strong>{activity.name}</strong>
                  {activity.isCurrent && <span className={claim.currentBadge}>Đang diễn ra theo lịch</span>}
                  {activity.description && <p>{activity.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </section>
  );
}
