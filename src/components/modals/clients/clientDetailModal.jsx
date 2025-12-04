import { ICON_NAMES } from "../../icons";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import { useState, useEffect } from "react";
import Input from "../../ui/Input";
import MapPicker from "../../ui/MapPicker";

const ClientDetailModal = ({ isOpen, onClose, vendor, onSubmit }) => {
    const [formData, setFormData] = useState({
        vendorCompanyName: "",
        ownerName: "",
        phone: "",
        email: "",
        address: "",
        gstNumber: "",
        panNumber: "",
    });

    const [errors, setErrors] = useState({});

    // Determine if this is edit mode
    const isEditMode = !!vendor;

    // Populate form when vendor changes (for edit mode)
    useEffect(() => {
        if (vendor && isOpen) {
            setFormData({
                vendorCompanyName: vendor.name || "",
                ownerName: vendor.contactPerson || "",
                phone: vendor.phone || "",
                email: vendor.email || "",
                address: vendor.address || "",
                gstNumber: vendor.gstNumber || "",
                panNumber: vendor.panNumber || "",
            });
        } else if (!isOpen) {
            // Reset form when modal closes
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
    }, [vendor, isOpen]);

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
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
                registeredAddress: formData.address,
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
                registeredAddress: formData.address,
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
            address: "",
            gstNumber: "",
            panNumber: "",
        });
        setErrors({});
        onClose();
    };
    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={isEditMode ? "Edit Client Details" : "Add a new Client Details"}
            size="lg"
            maxWidth="700px"
            headerIcon={ICON_NAMES.EDIT_USER}
        >
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Add a client
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    {isEditMode
                        ? "Update the client’s information"
                        : "Enter the client’s information below to create a profile "}
                </p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="" >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Does Client has a GST no.?
                    </label>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client company name
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter Client's Company Name"
                        // value={formData.vendorCompanyName}
                        // onChange={(e) =>
                        //     handleInputChange("vendorCompanyName", e.target.value)
                        // }
                        // error={errors.vendorCompanyName}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Owner Name
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter Owner's name"
                        // value={formData.vendorCompanyName}
                        // onChange={(e) =>
                        //     handleInputChange("vendorCompanyName", e.target.value)
                        // }
                        // error={errors.vendorCompanyName}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact No.
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter Contact Number"
                        // value={formData.vendorCompanyName}
                        // onChange={(e) =>
                        //     handleInputChange("vendorCompanyName", e.target.value)
                        // }
                        // error={errors.vendorCompanyName}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter email address"
                        // value={formData.vendorCompanyName}
                        // onChange={(e) =>
                        //     handleInputChange("vendorCompanyName", e.target.value)
                        // }
                        // error={errors.vendorCompanyName}
                        className="w-full"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                    </label>
                    <MapPicker />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Aadhar Card No.
                    </label>
                    <Input
                        type="text"
                        placeholder="Enter aadhar card no."
                        // value={formData.vendorCompanyName}
                        // onChange={(e) =>
                        //     handleInputChange("vendorCompanyName", e.target.value)
                        // }
                        // error={errors.vendorCompanyName}
                        className="w-full"
                    />
                </div>
                <div className="flex mt-2 gap-2" >
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            GST No.
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter GST No."
                            // value={formData.vendorCompanyName}
                            // onChange={(e) =>
                            //     handleInputChange("vendorCompanyName", e.target.value)
                            // }
                            // error={errors.vendorCompanyName}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            PAN No.
                        </label>
                        <Input
                            type="text"
                            placeholder="Enter PAN No."
                            // value={formData.vendorCompanyName}
                            // onChange={(e) =>
                            //     handleInputChange("vendorCompanyName", e.target.value)
                            // }
                            // error={errors.vendorCompanyName}
                            className="w-full"
                        />
                    </div>
                </div>

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
    )
}
export default ClientDetailModal;