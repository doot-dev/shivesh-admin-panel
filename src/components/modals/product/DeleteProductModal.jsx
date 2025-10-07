import { Icon, ICON_NAMES } from "../../icons";
import Button from "../../ui/Button";
const DeleteProductModal = ({ isOpen, onClose, product, onDelete, loading = false }) => {
  if (!isOpen || !product) return null;

  console.log("DeleteProductModal product:", product);

  const handleDelete = () => {
    // Call the delete function but don't close modal immediately
    // Let the parent component handle the closing after the async operation completes
    onDelete(product);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleOverlayClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#00000063] bg-opacity-50 transition-opacity"></div>
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 transform transition-all">
    

        {/* Content */}
        <div className="text-center">
          {/* Delete Icon */}
          <div className="flex justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <Icon 
                name={ICON_NAMES.TRASH_2} 
                size={24} 
                color="#EF4444"
              />
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="mb-6">
            <p className="text-base font-medium text-gray-900 leading-relaxed">
              Are you sure you want to delete this product? This action is permanent and cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg w-1/2 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            {/* <button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg w-1/2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
           
              {loading ? <Spinner size="w-4 h-4"  /> : "Delete"}
            </button> */}

            <Button  onClick={handleDelete} type="submit" disabled={loading} loading={loading} variant="danger" className="w-1/2" >
            {loading ? "Deleting..." : "Delete"}
          </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteProductModal;
