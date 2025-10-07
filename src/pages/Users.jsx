import { useEffect, useState } from "react";
import { Icon, ICON_NAMES } from "../components/icons";
import { Button, Table, Dropdown } from "../components/ui";
import {
  AddUserModal,
  ViewUserModal,
  EditUserModal,
  DeleteUserModal,
  ResetPasswordModal,
} from "../components/modals/users";
import {
  getUsers,
  getUserById,
  updateUsers,
  deleteUser,
  resetPassword,
} from "../services/userService";
import { toast } from "react-toastify";
const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [resetPasswordModal, setResetPasswordModal] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Dropdown options
  const roleOptions = [
    { value: "", label: "All Roles" },
    { value: "FIELD_TECHNICIAN", label: "Field Technician" },
    { value: "PROJECT_MANAGER", label: "Manager" },
    { value: "ADMIN", label: "Admin" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];

  // This is now replaced by API data loaded in useEffect

  const handleEdit = async (user) => {
    try {
      console.log("Editing user:", user);
      setLoadingUserData(true);
      setShowEditModal(true);

      // Fetch the latest user data by ID
      const userData = await getUserById(user.id);
      console.log("Fetched user data for edit:", userData);

      setSelectedUser(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Failed to load user data");
      setShowEditModal(false);
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleSaveEdit = async (updatedUser) => {
    try {
      console.log("User updated successfully:", updatedUser);

      // Refresh the users list
      const response = await getUsers();
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response.users)) {
        users = response.users;
      }
      setUsersData(users);

      // Close modal
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error refreshing user list:", error);
      toast.error("User updated but failed to refresh list");

      // Still close the modal even if refresh fails
      setShowEditModal(false);
      setSelectedUser(null);
    }
  };

  const handleResetPassword = async (user) => {
    setSelectedUser(user);
    setResetPasswordModal(true);
    setShowEditModal(false);
  };

  const handleConfirmResetPassword = async (passwordData) => {
    try {
      console.log("Resetting password:", passwordData);

      // Call the reset password API
      const response = await resetPassword(passwordData);
      console.log("Reset password response:", response);

      // Show success message from API response
      const successMessage = response?.message || response?.data?.message || "Password reset successfully";
      toast.success(successMessage);

      // Close modal
      setResetPasswordModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error resetting password:", error);
      
      // Show error message from API response or default message
      const errorMessage = error?.response?.data?.message || 
                          error?.message || 
                          "Failed to reset password. Please try again.";
      toast.error(errorMessage);
      
      throw error; // Re-throw to let modal handle the error state
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async (user) => {
    try {
      console.log("Deleting user:", user.id);

      // Make API call to delete user
      await deleteUser(user.id);

      // Show success message
      toast.success("User deleted successfully!");

      // Refresh the users list
      const response = await getUsers();
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response.users)) {
        users = response.users;
      }
      setUsersData(users);

      // Close modal
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  // const handleView = (user) => {
  //   setSelectedUser(user);
  //   setShowViewModal(true);
  // };

  // const handleRowClick = (user) => {
  //   setSelectedUser(user);

  //   setShowViewModal(true);
  // };

  const handleAddUser = async (userData) => {
    try {
      console.log("Add new user:", userData);
      // Refresh the users list after adding
      const response = await getUsers();

      // Handle different response structures
      let users = [];
      if (Array.isArray(response)) {
        users = response;
      } else if (response && Array.isArray(response.data)) {
        users = response.data;
      } else if (response && Array.isArray(response.users)) {
        users = response.users;
      }

      setUsersData(users);
      setShowAddModal(false);
      toast.success("User added successfully");
    } catch (error) {
      console.error("Error refreshing users after add:", error);
      toast.error("Failed to  new user");
    }
  };

  // Helper function to get role label from role value
  const getRoleLabel = (roleValue) => {
    const roleOption = roleOptions.find((option) => option.value === roleValue);
    return roleOption ? roleOption.label : roleValue;
  };

  // Filter users based on search and filters
  const filteredUsers = (Array.isArray(usersData) ? usersData : [])
    .filter((user) => {
      // Handle search filtering - match your actual API response structure
      const searchString = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        (user.name && user.name.toLowerCase().includes(searchString)) ||
        (user.employeeId &&
          user.employeeId.toLowerCase().includes(searchString)) ||
        (user.userName && user.userName.toLowerCase().includes(searchString));

      // Handle role filtering - match your actual API response structure
      const matchesRole = !roleFilter || user.role === roleFilter;

      // Handle status filtering - your API uses boolean status
      const matchesStatus =
        !statusFilter ||
        (statusFilter === "Active" && user.status === true) ||
        (statusFilter === "Inactive" && user.status === false);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .map((user, index) => ({
      ...user,
      // Ensure we have required fields for the table, add sno if not present
      sno: user.sno || (index + 1).toString().padStart(2, "0"),
      // Map API fields to expected table fields
      employeeName: user.name,
      username: user.userName,
      password: user.password || "••••••••", // Don't show real passwords
      originalRole: user.role, // Keep original API role value for editing
      role: getRoleLabel(user.role), // Convert role value to label for display
      status: user.status ? "Active" : "Inactive", // Convert boolean to string
    }));

  // Table configuration
  const columns = [
    {
      key: "sno",
      header: "S.No",
      className: "text-text-primary font-medium",
    },
    {
      key: "employeeName",
      header: "Employee name",
      className: "text-text-primary font-medium",
      mobileLabel: true,
      mobileSubtext: "role",
    },
    {
      key: "role",
      header: "Role",
      hideOnMobile: true,
    },
    {
      key: "employeeId",
      header: "Employee ID",
      hideOnMobile: true,
    },
    {
      key: "username",
      header: "Username",
      hideOnMobile: true,
    },
    {
      key: "password",
      header: "Password",
      hideOnMobile: true,
    },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
        Active: {
          color: "#16A34A", // Green text for active
          backgroundColor: "#D1FAE5", // Light green background for active
        },
        Inactive: {
          color: "#DC2626", // Red text for inactive
          backgroundColor: "#FFD5C9", // Light red background for inactive
        },
      },
    },
  ];

  const actions = [
    {
      text: "Edit",
      onClick: handleEdit,
      textColor: "var(--color-success)",
      hoverBackgroundColor: "var(--color-success-light)",
      title: "Edit",
    },
    {
      text: "Delete",
      onClick: handleDelete,
      textColor: "var(--color-error)",
      hoverBackgroundColor: "var(--color-error-light)",
      title: "Delete",
    },
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getUsers();
        console.log("API Response Data:", response);

        // Handle different response structures
        let users = [];
        if (Array.isArray(response)) {
          users = response;
        } else if (response && Array.isArray(response.data)) {
          users = response.data;
        } else if (response && Array.isArray(response.users)) {
          users = response.users;
        } else if (response && typeof response === "object") {
          // If response is a single object, wrap it in an array
          users = [response];
        }

        setUsersData(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users");
        setUsersData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
        <p className="text-text-secondary text-base">
          View and manage user details
        </p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 bg-white  py-4  px-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            {/* Search */}
            <div className="relative flex-1 md:max-w-[25%] md:h-[50px]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon name={ICON_NAMES.SEARCH} size={16} color="#9CA3AF" />
              </div>
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2  border border-border rounded-lg md:h-[50px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Role Filter */}
            <Dropdown
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Role"
              width="auto"
              height="50px"
              className="md:max-w-[14%]"
            />

            {/* Status Filter */}
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              width="auto"
              height="50px"
              className="md:max-w-[14%]"
            />
          </div>

          {/* Add User Button */}
          <Button
            onClick={() => setShowAddModal(true)}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
            size="md"
            height="40px"
            className="md:!h-[50px] md:!px-6 md:!py-3 md:!text-base text-sm px-4 py-2"
          >
            <span className="hidden sm:inline">Add User</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-text-secondary">Loading users...</div>
        </div>
      ) : error ? (
        <div className="flex flex-col justify-center items-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-error mb-2">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="text-xs sm:text-sm px-3 py-1.5 sm:px-3 sm:py-1.5"
          >
            Retry
          </Button>
        </div>
      ) : (
        <Table
          data={filteredUsers}
          columns={columns}
          actions={actions}
          // onRowClick={handleRowClick}
          showPagination={true}
          itemsPerPage={10}
          emptyMessage="No users found matching your criteria"
          className="shadow-sm"
        />
      )}

      {/* Add User Modal */}
      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddUser}
      />

      {/* View User Modal */}
      {/* <ViewUserModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onEdit={(user) => {
          setShowViewModal(false);
          handleEdit(user);
        }}
        onDelete={(user) => {
          setShowViewModal(false);
          handleDelete(user);
        }}
      /> */}

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
          setLoadingUserData(false);
        }}
        user={selectedUser}
        loading={loadingUserData}
        onSave={handleSaveEdit}
        handleResetPassword={handleResetPassword}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetPasswordModal}
        onClose={() => {
          setResetPasswordModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onResetPassword={handleConfirmResetPassword}
      />

      {/* Delete User Modal */}
      <DeleteUserModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onDelete={handleConfirmDelete}
        loading={isDeletingUser}
      />
    </div>
  );
};

export default Users;
