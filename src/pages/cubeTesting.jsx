import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { Icon, ICON_NAMES } from '../components/icons';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';
import Modal from '../components/ui/Modal';
import { Table } from '../components/ui';
import CubeTestForm, { FieldLabel } from '../components/cubeTest/CubeTestForm';
import orderService from '../services/orderService';
import api from '../services/api';
import {
  CUBE_TEST_PERIOD_LABEL,
  EMPTY_CUBE_TEST_FORM,
  buildCubeTestFormData,
  cubeTestFormIsValid,
  isOrderCubeTestLocked,
  splitIsoToDateTime,
} from '../utils/cubeTest';

const ORIGIN = api.defaults.baseURL;

export default function CubeTestingPage() {
  const [orders, setOrders] = useState([]);
  const [cubeTests, setCubeTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // "+ Add Cube Test"
  const [showAddModal, setShowAddModal] = useState(false);
  const [addOrderId, setAddOrderId] = useState('');
  const [addForm, setAddForm] = useState(EMPTY_CUBE_TEST_FORM);
  const [saving, setSaving] = useState(false);

  // View / edit / delete
  const [selected, setSelected] = useState(null); // cube test row, enriched with orderCode
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState(EMPTY_CUBE_TEST_FORM);
  const [deleting, setDeleting] = useState(false);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const ordersRes = await orderService.getOrders({ limit: 500 });
      const orderList = ordersRes.data || [];
      setOrders(orderList);

      const perOrder = await Promise.all(
        orderList.map(async (order) => {
          try {
            const res = await orderService.getCubeTests(order.orderId);
            return (res.data || []).map((ct) => ({
              ...ct,
              orderCode: order.orderId,
              clientName: order.client?.companyName || '—',
            }));
          } catch {
            return [];
          }
        })
      );
      setCubeTests(perOrder.flat());
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load cube tests');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Add ----
  const openAddModal = () => {
    setAddOrderId('');
    setAddForm(EMPTY_CUBE_TEST_FORM);
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddOrderId('');
    setAddForm(EMPTY_CUBE_TEST_FORM);
  };

  const addFormValid = Boolean(addOrderId) && cubeTestFormIsValid(addForm);

  const handleAddSave = async () => {
    if (!addFormValid) return;
    setSaving(true);
    try {
      const formData = buildCubeTestFormData(addForm);
      await orderService.addCubeTest(addOrderId, formData);
      toast.success('Cube test added');
      closeAddModal();
      loadAll();
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to add cube test');
    } finally {
      setSaving(false);
    }
  };

  // ---- View / Edit / Delete ----
  const openView = (ct) => {
    setSelected(ct);
    setEditing(false);
  };

  const closeView = () => {
    setSelected(null);
    setEditing(false);
    setEditForm(EMPTY_CUBE_TEST_FORM);
  };

  const openEdit = () => {
    const casting = splitIsoToDateTime(selected.castingDate);
    const to = splitIsoToDateTime(selected.toDate);
    setEditForm({
      castingDate: casting.date,
      castingTime: casting.time,
      quantity: selected.quantity || '',
      period: selected.period || '',
      toDate: to.date,
      toTime: to.time,
      file: null,
    });
    setEditing(true);
  };

  const editFormValid = cubeTestFormIsValid(editForm);

  const handleEditSave = async () => {
    if (!editFormValid) return;
    setSaving(true);
    try {
      const formData = buildCubeTestFormData(editForm);
      const res = await orderService.updateCubeTest(selected.orderCode, selected.id, formData);
      toast.success('Cube test updated');
      closeView();
      setCubeTests((prev) => prev.map((c) => (c.id === selected.id ? { ...c, ...res.data } : c)));
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to update cube test');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Remove this cube test?')) return;
    setDeleting(true);
    try {
      await orderService.deleteCubeTest(selected.orderCode, selected.id);
      toast.success('Cube test removed');
      setCubeTests((prev) => prev.filter((c) => c.id !== selected.id));
      closeView();
    } catch (e) {
      toast.error(e.response?.data?.message || e.response?.data?.error || 'Failed to remove cube test');
    } finally {
      setDeleting(false);
    }
  };

  // Cube tests can only be logged against orders that aren't delivered/completed yet.
  const addableOrderOptions = orders
    .filter((o) => !isOrderCubeTestLocked(o))
    .map((o) => ({
      value: o.orderId,
      label: `${o.orderId}${o.client?.companyName ? ` — ${o.client.companyName}` : ''}`,
    }));

  const columns = [
    { key: 'orderCode', header: 'Order ID' },
    { key: 'quantity', header: 'Quantity' },
    {
      key: 'castingDate',
      header: 'Date & Time',
      render: (value) => (value ? new Date(value).toLocaleString() : '—'),
    },
    {
      key: 'action',
      header: 'Action',
      render: (_v, item) => (
        <button
          type="button"
          onClick={() => openView(item)}
          className="text-xs font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          View
        </button>
      ),
    },
  ];

  const rows = cubeTests.filter((ct) => {
    const s = searchTerm.trim().toLowerCase();
    return !s || ct.orderCode?.toLowerCase().includes(s) || ct.clientName?.toLowerCase().includes(s);
  });

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">Cube Testing</h1>
          <p className="text-sm md:text-base text-gray-600">Concrete cube tests logged against orders</p>
        </div>
        <Button
          type="button"
          variant="success"
          leftIcon={ICON_NAMES.PLUS}
          onClick={openAddModal}
          className="px-4 py-2 md:px-6 md:py-3 text-sm whitespace-nowrap"
        >
          Add Cube Test
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4 md:mb-6">
        <div className="relative flex-1 max-w-full sm:max-w-[300px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
          </div>
          <input
            type="text"
            placeholder="Search by order ID or client"
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
            data={rows}
            columns={columns}
            loading={loading}
            itemsPerPage={10}
            emptyMessage="No cube tests found"
          />
        </div>
      </div>

      {/* Add modal */}
      <Modal isOpen={showAddModal} onClose={closeAddModal} title="Add Cube Test" size="2xl" showHeaderIcon={false}>
        <div className="mb-4">
          <FieldLabel>Order</FieldLabel>
          <Dropdown
            options={addableOrderOptions}
            value={addOrderId}
            placeholder={addableOrderOptions.length ? 'Select order' : 'No eligible orders'}
            width="100%"
            height="40px"
            searchable
            onChange={setAddOrderId}
          />
        </div>
        {addOrderId && (
          <CubeTestForm
            form={addForm}
            onChange={(field, value) => setAddForm((p) => ({ ...p, [field]: value }))}
            onSave={handleAddSave}
            onCancel={closeAddModal}
            saving={saving}
            valid={addFormValid}
          />
        )}
      </Modal>

      {/* View / edit modal */}
      <Modal
        isOpen={Boolean(selected)}
        onClose={closeView}
        title={selected ? `Cube Test — ${selected.orderCode}` : ''}
        size="2xl"
        showHeaderIcon={false}
      >
        {selected && !editing && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm mb-4">
              <div><span className="text-gray-500">Order:</span> <div className="font-medium">{selected.orderCode}</div></div>
              <div><span className="text-gray-500">Client:</span> <div className="font-medium">{selected.clientName}</div></div>
              <div><span className="text-gray-500">Period:</span> <div className="font-medium">{CUBE_TEST_PERIOD_LABEL[selected.period] || selected.period}</div></div>
              <div><span className="text-gray-500">Quantity:</span> <div className="font-medium">{selected.quantity}</div></div>
              <div>
                <span className="text-gray-500">Casting Date:</span>
                <div className="font-medium">{selected.castingDate ? new Date(selected.castingDate).toLocaleString() : '—'}</div>
              </div>
              <div>
                <span className="text-gray-500">Due Date:</span>
                <div className="font-medium">{selected.toDate ? new Date(selected.toDate).toLocaleString() : '—'}</div>
              </div>
            </div>
            {selected.fileUrl && (
              <a
                href={`${ORIGIN}${selected.fileUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mb-4 text-sm text-primary hover:underline font-medium"
              >
                View report
              </a>
            )}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Removing...' : 'Delete'}
              </Button>
              <Button type="button" variant="success" onClick={openEdit}>Edit</Button>
            </div>
          </div>
        )}

        {selected && editing && (
          <CubeTestForm
            form={editForm}
            onChange={(field, value) => setEditForm((p) => ({ ...p, [field]: value }))}
            onSave={handleEditSave}
            onCancel={() => setEditing(false)}
            saving={saving}
            valid={editFormValid}
          />
        )}
      </Modal>
    </div>
  );
}
