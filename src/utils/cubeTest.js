// Cube tests are NEVER locked by order status.
//
// This used to be ['DELIVERED', 'COMPLETED']. It was removed by request: a
// 7/14/21-day cube result arrives long after delivery, and often after the
// order is closed and billed, so locking the form made it impossible to record
// results that legitimately exist. Each row carries its own `createdAt`, which
// is what tells the office a report was filed late.
//
// Kept as an exported empty list so the two call sites keep compiling and the
// rule lives in exactly one place.
export const CUBE_TEST_LOCKED_STATES = [];

// D21: new tests are 7, 15 or 28 days (or a custom date). 14 and 21 remain only
// so old rows still show a label.
export const CUBE_TEST_PERIODS = [
  { value: 'SEVEN_DAYS', label: '7 Days' },
  { value: 'FIFTEEN_DAYS', label: '15 Days' },
  { value: 'TWENTYEIGHT_DAYS', label: '28 Days' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const CUBE_TEST_PERIOD_DAYS = { SEVEN_DAYS: 7, FOURTEEN_DAYS: 14, FIFTEEN_DAYS: 15, TWENTYONE_DAYS: 21, TWENTYEIGHT_DAYS: 28 };

export const CUBE_TEST_PERIOD_LABEL = {
  ...CUBE_TEST_PERIODS.reduce((acc, p) => ({ ...acc, [p.value]: p.label }), {}),
  FOURTEEN_DAYS: '14 Days (old)',
  TWENTYONE_DAYS: '21 Days (old)',
};

/** Server-computed status (W36) → badge. */
export const CUBE_STATUS_BADGE = {
  SCHEDULED: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700' },
  DUE: { label: 'Result pending', className: 'bg-red-100 text-red-700' },
  RESULT_ADDED: { label: 'Result added', className: 'bg-green-100 text-green-700' },
};

export const EMPTY_CUBE_TEST_FORM = {
  castingDate: '',
  castingTime: '',
  quantity: '',
  period: '',
  toDate: '',
  toTime: '',
  files: [], // new files to upload; each save ADDS them as attachments
};

/** Who logged a test or added a file. */
export const ADDED_BY_LABEL = { USER: 'Office', FIELD_TECH: 'Field', CLIENT_CONTACT: 'Client' };

/** "Rakesh Pawar · Client", or null when nothing is known (old rows, backfilled files). */
export const addedByText = ({ addedByName, addedByType } = {}) => {
  const who = ADDED_BY_LABEL[addedByType];
  return addedByName || who ? `${addedByName || '—'} · ${who || '—'}` : null;
};

/// Always false — cube tests can be added to an order at any point in its life.
/// Retained (rather than deleted) so callers keep a single named concept to ask
/// about, should a real lock rule ever come back.
export const isOrderCubeTestLocked = (order) =>
  CUBE_TEST_LOCKED_STATES.includes(order?.status);

const pad2 = (n) => String(n).padStart(2, '0');

// Split an ISO string into separate <input type="date"> / <input type="time"> values (local time).
export const splitIsoToDateTime = (iso) => {
  if (!iso) return { date: '', time: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};

// Concatenate a date input + time input back into a single ISO string for the API.
export const combineDateTime = (date, time) => (date && time ? new Date(`${date}T${time}`).toISOString() : '');

export const addDaysToDateTime = (date, time, days) => {
  if (!date || !time) return { date: '', time: '' };
  const d = new Date(`${date}T${time}`);
  if (Number.isNaN(d.getTime())) return { date: '', time: '' };
  d.setDate(d.getDate() + days);
  return {
    date: `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`,
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
};

export const todayDateStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

/** A saved test as form values: to open the edit form, and to see what changed on save. */
export const cubeTestToForm = (ct) => {
  const casting = splitIsoToDateTime(ct.castingDate);
  const to = splitIsoToDateTime(ct.toDate);
  return {
    castingDate: casting.date,
    castingTime: casting.time,
    quantity: ct.quantity || '',
    period: ct.period || '',
    toDate: to.date,
    toTime: to.time,
    files: [],
  };
};

// No `initial` (a new test) counts as everything changed.
const changed = (form, initial, keys) => !initial || keys.some((k) => form[k] !== initial[k]);
const DATE_KEYS = ['castingDate', 'castingTime', 'period', 'toDate', 'toTime'];

/** `initial` = cubeTestToForm(saved test) on an edit: dates left as they were aren't re-checked. */
export const cubeTestFormIsValid = (form, initial = null) => {
  if (!form.period || !form.castingDate.trim() || !form.castingTime.trim() || !form.quantity.trim()) {
    return false;
  }
  if (form.period !== 'CUSTOM') return true;
  if (!form.toDate.trim() || !form.toTime.trim()) return false;
  if (!changed(form, initial, DATE_KEYS)) return true;
  const casting = new Date(combineDateTime(form.castingDate, form.castingTime));
  const custom = new Date(combineDateTime(form.toDate, form.toTime));
  return custom >= casting && custom <= new Date();
};

/**
 * On an edit (`initial` given) only the changed fields are sent: the server
 * re-checks dates only when they arrive, so adding files to an old test never
 * trips over its original dates, and an old 14/21-day period (no longer
 * accepted) is kept as it is.
 */
export const buildCubeTestFormData = (form, initial = null) => {
  const formData = new FormData();
  if (changed(form, initial, ['castingDate', 'castingTime'])) {
    formData.append('castingDate', combineDateTime(form.castingDate, form.castingTime));
  }
  if (changed(form, initial, ['quantity'])) formData.append('quantity', form.quantity.trim());
  if (changed(form, initial, ['period'])) formData.append('period', form.period);
  if (form.period === 'CUSTOM' && changed(form, initial, DATE_KEYS)) {
    formData.append('customDate', combineDateTime(form.toDate, form.toTime));
  }
  (form.files || []).forEach((f) => formData.append('files', f));
  return formData;
};
