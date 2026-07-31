export const BILL_STATUSES = ['PENDING', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'];

export const BILL_STATUS_BADGE = {
  PENDING:   { color: '#D97706', backgroundColor: '#FEF3C7' },
  SENT:      { color: '#2563EB', backgroundColor: '#DBEAFE' },
  PAID:      { color: '#16A34A', backgroundColor: '#D1FAE5' },
  OVERDUE:   { color: '#DC2626', backgroundColor: '#FECACA' },
  CANCELLED: { color: '#6B7280', backgroundColor: '#F3F4F6' },
};

export const TM_APPROVAL_BADGE = {
  PENDING:  { color: '#D97706', backgroundColor: '#FEF3C7' },
  ACCEPTED: { color: '#16A34A', backgroundColor: '#D1FAE5' },
  REJECTED: { color: '#DC2626', backgroundColor: '#FECACA' },
};
