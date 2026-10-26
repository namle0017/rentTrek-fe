# Trip Booking Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the authenticated trip-booking flow from tour departure selection through booking status, participant invitations, and invitation claiming.

**Architecture:** Add a self-contained `features/trip-bookings` module that follows the existing Page → React Query hook → service → shared Axios client flow. Tour detail only selects an available trip and opens checkout; the booking API remains the source of truth for price, capacity, order, payment, hold, and participant state. UI uses the existing Be Vietnam Pro, dark-green, cream, and coral design language from Figma with CSS Modules and responsive layouts.

**Tech Stack:** React 19, React Router 7, Axios, TanStack Query 5, React Hook Form, dayjs, CSS Modules, Vitest, Testing Library

**Spec:** `../rentTrek-be/docs/04-FE-TRIP-BOOKING-GUIDE.md`

**Design source:** `https://www.figma.com/design/kGLWdKoNX3ctGWVIQGUHzb/PRN232---Figma?node-id=0-1&p=f`

## Global Constraints

- Use the shared `src/api/axiosClient.js`; components and hooks must never call Axios directly.
- Read business payloads from the API envelope's `data` field.
- Use the exact backend paths under `/trip-bookings` and camelCase request properties.
- Generate one `Idempotency-Key` per user submission; reuse it only when retrying the same normalized payload.
- Never send buyer identity, price, participant count, order status, or payment status in the create payload.
- Allow at most 20 additional participants and reject duplicate emails, including the buyer email.
- Do not infer payment success. Only backend `status === "Confirmed"` and `paymentStatus === "Paid"` unlock invitations.
- There is no payment endpoint. The UI must explain the waiting state and must not provide a fake payment action.
- Invitation tokens remain in transient component state. Never log, persist, place in analytics, or include them in URLs.
- Preserve existing project conventions: feature folders, `@/` imports, route constants, endpoint constants, enum constants, lazy pages, loading/error/empty/data states.
- Use semantic forms, connected labels/errors, keyboard-operable controls, visible focus, and reduced-motion-safe transitions.
- Keep the existing user change in `.gitignore` untouched.

## Review Focus

- A timeout retry with unchanged payload reuses the same idempotency key; editing any field creates a new key.
- Participant emails are trimmed, lowercased, unique, and cannot equal the authenticated buyer email.
- A hold reaching zero triggers one booking refetch and never changes booking/payment status locally.
- Invitation generation is unavailable unless `canManage`, `Confirmed`, and `Paid` are all true.
- Raw invitation tokens never enter route state, query strings, local/session storage, console output, or React Query cache.

---

### Task 1: Restore the existing frontend build baseline

**Files:**
- Modify: `src/layouts/MainLayout.jsx`
- Modify: `src/layouts/MainLayout.module.css`
- Test: production build

**Interfaces:**
- Consumes: existing `useAuth`, `useLogout`, `ROUTES`, `USER_ROLE`, `OutdoorIcon`
- Produces: one Figma-aligned public header/footer shell that compiles and hosts booking pages

- [ ] **Step 1: Re-run the failing build**

Run: `npm run build`

Expected: FAIL because `Link`, `NavLink`, `Outlet`, and `USER_ROLE` are declared twice in `MainLayout.jsx`.

- [ ] **Step 2: Remove only the duplicated legacy layout branch**

Keep the current TrekRent header/search/account/footer composition used by the product screenshots. Remove duplicate imports, the second `renTrek` logo/nav/auth block, the undefined `handleLogoutClick`, and the duplicate footer copyright line.

- [ ] **Step 3: Run the build**

Run: `npm run build`

Expected: PASS before booking code begins.

