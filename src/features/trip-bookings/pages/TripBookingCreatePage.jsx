import { useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks/useAuth';
import { applyServerErrors } from '@/utils/applyServerErrors';
import ParticipantFields from '../components/ParticipantFields';
import { useCreateTripBooking } from '../hooks/useTripBookings';
import {
  BookingValidationError,
  normalizeBookingPayload,
  resolveBookingSubmission,
} from '../utils/bookingSubmission';
import styles from './TripBookingCreatePage.module.css';

const emptyParticipant = () => ({
  fullName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
});

const parsePartySize = (value) => {
  const parsed = Number.parseInt(value || '1', 10);
  return Number.isFinite(parsed) ? Math.min(21, Math.max(1, parsed)) : 1;
};

export default function TripBookingCreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const createBooking = useCreateTripBooking();
  const submissionRef = useRef(null);
  const [serverMessage, setServerMessage] = useState('');
  const tripId = searchParams.get('tripId') || '';
  const tourId = searchParams.get('tourId') || '';
  const initialPartySize = parsePartySize(searchParams.get('partySize'));

  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tripId,
      note: '',
      additionalParticipants: Array.from(
        { length: initialPartySize - 1 },
        emptyParticipant,
      ),
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'additionalParticipants' });

  if (!tripId) {
    return (
      <section className={styles.missingState}>
        <span className={styles.kicker}>KHÔNG THỂ TIẾP TỤC</span>
        <h1>Thiếu chuyến đi</h1>
        <p>Vui lòng chọn lịch khởi hành từ trang chi tiết tour.</p>
        <Link className={styles.backLink} to={ROUTES.TOURS}>Xem tour đang mở</Link>
      </section>
    );
  }

  const mapClientErrors = (validationError) => {
    Object.entries(validationError.errors).forEach(([field, message]) => {
      setError(field, { type: 'client', message });
    });
  };

  const submit = async (values) => {
    setServerMessage('');
    let payload;

    try {
      payload = normalizeBookingPayload(values, currentUser?.email);
    } catch (error) {
      if (error instanceof BookingValidationError) mapClientErrors(error);
      return;
    }

    const submission = resolveBookingSubmission(submissionRef.current, payload);
    submissionRef.current = submission;

    try {
      const response = await createBooking.mutateAsync({
        payload,
        idempotencyKey: submission.idempotencyKey,
      });
      submissionRef.current = null;
      navigate(ROUTES.TRIP_BOOKING_DETAIL(response.data.orderId), { replace: true });
    } catch (error) {
      if (error?.errors || (error?.statusCode >= 400 && error?.statusCode < 500)) {
        submissionRef.current = null;
      }
      setServerMessage(error?.message || 'Không thể giữ chỗ. Vui lòng thử lại.');
      applyServerErrors(error, setError);
    }
  };

  const handleFormSubmit = (event) => {
    void handleSubmit(submit)(event);
  };

  return (
    <main className={styles.page}>
      <header className={styles.hero}>
        <div>
          <span className={styles.kicker}>BƯỚC 1 / XÁC NHẬN THÔNG TIN</span>
          <h1>Hoàn tất thông tin đoàn</h1>
          <p>Buyer được thêm tự động từ tài khoản. Chỉ nhập người đi cùng.</p>
        </div>
        <div className={styles.progress} aria-label="Tiến trình đặt tour">
          <span className={styles.progressActive}>1</span><i /><span>2</span>
          <small>Giữ chỗ</small><small>Xem booking</small>
        </div>
      </header>

      <form className={styles.layout} onSubmit={handleFormSubmit} noValidate>
        <div className={styles.formColumn}>
          <section className={styles.buyerCard}>
            <OutdoorIcon name="user" size={22} />
            <div>
              <span>Người đặt tour</span>
              <strong>{currentUser?.fullName || currentUser?.email}</strong>
              <small>{currentUser?.email}</small>
            </div>
          </section>

          <div className={styles.sectionHeading}>
            <div>
              <span className={styles.kicker}>DANH SÁCH ĐOÀN</span>
              <h2>Người đi cùng</h2>
            </div>
            <button type="button" className={styles.addButton} onClick={() => append(emptyParticipant())} disabled={fields.length >= 20}>
              + Thêm người tham gia
            </button>
          </div>

          {fields.length === 0 && <p className={styles.emptyParticipants}>Bạn đang đặt 1 chỗ. Không có người đi cùng.</p>}

          {fields.map((field, index) => (
            <ParticipantFields
              key={field.id}
              index={index}
              register={register}
              errors={errors.additionalParticipants?.[index]}
              onRemove={() => remove(index)}
            />
          ))}

          <div className={styles.noteField}>
            <label htmlFor="booking-note">Ghi chú cho ban tổ chức</label>
            <textarea id="booking-note" rows="4" maxLength="1000" placeholder="Nhu cầu ăn uống, sức khỏe hoặc lưu ý khác..." {...register('note', { maxLength: { value: 1000, message: 'Ghi chú tối đa 1000 ký tự.' } })} aria-invalid={errors.note ? 'true' : 'false'} aria-describedby={errors.note ? 'booking-note-error' : undefined} />
            {errors.note && <p id="booking-note-error" role="alert">{errors.note.message}</p>}
          </div>
        </div>

        <aside className={styles.summary}>
          <span className={styles.kicker}>TÓM TẮT ĐƠN</span>
          <h2>Bạn đang đặt {fields.length + 1} chỗ</h2>
          <dl>
            <div><dt>Mã chuyến</dt><dd>{tripId}</dd></div>
            <div><dt>Người đặt</dt><dd>{currentUser?.email}</dd></div>
            <div><dt>Người đi cùng</dt><dd>{fields.length}</dd></div>
          </dl>
          {tourId && <Link className={styles.tourLink} to={ROUTES.TOUR_DETAIL(tourId)}>Xem lại chi tiết tour</Link>}
          <p className={styles.holdNote}>Gửi form sẽ tạo booking và giữ chỗ. Màn hình này không thực hiện thanh toán.</p>
          {serverMessage && <div className={styles.serverError}>{serverMessage}</div>}
          <button type="submit" className={styles.submitButton} disabled={createBooking.isPending}>
            {createBooking.isPending ? 'Đang giữ chỗ...' : 'Xác nhận giữ chỗ'}
          </button>
        </aside>
      </form>
    </main>
  );
}
