import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Input from "../components/ui/Input";
import FullPageLoader from "../components/ui/FullPageLoader";
import { Icon, ICON_NAMES } from "../components/icons";
import AddProductModal from "../components/modals/product/AddProductModal";
import DeleteProductModal from "../components/modals/product/DeleteProductModal";
import productService from "../services/productService";
import EditProductModal from "../components/modals/product/EditProductModal";
import { useFetch } from "../hooks/useFetch";

const Products = () => {
  const navigate = useNavigate();
  
  // Transform product data from API response
  const transformProductData = useCallback(async () => {
    const response = await productService.getAllProducts(
      1,
      100,
      ""
    );
    console.log("Fetched Products:", response);

    let rawData = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && Array.isArray(response.products)) {
      rawData = response.products;
    } else {
      console.warn("Unexpected response structure:", response);
      rawData = [];
    }

    return rawData.map((item, index) => ({
      id: item.id,
      sNo: String(index + 1).padStart(2, "0"),
      product: item.name,
      gradeSize: item.sizeCount,
      status: item.isActive ? "Active" : "Inactive",
      isActive: item.isActive,
      name: item.name,
    }));
  }, []);

  const { data: products, loading, refetch: loadProducts } = useFetch(
    transformProductData,
    [],
    { autoFetch: true, showToast: true }
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [page, setPage] = useState({
    current: 1,
    total: 1,
  });
  const [length, setLength] = useState({
    totalLength: 1,
    limit: 10,
  });
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  // Loading states for different operations
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isEditingProduct, setIsEditingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleSearch = () => {
    if (searchTerm.trim() === "") {
      toast.info("Please enter a search term");
      return;
    }
    loadProducts();
  };
  // useEffect(() => {
  //   if (searchTerm.trim() === "") {
  //     loadProducts();
  //   }
  // }, [searchTerm]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products || []);
      return;
    }

    const filtered = (products || []).filter(
      (product) =>
        (product?.product?.toLowerCase?.() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (product?.gradeSize?.toString?.() || "").includes(
          searchTerm.toLowerCase()
        ) ||
        (product?.status?.toLowerCase?.() || "").includes(
          searchTerm.toLowerCase()
        )
    );
    console.log("Filtered Products:", filtered);

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Handle add product
  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (productData) => {
    try {
      setIsAddingProduct(true);
      const response = await productService.createProduct(productData);
      console.log("Add Product Response:", response);

      // Refresh product list
      await loadProducts();

      // Close modal and show success message
      setShowAddModal(false);
      toast.success(response.message || "Product added successfully");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Handle edit product - open modal and fetch product data
  const handleEdit = async (product) => {
    try {
      console.log("Opening edit modal for product:", product);
      setShowEditModal(true);

      // Fetch complete product data by ID
      const response = await productService.getProductById(product.id);
      console.log("Fetched Product Data for Edit:", response);

      // Handle different response structures
      let productData = response;
      if (response && response.data) {
        productData = response.data;
      }

      setSelectedProduct(productData);
    } catch (error) {
      console.error("Error fetching product for edit:", error);
      toast.error("Failed to load product data");
      setShowEditModal(false);
    }
  };

  // Handle edit form submission
  const handleEditSubmit = async (productId, formData) => {
    try {
      setIsEditingProduct(true);
      console.log("Updating product:", { productId, formData });

      const response = await productService.updateProduct(productId, formData);
      console.log("Update Product Response:", response);

      // Refresh products list
      await loadProducts();

      setShowEditModal(false);
      setSelectedProduct(null);
      toast.success(response.message || "Product updated successfully");
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error?.response?.data?.message || "Failed to update product");
    } finally {
      setIsEditingProduct(false);
    }
  };

  // Handle delete product
  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (product) => {
    try {
      setIsDeletingProduct(true);
      console.log("Deleting product:", product);

      // Use the product ID directly
      const productId = product.id;
      const deleteResponse = await productService.deleteProduct(productId);
      console.log("Delete Product Response:", deleteResponse);

      // Reload the products table to get fresh data from the API
      await loadProducts();

      setShowDeleteModal(false);
      setSelectedProduct(null);
      toast.success(deleteResponse.message || "Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(error?.response?.data?.message || "Failed to delete product");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Handle view product
  const handleView = (product) => {
    console.log("Viewing product:", product);
    navigate(`/products/${product.id}`);
  };

  // Table configuration
  const columns = [
    {
      key: "sNo",
      header: "S.No",
      className: "text-text-primary font-medium",
    },
    {
      key: "product",
      header: "Product",
      className: "text-text-primary font-medium",
      mobileLabel: true,
      mobileSubtext: "gradeSize",
    },
    {
      key: "gradeSize",
      header: "Grade/Size",
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
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
      text: "View",
      onClick: handleView,
      textColor: "var(--color-primary)",
      hoverBackgroundColor: "var(--color-primary-light)",
    },
    {
      text: "Edit",
      onClick: handleEdit,
      textColor: "var(--color-success)",
      hoverBackgroundColor: "var(--color-success-light)",
      title: "Edit",
    },
    {
      text: "Delete",
      onClick: handleDelete,
      textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
      title: "Delete",
    },
  ];

  // Determine loading message based on current operation
  const getLoadingMessage = () => {
    if (loading) return "Loading products...";
    if (isAddingProduct) return "Adding product...";
    if (isEditingProduct) return "Updating product...";
    if (isDeletingProduct) return "Deleting product...";
    return "Processing...";
  };

  return (
    <>
      {/* Full Page Loader */}
      <FullPageLoader
        isVisible={
          loading || isAddingProduct || isEditingProduct || isDeletingProduct
        }
        message={getLoadingMessage()}
        spinnerSize="w-20 h-20"
        spinnerVariant="default"
      />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Products
          </h1>
          <p className="text-gray-600">View and manage products</p>
        </div>

        {/* Search and Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex flex-1 max-w-[35%] md:max-w-[30%] md:h-[50px] border border-border rounded-lg">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search by name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2   md:h-[50px] focus:outline-none"
            />
            {/* <button onClick={handleSearch} className="mr-3">
              Search
            </button> */}
          </div>

          <Button
            onClick={handleAddProduct}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
            size="md"
            height="40px"
            className="md:!h-[50px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
          >
            <span className="hidden sm:inline">Add Product</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>

        {/* Products Table */}
        <Table
          data={filteredProducts}
          columns={columns}
          actions={actions}
          showPagination={true}
          itemsPerPage={10}
          // onPageChange={(value) => {
          //   setPage((prev) => ({
          //     current: value || 1,
          //     total: prev.total,
          //   }));
          //   console.log("Page changed to:", value);
          // }}
          // onItemPerPageChange={(value) => {
          //   setLength((prev) => ({
          //     ...prev,
          //     limit: value || 10,
          //   }));
          //   console.log("Items per page changed to:", value);
          // }}
          // mainTotalItems={length.totalLength}
          // mainTotalPages={page.total}
          emptyMessage="No products found matching your criteria"
          className="shadow-sm"
        />

        {/* Modals */}
        <AddProductModal
          isOpen={showAddModal}
          onClose={() => {
            setShowAddModal(false);
          }}
          onSubmit={handleAddSubmit}
          loading={isAddingProduct}
        />

        <DeleteProductModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onDelete={handleConfirmDelete}
          loading={isDeletingProduct}
        />

        <EditProductModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          product={selectedProduct}
          onSubmit={handleEditSubmit}
          loading={isEditingProduct}
        />
      </div>
    </>
  );
};

export default Products;
