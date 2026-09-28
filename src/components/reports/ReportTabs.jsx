import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import reportService, { saveBlob } from '../../services/reportService';
import { Bars, ChartCard, Donut, Histogram, Kpis, RAMP_RED, RankBars, SERIES, STATUS, inrShort } from './Charts';

/**
 * Phase 1B Reports tabs (docs/workflow-crosscheck/08-client-analytics.md):
 * Payment behaviour · Collections · Order patterns · Accounts & Tax exports.
 * All numbers come from the server (GET /reports/analytics). Charts first (big,
 * labelled, see Charts.jsx), detail tables below.
 */
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
/** "2026-07" → "Jul 26". */
const monthLabel = (ym) => { const [y, m] = ym.split('-').map(Number); return `${new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'short' })} ${String(y).slice(2)}`; };
const dash = (v, suffix = '') => (v === null || v === undefined ? '—' : `${v}${suffix}`);

function useAnalytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    reportService.getAnalytics().then((r) => setData(r.data)).catch(() => setError('Could not load analytics'));
  }, []);
  return { data, error };
}

const Bar = ({ value, max, color = 'bg-blue-500' }) => (
  <div className="h-2 bg-gray-100 rounded w-full">
    <div className={`h-2 rounded ${color}`} style={{ width: `${max ? Math.min(100, (value / max) * 100) : 0}%` }} />
  </div>
);

const Th = ({ children }) => <th className="text-left text-xs font-semibold text-gray-600 px-3 py-2 whitespace-nowrap">{children}</th>;
const Td = ({ children, className = '' }) => <td className={`text-sm px-3 py-2 whitespace-nowrap ${className}`}>{children}</td>;

function Loading({ error }) {
  return <p className="text-sm text-gray-500 py-6">{error || 'Loading…'}</p>;
}

