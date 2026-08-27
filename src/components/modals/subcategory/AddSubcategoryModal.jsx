import { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { ICON_NAMES } from "../../icons";

const AddSubcategoryModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isOpen) {
      setFormData({ name: "" });
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

    onSubmit({ name: formData.name.trim() });
  };

  const handleClose = () => {
    setFormData({ name: "" });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Sub-category"
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

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            width="120px"
            height="40px"
            className="sm:!w-[150px] sm:!h-[45px] text-sm sm:text-base"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            width="120px"
            height="40px"
            className="sm:!w-[150px] sm:!h-[45px] text-sm sm:text-base"
          >
            {loading ? "Adding..." : "Add Sub-category"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddSubcategoryModal;
