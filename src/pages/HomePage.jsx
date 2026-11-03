import { Link } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import ProductImage from '@/features/products/components/ProductImage';
import { useProducts } from '@/features/products/hooks/useProducts';
import TourCard from '@/features/tours/components/TourCard';
import { useTours } from '@/features/tours/hooks/useTours';
import { formatCurrency } from '@/utils/formatCurrency';
import styles from './HomePage.module.css';

const img = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?w=${w}&q=70&auto=format`;

const HIGHLIGHTS = [
  { icon: 'users', text: 'Guide bản địa dẫn suốt hành trình' },
  { icon: 'shield', text: 'Nhóm nhỏ, an toàn từng chặng' },
  { icon: 'check', text: 'Thuê đủ đồ, giá theo ngày' },
];

const STEPS = [
  ['01', 'Chọn chuyến và giữ chỗ', 'Xem ngày khởi hành, số chỗ còn và chính sách hoàn tiền trước khi thanh toán.'],
  ['02', 'Mời người đi cùng', 'Khai báo người tham gia, gửi mã nhóm để mọi người tự vào nhóm bằng tài khoản của mình.'],
  ['03', 'Thuê đồ còn thiếu', 'Đồ được cấp đã có sẵn trong chuyến; muốn thêm thì thuê theo ngày.'],
  ['04', 'Lên đường cùng guide', 'Guide điểm danh từng chặng, bạn theo dõi lịch trình ngay trên điện thoại.'],
];

const PERKS = [
  'Giá theo bậc ngày: thuê càng lâu càng rẻ',
  'Kiểm tra cùng nhân viên khi nhận và trả',
  'Tiền cọc hoàn lại sau khi trả đồ',
];

export default function HomePage() {
  const { data: tours, isLoading: toursLoading } = useTours({ pageNumber: 1, pageSize: 4, status: 'Active' });
  const { data: products } = useProducts({ pageNumber: 1, pageSize: 4 });

  return (
    <>
      <section className={styles.hero} style={{ '--hero-image': `url(${img('1506905925346-21bda4d32df4', 2000)})` }}>
        <div className={`container ${styles.heroInner}`}>
          <span className={styles.kicker}>MÙA SĂN MÂY 2026</span>
          <h1 className={styles.heroTitle}>
            Đứng trên <em>biển mây</em> lúc bình minh.
          </h1>
          <p className={styles.heroText}>
            Trekking theo nhóm nhỏ cùng guide bản địa, thuê đủ đồ theo ngày. Bạn chỉ cần mang theo đôi chân.
          </p>
          <div className={styles.heroActions}>
            <Link to={ROUTES.TOURS} className={styles.primaryCta}>
              Khám phá chuyến đi
              <span aria-hidden="true">
                <OutdoorIcon name="arrow" size={18} />
              </span>
            </Link>
            <Link to={ROUTES.PRODUCTS} className={styles.ghostCta}>
              Thuê thiết bị
            </Link>
            <a href="#how" className={styles.textCta}>
              Xem cách hoạt động ↓
            </a>
          </div>
          <ul className={styles.highlights}>
            {HIGHLIGHTS.map((item) => (
              <li key={item.text}>
                <span>
                  <OutdoorIcon name={item.icon} size={16} />
                </span>
                {item.text}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`container ${styles.section}`} aria-labelledby="home-trips">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.eyebrow}>CHUYẾN ĐI SẮP KHỞI HÀNH</span>
            <h2 id="home-trips">Các chuyến đi</h2>
          </div>
          <Link to={ROUTES.TOURS} className={styles.moreLink}>
            Xem tất cả →
          </Link>
        </div>
        {toursLoading ? (
          <div className={styles.cardGrid} aria-busy="true">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className={styles.skeleton} />
            ))}
          </div>
        ) : tours?.items?.length ? (
          <div className={styles.cardGrid}>
            {tours.items.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        ) : (
          <p className={styles.empty}>Chưa có chuyến đi đang mở. Quay lại sau nhé!</p>
        )}
      </section>

      <section id="how" className={`container ${styles.section} ${styles.how}`} aria-labelledby="home-how">
        <div>
          <span className={styles.eyebrow}>CÁCH HOẠT ĐỘNG</span>
          <h2 id="home-how">Từ lúc đặt chỗ đến khi chạm đỉnh</h2>
          <p className={styles.lead}>
            Mọi thứ nằm trong một tài khoản: chuyến đi, đồ thuê, người đi cùng và lịch trình từng ngày.
          </p>
          <ol className={styles.steps}>
            {STEPS.map(([no, title, text]) => (
              <li key={no}>
                <span className={styles.stepNo}>{no}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className={styles.collage} aria-hidden="true">
          <div className={styles.collageMain} style={{ backgroundImage: `url(${img('1551632811-561732d1e306', 1000)})` }} />
          <div className={styles.collageSub} style={{ backgroundImage: `url(${img('1478131143081-80f7f84ca84d', 800)})` }} />
          <div className={styles.collageNote}>
            <small>Nhóm Mây 1 · Fansipan</small>
            <strong>7/7 có mặt lúc leo đỉnh</strong>
            <span>
              <OutdoorIcon name="check" size={13} /> Guide đã điểm danh
            </span>
          </div>
        </div>
      </section>

      <section className={styles.rent} aria-labelledby="home-rent">
        <div className={`container ${styles.rentInner}`}>
          <div className={styles.gearGrid}>
            {products?.items?.map((product) => (
              <Link key={product.id} to={ROUTES.PRODUCT_DETAIL(product.id)} className={styles.gearCard}>
                <ProductImage src={product.thumbnailUrl} alt={product.name} className={styles.gearImage} />
                <div>
                  <strong>{product.name}</strong>
                  {product.isRentable && (
                    <span>
                      Từ <b>{formatCurrency(product.pricePerDay)}</b>/ngày
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
          <div>
            <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>THUÊ THIẾT BỊ</span>
            <h2 id="home-rent">
              Không cần mua. <em>Thuê đúng ngày bạn đi.</em>
            </h2>
            <p className={styles.rentText}>
              Lều, túi ngủ, balo, gậy và combo trọn bộ. Giá giảm theo số ngày thuê, mỗi thiết bị được kiểm tra trước khi
              giao.
            </p>
            <ul className={styles.perks}>
              {PERKS.map((perk) => (
                <li key={perk}>
                  <span>
                    <OutdoorIcon name="check" size={14} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link to={ROUTES.PRODUCTS} className={styles.lightCta}>
              Xem đồ cho thuê
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.cta} style={{ '--cta-image': `url(${img('1454496522488-7a8e488e8606', 2000)})` }}>
        <div className={`container ${styles.ctaInner}`}>
          <h2>
            Biển mây không chờ ai. <em>Chỗ thì có hạn.</em>
          </h2>
          <Link to={ROUTES.TOURS} className={styles.primaryCta}>
            Đặt chuyến ngay
          </Link>
        </div>
      </section>
    </>
  );
}
