import { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Button from '../components/ui/Button';
import { getBillById, TM_STATUS_BADGE } from '../constant/billingData';

const Card = ({ title, children, className = '' }) => (
  <div
    className={`bg-input-bg rounded-lg border border-[#6D8FEFA6] p-4 md:p-5 ${className}`}
  >
    {title && (
      <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-4">
        {title}
      </h3>
    )}
    {children}
  </div>
);

const Field = ({ label, value, action }) => (
  <div>
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-text-secondary">{label}</span>
      {action}
    </div>
    <div className="text-sm font-medium text-text-primary mt-1">{value || '—'}</div>
  </div>
);

const TmStatusBadge = ({ value }) => {
  const cfg = TM_STATUS_BADGE[value] || {
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

const TmCard = ({ tm, onQuantityChange, onAddChallan }) => {
  const [editingQty, setEditingQty] = useState(false);
  const [qtyDraft, setQtyDraft] = useState(tm.quantity);
  const fileInputRef = useRef(null);

  const commitQty = () => {
    onQuantityChange(tm.id, qtyDraft.trim() || tm.quantity);
    setEditingQty(false);
  };

  const handleViewChallan = () => {
    if (!tm.challanUrl) {
      toast.info('No challan uploaded for this TM yet.');
      return;
    }
    window.open(tm.challanUrl, '_blank', 'noopener,noreferrer');
  };

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) onAddChallan(tm.id, file.name);
    e.target.value = '';
  };

  return (
    <Card className="mb-4">
      {/* TM header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h4 className="text-sm md:text-base font-semibold text-gray-800">{tm.id}</h4>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleViewChallan}
            className="text-xs font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            View challan
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs font-medium hover:underline"
            style={{ color: 'var(--color-primary)' }}
          >
            <Icon name={ICON_NAMES.PLUS} size={14} color="var(--color-primary)" />
            Add challan
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={handleFilePicked}
          />
        </div>
      </div>

      {/* TM fields */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
        <Field label="Truck No." value={tm.truckNo} />

        {editingQty ? (
          <div>
            <span className="text-xs text-text-secondary">Quantity</span>
            <div className="flex items-center gap-1 mt-1">
              <input
                type="text"
                value={qtyDraft}
                autoFocus
                onChange={(e) => setQtyDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') commitQty();
                  if (e.key === 'Escape') {
                    setQtyDraft(tm.quantity);
                    setEditingQty(false);
                  }
                }}
                className="w-20 text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              />
              <button
                type="button"
                onClick={commitQty}
                className="text-xs font-medium text-green-700 hover:underline"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <Field
            label="Quantity"
            value={tm.quantity}
            action={
              <button
                type="button"
                onClick={() => {
                  setQtyDraft(tm.quantity);
                  setEditingQty(true);
                }}
                title="Edit quantity"
                className="hover:opacity-70"
              >
                <Icon name={ICON_NAMES.EDIT} size={12} color="var(--color-primary)" />
              </button>
            }
          />
        )}

        <Field label="Batch Start Time" value={tm.batchStartTime} />
        <Field label="Batch End Time" value={tm.batchEndTime} />
        <Field label="Challan No." value={tm.challanNo} />
      </div>

      {/* TM status */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div>
          <span className="text-xs text-text-secondary">Status</span>
          <div className="mt-1">
            <TmStatusBadge value={tm.status} />
          </div>
        </div>
        {tm.status === 'Rejected' && <Field label="Reason" value={tm.reason} />}
      </div>
    </Card>
  );
};

export default function BillDetails() {
  const { billId } = useParams();
  const navigate = useNavigate();

  const [bill, setBill] = useState(() => getBillById(billId));
  const [showActivityLog, setShowActivityLog] = useState(false);

  if (!bill) {
    return (
      <div className="p-8 text-center text-gray-500">
        Bill not found.
        <button
          className="ml-3 text-primary underline"
          onClick={() => navigate('/billing')}
        >
          Back to billing
        </button>
      </div>
    );
  }

  const d = bill.billDetails;
  const tech = bill.fieldTechnician;

  const patchTm = (tmId, patch) =>
    setBill((p) => ({
      ...p,
      tmDetails: p.tmDetails.map((t) => (t.id === tmId ? { ...t, ...patch } : t)),
    }));

  const handleQuantityChange = (tmId, quantity) => {
    patchTm(tmId, { quantity });
    toast.success('Quantity updated');
  };

  const handleAddChallan = (tmId, fileName) => {
    patchTm(tmId, { challanNo: fileName, challanUrl: '#' });
    toast.success(`Challan "${fileName}" attached to ${tmId}`);
  };

  const handleDownload = () => {
    toast.info('Bill PDF download will be available once billing APIs are wired up.');
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back + Download */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <button
          onClick={() => navigate('/billing')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">
            {bill.orderNo}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{bill.clientName}</p>
        </div>
        <Button
          onClick={handleDownload}
          leftIcon={ICON_NAMES.DOWNLOAD}
          variant="primary"
          size="md"
          className="px-4 py-2 md:px-5 md:py-2.5 text-sm whitespace-nowrap"
        >
          Download Bill(PDF)
        </Button>
      </div>

      {/* Bill details */}
      <Card title="Bill details" className="mb-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
          <Field label="Product" value={d.product} />
          <Field label="Grade" value={d.grade} />
          <Field label="Quantity" value={d.quantity} />
          <Field label="Client name" value={d.clientName} />
          <Field label="Site" value={d.site} />
          <Field label="Contact no." value={d.contactNo} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Field label="Order no." value={d.orderNo} />
          <Field label="Vendor name" value={d.vendorName} />
          <Field label="Date" value={d.date} />
          <Field label="Amount" value={d.amount} />
        </div>
      </Card>

      {/* Field Technician details */}
      <Card title="Field Technician details" className="mb-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Field label="Field technician name" value={tech.name} />
          <Field label="Contact no." value={tech.contactNo} />
          <Field label="Employee ID" value={tech.employeeId} />
        </div>
      </Card>

      {/* TM details */}
      <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
        TM details
      </h2>
      {bill.tmDetails.map((tm) => (
        <TmCard
          key={tm.id}
          tm={tm}
          onQuantityChange={handleQuantityChange}
          onAddChallan={handleAddChallan}
        />
      ))}

      {/* Activity log */}
      <Card>
        <button
          type="button"
          onClick={() => setShowActivityLog((p) => !p)}
          className="w-full flex items-center justify-between"
        >
          <h3 className="text-sm md:text-base font-semibold text-gray-800">
            Activity log
          </h3>
          <Icon
            name={showActivityLog ? ICON_NAMES.CHEVRON_UP : ICON_NAMES.CHEVRON_DOWN}
            size={18}
          />
        </button>

        {showActivityLog && (
          <div className="mt-4 space-y-3">
            {bill.activityLog.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              bill.activityLog.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 border-b border-[#6D8FEF33] pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">by {a.by}</p>
                  </div>
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {a.at}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
