import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  addOrderComment,
  addOrderVendor,
  addOrderTechnician,
  addTm,
  clearCurrentOrder,
  deleteOrder,
  deleteOrderVendor,
  deleteOrderTechnician,
  deleteTm,
  fetchFieldTechs,
  fetchOrderById,
  updateOrder,
  updateOrderStatus,
  updateOrderVendor,
  updateOrderTechnician,
  updateTm,
} from '../features/orders/orderSlice';
import { createBill } from '../features/bills/billSlice';
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

const APPROVAL_BADGE = {
  PENDING:  { color: '#D97706', backgroundColor: '#FEF3C7' },
  ACCEPTED: { color: '#16A34A', backgroundColor: '#D1FAE5' },
  REJECTED: { color: '#DC2626', backgroundColor: '#FECACA' },
};

const EMPTY_EDIT_FORM = {
  date: '',
  time: '',
  deliveryAddress: '',
};

const EMPTY_VENDOR_FORM = {
  vendorId: '',
  vendorLocationId: '',
  vendorHandlerId: '',
  locations: [],
  handlers: [],
  loadingLocations: false,
  loadingHandlers: false,
};

const EMPTY_TECH_FORM = { userId: '' };

const EMPTY_TM_FORM = {
  truckNo: '',
  qty: '',
  dispatchTime: '',
  arrivalTime: '',
  batchStartTime: '',
  batchEndTime: '',
  challanNo: '',
};

