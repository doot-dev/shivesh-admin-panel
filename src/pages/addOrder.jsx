import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import { ICON_NAMES, Icon } from '../components/icons';
import vendorService from '../services/vendorService';
import { fetchProjects } from '../features/projects/projectSlice';
import { fetchProjectProducts } from '../features/projects/projectProductSlice';
import { fetchClients } from '../features/clients/clientsSlice';
import { fetchVendors } from '../features/vendors/vendorSlice';
import { createOrder, fetchFieldTechs } from '../features/orders/orderSlice';
import {
  MAX_ORDER_MONTHS_AHEAD,
  getOrderDateError,
  maxOrderDateIso,
  maxOrderDateLabel,
  todayIso,
} from '../utils/orderDate';

const EMPTY = {
  projectId: '',
  clientId: '',
  productId: '',
  quantity: '',
  date: '',
  time: '',
  deliveryAddress: '',
};

let rowKeySeq = 0;
const nextRowKey = () => `row-${++rowKeySeq}`;

const makeVendorRow = () => ({
  key: nextRowKey(),
  vendorId: '',
  vendorLocationId: '',
  vendorHandlerId: '',
  locations: [],
  handlers: [],
  loadingLocations: false,
  loadingHandlers: false,
});

const makeTechRow = () => ({ key: nextRowKey(), userId: '' });

const makeTmRow = () => ({
  key: nextRowKey(),
  truckNo: '',
  qty: '',
  dispatchTime: '',
  arrivalTime: '',
  batchStartTime: '',
  batchEndTime: '',
  challanNo: '',
});

const AddOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [vendorRows, setVendorRows] = useState([]);
  const [techRows, setTechRows] = useState([]);
  const [tmRows, setTmRows] = useState([]);

  const { list: projects = [] } = useSelector((s) => s.project);
  const { list: clients = [] } = useSelector((s) => s.client);
  const { fieldTechs = [] } = useSelector((s) => s.orders);
  const { list: vendors = [] } = useSelector((s) => s.vendor);
  const { prodList: projectProducts = [], loading: loadingProjectProducts } = useSelector((s) => s.projectProduct);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchClients());
    dispatch(fetchVendors());
    dispatch(fetchFieldTechs());
  }, [dispatch]);

  const set = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => ({ ...p, [field]: '' }));

    // Auto-fill clientId when project changes
    if (field === 'projectId') {
      const proj = projects.find((p) => p.projectId === value);
      if (proj?.client?.clientId) {
        setForm((p) => ({ ...p, projectId: value, clientId: proj.client.clientId }));
      }
    }
  };

  const handleProjectChange = (projectId) => {
    set('projectId', projectId);
    setForm((p) => ({ ...p, productId: '' }));
    if (errors.productId) setErrors((p) => ({ ...p, productId: '' }));
    if (projectId) dispatch(fetchProjectProducts(projectId));
  };

  // Vendor rows
  const patchVendorRow = (key, patch) =>
    setVendorRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const loadLocations = (key, vendorId) => {
    patchVendorRow(key, { loadingLocations: true });
    return vendorService
      .getLocationbyVendorId(vendorId)
      .then((res) => patchVendorRow(key, { locations: res.data || [] }))
      .catch(() => patchVendorRow(key, { locations: [] }))
      .finally(() => patchVendorRow(key, { loadingLocations: false }));
  };

  const loadHandlers = (key, locationId) => {
    patchVendorRow(key, { loadingHandlers: true });
    return vendorService
      .getHandlersforLocation(locationId)
      .then((res) => patchVendorRow(key, { handlers: res.data || [] }))
      .catch(() => patchVendorRow(key, { handlers: [] }))
      .finally(() => patchVendorRow(key, { loadingHandlers: false }));
  };

  const handleVendorChange = (key, vendorId) => {
    patchVendorRow(key, { vendorId, vendorLocationId: '', vendorHandlerId: '', locations: [], handlers: [] });
    if (vendorId) loadLocations(key, vendorId);
  };

  const handleLocationChange = (key, vendorLocationId) => {
    patchVendorRow(key, { vendorLocationId, vendorHandlerId: '', handlers: [] });
    if (vendorLocationId) loadHandlers(key, vendorLocationId);
  };

  const addVendorRow = () => setVendorRows((rows) => [...rows, makeVendorRow()]);
  const removeVendorRow = (key) => setVendorRows((rows) => rows.filter((r) => r.key !== key));

  // Technician rows
  const addTechRow = () => setTechRows((rows) => [...rows, makeTechRow()]);
  const removeTechRow = (key) => setTechRows((rows) => rows.filter((r) => r.key !== key));
  const handleTechChange = (key, userId) =>
    setTechRows((rows) => rows.map((r) => (r.key === key ? { ...r, userId } : r)));

  const techOptionsFor = (row) => [
    { value: '', label: 'Select technician' },
    ...fieldTechs
      .filter(
        (t) =>
          String(t.id) === row.userId ||
          !techRows.some((r) => r.key !== row.key && r.userId === String(t.id))
      )
      .map((t) => ({ value: String(t.id), label: `${t.name} (${t.employeeId})` })),
  ];

  // TM rows
  const addTmRow = () => setTmRows((rows) => [...rows, makeTmRow()]);
  const removeTmRow = (key) => setTmRows((rows) => rows.filter((r) => r.key !== key));
  const patchTmRow = (key, patch) =>
    setTmRows((rows) => rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const validate = () => {
    const e = {};
    if (!form.projectId) e.projectId = 'Project is required';
    if (!form.clientId) e.clientId = 'Client is required';
    if (!form.productId) e.productId = 'Product is required';
    if (!form.quantity.trim()) e.quantity = 'Quantity is required';
    // min/max on the date input are advisory — a typed value still lands in
    // state, so the window is re-checked here before we call the API.
    const dateError = getOrderDateError(form.date);
    if (dateError) e.date = dateError;
    if (tmRows.some((r) => !r.truckNo.trim() || !r.qty.trim())) {
      e.tmDetails = 'Each TM needs a truck number and quantity';
    }
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const selectedProduct = projectProducts.find((p) => p.id === form.productId);

      const vendorsPayload = vendorRows
        .filter((r) => r.vendorId)
        .map((r) => ({
          vendorId: parseInt(r.vendorId),
          ...(r.vendorLocationId ? { vendorLocationId: parseInt(r.vendorLocationId) } : {}),
          ...(r.vendorHandlerId ? { vendorHandlerId: parseInt(r.vendorHandlerId) } : {}),
        }));

      const techniciansPayload = techRows
        .filter((r) => r.userId)
        .map((r) => ({ userId: parseInt(r.userId) }));

      const tmDetailsPayload = tmRows
        .filter((r) => r.truckNo.trim() && r.qty.trim())
        .map((r) => ({
          truckNo: r.truckNo.trim(),
          qty: r.qty.trim(),
          ...(r.dispatchTime ? { dispatchTime: r.dispatchTime } : {}),
          ...(r.arrivalTime ? { arrivalTime: r.arrivalTime } : {}),
          ...(r.batchStartTime ? { batchStartTime: r.batchStartTime } : {}),
          ...(r.batchEndTime ? { batchEndTime: r.batchEndTime } : {}),
          ...(r.challanNo ? { challanNo: r.challanNo } : {}),
        }));

      const result = await dispatch(createOrder({
        projectId: form.projectId,
        clientId: form.clientId,
        productName: selectedProduct?.productName || '',
        productGrade: selectedProduct?.productGrade || '',
        quantity: form.quantity,
        deliveryAddress: form.deliveryAddress,
        date: form.date,
        time: form.time,
        vendors: vendorsPayload,
        technicians: techniciansPayload,
        tmDetails: tmDetailsPayload,
      }));

      if (createOrder.fulfilled.match(result)) {
        navigate('/orders');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const projectOptions = projects.map((p) => ({
    value: p.projectId,
    label: p.projectName,
  }));

  const clientOptions = clients.map((c) => ({
    value: c.clientId,
    label: c.companyName || c.ownerName || c.name,
  }));

  const productOptions = projectProducts.map((p) => ({
    value: p.id,
    label: `${p.productName}${p.productGrade ? ` (${p.productGrade})` : ''}`,
  }));

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

  const selectedProjectName = projects.find((p) => p.projectId === form.projectId)?.projectName;
  const selectedClientName = clients.find((c) => c.clientId === form.clientId)?.companyName
    || clients.find((c) => c.clientId === form.clientId)?.ownerName;
  const selectedProductLabel = productOptions.find((p) => p.value === form.productId)?.label;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:text-primary hover:border-primary transition-colors bg-white"
        >
          <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Add Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new order and dispatch it to a vendor or field tech</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <SectionCard icon={ICON_NAMES.ORDERS} title="Order Details" subtitle="Project, client and product for this order">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Project <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <Dropdown
                  options={projectOptions}
                  value={form.projectId}
                  placeholder="Select project"
                  width="100%"
                  height="40px"
                  onChange={handleProjectChange}
                />
                {errors.projectId && <p className="mt-1 text-xs text-red-500">{errors.projectId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Client <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <Dropdown
                  options={clientOptions}
                  value={form.clientId}
                  placeholder="Select client"
                  width="100%"
                  height="40px"
                  onChange={(v) => set('clientId', v)}
                />
                {errors.clientId && <p className="mt-1 text-xs text-red-500">{errors.clientId}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Product <span style={{ color: 'var(--color-error)' }}>*</span>
                </label>
                <Dropdown
                  options={productOptions}
                  value={form.productId}
                  placeholder={
                    !form.projectId
                      ? 'Select project first'
                      : loadingProjectProducts
                        ? 'Loading...'
                        : 'Select product'
                  }
                  width="100%"
                  height="40px"
                  disabled={!form.projectId || loadingProjectProducts}
                  onChange={(v) => set('productId', v)}
                />
                {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId}</p>}
              </div>

              <div>
                <Input
                  label="Quantity"
                  placeholder="e.g. 50 m³"
                  value={form.quantity}
                  onChange={(e) => set('quantity', e.target.value)}
                  required
                  error={!!errors.quantity}
                  errorMessage={errors.quantity}
                />
              </div>
            </div>
          </SectionCard>

          {/* Field Technicians */}
          <SectionCard
            icon={ICON_NAMES.USER}
            title="Field Technicians"
            subtitle="Assign one or more field technicians to handle this order"
            action={
              <Button type="button" variant="success" onClick={addTechRow}>
                + Add
              </Button>
            }
          >
            {techRows.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No technicians added. Use "Add" to assign one.</p>
            ) : (
              <div className="space-y-3">
                {techRows.map((row, i) => (
                  <div key={row.key} className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                        Technician {i + 1}
                      </label>
                      <Dropdown
                        options={techOptionsFor(row)}
                        value={row.userId}
                        placeholder="Select technician"
                        width="100%"
                        height="40px"
                        onChange={(v) => handleTechChange(row.key, v)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTechRow(row.key)}
                      className="mb-2.5 text-xs text-red-600 hover:text-red-700 font-medium whitespace-nowrap"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Vendor & Logistics */}
          <SectionCard
            icon={ICON_NAMES.VENDOR}
            title="Vendor & Logistics"
            subtitle="Where the order will be sourced and dispatched from"
            action={
              <Button type="button" variant="success" onClick={addVendorRow}>
                + Add Vendor
              </Button>
            }
          >
            {vendorRows.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No vendors added. Use "Add Vendor" to add one.</p>
            ) : (
              <div className="space-y-4">
                {vendorRows.map((row, i) => (
                  <div key={row.key} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">Vendor {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeVendorRow(row.key)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                          Vendor
                        </label>
                        <Dropdown
                          options={vendorOptions}
                          value={row.vendorId}
                          placeholder="Select vendor"
                          width="100%"
                          height="40px"
                          onChange={(v) => handleVendorChange(row.key, v)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                          Plant Location
                        </label>
                        <Dropdown
                          options={toLocationOptions(row.locations)}
                          value={row.vendorLocationId}
                          placeholder={row.loadingLocations ? 'Loading...' : 'Select location'}
                          width="100%"
                          height="40px"
                          disabled={!row.vendorId || row.loadingLocations}
                          onChange={(v) => handleLocationChange(row.key, v)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                          Handler
                        </label>
                        <Dropdown
                          options={toHandlerOptions(row.handlers)}
                          value={row.vendorHandlerId}
                          placeholder={row.loadingHandlers ? 'Loading...' : 'Select handler'}
                          width="100%"
                          height="40px"
                          disabled={!row.vendorLocationId || row.loadingHandlers}
                          onChange={(v) => patchVendorRow(row.key, { vendorHandlerId: v })}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Schedule & Delivery */}
          <SectionCard icon={ICON_NAMES.PROJECT} title="Schedule & Delivery" subtitle="When and where the order should be delivered">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                value={form.date}
                min={todayIso()}
                max={maxOrderDateIso()}
                error={!!errors.date}
                errorMessage={errors.date}
                onChange={(e) => set('date', e.target.value)}
              />
              <Input
                type="time"
                label="Time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </div>

            <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              Orders can be scheduled up to {MAX_ORDER_MONTHS_AHEAD} months ahead
              {' '}(latest {maxOrderDateLabel()}).
            </p>

            <div className="mt-4">
              <Input
                label="Delivery Address (optional)"
                placeholder="Delivery address"
                value={form.deliveryAddress}
                onChange={(e) => set('deliveryAddress', e.target.value)}
              />
            </div>
          </SectionCard>

          {/* TM Details */}
          <SectionCard
            icon={ICON_NAMES.ORDERS}
            title="TM Details"
            subtitle="Optional — transit mixers can also be added later from the order page"
            action={
              <Button type="button" variant="success" onClick={addTmRow}>
                + Add TM
              </Button>
            }
          >
            {tmRows.length === 0 ? (
              <p className="text-sm text-gray-400 py-2">No TM details added yet.</p>
            ) : (
              <div className="space-y-4">
                {tmRows.map((row, i) => (
                  <div key={row.key} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-600">TM {i + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeTmRow(row.key)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <Input
                        label="Truck No."
                        placeholder="MH 01 4756"
                        value={row.truckNo}
                        onChange={(e) => patchTmRow(row.key, { truckNo: e.target.value })}
                      />
                      <Input
                        label="Quantity"
                        placeholder="6 m3"
                        value={row.qty}
                        onChange={(e) => patchTmRow(row.key, { qty: e.target.value })}
                      />
                      <Input
                        label="Challan No."
                        value={row.challanNo}
                        onChange={(e) => patchTmRow(row.key, { challanNo: e.target.value })}
                      />
                      <Input
                        label="Dispatch Time"
                        placeholder="09:30 AM"
                        value={row.dispatchTime}
                        onChange={(e) => patchTmRow(row.key, { dispatchTime: e.target.value })}
                      />
                      <Input
                        label="Arrival Time"
                        placeholder="09:55 AM"
                        value={row.arrivalTime}
                        onChange={(e) => patchTmRow(row.key, { arrivalTime: e.target.value })}
                      />
                      <Input
                        label="Batch Start"
                        placeholder="10:00 AM"
                        value={row.batchStartTime}
                        onChange={(e) => patchTmRow(row.key, { batchStartTime: e.target.value })}
                      />
                      <Input
                        label="Batch End"
                        placeholder="12:00 PM"
                        value={row.batchEndTime}
                        onChange={(e) => patchTmRow(row.key, { batchEndTime: e.target.value })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            {errors.tmDetails && <p className="mt-2 text-xs text-red-500">{errors.tmDetails}</p>}
          </SectionCard>

          {/* Actions (mobile/tablet) */}
          <div className="flex gap-3 lg:hidden">
            <Button type="button" onClick={() => navigate('/orders')} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-gray-200 bg-white sticky top-6 overflow-hidden shadow-sm">
            <div
              className="flex items-center gap-2 px-6 py-4 border-b border-gray-200"
              style={{ backgroundColor: 'var(--color-primary-light)' }}
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-inverse)' }}
              >
                <Icon name={ICON_NAMES.ORDERS} size={16} color="#ffffff" />
              </div>
              <div>
                <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Order Summary</h2>
                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Review before you create this order</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                <SummaryRow label="Project" value={selectedProjectName} />
                <SummaryRow label="Client" value={selectedClientName} />
                <SummaryRow label="Product" value={selectedProductLabel} />
                <SummaryRow label="Quantity" value={form.quantity} />
                <SummaryRow label="Technicians" value={techRows.filter((r) => r.userId).length || 'None'} />
                <SummaryRow label="Vendors" value={vendorRows.filter((r) => r.vendorId).length || 'None'} />
                <SummaryRow label="TM Details" value={tmRows.length || 'None'} />
                <SummaryRow label="Date" value={form.date} />
                <SummaryRow label="Time" value={form.time} />
              </div>

              <div className="mt-6 space-y-3 hidden lg:block">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full justify-center"
                  disabled={submitting}
                >
                  {submitting ? 'Creating...' : 'Create Order'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/orders')}
                  className="w-full justify-center"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const SectionCard = ({ icon, title, subtitle, action, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
    <div className="flex items-center justify-between gap-3 mb-5">
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-lg shrink-0"
          style={{ backgroundColor: 'var(--color-primary-light, #EEF2FF)', color: 'var(--color-primary)' }}
        >
          <Icon name={icon} size={18} color="var(--color-primary)" />
        </div>
        <div>
          <h2 className="text-sm md:text-base font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
    {children}
  </div>
);

const SummaryRow = ({ label, value }) => (
  <div className="flex items-center justify-between gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
    <span
      className="text-sm font-medium text-right truncate max-w-[55%]"
      style={{ color: value ? 'var(--color-text-primary)' : 'var(--color-text-light)' }}
    >
      {value || '—'}
    </span>
  </div>
);

export default AddOrderPage;
