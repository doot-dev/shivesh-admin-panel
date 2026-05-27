import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Button from '../components/ui/Button';
import { Table } from '../components/ui';
import DeleteModal from '../components/modals/DeleteModal';
import CreateOrderModal from '../components/modals/orders/CreateOrderModal';
import { createOrder, deleteOrder, fetchFieldTechs, fetchOrders } from '../features/orders/orderSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { fetchClients } from '../features/clients/clientsSlice';

const STATUS_TABS = ['All', 'NEW', 'ACTIVE', 'COMPLETED', 'CANCELLED'];

const STATUS_BADGE = {
  NEW:       { color: '#2563EB', backgroundColor: '#DBEAFE' },
  ACTIVE:    { color: '#16A34A', backgroundColor: '#D1FAE5' },
  COMPLETED: { color: '#374151', backgroundColor: '#F3F4F6' },
  CANCELLED: { color: '#DC2626', backgroundColor: '#FECACA' },
};

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { list: orders = [], total, loading } = useSelector((s) => s.orders);

  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfig, setDeleteConfig] = useState({ onConfirm: null, title: '', message: '' });

  const refresh = useCallback(() => {
    dispatch(fetchOrders({ limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    refresh();
    dispatch(fetchProjects());
    dispatch(fetchClients());
    dispatch(fetchFieldTechs());
  }, [refresh, dispatch]);

  const columns = [
    { key: 'sNo', header: 'S.No' },
    { key: 'orderId', header: 'Order ID' },
    { key: 'projectName', header: 'Project' },
    { key: 'clientName', header: 'Client' },
    { key: 'product', header: 'Product' },
    { key: 'quantity', header: 'Quantity' },
    { key: 'assignedToName', header: 'Field Tech' },
    { key: 'date', header: 'Date' },
    {
      key: 'status',
      header: 'Status',
      type: 'badge',
      badgeConfig: STATUS_BADGE,
    },
  ];

  const handleView = (order) => navigate(`/orders/${order.orderId}`);

  const handleDelete = (order) => {
    setDeleteConfig({
      onConfirm: async () => {
        const result = await dispatch(deleteOrder(order.orderId));
        if (deleteOrder.fulfilled.match(result)) refresh();
      },
      title: 'Delete Order',
      message: `Are you sure you want to delete order ${order.orderId}? This cannot be undone.`,
    });
    setShowDeleteModal(true);
  };

  const actions = [
    { text: 'View', onClick: handleView, textColor: 'var(--color-primary)' },
    { text: 'Delete', onClick: handleDelete, textColor: 'var(--color-error)' },
  ];

  const handleCreate = async (formData) => {
    const result = await dispatch(createOrder(formData));
    if (createOrder.fulfilled.match(result)) refresh();
  };

  const filteredOrders = orders
    .filter((o) => activeTab === 'All' || o.status === activeTab)
    .filter((o) => {
      const s = searchTerm.toLowerCase();
      return (
        !s ||
        o.orderId?.toLowerCase().includes(s) ||
        o.project?.projectName?.toLowerCase().includes(s) ||
        o.client?.companyName?.toLowerCase().includes(s) ||
        o.productName?.toLowerCase().includes(s)
      );
    })
    .map((o, i) => ({
      ...o,
      sNo: (i + 1).toString().padStart(2, '0'),
      projectName: o.project?.projectName || '—',
      clientName: o.client?.companyName || '—',
      product: `${o.productName || ''}${o.productGrade ? ` (${o.productGrade})` : ''}`,
      assignedToName: o.assignedTo?.name || 'Unassigned',
      date: o.date || '—',
    }));

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">
          Orders & Tracks
        </h1>
        <p className="text-sm md:text-base text-gray-600">View and manage orders</p>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search + Add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center md:justify-between gap-3 md:gap-4 mb-4 md:mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-[60%] md:max-w-[40%]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
          </div>
          <input
            type="text"
            placeholder="Search by order ID, project, client…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 md:py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        
      </div>

      {/* Table */}
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table
            data={filteredOrders}
            columns={columns}
            actions={actions}
            loading={loading}
            itemsPerPage={10}
            emptyMessage="No orders found"
            mainTotalItems={total}
          />
        </div>
      </div>

      <CreateOrderModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreate}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={deleteConfig.onConfirm}
        title={deleteConfig.title}
        message={deleteConfig.message}
      />
    </div>
  );
};

export default OrdersPage;
