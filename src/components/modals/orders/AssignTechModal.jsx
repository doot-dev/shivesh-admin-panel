import { useState } from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import Dropdown from '../../ui/Dropdown';
import { ICON_NAMES } from '../../icons';

const AssignTechModal = ({ isOpen, onClose, onSubmit, fieldTechs = [], currentAssignedId }) => {
  const [selectedId, setSelectedId] = useState(currentAssignedId ? String(currentAssignedId) : '');
  const [submitting, setSubmitting] = useState(false);

  const options = [
    { value: '', label: 'Unassigned' },
    ...fieldTechs.map((t) => ({
      value: String(t.id),
      label: `${t.name} (${t.employeeId})`,
    })),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await onSubmit(selectedId ? parseInt(selectedId) : null);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Field Tech"
      size="sm"
      maxWidth="400px"
      headerIcon={ICON_NAMES.USER}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Field Technician
          </label>
          <Dropdown
            options={options}
            value={selectedId}
            placeholder="Select technician"
            width="100%"
            height="40px"
            onChange={(v) => setSelectedId(v)}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={submitting}>
            {submitting ? 'Saving...' : 'Assign'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AssignTechModal;
