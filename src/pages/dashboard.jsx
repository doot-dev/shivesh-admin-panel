import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ReceiptText, Wallet, ChartLine, CircleCheck, TriangleAlert, ShoppingCart, Truck, ChevronRight,
  ArrowRight, Plus, Building2, BriefcaseBusiness, Store,
} from 'lucide-react';
import api from '../services/api';
import { statusLabel, orderTone } from '../utils/labels';
import { usePermission } from '../hooks/usePermission';
import { StatusChip } from '../components/ui/StatusChip';

/**
 * Dashboard (W28 / P2.12): money first, then what needs attention, the
 * billed-vs-collected trend and the latest orders. Every figure is live from
 * GET /dashboard/stats.
 */
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthName = (key) => MONTH[Number(key.split('-')[1]) - 1];

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const TILE = { ok: 'bg-success-light text-success', warn: 'bg-warning-light text-warning', primary: 'bg-primary-light text-primary' };

const Stat = ({ icon, label, value, sub, tone = 'primary', to, i }) => {
  const IconCmp = icon;
  const body = (
    <>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] font-medium leading-snug text-text-secondary sm:text-sm">{label}</span>
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${TILE[tone]}`}><IconCmp size={18} /></span>
      </div>
      <span className="text-xl font-bold tabular-nums tracking-tight text-primary-second sm:text-[26px] lg:text-3xl">{value}</span>
      {sub && <span className="text-xs text-text-secondary sm:text-[13px]">{sub}</span>}
    </>
  );
  const cls = 'sv-card sv-card-hover sv-rise flex flex-col gap-2 p-4 text-left sm:gap-3 sm:p-5';
  const style = { animationDelay: `${0.05 + i * 0.07}s` };
  return to ? <Link to={to} className={cls} style={style}>{body}</Link> : <div className={cls} style={style}>{body}</div>;
};

const Attention = ({ icon, tone, title, sub, action, to, i }) => {
  const IconCmp = icon;
  return (
  <div className="sv-rise flex items-center gap-3.5 rounded-2xl p-3 transition-colors hover:bg-background-hover" style={{ animationDelay: `${0.3 + i * 0.07}s` }}>
    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TILE[tone]}`}><IconCmp size={20} /></span>
    <div className="min-w-0 flex-1">
      <p className="text-[15px] font-semibold text-text-primary">{title}</p>
      <p className="text-[13px] text-text-secondary">{sub}</p>
    </div>
    {to ? (
      <Link to={to} className="flex h-10 shrink-0 items-center gap-1 rounded-xl border border-primary-light px-3.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-light">
        {action}<ChevronRight size={16} />
      </Link>
    ) : (
      <StatusChip tone="ok">All clear</StatusChip>
    )}
  </div>
  );
};

