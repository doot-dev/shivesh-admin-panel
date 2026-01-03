import { ICON_NAMES } from "../../icons";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { useState, useEffect } from "react";
import Input from "../../ui/Input";
import { useDispatch } from "react-redux";
import { updateClient } from "../../../features/clients/clientsSlice";

const ClientDetailModal = ({ isOpen, onClose, vendor, onSubmit }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    vendorCompanyName: "",
    ownerName: "",
    phone: "",
    email: "",
    address: "",
    hasGST: false,
    ownerAadhaar: "",
    ownerPan: "",
    gstNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const clientIdentifier = vendor?._id || vendor?.id || vendor?.clientId;

  const populateForm = (clientData) => {
    if (!clientData) {
      return;
    }
    setFormData({
      vendorCompanyName: clientData.companyName || clientData.name || "",
      ownerName: clientData.ownerName || clientData.contactPerson || "",
      phone: clientData.contactNumber || clientData.phone || "",
      email: clientData.email || "",
      address: clientData.address || clientData.registeredAddress || "",
      hasGST: !!clientData.hasGST,
      ownerAadhaar: clientData.ownerAadhaar || "",
      ownerPan: clientData.ownerPan || "",
      gstNumber: clientData.gstNumber || "",
    });
  };

  // Determine if this is edit mode
  const isEditMode = !!vendor;

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        vendorCompanyName: "",
        ownerName: "",
        phone: "",
        email: "",
        address: "",
        hasGST: false,
        ownerAadhaar: "",
        ownerPan: "",
        gstNumber: "",
      });
    }
  }, [isOpen]);

  // Populate form with provided vendor data whenever it changes
  useEffect(() => {
    if (isOpen && vendor) {
      populateForm(vendor);
    }
  }, [isOpen, vendor]);

  // No additional effect: parent passes the latest client snapshot when editing

  const handleInputChange = (field, value) => {
      let updatedValue = value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "phone") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [field]: updatedValue }));

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    const requiredFields = [
      "vendorCompanyName",
      "ownerName",
      "phone",
      "email",
      "address",
      "ownerAadhaar",
      "ownerPan",
    ];

    // Required field validation
    requiredFields.forEach((field) => {
      if (!formData[field]?.trim()) {
        newErrors[field] = "Please fill the field";
      }
    });

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (
      formData.phone &&
      !/^\d{10}$/.test(formData.phone.replace(/\s+/g, ""))
    ) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    // GST validation
    if (formData.hasGST && !formData.gstNumber?.trim()) {
      newErrors.gstNumber = "Please fill the field";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode) {
        if (!clientIdentifier) {
          console.warn("Client identifier missing for update");
          return;
        }

        const updatePayload = {
          ...formData,
          _id: clientIdentifier,
          id: clientIdentifier,
          name: formData.vendorCompanyName,
          companyName: formData.vendorCompanyName,
          contactPerson: formData.ownerName,
          ownerName: formData.ownerName,
          contactNumber: formData.phone,
          registeredAddress: formData.address,
          address: formData.address,
        };
        console.log("Updating client with data", updatePayload);
        const resultAction = dispatch(updateClient(updatePayload));
        console.log("Update resultAction", resultAction);
        handleClose();
        if (updateClient.fulfilled.match(resultAction)) {
          onSubmit?.(
            resultAction.payload?.data ?? resultAction.payload,
            "edit"
          );
          handleClose();
        }
      } else {
        if (!onSubmit) {
          console.warn("onSubmit handler missing for add client flow");
          handleClose();
          return;
        }

        const submitPayload = {
          ...formData,
          id: Date.now(),
          sNo: String(Date.now()).slice(-2),
          name: formData.vendorCompanyName,
          contactPerson: formData.ownerName,
          registeredAddress: formData.address,
          designation: "Owner",
          status: "Active",
        };

        const submitResult = await onSubmit(submitPayload, "add");
        if (submitResult?.success === false) {
          return;
        }

        handleClose();
      }
    } catch (error) {
      console.error("Error submitting client details", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      vendorCompanyName: "",
      ownerName: "",
      phone: "",
      email: "",
      address: "",
      hasGST: false,
      ownerAadhaar: "",
      ownerPan: "",
      gstNumber: "",
    });
    setErrors({});
    onClose();
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditMode ? "Edit Client Details" : "Add a new Client Details"}
      size="lg"
      maxWidth="700px"
      headerIcon={ICON_NAMES.EDIT_USER}
    >
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">Add a client</h3>
        <p className="text-sm text-gray-500 mb-6">
          {isEditMode
            ? "Update the client’s information"
            : "Enter the client’s information below to create a profile "}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <label className="block text-sm font-medium text-gray-700">
            Does client have a GST No? <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleInputChange("hasGST", !formData.hasGST)}
              className={`relative flex h-7 w-14 items-center rounded-full border transition-colors ${
                formData.hasGST
                  ? "border-primary bg-primary"
                  : "border-gray-300 bg-gray-200"
              }`}
              aria-pressed={formData.hasGST}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  formData.hasGST ? "translate-x-7" : "translate-x-1"
                }`}
              />
              <span className="sr-only">Toggle GST availability</span>
            </button>
            <span className="text-sm font-medium text-gray-700">
              {formData.hasGST ? "Yes" : "No"}
            </span>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client company name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="Enter Client's Company Name"
            value={formData.vendorCompanyName}
            onChange={(e) =>
              handleInputChange("vendorCompanyName", e.target.value)
            }
            error={!!errors.vendorCompanyName}
            errorMessage={errors.vendorCompanyName}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="Enter Owner's name"
            value={formData.ownerName}
            onChange={(e) => handleInputChange("ownerName", e.target.value)}
            error={!!errors.ownerName}
            errorMessage={errors.ownerName}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Contact No. <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="Enter Contact Number"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            error={!!errors.phone}
            errorMessage={errors.phone}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="Enter email address"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={!!errors.email}
            errorMessage={errors.email}
            className="w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder="Enter address"
            value={formData.address}
            onChange={(e) => handleInputChange("address", e.target.value)}
            rows={3}
            className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2
    ${
      errors.address
        ? "border-red-500 focus:ring-red-500 focus:border-red-500"
        : "border-border focus:ring-primary hover:border-opacity-75"
    }
  `}
          />

          {errors.address && (
            <p className="mt-1 text-sm text-red-500">{errors.address}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner Aadhar Card No. <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            required
            placeholder="Enter aadhar card no."
            value={formData.ownerAadhaar}
            onChange={(e) => handleInputChange("ownerAadhaar", e.target.value)}
            error={!!errors.ownerAadhaar}
            errorMessage={errors.ownerAadhaar}
            className="w-full"
          />
        </div>
        <div className="flex mt-2 gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Owner PAN No. <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="Enter owner PAN No."
              value={formData.ownerPan}
              onChange={(e) => handleInputChange("ownerPan", e.target.value)}
              error={!!errors.ownerPan}
              errorMessage={errors.ownerPan}
              className="w-full"
            />
          </div>
        </div>

        {formData.hasGST && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GST No. <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              required
              placeholder="Enter GST No."
              value={formData.gstNumber}
              onChange={(e) => handleInputChange("gstNumber", e.target.value)}
              error={!!errors.gstNumber}
              errorMessage={errors.gstNumber}
              className="w-full"
            />
          </div>
        )}

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
            disabled={submitting}
          >
            {submitting ? "Submitting..." : isEditMode ? "Update" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
export default ClientDetailModal;
