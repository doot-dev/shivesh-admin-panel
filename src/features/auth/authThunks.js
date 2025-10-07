import { createAsyncThunk } from "@reduxjs/toolkit";
import { loginUser } from "../../services/authService";
import { localStorageKeys } from "../../constant/constant";
import { encrypt } from "../../utils/security";

export const login = createAsyncThunk("auth/login", async (credentials) => {
  const response = await loginUser(credentials);
  const data = {
    name: response.name,
    userName: response.userName,
    employeeId: response.employeeId,
    role: response.role,
    id: response.id,
  };

  localStorage.setItem(
    localStorageKeys.userData,
    encrypt(JSON.stringify(data))
  );

  console.log("Login response:", response);
  return response;
});
