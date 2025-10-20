import React, { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ICON_NAMES } from "../../icons";
import vendorService from "../../../services/vendorService";
import productService from "../../../services/productService";
import HandlerSection from "./handlerSection";
import { toast } from "react-toastify";

const EditHandlerModal = ({
  isOpen,
  onClose,
  locationVendorId,
  onUpdateLocation,
  removeHandler,
  addHandlers
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
    addHandlers([{ ...currentHandler,  locationId: locationVendorId  }]);
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
  const handleRemoveHandler = (index) => {
    const handlerToRemove = handlers[index];
    if (handlerToRemove?.id) {
      removeHandler(handlerToRemove.id); // parent API deletion
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
      title="Edit Handler"
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      {/* LOCATION FORM */}
      <form onSubmit={handleLocationSubmit} className="space-y-6">
        <section>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Location Details
          </h4>

          <Input
            label="Plant Name"
            value={locationDetails.plantName}
            onChange={(e) =>
              updateField(setLocationDetails, "plantName", e.target.value)
            }
          />

          <textarea
            value={locationDetails.address}
            onChange={(e) =>
              updateField(setLocationDetails, "address", e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg"
          />

          <select
            value={locationDetails.productId}
            onChange={(e) =>
              updateField(setLocationDetails, "productId", e.target.value)
            }
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Select product</option>
            {productList.map((prod) => (
              <option key={prod.id} value={prod.id}>
                {prod.name}
              </option>
            ))}
          </select>
        </section>

        <div className="grid grid-cols-2 gap-4">
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

        <div className="flex justify-end">
          <Button type="submit" variant="primary">
            Update Location
          </Button>
        </div>
      </form>

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

      {/* FOOTER BUTTONS */}
      <div className="flex justify-end gap-3 mt-6">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" variant="primary" onClick={applyHandlerEdit}>
          Update Handler
        </Button>
      </div>
    </Modal>
  );
};

export default EditHandlerModal;
