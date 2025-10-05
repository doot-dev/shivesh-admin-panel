import React, { useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";
import { ICON_NAMES } from "../../icons";

const AddProductModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    product: "",
    gradeSize: "",
    status: "Active",
  });

  const [errors, setErrors] = useState({});

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

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

    if (!formData.product.trim()) {
      newErrors.product = "Product name is required";
    }

    if (!formData.gradeSize.trim()) {
      newErrors.gradeSize = "Grade/Size is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      product: "",
      gradeSize: "",
      status: "Active",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Product"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name
          </label>
          <Input
            type="text"
            value={formData.product}
            onChange={(e) => handleChange("product", e.target.value)}
            placeholder="Enter product name"
            error={errors.product}
            disabled={loading}
            className="focus:outline-none"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            width="150px"
            height="45px"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            loading={loading}
            width="150px"
            height="45px"
          >
            {loading ? "Adding..." : "Add Product"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProductModal;
