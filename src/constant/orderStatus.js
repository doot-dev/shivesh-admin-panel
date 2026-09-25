/**
 * One order status (2026-09-26) — mirror of shivesh-backend/src/helper/orderStatus.js,
 * which enforces it. NEW → CONFIRMED → DISPATCHED → REACHED → COMPLETED;
 * DELAYED any time before REACHED; CANCELLED before dispatch.
 */
export const ORDER_STATUSES = ['NEW', 'CONFIRMED', 'DELAYED', 'DISPATCHED', 'REACHED', 'COMPLETED', 'CANCELLED'];

export const ORDER_TRANSITIONS = {
  NEW: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['DELAYED', 'DISPATCHED', 'CANCELLED'],
  DELAYED: ['DISPATCHED', 'REACHED', 'CANCELLED'],
  DISPATCHED: ['DELAYED', 'REACHED'],
  REACHED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export const STATUS_BADGE = {
  NEW:        { color: '#2563EB', backgroundColor: '#DBEAFE' },
  CONFIRMED:  { color: '#7C3AED', backgroundColor: '#EDE9FE' },
  DELAYED:    { color: '#B45309', backgroundColor: '#FEF3C7' },
  DISPATCHED: { color: '#0891B2', backgroundColor: '#CFFAFE' },
  REACHED:    { color: '#0F766E', backgroundColor: '#CCFBF1' },
  COMPLETED:  { color: '#16A34A', backgroundColor: '#D1FAE5' },
  CANCELLED:  { color: '#DC2626', backgroundColor: '#FECACA' },
};
