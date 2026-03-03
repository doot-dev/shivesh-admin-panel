import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { addProjectDetails, fetchProjectById, updateProject, updateProjectCredit, updateProjectCommission } from "../features/projects/projectSlice";
import { fetchClients } from "../features/clients/clientsSlice";
import { fetchProducts } from "../features/product/productSlice";

import Button from "../components/ui/Button";
import FullPageLoader from "../components/ui/FullPageLoader";
import EditProjectModal from "../components/modals/project/editProjectModal";
import AddProjectProductModal from "../components/modals/project/addProjectProductModal";
import { ICON_NAMES } from "../components/icons";
import { createProjectProduct, deleteProjectProduct, fetchProjectProductById, fetchProjectProducts } from "../features/projects/projectProductSlice";
import { Table } from "../components/ui";
import EditProjectProductModal from "../components/modals/project/editProjectProductModal";
import ProjectVendorModal from "../components/modals/project/projectVendorModal";
import EditCommissionModal from "../components/modals/project/editCommissionModal";
import EditCreditModal from "../components/modals/project/editCreditModal";
import DeleteProjectProduct from "../components/modals/project/deleteProjectProduct";
import { BiEdit } from "react-icons/bi";
import { FaEdit } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";
import { toast } from "react-toastify";

export default function ProjectsDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ---------------- Redux ---------------- */

  const { currentProject, loading, error } = useSelector(
    (state) => state.project
  );

  const { list: clients = [], loads } = useSelector(
    (state) => state.client
  );

  const { productList: productData = [], loading: productLoading } = useSelector(
    (state) => state.products
  );

  const { prodList: currentProduct = [], loading: prodLoading, deleteLoading } = useSelector(
    (state) => state.projectProduct
  )

  /* ---------------- Local State ---------------- */

  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [showDeleteProductModal, setShowDeleteProductModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedDeleteProduct, setSelectedDeleteProduct] = useState(null);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showCommissionModal, setShowCommissionModal] = useState(false);
  const [showCreditModal, setShowCreditModal] = useState(false);

  const openVendors = (product) => {
    setSelectedProduct(product);
    setShowVendorModal(true);
  };
  const [filters, setFilters] = useState({
    search: "",
  });
  /* ---------------- Fetching ---------------- */

  useEffect(() => {
    if (!id) return;
    dispatch(fetchProjectById(id));
    dispatch(fetchClients());
    dispatch(fetchProducts());
    dispatch(fetchProjectProducts(id))
  }, [dispatch, id]);

  /* ---------------- Derived Values ---------------- */


  const client = useMemo(() => {
    if (!currentProject) return null;

    return clients.find(
      (c) => c.clientId === currentProject.client?.clientId
    );
  }, [clients, currentProject]);

  const statusConfig = {
    active: {
      color: "#16A34A",
      backgroundColor: "#D1FAE5",
    },
    inactive: {
      color: "#DC2626",
      backgroundColor: "#FECACA",
    },
  };

  const status =
    currentProject?.status?.toLowerCase() || "inactive";

  const statusStyle =
    statusConfig[status] || statusConfig.inactive;

  const filteredProjectsProd = currentProduct.filter((prod) => {
    const s = filters.search.toLowerCase();
    return (
      !s || prod.productName?.toLowerCase().includes(s) || prod.productGrade?.toLowerCase().includes(s)
    );
  }).map((u, i) => ({
    ...u,
    sNo: (i + 1).toString().padStart(2, "0"),
    productName: u.productName,
    productGrade: u.productGrade,
    costPrice: u.costPrice
  }))

  const columns = [
    { key: "sNo", header: "S.No" },
    { key: "productName", header: "Product Name" },
    { key: "productGrade", header: "Product Grade" },
    { key: "costPrice", header: "Cost Price" },

  ];
  const handleEdit = (product) => {
    setSelectedProductId(product.id);
    setShowEditProductModal(true);
  };
  const handleDelete = (product) => {
    console.log("Delete product", product);
    setSelectedProductId(product.id);
    setSelectedDeleteProduct(product);
    setShowDeleteProductModal(true);
  };

  const actions = [
    {
      text: "Vendors",
      onClick: openVendors,
      textColor: "var(--color-success)"
    },
    {
      text: "Edit",
      onClick: handleEdit,
      textColor: "var(--color-primary)",
    },
    {
      text: "Delete",
      onClick: handleDelete,
      textColor: "var(--color-error)",
    },
  ];

  /* ---------------- Early Returns AFTER Hooks ---------------- */

  if (loading) return <FullPageLoader />;

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        Failed to load project
      </div>
    );
  }

  if (!currentProject) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600 mb-4">
          Project not found
        </p>
        <Button onClick={() => navigate("/projects")}>
          Back to Projects
        </Button>
      </div>
    );
  }

  /* ---------------- Handlers ---------------- */

  const handleAddProduct = async (productData) => {

    const addRes = await dispatch(createProjectProduct(productData));

  }

  const handleUpdateProject = async (projectData) => {
    const resultAction = await dispatch(updateProject(projectData));

    if (updateProject.fulfilled.match(resultAction)) {
      setIsEditMode(false);
      dispatch(fetchProjectById(id));
    }
  };

  const handleUpdateCommission = async (commissionData) => {
    try {
      const res = await dispatch(
        updateProjectCommission({ projectId: id, ...commissionData })
      ).unwrap();

      setShowCommissionModal(false);

      toast.success(res.message || "Commission updated");
    } catch (err) {
      toast.error("Failed to update commission");
    }
  };
  const handleUpdateCredit = async (creditData) => {
    const resultAction = await dispatch(
      updateProjectCredit({ projectId: id, ...creditData })
    );

    if (updateProjectCredit.fulfilled.match(resultAction)) {
      setShowCreditModal(false);
      dispatch(fetchProjectById(id));

      toast.success(
        resultAction.payload?.message ||
        "Credit details updated successfully"
      );
    }
  };

  const handleDeleteProjectProduct = async (product) => {
    if (!product?.id) return;

    try {
      const res = await dispatch(
        deleteProjectProduct({ projectId: id, productId: product.id })
      ).unwrap();

      toast.success(res?.message || "Product deleted successfully");
      setShowDeleteProductModal(false);
      setSelectedDeleteProduct(null);
    } catch (err) {
      toast.error("Failed to delete product");
    }
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-1">
            Project
          </h1>
          <p className="text-gray-600">
            View and manage projects
          </p>
        </div>

        <Button
          onClick={() => setIsEditMode(true)}
          leftIcon={ICON_NAMES.EDIT}
          variant="secondary"
        >
          Edit
        </Button>
      </div>

      {/* ---------------- Project Details ---------------- */}

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Project Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <DetailItem label="Project Name" value={currentProject.projectName} />
          <DetailItem
            label="Client Name"
            value={
              client?.ownerName ||
              currentProject.client?.clientId
            }
          />
          <DetailItem label="Site Name" value={currentProject.siteName} />
          <DetailItem
            label="Project Manager"
            value={currentProject.projectManager}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem
            label="Location"
            value={currentProject.projectLocation}
          />

          <div>
            <p className="text-sm text-gray-600 mb-1">Status</p>
            <span
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
              style={{
                color: statusStyle.color,
                backgroundColor: statusStyle.backgroundColor,
              }}
            >
              • {currentProject.status || "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* ---------------- Product Section ---------------- */}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Product Details
          </h2>

          <Button
            onClick={() => setShowAddProductModal(true)}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
          >
            Add
          </Button>
        </div>

        <div className="text-center py-8 text-gray-500">
          <Table
            data={filteredProjectsProd}
            columns={columns}
            actions={actions}
            itemsPerPage={10}
            emptyMessage="No projects found"
          />
        </div>
      </div>

      {/* ---------------- Commission & Credit Details Section ---------------- */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

        {/* Commission Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Commission Details
            </h2>
            <div className="flex items-center gap-3">
              {/* Toggle Switch */}
              {/* <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  defaultChecked
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label> */}

              <button
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                onClick={() => setShowCommissionModal(true)}
              >
                <span><FiEdit2 className="text-lg" /></span>
                <span>Edit</span>
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Person name</p>
                <p className="text-base font-medium text-gray-900">
                  {currentProject.commissionPersonName
                    || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Amount per m3</p>
                <p className="text-base font-medium text-gray-900">
                  ₹{currentProject.commissionAmountPerM3
                    ?? "N/A"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Person Phone No.</p>
                <p className="text-base font-medium text-gray-900">
                  {currentProject.commissionPersonMobile
                    || "N/A"}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Credit Details Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Credit Details
            </h2>
            <button
              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              onClick={() => setShowCreditModal(true)}
            >
              <span><FiEdit2 className="text-lg" /></span>
              <span>Edit</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500 mb-1">Amount</p>
              <p className="text-base font-medium text-gray-900">
                ₹{currentProject.creditAmount || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Reset period(in days)</p>
              <p className="text-base font-medium text-gray-900">
                {currentProject.creditResetPeriodDays || "N/A"} days
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* ---------------- Modals ---------------- */}

      <EditProjectModal
        isOpen={isEditMode}
        onClose={() => setIsEditMode(false)}
        onSubmit={handleUpdateProject}
        clients={clients}
        project={currentProject}
      />

      <AddProjectProductModal
        isOpen={showAddProductModal}
        productData={productData}
        onSubmit={handleAddProduct}
        projectId={id}
        onClose={() => setShowAddProductModal(false)}
      />
      <EditProjectProductModal
        isOpen={showEditProductModal}
        onClose={() => setShowEditProductModal(false)}
        projectId={id}
        productId={selectedProductId}
        productData={productData}
      />
      <ProjectVendorModal
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        product={selectedProduct}
        projectId={id}
      />

      <EditCommissionModal
        isOpen={showCommissionModal}
        onClose={() => setShowCommissionModal(false)}
        onSubmit={handleUpdateCommission}
        project={currentProject}
        loading={loading}
      />

      <EditCreditModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        onSubmit={handleUpdateCredit}
        project={currentProject}
        loading={loading}
      />

      <DeleteProjectProduct
        isOpen={showDeleteProductModal}
        onClose={() => {
          setShowDeleteProductModal(false);
          setSelectedDeleteProduct(null);
        }}
        product={selectedDeleteProduct}
        onDelete={handleDeleteProjectProduct}
        loading={deleteLoading}
      />
    </div>
  );
}

/* -------------------- Small Reusable Component -------------------- */

function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-base font-medium text-gray-900">
        {value || "N/A"}
      </p>
    </div>
  );
}

