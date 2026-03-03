import { useMemo, useState, useEffect } from "react";
import Table from "../../ui/Table";
import Button from "../../ui/Button";
import Dropdown from "../../ui/Dropdown";
import { useDispatch, useSelector } from "react-redux";
import { fetchVendors } from "../../../features/vendors/vendorSlice";

function ProjectVendorModal({
    isOpen,
    onClose,
    product,
    onAddVendor,
}) {
    const dispatch = useDispatch();

    /* ---------------- Redux ---------------- */

    const { list: vendorMasterList, loading } =
        useSelector((state) => state.vendor);

    /* ---------------- Local State ---------------- */

    const [isAddingVendor, setIsAddingVendor] =
        useState(false);

    const [form, setForm] = useState({
        vendorId: "",
        customPrice: "",
        priority: "Medium",
    });
    /* ---------------- Fetch Vendors ---------------- */

    useEffect(() => {
        if (isOpen) {
            dispatch(fetchVendors());
        }
    }, [isOpen, dispatch]);

    const isValid =
        form.vendorId &&
        form.customPrice &&
        Number(form.customPrice) > 0;
    /* ---------------- Derived ---------------- */

    const existingVendorIds =
        product?.vendors?.map((v) => v.vendorId) || [];

    //   const vendorOptions = useMemo(() => {
    //     return vendorMasterList
    //       .filter((v) => !existingVendorIds.includes(v.id))
    //       .map((v) => ({
    //         value: v.id,
    //         label: v.companyName,
    //         customPrice: v.customPrice || 0,
    //       }));
    //   }, [vendorMasterList, existingVendorIds]);
    const vendorOptions = vendorMasterList.map((v) => ({
        value: v.id,
        label: v.companyName,
    }));
    const selectedVendor = vendorOptions.find(
        (v) => v.value === form.vendorId
    );

    /* ---------------- Early Return AFTER Hooks ---------------- */

    if (!isOpen || !product) return null;

    const existingVendors = product.vendors || [];

    /* ---------------- Submit ---------------- */

    const handleSubmit = () => {
        if (!form.vendorId || !form.customPrice) return;

        onAddVendor({
            productId: product.id,
            vendorId: form.vendorId,
            customPrice: Number(form.customPrice),
            priority: form.priority,
        });
        console.log("onAddVendor", onAddVendor)
        setIsAddingVendor(false);
        setForm({
            vendorId: "",
            customPrice: "",
            priority: "Medium",
        });
    };

    /* ---------------- Render ---------------- */

    const vendorColumns = [
        { key: "vendorName", header: "Vendor Name" },
        { key: "customPrice", header: "Custom Price" },
        { key: "priority", header: "Priority" },
    ];

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-[700px] max-h-[80vh] overflow-y-auto p-6">
                <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                        Vendors - {product.productName}
                    </h3>
                    <button onClick={onClose}>✕</button>
                </div>

                {/* Vendor Table */}
                <div className="mb-4">
                    <Table
                        data={existingVendors}
                        columns={vendorColumns}
                        showPagination={false}
                    />
                </div>

                {/* Add Vendor Button */}
                {!isAddingVendor && (
                    <div className="text-right">
                        <Button
                            onClick={() => setIsAddingVendor(true)}
                        >
                            Add Vendor
                        </Button>
                    </div>
                )}

                {/* Add Vendor Form */}
                {isAddingVendor && (
                    <form onSubmit={handleSubmit}>
                        <div className="mt-4 border-t pt-4 space-y-4">

                            {/* Vendor Dropdown */}
                            <div>
                                <label className="text-sm font-medium">
                                    Vendor
                                </label>

                                <Dropdown
                                    options={vendorOptions}
                                    value={form.vendorId}
                                    searchable
                                    loading={loading}
                                    onChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            vendorId: value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Custom Price */}
                            <div>
                                <label className="text-sm font-medium">
                                    Custom Price
                                </label>

                                <input
                                    type="number"
                                    placeholder="Enter custom price"
                                    value={form.customPrice}
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            customPrice: e.target.value,
                                        }))
                                    }
                                    className="w-full border rounded px-3 py-2"
                                />
                            </div>

                            {/* Priority */}
                            <div>
                                <label className="text-sm font-medium">
                                    Priority
                                </label>

                                <Dropdown
                                    options={[
                                        { value: "High", label: "High" },
                                        { value: "Medium", label: "Medium" },
                                        { value: "Low", label: "Low" },
                                    ]}
                                    value={form.priority}
                                    onChange={(value) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            priority: value,
                                        }))
                                    }
                                />
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="secondary"
                                    onClick={() => setIsAddingVendor(false)}
                                >
                                    Cancel
                                </Button>

                                <Button>
                                    Submit
                                </Button>
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ProjectVendorModal;