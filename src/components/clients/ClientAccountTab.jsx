import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';
import usePermission from '../../hooks/usePermission';

/**
 * Client → Account (Phase 2): credit N/M, extra credit, unpaid bills with paid
 * and pending, Record payment (client / project / selected bills, oldest first),
 * the D17 "not adjusted" prompt, payments with Adjust / Reverse, and the ledger.
 */
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
const d = (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '—');
const errMsg = (e, f) => e.response?.data?.message || f;
const MODES = ['CHEQUE', 'ONLINE', 'BANK_TRANSFER', 'CASH', 'OTHER'];

const Box = ({ title, children, action }) => (
  <div className="bg-white border rounded-lg p-4">
    <div className="flex items-center justify-between mb-3"><h4 className="text-sm font-semibold">{title}</h4>{action}</div>
    {children}
  </div>
);
const Stat = ({ label, value, tone = '' }) => (
  <div className="border rounded-lg p-3"><div className="text-xs text-gray-500">{label}</div><div className={`text-base font-semibold ${tone}`}>{value}</div></div>
);

export default function ClientAccountTab({ clientId }) {
  const { can } = usePermission();
  const [acc, setAcc] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showPay, setShowPay] = useState(false);

  const load = useCallback(async () => {
    if (!clientId) return;
    try { setAcc((await paymentService.account(clientId)).data); } catch (e) { setAcc(false); toast.error(errMsg(e, 'Could not load account')); }
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  if (acc === null) return <p className="text-sm text-gray-500 py-4">Loading…</p>;
  if (acc === false) return <p className="text-sm text-gray-500 py-4">You need the Payments or Billing permission.</p>;
  const c = acc.credit;

  const editCredit = async () => {
    const limit = window.prompt('Credit limit ₹ (N):', acc.client.creditLimit ?? '');
    if (limit === null) return;
    const days = window.prompt('Credit period in days (M):', acc.client.creditDays ?? '');
    if (days === null) return;
    try { await paymentService.setCredit(clientId, { creditLimit: limit, creditDays: days }); toast.success('Credit updated'); load(); }
    catch (e) { toast.error(errMsg(e, 'Update failed')); }
  };
  const addExtra = async () => {
    const amount = window.prompt('Extra credit ₹ (one-time, no end date, gone once used):');
    if (!amount) return;
    const reason = window.prompt('Reason:');
    if (!reason) return;
    try { await paymentService.grantExtra(clientId, { amount, reason }); toast.success('Extra credit added'); load(); }
    catch (e) { toast.error(errMsg(e, 'Could not add')); }
  };
  const revoke = async (x) => {
    const reason = window.prompt('Revoke the unused part — reason:');
    if (!reason) return;
    try { await paymentService.revokeExtra(clientId, x.id, reason); toast.success('Revoked'); load(); }
    catch (e) { toast.error(errMsg(e, 'Could not revoke')); }
  };
  const reverse = async (p) => {
    const reason = window.prompt(`Reverse ${p.receiptNo} (₹${p.amount})? Reason (e.g. cheque bounced):`);
    if (!reason) return;
    try { await paymentService.reverse(p.id, reason); toast.success('Payment reversed'); load(); }
    catch (e) { toast.error(errMsg(e, 'Could not reverse')); }
  };
  const adjust = async (p) => {
    if (!selected.length) return toast.info('Tick the bills to adjust the advance against, then press Adjust.');
    try { const r = await paymentService.adjust(p.id, { billIds: selected }); toast.success(`Adjusted — ₹${r.data.unallocated} still in advance`); setSelected([]); load(); }
    catch (e) { toast.error(errMsg(e, 'Could not adjust')); }
  };

  return (
    <div className="space-y-4">
      <Box title="Credit" action={can('clients', 'update') && <button className="text-xs text-primary hover:underline" onClick={editCredit}>Edit limit / days</button>}>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <Stat label="Limit (N)" value={c.limit ? inr(c.limit) : 'Not set'} />
          <Stat label="Days (M)" value={c.creditDays ?? '—'} />
          <Stat label="Extra credit" value={`${inr(c.extraUnused)} unused${c.extraInUse ? ` · ${inr(c.extraInUse)} in use` : ''}`} />
          <Stat label="Used" value={inr(c.used)} />
          <Stat label="Available" value={inr(c.available)} tone={c.available < 0 ? 'text-red-700' : 'text-green-700'} />
          <Stat label="Overdue" value={inr(c.overdueAmount)} tone={c.overdueAmount ? 'text-red-700' : ''} />
          <Stat label="Advance" value={inr(c.advance)} />
        </div>
        {c.flag !== 'OK' && <p className="text-xs text-red-700 mt-2">{c.flag === 'OVERDUE' ? 'Overdue — new orders are held for approval.' : 'Over limit — new orders are held for approval.'}</p>}
      </Box>

      <Box title="Extra credit" action={can('orders', 'approve') && <button className="text-xs text-primary hover:underline" onClick={addExtra}>+ Add extra credit</button>}>
        {acc.extras.length ? acc.extras.map((x) => (
          <div key={x.id} className="flex items-center justify-between text-sm border-t py-1">
            <span>{inr(x.amount)} · {x.reason} · {d(x.createdAt)} {x.status === 'REVOKED' && <span className="text-gray-500">(revoked, {inr(x.revokedAmount)} unused removed)</span>}</span>
            {x.status === 'ACTIVE' && can('orders', 'approve') && <button className="text-xs text-red-600 hover:underline" onClick={() => revoke(x)}>Revoke unused</button>}
          </div>
        )) : <p className="text-sm text-gray-500">None</p>}
      </Box>

      <Box title={`Unpaid bills (${acc.bills.length})`} action={can('payments', 'create') && <button className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm" onClick={() => setShowPay(true)}>Record payment</button>}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500"><th className="p-2"></th><th>Bill</th><th>Project</th><th>Date</th><th>Due</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th className="text-right">Pending</th><th>Status</th></tr></thead>
            <tbody>
              {acc.bills.map((b) => {
                const late = b.dueDate && new Date(b.dueDate) < new Date() ? Math.floor((new Date() - new Date(b.dueDate)) / 864e5) : 0;
                return (
                  <tr key={b.id} className="border-t">
                    <td className="p-2"><input type="checkbox" checked={selected.includes(b.billNo)} onChange={(e) => setSelected((s) => (e.target.checked ? [...s, b.billNo] : s.filter((x) => x !== b.billNo)))} /></td>
                    <td>{b.billNo}</td><td>{b.projectName}</td><td>{d(b.issueDate)}</td><td>{d(b.dueDate)}</td>
                    <td className="text-right">{inr(b.amount)}</td><td className="text-right">{inr(b.paid)}</td><td className="text-right font-medium">{inr(b.balance)}</td>
                    <td>{b.status}{late > 0 && <span className="text-xs text-red-600"> · {late}d overdue</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>

      {showPay && <RecordPayment clientId={clientId} bills={acc.bills} selected={selected} onClose={() => setShowPay(false)} onDone={() => { setShowPay(false); setSelected([]); load(); }} />}

      <Box title={`Payments (${acc.payments.length})`}>
        {acc.payments.length ? acc.payments.map((p) => (
          <div key={p.id} className="border-t py-2 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <b>{p.receiptNo}</b><span>{d(p.receivedOn)}</span><span>{inr(p.amount)}</span><span>{p.mode}{p.reference ? ` · ${p.reference}` : ''}</span>
              {p.status === 'REVERSED' ? <span className="text-red-600 text-xs">Reversed — {p.reversalReason}</span> : (
                <>
                  {p.unallocated > 0 && <span className="text-amber-700 text-xs">Advance {inr(p.unallocated)}</span>}
                  {p.unallocated > 0 && can('payments', 'create') && <button className="text-xs text-primary hover:underline" onClick={() => adjust(p)}>Adjust from advance → ticked bills</button>}
                  {can('payments', 'delete') && <button className="text-xs text-red-600 hover:underline" onClick={() => reverse(p)}>Reverse</button>}
                </>
              )}
            </div>
            <div className="text-xs text-gray-600">{p.allocations.filter((a) => !a.isReversed).map((a) => `${a.bill.billNo} ${inr(a.amount)}`).join(' · ') || 'Not allocated'}</div>
          </div>
        )) : <p className="text-sm text-gray-500">No payments yet</p>}
      </Box>

      <Box title="Ledger" action={<button className="text-xs text-primary hover:underline" onClick={async () => setLedger((await paymentService.ledger(clientId)).data)}>{ledger ? 'Refresh' : 'Show ledger'}</button>}>
        {ledger && (
          <table className="min-w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500"><th>Date</th><th>Ref</th><th>Detail</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr></thead>
            <tbody>{ledger.map((r, i) => (
              <tr key={i} className="border-t"><td>{d(r.date)}</td><td>{r.ref}</td><td>{r.detail}</td><td className="text-right">{r.debit ? inr(r.debit) : ''}</td><td className="text-right">{r.credit ? inr(r.credit) : ''}</td><td className="text-right font-medium">{inr(r.balance)}</td></tr>
            ))}</tbody>
          </table>
        )}
      </Box>
    </div>
  );
}

function RecordPayment({ clientId, bills, selected, onClose, onDone }) {
  const projects = useMemo(() => [...new Map(bills.map((b) => [b.projectId, b.projectName])).entries()], [bills]);
  const [f, setF] = useState({ amount: '', receivedOn: new Date().toISOString().slice(0, 10), mode: 'CHEQUE', reference: '', bankName: '', chequeDate: '', tdsAmount: '', notes: '', scope: selected.length ? 'BILLS' : 'CLIENT', projectId: projects[0]?.[0] || '' });
  const [plan, setPlan] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => { setF((x) => ({ ...x, [k]: v })); setPlan(null); };
  const body = (extra = {}) => ({ clientId, ...f, billIds: f.scope === 'BILLS' ? selected : [], projectId: f.scope === 'PROJECT' ? f.projectId : undefined, ...extra });

  const preview = async () => {
    try { setPlan((await paymentService.preview(body())).data); } catch (e) { toast.error(errMsg(e, 'Preview failed')); }
  };
  const save = async (moveRemainderToAdvance = false) => {
    setSaving(true);
    try { const r = await paymentService.record(body({ moveRemainderToAdvance })); toast.success(r.message); onDone(); }
    catch (e) { toast.error(errMsg(e, 'Could not record')); }
    finally { setSaving(false); }
  };

  const needsRef = ['CHEQUE', 'ONLINE', 'BANK_TRANSFER'].includes(f.mode);
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
      <div className="flex justify-between"><h4 className="text-sm font-semibold">Record payment</h4><button className="text-xs text-gray-500" onClick={onClose}>Close</button></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
        <label>Amount ₹<input className="w-full border rounded px-2 py-1" type="number" value={f.amount} onChange={(e) => set('amount', e.target.value)} /></label>
        <label>Received on<input className="w-full border rounded px-2 py-1" type="date" value={f.receivedOn} onChange={(e) => set('receivedOn', e.target.value)} /></label>
        <label>Mode<select className="w-full border rounded px-2 py-1" value={f.mode} onChange={(e) => set('mode', e.target.value)}>{MODES.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>{f.mode === 'CHEQUE' ? 'Cheque no.' : 'UTR / transaction id'}{needsRef && ' *'}<input className="w-full border rounded px-2 py-1" value={f.reference} onChange={(e) => set('reference', e.target.value)} /></label>
        <label>Bank<input className="w-full border rounded px-2 py-1" value={f.bankName} onChange={(e) => set('bankName', e.target.value)} /></label>
        {f.mode === 'CHEQUE' && <label>Cheque date<input className="w-full border rounded px-2 py-1" type="date" value={f.chequeDate} onChange={(e) => set('chequeDate', e.target.value)} /></label>}
        <label>TDS ₹ (optional)<input className="w-full border rounded px-2 py-1" type="number" value={f.tdsAmount} onChange={(e) => set('tdsAmount', e.target.value)} /></label>
        <label className="col-span-2">Notes<input className="w-full border rounded px-2 py-1" value={f.notes} onChange={(e) => set('notes', e.target.value)} /></label>
      </div>
      <div className="flex flex-wrap gap-4 text-sm items-center">
        Apply to:
        <label><input type="radio" checked={f.scope === 'CLIENT'} onChange={() => set('scope', 'CLIENT')} /> Oldest bills, all projects</label>
        <label><input type="radio" checked={f.scope === 'PROJECT'} onChange={() => set('scope', 'PROJECT')} /> One project</label>
        {f.scope === 'PROJECT' && <select className="border rounded px-2 py-1" value={f.projectId} onChange={(e) => set('projectId', e.target.value)}>{projects.map(([id, n]) => <option key={id} value={id}>{n}</option>)}</select>}
        <label><input type="radio" checked={f.scope === 'BILLS'} onChange={() => set('scope', 'BILLS')} /> Ticked bills ({selected.length})</label>
      </div>
      <button className="px-3 py-1.5 rounded-lg border border-primary text-primary text-sm" onClick={preview}>Preview allocation</button>
      {plan && (
        <div className="text-sm bg-white border rounded p-3">
          {plan.allocations.map((a) => <div key={a.billId}>{a.billNo}: {inr(a.amount)}</div>)}
          {plan.unallocated > 0 ? (
            <div className="mt-2 text-amber-800">
              <b>{inr(plan.unallocated)} not adjusted.</b> Tick more bills (and preview again), or keep it as the client's extra credit (advance).
              <div className="mt-2 flex gap-2">
                <button disabled={saving} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white" onClick={() => save(true)}>Save and move {inr(plan.unallocated)} to extra credit</button>
              </div>
            </div>
          ) : (
            <button disabled={saving} className="mt-2 px-3 py-1.5 rounded-lg bg-primary text-white" onClick={() => save(false)}>{saving ? 'Saving…' : 'Save payment'}</button>
          )}
        </div>
      )}
    </div>
  );
}
