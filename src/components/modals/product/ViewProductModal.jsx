import React from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const ViewProductModal = ({ isOpen, onClose, product }) => {
  if (!product) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Product Details">
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Number
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-900">
              {product.sNo}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-900">
              {product.product}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade/Size
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-900">
              {product.gradeSize}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div className="px-3 py-2 bg-gray-50 rounded-md">
              <span 
                className={`
                  inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                  ${product.status === 'Active' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                  }
                `}
              >
                {product.status}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewProductModal;