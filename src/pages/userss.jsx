
"use client";
import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Icon, ICON_NAMES } from "../components/icons";
import { Button, Table, Dropdown } from "../components/ui";
import {
  AddUserModal,
  EditUserModal,
  DeleteUserModal,
  ResetPasswordModal,
} from "../components/modals/users";
import {
  fetchUsers,
  fetchUserById,
  removeUser,
  changePassword,
} from "../features/user/userSlice";

// -----------------------------
// Constants
// -----------------------------
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

// -----------------------------
// Component
// -----------------------------
const Users = () => {
  const dispatch = useDispatch();
  const { list: usersData = [], loading } = useSelector((state) => state.users);

  // UI States
  const [filters, setFilters] = useState({
    search: "",
    role: "",
    status: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalState, setModalState] = useState({
    add: false,
    edit: false,
    delete: false,
    resetPassword: false,
  });
  const [loadingUserData, setLoadingUserData] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // -----------------------------
  // Helpers
  // -----------------------------
  const getRoleLabel = (value) =>
    roleOptions.find((r) => r.value === value)?.label || value;

  const closeAllModals = () => {
    setModalState({
      add: false,
      edit: false,
      delete: false,
      resetPassword: false,
    });
    setSelectedUser(null);
  };

  const refreshUsers = useCallback(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // -----------------------------
  // Handlers
  // -----------------------------
  const handleEdit = async (user) => {
    setLoadingUserData(true);
    try {
      const userData = await dispatch(fetchUserById(user.id)).unwrap();
      setSelectedUser(userData);
      setModalState((p) => ({ ...p, edit: true }));
    } finally {
      setLoadingUserData(false);
    }
  };

  const handleSaveEdit = async () => {
    await refreshUsers();
    closeAllModals();
  };

  const handleDelete = (user) => {
    setSelectedUser(user);
    setModalState((p) => ({ ...p, delete: true }));
  };

  const handleConfirmDelete = async (user) => {
    setIsDeletingUser(true);
    try {
      await dispatch(removeUser(user.id)).unwrap();
      await refreshUsers();
    } finally {
      setIsDeletingUser(false);
      closeAllModals();
    }
  };

  const handleAddUser = async () => {
    await refreshUsers();
    closeAllModals();
  };

  const handleResetPassword = (user) => {
    setSelectedUser(user);
    setModalState((p) => ({ ...p, resetPassword: true }));
  };

  const handleConfirmResetPassword = async (passwordData) => {
    await dispatch(changePassword(passwordData)).unwrap();
    closeAllModals();
  };

  // -----------------------------
  // Data
  // -----------------------------
  const filteredUsers = usersData
    .filter((user) => {
      const s = filters.search.toLowerCase();
      const matchesSearch =
        !s ||
        user.name?.toLowerCase().includes(s) ||
        user.employeeId?.toLowerCase().includes(s) ||
        user.userName?.toLowerCase().includes(s);
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesStatus =
        !filters.status ||
        (filters.status === "Active" && user.status) ||
        (filters.status === "Inactive" && !user.status);

      return matchesSearch && matchesRole && matchesStatus;
    })
    .map((u, i) => ({
      ...u,
      sno: (i + 1).toString().padStart(2, "0"),
      employeeName: u.name,
      username: u.userName,
      password: "••••••••",
      role: getRoleLabel(u.role),
      status: u.status ? "Active" : "Inactive",
    }));

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

  // -----------------------------
  // Effects
  // -----------------------------
  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div className="p-4 md:p-6 w-full">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-text-primary">Users</h1>
        <p className="text-text-secondary">View and manage user details</p>
      </header>

      {/* Filters */}
      <section className="mb-6 bg-white py-4 rounded-lg">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
                value={filters.search}
                onChange={(e) =>
                  setFilters((p) => ({ ...p, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Dropdown
              options={roleOptions}
              value={filters.role}
              onChange={(v) => setFilters((p) => ({ ...p, role: v }))}
              placeholder="Role"
              width="200px"
              height="50px"
            />
            <Dropdown
              options={statusOptions}
              value={filters.status}
              onChange={(v) => setFilters((p) => ({ ...p, status: v }))}
              placeholder="Status"
              width="150px"
              height="50px"
            />
          </div>

          <Button
            onClick={() => setModalState((p) => ({ ...p, add: true }))}
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

