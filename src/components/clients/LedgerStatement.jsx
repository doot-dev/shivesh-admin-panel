import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";
import { saveBlob } from "../../services/reportService";

// Client ledger in the Tally layout (2026-09-29): pick a date range, read it
// here, download it as PDF or Excel. Defaults to this financial year.
const today = () => new Date().toLocaleDateString("en-CA");
const fyStart = () => { const d = new Date(); return `${d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1}-04-01`; };
const money = (n) => (n ? Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "");
const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" });
const input = "h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm";

export default function LedgerStatement({ clientId }) {
  const [range, setRange] = useState({ from: fyStart(), to: today() });
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState("");
  const url = `/api/v1/admin/client/${clientId}/ledger/statement`;

  const load = useCallback(async () => {
    try {
      setS((await api.get(url, { params: range })).data.data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Could not load the ledger");
    }
  }, [url, range]);
  useEffect(() => { load(); }, [load]);

  const download = async (format) => {
    setBusy(format);
    try {
      const r = await api.get(url, { params: { ...range, format }, responseType: "blob" });
      saveBlob(r.data, `Ledger_${s?.client?.companyName?.replace(/\W+/g, "-") ?? clientId}_${range.from}_to_${range.to}.${format}`);
    } catch {
      toast.error("Download failed");
    } finally {
      setBusy("");
    }
  };

  let last = null;
  return (
    <section className="sv-card p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-primary-second">Ledger account</h3>
          <p className="text-xs text-text-secondary">Sales, receipts and credit notes with brought-forward and closing balance.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="text-xs font-medium text-text-secondary">From<br /><input type="date" className={input} value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} /></label>
          <label className="text-xs font-medium text-text-secondary">To<br /><input type="date" className={input} value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} /></label>
          <button type="button" onClick={() => download("pdf")} disabled={!!busy} className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white disabled:opacity-50">{busy === "pdf" ? "Preparing…" : "Download PDF"}</button>
          <button type="button" onClick={() => download("xlsx")} disabled={!!busy} className="h-10 rounded-lg border border-primary px-4 text-sm font-semibold text-primary disabled:opacity-50">{busy === "xlsx" ? "Preparing…" : "Download Excel"}</button>
        </div>
      </div>
      {!s ? <p className="py-8 text-center text-sm text-text-secondary">Loading…</p> : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
              <tr className="[&>th]:whitespace-nowrap [&>th]:px-3 [&>th]:py-2.5"><th className="text-left">Date</th><th className="text-left">Particulars</th><th className="text-left">Vch Type</th><th className="text-left">Vch No.</th><th className="text-right">Debit (₹)</th><th className="text-right">Credit (₹)</th></tr>
            </thead>
            <tbody className="[&>tr>td]:px-3 [&>tr>td]:py-2">
              <tr className="border-t bg-gray-50/60 italic"><td /><td>Brought Forward</td><td /><td /><td className="text-right tabular-nums">{money(s.opening.debit)}</td><td className="text-right tabular-nums">{money(s.opening.credit)}</td></tr>
              {s.rows.map((r, i) => {
                const d = fmt(r.date); const show = d !== last; last = d;
                return (
                  <tr key={i} className="border-t" title={r.note}>
                    <td className="whitespace-nowrap text-gray-600">{show ? d : ""}</td>
                    <td className="whitespace-nowrap"><span className="mr-2 text-xs text-gray-400">{r.drcr}</span><b className="font-semibold">{r.particulars}</b><span className="ml-2 text-xs text-gray-400">{r.note}</span></td>
                    <td className="whitespace-nowrap font-medium">{r.vchType}</td>
                    <td className="whitespace-nowrap text-gray-700">{r.vchNo}</td>
                    <td className="text-right tabular-nums">{money(r.debit)}</td>
                    <td className="text-right tabular-nums">{money(r.credit)}</td>
                  </tr>
                );
              })}
              {!s.rows.length && <tr className="border-t"><td colSpan={6} className="py-6 text-center text-gray-500">No entries in these dates.</td></tr>}
              <tr className="border-t-2 border-gray-300 font-semibold"><td /><td>Total</td><td /><td /><td className="text-right tabular-nums">{money(s.totalDebit)}</td><td className="text-right tabular-nums">{money(s.totalCredit)}</td></tr>
              <tr className="border-t font-semibold"><td className="text-gray-600">{s.closing.side}</td><td>Closing Balance</td><td /><td /><td className="text-right tabular-nums">{s.closing.side === "Cr" ? money(s.closing.amount) : ""}</td><td className="text-right tabular-nums">{s.closing.side === "Dr" ? money(s.closing.amount) : ""}</td></tr>
              <tr className="border-t-2 border-gray-900 font-bold"><td /><td /><td /><td /><td className="text-right tabular-nums">{money(s.grandTotal)}</td><td className="text-right tabular-nums">{money(s.grandTotal)}</td></tr>
            </tbody>
          </table>
        </div>
      )}
      {s && <p className="mt-2 text-xs text-text-secondary">Closing balance {s.closing.side === "Dr" ? "due from" : "held for"} the client: <b>₹{money(s.closing.amount) || "0.00"}</b></p>}
    </section>
  );
}
