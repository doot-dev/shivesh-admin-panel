import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import Input from "../components/ui/Input";
import { Icon, ICON_NAMES } from "../components/icons";
import EditGradeModal from "../components/modals/product/productRMC/editGradeModal";
import AddGradeModal from "../components/modals/product/productRMC/addGradeModal";

const ProductSubcategory = () => {
  const { productName } = useParams();
  const navigate = useNavigate();

  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  // Mock data for RMC subcategories - replace with actual API call
  const mockSubcategories = {
    RMC: [
      {
        id: 1,
        sNo: "01",
        gradeSize: "M10",
        product: "RMC",
        subCategory: "Pure OPC",
        status: "Active",
      },
      {
        id: 2,
        sNo: "02",
        gradeSize: "M30",
        product: "RMC",
        subCategory: "Standard fly ash mix",
        status: "Active",
      },
      {
        id: 3,
        sNo: "03",
        gradeSize: "M20",
        product: "RMC",
        subCategory: "Standard GGBS mix",
        status: "Inactive",
      },
    ],
    XYZ: [
      {
        id: 4,
        sNo: "01",
        gradeSize: "A10",
        product: "XYZ",
        subCategory: "XYZ Category 1",
        status: "Active",
      },
    ],
  };

  useEffect(() => {
    loadSubcategories();
  }, [productName]);

  useEffect(() => {
    // Filter subcategories based on search term
    const filtered = subcategories.filter(
      (item) =>
        item.gradeSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredSubcategories(filtered);
  }, [searchTerm, subcategories]);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      // For now, using mock data. Replace with actual API call:
      // const response = await productService.getProductSubcategories(productName);
      const data = mockSubcategories[productName] || [];
      setSubcategories(data);
      setFilteredSubcategories(data);
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast.error("Failed to load subcategories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subcategory) => {
    // toast.info(`Edit subcategory: ${subcategory.subCategory}`);
    setShowEditModal(true);
    // Implement edit functionality
  };

  const handleDelete = (subcategory) => {
    toast.info(`Delete subcategory: ${subcategory.subCategory}`);
    // Implement delete functionality
  };

  const handleAdd = () => {
    // toast.info("Add new subcategory");
    // Implement add functionality
    setShowAddModal(true);
  };

  const handleGoBack = () => {
    navigate("/products");
  };

  // Table configuration
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
      onClick: handleDelete,
      textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
      title: "Delete",
    },
  ];

  const getProductDisplayName = (name) => {
    const displayNames = {
      RMC: "RMC (Ready Mix Concrete)",
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
          Product: {productName}
        </span>
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          {getProductDisplayName(productName)}
        </h1>
        <p className="text-gray-600">
          An overview of the selected product, its grade and subcategories
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
        emptyMessage="No subcategories found matching your criteria"
        className="shadow-sm"
      />

      {/* Edit Grade Modal */}
      <EditGradeModal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
       
      />
      <AddGradeModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />

      {/* Results Info */}
    </div>
  );
};

export default ProductSubcategory;
