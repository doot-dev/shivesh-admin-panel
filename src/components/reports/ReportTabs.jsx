import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import reportService, { saveBlob } from '../../services/reportService';

/**
 * Phase 1B Reports tabs (docs/workflow-crosscheck/08-client-analytics.md):
 * Payment behaviour · Collections · Order patterns · Accounts & Tax exports.
 * All numbers come from the server (GET /reports/analytics) — v1 uses tables and
 * CSS bars; no chart library.
 */
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
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
  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 items-center mb-3 text-sm">
        Sort by
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded px-2 py-1">
          <option value="outstanding">Outstanding</option>
          <option value="avgDaysPastDue">Days late</option>
          <option value="dso">DSO</option>
          <option value="billed">Billed</option>
        </select>
      </div>
      <table className="min-w-full bg-white border rounded-lg">
        <thead className="bg-gray-50"><tr>
          <Th>Client</Th><Th>Billed</Th><Th>Collected</Th><Th>Outstanding</Th><Th>Avg days to pay</Th>
          <Th>Avg days late</Th><Th>On-time %</Th><Th>DSO</Th><Th>Oldest open bill</Th>
        </tr></thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.clientId} className="border-t">
              <Td className="font-medium">{c.companyName}</Td>
              <Td>{inr(c.payment.billed)}</Td><Td>{inr(c.payment.collected)}</Td>
              <Td className={c.payment.outstanding > 0 ? 'text-red-700 font-medium' : ''}>{inr(c.payment.outstanding)}</Td>
              <Td>{dash(c.payment.avgDaysToPay, ' d')}</Td><Td>{dash(c.payment.avgDaysPastDue, ' d')}</Td>
              <Td>{dash(c.payment.onTimePct, '%')}</Td><Td>{dash(c.payment.dso, ' d')}</Td>
              <Td>{c.payment.oldestOpenBill ? `${c.payment.oldestOpenBill.billNo} · ${c.payment.oldestOpenBill.days} d` : '—'}</Td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-xs text-gray-500 mt-2">Approximate until payment records arrive in Phase 2 — a bill counts as paid on its paid date.</p>
    </div>
  );
}

export function CollectionsTab() {
  const { data, error } = useAnalytics();
  if (!data) return <Loading error={error} />;
  const p = data.totals.payment;
  const max = Math.max(1, ...p.trend.map((m) => Math.max(m.billed, m.collected)));
  const ages = [['Not due', p.pendingByAge.notDue], ['1–30', p.pendingByAge.d1_30], ['31–60', p.pendingByAge.d31_60], ['61–90', p.pendingByAge.d61_90], ['90+', p.pendingByAge.d90plus]];
  const ageMax = Math.max(1, ...ages.map((a) => a[1]));
  const top = [...data.clients].sort((a, b) => (b.payment.pendingByAge.d90plus + b.payment.pendingByAge.d61_90 + b.payment.pendingByAge.d31_60 + b.payment.pendingByAge.d1_30) - (a.payment.pendingByAge.d90plus + a.payment.pendingByAge.d61_90 + a.payment.pendingByAge.d31_60 + a.payment.pendingByAge.d1_30)).slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[['Billed', inr(p.billed)], ['Collected', inr(p.collected)], ['Outstanding', inr(p.outstanding)], ['DSO', dash(p.dso, ' days')]].map(([l, v]) => (
          <div key={l} className="bg-white border rounded-lg p-3"><div className="text-xs text-gray-500">{l}</div><div className="text-lg font-semibold">{v}</div></div>
        ))}
      </div>
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Billed vs collected — last 12 months</h4>
        {p.trend.map((m) => (
          <div key={m.month} className="grid grid-cols-[70px_1fr_110px] gap-2 items-center mb-1 text-xs">
            <span>{m.month}</span>
            <div className="space-y-0.5"><Bar value={m.billed} max={max} /><Bar value={m.collected} max={max} color="bg-green-500" /></div>
            <span className="text-right">{inr(m.billed)} / {inr(m.collected)}</span>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2">Blue = billed, green = collected.</p>
      </div>
      <div className="bg-white border rounded-lg p-4">
        <h4 className="text-sm font-semibold mb-3">Pending by age (days past due)</h4>
        {ages.map(([l, v]) => (
          <div key={l} className="grid grid-cols-[70px_1fr_110px] gap-2 items-center mb-1 text-xs"><span>{l}</span><Bar value={v} max={ageMax} color="bg-red-500" /><span className="text-right">{inr(v)}</span></div>
        ))}
      </div>
      <div className="bg-white border rounded-lg p-4 overflow-x-auto">
        <h4 className="text-sm font-semibold mb-3">10 most overdue clients</h4>
        <table className="min-w-full"><thead><tr><Th>Client</Th><Th>1–30</Th><Th>31–60</Th><Th>61–90</Th><Th>90+</Th></tr></thead>
          <tbody>{top.map((c) => (<tr key={c.clientId} className="border-t"><Td>{c.companyName}</Td><Td>{inr(c.payment.pendingByAge.d1_30)}</Td><Td>{inr(c.payment.pendingByAge.d31_60)}</Td><Td>{inr(c.payment.pendingByAge.d61_90)}</Td><Td className="text-red-700">{inr(c.payment.pendingByAge.d90plus)}</Td></tr>))}</tbody>
        </table>
      </div>
    </div>
  );
}

export function OrderPatternsTab() {
  const { data, error } = useAnalytics();
  if (!data) return <Loading error={error} />;
  const o = data.totals.orders;
  const vmax = Math.max(1, ...o.trend.map((m) => m.volume));
  const quiet = data.clients.filter((c) => c.orders.goingQuiet);
  const byVolume = [...data.clients].sort((a, b) => b.orders.volume - a.orders.volume).slice(0, 10);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[['Orders', o.orders], ['Volume', o.volume], ['Avg order', dash(o.avgOrderSize)], ['Cancel rate', dash(o.cancelRatePct, '%')], ['Trucks rejected at site', `${o.siteRejections.rejected} / ${o.siteRejections.trucks}`]].map(([l, v]) => (
          <div key={l} className="bg-white border rounded-lg p-3"><div className="text-xs text-gray-500">{l}</div><div className="text-lg font-semibold">{v}</div></div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3">Volume per month</h4>
          {o.trend.map((m) => (<div key={m.month} className="grid grid-cols-[70px_1fr_80px] gap-2 items-center mb-1 text-xs"><span>{m.month}</span><Bar value={m.volume} max={vmax} /><span className="text-right">{m.volume}</span></div>))}
        </div>
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3">Grade / product mix</h4>
          {o.gradeMix.slice(0, 12).map((g) => (<div key={g.name} className="grid grid-cols-[140px_1fr_60px] gap-2 items-center mb-1 text-xs"><span className="truncate">{g.name}</span><Bar value={g.volume} max={o.gradeMix[0]?.volume} color="bg-purple-500" /><span className="text-right">{g.volume}</span></div>))}
          <h4 className="text-sm font-semibold mt-4 mb-2">Site rejection reasons</h4>
          {Object.entries(o.siteRejections.reasons).length ? Object.entries(o.siteRejections.reasons).map(([r, n]) => <div key={r} className="text-xs">{r}: <b>{n}</b></div>) : <p className="text-xs text-gray-500">None yet</p>}
        </div>
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
