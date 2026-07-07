import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  addOrderComment,
  clearCurrentOrder,
  deleteOrder,
  fetchFieldTechs,
  fetchOrderById,
  updateOrder,
} from '../features/orders/orderSlice';
import { fetchVendors } from '../features/vendors/vendorSlice';
import vendorService from '../services/vendorService';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import FullPageLoader from '../components/ui/FullPageLoader';
import DeleteModal from '../components/modals/DeleteModal';
import { ICON_NAMES, Icon } from '../components/icons';

const ORDER_STATUSES = ['NEW', 'CONFIRMED', 'IN_PROGRESS', 'DELIVERED', 'COMPLETED', 'CANCELLED'];
const DELIVERY_STATUSES = ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED'];

const STATUS_BADGE = {
  NEW:         { color: '#2563EB', backgroundColor: '#DBEAFE' },
  CONFIRMED:   { color: '#7C3AED', backgroundColor: '#EDE9FE' },
  IN_PROGRESS: { color: '#D97706', backgroundColor: '#FEF3C7' },
  DELIVERED:   { color: '#0891B2', backgroundColor: '#CFFAFE' },
  COMPLETED:   { color: '#16A34A', backgroundColor: '#D1FAE5' },
  CANCELLED:   { color: '#DC2626', backgroundColor: '#FECACA' },
};

const EMPTY_EDIT_FORM = {
  status: '',
  deliveryStatus: '',
  assignedToId: '',
  vendorId: '',
  vendorLocationId: '',
  vendorHandlerId: '',
  date: '',
  time: '',
  deliveryAddress: '',
};

const StatusBadge = ({ value }) => {
  const cfg = STATUS_BADGE[value] || { color: '#374151', backgroundColor: '#F3F4F6' };
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
      style={{ color: cfg.color, backgroundColor: cfg.backgroundColor }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: cfg.color }} />
      {value}
    </span>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex items-start py-2 border-b border-gray-100 last:border-0">
    <span className="w-40 text-sm text-gray-500 shrink-0">{label}</span>
    <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
  </div>
);

const SectionCard = ({ title, children, action }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      {action}
    </div>
    {children}
  </div>
);

