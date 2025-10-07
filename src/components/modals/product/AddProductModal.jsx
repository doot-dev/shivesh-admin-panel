import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";
import { ICON_NAMES } from "../../icons";

const AddProductModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    name: "",
  });

  const [errors, setErrors] = useState({});

  // Reset form when modal closes


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
      newErrors.name = "Product name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    if (validateForm()) {
      onSubmit(formData);
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
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
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Enter product name"
            error={errors.name}
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
