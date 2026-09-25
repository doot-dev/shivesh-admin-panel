/** IN_PROGRESS -> "In progress", COLD_CALL -> "Cold call". For showing enum codes to people. */
export const statusLabel = (s) =>
  s ? s.charAt(0) + s.slice(1).toLowerCase().replaceAll('_', ' ') : '—';
