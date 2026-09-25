import { useCallback, useEffect, useState } from 'react';
import { StatusChip } from '../components/ui/StatusChip';
import Tabs from '../components/ui/Tabs';
import usePermission from '../hooks/usePermission';
import { PaymentBehaviourTab, CollectionsTab, OrderPatternsTab, AccountsTaxTab } from '../components/reports/ReportTabs';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Dropdown from '../components/ui/Dropdown';
import Modal from '../components/ui/Modal';
import { Table } from '../components/ui';
import reportService from '../services/reportService';

/** Indian-format currency, e.g. ₹12,50,000. */
const money = (n) =>
  `₹${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;

const shortDate = (v) => (v ? new Date(v).toLocaleDateString('en-IN') : '—');

/**
 * Colour per risk band. Kept in one place so the badge, the summary tile and
 * the detail modal can never disagree about what HIGH looks like.
 */
const RISK_STYLES = {
  CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  LOW: { bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
};

const RISK_OPTIONS = [
  { value: '', label: 'All risk levels' },
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

function RiskBadge({ level }) {
  return <StatusChip status={level} />;
}

function SummaryTile({ label, value, hint, accent = 'text-gray-900' }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 md:p-5">
      <p className="text-xs md:text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-xl md:text-2xl font-semibold ${accent}`}>{value}</p>
      {hint ? <p className="text-xs text-gray-400 mt-1">{hint}</p> : null}
    </div>
  );
}

/**
 * Client credit-risk report.
 *
 * Answers two questions the office actually asks: WHO is not paying, and HOW
 * RISKY is each client. Both come from `GET /admin/reports/credit-risk`, which
 * scores every client from their bills — this page only renders, it does no
 * risk maths of its own, so the panel and any other consumer can never
 * disagree about a client's band.
 */
function CreditRiskReport() {
  const [summary, setSummary] = useState(null);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [riskLevel, setRiskLevel] = useState('');
  const [onlyOutstanding, setOnlyOutstanding] = useState(false);

  // Drill-down
  const [selected, setSelected] = useState(null);
  const [bills, setBills] = useState([]);
  const [billsLoading, setBillsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reportService.getCreditRisk({
        ...(riskLevel ? { riskLevel } : {}),
        ...(onlyOutstanding ? { onlyOutstanding: 'true' } : {}),
      });
      setSummary(res.data?.summary || null);
      setClients(res.data?.clients || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load the report');
    } finally {
      setLoading(false);
    }
  }, [riskLevel, onlyOutstanding]);

  useEffect(() => {
    load();
  }, [load]);

  // Search is applied client-side: the whole client list is already in memory,
  // so round-tripping every keystroke would only add latency.
  const rows = clients.filter((c) => {
    const s = searchTerm.trim().toLowerCase();
    if (!s) return true;
    return (
      c.companyName?.toLowerCase().includes(s) ||
      c.ownerName?.toLowerCase().includes(s) ||
      c.clientId?.toLowerCase().includes(s)
    );
  });

  const openClient = async (client) => {
    setSelected(client);
    setBills([]);
    setBillsLoading(true);
    try {
      const res = await reportService.getClientOutstandingBills(client.clientId);
      setBills(res.data?.bills || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load unpaid bills');
    } finally {
      setBillsLoading(false);
    }
  };

  const columns = [
    {
      key: 'companyName',
      header: 'Client',
      render: (_v, item) => (
        <div>
          <div className="font-medium text-gray-900">{item.companyName}</div>
          <div className="text-xs text-gray-500">
            {item.clientId}
            {item.ownerName ? ` · ${item.ownerName}` : ''}
          </div>
        </div>
      ),
    },
    {
      key: 'riskLevel',
      header: 'Risk',
      render: (_v, item) => (
        <div className="flex items-center gap-2">
          <RiskBadge level={item.riskLevel} />
          <span className="text-xs text-gray-400">{item.riskScore}</span>
        </div>
      ),
    },
    {
      key: 'outstanding',
      header: 'Outstanding',
      render: (v) => <span className="font-medium">{money(v)}</span>,
    },
    {
      key: 'overdueAmount',
      header: 'Overdue',
      render: (v, item) => (
        <div>
          <div className={v > 0 ? 'font-medium text-red-600' : ''}>
            {money(v)}
          </div>
          {item.overdueBillCount > 0 && (
            <div className="text-xs text-gray-500">
              {item.overdueBillCount} bill
              {item.overdueBillCount === 1 ? '' : 's'}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'oldestOverdueDays',
      header: 'Oldest due',
      render: (v) => (v > 0 ? `${v} days` : '—'),
    },
    {
      key: 'creditUtilisation',
      header: 'Credit used',
      render: (v, item) =>
        v === null || v === undefined ? (
          <span className="text-gray-400">No limit set</span>
        ) : (
          <div>
            <div className={v >= 100 ? 'text-red-600 font-medium' : ''}>
              {v}%
            </div>
            <div className="text-xs text-gray-500">of {money(item.creditLimit)}</div>
          </div>
        ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (_v, item) => (
        <button
          type="button"
          onClick={() => openClient(item)}
          className="text-xs font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          View bills
        </button>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">
          Reports
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Which clients are not clearing their dues, and how risky each one is
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
        <SummaryTile
          label="Total outstanding"
          value={money(summary?.totalOutstanding)}
          hint="Billed, not yet paid"
        />
        <SummaryTile
          label="Overdue"
          value={money(summary?.totalOverdue)}
          hint="Past the due date"
          accent="text-red-600"
        />
        <SummaryTile
          label="Clients not paying"
          value={summary?.clientsWithOverdue ?? 0}
          hint={`of ${summary?.clientCount ?? 0} clients`}
          accent="text-orange-600"
        />
        <SummaryTile
          label="High / critical risk"
          value={(summary?.byRisk?.HIGH || 0) + (summary?.byRisk?.CRITICAL || 0)}
          hint={`${summary?.byRisk?.CRITICAL || 0} critical · ${summary?.byRisk?.HIGH || 0} high`}
          accent="text-red-600"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 md:mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-[320px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
          </div>
          <input
            type="text"
            placeholder="Search client, owner or ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <Dropdown
          options={RISK_OPTIONS}
          value={riskLevel}
          placeholder="All risk levels"
          width="180px"
          height="40px"
          onChange={setRiskLevel}
        />

        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={onlyOutstanding}
            onChange={(e) => setOnlyOutstanding(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          Only clients who owe money
        </label>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table
            data={rows}
            columns={columns}
            loading={loading}
            itemsPerPage={10}
            emptyMessage="No clients match this filter"
          />
        </div>
      </div>

      {/* Drill-down */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected ? selected.companyName : ''}
        size="3xl"
        showHeaderIcon={false}
      >
        {selected && (
          <div>
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <RiskBadge level={selected.riskLevel} />
              <span className="text-sm text-gray-500">
                Risk score {selected.riskScore}/100
              </span>
              {selected.contactNumber && (
                <span className="text-sm text-gray-500">
                  · {selected.contactNumber}
                </span>
              )}
            </div>

            {/* Why this client is risky */}
            {selected.reasons?.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Why
                </p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {selected.reasons.map((r) => (
                    <li key={r}>• {r}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-5">
              <div>
                <span className="text-gray-500">Total billed</span>
                <div className="font-medium">{money(selected.totalBilled)}</div>
              </div>
              <div>
                <span className="text-gray-500">Collected</span>
                <div className="font-medium text-green-600">
                  {money(selected.collected)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Outstanding</span>
                <div className="font-medium">{money(selected.outstanding)}</div>
              </div>
              <div>
                <span className="text-gray-500">Overdue</span>
                <div className="font-medium text-red-600">
                  {money(selected.overdueAmount)}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Pays on time</span>
                <div className="font-medium">
                  {selected.onTimeRate === null
                    ? 'No history'
                    : `${selected.onTimeRate}%`}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Avg. days late</span>
                <div className="font-medium">
                  {selected.avgDaysToPay === null
                    ? '—'
                    : `${selected.avgDaysToPay} days`}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Credit limit</span>
                <div className="font-medium">
                  {selected.creditLimit > 0 ? money(selected.creditLimit) : 'Not set'}
                </div>
              </div>
              <div>
                <span className="text-gray-500">Credit used</span>
                <div className="font-medium">
                  {selected.creditUtilisation === null
                    ? '—'
                    : `${selected.creditUtilisation}%`}
                </div>
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
              Unpaid bills
            </p>

            {billsLoading ? (
              <p className="text-sm text-gray-500 py-4">Loading bills…</p>
            ) : bills.length === 0 ? (
              <p className="text-sm text-gray-500 py-4">
                Nothing unpaid — this client is fully settled.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b">
                      <th className="py-2 pr-4 font-medium">Bill</th>
                      <th className="py-2 pr-4 font-medium">Order</th>
                      <th className="py-2 pr-4 font-medium">Amount</th>
                      <th className="py-2 pr-4 font-medium">Due</th>
                      <th className="py-2 pr-4 font-medium">Late by</th>
                      <th className="py-2 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((b) => (
                      <tr key={b.billNo} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{b.billNo}</td>
                        <td className="py-2 pr-4">
                          <div>{b.orderId || '—'}</div>
                          {b.projectName && (
                            <div className="text-xs text-gray-500">
                              {b.projectName}
                            </div>
                          )}
                        </td>
                        <td className="py-2 pr-4">{money(b.amount)}</td>
                        <td className="py-2 pr-4">{shortDate(b.dueDate)}</td>
                        <td className="py-2 pr-4">
                          {b.daysOverdue > 0 ? (
                            <span className="text-red-600 font-medium">
                              {b.daysOverdue} days
                            </span>
                          ) : (
                            <span className="text-gray-400">Not due</span>
                          )}
                        </td>
                        <td className="py-2">{b.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}


/** Reports: credit risk (existing) + Phase 1B analytics and Accounts & Tax exports. */
export default function ReportsPage() {
  const { can } = usePermission();
  const tabs = [
    { label: 'Credit risk', content: <CreditRiskReport /> },
    { label: 'Payment behaviour', content: <div className="p-4 md:p-6"><PaymentBehaviourTab /></div> },
    { label: 'Collections', content: <div className="p-4 md:p-6"><CollectionsTab /></div> },
    { label: 'Order patterns', content: <div className="p-4 md:p-6"><OrderPatternsTab /></div> },
    ...(can('reports', 'export') ? [{ label: 'Accounts & Tax', content: <div className="p-4 md:p-6"><AccountsTaxTab /></div> }] : []),
  ];
  return (
    <div className="pt-4 px-4 md:px-6">
      <Tabs tabs={tabs} />
    </div>
  );
}
