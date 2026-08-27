/**
 * Booking-window rules for order delivery dates, shared by the add-order and
 * order-details screens.
 *
 * Business rule: an order cannot be scheduled more than 3 calendar months into
 * the future — for admins as well as clients. The API is the authority and
 * rejects out-of-window dates with 400; this keeps the UI honest so the date
 * input greys out invalid days and the user sees an inline message instead of
 * a failed save.
 *
 * Mirrors `src/helper/deliveryDateHelper.js` on the server, month-end clamping
 * included.
 */

export const MAX_ORDER_MONTHS_AHEAD = 3;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Today as ISO `YYYY-MM-DD` in the browser's local timezone. */
export function todayIso(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Add whole calendar months to an ISO date, clamping to the last valid day of
 * the target month.
 *
 * GOTCHA: `Date.setMonth` does NOT do this — it overflows, turning 30 Nov + 3
 * months into 2 March instead of 28 Feb, which would offer two days past the
 * cap that the API then rejects.
 */
export function addMonthsIso(iso, months) {
  const [y, m, d] = iso.split('-').map(Number);
  const target = m - 1 + months;
  const ty = y + Math.floor(target / 12);
  const tm = ((target % 12) + 12) % 12;
  const lastDay = new Date(ty, tm + 1, 0).getDate();
  const td = Math.min(d, lastDay);
  return `${ty}-${String(tm + 1).padStart(2, '0')}-${String(td).padStart(2, '0')}`;
}

/** The latest delivery date that may be booked right now, as ISO. */
export function maxOrderDateIso(now = new Date()) {
  return addMonthsIso(todayIso(now), MAX_ORDER_MONTHS_AHEAD);
}

/** Human-readable cap for hints and error copy, e.g. "15 Apr 2026". */
export function maxOrderDateLabel(now = new Date()) {
  const [y, m, d] = maxOrderDateIso(now).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Validate a delivery date against the window.
 *
 * An empty date is valid — date is optional on an order and can be filled in
 * later. Returns an error string when out of window, otherwise null.
 *
 * NOTE: `min`/`max` on `<input type="date">` are advisory. A typed or pasted
 * value still reaches state, so this runs on submit too.
 */
export function getOrderDateError(date, now = new Date()) {
  if (!date || String(date).trim() === '') return null;

  const value = String(date).trim();
  if (!ISO_DATE.test(value)) return 'Enter the date as YYYY-MM-DD';

  if (value > maxOrderDateIso(now)) {
    return `Orders cannot be scheduled more than ${MAX_ORDER_MONTHS_AHEAD} months ahead (latest ${maxOrderDateLabel(now)})`;
  }

  return null;
}
