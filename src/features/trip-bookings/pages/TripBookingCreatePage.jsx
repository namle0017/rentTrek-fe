import { useRef, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import OutdoorIcon from '@/components/OutdoorIcon';
import { ROUTES } from '@/constants/routes';
import { useTour } from '@/features/tours/hooks/useTours';
import { useAuth } from '@/hooks/useAuth';
import { applyServerErrors } from '@/utils/applyServerErrors';
import { formatCurrency } from '@/utils/formatCurrency';
import ParticipantFields from '../components/ParticipantFields';
import { useCreateTripBooking } from '../hooks/useTripBookings';
import {
  BookingValidationError,
  normalizeBookingPayload,
  resolveBookingSubmission,
} from '../utils/bookingSubmission';
import styles from './TripBookingCreatePage.module.css';

const STEPS = ['Số người', 'Người tham gia', 'Xác nhận'];
const LAST_STEP = STEPS.length - 1;
const MAX_ADDITIONAL = 20;

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
  return Number.isFinite(parsed) ? Math.min(MAX_ADDITIONAL + 1, Math.max(1, parsed)) : 1;
};

// Lỗi nằm ở bước nào thì quay lại đúng bước đó, tránh báo lỗi cho field đang ẩn
const stepOfField = (field) => {
  if (field.startsWith('contactPhone')) return 0;
  if (field.startsWith('additionalParticipants')) return 1;
  return LAST_STEP;
};

