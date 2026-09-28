// Credit health bar (2026-09-28): green / orange / red, never blocks an order.
// `credit` is GET /reports/clients/:id/credit. People without payments.view
// get only { band, usedPct }; money roles also get the amounts line.
const BANDS = {
  GREEN: { bar: 'bg-success', box: 'border-success/30 bg-success-light', text: 'text-success', label: 'Good', note: 'Credit is healthy.' },
  ORANGE: { bar: 'bg-warning', box: 'border-warning/40 bg-warning-light', text: 'text-text-primary', label: 'Watch', note: 'Close to the limit — check internally before confirming.' },
  RED: { bar: 'bg-error', box: 'border-error/20 bg-error-light', text: 'text-error', label: 'Critical', note: 'Overdue or over the limit — ask internally before going ahead.' },
};

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function CreditBandBar({ credit, className = '' }) {
  const b = credit && BANDS[credit.band];
  if (!b) return null;
  return (
    <div className={`rounded-2xl border p-4 text-sm ${b.box} ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
        <b className={b.text}>Credit health: {b.label}</b>
        <span className="text-xs text-text-secondary">{b.note}</span>
      </div>
      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white" role="meter" aria-valuenow={credit.usedPct} aria-valuemin={0} aria-valuemax={100} aria-label="Credit used">
        <div className={`h-full rounded-full ${b.bar}`} style={{ width: `${Math.max(4, credit.usedPct)}%` }} />
      </div>
      {credit.limit > 0 && (
        <p className="mt-2 text-xs text-text-secondary">
          Used {inr(credit.used)} of {inr(credit.limit + (credit.extra || 0))} · available {inr(credit.available)}
          {credit.pending > 0 && ` · after open orders ${inr(credit.availableAfterPending)}`}
          {credit.overdueAmount > 0 && ` · ${inr(credit.overdueAmount)} overdue`}
        </p>
      )}
    </div>
  );
}
