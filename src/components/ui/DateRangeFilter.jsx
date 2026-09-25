import { CalendarRange, RotateCcw } from 'lucide-react';
import { defaultWindow, shiftDays, windowLabel } from '../../utils/dateWindow';

/**
 * From / To date range for heavy lists (orders, bills, cube tests). The list
 * only fetches this window from the server. Reset goes back to the default:
 * last 7 days → next 10 days. Quick picks cover the common "look further" cases.
 */
const QUICK = [
  { label: 'Today', range: () => ({ from: shiftDays(0), to: shiftDays(0) }) },
  { label: 'Last 30 days', range: () => ({ from: shiftDays(-30), to: shiftDays(0) }) },
  {
    label: 'This month',
    range: () => {
      const n = new Date();
      return { from: shiftDays(1 - n.getDate()), to: shiftDays(new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate() - n.getDate()) };
    },
  },
  { label: 'All time', range: () => ({ from: '', to: '' }) },
];

const inputCls = 'h-10 w-full min-w-0 rounded-xl border border-primary-light bg-white px-3 text-sm text-text-primary focus:border-border focus:outline-none sm:w-[150px]';

export default function DateRangeFilter({ value, onChange, label = 'Date', count }) {
  const isDefault = (() => { const d = defaultWindow(); return value.from === d.from && value.to === d.to; })();
  const set = (patch) => {
    const next = { ...value, ...patch };
    // Keep the range the right way round if someone picks To before From.
    if (next.from && next.to && next.from > next.to) {
      if ('from' in patch) next.to = next.from;
      else next.from = next.to;
    }
    onChange(next);
  };

  return (
    <div className="sv-card flex flex-col gap-3 p-3 sm:p-4 lg:flex-row lg:items-end lg:gap-4">
      <div className="grid grid-cols-2 gap-3 sm:flex sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-secondary">{label} from</span>
          <input type="date" className={inputCls} value={value.from} max={value.to || undefined} onChange={(e) => set({ from: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-text-secondary">{label} to</span>
          <input type="date" className={inputCls} value={value.to} min={value.from || undefined} onChange={(e) => set({ to: e.target.value })} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {QUICK.map((q) => (
          <button key={q.label} type="button" onClick={() => onChange(q.range())}
            className="h-9 rounded-full border border-primary-light bg-white px-3 text-[13px] font-semibold text-text-secondary transition-colors hover:bg-primary-light hover:text-primary">
            {q.label}
          </button>
        ))}
        <button type="button" onClick={() => onChange(defaultWindow())} disabled={isDefault}
          title="Last 7 days to next 10 days"
          className="flex h-9 items-center gap-1.5 rounded-full bg-primary px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-second disabled:bg-primary-light disabled:text-primary">
          <RotateCcw size={14} />Reset
        </button>
      </div>

      <div className="flex items-center gap-2 text-[13px] text-text-secondary lg:ml-auto">
        <CalendarRange size={16} className="shrink-0 text-primary" />
        <span><b className="font-semibold text-text-primary">{windowLabel(value)}</b>{typeof count === 'number' ? ` · ${count} found` : ''}</span>
      </div>
    </div>
  );
}