### Task 2: Add the Vitest UI test harness and booking contract helpers

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vite.config.js`
- Create: `src/test/setup.js`
- Create: `src/features/trip-bookings/utils/bookingSubmission.js`
- Create: `src/features/trip-bookings/utils/bookingSubmission.test.js`

**Interfaces:**
- Produces: `normalizeBookingPayload(values, buyerEmail)`, `resolveBookingSubmission(previousSubmission, payload)`, and a jsdom test environment

- [ ] **Step 1: Add a failing helper test**

Test that normalization trims names/phones/note, lowercases emails, omits empty optional values, rejects more than 20 additional participants, rejects duplicate participant emails, and rejects the buyer email.

- [ ] **Step 2: Run the focused test and verify RED**

Run: `npm test -- src/features/trip-bookings/utils/bookingSubmission.test.js`

Expected: FAIL because the helper module does not exist.

- [ ] **Step 3: Add Vitest, Testing Library, user-event, and jsdom**

Add `test` and `test:watch` scripts. Configure jsdom and `src/test/setup.js` without replacing the existing Node integration test.

- [ ] **Step 4: Implement payload normalization**

`normalizeBookingPayload(values, buyerEmail)` returns only `tripId`, optional `note`, and `additionalParticipants`. Throw a validation error map keyed by React Hook Form field paths for invalid or duplicate data.

- [ ] **Step 5: Test idempotency submission resolution**

`resolveBookingSubmission(previousSubmission, payload)` must reuse the prior UUID when the normalized payload snapshot matches and return a fresh `crypto.randomUUID()` when it differs.

- [ ] **Step 6: Run the focused tests and verify GREEN**

Run: `npm test -- src/features/trip-bookings/utils/bookingSubmission.test.js`

Expected: PASS.

### Task 3: Implement the Axios service and React Query hooks

**Files:**
- Modify: `src/api/endpoints.js`
- Modify: `src/constants/enums.js`
- Create: `src/features/trip-bookings/api/tripBookingService.js`
- Create: `src/features/trip-bookings/api/tripBookingKeys.js`
- Create: `src/features/trip-bookings/hooks/useTripBookings.js`
- Create: `src/features/trip-bookings/api/tripBookingService.test.js`
- Create: `src/features/trip-bookings/hooks/useTripBookings.test.jsx`

**Interfaces:**
- Produces: `tripBookingService.create(payload, idempotencyKey)`, `getById(orderId)`, `generateInvitations(orderId)`, `claimInvitation(token)`
- Produces: `useTripBooking(orderId)`, `useCreateTripBooking()`, `useGenerateParticipantInvitations()`, `useClaimParticipantInvitation()`

- [ ] **Step 1: Write failing endpoint and header tests**

Mock the shared Axios client. Assert exact paths, methods, payloads, and `{ headers: { 'Idempotency-Key': key } }` for create.

- [ ] **Step 2: Run service tests and verify RED**

Run: `npm test -- src/features/trip-bookings/api/tripBookingService.test.js`

Expected: FAIL because endpoints and service do not exist.

- [ ] **Step 3: Add endpoint constants and booking enums**

Add root, by-id, invitation-generation, and claim paths. Add exact backend values for `PendingPayment`, `Confirmed`, `Unpaid`, and `Paid`, plus Vietnamese labels.

- [ ] **Step 4: Implement the service through `axiosClient`**

No token handling, toast, navigation, or `try/catch` belongs in this file.

- [ ] **Step 5: Run service tests and verify GREEN**

Run: `npm test -- src/features/trip-bookings/api/tripBookingService.test.js`

Expected: PASS.

- [ ] **Step 6: Write failing hook tests**

Assert detail queries use `tripBookingKeys.detail(orderId)`, mutations expose the service responses, successful create caches the returned booking, and invitation/claim mutations invalidate the affected detail query without caching raw invitation tokens.

- [ ] **Step 7: Implement query keys and hooks**

Use global error handling from `queryClient`. Add only success toasts that describe completed backend actions.

- [ ] **Step 8: Run hook tests and verify GREEN**

Run: `npm test -- src/features/trip-bookings/hooks/useTripBookings.test.jsx`

Expected: PASS.

### Task 4: Connect Figma tour selection to real trip data

**Files:**
- Modify: `src/features/tours/components/TourBookingCard.jsx`
- Modify: `src/features/tours/components/TourBookingCard.module.css`
- Create: `src/features/tours/components/TourBookingCard.test.jsx`
- Modify: `src/constants/routes.js`

**Interfaces:**
- Consumes: `tour.availableTrips[]` with `id`, `tripOptionTitle`, `availableSlots`, `pricePerPerson`, and `status`
- Produces: navigation to `ROUTES.TRIP_BOOKING_CREATE` with `tripId`, `tourId`, and requested additional-participant count

- [ ] **Step 1: Write failing booking-card tests**

Assert options render from `availableTrips`, closed/full trips cannot be submitted, price uses the selected trip, member count never exceeds available slots, and the CTA opens checkout instead of showing the current fake success toast.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- src/features/tours/components/TourBookingCard.test.jsx`

