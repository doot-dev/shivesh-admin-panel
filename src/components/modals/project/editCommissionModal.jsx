import { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { ICON_NAMES } from "../../icons";

function EditCommissionModal({ isOpen, onClose, onSubmit, project, loading }) {
    const [form, setForm] = useState({
        commissionPerson: "",
        commissionAmount: "",
        commissionPhoneNumber: null,
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            commissionPerson: project?.commissionPersonName
 || "",
            commissionAmount:
                project?.commissionAmountPerM3
 !== undefined && project?.commissionAmountPerM3 !== null
                    ? String(project.commissionAmountPerM3)
                    : "",
            commissionPhoneNumber: project?.commissionPersonMobile || null,

        });
        setErrors({});
    }, [isOpen, project]);

    const handleChange = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const nextErrors = {};
        if (!form.commissionPerson?.trim()) {
            nextErrors.commissionPerson = "Person name is required";
        }
        if (!form.commissionAmount || Number(form.commissionAmount) <= 0) {
            nextErrors.commissionAmount = "Enter a valid amount";
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        const payload = {
            commissionPersonName
                : form.commissionPerson.trim(),
            commissionAmountPerM3: Number(form.commissionAmount),
            commissionPersonMobile: form.commissionPhoneNumber || null,
        };

        onSubmit?.(payload);
    };

    const handleClose = () => {
        setErrors({});
        onClose?.();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Edit commission details"
            size="md"
            maxWidth="520px"
            headerIcon={ICON_NAMES.PROJECT}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="text"
                    label="Person name"
                    placeholder="Enter person name"
                    value={form.commissionPerson}
                    onChange={(e) => handleChange("commissionPerson", e.target.value)}
                    error={errors.commissionPerson}
                />

                <Input
                    type="number"
                    label="Amount per m3"
                    placeholder="Enter amount"
                    value={form.commissionAmount}
                    onChange={(e) => handleChange("commissionAmount", e.target.value)}
                    error={errors.commissionAmount}
                    min="0"
                />
                <Input
                    type="number"
                    label="Commission Person Phone Number"
                    placeholder="Enter phone number"
                    value={form.commissionPhoneNumber || ""}
                    onChange={(e) => handleChange("commissionPhoneNumber", e.target.value)}
                    error={errors.commissionPhoneNumber}
                    min="0"
                />


                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="flex-1"
                        variant="primary"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save changes"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default EditCommissionModal;
