import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export default function HomePage() {
  return (
    <section className="hero">
      <h1>Thuê đồ trekking, cắm trại dễ dàng</h1>
      <p>Lều, balo, túi ngủ và mọi thứ bạn cần cho chuyến đi tiếp theo.</p>
      <Link to={ROUTES.PRODUCTS} className="btn btn-primary">
        Xem sản phẩm
      </Link>
    </section>
  );
}
