import { useEffect, useRef, useState } from 'react';
import { StatusChip } from '../components/ui/StatusChip';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

import {
  addOrderComment,
  addOrderVendor,
  addOrderTechnician,
  addTm,
  addCubeTest,
  clearCurrentOrder,
  deleteOrder,
  deleteOrderVendor,
  deleteOrderTechnician,
  deleteTm,
  deleteCubeTest,
  fetchCubeTests,
  fetchFieldTechs,
  fetchOrderById,
  updateOrder,
  updateOrderStatus,
  updateOrderVendor,
  updateOrderTechnician,
  updateTm,
  updateCubeTest,
} from '../features/orders/orderSlice';
import { createBill } from '../features/bills/billSlice';
import { fetchVendors } from '../features/vendors/vendorSlice';
import {
  MAX_ORDER_MONTHS_AHEAD,
  getOrderDateError,
  maxOrderDateIso,
  maxOrderDateLabel,
} from '../utils/orderDate';
import vendorService from '../services/vendorService';
import billService from '../services/billService';
import reportService from '../services/reportService';
import paymentService from '../services/paymentService';
import usePermission from '../hooks/usePermission';
import TruckReviewActions from '../components/orders/TruckReviewActions';
import {
  CUBE_TEST_PERIOD_LABEL,
  CUBE_STATUS_BADGE,
  EMPTY_CUBE_TEST_FORM,
  addedByText,
  buildCubeTestFormData,
  cubeTestFormIsValid,
  cubeTestToForm,
} from '../utils/cubeTest';
import CubeTestForm, { CubeTestAttachments } from '../components/cubeTest/CubeTestForm';
import { joinOrderRoom, leaveOrderRoom, onSocketEvent } from '../services/socket';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import FullPageLoader from '../components/ui/FullPageLoader';
import DeleteModal from '../components/modals/DeleteModal';
import { ICON_NAMES, Icon } from '../components/icons';
import { ChevronLeft, Check, CircleCheck, TriangleAlert, Pencil, Trash2, Ban } from 'lucide-react';
import { statusLabel } from '../utils/labels';
import { ORDER_TRANSITIONS, STATUS_BADGE } from '../constant/orderStatus';



// Cube tests are never locked by order status — a cube result legitimately
// arrives after the order is delivered and closed. See src/utils/cubeTest.js,
// which is the single source of truth for this rule.
const CUBE_TEST_LOCKED_STATES = [];


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

// One badge style everywhere: tone and label come from the status word.
const StatusBadge = ({ value }) => <StatusChip status={value} />;

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col gap-0.5 border-b border-primary-light py-2.5 last:border-0 sm:flex-row sm:items-start sm:gap-0">
    <span className="shrink-0 text-[13px] text-text-secondary sm:w-40 sm:text-sm">{label}</span>
    <span className="text-sm font-medium text-text-primary">{value || '—'}</span>
  </div>
);

