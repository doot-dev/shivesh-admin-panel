import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { useFetch } from "../hooks/useFetch";
import { fetchUserById, fetchUsers } from "../features/user/userSlice";

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

const Users = () => {
  /** -----------------------------
   *   State & Data Fetch
   *  ----------------------------- */
  const dispatch = useDispatch();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false,
    resetPassword: false,
    view: false,
  });

  const [loadingUserData, setLoadingUserData] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Fetch user list
  const transformUsersData = useCallback(async () => {
    const response = await getUsers();
    if (Array.isArray(response)) return response;
    if (response?.data) return response.data;
    if (response?.users) return response.users;
    return [];
  }, []);
  
  const { data: usersData = dispatch(fetchUsers()), loading, refetch: loadUsers } = useFetch(
    transformUsersData,
    [],
    { autoFetch: true, showToast: true }
  );

  /** -----------------------------
   *   Utility Functions
   *  ----------------------------- */
  const getRoleLabel = (value) =>
    roleOptions.find((r) => r.value === value)?.label || value;

  const closeAllModals = () => {
    setModalState({
      add: false,
      edit: false,
      delete: false,
      resetPassword: false,
      view: false,
    });
    setSelectedUser(null);
    setLoadingUserData(false);
  };

  /** -----------------------------
   *   Handlers
   *  ----------------------------- */
  const handleEdit = async (user) => {
    setLoadingUserData(true);
    try {
      const userData = await dispatch(fetchUserById(user.id)).unwrap();
      setSelectedUser(userData);
      setModalState((prev) => ({ ...prev, edit: true }));
    } catch (err) {
      toast.error("Failed to load user data");
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await loadUsers();
      // toast.success("User updated successfully");
    } catch {
      toast.error("User updated but failed to refresh list");
    } finally {
      closeAllModals();
    }
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalState((prev) => ({ ...prev, delete: true }));
  };

  const handleConfirmDelete = async (user) => {
    setIsDeletingUser(true);
    try {
      await deleteUser(user.id);
      toast.success("User deleted successfully");
      await loadUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setIsDeletingUser(false);
      closeAllModals();
    }
  };

  const handleAddUser = async (userData) => {
    try {
      await loadUsers();
      // toast.success("User added successfully");
    } catch {
      toast.error("Failed to add new user");
    } finally {
      closeAllModals();
    }
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setModalState((prev) => ({ ...prev, resetPassword: true }));
  };

  const handleConfirmResetPassword = async (passwordData) => {
    try {
      const response = await resetPassword(passwordData);
      toast.success(
        response?.message ||
        response?.data?.message ||
        "Password reset successfully"
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        "Failed to reset password. Please try again."
      );
    } finally {
      closeAllModals();
    }
  };

  /** -----------------------------
   *   Data Filtering
   *  ----------------------------- */
  const filteredUsers = (usersData || []).filter((user) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      user.name?.toLowerCase().includes(search) ||
      user.employeeId?.toLowerCase().includes(search) ||
      user.userName?.toLowerCase().includes(search);

    const matchesRole = !roleFilter || user.role === roleFilter;
    const matchesStatus =
      !statusFilter ||
      (statusFilter === "Active" && user.status === true) ||
      (statusFilter === "Inactive" && user.status === false);

    return matchesSearch && matchesRole && matchesStatus;
  })
    .map((user, index) => ({
      ...user,
      sno: user.sno || (index + 1).toString().padStart(2, "0"),
      employeeName: user.name,
      username: user.userName,
      password: "••••••••",
      role: getRoleLabel(user.role),
      status: user.status ? "Active" : "Inactive",
    }));

  console.log("Flitered Users", filteredUsers)
  /** -----------------------------
   *   Table Configuration
   *  ----------------------------- */
  const columns = [
    { key: "sno", header: "S.No" },
    { key: "employeeName", header: "Employee name" },
    { key: "role", header: "Role", hideOnMobile: true },
    { key: "employeeId", header: "Employee ID", hideOnMobile: true },
    { key: "username", header: "Username", hideOnMobile: true },
    { key: "password", header: "Password", hideOnMobile: true },
    {
      key: "status",
      header: "Status",
      type: "badge",
      badgeConfig: {
        Active: { color: "#16A34A", backgroundColor: "#D1FAE5" },
        Inactive: { color: "#DC2626", backgroundColor: "#FFD5C9" },
      },
    },
  ];

  const actions = [
    { text: "Edit", onClick: handleEdit, textColor: "var(--color-success)" },
    { text: "Delete", onClick: handleDelete, textColor: "var(--color-error)" },
  ];

  /** -----------------------------
   *   Render
   *  ----------------------------- */
  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
        <p className="text-text-secondary">View and manage user details</p>
      </header>

      {/* Filters */}
      <section className="mb-6 bg-white py-4 px-0 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 md:max-w-[30%]">
              <Icon
                name={ICON_NAMES.SEARCH}
                size={16}
                color="#9CA3AF"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Search by name or ID"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Dropdown
              options={roleOptions}
              value={roleFilter}
              onChange={setRoleFilter}
              placeholder="Role"
              width="200px"
              height="50px"
            />
            <Dropdown
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Status"
              width="150px"
              height="50px"
            />
          </div>

          {/* Add User */}
          <Button
            onClick={() => setModalState((prev) => ({ ...prev, add: true }))}
            leftIcon={ICON_NAMES.PLUS}
            variant="primary"
            size="md"
            height="50px"
          >
            Add User
          </Button>
        </div>
      </section>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12 bg-white rounded-lg shadow-sm">
          <div className="text-text-secondary">Loading users...</div>
        </div>
      ) : (
        <Table
          data={filteredUsers}
          columns={columns}
          actions={actions}
          showPagination
          itemsPerPage={10}
          emptyMessage="No users found"
        />
      )}

      {/* Modals */}
      <AddUserModal
        isOpen={modalState.add}
        onClose={closeAllModals}
        onSubmit={handleAddUser}
      />

      <EditUserModal
        isOpen={modalState.edit}
        onClose={closeAllModals}
        user={selectedUser}
        loading={loadingUserData}
        onSave={handleSaveEdit}
        handleResetPassword={handleResetPassword}
      />

      <ResetPasswordModal
        isOpen={modalState.resetPassword}
        onClose={closeAllModals}
        user={selectedUser}
        onResetPassword={handleConfirmResetPassword}
      />

      <DeleteUserModal
        isOpen={modalState.delete}
        onClose={closeAllModals}
        user={selectedUser}
        onDelete={handleConfirmDelete}
        loading={isDeletingUser}
      />
    </div>
  );
};

export default Users;
