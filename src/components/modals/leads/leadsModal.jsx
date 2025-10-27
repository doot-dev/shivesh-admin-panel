import React, { useState, useEffect, useCallback, useMemo } from "react";
import Modal from "../../ui/Modal";
import Input from "../../ui/Input";
import Button from "../../ui/Button";
import { ICON_NAMES } from "../../icons";
import { Dropdown } from "../../ui";
import { getUsers } from "../../../services/userService";
import { useFetch } from "../../../hooks/useFetch";

const INITIAL_FORM = {
  contactPerson: "",
  companyName: "",
  email: "",
  phone: "",
  address: "",
  source: "",
  requirement: "",
  status: "",
  reAssigneeLead: "",
  assignedToId: 0,
};

const LeadsModal = ({ isOpen, onClose, leads, onSubmit }) => {
  const isEditMode = !!leads;
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});

  // --- Static dropdown options
  const statusOptions = useMemo(
    () => [
      { value: "open", label: "Open" },
      { value: "closed", label: "Closed" },
    ],
    []
  );

  const reAssigneeLeadOptions = useMemo(
    () => [
      { value: "lead1", label: "Lead 1" },
      { value: "lead2", label: "Lead 2" },
      { value: "lead3", label: "Lead 3" },
    ],
    []
  );


  const sourceOptions = useMemo(
    () => [
      { value: "REFERRAL", label: "Referral" },
      { value: "WEBSITE", label: "Website" },
      { value: "COLD_CALL", label: "Cold Call" },
      { value: "ADVERTISEMENT", label: "Advertisement" },
      { value: "SOCIAL_MEDIA", label: "Social Media" },
    ],
    []
  );

  // --- Transform users data
  const transformUsersData = useCallback(async () => {
    const response = await getUsers();

    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.users)) return response.users;
    if (response && typeof response === "object") return [response];

    return [];
  }, []);

  const { data: usersData = [], loading } = useFetch(transformUsersData, [], {
    autoFetch: true,
    showToast: true,
  });

  // --- Initialize form for edit mode
  useEffect(() => {
    if (leads) {
      setFormData((prev) => ({ ...prev, ...leads }));
    } else {
      setFormData(INITIAL_FORM);
    }
  }, [leads]);

  // --- Handlers
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.contactPerson.trim()) newErrors.contactPerson = "Please fill the field";
    if (!formData.companyName.trim())
      newErrors.companyName = "Please fill the field";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Please enter a valid email address";
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\s+/g, "")))
      newErrors.phone = "Please enter a valid 10-digit phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const leadData = {
      ...formData,
      // id: isEditMode ? leads.id : Date.now(),
      // sNo: isEditMode ? leads.sNo : String(Date.now()).slice(-2),
    };

    onSubmit(leadData, isEditMode ? "edit" : "add");
    handleClose();
  };

  const handleClose = () => {
    setFormData(INITIAL_FORM);
    setErrors({});
    onClose();
  };

  // --- Reusable Input Field Renderer
  const renderInput = (label, field, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <Input
        type={type}
        placeholder={placeholder}
        value={formData[field]}
        onChange={(e) => handleInputChange(field, e.target.value)}
        className="w-full"
        error={errors[field]}
      />
    </div>
  );

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
          Vendor Details
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? "Update the details below to edit the lead."
            : "Fill in the details below to add a new lead."}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderInput("Lead Name", "contactPerson", "text", "Enter lead name")}
        {renderInput("Company Name", "companyName", "text", "Enter company name")}

        <div className="grid grid-cols-2 gap-4">
          {renderInput("Email", "email", "email", "Enter email")}
          {renderInput("Phone", "phone", "text", "Enter phone number")}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            placeholder="Enter  address"
            value={formData.address}
            onChange={(e) =>
              handleInputChange("address", e.target.value)
            }
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.address ? "border-red-500" : "border-gray-300"
              }`}
            rows={3}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address}
            </p>
          )}
        </div>

        {/* Source */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.source}
            onChange={(e) => handleInputChange("source", e.target.value)}
          >
            <option value="">Select Source</option>
            {loading ? (
              <option>Loading...</option>
            ) : (
              sourceOptions?.map((source, i) => (
                <option key={i} value={source.value}>
                  {source.label}
                </option>
              ))
            )}
          </select>
          {errors.source && (
            <p className="text-red-500 text-xs mt-1">{errors.source}</p>
          )}
        </div>

        {renderInput("Requirement", "requirement", "text", "Enter requirement")}

        {/* Assigned To */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Assigned To</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.assignedToId}
            onChange={(e) =>
              handleInputChange("assignedToId", e.target.value ? Number(e.target.value) : "")
            }
          >
            <option value="">Select user</option>
            {loading ? (
              <option>Loading...</option>
            ) : (
              usersData?.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))
            )}
          </select>

        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            className="w-full border border-gray-300 rounded-md p-2"
            value={formData.status}
            onChange={(e) => handleInputChange("status", e.target.value)}
          >

            <option value="">Select Status</option>
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">IN Progress</option>
            <option value="CONVERTED">Converted</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        {isEditMode && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <Dropdown
                options={statusOptions}
                value={formData.status}
                onChange={(e) => handleInputChange("status", e.target.value)}
                placeholder="Select Status"
                width="100%"
                height="42px"
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
                backgroundColor="input-bg"
              />
              {errors.reAssigneeLead && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.reAssigneeLead}
                </p>
              )}
            </div>
          </>
        )}

        {/* Buttons */}
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
