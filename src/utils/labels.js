/** IN_PROGRESS -> "In progress", COLD_CALL -> "Cold call". For showing enum codes to people. */
/** "Rahul Jadhav" → "RJ" for avatar circles. */
export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U';

/** Order status → StatusChip tone. */
export const orderTone = (status) =>
  ({ COMPLETED: 'ok', DELIVERED: 'ok', CANCELLED: 'err', IN_PROGRESS: 'warn' }[status] || 'primary');

export const statusLabel = (s) =>
  s ? s.charAt(0) + s.slice(1).toLowerCase().replaceAll('_', ' ') : '—';
