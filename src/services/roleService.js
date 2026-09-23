import api from "./api";

/**
 * Roles, the permission catalog, and per-user permission overrides.
 *
 * Every call here is gated server-side by `roles.*` (or `users.*` for the
 * override endpoints), so a user without those permissions gets a 403 even if
 * they reach the screen some other way.
 */

/** Every module and action the panel can secure — drives the permission matrix. */
export const getPermissionCatalog = async () => {
  const response = await api.get("/api/v1/admin/roles/catalog");
  return response.data;
};

export const getRoles = async () => {
  const response = await api.get("/api/v1/admin/roles/all");
  return response.data;
};

export const getRoleById = async (roleId) => {
  const response = await api.get(`/api/v1/admin/roles/?id=${roleId}`);
  return response.data;
};

export const createRole = async (roleData) => {
  const response = await api.post("/api/v1/admin/roles", roleData);
  return response.data;
};

export const updateRole = async (roleData) => {
  const response = await api.put("/api/v1/admin/roles", roleData);
  return response.data;
};

export const deleteRole = async (roleId) => {
  const response = await api.delete(`/api/v1/admin/roles/?id=${roleId}`);
  return response.data;
};

/** A user's role, their ALLOW/DENY exceptions, and the effective result. */
export const getUserPermissions = async (userId) => {
  const response = await api.get(
    `/api/v1/admin/roles/user-permissions?userId=${userId}`
  );
  return response.data;
};

/**
 * Replace a user's overrides wholesale.
 * `overrides` is [{ permission, effect: 'ALLOW' | 'DENY' }]; sending an empty
 * array clears every exception and drops the user back to plain role access.
 */
export const setUserPermissions = async (userId, overrides) => {
  const response = await api.put("/api/v1/admin/roles/user-permissions", {
    userId,
    overrides,
  });
  return response.data;
};
