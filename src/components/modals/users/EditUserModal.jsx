import { useState, useEffect } from "react";
import { Modal, Button, Input, Checkbox, Dropdown } from "../../ui";
import { ICON_NAMES } from "../../icons";
import { updateUsers } from "../../../services/userService";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { editUser } from "../../../features/user/userSlice";
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
    password: "",
    menuAccess: {
      client: false,
      productMaster: false,
      vendorMaster: false,
      userMaster: false,
      project: false,
      ordersAndTrucks: false,
      leads: false,
    },
  });

  console.log("EditUserModal user prop:", user);
  const dispatch = useDispatch();
  const [errors, setErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Role options for dropdown
  const roleOptions = [
    { value: "", label: "Select a role" },
    { value: "FIELD_TECHNICIAN", label: "Field technician" },
    { value: "PROJECT_MANAGER", label: "Manager" },
    { value: "ADMIN", label: "Admin" },
    { value: "ACCOUNTANT", label: "Accountant" },
  ];

  // Menu access options with IDs
  const menuAccessOptions = [
    { key: "client", label: "Client", id: 1 },
    { key: "productMaster", label: "Product Master", id: 2 },
    { key: "vendorMaster", label: "Vendor master", id: 3 },
    { key: "userMaster", label: "User master", id: 4 },
    { key: "project", label: "Project", id: 5 },
    { key: "ordersAndTrucks", label: "Orders & Trucks", id: 6 },
    { key: "leads", label: "Leads", id: 7 },
  ];

  // Update form data when user data changes
  useEffect(() => {
    if (user && user.data) {
      console.log("Setting form data from user:", user.data);

      // Convert menuAccess array to boolean object for checkboxes
      const menuAccessObject = {
        client: false,
        productMaster: false,
        vendorMaster: false,
        userMaster: false,
        project: false,
        ordersAndTrucks: false,
        leads: false,
      };

      // If user has menuAccess array, set the corresponding checkboxes to true
      if (user.data.menuAccess && Array.isArray(user.data.menuAccess)) {
        console.log("User menuAccess array:", user.data.menuAccess);

        menuAccessOptions.forEach((option) => {
          if (user.data.menuAccess.includes(option.id)) {
            menuAccessObject[option.key] = true;
            console.log(`Setting ${option.key} to true for id ${option.id}`);
          }
        });
      }

      console.log("Final menuAccess object:", menuAccessObject);

      setFormData({
        employeeName: user.data.name || "",
        employeeId: user.data.employeeId || "",
        role: user.data.role || "",
        status: user.data.status !== undefined ? user.data.status : true,
        username: user.data.userName || "",
        password: user.data.password || "",
        menuAccess: menuAccessObject,
      });
    }
  }, [user]);

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

  const handleMenuAccessChange = (key) => (checked) => {
    setFormData((prev) => ({
      ...prev,
      menuAccess: {
        ...prev.menuAccess,
        [key]: checked,
      },
    }));
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
      // Convert menu access boolean object back to array of IDs
      const selectedMenuAccess = menuAccessOptions
        .filter((option) => formData.menuAccess[option.key])
        .map((option) => option.id);

      // Format data according to API structure
      const userData = {
        id: user.data.id,
        name: formData.employeeName,
        employeeId: formData.employeeId,
        userName: formData.username,
        role: formData.role,
        status: formData.status,
        menuAccess: selectedMenuAccess,
      };

      // Only include password if it's been changed (not the masked version)
      if (formData.password && formData.password !== "••••••••") {
        userData.password = formData.password;
      }

      console.log("Updating user with data:", userData);

      // Call the updateUsers API directly
      const response = await dispatch(editUser(userData)).unwrap();
      console.log("Update user API response:", response);

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
    setIsChangingPassword(false);
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
              Role <span style={{ color: "var(--color-error)" }}>*</span>
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

          {/* Password */}
          <div>
            <Input
              label="Password"
              type="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleInputChange("password")}
              error={!!errors.password}
              errorMessage={errors.password}
              backgroundColor="input-bg"
            />
            <button
              type="button"
              onClick={() => handleResetPassword && handleResetPassword(user)}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Reset password
            </button>
          </div>

          {/* Menu Access */}
          <div>
            <h4
              className="text-sm font-medium mb-2"
              style={{ color: "var(--color-text-primary)" }}
            >
              Menu access
            </h4>
            <p
              className="text-sm mb-4"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Access granted to the navigations to this user
            </p>

            <div
              className="border rounded-[12px] p-4 max-h-60 overflow-y-auto space-y-3 bg-input-bg"
              style={{
                borderColor: "var(--color-border)",
              }}
            >
              {menuAccessOptions.map((option) => {
                console.log(
                  `Rendering checkbox for ${option.key}: checked=${formData.menuAccess[option.key]
                  }`
                );
                return (
                  <Checkbox
                    key={option.key}
                    checked={formData.menuAccess[option.key]}
                    onChange={handleMenuAccessChange(option.key)}
                    label={option.label}
                    className="w-full"
                  />
                );
              })}
            </div>
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
