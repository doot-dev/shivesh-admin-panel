import { useState } from "react";
import { Modal, Input, Dropdown, Checkbox, Button } from "../../ui";
import { Icon, ICON_NAMES } from "../../icons";
import { addUser } from "../../../services/userService";

const AddUserModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    employeeName: "",
    employeeId: "",
    role: "",
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);;

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
        // Convert menu access to array of IDs
        const selectedMenuAccess = menuAccessOptions
          .filter(option => formData.menuAccess[option.key])
          .map(option => option.id);

        // Format data according to API structure
        const userData = {
          name: formData.employeeName,
          employeeId: formData.employeeId,
          userName: formData.username,
          password: formData.password,
        //   token: getToken(),
          role: formData.role.toUpperCase(), // Convert to uppercase like "ADMIN"
          menuAccess: selectedMenuAccess
        };

        console.log('Sending user data:', userData);

        // Make API call
        const response = await addUser(userData);
        console.log('Add user response:', response);

        // Call parent onSubmit handler
        onSubmit?.(response);
        
        // Close modal on success
        handleClose();
      } catch (error) {
        console.error('Error adding user:', error);
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
    setErrors({});
    onClose?.();
  };

  const modalFooter = (
    <>
      <Button 
        variant="outline" 
        onClick={handleClose} 
        className="mr-3 text-sm sm:text-base px-4 sm:px-6"
        width="120px"
        height="40px"
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSubmit}
        className="text-sm sm:text-base px-4 sm:px-6"
        width="120px"
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
            Grant access to specific navigations to this user
          </p>

          <div
            className="border rounded-[12px] p-4 max-h-60 overflow-y-auto space-y-3 bg-input-bg"
            style={{
              borderColor: "var(--color-border)",
            
            }}
          >
            {menuAccessOptions.map((option) => (
              <Checkbox
                key={option.key}
                checked={formData.menuAccess[option.key]}
                onChange={handleMenuAccessChange(option.key)}
                label={option.label}
                className="w-full"
              />
            ))}
          </div>
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
