import { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { ICON_NAMES } from "../../icons";

const EditSubcategoryModal = ({
  isOpen,
  onClose,
  subcategory,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (subcategory) {
      setFormData({
        id: subcategory.id || "",
        name: subcategory.name || "",
        isActive:
          subcategory.isActive !== undefined ? subcategory.isActive : true,
      });
      setErrors({});
    }
  }, [subcategory]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({ id: "", name: "", isActive: true });
      setErrors({});
    }
  }, [isOpen]);

  const handleChange = (name, value) => {
    let error = "";
    if (name === "name" && value.length > 60) {
      error = "Only 60 characters allowed";
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Please fill the field";
    } else if (formData.name.length > 60) {
      newErrors.name = "Only 60 characters allowed";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      id: formData.id,
      name: formData.name.trim(),
      isActive: formData.isActive,
    });
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Sub-category"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sub-category Name
          </label>
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter sub-category (e.g., Pure OPC)"
            error={!!errors.name}
            errorMessage={errors.name}
            disabled={loading}
            maxLength={60}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {formData.name.length}/60 characters
            </span>
          </div>
        </div>

        <div>
          <label
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Status
          </label>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive: e.target.checked,
                  }))
                }
              />
              <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span
                className="ml-3 text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            width="150px"
            height="40px"
            className="sm:!w-[150px] sm:!h-[45px] text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            width="180px"
            height="40px"
            className="sm:!w-[180px] sm:!h-[45px] text-sm sm:text-base"
          >
            {loading ? "Updating..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditSubcategoryModal;