/** Placed → Confirmed → Dispatched → Reached → Completed, with the current step marked. */
const FLOW = ['NEW', 'CONFIRMED', 'DISPATCHED', 'REACHED', 'COMPLETED'];
const FLOW_LABEL = { NEW: 'Placed', CONFIRMED: 'Confirmed', DISPATCHED: 'Dispatched', REACHED: 'Reached', COMPLETED: 'Completed' };
const OrderStepper = ({ status, dispatched }) => {
  if (status === 'CANCELLED') {
    return (
      <div className="sv-card flex items-center gap-3 p-4 text-sm text-error">
        <Ban size={20} /> This order was cancelled.
      </div>
    );
  }
  // Delayed sits on the step it was delayed at: before or after dispatch.
  const at = Math.max(0, FLOW.indexOf(status === 'DELAYED' ? (dispatched ? 'DISPATCHED' : 'CONFIRMED') : status));
  return (
    <div className="sv-card px-2 py-5 sm:px-6">
      {status === 'DELAYED' && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-warning-light px-3 py-2 text-sm font-medium text-text-primary">
          <TriangleAlert size={16} className="text-warning" /> Delayed — the next step clears it.
        </div>
      )}
      <ol className="flex">
        {FLOW.map((step, i) => {
          const done = i <= at;
          const last = i === FLOW.length - 1;
          return (
            <li key={step} className="relative flex flex-1 flex-col items-center gap-2 text-center">
              {!last && (
                <span className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[13px] h-[3px] sm:top-[15px] rounded-full ${i < at ? 'sv-grow-x bg-primary' : 'bg-primary-light'}`}
                  style={i < at ? { animationDelay: `${0.2 + i * 0.12}s` } : undefined} />
              )}
              <span className={`relative flex h-7 w-7 items-center justify-center rounded-full text-white ring-4 sm:h-8 sm:w-8 sm:ring-[5px] ${done ? (status === 'COMPLETED' && last ? 'bg-success ring-success-light' : 'bg-primary ring-primary-light') : 'bg-white text-text-light ring-primary-light'}`}
                aria-current={i === at ? 'step' : undefined}>
                {done ? <Check size={16} strokeWidth={2.6} /> : <span className="h-2 w-2 rounded-full bg-primary-light" />}
              </span>
              <span className={`text-[11px] leading-tight sm:text-sm ${i === at ? 'font-semibold text-primary-second' : done ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>{FLOW_LABEL[step]}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const SectionCard = ({ title, children, action }) => (
  <section className="sv-card p-4 sm:p-6">
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-lg font-semibold text-primary-second">{title}</h3>
      {action}
    </div>
    {children}
  </section>
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

  const { currentOrder: order, loading, fieldTechs, cubeTests } = useSelector((s) => s.orders);
  const { list: vendors = [] } = useSelector((s) => s.vendor);

  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);
  const [editDateError, setEditDateError] = useState('');
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Status controls
  const [statusDraft, setStatusDraft] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [billBanner, setBillBanner] = useState(null); // { billNo } | { error } | { pending }
  const [credit, setCredit] = useState(null);
  const { can } = usePermission();

  // P1.15: the client's credit position, for the warning banner.
  const clientCode = order?.client?.clientId;
  useEffect(() => {
    if (!clientCode) return;
    reportService.getClientCredit(clientCode).then((r) => setCredit(r.data)).catch(() => setCredit(null));
  }, [clientCode]);
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

  // Cube test row form
  const [cubeTestFormKey, setCubeTestFormKey] = useState(null); // null | 'new' | cubeTestId
  const [cubeTestForm, setCubeTestForm] = useState(EMPTY_CUBE_TEST_FORM);
  const [savingCubeTest, setSavingCubeTest] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    dispatch(fetchFieldTechs());
    dispatch(fetchVendors());
    dispatch(fetchCubeTests(orderId));
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, orderId]);

  // Real-time: join this order's room and refetch whenever either side (the
  // client app or another admin) posts a comment or changes the status.
  // Event names must match the backend hub in src/realtime/socketServer.js.
  useEffect(() => {
    joinOrderRoom(orderId);

    const refetchIfThisOrder = (payload) => {
      if (payload?.orderId === orderId) dispatch(fetchOrderById(orderId));
    };

    const unsubscribers = [
      onSocketEvent('comment:new', refetchIfThisOrder),
      onSocketEvent('order:status', refetchIfThisOrder),
    ];

    return () => {
      unsubscribers.forEach((off) => off());
      leaveOrderRoom(orderId);
    };
  }, [dispatch, orderId]);

  useEffect(() => {
    if (order) {
      setStatusDraft(order.status || '');
    }
  }, [order?.status]);

  useEffect(() => {
    // Scroll only the comments box to its newest message — scrollIntoView would
    // also drag the whole page down to the comments on every load.
    const box = commentsEndRef.current?.parentElement;
    if (box) box.scrollTo({ top: box.scrollHeight, behavior: 'smooth' });
  }, [order?.comments?.length]);

  const refreshOrder = () => dispatch(fetchOrderById(orderId));

  const setField = (field, value) => setEditForm((p) => ({ ...p, [field]: value }));

  const handleEnterEdit = () => {
    setEditForm({
      date: order.date || '',
      time: order.time || '',
      deliveryAddress: order.deliveryAddress || '',
    });
    setEditDateError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(EMPTY_EDIT_FORM);
    setEditDateError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();

    // Rescheduling is a booking too, so the 3-month window applies here as
    // well. Only the upper bound is checked: an existing order can legitimately
    // hold a past date, and the API allows that.
    const dateError = getOrderDateError(editForm.date);
    if (dateError) {
      setEditDateError(dateError);
      return;
    }
    setEditDateError('');

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
  const statusChanged = statusDraft !== (order?.status || '');

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    setBillBanner(null);
    try {
      // W10: cancelling needs a reason (it also cancels a draft bill).
      let cancelReason;
      if (statusDraft === 'CANCELLED' && order?.status !== 'CANCELLED') {
        cancelReason = window.prompt('Reason for cancelling this order:');
        if (!cancelReason?.trim()) return;
      }
      const result = await dispatch(updateOrderStatus({
        orderId,
        status: statusDraft,
        ...(cancelReason && { cancelReason }),
      }));
      if (updateOrderStatus.fulfilled.match(result)) {
        const { bill, billError, billPending } = result.payload;
        if (bill) setBillBanner({ billNo: bill.billNo });
        else if (billError) setBillBanner({ error: billError });
        else if (billPending) setBillBanner({ pending: billPending });
      }
    } finally {
      setUpdatingStatus(false);
    }
  };

  // W11: challan upload + accept/reject on the order; the bill follows by itself
  // once every live truck is in (billIfReady on the server).
  const afterReview = (r) => {
    if (r?.bill) setBillBanner({ billNo: r.bill.billNo });
    else if (r?.billPending && order?.status === 'COMPLETED') setBillBanner({ pending: r.billPending });
    refreshOrder();
  };
  const handleOrderChallan = async (tmId, file) => {
    try { afterReview(await billService.uploadOrderChallan(orderId, tmId, file)); toast.success('Challan uploaded'); }
    catch (e) { toast.error(e.response?.data?.message || 'Upload failed'); }
  };
  const handleOrderReview = async (tmId, data) => {
    try { afterReview(await billService.reviewOrderTm(orderId, tmId, data)); toast.success(`Truck ${data.approvalStatus.toLowerCase()}`); }
    catch (e) { toast.error(e.response?.data?.message || 'Update failed'); }
  };

  // W23: approvers release a credit hold (optionally with one-time extra credit) or cancel.
  const releaseHold = async (action) => {
    const note = window.prompt(action === 'CANCEL' ? 'Reason for cancelling:' : 'Approval note:');
    if (!note?.trim()) return;
    let extraAmount;
    if (action === 'RELEASE_WITH_EXTRA') {
      extraAmount = window.prompt('Extra credit ₹ to add for this client:');
      if (!extraAmount) return;
    }
    try {
      const r = await paymentService.releaseHold(orderId, { action, note, extraAmount });
      toast.success(r.message);
      refreshOrder();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not update the hold');
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

  // ---- Cube test CRUD ----
  const openAddCubeTest = () => {
    setCubeTestForm(EMPTY_CUBE_TEST_FORM);
    setCubeTestFormKey('new');
  };

  const openEditCubeTest = (ct) => {
    setCubeTestForm(cubeTestToForm(ct));
    setCubeTestFormKey(ct.id);
  };

  const cancelCubeTestForm = () => {
    setCubeTestFormKey(null);
    setCubeTestForm(EMPTY_CUBE_TEST_FORM);
  };

  const setCubeTestField = (field, value) => setCubeTestForm((p) => ({ ...p, [field]: value }));

  // The saved test being edited (null when adding one).
  const editingCubeTest = cubeTests.find((c) => c.id === cubeTestFormKey);
  const cubeTestInitial = editingCubeTest ? cubeTestToForm(editingCubeTest) : null;
  const cubeTestFormValid = cubeTestFormIsValid(cubeTestForm, cubeTestInitial);

  const saveCubeTestForm = async () => {
    if (!cubeTestFormValid) return;
    setSavingCubeTest(true);
    try {
      const formData = buildCubeTestFormData(cubeTestForm, cubeTestInitial);
      const action = cubeTestFormKey === 'new'
        ? addCubeTest({ orderId, formData })
        : updateCubeTest({ orderId, cubeTestId: cubeTestFormKey, formData });
      const result = await dispatch(action);
      if (result.meta.requestStatus === 'fulfilled') {
        cancelCubeTestForm();
      }
    } finally {
      setSavingCubeTest(false);
    }
  };

  const handleDeleteCubeTest = async (cubeTestId) => {
    if (!window.confirm('Remove this cube test?')) return;
    await dispatch(deleteCubeTest({ orderId, cubeTestId }));
  };

  if (loading && !order) return <FullPageLoader />;
  if (!order) return (
    <div className="p-8 text-center text-gray-500">
      Order not found.
      <button className="ml-3 text-primary underline" onClick={() => navigate('/orders')}>Back to orders</button>
    </div>
  );

  // Only the current status and the moves the server allows (no 409 surprises).
  const statusOptions = [order.status, ...(ORDER_TRANSITIONS[order.status] || [])]
    .map((s) => ({ value: s, label: statusLabel(s) }));

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

  // Once the order/delivery is marked delivered or completed, no new cube tests should be logged.
  const cubeTestLocked = CUBE_TEST_LOCKED_STATES.includes(order.status);

  return (
    <div className="space-y-5 p-4 sm:p-6 lg:p-8">
      {/* Back + Header */}
      <div className="flex flex-wrap items-start gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => navigate('/orders')}
          aria-label="Back to orders"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary-light bg-white text-primary transition-colors hover:bg-primary-light"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-primary-second sm:text-[28px]">{order.orderId}</h1>
            <StatusBadge value={order.status} />
          </div>
          <p className="mt-1 text-sm text-text-secondary">
            {order.project?.projectName} · {order.client?.companyName}
          </p>
        </div>

        {isEditing ? (
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={handleCancelEdit} disabled={saving}
              className="h-11 flex-1 rounded-xl border border-primary-light bg-white px-5 text-sm font-semibold text-primary transition-colors hover:bg-background-hover sm:flex-none">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="h-11 flex-1 rounded-xl bg-primary px-5 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(30,58,138,.22)] transition-colors hover:bg-primary-second disabled:opacity-60 sm:flex-none">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        ) : (
          <div className="flex w-full gap-2 sm:w-auto">
            <button type="button" onClick={handleEnterEdit}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-primary-light bg-white px-4 text-sm font-semibold text-primary transition-colors hover:bg-background-hover sm:flex-none">
              <Pencil size={16} />Edit
            </button>
            <button type="button" onClick={() => setShowDeleteModal(true)}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-error-light bg-white px-4 text-sm font-semibold text-error transition-colors hover:bg-error-light sm:flex-none">
              <Trash2 size={16} />Delete
            </button>
          </div>
        )}
      </div>

      {/* Bill banner */}
      {billBanner && (
        <div
          className={`sv-rise flex flex-wrap items-center justify-between gap-3 rounded-2xl border p-4 ${
            billBanner.billNo ? 'border-success/20 bg-success-light' : 'border-warning/30 bg-warning-light'
          }`}
        >
          {billBanner.billNo ? (
            <>
              <span className="flex items-center gap-3 text-sm font-semibold text-success">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success text-white"><CircleCheck size={18} /></span>
                Bill {billBanner.billNo} created automatically
              </span>
              <Link to={`/billing/${billBanner.billNo}`} className="flex h-10 items-center rounded-xl bg-white px-4 text-sm font-semibold text-primary shadow-sm hover:bg-primary-light">
                View bill
              </Link>
            </>
          ) : billBanner.pending ? (
            <span className="flex items-start gap-3 text-sm text-text-primary"><TriangleAlert size={20} className="shrink-0 text-warning" />Completed — the bill will be created once challans are in: {billBanner.pending}</span>
          ) : (
            <>
              <span className="flex items-start gap-3 text-sm text-text-primary"><TriangleAlert size={20} className="shrink-0 text-warning" />{billBanner.error}</span>
              <Button type="button" variant="primary" onClick={handleGenerateBillManually} disabled={generatingBill}>
                {generatingBill ? 'Generating...' : 'Generate bill manually'}
              </Button>
            </>
          )}
        </div>
      )}

      {order.creditHold && (
        <div className="rounded-2xl border border-warning/40 bg-warning-light p-4 text-sm text-text-primary">
          <p className="flex items-start gap-3"><TriangleAlert size={20} className="shrink-0 text-warning" />
            <span><b>On credit hold:</b> {order.creditHoldReason}. It can&apos;t be confirmed until an approver releases it.</span></p>
          {can('orders', 'approve') && (
            <div className="mt-3 flex flex-wrap gap-2">
              <button className="h-10 rounded-xl bg-primary px-4 font-semibold text-white hover:bg-primary-second" onClick={() => releaseHold('RELEASE')}>Release</button>
              <button className="h-10 rounded-xl border border-primary-light bg-white px-4 font-semibold text-primary hover:bg-primary-light" onClick={() => releaseHold('RELEASE_WITH_EXTRA')}>Release + add extra credit</button>
              <button className="h-10 rounded-xl border border-error-light bg-white px-4 font-semibold text-error hover:bg-error-light" onClick={() => releaseHold('CANCEL')}>Cancel order</button>
            </div>
          )}
        </div>
      )}
      {order.cancelReason && order.status === 'CANCELLED' && (
        <div className="rounded-2xl border border-primary-light bg-white p-4 text-sm text-text-primary">Cancelled: {order.cancelReason}</div>
      )}
      {credit && credit.flag !== 'OK' && (
        <div className="rounded-2xl border border-error/20 bg-error-light p-4 text-sm text-error">
          <b>Credit warning:</b>{' '}
          {credit.flag === 'OVERDUE'
            ? `${credit.overdueBillCount} overdue bill(s), ₹${credit.overdueAmount.toLocaleString('en-IN')}, oldest ${credit.oldestOverdueDays} days past due.`
            : `Over limit — used ₹${credit.used.toLocaleString('en-IN')} of ₹${credit.limit.toLocaleString('en-IN')}.`}
        </div>
      )}
      {order.editableUntil && (
        <div className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${new Date(order.editableUntil) < new Date() ? 'bg-background-hover text-text-secondary' : 'bg-primary-light text-primary'}`}>
          {new Date(order.editableUntil) < new Date() ? 'Locked since' : 'Editable until'}{' '}
          {new Date(order.editableUntil).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
        </div>
      )}

      <OrderStepper status={order.status} dispatched={(order.tmDetails || []).some((t) => t.dispatchTime || t.status !== "ASSIGNED")} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        {/* Left Column: Order Info + Vendor + TM Details */}
        <div className="space-y-5 xl:col-span-2">

          {/* Order Summary */}
          <SectionCard title="Order Summary">
            <InfoRow label="Order ID" value={order.orderId} />
            <InfoRow label="Project" value={order.project?.projectName} />
            <InfoRow label="Client" value={order.client?.companyName} />
            {order.placedBy && (
              <InfoRow
                label="Placed by"
                value={`${order.placedBy.name}${order.placedBy.role?.name ? ` (${order.placedBy.role.name})` : ''}${order.placedBy.phone ? ` · ${order.placedBy.phone}` : ''}`}
              />
            )}
            <InfoRow label="Product" value={`${order.productName || ''} ${order.productGrade ? `(${order.productGrade})` : ''}`} />
            <InfoRow label="Quantity" value={order.quantity} />

            {/* Status controls — always available, hits the status endpoint directly */}
            <div className="grid grid-cols-1 gap-4 pt-3">
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
                    max={maxOrderDateIso()}
                    error={!!editDateError}
                    errorMessage={editDateError}
                    onChange={(e) => {
                      setField('date', e.target.value);
                      if (editDateError) setEditDateError('');
                    }}
                  />
                  <Input
                    type="time"
                    label="Time"
                    value={editForm.time}
                    onChange={(e) => setField('time', e.target.value)}
                  />
                </div>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                  Orders can be scheduled up to {MAX_ORDER_MONTHS_AHEAD} months ahead
                  {' '}(latest {maxOrderDateLabel()}).
                </p>
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
                <div key={v.id} className="rounded-2xl border border-primary-light bg-background-hover p-4">
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
                <div className="rounded-2xl border border-primary-light bg-background-hover p-4">
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
                <div key={tm.id} className="rounded-2xl border border-primary-light bg-background-hover p-4">
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
                      <TruckReviewActions tm={tm} onUploadChallan={handleOrderChallan} onReview={handleOrderReview} />
                    </>
                  )}
                </div>
              ))}
              {tmFormKey === 'new' && (
                <div className="rounded-2xl border border-primary-light bg-background-hover p-4">
                  <TmForm form={tmForm} onChange={setTmField} onSave={saveTmForm} onCancel={cancelTmForm} saving={savingTm} />
                </div>
              )}
            </div>
          </SectionCard>

          {/* Cube Tests */}
          <SectionCard
            title={`Cube Tests (${cubeTests.length})`}
            action={
              cubeTestFormKey === null && !cubeTestLocked && (
                <Button type="button" variant="success" onClick={openAddCubeTest}>
                  + Add Cube Test
                </Button>
              )
            }
          >
            <div className="space-y-3">
              {cubeTestLocked && cubeTests.length === 0 && (
                <p className="text-sm text-gray-400 py-2">No cube tests were logged for this order.</p>
              )}
              {!cubeTestLocked && cubeTests.length === 0 && cubeTestFormKey !== 'new' && (
                <p className="text-sm text-gray-400 py-2">No cube tests added yet.</p>
              )}
              {cubeTests.map((ct) => (
                <div key={ct.id} className="rounded-2xl border border-primary-light bg-background-hover p-4">
                  {cubeTestFormKey === ct.id ? (
                    <CubeTestForm
                      form={cubeTestForm}
                      onChange={setCubeTestField}
                      onSave={saveCubeTestForm}
                      onCancel={cancelCubeTestForm}
                      saving={savingCubeTest}
                      valid={cubeTestFormValid}
                      cubeTest={ct}
                      orderId={orderId}
                      onCubeTestChange={() => dispatch(fetchCubeTests(orderId))}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                          {CUBE_TEST_PERIOD_LABEL[ct.period] || ct.period}
                          {CUBE_STATUS_BADGE[ct.status] && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${CUBE_STATUS_BADGE[ct.status].className}`}>
                              {CUBE_STATUS_BADGE[ct.status].label}{ct.status === 'DUE' && ct.daysPending ? ` · ${ct.daysPending}d` : ''}
                            </span>
                          )}
                        </span>
                        <div className="flex gap-3">
                          <button type="button" onClick={() => openEditCubeTest(ct)} className="text-xs text-primary hover:underline font-medium">
                            Edit
                          </button>
                          <button type="button" onClick={() => handleDeleteCubeTest(ct.id)} className="text-xs text-red-600 hover:text-red-700 font-medium">
                            Remove
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-gray-500">Casting:</span> <span className="font-medium">{ct.castingDate ? new Date(ct.castingDate).toLocaleString() : '—'}</span></div>
                        <div><span className="text-gray-500">Qty:</span> <span className="font-medium">{ct.quantity}</span></div>
                        <div><span className="text-gray-500">Due:</span> <span className="font-medium">{ct.toDate ? new Date(ct.toDate).toLocaleString() : '—'}</span></div>
                      </div>
                      {addedByText(ct) && (
                        <p className="mt-2 text-xs text-text-secondary">Logged by {addedByText(ct)}</p>
                      )}
                      {ct.attachments?.length > 0 && (
                        <div className="mt-3">
                          <p className="mb-1.5 text-xs font-medium text-text-secondary">Result files ({ct.attachments.length})</p>
                          <CubeTestAttachments attachments={ct.attachments} />
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              {cubeTestFormKey === 'new' && (
                <div className="rounded-2xl border border-primary-light bg-background-hover p-4">
                  <CubeTestForm
                    form={cubeTestForm}
                    onChange={setCubeTestField}
                    onSave={saveCubeTestForm}
                    onCancel={cancelCubeTestForm}
                    saving={savingCubeTest}
                    valid={cubeTestFormValid}
                  />
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
                <div key={t.id} className="rounded-2xl border border-primary-light bg-background-hover p-4">
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
                <div className="rounded-2xl border border-primary-light bg-background-hover p-4">
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
                className="h-11 min-w-0 flex-1 rounded-xl border border-primary-light bg-input-bg px-3 text-sm focus:border-border focus:bg-white focus:outline-none"
              />
              <button
                onClick={handleSendComment}
                disabled={sendingComment || !commentText.trim()}
                className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-second disabled:opacity-50"
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

// DB stores times as "hh:mm AM/PM" strings; <input type="time"> needs 24-hour "HH:mm".
const to24HourTime = (value) => {
  if (!value) return '';
  const match = /^(\d{1,2}):(\d{2})\s*([AP]M)$/i.exec(value.trim());
  if (!match) return '';
  let [, h, m, period] = match;
  h = parseInt(h, 10);
  if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
  if (period.toUpperCase() === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${m}`;
};

const to12HourTime = (value) => {
  if (!value) return '';
  const [h, m] = value.split(':').map((n) => parseInt(n, 10));
  const period = h >= 12 ? 'PM' : 'AM';
  let hour12 = h % 12;
  if (hour12 === 0) hour12 = 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
};

const TmForm = ({ form, onChange, onSave, onCancel, saving }) => (
  <div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Input label="Truck No." value={form.truckNo} onChange={(e) => onChange('truckNo', e.target.value)} />
      <Input label="Quantity" value={form.qty} onChange={(e) => onChange('qty', e.target.value)} />
      <Input label="Challan No." value={form.challanNo} onChange={(e) => onChange('challanNo', e.target.value)} />
      <Input
        label="Dispatch Time"
        type="time"
        value={to24HourTime(form.dispatchTime)}
        onChange={(e) => onChange('dispatchTime', to12HourTime(e.target.value))}
      />
      <Input
        label="Arrival Time"
        type="time"
        value={to24HourTime(form.arrivalTime)}
        onChange={(e) => onChange('arrivalTime', to12HourTime(e.target.value))}
      />
      <Input
        label="Batch Start"
        type="time"
        value={to24HourTime(form.batchStartTime)}
        onChange={(e) => onChange('batchStartTime', to12HourTime(e.target.value))}
      />
      <Input
        label="Batch End"
        type="time"
        value={to24HourTime(form.batchEndTime)}
        onChange={(e) => onChange('batchEndTime', to12HourTime(e.target.value))}
      />
    </div>
    <div className="flex justify-end gap-2 mt-3">
      <Button type="button" onClick={onCancel} disabled={saving}>Cancel</Button>
      <Button type="button" variant="primary" onClick={onSave} disabled={saving || !form.truckNo.trim() || !form.qty.trim()}>
        {saving ? 'Saving...' : 'Save'}
      </Button>
    </div>
  </div>
);
