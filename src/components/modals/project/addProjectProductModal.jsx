import { useState } from "react";
import { ICON_NAMES } from "../../icons";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";

const AddProjectProductModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    productName: "",
    productGrade: "",
    productCost: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const gradeOptions = [
    { value: "A", label: "Grade A" },
    { value: "B", label: "Grade B" },
    { value: "C", label: "Grade C" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.productName)
      newErrors.productName = "Product Name is required";
    if (!formData.productGrade)
      newErrors.productGrade = "Product Grade is required";
    if (!formData.productCost)
      newErrors.productCost = "Product Cost is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    onSubmit({
      ...formData,
      productCost: Number(formData.productCost), // ensure numeric
    });

    setSubmitting(false);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      productName: "",
      productGrade: "",
      productCost: "",
    });
    setErrors({});
    setSubmitting(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Add Product"
      size="md"
      maxWidth="450px"
      headerIcon={ICON_NAMES.PROJECT}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Product Name */}
        <Input
          type="text"
          label="Product Name"
          placeholder="Enter product name"
          value={formData.productName}
          onChange={(e) =>
            handleInputChange("productName", e.target.value)
          }
        />

        {/* Product Grade */}
        <label className="block text-sm font-medium mb-2">
          Product Grade
        </label>
        <Dropdown
          options={gradeOptions}
          value={formData.productGrade}
          placeholder="Select Grade"
          width="100%"
          height="40px"
          onChange={(val) =>
            handleInputChange("productGrade", val)
          }
        />

        {/* Product Cost */}
        <Input
          type="number"
          label="Product Cost"
          placeholder="Enter cost"
          value={formData.productCost}
          onChange={(e) =>
            handleInputChange("productCost", e.target.value)
          }
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectProductModal;