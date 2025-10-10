import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { Icon, ICON_NAMES } from "../components/icons";
import FullPageLoader from "../components/ui/FullPageLoader";
import VendorModal from "../components/modals/vendors/VendorModal";
import DeleteVendorModal from "../components/modals/vendors/DeleteVendorModal";

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // 🔹 Fake Vendor Data
  const mockVendors = [
    {
      id: 1,
      sNo: "01",
      name: "ACC Cement",
      contactPerson: "Ramesh Goel",
      designation: "Manager",
      phone: "9203463584",
      email: "rameshg@gmail.com",
      status: "Active",
    },
    {
      id: 2,
      sNo: "02",
      name: "Ambuja Cement",
      contactPerson: "Aman Seth",
      designation: "Sales Head",
      phone: "9244567886",
      email: "sethaman@gmail.com",
      status: "Active",
    },
    {
      id: 3,
      sNo: "03",
      name: "Steel Works Ltd.",
      contactPerson: "Amit Singh",
      designation: "Director",
      phone: "8756454433",
      email: "director@steelworks.com",
      status: "Inactive",
    },
  ];

  useEffect(() => {
    loadVendors();
  }, []);

  // 🔹 Load Vendors (Mock)
  const loadVendors = async () => {
    try {
      setLoading(true);
      // Simulate API
      setTimeout(() => {
        setVendors(mockVendors);
        setFilteredVendors(mockVendors);
        setLoading(false);
      }, 800);
    } catch (error) {
      console.error("Error loading vendors:", error);
      toast.error("Failed to load vendors");
      setLoading(false);
    }
  };

  // 🔹 Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredVendors(vendors);
      return;
    }

    const filtered = vendors.filter(
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
  };

  // 🔹 Handle Vendor Submit (both add and edit)
  const handleVendorSubmit = (vendorData, mode) => {
    if (mode === 'add') {
      setVendors((prev) => [...prev, vendorData]);
      toast.success("Vendor added successfully");
    } else if (mode === 'edit') {
      const updated = vendors.map((v) =>
        v.id === vendorData.id ? vendorData : v
      );
      setVendors(updated);
      toast.success("Vendor updated successfully");
    }
    setShowVendorModal(false);
  };

  // 🔹 Delete Vendor
  const handleDelete = (vendor) => {
    setSelectedVendor(vendor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setVendors((prev) => prev.filter((v) => v.id !== selectedVendor.id));
    toast.success("Vendor deleted successfully");
    setShowDeleteModal(false);
  };

  // 🔹 Table Columns
  const columns = [
    { key: "sNo", header: "S.No" },
    { key: "name", header: "Vendor name" },
    {
      key: "contactPerson",
      header: "Contact person",
      render: (vendor) => (
        <div>
          <div className="font-semibold">{vendor.contactPerson}</div>
          <div className="text-sm text-gray-500">{vendor.designation}</div>
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone/E-mail",
      render: (vendor) => (
        <div>
          <div>{vendor.phone}</div>
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
        />

        <DeleteVendorModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          vendor={selectedVendor}
        />
      </div>
    </>
  );
};

export default Vendors;
