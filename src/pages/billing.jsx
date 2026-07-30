import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import { Table } from '../components/ui';
import {
  BILLING_STATUSES,
  BILLING_STATUS_BADGE,
  billingData,
} from '../constant/billingData';

const StatusBadge = ({ value }) => {
  const cfg = BILLING_STATUS_BADGE[value] || {
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

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [productFilter, setProductFilter] = useState('All');

  const statusOptions = [
    { value: 'All', label: 'All' },
    ...BILLING_STATUSES.map((s) => ({ value: s, label: s })),
  ];

  const productOptions = [
    { value: 'All', label: 'All' },
    ...[...new Set(billingData.map((b) => b.product))].map((p) => ({
      value: p,
      label: p,
    })),
  ];

  const columns = [
    { key: 'orderNo', header: 'Order no.' },
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
    {
      key: 'billingStatus',
      header: 'Billing status',
      render: (value) => <StatusBadge value={value} />,
    },
    {
      key: 'action',
      header: 'Action',
      // Rendered as a column rather than a Table `action` so each row can offer
      // View or Upload depending on whether its bill exists yet.
      render: (_v, item) => {
        const isUploaded = item.billingStatus !== 'Not uploaded';
        return (
          <button
            type="button"
            onClick={() => navigate(`/billing/${item.id}`)}
            className="text-xs font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            {isUploaded ? 'View' : 'Upload'}
          </button>
        );
      },
    },
  ];

  const filteredBills = billingData
    .filter((b) => statusFilter === 'All' || b.billingStatus === statusFilter)
    .filter((b) => productFilter === 'All' || b.product === productFilter)
    .filter((b) => {
      const s = searchTerm.trim().toLowerCase();
      return (
        !s ||
        b.clientName.toLowerCase().includes(s) ||
        b.orderNo.toLowerCase().includes(s) ||
        b.product.toLowerCase().includes(s)
      );
    });

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
              placeholder="Search by name"
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
              width="130px"
              height="40px"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">Product:</span>
            <Dropdown
              options={productOptions}
              value={productFilter}
              onChange={setProductFilter}
              width="130px"
              height="40px"
            />
          </div>
        </div>

        <Button
          onClick={() =>
            toast.info('New Bill flow is not designed yet — coming soon.')
          }
          leftIcon={ICON_NAMES.PLUS}
          variant="primary"
          size="md"
          className="w-full lg:w-auto px-4 py-2 md:px-6 md:py-3 text-sm whitespace-nowrap"
        >
          New Bill
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table
            data={filteredBills}
            columns={columns}
            itemsPerPage={10}
            emptyMessage="No bills found"
          />
        </div>
      </div>
    </div>
  );
};

export default BillingPage;
