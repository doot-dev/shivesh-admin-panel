import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Input from "../components/ui/Input";
import { Icon, ICON_NAMES } from "../components/icons";
import EditGradeModal from "../components/modals/product/productRMC/editGradeModal";
import AddGradeModal from "../components/modals/product/productRMC/addGradeModal";
import productService from "../services/productService";
import DeleteGradeModal from "../components/modals/product/productRMC/deleteGradeModal";

const ProductSubcategory = () => {
  const { id } = useParams(); // Changed from productName to id
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  console.log("Product ID from URL:", id);
  const [product, setProduct] = useState(null); // Store product data
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  useEffect(() => {
    if (id) {
      // Set productId in search params
      setSearchParams({ productId: id });
      loadProductData();
    }
  }, [id, setSearchParams]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredSubcategories(subcategories);
      return;
    }

    // Filter subcategories based on search term
    const filtered = subcategories.filter(
      (item) =>
        (item.gradeSize?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (item.subCategory?.toLowerCase() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (item.status?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
    setFilteredSubcategories(filtered);
  }, [searchTerm, subcategories]);

  // Load product data by ID
  const loadProductData = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductById(id);
      console.log("Fetched Product Data:", response);

      let productData = response;
      if (response && response.data) {
        productData = response.data;
      }

      // Set the product info (name, id, etc.)
      setProduct(productData);

      // Map the size array to subcategories/grades for the table
      const productRmcData = productData.size.map((item, index) => ({
        id: item.id,
        sNo: String(index + 1).padStart(2, "0"),
        productId: productData.id,
        gradeSize: item.name || "N/A", // This should map to gradeSize column
        product: productData.name, // Use the parent product name
        subCategory: item.subcategory || "N/A",
        status: item.isActive ? "Active" : "Inactive",
        isActive: item.isActive, // Keep boolean for operations
        name: item.name, // Keep original name for operations
      }));

      console.log("Mapped Subcategories Data:", productRmcData);
      setSubcategories(productRmcData);
      setFilteredSubcategories(productRmcData);
    } catch (error) {
      console.error("Error loading product data:", error);
      toast.error("Failed to load product data");
      navigate("/products"); // Redirect back if product not found
    } finally {
      setLoading(false);
    }
  };

  // State for selected grade data
  const [selectedGrade, setSelectedGrade] = useState(null);

  const handleEdit = (subcategory) => {
    console.log("Editing grade/size:", subcategory);

    // Use the available data from the table row
    const gradeData = {
      id: subcategory.id,
      name: subcategory.gradeSize,
      subcategory: subcategory.subCategory,
      isActive: subcategory.isActive,
      productId: searchParams.get("productId"),
    };

    console.log("Grade data for edit:", gradeData);
    setSelectedGrade(gradeData);
    setShowEditModal(true);
  };

  const handleDeleteGrade = (subcategory) => {
    // Just open the modal for confirmation, don't delete yet
    console.log("Opening delete confirmation for grade/size:", subcategory.id);
    setSelectedGrade(subcategory);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (subcategory) => {
    try {
      setLoading(true);
      console.log("Confirming delete for grade/size:", subcategory.id);
      
      const deleteResponse = await productService.deleteGradeSize(subcategory.id);
      console.log("Delete Grade Size Response:", deleteResponse);
      
      // Close modal and refresh data
      setShowDeleteModal(false);
      setSelectedGrade(null);
      toast.success("Grade/Size deleted successfully");
      await loadProductData();
    } catch (error) {
      console.error("Error in handleConfirmDelete:", error);
      toast.error("Failed to delete grade");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setShowAddModal(true);
  };

  const handleAddGradeSubmit = async (gradeData) => {
    try {
      setIsAddingProduct(true);
      console.log("Adding grade data:", gradeData);

      // Call the createGradeSize API
      const response = await productService.createGradeSize(gradeData);
      console.log("Create Grade Size Response:", response);

      // Refresh the product data after successful creation
      await loadProductData();

      setShowAddModal(false);
      toast.success("Grade added successfully");
    } catch (error) {
      console.error("Error adding grade:", error);
      toast.error("Failed to add grade");
    } finally {
      setIsAddingProduct(false);
    }
  };

  const handleEditGradeSubmit = async (gradeData) => {
    try {
      setLoading(true);
      console.log("Updating grade data:", gradeData);

      // Call the updateGradeSize API
      const response = await productService.updateGradeSize(gradeData);
      console.log("Update Grade Size Response:", response);

      // Refresh the product data after successful update
      await loadProductData();

      setShowEditModal(false);
      setSelectedGrade(null);
      toast.success("Grade updated successfully");
    } catch (error) {
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate("/products");
  };

  const columns = [
    {
      key: "sNo",
      header: "S.No",
      className: "text-text-primary font-medium",
    },
    {
      key: "gradeSize",
      header: "Grade/Size",
      className: "text-text-primary font-medium",
      mobileLabel: true,
      mobileSubtext: "subCategory",
    },
    {
      key: "product",
      header: "Product",
      hideOnMobile: true,
    },
    {
      key: "subCategory",
      header: "Sub-category",
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
        Active: {
          color: "#16A34A",
          backgroundColor: "#D1FAE5",
        },
        Inactive: {
          color: "#DC2626",
          backgroundColor: "#FFD5C9",
        },
      },
    },
  ];

  const actions = [
    {
      text: "Edit",
      onClick: handleEdit,
      textColor: "var(--color-success)",
      hoverBackgroundColor: "var(--color-success-light)",
      title: "Edit",
    },
    {
      text: "Delete",
      onClick: handleDeleteGrade,
      textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
      title: "Delete",
    },
  ];

  const getProductDisplayName = (name) => {
    const displayNames = {
      RMC: product?.name || "",
      XYZ: "XYZ Product",
    };
    return displayNames[name] || name;
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
        <button
          onClick={handleGoBack}
          className="hover:text-blue-600 transition-colors"
        >
          Product
        </button>
        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} />
        <span className="text-gray-900 font-medium">
          Product: {product?.name || "Loading..."}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {product ? getProductDisplayName(product.name) : "Loading Product..."}
        </h1>
        <p className="text-gray-600">
          An overview of the selected product, its grade and subcategories
          {/* {product && (
            <span className="block text-sm text-gray-500 mt-1">
              Product ID: {id}
            </span>
          )} */}
        </p>
      </div>

      {/* Search and Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative flex-1 md:max-w-[35%] md:h-[50px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
          </div>
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2  border border-border rounded-lg md:h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <Button
          onClick={handleAdd}
          leftIcon={ICON_NAMES.PLUS}
          variant="primary"
          size="lg"
          height="50px"
        >
          Add
        </Button>
      </div>

      {/* Subcategories Table */}
      <Table
        data={filteredSubcategories}
        columns={columns}
        actions={actions}
        showPagination={true}
        itemsPerPage={10}
        emptyMessage={
          searchTerm
            ? "No Grade/Size found matching your search criteria"
            : "No Grade/Size available"
        }
        className="shadow-sm"
      />

      {/* Edit Grade Modal */}
      <EditGradeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedGrade(null);
        }}
        onSubmit={handleEditGradeSubmit}
        loading={loading}
        gradeData={selectedGrade}
        productId={searchParams.get("productId")}
      />
      <AddGradeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddGradeSubmit}
        loading={isAddingProduct}
        productId={searchParams.get("productId")}
        productName={product?.name}
      />
      <DeleteGradeModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedGrade(null);
        }}
        product={selectedGrade}
        onDelete={handleConfirmDelete}
        loading={loading}
      />
      {/* Results Info */}
    </div>
  );
};

export default ProductSubcategory;