const FieldLabel = ({ children }) => (
  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
    {children}
  </label>
);

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const commentsEndRef = useRef(null);

  const { currentOrder: order, loading, fieldTechs } = useSelector((s) => s.orders);
  const { list: vendors = [] } = useSelector((s) => s.vendor);

  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [locations, setLocations] = useState([]);
  const [handlers, setHandlers] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingHandlers, setLoadingHandlers] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    dispatch(fetchFieldTechs());
    dispatch(fetchVendors());
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, orderId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.comments?.length]);

  const setField = (field, value) => setEditForm((p) => ({ ...p, [field]: value }));

  const handleVendorChange = (vendorId) => {
    setEditForm((p) => ({ ...p, vendorId, vendorLocationId: '', vendorHandlerId: '' }));
    setLocations([]);
    setHandlers([]);

    if (vendorId) {
      setLoadingLocations(true);
      vendorService
        .getLocationbyVendorId(vendorId)
        .then((res) => setLocations(res.data || []))
        .catch(() => setLocations([]))
        .finally(() => setLoadingLocations(false));
    }
  };

  const handleLocationChange = (vendorLocationId) => {
    setEditForm((p) => ({ ...p, vendorLocationId, vendorHandlerId: '' }));
    setHandlers([]);

    if (vendorLocationId) {
      setLoadingHandlers(true);
      vendorService
        .getHandlersforLocation(vendorLocationId)
        .then((res) => setHandlers(res.data || []))
        .catch(() => setHandlers([]))
        .finally(() => setLoadingHandlers(false));
    }
  };

  const handleEnterEdit = () => {
    setEditForm({
      status: order.status || '',
      deliveryStatus: order.deliveryStatus || '',
      assignedToId: order.assignedTo?.id ? String(order.assignedTo.id) : order.assignedToId ? String(order.assignedToId) : '',
      vendorId: order.vendor?.id ? String(order.vendor.id) : '',
      vendorLocationId: order.vendorLocation?.id ? String(order.vendorLocation.id) : '',
      vendorHandlerId: order.vendorHandler?.id ? String(order.vendorHandler.id) : '',
      date: order.date || '',
      time: order.time || '',
      deliveryAddress: order.deliveryAddress || '',
    });
    setLocations([]);
    setHandlers([]);

    if (order.vendor?.id) {
      setLoadingLocations(true);
      vendorService
        .getLocationbyVendorId(order.vendor.id)
        .then((res) => {
          const locs = res.data || [];
          setLocations(locs);
          if (order.vendorLocation?.id) {
            setLoadingHandlers(true);
            vendorService
              .getHandlersforLocation(order.vendorLocation.id)
              .then((r) => setHandlers(r.data || []))
              .catch(() => setHandlers([]))
              .finally(() => setLoadingHandlers(false));
          }
        })
        .catch(() => setLocations([]))
        .finally(() => setLoadingLocations(false));
    }

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(EMPTY_EDIT_FORM);
    setLocations([]);
    setHandlers([]);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await dispatch(updateOrder({
        orderId,
        status: editForm.status,
        deliveryStatus: editForm.deliveryStatus,
        assignedToId: editForm.assignedToId ? parseInt(editForm.assignedToId) : null,
        vendorId: editForm.vendorId ? parseInt(editForm.vendorId) : null,
        vendorLocationId: editForm.vendorLocationId ? parseInt(editForm.vendorLocationId) : null,
        vendorHandlerId: editForm.vendorHandlerId ? parseInt(editForm.vendorHandlerId) : null,
        date: editForm.date,
        time: editForm.time,
        deliveryAddress: editForm.deliveryAddress,
      }));
      if (updateOrder.fulfilled.match(result)) {
        await dispatch(fetchOrderById(orderId));
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const result = await dispatch(deleteOrder(orderId));
      if (deleteOrder.fulfilled.match(result)) navigate('/orders');
    } finally {
      setDeleting(false);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    await dispatch(addOrderComment({ orderId, message: commentText.trim() }));
    setCommentText('');
    setSendingComment(false);
  };

  if (loading && !order) return <FullPageLoader />;
  if (!order) return (
    <div className="p-8 text-center text-gray-500">
      Order not found.
      <button className="ml-3 text-primary underline" onClick={() => navigate('/orders')}>Back to orders</button>
    </div>
  );

  const statusOptions = ORDER_STATUSES.map((s) => ({ value: s, label: s }));
  const deliveryStatusOptions = DELIVERY_STATUSES.map((s) => ({ value: s, label: s }));

  const techOptions = [
    { value: '', label: 'Unassigned' },
    ...fieldTechs.map((t) => ({
      value: String(t.id),
      label: `${t.name} (${t.employeeId})`,
    })),
  ];

  const vendorOptions = vendors.map((v) => ({
    value: String(v.id),
    label: v.companyName || v.name,
  }));

  const locationOptions = locations.map((l) => ({
    value: String(l.id),
    label: l.address || l.name,
  }));

  const handlerOptions = handlers.map((h) => ({
    value: String(h.id),
    label: `${h.name}${h.phone ? ` (${h.phone})` : ''}`,
  }));

  return (
    <div className="p-4 md:p-6 lg:p-8 ">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-gray-900">{order.orderId}</h1>
            <StatusBadge value={order.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">
            {order.project?.projectName} · {order.client?.companyName}
          </p>
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <Button type="button" onClick={handleCancelEdit} disabled={saving}>
              Cancel
            </Button>
            <Button type="button" variant="primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Button type="button" variant="success" onClick={handleEnterEdit}>
              Edit
            </Button>
            <Button type="button" variant="danger" onClick={() => setShowDeleteModal(true)}>
              Delete
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Order Info + Vendor + TM Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Summary */}
          <SectionCard
            title="Order Summary"
            action={
              !isEditing && (
                <div className="flex gap-2 flex-wrap">
                  <StatusBadge value={order.status} />
                  <StatusBadge value={order.deliveryStatus || 'ASSIGNED'} />
                </div>
              )
            }
          >
            <InfoRow label="Order ID" value={order.orderId} />
            <InfoRow label="Project" value={order.project?.projectName} />
            <InfoRow label="Client" value={order.client?.companyName} />
            <InfoRow label="Product" value={`${order.productName || ''} ${order.productGrade ? `(${order.productGrade})` : ''}`} />
            <InfoRow label="Quantity" value={order.quantity} />

            {isEditing ? (
              <div className="space-y-4 pt-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Status</FieldLabel>
                    <Dropdown
                      options={statusOptions}
                      value={editForm.status}
                      placeholder="Select status"
                      width="100%"
                      height="40px"
                      onChange={(v) => setField('status', v)}
                    />
                  </div>
                  <div>
                    <FieldLabel>Delivery Status</FieldLabel>
                    <Dropdown
                      options={deliveryStatusOptions}
                      value={editForm.deliveryStatus}
                      placeholder="Select delivery status"
                      width="100%"
                      height="40px"
                      onChange={(v) => setField('deliveryStatus', v)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="date"
                      label="Date"
                      value={editForm.date}
                      onChange={(e) => setField('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input
                      type="time"
                      label="Time"
                      value={editForm.time}
                      onChange={(e) => setField('time', e.target.value)}
                    />
                  </div>
                </div>
                <Input
                  label="Delivery Address"
                  placeholder="Delivery address"
                  value={editForm.deliveryAddress}
                  onChange={(e) => setField('deliveryAddress', e.target.value)}
                />
              </div>
            ) : (
              <>
                <InfoRow label="Date" value={order.date} />
                <InfoRow label="Time" value={order.time} />
                <InfoRow label="Delivery Address" value={order.deliveryAddress} />
              </>
            )}
          </SectionCard>

          {/* Vendor Details */}
          {(isEditing || order.vendor) && (
            <SectionCard title="Vendor Details">
              {isEditing ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <FieldLabel>Vendor</FieldLabel>
                    <Dropdown
                      options={vendorOptions}
                      value={editForm.vendorId}
                      placeholder="Select vendor"
                      width="100%"
                      height="40px"
                      onChange={handleVendorChange}
                    />
                  </div>
                  <div>
                    <FieldLabel>Plant Location</FieldLabel>
                    <Dropdown
                      options={locationOptions}
                      value={editForm.vendorLocationId}
                      placeholder={loadingLocations ? 'Loading...' : 'Select location'}
                      width="100%"
                      height="40px"
                      disabled={!editForm.vendorId || loadingLocations}
                      onChange={handleLocationChange}
                    />
                  </div>
                  <div>
                    <FieldLabel>Handler</FieldLabel>
                    <Dropdown
                      options={handlerOptions}
                      value={editForm.vendorHandlerId}
                      placeholder={loadingHandlers ? 'Loading...' : 'Select handler'}
                      width="100%"
                      height="40px"
                      disabled={!editForm.vendorLocationId || loadingHandlers}
                      onChange={(v) => setField('vendorHandlerId', v)}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <InfoRow label="Vendor" value={order.vendor?.companyName} />
                  <InfoRow label="Handler" value={order.vendorHandler?.name} />
                  <InfoRow label="Handler Phone" value={order.vendorHandler?.phone} />
                  <InfoRow label="Plant Location" value={order.vendorLocation?.address} />
                </>
              )}
            </SectionCard>
          )}

          {/* TM Details */}
          <SectionCard title={`TM Details (${order.tmDetails?.length || 0})`}>
            {!order.tmDetails?.length ? (
              <p className="text-sm text-gray-400 py-2">No TM details added yet.</p>
            ) : (
              <div className="space-y-3">
                {order.tmDetails.map((tm, i) => (
                  <div key={tm.id || i} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-gray-500">TM #:</span> <span className="font-medium">{tm.tmNumber || `TM-${i + 1}`}</span></div>
                      <div><span className="text-gray-500">Truck:</span> <span className="font-medium">{tm.truckNo}</span></div>
                      <div><span className="text-gray-500">Qty:</span> <span className="font-medium">{tm.qty}</span></div>
                      <div><span className="text-gray-500">Challan:</span> <span className="font-medium">{tm.challanNo}</span></div>
                      <div><span className="text-gray-500">Start:</span> <span className="font-medium">{tm.batchStartTime}</span></div>
                      <div><span className="text-gray-500">End:</span> <span className="font-medium">{tm.batchEndTime}</span></div>
                    </div>
                    {tm.challanUrl && (
                      <a
                        href={tm.challanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs text-primary underline"
                      >
                        View Challan
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Right Column: Field Tech + Comments */}
        <div className="space-y-5">

          {/* Field Tech */}
          <SectionCard title="Field Technician">
            {isEditing ? (
              <div>
                <FieldLabel>Assign Field Tech</FieldLabel>
                <Dropdown
                  options={techOptions}
                  value={editForm.assignedToId}
                  placeholder="Unassigned"
                  width="100%"
                  height="40px"
                  onChange={(v) => setField('assignedToId', v)}
                />
              </div>
            ) : order.assignedTo ? (
              <>
                <InfoRow label="Name" value={order.assignedTo.name} />
                <InfoRow label="Employee ID" value={order.assignedTo.employeeId} />
                <InfoRow label="Phone" value={order.assignedTo.phone} />
              </>
            ) : (
              <p className="text-sm text-gray-400 py-2">No field tech assigned.</p>
            )}
          </SectionCard>

          {/* Comments */}
          <SectionCard title={`Comments (${order.comments?.length || 0})`}>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-3">
              {!order.comments?.length ? (
                <p className="text-sm text-gray-400">No comments yet.</p>
              ) : (
                order.comments.map((c, i) => {
                  const isAdmin = c.authorType === 'ADMIN';
                  return (
                    <div
                      key={c.id || i}
                      className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-medium text-gray-700">{c.authorName}</span>
                        <span className="text-xs text-gray-400">
                          {c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      <div
                        className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                          isAdmin
                            ? 'bg-primary text-white rounded-tr-sm'
                            : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                        }`}
                      >
                        {c.message}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={commentsEndRef} />
            </div>

            {/* Comment Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendComment()}
                placeholder="Add a comment…"
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !commentText.trim()}
                className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
              >
                {sendingComment ? '…' : 'Send'}
              </button>
            </div>
          </SectionCard>
        </div>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Order"
        message={`Are you sure you want to delete order ${order.orderId}? This cannot be undone.`}
        isLoading={deleting}
      />
    </div>
  );
}
