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
      setFormData(prev => ({
        name: "",
        subcategory: "",
        productId: productId || prev.productId,
      }));
      setErrors({});
    }
  }, [isOpen]); // Removed productId from dependencies to prevent unnecessary resets

  const handleChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Grade/Size name is required";
    }

    if (!formData.subcategory.trim()) {
      newErrors.subcategory = "Sub-category is required";
    }

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
      title="Edit Grade/Size and Subcategory"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade/Size
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter grade/size name (e.g., M30, M40)"
              error={errors.name}
              disabled={loading}
            />
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
            />
          </div>
        </div>

        {/* Product Info Display */}
        {productName && (
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              Adding grade/size for:{" "}
              <span className="font-medium text-gray-900">{productName}</span>
              <span className="text-xs text-gray-500 ml-2">
                (ID: {productId})
              </span>
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            width="150px"
            height="45px"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            width="150px"
            height="45px"
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
