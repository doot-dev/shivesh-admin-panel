import React, { useState, useEffect } from "react";
import Modal from "../../../ui/Modal";
import Button from "../../../ui/Button";
import Input from "../../../ui/Input";
import Dropdown from "../../../ui/Dropdown";
import { ICON_NAMES } from "../../../icons";

const EditGradeModal = ({ isOpen, onClose }) => {
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

  // Populate form when product data changes
  // useEffect(() => {
  //   if (product) {
  //     setFormData({
  //       product: product.product || "",
  //       gradeSize: product.gradeSize || "",
  //       status: product.status || "Active",
  //     });
  //     setErrors({});
  //   }
  // }, [product]);

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
      onSubmit(product.id, formData);
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
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grade/Size
            </label>
            <Input
              type="text"
              value={formData.product}
              onChange={(e) => handleChange("product", e.target.value)}
              placeholder="Enter product name"
              error={errors.product}
              // disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sub-category
            </label>
            <Input
              type="text"
              value={formData.gradeSize}
              onChange={(e) => handleChange("gradeSize", e.target.value)}
              placeholder="Enter grade or size"
              error={errors.gradeSize}
              // disabled={loading}
            />
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
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.checked,
                  }))
                }
              />
              <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span
                className="ml-3 text-sm font-medium"
                style={{ color: "var(--color-text-primary)" }}
              >
                {formData.status ? "Active" : "Inactive"}
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            // disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            //  disabled={loading} loading={loading}
          >
            {/* {loading ? "Updating..." : "Update Product"}
             */}
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditGradeModal;
