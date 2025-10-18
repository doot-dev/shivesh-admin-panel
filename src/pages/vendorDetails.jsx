import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { Icon, ICON_NAMES } from "../components/icons";
import VendorModal from "../components/modals/vendors/VendorModal";
import HandlerModal from "../components/modals/vendors/handlerModal";
import vendorService from "../services/vendorService";
import FullPageLoader from "../components/ui/FullPageLoader";
import AddHandlerModal from "../components/modals/vendors/addHandlerModal";
import EditHandlerModal from "../components/modals/vendors/editHandlerModal";

const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [vendor, setVendor] = useState(null);
  const [handlers, setHandlers] = useState([]);
  const [filteredHandlers, setFilteredHandlers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [handlerInfo, setHandlerInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendorLocationId, setVendorLocationId] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHandlerModal, setShowHandlerModal] = useState(false);

  // ---------------- Mock Data Fallback ----------------
  const mockHandlers = [
    {
      id: 1,
      handlerName: "Ravi Goyal",
      phone: "9203463584",
      email: "ravig@gmail.com",
      productServices: "Cement",
      plantName: "Plant A",
      location: "A-243, Govind Marg, Jaipur, Rajasthan - 302015",
      status: "Active",
    },
    {
      id: 2,
      handlerName: "Aman Seth",
      phone: "9244567886",
      email: "sethaman@gmail.com",
      productServices: "Cement",
      plantName: "Plant A",
      location: "A-243, Govind Marg, Jaipur, Rajasthan - 302015",
      status: "Active",
    },
  ];

  // ---------------- API: Load Vendor ----------------
  useEffect(() => {
    const loadVendorData = async () => {
      try {
        setLoading(true);
        const vendorRes = await vendorService.getVendorById(id);
        const vendorData = vendorRes.data;

        const mappedVendor = {
          id: vendorData.id,
          name: vendorData.companyName,
          contactPerson: vendorData.ownerName,
          phone: vendorData.phone,
          email: vendorData.email,
          address: vendorData.address,
          gstNumber: vendorData.gstNumber,
          panNumber: vendorData.panNumber,
          status: vendorData.isActive ? "Active" : "Inactive",
          isActive: vendorData.isActive,
        };

        setVendor(mappedVendor);

        const handlerRes = await vendorService.getLocationbyVendorId(id);
        const mappedHandlers = (handlerRes.data || []).map((h, i) => ({
          id: h.id || i + 1,
          handlerName: h.name || h.handlerName,
          phone: h.phone,
          email: h.email,
          productServices: h.product.name || "N/A",
          plantName: h.plantName || "N/A",
          location: h.location || h.address || "N/A",
          status: h.isActive ? "Active" : "Inactive",
          designation: h.designation || "Manager",
        }));

        setHandlers(mappedHandlers.length ? mappedHandlers : mockHandlers);
        setFilteredHandlers(
          mappedHandlers.length ? mappedHandlers : mockHandlers
        );
      } catch (error) {
        console.error("Error loading vendor data:", error);
        toast.error("Failed to load vendor data");

        // fallback to navigation state or mock
        setVendor(location.state?.vendor || null);
        setHandlers(location.state?.handlers || mockHandlers);
        setFilteredHandlers(location.state?.handlers || mockHandlers);
      } finally {
        setLoading(false);
      }
    };

    loadVendorData();
  }, [id, location.state]);

  // ---------------- Search Filter ----------------
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return setFilteredHandlers(handlers);

    setFilteredHandlers(
      handlers.filter(
        (h) =>
          h.handlerName.toLowerCase().includes(term) ||
          h.phone.includes(term) ||
          h.email.toLowerCase().includes(term)
      )
    );
  }, [searchTerm, handlers]);

  // ---------------- Vendor Actions ----------------
  const handleEditVendor = () => setShowEditModal(true);

  const handleEditSubmit = (updatedVendor) => {
    setVendor(updatedVendor);
    toast.success("Vendor updated successfully");
    setShowEditModal(false);
  };

  // ---------------- Handler Actions ----------------
  const handleAddHandler = () => {
    setHandlerInfo(null);
    setShowHandlerModal(true);
  };

  const handleHandlerSubmit = async ({
    locationDetails,
    handlers,
    handler,
    locationVendorId,
  }) => {
    try {
      const payload = {
        location: {
          id: Number(id) || null, // null for add, id for edit
          ...locationDetails,
          productId: Number(locationDetails.productId) || 0,
          vendorId: Number(id) || 0,
        },
        handlers: handlers.map((h) => ({
          locationId: locationVendorId || null, // null for add, id for edit
          name: h.name,
          phone: h.phone,
          email: h.email,
        })),
      };

      console.log("📦 Payload for add/edit:", payload);
      console.log("Location Vendor ID:", locationVendorId);
      if (locationVendorId !== 0) {
        // ---------------- EDIT MODE ----------------
        await vendorService.updateLocation(payload.location);
        await vendorService.updateHandlers(payload.handlers);
        toast.success("Handler(s) updated successfully");
      } else {
        // ---------------- ADD MODE ----------------
        // Step 1: Add location
        const locationRes = await vendorService.addLocation(payload.location);
        const newLocationId = locationRes?.data?.id;

        // Step 2: Add handlers with locationId
        payload.handlers.forEach(async (h) => {
          await vendorService.addHandlers({
            ...h,
            locationId: newLocationId,
          });
        });

        toast.success("Handler(s) added successfully");
      }

      // ---------------- Refresh table ----------------
      await refreshHandlerList();

      // Close modal
      setShowHandlerModal(false);
    } catch (error) {
      console.error("Error in add/update handler flow:", error);
      toast.error("Failed to add/update handler(s)");
    }
  };

  const handleEditHandler = (handler) => {
    setVendorLocationId(handler.id);
    setHandlerInfo(handler);
    setShowHandlerModal(true);
  };

  const handleDeleteHandler = async (handler) => {
    toast.info(`Delete handler "${handler.handlerName}" coming soon!`);
    try {
      const res = await vendorService.deleteLocationbyId(
        handler.vendorLocationId
      );
      console.log("✅ Deleted location:", res);

      toast.success(res?.message);

      // 🔁 Refresh handler/location table after deletion
      await refreshHandlerList();
    } catch (error) {
      console.error("failed to deleted", error);
      toast.error("Failed to delete location");
    }
  };

  const refreshHandlerList = async () => {
    try {
      const res = await vendorService.getLocationbyVendorId(vendor.id);
      const mappedHandlers = (res.data || []).map((h, i) => ({
        id: h.id || i + 1,
        handlerName: h.name || h.handlerName,
        phone: h.phone,
        email: h.email,
        productServices: h.product.name || "N/A",
        plantName: h.plantName || "N/A",
        location: h.location || h.address || "N/A",
        status: h.isActive ? "Active" : "Inactive",
        designation: h.designation || "Manager",
        vendorLocationId: h.vendorLocationId,
      }));

      setHandlers(mappedHandlers);
      setFilteredHandlers(mappedHandlers);
    } catch (error) {
      console.error("Error refreshing handler list:", error);
      toast.error("Failed to refresh handlers");
    }
  };

  // ---------------- Table Config ----------------
  const handlerColumns = [
    { key: "plantName", header: "Plant Name" },
    { key: "productServices", header: "Product/Services" },
    { key: "location", header: "Location", className: "max-w-xs truncate" },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
        Active: { color: "#16A34A", backgroundColor: "#D1FAE5" },
        Inactive: { color: "#DC2626", backgroundColor: "#FECACA" },
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

  // ---------------- Conditional Rendering ----------------
  if (loading)
    return <FullPageLoader isVisible message="Loading vendor details..." />;

  if (!vendor)
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Vendor not found
        </h2>
        <Button onClick={() => navigate("/vendors")} variant="primary">
          Back to Vendors
        </Button>
      </div>
    );

  // ---------------- UI ----------------
  return (
    <div className="p-6 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-500">
        <button
          onClick={() => navigate("/vendors")}
          className="hover:text-gray-700"
        >
          Vendor
        </button>
        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} className="mx-2" />
        <span className="text-gray-700">{vendor.name}</span>
        <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} className="mx-2" />
        <span className="font-medium text-blue-600">Details</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{vendor.name}</h1>
        <Button
          onClick={handleEditVendor}
          leftIcon={ICON_NAMES.EDIT}
          variant="secondary"
          className="bg-transparent"
          height={44}
        >
          Edit
        </Button>
      </div>

      {/* Vendor Info */}
      <VendorInfoCard vendor={vendor} />

      {/* Handlers */}
      <HandlerSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredHandlers={filteredHandlers}
        handlerColumns={handlerColumns}
        handlerActions={handlerActions}
        handleAddHandler={handleAddHandler}
      />

      {/* Modals */}
      <VendorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vendor={vendor}
        onSubmit={handleEditSubmit}
      />
      {/* <HandlerModal
        isOpen={showHandlerModal}
        onClose={() => setShowHandlerModal(false)}
        onSubmit={handleHandlerSubmit}
        vendorId={id}
        handler={handlerInfo}
        locationVendorId={vendorLocationId}
      /> */}
      <AddHandlerModal isOpen={showHandlerModal && !handlerInfo}
        onClose={() => setShowHandlerModal(false)}
        onSubmit={handleHandlerSubmit}
        vendorId={id} />
      <EditHandlerModal isOpen={showHandlerModal && !!handlerInfo}
        onClose={() => setShowHandlerModal(false)}
        onSubmit={handleHandlerSubmit}
        handler={handlerInfo}
        locationVendorId={vendorLocationId} />
    </div>
  );
};

