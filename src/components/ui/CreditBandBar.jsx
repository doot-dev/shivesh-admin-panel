// Credit score gauge (2026-09-28): four segments green → yellow → orange → red
// and a marker at `credit.position` (0–100). Warns only, never blocks an order.
// `credit` is GET /reports/clients/:id/credit. People without payments.view
// get { band, usedPct, position }; money roles also get the amounts line.
const SEGMENTS = [
  { band: 'GREEN', label: 'Good', color: '#16a34a' },
  { band: 'YELLOW', label: 'Fair', color: '#facc15' },
  { band: 'ORANGE', label: 'Watch', color: '#f97316' },
  { band: 'RED', label: 'Critical', color: '#dc2626' },
];
const NOTES = {
  GREEN: 'Credit is healthy.',
  YELLOW: 'Half the limit is in use.',
  ORANGE: 'Close to the limit — check internally before confirming.',
  RED: 'Overdue or over the limit — ask internally before going ahead.',
};

const inr = (n) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export default function CreditBandBar({ credit, className = '' }) {
  // creditScore.view brings the gauge (band), creditAmounts.view the ₹ line (limit).
  const seg = credit && SEGMENTS.find((s) => s.band === credit.band);
  const hasAmounts = credit?.limit !== undefined;
  if (!seg && !hasAmounts) return null;
  const pos = Math.min(98, Math.max(2, credit.position ?? 50));
  return (
    <div className={`rounded-2xl border border-gray-200 bg-white p-4 text-sm ${className}`}>
      {seg && <>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <b className="text-text-primary">Credit score: <span style={{ color: seg.color === '#facc15' ? '#a16207' : seg.color }}>{seg.label}</span></b>
        <span className="text-xs text-text-secondary">{NOTES[seg.band]}</span>
      </div>
      <div className="relative mt-5" role="meter" aria-valuenow={pos} aria-valuemin={0} aria-valuemax={100} aria-label={`Credit score: ${seg.label}`}>
        <span className="absolute -top-3 -translate-x-1/2 border-x-[7px] border-t-[9px] border-x-transparent border-t-gray-900" style={{ left: `${pos}%` }} />
        <div className="flex h-3 overflow-hidden rounded-full">
          {SEGMENTS.map((s) => <div key={s.band} className="flex-1" style={{ background: s.color, opacity: s.band === seg.band ? 1 : 0.45 }} />)}
        </div>
        <div className="mt-1 grid grid-cols-4 text-center text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
          {SEGMENTS.map((s) => <span key={s.band} className={s.band === seg.band ? 'text-text-primary' : ''}>{s.label}</span>)}
        </div>
      </div>
      </>}
      {hasAmounts && credit.limit > 0 && (
        <p className="mt-2 text-xs text-text-secondary">
          Used {inr(credit.used)} of {inr(credit.limit + (credit.extra || 0))} · available {inr(credit.available)}
          {credit.pending > 0 && ` · after open orders ${inr(credit.availableAfterPending)}`}
          {credit.overdueAmount > 0 && ` · ${inr(credit.overdueAmount)} overdue`}
        </p>
      )}
    </div>
  );
}
