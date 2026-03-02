import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchProjectProductById,
  updateProjectProduct,
  clearCurrentProduct,
} from "../../../features/projects/projectProductSlice";

import { fetchProductsById } from "../../../features/product/productSlice";

import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import Dropdown from "../../ui/Dropdown";
import { ICON_NAMES } from "../../icons";

const initialFormState = {
  productId: "",
  gradeId: "",
  costPrice: "",
};

const EditProjectProductModal = ({
  isOpen,
  onClose,
  projectId,
  productId,
  productData = [],
}) => {
  const dispatch = useDispatch();

  const { currentProduct, updateLoading } = useSelector(
    (state) => state.projectProduct
  );

  const { currentProduct: selectedProductDetails } = useSelector(
    (state) => state.products
  );

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  /* ---------------- FETCH PROJECT PRODUCT ---------------- */

  useEffect(() => {
    if (!isOpen || !productId) return;
    dispatch(fetchProjectProductById({ projectId, productId }));
  }, [isOpen, productId, projectId, dispatch]);

  /* ---------------- PREFILL FORM (Single Source of Truth) ---------------- */

  useEffect(() => {
    if (!currentProduct || !isOpen) return;

    // Match product once
    const matchedProduct = productData.find(
      (p) =>
        p.name?.toLowerCase() ===
        currentProduct.productName?.toLowerCase()
    );

    if (!matchedProduct) return;

    // Fetch product details for grades
    dispatch(fetchProductsById(matchedProduct.id));

    setFormData({
      productId: matchedProduct.id,
      gradeId: "", // will be set after grades load
      costPrice: currentProduct.costPrice || "",
    });
  }, [currentProduct, isOpen, productData, dispatch]);

  /* ---------------- AUTO-SET GRADE ---------------- */

  useEffect(() => {
    if (!selectedProductDetails || !currentProduct) return;

    const matchedGrade = selectedProductDetails.size?.find(
      (g) =>
        g.name?.toLowerCase() ===
        currentProduct.productGrade?.toLowerCase()
    );

    if (!matchedGrade) return;

    setFormData((prev) => ({
      ...prev,
      gradeId: matchedGrade.id,
    }));
  }, [selectedProductDetails, currentProduct]);

  /* ---------------- HANDLERS ---------------- */

  const handleProductChange = (id) => {
    setFormData({
      productId: id,
      gradeId: "",
      costPrice: "",
    });

    dispatch(fetchProductsById(id));
  };

  const handleGradeChange = (gradeId) => {
    const selectedGrade =
      selectedProductDetails?.size?.find(
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

    if (!formData.productId) newErrors.productId = "Required";
    if (!formData.gradeId) newErrors.gradeId = "Required";
    if (!formData.costPrice) newErrors.costPrice = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedProduct = productData.find(
      (p) => p.id === formData.productId
    );

    const selectedGrade =
      selectedProductDetails?.size?.find(
        (g) => g.id === formData.gradeId
      );

    const payload = {
      projectId,
      productId, // project-product id
      productName: selectedProduct?.name,
      productGrade: selectedGrade?.name,
      costPrice: Number(formData.costPrice),
    };

    await dispatch(updateProjectProduct(payload));
    handleClose();
  };

  const handleClose = () => {
    setFormData(initialFormState);
    setErrors({});
    dispatch(clearCurrentProduct());
    onClose();
  };

  /* ---------------- MEMOIZED OPTIONS ---------------- */

  const productOptions = useMemo(
    () =>
      productData.map((p) => ({
        value: p.id,
        label: p.name,
      })),
    [productData]
  );

  const gradeOptions = useMemo(
    () =>
      selectedProductDetails?.size?.map((g) => ({
        value: g.id,
        label: g.name,
      })) || [],
    [selectedProductDetails]
  );

  /* ---------------- UI ---------------- */

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit Product"
      size="md"
      maxWidth="450px"
      headerIcon={ICON_NAMES.PROJECT}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Dropdown
          label="Product"
          options={productOptions}
          value={formData.productId}
          onChange={handleProductChange}
          searchable
          error={errors.productId}
        />

        <Dropdown
          label="Product Grade"
          options={gradeOptions}
          value={formData.gradeId}
          onChange={handleGradeChange}
          searchable
          disabled={!formData.productId}
          error={errors.gradeId}
        />

        <Input
          type="number"
          label="Product Cost"
          value={formData.costPrice}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              costPrice: e.target.value,
            }))
          }
          error={errors.costPrice}
        />

        <div className="flex gap-3 pt-4">
          <Button type="button" onClick={handleClose}>
            Cancel
          </Button>

          <Button type="submit" disabled={updateLoading}>
            {updateLoading ? "Updating..." : "Update"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProjectProductModal;