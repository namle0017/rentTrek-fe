import { Navigate, useParams } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

/** URL cũ /admin/trips/:id/ops và /ops/trips/:id/groups → chi tiết chuyến (tab Kanban thay cho 2 trang này). */
export default function LegacyTripRedirect() {
  const { tripId } = useParams();
  return <Navigate to={ROUTES.ADMIN_TRIP_DETAIL(tripId)} replace />;
}
