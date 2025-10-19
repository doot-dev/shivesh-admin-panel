import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ICON_NAMES } from "../../icons";
const VendorModal = ({ isOpen, onClose, vendor, onSubmit }) => {
  const [formData, setFormData] = useState({
    vendorCompanyName: "",
    ownerName: "",
    phone: "",
    email: "",
    registeredAddress: "",
    gstNumber: "",
    panNumber: "",
  });

  const [errors, setErrors] = useState({});

  // Determine if this is edit mode
  const isEditMode = !!vendor;

  // Populate form when vendor changes (for edit mode)
  useEffect(() => {
    if (vendor) {
      setFormData({
        vendorCompanyName: vendor.name,
        ownerName: vendor.contactPerson,
        phone: vendor.phone,
        email: vendor.email,
        address: vendor.address,
        gstNumber: vendor.gstNumber,
        panNumber: vendor.panNumber,
      });
    } else {
      // Reset form for add mode
      setFormData({
        vendorCompanyName: "",
        ownerName: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        panNumber: "",
      });
    }
  }, [vendor]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validations
    if (!formData.vendorCompanyName.trim()) {
      newErrors.vendorCompanyName = "Please fill the field";
    }
    if (!formData.ownerName.trim()) {
      newErrors.ownerName = "Please fill the field";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please fill the field";
    }
    
    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (
      formData.phone &&
      !/^\d{10}$/.test(formData.phone.replace(/\s+/g, ""))
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isEditMode) {
      // Edit mode - update existing vendor
      const updatedVendor = {
        ...vendor,
        ...formData,
        name: formData.vendorCompanyName,
        contactPerson: formData.ownerName,
      };
      onSubmit(updatedVendor, "edit");
    } else {
      // Add mode - create new vendor
      const newVendor = {
        ...formData,
        id: Date.now(),
        sNo: String(Date.now()).slice(-2),
        name: formData.vendorCompanyName,
        contactPerson: formData.ownerName,
        designation: "Owner", // Default designation
        status: "Active", // Default status
      };
      onSubmit(newVendor, "add");
    }

    handleClose();
  };

  const handleClose = () => {
    setFormData({
      vendorCompanyName: "",
      ownerName: "",
      phone: "",
      email: "",
      registeredAddress: "",
      gstNo: "",
      panNo: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit vendor" : "Add new vendor"}
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.EDIT_USER}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Vendor details
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? "Update the details below to edit the vendor"
            : "Fill in the details below to add a new vendor"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vendor Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vendor company name
          </label>
          <Input
            type="text"
            placeholder="Enter full name"
            value={formData.vendorCompanyName}
            onChange={(e) =>
              handleInputChange("vendorCompanyName", e.target.value)
            }
            error={errors.vendorCompanyName}
            className="w-full"
          />
        </div>

        {/* Owner's Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner's name
          </label>
          <Input
            type="text"
            placeholder="Enter owner name"
            value={formData.ownerName}
            onChange={(e) => handleInputChange("ownerName", e.target.value)}
            error={errors.ownerName}
            className="w-full"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
          <Input
            type="tel"
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            error={errors.phone}
            className="w-full"
          />
        </div>

        {/* E-mail */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            E-mail
          </label>
          <Input
            type="email"
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
            className="w-full"
          />
        </div>

        {/* Registered Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registered address
          </label>
          <textarea
            placeholder="Enter registered address"
            value={formData.registeredAddress}
            onChange={(e) =>
              handleInputChange("registeredAddress", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.registeredAddress ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
          />
          {errors.registeredAddress && (
            <p className="text-red-500 text-xs mt-1">
              {errors.registeredAddress}
            </p>
          )}
        </div>

        {/* GST No. */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            GST no.
          </label>
          <Input
            type="text"
            placeholder="Enter GST No."
            value={formData.gstNumber}
            onChange={(e) => handleInputChange("gstNumber", e.target.value)}
            error={errors.gstNumber}
            className="w-full"
          />
        </div>

        {/* PAN No. */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            PAN no.
          </label>
          <Input
            type="text"
            placeholder="Enter PAN No."
            value={formData.panNumber}
            onChange={(e) => handleInputChange("panNumber", e.target.value)}
            error={errors.panNumber}
            className="w-full"
          />

        </div>

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
            {isEditMode ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default VendorModal;
