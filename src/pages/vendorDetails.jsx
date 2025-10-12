import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { Icon, ICON_NAMES } from "../components/icons";
import VendorModal from "../components/modals/vendors/VendorModal";
import AddHandlerModal from "../components/modals/vendors/AddHandlerModal";

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [vendor, setVendor] = useState(null);
  const [handlers, setHandlers] = useState([]);
  const [filteredHandlers, setFilteredHandlers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddHandlerModal, setShowAddHandlerModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock handlers data
  const mockHandlers = [
    {
      id: 1,
      handlerName: "Ravi Goyal",
      phone: "9203463584",
      email: "ravig@gmail.com",
      productServices: "Cement",
      plantName: "Plant A",
      location: "A- 243, govind marg, Calgiri road, Jaipur, Rajasthan- 302015",
      status: "Active",
    },
    {
      id: 2,
      handlerName: "Aman Seth",
      phone: "9244567886",
      email: "sethaman@gmail.com",
      productServices: "Cement",
      plantName: "Plant A",
      location: "A- 243, govind marg, Calgiri road, Jaipur, Rajasthan- 302015",
      status: "Active",
    },
  ];

  useEffect(() => {
    loadVendorData();
  }, [id]);

  const loadVendorData = () => {
    try {
      // Try to get vendor from location state first
      if (location.state?.vendor) {
        setVendor(location.state.vendor);
      } else {
        // Fallback: Mock vendor data based on ID
        const mockVendor = {
          id: parseInt(id),
          name: "ACC Cement",
          contactPerson: "Ramesh Goel",
          phone: "9203463584",
          email: "rameshg@gmail.com",
          address: "A- 243, govind marg, Calgiri road, Jaipur, Rajasthan- 302015",
          gstNo: "76KNDCK9780",
          panNo: "A0P0987YH34",
          status: "Active",
        };
        setVendor(mockVendor);
      }
      
      // Load handlers for this vendor
      setHandlers(mockHandlers);
      setFilteredHandlers(mockHandlers);
      setLoading(false);
    } catch (error) {
      console.error("Error loading vendor data:", error);
      toast.error("Failed to load vendor data");
      setLoading(false);
    }
  };

  // Search filter for handlers
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredHandlers(handlers);
      return;
    }

    const filtered = handlers.filter(
      (handler) =>
        handler.handlerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        handler.phone.includes(searchTerm) ||
        handler.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredHandlers(filtered);
  }, [searchTerm, handlers]);

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = (updatedVendor) => {
    setVendor(updatedVendor);
    toast.success("Vendor updated successfully");
    setShowEditModal(false);
  };

  const handleAddHandler = () => {
    setShowAddHandlerModal(true);
  };

  const handleAddHandlerSubmit = (handlerData) => {
    // Add new handlers to the existing handlers list
    const newHandlers = handlerData.handlers.map(handler => ({
      id: Date.now() + Math.random(),
      handlerName: handler.name,
      phone: handler.phone,
      email: handler.email,
      productServices: handlerData.locationDetails.productName,
      plantName: handlerData.locationDetails.plantName,
      location: handlerData.locationDetails.address,
      status: handler.status,
      designation: handler.designation,
    }));

    setHandlers(prev => [...prev, ...newHandlers]);
    setFilteredHandlers(prev => [...prev, ...newHandlers]);
    toast.success(`${newHandlers.length} handler(s) added successfully!`);
    setShowAddHandlerModal(false);
  };

  const handleEditHandler = (handler) => {
    console.log("Edit handler:", handler);
    toast.info("Edit handler functionality coming soon!");
  };

  const handleDeleteHandler = (handler) => {
    console.log("Delete handler:", handler);
    toast.info("Delete handler functionality coming soon!");
  };

  // Handler table columns
  const handlerColumns = [
    {
      key: "handlerName",
      header: "Handler name",
      className: "font-medium",
    },
    {
      key: "phone",
      header: "Phone/E-mail",
      render: (handler) => (
        <div>
          <div>{handler.phone}</div>
          <div className="text-sm text-gray-500">{handler.email}</div>
        </div>
      ),
    },
    {
      key: "productServices",
      header: "Product/Services",
    },
    {
      key: "plantName",
      header: "Plant name",
    },
    {
      key: "location",
      header: "Location",
      className: "max-w-xs truncate",
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

  const handlerActions = [
    {
      text: "Edit",
      onClick: handleEditHandler,
      textColor: "var(--color-primary)",
    },
    {
      text: "Delete",
      onClick: handleDeleteHandler,
      textColor: "var(--color-error)",
    },
  ];

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!vendor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Vendor not found</h2>
          <Button onClick={() => navigate("/vendors")} variant="primary">
            Back to Vendors
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500 mb-6">
        <button
          onClick={() => navigate("/vendors")}
          className="hover:text-gray-700"
        >
          Vendor
        </button>
        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} className="mx-2" />
        <span className="text-gray-700">{vendor.name}</span>
        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} className="mx-2" />
        <span className="font-medium text-blue-600">{vendor.name} Detail</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{vendor.name}</h1>
        <Button
          onClick={handleEdit}
          leftIcon={ICON_NAMES.EDIT}
          variant="secondary"
        >
          Edit
        </Button>
      </div>

      {/* Basic Details Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-6">Basic details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Owner's name */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Owner's name
            </label>
            <p className="text-gray-900">{vendor.contactPerson}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Phone
            </label>
            <p className="text-gray-900">{vendor.phone}</p>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              E-mail
            </label>
            <p className="text-gray-900">{vendor.email}</p>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Address
            </label>
            <p className="text-gray-900">{vendor.address}</p>
          </div>

          {/* GST No. */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              GST No.
            </label>
            <p className="text-gray-900">{vendor.gstNo}</p>
          </div>

          {/* PAN No. */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              PAN No.
            </label>
            <p className="text-gray-900">{vendor.panNo}</p>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Status
            </label>
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                color: vendor.status === "Active" ? "#16A34A" : "#DC2626",
                backgroundColor: vendor.status === "Active" ? "#D1FAE5" : "#FECACA",
              }}
            >
              • {vendor.status}
            </span>
          </div>
        </div>
      </div>

      {/* Handlers Detail Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        {/* Handlers Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Handlers Detail</h2>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Add Button */}
              <Button
                onClick={handleAddHandler}
                leftIcon={ICON_NAMES.PLUS}
                variant="primary"
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        {/* Handlers Table */}
        <div className="overflow-hidden">
          <Table
            data={filteredHandlers}
            columns={handlerColumns}
            actions={handlerActions}
            showPagination={false}
            className="border-0 shadow-none"
            emptyMessage="No handlers found"
          />
        </div>
      </div>

      {/* Edit Modal */}
      <VendorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vendor={vendor}
        onSubmit={handleEditSubmit}
      />

      {/* Add Handler Modal */}
      <AddHandlerModal
        isOpen={showAddHandlerModal}
        onClose={() => setShowAddHandlerModal(false)}
        onSubmit={handleAddHandlerSubmit}
        vendorId={vendor?.id}
      />
    </div>
  );
};

export default VendorDetail;