Expected: FAIL because the component currently reads `upcomingTrips`, `departureText`, and `slotText`.

- [ ] **Step 3: Replace the stale DTO mapping**

Use backend field names exactly. Keep pricing display informational; never place price in the booking request.

- [ ] **Step 4: Match the Figma booking card**

Retain the dark-green heading/CTA, cream surfaces, coral emphasis, rounded card, sticky desktop behavior, and stacked mobile layout. Replace emoji-only affordances with existing `OutdoorIcon` or text where possible.

- [ ] **Step 5: Run the component test and verify GREEN**

Run: `npm test -- src/features/tours/components/TourBookingCard.test.jsx`

Expected: PASS.

### Task 5: Build the protected checkout page

**Files:**
- Create: `src/features/trip-bookings/pages/TripBookingCreatePage.jsx`
- Create: `src/features/trip-bookings/pages/TripBookingCreatePage.module.css`
- Create: `src/features/trip-bookings/components/ParticipantFields.jsx`
- Create: `src/features/trip-bookings/components/ParticipantFields.module.css`
- Create: `src/features/trip-bookings/pages/TripBookingCreatePage.test.jsx`
- Modify: `src/routes/router.jsx`

**Interfaces:**
- Consumes: authenticated buyer email, `tripId` and optional initial participant count from URL search params, `useCreateTripBooking()`
- Produces: normalized create payload and navigation to `ROUTES.TRIP_BOOKING_DETAIL(orderId)` after `201`

- [ ] **Step 1: Write failing checkout render and behavior tests**

Cover missing `tripId`, zero additional participants, add/remove participant, maximum 20, connected field errors, duplicate/buyer email errors, disabled submit while pending, retained values after API validation errors, and successful navigation by returned `orderId`.

- [ ] **Step 2: Run the page test and verify RED**

Run: `npm test -- src/features/trip-bookings/pages/TripBookingCreatePage.test.jsx`

Expected: FAIL because page and fields do not exist.

- [ ] **Step 3: Implement accessible participant fields with React Hook Form**

Use `useFieldArray`. Required: `fullName`, `email`. Optional: `phone`, `dateOfBirth`, emergency name/phone. Connect each error through `aria-invalid`, `aria-describedby`, and `role="alert"`.

- [ ] **Step 4: Implement idempotent submission**

Store only the current payload snapshot and key in a ref. Reuse after timeout/unknown result with unchanged values. Clear the snapshot after a known successful or known business-validation response.

- [ ] **Step 5: Implement the Figma-aligned checkout composition**

Use a compact progress header, left participant form, right sticky trip/order summary, dark-green/cream/coral tokens, and a single-column mobile breakpoint. Do not show a payment step or payment button.

- [ ] **Step 6: Run the page test and verify GREEN**

Run: `npm test -- src/features/trip-bookings/pages/TripBookingCreatePage.test.jsx`

Expected: PASS.

### Task 6: Build booking status, hold countdown, and invitation generation

**Files:**
- Create: `src/features/trip-bookings/pages/TripBookingDetailPage.jsx`
- Create: `src/features/trip-bookings/pages/TripBookingDetailPage.module.css`
- Create: `src/features/trip-bookings/components/HoldCountdown.jsx`
- Create: `src/features/trip-bookings/components/InvitationTokensPanel.jsx`
- Create: `src/features/trip-bookings/utils/bookingStatus.js`
- Create: `src/features/trip-bookings/pages/TripBookingDetailPage.test.jsx`
- Create: `src/features/trip-bookings/utils/bookingStatus.test.js`

**Interfaces:**
- Consumes: `useTripBooking(orderId)` and invitation mutation
- Produces: buyer/participant-scoped status UI and transient invitation token panel

- [ ] **Step 1: Write failing status and countdown tests**

