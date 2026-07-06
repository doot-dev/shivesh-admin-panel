import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Dropdown from '../../ui/Dropdown';
import { ICON_NAMES } from '../../icons';
import vendorService from '../../../services/vendorService';
import { fetchProductsById } from '../../../features/product/productSlice';

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

const CreateOrderModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();

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
    if (errors.vendorId) setErrors((p) => ({ ...p, vendorId: '' }));

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

      await onSubmit({
        ...rest,
        productName: selectedProduct?.name || '',
        productGrade: selectedGrade?.name || '',
        assignedToId: form.assignedToId ? parseInt(form.assignedToId) : undefined,
        vendorId: form.vendorId ? parseInt(form.vendorId) : undefined,
        vendorLocationId: form.vendorLocationId ? parseInt(form.vendorLocationId) : undefined,
        vendorHandlerId: form.vendorHandlerId ? parseInt(form.vendorHandlerId) : undefined,
      });
      handleClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setForm(EMPTY);
    setErrors({});
    setSubmitting(false);
    setLocations([]);
    setHandlers([]);
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setForm(EMPTY);
      setErrors({});
      setLocations([]);
      setHandlers([]);
    }
  }, [isOpen]);

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create new order"
      size="xl"
      maxWidth="600px"
      headerIcon={ICON_NAMES.ORDERS}
    >
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
          <Button type="button" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Order'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOrderModal;
