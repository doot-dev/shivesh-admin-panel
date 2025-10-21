import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";

import Button from "../components/ui/Button";
import Table from "../components/ui/Table";
import { Icon, ICON_NAMES } from "../components/icons";
import FullPageLoader from "../components/ui/FullPageLoader";

import VendorModal from "../components/modals/vendors/VendorModal";
import AddHandlerModal from "../components/modals/vendors/addHandlerModal";
import EditHandlerModal from "../components/modals/vendors/editHandlerModal";

import vendorService from "../services/vendorService";

/* ------------------------------ MAIN COMPONENT ------------------------------ */
const VendorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [vendor, setVendor] = useState(null);
  const [handlers, setHandlers] = useState([]);
  const [filteredHandlers, setFilteredHandlers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHandlerModal, setShowHandlerModal] = useState(false);

  const [handlerInfo, setHandlerInfo] = useState(null);
  const [vendorLocationId, setVendorLocationId] = useState(null);

  /* ------------------------------ FETCH DATA ------------------------------ */
  const loadVendorData = useCallback(async () => {
    try {
      setLoading(true);
      const vendorRes = await vendorService.getVendorById(id);
      const vendorData = vendorRes.data;

      setVendor({
        id: vendorData.id,
        name: vendorData.companyName,
        contactPerson: vendorData.ownerName,
        phone: vendorData.phone,
        email: vendorData.email,
        address: vendorData.address,
        gstNumber: vendorData.gstNumber,
        panNumber: vendorData.panNumber,
        isActive: vendorData.isActive,
        status: vendorData.isActive ? "Active" : "Inactive",
      });

      const handlerRes = await vendorService.getLocationbyVendorId(id);
      const mappedHandlers = mapHandlers(handlerRes.data || []);
      setHandlers(mappedHandlers);
      setFilteredHandlers(mappedHandlers);
    } catch (error) {
      console.error("Error loading vendor data:", error);
      toast.error("Failed to load vendor data");
      fallbackToNavigationData();
    } finally {
      setLoading(false);
    }
  }, [id, location.state]);

  useEffect(() => {
    loadVendorData();
  }, [loadVendorData]);

  /* ------------------------------ HELPERS ------------------------------ */
  const fallbackToNavigationData = () => {
    setVendor(location.state?.vendor || null);
    setHandlers(location.state?.handlers || []);
    setFilteredHandlers(location.state?.handlers || []);
  };

  const mapHandlers = (list) =>
    list.map((h, i) => ({
      id: h.id || i + 1,
      handlerName: h.name || h.handlerName,
      phone: h.phone,
      email: h.email,
      productServices: h.product?.name || "N/A",
      plantName: h.plantName || "N/A",
      location: h.location || h.address || "N/A",
      status: h.isActive ? "Active" : "Inactive",
      designation: h.designation || "Manager",
      vendorLocationId: h.vendorLocationId || h.id,
    }));

  const refreshHandlerList = async () => {
    try {
      const res = await vendorService.getLocationbyVendorId(vendor.id);
      const updatedHandlers = mapHandlers(res.data || []);
      setHandlers(updatedHandlers);
      setFilteredHandlers(updatedHandlers);
    } catch (error) {
      toast.error("Failed to refresh handlers");
    }
  };

  /* ------------------------------ SEARCH ------------------------------ */
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return setFilteredHandlers(handlers);

    const filtered = handlers.filter(
      (h) =>
        h.handlerName?.toLowerCase().includes(term) ||
        h.phone?.includes(term) ||
        h.email?.toLowerCase().includes(term)
    );
    setFilteredHandlers(filtered);
  }, [searchTerm, handlers]);

  /* ------------------------------ VENDOR ACTIONS ------------------------------ */
  const handleEditVendor = () => setShowEditModal(true);
  const handleEditSubmit = (updatedVendor) => {
    setVendor(updatedVendor);
    toast.success("Vendor updated successfully");
    setShowEditModal(false);
  };

  /* ------------------------------ HANDLER ACTIONS ------------------------------ */
  const handleAddHandler = () => {
    setHandlerInfo(null);
    setShowHandlerModal(true);
  };

  const handleEditHandler = (handler) => {
    setVendorLocationId(handler.vendorLocationId || handler.id);
    setHandlerInfo(handler);
    setShowHandlerModal(true);
  };

  const handleDeleteLocation = async (row) => {
    try {
      const res = await vendorService.deleteLocationbyId(row.id);
      toast.success(res?.message);
      await refreshHandlerList();
    } catch (error) {
      toast.error("Failed to delete location");
    }
  };

  const handleDeleteHandler = async (row) => {
    try {
      const res = await vendorService.deleteHandlers(row);
      toast.success(res?.message);
      await refreshHandlerList();
    } catch (error) {
      console.error("Error handling row action:", error);
      toast.error("Failed to delete handler");
    }
  };
  // ✅ Utility function to add multiple handlers for a specific location
  const addHandlersForLocation = async (handlers, locationId) => {
    try {
      const handlerPromises = handlers.map((h) =>
        vendorService.addHandlers({
          name: h.name,
          phone: h.phone,
          email: h.email,
          locationId,
        })
      );

      await Promise.all(handlerPromises);
      toast.success("Handler(s) added successfully");
    } catch (error) {
      console.error("Error adding handlers:", error);
      toast.error("Failed to add handler(s)");
      throw error; // rethrow to handle errors in parent function
    }
  };

  // ✅ Main function that adds location and then calls the above
  const handleAddHandlerSubmit = async ({ locationDetails, handlers }) => {
    try {
      const locationPayload = {
        id: null,
        ...locationDetails,
        productId: Number(locationDetails.productId) || 0,
        vendorId: Number(id),
      };

      const locationRes = await vendorService.addLocation(locationPayload);
      const newLocationId = locationRes?.data?.id;

      if (handlers?.length) {
        await addHandlersForLocation(handlers, newLocationId);
      }

      await refreshHandlerList();
      setShowHandlerModal(false);
    } catch (error) {
      console.error("Error in handleAddHandlerSubmit:", error);
      toast.error("Failed to add location and handler(s)");
    }
  };

  const handlersAddFunc = async (handlers) => {
    try {
      debugger;
      const handlerPromises = handlers.map((h) =>
        vendorService.addHandlers({
          name: h.name,
          phone: h.phone,
          email: h.email,

          locationId: h.locationId,
        })
      );

      await Promise.all(handlerPromises);
      toast.success("Handler(s) added successfully");
    } catch (error) {
      console.error("Error adding handlers:", error);
      toast.error("Failed to add handler(s)");
      throw error; // rethrow to handle errors in parent function
    }
  };

  const handleUpdateLocation = async ({
    locationDetails,
    locationVendorId,
  }) => {
    try {
      const payload = {
        id: Number(locationVendorId),
        ...locationDetails,
        productId: Number(locationDetails.productId) || 0,
        vendorId: Number(id),
      };

      const res = await vendorService.updateLocation(payload);
      toast.success(res?.message || "Location updated");
      await refreshHandlerList();
    } catch {
      toast.error("Failed to update location");
    }
  };

  /* ------------------------------ TABLE CONFIG ------------------------------ */
  const handlerColumns = [
    { key: "plantName", header: "Plant Name" },
    { key: "productServices", header: "Product/Services" },
    { key: "location", header: "Location", className: "max-w-xs truncate" },
    
  ];

  const handlerActions = [
    {
      text: "Edit",
      onClick: handleEditHandler,
      textColor: "var(--color-primary)",
    },
    {
      text: "Delete",
      onClick: handleDeleteLocation,
      textColor: "var(--color-error)",
    },
  ];

  /* ------------------------------ RENDER ------------------------------ */
  if (loading)
    return <FullPageLoader isVisible message="Loading vendor details..." />;

  if (!vendor) return <EmptyState onBack={() => navigate("/vendors")} />;

  return (
    <div className="p-6 space-y-8">
      <Breadcrumb
        vendorName={vendor.name}
        onBack={() => navigate("/vendors")}
      />

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

      <VendorInfoCard vendor={vendor} />

      <HandlerTableSection
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filteredHandlers={filteredHandlers}
        handlerColumns={handlerColumns}
        handlerActions={handlerActions}
        onAddHandler={handleAddHandler}
      />

      {/* -------- Modals -------- */}
      <VendorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        vendor={vendor}
        onSubmit={handleEditSubmit}
      />

      <AddHandlerModal
        isOpen={showHandlerModal && !handlerInfo}
        onClose={() => setShowHandlerModal(false)}
        onSubmit={handleAddHandlerSubmit}
        vendorId={id}
      />

      <EditHandlerModal
        isOpen={showHandlerModal && !!handlerInfo}
        onClose={() => setShowHandlerModal(false)}
        handler={handlerInfo}
        locationVendorId={vendorLocationId}
        removeHandler={handleDeleteHandler}
        addHandlers={handlersAddFunc}
        onUpdateLocation={handleUpdateLocation}
      />
    </div>
  );
};

/* ------------------------------ SUBCOMPONENTS ------------------------------ */

const Breadcrumb = ({ vendorName, onBack }) => (
  <div className="flex items-center text-sm text-gray-500">
    <button onClick={onBack} className="hover:text-gray-700">
      Vendor
    </button>
    <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} className="mx-2" />
    <span className="text-gray-700">{vendorName}</span>
    <Icon name={ICON_NAMES.CHEVRON_RIGHT} size={16} className="mx-2" />
    <span className="font-medium text-blue-600">Details</span>
  </div>
);

const EmptyState = ({ onBack }) => (
  <div className="p-6 text-center">
    <h2 className="text-xl font-semibold text-gray-900 mb-4">
      Vendor not found
    </h2>
    <Button onClick={onBack} variant="primary">
      Back to Vendors
    </Button>
  </div>
);

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

const HandlerTableSection = ({
  searchTerm,
  setSearchTerm,
  filteredHandlers,
  handlerColumns,
  handlerActions,
  onAddHandler,
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
          onClick={onAddHandler}
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