const ORDER_COLS = 'grid-cols-[140px_minmax(0,1.3fr)_minmax(0,1.3fr)_110px_90px_130px]';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, can } = usePermission();
  const [s, setS] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get('/api/v1/admin/dashboard/stats').then((r) => setS(r.data.data)).catch(() => setErr(true));
  }, []);

  if (err) return <div className="p-6 text-sm text-text-secondary">Could not load the dashboard. Check your connection and refresh.</div>;
  if (!s) {
    return (
      <div className="grid gap-5 p-4 sm:grid-cols-2 sm:p-6 lg:p-8 xl:grid-cols-4">
        {[0, 1, 2, 3].map((k) => <div key={k} className="sv-card h-[150px] animate-pulse bg-primary-light/40" />)}
      </div>
    );
  }
  const m = s.money;
  const trend = s.trend ?? [];
  const peak = Math.max(1, ...trend.map((t) => Math.max(t.billed, t.collected)));
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="sv-rise flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-text-secondary">{today}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary-second sm:text-[30px]">
            {greeting()}, {(user?.name ?? '').split(' ')[0] || 'there'}
          </h1>
        </div>
        {can('orders', 'create') && (
          <button type="button" onClick={() => navigate('/orders/add')}
            className="flex h-11 items-center justify-center gap-2 self-start rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(30,58,138,.22)] transition-all hover:-translate-y-px hover:bg-primary-second sm:self-auto">
            <Plus size={18} />New order
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
        <Stat i={0} icon={ReceiptText} label="Billed this month" value={inr(m.billedThisMonth)} to="/billing" />
        <Stat i={1} icon={Wallet} label="Collected this month" value={inr(m.collectedThisMonth)} sub={m.collectedThisMonth ? null : 'No payments recorded yet'} to="/billing" />
        <Stat i={2} icon={ChartLine} label="Outstanding" value={inr(m.outstanding)} sub={m.dso != null ? `${m.dso} days of sales outstanding` : null} to="/reports" />
        <Stat i={3} icon={m.overdue60 ? TriangleAlert : CircleCheck} tone={m.overdue60 ? 'warn' : 'ok'} label="Overdue 60+ days"
          value={inr(m.overdue60)} sub={m.overdue60 ? 'Follow up on these first' : 'Nothing overdue'} to="/reports" />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <section className="sv-card sv-rise p-4 sm:p-5 xl:col-span-7" style={{ animationDelay: '.25s' }}>
          <div className="flex items-center justify-between px-2 pb-2">
            <h2 className="text-lg font-semibold text-primary-second">Needs attention</h2>
            <span className="text-[13px] text-text-secondary">Live</span>
          </div>
          <Attention i={0} icon={TriangleAlert} tone={m.awaitingChallans ? 'warn' : 'ok'} title="Completed, waiting for challans"
            sub={m.awaitingChallans ? `${plural(m.awaitingChallans, 'order')} can't be billed until the challan photo is in` : 'Every completed order is billed'}
            action="Review" to={m.awaitingChallans ? '/orders?status=COMPLETED' : null} />
          <Attention i={1} icon={ShoppingCart} tone="primary" title="New orders to confirm"
            sub={`${plural(s.orders.new, 'order')} placed and not yet confirmed`} action="Open" to={s.orders.new ? '/orders?status=NEW' : null} />
          <Attention i={2} icon={Truck} tone="primary" title="Active orders"
            sub={`${s.orders.active} on the road or at site`} action="Track" to={s.orders.active ? '/orders' : null} />
          <Attention i={3} icon={Wallet} tone={m.creditHolds ? 'warn' : 'ok'} title="Orders on credit hold"
            sub={m.creditHolds ? `${m.creditHolds} waiting for approval` : 'None right now'} action="Approve" to={m.creditHolds ? '/orders' : null} />
        </section>

        <section className="sv-card sv-rise flex flex-col gap-4 p-5 sm:p-6 xl:col-span-5" style={{ animationDelay: '.32s' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-primary-second">Billed vs collected</h2>
            <span className="text-[13px] text-text-secondary">Last 6 months</span>
          </div>
          <div className="flex h-[196px] items-end gap-2 border-b border-primary-light" role="img"
            aria-label={trend.map((t) => `${monthName(t.month)}: billed ${inr(t.billed)}, collected ${inr(t.collected)}`).join('; ')}>
            {trend.map((t, i) => (
              <div key={t.month} className="flex flex-1 items-end justify-center gap-1 sm:gap-1.5">
                <div title={`Billed ${inr(t.billed)}`} className="sv-grow-y w-3 rounded-t-md rounded-b-sm bg-primary sm:w-4"
                  style={{ height: `${Math.max(4, (t.billed / peak) * 180)}px`, animationDelay: `${0.4 + i * 0.08}s` }} />
                <div title={`Collected ${inr(t.collected)}`} className="sv-grow-y w-3 rounded-t-md rounded-b-sm bg-primary-bg-alt sm:w-4"
                  style={{ height: `${Math.max(4, (t.collected / peak) * 180)}px`, animationDelay: `${0.5 + i * 0.08}s` }} />
              </div>
            ))}
          </div>
          <div className="-mt-2 flex gap-2">
            {trend.map((t) => <span key={t.month} className="flex-1 text-center text-xs text-text-secondary">{monthName(t.month)}</span>)}
          </div>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-[13px] text-text-secondary">
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-primary" />Billed</span>
            <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-[3px] bg-primary-bg-alt" />Collected</span>
            <Link to="/reports" className="ml-auto font-semibold text-primary hover:underline">Open reports</Link>
          </div>
        </section>
      </div>

      <section className="sv-card sv-rise overflow-hidden" style={{ animationDelay: '.4s' }}>
        <div className="flex items-center justify-between px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold text-primary-second">Recent orders</h2>
          <Link to="/orders" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">View all<ArrowRight size={16} /></Link>
        </div>

        {/* Table on tablets and up */}
        <div className="hidden md:block">
          <div className={`grid ${ORDER_COLS} gap-4 bg-background-hover px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-text-secondary`}>
            <span>Order</span><span>Client</span><span>Project</span><span>Product</span><span>Qty</span><span>Status</span>
          </div>
          {s.recentOrders.map((o) => (
            <Link key={o.id} to={`/orders/${o.orderId}`}
              className={`grid ${ORDER_COLS} items-center gap-4 border-t border-primary-light px-6 py-3.5 text-sm text-text-primary transition-colors hover:bg-background-hover`}>
              <span className="font-semibold text-primary">{o.orderId}</span>
              <span className="truncate">{o.client?.companyName}</span>
              <span className="truncate text-text-secondary">{o.project?.projectName}</span>
              <span className="truncate">{o.productName} {o.productGrade}</span>
              <span className="tabular-nums">{o.quantity || '—'}</span>
              <span><StatusChip tone={o.creditHold ? 'warn' : orderTone(o.status)}>{o.creditHold ? 'Credit hold' : statusLabel(o.status)}</StatusChip></span>
            </Link>
          ))}
        </div>

        {/* Cards on phones */}
        <div className="divide-y divide-primary-light border-t border-primary-light md:hidden">
          {s.recentOrders.map((o) => (
            <Link key={o.id} to={`/orders/${o.orderId}`} className="flex flex-col gap-1.5 px-5 py-4 transition-colors active:bg-background-hover">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-primary">{o.orderId}</span>
                <StatusChip tone={o.creditHold ? 'warn' : orderTone(o.status)}>{o.creditHold ? 'Credit hold' : statusLabel(o.status)}</StatusChip>
              </div>
              <span className="text-sm text-text-primary">{o.client?.companyName}</span>
              <span className="text-[13px] text-text-secondary">{o.project?.projectName} · {o.productName} {o.productGrade}{o.quantity ? ` · ${o.quantity}` : ''}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: Building2, label: 'Active clients', value: s.clients.active, to: '/clients' },
          { icon: BriefcaseBusiness, label: 'Active projects', value: s.projects.active, to: '/projects' },
          { icon: CircleCheck, label: 'Orders completed', value: s.orders.completed, to: '/orders?status=COMPLETED' },
          { icon: Store, label: 'Vendors', value: s.vendors.total, to: '/vendors' },
        ].map(({ icon, label, value, to }, i) => {
          const IconCmp = icon;
          return (
          <Link key={label} to={to} className="sv-card sv-card-hover sv-rise flex items-center gap-3 p-4" style={{ animationDelay: `${0.45 + i * 0.05}s` }}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary"><IconCmp size={18} /></span>
            <span className="min-w-0">
              <span className="block text-xl font-bold tabular-nums text-primary-second">{value}</span>
              <span className="block truncate text-xs text-text-secondary">{label}</span>
            </span>
          </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
