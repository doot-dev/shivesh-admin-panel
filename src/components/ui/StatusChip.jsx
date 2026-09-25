/**
 * Rounded status pill in the panel palette. Warning text stays dark (the
 * yellow is kept for the dot) so it passes contrast on its light fill.
 */
const TONES = {
  primary: ['bg-primary-light text-primary', 'bg-primary'],
  ok: ['bg-success-light text-success', 'bg-success'],
  warn: ['bg-warning-light text-text-primary', 'bg-warning'],
  err: ['bg-error-light text-error', 'bg-error'],
  muted: ['bg-background-hover text-text-secondary', 'bg-text-secondary'],
};

export const StatusChip = ({ tone = 'primary', dot = true, children, className = '' }) => {
  const [chip, dotCls] = TONES[tone] ?? TONES.primary;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${chip} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotCls}`} />}
      {children}
    </span>
  );
};

export default StatusChip;
