import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import FullPageLoader from '../components/ui/FullPageLoader';
import api from '../services/api';
import {
  clearCurrentBill,
  deleteBill,
  fetchBillByNo,
  setTmApproval,
  updateBillStatus,
  uploadBillDocument,
  uploadTmChallan,
} from '../features/bills/billSlice';
import { BILL_STATUSES, BILL_STATUS_BADGE, TM_APPROVAL_BADGE } from '../constant/billingData';

const ORIGIN = api.defaults.baseURL;
const LOCKED_STATUSES = ['PAID', 'CANCELLED'];

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
    <div className="text-sm font-medium text-text-primary mt-1">{value ?? '—'}</div>
  </div>
);

const StatusBadge = ({ value, badgeMap = BILL_STATUS_BADGE }) => {
  const cfg = badgeMap[value] || {
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

const TmCard = ({ tm, locked, onUploadChallan, onAccept, onReject }) => {
  const fileInputRef = useRef(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const handleViewChallan = () => {
    if (!tm.challanUrl) {
      toast.info('No challan uploaded for this TM yet.');
      return;
    }
    window.open(`${ORIGIN}${tm.challanUrl}`, '_blank', 'noopener,noreferrer');
  };

  const handleFilePicked = (e) => {
    const file = e.target.files?.[0];
    if (file) onUploadChallan(tm.id, file);
    e.target.value = '';
  };

  const submitReject = () => {
    if (!reason.trim()) {
      toast.error('A rejection reason is required.');
      return;
    }
    onReject(tm.id, reason.trim());
    setRejecting(false);
    setReason('');
  };

  return (
    <Card className="mb-4">
      {/* TM header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h4 className="text-sm md:text-base font-semibold text-gray-800">{tm.tmNumber}</h4>
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
            {tm.challanUrl ? 'Replace challan' : 'Add challan'}
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
        <Field label="Quantity" value={tm.qty} />
        <Field label="Batch Start Time" value={tm.batchStartTime} />
        <Field label="Batch End Time" value={tm.batchEndTime} />
        <Field label="Challan No." value={tm.challanNo} />
      </div>

      {/* TM status */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        <div>
          <span className="text-xs text-text-secondary">Status</span>
          <div className="mt-1">
            <StatusBadge value={tm.approvalStatus} badgeMap={TM_APPROVAL_BADGE} />
          </div>
        </div>
        {tm.approvalStatus === 'REJECTED' && <Field label="Reason" value={tm.rejectionReason} />}

        {!locked && tm.approvalStatus !== 'ACCEPTED' && !rejecting && (
          <div className="flex items-end gap-2 col-span-2">
            <button
              type="button"
              onClick={() => onAccept(tm.id)}
              className="text-xs font-medium text-green-700 hover:underline"
            >
              Accept
            </button>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="text-xs font-medium text-red-600 hover:underline"
            >
              Reject
            </button>
          </div>
        )}
      </div>

      {rejecting && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection"
            className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
          />
          <button type="button" onClick={submitReject} className="text-xs font-medium text-red-600 hover:underline">
            Confirm Reject
          </button>
          <button type="button" onClick={() => { setRejecting(false); setReason(''); }} className="text-xs font-medium text-gray-500 hover:underline">
            Cancel
          </button>
        </div>
      )}
    </Card>
  );
};

export default function BillDetails() {
  const { billId: billNo } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { currentBill: bill, loading } = useSelector((s) => s.bills);

  const [showActivityLog, setShowActivityLog] = useState(false);
  const [statusDraft, setStatusDraft] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const docInputRef = useRef(null);

  useEffect(() => {
    dispatch(fetchBillByNo(billNo));
    return () => dispatch(clearCurrentBill());
  }, [dispatch, billNo]);

  useEffect(() => {
    if (bill) setStatusDraft(bill.status || '');
  }, [bill?.status]);

  if (loading && !bill) return <FullPageLoader />;

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

  const d = bill.billDetails || {};
  const techs = bill.fieldTechnicians || [];
  const locked = LOCKED_STATUSES.includes(bill.status);

  const handleUploadChallan = async (tmId, file) => {
    await dispatch(uploadTmChallan({ billNo, tmId, file }));
  };

  const handleAccept = async (tmId) => {
    await dispatch(setTmApproval({ billNo, tmId, data: { approvalStatus: 'ACCEPTED' } }));
  };

  const handleReject = async (tmId, rejectionReason) => {
    await dispatch(setTmApproval({ billNo, tmId, data: { approvalStatus: 'REJECTED', rejectionReason } }));
  };

  const handleUpdateStatus = async () => {
    if (statusDraft === bill.status) return;
    setUpdatingStatus(true);
    try {
      await dispatch(updateBillStatus({ billNo, status: statusDraft }));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDocumentPicked = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingDoc(true);
    try {
      await dispatch(uploadBillDocument({ billNo, file }));
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete bill ${billNo}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      const result = await dispatch(deleteBill(billNo));
      if (deleteBill.fulfilled.match(result)) navigate('/billing');
    } finally {
      setDeleting(false);
    }
  };

  const statusOptions = BILL_STATUSES.map((s) => ({ value: s, label: s }));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back + Actions */}
      <div className="flex items-center gap-3 mb-4 md:mb-6 flex-wrap">
        <button
          onClick={() => navigate('/billing')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900">{bill.billNo}</h1>
            <StatusBadge value={bill.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{d.clientName}</p>
        </div>

        {/* {bill.documentUrl ? (
          <Button
            onClick={() => window.open(`${ORIGIN}${bill.documentUrl}`, '_blank', 'noopener,noreferrer')}
            leftIcon={ICON_NAMES.DOWNLOAD}
            variant="primary"
            size="md"
            className="px-4 py-2 md:px-5 md:py-2.5 text-sm whitespace-nowrap"
          >
            View Bill Document
          </Button>
        ) : (
          <Button
            onClick={() => docInputRef.current?.click()}
            leftIcon={ICON_NAMES.UPLOAD}
            variant="primary"
            size="md"
            disabled={uploadingDoc}
            className="px-4 py-2 md:px-5 md:py-2.5 text-sm whitespace-nowrap"
          >
            {uploadingDoc ? 'Uploading...' : 'Attach Bill Document'}
          </Button>
        )} */}
        <input ref={docInputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDocumentPicked} />

        {!locked && (
          <Button
            onClick={handleDelete}
            variant="danger"
            size="md"
            disabled={deleting}
            className="px-4 py-2 md:px-5 md:py-2.5 text-sm whitespace-nowrap"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        )}
      </div>

      {/* Status control */}
      <Card className="mb-5">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-48">
            <span className="block text-xs text-text-secondary mb-2">Bill status</span>
            <Dropdown
              options={statusOptions}
              value={statusDraft}
              width="100%"
              height="40px"
              disabled={locked}
              onChange={setStatusDraft}
            />
          </div>
          <Button
            type="button"
            variant="primary"
            onClick={handleUpdateStatus}
            disabled={locked || updatingStatus || statusDraft === bill.status}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
          {locked && (
            <span className="text-xs text-text-secondary">
              This bill is {bill.status.toLowerCase()} and can no longer be edited.
            </span>
          )}
        </div>
      </Card>

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
          <Field label="Rate" value={d.rate} />
          <Field label="Amount" value={d.amount} />
        </div>
      </Card>

      {/* Field Technician details */}
      {techs.length > 0 && (
        <Card title="Field Technician details" className="mb-5">
          <div className="space-y-3">
            {techs.map((tech) => (
              <div key={tech.id} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <Field label="Field technician name" value={tech.name} />
                <Field label="Contact no." value={tech.contactNo} />
                <Field label="Employee ID" value={tech.employeeId} />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TM details */}
      <h2 className="text-base md:text-lg font-semibold text-gray-800 mb-3">
        TM details
      </h2>
      {(bill.tmDetails || []).map((tm) => (
        <TmCard
          key={tm.id}
          tm={tm}
          locked={locked}
          onUploadChallan={handleUploadChallan}
          onAccept={handleAccept}
          onReject={handleReject}
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
            {(bill.activityLog || []).length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              bill.activityLog.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start justify-between gap-3 border-b border-[#6D8FEF33] pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium text-text-primary">{a.title}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{a.description}</p>
                    <p className="text-xs text-text-secondary mt-0.5">by {a.createdBy}</p>
                  </div>
                  <span className="text-xs text-text-secondary whitespace-nowrap">
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ''}
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