export function PaymentBehaviourTab() {
  const { data, error } = useAnalytics();
  const [sort, setSort] = useState('outstanding');
  if (!data) return <Loading error={error} />;
  const rows = [...data.clients].filter((c) => c.payment.billed > 0).sort((a, b) => (b.payment[sort] ?? -1) - (a.payment[sort] ?? -1));
  const t = data.totals.payment;
  const paying = data.clients.filter((c) => c.payment.billed > 0);
  const late = paying.filter((c) => c.payment.avgDaysLate != null);
  const topLate = [...late].sort((a, b) => b.payment.avgDaysLate - a.payment.avgDaysLate).slice(0, 8)
    .map((c) => ({ name: c.companyName, value: c.payment.avgDaysLate }));
  const modes = Object.entries(t.payments?.modes ?? {}).map(([name, value]) => ({ name: name.replace('_', ' '), value }));
  return (
    <div className="space-y-6">
      <Kpis items={[
        ['Avg days to pay', dash(t.avgDaysToPay, ' d')],
        ['Avg days late', dash(t.avgDaysLate, ' d'), t.avgDaysLate ? 'text-red-700' : ''],
        ['Paid bills on time', dash(t.onTimePct, '%')],
        ['Times paid late', dash(t.lateCount)],
      ]} />
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Who pays late" subtitle="Average days past the due date, late bills only (e.g. 25-day credit paid on day 45 = 20 days)">
          <RankBars data={topLate} format={(v) => `${v} d`} color={SERIES[1]} />
        </ChartCard>
        <ChartCard title="Clients by average days late" subtitle="How many clients fall in each band">
          <Histogram values={late.map((c) => c.payment.avgDaysLate)} edges={[1, 8, 16, 31, 61, Infinity]} what="Clients" />
        </ChartCard>
        <ChartCard title="On time vs late" subtitle="Paid bills on time, against bills paid late or still open past due">
          <Donut format={(v) => v} centerLabel="Bills" data={[
            { name: 'Paid on time', value: t.onTimeCount ?? 0, color: STATUS.good },
            { name: 'Late', value: t.lateCount ?? 0, color: STATUS.critical },
          ]} />
        </ChartCard>
        <ChartCard title="How clients pay" subtitle="Payments by mode">
          <Donut data={modes} centerLabel="Payments" />
        </ChartCard>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex gap-2 items-center mb-3 text-sm">
        Sort by
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-2 py-1">
          <option value="outstanding">Outstanding</option>
          <option value="avgDaysLate">Days late</option>
          <option value="lateCount">Times late</option>
          <option value="dso">DSO</option>
          <option value="billed">Billed</option>
        </select>
      </div>
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50"><tr>
          <Th>Client</Th><Th>Billed</Th><Th>Collected</Th><Th>Outstanding</Th><Th>Avg days to pay</Th>
          <Th>Avg days late</Th><Th>Times late</Th><Th>On-time %</Th><Th>DSO</Th><Th>Oldest open bill</Th>
        </tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.clientId} className="border-t">
              <Td className="font-medium">{c.companyName}</Td>
              <Td>{inr(c.payment.billed)}</Td><Td>{inr(c.payment.collected)}</Td>
              <Td className={c.payment.outstanding > 0 ? 'text-red-700 font-medium' : ''}>{inr(c.payment.outstanding)}</Td>
              <Td>{dash(c.payment.avgDaysToPay, ' d')}</Td><Td>{dash(c.payment.avgDaysLate, ' d')}</Td><Td>{dash(c.payment.lateCount)}</Td>
              <Td>{dash(c.payment.onTimePct, '%')}</Td><Td>{dash(c.payment.dso, ' d')}</Td>
              <Td>{c.payment.oldestOpenBill ? `${c.payment.oldestOpenBill.billNo} · ${c.payment.oldestOpenBill.days} d` : '—'}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

export function CollectionsTab() {
  const { data, error } = useAnalytics();
  if (!data) return <Loading error={error} />;
  const p = data.totals.payment;
  const ages = [['Not due', p.pendingByAge.notDue], ['1–30', p.pendingByAge.d1_30], ['31–60', p.pendingByAge.d31_60], ['61–90', p.pendingByAge.d61_90], ['90+', p.pendingByAge.d90plus]];
  const overdue = (c) => c.payment.pendingByAge.d90plus + c.payment.pendingByAge.d61_90 + c.payment.pendingByAge.d31_60 + c.payment.pendingByAge.d1_30;
  const top = data.clients.filter((c) => overdue(c) > 0).sort((a, b) => overdue(b) - overdue(a)).slice(0, 10);
  return (
    <div className="space-y-6">
      <Kpis items={[['Billed', inr(p.billed)], ['Collected', inr(p.collected)], ['Outstanding', inr(p.outstanding), p.outstanding ? 'text-red-700' : ''], ['DSO', dash(p.dso, ' days')]]} />
      <ChartCard title="Billed vs collected" subtitle="Last 12 months">
        <Bars data={p.trend.map((m) => ({ ...m, label: monthLabel(m.month) }))} xKey="label" format={inrShort}
          series={[{ key: 'billed', name: 'Billed', color: SERIES[0] }, { key: 'collected', name: 'Collected', color: SERIES[2] }]} height={380} />
      </ChartCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Pending by age" subtitle="Days past the due date — darker is older">
          <Donut format={inrShort} centerLabel="Pending" data={ages.map(([name, value], i) => ({ name, value, color: i === 0 ? STATUS.good : RAMP_RED[i] }))} />
        </ChartCard>
        <ChartCard title="Most overdue clients" subtitle="Everything past due, top 8">
          <RankBars format={inrShort} color={RAMP_RED[3]} data={top.slice(0, 8).map((c) => ({ name: c.companyName, value: overdue(c) }))} />
        </ChartCard>
      </div>
      <div className="bg-white border rounded-lg p-4 overflow-x-auto">
        <h4 className="text-sm font-semibold mb-3">Overdue by age, per client (top 10)</h4>
        <table className="min-w-full"><thead><tr><Th>Client</Th><Th>1–30</Th><Th>31–60</Th><Th>61–90</Th><Th>90+</Th></tr></thead>
          <tbody>{top.map((c) => (<tr key={c.clientId} className="border-t"><Td>{c.companyName}</Td><Td>{inr(c.payment.pendingByAge.d1_30)}</Td><Td>{inr(c.payment.pendingByAge.d31_60)}</Td><Td>{inr(c.payment.pendingByAge.d61_90)}</Td><Td className={c.payment.pendingByAge.d90plus ? 'text-red-700' : ''}>{inr(c.payment.pendingByAge.d90plus)}</Td></tr>))}
            {!top.length && <tr><Td>No client is overdue.</Td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}

export function OrderPatternsTab() {
  const { data, error } = useAnalytics();
  if (!data) return <Loading error={error} />;
  const o = data.totals.orders;
  const quiet = data.clients.filter((c) => c.orders.goingQuiet);
  const byVolume = [...data.clients].sort((a, b) => b.orders.volume - a.orders.volume).slice(0, 10);
  return (
    <div className="space-y-6">
      <Kpis items={[['Orders', o.orders], ['Volume', o.volume], ['Avg order', dash(o.avgOrderSize)], ['Cancel rate', dash(o.cancelRatePct, '%')]]} />
      <ChartCard title="Volume per month" subtitle="Last 12 months">
        <Bars data={o.trend.map((m) => ({ ...m, label: monthLabel(m.month) }))} xKey="label" series={[{ key: 'volume', name: 'Volume', color: SERIES[0] }]} height={360} />
      </ChartCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Grade / product mix" subtitle="Share of volume; smaller grades folded into Other">
          <Donut centerLabel="Volume" data={[
            ...o.gradeMix.slice(0, 7).map((g) => ({ name: g.name, value: g.volume })),
            ...(o.gradeMix.length > 7 ? [{ name: 'Other', value: o.gradeMix.slice(7).reduce((x, g) => x + g.volume, 0), color: STATUS.neutral }] : []),
          ]} />
        </ChartCard>
        <ChartCard title="Busiest days" subtitle="Orders by weekday">
          <Bars data={o.byWeekday} xKey="day" series={[{ key: 'orders', name: 'Orders', color: SERIES[6] }]} height={340} />
        </ChartCard>
        <ChartCard title="Top clients by volume">
          <RankBars data={[...data.clients].sort((x, y) => y.orders.volume - x.orders.volume).slice(0, 8).map((c) => ({ name: c.companyName, value: c.orders.volume }))} />
        </ChartCard>
        <ChartCard title="Site rejections" subtitle={`${o.siteRejections.rejected} of ${o.siteRejections.trucks} trucks rejected at site`}>
          <Donut centerLabel="Rejected" data={Object.entries(o.siteRejections.reasons).map(([name, value]) => ({ name, value }))} />
        </ChartCard>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4 overflow-x-auto">
          <h4 className="text-sm font-semibold mb-2">Top clients by volume</h4>
          <table className="min-w-full"><thead><tr><Th>Client</Th><Th>Orders</Th><Th>Volume</Th><Th>Last order</Th></tr></thead>
            <tbody>{byVolume.map((c) => (<tr key={c.clientId} className="border-t"><Td>{c.companyName}</Td><Td>{c.orders.orders}</Td><Td>{c.orders.volume}</Td><Td>{dash(c.orders.daysSinceLastOrder, ' d ago')}</Td></tr>))}</tbody></table>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-2">Clients going quiet</h4>
          <p className="text-xs text-gray-500 mb-2">Last 30 days under half their usual monthly volume.</p>
          {quiet.length ? quiet.map((c) => <div key={c.clientId} className="text-sm">{c.companyName} · last order {dash(c.orders.daysSinceLastOrder, ' days ago')}</div>) : <p className="text-sm text-gray-500">None</p>}
        </div>
      </div>
    </div>
  );
}

const REGISTERS = [
  ['sales', 'R1 Sales register'], ['documents', 'R2 Document summary'], ['outstanding', 'R3 Outstanding & ageing'],
  ['challans', 'R5 Delivery & challan register'], ['exceptions', 'R6 Exceptions'], ['audit', 'R7 Audit trail'], ['orders', 'R13 Order register'],
];

export function AccountsTaxTab() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [busy, setBusy] = useState('');
  const params = { from: from || undefined, to: to || undefined };
  const period = from || to ? `${from || 'start'}_to_${to || 'today'}` : 'this-FY';

  const run = async (key, label, fn) => {
    setBusy(key);
    try { saveBlob(await fn(), `Shivesh_${label.replace(/\s+/g, '-')}_${period}.xlsx`); }
    catch (e) { toast.error(e.response?.status === 403 ? 'You need the Reports → Export permission' : 'Export failed'); }
    finally { setBusy(''); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 items-center text-sm">
        Invoice / order date
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="border rounded px-2 py-1" />
        to
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="border rounded px-2 py-1" />
        <span className="text-xs text-gray-500">(blank = this financial year)</span>
      </div>
      <button type="button" disabled={!!busy} onClick={() => run('pack', 'CA-Pack', () => reportService.exportCaPack(params))}
        className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-50">
        {busy === 'pack' ? 'Building…' : 'Download full CA Pack (all registers)'}
      </button>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
        {REGISTERS.map(([key, label]) => (
          <button key={key} type="button" disabled={!!busy} onClick={() => run(key, label, () => reportService.exportRegister(key, params))}
            className="text-left px-3 py-2 border rounded-lg bg-white text-sm hover:border-primary disabled:opacity-50">
            {busy === key ? 'Building…' : label}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500">The Exceptions sheet should be empty before the pack goes to the CA.</p>
    </div>
  );
}
