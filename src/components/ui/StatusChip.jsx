import { toneFor, statusLabel } from '../../utils/labels';

/**
 * Badges, in the panel palette. Three shapes, each soft (tinted) or solid:
 *
 *   <StatusChip tone="ok">Paid</StatusChip>          ● Paid        (pill + dot)
 *   <StatusChip status="COMPLETED" />                tone + label from the status
 *   <CountBadge tone="err">5</CountBadge>            (5)
 *   <DotBadge tone="warn" />                         ●
 *
 * variant="solid" fills with the tone colour. Warning keeps dark text in both
 * variants: white or amber text on the palette's amber fails contrast.
 */
const SOFT = {
  primary: ['bg-primary-light text-primary', 'bg-primary'],
  ok: ['bg-success-light text-success', 'bg-success'],
  warn: ['bg-warning-light text-text-primary', 'bg-warning'],
  err: ['bg-error-light text-error', 'bg-error'],
  muted: ['bg-stroke-alt/30 text-text-primary', 'bg-text-secondary'],
};
const SOLID = {
  primary: ['bg-primary text-white', 'bg-white/80'],
  ok: ['bg-success text-white', 'bg-white/80'],
  warn: ['bg-warning text-text-primary', 'bg-text-primary/70'],
  err: ['bg-error text-white', 'bg-white/80'],
  muted: ['bg-text-secondary text-white', 'bg-white/80'],
};
const SIZE = {
  sm: 'h-5 gap-1.5 px-2 text-[11px]',
  md: 'h-6 gap-1.5 px-2.5 text-xs',
  lg: 'h-7 gap-2 px-3 text-[13px]',
};

export const StatusChip = ({ tone, status, variant = 'soft', size = 'md', dot = true, children, className = '' }) => {
  const t = tone ?? toneFor(status);
  const [chip, dotCls] = (variant === 'solid' ? SOLID : SOFT)[t] ?? SOFT.primary;
  return (
    <span className={`inline-flex shrink-0 items-center whitespace-nowrap rounded-full font-semibold leading-none ${SIZE[size] ?? SIZE.md} ${chip} ${className}`}>
      {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotCls}`} aria-hidden="true" />}
      {children ?? statusLabel(status)}
    </span>
  );
};

export const CountBadge = ({ tone = 'primary', variant = 'soft', children, className = '' }) => {
  const [chip] = (variant === 'solid' ? SOLID : SOFT)[tone] ?? SOFT.primary;
  return (
    <span className={`inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums leading-none ${chip} ${className}`}>
      {children}
    </span>
  );
};

export const DotBadge = ({ tone = 'primary', label, className = '' }) => (
  <span role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
    className={`inline-block h-2 w-2 shrink-0 rounded-full ${SOFT[tone]?.[1] ?? SOFT.primary[1]} ${className}`} />
);

export default StatusChip;
