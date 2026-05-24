import { useState } from 'react';
import { useSelector } from 'react-redux';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Dropdown from '../../ui/Dropdown';
import { ICON_NAMES } from '../../icons';

const EMPTY = {
  projectId: '',
  clientId: '',
  productName: '',
  productGrade: '',
  quantity: '',
  date: '',
  time: '',
  deliveryAddress: '',
  assignedToId: '',
};

const CreateOrderModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { list: projects = [] } = useSelector((s) => s.project);
  const { list: clients = [] } = useSelector((s) => s.client);
  const { fieldTechs = [] } = useSelector((s) => s.orders);

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

  const validate = () => {
    const e = {};
    if (!form.projectId) e.projectId = 'Project is required';
    if (!form.clientId) e.clientId = 'Client is required';
    if (!form.productName.trim()) e.productName = 'Product name is required';
    if (!form.productGrade.trim()) e.productGrade = 'Product grade is required';
    if (!form.quantity.trim()) e.quantity = 'Quantity is required';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await onSubmit({
        ...form,
        assignedToId: form.assignedToId ? parseInt(form.assignedToId) : undefined,
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
    onClose();
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
          <div>
            <Input
              label="Product Name"
              placeholder="e.g. RMC"
              value={form.productName}
              onChange={(e) => set('productName', e.target.value)}
              required
              error={!!errors.productName}
              errorMessage={errors.productName}
            />
          </div>
          <div>
            <Input
              label="Product Grade"
              placeholder="e.g. M25"
              value={form.productGrade}
              onChange={(e) => set('productGrade', e.target.value)}
              required
              error={!!errors.productGrade}
              errorMessage={errors.productGrade}
            />
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
