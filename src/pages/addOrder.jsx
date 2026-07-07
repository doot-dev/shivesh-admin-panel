import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';
import { ICON_NAMES, Icon } from '../components/icons';
import vendorService from '../services/vendorService';
import { fetchProductsById, fetchProducts } from '../features/product/productSlice';
import { fetchProjects } from '../features/projects/projectSlice';
import { fetchClients } from '../features/clients/clientsSlice';
import { fetchVendors } from '../features/vendors/vendorSlice';
import { createOrder, fetchFieldTechs } from '../features/orders/orderSlice';

const EMPTY = {
  projectId: '',
  clientId: '',
  productId: '',
  gradeId: '',
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
  const { productList: products = [], currentProduct } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchProjects());
    dispatch(fetchClients());
    dispatch(fetchVendors());
    dispatch(fetchProducts());
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

  const handleProductChange = (productId) => {
    setForm((p) => ({ ...p, productId, gradeId: '' }));
    if (errors.productId) setErrors((p) => ({ ...p, productId: '' }));
    if (productId) dispatch(fetchProductsById(productId));
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
    if (!form.gradeId) e.gradeId = 'Product grade is required';
    if (!form.quantity.trim()) e.quantity = 'Quantity is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const selectedProduct = products.find((p) => p.id === form.productId);
      const selectedGrade = currentProduct?.size?.find((g) => g.id === form.gradeId);
      const { productId, gradeId, ...rest } = form;

      const result = await dispatch(createOrder({
        ...rest,
        productName: selectedProduct?.name || '',
        productGrade: selectedGrade?.name || '',
        assignedToId: form.assignedToId ? parseInt(form.assignedToId) : undefined,
        vendorId: form.vendorId ? parseInt(form.vendorId) : undefined,
        vendorLocationId: form.vendorLocationId ? parseInt(form.vendorLocationId) : undefined,
        vendorHandlerId: form.vendorHandlerId ? parseInt(form.vendorHandlerId) : undefined,
      }));

      if (createOrder.fulfilled.match(result)) {
        const newOrderId = result.payload?.orderId;
        navigate(newOrderId ? `/orders/${newOrderId}` : '/orders');
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

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  const gradeOptions = (currentProduct?.size || []).map((g) => ({
    value: g.id,
    label: g.name,
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

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Back + Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary transition-colors"
        >
          <Icon name={ICON_NAMES.CHEVRON_LEFT} size={16} />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Add Order</h1>
          <p className="text-sm text-gray-500 mt-0.5">Create a new order</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 md:p-6 max-w-4xl">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project */}
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
                onChange={(v) => set('projectId', v)}
              />
              {errors.projectId && <p className="mt-1 text-xs text-red-500">{errors.projectId}</p>}
            </div>

            {/* Client */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Product <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <Dropdown
                options={productOptions}
                value={form.productId}
                placeholder="Select product"
                width="100%"
                height="40px"
                onChange={handleProductChange}
              />
              {errors.productId && <p className="mt-1 text-xs text-red-500">{errors.productId}</p>}
            </div>

            {/* Product Grade */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Product Grade <span style={{ color: 'var(--color-error)' }}>*</span>
              </label>
              <Dropdown
                options={gradeOptions}
                value={form.gradeId}
                placeholder="Select grade"
                width="100%"
                height="40px"
                disabled={!form.productId}
                onChange={(v) => set('gradeId', v)}
              />
              {errors.gradeId && <p className="mt-1 text-xs text-red-500">{errors.gradeId}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                Assign Field Tech
              </label>
              <Dropdown
                options={techOptions}
                value={form.assignedToId}
                placeholder="Unassigned"
                width="100%"
                height="40px"
                onChange={(v) => set('assignedToId', v)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Vendor */}
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

            {/* Vendor Location */}
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

            {/* Vendor Handler */}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Input
                type="date"
                label="Date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div>
              <Input
                type="time"
                label="Time"
                value={form.time}
                onChange={(e) => set('time', e.target.value)}
              />
            </div>
          </div>

          <Input
            label="Delivery Address (optional)"
            placeholder="Delivery address"
            value={form.deliveryAddress}
            onChange={(e) => set('deliveryAddress', e.target.value)}
          />

          <div className="flex gap-3 pt-2">
            <Button type="button" onClick={() => navigate('/orders')} className="flex-1 sm:flex-none sm:px-8">
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="flex-1 sm:flex-none sm:px-8" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddOrderPage;
