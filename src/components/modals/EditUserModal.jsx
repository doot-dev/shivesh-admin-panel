import { useState, useEffect } from 'react';
import { Modal, Button, Input, Checkbox, Dropdown } from "../ui";
import { Icon, ICON_NAMES } from "../icons";
import { updateUsers } from "../../services/userService";

const EditUserModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    role: '',
    status: true,
    username: '',
    password: '',
    menuAccess: {
      client: false,
      productMaster: false,
      vendorMaster: false,
      userMaster: false,
      project: false,
      ordersAndTrucks: false,
      leads: false,
    }
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [originalPassword, setOriginalPassword] = useState('');

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

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      // Convert menuAccess array back to boolean object
      const menuAccessObject = {
        client: false,
        productMaster: false,
        vendorMaster: false,
        userMaster: false,
        project: false,
        ordersAndTrucks: false,
        leads: false,
      };

      // Set true for accessed menus based on user's menuAccess array
      if (user.menuAccess && Array.isArray(user.menuAccess)) {
        menuAccessOptions.forEach(option => {
          if (user.menuAccess.includes(option.id)) {
            menuAccessObject[option.key] = true;
          }
        });
      }

      const currentPassword = user.password || '••••••••';
      setOriginalPassword(currentPassword);
      
      setFormData({
        employeeName: user.name || user.employeeName || '',
        employeeId: user.employeeId || '',
        role: user.role || '',
        status: user.status !== undefined ? user.status : true,
        username: user.userName || user.username || '',
        password: currentPassword, // Show current password (masked)
        menuAccess: menuAccessObject
      });
      setErrors({});
      setIsChangingPassword(false);
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

    // Password validation only if changing password
    if (isChangingPassword && formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Convert menu access to array of IDs
        const selectedMenuAccess = menuAccessOptions
          .filter(option => formData.menuAccess[option.key])
          .map(option => option.id);

        // Format data according to API structure
        const userData = {
          id: user.id, // Include the user id for update
          name: formData.employeeName,
          employeeId: formData.employeeId,
          userName: formData.username,
          role: formData.role, // Keep original case from dropdown
          status: formData.status,
          menuAccess: selectedMenuAccess
        };

        // Only include password if user is changing it and provided a new one
        if (isChangingPassword && formData.password.trim() && formData.password !== originalPassword) {
          userData.password = formData.password;
        }

        console.log('Updating user data:', userData);

        // Make API call
        const response = await updateUsers(userData);
        console.log('Update user response:', response);

        // Call parent onSave handler with the updated user data
        onSave?.(userData);
        
      } catch (error) {
        console.error('Error updating user:', error);
        setErrors(prev => ({
          ...prev,
          submit: 'Failed to update user. Please try again.'
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleClose = () => {
    setErrors({});
    setIsSubmitting(false);
    setIsChangingPassword(false);
    setOriginalPassword('');
    onClose?.();
  };

  if (!user) return null;

  const modalFooter = (
    <>
      <Button 
        variant="outline" 
        onClick={handleClose} 
        className="mr-3 px-6"
        disabled={isSubmitting}
        style={{
          textTransform: 'capitalize'
        }}
      >
        Cancel
      </Button>
      <Button 
        variant="primary" 
        onClick={handleSave}
        disabled={isSubmitting}
        className="px-6"
        style={{ 
          backgroundColor: 'var(--color-primary)',
          color: 'white',
          textTransform: 'lowercase'
        }}
      >
        {isSubmitting ? 'Saving Changes...' : 'save changes'}
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
            <p className="mt-1 text-sm" style={{ color: "var(--color-error)" }}>
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
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
                {formData.status ? 'Active' : 'Inactive'}
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
            type={isChangingPassword ? "password" : "text"}
            placeholder={isChangingPassword ? "Enter new password" : "Current password"}
            value={formData.password}
            onChange={isChangingPassword ? handleInputChange("password") : undefined}
            error={!!errors.password}
            errorMessage={errors.password}
            backgroundColor="input-bg"
            readOnly={!isChangingPassword}
            className={!isChangingPassword ? "cursor-not-allowed" : ""}
          />
          <div className="flex items-center space-x-3 mt-1">
            {!isChangingPassword ? (
              <button
                type="button"
                className="text-xs text-blue-600 hover:text-blue-800 underline"
                onClick={() => {
                  setIsChangingPassword(true);
                  setFormData(prev => ({ ...prev, password: '' }));
                }}
              >
                Change password
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="text-xs text-green-600 hover:text-green-800 underline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setFormData(prev => ({ ...prev, password: originalPassword }));
                  }}
                >
                  Keep current
                </button>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  onClick={() => setFormData(prev => ({ ...prev, password: '' }))}
                >
                  Clear
                </button>
              </>
            )}
          </div>
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

export default EditUserModal;