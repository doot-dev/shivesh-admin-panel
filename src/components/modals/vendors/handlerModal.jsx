import React, { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import MapImage from "../../../assets/img/map.png";
import { Icon, ICON_NAMES } from "../../icons";
import vendorService from "../../../services/vendorService";

const AddHandlerModal = ({ isOpen, onClose, onSubmit, vendorId, handler }) => {
  const [locationDetails, setLocationDetails] = useState({
    vendorId: vendorId,
    plantName: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  const [handlers, setHandlers] = useState([]);
  const [currentHandler, setCurrentHandler] = useState({
    name: "",
    phone: "",
    email: "",
    designation: "",
  });

  const [errors, setErrors] = useState({});

  const isEditMode = !!handler;

  const handleLocationChange = (field, value) => {
    setLocationDetails((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleHandlerChange = (field, value) => {
    setCurrentHandler((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateLocation = () => {
    const newErrors = {};

    if (!locationDetails.plantName.trim()) {
      newErrors.plantName = "Please fill the field";
    }
    if (!locationDetails.address.trim()) {
      newErrors.address = "Please fill the field";
    }
    if (!locationDetails.productName.trim()) {
      newErrors.productName = "Please fill the field";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateHandler = () => {
    const newErrors = {};

    if (!currentHandler.name.trim()) {
      newErrors.handlerName = "Please fill the field";
    }
    if (!currentHandler.phone.trim()) {
      newErrors.handlerPhone = "Please fill the field";
    }
    if (!currentHandler.email.trim()) {
      newErrors.handlerEmail = "Please fill the field";
    }
    if (!currentHandler.designation.trim()) {
      newErrors.handlerDesignation = "Please fill the field";
    }

    // Email validation
    if (currentHandler.email && !/\S+@\S+\.\S+/.test(currentHandler.email)) {
      newErrors.handlerEmail = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (
      currentHandler.phone &&
      !/^\d{10}$/.test(currentHandler.phone.replace(/\s+/g, ""))
    ) {
      newErrors.handlerPhone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSaveHandler = () => {
    if (!validateHandler()) {
      return;
    }

    const newHandler = {
      id: Date.now(),
      ...currentHandler,
      status: "Active",
    };

    setHandlers((prev) => [...prev, newHandler]);
    setCurrentHandler({
      name: "",
      phone: "",
      email: "",
      designation: "",
    });

    // Clear handler validation errors
    setErrors((prev) => ({
      ...prev,
      handlerName: "",
      handlerPhone: "",
      handlerEmail: "",
      handlerDesignation: "",
    }));
  };

  const handleRemoveHandler = (handlerId) => {
    setHandlers((prev) => prev.filter((h) => h.id !== handlerId));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateLocation()) {
      return;
    }

    if (handlers.length === 0) {
      setErrors({ general: "Please add at least one handler" });
      return;
    }

    if (isEditMode) {
      const submissionData = {
        vendorId,
        locationDetails,
        handlers,
      };

      onSubmit(submissionData);
    } else {
      const submissionData = {
        vendorId,
        locationDetails,
        handlers,
      };

      onSubmit(submissionData);
    }
    handleClose();
  };

  const handleClose = () => {
    setLocationDetails({
      plantName: "",
      address: "",
      productName: "",
    });
    setHandlers([]);
    setCurrentHandler({
      name: "",
      phone: "",
      email: "",
      designation: "",
    });
    setErrors({});
    onClose();
  };

  /// get handler data by vendor Id
  useEffect(() => {
    if (isEditMode && handler) {
      setLocationDetails({
        plantName: handler.plantName || "",
        address: handler.address || "",
        latitude: handler.latitude || "",
        longitude: handler.longitude || "",
        productName: handler.productName || "",
      });
      setHandlers(handler.handlers || []);
    } else {
      setLocationDetails({
        plantName: "",
        address: "",
        latitude: "",
        longitude: "",
        productName: "",
      });
      setHandlers([]);
    }
  }, [isEditMode, handler]);

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
          Add Location and handlers
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? "Edit location and handlers under this vendor"
            : "Add location and handlers under this vendor"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Location Details Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Location Details
          </h4>

          {/* Plant Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plant name
            </label>
            <Input
              type="text"
              placeholder="Enter full name"
              value={locationDetails.plantName}
              onChange={(e) =>
                handleLocationChange("plantName", e.target.value)
              }
              error={errors.plantName}
              className="w-full"
            />
          </div>

          {/* Address */}
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
                type="text"
                placeholder="Enter latitude"
                value={locationDetails.latitude}
                onChange={(e) =>
                  handleLocationChange("latitude", e.target.value)
                }
                error={errors.latitude}
                className="w-full"
              />
              <Input
                type="text"
                placeholder="Enter longitude"
                value={locationDetails.longitude}
                onChange={(e) =>
                  handleLocationChange("longitude", e.target.value)
                }
                error={errors.longitude}
                className="w-full"
              />
            </div>
            <textarea
              placeholder="Enter full address"
              value={locationDetails.address}
              onChange={(e) => handleLocationChange("address", e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              rows={3}
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">{errors.address}</p>
            )}
          </div>

          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product name
            </label>
            <select
              value={locationDetails.productName}
              onChange={(e) =>
                handleLocationChange("productName", e.target.value)
              }
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.productName ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select product name</option>
              <option value="Cement">Cement</option>
              <option value="Steel">Steel</option>
              <option value="Sand">Sand</option>
              <option value="Gravel">Gravel</option>
              <option value="Concrete">Concrete</option>
            </select>
            {errors.productName && (
              <p className="text-red-500 text-xs mt-1">{errors.productName}</p>
            )}
          </div>
        </div>

        {/* Handler Details Section */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">
            Handler Details
          </h4>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Table Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-700">
                <div className="col-span-3">Handler name</div>
                <div className="col-span-3">Contact no.</div>
                <div className="col-span-4">E-mail</div>
                <div className="col-span-2"></div>
              </div>
            </div>

            {/* Table Body - Existing Handlers */}
            <div className="bg-white">
              {handlers.map((handler, index) => (
                <div
                  key={handler.id}
                  className="px-4 py-3 border-b border-gray-100 last:border-b-0"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-3 text-sm text-gray-900">
                      {handler.name}
                    </div>
                    <div className="col-span-3 text-sm text-gray-900">
                      {handler.phone}
                    </div>
                    <div className="col-span-4 text-sm text-gray-900">
                      {handler.email}
                    </div>
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveHandler(handler.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded"
                        title="Delete handler"
                      >
                        <Icon name={ICON_NAMES.TRASH_2} size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Add New Handler Row */}
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-3">
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={currentHandler.name}
                      onChange={(e) =>
                        handleHandlerChange("name", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.handlerName
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.handlerName && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.handlerName}
                      </p>
                    )}
                  </div>
                  <div className="col-span-3">
                    <input
                      type="tel"
                      placeholder="Enter phone no."
                      value={currentHandler.phone}
                      onChange={(e) =>
                        handleHandlerChange("phone", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.handlerPhone
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.handlerPhone && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.handlerPhone}
                      </p>
                    )}
                  </div>
                  <div className="col-span-4">
                    <input
                      type="email"
                      placeholder="Enter e-mail ID"
                      value={currentHandler.email}
                      onChange={(e) =>
                        handleHandlerChange("email", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.handlerEmail
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    {errors.handlerEmail && (
                      <p className="text-red-500 text-xs mt-1">
                        {errors.handlerEmail}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={handleSaveHandler}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded"
                      title="Add handler"
                    >
                      <Icon name={ICON_NAMES.TRASH_2} size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Add Another Handler Button */}
            <div className="px-4 py-4 bg-white border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  // Add current handler if form is filled
                  if (
                    currentHandler.name ||
                    currentHandler.phone ||
                    currentHandler.email
                  ) {
                    if (validateHandler()) {
                      handleSaveHandler();
                    }
                  }
                  // Reset form for new handler
                  setCurrentHandler({
                    name: "",
                    phone: "",
                    email: "",
                    designation: "",
                  });
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Icon name={ICON_NAMES.PLUS} size={16} className="mr-2" />
                Add Another Handler
              </button>
            </div>
          </div>
        </div>

        {/* General Error */}
        {errors.general && (
          <p className="text-red-500 text-sm">{errors.general}</p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="flex-1">
            {isEditMode ? "Update Vendor" : "Add Vendor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddHandlerModal;
