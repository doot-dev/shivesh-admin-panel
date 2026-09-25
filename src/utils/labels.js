/** "Rahul Jadhav" → "RJ" for avatar circles. */
export const initials = (name = '') =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'U';

/**
 * Any status word → badge tone, so every badge in the panel colours the same
 * word the same way. ok = done/good, warn = needs a look, err = bad/stopped,
 * primary = in the normal flow, muted = not started.
 */
const TONE_WORDS = {
  ok: ['ACTIVE', 'COMPLETED', 'PAID', 'ACCEPTED', 'CONVERTED', 'VERIFIED', 'REACHED', 'DELIVERED', 'DONE', 'APPROVED', 'LOW', 'OK', 'WITHIN_LIMIT', 'PASSED'],
  warn: ['PENDING', 'IN_PROGRESS', 'PARTIALLY_PAID', 'PART_PAID', 'DELAYED', 'MEDIUM', 'DUE', 'DUE_SOON', 'DUE_TODAY', 'HOLD', 'CREDIT_HOLD', 'SUBMITTED', 'REVIEW'],
  err: ['INACTIVE', 'CANCELLED', 'REJECTED', 'OVERDUE', 'LOST', 'HIGH', 'CRITICAL', 'FAILED', 'BLOCKED', 'REVERSED', 'REVOKED', 'OVER_LIMIT'],
  primary: ['NEW', 'CONFIRMED', 'SENT', 'DISPATCHED', 'IN_TRANSIT', 'UPCOMING', 'OPEN', 'SCHEDULED'],
  muted: ['ASSIGNED', 'DRAFT', 'NOT_STARTED', 'NONE', 'UNKNOWN'],
};
const TONE_OF = Object.fromEntries(Object.entries(TONE_WORDS).flatMap(([tone, words]) => words.map((w) => [w, tone])));

export const toneFor = (status) => {
  const key = String(status ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return TONE_OF[key] ?? 'primary';
};

/** Order status → StatusChip tone (kept for existing callers). */
export const orderTone = (status) => toneFor(status);

/** IN_PROGRESS -> "In progress", COLD_CALL -> "Cold call". For showing enum codes to people. */
export const statusLabel = (s) => {
  if (s === null || s === undefined || s === '') return '—';
  const str = String(s);
  // Already human ("Part paid", "Credit hold") — leave it alone.
  if (/[a-z]/.test(str)) return str;
  return str.charAt(0) + str.slice(1).toLowerCase().replaceAll('_', ' ');
};
