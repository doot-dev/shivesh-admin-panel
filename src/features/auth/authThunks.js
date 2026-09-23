import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser, fetchMe } from "../../services/authService";
import { localStorageKeys } from "../../constant/constant";
import { encrypt } from "../../utils/security";

export const login = createAsyncThunk("auth/login", async (credentials) => {
  const response = await loginUser(credentials);
  const userData = response.data;
  const data = {
    name: userData.name,
    userName: userData.userName,
    employeeId: userData.employeeId,
    role: userData.role,
    id: userData.id,
    // Access is persisted alongside identity so the sidebar can paint correctly
    // on the very first frame after a refresh, before /me has come back.
    isSuperAdmin: userData.isSuperAdmin ?? false,
    roleId: userData.roleId ?? null,
    roleName: userData.roleName ?? null,
    permissions: userData.permissions ?? [],
    modules: userData.modules ?? [],
  };
  localStorage.setItem(
    localStorageKeys.userData,
    encrypt(JSON.stringify(data))
  );

  return response;
});

/**
 * Re-checks the session and pulls CURRENT permissions from the server.
 *
 * Runs once on every panel boot. The persisted copy in localStorage is only a
 * first-paint optimisation — this is what makes a role change take effect on
 * the next page load instead of whenever the 30-day token happens to expire.
 *
 * A rejection here means the session is genuinely dead (401 from /me), which
 * the slice treats as a logout rather than as "no permissions".
 */
export const refreshSession = createAsyncThunk(
  "auth/refreshSession",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchMe();
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.status ?? 0);
    }
  }
);
