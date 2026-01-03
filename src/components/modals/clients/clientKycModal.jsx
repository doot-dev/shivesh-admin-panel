import FileUploadField from "../../clients/FileUploadField";
import { ICON_NAMES } from "../../icons";
import { Modal } from "../../ui";
import { useState } from "react";

const ClientKYCModal = ({ isOpen, onClose, onSubmit, hasGST = false }) => {

    const [aadharFile, setAadharFile] = useState(null);
    const [panFile, setPanFile] = useState(null);
    const [lightBillFile, setLightBillFile] = useState(null);
    const [gstCertificateFile, setGstCertificateFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleFileChange = (setter) => (file) => {
        if (file.size <= 10 * 1024 * 1024) { // 10 MB limit
            setter(file);
        } else {
            alert('File size must be less than 10 MB');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!aadharFile || !panFile || !lightBillFile) {
            alert('Please upload all required documents');
            return;
        }
        if (hasGST && !gstCertificateFile) {
            alert('Please upload the GST certificate');
            return;
        }
        const formData = {
            aadhar: aadharFile,
            pan: panFile,
            lightBill: lightBillFile,
            ...(hasGST && gstCertificateFile
                ? { gstCertificate: gstCertificateFile }
                : {}),
        };
        console.log("Submitting KYC documents", formData);
        let shouldClose = true;
        try {
            setSubmitting(true);
            if (onSubmit) {
                const result = await onSubmit(formData);
                console.log("KYC submit result", result);
                shouldClose = result !== false;
            }
        } catch (error) {
            console.error("Error submitting KYC documents", error);
            shouldClose = false;
        } finally {
            setSubmitting(false);
        }

        if (shouldClose) {
            resetForm();
            onClose();
        }
    };

    const resetForm = () => {
        setAadharFile(null);
        setPanFile(null);
        setLightBillFile(null);
        setGstCertificateFile(null);
    };

    return (
        <Modal isOpen={isOpen} onClose={() => {
            resetForm();
            onClose();
        }} title="Upload KYC Documents" size="lg" maxWidth="700px" headerIcon={ICON_NAMES.EDIT_USER} >
            <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Upload KYC Document
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                    Please upload clear copies of the following documents for verification
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Aadhar Card Upload */}
                    <FileUploadField
                        label="Aadhar Card"
                        accept=".png,.jpg,.jpeg,.pdf"
                        file={aadharFile}
                        onChange={handleFileChange(setAadharFile)}
                        onRemove={() => setAadharFile(null)}
                    />

                    {/* PAN Card Upload */}
                    <FileUploadField
                        label="PAN Card"
                        accept=".png,.jpg,.jpeg,.pdf"
                        file={panFile}
                        onChange={handleFileChange(setPanFile)}
                        onRemove={() => setPanFile(null)}
                    />

                    {/* Light Bill Upload */}
                    <FileUploadField
                        label="Light/Utility Bill"
                        accept=".png,.jpg,.jpeg,.pdf"
                        file={lightBillFile}
                        onChange={handleFileChange(setLightBillFile)}
                        onRemove={() => setLightBillFile(null)}
                    />

                    {hasGST && (
                        <FileUploadField
                            label="GST Certificate (PDF)"
                            accept=".pdf"
                            file={gstCertificateFile}
                            onChange={handleFileChange(setGstCertificateFile)}
                            onRemove={() => setGstCertificateFile(null)}
                        />
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => {
                                resetForm();
                                onClose();
                            }}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={
                                submitting ||
                                !aadharFile ||
                                !panFile ||
                                !lightBillFile ||
                                (hasGST && !gstCertificateFile)
                            }
                            className={`flex-1 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                                aadharFile &&
                                panFile &&
                                lightBillFile &&
                                (!hasGST || gstCertificateFile) &&
                                !submitting
                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}

export default ClientKYCModal;