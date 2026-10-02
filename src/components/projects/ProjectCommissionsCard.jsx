import { Fragment, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import Button from "../ui/Button";
import usePermission from "../../hooks/usePermission";

// Commission people on a project (2026-10-02): several per project, each with
// their own ₹/m³. Commission = the project's billed qty × rate (server-side,
// helper/commissions.js). Payouts are recorded here; balance = earned − paid.
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const qty = (n) => `${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })} CBM`;
const amountOnly = (v) => /^\d*(\.\d{0,2})?$/.test(v);
const today = () => new Date().toLocaleDateString("en-CA");
const input = "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm";
const errMsg = (e, fallback) => e?.response?.data?.message || fallback;

function PersonForm({ initial, onCancel, onSave }) {
  const [f, setF] = useState(initial);
  return (
    <div className="grid gap-3 sm:grid-cols-4 items-end rounded-lg bg-gray-50 p-4">
      <label className="text-sm text-gray-600">Name
        <input className={input} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      </label>
      <label className="text-sm text-gray-600">Mobile (optional)
        <input inputMode="numeric" maxLength={10} className={input} value={f.mobile} onChange={(e) => /^\d*$/.test(e.target.value) && setF({ ...f, mobile: e.target.value })} />
      </label>
      <label className="text-sm text-gray-600">Rate per m³ (₹)
        <input inputMode="decimal" className={input} value={f.ratePerM3} onChange={(e) => amountOnly(e.target.value) && setF({ ...f, ratePerM3: e.target.value })} />
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(f)}>Save</Button>
      </div>
    </div>
  );
}

