export const BILL_STATUSES = ['PENDING', 'SENT', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'];

// W21: PAID / PARTIALLY_PAID come only from recorded payments — never set by hand.
export const MANUAL_BILL_STATUSES = ['PENDING', 'SENT', 'OVERDUE', 'CANCELLED'];

export const BILL_STATUS_BADGE = {
  PENDING:   { color: '#D97706', backgroundColor: '#FEF3C7' },
  SENT:      { color: '#2563EB', backgroundColor: '#DBEAFE' },
  PARTIALLY_PAID: { color: '#7C3AED', backgroundColor: '#EDE9FE' },
  PAID:      { color: '#16A34A', backgroundColor: '#D1FAE5' },
  OVERDUE:   { color: '#DC2626', backgroundColor: '#FECACA' },
  CANCELLED: { color: '#6B7280', backgroundColor: '#F3F4F6' },
};

export const TM_APPROVAL_BADGE = {
  PENDING:  { color: '#D97706', backgroundColor: '#FEF3C7' },
  ACCEPTED: { color: '#16A34A', backgroundColor: '#D1FAE5' },
  REJECTED: { color: '#DC2626', backgroundColor: '#FECACA' },
};
