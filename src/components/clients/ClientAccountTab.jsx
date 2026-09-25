import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import paymentService from '../../services/paymentService';
import usePermission from '../../hooks/usePermission';
import { Modal, Button, Input } from '../ui';
import { StatusChip } from '../ui/StatusChip';
import { statusLabel } from '../../utils/labels';

/**
 * Client → Account (Phase 2): credit N/M, extra credit, unpaid bills with paid
 * and pending, Record payment (client / project / selected bills, oldest first),
 * the D17 "not adjusted" prompt, payments with Adjust / Reverse, and the ledger.
 */
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
// en-CA gives YYYY-MM-DD in local time (toISOString is UTC — yesterday before 5:30 AM IST).
const d = (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '—');
const errMsg = (e, f) => e.response?.data?.message || f;

const Box = ({ title, children, action, className = '' }) => (
  <section className={`sv-card p-4 sm:p-6 ${className}`}>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h4 className="text-lg font-semibold text-primary-second">{title}</h4>{action}</div>
    {children}
  </section>
);
const Stat = ({ label, value, tone = 'text-text-primary' }) => (
  <div className="rounded-2xl bg-background-hover p-3.5 sm:p-4">
    <div className="text-xs font-medium text-text-secondary">{label}</div>
    <div className={`mt-1 text-base font-semibold tabular-nums sm:text-[17px] ${tone}`}>{value}</div>
  </div>
);
const linkBtn = 'h-10 rounded-xl border border-primary-light bg-white px-3.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-light';

