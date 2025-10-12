import React, { useState, useEffect } from "react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Dropdown from "../../../ui/Dropdown";
import { ICON_NAMES } from "../../../icons";

const AddGradeModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  productId,
  productName,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    subcategory: "",
    productId: productId || "",
  });

  console.log("AddGradeModal - productId:", productId);

  const [errors, setErrors] = useState({});

  // Update productId in formData when productId prop changes
  useEffect(() => {
    if (productId) {
      setFormData((prev) => ({
        ...prev,
        productId: productId,
      }));
    }
  }, [productId]);

  // Reset form only when modal opens for the first time
  useEffect(() => {
    if (isOpen) {
      setFormData((prev) => ({
        name: "",
        subcategory: "",
        productId: productId || prev.productId,
      }));
      setErrors({});
    }
  }, [isOpen]); // Removed productId from dependencies to prevent unnecessary resets

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
      console.log("Form Data of grade Submitted:", formData);

      // Just pass the form data to parent - let parent handle API call
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    // Reset form data when manually closing
    setFormData({
      name: "",
      subcategory: "",
      productId: productId || "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Grade/Size and Subcategory"
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

        <div className="flex justify-end space-x-3 pt-4 mt-8">
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
            width="180px"
            height="40px"
            className="sm:!w-[180px] sm:!h-[45px] text-sm sm:text-base"
            disabled={loading}
            loading={loading}
          >
            {loading ? "Adding..." : "Add Grade/Size"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddGradeModal;
