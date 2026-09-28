import { useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import usePermission from "../../hooks/usePermission";

// Extra services on an order (2026-09-29): pumping, part load, anything else
// agreed in the PO. Added from Confirmed until the bill is paid; the bill
// carries them. Removing needs orderExtras.delete (accounts / admin) + a reason.
const KINDS = [
  { value: "PUMPING", label: "Pumping", rate: "pumpingRate" },
  { value: "PART_LOAD", label: "Part load", rate: "partLoadRate" },
  { value: "OTHER", label: "Other" },
];
const OPEN = ["CONFIRMED", "DISPATCHED", "DELAYED", "REACHED"];
const LOCKED_BILL = ["PAID", "PARTIALLY_PAID", "CANCELLED"];
const inr = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
const field = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none";

export default function OrderExtrasCard({ order, bill, onChanged }) {
  const { canKey } = usePermission();
  const [form, setForm] = useState(null); // { kind, name, amount }
  const [busy, setBusy] = useState(false);
  const extras = order.extras ?? [];
  const total = extras.reduce((s, x) => s + x.amount, 0);
  const billOpen = !bill || !LOCKED_BILL.includes(bill.status);
  const canAdd = canKey("orderExtras.create") && (OPEN.includes(order.status) || (order.status === "COMPLETED" && bill && billOpen));
  const canRemove = canKey("orderExtras.delete") && billOpen;

  const pick = (kind) => {
    const k = KINDS.find((x) => x.value === kind);
    const rate = k.rate ? order.project?.[k.rate] : null;
    setForm({ kind, name: kind === "OTHER" ? "" : k.label, amount: rate ?? "" });
  };

  const save = async () => {
    setBusy(true);
    try {
      await api.post(`/api/v1/admin/orders/${order.orderId}/extras`, form);
      toast.success(`${form.name || "Extra"} added`);
      setForm(null);
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not add it");
    } finally {
      setBusy(false);
    }
  };

  const remove = async (x) => {
    const reason = window.prompt(`Why remove "${x.name}" (${inr(x.amount)})?`);
    if (!reason?.trim()) return;
    try {
      await api.delete(`/api/v1/admin/orders/${order.orderId}/extras/${x.id}`, { data: { reason } });
      toast.success("Removed");
      onChanged?.();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not remove it");
    }
  };

  if (!extras.length && !canAdd) return null;
  const presetMissing = form && form.kind !== "OTHER" && !order.project?.[KINDS.find((k) => k.value === form.kind).rate];

  return (
    <section className="sv-card p-4 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-primary-second">Extra services</h3>
          <p className="text-xs text-text-secondary">Pumping, part load and other charges — billed with the concrete.</p>
        </div>
        {canAdd && !form && (
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button key={k.value} type="button" onClick={() => pick(k.value)}
                className="rounded-full border border-primary-light bg-white px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-light">
                + {k.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {form && (
        <div className="mb-4 grid gap-3 rounded-xl border border-primary-light p-3 sm:grid-cols-[1fr_160px_auto]">
          <input className={field} placeholder="Service name, e.g. Boom pump 36 m" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />
          <input className={field} type="number" min="0" step="0.01" placeholder="Price ₹" value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <div className="flex gap-2">
            <button type="button" onClick={() => setForm(null)} disabled={busy} className="rounded-lg border border-gray-300 px-3 py-2 text-sm">Cancel</button>
            <button type="button" onClick={save} disabled={busy || !form.name.trim() || !(Number(form.amount) > 0)}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Adding…" : "Add"}</button>
          </div>
          {presetMissing && (
            <p className="text-xs text-text-secondary sm:col-span-3">No PO rate on this project yet — type the agreed price (set it on the project page for next time).</p>
          )}
        </div>
      )}

      {extras.length ? (
        <ul className="divide-y divide-gray-100">
          {extras.map((x) => (
            <li key={x.id} className="flex items-center justify-between gap-3 py-2 text-sm">
              <div>
                <p className="font-medium text-gray-900">{x.name}</p>
                <p className="text-xs text-text-secondary">Added by {x.addedBy?.name ?? "—"} · {new Date(x.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{inr(x.amount)}</span>
                {canRemove && <button type="button" onClick={() => remove(x)} className="text-xs font-medium text-red-600 hover:underline">Remove</button>}
              </div>
            </li>
          ))}
          <li className="flex justify-between py-2 text-sm font-semibold"><span>Total extras</span><span>{inr(total)}</span></li>
        </ul>
      ) : (
        <p className="text-sm text-text-secondary">
          {OPEN.includes(order.status) || order.status === "COMPLETED" ? "No extra services on this order." : "Extras can be added once the order is confirmed."}
        </p>
      )}
    </section>
  );
}
