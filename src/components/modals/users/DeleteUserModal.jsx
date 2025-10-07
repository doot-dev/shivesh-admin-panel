import { Icon, ICON_NAMES } from "../../icons";

const DeleteUserModal = ({ isOpen, onClose, user, onDelete, loading = false }) => {
  if (!isOpen || !user) return null;

console.log("DeleteUserModal user:", user);

  const handleDelete = () => {
    // Call the delete function but don't close modal immediately
    // Let the parent component handle the closing after the async operation completes
    onDelete(user);
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
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Icon name={ICON_NAMES.X} size={20} />
        </button>

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
              Are you sure you want to delete this user? This action is permanent and cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 sm:px-6 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteUserModal;