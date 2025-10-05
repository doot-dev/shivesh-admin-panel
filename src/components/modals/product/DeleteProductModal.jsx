import React from 'react';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';

const DeleteProductModal = ({ isOpen, onClose, product, onDelete, loading = false }) => {
  if (!product) return null;

  const handleDelete = () => {
    onDelete(product.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Product">
      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg 
              className="h-6 w-6 text-red-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Confirm Delete
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to delete the product "{product.product}" with grade/size "{product.gradeSize}"?
            This action cannot be undone.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Product:</span>
            <span className="font-medium text-gray-900">{product.product}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Grade/Size:</span>
            <span className="font-medium text-gray-900">{product.gradeSize}</span>
          </div>
          <div className="flex justify-between items-center text-sm mt-2">
            <span className="text-gray-600">Status:</span>
            <span 
              className={`
                inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                ${product.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
                }
              `}
            >
              {product.status}
            </span>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={loading}
            loading={loading}
          >
            {loading ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteProductModal;