import React, { useState, useEffect } from "react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Dropdown from "../../../ui/Dropdown";
import { ICON_NAMES } from "../../../icons";

const EditGradeModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  gradeData,
  productId,
}) => {
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    subcategory: "",
    isActive: true,
    productId: productId || "",
  });

  const [errors, setErrors] = useState({});

  // Populate form when grade data changes
  useEffect(() => {
    if (gradeData) {
      console.log("Populating form with grade data:", gradeData);
      setFormData({
        id: gradeData.id || "",
        name: gradeData.name || "",
        subcategory: gradeData.subcategory || "",
        isActive: gradeData.isActive !== undefined ? gradeData.isActive : true,
        productId: productId || gradeData.productId || "",
      });
      setErrors({});
    }
  }, [gradeData, productId]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen && !gradeData) {
      setFormData({
        id: "",
        name: "",
        subcategory: "",
        isActive: true,
        productId: productId || "",
      });
      setErrors({});
    }
  }, [isOpen, productId]);

  const handleChange = (name, value) => {
    // Real-time validation for character limits
    let error = "";
    if ((name === "name" || name === "subcategory") && value.length > 60) {
      error = "Only 60 characters allowed";
    }

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Update error state
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate Grade/Size name
    if (!formData.name.trim()) {
      newErrors.name = "Please fill the field";
    } else if (formData.name.length > 60) {
      newErrors.name = "Only 60 characters allowed";
    }

    // Validate Sub-category
    if (!formData.subcategory.trim()) {
      newErrors.subcategory = "Please fill the field";
    } else if (formData.subcategory.length > 60) {
      newErrors.subcategory = "Only 60 characters allowed";
    }

    // Validate Product ID
    if (!formData.productId) {
      newErrors.productId = "Product ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      console.log("Form Data of grade Edit Submitted:", formData);
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Grade/Size and Subcategory"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade/Size <span className="text-red-500" >*</span>
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter grade/size name (e.g., M30, M40)"
              error={errors.name}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-category
            </label>
            <Input
              type="text"
              value={formData.subcategory}
              onChange={(e) => handleChange("subcategory", e.target.value)}
              placeholder="Enter sub-category (e.g., Pure OPC)"
              error={errors.subcategory}
              disabled={loading}
              maxLength={60}
            />
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">
                {formData.subcategory.length}/60 characters
              </span>
            </div>
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
            width="180px"
            height="40px"
            className="sm:!w-[180px] sm:!h-[45px] text-sm sm:text-base"
            disabled={loading}
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
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGradeModal;
