import React, { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ICON_NAMES } from "../../icons";
import vendorService from "../../../services/vendorService";
import productService from "../../../services/productService";
import HandlerSection from "./handlerSection";
import { toast } from "react-toastify";
import MapPicker from "../../ui/MapPicker";

const EditHandlerModal = ({
  isOpen,
  onClose,
  locationVendorId,
  onUpdateLocation,
  removeHandler,
  addHandlers,
}) => {
  const [locationDetails, setLocationDetails] = useState(initialLocation());
  const [handlers, setHandlers] = useState([]);
  const [currentHandler, setCurrentHandler] = useState(initialHandler());
  const [editingIndex, setEditingIndex] = useState(null);
  const [productList, setProductList] = useState([]);
  const [errors, setErrors] = useState({});
  const [isEditMode] = useState(true);

  /** ------------------------------
   *  UTILITIES
   *  ------------------------------ */

  function initialLocation() {
    return {
      plantName: "",
      address: "",
      latitude: "",
      longitude: "",
      productId: "",
      vendorId: "",
    };
  }

  function initialHandler() {
    return { name: "", phone: "", email: "" };
  }

  /** ------------------------------
   *  FETCH DATA
   *  ------------------------------ */
  useEffect(() => {
    if (!isOpen || !locationVendorId) return;
    (async () => {
      try {
        const res = await vendorService.getLocationbyId(locationVendorId);
        const location = res.data || {};

        setLocationDetails({
          plantName: location.plantName || "",
          address: location.address || "",
          latitude: location.latitude || "",
          longitude: location.longitude || "",
          productId: location.productId || "",
          vendorId: location.vendorId || "",
        });

        const cleanHandlers = (location.handlers || []).map((h) => ({
          id: h.id,
          name: h.name || "",
          phone: h.phone || "",
          email: h.email || "",
          vendorLocationId: locationVendorId,
        }));

        setHandlers(cleanHandlers.length ? cleanHandlers : [initialHandler()]);
      } catch (err) {
        toast.error("Failed to load handler data");
      }
    })();
  }, [isOpen, locationVendorId]);

  useEffect(() => {
    (async () => {
      try {
        const productRes = await productService.getAllProducts();
        setProductList(productRes.data);
      } catch {
        setProductList([]);
      }
    })();
  }, []);

  /** ------------------------------
   *  HANDLER LOGIC
   *  ------------------------------ */
  const updateHandlerField = (field, value) => {
    setCurrentHandler((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleAddHandler = () => {
    debugger;
    if (!currentHandler.name || !currentHandler.phone) {
      setErrors({ general: "Please fill all handler fields" });
      return;
    }
    setHandlers([...handlers, { id: Date.now(), ...currentHandler }]);
    setCurrentHandler({ name: "", phone: "", email: "" });
    addHandlers([{ ...currentHandler, locationId: locationVendorId }]);
  };

  const handleEditHandler = (handlerObj, idx) => {
    if (handlerObj === null || idx === null) {
      setEditingIndex(null);
      return;
    }

    setEditingIndex(
      typeof idx === "number"
        ? idx
        : handlers.findIndex(
            (h) =>
              (h.vendorLocationId || h.id) ===
              (handlerObj.vendorLocationId || handlerObj.id)
          )
    );
  };

  // 🔹 Step 1: Handle field change while editing
  const onHandlerFieldChange = (index, field, value) => {
    setHandlers((prev) =>
      prev.map((h, i) => (i === index ? { ...h, [field]: value } : h))
    );
  };

  // 🔹 Step 2: Apply edit
  const applyHandlerEdit = async () => {
    if (editingIndex === null) return;

    const updatedHandler = handlers[editingIndex];
    if (!updatedHandler.id) {
      toast.error("Handler ID missing — cannot update.");
      return;
    }

    const payload = [
      {
        id: updatedHandler.id,
        name: updatedHandler.name,
        phone: updatedHandler.phone,
        email: updatedHandler.email,
        locationId: locationVendorId,
      },
    ];

    await handleUpdateHandlers(payload); // call API update
    setEditingIndex(null);
    
  };

  // 🔹 Step 3: Update multiple handlers (API call)
  const handleUpdateHandlers = async (handlersPayload) => {
    try {
      debugger;
      if (!Array.isArray(handlersPayload) || handlersPayload.length === 0) {
        toast.warning("No handlers to update");
        return;
      }

      const payload = handlersPayload[0];
      console.log("➡️ updateHandlers payload:", payload);
      const res = await vendorService.updateHandlers(payload);
      console.log("✅ updateHandlers response:", res);

      toast.success("Handler updated successfully");
      // Optional: refetch list
      await refreshHandlerList?.();
    } catch (error) {
      console.error("❌ handleUpdateHandlers error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update handlers";
      toast.error(msg);
    }
  };
  const handleRemoveHandler = async (index) => {
  const handlerToRemove = handlers[index];

  if (handlerToRemove?.id) {
    try {
      await removeHandler(handlerToRemove.id); // wait for API delete
    } catch (err) {
      console.error("Failed to delete handler:", err);
    }
  }

  setHandlers((prev) => prev.filter((_, i) => i !== index));
};


  /** ------------------------------
   *  LOCATION LOGIC
   *  ------------------------------ */
  const updateField = (setter, field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
    clearError(field);
  };

  const handleLocationSubmit = (e) => {
    e.preventDefault();
    onUpdateLocation({ locationDetails, locationVendorId });
  };

  /** ------------------------------
   *  ERROR UTILITIES
   *  ------------------------------ */
  const clearError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  /** ------------------------------
   *  JSX
   *  ------------------------------ */
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit details"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.ADD_NEW_USER}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Edit Location and Handlers
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Edit location and handlers under this vendor.{" "}
        </p>
      </div>
      {/* LOCATION FORM */}
      <form onSubmit={handleLocationSubmit} className="space-y-4">
        <label className="block text-[18px] font-semibold text-gray-700 mb-1">
          Location Details
        </label>
        <div className="border-border border py-4 px-6 rounded-[14px] hover:border-opacity-75">
          <div>
            <Input
              type="text"
              label="Plant Name"
              value={locationDetails.plantName}
              onChange={(e) =>
                updateField(setLocationDetails, "plantName", e.target.value)
              }
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <MapPicker
              latitude={locationDetails.latitude}
              longitude={locationDetails.longitude}
              onSelect={(latlng) => {
                updateField(setLocationDetails, "latitude", latlng.lat);
                updateField(setLocationDetails, "longitude", latlng.lng);
              }}
            />
          </div>
          <div className="flex mt-2 gap-2">
            <Input
              placeholder="Latitude"
              value={locationDetails.latitude}
              onChange={(e) =>
                updateField(setLocationDetails, "latitude", e.target.value)
              }
            />
            <Input
              placeholder="Longitude"
              value={locationDetails.longitude}
              onChange={(e) =>
                updateField(setLocationDetails, "longitude", e.target.value)
              }
            />
          </div>
          <div className="mt-4">
            <textarea
              value={locationDetails.address}
              onChange={(e) =>
                updateField(setLocationDetails, "address", e.target.value)
              }
              className="w-full border rounded-lg border-border hover:border-opacity-75 p-2 outline-0"
            />
          </div>
          <div className="mt-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <select
              value={locationDetails.productId}
              onChange={(e) =>
                updateField(setLocationDetails, "productId", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-lg outline-0 border-border hover:border-opacity-75"
            >
              <option value="">Select product</option>
              {productList.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end mb-5">
          <Button type="submit" width={150} variant="primary">
            Update Location
          </Button>
        </div>
      </form>
      <h4 className="text-md font-medium text-gray-900 mb-4">
        Handler Details
      </h4>
      <div className="border-border border py-6 px-4 rounded-[14px] hover:border-opacity-75">
        {/* HANDLER SECTION */}
        <HandlerSection
          handlers={handlers}
          updateField={updateHandlerField}
          currentHandler={currentHandler}
          handleAddHandler={handleAddHandler}
          handleRemoveHandler={handleRemoveHandler}
          handleEditHandler={handleEditHandler}
          errors={errors}
          isEditMode={isEditMode}
          editingIndex={editingIndex}
          onHandlerFieldChange={onHandlerFieldChange}
          onApplyEdit={applyHandlerEdit}
        />
      </div>
      {/* FOOTER BUTTONS */}
      <div className="flex justify-end gap-3 mt-6">
      
        <Button
          type="button"
          variant="primary"
          width={150}
          onClick={onClose}
        >
          Update Handler
        </Button>
      </div>
    </Modal>
  );
};

export default EditHandlerModal;
