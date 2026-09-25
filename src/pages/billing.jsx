import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import { Table } from '../components/ui';
import billService from '../services/billService';
import { saveBlob } from '../services/reportService';
import { BILL_STATUSES, BILL_STATUS_BADGE } from '../constant/billingData';

const StatusBadge = ({ value }) => {
  const cfg = BILL_STATUS_BADGE[value] || {
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-background)',
  };
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.backgroundColor }}
    >
      {value}
    </span>
  );
};

const BillingPage = () => {
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [total, setTotal] = useState(0);
  const [totals, setTotals] = useState({ amount: 0, quantity: 0 });
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // G16: every filter runs on the server — no 200-row cap, totals are exact.
  const params = useCallback(() => ({
    limit: 1000,
    status: statusFilter === 'All' ? undefined : statusFilter,
    search: searchTerm.trim() || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  }), [statusFilter, searchTerm, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await billService.getBills(params());
        setBills(res.data || []);
        setTotal(res.total || 0);
        setTotals(res.totals || { amount: 0, quantity: 0 });
      } catch {
        toast.error('Failed to load bills');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [params]);

  const exportExcel = async () => {
    try {
      const blob = await billService.exportBills({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined });
      saveBlob(blob, `Shivesh_Sales-register_${dateFrom || 'FY'}_${dateTo || ''}.xlsx`);
    } catch (e) {
      toast.error(e.response?.status === 403 ? 'You need the Reports → Export permission' : 'Export failed');
    }
  };

  const statusOptions = [
    { value: 'All', label: 'All' },
    ...BILL_STATUSES.map((s) => ({ value: s, label: s })),
  ];

  const columns = [
    { key: 'billNo', header: 'Bill no.' },
    { key: 'orderId', header: 'Order no.' },
    { key: 'clientName', header: 'Client' },
    {
      key: 'product',
      header: 'Product & Qty.',
      render: (_v, item) => (
        <div className="leading-tight">
          <div className="font-medium">{item.product}</div>
          <div className="text-text-secondary">{item.quantity}</div>
        </div>
      ),
    },
    { key: 'assignedTrucks', header: 'Assigned Trucks' },
    { key: 'issueDate', header: 'Invoice date', render: (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '—') },
    { key: 'amount', header: 'Amount (₹)', render: (v) => Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }) },
    {
      key: 'status',
      header: 'Billing status',
      render: (value, item) => (
        <div className="flex flex-col gap-1 items-start">
          <StatusBadge value={value} />
          {item.daysOverdue > 0 && <span className="text-xs text-red-600 font-medium">Overdue · {item.daysOverdue} days</span>}
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (_v, item) => (
        <button
          type="button"
          onClick={() => navigate(`/billing/${item.billNo}`)}
          className="text-xs font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          View
        </button>
      ),
    },
  ];

  const rows = bills
    .map((b) => ({
      ...b,
      orderId: b.order?.orderId || '—',
      clientName: b.order?.client?.companyName || '—',
      product: `${b.order?.productName || ''}${b.order?.productGrade ? ` (${b.order.productGrade})` : ''}`,
      quantity: b.quantity ?? '—',
      assignedTrucks: b.assignedTrucks ?? 0,
    }));
  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">
          Billing list
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          View and manage orders and trucks
        </p>
      </div>

      {/* Search + Filters + New Bill */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center lg:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-full sm:max-w-[300px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search bill, order or client"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Status:</span>
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              width="140px"
              height="40px"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2 py-2" title="Invoice date from" />
          <span className="text-sm text-gray-500">to</span>
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-2 py-2" title="Invoice date to" />
          <Button onClick={exportExcel} variant="primary" size="md" className="px-4 py-2 text-sm whitespace-nowrap">
            Export Excel
          </Button>
        </div>

        {/* <Button
          onClick={() =>
            toast.info('Bills are generated automatically when an order is marked COMPLETED.')
          }
          leftIcon={ICON_NAMES.PLUS}
          variant="primary"
          size="md"
          className="w-full lg:w-auto px-4 py-2 md:px-6 md:py-3 text-sm whitespace-nowrap"
        >
          New Bill
        </Button> */}
      </div>

      <div className="mb-3 text-sm text-gray-700">
        {total} bill(s) · Total qty <b>{Number(totals.quantity).toLocaleString('en-IN')}</b> · Total amount{' '}
        <b>₹{Number(totals.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</b>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table
            data={rows}
            columns={columns}
            loading={loading}
            itemsPerPage={10}
            emptyMessage="No bills found"
            mainTotalItems={total}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
