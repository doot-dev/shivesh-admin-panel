import { useState } from "react";
import { Modal, Button, Input } from "../ui";
import { ICON_NAMES } from "../icons";

const ResetPasswordModal = ({ isOpen, onClose, user, onResetPassword }) => {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Real-time validation for confirm password
    if (field === "confirmPassword") {
      if (value && formData.newPassword && value !== formData.newPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Confirm password does not match with new password",
        }));
      }
    }

    // Clear confirm password error when new password changes
    if (field === "newPassword" && errors.confirmPassword) {
      if (value === formData.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "",
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm password does not match with new password";
    }

    if (formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const passwordData = {
        id: user?.id || user?.data?.id,
        oldPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      };

      console.log("Resetting password for user:", passwordData);

      // Call the parent handler
      if (onResetPassword) {
        await onResetPassword(passwordData);
      }

      // Reset form and close modal on success
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Error resetting password:", error);
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to reset password. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const modalFooter = (
    <>
      <Button
        variant="outline"
        onClick={handleClose}
        className="mr-3 px-6"
        disabled={isSubmitting}
        style={{
          textTransform: "capitalize",
        }}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleResetPassword}
        className="px-6"
        disabled={isSubmitting}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          textTransform: "capitalize",
        }}
      >
        {isSubmitting ? "Resetting..." : "Done"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset password"
      size="md"
      footer={modalFooter}
      maxWidth="500px"
      headerIcon="none"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleResetPassword();
        }}
      >
        <div className="space-y-6">
          {/* Current Password */}
          <div>
            <Input
              label="Current password"
              type="password"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={handleInputChange("currentPassword")}
              error={!!errors.currentPassword}
              errorMessage={errors.currentPassword}
              required
              backgroundColor="input-bg"
            />
          </div>

          {/* New Password */}
          <div>
            <Input
              label="New password"
              type="password"
              placeholder="Enter new password"
              value={formData.newPassword}
              onChange={handleInputChange("newPassword")}
              error={!!errors.newPassword}
              errorMessage={errors.newPassword}
              required
              backgroundColor="input-bg"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <Input
              label="Confirm new password"
              type="password"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleInputChange("confirmPassword")}
              error={!!errors.confirmPassword}
              errorMessage={errors.confirmPassword}
              required
              backgroundColor="input-bg"
            />
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div
              className="p-3 rounded-lg text-sm"
              style={{
                backgroundColor: "var(--color-error-light)",
                color: "var(--color-error)",
              }}
            >
              {errors.submit}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;