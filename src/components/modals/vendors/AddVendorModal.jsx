import React, { useState } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { Icon, ICON_NAMES } from "../../icons";

const AddVendorModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    vendorCompanyName: "",
    ownerName: "",
    phone: "",
    email: "",
    registeredAddress: "",
    gstNo: "",
    panNo: "",
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
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
    if (!formData.phone.trim()) {
      newErrors.phone = "Please fill the field";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Please fill the field";
    }
    if (!formData.registeredAddress.trim()) {
      newErrors.registeredAddress = "Please fill the field";
    }
    // if (!formData.gstNo.trim()) {
    //   newErrors.gstNo = "Please fill the field";
    // }
    // if (!formData.panNo.trim()) {
    //   newErrors.panNo = "Please fill the field";
    // }

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (basic)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s+/g, ""))) {
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

    // Create vendor object with additional fields
    const newVendor = {
      ...formData,
      id: Date.now(),
      sNo: String(Date.now()).slice(-2),
      name: formData.vendorCompanyName,
      contactPerson: formData.ownerName,
      designation: "Owner", // Default designation
      status: "Active", // Default status
    };

    onSubmit(newVendor);
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
    <Modal isOpen={isOpen} onClose={handleClose} title="Add new vendor">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Vendor details</h3>
        <p className="text-sm text-gray-500 mb-6">Fill in the details below to add a new vendor</p>
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
            onChange={(e) => handleInputChange("vendorCompanyName", e.target.value)}
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
            placeholder="Enter ID"
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
            placeholder="Enter full name"
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
            placeholder="Enter ID"
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
            placeholder="Enter full name"
            value={formData.registeredAddress}
            onChange={(e) => handleInputChange("registeredAddress", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              errors.registeredAddress ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
          />
          {errors.registeredAddress && (
            <p className="text-red-500 text-xs mt-1">{errors.registeredAddress}</p>
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
            value={formData.gstNo}
            onChange={(e) => handleInputChange("gstNo", e.target.value)}
            error={errors.gstNo}
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
            value={formData.panNo}
            onChange={(e) => handleInputChange("panNo", e.target.value)}
            error={errors.panNo}
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
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
          >
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddVendorModal;