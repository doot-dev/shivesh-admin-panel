import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { Icon, ICON_NAMES } from "../components/icons";
import FullPageLoader from "../components/ui/FullPageLoader";
import VendorModal from "../components/modals/vendors/VendorModal";
import DeleteModal from "../components/modals/DeleteModal";
import vendorService from "../services/vendorService";
import { useFetch } from "../hooks/useFetch";

const Vendors = () => {
  const navigate = useNavigate();
  
  // Transform vendor data from API response
  const transformVendorData = useCallback(async () => {
    const response = await vendorService.getVendors();
    console.log("Vendors response:", response);

    let rawData = [];
    if (Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && Array.isArray(response.data)) {
      rawData = response.data;
    } else if (response && Array.isArray(response.products)) {
      rawData = response.products;
    } else {
      console.warn("Unexpected response structure:", response);
    }

    return rawData.map((vendor, index) => ({
      id: vendor.id,
      sNo: index + 1,
      name: vendor.companyName,
      contactPerson: vendor.ownerName,
      contactPersonDesignation: vendor.designation,
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address || "",
      gstNumber: vendor.gstNumber || "",
      panNumber: vendor.panNumber || "",
      status: vendor.isActive ? "Active" : "Inactive",
      isActive: vendor.isActive,
      originalData: vendor,
    }));
  }, []);

  const { data: vendors, loading, setData: setVendors, refetch: loadVendors } = useFetch(
    transformVendorData,
    [],
    {
      autoFetch: true,
      showToast: true,
    }
  );

  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [deleteConfig, setDeleteConfig] = useState({
    onConfirm: null,
    title: "",
    message: "",
  });

  // 🔹 Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVendors(vendors || []);
      return;
    }

    const filtered = (vendors || []).filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.phone.includes(searchTerm)
    );
    setFilteredVendors(filtered);
  }, [searchTerm, vendors]);

  // 🔹 Add Vendor
  const handleAddVendor = () => {
    setSelectedVendor(null); // Clear selected vendor for add mode
    setShowVendorModal(true);
  };

  // 🔹 Edit Vendor
  const handleEdit = (vendor) => {
    setSelectedVendor(vendor);
    setShowVendorModal(true);
    console.log("Editing vendor:", vendor);

  };

  // 🔹 Handle Vendor Submit (both add and edit)
  const handleVendorSubmit = async (vendorData, mode) => {
    try {
      setSubmitting(true);

      if (mode === "add") {
        // Prepare data for createVendor API
        const apiPayload = {
          companyName: vendorData.vendorCompanyName,
          ownerName: vendorData.ownerName,
          phone: vendorData.phone,
          email: vendorData.email,
          address: vendorData.registeredAddress,
          gstNumber: vendorData.gstNumber || "",
          panNumber: vendorData.panNumber || "",
        };

        console.log("Creating vendor with payload:", apiPayload);

        // Call createVendor API
        const response = await vendorService.createVendor(apiPayload);
        console.log("Vendor created successfully:", response);

        toast.success(response.message);

        // Refresh vendors list after successful creation
        loadVendors();
      } else if (mode === "edit") {
        // Prepare data for updateVendor API (if needed later)
        debugger;
        const apiPayload = {
          id: selectedVendor.id,
          companyName: vendorData.vendorCompanyName,
          ownerName: vendorData.ownerName,
          phone: vendorData.phone,
          email: vendorData.email,
          address: vendorData.registeredAddress,
          gstNumber: vendorData.gstNumber || "",
          panNumber: vendorData.panNumber || "",
        };

        console.log("Updating vendor with payload:", apiPayload);

        // Call updateVendor API
        const response = await vendorService.updateVendor(apiPayload);
        console.log("Vendor updated successfully:", response);

        toast.success(response.message);

        // Refresh vendors list after successful update
        loadVendors();
      }

      setShowVendorModal(false);
    } catch (error) {
      console.error(
        `Error ${mode === "add" ? "creating" : "updating"} vendor:`,
        error
      );

      // Show specific error message from API response
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        `Failed to ${
          mode === "add" ? "add" : "update"
        } vendor. Please try again.`;

      toast.error(errorMessage);

      // Don't close modal on error so user can retry
    } finally {
      setSubmitting(false);
    }
  };

  // 🔹 View Vendor Details
  const handleView = (vendor) => {
    navigate(`/vendors/${vendor.id}`);
  };

  const handleDelete = (vendor) => {
    setDeleteConfig({
      onConfirm: async () => {
        try {
          const response = await vendorService.deleteVendor(vendor.id);
          toast.success(response.message || "Vendor deleted successfully");
          await loadVendors();
        } catch (error) {
          console.error("Error deleting vendor:", error);
          toast.error("Failed to delete vendor");
        }
      },
      title: "",
      message: `Are you sure you want to delete the vendor? This action is permanent and cannot be undone.`,
    });
    setShowDeleteModal(true);
  };

  // 🔹 Table Columns
  const columns = [
    { key: "sNo", header: "S.No" },
    { key: "name", header: "Vendor name" },
    {
      key: "contactPerson",
      header: "Contact person",
      render: (value, vendor) => (
        <div>
          <div className="font-semibold text-gray-900">
            {vendor.contactPerson}
          </div>
          <div className="text-sm text-gray-500">
            {vendor.contactPersonDesignation}
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone/E-mail",
      render: (value, vendor) => (
        <div>
          <div className="text-gray-900">{vendor.phone}</div>
          <div className="text-sm text-gray-500">{vendor.email}</div>
        </div>
      ),
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
          backgroundColor: "#FECACA",
        },
      },
    },
  ];

  const actions = [
    {
      text: "View",
      onClick: (vendor) => handleView(vendor),
      textColor: "var(--color-primary)",
    },
    {
      text: "Edit",
      onClick: handleEdit,
      textColor: "var(--color-success)",
    },
    {
      text: "Delete",
      onClick: handleDelete,
      textColor: "var(--color-error)",
    },
  ];

  return (
    <>
      <FullPageLoader isVisible={loading} message="Loading vendors..." />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Vendors</h1>
          <p className="text-gray-600">View and manage vendors</p>
        </div>

        {/* Search + Add */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative flex-1 max-w-[40%]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
            </div>
            <input
              type="text"
              placeholder="Search by name or contact"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <Button
            onClick={handleAddVendor}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
          >
            Add Vendor
          </Button>
        </div>

        {/* Table */}
        <Table
          data={filteredVendors}
          columns={columns}
          actions={actions}
          showPagination={true}
          itemsPerPage={10}
          emptyMessage="No vendors found"
        />

        {/* Modals */}
        <VendorModal
          isOpen={showVendorModal}
          onClose={() => setShowVendorModal(false)}
          vendor={selectedVendor}
          onSubmit={handleVendorSubmit}
          loading={submitting}
        />

        <DeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteConfig.onConfirm}
          title={deleteConfig.title}
          message={deleteConfig.message}
        />
      </div>
    </>
  );
};

export default Vendors;