Assert buyer money fields are shown only when `canManage`; participant scope hides them; remaining time never goes negative; zero invokes one refetch callback; invitation eligibility requires `canManage && Confirmed && Paid`.

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- src/features/trip-bookings/utils/bookingStatus.test.js src/features/trip-bookings/pages/TripBookingDetailPage.test.jsx`

Expected: FAIL because status helpers and page do not exist.

- [ ] **Step 3: Implement status helpers and countdown**

Use backend timestamps. Announce expiry with `aria-live="polite"`; refetch once at zero. Never mutate status or payment state locally.

- [ ] **Step 4: Implement booking detail states**

Render loading, error with retry, not-found/empty, and data. Show order code, trip dates, participant list, backend totals, status badges, and a clear “payment integration not available yet” notice for `PendingPayment/Unpaid`.

- [ ] **Step 5: Implement guarded invitation generation**

Require explicit user click. Render returned tokens in a transient panel grouped by participant, with copy buttons and expiry. A regenerate action must warn that prior pending tokens are revoked. Do not put the mutation response in React Query cache.

- [ ] **Step 6: Run tests and verify GREEN**

Run: `npm test -- src/features/trip-bookings/utils/bookingStatus.test.js src/features/trip-bookings/pages/TripBookingDetailPage.test.jsx`

Expected: PASS.

### Task 7: Build the participant invitation claim page

**Files:**
- Create: `src/features/trip-bookings/pages/ParticipantInvitationClaimPage.jsx`
- Create: `src/features/trip-bookings/pages/ParticipantInvitationClaimPage.module.css`
- Create: `src/features/trip-bookings/pages/ParticipantInvitationClaimPage.test.jsx`
- Modify: `src/constants/routes.js`
- Modify: `src/routes/router.jsx`

**Interfaces:**
- Consumes: manual one-time token input and `useClaimParticipantInvitation()`
- Produces: participant-scoped booking result and navigation to booking detail

- [ ] **Step 1: Write failing claim-page tests**

Assert token is required, whitespace is trimmed, pending disables submit, server errors stay visible, success clears the input, no token appears in the URL, and the returned `orderId` links to booking detail.

- [ ] **Step 2: Run the page test and verify RED**

Run: `npm test -- src/features/trip-bookings/pages/ParticipantInvitationClaimPage.test.jsx`

Expected: FAIL because the page does not exist.

- [ ] **Step 3: Implement the protected claim form**

Use a password-style or masked text input with an explicit reveal control, autocomplete off, connected errors, and no persistence.

- [ ] **Step 4: Add lazy protected routes**

Add `/trip-bookings/new`, `/trip-bookings/:orderId`, and `/trip-bookings/invitations/claim` under the existing authenticated `ProtectedRoute` and `MainLayout`.

- [ ] **Step 5: Run the page test and verify GREEN**

Run: `npm test -- src/features/trip-bookings/pages/ParticipantInvitationClaimPage.test.jsx`

Expected: PASS.

### Task 8: Full verification and visual comparison

**Files:**
- Modify only files required by failures found in this verification task
- Create: `docs/screenshots/trip-booking-checkout-desktop.png`
- Create: `docs/screenshots/trip-booking-checkout-mobile.png`
- Create: `docs/screenshots/trip-booking-detail-desktop.png`
- Create: `docs/screenshots/trip-booking-detail-mobile.png`

**Interfaces:**
- Consumes: completed flow and the backend API when available
- Produces: reproducible automated and visual evidence

- [ ] **Step 1: Run all unit/component tests**

Run: `npm test`

Expected: all Vitest tests pass with zero unhandled errors.

- [ ] **Step 2: Run the existing Axios integration test when the backend is available**

Run: `node --use-system-ca --test tests/product-catalog.render.test.mjs`

Expected: existing four tests pass; if the backend is unavailable, report this separately rather than claiming integration success.

- [ ] **Step 3: Run static verification**

Run: `npm run lint`

Expected: zero ESLint errors.

Run: `npm run build`

Expected: Vite production build exits 0.

- [ ] **Step 4: Exercise the real booking flow**

Verify authenticated creation, timeout retry with the same key, booking reload, hold expiry refetch, invitation gating, invitation regeneration warning, correct-email claim, and 400/401/403/404/409 displays.

- [ ] **Step 5: Compare desktop and mobile against Figma**

Capture 1440px and 390px views. Check typography, dark-green/cream/coral palette, spacing, card radii, sticky summary, field alignment, status hierarchy, focus states, overflow, and loading/error/empty states.

- [ ] **Step 6: Review the final diff**

Run: `git status --short` and `git diff --check`

Expected: only scoped booking/layout/test/docs changes; no secrets, tokens, `.env`, `dist`, or unrelated `.gitignore` edits.

