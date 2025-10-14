import React, { useState, useEffect } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ICON_NAMES } from "../../icons";
import { Dropdown } from "../../ui";
const LeadsModal = ({ isOpen, onClose, leads, onSubmit }) => {
  const statusOptions = [
    { value: "open", label: "Open" },
    { value: "closed", label: "Closed" },
  ];
  const reAssigneeLeadOptions = [
    { value: "lead1", label: "Lead 1" },
    { value: "lead2", label: "Lead 2" },
    { value: "lead3", label: "Lead 3" },
  ];
  const sourceOptions = [
    { value: "website", label: "Website" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
  ];

  const [formData, setFormData] = useState({
    leadName: "",
    companyName: "",
    email: "",
    phone: "",
    source: "",
    requirement: "",
    status: "",
    reAssigneeLead: "",
  });
  const [errors, setErrors] = useState({});
  const isEditMode = !!leads;

  useEffect(() => {
    if (leads) {
      setFormData({
        leadName: leads.leadName,
        companyName: leads.companyName,
        email: leads.email,
        phone: leads.phone,
        source: leads.source,
        requirement: leads.requirement,
        status: leads.status,
        reAssigneeLead: leads.reAssigneeLead,
      });
    } else {
      setFormData({
        leadName: "",
        companyName: "",
        email: "",
        phone: "",
        source: "",
        requirement: "",
        status: "",
        reAssigneeLead: "",
      });
    }
  }, [leads]);

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
    if (!formData.leadName.trim()) {
      newErrors.leadName = "Please fill the field";
    }
    if (!formData.companyName.trim()) {
      newErrors.companyName = "Please fill the field";
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
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
      const updatedLead = {
        ...leads,
        ...formData,
        leadName: formData.leadName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        requirement: formData.requirement,
        status: formData.status,
        reAssigneeLead: formData.reAssigneeLead,
      };
      onSubmit(updatedLead, "edit");
    } else {
      const newLead = {
        ...formData,
        id: Date.now(),
        sNo: String(Date.now()).slice(-2),
        leadName: formData.leadName,
        companyName: formData.companyName,
        email: formData.email,
        phone: formData.phone,
        source: formData.source,
        requirement: formData.requirement,
        status: formData.status,
        reAssigneeLead: formData.reAssigneeLead,
      };
      onSubmit(newLead, "add");
    }
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      leadName: "",
      companyName: "",
      email: "",
      phone: "",
      source: "",
      requirement: "",
      status: "",
      reAssigneeLead: "",
    });
    setErrors({});
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Lead" : "Add Lead"}
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
            ? "Update the details below to edit the Leads"
            : "Fill in the details below to add a new Leads"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Lead Name
          </label>
          <Input
            type="text"
            placeholder="Enter lead name"
            value={formData.leadName}
            onChange={(e) => handleInputChange("leadName", e.target.value)}
            error={errors.leadName}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Company Name
          </label>
          <Input
            type="text"
            placeholder="Enter company name"
            value={formData.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            className="w-full"
            error={errors.companyName}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="w-full"
              error={errors.email}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <Input
              type="text"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="w-full"
              error={errors.phone}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <Dropdown
            options={sourceOptions}
            value={formData.source}
            onChange={(e) => handleInputChange("source", e.target.value)}
            placeholder="Select Source"
            width="100%"
            height="42px"
            error={!!errors.role}
            backgroundColor="input-bg"
          />
          {errors.source && (
            <p className="text-red-500 text-xs mt-1">{errors.source}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Requirement
          </label>
          <Input
            type="text"
            placeholder="Enter requirement"
            value={formData.requirement}
            onChange={(e) => handleInputChange("requirement", e.target.value)}
            className="w-full"
            error={errors.requirement}
          />
        </div>

        {isEditMode ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <Dropdown
                options={statusOptions}
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                placeholder="Select Status"
                width="100%"
                height="42px"
                error={!!errors.role}
                backgroundColor="input-bg"
              />
              {errors.status && (
                <p className="text-red-500 text-xs mt-1">{errors.status}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Re-Assignee Lead
              </label>
              <Dropdown
                options={reAssigneeLeadOptions}
                value={formData.reAssigneeLead}
                onChange={(e) =>
                  handleInputChange("reAssigneeLead", e.target.value)
                }
                placeholder="Select Re-Assignee Lead"
                width="100%"
                height="42px"
                error={!!errors.role}
                backgroundColor="input-bg"
              />
              {errors.reAssigneeLead && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.reAssigneeLead}
                </p>
              )}
            </div>
          </>
        ) : null}
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
export default LeadsModal;