export default function ClientAccountTab({ clientId }) {
  const { can } = usePermission();
  const [acc, setAcc] = useState(null);
  const [ledger, setLedger] = useState(null);
  const [selected, setSelected] = useState([]);
  const [showPay, setShowPay] = useState(false);
  // One small form popup for credit, extra credit, revoke and reverse.
  const [ask, setAsk] = useState(null); // { title, note?, fields: [{ key, label, type?, value? }], submit(values) }

  const load = useCallback(async () => {
    if (!clientId) return;
    try { setAcc((await paymentService.account(clientId)).data); } catch (e) { setAcc(false); toast.error(errMsg(e, 'Could not load account')); }
  }, [clientId]);
  useEffect(() => { load(); }, [load]);

  if (acc === null) return <div className="sv-card h-48 animate-pulse bg-primary-light/40" />;
  if (acc === false) return <p className="py-4 text-sm text-text-secondary">You need the Payments or Billing permission.</p>;
  const c = acc.credit;

  const run = (fn, ok, fail) => async (v) => {
    try { await fn(v); toast.success(ok); setAsk(null); load(); }
    catch (e) { toast.error(errMsg(e, fail)); }
  };
  const editCredit = () => setAsk({
    title: 'Edit credit limit and days',
    fields: [
      { key: 'creditLimit', label: 'Credit limit ₹', type: 'number', value: acc.client.creditLimit ?? '' },
      { key: 'creditDays', label: 'Credit period (days)', type: 'number', value: acc.client.creditDays ?? '' },
    ],
    submit: run((v) => paymentService.setCredit(clientId, v), 'Credit updated', 'Update failed'),
  });
  const addExtra = () => setAsk({
    title: 'Add extra credit',
    note: 'One-time top-up above the limit. It has no end date and is gone once used.',
    fields: [
      { key: 'amount', label: 'Amount ₹', type: 'number' },
      { key: 'reason', label: 'Reason' },
    ],
    submit: run((v) => paymentService.grantExtra(clientId, v), 'Extra credit added', 'Could not add'),
  });
  const revoke = (x) => setAsk({
    title: 'Revoke unused extra credit',
    note: `Removes the unused part of ${inr(x.amount)}. The part already used stays.`,
    fields: [{ key: 'reason', label: 'Reason' }],
    submit: run((v) => paymentService.revokeExtra(clientId, x.id, v.reason), 'Revoked', 'Could not revoke'),
  });
  const reverse = (p) => setAsk({
    title: `Reverse payment ${p.receiptNo}`,
    note: `${inr(p.amount)} will be taken off the bills it was applied to.`,
    fields: [{ key: 'reason', label: 'Reason (e.g. cheque bounced)' }],
    submit: run((v) => paymentService.reverse(p.id, v.reason), 'Payment reversed', 'Could not reverse'),
  });
  const adjust = async (p) => {
    if (!selected.length) return toast.info('Tick the bills to adjust the advance against, then press Adjust.');
    try { const r = await paymentService.adjust(p.id, { billIds: selected }); toast.success(`Adjusted — ₹${r.data.unallocated} still in advance`); setSelected([]); load(); }
    catch (e) { toast.error(errMsg(e, 'Could not adjust')); }
  };

  const usedPct = c.limit ? Math.min(100, Math.max(0, (c.used / c.limit) * 100)) : 0;
  const billStatus = (b) => (b.status === 'PARTIALLY_PAID' ? 'Part paid' : b.status === 'OVERDUE' ? 'Overdue' : b.status === 'SENT' ? 'Sent' : 'Pending');
  const lateDays = (b) => (b.dueDate && new Date(b.dueDate) < new Date() ? Math.floor((new Date() - new Date(b.dueDate)) / 864e5) : 0);
  const toggle = (billNo, on) => setSelected((s) => (on ? [...s, billNo] : s.filter((x) => x !== billNo)));

  return (
    <div className="space-y-5">
      {/* Credit */}
      <section className="sv-card grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-5">
          <span className="text-sm font-medium text-text-secondary">Available credit</span>
          <span className={`text-3xl font-bold tabular-nums tracking-tight sm:text-[40px] ${c.available < 0 ? 'text-error' : 'text-primary-second'}`}>{inr(c.available)}</span>
          {c.limit ? (
            <>
              <div className="h-3 overflow-hidden rounded-full bg-primary-light">
                <div className={`sv-grow-x h-full rounded-full ${usedPct >= 100 ? 'bg-error' : 'bg-primary'}`} style={{ width: `${Math.max(usedPct, 2)}%`, animationDelay: '.3s' }} />
              </div>
              <span className="text-sm text-text-primary"><b className="font-semibold">{inr(c.used)}</b> used of {inr(c.limit)} limit</span>
            </>
          ) : <span className="text-sm text-text-secondary">No credit limit set yet.</span>}
          {c.flag !== 'OK' && (
            <p className="rounded-xl bg-error-light px-3 py-2 text-[13px] font-medium text-error">
              {c.flag === 'OVERDUE' ? 'Overdue — new orders are held for approval.' : 'Over limit — new orders are held for approval.'}
            </p>
          )}
          <div className="mt-1 flex flex-wrap gap-2">
            {can('clients', 'update') && <button type="button" className={linkBtn} onClick={editCredit}>Edit limit &amp; days</button>}
            {can('orders', 'approve') && <button type="button" className={linkBtn} onClick={addExtra}>+ Add extra credit</button>}
          </div>
        </div>
        <div className="grid grid-cols-2 content-start gap-3 sm:grid-cols-3 lg:col-span-7">
          <Stat label="Credit days" value={c.creditDays ? `${c.creditDays} days` : '—'} />
          <Stat label="Credit limit" value={c.limit ? inr(c.limit) : 'Not set'} />
          <Stat label="Overdue" value={inr(c.overdueAmount)} tone={c.overdueAmount ? 'text-error' : 'text-success'} />
          <Stat label="Advance" value={inr(c.advance)} />
          <Stat label="Extra credit" value={c.extraUnused || c.extraInUse ? `${inr(c.extraUnused)} unused` : 'None'} />
          <Stat label="Status" value={c.flag === 'OK' ? 'Within limit' : c.flag === 'OVERDUE' ? 'Overdue' : 'Over limit'} tone={c.flag === 'OK' ? 'text-success' : 'text-error'} />
        </div>
      </section>

      {acc.extras.length > 0 && (
        <Box title="Extra credit">
          <div className="divide-y divide-primary-light">
            {acc.extras.map((x) => (
              <div key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-text-primary"><b className="font-semibold tabular-nums">{inr(x.amount)}</b> · {x.reason} · <span className="text-text-secondary">{d(x.createdAt)}</span>
                  {x.status === 'REVOKED' && <span className="text-text-secondary"> (revoked, {inr(x.revokedAmount)} unused removed)</span>}</span>
                {x.status === 'ACTIVE' && can('orders', 'approve') && (
                  <button type="button" className="h-9 rounded-xl px-3 text-[13px] font-semibold text-error hover:bg-error-light" onClick={() => revoke(x)}>Revoke unused</button>
                )}
              </div>
            ))}
          </div>
        </Box>
      )}

      {/* Unpaid bills */}
      <section className="sv-card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <h4 className="text-lg font-semibold text-primary-second">Unpaid bills</h4>
            <StatusChip dot={false}>{acc.bills.length}</StatusChip>
          </div>
          {can('payments', 'create') && (
            <button type="button" onClick={() => setShowPay(true)}
              className="h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(30,58,138,.22)] transition-all hover:-translate-y-px hover:bg-primary-second">
              Record payment
            </button>
          )}
        </div>
        {!acc.bills.length ? (
          <p className="border-t border-primary-light px-6 py-8 text-center text-sm text-text-secondary">No unpaid bills. Everything is settled.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-sm">
                <thead className="bg-background-hover text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <tr className="[&>th]:px-4 [&>th]:py-3"><th className="w-10"><span className="sr-only">Select</span></th><th>Bill</th><th>Project</th><th>Date</th><th>Due</th><th className="text-right">Amount</th><th className="text-right">Paid</th><th className="text-right">Pending</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {acc.bills.map((b) => {
                    const late = lateDays(b);
                    return (
                      <tr key={b.id} className="border-t border-primary-light transition-colors hover:bg-background-hover [&>td]:px-4 [&>td]:py-3.5">
                        <td><input type="checkbox" aria-label={`Select ${b.billNo}`} className="h-[18px] w-[18px] accent-primary" checked={selected.includes(b.billNo)} onChange={(e) => toggle(b.billNo, e.target.checked)} /></td>
                        <td className="font-semibold text-primary">{b.billNo}</td><td className="max-w-[220px] truncate">{b.projectName}</td>
                        <td className="whitespace-nowrap text-text-secondary">{d(b.issueDate)}</td><td className="whitespace-nowrap text-text-secondary">{d(b.dueDate)}</td>
                        <td className="text-right tabular-nums">{inr(b.amount)}</td><td className="text-right tabular-nums">{inr(b.paid)}</td><td className="text-right font-semibold tabular-nums">{inr(b.balance)}</td>
                        <td className="whitespace-nowrap"><StatusChip tone={late > 0 ? 'err' : 'warn'}>{late > 0 ? `${late}d overdue` : billStatus(b)}</StatusChip></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="divide-y divide-primary-light border-t border-primary-light md:hidden">
              {acc.bills.map((b) => {
                const late = lateDays(b);
                return (
                  <label key={b.id} className="flex cursor-pointer gap-3 px-5 py-4 active:bg-background-hover">
                    <input type="checkbox" className="mt-1 h-[18px] w-[18px] shrink-0 accent-primary" checked={selected.includes(b.billNo)} onChange={(e) => toggle(b.billNo, e.target.checked)} />
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      <span className="flex items-center justify-between gap-2"><span className="font-semibold text-primary">{b.billNo}</span><span className="font-semibold tabular-nums">{inr(b.balance)}</span></span>
                      <span className="truncate text-sm text-text-primary">{b.projectName}</span>
                      <span className="flex items-center justify-between gap-2 text-xs text-text-secondary"><span>Due {d(b.dueDate)}</span><StatusChip tone={late > 0 ? 'err' : 'warn'}>{late > 0 ? `${late}d overdue` : billStatus(b)}</StatusChip></span>
                    </span>
                  </label>
                );
              })}
            </div>
          </>
        )}
      </section>

      {ask && <AskDialog {...ask} onClose={() => setAsk(null)} />}
      {showPay && <RecordPayment clientId={clientId} bills={acc.bills} selected={selected} onClose={() => setShowPay(false)} onDone={() => { setShowPay(false); setSelected([]); load(); }} />}

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Box title={`Payments (${acc.payments.length})`}>
          {acc.payments.length ? (
            <div className="divide-y divide-primary-light">
              {acc.payments.map((p) => (
                <div key={p.id} className="space-y-1.5 py-3 text-sm first:pt-0">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <b className="font-semibold text-primary-second">{p.receiptNo}</b>
                    <span className="text-text-secondary">{d(p.receivedOn)}</span>
                    <span className="font-semibold tabular-nums">{inr(p.amount)}</span>
                    <span className="text-text-secondary">{statusLabel(p.mode)}{p.reference ? ` · ${p.reference}` : ''}</span>
                    {p.status === 'REVERSED' && <StatusChip tone="err">Reversed</StatusChip>}
                    {p.status !== 'REVERSED' && p.unallocated > 0 && <StatusChip tone="warn">Advance {inr(p.unallocated)}</StatusChip>}
                  </div>
                  <div className="text-xs text-text-secondary">
                    {p.status === 'REVERSED' ? p.reversalReason : p.allocations.filter((a) => !a.isReversed).map((a) => `${a.bill.billNo} ${inr(a.amount)}`).join(' · ') || 'Not allocated'}
                  </div>
                  {p.status !== 'REVERSED' && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {p.unallocated > 0 && can('payments', 'create') && <button type="button" className={linkBtn} onClick={() => adjust(p)}>Adjust advance → ticked bills</button>}
                      {can('payments', 'delete') && <button type="button" className="h-10 rounded-xl px-3.5 text-[13px] font-semibold text-error hover:bg-error-light" onClick={() => reverse(p)}>Reverse</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-text-secondary">No payments yet. Record a cheque or transfer and it is applied to the oldest bill first.</p>
          )}
        </Box>

        <Box title="Ledger" action={<button type="button" className={linkBtn} onClick={async () => setLedger((await paymentService.ledger(clientId)).data)}>{ledger ? 'Refresh' : 'Show ledger'}</button>}>
          {ledger ? (
            <div className="-mx-4 overflow-x-auto sm:-mx-6">
              <table className="min-w-full text-sm">
                <thead className="bg-background-hover text-left text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  <tr className="[&>th]:whitespace-nowrap [&>th]:px-4 [&>th]:py-2.5"><th>Date</th><th>Ref</th><th>Detail</th><th className="text-right">Debit</th><th className="text-right">Credit</th><th className="text-right">Balance</th></tr>
                </thead>
                <tbody>{ledger.map((r, i) => (
                  <tr key={i} className="border-t border-primary-light [&>td]:px-4 [&>td]:py-3">
                    <td className="whitespace-nowrap text-text-secondary">{d(r.date)}</td><td className="whitespace-nowrap font-medium">{r.ref}</td><td className="min-w-[160px]">{r.detail}</td>
                    <td className="text-right tabular-nums">{r.debit ? inr(r.debit) : ''}</td><td className="text-right tabular-nums">{r.credit ? inr(r.credit) : ''}</td><td className="text-right font-semibold tabular-nums">{inr(r.balance)}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <p className="text-sm text-text-secondary">Every bill and payment for this client, with a running balance.</p>}
        </Box>
      </div>
    </div>
  );
}

const MODE_LABEL = { CHEQUE: 'Cheque', ONLINE: 'Online', BANK_TRANSFER: 'Bank transfer', CASH: 'Cash', OTHER: 'Other' };
const inputCls = 'h-11 w-full rounded-xl border border-primary-light bg-input-bg px-3 text-sm text-text-primary transition-colors focus:border-border focus:bg-white focus:outline-none';
const Field = ({ label, children, className = '' }) => (
  <label className={`flex flex-col gap-1.5 ${className}`}>
    <span className="text-[13px] font-semibold text-text-primary">{label}</span>
    {children}
  </label>
);

function RecordPayment({ clientId, bills, selected, onClose, onDone }) {
  const projects = useMemo(() => [...new Map(bills.map((b) => [b.projectId, b.projectName])).entries()], [bills]);
  const [f, setF] = useState({ amount: '', receivedOn: new Date().toLocaleDateString('en-CA'), mode: 'CHEQUE', reference: '', bankName: '', chequeDate: '', tdsAmount: '', notes: '', scope: selected.length ? 'BILLS' : 'CLIENT', projectId: projects[0]?.[0] || '' });
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
  const scopes = [
    { key: 'CLIENT', title: 'Oldest bills first', sub: 'All projects' },
    { key: 'PROJECT', title: 'One project', sub: 'Pick the site' },
    { key: 'BILLS', title: 'Ticked bills', sub: `${selected.length} selected` },
  ];
  const primary = 'h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(30,58,138,.22)] transition-colors hover:bg-primary-second disabled:opacity-60';

  const footer = (
    <>
      <button type="button" onClick={onClose} className="h-11 rounded-xl border border-primary-light bg-white px-5 text-sm font-semibold text-primary hover:bg-background-hover">Cancel</button>
      {!plan ? (
        <button type="button" className={primary} disabled={!Number(f.amount)} onClick={preview}>Preview allocation</button>
      ) : plan.unallocated > 0 ? (
        <button type="button" className={primary} disabled={saving} onClick={() => save(true)}>{saving ? 'Saving…' : `Save and keep ${inr(plan.unallocated)} as advance`}</button>
      ) : (
        <button type="button" className={primary} disabled={saving} onClick={() => save(false)}>{saving ? 'Saving…' : 'Save payment'}</button>
      )}
    </>
  );

  return (
    <Modal isOpen onClose={onClose} title="Record payment" maxWidth="760px" headerIcon="none" footer={footer}>
      <div className="space-y-5">
        <div className="space-y-2">
          <span className="text-[13px] font-semibold text-text-primary">Mode</span>
          <div className="grid grid-cols-3 gap-1.5 rounded-2xl bg-background-hover p-1.5 sm:grid-cols-5" role="radiogroup" aria-label="Payment mode">
            {Object.entries(MODE_LABEL).map(([m, label]) => (
              <button key={m} type="button" role="radio" aria-checked={f.mode === m} onClick={() => set('mode', m)}
                className={`h-10 rounded-xl text-[13px] font-semibold transition-all ${f.mode === m ? 'bg-primary text-white shadow-[0_6px_14px_rgba(30,58,138,.25)]' : 'text-text-primary hover:bg-white'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Amount ₹"><input className={inputCls} type="number" inputMode="decimal" autoFocus value={f.amount} onChange={(e) => set('amount', e.target.value)} /></Field>
          <Field label={`${f.mode === 'CHEQUE' ? 'Cheque no.' : 'UTR / transaction id'}${needsRef ? ' *' : ''}`}><input className={inputCls} value={f.reference} onChange={(e) => set('reference', e.target.value)} /></Field>
          <Field label="Received on"><input className={inputCls} type="date" value={f.receivedOn} onChange={(e) => set('receivedOn', e.target.value)} /></Field>
          <Field label="Bank"><input className={inputCls} value={f.bankName} onChange={(e) => set('bankName', e.target.value)} /></Field>
          {f.mode === 'CHEQUE' && <Field label="Cheque date"><input className={inputCls} type="date" value={f.chequeDate} onChange={(e) => set('chequeDate', e.target.value)} /></Field>}
          <Field label="TDS ₹ (optional)"><input className={inputCls} type="number" inputMode="decimal" value={f.tdsAmount} onChange={(e) => set('tdsAmount', e.target.value)} /></Field>
          <Field label="Notes" className="sm:col-span-2 lg:col-span-3"><input className={inputCls} value={f.notes} onChange={(e) => set('notes', e.target.value)} /></Field>
        </div>

        <div className="space-y-2">
          <span className="text-[13px] font-semibold text-text-primary">Apply to</span>
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {scopes.map((sc) => (
              <label key={sc.key} className={`flex cursor-pointer gap-3 rounded-2xl border-[1.5px] p-3.5 transition-colors ${f.scope === sc.key ? 'border-primary bg-primary-light' : 'border-primary-light hover:bg-background-hover'}`}>
                <input type="radio" name="scope" className="mt-0.5 accent-primary" checked={f.scope === sc.key} onChange={() => set('scope', sc.key)} />
                <span className="flex flex-col"><span className="text-sm font-semibold text-primary-second">{sc.title}</span><span className="text-xs text-text-secondary">{sc.sub}</span></span>
              </label>
            ))}
          </div>
          {f.scope === 'PROJECT' && (
            <select className={inputCls} value={f.projectId} onChange={(e) => set('projectId', e.target.value)} aria-label="Project">
              {projects.map(([id, n]) => <option key={id} value={id}>{n}</option>)}
            </select>
          )}
        </div>

        {plan && (
          <div className="sv-rise overflow-hidden rounded-2xl border border-primary-light">
            <div className="flex justify-between bg-background-hover px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary"><span>How it will be applied</span><span>Amount</span></div>
            {plan.allocations.map((a) => (
              <div key={a.billId} className="flex items-center justify-between border-t border-primary-light px-4 py-3 text-sm">
                <span className="font-semibold">{a.billNo}</span><span className="font-semibold tabular-nums">{inr(a.amount)}</span>
              </div>
            ))}
            {plan.unallocated > 0 && (
              <div className="border-t border-primary-light bg-warning-light px-4 py-3 text-sm text-text-primary">
                <b>{inr(plan.unallocated)} is not adjusted against any bill.</b> Tick more bills and preview again, or keep it as advance (extra credit) for this client.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

function AskDialog({ title, note, fields, submit, onClose }) {
  const [v, setV] = useState(() => Object.fromEntries(fields.map((f) => [f.key, f.value ?? ''])));
  const [saving, setSaving] = useState(false);
  const ready = fields.every((f) => String(v[f.key]).trim() !== '');
  const go = async () => { setSaving(true); try { await submit(v); } finally { setSaving(false); } };
  return (
    <Modal isOpen onClose={onClose} title={title} maxWidth="480px" headerIcon="none"
      footer={<div className="flex justify-end gap-3"><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={go} disabled={!ready || saving}>{saving ? 'Saving…' : 'Save'}</Button></div>}>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if (ready) go(); }}>
        {note && <p className="text-sm text-text-secondary">{note}</p>}
        {fields.map((f, i) => (
          <Input key={f.key} label={f.label} type={f.type || 'text'} value={v[f.key]} autoFocus={i === 0} required
            onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value }))} backgroundColor="input-bg" />
        ))}
      </form>
    </Modal>
  );
}
