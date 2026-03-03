import { useMemo, useState, useEffect, useCallback } from "react";
import Table from "../../ui/Table";
import Button from "../../ui/Button";
import Dropdown from "../../ui/Dropdown";
import Input from "../../ui/Input";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors } from "../../../features/vendors/vendorSlice";
import {
    createProjectProductVendor,
    deleteProjectProductVendor,
    fetchProjectProductVendors,
    updateProjectProductVendor,
    clearVendorState,
} from "../../../features/projects/projectProductVendorSlice";

const initialFormState = {
    vendorId: "",
    customPrice: "",
    priority: "MEDIUM",
};

function ProjectVendorModal({ isOpen, onClose, product, projectId }) {
    const dispatch = useDispatch();

    const { list: vendorMasterList, loading: vendorMasterLoading } = useSelector(
        (state) => state.vendor
    );

    const {
        list: vendorAssignments = [],
        loading,
        createLoading,
        updateLoading,
        deleteLoading,
        error,
    } = useSelector((state) => state.projectProductVendor);

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState({});
    const [editingVendor, setEditingVendor] = useState(null);
    const [submitError, setSubmitError] = useState("");

    const projectProductId = product?.id;
    const saving = editingVendor ? updateLoading : createLoading;

    const resetFormState = useCallback(() => {
        setShowForm(false);
        setForm(initialFormState);
        setFormErrors({});
        setEditingVendor(null);
        setSubmitError("");
    }, []);

    useEffect(() => {
        if (!isOpen) return;
        dispatch(fetchVendors());
    }, [dispatch, isOpen]);

    useEffect(() => {
        if (!isOpen || !projectProductId || !projectId) return;
        dispatch(
            fetchProjectProductVendors({
                projectId,
                productId: projectProductId,
            })
        );
    }, [dispatch, isOpen, projectId, projectProductId]);

    useEffect(() => {
        if (!isOpen) return;
        resetFormState();
    }, [projectProductId, isOpen, resetFormState]);

    useEffect(() => {
        if (isOpen) return;
        dispatch(clearVendorState());
        resetFormState();
    }, [isOpen, dispatch, resetFormState]);

    const handleClose = () => {
        resetFormState();
        onClose?.();
    };

    const validateForm = () => {
        const nextErrors = {};

        if (!form.vendorId) {
            nextErrors.vendorId = "Vendor is required";
        }

        if (!form.customPrice || Number(form.customPrice) <= 0) {
            nextErrors.customPrice = "Enter a valid price";
        }

        setFormErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const existingVendorIds = useMemo(
        () =>
            vendorAssignments
                .map((vendor) =>
                    vendor?.vendorId !== undefined && vendor?.vendorId !== null
                        ? vendor.vendorId.toString()
                        : ""
                )
                .filter(Boolean),
        [vendorAssignments]
    );

    const vendorOptions = useMemo(
        () =>
            vendorMasterList
                .filter((vendor) => vendor.id !== undefined && vendor.id !== null)
                .map((vendor) => ({
                    value: vendor.id.toString(),
                    label: vendor.companyName,
                })),
        [vendorMasterList],
    );

    const vendorRows = useMemo(
        () =>
            vendorAssignments.map((vendor, index) => ({
                ...vendor,
                sNo: (index + 1).toString().padStart(2, "0"),
                vendorName:
                    vendor.vendorName ||
                    vendor.companyName ||
                    vendor.vendor?.companyName ||
                    "-",
                customPrice:
                    vendor.customPrice !== undefined && vendor.customPrice !== null
                        ? vendor.customPrice
                        : "-",
                priority: vendor.priority || "N/A",
            })),
        [vendorAssignments]
    );

    const priorityOptions = [
        { value: "HIGH", label: "High" },
        { value: "MEDIUM", label: "Medium" },
        { value: "LOW", label: "Low" },
    ];

    const handleStartAdd = () => {
        resetFormState();
        setShowForm(true);
    };

    const handleEditVendor = (vendor) => {
        console.log("Editing vendor:", vendor);
        resetFormState();
        setShowForm(true);
        setEditingVendor(vendor);
        setForm({
            vendorId:
                vendor.vendorId?.toString() ||
                vendor.vendor?.id?.toString() ||
                "",
            customPrice:
                vendor.customPrice !== undefined && vendor.customPrice !== null
                    ? vendor.customPrice.toString()
                    : "",
            priority: vendor.priority?.toUpperCase() || "MEDIUM",
        });
        console.log("Form state after setting for edit:", form);
    };

    const handleDeleteVendor = async (vendor) => {
        if (!projectProductId || !projectId || deleteLoading) return;
        const vendorId = vendor.vendorId ?? vendor.vendor?.id ?? vendor.id;
        if (!vendorId) return;

        const confirmed = window.confirm(
            `Remove ${vendor.vendorName || "this vendor"} from the project?`
        );

        if (!confirmed) return;

        const payload = {
            projectId,
            productId: projectProductId,
            vendorId: vendor.productVendorId,
        };

        if (vendor.productVendorId) {
            payload.productVendorId = vendor.productVendorId;
        }

        try {
            await dispatch(deleteProjectProductVendor(payload)).unwrap();
            dispatch(
                fetchProjectProductVendors({
                    projectId,
                    productId: projectProductId,
                })
            );
        } catch (err) {
            console.error("Failed to delete vendor", err);
        }
    };

    const handleFormChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
        if (formErrors[field]) {
            setFormErrors((prev) => ({
                ...prev,
                [field]: "",
            }));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm() || !projectProductId || !projectId) return;

        const payload = {
            projectId,
            productId: projectProductId,
            vendorId: Number(
                editingVendor
                    ? editingVendor.vendor?.id ?? editingVendor.vendorId ?? editingVendor.id
                    : form.vendorId,
            ),
            customPrice: Number(form.customPrice),
            priority: form.priority,
        };

        if (editingVendor?.productVendorId) {
            payload.productVendorId = editingVendor.productVendorId;
        }

        setSubmitError("");

        try {
            if (editingVendor) {
                console.log("Updating vendor:", payload);
                await dispatch(updateProjectProductVendor(payload)).unwrap();
            } else {
                await dispatch(createProjectProductVendor(payload)).unwrap();
            }

            resetFormState();
        } catch (err) {
            setSubmitError(err?.message || "Failed to save vendor");
        }
    };

    const vendorColumns = [
        { key: "sNo", header: "S.No" },
        { key: "vendorName", header: "Vendor Name" },
        { key: "customPrice", header: "Custom Price" },
        { key: "priority", header: "Priority" },
    ];

    const tableActions = [
        {
            text: "Edit",
            onClick: handleEditVendor,
            textColor: "var(--color-primary)",
        },
        {
            text: deleteLoading ? "Deleting..." : "Delete",
            onClick: handleDeleteVendor,
            textColor: "var(--color-error)",
            className: deleteLoading ? "pointer-events-none opacity-70" : "",
        },
    ];

    if (!isOpen || !product) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[760px] max-h-[90vh] flex flex-col overflow-hidden">

                {/* ── Header ── */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            Vendors
                            <span className="ml-2 text-base font-normal text-gray-400">·</span>
                            <span className="ml-2 text-base font-semibold text-[var(--color-primary)]">
                                {product.productName}
                            </span>
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            Manage vendors mapped to this project product
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="ml-4 mt-0.5 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-lg leading-none"
                    >
                        ✕
                    </button>
                </div>

                {/* ── Scrollable body ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                    {/* Vendor Table */}
                    <Table
                        data={vendorRows}
                        columns={vendorColumns}
                        actions={tableActions}
                        showPagination={false}
                        loading={loading}
                        emptyMessage="No vendors added yet"
                    />

                    {/* Add button row */}
                    {!showForm && (
                        <div className="flex justify-end">
                            <Button
                                onClick={handleStartAdd}
                                variant="primary"
                                disabled={!projectProductId || !projectId}
                            >
                                + Add Vendor
                            </Button>
                        </div>
                    )}

                    {/* ── Add / Edit Form ── */}
                    {showForm && (
                        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                            {/* Form header bar */}
                            <div className="flex items-center justify-between px-5 py-3 bg-border text-white">
                                <span className="text-sm font-semibold tracking-wide">
                                    {editingVendor ? "Edit Vendor Assignment" : "Add New Vendor"}
                                </span>
                                <button
                                    type="button"
                                    onClick={resetFormState}
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-sm"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="px-5 py-5">
                                {/* 2-column grid on sm+ */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* Vendor */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-600  tracking-wide">
                                            Vendor <span className="text-red-400">*</span>
                                        </label>
                                        <Dropdown
                                            options={vendorOptions}
                                            value={form.vendorId}
                                            searchable
                                            loading={vendorMasterLoading}
                                            onChange={(value) => handleFormChange("vendorId", value)}
                                            placeholder="Search & select vendor"
                                            width="100%"
                                            height="40px"
                                        />
                                        {formErrors.vendorId && (
                                            <p className="text-xs text-red-500">{formErrors.vendorId}</p>
                                        )}
                                    </div>

                                    {/* Priority */}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs font-semibold text-gray-600  tracking-wide">
                                            Priority
                                        </label>
                                        <Dropdown
                                            options={priorityOptions}
                                            value={form.priority}
                                            onChange={(value) => handleFormChange("priority", value)}
                                            width="100%"
                                            height="40px"
                                        />
                                    </div>

                                    {/* Custom Price – full width */}
                                    <div className="flex flex-col gap-1 sm:col-span-2">
                                        <Input
                                            type="number"
                                            label="Custom Price"
                                            placeholder="Enter custom price"
                                            value={form.customPrice}
                                            onChange={(e) => handleFormChange("customPrice", e.target.value)}
                                            min="0"
                                        />
                                        {formErrors.customPrice && (
                                            <p className="text-xs text-red-500">{formErrors.customPrice}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Error */}
                                {(submitError || error) && (
                                    <p className="mt-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                                        {submitError || (typeof error === "string" ? error : "")}
                                    </p>
                                )}

                                {/* Actions */}
                                <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 mt-5 pt-4 border-t border-gray-200">
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        onClick={resetFormState}
                                        className="w-full sm:w-auto"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        disabled={saving}
                                        className="w-full sm:w-auto"
                                    >
                                        {saving
                                            ? (editingVendor ? "Updating..." : "Submitting...")
                                            : (editingVendor ? "Update Vendor" : "Add Vendor")}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProjectVendorModal;