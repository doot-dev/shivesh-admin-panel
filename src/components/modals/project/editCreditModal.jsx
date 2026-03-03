import { useEffect, useState } from "react";
import Modal from "../../ui/Modal";
import Button from "../../ui/Button";
import Input from "../../ui/Input";
import { ICON_NAMES } from "../../icons";

function EditCreditModal({ isOpen, onClose, onSubmit, project, loading }) {
    const [form, setForm] = useState({
        creditAmount: "",
        creditResetPeriod: "",
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (!isOpen) return;

        setForm({
            creditAmount:
                project?.creditAmount !== undefined && project?.creditAmount !== null
                    ? String(project.creditAmount)
                    : "",
            creditResetPeriod:
                project?.creditResetPeriodDays !== undefined &&
                    project?.creditResetPeriodDays !== null
                    ? String(project.creditResetPeriodDays)
                    : "",
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
        if (!form.creditAmount || Number(form.creditAmount) <= 0) {
            nextErrors.creditAmount = "Enter a valid amount";
        }
        if (!form.creditResetPeriod || Number(form.creditResetPeriod) <= 0) {
            nextErrors.creditResetPeriod = "Enter a valid reset period";
        }

        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }

        const payload = {
            creditAmount
                : Number(form.creditAmount),
            creditResetPeriodDays: Number(form.creditResetPeriod),
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
            title="Edit credit details"
            size="md"
            maxWidth="520px"
            headerIcon={ICON_NAMES.PROJECT}
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    type="number"
                    label="Amount"
                    placeholder="Enter amount"
                    value={form.creditAmount}
                    onChange={(e) => handleChange("creditAmount", e.target.value)}
                    error={errors.creditAmount}
                    min="0"
                />

                <Input
                    type="number"
                    label="Reset period (in days)"
                    placeholder="Enter reset period"
                    value={form.creditResetPeriod}
                    onChange={(e) => handleChange("creditResetPeriod", e.target.value)}
                    error={errors.creditResetPeriod}
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

export default EditCreditModal;