// ---------------- Subcomponents ----------------
const VendorInfoCard = ({ vendor }) => (
  <div className="bg-white rounded-lg border border-[#9BB3F4] shadow p-6">
    <h2 className="text-lg font-medium text-gray-900 mb-6">Basic Details</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[
        ["Owner's Name", vendor.contactPerson],
        ["Phone", vendor.phone],
        ["E-mail", vendor.email],
        ["Address", vendor.address],
        ["GST No.", vendor.gstNumber],
        ["PAN No.", vendor.panNumber],
      ].map(([label, value]) => (
        <div key={label}>
          <label className="block text-sm font-medium text-gray-500 mb-1">
            {label}
          </label>
          <p className="text-gray-900">{value || "—"}</p>
        </div>
      ))}
      <div>
        <label className="block text-sm font-medium text-gray-500 mb-1">
          Status
        </label>
        <span
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
          style={{
            color: vendor.isActive ? "#16A34A" : "#DC2626",
            backgroundColor: vendor.isActive ? "#D1FAE5" : "#FECACA",
          }}
        >
          • {vendor.status}
        </span>
      </div>
    </div>
  </div>
);

const HandlerSection = ({
  searchTerm,
  setSearchTerm,
  filteredHandlers,
  handlerColumns,
  handlerActions,
  handleAddHandler,
}) => (
  <div className="bg-white rounded-lg">
    <div className="p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <h2 className="text-lg font-medium text-gray-900">Handlers Detail</h2>
      <div className="flex gap-4">
        <div className="relative">
          <Icon
            name={ICON_NAMES.SEARCH}
            size={16}
            color="#9CA3AF"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 h-12 focus:outline-none"
          />
        </div>
        <Button
          onClick={handleAddHandler}
          leftIcon={ICON_NAMES.PLUS}
          variant="primary"
          height={48}
        >
          Add
        </Button>
      </div>
    </div>

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
);

export default VendorDetail;
