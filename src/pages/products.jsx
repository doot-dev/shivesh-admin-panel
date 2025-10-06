import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Input from "../components/ui/Input";
import { Icon, ICON_NAMES } from "../components/icons";
import AddProductModal from "../components/modals/product/AddProductModal";
import DeleteProductModal from "../components/modals/product/DeleteProductModal";
import productService from "../services/productService";
import EditProductModal from "../components/modals/product/EditProductModal";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
const [showEditModal, setShowEditModal] = useState(false);
  // Loading states for different operations
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Mock data - replace with actual API call
  const mockProducts = [
    {
      id: 1,
      sNo: "01",
      product: "RMC",
      gradeSize: "30",
      status: "Active",
    },
    {
      id: 2,
      sNo: "02",
      product: "RMC",
      gradeSize: "50",
      status: "Active",
    },
    {
      id: 3,
      sNo: "03",
      product: "XYZ",
      gradeSize: "30",
      status: "Inactive",
    },
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Filter products based on search term
    const filtered = products.filter(
      (product) =>
        product.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.gradeSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  // Load products from API
  const loadProducts = async () => {
    try {
      setLoading(true);
      const productData = await productService.getAllProducts();
      console.log("Fetched Products:", productData);
      setProducts(mockProducts);
      setFilteredProducts(mockProducts);
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Handle add product
  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleAddSubmit = async (productData) => {
    try {
      setIsAddingProduct(true);
      // For now, simulate API call. Replace with actual API call:
      // const response = await productService.createProduct(productData);

      // Mock implementation
      const newId = Math.max(...products.map((p) => p.id), 0) + 1;
      const newProduct = {
        id: newId,
        sNo: String(newId).padStart(2, "0"),
        ...productData,
      };

      setProducts((prev) => [...prev, newProduct]);
      setShowAddModal(false);
      toast.success("Product added successfully");
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Failed to add product");
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Handle edit product - navigate to subcategory page
  const handleEdit = (product) => {
    setShowEditModal(true);
    // navigate(`/products/${product.product}`);
  };

  // Handle delete product
  const handleDelete = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (productId) => {
    try {
      setIsDeletingProduct(true);
      // For now, simulate API call. Replace with actual API call:
      // await productService.deleteProduct(productId);

      // Mock implementation
      setProducts((prev) => prev.filter((product) => product.id !== productId));

      setShowDeleteModal(false);
      setSelectedProduct(null);
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    } finally {
      setIsDeletingProduct(false);
    }
  };

  // Handle view product
  const handleView = (product) => {
    navigate(`/products/${product.product}`);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Products</h1>
        <p className="text-gray-600">View and manage products</p>
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
          onClick={handleAddProduct}
          leftIcon={ICON_NAMES.PLUS}
          variant="primary"
          size="lg"
          height="50px"
        >
          Add Product
        </Button>
      </div>

      {/* Products Table */}
      <Table
        data={filteredProducts}
        columns={columns}
        actions={actions}
        showPagination={true}
        itemsPerPage={10}
        emptyMessage="No products found matching your criteria"
        className="shadow-sm"
      />

      {/* Modals */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
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
        onClose={() => setShowEditModal(false)}
        // product={selectedProduct}
        // onSubmit={handleEditSubmit}
        // loading={isEditingProduct}
      />
    </div>
  );
};

export default Products;
