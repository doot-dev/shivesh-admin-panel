import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { Icon, ICON_NAMES } from "../components/icons";
import EditGradeModal from "../components/modals/product/productRMC/editGradeModal";
import AddGradeModal from "../components/modals/product/productRMC/addGradeModal";
import DeleteGradeModal from "../components/modals/product/productRMC/deleteGradeModal";
import productService from "../services/productService";
import { useDispatch, useSelector } from "react-redux";
import { createGradeSize, deleteGradeSize, fetchProductsById, updateGradeSize } from "../features/product/productSlice";

const ProductSubcategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: productData = null, loading } = useSelector(
    (state) => state.products
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [product, setProduct] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "" });

  // ✅ All modal & grade states here
  const [selectedGrade, setSelectedGrade] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  const refreshGradeSize = useCallback(() => {
    dispatch(fetchProductsById(id));
  }, [dispatch, id]);
  // const productInfo = dispatch(fetchProductsById(id));
  console.log("Redresh grade size", refreshGradeSize)

  const loadProductData = useCallback(() => {
    if (!productData?.size) return;

    const productRmcData = productData.size
      .filter((item) => {
        const s = filters.search.toLowerCase();
        const matchesSearch =
          !s ||
          item.name?.toLowerCase().includes(s) ||
          (item.isActive ? "active" : "inactive").includes(s);
        const matchesStatus =
          !filters.status ||
          (filters.status === "Active" && item.isActive) ||
          (filters.status === "Inactive" && !item.isActive);
        return matchesSearch && matchesStatus;
      })
      .map((item, i) => ({
        id: item.id,
        sNo: String(i + 1).padStart(2, "0"),
        productId: productData.id,
        gradeSize: item.name || "N/A",
        product: productData.name,
        subCategory: item.subcategory || "N/A",
        status: item.isActive ? "Active" : "Inactive",
        isActive: item.isActive,
        name: item.name,
      }));

    console.log("Product RMC Data", productRmcData);
    setSubcategories(productRmcData);
    setFilteredSubcategories(productRmcData);
  }, [productData, filters]);

  useEffect(() => {
    if (id) {
      setSearchParams({ productId: id });
      refreshGradeSize();
    }
  }, [id, refreshGradeSize]);

  useEffect(() => {
    console.log("Redux productData:", productData);
    loadProductData();
  }, [loadProductData]);

  const handleEdit = (subcategory) => {
    setSelectedGrade({
      id: subcategory.id,
      name: subcategory.gradeSize,
      subcategory: subcategory.subCategory,
      isActive: subcategory.isActive,
      productId: id,
    });
    setShowEditModal(true);
  };

  const handleDeleteGrade = (subcategory) => {
    setSelectedGrade(subcategory);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (subcategory) => {
    try {
      console.log("subcategory", subcategory);
       await dispatch(deleteGradeSize(subcategory.id)).unwrap();
      await refreshGradeSize();
      setShowDeleteModal(false);
    } catch (err) {
      toast.error("Failed to delete grade");
    }
  };

  const handleAdd = () => setShowAddModal(true);

  const handleAddGradeSubmit = async (gradeData) => {
    try {
   
      console.log("Grade Data", gradeData)
      await dispatch(createGradeSize(gradeData)).unwrap();
      // toast.success(res.message || "Grade added successfully");
      await refreshGradeSize();
      setShowAddModal(false);
    } catch (error) {
      toast.error("Failed to add grade");
    }
  };

  const handleEditGradeSubmit = async (gradeData) => {
    try {

      console.log("gradeData", gradeData)
      await dispatch(updateGradeSize(gradeData)).unwrap();
      await refreshGradeSize();
      setShowEditModal(false);
    } catch (err) {
      toast.error("Failed to update grade");
    }
  };

  const columns = [
    { key: "sNo", header: "S.No" },
    { key: "gradeSize", header: "Grade/Size" },
    { key: "product", header: "Product" },
    { key: "subCategory", header: "Sub-category" },
    {
      key: "status", header: "Status", type: "badge", badgeConfig: {
        Active: {
          color: "#16A34A", // Green text for active
          backgroundColor: "#D1FAE5", // Light green background for active
        },
        Inactive: {
          color: "#DC2626", // Red text for inactive
          backgroundColor: "#FFD5C9", // Light red background for inactive
        },
      },
    },
  ];

  const actions = [
    {
      text: "Edit", onClick: handleEdit, textColor: "var(--color-success)",
      hoverBackgroundColor: "var(--color-success-light)",
      title: "Edit",
    },
    {
      text: "Delete", onClick: handleDeleteGrade, textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
      title: "Delete",
    },
  ];

  const handleGoBack = () => navigate("/products");

  return (
    <div className="p-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button onClick={handleGoBack} className="hover:text-blue-600">
          Product
        </button>
        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} />
        <span className="text-gray-900 font-medium">
          Product: {productData?.name || "Loading..."}
        </span>
      </nav>

      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          placeholder="Search by name"
          value={filters.search}
          onChange={(e) =>
            setFilters((f) => ({ ...f, search: e.target.value }))
          }
          className="w-full max-w-[65%] md:max-w-[35%] border rounded-lg px-3 py-2"
        />
        <Button onClick={handleAdd}>Add Grade</Button>
      </div>

      <Table
        data={filteredSubcategories}
        columns={columns}
        actions={actions}
        showPagination
        itemsPerPage={10}
      />

      {/* Modals */}
      <EditGradeModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditGradeSubmit}
        gradeData={selectedGrade}
        loading={loading}
      />
      <AddGradeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddGradeSubmit}
        loading={isAddingProduct}
        productId={id}
      />
      <DeleteGradeModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleConfirmDelete}
        product={selectedGrade}
        loading={loading}
      />
    </div>
  );
};

export default ProductSubcategory;
