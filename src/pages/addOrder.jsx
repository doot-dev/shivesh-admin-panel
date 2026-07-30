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

const EMPTY = {
  projectId: '',
  clientId: '',
  productId: '',
  quantity: '',
  date: '',
  time: '',
  deliveryAddress: '',
  assignedToId: '',
  vendorId: '',
  vendorLocationId: '',
  vendorHandlerId: '',
};

const AddOrderPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [locations, setLocations] = useState([]);
  const [handlers, setHandlers] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [loadingHandlers, setLoadingHandlers] = useState(false);

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

  const handleVendorChange = (vendorId) => {
    setForm((p) => ({ ...p, vendorId, vendorLocationId: '', vendorHandlerId: '' }));
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
    setForm((p) => ({ ...p, vendorLocationId, vendorHandlerId: '' }));
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

  const validate = () => {
    const e = {};
    if (!form.projectId) e.projectId = 'Project is required';
    if (!form.clientId) e.clientId = 'Client is required';
    if (!form.productId) e.productId = 'Product is required';
    if (!form.quantity.trim()) e.quantity = 'Quantity is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const selectedProduct = projectProducts.find((p) => p.id === form.productId);
      const { productId, ...rest } = form;

      const result = await dispatch(createOrder({
        ...rest,
        productName: selectedProduct?.productName || '',
        productGrade: selectedProduct?.productGrade || '',
        assignedToId: form.assignedToId ? parseInt(form.assignedToId) : undefined,
        vendorId: form.vendorId ? parseInt(form.vendorId) : undefined,
        vendorLocationId: form.vendorLocationId ? parseInt(form.vendorLocationId) : undefined,
        vendorHandlerId: form.vendorHandlerId ? parseInt(form.vendorHandlerId) : undefined,
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

  const techOptions = [
    { value: '', label: 'Unassigned' },
    ...fieldTechs.map((t) => ({
      value: String(t.id),
      label: `${t.name} (${t.employeeId})`,
    })),
  ];

  const productOptions = projectProducts.map((p) => ({
    value: p.id,
    label: `${p.productName}${p.productGrade ? ` (${p.productGrade})` : ''}`,
  }));

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

  const selectedProjectName = projects.find((p) => p.projectId === form.projectId)?.projectName;
  const selectedClientName = clients.find((c) => c.clientId === form.clientId)?.companyName
    || clients.find((c) => c.clientId === form.clientId)?.ownerName;
  const selectedProductLabel = productOptions.find((p) => p.value === form.productId)?.label;
  const selectedVendorName = vendorOptions.find((v) => v.value === String(form.vendorId))?.label;
  const selectedTechName = techOptions.find((t) => t.value === String(form.assignedToId))?.label;

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

          {/* Assignment */}
          <SectionCard icon={ICON_NAMES.USER} title="Assignment" subtitle="Assign a field technician to handle this order">
            <Dropdown
              options={techOptions}
              value={form.assignedToId}
              placeholder="Unassigned"
              width="100%"
              height="40px"
              onChange={(v) => set('assignedToId', v)}
            />
          </SectionCard>

          {/* Vendor & Logistics */}
          <SectionCard icon={ICON_NAMES.VENDOR} title="Vendor & Logistics" subtitle="Where the order will be sourced and dispatched from">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Vendor
                </label>
                <Dropdown
                  options={vendorOptions}
                  value={form.vendorId}
                  placeholder="Select vendor"
                  width="100%"
                  height="40px"
                  onChange={handleVendorChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Plant Location
                </label>
                <Dropdown
                  options={locationOptions}
                  value={form.vendorLocationId}
                  placeholder={loadingLocations ? 'Loading...' : 'Select location'}
                  width="100%"
                  height="40px"
                  disabled={!form.vendorId || loadingLocations}
                  onChange={handleLocationChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                  Handler
                </label>
                <Dropdown
                  options={handlerOptions}
                  value={form.vendorHandlerId}
                  placeholder={loadingHandlers ? 'Loading...' : 'Select handler'}
                  width="100%"
                  height="40px"
                  disabled={!form.vendorLocationId || loadingHandlers}
                  onChange={(v) => set('vendorHandlerId', v)}
                />
              </div>
            </div>
          </SectionCard>

          {/* Schedule & Delivery */}
          <SectionCard icon={ICON_NAMES.PROJECT} title="Schedule & Delivery" subtitle="When and where the order should be delivered">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
              <Input
                type="time"
                label="Time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </div>

            <div className="mt-4">
              <Input
                label="Delivery Address (optional)"
                placeholder="Delivery address"
                value={form.deliveryAddress}
                onChange={(e) => set('deliveryAddress', e.target.value)}
              />
            </div>
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
                <SummaryRow label="Field Tech" value={selectedTechName || 'Unassigned'} />
                <SummaryRow label="Vendor" value={selectedVendorName} />
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

const SectionCard = ({ icon, title, subtitle, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 shadow-sm">
    <div className="flex items-center gap-3 mb-5">
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
