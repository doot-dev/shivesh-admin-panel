import React from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { Icon, ICON_NAMES } from "../../icons";

const DeleteLeadsModal = ({ isOpen, onClose, onConfirm, leads }) => {
  const handleConfirm = () => {
    onConfirm(leads);
    onClose();
  };

  if (!leads) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete vendor">
      <div className="text-center py-4">
        {/* Warning Icon */}
        <div className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
          <Icon 
            name={ICON_NAMES.ALERT_TRIANGLE} 
            size={24} 
            color="#DC2626" 
          />
        </div>

        {/* Message */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Are you sure?
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Do you really want to delete 
          {/* <strong>"{vendor.name}"</strong>?  */}
          This action cannot be undone.
        </p>

        {/* Vendor Info */}
        {/* <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <div className="text-sm space-y-1">
            <div><strong>Company:</strong> {vendor.name}</div>
            <div><strong>Contact Person:</strong> {vendor.contactPerson}</div>
            <div><strong>Phone:</strong> {vendor.phone}</div>
            <div><strong>Email:</strong> {vendor.email}</div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleConfirm}
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteLeadsModal;