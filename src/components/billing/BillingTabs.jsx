import { useEffect, useState } from 'react';
import paymentService from '../../services/paymentService';

const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const dt = (v) => (v ? new Date(v).toLocaleString('en-IN') : '—');

/** Every payment across clients (W21). Recording happens on the client's Account tab. */
export function PaymentsTab() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState({ from: '', to: '', mode: '' });
  useEffect(() => {
    const t = setTimeout(() => {
      paymentService.list({ from: q.from || undefined, to: q.to || undefined, mode: q.mode || undefined })
        .then((r) => setRows(r.data)).catch(() => setRows([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  const active = (rows || []).filter((p) => p.status === 'ACTIVE');
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <input type="date" value={q.from} onChange={(e) => setQ({ ...q, from: e.target.value })} className="border rounded px-2 py-1" />
        to <input type="date" value={q.to} onChange={(e) => setQ({ ...q, to: e.target.value })} className="border rounded px-2 py-1" />
        <select value={q.mode} onChange={(e) => setQ({ ...q, mode: e.target.value })} className="border rounded px-2 py-1">
          <option value="">All modes</option>{['CHEQUE', 'ONLINE', 'BANK_TRANSFER', 'CASH', 'OTHER'].map((m) => <option key={m}>{m}</option>)}
        </select>
        <span className="text-gray-600">{active.length} payment(s) · {inr(active.reduce((s, p) => s + p.amount, 0))} received</span>
      </div>
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr className="text-left text-xs text-gray-600"><th className="p-2">Receipt</th><th>Date</th><th>Client</th><th>Mode</th><th>Reference</th><th className="text-right">Amount</th><th className="text-right">Advance</th><th>Applied to</th><th>Status</th></tr></thead>
          <tbody>{(rows || []).map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-2 font-medium">{p.receiptNo}</td><td>{new Date(p.receivedOn).toLocaleDateString('en-IN')}</td><td>{p.client.companyName}</td>
              <td>{p.mode}</td><td>{p.reference}</td><td className="text-right">{inr(p.amount)}</td><td className="text-right">{p.unallocated ? inr(p.unallocated) : ''}</td>
              <td className="text-xs">{p.allocations.filter((a) => !a.isReversed).map((a) => `${a.bill.billNo} ${inr(a.amount)}`).join(' · ')}</td>
              <td>{p.status === 'REVERSED' ? <span className="text-red-600">Reversed</span> : 'Active'}</td>
            </tr>
          ))}</tbody>
        </table>
        {rows === null && <p className="p-3 text-sm text-gray-500">Loading…</p>}
      </div>
    </div>
  );
}

/** W33: every billing action with the user who did it. */
export function BillingLogTab() {
  const [rows, setRows] = useState(null);
  const [q, setQ] = useState({ from: '', to: '', event: '', billNo: '' });
  useEffect(() => {
    const t = setTimeout(() => {
      paymentService.billingLog(Object.fromEntries(Object.entries(q).filter(([, v]) => v)))
        .then((r) => setRows(r.data)).catch(() => setRows([]));
    }, 300);
    return () => clearTimeout(t);
  }, [q]);
  const EVENTS = ['BILL_GENERATED', 'BILL_CANCELLED', 'PAYMENT_RECORDED', 'ADVANCE_CREATED', 'ADVANCE_ADJUSTED', 'PAYMENT_REVERSED', 'CREDIT_LIMIT_CHANGED', 'EXTRA_CREDIT_GRANTED', 'EXTRA_CREDIT_REVOKED', 'CREDIT_HOLD_RELEASED', 'CREDIT_HOLD_CANCELLED', 'ORDER_DELETED'];
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center text-sm">
        <input type="date" value={q.from} onChange={(e) => setQ({ ...q, from: e.target.value })} className="border rounded px-2 py-1" />
        to <input type="date" value={q.to} onChange={(e) => setQ({ ...q, to: e.target.value })} className="border rounded px-2 py-1" />
        <select value={q.event} onChange={(e) => setQ({ ...q, event: e.target.value })} className="border rounded px-2 py-1">
          <option value="">All billing events</option>{EVENTS.map((ev) => <option key={ev}>{ev}</option>)}
        </select>
        <input placeholder="Bill no." value={q.billNo} onChange={(e) => setQ({ ...q, billNo: e.target.value })} className="border rounded px-2 py-1" />
      </div>
      <div className="overflow-x-auto bg-white border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50"><tr className="text-left text-xs text-gray-600"><th className="p-2">When</th><th>User (id)</th><th>Event</th><th>What happened</th></tr></thead>
          <tbody>{(rows || []).map((a) => (
            <tr key={a.id} className="border-t align-top">
              <td className="p-2 whitespace-nowrap">{dt(a.createdAt)}</td>
              <td className="whitespace-nowrap">{a.createdBy ? `${a.createdBy.name} (${a.createdBy.id})` : a.actorType || '—'}</td>
              <td className="whitespace-nowrap text-xs">{a.event || a.title}</td>
              <td>{a.description}</td>
            </tr>
          ))}</tbody>
        </table>
        {rows === null && <p className="p-3 text-sm text-gray-500">Loading…</p>}
      </div>
    </div>
  );
}
