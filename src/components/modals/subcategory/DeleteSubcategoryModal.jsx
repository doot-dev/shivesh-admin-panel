import { Icon, ICON_NAMES } from "../../icons";
import Button from "../../ui/Button";

const DeleteSubcategoryModal = ({
  isOpen,
  onClose,
  subcategory,
  onDelete,
  loading = false,
}) => {
  if (!isOpen || !subcategory) return null;

  const handleDelete = () => {
    onDelete(subcategory);
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
        <div className="text-center">
          {/* Delete Icon */}
          <div className="flex justify-center mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <Icon name={ICON_NAMES.TRASH_2} size={24} color="#EF4444" />
            </div>
          </div>

          {/* Confirmation Text */}
          <div className="mb-6">
            <p className="text-base font-medium text-gray-900 leading-relaxed">
              Are you sure you want to delete this sub-category? Project
              products that already use it keep their existing value.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 sm:px-6 sm:py-2 border border-gray-300 rounded-lg w-1/2 text-gray-700 bg-white hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              Cancel
            </button>

            <Button
              onClick={handleDelete}
              type="button"
              disabled={loading}
              loading={loading}
              variant="danger"
              className="w-1/2 text-sm sm:text-base px-4 py-2 sm:px-6 sm:py-2"
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSubcategoryModal;