const StatusBadge = ({ value, badgeMap = STATUS_BADGE }) => {
  const cfg = badgeMap[value] || { color: '#374151', backgroundColor: '#F3F4F6' };
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

  // Status controls
  const [statusDraft, setStatusDraft] = useState('');
  const [deliveryStatusDraft, setDeliveryStatusDraft] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [billBanner, setBillBanner] = useState(null); // { billNo } | { error }
  const [generatingBill, setGeneratingBill] = useState(false);

  // Vendor row form
  const [vendorFormKey, setVendorFormKey] = useState(null); // null | 'new' | orderVendorId
  const [vendorForm, setVendorForm] = useState(EMPTY_VENDOR_FORM);
  const [savingVendor, setSavingVendor] = useState(false);

  // Technician row form
  const [techFormKey, setTechFormKey] = useState(null); // null | 'new' | orderTechnicianId
  const [techForm, setTechForm] = useState(EMPTY_TECH_FORM);
  const [savingTech, setSavingTech] = useState(false);

  // TM row form
  const [tmFormKey, setTmFormKey] = useState(null); // null | 'new' | tmId
  const [tmForm, setTmForm] = useState(EMPTY_TM_FORM);
  const [savingTm, setSavingTm] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    dispatch(fetchFieldTechs());
    dispatch(fetchVendors());
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order) {
      setStatusDraft(order.status || '');
      setDeliveryStatusDraft(order.deliveryStatus || '');
    }
  }, [order?.status, order?.deliveryStatus]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.comments?.length]);

  const refreshOrder = () => dispatch(fetchOrderById(orderId));

  const setField = (field, value) => setEditForm((p) => ({ ...p, [field]: value }));

  const handleEnterEdit = () => {
    setEditForm({
      date: order.date || '',
      time: order.time || '',
      deliveryAddress: order.deliveryAddress || '',
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(EMPTY_EDIT_FORM);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await dispatch(updateOrder({
        orderId,
        date: editForm.date,
        time: editForm.time,
        deliveryAddress: editForm.deliveryAddress,
      }));
      if (updateOrder.fulfilled.match(result)) {
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

  // ---- Status / billing ----
  const statusChanged = statusDraft !== (order?.status || '') || deliveryStatusDraft !== (order?.deliveryStatus || '');

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    setBillBanner(null);
    try {
      const result = await dispatch(updateOrderStatus({
        orderId,
        status: statusDraft,
        deliveryStatus: deliveryStatusDraft,
      }));
      if (updateOrderStatus.fulfilled.match(result)) {
        const { bill, billError } = result.payload;
        if (bill) setBillBanner({ billNo: bill.billNo });
        else if (billError) setBillBanner({ error: billError });
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleGenerateBillManually = async () => {
    setGeneratingBill(true);
    try {
      const result = await dispatch(createBill({ orderId }));
      if (createBill.fulfilled.match(result) && result.payload?.billNo) {
        setBillBanner({ billNo: result.payload.billNo });
      }
    } finally {
      setGeneratingBill(false);
    }
  };

  // ---- Vendor CRUD ----
  const loadVendorLocations = (vendorId) => {
    setVendorForm((p) => ({ ...p, loadingLocations: true }));
    return vendorService
      .getLocationbyVendorId(vendorId)
      .then((res) => setVendorForm((p) => ({ ...p, locations: res.data || [] })))
      .catch(() => setVendorForm((p) => ({ ...p, locations: [] })))
      .finally(() => setVendorForm((p) => ({ ...p, loadingLocations: false })));
  };

  const loadVendorHandlers = (locationId) => {
    setVendorForm((p) => ({ ...p, loadingHandlers: true }));
    return vendorService
      .getHandlersforLocation(locationId)
      .then((res) => setVendorForm((p) => ({ ...p, handlers: res.data || [] })))
      .catch(() => setVendorForm((p) => ({ ...p, handlers: [] })))
      .finally(() => setVendorForm((p) => ({ ...p, loadingHandlers: false })));
  };

  const openAddVendor = () => {
    setVendorForm(EMPTY_VENDOR_FORM);
    setVendorFormKey('new');
  };

  const openEditVendor = (v) => {
    const vendorId = v.vendor?.id ?? v.vendorId;
    const vendorLocationId = v.vendorLocation?.id ?? v.vendorLocationId;
    setVendorForm({
      ...EMPTY_VENDOR_FORM,
      vendorId: vendorId ? String(vendorId) : '',
      vendorLocationId: vendorLocationId ? String(vendorLocationId) : '',
      vendorHandlerId: (v.vendorHandler?.id ?? v.vendorHandlerId) ? String(v.vendorHandler?.id ?? v.vendorHandlerId) : '',
    });
    setVendorFormKey(v.id);
    if (vendorId) loadVendorLocations(vendorId);
    if (vendorLocationId) loadVendorHandlers(vendorLocationId);
  };

  const cancelVendorForm = () => {
    setVendorFormKey(null);
    setVendorForm(EMPTY_VENDOR_FORM);
  };

  const handleVendorSelect = (vendorId) => {
    setVendorForm((p) => ({ ...p, vendorId, vendorLocationId: '', vendorHandlerId: '', locations: [], handlers: [] }));
    if (vendorId) loadVendorLocations(vendorId);
  };

  const handleVendorLocationSelect = (vendorLocationId) => {
    setVendorForm((p) => ({ ...p, vendorLocationId, vendorHandlerId: '', handlers: [] }));
    if (vendorLocationId) loadVendorHandlers(vendorLocationId);
  };

  const saveVendorForm = async () => {
    if (!vendorForm.vendorId) return;
    setSavingVendor(true);
    try {
      const payload = {
        vendorId: parseInt(vendorForm.vendorId),
        vendorLocationId: vendorForm.vendorLocationId ? parseInt(vendorForm.vendorLocationId) : null,
        vendorHandlerId: vendorForm.vendorHandlerId ? parseInt(vendorForm.vendorHandlerId) : null,
      };
      const action = vendorFormKey === 'new'
        ? addOrderVendor({ orderId, ...payload })
        : updateOrderVendor({ orderVendorId: vendorFormKey, orderId, ...payload });
      const result = await dispatch(action);
      if (result.meta.requestStatus === 'fulfilled') {
        cancelVendorForm();
        refreshOrder();
      }
    } finally {
      setSavingVendor(false);
    }
  };

  const handleDeleteVendor = async (orderVendorId) => {
    if (!window.confirm('Remove this vendor from the order?')) return;
    const result = await dispatch(deleteOrderVendor({ orderId, orderVendorId }));
    if (deleteOrderVendor.fulfilled.match(result)) refreshOrder();
  };

  // ---- Technician CRUD ----
  const openAddTech = () => {
    setTechForm(EMPTY_TECH_FORM);
    setTechFormKey('new');
  };

  const openEditTech = (t) => {
    setTechForm({ userId: t.userId ? String(t.userId) : (t.id ? String(t.id) : '') });
    setTechFormKey(t.id);
  };

  const cancelTechForm = () => {
    setTechFormKey(null);
    setTechForm(EMPTY_TECH_FORM);
  };

  const saveTechForm = async () => {
    if (!techForm.userId) return;
    setSavingTech(true);
    try {
      const payload = { userId: parseInt(techForm.userId) };
      const action = techFormKey === 'new'
        ? addOrderTechnician({ orderId, ...payload })
        : updateOrderTechnician({ orderTechnicianId: techFormKey, orderId, ...payload });
      const result = await dispatch(action);
      if (result.meta.requestStatus === 'fulfilled') {
        cancelTechForm();
        refreshOrder();
      }
    } finally {
      setSavingTech(false);
    }
  };

  const handleDeleteTech = async (orderTechnicianId) => {
    if (!window.confirm('Remove this technician from the order?')) return;
    const result = await dispatch(deleteOrderTechnician({ orderId, orderTechnicianId }));
    if (deleteOrderTechnician.fulfilled.match(result)) refreshOrder();
  };

  // ---- TM CRUD ----
  const openAddTm = () => {
    setTmForm(EMPTY_TM_FORM);
    setTmFormKey('new');
  };

  const openEditTm = (tm) => {
    setTmForm({
      truckNo: tm.truckNo || '',
      qty: tm.qty || '',
      dispatchTime: tm.dispatchTime || '',
      arrivalTime: tm.arrivalTime || '',
      batchStartTime: tm.batchStartTime || '',
      batchEndTime: tm.batchEndTime || '',
      challanNo: tm.challanNo || '',
    });
    setTmFormKey(tm.id);
  };

  const cancelTmForm = () => {
    setTmFormKey(null);
    setTmForm(EMPTY_TM_FORM);
  };

  const setTmField = (field, value) => setTmForm((p) => ({ ...p, [field]: value }));

  const saveTmForm = async () => {
    if (!tmForm.truckNo.trim() || !tmForm.qty.trim()) return;
    setSavingTm(true);
    try {
      const action = tmFormKey === 'new'
        ? addTm({ orderId, data: tmForm })
        : updateTm({ orderId, tmId: tmFormKey, data: tmForm });
      const result = await dispatch(action);
      if (result.meta.requestStatus === 'fulfilled') {
        cancelTmForm();
        refreshOrder();
      }
    } finally {
      setSavingTm(false);
    }
  };

  const handleDeleteTm = async (tmId) => {
    if (!window.confirm('Remove this TM from the order?')) return;
    const result = await dispatch(deleteTm({ orderId, tmId }));
    if (deleteTm.fulfilled.match(result)) refreshOrder();
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

  const vendorOptions = vendors.map((v) => ({
    value: String(v.id),
    label: v.companyName || v.name,
  }));

  const toLocationOptions = (list) => list.map((l) => ({
    value: String(l.id),
    label: l.address || l.name,
  }));

  const toHandlerOptions = (list) => list.map((h) => ({
    value: String(h.id),
    label: `${h.name}${h.phone ? ` (${h.phone})` : ''}`,
  }));

  const techOptions = [
    { value: '', label: 'Select technician' },
    ...fieldTechs.map((t) => ({ value: String(t.id), label: `${t.name} (${t.employeeId})` })),
  ];

  const orderVendors = order.vendors || [];
  const orderTechnicians = order.technicians || [];
  const tmDetails = order.tmDetails || [];

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

      {/* Bill banner */}
      {billBanner && (
        <div
          className={`mb-5 rounded-lg border p-4 flex items-center justify-between gap-3 flex-wrap ${
            billBanner.billNo ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'
          }`}
        >
          {billBanner.billNo ? (
            <>
              <span className="text-sm text-green-800">Bill {billBanner.billNo} generated.</span>
              <Link to={`/billing/${billBanner.billNo}`} className="text-sm font-medium text-primary underline">
                View Bill
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-amber-800">{billBanner.error}</span>
              <Button type="button" variant="primary" onClick={handleGenerateBillManually} disabled={generatingBill}>
                {generatingBill ? 'Generating...' : 'Generate bill manually'}
              </Button>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Order Info + Vendor + TM Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Summary */}
          <SectionCard title="Order Summary">
            <InfoRow label="Order ID" value={order.orderId} />
            <InfoRow label="Project" value={order.project?.projectName} />
            <InfoRow label="Client" value={order.client?.companyName} />
            <InfoRow label="Product" value={`${order.productName || ''} ${order.productGrade ? `(${order.productGrade})` : ''}`} />
            <InfoRow label="Quantity" value={order.quantity} />

            {/* Status controls — always available, hits the status endpoint directly */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <div>
                <FieldLabel>Status</FieldLabel>
                <Dropdown
                  options={statusOptions}
                  value={statusDraft}
                  placeholder="Select status"
                  width="100%"
                  height="40px"
                  onChange={setStatusDraft}
                />
              </div>
              <div>
                <FieldLabel>Delivery Status</FieldLabel>
                <Dropdown
                  options={deliveryStatusOptions}
                  value={deliveryStatusDraft}
                  placeholder="Select delivery status"
                  width="100%"
                  height="40px"
                  onChange={setDeliveryStatusDraft}
                />
              </div>
            </div>
            {statusChanged && (
              <div className="pt-3 flex justify-end">
                <Button type="button" variant="primary" onClick={handleUpdateStatus} disabled={updatingStatus}>
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            )}

            {isEditing ? (
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Date"
                    value={editForm.date}
                    onChange={(e) => setField('date', e.target.value)}
                  />
                  <Input
                    type="time"
                    label="Time"
                    value={editForm.time}
                    onChange={(e) => setField('time', e.target.value)}
                  />
                </div>
                <Input
                  label="Delivery Address"
                  placeholder="Delivery address"
                  value={editForm.deliveryAddress}
                  onChange={(e) => setField('deliveryAddress', e.target.value)}
                />
              </div>
            ) : (
              <div className="pt-2">
                <InfoRow label="Date" value={order.date} />
                <InfoRow label="Time" value={order.time} />
                <InfoRow label="Delivery Address" value={order.deliveryAddress} />
              </div>
            )}
          </SectionCard>

          {/* Vendor Details */}
          <SectionCard
            title={`Vendor Details (${orderVendors.length})`}
            action={
              vendorFormKey === null && (
                <Button type="button" variant="success" onClick={openAddVendor}>
                  + Add Vendor
                </Button>
              )
            }
          >
            <div className="space-y-3">
              {orderVendors.length === 0 && vendorFormKey !== 'new' && (
                <p className="text-sm text-gray-400 py-2">No vendors added yet.</p>
              )}
              {orderVendors.map((v) => (
                <div key={v.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  {vendorFormKey === v.id ? (
                    <VendorForm
                      form={vendorForm}
                      vendorOptions={vendorOptions}
                      locationOptions={toLocationOptions(vendorForm.locations)}
                      handlerOptions={toHandlerOptions(vendorForm.handlers)}
                      onVendorChange={handleVendorSelect}
                      onLocationChange={handleVendorLocationSelect}
                      onHandlerChange={(v2) => setVendorForm((p) => ({ ...p, vendorHandlerId: v2 }))}
                      onSave={saveVendorForm}
                      onCancel={cancelVendorForm}
                      saving={savingVendor}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{v.vendor?.companyName}</span>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => openEditVendor(v)} className="text-xs text-primary hover:underline font-medium">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteVendor(v.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                      <InfoRow label="Handler" value={v.vendorHandler?.name} />
                      <InfoRow label="Handler Phone" value={v.vendorHandler?.phone} />
                      <InfoRow label="Plant Location" value={v.vendorLocation?.address} />
                    </>
                  )}
                </div>
              ))}
              {vendorFormKey === 'new' && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <VendorForm
                    form={vendorForm}
                    vendorOptions={vendorOptions}
                    locationOptions={toLocationOptions(vendorForm.locations)}
                    handlerOptions={toHandlerOptions(vendorForm.handlers)}
                    onVendorChange={handleVendorSelect}
                    onLocationChange={handleVendorLocationSelect}
                    onHandlerChange={(v2) => setVendorForm((p) => ({ ...p, vendorHandlerId: v2 }))}
                    onSave={saveVendorForm}
                    onCancel={cancelVendorForm}
                    saving={savingVendor}
                  />
                </div>
              )}
            </div>
          </SectionCard>

          {/* TM Details */}
          <SectionCard
            title={`TM Details (${tmDetails.length})`}
            action={
              tmFormKey === null && (
                <Button type="button" variant="success" onClick={openAddTm}>
                  + Add TM
                </Button>
              )
            }
          >
            <div className="space-y-3">
              {tmDetails.length === 0 && tmFormKey !== 'new' && (
                <p className="text-sm text-gray-400 py-2">No TM details added yet.</p>
              )}
              {tmDetails.map((tm) => (
                <div key={tm.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  {tmFormKey === tm.id ? (
                    <TmForm form={tmForm} onChange={setTmField} onSave={saveTmForm} onCancel={cancelTmForm} saving={savingTm} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">{tm.tmNumber}</span>
                        <div className="flex items-center gap-3">
                          {tm.approvalStatus && <StatusBadge value={tm.approvalStatus} badgeMap={APPROVAL_BADGE} />}
                          <button type="button" onClick={() => openEditTm(tm)} className="text-xs text-primary hover:underline font-medium">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteTm(tm.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-gray-500">Truck:</span> <span className="font-medium">{tm.truckNo}</span></div>
                        <div><span className="text-gray-500">Qty:</span> <span className="font-medium">{tm.qty}</span></div>
                        <div><span className="text-gray-500">Challan:</span> <span className="font-medium">{tm.challanNo || '—'}</span></div>
                        <div><span className="text-gray-500">Dispatch:</span> <span className="font-medium">{tm.dispatchTime || '—'}</span></div>
                        <div><span className="text-gray-500">Arrival:</span> <span className="font-medium">{tm.arrivalTime || '—'}</span></div>
                        <div><span className="text-gray-500">Start:</span> <span className="font-medium">{tm.batchStartTime || '—'}</span></div>
                        <div><span className="text-gray-500">End:</span> <span className="font-medium">{tm.batchEndTime || '—'}</span></div>
                      </div>
                      {tm.rejectionReason && (
                        <p className="mt-2 text-xs text-red-600">Rejected: {tm.rejectionReason}</p>
                      )}
                    </>
                  )}
                </div>
              ))}
              {tmFormKey === 'new' && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <TmForm form={tmForm} onChange={setTmField} onSave={saveTmForm} onCancel={cancelTmForm} saving={savingTm} />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* Right Column: Field Tech + Comments */}
        <div className="space-y-5">

          {/* Field Tech */}
          <SectionCard
            title={`Field Technicians (${orderTechnicians.length})`}
            action={
              techFormKey === null && (
                <Button type="button" variant="success" onClick={openAddTech}>
                  + Add
                </Button>
              )
            }
          >
            <div className="space-y-3">
              {orderTechnicians.length === 0 && techFormKey !== 'new' && (
                <p className="text-sm text-gray-400 py-2">No field tech assigned.</p>
              )}
              {orderTechnicians.map((t) => (
                <div key={t.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  {techFormKey === t.id ? (
                    <div>
                      <FieldLabel>Technician</FieldLabel>
                      <Dropdown
                        options={techOptions}
                        value={techForm.userId}
                        placeholder="Select technician"
                        width="100%"
                        height="40px"
                        onChange={(v) => setTechForm({ userId: v })}
                      />
                      <div className="flex justify-end gap-2 mt-3">
                        <Button type="button" onClick={cancelTechForm} disabled={savingTech}>Cancel</Button>
                        <Button type="button" variant="primary" onClick={saveTechForm} disabled={savingTech || !techForm.userId}>
                          {savingTech ? 'Saving...' : 'Save'}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-600">{t.name || t.user?.name}</span>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => openEditTech(t)} className="text-xs text-primary hover:underline font-medium">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteTech(t.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                      <InfoRow label="Employee ID" value={t.employeeId || t.user?.employeeId} />
                      <InfoRow label="Phone" value={t.phone || t.user?.phone} />
                    </>
                  )}
                </div>
              ))}
              {techFormKey === 'new' && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <FieldLabel>Technician</FieldLabel>
                  <Dropdown
                    options={techOptions}
                    value={techForm.userId}
                    placeholder="Select technician"
                    width="100%"
                    height="40px"
                    onChange={(v) => setTechForm({ userId: v })}
                  />
                  <div className="flex justify-end gap-2 mt-3">
                    <Button type="button" onClick={cancelTechForm} disabled={savingTech}>Cancel</Button>
                    <Button type="button" variant="primary" onClick={saveTechForm} disabled={savingTech || !techForm.userId}>
                      {savingTech ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
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

const VendorForm = ({ form, vendorOptions, locationOptions, handlerOptions, onVendorChange, onLocationChange, onHandlerChange, onSave, onCancel, saving }) => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div>
        <FieldLabel>Vendor</FieldLabel>
        <Dropdown options={vendorOptions} value={form.vendorId} placeholder="Select vendor" width="100%" height="40px" onChange={onVendorChange} />
      </div>
      <div>
        <FieldLabel>Plant Location</FieldLabel>
        <Dropdown
          options={locationOptions}
          value={form.vendorLocationId}
          placeholder={form.loadingLocations ? 'Loading...' : 'Select location'}
          width="100%"
          height="40px"
          disabled={!form.vendorId || form.loadingLocations}
          onChange={onLocationChange}
        />
      </div>
      <div>
        <FieldLabel>Handler</FieldLabel>
        <Dropdown
          options={handlerOptions}
          value={form.vendorHandlerId}
          placeholder={form.loadingHandlers ? 'Loading...' : 'Select handler'}
          width="100%"
          height="40px"
          disabled={!form.vendorLocationId || form.loadingHandlers}
          onChange={onHandlerChange}
        />
      </div>
    </div>
    <div className="flex justify-end gap-2 mt-3">
      <Button type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
      <Button type="button" variant="primary" onClick={onSave} disabled={saving || !form.vendorId}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  </div>
);

const TmForm = ({ form, onChange, onSave, onCancel, saving }) => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Input label="Truck No." value={form.truckNo} onChange={(e) => onChange('truckNo', e.target.value)} />
      <Input label="Quantity" value={form.qty} onChange={(e) => onChange('qty', e.target.value)} />
      <Input label="Challan No." value={form.challanNo} onChange={(e) => onChange('challanNo', e.target.value)} />
      <Input label="Dispatch Time" value={form.dispatchTime} onChange={(e) => onChange('dispatchTime', e.target.value)} />
      <Input label="Arrival Time" value={form.arrivalTime} onChange={(e) => onChange('arrivalTime', e.target.value)} />
      <Input label="Batch Start" value={form.batchStartTime} onChange={(e) => onChange('batchStartTime', e.target.value)} />
      <Input label="Batch End" value={form.batchEndTime} onChange={(e) => onChange('batchEndTime', e.target.value)} />
    </div>
    <div className="flex justify-end gap-2 mt-3">
      <Button type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
      <Button type="button" variant="primary" onClick={onSave} disabled={saving || !form.truckNo.trim() || !form.qty.trim()}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  </div>
);
