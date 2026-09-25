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
  file: null,
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

export const cubeTestFormIsValid = (form) => {
  if (!form.period || !form.castingDate.trim() || !form.castingTime.trim() || !form.quantity.trim()) {
    return false;
  }
  if (form.period !== 'CUSTOM') return true;
  if (!form.toDate.trim() || !form.toTime.trim()) return false;
  const casting = new Date(combineDateTime(form.castingDate, form.castingTime));
  const custom = new Date(combineDateTime(form.toDate, form.toTime));
  return custom >= casting && custom <= new Date();
};

export const buildCubeTestFormData = (form) => {
  const formData = new FormData();
  formData.append('castingDate', combineDateTime(form.castingDate, form.castingTime));
  formData.append('quantity', form.quantity.trim());
  formData.append('period', form.period);
  if (form.period === 'CUSTOM') {
    formData.append('customDate', combineDateTime(form.toDate, form.toTime));
  }
  if (form.file) formData.append('file', form.file);
  return formData;
};
