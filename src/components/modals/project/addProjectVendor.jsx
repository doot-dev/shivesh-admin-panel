import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { fetchProductsById } from "../../../features/product/productSlice";

import { ICON_NAMES } from "../../icons";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";

const initialState = {

  productId: "",
  gradeId: "",
  costPrice: "",
};

const AddProjectVendor = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  productData = [],
}) => {
  const dispatch = useDispatch();

  const { currentProduct } = useSelector((state) => state.products);

  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  /* ---------------- Handlers ---------------- */

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleProductChange = (productId) => {
    setFormData((prev) => ({
      ...prev,
      productId,
      gradeId: "",
      costPrice: "",
    }));

    if (productId) {
      dispatch(fetchProductsById(productId));
    }
  };

  const handleGradeChange = (gradeId) => {
    const selectedGrade = currentProduct?.size?.find(
      (g) => g.id === gradeId
    );

    setFormData((prev) => ({
      ...prev,
      gradeId,
      costPrice: selectedGrade?.cost || "",
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.productId)
      newErrors.productId = "Product is required";

    if (!formData.gradeId)
      newErrors.gradeId = "Grade is required";

    if (!formData.costPrice)
      newErrors.costPrice = "Cost price is required";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    const selectedProduct = productData.find(
      (p) => p.id === formData.productId
    );

    const selectedGrade = currentProduct?.size?.find(
      (g) => g.id === formData.gradeId
    );

    const payload = {
      projectId: projectId,
      productName: selectedProduct?.name || "",
      productGrade: selectedGrade?.name || "",
      costPrice: Number(formData.costPrice),
    };

    onSubmit(payload);

    handleClose();
  };

  const handleClose = () => {
    setFormData(initialState);
    setErrors({});
    setSubmitting(false);
    onClose();
  };

  /* ---------------- Reset on Close ---------------- */

  useEffect(() => {
    if (!isOpen) {
      setFormData(initialState);
      setErrors({});
      setSubmitting(false);
    }
  }, [isOpen]);

  /* ---------------- Render ---------------- */

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
        {/* Product */}
        <Dropdown
          label="Vendor Name"
          options={productData.map((p) => ({
            value: p.id,
            label: p.name,
          }))}
          value={formData.productId}
          placeholder="Search & Select Product"
          searchable
          width="100%"
          height="40px"
          onChange={handleProductChange}
          error={errors.productId}
        />

        {/* Grade */}
        <Dropdown
          label="Vendor Priority"
          options={
            currentProduct?.size?.map((g) => ({
              value: g.id,
              label: g.name,
            })) || []
          }
          value={formData.gradeId}
          placeholder="Select Grade"
          searchable
          width="100%"
          height="40px"
          onChange={handleGradeChange}
          disabled={!formData.productId}
          error={errors.gradeId}
        />

        {/* Cost */}
        <Input
          type="number"
          label="Vendor Custom Price"
          placeholder="Enter cost"
          value={formData.costPrice}
          onChange={(e) =>
            handleChange("costPrice", e.target.value)
          }
          error={errors.costPrice}
        />

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={submitting}
          >
            {submitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddProjectVendor;

