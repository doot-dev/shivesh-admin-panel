import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

import {
  addOrderComment,
  clearCurrentOrder,
  fetchFieldTechs,
  fetchOrderById,
  updateOrder,
} from '../features/orders/orderSlice';
import Button from '../components/ui/Button';
import FullPageLoader from '../components/ui/FullPageLoader';
import AssignTechModal from '../components/modals/orders/AssignTechModal';
import { ICON_NAMES, Icon } from '../components/icons';

const ORDER_STATUSES = ['NEW', 'ACTIVE', 'COMPLETED', 'CANCELLED'];
const DELIVERY_STATUSES = ['ASSIGNED', 'IN_TRANSIT', 'DELIVERED'];

const STATUS_BADGE = {
  NEW:       { color: '#2563EB', backgroundColor: '#DBEAFE' },
  ACTIVE:    { color: '#16A34A', backgroundColor: '#D1FAE5' },
  COMPLETED: { color: '#374151', backgroundColor: '#F3F4F6' },
  CANCELLED: { color: '#DC2626', backgroundColor: '#FECACA' },
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

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const commentsEndRef = useRef(null);

  const { currentOrder: order, loading, fieldTechs } = useSelector((s) => s.orders);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    dispatch(fetchOrderById(orderId));
    dispatch(fetchFieldTechs());
    return () => dispatch(clearCurrentOrder());
  }, [dispatch, orderId]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [order?.comments?.length]);

  const handleAssign = async (techId) => {
    await dispatch(updateOrder({ orderId, assignedToId: techId }));
    dispatch(fetchOrderById(orderId));
  };

  const handleStatusChange = async (field, value) => {
    setUpdatingStatus(true);
    await dispatch(updateOrder({ orderId, [field]: value }));
    await dispatch(fetchOrderById(orderId));
    setUpdatingStatus(false);
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

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
          Back
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Order Info + Vendor + TM Details */}
        <div className="lg:col-span-2 space-y-5">

          {/* Order Summary */}
          <SectionCard
            title="Order Summary"
            action={
              <div className="flex gap-2 flex-wrap">
                {/* Order Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Status:</span>
                  <select
                    value={order.status}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange('status', e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                {/* Delivery Status */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Delivery:</span>
                  <select
                    value={order.deliveryStatus || 'ASSIGNED'}
                    disabled={updatingStatus}
                    onChange={(e) => handleStatusChange('deliveryStatus', e.target.value)}
                    className="text-xs border border-gray-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DELIVERY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            }
          >
            <InfoRow label="Order ID" value={order.orderId} />
            <InfoRow label="Project" value={order.project?.projectName} />
            <InfoRow label="Client" value={order.client?.companyName} />
            <InfoRow label="Product" value={`${order.productName || ''} ${order.productGrade ? `(${order.productGrade})` : ''}`} />
            <InfoRow label="Quantity" value={order.quantity} />
            <InfoRow label="Date" value={order.date} />
            <InfoRow label="Time" value={order.time} />
            <InfoRow label="Delivery Address" value={order.deliveryAddress} />
          </SectionCard>

          {/* Vendor Details */}
          {order.vendor && (
            <SectionCard title="Vendor Details">
              <InfoRow label="Vendor" value={order.vendor?.companyName} />
              <InfoRow label="Handler" value={order.vendorHandler?.name} />
              <InfoRow label="Handler Phone" value={order.vendorHandler?.phone} />
              <InfoRow label="Plant Location" value={order.vendorLocation?.address} />
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
          <SectionCard
            title="Field Technician"
            action={
              <button
                onClick={() => setShowAssignModal(true)}
                className="text-xs text-primary font-medium hover:underline"
              >
                {order.assignedTo ? 'Reassign' : 'Assign'}
              </button>
            }
          >
            {order.assignedTo ? (
              <>
                <InfoRow label="Name" value={order.assignedTo.name} />
                <InfoRow label="Employee ID" value={order.assignedTo.employeeId} />
                <InfoRow label="Phone" value={order.assignedTo.phone} />
              </>
            ) : (
              <div className="py-2">
                <p className="text-sm text-gray-400 mb-3">No field tech assigned.</p>
                <Button variant="primary" size="sm" onClick={() => setShowAssignModal(true)} className="w-full">
                  Assign Field Tech
                </Button>
              </div>
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

      <AssignTechModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSubmit={handleAssign}
        fieldTechs={fieldTechs}
        currentAssignedId={order.assignedToId}
      />
    </div>
  );
}