function PayoutForm({ person, onCancel, onSave }) {
  const [f, setF] = useState({ amount: person.balance > 0 ? String(person.balance) : "", paidOn: today(), mode: "", reference: "" });
  return (
    <div className="grid gap-3 sm:grid-cols-5 items-end rounded-lg bg-gray-50 p-4">
      <label className="text-sm text-gray-600">Amount (₹)
        <input inputMode="decimal" className={input} value={f.amount} onChange={(e) => amountOnly(e.target.value) && setF({ ...f, amount: e.target.value })} />
      </label>
      <label className="text-sm text-gray-600">Paid on
        <input type="date" className={input} value={f.paidOn} max={today()} onChange={(e) => setF({ ...f, paidOn: e.target.value })} />
      </label>
      <label className="text-sm text-gray-600">Mode
        <select className={input} value={f.mode} onChange={(e) => setF({ ...f, mode: e.target.value })}>
          <option value="">—</option>
          {["Cash", "Bank transfer", "UPI", "Cheque"].map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <label className="text-sm text-gray-600">Reference
        <input className={input} value={f.reference} onChange={(e) => setF({ ...f, reference: e.target.value })} />
      </label>
      <div className="flex gap-2">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" onClick={() => onSave(f)}>Record</Button>
      </div>
    </div>
  );
}

export default function ProjectCommissionsCard({ projectId }) {
  const { canKey } = usePermission();
  const canEdit = canKey("projectCommission.update");
  const [range, setRange] = useState({ from: "", to: "" });
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null); // { mode: 'add' } | { mode: 'edit' | 'pay', person }
  const [open, setOpen] = useState(null); // person id whose payouts are shown

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams(Object.entries(range).filter(([, v]) => v));
      const res = await api.get(`/api/v1/admin/project/${projectId}/commissions?${params}`);
      setData(res.data.data);
    } catch (e) {
      toast.error(errMsg(e, "Could not load commission"));
    }
  }, [projectId, range]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn, ok) => {
    try {
      await fn();
      toast.success(ok);
      setForm(null);
      load();
    } catch (e) {
      toast.error(errMsg(e, "Could not save"));
    }
  };

  const savePerson = (f) => run(
    () => (form.mode === "edit"
      ? api.put(`/api/v1/admin/project/commissions/${form.person.id}`, f)
      : api.post(`/api/v1/admin/project/${projectId}/commissions`, f)),
    form.mode === "edit" ? "Commission person updated" : "Commission person added",
  );
  const removePerson = (p) => window.confirm(`Remove ${p.name} from this project's commission? Their payouts stay on record.`)
    && run(() => api.delete(`/api/v1/admin/project/commissions/${p.id}`), "Removed");
  const savePayout = (f) => run(() => api.post(`/api/v1/admin/project/commissions/${form.person.id}/payouts`, f), "Payout recorded");
  const removePayout = (p) => window.confirm(`Remove the ${inr(p.amount)} payout of ${p.paidOn.slice(0, 10)}?`)
    && run(() => api.delete(`/api/v1/admin/project/commissions/payouts/${p.id}`), "Payout removed");

  const people = data?.people ?? [];
  const sum = (k) => people.reduce((s, p) => s + (p[k] || 0), 0);
  const periodLabel = range.from || range.to ? "in period" : "all time";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Commission</h2>
          <p className="text-sm text-gray-500">Each person earns their rate on every billed m³ of this project. Billed qty = accepted qty on the bills.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-500">From
            <input type="date" className={input} value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
          </label>
          <label className="text-xs text-gray-500">To
            <input type="date" className={input} value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </label>
          {(range.from || range.to) && <Button variant="secondary" onClick={() => setRange({ from: "", to: "" })}>All time</Button>}
          {canEdit && !form && <Button variant="primary" onClick={() => setForm({ mode: "add" })}>Add person</Button>}
        </div>
      </div>

      {form?.mode === "add" && <div className="mb-4"><PersonForm initial={{ name: "", mobile: "", ratePerM3: "" }} onCancel={() => setForm(null)} onSave={savePerson} /></div>}

      {!data ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : people.length === 0 ? (
        <p className="text-sm text-gray-500">No commission people on this project.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 pr-3 font-medium">Person</th>
                <th className="py-2 pr-3 font-medium text-right">Rate / m³</th>
                <th className="py-2 pr-3 font-medium text-right">Billed qty ({periodLabel})</th>
                <th className="py-2 pr-3 font-medium text-right">Commission ({periodLabel})</th>
                <th className="py-2 pr-3 font-medium text-right">Earned (all time)</th>
                <th className="py-2 pr-3 font-medium text-right">Paid</th>
                <th className="py-2 pr-3 font-medium text-right">Balance due</th>
                <th className="py-2" />
              </tr>
            </thead>
            <tbody>
              {people.map((p) => (
                <Fragment key={p.id}>
                  <tr className="border-b last:border-0 align-top">
                    <td className="py-3 pr-3">
                      <p className="font-medium text-gray-900">{p.name}</p>
                      {p.mobile && <a className="text-xs text-gray-500" href={`tel:${p.mobile}`}>{p.mobile}</a>}
                    </td>
                    <td className="py-3 pr-3 text-right">{inr(p.ratePerM3)}</td>
                    <td className="py-3 pr-3 text-right">{qty(p.periodQty)}</td>
                    <td className="py-3 pr-3 text-right font-medium">{inr(p.periodAmount)}</td>
                    <td className="py-3 pr-3 text-right">{inr(p.earned)}</td>
                    <td className="py-3 pr-3 text-right">
                      <button className="underline decoration-dotted" title="Show payouts" onClick={() => setOpen(open === p.id ? null : p.id)}>{inr(p.paid)}</button>
                    </td>
                    <td className={`py-3 pr-3 text-right font-semibold ${p.balance > 0 ? "text-amber-700" : "text-gray-900"}`}>{inr(p.balance)}</td>
                    <td className="py-3 text-right whitespace-nowrap">
                      {canEdit && !form && (
                        <span className="inline-flex gap-3 text-sm">
                          <button className="text-blue-600 hover:underline" onClick={() => setForm({ mode: "pay", person: p })}>Pay</button>
                          <button className="text-gray-600 hover:underline" onClick={() => setForm({ mode: "edit", person: p })}>Edit</button>
                          <button className="text-red-600 hover:underline" onClick={() => removePerson(p)}>Remove</button>
                        </span>
                      )}
                    </td>
                  </tr>
                  {form?.person?.id === p.id && (
                    <tr><td colSpan={8} className="pb-3">
                      {form.mode === "edit"
                        ? <PersonForm initial={{ name: p.name, mobile: p.mobile ?? "", ratePerM3: String(p.ratePerM3) }} onCancel={() => setForm(null)} onSave={savePerson} />
                        : <PayoutForm person={p} onCancel={() => setForm(null)} onSave={savePayout} />}
                    </td></tr>
                  )}
                  {open === p.id && (
                    <tr><td colSpan={8} className="pb-3">
                      {p.payouts.length === 0 ? <p className="text-xs text-gray-500 px-1">No payouts yet.</p> : (
                        <ul className="divide-y rounded-lg bg-gray-50 text-xs">
                          {p.payouts.map((po) => (
                            <li key={po.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                              <span>{po.paidOn.slice(0, 10)} · <b>{inr(po.amount)}</b>{po.mode ? ` · ${po.mode}` : ""}{po.reference ? ` · ${po.reference}` : ""}{po.createdBy?.name ? ` · by ${po.createdBy.name}` : ""}</span>
                              {canEdit && <button className="text-red-600 hover:underline" onClick={() => removePayout(po)}>Remove</button>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td></tr>
                  )}
                </Fragment>
              ))}
            </tbody>
            {people.length > 1 && (
              <tfoot>
                <tr className="border-t font-semibold text-gray-900">
                  <td className="py-2 pr-3">Total</td>
                  <td />
                  <td className="py-2 pr-3 text-right">{qty(people[0].periodQty)}</td>
                  <td className="py-2 pr-3 text-right">{inr(sum("periodAmount"))}</td>
                  <td className="py-2 pr-3 text-right">{inr(sum("earned"))}</td>
                  <td className="py-2 pr-3 text-right">{inr(sum("paid"))}</td>
                  <td className="py-2 pr-3 text-right">{inr(sum("balance"))}</td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
          <p className="mt-3 text-xs text-gray-500">{data.bills.length} bill{data.bills.length === 1 ? "" : "s"} {periodLabel}{data.bills.length ? `: ${data.bills.map((b) => b.billNo).join(", ")}` : ""}</p>
        </div>
      )}
    </div>
  );
}
