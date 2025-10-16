import React, { use, useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import MapImage from "../../../assets/img/map.png";
import { Icon, ICON_NAMES } from "../../icons";
import HandlerSection from "./handlerSection";
import productService from "../../../services/productService";
import vendorService from "../../../services/vendorService";

const HandlerModal = ({ isOpen, onClose, onSubmit, vendorId, handler, locationVendorId }) => {
  const [formData, setFormData] = useState({
    locationDetails: {
      address: "",
      plantName: "",
      productServices: "",
    },
    handlers: [
      {
        name: "",
        phone: "",
        email: "",
      },
    ],
  });
  const [loading, setLoading] = useState(false);
  const [locationDetails, setLocationDetails] = useState({
    plantName: "",
    address: "",
    latitude: "",
    longitude: "",
    vendorId: vendorId.id,
  });
  const [handlers, setHandlers] = useState([]);
  const [currentHandler, setCurrentHandler] = useState({
    name: "",
    phone: "",
    email: "",
  });
  const [errors, setErrors] = useState({});
  const [productList, setProductList] = useState([]);

  const isEditMode = Boolean(handler);

  // ---------- Helpers ----------
  const updateField = (setter, field, value) => {
    setter((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateFields = (fields, validations) => {
    const newErrors = {};
    fields.forEach(([key, value]) => {
      if (!value.trim()) newErrors[key] = "Please fill the field";
    });
    validations?.(newErrors);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ---------- Validation ----------
  const validateLocation = () =>
    validateFields([
      ["plantName", locationDetails.plantName],
      ["address", locationDetails.address],
    ]);

  const validateHandler = () =>
    validateFields(
      [
        ["handlerName", currentHandler.name],
        ["handlerPhone", currentHandler.phone],
        ["handlerEmail", currentHandler.email],
      ],
      (errs) => {
        if (currentHandler.email && !/\S+@\S+\.\S+/.test(currentHandler.email))
          errs.handlerEmail = "Please enter a valid email address";
        if (
          currentHandler.phone &&
          !/^\d{10}$/.test(currentHandler.phone.replace(/\s+/g, ""))
        )
          errs.handlerPhone = "Please enter a valid 10-digit phone number";
      }
    );

  // ---------- Handler Management ----------
  const handleAddHandler = () => {
    if (!validateHandler()) return;

    setHandlers((prev) => [
      ...prev,
      { id: Date.now(), ...currentHandler, status: "Active" },
    ]);
    setCurrentHandler({
      name: "",
      phone: "",
      email: "",
    });
  };

  const handleRemoveHandler = (id) =>
    setHandlers((prev) => prev.filter((h) => h.id !== id));

  // ---------- Submit ----------
  const handleSubmit = (e) => {
    e.preventDefault();

    // if (!validateLocation()) return;
    // if (handlers.length === 0)
    //   return setErrors({ general: "Please add at least one handler" });

    // Return collected data to parent
    onSubmit({
      locationDetails,
      handlers,
      handler,            // existing handler for edit mode (if any)
      locationVendorId,   // existing location ID for edit mode
    });

    handleClose();
  };


  const handleClose = () => {
    setLocationDetails({
      plantName: "",
      address: "",
      latitude: "",
      longitude: "",
      vendorId,
    });
    setHandlers([]);
    setCurrentHandler({
      name: "",
      phone: "",
      email: "",
    });
    setErrors({});
    onClose();
  };



  // ---------- Prefill Edit Data ----------
  useEffect(() => {
    const fetchHandlerDetails = async () => {
      console.log("DEBUG:", { isOpen, handler, locationVendorId });

      if (!isOpen || !handler || !locationVendorId) return;

      try {
        setLoading(true);
        const res = await vendorService.getLocationbyId(locationVendorId);
        console.log("dfsdf", res.data)
        setHandlers(res.data.handlers);
        setLocationDetails(res.data);
        if (res?.data) {
          const h = res.data;

          setFormData({
            locationDetails: {
              address: h.location || h.address || "",
              plantName: h.plantName || "",
              productServices: h.productServices || "",
            },
            handlers: [
              {
                name: h.name || "",
                phone: h.phone || "",
                email: h.email || "",
              },
            ],
          });
        }
      } catch (err) {
        console.error("Error fetching handler details:", err);
        toast.error("Failed to load handler details");
      } finally {
        setLoading(false);
      }
    };

    fetchHandlerDetails();
  }, [isOpen, handler, locationVendorId]);


  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productRes = await productService.getAllProducts();

        setProductList(productRes.data);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProductList([]);
      }
    };
    fetchProducts();
  }, []);

  // ---------- Render ----------
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Handler" : "Add New Handler"}
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.PRODUCT_MODAL}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {isEditMode ? "Edit Location and Handlers" : "Add Location and Handlers"}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? "Edit location and handlers under this vendor"
            : "Add location and handlers under this vendor"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---------- Location Section ---------- */}
        <section>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Location Details
          </h4>

          <Input
            label="Plant Name"
            placeholder="Enter full name"
            value={locationDetails.plantName}
            onChange={(e) =>
              updateField(setLocationDetails, "plantName", e.target.value)
            }
            error={errors.plantName}
          />

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <img
              src={MapImage}
              alt="Map"
              className="w-full h-32 object-cover mb-2"
            />
            <div className="grid grid-cols-2 gap-3 my-2">
              <Input
                placeholder="Enter latitude"
                value={locationDetails.latitude}
                onChange={(e) =>
                  updateField(setLocationDetails, "latitude", e.target.value)
                }
              />
              <Input
                placeholder="Enter longitude"
                value={locationDetails.longitude}
                onChange={(e) =>
                  updateField(setLocationDetails, "longitude", e.target.value)
                }
              />
            </div>
            <textarea
              placeholder="Enter full address"
              value={locationDetails.address}
              onChange={(e) =>
                updateField(setLocationDetails, "address", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 resize-none ${errors.address ? "border-red-500" : "border-gray-300"
                }`}
              rows={3}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name
            </label>
            <select
              value={locationDetails.productName}
              onChange={(e) =>
                updateField(setLocationDetails, "productName", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.productName ? "border-red-500" : "border-gray-300"
                }`}
            >
              <option value="">Select product name</option>
              {productList?.map((prod, index) => (
                <option key={index} value={prod.name}>
                  {prod.name}
                </option>
              ))}
            </select>
            {errors.productName && (
              <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
            )}
          </div>
        </section>

        {/* ---------- Handlers Section ---------- */}
        <HandlerSection
          handlers={handlers}
          currentHandler={currentHandler}
          errors={errors}
          updateField={(field, value) =>
            setCurrentHandler((prev) => ({ ...prev, [field]: value }))
          }
          handleAddHandler={handleAddHandler}
          handleRemoveHandler={handleRemoveHandler}
        />

        {errors.general && (
          <p className="text-red-500 text-sm">{errors.general}</p>
        )}

        {/* ---------- Actions ---------- */}
        <div className="flex gap-3 pt-4">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {isEditMode ? "Update Vendor" : "Add Vendor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HandlerModal;
