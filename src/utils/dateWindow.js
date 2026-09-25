/** Local YYYY-MM-DD (toISOString would give the UTC day — yesterday before 5:30 AM IST). */
export const isoDay = (d) => d.toLocaleDateString('en-CA');

export const shiftDays = (n, from = new Date()) => {
  const d = new Date(from.getFullYear(), from.getMonth(), from.getDate() + n);
  return isoDay(d);
};

/**
 * The default list window: last 7 days through the next 10. Covers what just
 * happened and what is booked ahead, without pulling the whole history.
 */
export const defaultWindow = () => ({ from: shiftDays(-7), to: shiftDays(10) });

const FMT = { day: 'numeric', month: 'short' };
export const windowLabel = ({ from, to }) => {
  const f = from ? new Date(`${from}T00:00:00`) : null;
  const t = to ? new Date(`${to}T00:00:00`) : null;
  const y = (d) => (d && d.getFullYear() !== new Date().getFullYear() ? ` ${d.getFullYear()}` : '');
  if (f && t) return `${f.toLocaleDateString('en-IN', FMT)}${y(f)} – ${t.toLocaleDateString('en-IN', FMT)}${y(t)}`;
  if (f) return `From ${f.toLocaleDateString('en-IN', FMT)}${y(f)}`;
  if (t) return `Until ${t.toLocaleDateString('en-IN', FMT)}${y(t)}`;
  return 'All dates';
};
