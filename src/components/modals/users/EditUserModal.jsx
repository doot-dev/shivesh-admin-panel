import { useState, useEffect } from "react";
import { Modal, Button, Input, Dropdown } from "../../ui";
import { ICON_NAMES } from "../../icons";
import { useDispatch } from "react-redux";
import { editUser } from "../../../features/user/userSlice";
import {
  getRoles,
  getUserPermissions,
  setUserPermissions,
} from "../../../services/roleService";
import { usePermission } from "../../../hooks/usePermission";
import UserOverrides from "./UserOverrides";
const EditUserModal = ({
  isOpen,
  onClose,
  user,
  loading,
  onSave,
  handleResetPassword,
}) => {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    role: "",
    status: true,
    username: "",
    roleId: "",
    isSuperAdmin: false,
  });

  const dispatch = useDispatch();
  const { isSuperAdmin: viewerIsSuperAdmin } = usePermission();
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [accessRoles, setAccessRoles] = useState([]);
  // Per-user exceptions, loaded separately because they are saved through the
  // role API rather than the user API.
  const [overrides, setOverrides] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);

  // Role options for dropdown
  const roleOptions = [
    { value: "", label: "Select a role" },
    { value: "FIELD_TECHNICIAN", label: "Field technician" },
    { value: "PROJECT_MANAGER", label: "Project Manager" },
    { value: "ADMIN", label: "Admin" },
    { value: "ACCOUNTANT", label: "Accountant" },
  ];

  const accessRoleOptions = [
    { value: "", label: "No access role" },
    ...accessRoles
      .filter((r) => r.isActive && !r.isSystem)
      .map((r) => ({ value: String(r.id), label: r.name })),
  ];

  // Update form data when user data changes
  useEffect(() => {
    if (user && user.data) {
      setFormData({
        employeeName: user.data.name || "",
        employeeId: user.data.employeeId || "",
        role: user.data.role || "",
        status: user.data.status !== undefined ? user.data.status : true,
        username: user.data.userName || "",
        roleId: user.data.roleId ? String(user.data.roleId) : "",
        isSuperAdmin: Boolean(user.data.isSuperAdmin),
      });
    }
  }, [user]);

  // Access role list + this user's current exceptions.
  useEffect(() => {
    if (!isOpen || !user?.data?.id) return;

    getRoles()
      .then((res) => setAccessRoles(res?.data ?? []))
      .catch(() => setAccessRoles([]));

    getUserPermissions(user.data.id)
      .then((res) => {
        setOverrides(res?.data?.overrides ?? []);
        // Effective minus overrides = what the ROLE grants. Showing that lets
        // an admin see which ticks come from the job and which are exceptions.
        const effective = new Set(res?.data?.effectivePermissions ?? []);
        for (const o of res?.data?.overrides ?? []) {
          if (o.effect === "ALLOW") effective.delete(o.permission);
        }
        setRolePermissions([...effective]);
      })
      .catch(() => {
        setOverrides([]);
        setRolePermissions([]);
      });
  }, [isOpen, user?.data?.id]);

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
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      role: value,
    }));

    if (errors.role) {
      setErrors((prev) => ({
        ...prev,
        role: "",
      }));
    }
  };



  const validateForm = () => {
    const newErrors = {};

    if (!formData.employeeName.trim()) {
      newErrors.employeeName = "Employee name is required";
    }

    if (!formData.employeeId.trim()) {
      newErrors.employeeId = "Employee ID is required";
    }

    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const userData = {
        id: user.data.id,
        name: formData.employeeName,
        employeeId: formData.employeeId,
        userName: formData.username,
        role: formData.role,
        status: formData.status,
        roleId: formData.roleId ? Number(formData.roleId) : null,
      };

      // Only a super admin may change this flag at all; the API enforces it
      // again and also refuses to let someone drop their OWN super-admin bit.
      if (viewerIsSuperAdmin) {
        userData.isSuperAdmin = formData.isSuperAdmin;
      }


      await dispatch(editUser(userData)).unwrap();

      // Exceptions are a separate endpoint — saved after the user row so a
      // failure here can't leave the user itself unsaved.
      await setUserPermissions(user.data.id, overrides);

      // Show success message
      // toast.success(response.message || "User updated successfully");

      // Call the parent onSave handler if provided (for any additional logic)
      if (onSave) {
        await onSave(userData);
      }

      // Close modal on successful save
      onClose();
    } catch (error) {
      console.error("Error updating user:", error);
      // toast.error("Failed to update user. Please try again.");
      setErrors((prev) => ({
        ...prev,
        submit: "Failed to update user. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsSubmitting(false);
    onClose();
  };

  const modalFooter = (
    <>
      <Button
        variant="outline"
        onClick={handleClose}
        className="mr-3 px-4 sm:px-6 text-sm sm:text-base"
        width="160px"
        height="40px"
        disabled={isSubmitting || loading}

      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSave}
        className="px-4 sm:px-6 text-sm sm:text-base"
        width="160px"
        height="40px"
        disabled={isSubmitting || loading}
        style={{
          backgroundColor: "var(--color-primary)",
          color: "white",
          // textTransform: "lowercase",
        }}
      >
        {isSubmitting ? "Saving..." : "Save changes"}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Edit user details"
      size="lg"
      footer={modalFooter}
      maxWidth="700px"
      headerIcon={ICON_NAMES.EDIT_USER}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <div className="space-y-6">
          {/* Employee Name */}
          <div>
            <Input
              label="Employee Name"
              placeholder="Enter full name"
              value={formData.employeeName}
              onChange={handleInputChange("employeeName")}
              error={!!errors.employeeName}
              errorMessage={errors.employeeName}
              required
              backgroundColor="input-bg"
            />
          </div>

          {/* Employee ID */}
          <div>
            <Input
              label="Employee ID"
              placeholder="Enter ID"
              value={formData.employeeId}
              onChange={handleInputChange("employeeId")}
              error={!!errors.employeeId}
              errorMessage={errors.employeeId}
              required
              backgroundColor="input-bg"
            />
          </div>

          {/* Role Dropdown */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Job <span style={{ color: "var(--color-error)" }}>*</span>
            </label>
            <Dropdown
              options={roleOptions}
              value={formData.role}
              onChange={handleRoleChange}
              placeholder="Select a role"
              width="100%"
              height="42px"
              error={!!errors.role}
              backgroundColor="input-bg"
            />
            {errors.role && (
              <p
                className="mt-1 text-sm"
                style={{ color: "var(--color-error)" }}
              >
                {errors.role}
              </p>
            )}
          </div>

          {/* Status */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Status
            </label>
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: e.target.checked,
                    }))
                  }
                />
                <div className="relative w-11 h-6 bg-gray-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                <span
                  className="ml-3 text-sm font-medium"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {formData.status ? "Active" : "Inactive"}
                </span>
              </label>
            </div>
          </div>

          {/* Username */}
          <div>
            <Input
              label="Username"
              placeholder="e.g JoneDoe"
              value={formData.username}
              onChange={handleInputChange("username")}
              error={!!errors.username}
              errorMessage={errors.username}
              required
              backgroundColor="input-bg"
            />
          </div>

          {/* Password: never shown — admins set a new one via Reset password */}
          <div>
            <button
              type="button"
              onClick={() => handleResetPassword && handleResetPassword(user)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Reset password
            </button>
          </div>

          {/* Panel access */}
          <div>
            <h4
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Panel access
            </h4>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              The access role decides which menus and actions this user gets.
            </p>

            <Dropdown
              options={accessRoleOptions}
              value={formData.roleId}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, roleId: value }))
              }
              placeholder="Select an access role"
              width="100%"
              height="42px"
              backgroundColor="input-bg"
            />

            {viewerIsSuperAdmin && (
              <label className="mt-4 flex items-start gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={formData.isSuperAdmin}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isSuperAdmin: e.target.checked,
                    }))
                  }
                  className="mt-0.5 h-4 w-4 accent-primary"
                />
                <span>
                  Super Admin — full access to everything. Overrides the access
                  role.
                </span>
              </label>
            )}

            {!formData.isSuperAdmin && (
              <UserOverrides
                overrides={overrides}
                rolePermissions={rolePermissions}
                onChange={setOverrides}
              />
            )}
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

export default EditUserModal;
