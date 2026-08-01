// Once the order/delivery has reached one of these states, no further cube tests can be logged.
export const CUBE_TEST_LOCKED_STATES = ['DELIVERED', 'COMPLETED'];

export const CUBE_TEST_PERIODS = [
  { value: 'SEVEN_DAYS', label: '7 Days' },
  { value: 'FOURTEEN_DAYS', label: '14 Days' },
  { value: 'TWENTYONE_DAYS', label: '21 Days' },
  { value: 'CUSTOM', label: 'Custom' },
];

export const CUBE_TEST_PERIOD_DAYS = { SEVEN_DAYS: 7, FOURTEEN_DAYS: 14, TWENTYONE_DAYS: 21 };

export const CUBE_TEST_PERIOD_LABEL = CUBE_TEST_PERIODS.reduce((acc, p) => ({ ...acc, [p.value]: p.label }), {});

export const EMPTY_CUBE_TEST_FORM = {
  castingDate: '',
  castingTime: '',
  quantity: '',
  period: '',
  toDate: '',
  toTime: '',
  file: null,
};

export const isOrderCubeTestLocked = (order) =>
  CUBE_TEST_LOCKED_STATES.includes(order?.status) || CUBE_TEST_LOCKED_STATES.includes(order?.deliveryStatus);

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
