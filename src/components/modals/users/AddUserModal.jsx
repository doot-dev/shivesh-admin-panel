import { useEffect, useState } from "react";
import { Modal, Input, Dropdown, Button } from "../../ui";
import { ICON_NAMES } from "../../icons";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { createUser } from "../../../features/user/userSlice";
import { getRoles } from "../../../services/roleService";
import { usePermission } from "../../../hooks/usePermission";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const dispatch = useDispatch();
  const { isSuperAdmin } = usePermission();

  // Access roles, loaded from the IAM engine rather than hardcoded, so a role
  // created on the Roles screen is immediately assignable here.
  const [accessRoles, setAccessRoles] = useState([]);

  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    role: "",
    username: "",
    password: "",
    roleId: "",
    isSuperAdmin: false,
  });

  useEffect(() => {
    if (!isOpen) return;
    getRoles()
      .then((res) => setAccessRoles(res?.data ?? []))
      .catch(() => setAccessRoles([]));
  }, [isOpen]);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);;

  // Role options for dropdown
  const roleOptions = [
    { value: "", label: "Select a job" },
    { value: "FIELD_TECHNICIAN", label: "Field Technician" },
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
    // Pre-pick the access role named after the job (e.g. Accountant), so the
    // two fields don't have to be matched by hand. Still editable below.
    const jobLabel = roleOptions.find((r) => r.value === value)?.label;
    const match = accessRoles.find((r) => r.isActive && !r.isSystem && r.name === jobLabel);
    setFormData((prev) => ({
      ...prev,
      role: value,
      roleId: prev.roleId || (match ? String(match.id) : ""),
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

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // What the user can DO in the panel now comes from the access role, not
        // from the job title in `role` (which is kept for the mobile apps).
        const userData = {
          name: formData.employeeName,
          employeeId: formData.employeeId,
          userName: formData.username,
          password: formData.password,
          role: formData.role.toUpperCase(),
          roleId: formData.roleId ? Number(formData.roleId) : null,
          isSuperAdmin: formData.isSuperAdmin,
        };

        console.log('Sending user data:', userData);

        // Make API call
        const response = await dispatch(createUser(userData)).unwrap();
        console.log('Add user response:', response);
        // toast.success(response.message || 'User created successfully');
        // Call parent onSubmit handler
        onSubmit?.(response);

        // Close modal on success
        handleClose();
      } catch (error) {
        console.error('Error adding user:', error);
        toast.error('Failed to create user. Please try again.');
        // You can add error handling here, maybe set an error state
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to create user. Please try again.'
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setFormData({
      employeeName: "",
      employeeId: "",
      role: "",
      username: "",
      password: "",
      roleId: "",
      isSuperAdmin: false,
    });
    setErrors({});
    onClose?.();
  };

  const modalFooter = (
    <>
      <Button
        variant="outline"
        onClick={handleClose}
        className="mr-3 text-sm sm:text-base px-4 sm:px-6"
        width="180px"
        height="40px"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button
        variant="primary"
        onClick={handleSubmit}
        className="text-sm sm:text-base px-4 sm:px-6"
        width="180px"
        height="40px"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Creating User...' : 'Create User'}
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="New user entry"
      size="lg"
      footer={modalFooter}
      maxWidth="700px"
      headerIcon={ICON_NAMES.ADD_NEW_USER}
    >
      <div className="space-y-6">
        {/* Employee Name and Employee ID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input
            label="Employee ID"
            placeholder="Enter ID"
            value={formData.employeeId}
            onChange={handleInputChange("employeeId")}
            error={!!errors.employeeId}
            errorMessage={errors.employeeId}
            required
            backgroundColor="input-bg"
            onRightIconClick={() =>
              setFormData((prev) => ({ ...prev, employeeId: "" }))
            }
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
            placeholder="Select a job"
            width="100%"
            height="42px"
            error={!!errors.role}
            backgroundColor="input-bg"
          />
          {errors.role && (
            <p className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>
              {errors.role}
            </p>
          )}
        </div>

        {/* Username and Password */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleInputChange("password")}
            error={!!errors.password}
            errorMessage={errors.password}
            required
            backgroundColor="input-bg"
          />
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
            Pick the access role that decides which menus and actions this user
            gets. Manage the roles themselves on the Roles &amp; Permissions
            screen.
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

          {!formData.roleId && !formData.isSuperAdmin && (
            <p className="mt-2 text-xs text-amber-600">
              Without an access role this user can sign in but will not see any
              menus.
            </p>
          )}

          {/* Only an existing super admin can mint another one — the API
              enforces this too, so the checkbox is a courtesy, not the guard. */}
          {isSuperAdmin && (
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
                Make this user a <strong>Super Admin</strong> — full access to
                everything, now and to anything added later. Their access role
                is ignored.
              </span>
            </label>
          )}
        </div>

        {/* Submit Error */}
        {errors.submit && (
          <div
            className="p-3 rounded-lg text-sm"
            style={{
              backgroundColor: 'var(--color-error-light)',
              color: 'var(--color-error)'
            }}
          >
            {errors.submit}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AddUserModal;
