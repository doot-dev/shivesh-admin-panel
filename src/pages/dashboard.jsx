import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { statusLabel } from '../utils/labels';

/**
 * Dashboard (W28 / P2.12). Replaces the old hard-coded sample numbers with the
 * real figures from GET /dashboard/stats: money first, then operations.
 */
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const Tile = ({ label, value, hint, tone = 'text-gray-900', onClick }) => (
  <button type="button" onClick={onClick} disabled={!onClick}
    className="text-left bg-white border rounded-xl p-4 hover:border-primary disabled:hover:border-gray-200">
    <div className="text-xs text-gray-500">{label}</div>
    <div className={`text-2xl font-semibold mt-1 ${tone}`}>{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </button>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [s, setS] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get('/api/v1/admin/dashboard/stats').then((r) => setS(r.data.data)).catch(() => setErr(true));
  }, []);

  if (err) return <div className="p-6 text-sm text-gray-500">Could not load the dashboard.</div>;
  if (!s) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  const m = s.money;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Dashboard</h1>

      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Money</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <Tile label="Billed this month" value={inr(m.billedThisMonth)} onClick={() => navigate('/billing')} />
          <Tile label="Collected this month" value={inr(m.collectedThisMonth)} tone="text-green-700" onClick={() => navigate('/billing')} />
          <Tile label="Outstanding" value={inr(m.outstanding)} onClick={() => navigate('/reports')} />
          <Tile label="Overdue 60+ days" value={inr(m.overdue60)} tone={m.overdue60 ? 'text-red-700' : ''} onClick={() => navigate('/reports')} />
          <Tile label="DSO" value={m.dso ?? '—'} hint="days of sales outstanding" />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Needs attention</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Tile label="Orders on credit hold" value={m.creditHolds} tone={m.creditHolds ? 'text-amber-700' : ''} onClick={() => navigate('/orders')} />
          <Tile label="Completed, awaiting challans" value={m.awaitingChallans} tone={m.awaitingChallans ? 'text-amber-700' : ''} hint="not billed yet" onClick={() => navigate('/orders?status=COMPLETED')} />
          <Tile label="New orders" value={s.orders.new} onClick={() => navigate('/orders?status=NEW')} />
          <Tile label="Active orders" value={s.orders.active} onClick={() => navigate('/orders')} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-gray-600 mb-2">Business</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <Tile label="Clients" value={`${s.clients.active} / ${s.clients.total}`} hint="active / total" onClick={() => navigate('/clients')} />
          <Tile label="Projects" value={`${s.projects.active} / ${s.projects.total}`} hint="active / total" onClick={() => navigate('/projects')} />
          <Tile label="Orders completed" value={s.orders.completed} />
          <Tile label="Vendors" value={s.vendors.total} onClick={() => navigate('/vendors')} />
          <Tile label="Users" value={s.users.total} />
        </div>
      </section>

      <section className="bg-white border rounded-xl p-4">
        <h2 className="text-sm font-semibold mb-3">Recent orders</h2>
        <table className="min-w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500"><th className="py-1">Order</th><th>Client</th><th>Project</th><th>Product</th><th>Status</th></tr></thead>
          <tbody>{s.recentOrders.map((o) => (
            <tr key={o.id} className="border-t cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/orders/${o.orderId}`)}>
              <td className="py-1.5 font-medium">{o.orderId}</td><td>{o.client?.companyName}</td><td>{o.project?.projectName}</td>
              <td>{o.productName} {o.productGrade}</td><td>{statusLabel(o.status)}{o.creditHold ? ' · credit hold' : ''}</td>
            </tr>
          ))}</tbody>
        </table>
      </section>
    </div>
  );
};

export default Dashboard;