export default function TripBookingCreatePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const createBooking = useCreateTripBooking();
  const submissionRef = useRef(null);
  const [step, setStep] = useState(0);
  const [serverMessage, setServerMessage] = useState('');
  const tripId = searchParams.get('tripId') || '';
  const tourId = searchParams.get('tourId') || '';
  const initialPartySize = parsePartySize(searchParams.get('partySize'));
  const { data: tour } = useTour(tourId);
  const trip = tour?.availableTrips?.find((item) => item.id === tripId);

  const {
    register,
    control,
    handleSubmit,
    setError,
    setValue,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tripId,
      contactPhone: currentUser?.phone || '',
      buyerParticipates: true,
      note: '',
      additionalParticipants: Array.from({ length: initialPartySize - 1 }, emptyParticipant),
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'additionalParticipants' });
  const buyerParticipates = watch('buyerParticipates');
  const contactPhone = watch('contactPhone');

  if (!tripId) {
    return (
      <section className={styles.missingState}>
        <span className={styles.kicker}>KHÔNG THỂ TIẾP TỤC</span>
        <h1>Thiếu chuyến đi</h1>
        <p>Vui lòng chọn lịch khởi hành từ trang chi tiết tour.</p>
        <Link className={styles.backLink} to={ROUTES.TOURS}>
          Xem tour đang mở
        </Link>
      </section>
    );
  }

  const availableSlots = trip?.availableSlots ?? Infinity;
  const seats = fields.length + (buyerParticipates ? 1 : 0);
  const maxSeats = Math.min(MAX_ADDITIONAL + (buyerParticipates ? 1 : 0), availableSlots);
  const unitPrice = trip?.pricePerPerson || tour?.basePrice || 0;
  const addOne = () => append(emptyParticipant(), { shouldFocus: false });

  const changeBuyerParticipates = (next) => {
    setValue('buyerParticipates', next);
    if (!next && fields.length === 0) addOne();
    // Bật lại "tôi đi cùng" tốn thêm 1 chỗ, không được vượt số chỗ còn
    if (next && fields.length >= availableSlots) remove(fields.length - 1);
  };

  const showClientErrors = (validationError) => {
    Object.entries(validationError.errors).forEach(([field, message]) => {
      setError(field, { type: 'client', message });
    });
    setStep(Math.min(...Object.keys(validationError.errors).map(stepOfField)));
  };

  const goNext = async () => {
    const valid = await trigger(step === 0 ? ['contactPhone'] : ['additionalParticipants']);
    if (!valid) return;
    try {
      // Bắt email trùng ngay tại bước nhập thay vì đợi tới bước cuối
      normalizeBookingPayload(getValues(), currentUser?.email);
    } catch (error) {
      if (!(error instanceof BookingValidationError)) throw error;
      // Bước 1 chưa nhập người đi nên chỉ chặn lỗi thuộc bước hiện tại trở về trước
      const blocking = Object.fromEntries(
        Object.entries(error.errors).filter(([field]) => stepOfField(field) <= step),
      );
      if (Object.keys(blocking).length) {
        showClientErrors(new BookingValidationError(blocking));
        return;
      }
    }
    setStep((current) => current + 1);
  };

  const submit = async (values) => {
    setServerMessage('');
    let payload;

    try {
      payload = normalizeBookingPayload(values, currentUser?.email);
    } catch (error) {
      if (error instanceof BookingValidationError) showClientErrors(error);
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
      const fieldSteps = Object.keys(error?.errors ?? {}).map(stepOfField);
      if (fieldSteps.length) setStep(Math.min(...fieldSteps));
    }
  };

  const handleFormSubmit = (event) => {
    if (step < LAST_STEP) {
      event.preventDefault();
      void goNext();
      return;
    }
    void handleSubmit(submit)(event);
  };

  const participantNames = [
    ...(buyerParticipates ? [currentUser?.fullName || currentUser?.email] : []),
    ...getValues('additionalParticipants').map((participant) => participant.fullName.trim()),
  ].filter(Boolean);

  return (
    <main className={styles.page}>
      <div className={styles.backNav}>
        <Link
          to={tourId ? ROUTES.TOUR_DETAIL(tourId) : ROUTES.TOURS}
          className={styles.backLink}
        >
          &larr; Quay lại {tour?.name ? `tour ${tour.name}` : 'danh sách tour'}
        </Link>
      </div>

      <header className={styles.hero}>
        <span className={styles.kicker}>ĐẶT CHUYẾN</span>
        <h1>{tour?.name || 'Hoàn tất thông tin đoàn'}</h1>
      </header>

      <form className={styles.layout} onSubmit={handleFormSubmit} noValidate>
        <div className={styles.formColumn}>
          <ol className={styles.steps} aria-label="Tiến trình đặt chuyến">
            {STEPS.map((label, index) => (
              <li
                key={label}
                className={index < step ? styles.stepDone : index === step ? styles.stepActive : undefined}
                aria-current={index === step ? 'step' : undefined}
              >
                <span>{index < step ? '✓' : index + 1}</span>
                {label}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <section className={styles.card}>
              <h2>Số người &amp; liên hệ</h2>
              <p className={styles.cardHint}>
                {trip ? `Chuyến còn ${trip.availableSlots} chỗ. ` : ''}Chỗ được giữ khi bạn xác nhận ở bước
                cuối.
              </p>

              <div className={styles.field}>
                <label htmlFor="contact-phone">
                  Số điện thoại liên hệ<span aria-hidden="true"> *</span>
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  autoComplete="tel"
                  aria-invalid={errors.contactPhone ? 'true' : 'false'}
                  aria-describedby={errors.contactPhone ? 'contact-phone-error' : undefined}
                  {...register('contactPhone', {
                    validate: (value) => value.trim() !== '' || 'Vui lòng nhập số điện thoại liên hệ.',
                    maxLength: { value: 20, message: 'Số điện thoại tối đa 20 ký tự.' },
                  })}
                />
                {errors.contactPhone && (
                  <p id="contact-phone-error" className={styles.fieldError} role="alert">
                    {errors.contactPhone.message}
                  </p>
                )}
              </div>

              <fieldset className={styles.choices}>
                <legend>Bạn có đi chuyến này không?</legend>
                <label className={buyerParticipates ? styles.choiceActive : undefined}>
                  <input
                    type="radio"
                    name="buyer-participates"
                    checked={buyerParticipates}
                    onChange={() => changeBuyerParticipates(true)}
                  />
                  <span>
                    <strong>Tôi đi cùng</strong>
                    <small>Bạn là người tham gia đầu tiên và được tính 1 chỗ.</small>
                  </span>
                </label>
                <label className={!buyerParticipates ? styles.choiceActive : undefined}>
                  <input
                    type="radio"
                    name="buyer-participates"
                    checked={!buyerParticipates}
                    onChange={() => changeBuyerParticipates(false)}
                  />
                  <span>
                    <strong>Đặt giùm người khác</strong>
                    <small>Bạn không tốn chỗ nhưng vẫn là chủ đơn, thanh toán và quản lý đơn.</small>
                  </span>
                </label>
              </fieldset>

              <div className={styles.counterRow}>
                <div>
                  <strong>Số người tham gia</strong>
                  <small>Tối đa {maxSeats} người</small>
                </div>
                <div className={styles.counter}>
                  <button
                    type="button"
                    aria-label="Bớt một người"
                    disabled={seats <= 1}
                    onClick={() => remove(fields.length - 1)}
                  >
                    −
                  </button>
                  <output aria-live="polite" aria-label="Số người tham gia">
                    {seats}
                  </output>
                  <button
                    type="button"
                    aria-label="Thêm một người"
                    disabled={seats >= maxSeats}
                    onClick={addOne}
                  >
                    +
                  </button>
                </div>
              </div>
            </section>
          )}

          {step === 1 && (
            <>
              {buyerParticipates && (
                <section className={styles.buyerCard}>
                  <OutdoorIcon name="user" size={22} />
                  <div>
                    <span>Người đặt tour · Bạn</span>
                    <strong>{currentUser?.fullName || currentUser?.email}</strong>
                    <small>
                      {currentUser?.email} · {contactPhone}
                    </small>
                  </div>
                </section>
              )}

              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.kicker}>DANH SÁCH ĐOÀN</span>
                  <h2>{buyerParticipates ? 'Người đi cùng' : 'Người tham gia'}</h2>
                </div>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={addOne}
                  disabled={seats >= maxSeats}
                >
                  + Thêm người tham gia
                </button>
              </div>

              {fields.length === 0 && (
                <p className={styles.emptyParticipants}>Bạn đang đặt 1 chỗ. Không có người đi cùng.</p>
              )}
              {errors.additionalParticipants?.message && (
                <p className={styles.serverError} role="alert">
                  {errors.additionalParticipants.message}
                </p>
              )}

              {fields.map((field, index) => (
                <ParticipantFields
                  key={field.id}
                  index={index}
                  register={register}
                  errors={errors.additionalParticipants?.[index]}
                  onRemove={() => remove(index)}
                />
              ))}
            </>
          )}

          {step === LAST_STEP && (
            <>
              <section className={styles.card}>
                <h2>Chuyến của bạn</h2>
                <dl className={styles.review}>
                  {tour?.name && (
                    <>
                      <dt>Tour</dt>
                      <dd>{tour.name}</dd>
                    </>
                  )}
                  {trip && (
                    <>
                      <dt>Đợt khởi hành</dt>
                      <dd>{trip.dateRangeFormatted}</dd>
                    </>
                  )}
                  <dt>Người đặt</dt>
                  <dd>
                    {currentUser?.fullName || currentUser?.email}
                    {!buyerParticipates && ' (đặt giùm, không đi cùng)'}
                  </dd>
                  <dt>Điện thoại</dt>
                  <dd>{contactPhone}</dd>
                  <dt>Người tham gia</dt>
                  <dd>{participantNames.join(', ')}</dd>
                </dl>
              </section>

              <section className={styles.noteField}>
                <label htmlFor="booking-note">Ghi chú cho ban tổ chức</label>
                <textarea
                  id="booking-note"
                  rows="3"
                  maxLength="1000"
                  placeholder="Nhu cầu ăn uống, sức khỏe hoặc lưu ý khác..."
                  {...register('note', { maxLength: { value: 1000, message: 'Ghi chú tối đa 1000 ký tự.' } })}
                  aria-invalid={errors.note ? 'true' : 'false'}
                  aria-describedby={errors.note ? 'booking-note-error' : undefined}
                />
                {errors.note && (
                  <p id="booking-note-error" role="alert">
                    {errors.note.message}
                  </p>
                )}
              </section>
            </>
          )}

          {serverMessage && <div className={styles.serverError}>{serverMessage}</div>}

          <div className={styles.actions}>
            {step > 0 && (
              <button type="button" className={styles.backButton} onClick={() => setStep(step - 1)}>
                Quay lại
              </button>
            )}
            {step < LAST_STEP ? (
              <button type="submit" className={styles.submitButton}>
                Tiếp tục
              </button>
            ) : (
              <button type="submit" className={styles.submitButton} disabled={createBooking.isPending}>
                {createBooking.isPending ? 'Đang giữ chỗ...' : 'Xác nhận giữ chỗ'}
              </button>
            )}
          </div>
        </div>

        <aside className={styles.summary}>
          {(tour?.thumbnailUrl || tour?.images?.[0]?.imageUrl) && (
            <img src={tour.thumbnailUrl || tour.images[0].imageUrl} alt="" className={styles.summaryImage} />
          )}
          <div className={styles.summaryBody}>
            <span className={styles.kicker}>TÓM TẮT ĐƠN</span>
            <h2>Bạn đang đặt {seats} chỗ</h2>
            {tour?.name && <p className={styles.summaryTour}>{tour.name}</p>}
            {trip && <p className={styles.summaryDates}>Đợt {trip.dateRangeFormatted}</p>}
            {unitPrice > 0 && (
              <dl>
                <div>
                  <dt>
                    {seats} người × {formatCurrency(unitPrice)}
                  </dt>
                  <dd>{formatCurrency(seats * unitPrice)}</dd>
                </div>
                <div className={styles.total}>
                  <dt>Tổng dự kiến</dt>
                  <dd>{formatCurrency(seats * unitPrice)}</dd>
                </div>
              </dl>
            )}
            <p className={styles.holdNote}>
              Xác nhận sẽ giữ chỗ 15 phút để bạn chuyển khoản VietQR. Tổng tiền chính thức do hệ thống chốt
              khi giữ chỗ.
            </p>
            {tourId && (
              <Link className={styles.tourLink} to={ROUTES.TOUR_DETAIL(tourId)}>
                Xem lại chi tiết tour
              </Link>
            )}
          </div>
        </aside>
      </form>
    </main>
  );
}
